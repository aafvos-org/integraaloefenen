'use client'

import { useSyncExternalStore } from 'react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { isChatgptHerkomst } from '@/lib/chatgpt-herkomst'
import { verwijzerDomein } from '@/lib/meten/gebeurtenis'

function leesChatgptHerkomst(): boolean {
  const utmSource = new URLSearchParams(location.search).get('utm_source')
  const domein = verwijzerDomein(document.referrer, location.hostname)
  return isChatgptHerkomst(utmSource, domein)
}

/** Geen abonnement nodig: het adres en de verwijzer veranderen niet terwijl de pagina open staat. */
function useKomtVanChatgpt(): boolean {
  return useSyncExternalStore(
    () => () => {},
    leesChatgptHerkomst,
    () => false,
  )
}

/**
 * Een opvallende strip bovenaan de startpagina voor bezoekers die via
 * ChatGPT binnenkomen (`?utm_source=chatgpt.com` of een verwijzer vanaf een
 * ChatGPT-domein). Puur client-side: zo blijft de rest van de startpagina
 * statisch, en komt er geen cookie of meting bij.
 */
export function ChatgptStrip() {
  const t = useTranslations('ChatgptStrip')
  const zichtbaar = useKomtVanChatgpt()

  if (!zichtbaar) return null

  return (
    <div className="mb-8 rounded-xl border border-accent/30 bg-accent-light p-4 text-center">
      <p className="font-medium text-text">{t('title')}</p>
      <p className="mt-1 text-sm text-text-muted">{t('body')}</p>
      <Link
        href={'/proberen/primitieve' as '/proberen'}
        data-meet="start-proefsom-chatgpt"
        className="mt-3 inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-5 text-white shadow-sm hover:bg-accent/90"
      >
        {t('cta')}
      </Link>
    </div>
  )
}
