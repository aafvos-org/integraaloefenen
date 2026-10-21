/**
 * Wanneer een klik een dode klik is.
 *
 * Een dode klik hoort te betekenen: hier verwachtte iemand iets, en er gebeurde
 * niets. Elke klik die niet op een knop of een link landt zo noemen is te ruim.
 * Dan komen er meldingen binnen over gewone leesklikken: een woord aantikken om
 * het te selecteren, of naast de kaart tikken om het toetsenbord van de telefoon
 * weg te krijgen. Daar is niets mis mee, en het verbergt de klikken waar wél
 * iets mis is.
 *
 * Deze regels staan apart zodat `npm test` ze kan narekenen zonder browser.
 */

/**
 * Elementen die de pagina indelen. Landt een klik op zo'n element zelf, dan is
 * er naast de inhoud geklikt: in de marge, of onder de kaart. Dat is geen
 * verwarring over een knop. Een `div` staat er bewust niet bij: een kaart is
 * een `div`, en een kaart die klikbaar lijkt maar het niet is willen we juist
 * blijven zien.
 */
const INDELING = new Set([
  'html',
  'body',
  'main',
  'header',
  'footer',
  'nav',
  'aside',
  'section',
  'article',
  'form',
])

export type Klikcontext = {
  /** De tagnaam van wat er aangeklikt is, in kleine letters. */
  tag: string
  /** Of er iets klikbaars omheen zit. */
  klikbaar: boolean
  /**
   * Of er tekst geselecteerd staat als het gebaar klaar is. Dubbelklikken op
   * een woord selecteert dat woord; slepen over een zin selecteert die zin.
   */
  selectie: boolean
  /**
   * Of dit element met `data-geen-dode-klik` is gemarkeerd. Een wiskundeformule
   * (KaTeX) bestaat uit tientallen kleine `span`'s; erop tikken om iets rustig
   * te bekijken is heel gewoon en levert op de telefoon geen tekstselectie op
   * (dat vraagt om een lange tik). De rand van het formuletoetsenbord krijgt
   * om dezelfde reden een tik die bij de knoppen ernaast hoort, niet bij een
   * kaart die klikbaar lijkt. Zet dit niet op een hele kaart: dan verdwijnen
   * juist de dode klikken die we wél willen zien.
   */
  uitgezonderd: boolean
}

export function teltAlsDodeKlik({ tag, klikbaar, selectie, uitgezonderd }: Klikcontext): boolean {
  if (klikbaar) return false
  if (selectie) return false
  if (uitgezonderd) return false
  return !INDELING.has(tag.toLowerCase())
}
