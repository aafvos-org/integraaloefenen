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
/** De tekens die het symbolentoetsenbord van een telefoon als macht typt. */
const MACHTCIJFERS: Record<string, string> = {
  '⁰': '0',
  '¹': '1',
  '²': '2',
  '³': '3',
  '⁴': '4',
  '⁵': '5',
  '⁶': '6',
  '⁷': '7',
  '⁸': '8',
  '⁹': '9',
  '⁻': '-',
  ⁿ: 'n',
}

/**
 * Haalt de maaltekens weg, want weglaten mag: zo is `2*x` hetzelfde antwoord
 * als `2x` en hoeven we die twee niet door te rekenen.
 *
 * Alleen daar waar weglaten iets anders betekent, blijft het teken staan.
 * Tussen twee getallen plakken de cijfers anders aan elkaar (`1/2*3` zou
 * `1/23` worden), en voor een `-`, een `+` of het eind van het antwoord valt
 * er niets te vermenigvuldigen. De rekenmachine in `expression.ts` leest zo'n
 * achtergebleven maalteken gewoon als maal.
 */
function maaltekensWeg(genormaliseerd: string): string {
  return genormaliseerd.replace(/\*/g, (teken, index: number, bron: string) => {
    const ervoor = bron[index - 1] ?? ''
    const erna = bron.slice(index + 1)
    // `2*3` → `23`, maar ook `2*e5` → `2e5`: dat leest de tokenizer als 200000
    const plaktGetallen = /[\d.,]/.test(ervoor) && /^(?:[\d.,]|e\d)/.test(erna)
    // achter het maalteken hoort iets te staan om mee te vermenigvuldigen
    const geenFactorErna = !/^[\d.,a-z(|]/.test(erna)
    return plaktGetallen || geenFactorErna ? teken : ''
  })
}

/**
 * Bij beginvoorwaarde-vragen ("de grafiek van F gaat door...") staat het
 * canonieke antwoord in de database als `F(x) = ...`, maar het invoerveld
 * heeft daar geen voorvoegsel voor (`antwoordPrefix` in `opdracht.ts` is dan
 * leeg). De leerling typt dus alleen de formule. Zonder deze stap kan
 * `readFormula` het `=`-teken niet lezen en wordt een goed antwoord afgekeurd.
 */
function zonderFunctienotatie(genormaliseerd: string): string {
  return genormaliseerd.replace(/^[a-z]\([a-z]\)=/, '')
}

export function normalizeAnswer(raw: string): string {
  const metMaaltekens = zonderFunctienotatie(
    raw
      .toLowerCase()
      .replace(/\s+/g, ''),
  )
    // het π-toetsje van een wiskundetoetsenbord
    .replace(/π/g, 'pi')
    // het "echte" minteken dat een leerling meeplakt uit een pdf
    .replace(/−/g, '-')
    // x² → x^2, x⁻¹ → x^-1: een hele rij machttekens wordt één exponent
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻ⁿ]+/g, (reeks) =>
      '^' + [...reeks].map((teken) => MACHTCIJFERS[teken]).join(''),
    )
    // ^(5), ^(-1), ^(x) → ^5, ^-1, ^x — alleen simpele exponenten, zodat
    // bv. e^(x+1) niet gelijk wordt aan e^x+1
    .replace(/\^\((-?\d+|-?[a-z])\)/g, '^$1')
    // het punt is hetzelfde maalteken als de ster
    .replace(/·/g, '*')

  // De machten staan al op `^`, zodat `x²*3` niet alsnog `x^23` wordt.
  return maaltekensWeg(metMaaltekens)
    .replace(/x\^1\b/g, 'x')
    .replace(/\+-/g, '-')
}

export function answersMatch(
  student: string,
  correct: string,
  alternatives: string[] = [],
): boolean {
  const norm = normalizeAnswer(student)
  const normCorrect = normalizeAnswer(correct)
  if (norm === normCorrect) return true
  if (alternatives.some((alt) => norm === normalizeAnswer(alt))) return true
  // Een verhouding ("2 : 1") is geen functie: `zelfdeFunctie` zou '2' of
  // '0,5' via `2/1` of `1/2` numeriek narekenen en zo'n los getal of
  // decimaal alsnog goedkeuren. Alleen de letterlijke schrijfwijzen hierboven
  // tellen dan nog mee.
  if (normCorrect.includes(':')) return false
  if (zelfdeFunctie(norm, normCorrect)) return true
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

// =====================================================================
// Schoolbreuken: `ln(1)/(3)` bedoeld als `ln(1/3)`
//
// Op papier schrijf je een breuk met een teller boven een streep boven een
// noemer. Typt een leerling dat op één regel, dan zet die vaak losse haakjes
// om teller én noemer — `ln(1)/(3)` voor `ln(1/3)`, `(3)/(2)^(x)` voor
// `(3/2)^x` — zonder te bedenken dat de rekenmachine dat anders leest dan
// bedoeld. `readFormula` leest dat letterlijk (`ln(1)` gedeeld door 3, 3
// gedeeld door `2^x`), met een andere uitkomst tot gevolg.
//
// We passen dit nooit toe op het goede antwoord, en nooit blind op het
// antwoord van de leerling: we proberen het alléén als extra lezing ná de
// letterlijke, en `vergelijkPuntsgewijs` hieronder beslist of die lezing ook
// echt bij het goede antwoord hoort. Een bewust andere breuk (`ln(1)/3` als
// apart, fout antwoord) blijft dus gewoon fout: die lezing komt dan niet
// overeen met het goede antwoord.
// =====================================================================

/** Index van de `)` die bij de `(` op `open` hoort, of -1 als die ontbreekt. */
function vindSluithaak(bron: string, open: number): number {
  let diepte = 0
  for (let i = open; i < bron.length; i++) {
    if (bron[i] === '(') diepte++
    else if (bron[i] === ')') {
      diepte--
      if (diepte === 0) return i
    }
  }
  return -1
}

/** `ln(A)/(B)` → `ln((A)/(B))`, voor elke zo'n plek in de hele formule. */
function lnBreukFix(bron: string): string {
  let resultaat = ''
  let i = 0
  while (i < bron.length) {
    if (bron.startsWith('ln(', i)) {
      const openTeller = i + 2
      const sluitTeller = vindSluithaak(bron, openTeller)
      if (sluitTeller !== -1 && bron.startsWith('/(', sluitTeller + 1)) {
        const openNoemer = sluitTeller + 2
        const sluitNoemer = vindSluithaak(bron, openNoemer)
        if (sluitNoemer !== -1) {
          const teller = bron.slice(openTeller + 1, sluitTeller)
          const noemer = bron.slice(openNoemer + 1, sluitNoemer)
          resultaat += `ln((${teller})/(${noemer}))`
          i = sluitNoemer + 1
          continue
        }
      }
    }
    resultaat += bron[i]
    i++
  }
  return resultaat
}

/** `(A)/(B)^` → `((A)/(B))^`, voor elke zo'n plek in de hele formule. */
function basisBreukMachtFix(bron: string): string {
  let resultaat = ''
  let i = 0
  while (i < bron.length) {
    if (bron[i] === '(') {
      const sluitTeller = vindSluithaak(bron, i)
      if (sluitTeller !== -1 && bron.startsWith('/(', sluitTeller + 1)) {
        const openNoemer = sluitTeller + 2
        const sluitNoemer = vindSluithaak(bron, openNoemer)
        if (sluitNoemer !== -1 && bron[sluitNoemer + 1] === '^') {
          const teller = bron.slice(i + 1, sluitTeller)
          const noemer = bron.slice(openNoemer + 1, sluitNoemer)
          resultaat += `((${teller})/(${noemer}))^`
          i = sluitNoemer + 2
          continue
        }
      }
    }
    resultaat += bron[i]
    i++
  }
  return resultaat
}

/**
 * Lezingen van het antwoord van de leerling, letterlijk eerst. De twee fixes
 * mogen ook samen: zo komt een antwoord met allebei de schoolbreuken (zoals
 * in INT-695) ook met de combinatie overeen.
 */
function schoolbreukLezingen(student: string): string[] {
  const metLnFix = lnBreukFix(student)
  const metMachtFix = basisBreukMachtFix(student)
  const metBeideFixes = basisBreukMachtFix(metLnFix)
  return [...new Set([student, metLnFix, metMachtFix, metBeideFixes])]
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

  const formuleCorrect = readFormula(kaalCorrect)
  if (!formuleCorrect) return false

  const kaleStudent = zonderIntegratieconstante(student)
  return schoolbreukLezingen(kaleStudent).some((lezing) => {
    const formuleStudent = readFormula(lezing)
    if (!formuleStudent) return false
    return vergelijkPuntsgewijs(formuleStudent, formuleCorrect, vrijeConstante)
  })
}

/** Rekenen `student` en `correct` overal (bijna) hetzelfde uit? */
function vergelijkPuntsgewijs(
  student: Formula,
  correct: Formula,
  vrijeConstante: boolean,
): boolean {
  let bruikbaar = 0
  /** Hoeveel de twee mogen schelen: 0, of bij een vrije constante het verschil
   *  op het eerste bruikbare punt. */
  let mag: number | null = null
  for (const x of PROEFPUNTEN) {
    const a = uitkomst(student, x)
    const b = uitkomst(correct, x)
    if (a === null || b === null) continue
    const verschil = a - b
    if (mag === null) mag = vrijeConstante ? verschil : 0
    const schaal = Math.max(1, Math.abs(b), Math.abs(mag))
    if (Math.abs(verschil - mag) > TOLERANTIE * schaal) return false
    bruikbaar++
  }
  return bruikbaar >= MINIMAAL_BRUIKBAAR
}
