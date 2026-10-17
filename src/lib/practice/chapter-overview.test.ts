import { beforeEach, describe, expect, it } from 'vitest'

import { SITE } from '@/config/site'

import {
  loadAllClusters,
  loadAllTopics,
  loadChapters,
  loadClustersForTopics,
  loadParagraphs,
  loadQuestionNew,
  loadTheoryBlocks,
  loadTilesForClusters,
  tegelsVanVragen,
} from './chapter-overview'

// =====================================================================
// Het hoofdstukoverzicht: welke hoofdstukken, onderwerpen en opgaven
// ziet een leerling, in welke volgorde, en met welke goed/fout-stempel?
//
// Een nepdatabase in het geheugen; geen Supabase. Alleen de boekhouding
// wordt getest, niet de echte query's.
// =====================================================================

type Rij = Record<string, unknown>
type Fout = { message: string }

/** Wat er in de nepdatabase staat, per tabel. */
let tabellen: Record<string, Rij[]>
/** Tabellen die op commando een fout teruggeven. */
let storingen: Record<string, Fout>
/** Elke aanroep van `.from(...)`, om te zien wat er wel en niet gevraagd wordt. */
let bevragingen: Array<{ tabel: string; in?: { kolom: string; aantal: number } }>

function vergelijk(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b))
}

/** Minimale nabootsing van de query-builder van Supabase. */
function from(naam: string) {
  const filters: Array<(r: Rij) => boolean> = []
  let sorteerKolom: string | null = null
  let oplopend = true
  const log: { tabel: string; in?: { kolom: string; aantal: number } } = { tabel: naam }
  bevragingen.push(log)

  function run(): { data: unknown; error: Fout | null } {
    const fout = storingen[naam]
    if (fout) return { data: null, error: fout }
    const gevonden = (tabellen[naam] ?? []).filter((r) => filters.every((f) => f(r)))
    const kolom = sorteerKolom
    const gesorteerd = kolom
      ? [...gevonden].sort((a, b) => vergelijk(a[kolom], b[kolom]) * (oplopend ? 1 : -1))
      : gevonden
    return { data: gesorteerd.map((r) => ({ ...r })), error: null }
  }

  const builder = {
    select: () => builder,
    eq: (kolom: string, waarde: unknown) => {
      filters.push((r) => r[kolom] === waarde)
      return builder
    },
    in: (kolom: string, waarden: unknown[]) => {
      log.in = { kolom, aantal: waarden.length }
      filters.push((r) => waarden.includes(r[kolom]))
      return builder
    },
    order: (kolom: string, opties?: { ascending?: boolean }) => {
      sorteerKolom = kolom
      oplopend = opties?.ascending !== false
      return builder
    },
    maybeSingle: async () => {
      const { data, error } = run()
      if (error) return { data: null, error }
      return { data: (data as Rij[])[0] ?? null, error: null }
    },
    then: (resolve: (value: ReturnType<typeof run>) => unknown) =>
      Promise.resolve(run()).then(resolve),
  }

  return builder
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nepClient = { from } as any

function hoofdstuk(slug: string, order_index: number, site = SITE): Rij {
  return { id: `h-${slug}`, slug, title: slug, book_part: 1, order_index, site }
}

function vraag(
  id: string,
  cluster_id: string,
  difficulty: number,
  order_index: number | null,
  latex_body: string | null = `$$\\int ${id}$$`,
): Rij {
  return { id, cluster_id, difficulty, order_index, latex_body, site: SITE }
}

function antwoord(question_id: string, is_correct: boolean | null, answered_at: string): Rij {
  return { question_id, is_correct, answered_at }
}

beforeEach(() => {
  tabellen = {
    chapters: [],
    topics_new: [],
    paragraphs: [],
    theory_blocks: [],
    topic_clusters_new: [],
    questions_new: [],
    question_steps_new: [],
    session_answers_new: [],
  }
  storingen = {}
  bevragingen = []
})

describe('loadChapters', () => {
  it('geeft de hoofdstukken van deze site op volgorde', async () => {
    tabellen.chapters = [
      hoofdstuk('L', 2),
      hoofdstuk('K', 1),
      hoofdstuk('M', 3),
    ]

    const hoofdstukken = await loadChapters(nepClient)

    expect(hoofdstukken.map((h) => h.slug)).toEqual(['K', 'L', 'M'])
  })

  it('laat examentraining weg: dat is een eigen pagina, geen hoofdstuk', async () => {
    tabellen.chapters = [hoofdstuk('K', 1), hoofdstuk('examentraining', 99)]

    const hoofdstukken = await loadChapters(nepClient)

    expect(hoofdstukken.map((h) => h.slug)).toEqual(['K'])
  })

  it('laat hoofdstukken van een andere site weg', async () => {
    tabellen.chapters = [hoofdstuk('K', 1), hoofdstuk('A', 2, 'afgeleiden')]

    const hoofdstukken = await loadChapters(nepClient)

    expect(hoofdstukken.map((h) => h.slug)).toEqual(['K'])
  })

  it('geeft een lege lijst als er nog geen hoofdstukken zijn', async () => {
    await expect(loadChapters(nepClient)).resolves.toEqual([])
  })

  it('gooit de databasefout door', async () => {
    storingen.chapters = { message: 'tabel bestaat niet' }

    await expect(loadChapters(nepClient)).rejects.toThrow('tabel bestaat niet')
  })
})

describe('de overige overzichtslijsten', () => {
  it('geven alleen de rijen van deze site, op volgorde', async () => {
    tabellen.topics_new = [
      { id: 't2', slug: 'b', title: 'B', chapter_id: 'h-K', order_index: 2, category: 'integralen', theory_block_id: null, site: SITE },
      { id: 't1', slug: 'a', title: 'A', chapter_id: 'h-K', order_index: 1, category: 'primitiveren', theory_block_id: 'tb1', site: SITE },
      { id: 't9', slug: 'x', title: 'X', chapter_id: 'h-A', order_index: 1, category: null, theory_block_id: null, site: 'afgeleiden' },
    ]
    tabellen.paragraphs = [
      { id: 'p1', chapter_id: 'h-K', slug: 'k1', label: '1', title: 'Primitiveren', order_index: 1, site: SITE },
      { id: 'p9', chapter_id: 'h-A', slug: 'a1', label: '1', title: 'Afgeleiden', order_index: 1, site: 'afgeleiden' },
    ]
    tabellen.theory_blocks = [
      { id: 'tb1', paragraph_id: 'p1', slug: 'k1a', letter: 'A', title: 'Standaardvormen', order_index: 1, site: SITE },
    ]

    expect((await loadAllTopics(nepClient)).map((t) => t.id)).toEqual(['t1', 't2'])
    expect((await loadParagraphs(nepClient)).map((p) => p.id)).toEqual(['p1'])
    expect((await loadTheoryBlocks(nepClient)).map((b) => b.id)).toEqual(['tb1'])
  })

  it('geven een lege lijst als er nog niets is', async () => {
    await expect(loadAllTopics(nepClient)).resolves.toEqual([])
    await expect(loadParagraphs(nepClient)).resolves.toEqual([])
    await expect(loadTheoryBlocks(nepClient)).resolves.toEqual([])
  })

  it('gooien de databasefout door', async () => {
    storingen.topics_new = { message: 'onderwerpen stuk' }
    storingen.paragraphs = { message: 'paragrafen stuk' }
    storingen.theory_blocks = { message: 'theorie stuk' }

    await expect(loadAllTopics(nepClient)).rejects.toThrow('onderwerpen stuk')
    await expect(loadParagraphs(nepClient)).rejects.toThrow('paragrafen stuk')
    await expect(loadTheoryBlocks(nepClient)).rejects.toThrow('theorie stuk')
  })
})

describe('loadClustersForTopics', () => {
  beforeEach(() => {
    tabellen.topic_clusters_new = [
      { id: 'c2', slug: 'c2', title: 'Tweede', topic_id: 't1', order_index: 2, site: SITE },
      { id: 'c1', slug: 'c1', title: 'Eerste', topic_id: 't1', order_index: 1, site: SITE },
      { id: 'c3', slug: 'c3', title: 'Derde', topic_id: 't2', order_index: 1, site: SITE },
      { id: 'c9', slug: 'c9', title: 'Anders', topic_id: 't9', order_index: 1, site: 'afgeleiden' },
    ]
  })

  it('geeft de clusters van de gevraagde onderwerpen op volgorde', async () => {
    const clusters = await loadClustersForTopics(nepClient, ['t1'])

    expect(clusters.map((c) => c.id)).toEqual(['c1', 'c2'])
  })

  it('vraagt niets aan de database voor een hoofdstuk zonder onderwerpen', async () => {
    const clusters = await loadClustersForTopics(nepClient, [])

    expect(clusters).toEqual([])
    expect(bevragingen).toEqual([])
  })

  it('gooit de databasefout door', async () => {
    storingen.topic_clusters_new = { message: 'clusters stuk' }

    await expect(loadClustersForTopics(nepClient, ['t1'])).rejects.toThrow('clusters stuk')
  })

  it('loadAllClusters geeft alles van deze site, zonder onderwerp-id’s vooraf', async () => {
    const clusters = await loadAllClusters(nepClient)

    expect(clusters.map((c) => c.id)).toEqual(['c1', 'c3', 'c2'])
  })
})

describe('de tegels van een hoofdstuk', () => {
  beforeEach(() => {
    tabellen.questions_new = [
      vraag('q-c2-1', 'c2', 1, 1),
      vraag('q-c1-moeilijk', 'c1', 3, 1),
      vraag('q-c1-2', 'c1', 1, 2),
      vraag('q-c1-1', 'c1', 1, 1),
    ]
  })

  it('zet een leerling zonder voortgang op alles “nog niet gedaan”', async () => {
    const tegels = await loadTilesForClusters(nepClient, ['c1', 'c2'])

    expect(tegels.map((t) => t.lastCorrect)).toEqual([null, null, null, null])
  })

  it('zet de opgaven op volgorde van cluster, dan moeilijkheid, dan nummer', async () => {
    const tegels = await loadTilesForClusters(nepClient, ['c1', 'c2'])

    expect(tegels.map((t) => t.questionId)).toEqual([
      'q-c1-1',
      'q-c1-2',
      'q-c1-moeilijk',
      'q-c2-1',
    ])
    expect(tegels.map((t) => t.ordinal)).toEqual([1, 2, 3, 4])
  })

  it('volgt de volgorde waarin de clusters gevraagd worden', async () => {
    const tegels = await loadTilesForClusters(nepClient, ['c2', 'c1'])

    expect(tegels.map((t) => t.clusterId)).toEqual(['c2', 'c1', 'c1', 'c1'])
  })

  it('laat opgaven uit clusters buiten de vraag weg', async () => {
    const tegels = await loadTilesForClusters(nepClient, ['c1'])

    expect(tegels.map((t) => t.questionId)).toEqual(['q-c1-1', 'q-c1-2', 'q-c1-moeilijk'])
  })

  it('geeft geen tegels voor een leeg hoofdstuk', async () => {
    const tegels = await loadTilesForClusters(nepClient, [])

    expect(tegels).toEqual([])
    expect(bevragingen).toEqual([])
  })

  it('geeft geen tegels als het cluster nog geen opgaven heeft', async () => {
    const tegels = await loadTilesForClusters(nepClient, ['c-leeg'])

    expect(tegels).toEqual([])
  })

  it('toont per opgave het laatste antwoord van de leerling', async () => {
    tabellen.session_answers_new = [
      // Eerst fout, daarna goed: de leerling heeft dit deel afgerond.
      antwoord('q-c1-1', false, '2026-10-01T10:00:00Z'),
      antwoord('q-c1-1', true, '2026-10-02T10:00:00Z'),
      // Eerst goed, daarna fout.
      antwoord('q-c1-2', true, '2026-10-01T10:00:00Z'),
      antwoord('q-c1-2', false, '2026-10-03T10:00:00Z'),
    ]

    const tegels = await loadTilesForClusters(nepClient, ['c1', 'c2'])

    expect(
      Object.fromEntries(tegels.map((t) => [t.questionId, t.lastCorrect])),
    ).toEqual({
      'q-c1-1': true,
      'q-c1-2': false,
      // Nog niet gemaakt: blijft leeg, niet "fout".
      'q-c1-moeilijk': null,
      'q-c2-1': null,
    })
  })

  it('slaat antwoorden zonder uitslag over', async () => {
    tabellen.session_answers_new = [
      antwoord('q-c1-1', null, '2026-10-03T10:00:00Z'),
      antwoord('q-c1-1', true, '2026-10-02T10:00:00Z'),
    ]

    const tegels = await loadTilesForClusters(nepClient, ['c1'])

    expect(tegels[0].lastCorrect).toBe(true)
  })

  it('haalt de antwoorden op in brokken van honderd', async () => {
    tabellen.questions_new = Array.from({ length: 150 }, (_, i) =>
      vraag(`q${i + 1}`, 'c1', 1, i + 1),
    )
    tabellen.session_answers_new = [antwoord('q150', true, '2026-10-02T10:00:00Z')]

    const tegels = await loadTilesForClusters(nepClient, ['c1'])

    expect(tegels).toHaveLength(150)
    expect(tegels[149].lastCorrect).toBe(true)
    const brokken = bevragingen.filter((b) => b.tabel === 'session_answers_new')
    expect(brokken.map((b) => b.in?.aantal)).toEqual([100, 50])
  })

  it('maakt van de opgave een korte voorvertoning zonder dollartekens', async () => {
    tabellen.questions_new = [vraag('q1', 'c1', 1, 1, '$$\\int x\\,dx$$')]

    const tegels = await loadTilesForClusters(nepClient, ['c1'])

    expect(tegels[0].preview).toBe('\\int x\\,dx')
  })

  it('kort een lange opgave af op 56 tekens', async () => {
    const lang = 'a'.repeat(80)
    tabellen.questions_new = [vraag('q1', 'c1', 1, 1, lang)]

    const tegels = await loadTilesForClusters(nepClient, ['c1'])

    expect(tegels[0].preview).toHaveLength(56)
    expect(tegels[0].preview.endsWith('…')).toBe(true)
  })

  it('laat de voorvertoning leeg als er geen opgavetekst is', async () => {
    tabellen.questions_new = [vraag('q1', 'c1', 1, 1, null)]

    const tegels = await loadTilesForClusters(nepClient, ['c1'])

    expect(tegels[0].preview).toBe('')
    expect(tegels[0].latex_body).toBeNull()
  })

  it('houdt de moeilijkheid tussen 1 en 3', async () => {
    tabellen.questions_new = [
      vraag('q-laag', 'c1', 0, 1),
      vraag('q-hoog', 'c1', 7, 2),
    ]

    const tegels = await loadTilesForClusters(nepClient, ['c1'])

    expect(tegels.map((t) => t.difficulty)).toEqual([1, 3])
  })

  it('zet opgaven zonder nummer achteraan', async () => {
    tabellen.questions_new = [
      vraag('q-zonder', 'c1', 1, null),
      vraag('q-met', 'c1', 1, 5),
    ]

    const tegels = await loadTilesForClusters(nepClient, ['c1'])

    expect(tegels.map((t) => t.questionId)).toEqual(['q-met', 'q-zonder'])
  })

  it('gooit de databasefout van de opgaven door', async () => {
    storingen.questions_new = { message: 'opgaven stuk' }

    await expect(loadTilesForClusters(nepClient, ['c1'])).rejects.toThrow('opgaven stuk')
  })

  it('gooit de databasefout van de antwoorden door', async () => {
    storingen.session_answers_new = { message: 'antwoorden stuk' }

    await expect(loadTilesForClusters(nepClient, ['c1'])).rejects.toThrow('antwoorden stuk')
  })

  it('tegelsVanVragen werkt met al opgehaalde opgaven', async () => {
    const vragen = [
      { id: 'q-c2-1', cluster_id: 'c2', difficulty: 1, order_index: 1, latex_body: null },
      { id: 'q-c1-1', cluster_id: 'c1', difficulty: 1, order_index: 1, latex_body: null },
      { id: 'q-weg', cluster_id: 'c3', difficulty: 1, order_index: 1, latex_body: null },
    ]

    const tegels = await tegelsVanVragen(nepClient, vragen, ['c1', 'c2'])

    expect(tegels.map((t) => t.questionId)).toEqual(['q-c1-1', 'q-c2-1'])
    expect(bevragingen.map((b) => b.tabel)).toEqual(['session_answers_new'])
  })
})

describe('loadQuestionNew', () => {
  beforeEach(() => {
    tabellen.questions_new = [vraag('q1', 'c1', 2, 1, '$$\\int 2x\\,dx$$')]
    tabellen.question_steps_new = [
      { id: 's2', question_id: 'q1', step_order: 2, step_description: 'Werk de haakjes weg' },
      { id: 's1', question_id: 'q1', step_order: 1, step_description: 'Herken de standaardvorm' },
    ]
  })

  it('geeft de opgave met de stappen op volgorde', async () => {
    const q = await loadQuestionNew(nepClient, 'q1')

    expect(q).toMatchObject({ id: 'q1', cluster_id: 'c1', difficulty: 2 })
    expect(q?.steps.map((s) => s.id)).toEqual(['s1', 's2'])
  })

  it('geeft null voor een opgave die niet bestaat', async () => {
    await expect(loadQuestionNew(nepClient, 'bestaat-niet')).resolves.toBeNull()
  })

  it('geeft een lege lijst stappen als die er niet zijn', async () => {
    tabellen.question_steps_new = []

    const q = await loadQuestionNew(nepClient, 'q1')

    expect(q?.steps).toEqual([])
  })

  it('gooit de databasefout door', async () => {
    storingen.questions_new = { message: 'opgave stuk' }

    await expect(loadQuestionNew(nepClient, 'q1')).rejects.toThrow('opgave stuk')
  })
})
