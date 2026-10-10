/**
 * De vorm van de theorie-content, los van de inhoud van één site.
 *
 * Een content-bestand (`integralen.ts`) vult deze types; `@/lib/theory` deelt
 * ze door aan de pagina's. Zo hangt de typecontrole niet aan één site.
 *
 * Twee groepen:
 *   - de kaartenweergave: `ClusterTheory` + `OverviewChapter` en wat daaronder hangt
 *   - de methode-pagina: `Methode` + `Regel`, `Voorbeeld` en `Hoofdstuk`
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

// =============================================================================
// Methode — het vaste stappenplan als ruggengraat van de theoriepagina
// =============================================================================

export type RegelId = 'machtsregel' | 'somregel' | 'productregel' | 'quotientregel' | 'kettingregel'

export type Regel = {
  id: RegelId
  title: string
  /** Hoofdstuk waarin de regel wordt geïntroduceerd, bv. "H2" */
  chapter: string
  /** Eén regel herkenning, onder het hokje in het schema (mag `$...$` bevatten) */
  kort: string
  /** Uitgebreide herkenning voor stap 0 */
  herken: string
  /** Regelkaart (LaTeX, display mode) */
  formule: string
  /** Compacte versie zonder (x), voor in het regelhokje; twee regels gescheiden door \\implies */
  formuleKort: string
  stap1: string
  stap2: string
  stap3: string
  /** Afspraak over de vorm van het antwoord */
  antwoord: string
}

/** Eén onderdeel in stap 1 of stap 2: `naam = waarde` (beide LaTeX). */
export type Deel = {
  naam: string
  waarde: string
  /** Bij een omschrijving in `waarde`: de regel die je daarbij gebruikt (LaTeX), komt eronder te staan */
  omschrijving?: string
  /** Alleen bij afgeleides: hoe je aan deze afgeleide komt (eigen mini-schema, opent na een klik) */
  hoe?: Genest
}

/**
 * Uitwerking van een voorbeeld in stap 1 t/m 3.
 * In `ingevuld` verwijzen `{d1}`, `{d2}`, … naar de delen uit stap 1 en
 * `{a1}`, `{a2}`, … naar de afgeleides uit stap 2; die worden in het schema
 * in de kleur van hun stap ingevuld.
 */
export type Uitwerking = {
  /**
   * De functie zoals hij in stap 1 herhaald wordt, met de delen gemarkeerd:
   * `{1:…}` krijgt de kleur van het eerste deel, `{2:…}` van het tweede, enz.
   * Ontbreekt dit, dan wordt de functie zonder markering herhaald.
   */
  functie?: string
  /** Stap 1 */
  delen: Deel[]
  noot1?: string
  /** Stap 2 (leeg bij de machtsregel: die vult meteen in na stap 1) */
  afgeleiden: Deel[]
  noot2?: string
  /** Stap 3: de regel symbolisch, bv. "f'(x) = g'(x) \\cdot h(x) + g(x) \\cdot h'(x)" */
  formule?: string
  /** Stap 3: ingevuld met {d…} en {a…} */
  ingevuld: string
  /** Stap 3: herleid resultaat (LaTeX, zonder f'(x) =) */
  herleid?: string
  noot3?: string
}

/** Een genest deel: begint opnieuw bij stap 1 met zijn eigen g en h (of buitenkant en kern). */
export type Genest = {
  regel: RegelId
  /** Extra kopje, bv. "noem dit deel even $f$" (optioneel) */
  label?: string
  uitwerking: Uitwerking
}

export type Voorbeeld = {
  /** Hoofdstuk waar het voorbeeld bij hoort, bv. "H2" */
  chapter: string
  regel: RegelId
  /** Korte naam op de keuzeknop, bv. "haakjes eerst" (optioneel) */
  label?: string
  /** LaTeX, met f(x) = */
  problem: string
  /** LaTeX, met f'(x) = */
  answer: string
  /** Stap 0: wat je ziet in de buitenste schil (bron voor toelichting; wordt in het schema niet getoond) */
  stap0: string
  uitwerking: Uitwerking
}

export type HoofdstukTopic = {
  /** topics_new.slug */
  slug: string
  title: string
  /** Bij welke regel de knop "Oefen" verschijnt; null = alleen in de topiclijst */
  regel: RegelId | null
  videos?: Array<{ slug: string; label: string }>
}

export type Hoofdstuk = {
  slug: string
  code: string
  title: string
  intro: string
  /** Regels die in dit hoofdstuk actief zijn; de rest staat grijs met "vanaf H…" */
  regels: RegelId[]
  /** Wat dit hoofdstuk per regel toevoegt, getoond in het regelpaneel */
  notities?: Partial<Record<RegelId, string>>
  topics: HoofdstukTopic[]
}

export type Methode = {
  regels: Regel[]
  voorbeelden: Voorbeeld[]
  hoofdstukken: Hoofdstuk[]
}
