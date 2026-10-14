import { vergelijkHoofdstukVolgorde, verbergBlok } from '@/lib/practice/oefenen-indeling'

/**
 * Voortgang op het dashboard: per hoofdstuk, paragraaf en theorieblok.
 *
 * Het percentage is dezelfde gewogen som als eerst per onderwerp, nu één
 * laag hoger opgeteld. Elke cluster telt precies één keer mee in het
 * hoofdstuk, zodat een leerling geen procenten verliest.
 */

export type ClusterVoortgang = {
  id: string
  totalAnswered: number
  totalCorrect: number
  isKnown: boolean
  isSkipped: boolean
}

export type VoortgangRij = {
  cluster_id: string
  status: string | null
  total_answered: number | null
  total_correct: number | null
  is_skipped: boolean | null
  correct_streak?: number | null
}

/** Onderdeel met 1 of 2 goed op rij, nog niet beheerst. */
export type BijnaBeheerst = {
  naam: string
  href: string
  reeks: 1 | 2
}

export function titelZonderCode(slug: string, title: string): string {
  const code = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const rest = title.replace(new RegExp(`^${code}\\s*[—–-]\\s*`, 'i'), '')
  return rest || title
}

/**
 * Eén onderdeel om naar terug te komen: hoogste reeks (1 of 2), bij gelijkspel
 * de meeste antwoorden. Beheerst of overgeslagen telt niet.
 */
export function kiesBijnaBeheerst(input: {
  chapters: { id: string; slug: string }[]
  topics: { id: string; slug: string; title: string; chapter_id: string }[]
  clusters: { id: string; slug: string; title: string; topic_id: string }[]
  voortgang: VoortgangRij[]
}): BijnaBeheerst | null {
  const chapterSlug = new Map(input.chapters.map((c) => [c.id, c.slug]))
  const topicById = new Map(input.topics.map((t) => [t.id, t]))
  const clusterById = new Map(input.clusters.map((c) => [c.id, c]))

  let beste: { reeks: 1 | 2; antwoorden: number; naam: string; href: string } | null = null

  for (const rij of input.voortgang) {
    const reeks = rij.correct_streak ?? 0
    if (reeks !== 1 && reeks !== 2) continue
    if (rij.status === 'mastered' || rij.is_skipped === true) continue

    const cluster = clusterById.get(rij.cluster_id)
    if (!cluster) continue
    const topic = topicById.get(cluster.topic_id)
    if (!topic) continue
    const hoofdstuk = chapterSlug.get(topic.chapter_id)
    if (!hoofdstuk) continue

    const antwoorden = rij.total_answered ?? 0
    const wint =
      !beste ||
      reeks > beste.reeks ||
      (reeks === beste.reeks && antwoorden > beste.antwoorden)
    if (!wint) continue

    beste = {
      reeks,
      antwoorden,
      naam: titelZonderCode(cluster.slug, cluster.title),
      href: hrefVoorOnderwerp(hoofdstuk, topic.slug),
    }
  }

  if (!beste) return null
  return { naam: beste.naam, href: beste.href, reeks: beste.reeks }
}

export type BlokRij = {
  id: string
  slug: string
  letter: string
  title: string
  heeftOpgaven: boolean
  clusters: ClusterVoortgang[]
}

export type ParagraafRij = {
  id: string
  label: string
  title: string
  blokken: BlokRij[]
}

export type OnderwerpRij = {
  id: string
  slug: string
  title: string
  chapterSlug: string
  clusters: ClusterVoortgang[]
}

export type NieuwHoofdstuk = {
  id: string
  slug: string
  title: string
  paragrafen: ParagraafRij[]
  /** Alle clusters van dit hoofdstuk, ook van een verborgen blok. */
  clusters: ClusterVoortgang[]
  /** Onderwerpen die niet aan een zichtbaar blok hangen. */
  losseOnderwerpen: OnderwerpRij[]
}

export type OudHoofdstuk = {
  id: string
  slug: string
  title: string
  onderwerpen: OnderwerpRij[]
}

export type DashboardIndeling = {
  hoofdstukken: NieuwHoofdstuk[]
  oudeOpgaven: OudHoofdstuk[]
}

type HoofdstukInvoer = {
  id: string
  slug: string
  title: string
  order_index: number
}

type ParagraafInvoer = {
  id: string
  chapter_id: string
  slug: string
  label: string
  title: string
  order_index: number
}

type BlokInvoer = {
  id: string
  paragraph_id: string
  slug: string
  letter: string
  title: string
  order_index: number
}

type OnderwerpInvoer = {
  id: string
  slug: string
  title: string
  chapter_id: string
  order_index: number
  theory_block_id: string | null
}

type ClusterInvoer = {
  id: string
  topic_id: string
  order_index: number
}

export function weegClusters(clusters: ClusterVoortgang[]) {
  const mastered = clusters.filter((c) => c.isKnown).length
  const total = clusters.length
  const weighted = clusters.reduce((sum, c) => {
    if (c.isKnown) return sum + 1
    if (c.totalAnswered > 0) return sum + c.totalCorrect / c.totalAnswered
    return sum
  }, 0)
  const pct = total > 0 ? Math.round((weighted / total) * 100) : 0
  return { mastered, total, weighted, pct }
}

export function hrefVoorBlok(slug: string): string {
  return `/oefenen?blok=${encodeURIComponent(slug)}`
}

export function hrefVoorOnderwerp(chapterSlug: string, topicSlug: string): string {
  return `/oefenen?chapter=${encodeURIComponent(chapterSlug)}&topic=${encodeURIComponent(topicSlug)}`
}

function clusterVan(
  cluster: ClusterInvoer,
  voortgang: Map<string, VoortgangRij>,
): ClusterVoortgang {
  const rij = voortgang.get(cluster.id)
  const isSkipped = rij?.is_skipped === true
  return {
    id: cluster.id,
    totalAnswered: rij?.total_answered ?? 0,
    totalCorrect: rij?.total_correct ?? 0,
    isKnown: !isSkipped && rij?.status === 'mastered',
    isSkipped,
  }
}

export function bouwDashboardIndeling(input: {
  chapters: HoofdstukInvoer[]
  paragraphs: ParagraafInvoer[]
  blocks: BlokInvoer[]
  topics: OnderwerpInvoer[]
  clusters: ClusterInvoer[]
  voortgang: VoortgangRij[]
}): DashboardIndeling {
  const voortgang = new Map(input.voortgang.map((rij) => [rij.cluster_id, rij]))
  const paragraphById = new Map(input.paragraphs.map((p) => [p.id, p]))
  const blockById = new Map(input.blocks.map((b) => [b.id, b]))

  const clustersPerTopic = new Map<string, ClusterInvoer[]>()
  for (const cluster of input.clusters) {
    const lijst = clustersPerTopic.get(cluster.topic_id) ?? []
    lijst.push(cluster)
    clustersPerTopic.set(cluster.topic_id, lijst)
  }

  function clustersVan(topicId: string): ClusterVoortgang[] {
    return (clustersPerTopic.get(topicId) ?? [])
      .slice()
      .sort((a, b) => a.order_index - b.order_index)
      .map((cluster) => clusterVan(cluster, voortgang))
  }

  function onderwerpRij(topic: OnderwerpInvoer, chapterSlug: string): OnderwerpRij {
    return {
      id: topic.id,
      slug: topic.slug,
      title: topic.title,
      chapterSlug,
      clusters: clustersVan(topic.id),
    }
  }

  const hoofdstukken: NieuwHoofdstuk[] = []
  const oudeOpgaven: OudHoofdstuk[] = []

  for (const chapter of [...input.chapters].sort(vergelijkHoofdstukVolgorde)) {
    const topics = input.topics
      .filter((topic) => topic.chapter_id === chapter.id)
      .sort((a, b) => a.order_index - b.order_index)
    if (topics.length === 0) continue

    const paragraphs = input.paragraphs
      .filter((p) => p.chapter_id === chapter.id)
      .sort((a, b) => a.order_index - b.order_index)

    const zichtbaarBlok = (topic: OnderwerpInvoer): BlokInvoer | null => {
      if (!topic.theory_block_id) return null
      const block = blockById.get(topic.theory_block_id)
      if (!block) return null
      const paragraph = paragraphById.get(block.paragraph_id)
      if (!paragraph || paragraph.chapter_id !== chapter.id) return null
      if (verbergBlok(paragraph.slug, block.letter)) return null
      return block
    }

    const verborgen = (topic: OnderwerpInvoer): boolean => {
      if (!topic.theory_block_id) return false
      const block = blockById.get(topic.theory_block_id)
      if (!block) return false
      const paragraph = paragraphById.get(block.paragraph_id)
      if (!paragraph || paragraph.chapter_id !== chapter.id) return false
      return verbergBlok(paragraph.slug, block.letter)
    }

    const paragrafen: ParagraafRij[] = paragraphs
      .map((paragraph) => ({
        id: paragraph.id,
        label: paragraph.label,
        title: paragraph.title,
        blokken: input.blocks
          .filter((block) => block.paragraph_id === paragraph.id)
          .filter((block) => !verbergBlok(paragraph.slug, block.letter))
          .sort((a, b) => a.order_index - b.order_index)
          .map((block) => {
            const vanBlok = topics.filter((topic) => zichtbaarBlok(topic)?.id === block.id)
            const clusters = vanBlok.flatMap((topic) => clustersVan(topic.id))
            return {
              id: block.id,
              slug: block.slug,
              letter: block.letter,
              title: block.title,
              heeftOpgaven: clusters.length > 0,
              clusters,
            }
          }),
      }))
      .filter((paragraph) => paragraph.blokken.length > 0)

    if (paragraphs.length === 0) {
      hoofdstukken.push({
        id: chapter.id,
        slug: chapter.slug,
        title: chapter.title,
        paragrafen: [],
        clusters: topics.flatMap((topic) => clustersVan(topic.id)),
        losseOnderwerpen: topics.map((topic) => onderwerpRij(topic, chapter.slug)),
      })
      continue
    }

    if (paragrafen.length === 0) {
      oudeOpgaven.push({
        id: chapter.id,
        slug: chapter.slug,
        title: chapter.title,
        onderwerpen: topics.map((topic) => onderwerpRij(topic, chapter.slug)),
      })
      continue
    }

    hoofdstukken.push({
      id: chapter.id,
      slug: chapter.slug,
      title: chapter.title,
      paragrafen,
      clusters: topics.flatMap((topic) => clustersVan(topic.id)),
      losseOnderwerpen: topics
        .filter((topic) => !zichtbaarBlok(topic) && !verborgen(topic))
        .map((topic) => onderwerpRij(topic, chapter.slug)),
    })
  }

  return { hoofdstukken, oudeOpgaven }
}
