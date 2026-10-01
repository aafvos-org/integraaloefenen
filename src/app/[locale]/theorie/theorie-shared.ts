import type { getTranslations } from 'next-intl/server'

import { METHODE, THEORIE_HOOFDSTUKKEN } from '@/lib/theory'

import type { SchemaLabels } from './methode-schema'
import type { TheorieNavItem } from './theorie-layout'

type T = Awaited<ReturnType<typeof getTranslations<'Theorie'>>>

export function theorieNavItems(t: T): TheorieNavItem[] {
  return [
    { slug: null, code: null, label: t('methodeTab') },
    ...THEORIE_HOOFDSTUKKEN.map((h) => {
      const m = METHODE?.hoofdstukken.find((x) => x.slug === h.slug)
      const sub = m ? METHODE!.regels.filter((r) => m.regels.includes(r.id)).map((r) => r.title) : undefined
      return { slug: h.slug, code: h.code, label: h.title, sub }
    }),
  ]
}

export function layoutLabels(t: T) {
  return {
    chapterLabel: t('chapterLabel'),
    collapseSidebar: t('collapseSidebar'),
    expandSidebar: t('expandSidebar'),
  }
}

export function schemaLabels(t: T): SchemaLabels {
  return {
    stap0Title: t('schemaStap0Title'),
    stap0Generic: t('schemaStap0Generic'),
    stap1Title: t('schemaStap1'),
    stap2Title: t('schemaStap2'),
    stap3Title: t('schemaStap3'),
    generic1: t('schemaGeneric1'),
    generic2: t('schemaGeneric2'),
    generic3: t('schemaGeneric3'),
    vanaf: t('vanaf', { chapter: '{chapter}' }),
    kiesVoorbeeld: t('kiesVoorbeeld'),
    antwoord: t('antwoord'),
    herken: t('herkenLabel'),
    antwoordvorm: t('answerNoteLabel'),
    inDitHoofdstuk: t('inDitHoofdstuk'),
    oefen: t('oefen'),
    video: t('videoLabel'),
    wisSelectie: t('wisSelectie'),
    toonGenest: t('toonGenest'),
  }
}

/** Labels voor de oude kaartenweergave (hoofdstukken zonder methode-data, en de integralen-site). */
export function kaartLabels(t: T) {
  return {
    h1: t('h1'),
    chapterLabel: t('chapterLabel'),
    collapseSidebar: t('collapseSidebar'),
    expandSidebar: t('expandSidebar'),
    exampleLabel: t('example'),
    detailsLabel: t('detailsLabel'),
    stepLabel: t('step', { n: '{n}' }),
    practiceTopicLabel: t('practiceTopicLink'),
    stappenplanTitle: t('stappenplanTitle'),
    stap0Title: t('stap0Title'),
    herkenSchil: t('herkenSchil'),
    herkenVoorbeeld: t('herkenVoorbeeld'),
    herkenRegel: t('herkenRegel'),
    regelsTitle: t('regelsTitle'),
    answerNoteLabel: t('answerNoteLabel'),
    herkenQuestion: t('herkenQuestion'),
    revealLabel: t('revealLabel'),
    videoLabel: t('videoLabel'),
  }
}

/** "H2 — De afgeleide functie" → "De afgeleide functie"; ook "K.3 — Cyclometrische functies" */
export function stripChapterCode(title: string): string {
  return title.replace(/^[A-Z]\.?\d+(?:\.\d+)?\s*[—–-]\s*/, '')
}

/** `?vb=2` → 2; alles anders → null */
export function parseVb(raw: string | undefined): number | null {
  if (!raw) return null
  const n = Number(raw)
  return Number.isInteger(n) && n >= 0 ? n : null
}

/** `?hoe=1,0` → [1, 0]; alles anders → null */
export function parseHoePad(raw: string | undefined): number[] | null {
  if (!raw) return null
  const pad = raw.split(/[,.]/).map(Number)
  return pad.every((n) => Number.isInteger(n) && n >= 0) ? pad : null
}
