import type { SupabaseClient, User } from '@supabase/supabase-js'

import { leesBron } from '@/lib/bron'

/**
 * Zet de bron uit de aanmeldlink op het profiel (INT-240).
 *
 * Bij registreren met mailbevestiging staat de bron eerst alleen in
 * `user_metadata.bron`. Deze functie draait zodra er een sessie is: bij het
 * inwisselen van de bevestigingslink en bij het inloggen. Zo blijft de bron
 * staan als de mail op een andere telefoon wordt geopend. Geen cookie.
 *
 * - Doet niets als er geen toegestane bron is, of als het profiel er al een
 *   heeft (een latere link overschrijft de eerste niet).
 * - Faalt nooit hard: ontbreekt de kolom nog of gaat er iets mis, dan blijft
 *   het profiel zoals het was en logt de server het.
 */
export async function zetGekozenBron(
  supabase: SupabaseClient,
  user: Pick<User, 'id' | 'user_metadata'> | null | undefined,
): Promise<'gezet' | 'overgeslagen' | 'mislukt'> {
  const bron = leesBron(user?.user_metadata?.bron)
  if (!user || !bron) return 'overgeslagen'

  const { data, error } = await supabase
    .from('profiles')
    .update({ bron })
    .eq('id', user.id)
    .is('bron', null)
    .select('id')

  if (error) {
    console.error('[bron] kon bron niet op profiel zetten:', error.message)
    return 'mislukt'
  }
  return data && data.length > 0 ? 'gezet' : 'overgeslagen'
}
