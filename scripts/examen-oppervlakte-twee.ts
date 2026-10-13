/**
 * Examentraining — oppervlakte tussen twee grafieken, grenzen gegeven.
 *
 * Acht eigen opgaven, niveau 2. Geen boek- of examenopgave.
 *
 * Draaien met:  npx jiti scripts/examen-oppervlakte-twee.ts
 *
 * Schrijft:
 *   • content/hoofdstuk-examen/oppervlakte-twee-grafieken.json
 *   • supabase/migrations/0060_examen_oppervlakte_twee_grafieken.sql
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
const E = Math.E

const VRAGEN: AdditiveQ[] = [
  {
    cluster: 'examen_opp_twee',
    nummer: 't1',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = -x^{2} + 4x + 1$ en $g(x) = x + 1$ en de lijnen $x = 0$ en $x = 3$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\dfrac{9}{2}`,
    antwoord: '9/2',
    integrand: '-x^2 + 3*x',
    primitieve: '-(1/3)*x^3 + (3/2)*x^2',
    domein: [0, 3],
    grenzen: [0, 3],
    waarde: '9/2',
    steps: vier(
      DEEL12 +
        r` De grafiek van $f$ ligt boven die van $g$. Het verschil is $f(x) - g(x) = -x^{2} + 3x = x(3 - x)$. Op $[0, 3]$ is dat positief.`,
      r`$O(V) = \displaystyle\int_{0}^{3} (-x^{2} + 3x)\,\mathrm{d}x$.`,
      r`Een primitieve is $F(x) = -\dfrac{1}{3}x^{3} + \dfrac{3}{2}x^{2}$.`,
      r`$F(3) - F(0) = -9 + \dfrac{27}{2} = \dfrac{9}{2}$. De oppervlakte is $\dfrac{9}{2}$.`,
    ),
  },
  {
    cluster: 'examen_opp_twee',
    nummer: 't2',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \dfrac{5x + 8}{x + 2}$ en $g(x) = 4$ en de lijnen $x = 0$ en $x = 2$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`2 - 2\ln(2)`,
    antwoord: '2 - 2ln(2)',
    alts: ['2(1 - ln(2))', '2 - ln(4)'],
    integrand: 'x/(x + 2)',
    primitieve: 'x - 2*ln(x + 2)',
    domein: [0, 2],
    grenzen: [0, 2],
    waarde: '2 - 2*ln(2)',
    steps: vier(
      DEEL12 +
        r` De grafiek van $f$ ligt boven die van $g$, dus je integreert $f(x) - g(x)$.`,
      r`$f(x) - 4 = \dfrac{5x + 8 - 4(x + 2)}{x + 2} = \dfrac{x}{x + 2}$. Schrijf dat als een getal plus een rest: $\dfrac{x}{x + 2} = 1 - \dfrac{2}{x + 2}$. $O(V) = \displaystyle\int_{0}^{2} \left(1 - \dfrac{2}{x + 2}\right)\,\mathrm{d}x$.`,
      r`Een primitieve is $F(x) = x - 2\ln(x + 2)$.`,
      r`$F(2) - F(0) = (2 - 2\ln(4)) - (-2\ln(2)) = 2 - 4\ln(2) + 2\ln(2) = 2 - 2\ln(2)$. De oppervlakte is $2 - 2\ln(2)$.`,
    ),
  },
  {
    cluster: 'examen_opp_twee',
    nummer: 't3',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \sqrt{x}$ en $g(x) = \dfrac{1}{4}x$ en de lijnen $x = 0$ en $x = 16$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\dfrac{32}{3}`,
    antwoord: '32/3',
    integrand: 'sqrt(x) - x/4',
    primitieve: '(2/3)*x^(3/2) - (1/8)*x^2',
    domein: [0, 16],
    grenzen: [0, 16],
    waarde: '32/3',
    steps: vier(
      DEEL12 +
        r` De grafiek van $f$ ligt boven die van $g$. Het verschil is $\sqrt{x} - \dfrac{1}{4}x$.`,
      r`$O(V) = \displaystyle\int_{0}^{16} \left(\sqrt{x} - \dfrac{1}{4}x\right)\,\mathrm{d}x = \displaystyle\int_{0}^{16} \left(x^{1/2} - \dfrac{1}{4}x\right)\,\mathrm{d}x$.`,
      r`Een primitieve is $F(x) = \dfrac{2}{3}x^{3/2} - \dfrac{1}{8}x^{2}$.`,
      r`$F(16) - F(0) = \dfrac{2}{3}\cdot 64 - \dfrac{1}{8}\cdot 256 = \dfrac{128}{3} - 32 = \dfrac{32}{3}$. De oppervlakte is $\dfrac{32}{3}$.`,
    ),
  },
  {
    cluster: 'examen_opp_twee',
    nummer: 't4',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = e^{2x}$ en $g(x) = e^{x}$ en de lijnen $x = 0$ en $x = 1$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\dfrac{1}{2}(e - 1)^{2}`,
    antwoord: '(1/2)(e - 1)^2',
    alts: ['(1/2)*e^2 - e + 1/2', 'e^2/2 - e + 1/2'],
    integrand: 'e^(2*x) - e^x',
    primitieve: '(1/2)*e^(2*x) - e^x',
    domein: [0, 1],
    grenzen: [0, 1],
    waarde: '(1/2)*(e - 1)^2',
    steps: vier(
      DEEL12 +
        r` Op $[0, 1]$ is $e^{x} \ge 1$, dus $e^{2x} = e^{x}\cdot e^{x} \ge e^{x}$. De grafiek van $f$ ligt boven die van $g$.`,
      r`$O(V) = \displaystyle\int_{0}^{1} (e^{2x} - e^{x})\,\mathrm{d}x$. Bij $e^{2x}$ is de kern $2x$, met afgeleide $2$.`,
      r`Een primitieve is $F(x) = \dfrac{1}{2}e^{2x} - e^{x}$.`,
      r`$F(1) - F(0) = \left(\dfrac{1}{2}e^{2} - e\right) - \left(\dfrac{1}{2} - 1\right) = \dfrac{1}{2}e^{2} - e + \dfrac{1}{2} = \dfrac{1}{2}(e - 1)^{2}$. De oppervlakte is $\dfrac{1}{2}(e - 1)^{2}$.`,
    ),
  },
  {
    cluster: 'examen_opp_twee',
    nummer: 't5',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = 3x + \ln(x)$ en $g(x) = 3x$ en de lijnen $x = 1$ en $x = e^{2}$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`e^{2} + 1`,
    antwoord: 'e^2 + 1',
    alts: ['1 + e^2'],
    integrand: 'ln(x)',
    primitieve: 'x*ln(x) - x',
    domein: [1, E * E],
    grenzen: [1, E * E],
    waarde: 'e^2 + 1',
    steps: vier(
      DEEL12 +
        r` Op $[1, e^{2}]$ is $\ln(x) \ge 0$, dus de grafiek van $f$ ligt boven die van $g$. Het verschil is $\ln(x)$.`,
      r`$O(V) = \displaystyle\int_{1}^{e^{2}} \ln(x)\,\mathrm{d}x$.`,
      r`Een primitieve is $F(x) = x\ln(x) - x$.`,
      r`$F(e^{2}) - F(1) = (2e^{2} - e^{2}) - (0 - 1) = e^{2} + 1$. De oppervlakte is $e^{2} + 1$.`,
    ),
  },
  {
    cluster: 'examen_opp_twee',
    nummer: 't6',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = 1 + \sin(x)$ en $g(x) = \cos(x)$ en de lijnen $x = 0$ en $x = \dfrac{\pi}{2}$. De grafiek van $f$ ligt boven die van $g$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\dfrac{\pi}{2}`,
    antwoord: 'pi/2',
    alts: ['(1/2)*pi', 'pi/2'],
    integrand: '1 + sin(x) - cos(x)',
    primitieve: 'x - cos(x) - sin(x)',
    domein: [0, PI / 2],
    grenzen: [0, PI / 2],
    waarde: 'pi/2',
    steps: vier(
      DEEL12 +
        r` De grafiek van $f$ ligt boven die van $g$. Het verschil is $1 + \sin(x) - \cos(x)$.`,
      r`$O(V) = \displaystyle\int_{0}^{\pi/2} (1 + \sin(x) - \cos(x))\,\mathrm{d}x$.`,
      r`Een primitieve is $F(x) = x - \cos(x) - \sin(x)$.`,
      r`$F\left(\dfrac{\pi}{2}\right) - F(0) = \left(\dfrac{\pi}{2} - 1\right) - (-1) = \dfrac{\pi}{2}$. De oppervlakte is $\dfrac{\pi}{2}$.`,
    ),
  },
  {
    cluster: 'examen_opp_twee',
    nummer: 't7',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = 2x$ en $g(x) = 2x + \cos(x)$ en de lijnen $x = 0$ en $x = \dfrac{\pi}{2}$. De grafiek van $g$ ligt boven die van $f$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`1`,
    antwoord: '1',
    integrand: 'cos(x)',
    primitieve: 'sin(x)',
    domein: [0, PI / 2],
    grenzen: [0, PI / 2],
    waarde: 1,
    steps: vier(
      DEEL12 +
        r` De grafiek van $g$ ligt boven die van $f$. Op $\left[0, \dfrac{\pi}{2}\right]$ is $\cos(x) \ge 0$, dus het verschil $g(x) - f(x) = \cos(x)$ is positief.`,
      r`$O(V) = \displaystyle\int_{0}^{\pi/2} \cos(x)\,\mathrm{d}x$.`,
      r`Een primitieve is $G(x) = \sin(x)$.`,
      r`$G\left(\dfrac{\pi}{2}\right) - G(0) = 1 - 0 = 1$. De oppervlakte is $1$.`,
    ),
  },
  {
    cluster: 'examen_opp_twee',
    nummer: 't8',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \sqrt{4x + 1}$ en $g(x) = x + 1$ en de lijnen $x = 0$ en $x = 2$. Welke grafiek boven ligt, staat er niet bij: neem het verschil positief. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\dfrac{1}{3}`,
    antwoord: '1/3',
    integrand: 'sqrt(4*x + 1) - x - 1',
    primitieve: '(1/6)*(4*x + 1)^(3/2) - (1/2)*x^2 - x',
    domein: [0, 2],
    grenzen: [0, 2],
    waarde: '1/3',
    steps: vier(
      DEEL12 +
        r` De zin zegt niet welke grafiek boven ligt. Je neemt het verschil positief.`,
      r`Kijk naar $f(x) - g(x) = \sqrt{4x + 1} - x - 1$. Op $[0, 2]$ is dat minstens $0$ (het is $0$ aan de uiteinden en daartussen positief). Dus $f$ ligt boven, en $O(V) = \displaystyle\int_{0}^{2} \left(\sqrt{4x + 1} - x - 1\right)\,\mathrm{d}x$. De kern van de wortel is $4x + 1$, met afgeleide $4$.`,
      r`Een primitieve is $F(x) = \dfrac{1}{6}(4x + 1)^{3/2} - \dfrac{1}{2}x^{2} - x$.`,
      r`$F(2) - F(0) = \left(\dfrac{1}{6}\cdot 27 - 2 - 2\right) - \dfrac{1}{6} = \dfrac{1}{2} - \dfrac{1}{6} = \dfrac{1}{3}$. De oppervlakte is $\dfrac{1}{3}$.`,
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
  migrationFile: '0060_examen_oppervlakte_twee_grafieken.sql',
  headerTitle: 'Examentraining — oppervlakte tussen twee grafieken',
  sourceScript: 'scripts/examen-oppervlakte-twee.ts',
  headerNotes: [
    'Eigen onderdeel Examentraining, geen theoriehoofdstuk uit het boek.',
    'Oppervlakte van het vlakdeel tussen de grafieken van f en g, grenzen gegeven.',
    'Acht vragen, allemaal niveau 2. Het hoofdstuk en de eerdere soort blijven staan.',
    '',
    'Eigen oefenvragen, geen boek- of examenopgaven. Elke integraal wordt',
    'nagerekend door src/content/primitieven.test.ts',
    '(content/hoofdstuk-examen/oppervlakte-twee-grafieken.json).',
  ],
  topics: [
    {
      slug: 'examen_opp_twee',
      title: 'Oppervlakte tussen twee grafieken',
      order: 2,
      category: 'toepassingen',
    },
  ],
  clusters: [
    {
      topic: 'examen_opp_twee',
      slug: 'examen_opp_twee',
      title: 'Grenzen gegeven',
      order: 1,
    },
  ],
  questions: VRAGEN,
}

const wortel = process.cwd()
const map = path.join(wortel, 'content', 'hoofdstuk-examen')
mkdirSync(map, { recursive: true })

const contentPad = path.join(map, 'oppervlakte-twee-grafieken.json')
writeFileSync(
  contentPad,
  generateContentFile(
    EXAMEN,
    'Examentraining — oppervlakte tussen twee grafieken, grenzen gegeven',
  ),
)

const migratiePad = path.join(wortel, 'supabase', 'migrations', EXAMEN.migrationFile)
writeFileSync(migratiePad, generateAdditiveMigration(EXAMEN))

console.log(`Geschreven: ${contentPad}`)
console.log(`Geschreven: ${migratiePad}`)
console.log(`Vragen: ${EXAMEN.questions.length}, stappen: ${EXAMEN.questions.length * 4}`)
