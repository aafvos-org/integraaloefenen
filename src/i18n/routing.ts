import { defineRouting } from 'next-intl/routing'

// De site is alleen Nederlands. De taal blijft in de URL staan (`/nl/...`),
// zodat bestaande links en bladwijzers blijven werken.
export const routing = defineRouting({
  locales: ['nl'] as const,
  defaultLocale: 'nl',
})

export type Locale = (typeof routing.locales)[number]
