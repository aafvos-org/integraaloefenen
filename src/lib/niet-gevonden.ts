import type { Metadata } from 'next'

import { SITE_CONFIG } from '@/config/site'

export const NIET_GEVONDEN_TITEL = `Pagina niet gevonden · ${SITE_CONFIG.domain}`

/**
 * Eigen omschrijving, niet die van de startpagina. Een verzonnen adres mag
 * in een zoekmachine niet hetzelfde verhaal vertellen als de voorpagina.
 */
export const NIET_GEVONDEN_OMSCHRIJVING =
  'Deze pagina bestaat niet. Controleer het adres, of ga terug naar de startpagina.'

export const nietGevondenMetadata: Metadata = {
  title: { absolute: NIET_GEVONDEN_TITEL },
  description: NIET_GEVONDEN_OMSCHRIJVING,
  robots: { index: false, follow: false },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    siteName: SITE_CONFIG.domain,
    title: NIET_GEVONDEN_TITEL,
    description: NIET_GEVONDEN_OMSCHRIJVING,
  },
}
