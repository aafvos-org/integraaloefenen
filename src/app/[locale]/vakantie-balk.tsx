'use client'

import { useSyncExternalStore } from 'react'
import { useTranslations } from 'next-intl'

import { isTerugVanVakantiePeriode } from '@/lib/vakantiebalk'

import { HomepageStrip } from './homepage-strip'

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
    <HomepageStrip
      titel={t('title')}
      ctaTekst={t('cta')}
      ctaHref={'/proberen/primitieve' as '/proberen'}
      dataMeet="start-proefsom-vakantie"
    />
  )
}
