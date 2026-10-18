/**
 * Vangnet rond het nakijken van een antwoord.
 *
 * Alle oefenkaarten (oefenen, zelf-toets en de vragen bij een uitlegvideo)
 * roepen een server-actie aan om een antwoord na te kijken. Valt het netwerk
 * weg of gaat de server onderuit, dan gooit die aanroep. Zonder vangnet klapt
 * de kaart dan om in de crashpagina en is het getypte antwoord weg.
 *
 * Deze functie geeft in dat geval `null` terug; de kaart laat dan zijn eigen
 * melding zien en de leerling houdt zijn antwoord. Zie INT-378.
 */
export async function nakijkenMetVangnet<T>(
  roep: () => Promise<T>,
): Promise<T | null> {
  try {
    return await roep()
  } catch {
    return null
  }
}
