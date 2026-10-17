/**
 * De schuilnaam van een ingelogde leerling.
 *
 * HMAC-SHA256 over het user_id, met een geheim dat alleen als Worker-secret
 * bestaat (`MEET_SCHUILNAAM_GEHEIM`). Van de uitkomst bewaren we de eerste
 * 16 tekens. Zonder dat geheim is de schuilnaam niet terug te rekenen naar
 * een account, en twee sites met een ander geheim geven een andere schuilnaam.
 *
 * Waarom een HMAC en geen gewone hash: het aantal accounts is klein genoeg om
 * alle user_id's af te lopen als er geen sleutel in zit. Met een sleutel kan
 * dat niet.
 *
 * Het user_id zelf komt nooit in de tabel te staan, en het geheim komt nooit
 * in een log of in een foutmelding.
 *
 * Dezelfde berekening staat in SQL in migratie 0078
 * (`public.meet_schuilnaam`), zodat de analist zijn voortgangscijfers aan
 * dezelfde schuilnaam kan hangen. Verander je er één, verander dan allebei.
 */

/** Zoveel tekens van de hexadecimale HMAC bewaren we. */
export const SCHUILNAAM_LENGTE = 16

export async function schuilnaamVoor(
  userId: string,
  geheim: string,
): Promise<string | null> {
  if (!userId || !geheim) return null

  const sleutel = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(geheim),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const handtekening = await crypto.subtle.sign(
    'HMAC',
    sleutel,
    new TextEncoder().encode(userId),
  )

  return Array.from(new Uint8Array(handtekening))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, SCHUILNAAM_LENGTE)
}
