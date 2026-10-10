/** Bovengrens: langer dan twee uur op één opgave is geen meting meer. */
const MAX_SECONDEN = 2 * 60 * 60

/**
 * De tijd per antwoord komt van de browser van de leerling en gaat via een
 * serveractie — iedereen kan daar dus een willekeurig getal in zetten. Alleen
 * een heel getal tussen 0 en twee uur gaat de database in; al het andere
 * (negatief, oneindig, een klok die verzet is, een tabblad dat een nacht open
 * stond) wordt `null`, zodat de analyse geen onzin meetelt.
 */
export function timeSpentSecVoorOpslag(seconden: number | undefined): number | null {
  if (typeof seconden !== 'number' || !Number.isFinite(seconden)) return null
  const afgerond = Math.round(seconden)
  if (afgerond < 0 || afgerond > MAX_SECONDEN) return null
  return afgerond
}
