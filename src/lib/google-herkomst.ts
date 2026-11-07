/**
 * Komt deze bezoeker van een Google-zoekresultaat? Dat geldt voor elk domein
 * dat met `google.` begint, gevolgd door een geldig TLD-stuk — `google.com`,
 * `google.nl`, `google.co.uk`, `google.com.au`, … — maar niet voor een ander
 * domein dat toevallig met "google" begint of eindigt (zoals
 * `googleadservices.com`) of een vals verlengd domein (`google.com.voorbeeld.nl`).
 * Deze regel staat ook, als losse string, in `scriptDatBronOnthoudt` in
 * `bron.ts` — dat script draait in de browser en kan geen modules
 * importeren. `bron.test.ts` vergelijkt die string met `GOOGLE_ZOEKDOMEIN`
 * hieronder, zodat de twee niet uit elkaar kunnen groeien.
 */
export const GOOGLE_ZOEKDOMEIN = /^google\.[a-z]{2,3}(\.[a-z]{2,3})?$/

export function isGoogleZoekdomein(verwijzerDomein: string | null): boolean {
  if (verwijzerDomein === null) return false
  return GOOGLE_ZOEKDOMEIN.test(verwijzerDomein)
}
