/**
 * Theorie-loader: dispatcht naar het content-bestand van de actieve site
 * (`afgeleiden` of `integralen`), bepaald door `SITE` in `@/config/site`.
 *
 * Consumers blijven `from '@/lib/theory'` importeren — alleen de data eronder
 * verandert per site.
 */

import { SITE } from '@/config/site'

import * as afgeleiden from '@/content/theory/afgeleiden'
import * as integralen from '@/content/theory/integralen'
import type { Methode } from '@/content/theory/methode'

const SOURCE = SITE === 'integralen' ? integralen : afgeleiden

export type {
  ClusterTheory,
  OverviewExample,
  OverviewTable,
  OverviewCard,
  OverviewChapter,
  Stappenplan,
  HerkenRij,
  HerkenVraag,
} from '@/content/theory/afgeleiden'
export type {
  Regel,
  RegelId,
  Voorbeeld,
  Hoofdstuk,
  HoofdstukTopic,
  Genest as MethodeGenest,
  Deel,
  Uitwerking,
} from '@/content/theory/methode'

export const CLUSTER_THEORY = SOURCE.CLUSTER_THEORY
export const TOPIC_FORMULA = SOURCE.TOPIC_FORMULA
export const TOPIC_INTROS = SOURCE.TOPIC_INTROS
export const THEORY_OVERVIEW = SOURCE.THEORY_OVERVIEW

/** De methode (stappenplan + voorbeelden + hoofdstukken); null voor sites zonder methode-pagina. */
export const METHODE: Methode | null = SOURCE.METHODE

/** Alle hoofdstukken met theorie, voor navigatie: eerst de methode-hoofdstukken, dan de overige kaarten. */
export const THEORIE_HOOFDSTUKKEN: Array<{ slug: string; code: string; title: string }> = [
  ...(METHODE?.hoofdstukken ?? []).map((h) => ({ slug: h.slug, code: h.code, title: h.title })),
  ...THEORY_OVERVIEW.filter((ch) => !(METHODE?.hoofdstukken ?? []).some((h) => h.slug === ch.slug)).map((ch) => ({
    slug: ch.slug,
    code: ch.slug.toUpperCase(),
    // "H2 — …" en "K.3 — …" worden beide tot de kale titel teruggebracht
    title: ch.title.replace(/^[A-Z]\.?\d+(?:\.\d+)?\s*[—–-]\s*/, ''),
  })),
].sort((a, b) => Number(a.slug.replace(/\D/g, '')) - Number(b.slug.replace(/\D/g, '')))
