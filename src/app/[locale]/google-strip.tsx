'use client'

import { useSyncExternalStore } from 'react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { bronUitTabblad, padNaarAanmelden } from '@/lib/bron'

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
    <div className="mb-8 rounded-xl border border-accent/30 bg-accent-light p-4 text-center">
      <p className="font-medium text-text">{t('title')}</p>
      <Link
        href={padNaarAanmelden('/proberen/primitieve', 'google') as '/proberen'}
        data-meet="google-strip-proefsom"
        className="mt-3 inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-5 text-white shadow-sm hover:bg-accent/90"
      >
        {t('cta')}
      </Link>
    </div>
  )
}
