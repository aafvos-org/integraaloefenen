import type { MetadataRoute } from 'next'

import { SITE_CONFIG } from '@/config/site'
import { AFGESCHERMD, ZONDER_TAAL } from '@/i18n/paths'
import { routing } from '@/i18n/routing'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? `https://${SITE_CONFIG.domain}`

// De site is alleen Nederlands; de taal staat wel in de URL (/nl/...).
const TAAL = routing.defaultLocale

export default function robots(): MetadataRoute.Robots {
  // Persoonlijke en admin-pagina's niet in de index. De paden komen uit
  // src/i18n/paths.ts, zodat een nieuwe pagina hier niet vergeten wordt.
  //
  // Elk afgeschermd pad staat er twee keer in: één keer met de taal vooraan
  // (/nl/oefenen, de echte pagina) en één keer zonder (/oefenen, dezelfde
  // pagina zonder /nl/ ervoor). Zonder de eerste blokkeert robots.txt niets
  // van wat er werkelijk staat; zonder de tweede loopt een zoekmachine telkens
  // tegen een doorverwijzing aan.
  const disallow = [
    ...ZONDER_TAAL.map((pad) => `/${pad}`),
    ...AFGESCHERMD.map((pad) => `/${TAAL}/${pad}`),
    ...AFGESCHERMD.map((pad) => `/${pad}`),
  ]

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
