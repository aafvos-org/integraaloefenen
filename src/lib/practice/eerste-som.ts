/**
 * Theorieblok K.0 B: de standaardprimitieven, te beginnen bij de machtsregel.
 * Zelfde blok als de welkomstmail.
 */
export const MACHTSREGEL_BLOK = 'k0b'

type Blok = { id: string; slug: string }
type Onderwerp = { id: string; theory_block_id: string | null; order_index: number }
type Groep = { id: string; topic_id: string; order_index: number }
type Tegel = { questionId: string; clusterId: string; difficulty: number }

/**
 * De makkelijkste som in één theorieblok: laagste moeilijkheid.
 * Bij gelijke moeilijkheid de eerste in het blok (onderwerp, dan groep,
 * dan de volgorde waarin de tegels binnenkomen — dat is de volgorde
 * op de pagina).
 */
export function makkelijksteSomInBlok(
  blokSlug: string,
  blocks: Blok[],
  topics: Onderwerp[],
  clusters: Groep[],
  tiles: Tegel[],
): string | null {
  const blok = blocks.find((b) => b.slug === blokSlug)
  if (!blok) return null

  const onderwerpVolgorde = new Map<string, number>()
  for (const topic of topics) {
    if (topic.theory_block_id === blok.id) onderwerpVolgorde.set(topic.id, topic.order_index)
  }

  const groepVolgorde = new Map<string, { onderwerp: number; groep: number }>()
  for (const cluster of clusters) {
    const onderwerp = onderwerpVolgorde.get(cluster.topic_id)
    if (onderwerp === undefined) continue
    groepVolgorde.set(cluster.id, { onderwerp, groep: cluster.order_index })
  }

  const kandidaten: {
    id: string
    difficulty: number
    onderwerp: number
    groep: number
    index: number
  }[] = []
  tiles.forEach((tile, index) => {
    const plek = groepVolgorde.get(tile.clusterId)
    if (!plek) return
    kandidaten.push({
      id: tile.questionId,
      difficulty: tile.difficulty,
      onderwerp: plek.onderwerp,
      groep: plek.groep,
      index,
    })
  })
  if (kandidaten.length === 0) return null

  kandidaten.sort((a, b) => {
    if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty
    if (a.onderwerp !== b.onderwerp) return a.onderwerp - b.onderwerp
    if (a.groep !== b.groep) return a.groep - b.groep
    return a.index - b.index
  })
  return kandidaten[0]!.id
}

/**
 * Een leerling zonder antwoord, die nog niets heeft aangeklikt, begint
 * meteen op die som. Wie al een antwoord heeft, of zelf een onderdeel
 * koos, blijft op het gewone scherm.
 */
export function eersteSomVoorLegeLeerling(input: {
  heeftAntwoord: boolean
  zelfGekozen: boolean
  vraagId: string | null
  blokSlug: string
}): { blok: string; vraagId: string } | null {
  if (input.heeftAntwoord || input.zelfGekozen || !input.vraagId) return null
  return { blok: input.blokSlug, vraagId: input.vraagId }
}
