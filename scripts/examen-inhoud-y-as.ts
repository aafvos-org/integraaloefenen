/**
 * Examentraining — inhoud van het lichaam dat ontstaat als een vlakdeel
 * om de y-as wentelt.
 *
 * Acht opgaven niveau 3. Vier met de y-waarden in de zin, vier waarbij je
 * die y-waarden zelf zoekt. Eigen zinnen en getallen, geen boek- of examenopgave.
 *
 * De inhoud is π keer de integraal van x in het kwadraat. In de JSON heet de
 * integratievariabele x, zodat de rekentest de primitieve kan differentiëren.
 *
 * Draaien met:  npx jiti scripts/examen-inhoud-y-as.ts
 *
 * Schrijft:
 *   • content/hoofdstuk-examen/inhoud-om-de-y-as.json
 *   • supabase/migrations/0064_examen_inhoud_y_as.sql
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
    cluster: 'examen_inhoud_yas',
    nummer: 'y1',
    level: 3,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(y) = y^{2} + 2$, de $y$-as en de lijnen $y = 0$ en $y = 1$. Het lichaam $L$ ontstaat als $V$ om de $y$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{83}{15}\pi`,
    antwoord: '(83/15)pi',
    alts: ['(83/15)*pi', '83pi/15'],
    integrand: 'pi*(x^2 + 2)^2',
    primitieve: 'pi*(x^5/5 + (4/3)*x^3 + 4*x)',
    domein: [0, 1],
    grenzen: [0, 1],
    waarde: '(83/15)*pi',
    steps: vier(
      DEEL12 +
        r` De $y$-waarden staan in de opgave: van $0$ tot $1$. Op dat stuk is $f(y) \ge 2$, dus de grafiek ligt rechts van de $y$-as. De straal is $f(y)$. De inhoud is $\pi$ keer de integraal van het kwadraat van $f$.`,
      r`$I(L) = \pi \displaystyle\int_{0}^{1} (y^{2} + 2)^{2}\,\mathrm{d}y$. Werk het kwadraat uit: dat is $\pi \displaystyle\int_{0}^{1} (y^{4} + 4y^{2} + 4)\,\mathrm{d}y$.`,
      r`Een primitieve is $F(y) = \pi\left(\dfrac{1}{5}y^{5} + \dfrac{4}{3}y^{3} + 4y\right)$.`,
      r`$F(1) - F(0) = \pi\left(\dfrac{1}{5} + \dfrac{4}{3} + 4\right)$. Dat is $\dfrac{83}{15}\pi$. De inhoud is $\dfrac{83}{15}\pi$.`,
    ),
  },
  {
    cluster: 'examen_inhoud_yas',
    nummer: 'y2',
    level: 3,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(y) = \dfrac{y + 5}{y + 1}$, de $y$-as en de lijnen $y = 0$ en $y = 1$. Het lichaam $L$ ontstaat als $V$ om de $y$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`(9 + 8\ln(2))\pi`,
    antwoord: '(9+8ln(2))pi',
    alts: ['pi*(9+8ln(2))', '9pi+8pi*ln(2)'],
    integrand: 'pi*(1 + 8/(x + 1) + 16/(x + 1)^2)',
    primitieve: 'pi*(x + 8*ln(x + 1) - 16/(x + 1))',
    domein: [0, 1],
    grenzen: [0, 1],
    waarde: '(9 + 8*ln(2))*pi',
    steps: vier(
      DEEL12 +
        r` De $y$-waarden staan in de opgave: van $0$ tot $1$. Op dat stuk zijn teller en noemer positief, dus de grafiek ligt rechts van de $y$-as. De inhoud is $\pi$ keer de integraal van het kwadraat van $f$. Schrijf de breuk eerst als een getal plus een rest.`,
      r`$y + 5 = 1\cdot(y + 1) + 4$, dus $f(y) = 1 + \dfrac{4}{y + 1}$. Het kwadraat is $1 + \dfrac{8}{y + 1} + \dfrac{16}{(y + 1)^{2}}$. $I(L)$ is $\pi$ keer de integraal daarvan van $0$ tot $1$.`,
      r`De kern is $y + 1$, met afgeleide $1$. Een primitieve is $F(y) = \pi\left(y + 8\ln(y + 1) - \dfrac{16}{y + 1}\right)$.`,
      r`$F(1) = \pi(8\ln(2) - 7)$ en $F(0) = -16\pi$. Het verschil is $(9 + 8\ln(2))\pi$. De inhoud is $(9 + 8\ln(2))\pi$.`,
    ),
  },
  {
    cluster: 'examen_inhoud_yas',
    nummer: 'y4',
    level: 3,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(y) = e^{y/2}$, de $y$-as en de lijnen $y = 0$ en $y = 2$. Het lichaam $L$ ontstaat als $V$ om de $y$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`(e^{2} - 1)\pi`,
    antwoord: '(e^2-1)pi',
    alts: ['pi*(e^2-1)', 'pi*e^2-pi'],
    integrand: 'pi*e^x',
    primitieve: 'pi*e^x',
    domein: [0, 2],
    grenzen: [0, 2],
    waarde: '(e^2 - 1)*pi',
    steps: vier(
      DEEL12 +
        r` De $y$-waarden staan in de opgave: van $0$ tot $2$. $e^{y/2}$ is overal positief, dus de grafiek ligt rechts van de $y$-as. Het kwadraat is $e^{y}$.`,
      r`$I(L) = \pi \displaystyle\int_{0}^{2} \left(e^{y/2}\right)^{2}\,\mathrm{d}y$. Dat is $\pi \displaystyle\int_{0}^{2} e^{y}\,\mathrm{d}y$.`,
      r`Een primitieve van de integrand is $F(y) = \pi e^{y}$.`,
      r`$F(2) - F(0) = \pi e^{2} - \pi = (e^{2} - 1)\pi$. De inhoud is $(e^{2} - 1)\pi$.`,
    ),
  },
  {
    cluster: 'examen_inhoud_yas',
    nummer: 'y5',
    level: 3,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(y) = 1 + \ln(y)$, de $y$-as en de lijnen $y = 1$ en $y = e$. Het lichaam $L$ ontstaat als $V$ om de $y$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`(2e - 1)\pi`,
    antwoord: '(2e-1)pi',
    alts: ['pi*(2e-1)', '2*e*pi-pi'],
    integrand: 'pi*(1 + ln(x))^2',
    primitieve: 'pi*(x*(ln(x))^2 + x)',
    domein: [1, E],
    grenzen: [1, E],
    waarde: '(2*e - 1)*pi',
    steps: vier(
      DEEL12 +
        r` De $y$-waarden staan in de opgave: van $1$ tot $e$. Op dat stuk is $\ln(y) \ge 0$, dus $f(y) \ge 1$ en de grafiek ligt rechts van de $y$-as. De inhoud is $\pi$ keer de integraal van $(1 + \ln(y))^{2}$.`,
      r`$(1 + \ln(y))^{2} = 1 + 2\ln(y) + (\ln(y))^{2}$. $I(L)$ is $\pi$ keer de integraal daarvan van $1$ tot $e$.`,
      r`Een primitieve van $\ln(y)$ is $y\ln(y) - y$. Een primitieve van $(\ln(y))^{2}$ is $y(\ln(y))^{2} - 2y\ln(y) + 2y$. Die tel je bij elkaar op. Een primitieve van de integrand is $F(y) = \pi\bigl(y(\ln(y))^{2} + y\bigr)$.`,
      r`$F(e) = 2e\pi$ en $F(1) = \pi$. Het verschil is $(2e - 1)\pi$. De inhoud is $(2e - 1)\pi$.`,
    ),
  },
  {
    cluster: 'examen_inhoud_yas_grenzen',
    nummer: 'y3',
    level: 3,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sqrt{4x + 1}$, de $y$-as en de lijn $y = 3$. De bovenste $y$-waarde is $3$. Zoek zelf de onderste $y$-waarde, waar de grafiek de $y$-as snijdt. Het lichaam $L$ ontstaat als $V$ om de $y$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{31}{15}\pi`,
    antwoord: '(31/15)pi',
    alts: ['(31/15)*pi', '31pi/15'],
    integrand: 'pi*(x^2 - 1)^2/16',
    primitieve: 'pi*(1/16)*(x^5/5 - (2/3)*x^3 + x)',
    domein: [1, 3],
    grenzen: [1, 3],
    waarde: '(31/15)*pi',
    steps: vier(
      DEEL12 +
        r` De bovenste $y$-waarde is $3$. Op de $y$-as is $x = 0$, dus $f(0) = \sqrt{1} = 1$. Dat is de onderste $y$-waarde. Uit $y = \sqrt{4x + 1}$ volgt $x = \dfrac{y^{2} - 1}{4}$, met $x \ge 0$. De inhoud is $\pi$ keer de integraal van $x^{2}$.`,
      r`$I(L) = \pi \displaystyle\int_{1}^{3} \left(\dfrac{y^{2} - 1}{4}\right)^{2}\,\mathrm{d}y$. Dat is $\pi$ keer de integraal van $\dfrac{y^{4} - 2y^{2} + 1}{16}$ van $1$ tot $3$.`,
      r`Een primitieve van de integrand is $F(y) = \dfrac{\pi}{16}\left(\dfrac{1}{5}y^{5} - \dfrac{2}{3}y^{3} + y\right)$.`,
      r`Noem het stuk tussen haakjes $G(y)$. Bij $y = 3$ is $18 - 3 = 15$, dus $G(3) = \dfrac{243}{5} - 15 = \dfrac{168}{5}$. $G(1) = \dfrac{8}{15}$. Het verschil is $\dfrac{496}{15}$. Deel door $16$ en vermenigvuldig met $\pi$: de inhoud is $\dfrac{31}{15}\pi$.`,
    ),
  },
  {
    cluster: 'examen_inhoud_yas_grenzen',
    nummer: 'y6',
    level: 3,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(y) = 2\sin(y)$ en de $y$-as, tussen de kleinste twee niet-negatieve $y$-waarden waar de grafiek de $y$-as snijdt. Zoek die $y$-waarden zelf. Het lichaam $L$ ontstaat als $V$ om de $y$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`2\pi^{2}`,
    antwoord: '2pi^2',
    alts: ['2*pi^2', 'pi^2*2'],
    integrand: '4*pi*(sin(x))^2',
    primitieve: '2*pi*x - pi*sin(2*x)',
    domein: [0, PI],
    grenzen: [0, PI],
    waarde: '2*pi^2',
    steps: vier(
      DEEL12 +
        r` $2\sin(y) = 0$ als $\sin(y) = 0$. De kleinste twee niet-negatieve oplossingen zijn $y = 0$ en $y = \pi$. Daartussen is $\sin(y) \ge 0$, dus de grafiek ligt rechts van de $y$-as of erop. De straal is $2\sin(y)$. De inhoud is $\pi$ keer de integraal van het kwadraat.`,
      r`$I(L) = \pi \displaystyle\int_{0}^{\pi} (2\sin(y))^{2}\,\mathrm{d}y$. Dat is $\pi$ keer de integraal van $4\sin^{2}(y)$ van $0$ tot $\pi$. Gebruik $\sin^{2}(y) = \dfrac{1 - \cos(2y)}{2}$, dus $4\sin^{2}(y) = 2 - 2\cos(2y)$. De kern van de cosinus is $2y$, met afgeleide $2$.`,
      r`Een primitieve van de integrand is $F(y) = 2\pi y - \pi\sin(2y)$.`,
      r`$F(\pi) = 2\pi^{2}$ en $F(0) = 0$. De inhoud is $2\pi^{2}$.`,
    ),
  },
  {
    cluster: 'examen_inhoud_yas_grenzen',
    nummer: 'y7',
    level: 3,
    latex: r`Het vlakdeel $V$ in het eerste kwadrant wordt ingesloten door de grafiek van $f(x) = 8 - 2x^{2}$ en de coördinaatassen. Zoek zelf de $y$-waarden waartussen $V$ ligt. Het lichaam $L$ ontstaat als $V$ om de $y$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`16\pi`,
    antwoord: '16pi',
    alts: ['16*pi'],
    integrand: 'pi*(8 - x)/2',
    primitieve: 'pi*(4*x - x^2/4)',
    domein: [0, 8],
    grenzen: [0, 8],
    waarde: '16*pi',
    steps: vier(
      DEEL12 +
        r` De grafiek snijdt de $y$-as in $(0, 8)$. Hij snijdt de $x$-as waar $8 - 2x^{2} = 0$, dus $x^{2} = 4$. In het eerste kwadrant is $x = 2$, en daar is $y = 0$. $V$ ligt dus tussen $y = 0$ en $y = 8$. Uit $y = 8 - 2x^{2}$ volgt $x^{2} = \dfrac{8 - y}{2}$. De inhoud is $\pi$ keer de integraal van $x^{2}$.`,
      r`$I(L) = \pi \displaystyle\int_{0}^{8} \dfrac{8 - y}{2}\,\mathrm{d}y$. Dat is $\pi$ keer de integraal van $4 - \dfrac{1}{2}y$ van $0$ tot $8$.`,
      r`Een primitieve van de integrand is $F(y) = \pi\left(4y - \dfrac{1}{4}y^{2}\right)$.`,
      r`$F(8) - F(0) = \pi\left(32 - 16\right) = 16\pi$. De inhoud is $16\pi$.`,
    ),
  },
  {
    cluster: 'examen_inhoud_yas_grenzen',
    nummer: 'y8',
    level: 3,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(y) = \cos(y)$, de $y$-as en de lijn $y = 0$. De onderste $y$-waarde is $0$. Zoek zelf de kleinste positieve $y$-waarde waar de grafiek de $y$-as snijdt. Het lichaam $L$ ontstaat als $V$ om de $y$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{1}{4}\pi^{2}`,
    antwoord: '(1/4)pi^2',
    alts: ['pi^2/4', '(pi^2)/4'],
    integrand: 'pi*(cos(x))^2',
    primitieve: 'pi*(x/2 + sin(2*x)/4)',
    domein: [0, PI / 2],
    grenzen: [0, PI / 2],
    waarde: '(1/4)*pi^2',
    steps: vier(
      DEEL12 +
        r` De onderste $y$-waarde is $0$. $\cos(y) = 0$ bij $y = \dfrac{\pi}{2}$, en dat is de kleinste positieve oplossing. Daartussen is $\cos(y) > 0$, dus de grafiek ligt rechts van de $y$-as. De straal is $\cos(y)$. De inhoud is $\pi$ keer de integraal van $\cos^{2}(y)$.`,
      r`Gebruik $\cos^{2}(y) = \dfrac{1 + \cos(2y)}{2}$. $I(L)$ is $\pi$ keer de integraal daarvan van $0$ tot $\dfrac{\pi}{2}$. De kern van de cosinus is $2y$, met afgeleide $2$.`,
      r`Een primitieve van de integrand is $F(y) = \pi\left(\dfrac{1}{2}y + \dfrac{1}{4}\sin(2y)\right)$.`,
      r`$F\left(\dfrac{\pi}{2}\right) - F(0) = \pi \cdot \dfrac{\pi}{4} = \dfrac{1}{4}\pi^{2}$. De inhoud is $\dfrac{1}{4}\pi^{2}$.`,
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
  migrationFile: '0064_examen_inhoud_y_as.sql',
  headerTitle: 'Examentraining — inhoud om de y-as',
  sourceScript: 'scripts/examen-inhoud-y-as.ts',
  headerNotes: [
    'Eigen onderdeel Examentraining, geen theoriehoofdstuk uit het boek.',
    'De inhoud van het lichaam dat ontstaat als een vlakdeel om de y-as wentelt.',
    'Acht vragen niveau 3. Vier met de y-waarden in de zin, vier waarbij',
    'je die y-waarden zelf zoekt.',
    '',
    'Eigen oefenvragen, geen boek- of examenopgaven. Elke integraal wordt',
    'nagerekend door src/content/primitieven.test.ts',
    '(content/hoofdstuk-examen/inhoud-om-de-y-as.json).',
  ],
  topics: [
    {
      slug: 'examen_inhoud_yas',
      title: 'Inhoud om de y-as',
      order: 7,
      category: 'toepassingen',
    },
    {
      slug: 'examen_inhoud_yas_grenzen',
      title: 'Inhoud om de y-as, grenzen zelf',
      order: 8,
      category: 'toepassingen',
    },
  ],
  clusters: [
    {
      topic: 'examen_inhoud_yas',
      slug: 'examen_inhoud_yas',
      title: 'y-waarden gegeven',
      order: 1,
    },
    {
      topic: 'examen_inhoud_yas_grenzen',
      slug: 'examen_inhoud_yas_grenzen',
      title: 'y-waarden zelf zoeken',
      order: 1,
    },
  ],
  questions: VRAGEN,
}

const wortel = process.cwd()
const map = path.join(wortel, 'content', 'hoofdstuk-examen')
mkdirSync(map, { recursive: true })

const contentPad = path.join(map, 'inhoud-om-de-y-as.json')
writeFileSync(
  contentPad,
  generateContentFile(EXAMEN, 'Examentraining — inhoud om de y-as'),
)

const migratiePad = path.join(wortel, 'supabase', 'migrations', EXAMEN.migrationFile)
writeFileSync(migratiePad, generateAdditiveMigration(EXAMEN))

console.log(`Geschreven: ${contentPad}`)
console.log(`Geschreven: ${migratiePad}`)
console.log(`Vragen: ${EXAMEN.questions.length}, stappen: ${EXAMEN.questions.length * 4}`)
