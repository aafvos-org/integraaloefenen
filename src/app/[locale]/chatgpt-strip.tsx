'use client'

import { useSyncExternalStore } from 'react'
import { useTranslations } from 'next-intl'

import { isChatgptHerkomst } from '@/lib/chatgpt-herkomst'
import { verwijzerDomein } from '@/lib/meten/gebeurtenis'

import { HomepageStrip } from './homepage-strip'

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
    <HomepageStrip
      titel={t('title')}
      beschrijving={t('body')}
      ctaTekst={t('cta')}
      ctaHref={'/proberen/primitieve' as '/proberen'}
      dataMeet="start-proefsom-chatgpt"
    />
  )
}
