/**
 * Examentraining — oppervlakte, grenzen zelf vinden.
 *
 * Acht eigen opgaven, niveau 3. De vraag noemt de snijpunten niet.
 * Geen boek- of examenopgave.
 *
 * Draaien met:  npx jiti scripts/examen-oppervlakte-grenzen.ts
 *
 * Schrijft:
 *   • content/hoofdstuk-examen/oppervlakte-grenzen-zelf.json
 *   • supabase/migrations/0062_examen_oppervlakte_grenzen_zelf.sql
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

const DEEL12 = r`Hier spelen deel 1 en deel 2 van de driedeling: eerst vertaal je het verhaal naar een integraal, daarna reken je die integraal exact uit.`

function vier(a: string, b: string, c: string, d: string): Steps {
  return [a, b, c, d]
}

const PI = Math.PI
const LN2 = Math.LN2

const VRAGEN: AdditiveQ[] = [
  {
    cluster: 'examen_opp_grenzen',
    nummer: 'g1',
    level: 3,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = x^{2} - 4x + 3$ en de $x$-as. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\dfrac{4}{3}`,
    antwoord: '4/3',
    integrand: '-x^2 + 4*x - 3',
    primitieve: '-(1/3)*x^3 + 2*x^2 - 3*x',
    domein: [1, 3],
    grenzen: [1, 3],
    waarde: '4/3',
    steps: vier(
      DEEL12 +
        r` De grafiek snijdt de $x$-as waar $x^{2} - 4x + 3 = 0$, dus $(x - 1)(x - 3) = 0$. De snijpunten zijn $x = 1$ en $x = 3$. Daartussen is $f(2) = -1$, dus de grafiek ligt onder de $x$-as. De oppervlakte is het tegengestelde van de integraal van $f$.`,
      r`$O(V) = -\displaystyle\int_{1}^{3} (x^{2} - 4x + 3)\,\mathrm{d}x = \displaystyle\int_{1}^{3} (-x^{2} + 4x - 3)\,\mathrm{d}x$.`,
      r`Een primitieve is $F(x) = -\dfrac{1}{3}x^{3} + 2x^{2} - 3x$.`,
      r`$F(3) - F(1) = 0 - \left(-\dfrac{4}{3}\right) = \dfrac{4}{3}$. De oppervlakte is $\dfrac{4}{3}$.`,
    ),
  },
  {
    cluster: 'examen_opp_grenzen',
    nummer: 'g2',
    level: 3,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = x^{2}$ en $g(x) = x + 2$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\dfrac{9}{2}`,
    antwoord: '9/2',
    integrand: '-x^2 + x + 2',
    primitieve: '-(1/3)*x^3 + (1/2)*x^2 + 2*x',
    domein: [-1, 2],
    grenzen: [-1, 2],
    waarde: '9/2',
    steps: vier(
      DEEL12 +
        r` De grafieken snijden elkaar waar $x^{2} = x + 2$, dus $x^{2} - x - 2 = 0$, ofwel $(x - 2)(x + 1) = 0$. De snijpunten zijn $x = -1$ en $x = 2$. Op dat stuk is $g(0) = 2$ groter dan $f(0) = 0$, dus de grafiek van $g$ ligt boven die van $f$.`,
      r`$O(V) = \displaystyle\int_{-1}^{2} \bigl((x + 2) - x^{2}\bigr)\,\mathrm{d}x = \displaystyle\int_{-1}^{2} (-x^{2} + x + 2)\,\mathrm{d}x$.`,
      r`Een primitieve is $F(x) = -\dfrac{1}{3}x^{3} + \dfrac{1}{2}x^{2} + 2x$.`,
      r`$F(2) - F(-1) = \dfrac{10}{3} - \left(-\dfrac{7}{6}\right) = \dfrac{20}{6} + \dfrac{7}{6} = \dfrac{9}{2}$. De oppervlakte is $\dfrac{9}{2}$.`,
    ),
  },
  {
    cluster: 'examen_opp_grenzen',
    nummer: 'g3',
    level: 3,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \sqrt{4x}$ en $g(x) = x$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\dfrac{8}{3}`,
    antwoord: '8/3',
    integrand: 'sqrt(4*x) - x',
    primitieve: '(1/6)*(4*x)^(3/2) - (1/2)*x^2',
    domein: [0, 4],
    grenzen: [0, 4],
    waarde: '8/3',
    steps: vier(
      DEEL12 +
        r` De grafieken snijden elkaar waar $\sqrt{4x} = x$. Kwadrateren geeft $4x = x^{2}$, dus $x(x - 4) = 0$. Beide oplossingen kloppen: $x = 0$ en $x = 4$. Op dat stuk is $f(1) = 2$ groter dan $g(1) = 1$, dus de grafiek van $f$ ligt boven die van $g$.`,
      r`$O(V) = \displaystyle\int_{0}^{4} \bigl(\sqrt{4x} - x\bigr)\,\mathrm{d}x$. De kern van de wortel is $4x$, en die heeft afgeleide $4$.`,
      r`Een primitieve is $F(x) = \dfrac{1}{6}(4x)^{3/2} - \dfrac{1}{2}x^{2}$.`,
      r`$F(4) - F(0) = \dfrac{1}{6}\cdot 64 - 8 = \dfrac{32}{3} - 8 = \dfrac{8}{3}$. De oppervlakte is $\dfrac{8}{3}$.`,
    ),
  },
  {
    cluster: 'examen_opp_grenzen',
    nummer: 'g4',
    level: 3,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \dfrac{3x}{x + 1}$ en $g(x) = x$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`4 - 3\ln(3)`,
    antwoord: '4 - 3ln(3)',
    alts: ['4 - ln(27)'],
    integrand: '3 - x - 3/(x + 1)',
    primitieve: '3*x - (1/2)*x^2 - 3*ln(x + 1)',
    domein: [0, 2],
    grenzen: [0, 2],
    waarde: '4 - 3*ln(3)',
    steps: vier(
      DEEL12 +
        r` De grafieken snijden elkaar waar $\dfrac{3x}{x + 1} = x$. Dan is $3x = x(x + 1)$, dus $x^{2} - 2x = 0$, ofwel $x(x - 2) = 0$. De snijpunten zijn $x = 0$ en $x = 2$. De verticale asymptoot $x = -1$ ligt daar buiten. Op dat stuk is $f(1) = \dfrac{3}{2}$ groter dan $g(1) = 1$, dus de grafiek van $f$ ligt boven die van $g$.`,
      r`$f(x) - g(x) = \dfrac{3x}{x + 1} - x$. Schrijf de breuk als een getal plus een rest: $\dfrac{3x}{x + 1} = 3 - \dfrac{3}{x + 1}$. Dus $f(x) - g(x) = 3 - x - \dfrac{3}{x + 1}$. $O(V) = \displaystyle\int_{0}^{2} \left(3 - x - \dfrac{3}{x + 1}\right)\,\mathrm{d}x$.`,
      r`Een primitieve is $F(x) = 3x - \dfrac{1}{2}x^{2} - 3\ln(x + 1)$. Op $[0, 2]$ is $x + 1$ positief.`,
      r`$F(2) - F(0) = \bigl(6 - 2 - 3\ln(3)\bigr) - 0 = 4 - 3\ln(3)$. De oppervlakte is $4 - 3\ln(3)$.`,
    ),
  },
  {
    cluster: 'examen_opp_grenzen',
    nummer: 'g5',
    level: 3,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = e^{x} + e^{-x}$ en de lijn $y = \dfrac{5}{2}$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`5\ln(2) - 3`,
    antwoord: '5ln(2) - 3',
    alts: ['ln(32) - 3'],
    integrand: '5/2 - e^x - e^(-x)',
    primitieve: '(5/2)*x - e^x + e^(-x)',
    domein: [-LN2, LN2],
    grenzen: [-LN2, LN2],
    waarde: '5*ln(2) - 3',
    steps: vier(
      DEEL12 +
        r` De grafiek snijdt de lijn waar $e^{x} + e^{-x} = \dfrac{5}{2}$. Vermenigvuldig met $e^{x}$: $e^{2x} + 1 = \dfrac{5}{2}e^{x}$, dus $2e^{2x} - 5e^{x} + 2 = 0$. Met $t = e^{x}$ wordt dat $(2t - 1)(t - 2) = 0$, dus $t = \dfrac{1}{2}$ of $t = 2$. De snijpunten zijn $x = -\ln(2)$ en $x = \ln(2)$. Daartussen is $f(0) = 2$ kleiner dan $\dfrac{5}{2}$, dus de lijn ligt boven de grafiek.`,
      r`$O(V) = \displaystyle\int_{-\ln(2)}^{\ln(2)} \left(\dfrac{5}{2} - e^{x} - e^{-x}\right)\,\mathrm{d}x$. Bij $e^{-x}$ is de kern $-x$, met afgeleide $-1$.`,
      r`Een primitieve is $F(x) = \dfrac{5}{2}x - e^{x} + e^{-x}$.`,
      r`$F\bigl(\ln(2)\bigr) - F\bigl(-\ln(2)\bigr) = \left(\dfrac{5}{2}\ln(2) - \dfrac{3}{2}\right) - \left(-\dfrac{5}{2}\ln(2) + \dfrac{3}{2}\right) = 5\ln(2) - 3$. De oppervlakte is $5\ln(2) - 3$.`,
    ),
  },
  {
    cluster: 'examen_opp_grenzen',
    nummer: 'g6',
    level: 3,
    latex: r`Het vlakdeel $V$ ligt rechts van de $y$-as, zo dicht mogelijk bij de oorsprong, en wordt ingesloten door de grafiek van $f(x) = \sin(x)$ en de $x$-as. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`2`,
    antwoord: '2',
    integrand: 'sin(x)',
    primitieve: '-cos(x)',
    domein: [0, PI],
    grenzen: [0, PI],
    waarde: 2,
    steps: vier(
      DEEL12 +
        r` De grafiek snijdt de $x$-as waar $\sin(x) = 0$, dus bij $x = 0$, $x = \pi$, $x = 2\pi$, enzovoort. Rechts van de $y$-as, zo dicht mogelijk bij de oorsprong, hoort het stuk van $x = 0$ tot $x = \pi$. Daar is $\sin(x)$ positief, dus de grafiek ligt boven de $x$-as.`,
      r`$O(V) = \displaystyle\int_{0}^{\pi} \sin(x)\,\mathrm{d}x$.`,
      r`Een primitieve is $F(x) = -\cos(x)$.`,
      r`$F(\pi) - F(0) = -(-1) - (-1) = 2$. De oppervlakte is $2$.`,
    ),
  },
  {
    cluster: 'examen_opp_grenzen',
    nummer: 'g7',
    level: 3,
    latex: r`Het vlakdeel $V$ ligt zo dicht mogelijk bij de oorsprong en wordt ingesloten door de grafiek van $f(x) = \cos(x)$ en de lijn $y = \dfrac{1}{2}$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\sqrt{3} - \dfrac{\pi}{3}`,
    antwoord: 'sqrt(3) - pi/3',
    alts: ['(3*sqrt(3) - pi)/3'],
    integrand: 'cos(x) - 1/2',
    primitieve: 'sin(x) - (1/2)*x',
    domein: [-PI / 3, PI / 3],
    grenzen: [-PI / 3, PI / 3],
    waarde: 'sqrt(3) - pi/3',
    steps: vier(
      DEEL12 +
        r` De grafiek snijdt de lijn waar $\cos(x) = \dfrac{1}{2}$, dus bij $x = \pm\dfrac{\pi}{3} + 2k\pi$. Het vlakdeel het dichtst bij de oorsprong loopt van $x = -\dfrac{\pi}{3}$ tot $x = \dfrac{\pi}{3}$. Daar is $\cos(x) \ge \dfrac{1}{2}$, dus de grafiek ligt boven de lijn.`,
      r`$O(V) = \displaystyle\int_{-\pi/3}^{\pi/3} \left(\cos(x) - \dfrac{1}{2}\right)\,\mathrm{d}x$.`,
      r`Een primitieve is $F(x) = \sin(x) - \dfrac{1}{2}x$.`,
      r`$F\left(\dfrac{\pi}{3}\right) - F\left(-\dfrac{\pi}{3}\right) = \left(\dfrac{\sqrt{3}}{2} - \dfrac{\pi}{6}\right) - \left(-\dfrac{\sqrt{3}}{2} + \dfrac{\pi}{6}\right) = \sqrt{3} - \dfrac{\pi}{3}$. De oppervlakte is $\sqrt{3} - \dfrac{\pi}{3}$.`,
    ),
  },
  {
    cluster: 'examen_opp_grenzen',
    nummer: 'g8',
    level: 3,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \ln(x)$ en $g(x) = \bigl(\ln(x)\bigr)^{2}$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`3 - e`,
    antwoord: '3 - e',
    integrand: 'ln(x) - (ln(x))^2',
    primitieve: '-x*(ln(x))^2 + 3*x*ln(x) - 3*x',
    domein: [1, Math.E],
    grenzen: [1, Math.E],
    waarde: '3 - e',
    steps: vier(
      DEEL12 +
        r` De grafieken snijden elkaar waar $\ln(x) = \bigl(\ln(x)\bigr)^{2}$. Met $t = \ln(x)$ wordt dat $t = t^{2}$, dus $t(t - 1) = 0$. Dan is $t = 0$ of $t = 1$, dus $x = 1$ of $x = e$. Op $(1, e)$ ligt $\ln(x)$ tussen $0$ en $1$, en dan is $\bigl(\ln(x)\bigr)^{2}$ kleiner. De grafiek van $f$ ligt boven die van $g$.`,
      r`$O(V) = \displaystyle\int_{1}^{e} \bigl(\ln(x) - (\ln(x))^{2}\bigr)\,\mathrm{d}x$.`,
      r`Een primitieve van $\ln(x)$ is $x\ln(x) - x$. Voor $(\ln(x))^{2}$ integreer je partieel: differentieer $(\ln(x))^{2}$ en primitiveer $1$. De afgeleide van $(\ln(x))^{2}$ is $\dfrac{2\ln(x)}{x}$, een primitieve van $1$ is $x$. Dan is $\int (\ln(x))^{2}\,\mathrm{d}x = x(\ln(x))^{2} - \int 2\ln(x)\,\mathrm{d}x = x(\ln(x))^{2} - 2x\ln(x) + 2x$. Een primitieve van het verschil is $F(x) = -x(\ln(x))^{2} + 3x\ln(x) - 3x$.`,
      r`$F(e) = -e\cdot 1 + 3e\cdot 1 - 3e = -e$ en $F(1) = -3$. Dus $F(e) - F(1) = -e - (-3) = 3 - e$. De oppervlakte is $3 - e$.`,
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
  migrationFile: '0062_examen_oppervlakte_grenzen_zelf.sql',
  headerTitle: 'Examentraining — oppervlakte, grenzen zelf vinden',
  sourceScript: 'scripts/examen-oppervlakte-grenzen.ts',
  headerNotes: [
    'Eigen onderdeel Examentraining, geen theoriehoofdstuk uit het boek.',
    'De oppervlakte van een vlakdeel waarvan de grenzen niet in de vraag staan.',
    'Acht vragen, allemaal niveau 3.',
    '',
    'Eigen oefenvragen, geen boek- of examenopgaven. Elke integraal wordt',
    'nagerekend door src/content/primitieven.test.ts',
    '(content/hoofdstuk-examen/oppervlakte-grenzen-zelf.json).',
  ],
  topics: [
    {
      slug: 'examen_opp_grenzen',
      title: 'Oppervlakte, grenzen zelf vinden',
      order: 3,
      category: 'toepassingen',
    },
  ],
  clusters: [
    {
      topic: 'examen_opp_grenzen',
      slug: 'examen_opp_grenzen',
      title: 'Grenzen zelf vinden',
      order: 1,
    },
  ],
  questions: VRAGEN,
}

const wortel = process.cwd()
const map = path.join(wortel, 'content', 'hoofdstuk-examen')
mkdirSync(map, { recursive: true })

const contentPad = path.join(map, 'oppervlakte-grenzen-zelf.json')
writeFileSync(
  contentPad,
  generateContentFile(
    EXAMEN,
    'Examentraining — oppervlakte, grenzen zelf vinden',
  ),
)

const migratiePad = path.join(wortel, 'supabase', 'migrations', EXAMEN.migrationFile)
writeFileSync(migratiePad, generateAdditiveMigration(EXAMEN))

console.log(`Geschreven: ${contentPad}`)
console.log(`Geschreven: ${migratiePad}`)
console.log(`Vragen: ${EXAMEN.questions.length}, stappen: ${EXAMEN.questions.length * 4}`)
