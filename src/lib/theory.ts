/**
 * Theorie-loader: één plek waar de pagina's de theorie-content vandaan halen.
 *
 * De content staat in `@/content/theory/integralen`, de vorm ervan in
 * `@/content/theory/types`. Consumers blijven `from '@/lib/theory'`
 * importeren — alleen de data eronder verandert.
 */

import * as integralen from '@/content/theory/integralen'
import type { Methode } from '@/content/theory/types'

export type {
  ClusterTheory,
  OverviewExample,
  OverviewTable,
  OverviewCard,
  OverviewChapter,
  Stappenplan,
  HerkenRij,
  HerkenVraag,
  Regel,
  RegelId,
  Voorbeeld,
  Hoofdstuk,
  HoofdstukTopic,
  Genest as MethodeGenest,
  Deel,
  Uitwerking,
} from '@/content/theory/types'

export const CLUSTER_THEORY = integralen.CLUSTER_THEORY
export const TOPIC_FORMULA = integralen.TOPIC_FORMULA
export const TOPIC_INTROS = integralen.TOPIC_INTROS
export const THEORY_OVERVIEW = integralen.THEORY_OVERVIEW

/** De methode (stappenplan + voorbeelden + hoofdstukken); null voor sites zonder methode-pagina. */
export const METHODE: Methode | null = integralen.METHODE

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
