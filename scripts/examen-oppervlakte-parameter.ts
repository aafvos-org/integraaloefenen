/**
 * Examentraining — bereken de waarde van p bij een oppervlakte.
 *
 * Acht eigen opgaven, niveau 3. Geen boek- of examenopgave.
 * De oppervlakte hangt van p af en is gelijk aan een gegeven getal,
 * of gelijk aan de oppervlakte van een ander genoemd vlakdeel.
 * Het antwoord dat de site nakijkt, is de waarde van p.
 *
 * Draaien met:  npx jiti scripts/examen-oppervlakte-parameter.ts
 *
 * Schrijft:
 *   • content/hoofdstuk-examen/oppervlakte-parameter.json
 *   • supabase/migrations/0062_examen_oppervlakte_parameter.sql
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

const DEEL123 = r`Hier spelen alle drie de delen: eerst vertaal je het verhaal naar een integraal, daarna reken je die uit (er komt een uitdrukking in $p$ uit), en tot slot los je de vergelijking op.`

function vier(a: string, b: string, c: string, d: string): Steps {
  return [a, b, c, d]
}

const PI = Math.PI

const VRAGEN: AdditiveQ[] = [
  {
    cluster: 'examen_opp_parameter',
    nummer: 'p1',
    level: 3,
    latex: r`Voor elke $p$ met $0 < p < 4$ sluit de grafiek van $f(x) = 4x - x^{2}$ met de $x$-as en de lijn $x = p$ een vlakdeel $V_p$ in. Bereken exact de waarde van $p$ waarvoor de oppervlakte van $V_p$ gelijk is aan $\dfrac{16}{3}$.`,
    antwoordLatex: r`p = 2`,
    antwoord: '2',
    alts: ['p = 2', 'p=2'],
    integrand: '4*x - x^2',
    primitieve: '2*x^2 - (1/3)*x^3',
    domein: [0, 4],
    grenzen: [0, 2],
    waarde: '16/3',
    steps: vier(
      DEEL123 +
        r` Op $[0, p]$ ligt de grafiek boven de $x$-as, want $f(x) = x(4 - x)$ en $0 < p < 4$. De oppervlakte is dus de integraal zelf.`,
      r`$O(V_p) = \displaystyle\int_{0}^{p} (4x - x^{2})\,\mathrm{d}x$.`,
      r`Een primitieve is $F(x) = 2x^{2} - \dfrac{1}{3}x^{3}$. Dus $O(V_p) = 2p^{2} - \dfrac{1}{3}p^{3}$.`,
      r`Deel 3: $2p^{2} - \dfrac{1}{3}p^{3} = \dfrac{16}{3}$. Vermenigvuldig met $3$: $6p^{2} - p^{3} = 16$, dus $p^{3} - 6p^{2} + 16 = 0$. Je probeert $p = 2$: $8 - 24 + 16 = 0$. Delen door $p - 2$ geeft $(p - 2)(p^{2} - 4p - 8) = 0$. Uit $p^{2} - 4p - 8 = 0$ volgt $p = 2 \pm 2\sqrt{3}$. Alleen $p = 2$ ligt tussen $0$ en $4$.`,
    ),
  },
  {
    cluster: 'examen_opp_parameter',
    nummer: 'p2',
    level: 3,
    latex: r`Voor elke $p > 0$ sluit de grafiek van $f(x) = \dfrac{px + 3}{x + 1}$ met de $x$-as en de lijnen $x = 0$ en $x = 1$ een vlakdeel $V_p$ in. Bereken exact de waarde van $p$ waarvoor de oppervlakte van $V_p$ gelijk is aan $2 + \ln(2)$.`,
    antwoordLatex: r`p = 2`,
    antwoord: '2',
    alts: ['p = 2', 'p=2'],
    integrand: '(2*x + 3)/(x + 1)',
    primitieve: '2*x + ln(x + 1)',
    domein: [0, 1],
    grenzen: [0, 1],
    waarde: '2 + ln(2)',
    steps: vier(
      DEEL123 +
        r` Op $[0, 1]$ zijn teller en noemer positief zolang $p > 0$, dus de grafiek ligt boven de $x$-as. Schrijf de breuk eerst als een getal plus een rest.`,
      r`$px + 3 = p(x + 1) + (3 - p)$, dus $f(x) = p + \dfrac{3 - p}{x + 1}$. $O(V_p) = \displaystyle\int_{0}^{1} \left(p + \dfrac{3 - p}{x + 1}\right)\,\mathrm{d}x$.`,
      r`Een primitieve is $F(x) = px + (3 - p)\ln(x + 1)$. Op $[0, 1]$ is $x + 1$ positief. $O(V_p) = F(1) - F(0) = p + (3 - p)\ln(2)$.`,
      r`Deel 3: $p + (3 - p)\ln(2) = 2 + \ln(2)$. Haal de termen met $p$ bij elkaar: $p(1 - \ln(2)) = 2(1 - \ln(2))$. Deel door $1 - \ln(2)$. Je vindt $p = 2$.`,
    ),
  },
  {
    cluster: 'examen_opp_parameter',
    nummer: 'p3',
    level: 3,
    latex: r`Voor elke $p > 0$ sluit de grafiek van $f(x) = \sqrt{4x + 4}$ met de $x$-as en de lijnen $x = 0$ en $x = p$ een vlakdeel $V_p$ in. Bereken exact de waarde van $p$ waarvoor de oppervlakte van $V_p$ gelijk is aan $\dfrac{28}{3}$.`,
    antwoordLatex: r`p = 3`,
    antwoord: '3',
    alts: ['p = 3', 'p=3'],
    integrand: 'sqrt(4*x + 4)',
    primitieve: '(1/6)*(4*x + 4)^(3/2)',
    domein: [0, 4],
    grenzen: [0, 3],
    waarde: '28/3',
    steps: vier(
      DEEL123 +
        r` Op $[0, p]$ is $4x + 4 > 0$, dus de grafiek ligt boven de $x$-as.`,
      r`$O(V_p) = \displaystyle\int_{0}^{p} \sqrt{4x + 4}\,\mathrm{d}x$. De kern is $4x + 4$, en die heeft afgeleide $4$.`,
      r`Een primitieve is $F(x) = \dfrac{1}{6}(4x + 4)^{3/2}$. Dus $O(V_p) = \dfrac{1}{6}\left((4p + 4)^{3/2} - 8\right)$.`,
      r`Deel 3: $\dfrac{1}{6}\left((4p + 4)^{3/2} - 8\right) = \dfrac{28}{3}$. Dan $(4p + 4)^{3/2} = 64$. Omdat $16^{3/2} = 64$ en de wortel positief is, geldt $4p + 4 = 16$. Je vindt $p = 3$.`,
    ),
  },
  {
    cluster: 'examen_opp_parameter',
    nummer: 'p4',
    level: 3,
    latex: r`Voor elke $p > 0$ sluit de grafiek van $f(x) = e^{x}$ met de $x$-as, de $y$-as en de lijn $x = p$ een vlakdeel $V_p$ in. Het vlakdeel $W$ wordt ingesloten door de grafiek van $g(x) = 3e^{3x}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de waarde van $p$ waarvoor de oppervlakte van $V_p$ gelijk is aan de oppervlakte van $W$.`,
    antwoordLatex: r`p = 3`,
    antwoord: '3',
    alts: ['p = 3', 'p=3'],
    integrand: '3*e^(3*x)',
    primitieve: 'e^(3*x)',
    domein: [0, 1],
    grenzen: [0, 1],
    waarde: 'e^3 - 1',
    steps: vier(
      DEEL123 +
        r` Beide grafieken liggen boven de $x$-as. Je rekent beide oppervlakten uit en stelt ze aan elkaar gelijk.`,
      r`$O(V_p) = \displaystyle\int_{0}^{p} e^{x}\,\mathrm{d}x$ en $O(W) = \displaystyle\int_{0}^{1} 3e^{3x}\,\mathrm{d}x$. Bij $e^{3x}$ is de kern $3x$, met afgeleide $3$.`,
      r`Een primitieve van $e^{x}$ is $e^{x}$, dus $O(V_p) = e^{p} - 1$. Een primitieve van $3e^{3x}$ is $e^{3x}$, dus $O(W) = e^{3} - 1$.`,
      r`Deel 3: $e^{p} - 1 = e^{3} - 1$, dus $e^{p} = e^{3}$ en $p = 3$.`,
    ),
  },
  {
    cluster: 'examen_opp_parameter',
    nummer: 'p5',
    level: 3,
    latex: r`Voor elke $p > 1$ sluit de grafiek van $f(x) = \ln(x)$ met de $x$-as en de lijnen $x = 1$ en $x = p$ een vlakdeel $V_p$ in. Bereken exact de waarde van $p$ waarvoor de oppervlakte van $V_p$ gelijk is aan $1$.`,
    antwoordLatex: r`p = e`,
    antwoord: 'e',
    alts: ['p = e', 'p=e'],
    integrand: 'ln(x)',
    primitieve: 'x*ln(x) - x',
    domein: [1, 4],
    grenzen: [1, Math.E],
    waarde: 1,
    steps: vier(
      DEEL123 +
        r` Op $[1, p]$ met $p > 1$ is $\ln(x) > 0$, dus de grafiek ligt boven de $x$-as.`,
      r`$O(V_p) = \displaystyle\int_{1}^{p} \ln(x)\,\mathrm{d}x$.`,
      r`Een primitieve is $F(x) = x\ln(x) - x$. Dus $O(V_p) = (p\ln(p) - p) - (0 - 1) = p\ln(p) - p + 1$.`,
      r`Deel 3: $p\ln(p) - p + 1 = 1$, dus $p(\ln(p) - 1) = 0$. Omdat $p > 1$ is $\ln(p) = 1$, en dus $p = e$.`,
    ),
  },
  {
    cluster: 'examen_opp_parameter',
    nummer: 'p6',
    level: 3,
    latex: r`Voor elke $p$ met $0 < p \le \dfrac{\pi}{2}$ sluit de grafiek van $f(x) = \sin(2x)$ met de $x$-as en de lijnen $x = 0$ en $x = p$ een vlakdeel $V_p$ in. Bereken exact de waarde van $p$ waarvoor de oppervlakte van $V_p$ gelijk is aan $1$.`,
    antwoordLatex: r`p = \dfrac{\pi}{2}`,
    antwoord: 'pi/2',
    alts: ['p = pi/2', 'p=pi/2', '(1/2)*pi', 'pi/2'],
    integrand: 'sin(2*x)',
    primitieve: '-(1/2)*cos(2*x)',
    domein: [0, PI / 2],
    grenzen: [0, PI / 2],
    waarde: 1,
    steps: vier(
      DEEL123 +
        r` Op $\left(0, \dfrac{\pi}{2}\right]$ loopt $2x$ van $0$ tot $\pi$, dus $\sin(2x)$ is daar positief. De oppervlakte is de integraal.`,
      r`$O(V_p) = \displaystyle\int_{0}^{p} \sin(2x)\,\mathrm{d}x$. De kern is $2x$, met afgeleide $2$.`,
      r`Een primitieve is $F(x) = -\dfrac{1}{2}\cos(2x)$. Dus $O(V_p) = -\dfrac{1}{2}\cos(2p) + \dfrac{1}{2} = \dfrac{1 - \cos(2p)}{2}$.`,
      r`Deel 3: $\dfrac{1 - \cos(2p)}{2} = 1$, dus $\cos(2p) = -1$. Op het gegeven stuk is $0 < 2p \le \pi$, en daar geldt dat alleen bij $2p = \pi$. Je vindt $p = \dfrac{\pi}{2}$.`,
    ),
  },
  {
    cluster: 'examen_opp_parameter',
    nummer: 'p7',
    level: 3,
    latex: r`Voor elke $p$ met $0 < p \le \dfrac{\pi}{6}$ sluit de grafiek van $f(x) = \cos(3x)$ met de $x$-as en de lijnen $x = 0$ en $x = p$ een vlakdeel $V_p$ in. Bereken exact de waarde van $p$ waarvoor de oppervlakte van $V_p$ gelijk is aan $\dfrac{1}{3}$.`,
    antwoordLatex: r`p = \dfrac{\pi}{6}`,
    antwoord: 'pi/6',
    alts: ['p = pi/6', 'p=pi/6', '(1/6)*pi', 'pi/6'],
    integrand: 'cos(3*x)',
    primitieve: '(1/3)*sin(3*x)',
    domein: [0, PI / 6],
    grenzen: [0, PI / 6],
    waarde: '1/3',
    steps: vier(
      DEEL123 +
        r` Op $\left[0, \dfrac{\pi}{6}\right]$ loopt $3x$ van $0$ tot $\dfrac{\pi}{2}$, dus $\cos(3x)$ is daar positief. De oppervlakte is de integraal.`,
      r`$O(V_p) = \displaystyle\int_{0}^{p} \cos(3x)\,\mathrm{d}x$. De kern is $3x$, met afgeleide $3$.`,
      r`Een primitieve is $F(x) = \dfrac{1}{3}\sin(3x)$. Dus $O(V_p) = \dfrac{1}{3}\sin(3p)$.`,
      r`Deel 3: $\dfrac{1}{3}\sin(3p) = \dfrac{1}{3}$, dus $\sin(3p) = 1$. Op het gegeven stuk is $0 < 3p \le \dfrac{\pi}{2}$, en daar geldt dat alleen bij $3p = \dfrac{\pi}{2}$. Je vindt $p = \dfrac{\pi}{6}$.`,
    ),
  },
  {
    cluster: 'examen_opp_parameter',
    nummer: 'p8',
    level: 3,
    latex: r`Het vlakdeel $W$ wordt ingesloten door de grafiek van $f(x) = 4 - x$, de $x$-as en de lijnen $x = 0$ en $x = 4$. Voor elke $p$ met $0 < p < 4$ snijdt de lijn $x = p$ het vlakdeel $W$ in een linkerdeel $V$ en een rechterdeel. Bereken exact de waarde van $p$ waarvoor die twee delen dezelfde oppervlakte hebben.`,
    antwoordLatex: r`p = 4 - 2\sqrt{2}`,
    antwoord: '4 - 2*sqrt(2)',
    alts: ['4-2sqrt(2)', '4 - sqrt(8)', 'p = 4 - 2*sqrt(2)', 'p=4-2*sqrt(2)'],
    integrand: '4 - x',
    primitieve: '4*x - (1/2)*x^2',
    domein: [0, 4],
    grenzen: [0, 4 - 2 * Math.sqrt(2)],
    waarde: 4,
    steps: vier(
      DEEL123 +
        r` De grafiek van $f(x) = 4 - x$ ligt op $[0, 4]$ boven de $x$-as. Het linkerdeel $V$ loopt van $x = 0$ tot $x = p$.`,
      r`Eerst de hele oppervlakte: $O(W) = \displaystyle\int_{0}^{4} (4 - x)\,\mathrm{d}x$. Het linkerdeel is $O(V) = \displaystyle\int_{0}^{p} (4 - x)\,\mathrm{d}x$.`,
      r`Een primitieve is $F(x) = 4x - \dfrac{1}{2}x^{2}$. Dus $O(W) = 8$, en $O(V) = 4p - \dfrac{1}{2}p^{2}$. Het rechterdeel heeft oppervlakte $8 - O(V)$.`,
      r`Deel 3: de delen zijn even groot, dus $O(V) = 4$. Dan $4p - \dfrac{1}{2}p^{2} = 4$. Vermenigvuldig met $2$: $p^{2} - 8p + 8 = 0$. De oplossingen zijn $p = 4 \pm 2\sqrt{2}$. Alleen $p = 4 - 2\sqrt{2}$ ligt tussen $0$ en $4$.`,
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

// Bij p = 3 is de oppervlakte onder e^x dezelfde als die onder 3e^{3x} op [0, 1].
{
  const oppervlakteV = (evaluate('e^3') as number) - (evaluate('e^0') as number)
  const oppervlakteW = evaluate('e^3 - 1') as number
  if (Math.abs(oppervlakteV - oppervlakteW) > 1e-9) {
    throw new Error(`p4: oppervlakte van V_3 is ${oppervlakteV}, van W is ${oppervlakteW}`)
  }
}

const EXAMEN: AdditiveChapter = {
  chapterSlug: 'examentraining',
  chapterTitle: 'Examentraining',
  bookPart: 5,
  chapterOrder: 16,
  site: 'integralen',
  migrationFile: '0062_examen_oppervlakte_parameter.sql',
  headerTitle: 'Examentraining — bereken p bij een oppervlakte',
  sourceScript: 'scripts/examen-oppervlakte-parameter.ts',
  headerNotes: [
    'Eigen onderdeel Examentraining, geen theoriehoofdstuk uit het boek.',
    'De oppervlakte hangt van p af. Die is gelijk aan een gegeven getal,',
    'of gelijk aan de oppervlakte van een ander genoemd vlakdeel.',
    'Het antwoord is de waarde van p. Acht vragen, allemaal niveau 3.',
    '',
    'Eigen oefenvragen, geen boek- of examenopgaven. Elke integraal wordt',
    'nagerekend door src/content/primitieven.test.ts',
    '(content/hoofdstuk-examen/oppervlakte-parameter.json).',
  ],
  topics: [
    {
      slug: 'examen_opp_parameter',
      title: 'Oppervlakte en de waarde van p',
      order: 4,
      category: 'toepassingen',
    },
  ],
  clusters: [
    {
      topic: 'examen_opp_parameter',
      slug: 'examen_opp_parameter',
      title: 'Bereken p',
      order: 1,
    },
  ],
  questions: VRAGEN,
}

const wortel = process.cwd()
const map = path.join(wortel, 'content', 'hoofdstuk-examen')
mkdirSync(map, { recursive: true })

const contentPad = path.join(map, 'oppervlakte-parameter.json')
writeFileSync(
  contentPad,
  generateContentFile(
    EXAMEN,
    'Examentraining — bereken p bij een oppervlakte',
  ),
)

const migratiePad = path.join(wortel, 'supabase', 'migrations', EXAMEN.migrationFile)
writeFileSync(migratiePad, generateAdditiveMigration(EXAMEN))

console.log(`Geschreven: ${contentPad}`)
console.log(`Geschreven: ${migratiePad}`)
console.log(`Vragen: ${EXAMEN.questions.length}, stappen: ${EXAMEN.questions.length * 4}`)
