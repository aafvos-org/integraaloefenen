import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { derivative, isComplex, parse, type MathNode } from 'mathjs'
import { describe, expect, it } from 'vitest'

// =====================================================================
// Elke primitieve in content/ wordt nagerekend door terug te differentiëren.
//
// Per vraag staat in de JSON een `integrand` en een `primitieve`. Deze test
// neemt de afgeleide van de primitieve naar x en vergelijkt die met de
// integrand op een rij x-waarden in het domein. Staat er ook `grenzen` en
// `waarde` bij, dan wordt F(b) − F(a) met die waarde vergeleken.
//
// Een melding noemt altijd het bestand, het vraagnummer en de x-waarde, zodat
// een rekenfout meteen te vinden is.
// =====================================================================

/** Zoveel x-waarden proberen we per vraag. */
const AANTAL_PUNTEN = 13

/** Zoveel punten moeten er overblijven, anders zegt de test niets. */
const MINIMAAL_BRUIKBAAR = 3

/** Toegestane afwijking: relatief, maar bij kleine waarden absoluut. */
const TOLERANTIE = 1e-6

/** Standaarddomein als een vraag zelf geen `domein` opgeeft. */
const STANDAARD_DOMEIN: [number, number] = [-2.5, 2.5]

/** Hierboven is een uitkomst zo groot dat vergelijken niets meer zegt. */
const TE_GROOT = 1e9

/** Namen die in een formule mogen staan naast de functies van mathjs. */
const TOEGESTANE_NAMEN = new Set(['x', 'e', 'pi', 'tau', 'phi'])

type Vraag = {
  nummer: string
  integrand: string
  primitieve: string
  domein: [number, number]
  grenzen: [number, number] | null
  waarde: string | number | null
}

// ---------------------------------------------------------------------
// Formules lezen
// ---------------------------------------------------------------------

/**
 * mathjs kent geen `ln`, maar schrijft de natuurlijke logaritme als `log`.
 * In de wiskundeles is `log` juist de logaritme met grondtal 10, dus laten we
 * `log(...)` helemaal niet toe: schrijf `ln(...)` of `log10(...)`.
 */
function lees(formule: string): MathNode {
  if (/\blog\s*\(/.test(formule)) {
    throw new Error(
      'schrijf `ln(...)` voor de natuurlijke logaritme en `log10(...)` voor die met grondtal 10; `log(...)` is te verwarrend',
    )
  }

  const node = parse(formule.replace(/\bln\s*\(/g, 'log('))

  const onbekend = node
    .filter(
      (kind, pad, ouder) =>
        kind.type === 'SymbolNode' && !(ouder?.type === 'FunctionNode' && pad === 'fn'),
    )
    .map((kind) => (kind as unknown as { name: string }).name)
    .filter((naam) => !TOEGESTANE_NAMEN.has(naam))

  if (onbekend.length > 0) {
    throw new Error(
      `onbekende naam ${[...new Set(onbekend)].map((naam) => `\`${naam}\``).join(', ')} — gebruik alleen x (en laat de integratieconstante weg)`,
    )
  }

  return node
}

/** Maakt van een formule een functie die `null` geeft waar hij niet bestaat. */
function alsFunctie(node: MathNode): (x: number) => number | null {
  const gecompileerd = node.compile()
  return (x) => {
    let uitkomst: unknown
    try {
      uitkomst = gecompileerd.evaluate({ x })
    } catch {
      return null
    }
    if (isComplex(uitkomst)) return null
    if (typeof uitkomst !== 'number') return null
    if (!Number.isFinite(uitkomst) || Math.abs(uitkomst) > TE_GROOT) return null
    return uitkomst
  }
}

/** Rekent een losse waarde uit (een getal of een formule zonder x). */
function alsGetal(waarde: string | number): number {
  if (typeof waarde === 'number') return waarde
  const uitkomst = alsFunctie(lees(waarde))(Number.NaN)
  if (uitkomst === null) throw new Error(`\`${waarde}\` levert geen gewoon getal op`)
  return uitkomst
}

/**
 * Dertien punten die netjes over het domein verdeeld liggen, maar niet op
 * ronde getallen — daar zitten juist de asymptoten en de nulpunten.
 */
function proefpunten([begin, eind]: [number, number]): number[] {
  const gulden = 0.618033988749895
  return Array.from({ length: AANTAL_PUNTEN }, (_, i) => {
    const deel = ((i + 1) * gulden) % 1
    return begin + (eind - begin) * deel
  })
}

function klopt(gevonden: number, verwacht: number): boolean {
  return Math.abs(gevonden - verwacht) <= TOLERANTIE * Math.max(1, Math.abs(verwacht))
}

function afgerond(getal: number): string {
  return Number(getal.toPrecision(10)).toString()
}

// ---------------------------------------------------------------------
// Eén vraag nakijken
// ---------------------------------------------------------------------

/** Geeft per gevonden probleem één regel in het Nederlands; leeg is goed. */
function controleerVraag(vraag: Vraag, bestand: string): string[] {
  const hier = `${bestand}, vraag ${vraag.nummer}`
  const problemen: string[] = []

  let integrand: MathNode
  let primitieve: MathNode
  try {
    integrand = lees(vraag.integrand)
  } catch (fout) {
    return [`${hier}: de integrand \`${vraag.integrand}\` is niet te lezen — ${melding(fout)}`]
  }
  try {
    primitieve = lees(vraag.primitieve)
  } catch (fout) {
    return [`${hier}: de primitieve \`${vraag.primitieve}\` is niet te lezen — ${melding(fout)}`]
  }

  let afgeleide: MathNode
  try {
    afgeleide = derivative(primitieve, 'x')
  } catch (fout) {
    return [
      `${hier}: de primitieve \`${vraag.primitieve}\` is niet te differentiëren — ${melding(fout)}`,
    ]
  }

  const bereken = {
    integrand: alsFunctie(integrand),
    afgeleide: alsFunctie(afgeleide),
  }

  let bruikbaar = 0
  const afwijkingen: string[] = []
  for (const x of proefpunten(vraag.domein)) {
    const verwacht = bereken.integrand(x)
    const gevonden = bereken.afgeleide(x)
    if (verwacht === null || gevonden === null) continue
    bruikbaar += 1
    if (klopt(gevonden, verwacht)) continue

    afwijkingen.push(
      `bij x = ${afgerond(x)} geeft de afgeleide ${afgerond(gevonden)} en de integrand ${afgerond(verwacht)}`,
    )
  }

  if (afwijkingen.length > 0) {
    // Eén melding per vraag, met de eerste paar x-waarden als bewijs. Alle
    // dertien eronder zetten maakt de uitvoer onleesbaar.
    problemen.push(
      `${hier}: de afgeleide van \`${vraag.primitieve}\` is \`${afgeleide.toString()}\`, ` +
        `maar er staat \`${vraag.integrand}\` als integrand — ` +
        `${afwijkingen.slice(0, 2).join('; ')}` +
        `${afwijkingen.length > 2 ? ` (en zo bij nog ${afwijkingen.length - 2} van de ${bruikbaar} x-waarden)` : ''}.`,
    )
  }

  if (bruikbaar < MINIMAAL_BRUIKBAAR) {
    problemen.push(
      `${hier}: maar ${bruikbaar} van de ${AANTAL_PUNTEN} x-waarden in het domein ` +
        `[${vraag.domein[0]}, ${vraag.domein[1]}] waren bruikbaar; geef een \`domein\` op waar beide formules wél bestaan.`,
    )
  }

  if (vraag.grenzen !== null && vraag.waarde !== null) {
    problemen.push(...controleerBepaald(vraag, primitieve, hier))
  }

  return problemen
}

/** Kijkt na of F(b) − F(a) de opgegeven waarde oplevert. */
function controleerBepaald(vraag: Vraag, primitieve: MathNode, hier: string): string[] {
  const [a, b] = vraag.grenzen as [number, number]
  const F = alsFunctie(primitieve)

  let verwacht: number
  try {
    verwacht = alsGetal(vraag.waarde as string | number)
  } catch (fout) {
    return [`${hier}: de waarde \`${vraag.waarde}\` is niet te lezen — ${melding(fout)}`]
  }

  for (const grens of [a, b]) {
    if (F(grens) === null) {
      return [
        `${hier}: de primitieve \`${vraag.primitieve}\` bestaat niet bij x = ${afgerond(grens)}, ` +
          `terwijl dat wel een grens van de integraal is.`,
      ]
    }
  }

  const gevonden = (F(b) as number) - (F(a) as number)
  if (klopt(gevonden, verwacht)) return []

  return [
    `${hier}: F(${afgerond(b)}) − F(${afgerond(a)}) is ${afgerond(gevonden)}, ` +
      `maar er staat ${afgerond(verwacht)} als waarde.`,
  ]
}

function melding(fout: unknown): string {
  return fout instanceof Error ? fout.message : String(fout)
}

// ---------------------------------------------------------------------
// De bestanden in content/
// ---------------------------------------------------------------------

const CONTENT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../content')

type Vragenbestand = { pad: string; vragen: Vraag[] }

/**
 * Numerieke vragen hebben geen primitieve om te differentiëren. Die staan in
 * een bestand met `"soort": "numeriek"` en worden nagekeken door
 * `h11-numeriek.test.ts`.
 */
function isNumeriekBestand(naam: string): boolean {
  const rauw = JSON.parse(readFileSync(path.join(CONTENT, naam), 'utf8')) as { soort?: unknown }
  return rauw.soort === 'numeriek'
}

function zoekBestanden(): string[] {
  if (!existsSync(CONTENT)) return []
  return readdirSync(CONTENT, { recursive: true, encoding: 'utf8' })
    .filter((naam) => naam.endsWith('.json') && naam.startsWith('hoofdstuk-'))
    .map((naam) => naam.split(path.sep).join('/'))
    .filter((naam) => !isNumeriekBestand(naam))
    .sort()
}

/** Leest één bestand; een fout in de opbouw gooit meteen, met het pad erbij. */
function leesBestand(pad: string): Vragenbestand {
  const rauw = JSON.parse(readFileSync(path.join(CONTENT, pad), 'utf8')) as unknown
  const vragen = (rauw as { vragen?: unknown })?.vragen

  if (!Array.isArray(vragen)) {
    throw new Error(`content/${pad}: er staat geen lijst \`vragen\` in dit bestand.`)
  }

  return {
    pad,
    vragen: vragen.map((vraag, i) => leesVraag(vraag, `content/${pad}`, i)),
  }
}

function leesVraag(rauw: unknown, bestand: string, i: number): Vraag {
  const vraag = rauw as Record<string, unknown>
  const nummer = vraag?.nummer
  const hier = `${bestand}, vraag ${nummer ?? `op plek ${i + 1}`}`

  if (typeof nummer !== 'string' && typeof nummer !== 'number') {
    throw new Error(`${hier}: \`nummer\` ontbreekt of is geen tekst of getal.`)
  }
  for (const veld of ['integrand', 'primitieve'] as const) {
    if (typeof vraag[veld] !== 'string' || vraag[veld].trim() === '') {
      throw new Error(`${hier}: \`${veld}\` ontbreekt of is leeg.`)
    }
  }

  const domein = leesPaar(vraag.domein, `${hier}: \`domein\``) ?? STANDAARD_DOMEIN
  if (domein[0] >= domein[1]) {
    throw new Error(`${hier}: \`domein\` moet oplopen, dus [klein, groot].`)
  }

  const grenzen = leesPaar(vraag.grenzen, `${hier}: \`grenzen\``)
  const waarde = vraag.waarde ?? null
  if (waarde !== null && typeof waarde !== 'string' && typeof waarde !== 'number') {
    throw new Error(`${hier}: \`waarde\` moet een getal of een formule tussen aanhalingstekens zijn.`)
  }
  if (grenzen !== null && waarde === null) {
    throw new Error(`${hier}: er staan \`grenzen\` bij, maar geen \`waarde\` om mee te vergelijken.`)
  }
  if (grenzen === null && waarde !== null) {
    throw new Error(`${hier}: er staat een \`waarde\` bij, maar geen \`grenzen\`.`)
  }

  return {
    nummer: String(nummer),
    integrand: vraag.integrand as string,
    primitieve: vraag.primitieve as string,
    domein,
    grenzen,
    waarde,
  }
}

function leesPaar(rauw: unknown, hier: string): [number, number] | null {
  if (rauw === undefined || rauw === null) return null
  if (!Array.isArray(rauw) || rauw.length !== 2 || !rauw.every((n) => typeof n === 'number' && Number.isFinite(n))) {
    throw new Error(`${hier} moet een lijstje van twee getallen zijn, bijvoorbeeld [0, 2].`)
  }
  return [rauw[0], rauw[1]]
}

// ---------------------------------------------------------------------
// De tests
// ---------------------------------------------------------------------

const paden = zoekBestanden()

describe('de vragen in content/', () => {
  it('vindt minstens één vragenbestand', () => {
    expect(paden.length).toBeGreaterThan(0)
  })

  for (const pad of paden) {
    describe(`content/${pad}`, () => {
      let bestand: Vragenbestand | null = null
      let leesfout: unknown = null
      try {
        bestand = leesBestand(pad)
      } catch (fout) {
        leesfout = fout
      }

      if (bestand === null) {
        it('is goed opgebouwd', () => {
          expect.fail(melding(leesfout))
        })
        return
      }

      it('heeft vragen met elk een eigen nummer', () => {
        const nummers = bestand.vragen.map((vraag) => vraag.nummer)
        expect(nummers.length).toBeGreaterThan(0)
        expect([...new Set(nummers)]).toHaveLength(nummers.length)
      })

      for (const vraag of bestand.vragen) {
        it(`vraag ${vraag.nummer}: de afgeleide van de primitieve is de integrand`, () => {
          const problemen = controleerVraag(vraag, `content/${pad}`)
          if (problemen.length > 0) expect.fail(problemen.join('\n'))
        })
      }
    })
  }
})

// =====================================================================
// En de test zelf: een bewust foute primitieve moet rood worden.
// =====================================================================

function vraag(partieel: Partial<Vraag> = {}): Vraag {
  return {
    nummer: 'test',
    integrand: '3 * x^2',
    primitieve: 'x^3',
    domein: STANDAARD_DOMEIN,
    grenzen: null,
    waarde: null,
    ...partieel,
  }
}

describe('controleerVraag', () => {
  it('laat een kloppende primitieve door', () => {
    expect(controleerVraag(vraag(), 'content/in-het-geheugen.json')).toEqual([])
  })

  it('ziet een rekenfout in de primitieve', () => {
    // De primitieve van 3x² is x³, niet 3x³: een factor 3 te veel.
    const problemen = controleerVraag(vraag({ nummer: '2b', primitieve: '3 * x^3' }), 'content/fout.json')

    expect(problemen.length).toBeGreaterThan(0)
    expect(problemen[0]).toContain('content/fout.json')
    expect(problemen[0]).toContain('vraag 2b')
    expect(problemen[0]).toContain('x = ')
  })

  it('ziet een verkeerde uitkomst bij een bepaalde integraal', () => {
    const problemen = controleerVraag(
      vraag({ nummer: '3a', grenzen: [0, 2], waarde: 9 }),
      'content/fout.json',
    )

    expect(problemen).toHaveLength(1)
    expect(problemen[0]).toContain('is 8')
    expect(problemen[0]).toContain('9 als waarde')
  })

  it('leest ln als de natuurlijke logaritme', () => {
    expect(
      controleerVraag(vraag({ integrand: '1 / x', primitieve: 'ln(x)', domein: [0.5, 4] }), 'content/ln.json'),
    ).toEqual([])
  })

  it('weigert log, omdat dat grondtal 10 of e kan betekenen', () => {
    const problemen = controleerVraag(
      vraag({ integrand: '1 / x', primitieve: 'log(x)', domein: [0.5, 4] }),
      'content/log.json',
    )

    expect(problemen).toHaveLength(1)
    expect(problemen[0]).toContain('log10')
  })

  it('weigert een integratieconstante in de primitieve', () => {
    const problemen = controleerVraag(vraag({ primitieve: 'x^3 + C' }), 'content/constante.json')

    expect(problemen).toHaveLength(1)
    expect(problemen[0]).toContain('`C`')
  })

  it('klaagt als er te weinig bruikbare x-waarden overblijven', () => {
    // De wortel bestaat alleen rechts van nul; op [-4, -1] blijft er niets over.
    const problemen = controleerVraag(
      vraag({ integrand: '1 / sqrt(x)', primitieve: '2 * sqrt(x)', domein: [-4, -1] }),
      'content/domein.json',
    )

    expect(problemen).toHaveLength(1)
    expect(problemen[0]).toContain('bruikbaar')
  })
})
