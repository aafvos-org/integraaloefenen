'use client'

import posthog from 'posthog-js'

export type OefenEventNaam =
  | 'sessie_gestart'
  | 'sessie_afgerond'
  | 'vraag_getoond'
  | 'antwoord_ingediend'
  | 'hint_of_stap_bekeken'
  | 'vraag_overgeslagen'

/**
 * Vaste eigenschappen onder elke oefengebeurtenis. Uitsluitend id's en slugs,
 * zodat er nooit een naam of e-mailadres in de analytics terechtkomt.
 */
export type OefenContext = {
  onderwerp: string | null
  hoofdstuk: string | null
  vraag_id: string | null
  sessie_id: string | null
}

export type OefenEventProps = Record<string, string | number | boolean | null>

export function captureOefenEvent(
  naam: OefenEventNaam,
  context: OefenContext,
  extra?: OefenEventProps,
): void {
  if (typeof window === 'undefined' || !posthog.__loaded) return
  posthog.capture(naam, { ...context, ...extra })
}
