/**
 * De vorm van de theorie-content, los van de inhoud van één site.
 *
 * Een content-bestand (`integralen.ts`) vult deze types; `@/lib/theory` deelt
 * ze door aan de pagina's. Zo hangt de typecontrole niet aan één site.
 *
 * De theorie is één weergave: kaarten per hoofdstuk, gevoed door
 * `ClusterTheory` + `OverviewChapter` en wat daaronder hangt.
 */

// =============================================================================
// Kaarten — CLUSTER_THEORY en THEORY_OVERVIEW
// =============================================================================

export type ClusterTheory = {
  /** Hoofdregel als KaTeX-string. */
  rule: string
  /** Optioneel: extra korte uitleg in proza (mag inline $...$ bevatten). */
  intro?: string
  example?: {
    /** LaTeX */
    problem: string
    /** LaTeX */
    answer: string
    /** Stap-voor-stap, mag inline `$...$` bevatten */
    steps?: string[]
  }
}

export type OverviewExample = {
  problem: string
  answer: string
  steps?: string[]
  /** true = stappen zijn het vaste stappenplan en worden genummerd vanaf stap 0 */
  stappenplan?: boolean
}

export type OverviewTable = {
  headers: string[]
  rows: string[][] // cellen mogen `$...$` bevatten voor LaTeX
}

/** Eén rij uit de keuzehulp van stap 0. */
export type HerkenRij = {
  schil: string
  voorbeeld: string
  regel: string
  /** Kop waaronder deze rij valt; rijen met dezelfde groep staan in één kader. */
  groep?: string
  /** `OverviewCard.id` waar deze rij naartoe springt (en die dan openklapt). */
  kaart?: string
}

/** Het vaste stappenplan van een hoofdstuk: stap 0 (herkennen) + stap 1–3 per regel. */
export type Stappenplan = {
  intro: string
  herken: HerkenRij[]
  /** Weglaten als de stappen al in de kaarten zelf staan; scheelt een tweede tabel. */
  regels?: Array<{ regel: string; formule: string; stap1: string; stap2: string; stap3: string }>
  slot?: string
}

/** Zelftest-item: welke regel pak je bij deze functie? */
export type HerkenVraag = { problem: string; regel: string; waarom: string }

export type OverviewCard = {
  id: string
  title: string
  /** Kop waaronder deze kaart valt; opeenvolgende kaarten met dezelfde groep staan bij elkaar. */
  groep?: string
  /**
   * De vorm die je in de opgave moet herkennen (LaTeX, inline). Blijft staan als
   * de kaart dicht is, zodat je niet hoeft uit te klappen om te kiezen.
   */
  herkenpunt?: string
  /** topics_new.slug — koppelt de kaart aan een oefen-topic (knop "Oefen dit onderdeel") */
  topicSlug?: string
  formula?: string // hoofdformule (LaTeX, display mode)
  /** Afspraak over de vorm van het antwoord, één zin; mag `$...$` bevatten */
  answerNote?: string
  examples?: OverviewExample[] // problem → answer
  /** Zelftest: functies met verborgen regelkeuze */
  herken?: HerkenVraag[]
  /** Uitlegvideo's (slug uit lib/videos.ts) */
  videos?: Array<{ slug: string; label: string }>
  table?: OverviewTable
  notes?: string[] // kleine bullets onderaan; mogen `$...$` bevatten
}

export type OverviewChapter = {
  slug: string
  title: string
  /** Eén zin onder de hoofdstuktitel */
  intro?: string
  stappenplan?: Stappenplan
  cards: OverviewCard[]
}
