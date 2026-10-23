'use client'

import { useSyncExternalStore } from 'react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { isTerugVanVakantiePeriode } from '@/lib/vakantiebalk'

function leesIsVakantiePeriode(): boolean {
  return isTerugVanVakantiePeriode(new Date())
}

/** Geen abonnement nodig: de datum verandert niet terwijl de pagina open staat. */
function useIsVakantiePeriode(): boolean {
  return useSyncExternalStore(
    () => () => {},
    leesIsVakantiePeriode,
    () => false,
  )
}

/**
 * Tijdelijke balk op de startpagina (INT-456), zichtbaar van 26 oktober t/m
 * 9 november 2026: leerlingen zijn dan terug van de herfstvakantie en
 * starten toetsweken. Client-side, want openbare pagina's worden bij de
 * build klaargezet (zie open-next.config.ts) — een servercheck zou
 * vastzitten op de bouwdatum. Verdwijnt vanzelf na de periode.
 */
export function VakantieBalk() {
  const t = useTranslations('VakantieBalk')
  const zichtbaar = useIsVakantiePeriode()

  if (!zichtbaar) return null

  return (
    <div className="mb-8 rounded-xl border border-accent/30 bg-accent-light p-4 text-center">
      <p className="font-medium text-text">{t('title')}</p>
      <Link
        href={'/proberen/primitieve' as '/proberen'}
        data-meet="start-proefsom-vakantie"
        className="mt-3 inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-5 text-white shadow-sm hover:bg-accent/90"
      >
        {t('cta')}
      </Link>
    </div>
  )
}
