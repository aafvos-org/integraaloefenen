import { describe, expect, it } from 'vitest'

import type {
  ChapterInfo,
  ClusterInfo,
  ParagraphInfo,
  TheoryBlockInfo,
  TopicInfo,
} from '@/lib/practice/chapter-overview'
import {
  bouwBlokBoom,
  bouwOnderwerpBoom,
  kopjesVoorSelectie,
  losSelectieOp,
  oefenIndeling,
} from '@/lib/practice/oefenen-indeling'

const hoofdstukK: ChapterInfo = {
  id: 'ck',
  slug: 'k',
  title: 'K — Voortgezette integraalrekening',
  book_part: 4,
  order_index: 12,
}
const hoofdstukH: ChapterInfo = {
  id: 'ch',
  slug: 'h11',
  title: 'H11 — Primitiveren en integralen',
  book_part: 3,
  order_index: 11,
}
const hoofdstuk12: ChapterInfo = {
  id: 'c12',
  slug: 'h12',
  title: 'H12 — Goniometrische formules',
  book_part: 3,
  order_index: 11,
}

const k0: ParagraphInfo = {
  id: 'p0',
  chapter_id: 'ck',
  slug: 'k0',
  label: 'K.0',
  title: 'Voorkennis',
  order_index: 1,
}
const k1: ParagraphInfo = {
  id: 'p1',
  chapter_id: 'ck',
  slug: 'k1',
  label: 'K.1',
  title: 'De substitutiemethode',
  order_index: 2,
}
const p12: ParagraphInfo = {
  id: 'p12',
  chapter_id: 'c12',
  slug: 'h122',
  label: '12.2',
  title: 'Formules bij symmetrie en primitiveren',
  order_index: 1,
}

const blokK0a: TheoryBlockInfo = {
  id: 'b0a',
  paragraph_id: 'p0',
  slug: 'k0a',
  letter: 'A',
  title: 'Differentiëren',
  order_index: 0,
}
const blokK0b: TheoryBlockInfo = {
  id: 'b0b',
  paragraph_id: 'p0',
  slug: 'k0b',
  letter: 'B',
  title: 'Regels voor het primitiveren',
  order_index: 1,
}
const blokK1a: TheoryBlockInfo = {
  id: 'b1a',
  paragraph_id: 'p1',
  slug: 'k1a',
  letter: 'A',
  title: 'Primitiveren en de kettingregel',
  order_index: 1,
}
const blokLeeg: TheoryBlockInfo = {
  id: 'bleeg',
  paragraph_id: 'p1',
  slug: 'k1z',
  letter: 'Z',
  title: 'Nog leeg',
  order_index: 9,
}
const blok12: TheoryBlockInfo = {
  id: 'b12',
  paragraph_id: 'p12',
  slug: 'h12b',
  letter: 'B',
  title: 'Primitiveren met verdubbelingsformules',
  order_index: 1,
}

function topic(
  slug: string,
  title: string,
  chapterId: string,
  blockId: string | null,
  order: number,
  category: TopicInfo['category'],
): TopicInfo {
  return {
    id: `t-${slug}`,
    slug,
    title,
    chapter_id: chapterId,
    order_index: order,
    category,
    theory_block_id: blockId,
  }
}

const kern = topic(
  'k1a_kern_herkennen',
  'De kern herkennen',
  'ck',
  'b1a',
  4,
  'primitiveren',
)
const ketting = topic(
  'k1a_primitiveren_ketting',
  'Primitiveren met de omgekeerde kettingregel',
  'ck',
  'b1a',
  5,
  'primitiveren',
)
const oppervlakte = topic(
  'k1a_toepassingen',
  'Oppervlakte en inhoud met de omgekeerde kettingregel',
  'ck',
  'b1a',
  6,
  'toepassingen',
)
const voorkennis = topic(
  'k0b_standaardprimitieven',
  'Standaardprimitieven',
  'ck',
  'b0b',
  1,
  'primitiveren',
)
const oud = topic('h11_machten', 'Polynoom-integralen', 'ch', null, 1, 'integralen')

function cluster(slug: string, title: string, topicId: string, order: number): ClusterInfo {
  return { id: `c-${slug}`, slug, title, topic_id: topicId, order_index: order }
}

const clusters: ClusterInfo[] = [
  cluster('k1a_differentiaal', 'Invullen met de d(…)-notatie', kern.id, 1),
  cluster('k1a_macht_kern', 'Een macht van een kern', ketting.id, 1),
  cluster('k1a_opp_inhoud', 'Oppervlakte en inhoud', oppervlakte.id, 1),
  cluster('k0b_basis', 'Basis', voorkennis.id, 1),
  cluster('h11_machten_int', 'Machten', oud.id, 1),
]

const tiles = [
  { clusterId: 'c-k1a_differentiaal' },
  { clusterId: 'c-k1a_macht_kern' },
  { clusterId: 'c-k1a_opp_inhoud' },
  { clusterId: 'c-k0b_basis' },
  { clusterId: 'c-h11_machten_int' },
]

const data = {
  chapters: [hoofdstukK, hoofdstuk12, hoofdstukH],
  paragraphs: [k1, p12, k0],
  blocks: [blokK1a, blok12, blokK0a, blokLeeg, blokK0b],
  topics: [oppervlakte, oud, kern, ketting, voorkennis],
  clusters,
  tiles,
}

describe('indeling per theorieblok', () => {
  it('staat voor leerlingen aan', () => {
    expect(oefenIndeling()).toBe('blok')
  })

  it('zet H11 vóór H12 in de lijst, niet onder oude opgaven', () => {
    const boom = bouwBlokBoom(data)
    expect(boom.hoofdstukken.map((h) => h.chapter.slug)).toEqual(['h11', 'h12', 'k'])
    expect(boom.oudeOpgaven).toEqual([])
    expect(boom.hoofdstukken.find((h) => h.chapter.slug === 'h11')!.paragrafen).toEqual([])
    const labels = boom.hoofdstukken
      .find((h) => h.chapter.slug === 'k')!
      .paragrafen.map((p) => p.label)
    expect(labels).toEqual(['K.0', 'K.1'])
  })

  it('toont K.0 A niet', () => {
    const k = bouwBlokBoom(data).hoofdstukken.find((h) => h.chapter.slug === 'k')!
    const letters = k.paragrafen.find((p) => p.slug === 'k0')!.blokken.map((b) => b.letter)
    expect(letters).toEqual(['B'])
  })

  it('maakt een blok zonder opgaven niet kiesbaar', () => {
    const k = bouwBlokBoom(data).hoofdstukken.find((h) => h.chapter.slug === 'k')!
    const leeg = k.paragrafen.find((p) => p.slug === 'k1')!.blokken.find((b) => b.slug === 'k1z')
    expect(leeg?.heeftOpgaven).toBe(false)
  })

  it('opent H11 als hoofdstuk en houdt de opgaven bij elkaar', () => {
    const sel = losSelectieOp(
      { blok: null, topic: null, cluster: null, chapter: 'h11' },
      data,
    )
    expect(sel?.soort).toBe('hoofdstuk')
    if (sel?.soort !== 'hoofdstuk') return
    expect(sel.chapter.slug).toBe('h11')
    const kopjes = kopjesVoorSelectie(sel, data.topics, data.clusters, data.tiles)
    expect(kopjes.map((k) => k.label)).toEqual(['Polynoom-integralen'])
  })

  it('zet kettingregel en oppervlakte in één lijst bij K.1 A', () => {
    const sel = losSelectieOp(
      { blok: 'k1a', topic: null, cluster: null, chapter: null },
      data,
    )
    expect(sel?.soort).toBe('blok')
    const kopjes = kopjesVoorSelectie(sel!, data.topics, data.clusters, data.tiles)
    expect(kopjes.map((k) => k.label)).toEqual([
      'De kern herkennen',
      'Primitiveren met de omgekeerde kettingregel',
      'Oppervlakte en inhoud met de omgekeerde kettingregel',
    ])
  })

  it('opent een oude topic-link op het bijbehorende blok en de juiste groep', () => {
    const sel = losSelectieOp(
      { blok: null, topic: 'k1a_kern_herkennen', cluster: null, chapter: null },
      data,
    )
    expect(sel?.soort).toBe('blok')
    if (sel?.soort !== 'blok') return
    expect(sel.blok.slug).toBe('k1a')
    expect(sel.groep.topicSlug).toBe('k1a_kern_herkennen')
  })

  it('opent een oude cluster-link op hetzelfde blok en die groep', () => {
    const sel = losSelectieOp(
      { blok: null, topic: null, cluster: 'k1a_opp_inhoud', chapter: null },
      data,
    )
    expect(sel?.soort).toBe('blok')
    if (sel?.soort !== 'blok') return
    expect(sel.blok.slug).toBe('k1a')
    expect(sel.groep.clusterSlug).toBe('k1a_opp_inhoud')
    expect(sel.groep.topicSlug).toBe('k1a_toepassingen')
  })
})

describe('oude indeling per onderwerp', () => {
  it('houdt de boom van tabs plus onderwerp in leven', () => {
    const boom = bouwOnderwerpBoom(
      [hoofdstukK],
      [kern, ketting],
      clusters.filter((c) => c.topic_id === kern.id || c.topic_id === ketting.id),
    )
    expect(boom).toHaveLength(1)
    expect(boom[0]!.onderwerpen.map((o) => o.title)).toEqual([
      'De kern herkennen',
      'Primitiveren met de omgekeerde kettingregel',
    ])
    expect(boom[0]!.onderwerpen[0]!.clusters.map((c) => c.title)).toEqual([
      'Invullen met de d(…)-notatie',
    ])
  })
})
