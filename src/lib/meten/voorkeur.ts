/**
 * Of dit apparaat meetelt in de klikmeting (INT-554).
 *
 * Een vlag in localStorage, geen cookie en geen persoonsgegeven. Hij overleeft
 * een herlaadactie en een nieuw tabblad op hetzelfde apparaat, maar gaat nooit
 * naar de server: `verzamelaar.ts` kijkt er lokaal naar voordat er iets
 * verstuurd wordt.
 *
 * Twee manieren om hem te zetten:
 * - een bezoek aan `/nl?meten=uit` (of `?meten=aan` om hem weer aan te
 *   zetten), zie `src/components/meet-schakelaar.tsx`;
 * - automatisch voor de beheerder, zodra ze bij /admin inlogt, zie
 *   `src/app/admin/layout.tsx`.
 */

const SLEUTEL = 'integraal-meet-uit'

/** Geldige waarden voor `?meten=`. Iets anders negeren we. */
export type MetenActie = 'uit' | 'aan'

export function leesMetenActie(waarde: unknown): MetenActie | null {
  return waarde === 'uit' || waarde === 'aan' ? waarde : null
}

function opslag(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    // Privévenster met alles dicht: dan is er geen opslag.
    return null
  }
}

/** Of de meting op dit apparaat is uitgezet. */
export function metenIsUitgezet(): boolean {
  try {
    return opslag()?.getItem(SLEUTEL) === '1'
  } catch {
    return false
  }
}

/** Zet de vlag op dit apparaat, of haalt hem weg. */
export function zetMeten(actie: MetenActie): void {
  try {
    if (actie === 'uit') opslag()?.setItem(SLEUTEL, '1')
    else opslag()?.removeItem(SLEUTEL)
  } catch {
    // Geen opslag: dan verandert er niets, en meten we gewoon verder.
  }
}
