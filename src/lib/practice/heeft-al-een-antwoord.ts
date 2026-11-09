import type { createClient } from '@/lib/supabase/server'

/**
 * Of deze leerling al een antwoord heeft opgeslagen.
 * Een fout telt als "al geoefend", zodat een vaste leerling nooit per ongeluk
 * het keuzescherm (INT-559) of de balk "Maak je eerste som" (INT-731) terugziet.
 */
export async function heeftAlEenAntwoord(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<boolean> {
  const { data: sessies, error: sessieFout } = await supabase
    .from('user_sessions_new')
    .select('id')
    .eq('user_id', userId)
  if (sessieFout) {
    console.error(
      '[heeft-al-een-antwoord] sessies tellen mislukt',
      sessieFout.code ?? 'geen code',
    )
    return true
  }
  const ids = (sessies ?? []).map((sessie) => sessie.id)
  if (ids.length === 0) return false

  for (let i = 0; i < ids.length; i += 100) {
    const { data, error } = await supabase
      .from('session_answers_new')
      .select('id')
      .in('session_id', ids.slice(i, i + 100))
      .limit(1)
    if (error) {
      console.error(
        '[heeft-al-een-antwoord] antwoorden tellen mislukt',
        error.code ?? 'geen code',
      )
      return true
    }
    if ((data ?? []).length > 0) return true
  }
  return false
}
