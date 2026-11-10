/**
 * Of de tip "Stuur dit naar een klasgenoot" nog getoond mag worden na een
 * goed nagekeken antwoord op `/oefenen` (INT-811).
 *
 * Een vlag in localStorage, geen cookie: zodra de tip één keer getoond is
 * (het allereerste goede antwoord op dit apparaat), onthouden we dat voor
 * altijd en verschijnt hij niet nog eens.
 */

const SLEUTEL = 'integraal-eerste-goed-deel-getoond'

function opslag(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    // Privévenster met alles dicht: dan is er geen opslag.
    return null
  }
}

/** Of de tip nog niet eerder getoond is op dit apparaat. */
export function magEersteGoedeTipTonen(storage: Pick<Storage, 'getItem'> | null = opslag()): boolean {
  try {
    return storage?.getItem(SLEUTEL) !== '1'
  } catch {
    return false
  }
}

/** Onthoudt dat de tip getoond is, zodat hij niet nog eens verschijnt. */
export function onthoudEersteGoedeTipGetoond(
  storage: Pick<Storage, 'setItem'> | null = opslag(),
): void {
  try {
    storage?.setItem(SLEUTEL, '1')
  } catch {
    // Geen opslag: dan verschijnt de tip gewoon nog eens, niet erg.
  }
}
