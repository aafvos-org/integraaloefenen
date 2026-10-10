import type { getTranslations } from 'next-intl/server'

import { THEORIE_HOOFDSTUKKEN } from '@/lib/theory'

import type { TheorieNavItem } from './theorie-layout'

type T = Awaited<ReturnType<typeof getTranslations<'Theorie'>>>

export function theorieNavItems(): TheorieNavItem[] {
  return THEORIE_HOOFDSTUKKEN.map((h) => ({ slug: h.slug, code: h.code, label: h.title }))
}

export function layoutLabels(t: T) {
  return {
    chapterLabel: t('chapterLabel'),
    collapseSidebar: t('collapseSidebar'),
    expandSidebar: t('expandSidebar'),
  }
}

/** Labels voor de kaartenweergave van de theorie. */
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
