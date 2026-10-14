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
/** Hoe vaak een rij na het invoegen nog wordt bijgewerkt. */
let wijzigingen: number
/** Nep-databasefout bij het wegschrijven van een antwoord. */
let antwoordOpslaanFout: DbFout | null
let aiSaysCorrect: boolean
let aiGooit: boolean
let aiAanroepen: number

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
        wijzigingen += 1
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
  checkWrongAnswerNew: async () => {
    aiAanroepen += 1
    if (aiGooit) throw new Error('AI niet bereikbaar')
    return {
      errorExplanation: aiSaysCorrect ? '' : 'Je bent de integratieconstante vergeten.',
      category: null,
      fromCache: false,
      isMathematicallyCorrect: aiSaysCorrect,
      generatedSteps: [],
    }
  },
}))

const { submitCustomTestAnswerAction } = await import('./actions')

const RAUWE_DATABASEFOUT =
  'new row violates row-level security policy for table "session_answers_new"'

describe('submitCustomTestAnswerAction', () => {
  beforeEach(() => {
    answers = []
    wijzigingen = 0
    antwoordOpslaanFout = null
    aiSaysCorrect = false
    aiGooit = false
    aiAanroepen = 0
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

  it('telt een andere notatie één keer als goed, ook als de AI mislukt', async () => {
    // x^3/3 is dezelfde primitieve. De AI gooit; het antwoord gaat in één
    // rij als goed, zonder eerst fout op te slaan en daarna bij te werken.
    aiGooit = true
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})

    const goed = await submitCustomTestAnswerAction('s1', 'q1', 'x^3/3 + c')

    expect(goed).toMatchObject({ kind: 'correct' })
    expect(answers).toHaveLength(1)
    expect(answers[0].is_correct).toBe(true)
    expect(wijzigingen).toBe(0)
    expect(aiAanroepen).toBe(0)

    // De rekenregel zegt fout en de AI gooit. Het antwoord blijft staan.
    const fout = await submitCustomTestAnswerAction('s1', 'q1', 'x^2')

    expect(fout).toMatchObject({ kind: 'incorrect' })
    expect(answers).toHaveLength(2)
    expect(answers[1].user_answer).toBe('x^2')
    expect(answers[1].is_correct).toBe(false)
    expect(aiAanroepen).toBe(1)
    log.mockRestore()
  })

  it('keurt een notatie die alleen de AI herkent in één rij goed', async () => {
    // `log` kent de rekenregel niet. De AI zegt dat het klopt; dan hoort
    // de rij meteen goed te zijn, niet eerst fout en daarna bijgewerkt.
    aiSaysCorrect = true

    const result = await submitCustomTestAnswerAction('s1', 'q1', 'log(x) + c')

    expect(result).toMatchObject({ kind: 'correct' })
    expect(answers).toHaveLength(1)
    expect(answers[0].is_correct).toBe(true)
    expect(answers[0].user_answer).toBe('log(x) + c')
    expect(wijzigingen).toBe(0)
    expect(aiAanroepen).toBe(1)
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
