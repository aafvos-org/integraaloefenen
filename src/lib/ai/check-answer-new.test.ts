import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// =====================================================================
// De nakijkcache, zonder netwerk.
//
// Oefenen en de toets vervangen dit bestand door een nepfunctie. Deze test
// praat met het echte bestand: een nepdatabase in het geheugen, en een
// neppe Gemini die niets verstuurt.
// =====================================================================

const generateJson = vi.hoisted(() => vi.fn())

vi.mock('./gemini', () => ({
  generateJson,
}))

import { checkWrongAnswerNew } from './check-answer-new'

type FoutAntwoord = {
  id: string
  question_id: string
  wrong_answer: string
  error_explanation: string
  category: string | null
  seen_count: number
}

type Vraag = {
  id: string
  answer_alternatives: string[]
  latex_body: string
  answer: string
  topic_id: string
  cluster_id: string
}

type Stap = {
  question_id: string
  step_order: number
  step_description: string
}

let vraag: Vraag | null
let fouteAntwoorden: FoutAntwoord[]
let stappen: Stap[]
let fetchSpy: ReturnType<typeof vi.spyOn>

function verseVraag(alternatieven: string[]): Vraag {
  return {
    id: 'vraag-1',
    answer_alternatives: alternatieven,
    latex_body: '\\int 2x\\,dx',
    answer: 'x^2',
    topic_id: 'onderdeel-1',
    cluster_id: 'cluster-1',
  }
}

/** Minimale nabootsing van de query-builder van Supabase. */
function from(table: string) {
  const filters: Record<string, unknown> = {}
  let op: 'select' | 'update' | 'insert' | 'upsert' = 'select'
  let waarden: Record<string, unknown> = {}
  let rijenIn: Array<Record<string, unknown>> = []

  function pasUpdateToe() {
    if (table === 'known_wrong_answers_new') {
      const rij = fouteAntwoorden.find((r) => r.id === filters.id)
      if (rij && typeof waarden.seen_count === 'number') rij.seen_count = waarden.seen_count
      return
    }
    if (table === 'questions_new') {
      if (!vraag || filters.id !== vraag.id) return
      if (Array.isArray(waarden.answer_alternatives)) {
        vraag.answer_alternatives = waarden.answer_alternatives as string[]
      }
    }
  }

  function pasSchrijfToe() {
    if (table === 'known_wrong_answers_new') {
      for (const nieuw of rijenIn) {
        const bestaand = fouteAntwoorden.find(
          (r) => r.question_id === nieuw.question_id && r.wrong_answer === nieuw.wrong_answer,
        )
        if (bestaand) {
          // UNIQUE (question_id, wrong_answer): bijwerken, niet verdubbelen.
          bestaand.error_explanation = String(nieuw.error_explanation)
          bestaand.category = (nieuw.category as string | null) ?? null
          continue
        }
        fouteAntwoorden.push({
          id: `fout-${fouteAntwoorden.length + 1}`,
          question_id: String(nieuw.question_id),
          wrong_answer: String(nieuw.wrong_answer),
          error_explanation: String(nieuw.error_explanation),
          category: (nieuw.category as string | null) ?? null,
          seen_count: 1,
        })
      }
      return
    }
    if (table === 'question_steps_new') {
      for (const nieuw of rijenIn) {
        stappen.push({
          question_id: String(nieuw.question_id),
          step_order: Number(nieuw.step_order),
          step_description: String(nieuw.step_description),
        })
      }
    }
  }

  function rijen(): unknown[] | Record<string, unknown> | null {
    if (table === 'questions_new') {
      if (!vraag || filters.id !== vraag.id) return null
      return vraag
    }
    if (table === 'known_wrong_answers_new') {
      return fouteAntwoorden.filter((r) => r.question_id === filters.question_id)
    }
    if (table === 'topics_new' || table === 'topic_clusters_new') {
      return { title: 'Primitiveren' }
    }
    if (table === 'question_steps_new') {
      return stappen.filter((r) => r.question_id === filters.question_id)
    }
    return null
  }

  const builder = {
    select: () => builder,
    eq: (kolom: string, waarde: unknown) => {
      filters[kolom] = waarde
      return builder
    },
    limit: () => builder,
    update: (nieuw: Record<string, unknown>) => {
      op = 'update'
      waarden = nieuw
      return builder
    },
    insert: (nieuw: Record<string, unknown> | Array<Record<string, unknown>>) => {
      op = 'insert'
      rijenIn = Array.isArray(nieuw) ? nieuw : [nieuw]
      return builder
    },
    upsert: (nieuw: Record<string, unknown> | Array<Record<string, unknown>>) => {
      op = 'upsert'
      rijenIn = Array.isArray(nieuw) ? nieuw : [nieuw]
      return builder
    },
    maybeSingle: async () => {
      const data = rijen()
      return { data: Array.isArray(data) ? null : data, error: null }
    },
    then: (
      resolve: (value: { data: unknown; error: null }) => unknown,
      reject?: (reason: unknown) => unknown,
    ) => {
      if (op === 'update') pasUpdateToe()
      if (op === 'insert' || op === 'upsert') pasSchrijfToe()
      const data = rijen()
      return Promise.resolve({ data, error: null as null }).then(resolve, reject)
    },
  }

  return builder
}

const nepdatabase = { from } as never

describe('checkWrongAnswerNew', () => {
  beforeEach(() => {
    vi.stubEnv('AI_CHECK_MODE', undefined)
    generateJson.mockReset()
    vraag = null
    fouteAntwoorden = []
    stappen = []
    fetchSpy = vi.spyOn(globalThis, 'fetch')
  })

  afterEach(() => {
    fetchSpy.mockRestore()
    vi.unstubAllEnvs()
  })

  it('haalt een bekend fout antwoord uit de cache', async () => {
    vraag = verseVraag([])
    fouteAntwoorden = [
      {
        id: 'fout-1',
        question_id: 'vraag-1',
        wrong_answer: '2x',
        error_explanation: 'Dit is de functie zelf, niet een primitieve.',
        category: 'vorm',
        seen_count: 4,
      },
    ]

    // 2*x en 2x zijn dezelfde schrijfwijze. De cache moet raken, Gemini niet.
    const resultaat = await checkWrongAnswerNew(nepdatabase, 'vraag-1', '2*x')

    expect(resultaat).toEqual({
      errorExplanation: 'Dit is de functie zelf, niet een primitieve.',
      category: 'vorm',
      fromCache: true,
      isMathematicallyCorrect: false,
      generatedSteps: [],
    })
    expect(fouteAntwoorden[0].seen_count).toBe(5)
    expect(generateJson).not.toHaveBeenCalled()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('telt een andere notatie die al op de vraag staat als goed', async () => {
    // X^(3)/3 en x^3/3 zijn dezelfde primitieve, alleen anders opgeschreven.
    vraag = verseVraag(['x^3/3'])

    const resultaat = await checkWrongAnswerNew(nepdatabase, 'vraag-1', 'X^(3)/3')

    expect(resultaat).toEqual({
      errorExplanation: '',
      category: null,
      fromCache: true,
      isMathematicallyCorrect: true,
      generatedSteps: [],
    })
    expect(generateJson).not.toHaveBeenCalled()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('geeft bij een mislukte AI-aanroep een gewone fout terug', async () => {
    vraag = verseVraag([])
    const technischeTekst = 'Gemini 502: <html>Bad Gateway</html>'
    generateJson.mockResolvedValue({ ok: false, error: technischeTekst })
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})

    const resultaat = await checkWrongAnswerNew(nepdatabase, 'vraag-1', 'x')

    expect(resultaat).toEqual({
      error: 'Nakijken lukte niet. Probeer het nog een keer.',
    })
    expect(JSON.stringify(resultaat)).not.toContain('Gemini')
    expect(JSON.stringify(resultaat)).not.toContain('Bad Gateway')
    expect(log).toHaveBeenCalledWith('[ai-nakijken]', technischeTekst)
    expect(fetchSpy).not.toHaveBeenCalled()
    log.mockRestore()
  })

  it('zegt het netjes als de vraag niet bestaat', async () => {
    vraag = null

    const resultaat = await checkWrongAnswerNew(nepdatabase, 'vraag-1', 'x^2')

    expect(resultaat).toEqual({ error: 'Vraag niet gevonden.' })
    expect(generateJson).not.toHaveBeenCalled()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('zet een nieuwe goede notatie bij de vraag', async () => {
    // x*x is hetzelfde als x^2, maar anders opgeschreven: de cache kent hem nog niet.
    vraag = verseVraag([])
    generateJson.mockResolvedValue({
      ok: true,
      data: { is_mathematically_correct: true },
      raw: '{}',
    })

    const resultaat = await checkWrongAnswerNew(nepdatabase, 'vraag-1', 'x*x')

    expect(resultaat).toEqual({
      errorExplanation: '',
      category: null,
      fromCache: false,
      isMathematicallyCorrect: true,
      generatedSteps: [],
    })
    expect(vraag!.answer_alternatives).toEqual(['x*x'])
    expect(fouteAntwoorden).toEqual([])
    expect(stappen).toEqual([])
  })

  it('bewaart een nieuw fout antwoord met het stappenplan', async () => {
    vraag = verseVraag([])
    generateJson.mockResolvedValue({
      ok: true,
      data: {
        is_mathematically_correct: false,
        category: 'vorm',
        error_explanation: 'Je hebt gedifferentieerd in plaats van geprimitiveerd.',
        solution_steps: ['Herken de vorm x^n.', '  Verhoog de macht met 1.  ', '', '   '],
      },
      raw: '{}',
    })

    const resultaat = await checkWrongAnswerNew(nepdatabase, 'vraag-1', '2')

    expect(resultaat).toEqual({
      errorExplanation: 'Je hebt gedifferentieerd in plaats van geprimitiveerd.',
      category: 'vorm',
      fromCache: false,
      isMathematicallyCorrect: false,
      generatedSteps: [
        { step_order: 1, step_description: 'Herken de vorm x^n.' },
        { step_order: 2, step_description: 'Verhoog de macht met 1.' },
      ],
    })
    expect(fouteAntwoorden).toEqual([
      {
        id: 'fout-1',
        question_id: 'vraag-1',
        wrong_answer: '2',
        error_explanation: 'Je hebt gedifferentieerd in plaats van geprimitiveerd.',
        category: 'vorm',
        seen_count: 1,
      },
    ])
    expect(stappen).toEqual([
      { question_id: 'vraag-1', step_order: 1, step_description: 'Herken de vorm x^n.' },
      { question_id: 'vraag-1', step_order: 2, step_description: 'Verhoog de macht met 1.' },
    ])
    // Dezelfde leerling nog een keer: nu uit de cache, en niets verdubbeld.
    const nogEens = await checkWrongAnswerNew(nepdatabase, 'vraag-1', '2')
    expect(nogEens).toMatchObject({ fromCache: true })
    expect(fouteAntwoorden).toHaveLength(1)
    expect(stappen).toHaveLength(2)
  })

  it('valt terug op een gewone uitleg als Gemini een leeg antwoord geeft', async () => {
    vraag = verseVraag([])
    generateJson.mockResolvedValue({ ok: true, data: {}, raw: '{}' })

    const resultaat = await checkWrongAnswerNew(nepdatabase, 'vraag-1', '2')

    expect(resultaat).toEqual({
      errorExplanation: 'Je antwoord is niet correct. Kijk je tussenstappen eens goed na.',
      category: null,
      fromCache: false,
      isMathematicallyCorrect: false,
      generatedSteps: [],
    })
    expect(fouteAntwoorden).toEqual([
      {
        id: 'fout-1',
        question_id: 'vraag-1',
        wrong_answer: '2',
        error_explanation: 'Je antwoord is niet correct. Kijk je tussenstappen eens goed na.',
        category: null,
        seen_count: 1,
      },
    ])
    expect(stappen).toEqual([])
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
