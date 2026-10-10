/**
 * K.3 Theorie B — De arctangensfunctie en primitiveren.
 *
 * In Theorie A stond de vorm altijd al klaar: kaal x² + 1, of een kern waarvan
 * het kwadraat zichtbaar was. In dit blok moet je de standaardvorm zelf
 * tevoorschijn halen, en daar zijn twee manieren voor:
 *
 *     a/(px² + q)        → teller en noemer delen door q: (a/q)/((bx)² + 1)
 *     a/(x² + bx + c)    → eerst kwadraatafsplitsen: a/((x - p)² + q)
 *
 * Daarna is het weer de standaardvorm 1/(g² + 1) → arctan(g) + c, met de regel
 * voor f(ax + b): nog delen door a.
 *
 * Draaien met:  npx jiti scripts/k3b-content.ts
 *
 * Schrijft twee bestanden:
 *   • content/hoofdstuk-k/k3b.json                 — leest src/content/primitieven.test.ts
 *   • supabase/migrations/0041_k3b_arctangens_primitiveren.sql — alleen rijen toevoegen
 *
 * Eigen topics en eigen clusters, zodat de controles aan het eind van de
 * eerdere K-migraties blijven kloppen.
 *
 * Eén vraag heeft geen integraal: het maximum van een breuk met een
 * kwadraatafgesplitste noemer. Die staat dus niet in `content/` en wordt niet
 * nagerekend; het antwoord is met de hand nagerekend (zie de stappen).
 */
import { writeFileSync } from 'node:fs'
import path from 'node:path'

import {
  generateAdditiveMigration,
  generateContentFile,
  r,
  type AdditiveChapter,
  type AdditiveQ,
  type Steps,
} from './lib/stappenplan-content'

// ─────────────────────────────────────────────────────────────────────────────
// Vaste zinnen — dezelfde woorden als in de eerdere K-scripts
// ─────────────────────────────────────────────────────────────────────────────

const DEEL2 = r`Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal.`

const DEEL2_BEPAALD = `${DEEL2} Eerst een primitieve zoeken, daarna de grenzen invullen. Het antwoord blijft exact.`

/** Oppervlakte-opgaven: alle drie de delen van de driedeling. */
const DRIEDELING = r`Hier spelen alle drie de delen van de driedeling: eerst het verhaaltje vertalen naar een integraal (deel 1), dan die integraal berekenen (deel 2), en daarna nog iets doen met de uitkomst (deel 3).`

const STANDAARDVORM = r`$\dfrac{1}{x^{2} + 1}$ geeft $\arctan(x) + c$`

const SCHIL_HERSCHRIJVEN = r`Buitenste schil: een breuk met een getal in de teller en $px^{2} + q$ in de noemer → nog geen standaardvorm, want achter het kwadraat staat niet $1$. Deel eerst teller en noemer door $q$, zodat er $\dfrac{a}{(bx)^{2} + 1}$ komt te staan.`

const SCHIL_KWADRAAT = r`Buitenste schil: een breuk met in de noemer een polynoom $x^{2} + bx + c$ waar geen kwadraat in te zien is → eerst kwadraatafsplitsen, en dan pas kijken welke standaardvorm erbij hoort.`

const SCHIL_SUBSTITUTIE = r`Buitenste schil: in de noemer staat het kwadraat van iets anders dan $x$, en de afgeleide daarvan staat in de teller → substitutie. Met $\int \dfrac{g'}{g^{2} + 1}\,\mathrm{d}x = \arctan(g) + c$ ben je er in één stap.`

const REGEL_AXB = r`De regel voor $f(ax + b)$ zegt: primitiveer alsof er $x$ staat en deel daarna door $a$.`

const KWADRAATAFSPLITSEN = r`Kwadraatafsplitsen: neem de helft van het getal voor $x$, zet dat in het kwadraat, en corrigeer met een getal.`

const CONTROLE = r`Controle: differentieer $F$ en je krijgt $f$ terug.`

// ─────────────────────────────────────────────────────────────────────────────
// Stap-sjablonen
// ─────────────────────────────────────────────────────────────────────────────

/** Primitiveren: schil, herschrijven, regel toepassen, antwoord. */
function primitiveren(s: { schil: string; herschrijven: string; regel: string; antwoord: string }): Steps {
  return [`${DEEL2} ${s.schil}`, s.herschrijven, s.regel, `${s.antwoord} ${CONTROLE}`]
}

/** Bepaalde integraal: eerst de primitieve, dan de grenzen. */
function bepaald(s: { schil: string; herschrijven: string; primitieve: string; invullen: string }): Steps {
  return [`${DEEL2_BEPAALD} ${s.schil}`, s.herschrijven, s.primitieve, s.invullen]
}

/** Oppervlakte: verhaaltje → integraal → primitiveren → uitrekenen of p oplossen. */
function oppervlakte(s: { integraal: string; herschrijven: string; primitieve: string; uitkomst: string }): Steps {
  return [`${DRIEDELING} ${s.integraal}`, s.herschrijven, s.primitieve, s.uitkomst]
}

// ─────────────────────────────────────────────────────────────────────────────
// De vragen
// ─────────────────────────────────────────────────────────────────────────────

const VRAGEN: AdditiveQ[] = [
  // ── Naar de vorm a/((bx)² + 1) ────────────────────────────────────────────
  {
    cluster: 'k3b_herschrijven',
    nummer: 'hs-1',
    level: 1,
    latex: r`Primitiveer: $f(x) = \dfrac{6}{x^{2} + 9}$`,
    antwoordLatex: r`F(x) = 2\arctan\left(\tfrac{1}{3}x\right) + c`,
    antwoord: '2arctan(1/3 x) + c',
    alts: ['2 arctan(x/3) + c', '2arctan(x/3) + c', '2atan(x/3) + c', '2 atan(x/3) + c'],
    integrand: '6 / (x^2 + 9)',
    primitieve: '2 * atan(x / 3)',
    steps: primitiveren({
      schil: SCHIL_HERSCHRIJVEN,
      herschrijven: r`Deel teller en noemer door $9$: $f(x) = \dfrac{\tfrac{6}{9}}{\tfrac{x^{2}}{9} + 1} = \dfrac{\tfrac{2}{3}}{\left(\tfrac{1}{3}x\right)^{2} + 1}$. Want $\tfrac{x^{2}}{9} = \left(\tfrac{1}{3}x\right)^{2}$. De kern is dus $\tfrac{1}{3}x$, met $a = \tfrac{1}{3}$.`,
      regel: r`De standaardvorm ${STANDAARDVORM} geeft $\arctan\left(\tfrac{1}{3}x\right)$. ${REGEL_AXB} Delen door $\tfrac{1}{3}$ is vermenigvuldigen met $3$: $\dfrac{1}{\left(\tfrac{1}{3}x\right)^{2} + 1}$ geeft $3\arctan\left(\tfrac{1}{3}x\right)$.`,
      antwoord: r`Zet de $\tfrac{2}{3}$ er weer voor: $F(x) = \tfrac{2}{3} \cdot 3\arctan\left(\tfrac{1}{3}x\right) + c = 2\arctan\left(\tfrac{1}{3}x\right) + c$.`,
    }),
  },
  {
    cluster: 'k3b_herschrijven',
    nummer: 'hs-2',
    level: 1,
    latex: r`Primitiveer: $f(x) = \dfrac{1}{x^{2} + 25}$`,
    antwoordLatex: r`F(x) = \tfrac{1}{5}\arctan\left(\tfrac{1}{5}x\right) + c`,
    antwoord: '1/5 arctan(1/5 x) + c',
    alts: ['1/5 arctan(x/5) + c', 'arctan(x/5)/5 + c', '1/5 atan(x/5) + c', '(1/5)arctan(x/5) + c'],
    integrand: '1 / (x^2 + 25)',
    primitieve: '1/5 * atan(x / 5)',
    steps: primitiveren({
      schil: SCHIL_HERSCHRIJVEN,
      herschrijven: r`Deel teller en noemer door $25$: $f(x) = \dfrac{\tfrac{1}{25}}{\left(\tfrac{1}{5}x\right)^{2} + 1}$, want $\tfrac{x^{2}}{25} = \left(\tfrac{1}{5}x\right)^{2}$. De kern is $\tfrac{1}{5}x$, met $a = \tfrac{1}{5}$.`,
      regel: r`De standaardvorm geeft $\arctan\left(\tfrac{1}{5}x\right)$, en ${REGEL_AXB} Delen door $\tfrac{1}{5}$ is vermenigvuldigen met $5$: $\dfrac{1}{\left(\tfrac{1}{5}x\right)^{2} + 1}$ geeft $5\arctan\left(\tfrac{1}{5}x\right)$.`,
      antwoord: r`Zet de $\tfrac{1}{25}$ er weer voor: $F(x) = \tfrac{1}{25} \cdot 5\arctan\left(\tfrac{1}{5}x\right) + c = \tfrac{1}{5}\arctan\left(\tfrac{1}{5}x\right) + c$.`,
    }),
  },
  {
    cluster: 'k3b_herschrijven',
    nummer: 'hs-3',
    level: 2,
    latex: r`Schrijf $f(x) = \dfrac{8}{x^{2} + 16}$ eerst in de vorm $\dfrac{a}{(bx)^{2} + 1}$ en primitiveer daarna.`,
    antwoordLatex: r`F(x) = 2\arctan\left(\tfrac{1}{4}x\right) + c`,
    antwoord: '2arctan(1/4 x) + c',
    alts: ['2 arctan(x/4) + c', '2arctan(x/4) + c', '2atan(x/4) + c', '2 atan(x/4) + c'],
    integrand: '8 / (x^2 + 16)',
    primitieve: '2 * atan(x / 4)',
    steps: primitiveren({
      schil: SCHIL_HERSCHRIJVEN,
      herschrijven: r`Deel teller en noemer door $16$: $f(x) = \dfrac{\tfrac{8}{16}}{\tfrac{x^{2}}{16} + 1} = \dfrac{\tfrac{1}{2}}{\left(\tfrac{1}{4}x\right)^{2} + 1}$. In de gevraagde vorm is dus $a = \tfrac{1}{2}$ en $b = \tfrac{1}{4}$.`,
      regel: r`De standaardvorm geeft $\arctan\left(\tfrac{1}{4}x\right)$, en ${REGEL_AXB} Hier is $a = \tfrac{1}{4}$, dus vermenigvuldigen met $4$: $\dfrac{1}{\left(\tfrac{1}{4}x\right)^{2} + 1}$ geeft $4\arctan\left(\tfrac{1}{4}x\right)$.`,
      antwoord: r`Zet de $\tfrac{1}{2}$ er weer voor: $F(x) = \tfrac{1}{2} \cdot 4\arctan\left(\tfrac{1}{4}x\right) + c = 2\arctan\left(\tfrac{1}{4}x\right) + c$.`,
    }),
  },
  {
    cluster: 'k3b_herschrijven',
    nummer: 'hs-4',
    level: 2,
    latex: r`Primitiveer: $f(x) = \dfrac{3}{9x^{2} + 4}$`,
    antwoordLatex: r`F(x) = \tfrac{1}{2}\arctan\left(1\tfrac{1}{2}x\right) + c`,
    antwoord: '1/2 arctan(3/2 x) + c',
    alts: [
      '1/2 arctan(3x/2) + c',
      'arctan(3x/2)/2 + c',
      '1/2 atan(3x/2) + c',
      '0,5arctan(1,5x) + c',
    ],
    integrand: '3 / (9 * x^2 + 4)',
    primitieve: '1/2 * atan(3 * x / 2)',
    steps: primitiveren({
      schil: `${SCHIL_HERSCHRIJVEN} Hier staat er ook nog een getal vóór $x^{2}$; dat verdwijnt vanzelf in de kern.`,
      herschrijven: r`Deel teller en noemer door $4$: $f(x) = \dfrac{\tfrac{3}{4}}{\tfrac{9x^{2}}{4} + 1} = \dfrac{\tfrac{3}{4}}{\left(1\tfrac{1}{2}x\right)^{2} + 1}$, want $\tfrac{9}{4}x^{2} = \left(\tfrac{3}{2}x\right)^{2}$. De kern is $1\tfrac{1}{2}x$, met $a = 1\tfrac{1}{2}$.`,
      regel: r`De standaardvorm geeft $\arctan\left(1\tfrac{1}{2}x\right)$, en ${REGEL_AXB} Delen door $1\tfrac{1}{2}$ is vermenigvuldigen met $\tfrac{2}{3}$: $\dfrac{1}{\left(1\tfrac{1}{2}x\right)^{2} + 1}$ geeft $\tfrac{2}{3}\arctan\left(1\tfrac{1}{2}x\right)$.`,
      antwoord: r`Zet de $\tfrac{3}{4}$ er weer voor: $F(x) = \tfrac{3}{4} \cdot \tfrac{2}{3}\arctan\left(1\tfrac{1}{2}x\right) + c = \tfrac{1}{2}\arctan\left(1\tfrac{1}{2}x\right) + c$.`,
    }),
  },
  {
    cluster: 'k3b_herschrijven',
    nummer: 'hs-5',
    level: 3,
    latex: r`Primitiveer: $f(x) = \dfrac{6}{4x^{2} + 3}$`,
    antwoordLatex: r`F(x) = \sqrt{3}\arctan\left(\tfrac{2}{3}\sqrt{3}x\right) + c`,
    antwoord: 'sqrt(3) arctan(2/3 sqrt(3) x) + c',
    alts: [
      'sqrt(3) arctan(2x/sqrt(3)) + c',
      'sqrt(3)arctan(2x/sqrt(3)) + c',
      'sqrt(3) atan(2x/sqrt(3)) + c',
    ],
    integrand: '6 / (4 * x^2 + 3)',
    primitieve: 'sqrt(3) * atan(2 * x / sqrt(3))',
    steps: primitiveren({
      schil: `${SCHIL_HERSCHRIJVEN} Deelt het niet mooi uit, dan komt er een wortel in de kern; dat mag.`,
      herschrijven: r`Deel teller en noemer door $3$: $f(x) = \dfrac{2}{\tfrac{4}{3}x^{2} + 1} = \dfrac{2}{\left(\tfrac{2}{\sqrt{3}}x\right)^{2} + 1}$, want $\tfrac{4}{3}x^{2} = \left(\tfrac{2}{\sqrt{3}}x\right)^{2}$. De kern is $\tfrac{2}{\sqrt{3}}x = \tfrac{2}{3}\sqrt{3}x$, met $a = \tfrac{2}{3}\sqrt{3}$.`,
      regel: r`De standaardvorm geeft $\arctan\left(\tfrac{2}{3}\sqrt{3}x\right)$, en ${REGEL_AXB} Delen door $\tfrac{2}{\sqrt{3}}$ is vermenigvuldigen met $\tfrac{\sqrt{3}}{2}$: $\dfrac{1}{\left(\tfrac{2}{3}\sqrt{3}x\right)^{2} + 1}$ geeft $\tfrac{1}{2}\sqrt{3}\arctan\left(\tfrac{2}{3}\sqrt{3}x\right)$.`,
      antwoord: r`Zet de $2$ er weer voor: $F(x) = 2 \cdot \tfrac{1}{2}\sqrt{3}\arctan\left(\tfrac{2}{3}\sqrt{3}x\right) + c = \sqrt{3}\arctan\left(\tfrac{2}{3}\sqrt{3}x\right) + c$.`,
    }),
  },
  {
    cluster: 'k3b_herschrijven',
    nummer: 'hs-6',
    level: 3,
    latex: r`Primitiveer: $f(x) = \dfrac{x^{2} + 5}{x^{2} + 2}$`,
    antwoordLatex: r`F(x) = x + 1\tfrac{1}{2}\sqrt{2}\arctan\left(\tfrac{1}{2}\sqrt{2}x\right) + c`,
    antwoord: 'x + 3/2 sqrt(2) arctan(1/2 sqrt(2) x) + c',
    alts: [
      'x + 3/sqrt(2) arctan(x/sqrt(2)) + c',
      'x + 1,5sqrt(2)arctan(x/sqrt(2)) + c',
      'x + 3/2 sqrt(2) atan(x/sqrt(2)) + c',
    ],
    integrand: '(x^2 + 5) / (x^2 + 2)',
    primitieve: 'x + 3 / sqrt(2) * atan(x / sqrt(2))',
    steps: primitiveren({
      schil: r`Buitenste schil: een breuk met $x^{2}$ in de teller én in de noemer → eerst splitsen, en pas daarna herschrijven naar de standaardvorm. Er is geen quotiëntregel voor primitiveren.`,
      herschrijven: r`Maak in de teller de noemer zichtbaar: $x^{2} + 5 = \left(x^{2} + 2\right) + 3$. Dus $f(x) = \dfrac{x^{2} + 2}{x^{2} + 2} + \dfrac{3}{x^{2} + 2} = 1 + \dfrac{3}{x^{2} + 2}$.`,
      regel: r`Het stuk $1$ geeft $x$. Voor het tweede stuk deel je teller en noemer door $2$: $\dfrac{3}{x^{2} + 2} = \dfrac{\tfrac{3}{2}}{\left(\tfrac{1}{\sqrt{2}}x\right)^{2} + 1}$. De kern is $\tfrac{1}{2}\sqrt{2}x$, dus vermenigvuldigen met $\sqrt{2}$: dat geeft $\tfrac{3}{2}\sqrt{2}\arctan\left(\tfrac{1}{2}\sqrt{2}x\right)$.`,
      antwoord: r`Schrijf het antwoord op: $F(x) = x + 1\tfrac{1}{2}\sqrt{2}\arctan\left(\tfrac{1}{2}\sqrt{2}x\right) + c$.`,
    }),
  },

  // ── Kwadraatafsplitsen in de noemer ───────────────────────────────────────
  {
    cluster: 'k3b_kwadraat',
    nummer: 'kw-1',
    level: 1,
    latex: r`Primitiveer: $f(x) = \dfrac{1}{x^{2} + 2x + 2}$`,
    antwoordLatex: r`F(x) = \arctan(x + 1) + c`,
    antwoord: 'arctan(x + 1) + c',
    alts: ['atan(x + 1) + c', 'arctan(x+1) + c', 'tan^-1(x + 1) + c'],
    integrand: '1 / (x^2 + 2 * x + 2)',
    primitieve: 'atan(x + 1)',
    steps: primitiveren({
      schil: SCHIL_KWADRAAT,
      herschrijven: r`${KWADRAATAFSPLITSEN} De helft van $2$ is $1$, dus begin met $(x + 1)^{2} = x^{2} + 2x + 1$. Dat is $1$ te weinig: $x^{2} + 2x + 2 = (x + 1)^{2} + 1$.`,
      regel: r`Nu staat er $\dfrac{1}{(x + 1)^{2} + 1}$: precies de standaardvorm met kern $x + 1$. ${REGEL_AXB} Hier is $a = 1$, dus delen verandert niets.`,
      antwoord: r`Schrijf het antwoord op: $F(x) = \arctan(x + 1) + c$.`,
    }),
  },
  {
    cluster: 'k3b_kwadraat',
    nummer: 'kw-2',
    level: 1,
    latex: r`Primitiveer: $f(x) = \dfrac{4}{x^{2} - 10x + 26}$`,
    antwoordLatex: r`F(x) = 4\arctan(x - 5) + c`,
    antwoord: '4arctan(x - 5) + c',
    alts: ['4 arctan(x - 5) + c', '4atan(x - 5) + c', '4 atan(x - 5) + c'],
    integrand: '4 / (x^2 - 10 * x + 26)',
    primitieve: '4 * atan(x - 5)',
    steps: primitiveren({
      schil: SCHIL_KWADRAAT,
      herschrijven: r`${KWADRAATAFSPLITSEN} De helft van $-10$ is $-5$, dus begin met $(x - 5)^{2} = x^{2} - 10x + 25$. Er moet $26$ staan, dus $x^{2} - 10x + 26 = (x - 5)^{2} + 1$.`,
      regel: r`Nu staat er $\dfrac{4}{(x - 5)^{2} + 1}$: de standaardvorm met kern $x - 5$ en een $4$ ervoor. Omdat $a = 1$ hoef je niet te delen.`,
      antwoord: r`Schrijf het antwoord op: $F(x) = 4\arctan(x - 5) + c$.`,
    }),
  },
  {
    cluster: 'k3b_kwadraat',
    nummer: 'kw-3',
    level: 2,
    latex: r`Primitiveer: $f(x) = \dfrac{6}{x^{2} + 8x + 20}$`,
    antwoordLatex: r`F(x) = 3\arctan\left(\tfrac{1}{2}x + 2\right) + c`,
    antwoord: '3arctan(1/2 x + 2) + c',
    alts: [
      '3 arctan((x + 4)/2) + c',
      '3arctan((x+4)/2) + c',
      '3atan((x + 4)/2) + c',
      '3 atan(1/2 x + 2) + c',
    ],
    integrand: '6 / (x^2 + 8 * x + 20)',
    primitieve: '3 * atan((x + 4) / 2)',
    steps: primitiveren({
      schil: `${SCHIL_KWADRAAT} Blijft er achter het kwadraat geen $1$ over, dan moet je daarna nog delen.`,
      herschrijven: r`${KWADRAATAFSPLITSEN} De helft van $8$ is $4$: $(x + 4)^{2} = x^{2} + 8x + 16$, dus $x^{2} + 8x + 20 = (x + 4)^{2} + 4$.`,
      regel: r`Achter het kwadraat staat $4$ en niet $1$, dus deel teller en noemer door $4$: $f(x) = \dfrac{\tfrac{6}{4}}{\left(\tfrac{x + 4}{2}\right)^{2} + 1}$. De kern is $\tfrac{1}{2}x + 2$, met $a = \tfrac{1}{2}$: ${REGEL_AXB} Dat betekent vermenigvuldigen met $2$.`,
      antwoord: r`Alles bij elkaar: $F(x) = \tfrac{3}{2} \cdot 2\arctan\left(\tfrac{1}{2}x + 2\right) + c = 3\arctan\left(\tfrac{1}{2}x + 2\right) + c$.`,
    }),
  },
  {
    cluster: 'k3b_kwadraat',
    nummer: 'kw-4',
    level: 2,
    latex: r`Primitiveer: $f(x) = \dfrac{2}{x^{2} - 4x + 13}$`,
    antwoordLatex: r`F(x) = \tfrac{2}{3}\arctan\left(\tfrac{1}{3}(x - 2)\right) + c`,
    antwoord: '2/3 arctan((x - 2)/3) + c',
    alts: [
      '2/3 arctan(1/3 x - 2/3) + c',
      '2/3 atan((x - 2)/3) + c',
      '(2/3)arctan((x-2)/3) + c',
    ],
    integrand: '2 / (x^2 - 4 * x + 13)',
    primitieve: '2/3 * atan((x - 2) / 3)',
    steps: primitiveren({
      schil: `${SCHIL_KWADRAAT} Blijft er achter het kwadraat geen $1$ over, dan moet je daarna nog delen.`,
      herschrijven: r`${KWADRAATAFSPLITSEN} De helft van $-4$ is $-2$: $(x - 2)^{2} = x^{2} - 4x + 4$, dus $x^{2} - 4x + 13 = (x - 2)^{2} + 9$.`,
      regel: r`Deel teller en noemer door $9$: $f(x) = \dfrac{\tfrac{2}{9}}{\left(\tfrac{x - 2}{3}\right)^{2} + 1}$. De kern is $\tfrac{1}{3}(x - 2)$, met $a = \tfrac{1}{3}$: ${REGEL_AXB} Dat betekent vermenigvuldigen met $3$.`,
      antwoord: r`Alles bij elkaar: $F(x) = \tfrac{2}{9} \cdot 3\arctan\left(\tfrac{1}{3}(x - 2)\right) + c = \tfrac{2}{3}\arctan\left(\tfrac{1}{3}(x - 2)\right) + c$.`,
    }),
  },
  {
    cluster: 'k3b_kwadraat',
    nummer: 'kw-5',
    level: 3,
    latex: r`Primitiveer: $f(x) = \dfrac{1}{4x^{2} + 4x + 5}$`,
    antwoordLatex: r`F(x) = \tfrac{1}{4}\arctan\left(x + \tfrac{1}{2}\right) + c`,
    antwoord: '1/4 arctan(x + 1/2) + c',
    alts: [
      '1/4 atan(x + 1/2) + c',
      'arctan(x + 1/2)/4 + c',
      '1/4 arctan(x + 0,5) + c',
      '0,25arctan(x + 0,5) + c',
    ],
    integrand: '1 / (4 * x^2 + 4 * x + 5)',
    primitieve: '1/4 * atan(x + 1/2)',
    steps: primitiveren({
      schil: `${SCHIL_KWADRAAT} Staat er een getal vóór $x^{2}$, haal dat dan eerst buiten haakjes.`,
      herschrijven: r`Haal de $4$ buiten haakjes: $4x^{2} + 4x + 5 = 4\left(x^{2} + x + \tfrac{5}{4}\right)$. ${KWADRAATAFSPLITSEN} De helft van $1$ is $\tfrac{1}{2}$: $\left(x + \tfrac{1}{2}\right)^{2} = x^{2} + x + \tfrac{1}{4}$, dus $x^{2} + x + \tfrac{5}{4} = \left(x + \tfrac{1}{2}\right)^{2} + 1$.`,
      regel: r`Er staat dus $f(x) = \dfrac{1}{4\left(\left(x + \tfrac{1}{2}\right)^{2} + 1\right)} = \tfrac{1}{4} \cdot \dfrac{1}{\left(x + \tfrac{1}{2}\right)^{2} + 1}$: de standaardvorm met kern $x + \tfrac{1}{2}$ en $a = 1$, dus delen is niet nodig.`,
      antwoord: r`Schrijf het antwoord op: $F(x) = \tfrac{1}{4}\arctan\left(x + \tfrac{1}{2}\right) + c$.`,
    }),
  },
  {
    cluster: 'k3b_kwadraat',
    nummer: 'kw-6',
    level: 3,
    latex: r`Primitiveer: $f(x) = \dfrac{10}{2x^{2} - 4x + 10}$`,
    antwoordLatex: r`F(x) = 2\tfrac{1}{2}\arctan\left(\tfrac{1}{2}(x - 1)\right) + c`,
    antwoord: '5/2 arctan((x - 1)/2) + c',
    alts: [
      '2,5arctan((x - 1)/2) + c',
      '5/2 atan((x - 1)/2) + c',
      '5/2 arctan(1/2 x - 1/2) + c',
    ],
    integrand: '10 / (2 * x^2 - 4 * x + 10)',
    primitieve: '5/2 * atan((x - 1) / 2)',
    steps: primitiveren({
      schil: `${SCHIL_KWADRAAT} Staat er een getal vóór $x^{2}$, haal dat dan eerst buiten haakjes.`,
      herschrijven: r`Haal de $2$ buiten haakjes: $2x^{2} - 4x + 10 = 2\left(x^{2} - 2x + 5\right)$, dus $f(x) = \dfrac{5}{x^{2} - 2x + 5}$. ${KWADRAATAFSPLITSEN} De helft van $-2$ is $-1$: $x^{2} - 2x + 5 = (x - 1)^{2} + 4$.`,
      regel: r`Achter het kwadraat staat $4$, dus deel teller en noemer door $4$: $f(x) = \dfrac{\tfrac{5}{4}}{\left(\tfrac{x - 1}{2}\right)^{2} + 1}$. De kern is $\tfrac{1}{2}(x - 1)$ met $a = \tfrac{1}{2}$: ${REGEL_AXB} Dat betekent vermenigvuldigen met $2$.`,
      antwoord: r`Alles bij elkaar: $F(x) = \tfrac{5}{4} \cdot 2\arctan\left(\tfrac{1}{2}(x - 1)\right) + c = 2\tfrac{1}{2}\arctan\left(\tfrac{1}{2}(x - 1)\right) + c$.`,
    }),
  },

  // ── Bepaalde integralen ───────────────────────────────────────────────────
  {
    cluster: 'k3b_bepaald_exact',
    nummer: 'bp-1',
    level: 1,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{2} \dfrac{1}{x^{2} + 4}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{8}\pi`,
    antwoord: '1/8 pi',
    alts: ['pi/8', '(1/8)pi', '1/8pi'],
    integrand: '1 / (x^2 + 4)',
    primitieve: '1/2 * atan(x / 2)',
    grenzen: [0, 2],
    waarde: 'pi / 8',
    steps: bepaald({
      schil: SCHIL_HERSCHRIJVEN,
      herschrijven: r`Deel teller en noemer door $4$: $\dfrac{1}{x^{2} + 4} = \dfrac{\tfrac{1}{4}}{\left(\tfrac{1}{2}x\right)^{2} + 1}$. De kern is $\tfrac{1}{2}x$, met $a = \tfrac{1}{2}$.`,
      primitieve: r`Primitiveren: de standaardvorm geeft $\arctan\left(\tfrac{1}{2}x\right)$ en delen door $\tfrac{1}{2}$ is vermenigvuldigen met $2$, dus $F(x) = \tfrac{1}{4} \cdot 2\arctan\left(\tfrac{1}{2}x\right) = \tfrac{1}{2}\arctan\left(\tfrac{1}{2}x\right)$.`,
      invullen: r`Vul de grenzen in: $\left[\tfrac{1}{2}\arctan\left(\tfrac{1}{2}x\right)\right]_{0}^{2} = \tfrac{1}{2}\arctan(1) - \tfrac{1}{2}\arctan(0) = \tfrac{1}{2} \cdot \tfrac{1}{4}\pi = \tfrac{1}{8}\pi$.`,
    }),
  },
  {
    cluster: 'k3b_bepaald_exact',
    nummer: 'bp-2',
    level: 1,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{5} \dfrac{1}{x^{2} + 25}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{20}\pi`,
    antwoord: '1/20 pi',
    alts: ['pi/20', '(1/20)pi', '1/20pi'],
    integrand: '1 / (x^2 + 25)',
    primitieve: '1/5 * atan(x / 5)',
    grenzen: [0, 5],
    waarde: 'pi / 20',
    steps: bepaald({
      schil: SCHIL_HERSCHRIJVEN,
      herschrijven: r`Deel teller en noemer door $25$: $\dfrac{1}{x^{2} + 25} = \dfrac{\tfrac{1}{25}}{\left(\tfrac{1}{5}x\right)^{2} + 1}$. De kern is $\tfrac{1}{5}x$, met $a = \tfrac{1}{5}$.`,
      primitieve: r`Primitiveren: $F(x) = \tfrac{1}{25} \cdot 5\arctan\left(\tfrac{1}{5}x\right) = \tfrac{1}{5}\arctan\left(\tfrac{1}{5}x\right)$. De grens $5$ is niet toevallig: daar wordt de kern $1$.`,
      invullen: r`Vul de grenzen in: $\left[\tfrac{1}{5}\arctan\left(\tfrac{1}{5}x\right)\right]_{0}^{5} = \tfrac{1}{5}\arctan(1) - 0 = \tfrac{1}{5} \cdot \tfrac{1}{4}\pi = \tfrac{1}{20}\pi$.`,
    }),
  },
  {
    cluster: 'k3b_bepaald_exact',
    nummer: 'bp-3',
    level: 2,
    latex: r`Bereken exact: $\displaystyle\int_{2}^{2 + 3\sqrt{3}} \dfrac{6}{x^{2} - 4x + 13}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{2}{3}\pi`,
    antwoord: '2/3 pi',
    alts: ['2pi/3', '(2/3)pi', '2/3pi'],
    integrand: '6 / (x^2 - 4 * x + 13)',
    primitieve: '2 * atan((x - 2) / 3)',
    grenzen: [2, 2 + 3 * Math.sqrt(3)],
    waarde: '2 * pi / 3',
    steps: bepaald({
      schil: SCHIL_KWADRAAT,
      herschrijven: r`${KWADRAATAFSPLITSEN} De helft van $-4$ is $-2$: $x^{2} - 4x + 13 = (x - 2)^{2} + 9$. Deel daarna door $9$: $\dfrac{6}{x^{2} - 4x + 13} = \dfrac{\tfrac{6}{9}}{\left(\tfrac{x - 2}{3}\right)^{2} + 1}$.`,
      primitieve: r`De kern is $\tfrac{1}{3}(x - 2)$ met $a = \tfrac{1}{3}$, dus vermenigvuldigen met $3$: $F(x) = \tfrac{2}{3} \cdot 3\arctan\left(\tfrac{x - 2}{3}\right) = 2\arctan\left(\tfrac{x - 2}{3}\right)$.`,
      invullen: r`Vul de grenzen in. Bij $x = 2 + 3\sqrt{3}$ is de kern $\tfrac{3\sqrt{3}}{3} = \sqrt{3}$ en bij $x = 2$ is de kern $0$: $2\arctan\left(\sqrt{3}\right) - 2\arctan(0) = 2 \cdot \tfrac{1}{3}\pi = \tfrac{2}{3}\pi$. Zulke lelijke grenzen zijn een hint dat de kern er een mooie waarde van maakt.`,
    }),
  },
  {
    cluster: 'k3b_bepaald_exact',
    nummer: 'bp-4',
    level: 2,
    latex: r`Bereken exact: $\displaystyle\int_{-1}^{1} \dfrac{4}{x^{2} + 2x + 5}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{2}\pi`,
    antwoord: '1/2 pi',
    alts: ['pi/2', '(1/2)pi', '1/2pi'],
    integrand: '4 / (x^2 + 2 * x + 5)',
    primitieve: '2 * atan((x + 1) / 2)',
    grenzen: [-1, 1],
    waarde: 'pi / 2',
    steps: bepaald({
      schil: SCHIL_KWADRAAT,
      herschrijven: r`${KWADRAATAFSPLITSEN} De helft van $2$ is $1$: $x^{2} + 2x + 5 = (x + 1)^{2} + 4$. Deel daarna door $4$: $\dfrac{4}{x^{2} + 2x + 5} = \dfrac{1}{\left(\tfrac{x + 1}{2}\right)^{2} + 1}$.`,
      primitieve: r`De kern is $\tfrac{1}{2}(x + 1)$ met $a = \tfrac{1}{2}$, dus vermenigvuldigen met $2$: $F(x) = 2\arctan\left(\tfrac{x + 1}{2}\right)$.`,
      invullen: r`Vul de grenzen in. Bij $x = 1$ is de kern $1$ en bij $x = -1$ is de kern $0$: $2\arctan(1) - 2\arctan(0) = 2 \cdot \tfrac{1}{4}\pi = \tfrac{1}{2}\pi$.`,
    }),
  },
  {
    cluster: 'k3b_bepaald_exact',
    nummer: 'bp-5',
    level: 3,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{\sqrt{2}} \dfrac{6x}{x^{4} + 4}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{3}{8}\pi`,
    antwoord: '3/8 pi',
    alts: ['3pi/8', '(3/8)pi', '3/8pi'],
    integrand: '6 * x / (x^4 + 4)',
    primitieve: '3/2 * atan(x^2 / 2)',
    grenzen: [0, Math.sqrt(2)],
    waarde: '3 * pi / 8',
    steps: bepaald({
      schil: `${SCHIL_SUBSTITUTIE} Achter het kwadraat staat hier geen $1$, dus daarna moet je ook nog delen.`,
      herschrijven: r`Schrijf de noemer als een kwadraat: $x^{4} + 4 = \left(x^{2}\right)^{2} + 4$. Neem $g(x) = x^{2}$, dan is $g'(x) = 2x$ — en in de teller staat $6x = 3 \cdot 2x$. Deel daarna door $4$: $\dfrac{6x}{x^{4} + 4} = 3 \cdot 2x \cdot \dfrac{\tfrac{1}{4}}{\left(\tfrac{x^{2}}{2}\right)^{2} + 1}$.`,
      primitieve: r`Naar $g$ staat er $\int \dfrac{3}{g^{2} + 4}\,\mathrm{d}g = \tfrac{3}{2}\arctan\left(\tfrac{1}{2}g\right)$, dus $F(x) = \tfrac{3}{2}\arctan\left(\tfrac{1}{2}x^{2}\right)$. Controleer dat met de kettingregel.`,
      invullen: r`Vul de grenzen in. Bij $x = \sqrt{2}$ is $\tfrac{1}{2}x^{2} = 1$ en bij $x = 0$ is het $0$: $\tfrac{3}{2}\arctan(1) - 0 = \tfrac{3}{2} \cdot \tfrac{1}{4}\pi = \tfrac{3}{8}\pi$.`,
    }),
  },
  {
    cluster: 'k3b_bepaald_exact',
    nummer: 'bp-6',
    level: 3,
    latex: r`Bereken exact: $\displaystyle\int_{\mathrm{e}^{-2}}^{\mathrm{e}^{2}} \dfrac{1}{x\ln^{2}(x) + 4x}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{4}\pi`,
    antwoord: '1/4 pi',
    alts: ['pi/4', '(1/4)pi', '1/4pi'],
    integrand: '1 / (x * ln(x)^2 + 4 * x)',
    primitieve: '1/2 * atan(ln(x) / 2)',
    domein: [0.5, 2.5],
    grenzen: [Math.exp(-2), Math.exp(2)],
    waarde: 'pi / 4',
    steps: bepaald({
      schil: `${SCHIL_SUBSTITUTIE} Hier is die "iets anders" de logaritme.`,
      herschrijven: r`Haal $x$ buiten haakjes in de noemer: $x\ln^{2}(x) + 4x = x\left(\ln^{2}(x) + 4\right)$, dus de integrand is $\dfrac{\tfrac{1}{x}}{\ln^{2}(x) + 4}$. Neem $g(x) = \ln(x)$, dan is $g'(x) = \tfrac{1}{x}$ — en dat staat nu in de teller.`,
      primitieve: r`Naar $g$ staat er $\int \dfrac{1}{g^{2} + 4}\,\mathrm{d}g$. Deel teller en noemer door $4$: $\int \dfrac{\tfrac{1}{4}}{\left(\tfrac{1}{2}g\right)^{2} + 1}\,\mathrm{d}g = \tfrac{1}{2}\arctan\left(\tfrac{1}{2}g\right)$. Dus $F(x) = \tfrac{1}{2}\arctan\left(\tfrac{1}{2}\ln(x)\right)$.`,
      invullen: r`Vul de grenzen in. Bij $x = \mathrm{e}^{2}$ is $\ln(x) = 2$ en bij $x = \mathrm{e}^{-2}$ is $\ln(x) = -2$: $\tfrac{1}{2}\arctan(1) - \tfrac{1}{2}\arctan(-1) = \tfrac{1}{8}\pi + \tfrac{1}{8}\pi = \tfrac{1}{4}\pi$.`,
    }),
  },

  // ── Vlakdelen: oppervlakte en de waarde van p ─────────────────────────────
  {
    cluster: 'k3b_oppervlakte',
    nummer: 'op-1',
    level: 1,
    latex: r`Gegeven is de functie $f(x) = \dfrac{12}{x^{2} + 6x + 13}$. Bereken exact het maximum van $f$.`,
    antwoordLatex: r`\text{maximum is } f(-3) = 3`,
    antwoord: '3',
    alts: ['f(-3) = 3', 'maximum is 3', '3 (bij x = -3)'],
    steps: [
      r`Er zit geen integraal in deze opgave, maar wel precies dezelfde eerste stap als bij het primitiveren: kwadraatafsplitsen in de noemer. Daarna zie je het antwoord zo staan.`,
      r`${KWADRAATAFSPLITSEN} De helft van $6$ is $3$: $(x + 3)^{2} = x^{2} + 6x + 9$, dus $x^{2} + 6x + 13 = (x + 3)^{2} + 4$. Dus $f(x) = \dfrac{12}{(x + 3)^{2} + 4}$.`,
      r`De teller staat vast, dus $f$ is het grootst waar de noemer het kleinst is. Een kwadraat is nooit negatief, dus $(x + 3)^{2} + 4$ is het kleinst als $(x + 3)^{2} = 0$, en dat is bij $x = -3$. De noemer is daar $4$.`,
      r`Dus het maximum is $f(-3) = \dfrac{12}{4} = 3$. Dat $f$ nergens groter wordt zie je meteen: voor elke andere $x$ is de noemer groter dan $4$ en de breuk dus kleiner dan $3$.`,
    ],
  },
  {
    cluster: 'k3b_oppervlakte',
    nummer: 'op-2',
    level: 1,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{8}{x^{2} + 4}$, de $x$-as en de lijnen $x = 0$ en $x = 2$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\pi`,
    antwoord: 'pi',
    alts: ['π', '1pi'],
    integrand: '8 / (x^2 + 4)',
    primitieve: '4 * atan(x / 2)',
    grenzen: [0, 2],
    waarde: 'pi',
    steps: oppervlakte({
      integraal: r`Deel 1: het vlakdeel tussen de grafiek, de $x$-as en de lijnen $x = 0$ en $x = 2$ wordt de integraal van $f$ van $0$ tot $2$. Dat mag zonder minteken, want $f$ is overal positief: de noemer $x^{2} + 4$ is altijd groter dan $0$.`,
      herschrijven: r`$O(V) = \displaystyle\int_{0}^{2} \dfrac{8}{x^{2} + 4}\,\mathrm{d}x$. Deel teller en noemer door $4$: $\dfrac{8}{x^{2} + 4} = \dfrac{2}{\left(\tfrac{1}{2}x\right)^{2} + 1}$. De kern is $\tfrac{1}{2}x$, met $a = \tfrac{1}{2}$.`,
      primitieve: r`Deel 2: primitiveren. De standaardvorm geeft $\arctan\left(\tfrac{1}{2}x\right)$ en delen door $\tfrac{1}{2}$ is vermenigvuldigen met $2$, dus $F(x) = 2 \cdot 2\arctan\left(\tfrac{1}{2}x\right) = 4\arctan\left(\tfrac{1}{2}x\right)$.`,
      uitkomst: r`Deel 3: de grenzen invullen. $O(V) = \big[4\arctan\left(\tfrac{1}{2}x\right)\big]_{0}^{2} = 4\arctan(1) - 4\arctan(0) = 4 \cdot \tfrac{1}{4}\pi = \pi$.`,
    }),
  },
  {
    cluster: 'k3b_oppervlakte',
    nummer: 'op-3',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{6}{x^{2} - 6x + 18}$, de $x$-as en de lijnen $x = 3$ en $x = 6$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\tfrac{1}{2}\pi`,
    antwoord: '1/2 pi',
    alts: ['pi/2', '(1/2)pi', '1/2pi'],
    integrand: '6 / (x^2 - 6 * x + 18)',
    primitieve: '2 * atan((x - 3) / 3)',
    grenzen: [3, 6],
    waarde: 'pi / 2',
    steps: oppervlakte({
      integraal: r`Deel 1: het vlakdeel tussen de grafiek, de $x$-as en de lijnen $x = 3$ en $x = 6$ wordt $O(V) = \displaystyle\int_{3}^{6} \dfrac{6}{x^{2} - 6x + 18}\,\mathrm{d}x$. De noemer is nooit $0$, dus de grafiek loopt netjes boven de $x$-as.`,
      herschrijven: r`${KWADRAATAFSPLITSEN} De helft van $-6$ is $-3$: $x^{2} - 6x + 18 = (x - 3)^{2} + 9$. Deel daarna door $9$: $\dfrac{6}{x^{2} - 6x + 18} = \dfrac{\tfrac{2}{3}}{\left(\tfrac{x - 3}{3}\right)^{2} + 1}$.`,
      primitieve: r`Deel 2: de kern is $\tfrac{1}{3}(x - 3)$ met $a = \tfrac{1}{3}$, dus vermenigvuldigen met $3$: $F(x) = \tfrac{2}{3} \cdot 3\arctan\left(\tfrac{x - 3}{3}\right) = 2\arctan\left(\tfrac{x - 3}{3}\right)$.`,
      uitkomst: r`Deel 3: de grenzen invullen. Bij $x = 6$ is de kern $1$ en bij $x = 3$ is de kern $0$: $O(V) = 2\arctan(1) - 2\arctan(0) = 2 \cdot \tfrac{1}{4}\pi = \tfrac{1}{2}\pi$.`,
    }),
  },
  {
    cluster: 'k3b_oppervlakte',
    nummer: 'op-4',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{3}{x^{2} - 2x + 2}$, de $x$-as en de lijnen $x = 0$ en $x = 2$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`1\tfrac{1}{2}\pi`,
    antwoord: '3/2 pi',
    alts: ['1 1/2 pi', '1,5pi', '3pi/2', '(3/2)pi'],
    integrand: '3 / (x^2 - 2 * x + 2)',
    primitieve: '3 * atan(x - 1)',
    grenzen: [0, 2],
    waarde: '3 * pi / 2',
    steps: oppervlakte({
      integraal: r`Deel 1: $O(V) = \displaystyle\int_{0}^{2} \dfrac{3}{x^{2} - 2x + 2}\,\mathrm{d}x$. De grafiek ligt helemaal boven de $x$-as, dus er hoeft geen minteken bij.`,
      herschrijven: r`${KWADRAATAFSPLITSEN} De helft van $-2$ is $-1$: $x^{2} - 2x + 2 = (x - 1)^{2} + 1$. Achter het kwadraat staat al $1$, dus delen hoeft niet.`,
      primitieve: r`Deel 2: de kern is $x - 1$ met $a = 1$, dus $F(x) = 3\arctan(x - 1)$.`,
      uitkomst: r`Deel 3: de grenzen invullen. Bij $x = 2$ is de kern $1$ en bij $x = 0$ is de kern $-1$: $O(V) = 3\arctan(1) - 3\arctan(-1) = \tfrac{3}{4}\pi + \tfrac{3}{4}\pi = 1\tfrac{1}{2}\pi$. Let op het dubbele minteken bij de ondergrens.`,
    }),
  },
  {
    cluster: 'k3b_oppervlakte',
    nummer: 'op-5',
    level: 3,
    latex: r`Het vlakdeel $V_p$ wordt ingesloten door de grafiek van $f(x) = \dfrac{10}{x^{2} + 25}$, de $x$-as en de lijnen $x = 0$ en $x = p$ met $p > 0$. Bereken exact de waarde van $p$ waarvoor $O(V_p) = \tfrac{1}{2}\pi$.`,
    antwoordLatex: r`p = 5`,
    antwoord: '5',
    alts: ['p = 5'],
    integrand: '10 / (x^2 + 25)',
    primitieve: '2 * atan(x / 5)',
    steps: oppervlakte({
      integraal: r`Deel 1: $O(V_p) = \displaystyle\int_{0}^{p} \dfrac{10}{x^{2} + 25}\,\mathrm{d}x$. De bovengrens is nu een letter; verder verandert er niets.`,
      herschrijven: r`Deel teller en noemer door $25$: $\dfrac{10}{x^{2} + 25} = \dfrac{\tfrac{2}{5}}{\left(\tfrac{1}{5}x\right)^{2} + 1}$. De kern is $\tfrac{1}{5}x$, met $a = \tfrac{1}{5}$.`,
      primitieve: r`Deel 2: vermenigvuldigen met $5$ geeft $F(x) = \tfrac{2}{5} \cdot 5\arctan\left(\tfrac{1}{5}x\right) = 2\arctan\left(\tfrac{1}{5}x\right)$, dus $O(V_p) = 2\arctan\left(\tfrac{1}{5}p\right) - 2\arctan(0) = 2\arctan\left(\tfrac{1}{5}p\right)$.`,
      uitkomst: r`Deel 3: de vergelijking oplossen. $2\arctan\left(\tfrac{1}{5}p\right) = \tfrac{1}{2}\pi$ geeft $\arctan\left(\tfrac{1}{5}p\right) = \tfrac{1}{4}\pi$. Die hoek ligt tussen $-\tfrac{1}{2}\pi$ en $\tfrac{1}{2}\pi$, dus er is een oplossing: $\tfrac{1}{5}p = \tan\left(\tfrac{1}{4}\pi\right) = 1$, dus $p = 5$.`,
    }),
  },
  {
    cluster: 'k3b_oppervlakte',
    nummer: 'op-6',
    level: 3,
    latex: r`Het vlakdeel $V_p$ wordt ingesloten door de grafiek van $f(x) = \dfrac{2}{x\ln^{2}(x) + x}$, de $x$-as en de lijnen $x = 1$ en $x = p$ met $p > 1$. Bereken exact de waarde van $p$ waarvoor $O(V_p) = \tfrac{2}{3}\pi$.`,
    antwoordLatex: r`p = \mathrm{e}^{\sqrt{3}}`,
    antwoord: 'e^sqrt(3)',
    alts: ['p = e^sqrt(3)', 'e^(sqrt(3))', 'p = e^(sqrt(3))'],
    integrand: '2 / (x * ln(x)^2 + x)',
    primitieve: '2 * atan(ln(x))',
    domein: [0.5, 2.5],
    steps: oppervlakte({
      integraal: r`Deel 1: $O(V_p) = \displaystyle\int_{1}^{p} \dfrac{2}{x\ln^{2}(x) + x}\,\mathrm{d}x$. Voor $x > 1$ is $f$ positief, dus de oppervlakte is gewoon de integraal.`,
      herschrijven: r`Haal $x$ buiten haakjes in de noemer: $x\ln^{2}(x) + x = x\left(\ln^{2}(x) + 1\right)$, dus $f(x) = \dfrac{2 \cdot \tfrac{1}{x}}{\ln^{2}(x) + 1}$. Neem $g(x) = \ln(x)$, dan is $g'(x) = \tfrac{1}{x}$ — en dat staat in de teller. ${SCHIL_SUBSTITUTIE}`,
      primitieve: r`Deel 2: naar $g$ staat er $\int \dfrac{2}{g^{2} + 1}\,\mathrm{d}g = 2\arctan(g)$, dus $F(x) = 2\arctan(\ln(x))$. Omdat $\ln(1) = 0$ is $O(V_p) = 2\arctan(\ln(p)) - 2\arctan(0) = 2\arctan(\ln(p))$.`,
      uitkomst: r`Deel 3: de vergelijking oplossen. $2\arctan(\ln(p)) = \tfrac{2}{3}\pi$ geeft $\arctan(\ln(p)) = \tfrac{1}{3}\pi$, dus $\ln(p) = \tan\left(\tfrac{1}{3}\pi\right) = \sqrt{3}$ en $p = \mathrm{e}^{\sqrt{3}}$.`,
    }),
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Hoofdstuk, topics en clusters
// ─────────────────────────────────────────────────────────────────────────────

const K3B: AdditiveChapter = {
  chapterSlug: 'k',
  chapterTitle: 'K — Voortgezette integraalrekening',
  bookPart: 4,
  chapterOrder: 12,
  site: 'integralen',
  migrationFile: '0041_k3b_arctangens_primitiveren.sql',
  headerTitle: 'K.3 Theorie B — De arctangensfunctie en primitiveren',
  sourceScript: 'scripts/k3b-content.ts',
  headerNotes: [
    'In Theorie A stond de standaardvorm altijd al klaar. Hier moet je hem zelf',
    'tevoorschijn halen, op twee manieren:',
    '',
    '    a/(px² + q)      → teller en noemer delen door q: (a/q)/((bx)² + 1)',
    '    a/(x² + bx + c)  → eerst kwadraatafsplitsen: a/((x - p)² + q)',
    '',
    'Vier clusters: herschrijven naar a/((bx)² + 1), kwadraatafsplitsen in de',
    'noemer, bepaalde integralen, en vlakdelen met de waarde van p.',
    '',
    'Eigen topics en eigen clusters, zodat de controles aan het eind van de eerdere',
    'K-migraties blijven kloppen en die migraties herhaalbaar blijven.',
    '',
    'Eigen oefenvragen, geen boekopgaven. De 23 vragen met een integraal worden',
    'nagerekend door src/content/primitieven.test.ts (content/hoofdstuk-k/k3b.json);',
    'de ene vraag over het maximum van een breuk heeft geen integraal en staat daar',
    'niet in.',
  ],
  topics: [
    {
      slug: 'k3b_primitiveren',
      title: 'Primitiveren naar arctan: de vorm zoeken',
      order: 20,
      category: 'primitiveren',
    },
    {
      slug: 'k3b_bepaald',
      title: 'Bepaalde integralen naar arctan',
      order: 21,
      category: 'integralen',
    },
    {
      slug: 'k3b_toepassing',
      title: 'Vlakdelen met arctan',
      order: 22,
      category: 'toepassingen',
    },
  ],
  clusters: [
    {
      topic: 'k3b_primitiveren',
      slug: 'k3b_herschrijven',
      title: 'Naar de vorm a/((bx)² + 1)',
      order: 1,
    },
    {
      topic: 'k3b_primitiveren',
      slug: 'k3b_kwadraat',
      title: 'Kwadraatafsplitsen in de noemer',
      order: 2,
    },
    {
      topic: 'k3b_bepaald',
      slug: 'k3b_bepaald_exact',
      title: 'Bepaalde integralen met arctan',
      order: 1,
    },
    {
      topic: 'k3b_toepassing',
      slug: 'k3b_oppervlakte',
      title: 'Oppervlakte en de waarde van p',
      order: 1,
    },
  ],
  questions: VRAGEN,
}

// ─────────────────────────────────────────────────────────────────────────────
// Schrijven
// ─────────────────────────────────────────────────────────────────────────────

const wortel = process.cwd()

const contentPad = path.join(wortel, 'content', 'hoofdstuk-k', 'k3b.json')
writeFileSync(
  contentPad,
  generateContentFile(K3B, 'K.3 Theorie B — De arctangensfunctie en primitiveren (eigen varianten)'),
)

const migratiePad = path.join(wortel, 'supabase', 'migrations', K3B.migrationFile)
writeFileSync(migratiePad, generateAdditiveMigration(K3B))

const metIntegraal = K3B.questions.filter((q) => q.integrand !== undefined).length

console.log(`Geschreven: ${contentPad}`)
console.log(`Geschreven: ${migratiePad}`)
console.log(`Vragen: ${K3B.questions.length}, stappen: ${K3B.questions.length * 4}`)
console.log(`Daarvan nagerekend door de test: ${metIntegraal}`)
