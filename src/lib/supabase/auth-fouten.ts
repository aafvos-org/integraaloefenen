// =====================================================================
// Wat Supabase van inloggen, registreren en wachtwoorden vindt, in het
// Nederlands.
//
// Supabase antwoordt altijd in het Engels. Elke pagina die dat zelf ging
// vertalen kende twee of drie zinnen en liet de rest doorlopen naar het rode
// kadertje op het scherm van de leerling. Hier staat die vertaling één keer,
// met een vangnet: een melding die we niet kennen gaat naar de logs en nooit
// naar de leerling.
//
// Vertaal op `code` en niet op de Engelse zin: die codes liggen vast in
// @supabase/auth-js (lib/error-codes.d.ts), de zinnen kunnen bij elke update
// van Supabase anders gaan luiden. De regels op het bericht zijn er alleen
// voor oudere servers die nog geen code meesturen.
// =====================================================================

/** Wat er aan de hand is, los van de zin die erbij hoort. */
export type AuthFoutSoort =
  | 'onjuisteInlog'
  | 'nietBevestigd'
  | 'adresBestaat'
  | 'ongeldigAdres'
  | 'zwakWachtwoord'
  | 'zelfdeWachtwoord'
  | 'mailTeSnel'
  | 'mailGrensVol'
  | 'teVeelPogingen'
  | 'linkVerlopen'
  | 'nietIngelogd'
  | 'onbekend'

export type AuthFout = {
  soort: AuthFoutSoort
  /** Hoelang de leerling nog moet wachten; 0 als Supabase dat niet zegt. */
  wachtSeconden: number
}

/** Het ruwe antwoord van Supabase, zoals `AuthError` het aanlevert. */
export type SupabaseFout = { message: string; code?: string }

/**
 * Supabase zegt op twee manieren nee met `over_email_send_rate_limit`:
 *
 * - te snel achter elkaar (`max_frequency`): "For security purposes, you can
 *   only request this after 43 seconds." Daar staat in hoelang het nog duurt.
 * - de mailgrens van het hele project is vol: "email rate limit exceeded".
 *   Dan helpt wachten ook, maar veel langer, en het ligt niet aan hem.
 */
export function herkenAuthFout(bericht: string, code?: string): AuthFout {
  const soort = (s: AuthFoutSoort): AuthFout => ({ soort: s, wachtSeconden: 0 })

  switch (code) {
    case 'invalid_credentials':
      return soort('onjuisteInlog')
    case 'email_not_confirmed':
      return soort('nietBevestigd')
    case 'user_already_exists':
    case 'email_exists':
      return soort('adresBestaat')
    case 'email_address_invalid':
      return soort('ongeldigAdres')
    case 'weak_password':
      return soort('zwakWachtwoord')
    case 'same_password':
      return soort('zelfdeWachtwoord')
    case 'over_request_rate_limit':
      return soort('teVeelPogingen')
    case 'otp_expired':
    case 'flow_state_expired':
    case 'flow_state_not_found':
      return soort('linkVerlopen')
    case 'session_not_found':
    case 'session_expired':
    case 'bad_jwt':
      return soort('nietIngelogd')
  }

  // De wachttijd staat alleen in de zin, niet in de code, dus die lezen we
  // altijd uit het bericht — ook als `over_email_send_rate_limit` meekomt.
  const seconden = Number(/after (\d+) seconds?/i.exec(bericht)?.[1])
  if (seconden > 0) return { soort: 'mailTeSnel', wachtSeconden: seconden }

  if (code === 'over_email_send_rate_limit' || /email rate limit/i.test(bericht)) {
    return soort('mailGrensVol')
  }
  if (/rate limit|too many requests/i.test(bericht)) return soort('teVeelPogingen')

  if (/invalid login credentials/i.test(bericht)) return soort('onjuisteInlog')
  if (/email not confirmed/i.test(bericht)) return soort('nietBevestigd')
  if (/already registered|already exists|already in use/i.test(bericht)) {
    return soort('adresBestaat')
  }
  if (/invalid email|email address.*invalid/i.test(bericht)) return soort('ongeldigAdres')
  if (/password should be|weak password/i.test(bericht)) return soort('zwakWachtwoord')
  if (/same password|different from the old/i.test(bericht)) {
    return soort('zelfdeWachtwoord')
  }
  if (/expired|invalid.*token/i.test(bericht)) return soort('linkVerlopen')
  if (/auth session missing|session.*not found/i.test(bericht)) {
    return soort('nietIngelogd')
  }

  return soort('onbekend')
}

/**
 * De zin voor op het scherm. Overal staat bij wat de leerling nu moet doen,
 * anders blijft hij op dezelfde knop drukken.
 */
export const AUTH_FOUT_ZINNEN: Record<AuthFoutSoort, string> = {
  onjuisteInlog: 'Onjuiste combinatie van e-mailadres en wachtwoord.',
  nietBevestigd: 'Je hebt je e-mailadres nog niet bevestigd. Kijk in je inbox.',
  adresBestaat: 'Er bestaat al een account met dit e-mailadres.',
  ongeldigAdres: 'Dit e-mailadres klopt niet. Kijk of je het goed hebt getypt.',
  zwakWachtwoord: 'Kies een sterker wachtwoord (minstens 8 tekens).',
  zelfdeWachtwoord:
    'Het nieuwe wachtwoord moet anders zijn dan je huidige wachtwoord.',
  mailTeSnel:
    'Er is net al een mail naar je verstuurd. Wacht even en probeer het daarna opnieuw.',
  mailGrensVol:
    'Er kunnen op dit moment geen mails verstuurd worden. Probeer het over een kwartier nog eens.',
  teVeelPogingen:
    'Er zijn te veel pogingen gedaan vanaf dit netwerk. Probeer het over een kwartier nog eens.',
  linkVerlopen:
    'Deze link werkt niet meer. Vraag een nieuwe mail aan en probeer het opnieuw.',
  nietIngelogd: 'Je bent niet meer ingelogd. Log opnieuw in en probeer het nog een keer.',
  onbekend: 'Er ging iets mis aan onze kant. Probeer het over een kwartier nog eens.',
}

/**
 * De Nederlandse zin bij een fout van Supabase. `waar` is het label waaronder
 * een onbekende melding in de logs komt, bijvoorbeeld 'inloggen'.
 */
export function authFoutmelding(fout: SupabaseFout, waar: string): string {
  const { soort } = herkenAuthFout(fout.message, fout.code)
  if (soort === 'onbekend') {
    console.error(`[auth ${waar}]`, fout.code ?? 'geen code', fout.message)
  }
  return AUTH_FOUT_ZINNEN[soort]
}
