'use client'

import { useSyncExternalStore } from 'react'
import { useTranslations } from 'next-intl'

import { ErrorBanner, SuccessBanner } from '@/components/ui'
import { heeftLinkFout } from './link-fout'

/** De adresregel verandert op deze pagina niet meer; er valt niets te volgen. */
function geenAbonnement() {
  return () => {}
}

/** Wat de browser in het stuk achter de `#` vindt. */
type Stand = 'onbekend' | 'fout' | 'bevestigd'

/**
 * De melding bovenaan de inlogpagina na een klik op de link uit de
 * bevestigingsmail: "het is gelukt" óf "deze link werkt niet meer".
 *
 * Het verschil staat achter de `#` in de link, en dat stuk komt nooit bij de
 * server aan. Zolang de browser er nog niet naar gekeken heeft, tonen we
 * niets: liever even geen melding dan een fractie van een seconde de
 * verkeerde.
 */
export function BevestigingsMelding({ linkFout = false }: { linkFout?: boolean }) {
  const t = useTranslations('Login')
  const stand = useSyncExternalStore<Stand>(
    geenAbonnement,
    () => (heeftLinkFout(window.location.hash) ? 'fout' : 'bevestigd'),
    () => 'onbekend',
  )

  if (linkFout || stand === 'fout') {
    return <ErrorBanner className="mt-6">{t('expiredLinkNotice')}</ErrorBanner>
  }

  if (stand === 'onbekend') return null

  return <SuccessBanner className="mt-6">{t('confirmedNotice')}</SuccessBanner>
}
