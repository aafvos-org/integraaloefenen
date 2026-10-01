'use client'

import posthog from 'posthog-js'

export type OefenEventNaam =
  | 'sessie_gestart'
  | 'sessie_afgerond'
  | 'vraag_getoond'
  | 'antwoord_ingediend'
  | 'hint_of_stap_bekeken'
  | 'vraag_overgeslagen'
  | 'fout_opgetreden'

/** Waar in het oefenen het vastliep. */
export type OefenFoutPlek = 'nakijken' | 'vraag_laden' | 'sessie_ophalen'

/**
 * Vaste categorieën in plaats van de foutmelding zelf: een melding kan het
 * ingetypte antwoord of een e-mailadres bevatten, deze waarden nooit.
 */
export type OefenFoutSoort =
  | 'niet_ingelogd'
  | 'vraag_niet_gevonden'
  | 'opslaan_mislukt'
  | 'serveractie_mislukt'

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

export function oefenFoutProps(plek: OefenFoutPlek, soort: OefenFoutSoort): OefenEventProps {
  return { plek, soort_fout: soort }
}
