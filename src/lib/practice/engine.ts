/**
 * Het nakijken van een antwoord, vóór de AI.
 *
 * Alles wat hier al goed gerekend wordt, kost geen Gemini-aanroep. Wat hier
 * niet doorkomt, gaat naar de AI-stap (`src/lib/ai/check-answer-new.ts`).
 */
import { readFormula, type Formula } from './expression'

// =====================================================================
// Normalisatie
// =====================================================================
export function normalizeAnswer(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/\*/g, '')
    .replace(/·/g, '')
    // ^(5), ^(-1), ^(x) → ^5, ^-1, ^x — alleen simpele exponenten, zodat
    // bv. e^(x+1) niet gelijk wordt aan e^x+1
    .replace(/\^\((-?\d+|-?[a-z])\)/g, '^$1')
    .replace(/x\^1\b/g, 'x')
    .replace(/\+-/g, '-')
    // het "echte" minteken dat een leerling meeplakt uit een pdf
    .replace(/−/g, '-')
}

export function answersMatch(
  student: string,
  correct: string,
  alternatives: string[] = [],
): boolean {
  const norm = normalizeAnswer(student)
  if (norm === normalizeAnswer(correct)) return true
  if (alternatives.some((alt) => norm === normalizeAnswer(alt))) return true
  if (zelfdeFunctie(norm, normalizeAnswer(correct))) return true
  return alternatives.some((alt) => zelfdeFunctie(norm, normalizeAnswer(alt)))
}

// =====================================================================
// Narekenen
//
// Twee formules kunnen dezelfde functie zijn terwijl er iets anders staat:
// `x^-1` en `1/x`, of `((3x+4)^(6))/(18)` en `(3x+4)^6/18`. Daarom rekenen we
// ze allebei uit op een rij x-waarden en vergelijken we de uitkomsten.
// =====================================================================

/** Zoveel punten moeten er overblijven, anders zegt de vergelijking niets. */
const MINIMAAL_BRUIKBAAR = 5

/** Toegestane afwijking: relatief, maar bij kleine waarden absoluut. */
const TOLERANTIE = 1e-9

/** Hierboven is een uitkomst zo groot dat vergelijken niets meer zegt. */
const TE_GROOT = 1e9

/**
 * Proefpunten die niet op ronde getallen liggen — daar zitten juist de
 * asymptoten en de nulpunten. De tweede rij ligt tussen 0 en 1 en de derde
 * boven 1, zodat er ook genoeg punten overblijven bij een `sqrt(x)` of een
 * `ln(ln(x))`, die alleen op een stuk van de x-as bestaan.
 */
const PROEFPUNTEN = [
  ...verdeel(-2.5, 2.5, 13),
  ...verdeel(0.05, 0.95, 6),
  ...verdeel(1.05, 4.95, 6),
]

function verdeel(begin: number, eind: number, aantal: number): number[] {
  const gulden = 0.618033988749895
  return Array.from({ length: aantal }, (_, i) => {
    const deel = ((i + 1) * gulden) % 1
    return begin + (eind - begin) * deel
  })
}

/**
 * Een losse integratieconstante aan het eind telt niet mee: een primitieve
 * zonder `+ c` is nog steeds een goede primitieve. In `content/` staat de
 * constante er met opzet niet bij, in de database vaak wel — zo vallen die
 * twee alsnog samen.
 *
 * Alleen een `c` helemaal aan het eind telt, en alleen als er iets overblijft:
 * `c` op zichzelf is geen antwoord.
 */
function zonderIntegratieconstante(genormaliseerd: string): string {
  const match = /^(.+?)[+-]c$/.exec(genormaliseerd)
  return match ? match[1] : genormaliseerd
}

/** Rekent een formule uit, of geeft `null` waar hij niet bestaat. */
function uitkomst(formule: Formula, x: number): number | null {
  let waarde: number
  try {
    waarde = formule(x)
  } catch {
    return null
  }
  if (!Number.isFinite(waarde) || Math.abs(waarde) > TE_GROOT) return null
  return waarde
}

/**
 * Zijn dit twee schrijfwijzen van dezelfde functie?
 *
 * Staat er `+ c` achter het goede antwoord, dan is het een onbepaalde
 * integraal en mag de constante élke waarde hebben: `F(x) + c` en
 * `F(x) - 1 + c` zijn dezelfde verzameling primitieven. Dan eisen we niet dat
 * de uitkomsten gelijk zijn, maar dat ze overal even veel schelen. Zo komt een
 * leerling die via een andere tussenstap bij een andere constante uitkomt
 * (`(x+1)ln(x+1) - x - 1` naast `(x+1)ln(x+1) - x`) er ook door.
 *
 * We kijken daarvoor naar het goede antwoord en niet naar dat van de leerling:
 * typt die `+ c` achter het antwoord op een vraag waar geen vrije constante
 * hoort (een bepaalde integraal, een `p = ...`), dan zou elk getal opeens goed
 * zijn.
 */
function zelfdeFunctie(student: string, correct: string): boolean {
  const kaalCorrect = zonderIntegratieconstante(correct)
  const vrijeConstante = kaalCorrect !== correct

  const formuleStudent = readFormula(zonderIntegratieconstante(student))
  if (!formuleStudent) return false
  const formuleCorrect = readFormula(kaalCorrect)
  if (!formuleCorrect) return false

  let bruikbaar = 0
  /** Hoeveel de twee mogen schelen: 0, of bij een vrije constante het verschil
   *  op het eerste bruikbare punt. */
  let mag: number | null = null
  for (const x of PROEFPUNTEN) {
    const a = uitkomst(formuleStudent, x)
    const b = uitkomst(formuleCorrect, x)
    if (a === null || b === null) continue
    const verschil = a - b
    if (mag === null) mag = vrijeConstante ? verschil : 0
    const schaal = Math.max(1, Math.abs(b), Math.abs(mag))
    if (Math.abs(verschil - mag) > TOLERANTIE * schaal) return false
    bruikbaar++
  }
  return bruikbaar >= MINIMAAL_BRUIKBAAR
}
