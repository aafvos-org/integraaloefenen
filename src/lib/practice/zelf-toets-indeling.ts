import { verbergBlok } from '@/lib/practice/oefenen-indeling'

/**
 * De zelf-toets kiest per theorieblok. Een blok is de vragen van alle
 * onderwerpen die eraan hangen. Daarbinnen kan de leerling ook één soort
 * som (één cluster) aanvinken. Hoofdstukken zonder blokken, zoals H11,
 * blijven de oude lijst van onderwerpen.
 */

export type ToetsCluster = {
  id: string
  slug: string
  title: string
  questionCount: number
  newCount: number
  wrongCount: number
}

export type ToetsOnderwerp = {
  id: string
  title: string
  clusters: ToetsCluster[]
}

export type ToetsBlok = {
  id: string
  slug: string
  letter: string
  title: string
  /** Wat de leerling hoort, bijvoorbeeld "K.1 A Primitiveren en de kettingregel". */
  naam: string
  heeftOpgaven: boolean
  clusters: ToetsCluster[]
  onderwerpen: ToetsOnderwerp[]
}

export type ToetsParagraaf = {
  id: string
  label: string
  title: string
  blokken: ToetsBlok[]
}

export type ToetsHoofdstuk = {
  id: string
  slug: string
  title: string
  paragrafen: ToetsParagraaf[]
  /** Onderwerpen die niet aan een zichtbaar blok hangen. */
  losseOnderwerpen: ToetsOnderwerp[]
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
  title: string
  chapter_id: string
  order_index: number
  theory_block_id: string | null
}

type ClusterInvoer = ToetsCluster & {
  topic_id: string
  order_index: number
}

export type ZelfToetsIndelingInvoer = {
  chapters: HoofdstukInvoer[]
  paragraphs: ParagraafInvoer[]
  blocks: BlokInvoer[]
  topics: OnderwerpInvoer[]
  clusters: ClusterInvoer[]
}

function clustersVan(
  topicId: string,
  clusters: ClusterInvoer[],
): ToetsCluster[] {
  return clusters
    .filter((cluster) => cluster.topic_id === topicId)
    .sort((a, b) => a.order_index - b.order_index)
    .map(({ id, slug, title, questionCount, newCount, wrongCount }) => ({
      id,
      slug,
      title,
      questionCount,
      newCount,
      wrongCount,
    }))
}

function onderwerpVan(topic: OnderwerpInvoer, clusters: ClusterInvoer[]): ToetsOnderwerp {
  return {
    id: topic.id,
    title: topic.title,
    clusters: clustersVan(topic.id, clusters),
  }
}

export function bouwZelfToetsBoom(data: ZelfToetsIndelingInvoer): ToetsHoofdstuk[] {
  const paragraphById = new Map(data.paragraphs.map((p) => [p.id, p]))
  const blockById = new Map(data.blocks.map((b) => [b.id, b]))

  const hoofdstukken: ToetsHoofdstuk[] = []

  for (const chapter of [...data.chapters].sort((a, b) => a.order_index - b.order_index)) {
    const topics = data.topics
      .filter((topic) => topic.chapter_id === chapter.id)
      .sort((a, b) => a.order_index - b.order_index)

    const paragraphs = data.paragraphs
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

    if (paragraphs.length === 0) {
      hoofdstukken.push({
        id: chapter.id,
        slug: chapter.slug,
        title: chapter.title,
        paragrafen: [],
        losseOnderwerpen: topics.map((topic) => onderwerpVan(topic, data.clusters)),
      })
      continue
    }

    const paragrafen: ToetsParagraaf[] = paragraphs
      .map((paragraph) => ({
        id: paragraph.id,
        label: paragraph.label,
        title: paragraph.title,
        blokken: data.blocks
          .filter((block) => block.paragraph_id === paragraph.id)
          .filter((block) => !verbergBlok(paragraph.slug, block.letter))
          .sort((a, b) => a.order_index - b.order_index)
          .map((block) => {
            const vanBlok = topics.filter((topic) => zichtbaarBlok(topic)?.id === block.id)
            const onderwerpen = vanBlok.map((topic) => onderwerpVan(topic, data.clusters))
            const clusters = onderwerpen.flatMap((onderwerp) => onderwerp.clusters)
            return {
              id: block.id,
              slug: block.slug,
              letter: block.letter,
              title: block.title,
              naam: `${paragraph.label} ${block.letter} ${block.title}`,
              heeftOpgaven: clusters.length > 0,
              clusters,
              onderwerpen,
            }
          }),
      }))
      .filter((paragraph) => paragraph.blokken.length > 0)

    hoofdstukken.push({
      id: chapter.id,
      slug: chapter.slug,
      title: chapter.title,
      paragrafen,
      losseOnderwerpen: topics
        .filter((topic) => !zichtbaarBlok(topic) && !verborgen(topic))
        .map((topic) => onderwerpVan(topic, data.clusters)),
    })
  }

  return hoofdstukken
}

export function clusterIdsVanHoofdstuk(hoofdstuk: ToetsHoofdstuk): string[] {
  const uitBlokken = hoofdstuk.paragrafen.flatMap((paragraaf) =>
    paragraaf.blokken.flatMap((blok) => blok.clusters.map((cluster) => cluster.id)),
  )
  const uitLos = hoofdstuk.losseOnderwerpen.flatMap((onderwerp) =>
    onderwerp.clusters.map((cluster) => cluster.id),
  )
  return [...uitBlokken, ...uitLos]
}

/** Alle clusters van de onderwerpen, in de volgorde van die onderwerpen. */
export function clusterIdsVanOnderwerpen(
  topicIds: string[],
  topics: { id: string; order_index: number }[],
  clusters: { id: string; topic_id: string; order_index: number }[],
): string[] {
  const gekozen = new Set(topicIds)
  const ids: string[] = []
  for (const topic of [...topics].sort((a, b) => a.order_index - b.order_index)) {
    if (!gekozen.has(topic.id)) continue
    const vanTopic = clusters
      .filter((cluster) => cluster.topic_id === topic.id)
      .sort((a, b) => a.order_index - b.order_index)
    for (const cluster of vanTopic) ids.push(cluster.id)
  }
  return ids
}

export type ToetsResultaatGroep = {
  blockSlug: string
  chapterSlug: string
  topicSlug: string
  clusterSlug: string
}

/**
 * Link na afloop. Een som in een theorieblok gaat naar dat blok en landt
 * op de groep. Zonder blok blijft de oude link met hoofdstuk en onderwerp.
 */
export function linkNaToets(groep: ToetsResultaatGroep): string {
  const sp = new URLSearchParams()
  if (groep.blockSlug) {
    sp.set('blok', groep.blockSlug)
    if (groep.clusterSlug) sp.set('cluster', groep.clusterSlug)
  } else {
    if (groep.chapterSlug) sp.set('chapter', groep.chapterSlug)
    if (groep.topicSlug) sp.set('topic', groep.topicSlug)
    if (groep.clusterSlug) sp.set('cluster', groep.clusterSlug)
  }
  const query = sp.toString()
  return query ? `/oefenen?${query}` : '/oefenen'
}
