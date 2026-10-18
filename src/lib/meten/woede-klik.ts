/**
 * Wanneer een reeks klikken een woedeklik is.
 *
 * Een woedeklik hoort te betekenen: hier gebeurt niets en de leerling ramt
 * erop. Drie tikken binnen een seconde op bijna dezelfde plek zijn daar een
 * goed teken van — behalve in een invoerveld. Op de telefoon tikt een leerling
 * makkelijk een paar keer in het antwoordveld om het toetsenbord te krijgen of
 * de cursor te verzetten. Dat is precies wat de bedoeling is, en net als bij de
 * dode klik verbergt zo'n vals signaal de klikken waar wél iets mis is.
 *
 * Deze regels staan apart zodat `npm test` ze kan narekenen zonder browser.
 */

/** Woedeklik: zoveel klikken binnen zoveel milliseconden op dezelfde plek. */
export const WOEDE_KLIKKEN = 3
export const WOEDE_MS = 1000
export const WOEDE_PIXELS = 30

/** Waar en wanneer er geklikt is. De plek is die in het venster. */
export type Klikpunt = {
  x: number
  y: number
  t: number
}

/** Wat we van de vorige klikken onthouden. */
export type Woedestaat = {
  /** De klikken die nog binnen het tijdvenster vallen. */
  klikken: Klikpunt[]
  /** Of deze reeks al een woedeklik heeft opgeleverd. */
  gemeld: boolean
}

export type Woedecontext = Klikpunt & {
  /** Of de klik in een invoerveld landde: het antwoordveld of een tekstvak. */
  invoerveld: boolean
  /** Of er tekst geselecteerd staat. */
  selectie: boolean
}

export function legeWoedestaat(): Woedestaat {
  return { klikken: [], gemeld: false }
}

/**
 * Verwerkt één klik. Geeft de nieuwe staat terug en of hier een woedeklik
 * genoteerd moet worden. Eén reeks levert hoogstens één woedeklik op.
 */
export function volgendeWoedestaat(
  staat: Woedestaat,
  { x, y, t, invoerveld, selectie }: Woedecontext,
): { staat: Woedestaat; melden: boolean } {
  let klikken = staat.klikken.filter((klik) => t - klik.t < WOEDE_MS)
  let gemeld = staat.gemeld

  // Een klik verderop hoort bij een ander gebaar: daar begint de telling opnieuw.
  const vorige = klikken[klikken.length - 1]
  if (vorige && (Math.abs(vorige.x - x) > WOEDE_PIXELS || Math.abs(vorige.y - y) > WOEDE_PIXELS)) {
    klikken = []
    gemeld = false
  }
  klikken = [...klikken, { x, y, t }]

  // Drie keer klikken op een alinea selecteert die alinea. Dat is geen woede,
  // en tikken in een invoerveld evenmin.
  const melden = klikken.length >= WOEDE_KLIKKEN && !gemeld && !selectie && !invoerveld
  if (melden) gemeld = true
  if (klikken.length < WOEDE_KLIKKEN) gemeld = false

  return { staat: { klikken, gemeld }, melden }
}
