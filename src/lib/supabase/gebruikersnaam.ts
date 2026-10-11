import type { SupabaseClient, User } from '@supabase/supabase-js'

/**
 * Zet de gebruikersnaam die een leerling bij het registreren koos op zijn
 * profiel (INT-89).
 *
 * Bij registreren met mailbevestiging is er nog geen sessie, dus de
 * registratie kan `profiles.username` niet zelf vullen. De naam staat dan
 * alleen in `user_metadata.username`. Deze functie draait zodra er wél een
 * sessie is: bij het inwisselen van de bevestigingslink en bij het inloggen.
 *
 * - Doet niets als er geen gekozen naam is, of als het profiel al een naam
 *   heeft (een naam die de leerling later zelf koos, wordt nooit overschreven).
 * - Faalt nooit hard: is de naam intussen bezet (unieke kolom) of gaat er iets
 *   anders mis, dan blijft het profiel zoals het was en logt de server het.
 */
export async function zetGekozenGebruikersnaam(
  supabase: SupabaseClient,
  user: Pick<User, 'id' | 'user_metadata'> | null | undefined,
): Promise<'gezet' | 'overgeslagen' | 'mislukt'> {
  const gekozen =
    typeof user?.user_metadata?.username === 'string'
      ? user.user_metadata.username.trim()
      : ''
  if (!user || !gekozen) return 'overgeslagen'

  // Alleen invullen als er nog niets staat.
  const { data, error } = await supabase
    .from('profiles')
    .update({ username: gekozen })
    .eq('id', user.id)
    .is('username', null)
    .select('id')

  if (error) {
    console.error('[gebruikersnaam] kon gekozen naam niet op profiel zetten:', error.message)
    return 'mislukt'
  }
  return data && data.length > 0 ? 'gezet' : 'overgeslagen'
}
