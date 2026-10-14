import { beforeEach, describe, expect, it, vi } from 'vitest'

// =====================================================================
// Nakijken van een antwoord: wat doet dat met de voortgang?
//
// Alleen de boekhouding wordt getest: een nepdatabase in het geheugen en
// een nep-AI. Geen Supabase, geen Gemini.
// =====================================================================

type ProgressRow = {
  id: string
  status: string
  correct_streak: number
  total_answered: number
  total_correct: number
  mastered_at: string | null
}

type AnswerRow = {
  id: string
  user_answer: string
  is_correct: boolean
  time_spent_sec: number | null
}

type DbFout = { code: string; message: string }

type QueryResult = { data: unknown; error: DbFout | null }

/** De opgave in de nepdatabase: f(x) = x^2, dus F(x) = 1/3x^3 + c. */
const QUESTION = {
  id: 'q1',
  topic_id: 't1',
  cluster_id: 'c1',
  answer: '1/3x^3 + c',
  latex_answer: '\\tfrac{1}{3}x^{3} + c',
  answer_alternatives: [] as string[],
}

let progress: ProgressRow
let answers: AnswerRow[]
let aiSaysCorrect: boolean
let aiGooit: boolean
let aiAanroepen: number
/** Nep-databasefout bij het wegschrijven van een antwoord. */
let antwoordOpslaanFout: DbFout | null
/** Nep-databasefout bij het aanmaken van een sessie. */
let sessieAanmakenFout: DbFout | null
/** Geen voortgangsrij: de actie probeert er een aan te maken. */
let geenVoortgang: boolean
/** Nep-databasefout bij het aanmaken van de voortgang. */
let voortgangAanmakenFout: DbFout | null
/** Nep-databasefout bij het bijwerken van de voortgang. */
let voortgangBijwerkenFout: DbFout | null
/** Nep-databasefout bij het melden van een vraag. */
let vraagMeldenFout: DbFout | null

function freshProgress(correctStreak: number, totalAnswered: number): ProgressRow {
  return {
    id: 'p1',
    status: 'in_progress',
    correct_streak: correctStreak,
    total_answered: totalAnswered,
    total_correct: totalAnswered,
    mastered_at: null,
  }
}

/** Minimale nabootsing van de query-builder van Supabase. */
function from(table: string) {
  let op: 'select' | 'insert' | 'update' = 'select'
  let values: Record<string, unknown> = {}

  function run(): QueryResult {
    if (table === 'questions_new') return { data: QUESTION, error: null }

    if (table === 'user_sessions_new') {
      if (op === 'insert' && sessieAanmakenFout) {
        return { data: null, error: sessieAanmakenFout }
      }
      // Geen open sessie: de actie maakt er een aan.
      return { data: op === 'insert' ? { id: 's1' } : null, error: null }
    }

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
      if (op === 'update') Object.assign(answers[answers.length - 1], values)
      return { data: null, error: null }
    }

    if (table === 'user_progress_new') {
      if (op === 'select' && geenVoortgang) return { data: null, error: null }
      if (op === 'insert' && voortgangAanmakenFout) {
        return { data: null, error: voortgangAanmakenFout }
      }
      if (op === 'update') {
        if (voortgangBijwerkenFout) return { data: null, error: voortgangBijwerkenFout }
        Object.assign(progress, values)
      }
      return { data: { ...progress }, error: null }
    }

    if (table === 'question_flags_new' && op === 'insert' && vraagMeldenFout) {
      return { data: null, error: vraagMeldenFout }
    }

    return { data: null, error: null }
  }

  const builder = {
    select: () => builder,
    eq: () => builder,
    is: () => builder,
    gte: () => builder,
    order: () => builder,
    limit: () => builder,
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
    single: async () => run(),
    maybeSingle: async () => run(),
    then: (resolve: (value: QueryResult) => unknown) =>
      Promise.resolve(run()).then(resolve),
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

const { flagQuestionNewAction, submitStudyAnswerAction } = await import('./chapter-actions')

const RAUWE_DATABASEFOUT =
  'new row violates row-level security policy for table "session_answers_new"'

describe('submitStudyAnswerAction', () => {
  beforeEach(() => {
    progress = freshProgress(2, 2)
    answers = []
    aiSaysCorrect = false
    aiGooit = false
    aiAanroepen = 0
    antwoordOpslaanFout = null
    sessieAanmakenFout = null
    geenVoortgang = false
    voortgangAanmakenFout = null
    voortgangBijwerkenFout = null
    vraagMeldenFout = null
  })

  it('zet de reeks één omhoog bij een goed antwoord', async () => {
    progress = freshProgress(0, 0)

    const result = await submitStudyAnswerAction('q1', '1/3x^3 + c')

    expect(result).toMatchObject({ kind: 'correct', streak: 1, mastered: false })
    expect(progress.total_answered).toBe(1)
    expect(progress.total_correct).toBe(1)
    expect(progress.status).toBe('in_progress')
  })

  it('zet het onderdeel op beheerst bij drie goed op rij', async () => {
    const result = await submitStudyAnswerAction('q1', '1/3x^3 + c')

    expect(result).toMatchObject({ kind: 'correct', streak: 3, mastered: true })
    expect(progress.status).toBe('mastered')
    expect(progress.mastered_at).not.toBeNull()
    expect(progress.total_answered).toBe(3)
    expect(progress.total_correct).toBe(3)
    expect(answers).toHaveLength(1)
    expect(answers[0].is_correct).toBe(true)
  })

  it('zet de reeks terug op 0 bij een fout antwoord', async () => {
    const result = await submitStudyAnswerAction('q1', 'x^2')

    expect(result).toMatchObject({
      kind: 'incorrect',
      correctAnswer: '1/3x^3 + c',
      errorExplanation: 'Je bent de integratieconstante vergeten.',
    })
    expect(progress.correct_streak).toBe(0)
    expect(progress.status).toBe('in_progress')
    expect(progress.total_answered).toBe(3)
    expect(progress.total_correct).toBe(2)
    expect(answers).toHaveLength(1)
    expect(answers[0].is_correct).toBe(false)
  })

  it('telt een antwoord dat de AI alsnog goedkeurt als goed', async () => {
    // De database kent alleen "1/3x^3 + c"; de leerling schrijft "x^3/3 + c".
    // De AI-controle zegt dat dat hetzelfde is, dus telt het als goed — ook
    // in de rij met opgeslagen antwoorden.
    aiSaysCorrect = true

    const result = await submitStudyAnswerAction('q1', 'x^3/3 + c')

    expect(result).toMatchObject({ kind: 'correct' })
    expect(answers).toHaveLength(1)
    expect(answers[0].is_correct).toBe(true)
    expect(progress.total_correct).toBeGreaterThan(2)
  })

  it('telt een antwoord in een andere notatie één keer mee en breekt de reeks niet', async () => {
    // Reeks staat op 2. Een goed antwoord in een andere notatie hoort de
    // reeks op 3 te zetten en één keer bij de totalen te tellen — niet eerst
    // fout gerekend te worden.
    aiSaysCorrect = true

    const result = await submitStudyAnswerAction('q1', 'x^3/3 + c')

    expect(result).toMatchObject({ kind: 'correct', streak: 3, mastered: true })
    expect(progress.correct_streak).toBe(3)
    expect(progress.total_answered).toBe(3)
    expect(progress.total_correct).toBe(3)
    expect(progress.status).toBe('mastered')
  })

  it('slaat de meegegeven seconden op bij het antwoord', async () => {
    await submitStudyAnswerAction('q1', '1/3x^3 + c', 12)

    expect(answers[0].time_spent_sec).toBe(12)
  })

  it('laat de tijd leeg als de kaart geen seconden meegeeft', async () => {
    await submitStudyAnswerAction('q1', '1/3x^3 + c')

    expect(answers[0].time_spent_sec).toBeNull()
  })

  it('pakt beheerst niet af bij een misser tijdens het herhalen', async () => {
    progress = { ...freshProgress(5, 5), status: 'mastered', mastered_at: '2026-09-01T10:00:00.000Z' }

    const fout = await submitStudyAnswerAction('q1', 'x^2')

    expect(fout).toMatchObject({ kind: 'incorrect' })
    expect(progress.correct_streak).toBe(0)
    expect(progress.status).toBe('mastered')
    expect(progress.mastered_at).toBe('2026-09-01T10:00:00.000Z')

    // En het goede antwoord daarna zet beheerst niet terug naar bezig.
    const goed = await submitStudyAnswerAction('q1', '1/3x^3 + c')

    expect(goed).toMatchObject({ kind: 'correct', streak: 1, mastered: true })
    expect(progress.status).toBe('mastered')
  })

  it('telt een andere notatie één keer en laat een mislukte AI het antwoord niet verdwijnen', async () => {
    // x^3/3 is dezelfde primitieve als 1/3x^3. De AI is stuk; dat mag de
    // rekenregel niet overschrijven en het antwoord niet laten verdwijnen.
    aiGooit = true
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})

    const goed = await submitStudyAnswerAction('q1', 'x^3/3 + c')

    expect(goed).toMatchObject({ kind: 'correct', streak: 3, mastered: true })
    expect(answers).toHaveLength(1)
    expect(answers[0].is_correct).toBe(true)
    expect(answers[0].user_answer).toBe('x^3/3 + c')
    expect(progress.total_answered).toBe(3)
    expect(progress.total_correct).toBe(3)
    expect(aiAanroepen).toBe(0)

    // De rekenregel zegt fout en de AI gooit. Het antwoord blijft één keer
    // bewaard, als fout — de inzending zelf mislukt niet.
    const fout = await submitStudyAnswerAction('q1', 'x^2')

    expect(fout).toMatchObject({ kind: 'incorrect' })
    expect(answers).toHaveLength(2)
    expect(answers[1].is_correct).toBe(false)
    expect(answers[1].user_answer).toBe('x^2')
    expect(aiAanroepen).toBe(1)
    log.mockRestore()
  })

  it('stuurt een databasefout niet mee naar de browser', async () => {
    antwoordOpslaanFout = { code: '42501', message: RAUWE_DATABASEFOUT }
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await submitStudyAnswerAction('q1', '1/3x^3 + c')

    expect(result).toEqual({
      kind: 'error',
      soort: 'opslaan_mislukt',
      message: 'Opslaan lukte niet. Probeer het nog een keer.',
    })
    expect(JSON.stringify(result)).not.toContain(RAUWE_DATABASEFOUT)
    expect(answers).toHaveLength(0)
    expect(log.mock.calls.flat().join(' ')).toContain(RAUWE_DATABASEFOUT)
    log.mockRestore()
  })

  it('stuurt een databasefout bij het aanmaken van de sessie niet mee naar de browser', async () => {
    sessieAanmakenFout = {
      code: '42501',
      message: 'new row violates row-level security policy for table "user_sessions_new"',
    }
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await submitStudyAnswerAction('q1', '1/3x^3 + c')

    expect(result).toEqual({
      kind: 'error',
      soort: 'opslaan_mislukt',
      message: 'Opslaan lukte niet. Probeer het nog een keer.',
    })
    expect(JSON.stringify(result)).not.toContain('user_sessions_new')
    expect(answers).toHaveLength(0)
    expect(log.mock.calls.flat().join(' ')).toContain('user_sessions_new')
    log.mockRestore()
  })

  it('stuurt een databasefout bij het aanmaken van de voortgang niet mee naar de browser', async () => {
    geenVoortgang = true
    voortgangAanmakenFout = {
      code: '42501',
      message: 'new row violates row-level security policy for table "user_progress_new"',
    }
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await submitStudyAnswerAction('q1', '1/3x^3 + c')

    expect(result).toEqual({
      kind: 'error',
      soort: 'opslaan_mislukt',
      message: 'Opslaan lukte niet. Probeer het nog een keer.',
    })
    expect(JSON.stringify(result)).not.toContain('user_progress_new')
    expect(log.mock.calls.flat().join(' ')).toContain('user_progress_new')
    log.mockRestore()
  })

  it('stuurt een databasefout bij het bijwerken van de voortgang niet mee naar de browser', async () => {
    voortgangBijwerkenFout = {
      code: '42501',
      message: 'permission denied for table user_progress_new',
    }
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    const reeksVoor = progress.correct_streak

    const result = await submitStudyAnswerAction('q1', '1/3x^3 + c')

    expect(result).toEqual({
      kind: 'error',
      soort: 'opslaan_mislukt',
      message: 'Opslaan lukte niet. Probeer het nog een keer.',
    })
    expect(JSON.stringify(result)).not.toContain('permission denied')
    expect(progress.correct_streak).toBe(reeksVoor)
    expect(log.mock.calls.flat().join(' ')).toContain('permission denied')
    log.mockRestore()
  })
})

describe('flagQuestionNewAction', () => {
  beforeEach(() => {
    antwoordOpslaanFout = null
    vraagMeldenFout = null
  })

  it('stuurt een databasefout niet mee naar de browser', async () => {
    vraagMeldenFout = { code: '42501', message: RAUWE_DATABASEFOUT }
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await flagQuestionNewAction('q1', 'de uitwerking klopt niet')

    expect(result).toEqual({
      ok: false,
      error: 'Melden lukte niet. Probeer het nog een keer.',
    })
    expect(JSON.stringify(result)).not.toContain(RAUWE_DATABASEFOUT)
    expect(log.mock.calls.flat().join(' ')).toContain(RAUWE_DATABASEFOUT)
    log.mockRestore()
  })
})
