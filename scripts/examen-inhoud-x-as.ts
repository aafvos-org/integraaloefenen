/**
 * Examentraining — inhoud van het lichaam dat ontstaat als een vlakdeel
 * om de x-as wentelt.
 *
 * Vier opgaven niveau 2 (grenzen gegeven) en vier niveau 3 (grenzen zelf
 * vinden). Eigen zinnen en getallen, geen boek- of examenopgave.
 *
 * Draaien met:  npx jiti scripts/examen-inhoud-x-as.ts
 *
 * Schrijft:
 *   • content/hoofdstuk-examen/inhoud-om-de-x-as.json
 *   • supabase/migrations/0066_examen_inhoud_x_as.sql
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
    cluster: 'examen_inhoud_xas',
    nummer: 'i1',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = x^{2} + 1$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Het lichaam $L$ ontstaat als $V$ om de $x$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{28}{15}\pi`,
    antwoord: '(28/15)pi',
    alts: ['(28/15)*pi', '28pi/15'],
    integrand: 'pi*(x^2 + 1)^2',
    primitieve: 'pi*(x^5/5 + (2/3)*x^3 + x)',
    domein: [0, 1],
    grenzen: [0, 1],
    waarde: '(28/15)*pi',
    steps: vier(
      DEEL12 +
        r` Op $[0, 1]$ is $f(x) \ge 1$, dus de grafiek ligt boven de $x$-as. De inhoud is $\pi$ keer de integraal van het kwadraat van $f$.`,
      r`$I(L) = \pi \displaystyle\int_{0}^{1} (x^{2} + 1)^{2}\,\mathrm{d}x = \pi \displaystyle\int_{0}^{1} (x^{4} + 2x^{2} + 1)\,\mathrm{d}x$.`,
      r`Een primitieve van de integrand is $F(x) = \pi\left(\dfrac{1}{5}x^{5} + \dfrac{2}{3}x^{3} + x\right)$.`,
      r`$F(1) - F(0) = \pi\left(\dfrac{1}{5} + \dfrac{2}{3} + 1\right) = \pi \cdot \dfrac{28}{15} = \dfrac{28}{15}\pi$. De inhoud is $\dfrac{28}{15}\pi$.`,
    ),
  },
  {
    cluster: 'examen_inhoud_xas',
    nummer: 'i2',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x + 3}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Het lichaam $L$ ontstaat als $V$ om de $x$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`(3 + 4\ln(2))\pi`,
    antwoord: '(3+4ln(2))pi',
    alts: ['pi*(3+4ln(2))', '3pi+4pi*ln(2)'],
    integrand: 'pi*(1 + 2/(x + 1))^2',
    primitieve: 'pi*(x + 4*ln(x + 1) - 4/(x + 1))',
    domein: [0, 1],
    grenzen: [0, 1],
    waarde: '(3 + 4*ln(2))*pi',
    steps: vier(
      DEEL12 +
        r` Op $[0, 1]$ zijn teller en noemer positief, dus de grafiek ligt boven de $x$-as. De inhoud is $\pi$ keer de integraal van het kwadraat van $f$. Schrijf de breuk eerst als een getal plus een rest.`,
      r`$x + 3 = 1\cdot(x + 1) + 2$, dus $f(x) = 1 + \dfrac{2}{x + 1}$. Dan $f(x)^{2} = 1 + \dfrac{4}{x + 1} + \dfrac{4}{(x + 1)^{2}}$. $I(L) = \pi \displaystyle\int_{0}^{1} \left(1 + \dfrac{4}{x + 1} + \dfrac{4}{(x + 1)^{2}}\right)\,\mathrm{d}x$.`,
      r`De kern is $x + 1$, met afgeleide $1$. Een primitieve van de integrand is $F(x) = \pi\left(x + 4\ln(x + 1) - \dfrac{4}{x + 1}\right)$.`,
      r`$F(1) - F(0) = \pi(1 + 4\ln(2) - 2) - \pi(0 - 4) = \pi(4\ln(2) + 3) = (3 + 4\ln(2))\pi$. De inhoud is $(3 + 4\ln(2))\pi$.`,
    ),
  },
  {
    cluster: 'examen_inhoud_xas',
    nummer: 'i3',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sqrt{2x + 3}$, de $x$-as en de lijnen $x = 1$ en $x = 3$. Het lichaam $L$ ontstaat als $V$ om de $x$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`14\pi`,
    antwoord: '14pi',
    alts: ['14*pi'],
    integrand: 'pi*(2*x + 3)',
    primitieve: 'pi*(x^2 + 3*x)',
    domein: [1, 3],
    grenzen: [1, 3],
    waarde: '14*pi',
    steps: vier(
      DEEL12 +
        r` Op $[1, 3]$ is $2x + 3 > 0$, dus de grafiek ligt boven de $x$-as. Het kwadraat van de wortel is $2x + 3$.`,
      r`$I(L) = \pi \displaystyle\int_{1}^{3} \left(\sqrt{2x + 3}\right)^{2}\,\mathrm{d}x = \pi \displaystyle\int_{1}^{3} (2x + 3)\,\mathrm{d}x$.`,
      r`Een primitieve van de integrand is $F(x) = \pi(x^{2} + 3x)$.`,
      r`$F(3) - F(1) = \pi(9 + 9) - \pi(1 + 3) = 18\pi - 4\pi = 14\pi$. De inhoud is $14\pi$.`,
    ),
  },
  {
    cluster: 'examen_inhoud_xas',
    nummer: 'i4',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = e^{x}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Het lichaam $L$ ontstaat als $V$ om de $x$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{1}{2}(e^{2} - 1)\pi`,
    antwoord: '(1/2)(e^2-1)pi',
    alts: ['(1/2)*pi*(e^2-1)', 'pi*(e^2-1)/2'],
    integrand: 'pi*e^(2*x)',
    primitieve: 'pi*(1/2)*e^(2*x)',
    domein: [0, 1],
    grenzen: [0, 1],
    waarde: '(1/2)*(e^2 - 1)*pi',
    steps: vier(
      DEEL12 +
        r` $e^{x}$ is overal positief. Het kwadraat is $e^{2x}$. De kern van die macht is $2x$, met afgeleide $2$.`,
      r`$I(L) = \pi \displaystyle\int_{0}^{1} (e^{x})^{2}\,\mathrm{d}x = \pi \displaystyle\int_{0}^{1} e^{2x}\,\mathrm{d}x$.`,
      r`Een primitieve van de integrand is $F(x) = \pi \cdot \dfrac{1}{2}e^{2x}$.`,
      r`$F(1) - F(0) = \dfrac{1}{2}\pi e^{2} - \dfrac{1}{2}\pi = \dfrac{1}{2}(e^{2} - 1)\pi$. De inhoud is $\dfrac{1}{2}(e^{2} - 1)\pi$.`,
    ),
  },
  {
    cluster: 'examen_inhoud_xas_grenzen',
    nummer: 'i5',
    level: 3,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = 2x - x^{2}$ en de $x$-as. Het lichaam $L$ ontstaat als $V$ om de $x$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{16}{15}\pi`,
    antwoord: '(16/15)pi',
    alts: ['(16/15)*pi', '16pi/15'],
    integrand: 'pi*(2*x - x^2)^2',
    primitieve: 'pi*((4/3)*x^3 - x^4 + (1/5)*x^5)',
    domein: [0, 2],
    grenzen: [0, 2],
    waarde: '(16/15)*pi',
    steps: vier(
      DEEL12 +
        r` De grafiek snijdt de $x$-as waar $2x - x^{2} = 0$, dus $x(2 - x) = 0$. De snijpunten zijn $x = 0$ en $x = 2$. Daartussen is $f(1) = 1$, dus de grafiek ligt boven de $x$-as. De inhoud is $\pi$ keer de integraal van het kwadraat van $f$.`,
      r`$I(L) = \pi \displaystyle\int_{0}^{2} (2x - x^{2})^{2}\,\mathrm{d}x = \pi \displaystyle\int_{0}^{2} (4x^{2} - 4x^{3} + x^{4})\,\mathrm{d}x$.`,
      r`Een primitieve van de integrand is $F(x) = \pi\left(\dfrac{4}{3}x^{3} - x^{4} + \dfrac{1}{5}x^{5}\right)$.`,
      r`$F(2) - F(0) = \pi\left(\dfrac{32}{3} - 16 + \dfrac{32}{5}\right) = \pi\left(\dfrac{160}{15} - \dfrac{240}{15} + \dfrac{96}{15}\right) = \dfrac{16}{15}\pi$. De inhoud is $\dfrac{16}{15}\pi$.`,
    ),
  },
  {
    cluster: 'examen_inhoud_xas_grenzen',
    nummer: 'i6',
    level: 3,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \ln(x)$, de $x$-as en de lijn $x = e$. Het lichaam $L$ ontstaat als $V$ om de $x$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`(e - 2)\pi`,
    antwoord: '(e-2)pi',
    alts: ['pi*(e-2)', 'pi*e-2*pi'],
    integrand: 'pi*(ln(x))^2',
    primitieve: 'pi*(x*(ln(x))^2 - 2*x*ln(x) + 2*x)',
    domein: [1, E],
    grenzen: [1, E],
    waarde: '(e - 2)*pi',
    steps: vier(
      DEEL12 +
        r` $\ln(x) = 0$ bij $x = 1$. Samen met de lijn $x = e$ zijn dat de grenzen. Op $[1, e]$ is $\ln(x) \ge 0$, dus de grafiek ligt boven de $x$-as. De inhoud is $\pi$ keer de integraal van $(\ln x)^{2}$.`,
      r`$I(L) = \pi \displaystyle\int_{1}^{e} (\ln(x))^{2}\,\mathrm{d}x$.`,
      r`Met partieel integreren vind je een primitieve van $(\ln x)^{2}$, namelijk $x(\ln x)^{2} - 2x\ln x + 2x$. Een primitieve van de integrand is dus $F(x) = \pi\bigl(x(\ln x)^{2} - 2x\ln x + 2x\bigr)$.`,
      r`$F(e) - F(1) = \pi(e - 2e + 2e) - \pi(2) = \pi e - 2\pi = (e - 2)\pi$. De inhoud is $(e - 2)\pi$.`,
    ),
  },
  {
    cluster: 'examen_inhoud_xas_grenzen',
    nummer: 'i7',
    level: 3,
    latex: r`Het vlakdeel $V$ in het eerste kwadrant wordt ingesloten door de grafiek van $f(x) = \sin(x)$ en de $x$-as. Het lichaam $L$ ontstaat als $V$ om de $x$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{1}{2}\pi^{2}`,
    antwoord: '(1/2)pi^2',
    alts: ['pi^2/2', '(pi^2)/2'],
    integrand: 'pi*(sin(x))^2',
    primitieve: 'pi*(x/2 - (1/4)*sin(2*x))',
    domein: [0, PI],
    grenzen: [0, PI],
    waarde: '(1/2)*pi^2',
    steps: vier(
      DEEL12 +
        r` In het eerste kwadrant snijdt $\sin(x)$ de $x$-as in $x = 0$ en $x = \pi$. Daartussen ligt de grafiek boven de $x$-as. De inhoud is $\pi$ keer de integraal van $\sin^{2}(x)$.`,
      r`Gebruik $\sin^{2}(x) = \dfrac{1 - \cos(2x)}{2}$. $I(L) = \pi \displaystyle\int_{0}^{\pi} \dfrac{1 - \cos(2x)}{2}\,\mathrm{d}x$. De kern van de cosinus is $2x$, met afgeleide $2$.`,
      r`Een primitieve van de integrand is $F(x) = \pi\left(\dfrac{1}{2}x - \dfrac{1}{4}\sin(2x)\right)$.`,
      r`$F(\pi) - F(0) = \pi \cdot \dfrac{\pi}{2} - 0 = \dfrac{1}{2}\pi^{2}$. De inhoud is $\dfrac{1}{2}\pi^{2}$.`,
    ),
  },
  {
    cluster: 'examen_inhoud_xas_grenzen',
    nummer: 'i8',
    level: 3,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \sqrt{x}$ en $g(x) = \dfrac{1}{2}x$. Het lichaam $L$ ontstaat als $V$ om de $x$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{8}{3}\pi`,
    antwoord: '(8/3)pi',
    alts: ['(8/3)*pi', '8pi/3'],
    integrand: 'pi*(x - (x/2)^2)',
    primitieve: 'pi*((1/2)*x^2 - (1/12)*x^3)',
    domein: [0, 4],
    grenzen: [0, 4],
    waarde: '(8/3)*pi',
    steps: vier(
      DEEL12 +
        r` De grafieken snijden elkaar waar $\sqrt{x} = \dfrac{1}{2}x$. Kwadrateren geeft $x = \dfrac{1}{4}x^{2}$, dus $x(x - 4) = 0$. Beide oplossingen kloppen: $x = 0$ en $x = 4$. Op dat stuk is $f(1) = 1$ groter dan $g(1) = \dfrac{1}{2}$, dus $f$ ligt verder van de $x$-as. De inhoud is $\pi$ keer de integraal van het verschil van de kwadraten.`,
      r`$I(L) = \pi \displaystyle\int_{0}^{4} \left(x - \left(\dfrac{1}{2}x\right)^{2}\right)\,\mathrm{d}x = \pi \displaystyle\int_{0}^{4} \left(x - \dfrac{1}{4}x^{2}\right)\,\mathrm{d}x$.`,
      r`Een primitieve van de integrand is $F(x) = \pi\left(\dfrac{1}{2}x^{2} - \dfrac{1}{12}x^{3}\right)$.`,
      r`$F(4) - F(0) = \pi\left(8 - \dfrac{16}{3}\right) = \dfrac{8}{3}\pi$. De inhoud is $\dfrac{8}{3}\pi$.`,
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
  migrationFile: '0066_examen_inhoud_x_as.sql',
  headerTitle: 'Examentraining — inhoud om de x-as',
  sourceScript: 'scripts/examen-inhoud-x-as.ts',
  headerNotes: [
    'Eigen onderdeel Examentraining, geen theoriehoofdstuk uit het boek.',
    'De inhoud van het lichaam dat ontstaat als een vlakdeel om de x-as wentelt.',
    'Vier vragen niveau 2 (grenzen gegeven) en vier niveau 3 (grenzen zelf vinden).',
    '',
    'Eigen oefenvragen, geen boek- of examenopgaven. Elke integraal wordt',
    'nagerekend door src/content/primitieven.test.ts',
    '(content/hoofdstuk-examen/inhoud-om-de-x-as.json).',
  ],
  topics: [
    {
      slug: 'examen_inhoud_xas',
      title: 'Inhoud om de x-as',
      order: 5,
      category: 'toepassingen',
    },
    {
      slug: 'examen_inhoud_xas_grenzen',
      title: 'Inhoud om de x-as, grenzen zelf',
      order: 6,
      category: 'toepassingen',
    },
  ],
  clusters: [
    {
      topic: 'examen_inhoud_xas',
      slug: 'examen_inhoud_xas',
      title: 'Grenzen gegeven',
      order: 1,
    },
    {
      topic: 'examen_inhoud_xas_grenzen',
      slug: 'examen_inhoud_xas_grenzen',
      title: 'Grenzen zelf vinden',
      order: 1,
    },
  ],
  questions: VRAGEN,
}

const wortel = process.cwd()
const map = path.join(wortel, 'content', 'hoofdstuk-examen')
mkdirSync(map, { recursive: true })

const contentPad = path.join(map, 'inhoud-om-de-x-as.json')
writeFileSync(
  contentPad,
  generateContentFile(EXAMEN, 'Examentraining — inhoud om de x-as'),
)

const migratiePad = path.join(wortel, 'supabase', 'migrations', EXAMEN.migrationFile)
writeFileSync(migratiePad, generateAdditiveMigration(EXAMEN))

console.log(`Geschreven: ${contentPad}`)
console.log(`Geschreven: ${migratiePad}`)
console.log(`Vragen: ${EXAMEN.questions.length}, stappen: ${EXAMEN.questions.length * 4}`)
