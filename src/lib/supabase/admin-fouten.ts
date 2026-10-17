import type { PostgrestError } from '@supabase/supabase-js'

/**
 * Logt een mislukte Supabase-actie in het admin-gedeelte en gooit er een
 * nette Nederlandse melding voor terug. `label` is waar de foutmelding in de
 * logs onder komt te staan (bijvoorbeeld 'onderwerp aanmaken'), `actie` is
 * het woord dat de beheerder op het scherm ziet (bijvoorbeeld 'Aanmaken').
 */
export function gooiAdminFout(label: string, error: PostgrestError, actie: string): never {
  console.error(`[admin] ${label} mislukt`, error.code, error.message)
  throw new Error(`${actie} is niet gelukt. Probeer het nog eens.`)
}
