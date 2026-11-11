'use client'

import { useSyncExternalStore } from 'react'
import { useTranslations } from 'next-intl'

import { leesBron } from '@/lib/bron'

function komtVanYoutube(): boolean {
  return leesBron(new URLSearchParams(location.search).get('van')) === 'youtube'
}

/** Geen abonnement nodig: het adres verandert niet terwijl de pagina open staat. */
function useKomtVanYoutube(): boolean {
  return useSyncExternalStore(
    () => () => {},
    komtVanYoutube,
    () => false,
  )
}

/**
 * Eén korte regel boven de proefsom voor bezoekers die via een YouTube-video
 * binnenkomen (`?van=youtube`, zie `src/lib/bron.ts`). Puur client-side en op
 * de querystring, zodat de openbare pagina's statisch blijven en er geen
 * cookie of meting bij komt (INT-546). Geen eigen knop (INT-830): de
 * proefsom staat er vlak onder.
 */
export function YoutubeStrip() {
  const t = useTranslations('YoutubeStrip')
  const zichtbaar = useKomtVanYoutube()

  if (!zichtbaar) return null

  return <p className="mb-3 text-center text-sm font-medium text-accent">{t('title')}</p>
}
