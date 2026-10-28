/**
 * Komt deze bezoeker van een Google-zoekresultaat? Dat geldt voor elk domein
 * dat met `google.` begint, gevolgd door een geldig TLD-stuk — `google.com`,
 * `google.nl`, `google.co.uk`, `google.com.au`, … — maar niet voor een ander
 * domein dat toevallig met "google" begint of eindigt (zoals
 * `googleadservices.com`) of een vals verlengd domein (`google.com.voorbeeld.nl`).
 * Gebruikt door de proef-strip en door `scriptDatBronOnthoudt` in `bron.ts`
 * (dezelfde regel staat daar nog eens als losse string, omdat dat script geen
 * modules kan importeren).
 */
const GOOGLE_ZOEKDOMEIN = /^google\.[a-z]{2,3}(\.[a-z]{2,3})?$/

export function isGoogleZoekdomein(verwijzerDomein: string | null): boolean {
  if (verwijzerDomein === null) return false
  return GOOGLE_ZOEKDOMEIN.test(verwijzerDomein)
}
