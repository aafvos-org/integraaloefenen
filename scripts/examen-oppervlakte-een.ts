/**
 * Examentraining — oppervlakte van één grafiek, grenzen gegeven.
 *
 * Acht eigen opgaven, niveau 2. Geen boek- of examenopgave.
 *
 * Draaien met:  npx jiti scripts/examen-oppervlakte-een.ts
 *
 * Schrijft:
 *   • content/hoofdstuk-examen/oppervlakte-een-grafiek.json
 *   • supabase/migrations/0059_examen_oppervlakte_een_grafiek.sql
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { derivative, evaluate, parse } from 'mathjs'

import {
  generateAdditiveMigration,
  generateContentFile,
  r,
  type AdditiveChapter,
  type AdditiveQ,
  type Steps,
} from './lib/stappenplan-content'

const DEEL12 = r`Hier spelen deel 1 en deel 2 van de driedeling: eerst het verhaal vertalen naar een integraal, dan die integraal exact uitrekenen.`

function vier(a: string, b: string, c: string, d: string): Steps {
  return [a, b, c, d]
}

const PI = Math.PI

const VRAGEN: AdditiveQ[] = [
  {
    cluster: 'examen_opp_een',
    nummer: 'e1',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = x^{2} - 2x + 4$, de $x$-as en de lijnen $x = 0$ en $x = 3$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`12`,
    antwoord: '12',
    integrand: 'x^2 - 2*x + 4',
    primitieve: '(1/3)*x^3 - x^2 + 4*x',
    domein: [0, 3],
    grenzen: [0, 3],
    waarde: 12,
    steps: vier(
      DEEL12 +
        r` Op $[0, 3]$ ligt de grafiek boven de $x$-as: de top van de parabool zit bij $x = 1$ en $f(1) = 3$. De oppervlakte is dus de integraal zelf.`,
      r`$O(V) = \displaystyle\int_{0}^{3} (x^{2} - 2x + 4)\,\mathrm{d}x$.`,
      r`Een primitieve is $F(x) = \dfrac{1}{3}x^{3} - x^{2} + 4x$.`,
      r`$F(3) - F(0) = 9 - 9 + 12 = 12$. De oppervlakte is $12$.`,
    ),
  },
  {
    cluster: 'examen_opp_een',
    nummer: 'e2',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{5x + 2}{x + 2}$, de $x$-as en de lijnen $x = 1$ en $x = 4$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`15 - 8\ln(2)`,
    antwoord: '15 - 8ln(2)',
    alts: ['15 + 8ln(1/2)', '15 - 8ln(6) + 8ln(3)'],
    integrand: '(5*x + 2)/(x + 2)',
    primitieve: '5*x - 8*ln(x + 2)',
    domein: [1, 4],
    grenzen: [1, 4],
    waarde: '15 - 8*ln(2)',
    steps: vier(
      DEEL12 +
        r` Op $[1, 4]$ zijn teller en noemer positief, dus de grafiek ligt boven de $x$-as. De oppervlakte is de integraal.`,
      r`Schrijf de breuk als een getal plus een rest: $5x + 2 = 5(x + 2) - 8$, dus $f(x) = 5 - \dfrac{8}{x + 2}$. $O(V) = \displaystyle\int_{1}^{4} \left(5 - \dfrac{8}{x + 2}\right)\,\mathrm{d}x$.`,
      r`Een primitieve is $F(x) = 5x - 8\ln(x + 2)$.`,
      r`$F(4) - F(1) = (20 - 8\ln(6)) - (5 - 8\ln(3)) = 15 - 8\ln(2)$. De oppervlakte is $15 - 8\ln(2)$.`,
    ),
  },
  {
    cluster: 'examen_opp_een',
    nummer: 'e3',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sqrt{x}$, de $x$-as en de lijnen $x = 1$ en $x = 9$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\dfrac{52}{3}`,
    antwoord: '52/3',
    integrand: 'sqrt(x)',
    primitieve: '(2/3)*x^(3/2)',
    domein: [1, 9],
    grenzen: [1, 9],
    waarde: '52/3',
    steps: vier(
      DEEL12 +
        r` Op $[1, 9]$ ligt de wortel boven de $x$-as, dus de oppervlakte is de integraal.`,
      r`$O(V) = \displaystyle\int_{1}^{9} \sqrt{x}\,\mathrm{d}x = \displaystyle\int_{1}^{9} x^{1/2}\,\mathrm{d}x$.`,
      r`Een primitieve is $F(x) = \dfrac{2}{3}x^{3/2}$.`,
      r`$F(9) - F(1) = \dfrac{2}{3}\cdot 27 - \dfrac{2}{3} = \dfrac{52}{3}$. De oppervlakte is $\dfrac{52}{3}$.`,
    ),
  },
  {
    cluster: 'examen_opp_een',
    nummer: 'e4',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sqrt{2x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = 4$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\dfrac{26}{3}`,
    antwoord: '26/3',
    integrand: 'sqrt(2*x + 1)',
    primitieve: '(1/3)*(2*x + 1)^(3/2)',
    domein: [0, 4],
    grenzen: [0, 4],
    waarde: '26/3',
    steps: vier(
      DEEL12 +
        r` Op $[0, 4]$ is $2x + 1 \ge 1$, dus de grafiek ligt boven de $x$-as.`,
      r`$O(V) = \displaystyle\int_{0}^{4} \sqrt{2x + 1}\,\mathrm{d}x$. De kern is $2x + 1$, en die heeft afgeleide $2$.`,
      r`Een primitieve is $F(x) = \dfrac{1}{3}(2x + 1)^{3/2}$.`,
      r`$F(4) - F(0) = \dfrac{1}{3}\cdot 27 - \dfrac{1}{3} = \dfrac{26}{3}$. De oppervlakte is $\dfrac{26}{3}$.`,
    ),
  },
  {
    cluster: 'examen_opp_een',
    nummer: 'e5',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = e^{2x}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\dfrac{1}{2}(e^{2} - 1)`,
    antwoord: '(1/2)(e^2 - 1)',
    alts: ['(1/2)*e^2 - 1/2', 'e^2/2 - 1/2'],
    integrand: 'e^(2*x)',
    primitieve: '(1/2)*e^(2*x)',
    domein: [0, 1],
    grenzen: [0, 1],
    waarde: '(1/2)*(e^2 - 1)',
    steps: vier(
      DEEL12 + r` $e^{2x}$ is overal positief, dus de oppervlakte is de integraal.`,
      r`$O(V) = \displaystyle\int_{0}^{1} e^{2x}\,\mathrm{d}x$. De kern is $2x$, met afgeleide $2$.`,
      r`Een primitieve is $F(x) = \dfrac{1}{2}e^{2x}$.`,
      r`$F(1) - F(0) = \dfrac{1}{2}e^{2} - \dfrac{1}{2} = \dfrac{1}{2}(e^{2} - 1)$. De oppervlakte is $\dfrac{1}{2}(e^{2} - 1)$.`,
    ),
  },
  {
    cluster: 'examen_opp_een',
    nummer: 'e6',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \ln(x)$, de $x$-as en de lijnen $x = 2$ en $x = 4$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`6\ln(2) - 2`,
    antwoord: '6ln(2) - 2',
    alts: ['2(3ln(2) - 1)'],
    integrand: 'ln(x)',
    primitieve: 'x*ln(x) - x',
    domein: [2, 4],
    grenzen: [2, 4],
    waarde: '6*ln(2) - 2',
    steps: vier(
      DEEL12 + r` Op $[2, 4]$ is $\ln(x) > 0$, dus de grafiek ligt boven de $x$-as.`,
      r`$O(V) = \displaystyle\int_{2}^{4} \ln(x)\,\mathrm{d}x$.`,
      r`Een primitieve is $F(x) = x\ln(x) - x$.`,
      r`$F(4) - F(2) = (4\ln(4) - 4) - (2\ln(2) - 2) = 6\ln(2) - 2$. De oppervlakte is $6\ln(2) - 2$.`,
    ),
  },
  {
    cluster: 'examen_opp_een',
    nummer: 'e7',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = 2 + \sin(x)$, de $x$-as en de lijnen $x = 0$ en $x = \pi$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`2\pi + 2`,
    antwoord: '2pi + 2',
    alts: ['2(pi + 1)', '2*pi + 2'],
    integrand: '2 + sin(x)',
    primitieve: '2*x - cos(x)',
    domein: [0, PI],
    grenzen: [0, PI],
    waarde: '2*pi + 2',
    steps: vier(
      DEEL12 +
        r` $\sin(x)$ ligt tussen $-1$ en $1$, dus $2 + \sin(x)$ ligt tussen $1$ en $3$. De grafiek ligt boven de $x$-as.`,
      r`$O(V) = \displaystyle\int_{0}^{\pi} (2 + \sin(x))\,\mathrm{d}x$.`,
      r`Een primitieve is $F(x) = 2x - \cos(x)$.`,
      r`$F(\pi) - F(0) = (2\pi + 1) - (-1) = 2\pi + 2$. De oppervlakte is $2\pi + 2$.`,
    ),
  },
  {
    cluster: 'examen_opp_een',
    nummer: 'e8',
    level: 2,
    latex: r`De grafiek van $f(x) = \cos(x)$ ligt op $\left[\dfrac{\pi}{2}, \pi\right]$ onder de $x$-as. Het vlakdeel $V$ wordt ingesloten door die grafiek, de $x$-as en de lijnen $x = \dfrac{\pi}{2}$ en $x = \pi$. De oppervlakte is positief. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`1`,
    antwoord: '1',
    integrand: '-cos(x)',
    primitieve: '-sin(x)',
    domein: [PI / 2, PI],
    grenzen: [PI / 2, PI],
    waarde: 1,
    steps: vier(
      DEEL12 +
        r` De grafiek ligt onder de $x$-as. De integraal van $f$ is dan negatief, en de oppervlakte is het tegengestelde.`,
      r`$O(V) = -\displaystyle\int_{\pi/2}^{\pi} \cos(x)\,\mathrm{d}x = \displaystyle\int_{\pi/2}^{\pi} -\cos(x)\,\mathrm{d}x$.`,
      r`Een primitieve van $-\cos(x)$ is $F(x) = -\sin(x)$.`,
      r`$F(\pi) - F\left(\dfrac{\pi}{2}\right) = 0 - (-1) = 1$. De oppervlakte is $1$.`,
    ),
  },
]

function lees(formule: string) {
  return parse(formule.replace(/\bln\s*\(/g, 'log('))
}

function controleer(q: AdditiveQ) {
  if (!q.integrand || !q.primitieve) throw new Error(`${q.nummer}: integrand en primitieve horen erbij`)
  const afgeleide = derivative(lees(q.primitieve), 'x')
  const [begin, eind] = q.domein ?? [-2.5, 2.5]
  let bruikbaar = 0
  for (let i = 1; i <= 13; i++) {
    const x = begin + (eind - begin) * (((i * 0.618033988749895) % 1))
    let verwacht: number
    let gevonden: number
    try {
      verwacht = lees(q.integrand).compile().evaluate({ x }) as number
      gevonden = afgeleide.compile().evaluate({ x }) as number
    } catch {
      continue
    }
    if (!Number.isFinite(verwacht) || !Number.isFinite(gevonden)) continue
    bruikbaar += 1
    if (Math.abs(gevonden - verwacht) > 1e-6 * Math.max(1, Math.abs(verwacht))) {
      throw new Error(`${q.nummer}: afgeleide klopt niet bij x=${x}: ${gevonden} tegen ${verwacht}`)
    }
  }
  if (bruikbaar < 3) throw new Error(`${q.nummer}: maar ${bruikbaar} bruikbare x-waarden`)
  if (q.grenzen && q.waarde !== undefined) {
    const [a, b] = q.grenzen
    const F = lees(q.primitieve).compile()
    const gevonden = (F.evaluate({ x: b }) as number) - (F.evaluate({ x: a }) as number)
    const verwacht =
      typeof q.waarde === 'number'
        ? q.waarde
        : (evaluate(String(q.waarde).replace(/\bln\s*\(/g, 'log(')) as number)
    if (Math.abs(gevonden - verwacht) > 1e-6 * Math.max(1, Math.abs(verwacht))) {
      throw new Error(`${q.nummer}: F(b)-F(a)=${gevonden}, waarde=${verwacht}`)
    }
  }
}

for (const q of VRAGEN) controleer(q)

const EXAMEN: AdditiveChapter = {
  chapterSlug: 'examentraining',
  chapterTitle: 'Examentraining',
  bookPart: 5,
  chapterOrder: 16,
  site: 'integralen',
  migrationFile: '0059_examen_oppervlakte_een_grafiek.sql',
  headerTitle: 'Examentraining — oppervlakte van één grafiek',
  sourceScript: 'scripts/examen-oppervlakte-een.ts',
  headerNotes: [
    'Eigen onderdeel Examentraining, geen theoriehoofdstuk uit het boek.',
    'Eerste soort: de oppervlakte tussen één grafiek en de x-as, grenzen gegeven.',
    'Acht vragen, allemaal niveau 2.',
    '',
    'Eigen oefenvragen, geen boek- of examenopgaven. Elke integraal wordt',
    'nagerekend door src/content/primitieven.test.ts',
    '(content/hoofdstuk-examen/oppervlakte-een-grafiek.json).',
  ],
  topics: [
    {
      slug: 'examen_opp_een',
      title: 'Oppervlakte van één grafiek',
      order: 1,
      category: 'toepassingen',
    },
  ],
  clusters: [
    {
      topic: 'examen_opp_een',
      slug: 'examen_opp_een',
      title: 'Grenzen gegeven',
      order: 1,
    },
  ],
  questions: VRAGEN,
}

const wortel = process.cwd()
const map = path.join(wortel, 'content', 'hoofdstuk-examen')
mkdirSync(map, { recursive: true })

const contentPad = path.join(map, 'oppervlakte-een-grafiek.json')
writeFileSync(
  contentPad,
  generateContentFile(
    EXAMEN,
    'Examentraining — oppervlakte van één grafiek, grenzen gegeven',
  ),
)

const migratiePad = path.join(wortel, 'supabase', 'migrations', EXAMEN.migrationFile)
writeFileSync(migratiePad, generateAdditiveMigration(EXAMEN))

console.log(`Geschreven: ${contentPad}`)
console.log(`Geschreven: ${migratiePad}`)
console.log(`Vragen: ${EXAMEN.questions.length}, stappen: ${EXAMEN.questions.length * 4}`)
