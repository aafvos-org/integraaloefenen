'use client'

import { useSyncExternalStore } from 'react'
import { useTranslations } from 'next-intl'

import { bronUitTabblad, padNaarAanmelden } from '@/lib/bron'

import { HomepageStrip } from './homepage-strip'

/**
 * Geen abonnement nodig: de tabblad-opslag verandert niet terwijl de pagina
 * open staat. `bronUitTabblad` dekt zowel een directe `?van=google`-landing
 * als een Google-zoekresultaat zonder koppelteken — `scriptDatBronOnthoudt`
 * in `bron.ts` zet in beide gevallen dezelfde sessionStorage-waarde, al vóór
 * deze component rendert.
 */
function useKomtVanGoogle(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => bronUitTabblad() === 'google',
    () => false,
  )
}

/**
 * Korte strip voor bezoekers die via een Google-zoekresultaat binnenkomen,
 * met of zonder `?van=google` (zie `src/lib/bron.ts`). Puur client-side, zodat
 * de openbare pagina's statisch blijven en er geen cookie of meting bij komt
 * (INT-583).
 */
export function GoogleStrip() {
  const t = useTranslations('GoogleStrip')
  const zichtbaar = useKomtVanGoogle()

  if (!zichtbaar) return null

  return (
    <HomepageStrip
      titel={t('title')}
      ctaTekst={t('cta')}
      ctaHref={padNaarAanmelden('/proberen/primitieve', 'google') as '/proberen'}
      dataMeet="google-strip-proefsom"
    />
  )
}
