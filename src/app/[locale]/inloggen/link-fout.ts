/**
 * Heeft Supabase de bevestiging geweigerd?
 *
 * Een mislukte bevestiging (link verlopen of al een keer gebruikt) komt terug
 * als `#error=access_denied&error_code=otp_expired&error_description=...`.
 * Dat stuk achter de `#` stuurt de browser nooit naar de server mee, dus kan
 * alleen de browser zelf zien dat de link stuk was.
 */
export function heeftLinkFout(hash: string): boolean {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  return Boolean(params.get('error') ?? params.get('error_code'))
}
