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

let vraag: Vraag | null
let fouteAntwoorden: FoutAntwoord[]
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

  function pasUpdateToe() {
    if (table !== 'known_wrong_answers_new') return
    const rij = fouteAntwoorden.find((r) => r.id === filters.id)
    if (rij && typeof waarden.seen_count === 'number') rij.seen_count = waarden.seen_count
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
    if (table === 'question_steps_new') return []
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
    insert: () => {
      op = 'insert'
      return builder
    },
    upsert: () => {
      op = 'upsert'
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
})
