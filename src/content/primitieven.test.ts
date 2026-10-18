import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { MathNode } from 'mathjs'
import { describe, expect, it } from 'vitest'

import {
  alsGetal,
  controleerBepaaldMetPrimitieve,
  controleerPrimitieve,
  lees,
  melding,
  STANDAARD_DOMEIN,
} from './narekenen.testhulp'

// =====================================================================
// Elke primitieve in content/ wordt nagerekend door terug te differentiëren.
//
// Per vraag staat in de JSON een `integrand` en een `primitieve`. Deze test
// neemt de afgeleide van de primitieve naar x en vergelijkt die met de
// integrand op een rij x-waarden in het domein. Staat er ook `grenzen` en
// `waarde` bij, dan wordt F(b) − F(a) met die waarde vergeleken.
//
// Het lezen van een formule, het terugdifferentiëren en het vergelijken op
// proefpunten staat in `narekenen.testhulp.ts`, samen met `voorbeelden.test.ts`.
//
// Een melding noemt altijd het bestand, het vraagnummer en de x-waarde, zodat
// een rekenfout meteen te vinden is.
// =====================================================================

/** Zoveel x-waarden proberen we per vraag. */
const AANTAL_PUNTEN = 13

/** Zoveel punten moeten er overblijven, anders zegt de test niets. */
const MINIMAAL_BRUIKBAAR = 3

/** Namen die een vraag in content/ mag gebruiken naast de functies van mathjs. */
const LEES_OPTIES = {
  extraNamen: ['tau', 'phi'],
  weigerLog: true,
  onbekendeNaamHint: 'gebruik alleen x (en laat de integratieconstante weg)',
}

type Vraag = {
  nummer: string
  integrand: string
  primitieve: string
  domein: [number, number]
  grenzen: [number, number] | null
  waarde: string | number | null
}

// ---------------------------------------------------------------------
// Eén vraag nakijken
// ---------------------------------------------------------------------

/** Geeft per gevonden probleem één regel in het Nederlands; leeg is goed. */
function controleerVraag(vraag: Vraag, bestand: string): string[] {
  const hier = `${bestand}, vraag ${vraag.nummer}`
  const problemen = controleerPrimitieve(vraag.integrand, vraag.primitieve, hier, {
    domein: vraag.domein,
    aantalPunten: AANTAL_PUNTEN,
    minimaalBruikbaar: MINIMAAL_BRUIKBAAR,
    leesOpties: LEES_OPTIES,
  })

  if (vraag.grenzen !== null && vraag.waarde !== null) {
    problemen.push(...controleerBepaald(vraag, hier))
  }

  return problemen
}

/** Kijkt na of F(b) − F(a) de opgegeven waarde oplevert. */
function controleerBepaald(vraag: Vraag, hier: string): string[] {
  const [a, b] = vraag.grenzen as [number, number]

  let primitieve: MathNode
  try {
    primitieve = lees(vraag.primitieve, LEES_OPTIES)
  } catch (fout) {
    return [`${hier}: de primitieve \`${vraag.primitieve}\` is niet te lezen — ${melding(fout)}`]
  }

  let verwacht: number
  try {
    verwacht = alsGetal(vraag.waarde as string | number, {}, LEES_OPTIES)
  } catch (fout) {
    return [`${hier}: de waarde \`${vraag.waarde}\` is niet te lezen — ${melding(fout)}`]
  }

  return controleerBepaaldMetPrimitieve(primitieve, a, b, verwacht, hier)
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
