'use client'

import { useSyncExternalStore } from 'react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { ErrorBanner } from '@/components/ui'

import { heeftLinkFout } from './link-fout'

/** De adresregel verandert op deze pagina niet meer; er valt niets te volgen. */
function geenAbonnement() {
  return () => {}
}

/** Wat de browser in het stuk achter de `#` vindt. */
type Stand = 'onbekend' | 'fout' | 'geenFout'

/**
 * De melding bovenaan de inlogpagina na een klik op een verlopen of al
 * gebruikte link uit de mail *wachtwoord vergeten*.
 *
 * Supabase zet de reden van zo'n geweigerde link achter een `#`, en dat stuk
 * komt nooit bij de server aan — daarom kijkt deze pagina er zelf naar. Stuurt
 * de callback de mislukking juist wél in de adresregel mee (`kapot`), dan is
 * de melding meteen duidelijk. Zonder fout in de link tonen we de gewone
 * inlogfoutmelding.
 */
export function HerstelMelding({ kapot = false }: { kapot?: boolean }) {
  const t = useTranslations('Login')
  const stand = useSyncExternalStore<Stand>(
    geenAbonnement,
    () => (heeftLinkFout(window.location.hash) ? 'fout' : 'geenFout'),
    () => 'onbekend',
  )

  if (kapot || stand === 'fout') {
    return (
      <ErrorBanner className="mt-6">
        {t('expiredResetNotice')}{' '}
        <Link
          href="/wachtwoord-vergeten"
          className="font-medium text-accent-2 underline"
        >
          {t('requestNewResetLink')}
        </Link>
        .
      </ErrorBanner>
    )
  }

  if (stand === 'onbekend') return null

  return <ErrorBanner className="mt-6">{t('callbackError')}</ErrorBanner>
}