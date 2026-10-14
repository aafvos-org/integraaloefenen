/**
 * Aanmelden met Google (INT-249).
 *
 * De knop staat er pas als de vlag bij de build aan staat. Next.js bakt
 * `NEXT_PUBLIC_*` in tijdens de build, dus aanzetten in de omgeving van de
 * site werkt pas na een nieuwe build.
 */

const STANDAARD_VOLGENDE = '/nl/dashboard'

type Meta = Record<string, unknown> | null | undefined

export type GebruikerVoorGoogle = {
  app_metadata?: { provider?: string } | null
  identities?: { provider?: string }[] | null
  user_metadata?: Meta
}

/** Alleen de letter `1` telt. Iets anders laat de knop weg. */
export function googleLoginAan(): boolean {
  return process.env.NEXT_PUBLIC_GOOGLE_LOGIN === '1'
}

export function komtVanGoogle(user: GebruikerVoorGoogle | null | undefined): boolean {
  if (!user) return false
  if (user.app_metadata?.provider === 'google') return true
  return (user.identities ?? []).some((id) => id.provider === 'google')
}

/**
 * Eerste keer via Google, en er is nog geen gebruikersnaam.
 * Wie de vraag al beantwoord heeft (ook door het veld leeg te laten) krijgt
 * hem niet opnieuw. Een naam op het profiel of in de aanmeldgegevens telt ook.
 */
export function moetGebruikersnaamVragen(
  user: GebruikerVoorGoogle | null | undefined,
  profielNaam: string | null | undefined,
): boolean {
  if (!komtVanGoogle(user)) return false
  if (user?.user_metadata?.gebruikersnaam_gevraagd === true) return false
  const gekozen =
    typeof user?.user_metadata?.username === 'string' ? user.user_metadata.username.trim() : ''
  if (gekozen) return false
  if (typeof profielNaam === 'string' && profielNaam.trim()) return false
  return true
}

/**
 * Alleen een pad op deze site, met de taal vooraan. Iets anders (een andere
 * site, de naam-pagina zelf) wordt het dashboard, zodat een link niemand
 * weg kan sturen.
 */
export function veiligeVolgende(waarde: string | null | undefined): string {
  if (!waarde) return STANDAARD_VOLGENDE
  if (waarde !== '/nl' && !waarde.startsWith('/nl/')) return STANDAARD_VOLGENDE
  if (waarde.includes('\\') || waarde.includes('://') || waarde.includes('//')) {
    return STANDAARD_VOLGENDE
  }
  if (
    waarde === '/nl/gebruikersnaam' ||
    waarde.startsWith('/nl/gebruikersnaam/') ||
    waarde.startsWith('/nl/gebruikersnaam?')
  ) {
    return STANDAARD_VOLGENDE
  }
  if (waarde === '/nl') return STANDAARD_VOLGENDE
  return waarde
}
