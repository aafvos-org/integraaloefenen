import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createCustomTest,
  removeEmptyCustomTests,
} from './custom-test'

// =====================================================================
// Het aanmaken van een zelf-toets.
//
// Een toets bestaat uit een sessie plus een rij gekozen vragen. Gaat het
// wegschrijven van de vragen mis, dan mag er geen lege toets achterblijven:
// die kan de leerling niet maken, hij telt mee in de naam van de volgende
// toets en hij vervuilt de metingen (INT-80).
//
// Een nepdatabase in het geheugen; geen Supabase.
// =====================================================================

type Row = Record<string, unknown>

type NepDatabase = {
  sessions: Row[]
  testQuestions: Row[]
  answers: Row[]
}

/** Laat het wegschrijven van de vragen op commando mislukken. */
type Storing = {
  /** Bij welke pogingen de insert een fout teruggeeft. */
  insertFaaltBijPoging?: number[]
  /** Bij welke pogingen de insert "lukt" maar niets wegschrijft. */
  stilFaaltBijPoging?: number[]
}

let data: NepDatabase
let storing: Storing
let insertPogingen: number

function tabel(naam: string): Row[] {
  if (naam === 'user_sessions_new') return data.sessions
  if (naam === 'custom_test_questions') return data.testQuestions
  if (naam === 'session_answers_new') return data.answers
  throw new Error(`onbekende tabel ${naam}`)
}

/** Minimale nabootsing van de query-builder van Supabase. */
function from(naam: string) {
  const rijen = tabel(naam)
  const filters: Array<(r: Row) => boolean> = []
  let op: 'select' | 'insert' | 'delete' = 'select'
  let teSchrijven: Row[] = []
  let telt = false

  function gefilterd(): Row[] {
    return rijen.filter((r) => filters.every((f) => f(r)))
  }

  function run() {
    if (op === 'insert') {
      if (naam === 'custom_test_questions') {
        insertPogingen++
        if (storing.insertFaaltBijPoging?.includes(insertPogingen)) {
          return {
            data: null,
            error: { code: '23505', message: 'duplicate key value violates unique constraint' },
            count: null,
          }
        }
        if (storing.stilFaaltBijPoging?.includes(insertPogingen)) {
          return { data: null, error: null, count: null }
        }
      }
      // De echte database weigert dubbele sleutels; die regel moet hier ook
      // gelden, anders bewijst de test niets over opnieuw proberen.
      for (const rij of teSchrijven) {
        const botst = rijen.some(
          (r) =>
            r.session_id === rij.session_id &&
            (r.order_index === rij.order_index || r.question_id === rij.question_id),
        )
        if (botst) {
          return {
            data: null,
            error: { code: '23505', message: 'duplicate key value violates unique constraint' },
            count: null,
          }
        }
      }
      rijen.push(...teSchrijven.map((r) => ({ ...r })))
      const terug = teSchrijven.map((r) => ({ ...r }))
      return { data: terug.length === 1 ? terug[0] : terug, error: null, count: null }
    }

    if (op === 'delete') {
      for (const rij of gefilterd()) rijen.splice(rijen.indexOf(rij), 1)
      return { data: null, error: null, count: null }
    }

    const gevonden = gefilterd()
    if (telt) return { data: null, error: null, count: gevonden.length }
    return { data: gevonden.map((r) => ({ ...r })), error: null, count: null }
  }

  const builder = {
    select: (_kolommen?: string, opties?: { count?: string; head?: boolean }) => {
      if (opties?.count) telt = true
      return builder
    },
    insert: (waarde: Row | Row[]) => {
      op = 'insert'
      teSchrijven = Array.isArray(waarde) ? waarde : [waarde]
      if (naam === 'user_sessions_new') {
        teSchrijven = teSchrijven.map((r) => ({
          id: `s${data.sessions.length + 1}`,
          started_at: new Date().toISOString(),
          ended_at: null,
          ...r,
        }))
      }
      return builder
    },
    delete: () => {
      op = 'delete'
      return builder
    },
    eq: (kolom: string, waarde: unknown) => {
      filters.push((r) => r[kolom] === waarde)
      return builder
    },
    lt: (kolom: string, waarde: string) => {
      filters.push((r) => String(r[kolom]) < waarde)
      return builder
    },
    in: (kolom: string, waarden: unknown[]) => {
      filters.push((r) => waarden.includes(r[kolom]))
      return builder
    },
    order: () => builder,
    single: async () => run(),
    maybeSingle: async () => run(),
    then: (resolve: (value: ReturnType<typeof run>) => unknown) =>
      Promise.resolve(run()).then(resolve),
  }

  return builder
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nepClient = { from } as any

const VRAGEN = Array.from({ length: 50 }, (_, i) => `q${i + 1}`)

const INPUT = {
  questionIds: VRAGEN.slice(0, 10),
  name: 'Zelf-toets-1',
  showAnswers: 'immediate' as const,
}

/** Toetsen zonder vragen — precies wat er nu in de database staat. */
function legeToetsen(): Row[] {
  return data.sessions.filter(
    (s) =>
      s.session_type === 'custom_test' &&
      !data.testQuestions.some((q) => q.session_id === s.id),
  )
}

beforeEach(() => {
  data = { sessions: [], testQuestions: [], answers: [] }
  storing = {}
  insertPogingen = 0
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('createCustomTest', () => {
  it('zet de sessie en alle vragen klaar', async () => {
    const result = await createCustomTest(nepClient, 'u1', INPUT)

    expect(result).toEqual({ ok: true, sessionId: 's1' })
    expect(data.sessions).toHaveLength(1)
    expect(data.testQuestions).toHaveLength(10)
    expect(data.testQuestions.map((r) => r.order_index)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    ])
  })

  it('doet dat ook bij het maximum van 50 vragen', async () => {
    const result = await createCustomTest(nepClient, 'u1', {
      ...INPUT,
      questionIds: VRAGEN,
    })

    expect(result).toMatchObject({ ok: true })
    expect(data.testQuestions).toHaveLength(50)
  })

  it('laat geen lege toets achter als de vragen er niet in komen', async () => {
    storing = { insertFaaltBijPoging: [1, 2] }

    const result = await createCustomTest(nepClient, 'u1', INPUT)

    expect(result).toMatchObject({ ok: false })
    expect(data.sessions).toHaveLength(0)
    expect(data.testQuestions).toHaveLength(0)
    expect(legeToetsen()).toHaveLength(0)
  })

  it('laat ook geen lege toets achter als de database wel ja zegt maar niets wegschrijft', async () => {
    storing = { stilFaaltBijPoging: [1, 2] }

    const result = await createCustomTest(nepClient, 'u1', INPUT)

    expect(result).toMatchObject({ ok: false })
    expect(data.sessions).toHaveLength(0)
    expect(legeToetsen()).toHaveLength(0)
  })

  it('toont de leerling geen database-jargon', async () => {
    storing = { insertFaaltBijPoging: [1, 2] }

    const result = await createCustomTest(nepClient, 'u1', INPUT)

    expect(result).toEqual({
      ok: false,
      error: 'Het maken van je toets lukte niet. Probeer het nog een keer.',
    })
  })

  it('probeert het nog een keer en levert dan een volledige toets', async () => {
    storing = { insertFaaltBijPoging: [1] }

    const result = await createCustomTest(nepClient, 'u1', INPUT)

    expect(result).toMatchObject({ ok: true })
    expect(data.testQuestions).toHaveLength(10)
    // Geen resten van de mislukte poging: elke plek precies één keer.
    const plekken = data.testQuestions.map((r) => r.order_index)
    expect(new Set(plekken).size).toBe(10)
  })

  it('gooit dubbele vragen eruit, want daar klapt de toets op', async () => {
    const result = await createCustomTest(nepClient, 'u1', {
      ...INPUT,
      questionIds: ['q1', 'q2', 'q1', 'q3'],
    })

    expect(result).toMatchObject({ ok: true })
    expect(data.testQuestions.map((r) => r.question_id)).toEqual(['q1', 'q2', 'q3'])
  })

  it('maakt geen sessie aan als er geen vragen zijn', async () => {
    const result = await createCustomTest(nepClient, 'u1', {
      ...INPUT,
      questionIds: [],
    })

    expect(result).toMatchObject({ ok: false })
    expect(data.sessions).toHaveLength(0)
  })
})

describe('removeEmptyCustomTests', () => {
  const lang = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const net = new Date().toISOString()

  beforeEach(() => {
    data.sessions = [
      { id: 'oud-leeg', user_id: 'u1', session_type: 'custom_test', started_at: lang },
      { id: 'oud-gevuld', user_id: 'u1', session_type: 'custom_test', started_at: lang },
      { id: 'net-leeg', user_id: 'u1', session_type: 'custom_test', started_at: net },
      { id: 'oefenen', user_id: 'u1', session_type: 'practice', started_at: lang },
      { id: 'ander-kind', user_id: 'u2', session_type: 'custom_test', started_at: lang },
    ]
    data.testQuestions = [
      { session_id: 'oud-gevuld', question_id: 'q1', order_index: 0 },
      { session_id: 'oud-gevuld', question_id: 'q2', order_index: 1 },
    ]
  })

  it('ruimt alleen de lege toetsen van deze leerling op', async () => {
    const aantal = await removeEmptyCustomTests(nepClient, 'u1')

    expect(aantal).toBe(1)
    expect(data.sessions.map((s) => s.id)).toEqual([
      'oud-gevuld',
      'net-leeg',
      'oefenen',
      'ander-kind',
    ])
  })

  it('laat een toets met antwoorden staan, ook zonder vragenlijst', async () => {
    data.answers = [{ session_id: 'oud-leeg', question_id: 'q9' }]

    const aantal = await removeEmptyCustomTests(nepClient, 'u1')

    expect(aantal).toBe(0)
    expect(data.sessions.some((s) => s.id === 'oud-leeg')).toBe(true)
  })

  it('doet niets als er niets op te ruimen valt', async () => {
    data.sessions = data.sessions.filter((s) => s.id !== 'oud-leeg')

    expect(await removeEmptyCustomTests(nepClient, 'u1')).toBe(0)
  })
})
