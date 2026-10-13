import { describe, expect, it } from 'vitest'

import {
  bouwDashboardIndeling,
  hrefVoorBlok,
  weegClusters,
  type VoortgangRij,
} from '@/lib/dashboard/indeling'

const hoofdstukK = {
  id: 'ck',
  slug: 'k',
  title: 'K — Voortgezette integraalrekening',
  order_index: 12,
}
const hoofdstukH = {
  id: 'ch',
  slug: 'h11',
  title: 'H11 — Primitiveren en integralen',
  order_index: 11,
}
const hoofdstuk12 = {
  id: 'c12',
  slug: 'h12',
  title: 'H12 — Goniometrische formules',
  order_index: 11,
}

const k0 = {
  id: 'p0',
  chapter_id: 'ck',
  slug: 'k0',
  label: 'K.0',
  title: 'Voorkennis',
  order_index: 1,
}
const k1 = {
  id: 'p1',
  chapter_id: 'ck',
  slug: 'k1',
  label: 'K.1',
  title: 'De substitutiemethode',
  order_index: 2,
}
const p12 = {
  id: 'p12',
  chapter_id: 'c12',
  slug: 'h122',
  label: '12.2',
  title: 'Verdubbelingsformules en primitiveren',
  order_index: 1,
}

const blokK0a = {
  id: 'b0a',
  paragraph_id: 'p0',
  slug: 'k0a',
  letter: 'A',
  title: 'Differentiëren',
  order_index: 0,
}
const blokK0b = {
  id: 'b0b',
  paragraph_id: 'p0',
  slug: 'k0b',
  letter: 'B',
  title: 'Regels voor het primitiveren',
  order_index: 1,
}
const blokK1a = {
  id: 'b1a',
  paragraph_id: 'p1',
  slug: 'k1a',
  letter: 'A',
  title: 'Primitiveren en de kettingregel',
  order_index: 1,
}
const blokLeeg = {
  id: 'bleeg',
  paragraph_id: 'p1',
  slug: 'k1z',
  letter: 'Z',
  title: 'Nog leeg',
  order_index: 9,
}
const blok12 = {
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
) {
  return {
    id: `t-${slug}`,
    slug,
    title,
    chapter_id: chapterId,
    order_index: order,
    theory_block_id: blockId,
  }
}

const kern = topic('k1a_kern', 'De kern herkennen', 'ck', 'b1a', 4)
const ketting = topic('k1a_ketting', 'Kettingregel', 'ck', 'b1a', 5)
const voorkennis = topic('k0b_basis', 'Standaardprimitieven', 'ck', 'b0b', 1)
const verborgen = topic('k0a_diff', 'Differentiëren', 'ck', 'b0a', 0)
const los = topic('k_los', 'Nog zonder blok', 'ck', null, 8)
const oud = topic('h11_machten', 'Polynoom-integralen', 'ch', null, 1)
const sinus = topic('h12b_sin', 'Sinus kwadraat', 'c12', 'b12', 1)

function cluster(slug: string, topicId: string, order: number) {
  return { id: `c-${slug}`, topic_id: topicId, order_index: order }
}

const clusters = [
  cluster('kern', kern.id, 1),
  cluster('ketting', ketting.id, 1),
  cluster('basis', voorkennis.id, 1),
  cluster('diff', verborgen.id, 1),
  cluster('los', los.id, 1),
  cluster('oud', oud.id, 1),
]

function rij(
  clusterId: string,
  status: string | null,
  answered: number,
  correct: number,
  skipped = false,
): VoortgangRij {
  return {
    cluster_id: clusterId,
    status,
    total_answered: answered,
    total_correct: correct,
    is_skipped: skipped,
  }
}

const voortgang: VoortgangRij[] = [
  rij('c-kern', 'mastered', 3, 3),
  rij('c-ketting', 'in_progress', 2, 1),
  rij('c-diff', 'mastered', 1, 1),
  rij('c-los', 'in_progress', 4, 1),
  rij('c-oud', 'mastered', 2, 2),
]

function indeling() {
  return bouwDashboardIndeling({
    chapters: [hoofdstukK, hoofdstuk12, hoofdstukH],
    paragraphs: [k1, p12, k0],
    blocks: [blokK1a, blok12, blokK0a, blokLeeg, blokK0b],
    topics: [oud, sinus, los, verborgen, kern, ketting, voorkennis],
    clusters,
    voortgang,
  })
}

function hoofdstuk(slug: string) {
  return indeling().hoofdstukken.find((h) => h.slug === slug)!
}

describe('dashboard per theorieblok', () => {
  it('zet H11 vóór H12 in de lijst, niet onder oude opgaven', () => {
    const boom = indeling()
    expect(boom.hoofdstukken.map((h) => h.slug)).toEqual(['h11', 'h12', 'k'])
    expect(boom.oudeOpgaven).toEqual([])
    const h11 = boom.hoofdstukken.find((h) => h.slug === 'h11')!
    expect(h11.paragrafen).toEqual([])
    expect(h11.losseOnderwerpen.map((o) => o.title)).toEqual(['Polynoom-integralen'])
    expect(boom.hoofdstukken.find((h) => h.slug === 'k')!.paragrafen.map((p) => p.label)).toEqual([
      'K.0',
      'K.1',
    ])
  })

  it('toont K.0 A niet, en houdt die cluster wel in het hoofdstukpercentage', () => {
    const k = hoofdstuk('k')
    const letters = k.paragrafen.find((p) => p.label === 'K.0')!.blokken.map((b) => b.letter)
    expect(letters).toEqual(['B'])
    expect(k.clusters.map((c) => c.id)).toContain('c-diff')
    const zichtbaar = [
      ...k.paragrafen.flatMap((p) => p.blokken.flatMap((b) => b.clusters)),
      ...k.losseOnderwerpen.flatMap((o) => o.clusters),
    ].map((c) => c.id)
    expect(zichtbaar).not.toContain('c-diff')
  })

  it('telt de onderwerpen van een blok op tot één percentage', () => {
    const blok = hoofdstuk('k').paragrafen.find((p) => p.label === 'K.1')!
      .blokken.find((b) => b.slug === 'k1a')!
    // beheerst telt als 1, 1 van 2 goed telt als 0,5 → 1,5 / 2 = 75%
    expect(weegClusters(blok.clusters)).toMatchObject({ mastered: 1, total: 2, pct: 75 })
    expect(hrefVoorBlok(blok.slug)).toBe('/oefenen?blok=k1a')
  })

  it('houdt het hoofdstukpercentage gelijk aan de som van alle clusters', () => {
    const k = hoofdstuk('k')
    const voor = weegClusters(k.clusters)
    const inBlokken = k.paragrafen.flatMap((p) => p.blokken.flatMap((b) => b.clusters))
    const inLos = k.losseOnderwerpen.flatMap((o) => o.clusters)
    const verborgenCluster = k.clusters.filter((c) => c.id === 'c-diff')
    const na = weegClusters([...inBlokken, ...inLos, ...verborgenCluster])
    expect(na.weighted).toBeCloseTo(voor.weighted)
    expect(na.total).toBe(voor.total)
    expect(na.pct).toBe(voor.pct)
    // 1 + 0,5 + 0 + 1 + 0,25 = 2,75 over 5 clusters → 55%
    expect(voor).toMatchObject({ mastered: 2, total: 5, pct: 55 })
  })

  it('laat een blok zonder opgaven staan zonder het percentage te veranderen', () => {
    const leeg = hoofdstuk('k').paragrafen.find((p) => p.label === 'K.1')!
      .blokken.find((b) => b.slug === 'k1z')
    expect(leeg?.heeftOpgaven).toBe(false)
    expect(leeg?.clusters).toEqual([])
  })

  it('houdt een onderwerp zonder blok zichtbaar', () => {
    const losse = hoofdstuk('k').losseOnderwerpen
    expect(losse.map((o) => o.slug)).toEqual(['k_los'])
    expect(weegClusters(losse[0]!.clusters).pct).toBe(25)
  })

  it('houdt de opgaven van H11 op hetzelfde percentage', () => {
    const h11 = hoofdstuk('h11')
    expect(h11.losseOnderwerpen.map((o) => o.title)).toEqual(['Polynoom-integralen'])
    expect(weegClusters(h11.clusters)).toMatchObject({
      mastered: 1,
      total: 1,
      pct: 100,
    })
  })

  it('telt een overgeslagen cluster niet als beheerst', () => {
    const boom = bouwDashboardIndeling({
      chapters: [hoofdstukK],
      paragraphs: [k0],
      blocks: [blokK0b],
      topics: [voorkennis],
      clusters: [clusters.find((c) => c.id === 'c-basis')!],
      voortgang: [rij('c-basis', 'mastered', 3, 3, true)],
    })
    const blok = boom.hoofdstukken[0]!.paragrafen[0]!.blokken[0]!
    expect(weegClusters(blok.clusters).mastered).toBe(0)
    expect(weegClusters(blok.clusters).pct).toBe(100)
  })
})
