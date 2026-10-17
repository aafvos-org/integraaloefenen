import type { Metadata } from 'next'

import { SITE_CONFIG } from '@/config/site'
import { OPENBAAR } from '@/i18n/paths'

/**
 * Alles wat een openbare pagina over zichzelf moet vertellen: het eigen adres
 * voor zoekmachines (de "canonical") en het kaartje dat verschijnt als iemand
 * de pagina deelt in WhatsApp of op social media (de og:-regels).
 *
 * Allebei stonden ze eerst in src/app/[locale]/layout.tsx, en een layout weet
 * niet op welke pagina hij staat. Daardoor riep elke pagina dat ze de
 * startpagina was: geen enkele andere pagina kwam los in de index, en onder een
 * gedeelde link naar /nl/theorie stond het adres en het verhaal van de
 * startpagina. Daarom geeft elke openbare pagina het nu zelf op.
 *
 * Het moet in één keer, want Next.js vervangt `openGraph` in zijn geheel zodra
 * een pagina hem zet (node_modules/next/dist/docs/01-app/03-api-reference/
 * 04-functions/generate-metadata.md, kopje "Merging"). Zou een pagina alleen
 * `url` meegeven, dan was ze meteen ook de titel, de omschrijving en de
 * sitenaam uit de layout kwijt. Daarom levert dit hulpstukje het hele blok.
 *
 * Het pad begint met een schuine streep en heeft de taal niet vooraan:
 * pad '/theorie' wordt /nl/theorie. De startpagina geeft geen pad mee. Het
 * domein komt uit metadataBase in de layout.
 *
 * De layout zet standaard noindex. Alleen paden uit OPENBAAR (en de
 * startpagina) mogen in de index. Next.js vervangt `robots` in zijn geheel,
 * dus dit blok moet index én follow zelf zetten.
 */
export function eigenPagina({
  locale,
  pad = '',
  titel,
  kaartTitel,
  omschrijving,
}: {
  locale: string
  /** Het pad onder de taal, met schuine streep vooraan. Leeg op de startpagina. */
  pad?: string
  /**
   * De titel in het tabblad. Laat hem weg op de startpagina: die houdt de
   * titel uit de layout.
   */
  titel?: string
  /** De titel op het deelkaartje. Standaard dezelfde als `titel`. */
  kaartTitel?: string
  omschrijving: string
}): Metadata {
  const adres = `/${locale}${pad}`
  const eerste = pad.replace(/^\//, '').split('/')[0] ?? ''
  const openbaar =
    pad === '' || (OPENBAAR as readonly string[]).includes(eerste)

  return {
    ...(titel ? { title: titel } : {}),
    description: omschrijving,
    robots: openbaar
      ? { index: true, follow: true }
      : { index: false, follow: false },
    alternates: { canonical: adres },
    openGraph: {
      type: 'website',
      locale: 'nl_NL',
      url: adres,
      siteName: SITE_CONFIG.domain,
      title: kaartTitel ?? titel,
      description: omschrijving,
    },
  }
}
