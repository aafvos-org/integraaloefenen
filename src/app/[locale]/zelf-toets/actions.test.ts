import { beforeEach, describe, expect, it, vi } from 'vitest'

// =====================================================================
// Een antwoord in een zelf-toets: komt de tijd die de leerling erover deed
// mee in de rij die wordt opgeslagen?
//
// Alleen de boekhouding wordt getest: een nepdatabase in het geheugen en
// een nep-AI. Geen Supabase, geen Gemini.
// =====================================================================

type AnswerRow = {
  id: string
  user_answer: string
  is_correct: boolean
  time_spent_sec: number | null
}

type DbFout = { code: string; message: string }

type QueryResult = { data: unknown; error: DbFout | null; count?: number }

/** De opgave in de nepdatabase: f(x) = x^2, dus F(x) = 1/3x^3 + c. */
const QUESTION = {
  id: 'q1',
  answer: '1/3x^3 + c',
  latex_answer: '\\tfrac{1}{3}x^{3} + c',
  answer_alternatives: [] as string[],
}

const SESSION = {
  id: 's1',
  user_id: 'u1',
  session_type: 'custom_test',
  ended_at: null,
}

let answers: AnswerRow[]
/** Nep-databasefout bij het wegschrijven van een antwoord. */
let antwoordOpslaanFout: DbFout | null

/** Minimale nabootsing van de query-builder van Supabase. */
function from(table: string) {
  let op: 'select' | 'insert' | 'update' = 'select'
  let values: Record<string, unknown> = {}

  /** Eén rij ophalen: `.single()` of `.maybeSingle()`. */
  function runOne(): QueryResult {
    if (table === 'user_sessions_new') return { data: SESSION, error: null }
    if (table === 'custom_test_questions') return { data: { question_id: QUESTION.id }, error: null }
    if (table === 'questions_new') return { data: QUESTION, error: null }

    if (table === 'session_answers_new') {
      if (op === 'insert') {
        if (antwoordOpslaanFout) return { data: null, error: antwoordOpslaanFout }
        const row: AnswerRow = {
          id: `a${answers.length + 1}`,
          user_answer: String(values.user_answer),
          is_correct: values.is_correct === true,
          time_spent_sec:
            typeof values.time_spent_sec === 'number' ? values.time_spent_sec : null,
        }
        answers.push(row)
        return { data: { id: row.id }, error: null }
      }
      // De controle op dubbel beantwoorden: nog niets opgeslagen.
      return { data: null, error: null }
    }

    return { data: null, error: null }
  }

  /** Een query zonder `.single()`: tellen, of een update wegschrijven. */
  function runMany(): QueryResult {
    if (table === 'custom_test_questions') return { data: null, error: null, count: 2 }
    if (table === 'session_answers_new') {
      if (op === 'update') {
        Object.assign(answers[answers.length - 1], values)
        return { data: null, error: null }
      }
      return { data: null, error: null, count: answers.length }
    }
    return { data: null, error: null }
  }

  const builder = {
    select: () => builder,
    eq: () => builder,
    insert: (v: Record<string, unknown>) => {
      op = 'insert'
      values = v
      return builder
    },
    update: (v: Record<string, unknown>) => {
      op = 'update'
      values = v
      return builder
    },
    single: async () => runOne(),
    maybeSingle: async () => runOne(),
    then: (resolve: (value: QueryResult) => unknown) => Promise.resolve(runMany()).then(resolve),
  }

  return builder
}

const fakeClient = {
  auth: { getUser: async () => ({ data: { user: { id: 'u1' } } }) },
  from,
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => fakeClient,
  createServiceRoleClient: () => fakeClient,
}))

vi.mock('@/lib/ai/check-answer-new', () => ({
  checkWrongAnswerNew: async () => ({
    errorExplanation: 'Je bent de integratieconstante vergeten.',
    category: null,
    fromCache: false,
    isMathematicallyCorrect: false,
    generatedSteps: [],
  }),
}))

const { submitCustomTestAnswerAction } = await import('./actions')

const RAUWE_DATABASEFOUT =
  'new row violates row-level security policy for table "session_answers_new"'

describe('submitCustomTestAnswerAction', () => {
  beforeEach(() => {
    answers = []
    antwoordOpslaanFout = null
  })

  it('slaat de meegegeven seconden op bij het antwoord', async () => {
    const result = await submitCustomTestAnswerAction('s1', 'q1', '1/3x^3 + c', 9)

    expect(result).toMatchObject({ kind: 'correct' })
    expect(answers[0].time_spent_sec).toBe(9)
  })

  it('laat de tijd leeg als de kaart geen seconden meegeeft', async () => {
    await submitCustomTestAnswerAction('s1', 'q1', '1/3x^3 + c')

    expect(answers[0].time_spent_sec).toBeNull()
  })

  it('weigert een onmogelijke tijd', async () => {
    await submitCustomTestAnswerAction('s1', 'q1', '1/3x^3 + c', -30)

    expect(answers[0].time_spent_sec).toBeNull()
  })

  it('stuurt een databasefout niet mee naar de browser', async () => {
    antwoordOpslaanFout = { code: '42501', message: RAUWE_DATABASEFOUT }
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await submitCustomTestAnswerAction('s1', 'q1', '1/3x^3 + c', 9)

    expect(result).toEqual({
      kind: 'error',
      message: 'Opslaan lukte niet. Probeer het nog een keer.',
    })
    expect(JSON.stringify(result)).not.toContain(RAUWE_DATABASEFOUT)
    expect(answers).toHaveLength(0)
    expect(log.mock.calls.flat().join(' ')).toContain(RAUWE_DATABASEFOUT)
    log.mockRestore()
  })
})
