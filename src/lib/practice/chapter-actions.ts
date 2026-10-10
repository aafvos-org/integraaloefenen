'use server'

import type { OefenFoutSoort } from '@/lib/analytics/oefenen'
import { checkWrongAnswerNew } from '@/lib/ai/check-answer-new'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

import { answersMatch } from './engine'
import { progressAfterCorrect, progressAfterIncorrect } from './progress'

type DB = Awaited<ReturnType<typeof createClient>>

export type StudyResult =
  | { kind: 'correct'; sessionId: string; streak: number; mastered: boolean }
  | {
      kind: 'incorrect'
      sessionId: string
      answerId: string
      correctAnswer: string
      latexCorrectAnswer: string | null
      errorExplanation: string | null
    }
  | { kind: 'error'; soort: OefenFoutSoort; message: string }

export async function submitStudyAnswerAction(
  questionId: string,
  userAnswer: string,
  timeSpentSec?: number,
): Promise<StudyResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { kind: 'error', soort: 'niet_ingelogd', message: 'Niet ingelogd.' }

  const { data: question } = await supabase
    .from('questions_new')
    .select('id, topic_id, cluster_id, answer, latex_answer, answer_alternatives')
    .eq('id', questionId)
    .maybeSingle()
  if (!question) {
    return { kind: 'error', soort: 'vraag_niet_gevonden', message: 'Vraag niet gevonden.' }
  }

  const alts: string[] = question.answer_alternatives ?? []

  // Eerst helemaal nakijken, dan pas opslaan. Komt het antwoord niet op de
  // database uit, dan beslist de AI-controle: die rekent een andere notatie
  // (bijvoorbeeld x^3/3 in plaats van 1/3x^3) alsnog goed. Pas als de
  // uitslag vaststaat, gaat er één rij in en gaat de voortgang één keer
  // omhoog.
  let isCorrect = answersMatch(userAnswer, question.answer, alts)
  let errorExplanation: string | null = null

  if (!isCorrect) {
    // AI-uitleg ophalen (cache-first; schrijfacties gaan via service role)
    try {
      const service = createServiceRoleClient()
      const aiResult = await checkWrongAnswerNew(service, question.id, userAnswer)
      if ('error' in aiResult) {
        console.error('[check-answer-new]', aiResult.error)
      } else {
        errorExplanation = aiResult.errorExplanation || null
        isCorrect = aiResult.isMathematicallyCorrect
      }
    } catch (e) {
      console.error('[check-answer-new] unexpected', e)
    }
  }

  const sessionId = await getOrCreateSession(
    supabase,
    user.id,
    question.topic_id,
    question.cluster_id,
  )

  const { data: answerRow, error: answerError } = await supabase
    .from('session_answers_new')
    .insert({
      session_id: sessionId,
      question_id: question.id,
      user_answer: userAnswer,
      is_correct: isCorrect,
      time_spent_sec: timeSpentSec ?? null,
    })
    .select('id')
    .single()

  if (answerError || !answerRow) {
    return {
      kind: 'error',
      soort: 'opslaan_mislukt',
      message: answerError?.message ?? 'Kon antwoord niet opslaan.',
    }
  }

  const progress = await applyProgress(
    supabase,
    user.id,
    question.topic_id,
    question.cluster_id,
    isCorrect,
  )

  if (isCorrect) {
    return {
      kind: 'correct',
      sessionId,
      streak: progress.correct_streak,
      mastered: progress.status === 'mastered',
    }
  }

  return {
    kind: 'incorrect',
    sessionId,
    answerId: answerRow.id,
    correctAnswer: question.answer,
    latexCorrectAnswer: question.latex_answer ?? null,
    errorExplanation,
  }
}

// =====================================================================
// Markeer welke stappen fout gingen
// =====================================================================
export async function resolveWithStepsNewAction(
  answerId: string,
  wrongStepIds: string[],
): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Niet ingelogd.')

  if (wrongStepIds.length > 0) {
    const rows = wrongStepIds.map((stepId) => ({
      answer_id: answerId,
      step_id: stepId,
    }))
    const { error } = await supabase.from('step_mistakes_new').insert(rows)
    if (error) throw new Error(error.message)
  }
}

// =====================================================================
// Markeer fout als slordigheidsfoutje
// =====================================================================
export async function markCarelessNewAction(answerId: string): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Niet ingelogd.')

  const { error } = await supabase
    .from('session_answers_new')
    .update({ is_careless: true })
    .eq('id', answerId)
  if (error) throw new Error(error.message)
}

// =====================================================================
// Vraag flaggen
// =====================================================================
export async function flagQuestionNewAction(
  questionId: string,
  reason: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Je bent niet ingelogd.' }

  const trimmed = reason.trim().slice(0, 500)
  const { error } = await supabase.from('question_flags_new').insert({
    question_id: questionId,
    user_id: user.id,
    reason: trimmed || null,
  })

  if (error) {
    if (error.code === '23505' || error.message.toLowerCase().includes('unique')) {
      return { ok: true }
    }
    return { ok: false, error: error.message }
  }

  return { ok: true }
}

/**
 * Id van de lopende oefensessie voor dit cluster, of null als er nog geen is.
 * Leest alleen: een sessie ontstaat pas bij het eerste antwoord.
 */
export async function huidigeSessieIdAction(clusterId: string): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('user_sessions_new')
    .select('id')
    .eq('user_id', user.id)
    .eq('cluster_id', clusterId)
    .is('ended_at', null)
    .gte('started_at', sessionWindowStart())
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data?.id ?? null
}

function sessionWindowStart(): string {
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
}

async function getOrCreateSession(
  db: DB,
  userId: string,
  topicId: string,
  clusterId: string,
): Promise<string> {
  const { data: existing } = await db
    .from('user_sessions_new')
    .select('id')
    .eq('user_id', userId)
    .eq('cluster_id', clusterId)
    .is('ended_at', null)
    .gte('started_at', sessionWindowStart())
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing) return existing.id

  const { data: created, error } = await db
    .from('user_sessions_new')
    .insert({ user_id: userId, topic_id: topicId, cluster_id: clusterId })
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  return created.id
}

async function getOrCreateProgress(
  db: DB,
  userId: string,
  topicId: string,
  clusterId: string,
) {
  const { data } = await db
    .from('user_progress_new')
    .select('*')
    .eq('user_id', userId)
    .eq('cluster_id', clusterId)
    .maybeSingle()

  if (data) return data

  const { data: created, error } = await db
    .from('user_progress_new')
    .insert({ user_id: userId, topic_id: topicId, cluster_id: clusterId, status: 'in_progress' })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return created
}

/** Werk de voortgang bij voor één nagekeken antwoord. */
async function applyProgress(
  db: DB,
  userId: string,
  topicId: string,
  clusterId: string,
  isCorrect: boolean,
) {
  const p = await getOrCreateProgress(db, userId, topicId, clusterId)
  const next = isCorrect ? progressAfterCorrect(p) : progressAfterIncorrect(p)

  const { data, error } = await db
    .from('user_progress_new')
    .update(next)
    .eq('id', p.id)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data
}
