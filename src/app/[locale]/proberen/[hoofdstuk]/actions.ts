'use server'

import { beoordeelProef, type ProefUitslag } from '@/lib/proberen/opgaven'

/**
 * Nakijken van één proefopgave. Geen account, geen database, geen AI.
 * Het antwoord wordt niet opgeslagen.
 */
export async function nakijkProefopgave(
  hoofdstuk: string,
  volgnummer: number,
  antwoord: string,
): Promise<ProefUitslag> {
  return beoordeelProef(hoofdstuk, volgnummer, antwoord)
}
