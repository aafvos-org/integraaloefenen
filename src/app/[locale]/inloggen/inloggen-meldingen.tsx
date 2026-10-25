'use client'

import { useSearchParams } from 'next/navigation'

import { BevestigingsMelding } from './bevestigings-melding'
import { HerstelMelding } from './herstel-melding'

/**
 * Leest `?bevestigd=`, `?linkfout=`, `?error=` en `?herstel=` in de browser,
 * niet op de server. Zo blijft /nl/inloggen zelf statisch (INT-519): deze
 * zoekwoorden komen alleen voor via een link uit een mail of een mislukte
 * OAuth-aanmelding, nooit bij een gewoon bezoek.
 */
export function InloggenMeldingen() {
  const searchParams = useSearchParams()
  const bevestigd = searchParams.get('bevestigd')
  const linkfout = searchParams.get('linkfout')
  const callbackError = searchParams.get('error') === 'auth_callback_failed'
  const herstelFout = searchParams.get('herstel') === '1'

  return (
    <>
      {(bevestigd || linkfout) && <BevestigingsMelding linkFout={Boolean(linkfout)} />}
      {(callbackError || herstelFout) && <HerstelMelding kapot={herstelFout} />}
    </>
  )
}
