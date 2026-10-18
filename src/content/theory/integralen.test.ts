import { describe, expect, it } from 'vitest'

import { THEORY_OVERVIEW } from './integralen'
import {
  afgerond,
  alsGetal,
  controleerBepaald,
  controleerPrimitieve,
  klopt,
  latexNaarFormule,
  leesArgument,
} from '../narekenen.testhulp'
import type { OverviewCard, OverviewChapter, OverviewExample } from './types'

// =====================================================================
// Elke uitgewerkte opgave in de theorie wordt nagerekend.
//
// Het vertalen van LaTeX naar een formule voor mathjs en het terug
// differentiëren staan in `narekenen.testhulp.ts`; hier staat alleen hoe
// de opgaven van THEORY_OVERVIEW gelezen worden. Per soort opgave:
//
//   • `\int f\,dx` met een antwoord op `+c`  → differentieer het antwoord
//     terug en leg het naast de integrand, zoals `primitieven.test.ts`.
//   • `\int_a^b f\,dx` met een exact getal   → reken de integraal
//     numeriek uit en leg hem naast dat getal.
//   • `f(x)=…` met `F(x)=…+c`                → differentieer F terug.
//   • een verhaaltje (oppervlakte, inhoud, "zoek p") → de lezing ervan
//     staat in `HANDMATIG`; de test rekent die integraal uit en gebruikt
//     daarbij het antwoord uit de content.
//
// Een opgave die in geen van deze vier vormen past, maakt de test rood:
// zo kan er niets ongemerkt langs.
// =====================================================================

// ---------------------------------------------------------------------
// Verhaaltjes: hoe de test ze leest
// ---------------------------------------------------------------------

/**
 * Een opgave met een verhaaltje (deel 1 of deel 3) is geen kale integraal.
 * Welke integraal er bedoeld wordt, staat hier — afgeleid uit de opgave en
 * de stappen eronder. `A` is het antwoord zoals het in de content staat, dus
 * een tikfout daarin loopt altijd ergens vast.
 */
type Handmatige = {
  /** Hoe de test het verhaaltje leest, in één zin. */
  lezing: string
  integrand: string
  van: string
  tot: string
  /** Wat de integraal moet opleveren. */
  uitkomst: string
}

const HANDMATIG: Record<string, Handmatige> = {
  'oppervlakte/opp_boven#0': {
    lezing: 'Van het nulpunt x = 0 tot x = 1 ligt de grafiek boven de x-as.',
    integrand: '4 * x * (x^2 + 1)^2',
    van: '0',
    tot: '1',
    uitkomst: 'A',
  },
  'oppervlakte/opp_onder#0': {
    lezing: 'Van de y-as (x = 0) tot het nulpunt x = 1 ligt de grafiek onder de x-as, dus de oppervlakte is min de integraal.',
    integrand: '(x - 1) * e^x',
    van: '0',
    tot: '1',
    uitkomst: '-A',
  },
  'oppervlakte/opp_twee#0': {
    lezing: 'De grafieken snijden elkaar bij x = 1/e en x = e; daartussen ligt h erboven, dus boven min onder.',
    integrand: '1 / x - ln(x)^2 / x',
    van: '1 / e',
    tot: 'e',
    uitkomst: 'A',
  },
  'oppervlakte/opp_p#0': {
    lezing: 'Met de p uit het antwoord moet de oppervlakte van 0 tot p gelijk zijn aan ln(5).',
    integrand: '2 * x / (x^2 + 1)',
    van: '0',
    tot: 'A',
    uitkomst: 'ln(5)',
  },
  'inhoud/inh_grenzen#0': {
    lezing: 'Wentelen van het nulpunt x = 0 tot x = 1; de inhoud is pi maal de integraal van f(x)^2.',
    integrand: '(e^(x / 2) * sqrt(x))^2',
    van: '0',
    tot: '1',
    uitkomst: 'A / pi',
  },
  'inhoud/inh_onder#0': {
    lezing: 'Wentelen van de y-as (x = 0) tot het nulpunt x = 2; de straal wordt gekwadrateerd, dus geen minteken.',
    integrand: '(x - 2)^2',
    van: '0',
    tot: '2',
    uitkomst: 'A / pi',
  },
  'inhoud/inh_twee#0': {
    lezing: 'De grafieken snijden elkaar bij x = 0 en x = 4; h = sqrt(x) ligt daar verder van de x-as dan f = x/2.',
    integrand: '(sqrt(x))^2 - (x / 2)^2',
    van: '0',
    tot: '4',
    uitkomst: 'A / pi',
  },
  'inhoud/inh_p#0': {
    lezing: 'Het kwadraat van f is 2x/(x^2+1); met de p uit het antwoord moet pi maal de integraal van 0 tot p gelijk zijn aan pi*ln(5).',
    integrand: '2 * x / (x^2 + 1)',
    van: '0',
    tot: 'A',
    uitkomst: 'ln(5)',
  },
  'k3/k3_verhaaltjes#0': {
    lezing: 'O(W_p) is de integraal van x = 4 tot x = p; met de p uit het antwoord moet die 10 zijn.',
    integrand: '10 / (x^2 - 8 * x + 17)',
    van: '4',
    tot: 'A',
    uitkomst: '10',
  },
  'k3/k3_verhaaltjes#1': {
    lezing: 'O(V_p) is de integraal van x = 1 tot x = p; met de p uit het antwoord moet die pi zijn.',
    integrand: '4 / (x * ln(x)^2 + x)',
    van: '1',
    tot: 'A',
    uitkomst: 'pi',
  },
  'k3/k3_verhaaltjes#2': {
    lezing: 'De grafiek snijdt de lijn y = 1/2 bij x = 1 en x = 3 en ligt daartussen erboven.',
    integrand: '1 / (x^2 - 4 * x + 5) - 1 / 2',
    van: '1',
    tot: '3',
    uitkomst: 'A',
  },
  'k3/k3_verhaaltjes#3': {
    lezing: 'Van het nulpunt x = 0 tot x = sqrt(10)/2 ligt de grafiek boven de x-as.',
    integrand: 'x / sqrt(25 - x^4)',
    van: '0',
    tot: '1 / 2 * sqrt(10)',
    uitkomst: 'A',
  },
}

/**
 * Een primitieve bij elke zelftest-vraag, hier uitgerekend. Zo blijft de vraag
 * zelf nagerekend, ook al is het antwoord daar een routenaam en geen formule.
 */
const ZELFTEST_PRIMITIEVEN: Record<string, string> = {
  'k3/k3_zelftest#0': 'sqrt(3) * atan(x / sqrt(3))',
  'k3/k3_zelftest#1': '3 * atan(x + 2)',
  'k3/k3_zelftest#2': '1 / 2 * atan(x^2)',
  'k3/k3_zelftest#3': '1 / 2 * asin(2 * x)',
  'k3/k3_zelftest#4': '1 / 2 * asin(x)^2',
  'k3/k3_zelftest#5': 'x * asin(x) + sqrt(1 - x^2)',
}

// ---------------------------------------------------------------------
// Een opgave lezen
// ---------------------------------------------------------------------

type Integraal = { integrand: string; van: string | null; tot: string | null }

/** Leest `\int f\,dx` of `\int_{a}^{b} f\,dx`; `null` als het geen integraal is. */
function leesIntegraal(latex: string): Integraal | null {
  const s = latex.trim()
  if (!s.startsWith('\\int')) return null
  let i = '\\int'.length
  let van: string | null = null
  let tot: string | null = null
  if (s[i] === '_') {
    const grens = leesArgument(s, i + 1)
    van = grens.arg
    i = grens.eind
  }
  if (s[i] === '^') {
    const grens = leesArgument(s, i + 1)
    tot = grens.arg
    i = grens.eind
  }
  const rest = s.slice(i)
  if (!rest.endsWith('\\,dx')) {
    throw new Error(`de integraal \`${latex}\` eindigt niet op \`\\,dx\``)
  }
  if ((van === null) !== (tot === null)) {
    throw new Error(`de integraal \`${latex}\` heeft maar één grens`)
  }
  return { integrand: rest.slice(0, -'\\,dx'.length), van, tot }
}

/** Leest `f(x)=…`; `null` als de opgave er niet zo uitziet. */
function leesFunctie(latex: string): { letter: string; formule: string } | null {
  const gevonden = /^([fgh])\(x\)=([^,:]*)$/.exec(latex.trim())
  if (gevonden === null || latex.includes('\\text')) return null
  return { letter: gevonden[1], formule: gevonden[2] }
}

function sleutelVan(hoofdstuk: OverviewChapter, kaart: OverviewCard, i: number): string {
  return `${hoofdstuk.slug}/${kaart.id}#${i}`
}

/** Hoort bij deze opgave een eigen lezing in `HANDMATIG`? */
function isVerhaaltje(problem: string): boolean {
  return leesIntegraal(problem) === null && leesFunctie(problem) === null
}

function controleerVoorbeeld(voorbeeld: OverviewExample, sleutel: string): string[] {
  const hier = sleutel
  const handmatig = HANDMATIG[sleutel]
  if (handmatig !== undefined) {
    const A = alsGetal(latexNaarFormule(voorbeeld.answer.replace(/^p=/, '')))
    return controleerBepaald(
      handmatig.integrand,
      alsGetal(handmatig.van, { A }),
      alsGetal(handmatig.tot, { A }),
      alsGetal(handmatig.uitkomst, { A }),
      `${hier} (${handmatig.lezing})`,
    )
  }

  const integraal = leesIntegraal(voorbeeld.problem)
  if (integraal !== null && integraal.van === null) {
    if (!voorbeeld.answer.endsWith('+c')) {
      return [`${hier}: een onbepaalde integraal hoort op \`+c\` te eindigen, maar er staat \`${voorbeeld.answer}\`.`]
    }
    return controleerPrimitieve(
      latexNaarFormule(integraal.integrand),
      latexNaarFormule(voorbeeld.answer.slice(0, -'+c'.length)),
      hier,
    )
  }

  if (integraal !== null && integraal.van !== null && integraal.tot !== null) {
    const antwoord = latexNaarFormule(voorbeeld.answer)
    if (/\bx\b/.test(antwoord)) {
      return [`${hier}: een bepaalde integraal hoort een getal als antwoord te hebben, maar er staat \`${voorbeeld.answer}\`.`]
    }
    return controleerBepaald(
      latexNaarFormule(integraal.integrand),
      alsGetal(latexNaarFormule(integraal.van)),
      alsGetal(latexNaarFormule(integraal.tot)),
      alsGetal(antwoord),
      hier,
    )
  }

  const functie = leesFunctie(voorbeeld.problem)
  if (functie !== null) {
    const hoofdletter = functie.letter.toUpperCase()
    const antwoord = new RegExp(`^${hoofdletter}\\(x\\)=(.*)\\+c$`).exec(voorbeeld.answer.trim())
    if (antwoord === null) {
      return [
        `${hier}: bij \`${functie.letter}(x)=…\` hoort een antwoord \`${hoofdletter}(x)=…+c\`, ` +
          `maar er staat \`${voorbeeld.answer}\`.`,
      ]
    }
    return controleerPrimitieve(latexNaarFormule(functie.formule), latexNaarFormule(antwoord[1]), hier)
  }

  return [`${hier}: deze opgave kent de test niet; zet de lezing ervan in \`HANDMATIG\`.`]
}

// ---------------------------------------------------------------------
// De tests
// ---------------------------------------------------------------------

describe('de uitgewerkte voorbeelden in de theorie', () => {
  for (const hoofdstuk of THEORY_OVERVIEW) {
    describe(`${hoofdstuk.code ?? hoofdstuk.slug} — ${hoofdstuk.title}`, () => {
      for (const kaart of hoofdstuk.cards) {
        for (const [i, voorbeeld] of (kaart.examples ?? []).entries()) {
          it(`${kaart.id} #${i + 1}: het antwoord klopt`, () => {
            const problemen = controleerVoorbeeld(voorbeeld, sleutelVan(hoofdstuk, kaart, i))
            if (problemen.length > 0) expect.fail(problemen.join('\n'))
          })
        }
      }
    })
  }

  it('heeft overal voorbeelden om na te rekenen', () => {
    const aantal = THEORY_OVERVIEW.flatMap((h) => h.cards).flatMap((k) => k.examples ?? []).length
    expect(aantal).toBeGreaterThan(30)
  })
})

describe('de verhaaltjes in de theorie', () => {
  const verhaaltjes = THEORY_OVERVIEW.flatMap((hoofdstuk) =>
    hoofdstuk.cards.flatMap((kaart) =>
      (kaart.examples ?? [])
        .map((voorbeeld, i) => ({ voorbeeld, sleutel: sleutelVan(hoofdstuk, kaart, i) }))
        .filter(({ voorbeeld }) => isVerhaaltje(voorbeeld.problem))
        .map(({ sleutel }) => sleutel),
    ),
  )

  it('staan allemaal in HANDMATIG, en HANDMATIG gaat nergens anders over', () => {
    expect(verhaaltjes.sort()).toEqual(Object.keys(HANDMATIG).sort())
  })

  it('gebruiken allemaal het antwoord uit de content', () => {
    for (const [sleutel, lezing] of Object.entries(HANDMATIG)) {
      const gebruikt = [lezing.van, lezing.tot, lezing.uitkomst].join(' ')
      expect(/\bA\b/.test(gebruikt), sleutel).toBe(true)
    }
  })
})

describe('de zelftest in de theorie', () => {
  const vragen = THEORY_OVERVIEW.flatMap((hoofdstuk) =>
    hoofdstuk.cards.flatMap((kaart) =>
      (kaart.herken ?? []).map((vraag, i) => ({
        vraag,
        sleutel: sleutelVan(hoofdstuk, kaart, i),
        routes: (hoofdstuk.stappenplan?.herken ?? []).map((rij) => rij.regel),
      })),
    ),
  )

  it('heeft bij elke vraag een primitieve om mee na te rekenen', () => {
    expect(vragen.map(({ sleutel }) => sleutel).sort()).toEqual(Object.keys(ZELFTEST_PRIMITIEVEN).sort())
  })

  for (const { vraag, sleutel, routes } of vragen) {
    it(`${sleutel}: de opgave klopt en de route bestaat`, () => {
      expect(routes, `${sleutel}: route \`${vraag.regel}\` staat niet in de keuzehulp`).toContain(
        vraag.regel,
      )
      const integraal = leesIntegraal(vraag.problem)
      expect(integraal, `${sleutel}: de vraag is geen integraal`).not.toBeNull()
      const problemen = controleerPrimitieve(
        latexNaarFormule((integraal as Integraal).integrand),
        ZELFTEST_PRIMITIEVEN[sleutel],
        sleutel,
      )
      if (problemen.length > 0) expect.fail(problemen.join('\n'))
    })
  }
})

describe('de tabellen met exacte waarden', () => {
  const tabellen = THEORY_OVERVIEW.flatMap((hoofdstuk) =>
    hoofdstuk.cards.flatMap((kaart) => {
      const kop = kaart.table?.headers
      if (kop === undefined || kop.length !== 2 || kop[0] !== '$x$') return []
      const functie = /^\$\\(arcsin|arctan)\(x\)\$$/.exec(kop[1])
      if (functie === null) return []
      return [{ kaart: kaart.id, functie: functie[1], rijen: kaart.table?.rows ?? [] }]
    }),
  )

  it('zijn er twee: één voor arctan en één voor arcsin', () => {
    expect(tabellen.map((t) => t.functie).sort()).toEqual(['arcsin', 'arctan'])
  })

  for (const tabel of tabellen) {
    it(`${tabel.kaart}: elke rij klopt`, () => {
      const problemen: string[] = []
      for (const [x, waarde] of tabel.rijen) {
        const links = alsGetal(latexNaarFormule(x.replace(/^\$|\$$/g, '')))
        const rechts = alsGetal(latexNaarFormule(waarde.replace(/^\$|\$$/g, '')))
        const gevonden = tabel.functie === 'arctan' ? Math.atan(links) : Math.asin(links)
        if (!klopt(gevonden, rechts)) {
          problemen.push(`${tabel.functie}(${afgerond(links)}) is ${afgerond(gevonden)}, maar er staat ${afgerond(rechts)}`)
        }
      }
      if (problemen.length > 0) expect.fail(problemen.join('\n'))
    })
  }
})

// =====================================================================
// En de vertaling zelf: leest de test LaTeX zoals een leerling hem leest?
// =====================================================================

describe('latexNaarFormule', () => {
  it('zet breuken, wortels en maaltekens om', () => {
    expect(latexNaarFormule('6x^2')).toBe('6*x^2')
    expect(latexNaarFormule('\\tfrac{2}{3}x^{\\frac{3}{2}}')).toBe('((2)/(3))*x^(((3)/(2)))')
    expect(latexNaarFormule('10x(2x^2-1)^4')).toBe('10*x*(2*x^2-1)^4')
    expect(latexNaarFormule('-\\tfrac13\\sqrt3')).toBe('-((1)/(3))*sqrt(3)')
  })

  it('leest een gemengd getal als een optelling', () => {
    expect(alsGetal(latexNaarFormule('1\\frac12'))).toBeCloseTo(1.5, 12)
    expect(alsGetal(latexNaarFormule('1\\frac12\\sqrt2'))).toBeCloseTo(1.5 * Math.SQRT2, 12)
  })

  it('zet de macht achter de functie, niet erin', () => {
    expect(alsGetal(latexNaarFormule('\\cos^2(0)'))).toBeCloseTo(1, 12)
    expect(latexNaarFormule('\\arctan^2(x)')).toBe('(atan(x))^2')
  })

  it('leest absolute strepen als abs', () => {
    expect(latexNaarFormule('2\\ln|x|')).toBe('2*ln(abs(x))')
  })

  it('klaagt over een commando dat hij niet kent', () => {
    expect(() => latexNaarFormule('\\sinh(x)')).toThrow('kent het LaTeX-commando')
    expect(() => latexNaarFormule('\\theta')).toThrow('kent het LaTeX-commando')
  })
})

describe('controleerPrimitieve', () => {
  it('laat een kloppende primitieve door', () => {
    expect(controleerPrimitieve('3 * x^2', 'x^3', 'proef')).toEqual([])
  })

  it('ziet een rekenfout in het antwoord', () => {
    // De primitieve van 3x² is x³, niet 3x³: een factor 3 te veel.
    const problemen = controleerPrimitieve('3 * x^2', '3 * x^3', 'proef')
    expect(problemen.length).toBeGreaterThan(0)
    expect(problemen[0]).toContain('proef')
    expect(problemen[0]).toContain('x = ')
  })
})

describe('controleerBepaald', () => {
  it('laat een kloppende uitkomst door', () => {
    expect(controleerBepaald('3 * x^2', 0, 2, 8, 'proef')).toEqual([])
  })

  it('ziet een tikfout in de uitkomst', () => {
    const problemen = controleerBepaald('3 * x^2', 0, 2, 9, 'proef')
    expect(problemen).toHaveLength(1)
    expect(problemen[0]).toContain('is 8')
    expect(problemen[0]).toContain('9 als antwoord')
  })
})
