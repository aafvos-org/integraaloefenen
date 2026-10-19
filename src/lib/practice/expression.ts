/**
 * Een kleine rekenmachine voor de notatie die een leerling intypt.
 *
 * Hiermee kan `answersMatch` twee formules doorrekenen in plaats van alleen
 * hun tekst te vergelijken: `x^-1` en `1/x` zijn dezelfde functie, ook al staat
 * er iets anders. Alles wat hier al goed gerekend wordt, kost geen Gemini-
 * aanroep.
 *
 * Bewust zonder extern pakket: dit draait mee in de Cloudflare Worker, dus het
 * moet klein blijven. (mathjs staat wel in de repo, maar alleen als
 * devDependency, voor `src/content/primitieven.test.ts`.)
 *
 * Hij kent de notatie uit `AGENTS.md`: `*` voor maal (dat mag je weglaten),
 * `^` voor machten,
 * `sqrt(x)`, `sin(x)`, `asin(x)`, `e^x`, `pi`, `ln(x)` en `log10(x)`. In de les
 * heten de inverse functies `arctan`, `arcsin` en `arccos`; die rekent hij
 * hetzelfde als `atan`, `asin` en `acos`. `log(...)` kent hij niet — dat is te
 * verwarrend — en een formule daarmee gaat dus langs de AI-stap. Staafjes
 * `|x|` zijn hetzelfde als `abs(x)`, ook in `ln|x+2|`.
 *
 * De `e` van een rekenmachine: `1e5` is 100000, want een getal maal e maal een
 * getal schrijft niemand zo. Staat er een teken achter de `e`, dan blijft het
 * de constante van Euler: `2e-3` is 2·e − 3, de gewone vorm van een exacte
 * uitkomst bij een integraal, en niet 0,002.
 */

/** Langer dan dit is geen antwoord meer; dan rekenen we niet door. */
const MAX_LENGTE = 200

const FUNCTIES: Record<string, (waarde: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  // In de les en in de database: arcsin, arccos, arctan. De langste naam
  // wint bij het inlezen, dus `arctan` wordt niet per ongeluk `atan`.
  arcsin: Math.asin,
  arccos: Math.acos,
  arctan: Math.atan,
  sqrt: Math.sqrt,
  abs: Math.abs,
  exp: Math.exp,
  ln: Math.log,
  log10: Math.log10,
}

const CONSTANTEN: Record<string, number> = {
  e: Math.E,
  pi: Math.PI,
}

/** Een ingelezen formule: geef een x, krijg een uitkomst. */
export type Formula = (x: number) => number

type Token =
  | { soort: 'getal'; waarde: number }
  | { soort: 'naam'; waarde: string }
  | { soort: 'teken'; waarde: string }

const TEKENS = new Set(['+', '-', '*', '/', '^', '(', ')'])

/**
 * Schoolnotatie `|x+2|` is hetzelfde als `abs(x+2)`. Ook `ln|x+2|`, zonder
 * haakjes om de staafjes. Een ongepaard staafje is geen formule die we
 * kunnen narekenen.
 */
function staafjesNaarAbs(bron: string): string | null {
  const omgezet = bron.replace(/\|([^|]*)\|/g, '(abs($1))')
  if (omgezet.includes('|')) return null
  return omgezet
}

/**
 * De namen die we kennen, de langste eerst — zo wordt `exp` niet gelezen als
 * `e` maal `xp`, en `xln(x)` (het maalteken mag je weglaten) wel als x maal
 * ln(x). Een naam die hier niet in staat, zoals de integratieconstante `c` of
 * `log`, maakt dat we niet doorrekenen.
 */
const NAMEN = [...Object.keys(FUNCTIES), ...Object.keys(CONSTANTEN), 'x'].sort(
  (a, b) => b.length - a.length,
)

function tokenize(bron: string): Token[] | null {
  const tokens: Token[] = []
  let i = 0
  while (i < bron.length) {
    const rest = bron.slice(i)

    // `1e5` hoort bij het getal (100000). `2e-3` en `2e^x` niet: daar is de
    // `e` de constante van Euler.
    const getal = /^(?:\d+(?:[.,]\d+)?|[.,]\d+)(?:e\d+)?/.exec(rest)
    if (getal) {
      tokens.push({ soort: 'getal', waarde: Number(getal[0].replace(',', '.')) })
      i += getal[0].length
      continue
    }

    const naam = NAMEN.find((kandidaat) => rest.startsWith(kandidaat))
    if (naam) {
      tokens.push({ soort: 'naam', waarde: naam })
      i += naam.length
      continue
    }

    if (TEKENS.has(rest[0])) {
      tokens.push({ soort: 'teken', waarde: rest[0] })
      i += 1
      continue
    }

    // Iets wat we niet kennen (=, √, …): dan rekenen we niet door.
    return null
  }
  return tokens
}

/**
 * Leest een formule in. Geeft `null` als het geen formule in de afgesproken
 * notatie is — dan valt het antwoord gewoon terug op de AI-stap.
 *
 * De invoer wordt verwacht zoals `normalizeAnswer` hem achterlaat: kleine
 * letters en zonder spaties. Maaltekens die daar zijn blijven staan (tussen
 * twee getallen, want `1/2*3` is niet `1/23`) leest hij gewoon als maal.
 */
export function readFormula(bron: string): Formula | null {
  const metAbs = staafjesNaarAbs(bron)
  if (metAbs === null || metAbs.length === 0 || metAbs.length > MAX_LENGTE) return null
  const tokens = tokenize(metAbs)
  if (!tokens || tokens.length === 0) return null

  let pos = 0
  const kijk = (): Token | undefined => tokens[pos]
  const isTeken = (teken: string) => {
    const token = kijk()
    return token !== undefined && token.soort === 'teken' && token.waarde === teken
  }

  // som := product (('+' | '-') product)*
  function som(): Formula {
    let links = product()
    for (;;) {
      if (isTeken('+')) {
        pos++
        const rechts = product()
        const a = links
        links = (x) => a(x) + rechts(x)
      } else if (isTeken('-')) {
        pos++
        const rechts = product()
        const a = links
        links = (x) => a(x) - rechts(x)
      } else {
        return links
      }
    }
  }

  // product := min (('/' | '*' | niets) min)*  — het maalteken mag je weglaten
  function product(): Formula {
    let links = min()
    for (;;) {
      if (isTeken('/')) {
        pos++
        const rechts = min()
        const a = links
        links = (x) => a(x) / rechts(x)
      } else if (isTeken('*')) {
        pos++
        const rechts = min()
        const a = links
        links = (x) => a(x) * rechts(x)
      } else if (beginVanGetalOfNaam()) {
        const rechts = macht()
        const a = links
        links = (x) => a(x) * rechts(x)
      } else {
        return links
      }
    }
  }

  function beginVanGetalOfNaam(): boolean {
    const token = kijk()
    if (!token) return false
    return token.soort === 'getal' || token.soort === 'naam' || isTeken('(')
  }

  // min := ('-' | '+') min | macht
  function min(): Formula {
    if (isTeken('-')) {
      pos++
      const binnen = min()
      return (x) => -binnen(x)
    }
    if (isTeken('+')) {
      pos++
      return min()
    }
    return macht()
  }

  // macht := deel ('^' min)?  — rechts-associatief, zodat x^-2 kan
  function macht(): Formula {
    const basis = deel()
    if (isTeken('^')) {
      pos++
      const exponent = min()
      return (x) => Math.pow(basis(x), exponent(x))
    }
    return basis
  }

  // deel := '(' som ')' | getal | functie '(' som ')' | x | e | pi
  function deel(): Formula {
    const token = kijk()
    if (!token) throw new Error('formule houdt te vroeg op')

    if (token.soort === 'teken' && token.waarde === '(') {
      pos++
      const binnen = som()
      if (!isTeken(')')) throw new Error('haakje niet gesloten')
      pos++
      return binnen
    }

    if (token.soort === 'getal') {
      pos++
      const waarde = token.waarde
      return () => waarde
    }

    if (token.soort === 'naam') {
      pos++
      const naam = token.waarde
      const functie = FUNCTIES[naam]
      if (functie) {
        if (!isTeken('(')) throw new Error(`${naam} zonder haakjes`)
        pos++
        const argument = som()
        if (!isTeken(')')) throw new Error('haakje niet gesloten')
        pos++
        return (x) => functie(argument(x))
      }
      if (naam === 'x') return (x) => x
      const constante = CONSTANTEN[naam]
      if (constante !== undefined) return () => constante
      throw new Error(`onbekende naam ${naam}`)
    }

    throw new Error('hier hoort een getal of een formule te staan')
  }

  try {
    const formule = som()
    if (pos !== tokens.length) return null
    return formule
  } catch {
    return null
  }
}
