'use server'

import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'

import { checkWrongAnswerNew } from '@/lib/ai/check-answer-new'
import { beoordeelAntwoord } from '@/lib/practice/nakijken'
import {
  createCustomTest,
  pickQuestionsForTest,
  removeEmptyCustomTests,
  type QuestionSource,
} from '@/lib/practice/custom-test'
import { timeSpentSecVoorOpslag } from '@/lib/practice/time-spent'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

const MAX_QUESTIONS = 50
const VALID_SOURCES: QuestionSource[] = ['new', 'all', 'wrong']

/** Wat de leerling ziet als het antwoord niet op de database uitkomt. */
const OPSLAAN_MISLUKT = 'Opslaan lukte niet. Probeer het nog een keer.'

export type CreateTestPayload = {
  clusterIds: string[]
  count: number
  source: QuestionSource
  name: string
  showAnswers: 'immediate' | 'end'
}

export async function createCustomTestAction(
  payload: CreateTestPayload,
): Promise<{ error: string } | { sessionId: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const locale = await getLocale()
  if (!user) redirect(`/${locale}/inloggen`)

  if (!Array.isArray(payload.clusterIds) || payload.clusterIds.length === 0) {
    return { error: 'Kies minstens één theorieblok.' }
  }

  if (!VALID_SOURCES.includes(payload.source)) {
    return { error: 'Ongeldige bron.' }
  }

  const count = Math.min(MAX_QUESTIONS, Math.max(1, Math.floor(payload.count)))

  const questionIds = await pickQuestionsForTest(
    supabase,
    user.id,
    payload.clusterIds,
    payload.source,
    count,
  )

  if (questionIds.length === 0) {
    return { error: 'Geen vragen beschikbaar voor deze selectie.' }
  }

  // Eerdere mislukte pogingen van deze leerling horen hier niet meer te
  // staan; ze drijven anders de naam van de nieuwe toets op.
  await removeEmptyCustomTests(supabase, user.id)

  const result = await createCustomTest(supabase, user.id, {
    questionIds,
    name: payload.name?.trim() || 'Zelf-toets',
    showAnswers: payload.showAnswers === 'end' ? 'end' : 'immediate',
  })

  if (!result.ok) return { error: result.error }
  return { sessionId: result.sessionId }
}

export type CustomTestAnswerResult =
  | {
      kind: 'correct'
      done: boolean
    }
  | {
      kind: 'incorrect'
      done: boolean
      correctAnswer: string
      latexCorrectAnswer: string | null
    }
  | { kind: 'error'; message: string }

export async function submitCustomTestAnswerAction(
  sessionId: string,
  questionId: string,
  userAnswer: string,
  timeSpentSec?: number,
): Promise<CustomTestAnswerResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { kind: 'error', message: 'Niet ingelogd.' }

  // Verify the session belongs to the user and is a custom test
  const { data: session } = await supabase
    .from('user_sessions_new')
    .select('id, user_id, session_type, ended_at')
    .eq('id', sessionId)
    .maybeSingle()
  if (!session || session.user_id !== user.id || session.session_type !== 'custom_test') {
    return { kind: 'error', message: 'Sessie niet gevonden.' }
  }
  if (session.ended_at) {
    return { kind: 'error', message: 'Toets is al afgerond.' }
  }

  // Verify the question is part of this test
  const { data: testRow } = await supabase
    .from('custom_test_questions')
    .select('question_id')
    .eq('session_id', sessionId)
    .eq('question_id', questionId)
    .maybeSingle()
  if (!testRow) {
    return { kind: 'error', message: 'Vraag hoort niet bij deze toets.' }
  }

  // Prevent double-answering
  const { data: existing } = await supabase
    .from('session_answers_new')
    .select('id')
    .eq('session_id', sessionId)
    .eq('question_id', questionId)
    .maybeSingle()
  if (existing) {
    return { kind: 'error', message: 'Deze vraag is al beantwoord.' }
  }

  const { data: question } = await supabase
    .from('questions_new')
    .select('id, answer, latex_answer, answer_alternatives')
    .eq('id', questionId)
    .maybeSingle()
  if (!question) return { kind: 'error', message: 'Vraag niet gevonden.' }

  const alts: string[] = question.answer_alternatives ?? []
  // Eerst de rekenregel, dan de AI, en pas daarna één rij. Niet eerst fout
  // opslaan en daarna bijwerken: dan telt een andere notatie twee keer, en
  // een mislukte AI-aanroep laat een goed antwoord fout staan.
  const beoordeling = await beoordeelAntwoord({
    leerling: userAnswer,
    goedAntwoord: question.answer,
    alternatieven: alts,
    vraagAi: () => checkWrongAnswerNew(createServiceRoleClient(), question.id, userAnswer),
  })
  const isCorrect = beoordeling.goed

  const { data: answerRow, error: answerErr } = await supabase
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
  if (answerErr || !answerRow) {
    // De leerling ziet een vaste zin. De technische tekst blijft in het serverlog.
    console.error(
      '[zelf-toets] antwoord opslaan mislukt',
      answerErr?.code ?? 'geen code',
      answerErr?.message ?? 'geen rij terug',
    )
    return { kind: 'error', message: OPSLAAN_MISLUKT }
  }

  // Determine if this was the last question
  const [{ count: totalCount }, { count: answeredCount }] = await Promise.all([
    supabase
      .from('custom_test_questions')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId),
    supabase
      .from('session_answers_new')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId),
  ])

  const done = (totalCount ?? 0) > 0 && (answeredCount ?? 0) >= (totalCount ?? 0)
  if (done) {
    await supabase
      .from('user_sessions_new')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', sessionId)
  }

  if (isCorrect) {
    return { kind: 'correct', done }
  }
  return {
    kind: 'incorrect',
    done,
    correctAnswer: question.answer,
    latexCorrectAnswer: question.latex_answer ?? null,
  }
}
