'use client'

import { useSyncExternalStore } from 'react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
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
 * Korte strip voor bezoekers die via een YouTube-video binnenkomen
 * (`?van=youtube`, zie `src/lib/bron.ts`). Puur client-side en op de
 * querystring, zodat de openbare pagina's statisch blijven en er geen
 * cookie of meting bij komt (INT-546).
 */
export function YoutubeStrip() {
  const t = useTranslations('YoutubeStrip')
  const zichtbaar = useKomtVanYoutube()

  if (!zichtbaar) return null

  return (
    <div className="mb-8 rounded-xl border border-accent/30 bg-accent-light p-4 text-center">
      <p className="font-medium text-text">{t('title')}</p>
      <Link
        href={'/proberen/primitieve' as '/proberen'}
        data-meet="youtube-strip-proefsom"
        className="mt-3 inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-5 text-white shadow-sm hover:bg-accent/90"
      >
        {t('cta')}
      </Link>
    </div>
  )
}
