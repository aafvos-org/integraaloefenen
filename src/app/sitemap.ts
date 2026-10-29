import type { MetadataRoute } from 'next'

import { SITE_CONFIG } from '@/config/site'
import { VOORBEELDEN } from '@/content/voorbeelden'
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
    { pad: '/examen-integralen', changeFrequency: 'monthly', priority: 0.7 },
    { pad: '/uitleg-videos', changeFrequency: 'monthly', priority: 0.7 },
    { pad: '/video-aanvragen', changeFrequency: 'monthly', priority: 0.6 },
    { pad: '/hoe-het-werkt', changeFrequency: 'monthly', priority: 0.6 },
    { pad: '/privacy', changeFrequency: 'monthly', priority: 0.4 },
    { pad: '/voorbeeld', changeFrequency: 'monthly', priority: 0.6 },
    ...VOORBEELDEN.map((voorbeeld) => ({
      pad: `/voorbeeld/${voorbeeld.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}

/**
 * Dag waarop de pagina voor het laatst echt veranderde (UTC).
 * Geen `new Date()`: dat zette bij elke aanvraag alles op "vandaag".
 * Theoriehoofdstukken delen één inhoudsbestand, dus één datum.
 *
 * Deze datum met de hand bijhouden ging twee keer stilzwijgend mis
 * (INT-419, INT-446): iemand paste `voorbeelden.ts` of `content/theory/` aan
 * maar vergat de datum hieronder. `sitemap.test.ts` rekent daarom een hash
 * over diezelfde inhoud uit en vergelijkt die met `*_INHOUD_HASH`. Verschilt
 * de hash, dan faalt de test en noemt hij welke datum en hash je moet
 * bijwerken — net zo lang tot deze twee weer bij de inhoud passen.
 */
const LAATST_GEWIJZIGD: Record<string, string> = {
  '': '2026-10-14',
  '/theorie': '2026-10-21',
  '/examen-integralen': '2026-10-19',
  '/uitleg-videos': '2026-10-13',
  '/video-aanvragen': '2026-10-29',
  '/hoe-het-werkt': '2026-10-10',
  '/privacy': '2026-10-13',
  '/voorbeeld': '2026-10-16',
}
const THEORIE_HOOFDSTUK_GEWIJZIGD = '2026-10-28'
const VOORBEELD_GEWIJZIGD = '2026-10-29'

/** Hash over de content die bij `THEORIE_HOOFDSTUK_GEWIJZIGD` hoort. */
export const THEORIE_HOOFDSTUK_INHOUD_HASH =
  'ca5a0d1ea2109c1674bedc655f2130cc822b40ad9e6f1406e412512da13c3550'
/** Hash over de content die bij `VOORBEELD_GEWIJZIGD` hoort. */
export const VOORBEELD_INHOUD_HASH =
  '72e6210db5250d1b31250512d4041274daa303313630708671b647fb31e314cf'

/**
 * Deterministische hash over content, voor `sitemap.test.ts`. Geen geheime
 * sleutel nodig: dit is geen beveiliging, alleen een vingerafdruk om een
 * vergeten datum te betrappen.
 */
export async function hashInhoud(data: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(data))
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function laatstGewijzigd(pad: string): Date {
  const dag = pad.startsWith('/theorie/')
    ? THEORIE_HOOFDSTUK_GEWIJZIGD
    : pad.startsWith('/voorbeeld/')
      ? VOORBEELD_GEWIJZIGD
      : LAATST_GEWIJZIGD[pad]
  return new Date(`${dag}T00:00:00.000Z`)
}

export default function sitemap(): MetadataRoute.Sitemap {
  return openbarePaden().map(({ pad, changeFrequency, priority }) => ({
    url: `${SITE_URL}/${TAAL}${pad}`,
    lastModified: laatstGewijzigd(pad),
    changeFrequency,
    priority,
  }))
}
