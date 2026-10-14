'use server'

import { checkWrongAnswerNew } from '@/lib/ai/check-answer-new'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

import { beoordeelAntwoord } from './nakijken'
import { progressAfterCorrect, progressAfterIncorrect } from './progress'
import { timeSpentSecVoorOpslag } from './time-spent'

/** Vaste categorie bij een mislukt antwoord. Geen vrije fouttekst: die kan een antwoord of e-mailadres bevatten. */
export type OefenFoutSoort =
  | 'niet_ingelogd'
  | 'vraag_niet_gevonden'
  | 'opslaan_mislukt'
  | 'serveractie_mislukt'

/** Wat de leerling ziet als het antwoord niet op de database uitkomt. */
const OPSLAAN_MISLUKT = 'Opslaan lukte niet. Probeer het nog een keer.'

/** Wat de leerling ziet als het melden van een vraag niet lukt. */
const MELDEN_MISLUKT = 'Melden lukte niet. Probeer het nog een keer.'

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

  // Eerst de rekenregel, dan de AI. Pas als die uitslag vaststaat, gaat er
  // één rij in en gaat de voortgang één keer omhoog. Een mislukte
  // AI-aanroep laat de rekenregel staan; het antwoord wordt toch bewaard.
  const beoordeling = await beoordeelAntwoord({
    leerling: userAnswer,
    goedAntwoord: question.answer,
    alternatieven: alts,
    vraagAi: () => checkWrongAnswerNew(createServiceRoleClient(), question.id, userAnswer),
  })
  const isCorrect = beoordeling.goed
  const errorExplanation = beoordeling.uitleg

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
      time_spent_sec: timeSpentSecVoorOpslag(timeSpentSec),
    })
    .select('id')
    .single()

  if (answerError || !answerRow) {
    // De leerling ziet een vaste zin. De technische tekst blijft in het serverlog.
    console.error(
      '[oefenen] antwoord opslaan mislukt',
      answerError?.code ?? 'geen code',
      answerError?.message ?? 'geen rij terug',
    )
    return {
      kind: 'error',
      soort: 'opslaan_mislukt',
      message: OPSLAAN_MISLUKT,
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
    console.error('[oefenen] vraag melden mislukt', error.code, error.message)
    return { ok: false, error: MELDEN_MISLUKT }
  }

  return { ok: true }
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
