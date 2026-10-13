/**
 * H11 — Integralen numeriek berekenen.
 *
 * Eigen oefenvragen: een integraal of oppervlakte benaderen met de
 * grafische rekenmachine en afronden op twee decimalen. Geen primitieve,
 * geen boekopgaven.
 *
 * Draaien met:  npx jiti scripts/h11-numeriek-content.ts
 *
 * Schrijft:
 *   • content/hoofdstuk-h11/h11-numeriek.json
 *   • supabase/migrations/0073_h11_numeriek.sql
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { parse } from 'mathjs'

import {
  generateAdditiveMigration,
  r,
  type AdditiveChapter,
  type AdditiveQ,
  type Steps,
} from './lib/stappenplan-content'

const DEEL23 = r`Deel 2 en deel 3: de integraal staat er al. Een primitieve kun je hier niet uitrekenen. Benader de integraal met de grafische rekenmachine en rond af op twee decimalen.`

type NumeriekeVraag = {
  nummer: string
  level: 1 | 2 | 3
  volgorde: number
  latex: string
  antwoord: string
  antwoordLatex: string
  alts: string[]
  integrand: string
  grenzen: [number, number]
  /** Uitkomst vóór afronden, op 8 decimalen. */
  ruwe: number
  /** Vijf decimalen, met de LaTeX-komma `{,}`. */
  benadering: string
  steps: Steps
}

function komma(getal: string): string {
  return getal.replace('.', '{,}')
}

function afronden(derdeCijfer: number, tweedeCijfer: number, antwoordLatex: string, slot: string): string {
  if (derdeCijfer >= 5) {
    return r`Het derde cijfer achter de komma is $${derdeCijfer}$. Dat is $5$ of groter, dus het tweede cijfer achter de komma, $${tweedeCijfer}$, gaat één omhoog. ${slot} $${antwoordLatex}$.`
  }
  return r`Het derde cijfer achter de komma is $${derdeCijfer}$. Dat is kleiner dan $5$, dus het tweede cijfer achter de komma, $${tweedeCijfer}$, blijft staan. ${slot} $${antwoordLatex}$.`
}

function direct(invoer: string, benadering: string, slot: string): Steps {
  return [
    DEEL23,
    r`Zet in de grafische rekenmachine de integraal ${invoer}.`,
    r`De rekenmachine geeft ongeveer $${benadering}$.`,
    slot,
  ]
}

const VRAGEN: NumeriekeVraag[] = [
  {
    nummer: 'n1',
    level: 1,
    volgorde: 1,
    latex: r`Benader $\int_{0}^{1} e^{x^{2}}\,dx$. Rond af op twee decimalen.`,
    antwoord: '1,46',
    antwoordLatex: '1{,}46',
    alts: ['1.46'],
    integrand: 'exp(x^2)',
    grenzen: [0, 1],
    ruwe: 1.46265175,
    benadering: komma('1.46265'),
    steps: direct(
      r`$\int_{0}^{1} e^{x^{2}}\,dx$`,
      komma('1.46265'),
      afronden(2, 6, '1{,}46', 'Op twee decimalen is het antwoord'),
    ),
  },
  {
    nummer: 'n2',
    level: 1,
    volgorde: 2,
    latex: r`Benader $\int_{0}^{1} \sqrt{1 + x^{3}}\,dx$. Rond af op twee decimalen.`,
    antwoord: '1,11',
    antwoordLatex: '1{,}11',
    alts: ['1.11'],
    integrand: 'sqrt(1+x^3)',
    grenzen: [0, 1],
    ruwe: 1.11144797,
    benadering: komma('1.11145'),
    steps: direct(
      r`$\int_{0}^{1} \sqrt{1 + x^{3}}\,dx$`,
      komma('1.11145'),
      afronden(1, 1, '1{,}11', 'Op twee decimalen is het antwoord'),
    ),
  },
  {
    nummer: 'n3',
    level: 1,
    volgorde: 3,
    latex: r`Benader $\int_{0}^{1} e^{-x^{2}}\,dx$. Rond af op twee decimalen.`,
    antwoord: '0,75',
    antwoordLatex: '0{,}75',
    alts: ['0.75'],
    integrand: 'exp(-x^2)',
    grenzen: [0, 1],
    ruwe: 0.74682413,
    benadering: komma('0.74682'),
    steps: direct(
      r`$\int_{0}^{1} e^{-x^{2}}\,dx$`,
      komma('0.74682'),
      afronden(6, 4, '0{,}75', 'Op twee decimalen is het antwoord'),
    ),
  },
  {
    nummer: 'n4',
    level: 2,
    volgorde: 4,
    latex: r`Benader $\int_{0}^{1} \sin(x^{2})\,dx$. Rond af op twee decimalen.`,
    antwoord: '0,31',
    antwoordLatex: '0{,}31',
    alts: ['0.31'],
    integrand: 'sin(x^2)',
    grenzen: [0, 1],
    ruwe: 0.3102683,
    benadering: komma('0.31027'),
    steps: direct(
      r`$\int_{0}^{1} \sin(x^{2})\,dx$`,
      komma('0.31027'),
      afronden(0, 1, '0{,}31', 'Op twee decimalen is het antwoord'),
    ),
  },
  {
    nummer: 'n5',
    level: 2,
    volgorde: 5,
    latex: r`Benader $\int_{0}^{1} \sqrt{1 + x^{4}}\,dx$. Rond af op twee decimalen.`,
    antwoord: '1,09',
    antwoordLatex: '1{,}09',
    alts: ['1.09'],
    integrand: 'sqrt(1+x^4)',
    grenzen: [0, 1],
    ruwe: 1.08942941,
    benadering: komma('1.08943'),
    steps: direct(
      r`$\int_{0}^{1} \sqrt{1 + x^{4}}\,dx$`,
      komma('1.08943'),
      afronden(9, 8, '1{,}09', 'Op twee decimalen is het antwoord'),
    ),
  },
  {
    nummer: 'n6',
    level: 2,
    volgorde: 6,
    latex: r`Benader $\int_{2}^{4} \dfrac{1}{\ln(x)}\,dx$. Rond af op twee decimalen.`,
    antwoord: '1,92',
    antwoordLatex: '1{,}92',
    alts: ['1.92'],
    integrand: '1/ln(x)',
    grenzen: [2, 4],
    ruwe: 1.92242131,
    benadering: komma('1.92242'),
    steps: direct(
      r`$\int_{2}^{4} \dfrac{1}{\ln(x)}\,dx$`,
      komma('1.92242'),
      afronden(2, 2, '1{,}92', 'Op twee decimalen is het antwoord'),
    ),
  },
  {
    nummer: 'n7',
    level: 3,
    volgorde: 7,
    latex: r`Gegeven is $f(x) = \sqrt{1 + x^{3}}$. Het vlakdeel $V$ wordt ingesloten door de grafiek van $f$, de $x$-as en de lijnen $x = 0$ en $x = 2$. Benader de oppervlakte van $V$. Rond af op twee decimalen.`,
    antwoord: '3,24',
    antwoordLatex: '3{,}24',
    alts: ['3.24'],
    integrand: 'sqrt(1+x^3)',
    grenzen: [0, 2],
    ruwe: 3.24130926,
    benadering: komma('3.24131'),
    steps: [
      r`Alle drie de delen. $\sqrt{1 + x^{3}}$ is overal positief, dus de grafiek ligt boven de $x$-as. De oppervlakte is de integraal van $f$ van $0$ tot $2$. Die reken je niet exact uit: benader met de grafische rekenmachine en rond af.`,
      r`$O(V) = \int_{0}^{2} \sqrt{1 + x^{3}}\,dx$. Zet die integraal in de rekenmachine.`,
      r`De rekenmachine geeft ongeveer $3{,}24131$.`,
      afronden(1, 4, '3{,}24', 'De oppervlakte is'),
    ],
  },
  {
    nummer: 'n8',
    level: 3,
    volgorde: 8,
    latex: r`Gegeven zijn $f(x) = e^{x^{2}}$ en $g(x) = 1$. Benader de oppervlakte van het vlakdeel dat de grafieken van $f$ en $g$ insluiten op het interval $[0, 1]$. Rond af op twee decimalen.`,
    antwoord: '0,46',
    antwoordLatex: '0{,}46',
    alts: ['0.46'],
    integrand: 'exp(x^2)-1',
    grenzen: [0, 1],
    ruwe: 0.46265175,
    benadering: komma('0.46265'),
    steps: [
      r`Alle drie de delen. Op $[0, 1]$ is $e^{x^{2}} \ge 1$, en op $(0, 1]$ ligt $f$ boven $g$. De oppervlakte is de integraal van $f - g$. Die benader je met de rekenmachine en je rondt af.`,
      r`$O = \int_{0}^{1} \left(e^{x^{2}} - 1\right)\,dx$. Zet die integraal in de rekenmachine.`,
      r`De rekenmachine geeft ongeveer $0{,}46265$.`,
      afronden(2, 6, '0{,}46', 'De oppervlakte is'),
    ],
  },
]

function simpson(f: (x: number) => number, a: number, b: number, n: number): number {
  const h = (b - a) / n
  let som = f(a) + f(b)
  for (let i = 1; i < n; i++) som += (i % 2 === 0 ? 2 : 4) * f(a + i * h)
  return (som * h) / 3
}

function integreer(integrand: string, a: number, b: number): number {
  const code = parse(integrand.replace(/\bln\s*\(/g, 'log(')).compile()
  return simpson((x) => code.evaluate({ x }) as number, a, b, 100_000)
}

function schoolRond(waarde: number, decimalen: number): string {
  const factor = 10 ** decimalen
  const verschoven = waarde * factor
  const dichtstbij = Math.round(verschoven)
  if (Math.abs(verschoven - Math.trunc(verschoven) - 0.5) < 0.05 && Math.abs(verschoven - dichtstbij) > 0.4) {
    throw new Error(`te dicht bij een afrondgrens: ${waarde}`)
  }
  return (dichtstbij / factor).toFixed(decimalen).replace('.', ',')
}

for (const vraag of VRAGEN) {
  const [a, b] = vraag.grenzen
  const gevonden = integreer(vraag.integrand, a, b)
  if (Math.abs(gevonden - vraag.ruwe) > 1e-7) {
    throw new Error(`${vraag.nummer}: integraal is ${gevonden}, niet ${vraag.ruwe}`)
  }
  if (schoolRond(vraag.ruwe, 2) !== vraag.antwoord) {
    throw new Error(`${vraag.nummer}: ${vraag.ruwe} rondt niet af op ${vraag.antwoord}`)
  }
  if (schoolRond(vraag.ruwe, 5).replace(',', '{,}') !== vraag.benadering) {
    throw new Error(`${vraag.nummer}: vijf decimalen kloppen niet bij ${vraag.benadering}`)
  }
  if (!vraag.steps[2].includes(vraag.benadering) || !vraag.steps[3].includes(vraag.antwoordLatex)) {
    throw new Error(`${vraag.nummer}: de stappen noemen de benadering of het antwoord niet`)
  }
  const tweede = Math.floor(vraag.ruwe * 100 + 1e-8) % 10
  const derde = Math.floor(vraag.ruwe * 1000 + 1e-8) % 10
  if (!vraag.steps[3].includes(`Het derde cijfer achter de komma is $${derde}$`)) {
    throw new Error(`${vraag.nummer}: het derde cijfer hoort ${derde} te zijn`)
  }
  if (!vraag.steps[3].includes(`het tweede cijfer achter de komma, $${tweede}$`)) {
    throw new Error(`${vraag.nummer}: het tweede cijfer hoort ${tweede} te zijn`)
  }
}

const alsDatabase: AdditiveQ[] = VRAGEN.map((vraag) => ({
  cluster: 'h11_numeriek_afronden',
  nummer: vraag.nummer,
  latex: vraag.latex,
  antwoordLatex: vraag.antwoordLatex,
  antwoord: vraag.antwoord,
  alts: vraag.alts,
  level: vraag.level,
  volgorde: vraag.volgorde,
  steps: vraag.steps,
}))

const H11: AdditiveChapter = {
  chapterSlug: 'h11',
  chapterTitle: 'H11 — Primitiveren en integralen',
  bookPart: 3,
  chapterOrder: 11,
  site: 'integralen',
  migrationFile: '0073_h11_numeriek.sql',
  headerTitle: 'H11 — integralen numeriek berekenen',
  sourceScript: 'scripts/h11-numeriek-content.ts',
  headerNotes: [
    'Eigen soort onder hoofdstuk 11: een integraal of oppervlakte benaderen',
    'met de grafische rekenmachine en afronden op twee decimalen. Er is geen',
    'primitieve die een leerling hier exact kan uitrekenen.',
    '',
    'Geen boekopgaven. Elke uitkomst is nagerekend met numerieke integratie;',
    'src/content/h11-numeriek.test.ts doet dat opnieuw.',
  ],
  topics: [
    {
      slug: 'h11_numeriek',
      title: 'Integralen numeriek berekenen',
      order: 28,
      category: 'toepassingen',
    },
  ],
  clusters: [
    {
      topic: 'h11_numeriek',
      slug: 'h11_numeriek_afronden',
      title: 'Benaderen en afronden',
      order: 1,
    },
  ],
  questions: alsDatabase,
}

const wortel = process.cwd()
const contentMap = path.join(wortel, 'content', 'hoofdstuk-h11')
mkdirSync(contentMap, { recursive: true })
writeFileSync(
  path.join(contentMap, 'h11-numeriek.json'),
  `${JSON.stringify(
    {
      hoofdstuk: 'H11',
      soort: 'numeriek',
      onderdeel: 'Integralen numeriek berekenen (eigen vragen)',
      vragen: VRAGEN.map((vraag) => ({
        nummer: vraag.nummer,
        cluster: 'h11_numeriek_afronden',
        niveau: vraag.level,
        decimalen: 2,
        integrand: vraag.integrand,
        grenzen: vraag.grenzen,
        ruwe: vraag.ruwe,
        benadering: vraag.benadering,
        antwoord: vraag.antwoord,
        antwoord_latex: vraag.antwoordLatex,
        latex: vraag.latex,
        stappen: vraag.steps,
      })),
    },
    null,
    2,
  )}\n`,
)

const migratiePad = path.join(wortel, 'supabase', 'migrations', H11.migrationFile)
writeFileSync(migratiePad, generateAdditiveMigration(H11))
console.log(`geschreven: ${migratiePad}`)
