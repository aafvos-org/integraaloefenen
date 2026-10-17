import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { beforeEach, describe, expect, it } from 'vitest'

import { SITE } from '@/config/site'
import { ACHTER_INLOG, MET_TAAL } from '@/i18n/paths'

import { loadChapters } from './chapter-overview'
import { loadConfigData } from './custom-test'
import { EXAMEN_HOOFDSTUK } from './examentraining'

// =====================================================================
// Examentraining is geen gewoon hoofdstuk: het staat wél in de tabel
// `chapters`, maar een leerling komt er alleen via de eigen pagina
// /examentraining. Daarom moet het overal waar hoofdstukken op een rij
// komen juist wegvallen — bij Oefenen én bij het samenstellen van een
// zelf-toets. Blijft het staan, dan ziet de leerling een hoofdstuk dat
// examenopgaven door zijn gewone oefenstof mengt.
//
// Een nepdatabase in het geheugen; geen Supabase.
// =====================================================================

type Rij = Record<string, unknown>

let tabellen: Record<string, Rij[]>

/** Minimale nabootsing van de query-builder van Supabase. */
function from(naam: string) {
  const filters: Array<(r: Rij) => boolean> = []

  function run() {
    const gevonden = (tabellen[naam] ?? []).filter((r) => filters.every((f) => f(r)))
    return { data: gevonden.map((r) => ({ ...r })), error: null }
  }

  const builder = {
    select: () => builder,
    eq: (kolom: string, waarde: unknown) => {
      filters.push((r) => r[kolom] === waarde)
      return builder
    },
    in: (kolom: string, waarden: unknown[]) => {
      filters.push((r) => waarden.includes(r[kolom]))
      return builder
    },
    order: () => builder,
    then: (resolve: (value: ReturnType<typeof run>) => unknown) =>
      Promise.resolve(run()).then(resolve),
  }

  return builder
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nepClient = { from } as any

beforeEach(() => {
  tabellen = {
    chapters: [
      { id: 'h1', slug: 'K', title: 'Primitiveren', book_part: 1, order_index: 1, site: SITE },
      {
        id: 'h-ex',
        slug: EXAMEN_HOOFDSTUK,
        title: 'Examentraining',
        book_part: 1,
        order_index: 99,
        site: SITE,
      },
    ],
    paragraphs: [],
    theory_blocks: [],
    topics_new: [],
    topic_clusters_new: [],
    questions_new: [],
    user_sessions_new: [],
    session_answers_new: [],
  }
})

describe('EXAMEN_HOOFDSTUK', () => {
  it('is de slug van een pagina die de site kent', () => {
    expect(MET_TAAL).toContain(EXAMEN_HOOFDSTUK)
    expect(ACHTER_INLOG).toContain(EXAMEN_HOOFDSTUK)
  })

  it('hoort bij een echte pagina onder src/app/[locale]', () => {
    const pagina = join(process.cwd(), 'src', 'app', '[locale]', EXAMEN_HOOFDSTUK, 'page.tsx')

    expect(existsSync(pagina)).toBe(true)
  })

  it('valt buiten de hoofdstukken van Oefenen', async () => {
    const hoofdstukken = await loadChapters(nepClient)

    expect(hoofdstukken.map((h) => h.slug)).toEqual(['K'])
  })

  it('valt buiten de hoofdstukken die je in een zelf-toets kunt kiezen', async () => {
    const config = await loadConfigData(nepClient, 'u1')

    expect(config.chapters.map((h) => h.slug)).toEqual(['K'])
  })

  it('laat de andere hoofdstukken staan als examentraining er nog niet is', async () => {
    tabellen.chapters = tabellen.chapters.filter((h) => h.slug !== EXAMEN_HOOFDSTUK)

    await expect(loadChapters(nepClient)).resolves.toHaveLength(1)
    await expect(loadConfigData(nepClient, 'u1')).resolves.toMatchObject({
      chapters: [{ slug: 'K' }],
    })
  })
})
