import { describe, expect, it } from 'vitest'

import type {
  ChapterInfo,
  ClusterInfo,
  ParagraphInfo,
  TheoryBlockInfo,
  TopicInfo,
} from '@/lib/practice/chapter-overview'
import { losSelectieOp } from '@/lib/practice/oefenen-indeling'
import {
  bouwZelfToetsBoom,
  clusterIdsVanHoofdstuk,
  clusterIdsVanOnderwerpen,
  linkNaToets,
  type ZelfToetsIndelingInvoer,
} from '@/lib/practice/zelf-toets-indeling'

const hoofdstukK: ChapterInfo = {
  id: 'ck',
  slug: 'k',
  title: 'Voortgezette integraalrekening',
  book_part: 4,
  order_index: 12,
}
const hoofdstukH: ChapterInfo = {
  id: 'ch',
  slug: 'h11',
  title: 'Primitiveren en integralen',
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

const blokK0a: TheoryBlockInfo = {
  id: 'b0a',
  paragraph_id: 'p0',
  slug: 'k0a',
  letter: 'A',
  title: 'Differentiëren',
  order_index: 0,
}
const blokK1a: TheoryBlockInfo = {
  id: 'b1a',
  paragraph_id: 'p1',
  slug: 'k1a',
  letter: 'A',
  title: 'Primitiveren en de kettingregel',
  order_index: 1,
}

function topic(
  slug: string,
  title: string,
  chapterId: string,
  blockId: string | null,
  order: number,
): TopicInfo {
  return {
    id: `t-${slug}`,
    slug,
    title,
    chapter_id: chapterId,
    order_index: order,
    category: 'primitiveren',
    theory_block_id: blockId,
  }
}

const kern = topic('k1a_kern_herkennen', 'De kern herkennen', 'ck', 'b1a', 4)
const ketting = topic(
  'k1a_primitiveren_ketting',
  'Primitiveren met de omgekeerde kettingregel',
  'ck',
  'b1a',
  5,
)
const oppervlakte = topic(
  'k1a_toepassingen',
  'Oppervlakte en inhoud met de omgekeerde kettingregel',
  'ck',
  'b1a',
  6,
)
const verborgen = topic('k0a_diff', 'Differentiëren', 'ck', 'b0a', 1)
const oud = topic('h11_machten', 'Polynoom-integralen', 'ch', null, 1)

function cluster(slug: string, title: string, topicId: string, order: number): ClusterInfo {
  return { id: `c-${slug}`, slug, title, topic_id: topicId, order_index: order }
}

const clusters: ClusterInfo[] = [
  cluster('k1a_differentiaal', 'Invullen met de d(…)-notatie', kern.id, 1),
  cluster('k1a_welke_a', 'Voor welke a lukt het?', kern.id, 2),
  cluster('k1a_macht_kern', 'Een macht van een kern', ketting.id, 1),
  cluster('k1a_opp_inhoud', 'Oppervlakte en inhoud', oppervlakte.id, 1),
  cluster('k0a_diff', 'Differentiëren', verborgen.id, 1),
  cluster('h11_machten_int', 'Machten', oud.id, 1),
]

function metTellers(lijst: ClusterInfo[]): ZelfToetsIndelingInvoer['clusters'] {
  return lijst.map((item) => ({
    ...item,
    questionCount: 2,
    newCount: 2,
    wrongCount: 0,
  }))
}

const data: ZelfToetsIndelingInvoer = {
  chapters: [hoofdstukH, hoofdstukK],
  paragraphs: [k1, k0],
  blocks: [blokK1a, blokK0a],
  topics: [oppervlakte, oud, kern, ketting, verborgen],
  clusters: metTellers(clusters),
}

const oefenData = {
  chapters: [hoofdstukH, hoofdstukK],
  paragraphs: [k1, k0],
  blocks: [blokK1a, blokK0a],
  topics: [oppervlakte, oud, kern, ketting, verborgen],
  clusters,
  tiles: clusters.map((item) => ({ clusterId: item.id })),
}

function blokK1aUitBoom() {
  const boom = bouwZelfToetsBoom(data)
  const hoofdstuk = boom.find((item) => item.slug === 'k')
  const paragraaf = hoofdstuk?.paragrafen.find((item) => item.label === 'K.1')
  return paragraaf?.blokken.find((item) => item.slug === 'k1a')
}

describe('zelf-toets per theorieblok', () => {
  it('trekt voor K.1 A dezelfde clusters als de drie onderwerpen samen', () => {
    const blok = blokK1aUitBoom()
    const vanOnderwerpen = clusterIdsVanOnderwerpen(
      [kern.id, ketting.id, oppervlakte.id],
      data.topics,
      data.clusters,
    )

    expect(blok?.clusters.map((item) => item.id)).toEqual(vanOnderwerpen)
    expect(vanOnderwerpen).toEqual([
      'c-k1a_differentiaal',
      'c-k1a_welke_a',
      'c-k1a_macht_kern',
      'c-k1a_opp_inhoud',
    ])
  })

  it('laat binnen K.1 A één soort som apart kiezen', () => {
    const blok = blokK1aUitBoom()
    const soort = blok?.clusters.find((item) => item.slug === 'k1a_opp_inhoud')

    expect(soort?.id).toBe('c-k1a_opp_inhoud')
    expect(blok?.clusters.map((item) => item.id)).toContain(soort?.id)
    expect(blok?.clusters).toHaveLength(4)
  })

  it('verbergt K.0 A en houdt H11 als onderwerpen', () => {
    const boom = bouwZelfToetsBoom(data)
    const k = boom.find((item) => item.slug === 'k')!
    const letters = k.paragrafen.flatMap((paragraaf) =>
      paragraaf.blokken.map((blok) => blok.letter),
    )
    expect(k.paragrafen.map((item) => item.label)).toEqual(['K.1'])
    expect(letters).toEqual(['A'])
    expect(clusterIdsVanHoofdstuk(k)).not.toContain('c-k0a_diff')

    const h11 = boom.find((item) => item.slug === 'h11')!
    expect(h11.paragrafen).toEqual([])
    expect(h11.losseOnderwerpen.map((item) => item.title)).toEqual(['Polynoom-integralen'])
  })

  it('stuurt de resultaatlink naar het blok en de groep van de som', () => {
    const href = linkNaToets({
      blockSlug: 'k1a',
      chapterSlug: 'k',
      topicSlug: 'k1a_toepassingen',
      clusterSlug: 'k1a_opp_inhoud',
    })
    expect(href).toBe('/oefenen?blok=k1a&cluster=k1a_opp_inhoud')

    const params = new URLSearchParams(href.slice(href.indexOf('?') + 1))
    const sel = losSelectieOp(
      {
        blok: params.get('blok'),
        topic: params.get('topic'),
        cluster: params.get('cluster'),
        chapter: params.get('chapter'),
      },
      oefenData,
    )
    expect(sel?.soort).toBe('blok')
    if (sel?.soort !== 'blok') return
    expect(sel.blok.slug).toBe('k1a')
    expect(sel.groep.clusterSlug).toBe('k1a_opp_inhoud')
    expect(sel.groep.topicSlug).toBe('k1a_toepassingen')
  })

  it('laat een oude resultaatlink met topic op hetzelfde blok uitkomen', () => {
    const oud = new URLSearchParams(
      'chapter=k&topic=k1a_kern_herkennen&cluster=k1a_differentiaal',
    )
    const sel = losSelectieOp(
      {
        blok: oud.get('blok'),
        topic: oud.get('topic'),
        cluster: oud.get('cluster'),
        chapter: oud.get('chapter'),
      },
      oefenData,
    )
    expect(sel?.soort).toBe('blok')
    if (sel?.soort !== 'blok') return
    expect(sel.blok.slug).toBe('k1a')
    expect(sel.groep.topicSlug).toBe('k1a_kern_herkennen')
    expect(sel.groep.clusterSlug).toBe('k1a_differentiaal')

    const alleenTopic = losSelectieOp(
      { blok: null, topic: 'k1a_kern_herkennen', cluster: null, chapter: null },
      oefenData,
    )
    expect(alleenTopic?.soort).toBe('blok')
    if (alleenTopic?.soort !== 'blok') return
    expect(alleenTopic.blok.slug).toBe('k1a')
    expect(alleenTopic.groep.topicSlug).toBe('k1a_kern_herkennen')
  })

  it('houdt de oude link als de som niet in een blok zit', () => {
    expect(
      linkNaToets({
        blockSlug: '',
        chapterSlug: 'h11',
        topicSlug: 'h11_machten',
        clusterSlug: 'h11_machten_int',
      }),
    ).toBe('/oefenen?chapter=h11&topic=h11_machten&cluster=h11_machten_int')
  })
})
