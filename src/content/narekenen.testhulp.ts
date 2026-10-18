/**
 * Hulpstukken om een primitieve terug te differentiëren en tegen de
 * integrand te leggen — zowel voor de theorie in LaTeX (`integralen.test.ts`,
 * `voorbeeldopgaven.test.ts`) als voor de kale formules uit `content/`
 * (`primitieven.test.ts`, `voorbeelden.test.ts`). Al die tests hebben
 * dezelfde manier nodig om een formule te lezen, te differentiëren en op een
 * rij x-waarden te vergelijken; dat staat hier maar één keer.
 *
 * De site importeert hier niets van.
 *
 * De naam eindigt niet op `.test.ts`, dus vitest ziet dit niet als een suite.
 */

import { derivative, isComplex, parse, type MathNode } from 'mathjs'

/** Zoveel x-waarden proberen we per opgave, als een aanroep er geen eigen aantal voor opgeeft. */
const AANTAL_PUNTEN = 61

/** Zoveel punten moeten er overblijven, anders zegt de test niets. */
const MINIMAAL_BRUIKBAAR = 5

/** Toegestane afwijking: relatief, maar bij kleine waarden absoluut. */
const TOLERANTIE = 1e-6

/** Standaarddomein als een aanroep er zelf geen opgeeft: tussen $-2{,}5$ en $2{,}5$. */
export const STANDAARD_DOMEIN: [number, number] = [-2.5, 2.5]

/** Hierboven is een uitkomst zo groot dat vergelijken niets meer zegt. */
const TE_GROOT = 1e9

/** Zoveel stukjes gebruikt de regel van Simpson bij een bepaalde integraal. */
const SIMPSON_STUKJES = 2000

/** Namen die in een formule mogen staan naast de functies van mathjs. */
const TOEGESTANE_NAMEN = new Set(['x', 'e', 'pi'])

/** Functies die de vertaling kan opleveren; daarna volgt een haakje, geen maalteken. */
const REKENFUNCTIES = new Set(['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'ln', 'sqrt', 'abs', 'exp'])

// ---------------------------------------------------------------------
// LaTeX vertalen naar een formule die mathjs leest
// ---------------------------------------------------------------------

/** Opmaakcommando's zonder betekenis. `\!` mag helemaal weg, de rest wordt een spatie. */
const ZONDER_BETEKENIS: Array<[string, string]> = [
  ['\\!', ''],
  ['\\displaystyle', ' '],
  ['\\biggl', ''],
  ['\\biggr', ''],
  ['\\Bigl', ''],
  ['\\Bigr', ''],
  ['\\bigl', ''],
  ['\\bigr', ''],
  ['\\Big', ''],
  ['\\big', ''],
  ['\\left', ''],
  ['\\right', ''],
  ['\\qquad', ' '],
  ['\\quad', ' '],
  ['\\,', ' '],
  ['\\;', ' '],
  ['\\:', ' '],
  ['\\ ', ' '],
]

/**
 * Namen van functies en getallen. Het commando moet helemaal passen: `\sinh`
 * is niet `\sin` met een h erachter, maar een commando dat deze test niet kent.
 */
const NAMEN: Array<[RegExp, string]> = (
  [
    ['arcsin', ' asin'],
    ['arccos', ' acos'],
    ['arctan', ' atan'],
    ['sin', ' sin'],
    ['cos', ' cos'],
    ['tan', ' tan'],
    ['ln', ' ln'],
    ['pi', ' pi'],
    ['cdot', '*'],
  ] as Array<[string, string]>
).map(([naam, vervanging]) => [new RegExp(`\\\\${naam}(?![a-zA-Z])`, 'g'), vervanging])

/**
 * Leest het argument van een commando: `{…}` met de bijbehorende accolade,
 * of anders het ene teken erachter (`\frac12` is $\tfrac12$).
 */
export function leesArgument(s: string, start: number): { arg: string; eind: number } {
  let i = start
  while (s[i] === ' ') i += 1
  if (s[i] === '{') {
    let diepte = 0
    for (let j = i; j < s.length; j += 1) {
      if (s[j] === '{') diepte += 1
      else if (s[j] === '}') {
        diepte -= 1
        if (diepte === 0) return { arg: s.slice(i + 1, j), eind: j + 1 }
      }
    }
    throw new Error(`er gaat een accolade niet dicht in \`${s}\``)
  }
  if (s[i] === undefined) throw new Error(`er mist een argument in \`${s}\``)
  return { arg: s[i], eind: i + 1 }
}

/**
 * Werkt `\frac`, `\tfrac`, `\dfrac` en `\sqrt` weg.
 *
 * Een getal vlak vóór een breuk van twee getallen is een gemengd getal:
 * `1\frac12` is $1\tfrac12$, dus $1+\tfrac12$ en niet $1\cdot\tfrac12$.
 */
function vervangBreuken(s: string): string {
  let uit = ''
  let i = 0
  while (i < s.length) {
    const breuk = ['\\tfrac', '\\dfrac', '\\frac'].find((naam) => s.startsWith(naam, i))
    if (breuk !== undefined) {
      const teller = leesArgument(s, i + breuk.length)
      const noemer = leesArgument(s, teller.eind)
      const boven = vervangBreuken(teller.arg)
      const onder = vervangBreuken(noemer.arg)
      const heel = /(\d+)$/.exec(uit)
      if (heel !== null && /^\d+$/.test(boven) && /^\d+$/.test(onder)) {
        uit = `${uit.slice(0, uit.length - heel[1].length)}(${heel[1]}+(${boven})/(${onder}))`
      } else {
        uit += `((${boven})/(${onder}))`
      }
      i = noemer.eind
      continue
    }
    if (s.startsWith('\\sqrt', i)) {
      const arg = leesArgument(s, i + '\\sqrt'.length)
      uit += ` sqrt(${vervangBreuken(arg.arg)})`
      i = arg.eind
      continue
    }
    uit += s[i]
    i += 1
  }
  return uit
}

/** Zoekt het haakje dat bij het haakje op `open` hoort. */
function sluitHaakje(s: string, open: number): number {
  let diepte = 0
  for (let i = open; i < s.length; i += 1) {
    if (s[i] === '(') diepte += 1
    else if (s[i] === ')') {
      diepte -= 1
      if (diepte === 0) return i
    }
  }
  throw new Error(`er gaat een haakje niet dicht in \`${s}\``)
}

/** `\cos^2(x)` betekent $(\cos x)^2$, niet $\cos(x^2)$. */
function machtenNaFuncties(s: string): string {
  const patroon = /\b(sin|cos|tan|asin|acos|atan|ln)\^(\d+)\(/
  let uit = s
  for (;;) {
    const gevonden = patroon.exec(uit)
    if (gevonden === null) return uit
    const open = gevonden.index + gevonden[0].length - 1
    const dicht = sluitHaakje(uit, open)
    const arg = uit.slice(open + 1, dicht)
    uit = `${uit.slice(0, gevonden.index)}(${gevonden[1]}(${arg}))^${gevonden[2]}${uit.slice(dicht + 1)}`
  }
}

function isWaardeEind(token: string): boolean {
  return token === ')' || /^[A-Za-z0-9]/.test(token)
}

function isWaardeBegin(token: string): boolean {
  return token === '(' || /^[A-Za-z0-9]/.test(token)
}

/**
 * Zet er maaltekens in waar LaTeX ze weglaat. `4x(x^2-1)` wordt
 * `4*x*(x^2-1)`: mathjs leest `x(...)` anders als een functie die niet bestaat.
 */
function metExpliciteMaal(s: string): string {
  const tokens = s.match(/\d+(?:\.\d+)?|[A-Za-z]+|\S/g) ?? []
  let uit = ''
  let vorig: string | null = null
  for (const token of tokens) {
    const functieHaakje = vorig !== null && REKENFUNCTIES.has(vorig) && token === '('
    if (vorig !== null && isWaardeEind(vorig) && isWaardeBegin(token) && !functieHaakje) uit += '*'
    uit += token
    vorig = token
  }
  return uit
}

/** Vertaalt één stuk LaTeX naar een formule voor mathjs. Gooit bij iets onbekends. */
export function latexNaarFormule(latex: string): string {
  let s = latex
  for (const [commando, vervanging] of ZONDER_BETEKENIS) s = s.split(commando).join(vervanging)
  s = s.replace(/\|([^|]*)\|/g, '(abs($1))')
  s = vervangBreuken(s)
  for (const [commando, vervanging] of NAMEN) s = s.replace(commando, vervanging)
  s = machtenNaFuncties(s)
  s = s.split('{').join('(').split('}').join(')')
  const over = /\\[a-zA-Z]*/.exec(s)
  if (over !== null) throw new Error(`deze test kent het LaTeX-commando \`${over[0]}\` niet`)
  return metExpliciteMaal(s)
}

// ---------------------------------------------------------------------
// Rekenen
// ---------------------------------------------------------------------

/** Extra's die een aanroep aan `lees` kan meegeven, naast het standaardgedrag. */
export type LeesOpties = {
  /** Namen die naast `x`, `e` en `pi` ook mogen, bijvoorbeeld een variabele uit een scope. */
  extraNamen?: Iterable<string>
  /**
   * Wijs `log(...)` af in plaats van hem stilzwijgend te lezen. In de
   * wiskundeles is `log` grondtal 10, in mathjs grondtal e — voor content die
   * leerlingen rechtstreeks schrijven moet dat verschil hardop misgaan.
   */
  weigerLog?: boolean
  /** Toegevoegd aan de melding over een onbekende naam, bijvoorbeeld een tip voor content-schrijvers. */
  onbekendeNaamHint?: string
}

/**
 * mathjs schrijft de natuurlijke logaritme als `log`; in de wiskundeles is dat
 * juist grondtal 10. In de vertaling houden we `ln` aan en zetten we hem hier om.
 */
export function lees(formule: string, opties: LeesOpties = {}): MathNode {
  if (opties.weigerLog && /\blog\s*\(/.test(formule)) {
    throw new Error(
      'schrijf `ln(...)` voor de natuurlijke logaritme en `log10(...)` voor die met grondtal 10; `log(...)` is te verwarrend',
    )
  }

  const node = parse(formule.replace(/\bln\s*\(/g, 'log('))
  const toegestaan = new Set([...TOEGESTANE_NAMEN, ...(opties.extraNamen ?? [])])
  const onbekend = node
    .filter(
      (kind, pad, ouder) =>
        kind.type === 'SymbolNode' && !(ouder?.type === 'FunctionNode' && pad === 'fn'),
    )
    .map((kind) => (kind as unknown as { name: string }).name)
    .filter((naam) => !toegestaan.has(naam))
  if (onbekend.length > 0) {
    const namen = [...new Set(onbekend)].map((n) => `\`${n}\``).join(', ')
    const hint = opties.onbekendeNaamHint === undefined ? '' : ` — ${opties.onbekendeNaamHint}`
    throw new Error(`onbekende naam ${namen}${hint}`)
  }
  return node
}

/** Maakt van een formule een functie die `null` geeft waar hij niet bestaat. */
export function alsFunctie(
  node: MathNode,
  scope: Record<string, number> = {},
): (x: number) => number | null {
  const gecompileerd = node.compile()
  return (x) => {
    let uitkomst: unknown
    try {
      uitkomst = gecompileerd.evaluate({ ...scope, x })
    } catch {
      return null
    }
    if (isComplex(uitkomst) || typeof uitkomst !== 'number') return null
    if (!Number.isFinite(uitkomst) || Math.abs(uitkomst) > TE_GROOT) return null
    return uitkomst
  }
}

/** Rekent een formule zonder x uit; een getal komt er ongewijzigd uit. */
export function alsGetal(
  formule: string | number,
  scope: Record<string, number> = {},
  opties: LeesOpties = {},
): number {
  if (typeof formule === 'number') return formule
  const gelezen = lees(formule, { ...opties, extraNamen: [...(opties.extraNamen ?? []), ...Object.keys(scope)] })
  const uitkomst = alsFunctie(gelezen, scope)(Number.NaN)
  if (uitkomst === null) throw new Error(`\`${formule}\` levert geen gewoon getal op`)
  return uitkomst
}

/**
 * Proefpunten over een domein, met de derde macht dichter bij het midden
 * opeengepakt: veel opgaven bestaan alleen op een stuk van dat domein, vaak
 * rond het midden, en dan heeft een punt vlak bij de rand weinig nut.
 */
function proefpunten([begin, eind]: [number, number], aantal: number): number[] {
  const midden = (begin + eind) / 2
  const halveBreedte = (eind - begin) / 2
  const gulden = 0.618033988749895
  return Array.from({ length: aantal }, (_, i) => {
    const t = (((i + 1) * gulden) % 1) * 2 - 1
    return midden + halveBreedte * t ** 3
  })
}

export function klopt(gevonden: number, verwacht: number): boolean {
  return Math.abs(gevonden - verwacht) <= TOLERANTIE * Math.max(1, Math.abs(verwacht))
}

export function afgerond(getal: number): string {
  return Number(getal.toPrecision(10)).toString()
}

export function melding(fout: unknown): string {
  return fout instanceof Error ? fout.message : String(fout)
}

/** De regel van Simpson; `null` zodra de integrand ergens niet bestaat. */
function integreer(f: (x: number) => number | null, van: number, tot: number): number | null {
  const h = (tot - van) / SIMPSON_STUKJES
  let som = 0
  for (let i = 0; i <= SIMPSON_STUKJES; i += 1) {
    const waarde = f(van + i * h)
    if (waarde === null) return null
    const gewicht = i === 0 || i === SIMPSON_STUKJES ? 1 : i % 2 === 1 ? 4 : 2
    som += gewicht * waarde
  }
  return (som * h) / 3
}

/** Extra's die een aanroep aan `controleerPrimitieve` kan meegeven. */
export type ControleerPrimitieveOpties = {
  /** Domein om proefpunten uit te kiezen. Standaard [[STANDAARD_DOMEIN]]. */
  domein?: [number, number]
  /** Zoveel proefpunten. Standaard [[AANTAL_PUNTEN]]. */
  aantalPunten?: number
  /** Zoveel proefpunten moeten minstens bruikbaar zijn. Standaard [[MINIMAAL_BRUIKBAAR]]. */
  minimaalBruikbaar?: number
  /** Doorgegeven aan `lees` voor zowel de integrand als de primitieve. */
  leesOpties?: LeesOpties
}

/**
 * Differentieert de primitieve en legt hem naast de integrand. Geeft per
 * probleem één regel in het Nederlands; leeg is goed.
 */
export function controleerPrimitieve(
  integrand: string,
  primitieve: string,
  hier: string,
  opties: ControleerPrimitieveOpties = {},
): string[] {
  const domein = opties.domein ?? STANDAARD_DOMEIN
  const aantalPunten = opties.aantalPunten ?? AANTAL_PUNTEN
  const minimaalBruikbaar = opties.minimaalBruikbaar ?? MINIMAAL_BRUIKBAAR
  const leesOpties = opties.leesOpties ?? {}

  let f: MathNode
  let F: MathNode
  try {
    f = lees(integrand, leesOpties)
  } catch (fout) {
    return [`${hier}: de integrand \`${integrand}\` is niet te lezen — ${melding(fout)}`]
  }
  try {
    F = lees(primitieve, leesOpties)
  } catch (fout) {
    return [`${hier}: de primitieve \`${primitieve}\` is niet te lezen — ${melding(fout)}`]
  }

  let afgeleide: MathNode
  try {
    afgeleide = derivative(F, 'x')
  } catch (fout) {
    return [`${hier}: de primitieve \`${primitieve}\` is niet te differentiëren — ${melding(fout)}`]
  }

  const bereken = { integrand: alsFunctie(f), afgeleide: alsFunctie(afgeleide) }
  let bruikbaar = 0
  const afwijkingen: string[] = []
  for (const x of proefpunten(domein, aantalPunten)) {
    const verwacht = bereken.integrand(x)
    const gevonden = bereken.afgeleide(x)
    if (verwacht === null || gevonden === null) continue
    bruikbaar += 1
    if (klopt(gevonden, verwacht)) continue
    afwijkingen.push(
      `bij x = ${afgerond(x)} geeft de afgeleide ${afgerond(gevonden)} en de integrand ${afgerond(verwacht)}`,
    )
  }

  const problemen: string[] = []
  if (afwijkingen.length > 0) {
    problemen.push(
      `${hier}: de afgeleide van \`${primitieve}\` is \`${afgeleide.toString()}\`, ` +
        `maar de opgave vraagt om een primitieve van \`${integrand}\` — ` +
        `${afwijkingen.slice(0, 2).join('; ')}` +
        `${afwijkingen.length > 2 ? ` (en zo bij nog ${afwijkingen.length - 2} van de ${bruikbaar} x-waarden)` : ''}.`,
    )
  }
  if (bruikbaar < minimaalBruikbaar) {
    problemen.push(
      `${hier}: maar ${bruikbaar} van de ${aantalPunten} proefpunten in het domein ` +
        `[${domein[0]}, ${domein[1]}] waren bruikbaar.`,
    )
  }
  return problemen
}

/** Rekent F(b) − F(a) uit voor een al gelezen primitieve en legt dat naast het antwoord. */
export function controleerBepaaldMetPrimitieve(
  primitieve: MathNode,
  van: number,
  tot: number,
  verwacht: number,
  hier: string,
): string[] {
  const F = alsFunctie(primitieve)
  for (const grens of [van, tot]) {
    if (F(grens) === null) {
      return [
        `${hier}: de primitieve bestaat niet bij x = ${afgerond(grens)}, ` +
          `terwijl dat wel een grens van de integraal is.`,
      ]
    }
  }
  const gevonden = (F(tot) as number) - (F(van) as number)
  if (klopt(gevonden, verwacht)) return []
  return [
    `${hier}: F(${afgerond(tot)}) − F(${afgerond(van)}) is ${afgerond(gevonden)}, ` +
      `maar er staat ${afgerond(verwacht)} als waarde.`,
  ]
}

/** Rekent een bepaalde integraal numeriek uit en legt hem naast het antwoord. */
export function controleerBepaald(
  integrand: string,
  van: number,
  tot: number,
  verwacht: number,
  hier: string,
): string[] {
  let f: (x: number) => number | null
  try {
    f = alsFunctie(lees(integrand))
  } catch (fout) {
    return [`${hier}: de integrand \`${integrand}\` is niet te lezen — ${melding(fout)}`]
  }
  const gevonden = integreer(f, van, tot)
  if (gevonden === null) {
    return [`${hier}: \`${integrand}\` bestaat niet overal tussen ${afgerond(van)} en ${afgerond(tot)}.`]
  }
  if (klopt(gevonden, verwacht)) return []
  return [
    `${hier}: de integraal van \`${integrand}\` tussen ${afgerond(van)} en ${afgerond(tot)} ` +
      `is ${afgerond(gevonden)}, maar er staat ${afgerond(verwacht)} als antwoord.`,
  ]
}
