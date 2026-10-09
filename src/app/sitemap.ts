import type { MetadataRoute } from 'next'

import { SITE_CONFIG } from '@/config/site'
import { routing } from '@/i18n/routing'
import { THEORIE_HOOFDSTUKKEN } from '@/lib/theory'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? `https://${SITE_CONFIG.domain}`

// De site is alleen Nederlands; de taal staat wel in de URL (/nl/...).
const TAAL = routing.defaultLocale

/**
 * Alleen pagina's die een leerling zonder inloggen kan lezen. Inloggen en
 * registreren horen hier niet in: robots.ts houdt die juist tegen, en dan
 * zouden de twee bestanden elkaar tegenspreken.
 *
 * De theorie-hoofdstukken komen uit THEORIE_HOOFDSTUKKEN, zodat de lijst
 * meegroeit met de inhoud en niemand hem met de hand hoeft bij te houden.
 */
function openbarePaden(): Array<{
  pad: string
  changeFrequency: 'weekly' | 'monthly'
  priority: number
}> {
  return [
    { pad: '', changeFrequency: 'weekly', priority: 1 },
    { pad: '/theorie', changeFrequency: 'monthly', priority: 0.8 },
    ...THEORIE_HOOFDSTUKKEN.map((h) => ({
      pad: `/theorie/${h.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { pad: '/uitleg-videos', changeFrequency: 'monthly', priority: 0.7 },
    { pad: '/hoe-het-werkt', changeFrequency: 'monthly', priority: 0.6 },
  ]
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return openbarePaden().map(({ pad, changeFrequency, priority }) => ({
    url: `${SITE_URL}/${TAAL}${pad}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))
}
