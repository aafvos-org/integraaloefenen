/**
 * Theorie-loader: één plek waar de pagina's de theorie-content vandaan halen.
 *
 * De content staat in `@/content/theory/integralen`, de vorm ervan in
 * `@/content/theory/types`. Consumers blijven `from '@/lib/theory'`
 * importeren — alleen de data eronder verandert.
 */

import * as integralen from '@/content/theory/integralen'

export type {
  ClusterTheory,
  Oefenlink,
  OverviewExample,
  OverviewTable,
  OverviewCard,
  OverviewChapter,
  Stappenplan,
  HerkenRij,
  HerkenVraag,
} from '@/content/theory/types'

export const CLUSTER_THEORY = integralen.CLUSTER_THEORY
export const TOPIC_FORMULA = integralen.TOPIC_FORMULA
export const TOPIC_INTROS = integralen.TOPIC_INTROS
export const THEORY_OVERVIEW = integralen.THEORY_OVERVIEW

/** Alle hoofdstukken met theorie, voor de navigatie. */
export const THEORIE_HOOFDSTUKKEN: Array<{ slug: string; code: string; title: string }> = THEORY_OVERVIEW.map(
  (ch) => ({
    slug: ch.slug,
    code: ch.code ?? ch.slug.toUpperCase(),
    // "H2 — …" en "K.3 — …" worden beide tot de kale titel teruggebracht
    title: ch.title.replace(/^[A-Z]\.?\d+(?:\.\d+)?\s*[—–-]\s*/, ''),
  }),
).sort((a, b) => Number(a.slug.replace(/\D/g, '')) - Number(b.slug.replace(/\D/g, '')))
