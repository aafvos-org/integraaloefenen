import { beforeEach, describe, expect, it, vi } from 'vitest'

import { SITE } from '@/config/site'

import {
  createCustomTest,
  loadTestResults,
  loadTestSessionState,
  pickQuestionsForTest,
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
  questions: Row[]
  clusters: Row[]
  topics: Row[]
  chapters: Row[]
  blocks: Row[]
  paragraphs: Row[]
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
  if (naam === 'questions_new') return data.questions
  if (naam === 'topic_clusters_new') return data.clusters
  if (naam === 'topics_new') return data.topics
  if (naam === 'chapters') return data.chapters
  if (naam === 'theory_blocks') return data.blocks
  if (naam === 'paragraphs') return data.paragraphs
  throw new Error(`onbekende tabel ${naam}`)
}

/** Minimale nabootsing van de query-builder van Supabase. */
function from(naam: string) {
  const rijen = tabel(naam)
  const filters: Array<(r: Row) => boolean> = []
  let op: 'select' | 'insert' | 'delete' = 'select'
  let teSchrijven: Row[] = []
  let telt = false
  let enkelvoud = false

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
    if (enkelvoud) return { data: gevonden[0] ? { ...gevonden[0] } : null, error: null, count: null }
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
    single: async () => {
      if (op === 'select') enkelvoud = true
      return run()
    },
    maybeSingle: async () => {
      if (op === 'select') enkelvoud = true
      return run()
    },
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
  data = {
    sessions: [],
    testQuestions: [],
    answers: [],
    questions: [],
    clusters: [],
    topics: [],
    chapters: [],
    blocks: [],
    paragraphs: [],
  }
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

// =====================================================================
// Het kiezen van vragen voor een zelf-toets.
//
// Filtert op bron ('new'/'wrong'/'all') en levert nooit dubbele ids: de
// UNIQUE op (session_id, question_id) laat de hele toets klappen als dat
// wel gebeurt (INT-473).
// =====================================================================

describe('pickQuestionsForTest', () => {
  beforeEach(() => {
    data.questions = [
      { id: 'q1', cluster_id: 'c1', site: SITE },
      { id: 'q2', cluster_id: 'c1', site: SITE },
      { id: 'q3', cluster_id: 'c1', site: SITE },
      { id: 'q4', cluster_id: 'c2', site: SITE },
      { id: 'q5', cluster_id: 'c2', site: SITE },
      // andere site: moet nooit meegenomen worden
      { id: 'q-afgeleiden', cluster_id: 'c1', site: 'afgeleiden' },
    ]
    data.sessions = [{ id: 's1', user_id: 'u1' }]
    data.answers = [
      { session_id: 's1', question_id: 'q1', is_correct: true },
      { session_id: 's1', question_id: 'q2', is_correct: false },
    ]
  })

  it('levert bij "all" alle vragen uit de gekozen clusters, zonder die van een andere site', async () => {
    const result = await pickQuestionsForTest(nepClient, 'u1', ['c1', 'c2'], 'all', 10)

    expect(result).toHaveLength(5)
    expect(new Set(result)).toEqual(new Set(['q1', 'q2', 'q3', 'q4', 'q5']))
  })

  it('laat bij "new" de al beantwoorde vragen weg', async () => {
    const result = await pickQuestionsForTest(nepClient, 'u1', ['c1', 'c2'], 'new', 10)

    expect(new Set(result)).toEqual(new Set(['q3', 'q4', 'q5']))
  })

  it('levert bij "wrong" alleen de fout beantwoorde vragen', async () => {
    const result = await pickQuestionsForTest(nepClient, 'u1', ['c1', 'c2'], 'wrong', 10)

    expect(result).toEqual(['q2'])
  })

  it('levert niets bij "wrong" als er nog niets fout is gegaan', async () => {
    data.answers = []

    const result = await pickQuestionsForTest(nepClient, 'u1', ['c1', 'c2'], 'wrong', 10)

    expect(result).toEqual([])
  })

  it('levert nooit dubbele ids, ook niet bij vervuilde data', async () => {
    data.questions.push({ id: 'q1', cluster_id: 'c1', site: SITE })

    const result = await pickQuestionsForTest(nepClient, 'u1', ['c1', 'c2'], 'all', 10)

    expect(result.filter((id) => id === 'q1')).toHaveLength(1)
  })

  it('geeft niet meer vragen terug dan gevraagd', async () => {
    const result = await pickQuestionsForTest(nepClient, 'u1', ['c1', 'c2'], 'all', 2)

    expect(result).toHaveLength(2)
  })

  it('levert niets zonder gekozen clusters', async () => {
    expect(await pickQuestionsForTest(nepClient, 'u1', [], 'all', 10)).toEqual([])
  })

  it('levert niets bij een aantal van nul of minder', async () => {
    expect(await pickQuestionsForTest(nepClient, 'u1', ['c1'], 'all', 0)).toEqual([])
  })

  it('levert niets als er geen vraag in de gekozen clusters zit', async () => {
    expect(await pickQuestionsForTest(nepClient, 'u1', ['c-leeg'], 'all', 10)).toEqual([])
  })
})

// =====================================================================
// De stand van een lopende zelf-toets.
// =====================================================================

describe('loadTestSessionState', () => {
  beforeEach(() => {
    data.sessions = [
      {
        id: 's1',
        user_id: 'u1',
        session_type: 'custom_test',
        ended_at: null,
        show_answers: 'immediate',
      },
      {
        id: 's-oefenen',
        user_id: 'u1',
        session_type: 'practice',
        ended_at: null,
        show_answers: 'immediate',
      },
    ]
    data.testQuestions = [
      { session_id: 's1', question_id: 'q1', order_index: 0 },
      { session_id: 's1', question_id: 'q2', order_index: 1 },
      { session_id: 's1', question_id: 'q3', order_index: 2 },
    ]
    data.answers = [{ session_id: 's1', question_id: 'q1' }]
  })

  it('geeft de voortgang en de eerstvolgende onbeantwoorde vraag', async () => {
    const state = await loadTestSessionState(nepClient, 'u1', 's1')

    expect(state).toEqual({
      sessionId: 's1',
      totalCount: 3,
      answeredCount: 1,
      ended: false,
      showAnswers: 'immediate',
      nextQuestionId: 'q2',
      nextOrdinal: 2,
    })
  })

  it('geeft null bij een onbekende toets', async () => {
    expect(await loadTestSessionState(nepClient, 'u1', 'nope')).toBeNull()
  })

  it('geeft null bij de toets van een andere leerling', async () => {
    expect(await loadTestSessionState(nepClient, 'u2', 's1')).toBeNull()
  })

  it('geeft null als het geen zelf-toets is', async () => {
    expect(await loadTestSessionState(nepClient, 'u1', 's-oefenen')).toBeNull()
  })

  it('zet nextQuestionId op null als alles beantwoord is', async () => {
    data.answers = [
      { session_id: 's1', question_id: 'q1' },
      { session_id: 's1', question_id: 'q2' },
      { session_id: 's1', question_id: 'q3' },
    ]

    const state = await loadTestSessionState(nepClient, 'u1', 's1')

    expect(state).toMatchObject({
      answeredCount: 3,
      nextQuestionId: null,
      nextOrdinal: null,
    })
  })

  it('geeft ended terug als de toets afgesloten is', async () => {
    data.sessions[0]!.ended_at = new Date().toISOString()

    const state = await loadTestSessionState(nepClient, 'u1', 's1')

    expect(state?.ended).toBe(true)
  })
})

// =====================================================================
// De uitslag van een afgeronde zelf-toets, per cluster/blok.
// =====================================================================

describe('loadTestResults', () => {
  beforeEach(() => {
    data.sessions = [{ id: 's1', user_id: 'u1', session_type: 'custom_test' }]
    data.chapters = [{ id: 'ch1', slug: 'k' }]
    data.paragraphs = [{ id: 'p1', label: 'K.1' }]
    data.blocks = [{ id: 'b1', slug: 'blok-a', letter: 'A', paragraph_id: 'p1' }]
    data.topics = [
      { id: 't1', slug: 'topic-1', title: 'Topic 1', chapter_id: 'ch1', theory_block_id: 'b1' },
    ]
    data.clusters = [{ id: 'c1', slug: 'cluster-1', title: 'Cluster 1', topic_id: 't1' }]
    data.questions = [
      { id: 'q1', cluster_id: 'c1', latex_body: '\\int x\\,dx', answer: 'x^2/2', latex_answer: 'x^2/2' },
      { id: 'q2', cluster_id: 'c1', latex_body: '\\int 1\\,dx', answer: 'x', latex_answer: 'x' },
    ]
    data.testQuestions = [
      { session_id: 's1', question_id: 'q1', order_index: 0 },
      { session_id: 's1', question_id: 'q2', order_index: 1 },
    ]
    data.answers = [
      { session_id: 's1', question_id: 'q1', user_answer: 'x^2/2', is_correct: true },
      { session_id: 's1', question_id: 'q2', user_answer: '3', is_correct: false },
    ]
  })

  it('telt het aantal goed en bouwt de score per cluster op', async () => {
    const result = await loadTestResults(nepClient, 'u1', 's1')

    expect(result).toMatchObject({
      totalCount: 2,
      correctCount: 1,
      perCluster: [
        {
          clusterId: 'c1',
          clusterTitle: 'Cluster 1',
          topicTitle: 'Topic 1',
          chapterSlug: 'k',
          topicSlug: 'topic-1',
          clusterSlug: 'cluster-1',
          blockSlug: 'blok-a',
          blockLabel: 'K.1 A',
          total: 2,
          correct: 1,
        },
      ],
    })
    expect(result?.perCluster[0]?.items).toEqual([
      {
        questionId: 'q1',
        latexBody: '\\int x\\,dx',
        userAnswer: 'x^2/2',
        correctAnswer: 'x^2/2',
        latexAnswer: 'x^2/2',
        isCorrect: true,
      },
      {
        questionId: 'q2',
        latexBody: '\\int 1\\,dx',
        userAnswer: '3',
        correctAnswer: 'x',
        latexAnswer: 'x',
        isCorrect: false,
      },
    ])
  })

  it('laat blockSlug en blockLabel leeg als de vraag niet aan een theorieblok hangt', async () => {
    data.topics = [{ id: 't1', slug: 'topic-1', title: 'Topic 1', chapter_id: 'ch1', theory_block_id: null }]

    const result = await loadTestResults(nepClient, 'u1', 's1')

    expect(result?.perCluster[0]).toMatchObject({ blockSlug: '', blockLabel: '' })
  })

  it('geeft een lege uitslag als de toets geen vragen heeft', async () => {
    data.testQuestions = []

    expect(await loadTestResults(nepClient, 'u1', 's1')).toEqual({
      totalCount: 0,
      correctCount: 0,
      perCluster: [],
    })
  })

  it('geeft null bij een onbekende toets', async () => {
    expect(await loadTestResults(nepClient, 'u1', 'nope')).toBeNull()
  })

  it('geeft null bij de toets van een andere leerling', async () => {
    expect(await loadTestResults(nepClient, 'u2', 's1')).toBeNull()
  })
})
