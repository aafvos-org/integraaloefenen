/**
 * K.2 Theorie B — Herhaald partieel integreren, de derde gedaante: een macht
 * van de logaritme.
 *
 * `scripts/k2b-content.ts` dekt de twee gedaanten die meteen opvallen: een
 * veelterm van graad 2 die per ronde een graad zakt, en een e-macht maal een
 * gonio waarbij de integraal terugkomt. Er is een derde die net zo vaak
 * voorkomt: $\ln^{2}(x)$, al dan niet maal een macht van $x$. Daar is er maar
 * één factor, dus maak je er zelf een product van door $h'(x) = 1$ te kiezen.
 * Differentiëren haalt de macht van de logaritme dan per ronde één omlaag:
 *
 *     ∫ ln²(x) dx = x ln²(x) − 2∫ ln(x) dx = x ln²(x) − 2x ln(x) + 2x + c
 *
 * Staat er een macht van x voor, dan primitiveer je die als h'.
 *
 * De regel blijft dezelfde als in Theorie A:
 *
 *     ∫ g(x) · h'(x) dx = g(x) · h(x) − ∫ h(x) · g'(x) dx
 *
 * Draaien met:  npx jiti scripts/k2b-ln-content.ts
 *
 * Schrijft twee bestanden:
 *   • content/hoofdstuk-k/k2b-ln.json  — leest src/content/primitieven.test.ts
 *   • supabase/migrations/0039_k2b_ln.sql — alleen rijen toevoegen
 *
 * Eigen topic en eigen clusters, zodat migratie 0038 ongemoeid blijft: die
 * controleert aan het eind het aantal stappen in zijn eigen drie topics, en dat
 * aantal mag niet veranderen.
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

const E = Math.E

/** De logaritme bestaat alleen voor x > 0, dus daar kijkt de test ook alleen. */
const LN_DOMEIN: [number, number] = [0.2, 2.5]

// ─────────────────────────────────────────────────────────────────────────────
// Stap-sjablonen — dezelfde vorm en dezelfde woorden als in k2b-content.ts
// ─────────────────────────────────────────────────────────────────────────────

const DEEL2 = r`Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal.`

const REGEL = r`$\int g(x) \cdot h'(x)\,\mathrm{d}x = g(x) \cdot h(x) - \int h(x) \cdot g'(x)\,\mathrm{d}x$`

/** De buitenste schil: bij een macht van ln maak je zelf een product. */
const SCHIL_LN = r`Buitenste schil: een macht van $\ln(x)$ → partieel integreren. Een logaritme kun je niet zomaar primitiveren, maar wél differentiëren, dus zet hem op de plek van $g$. Differentiëren haalt de macht van de logaritme per ronde één omlaag: van $\ln^{2}$ naar $\ln^{1}$ naar $\ln^{0}$ zijn dat twee rondes.`

const SCHIL_LN_MACHT = r`Buitenste schil: een macht van $x$ maal een macht van $\ln(x)$ → partieel integreren. De macht van $x$ is makkelijk te primitiveren, dus die wordt $h'$; de logaritme zet je op de plek van $g$, want differentiëren haalt zijn macht per ronde één omlaag.`

/** Primitiveren met twee keer partieel integreren. */
function herhaald(s: { schil: string; keuze: string; eerste: string; tweede: string }): Steps {
  return [`${DEEL2} ${s.schil}`, s.keuze, `Vul de regel in: ${REGEL}. ${s.eerste}`, s.tweede]
}

/** Bepaalde integraal: eerst de primitieve, dan pas de grenzen. */
function bepaald(s: { schil: string; keuze: string; primitiveren: string; invullen: string }): Steps {
  return [
    `${DEEL2} Het is een bepaalde integraal, dus eerst primitiveren en daarna de grenzen invullen. ${s.schil}`,
    s.keuze,
    s.primitiveren,
    s.invullen,
  ]
}

/** Toepassing: eerst de integraal opschrijven (deel 1), dan rekenen. */
function toepassing(s: { deel1: string; keuze: string; primitiveren: string; afronden: string }): Steps {
  return [s.deel1, s.keuze, s.primitiveren, s.afronden]
}

// ─────────────────────────────────────────────────────────────────────────────
// De vragen
// ─────────────────────────────────────────────────────────────────────────────

const VRAGEN: AdditiveQ[] = [
  // ── Primitiveren met een macht van ln ─────────────────────────────────────
  {
    cluster: 'k2b_ln',
    nummer: 'ln-1',
    level: 1,
    latex: r`Primitiveer: $f(x) = \ln^{2}(x)$`,
    antwoordLatex: r`F(x) = x\ln^{2}(x) - 2x\ln(x) + 2x + c`,
    antwoord: 'x ln^2(x) - 2x ln(x) + 2x + c',
    alts: ['x ln(x)^2 - 2x ln(x) + 2x + c', 'x (ln(x)^2 - 2ln(x) + 2) + c'],
    integrand: 'ln(x)^2',
    primitieve: 'x * ln(x)^2 - 2 * x * ln(x) + 2 * x',
    domein: LN_DOMEIN,
    steps: herhaald({
      schil: SCHIL_LN,
      keuze: r`Er staat maar één factor, dus maak er zelf een product van: $h'(x) = 1$, dus $h(x) = x$, en $g(x) = \ln^{2}(x)$, dus $g'(x) = \dfrac{2\ln(x)}{x}$.`,
      eerste: r`Dat geeft $\int \ln^{2}(x)\,\mathrm{d}x = x\ln^{2}(x) - \int x \cdot \dfrac{2\ln(x)}{x}\,\mathrm{d}x = x\ln^{2}(x) - 2\int \ln(x)\,\mathrm{d}x$. De $x$ valt weg tegen de $x$ in de noemer en de macht van de logaritme is één gezakt, maar er staat nog een logaritme: nog een ronde.`,
      tweede: r`Tweede ronde op $\int \ln(x)\,\mathrm{d}x$, weer met $h'(x) = 1$ en $g(x) = \ln(x)$: $\int \ln(x)\,\mathrm{d}x = x\ln(x) - \int x \cdot \dfrac{1}{x}\,\mathrm{d}x = x\ln(x) - x$. Samen: $F(x) = x\ln^{2}(x) - 2x\ln(x) + 2x + c$. Controle: differentiëren geeft $\ln^{2}(x) + 2\ln(x) - 2\ln(x) - 2 + 2 = \ln^{2}(x)$.`,
    }),
  },
  {
    cluster: 'k2b_ln',
    nummer: 'ln-2',
    level: 1,
    latex: r`Primitiveer: $f(x) = x\ln^{2}(x)$`,
    antwoordLatex: r`F(x) = \tfrac{1}{2}x^{2}\ln^{2}(x) - \tfrac{1}{2}x^{2}\ln(x) + \tfrac{1}{4}x^{2} + c`,
    antwoord: '1/2 x^2 ln^2(x) - 1/2 x^2 ln(x) + 1/4 x^2 + c',
    alts: [
      '1/2 x^2 ln(x)^2 - 1/2 x^2 ln(x) + 1/4 x^2 + c',
      'x^2 (2ln(x)^2 - 2ln(x) + 1)/4 + c',
      'x^2 ln(x)^2/2 - x^2 ln(x)/2 + x^2/4 + c',
    ],
    integrand: 'x * ln(x)^2',
    primitieve: '1/2 * x^2 * ln(x)^2 - 1/2 * x^2 * ln(x) + 1/4 * x^2',
    domein: LN_DOMEIN,
    steps: herhaald({
      schil: SCHIL_LN_MACHT,
      keuze: r`Kies $h'(x) = x$, dus $h(x) = \tfrac{1}{2}x^{2}$, en $g(x) = \ln^{2}(x)$, dus $g'(x) = \dfrac{2\ln(x)}{x}$.`,
      eerste: r`Dat geeft $\int x\ln^{2}(x)\,\mathrm{d}x = \tfrac{1}{2}x^{2}\ln^{2}(x) - \int \tfrac{1}{2}x^{2} \cdot \dfrac{2\ln(x)}{x}\,\mathrm{d}x = \tfrac{1}{2}x^{2}\ln^{2}(x) - \int x\ln(x)\,\mathrm{d}x$.`,
      tweede: r`Tweede ronde op $\int x\ln(x)\,\mathrm{d}x$, weer met $h'(x) = x$: $\int x\ln(x)\,\mathrm{d}x = \tfrac{1}{2}x^{2}\ln(x) - \int \tfrac{1}{2}x\,\mathrm{d}x = \tfrac{1}{2}x^{2}\ln(x) - \tfrac{1}{4}x^{2}$. Samen: $F(x) = \tfrac{1}{2}x^{2}\ln^{2}(x) - \tfrac{1}{2}x^{2}\ln(x) + \tfrac{1}{4}x^{2} + c$. Controle: differentiëren geeft $x\ln^{2}(x) + x\ln(x) - x\ln(x) - \tfrac{1}{2}x + \tfrac{1}{2}x = x\ln^{2}(x)$.`,
    }),
  },
  {
    cluster: 'k2b_ln',
    nummer: 'ln-3',
    level: 2,
    latex: r`Primitiveer: $f(x) = x^{2}\ln^{2}(x)$`,
    antwoordLatex: r`F(x) = \tfrac{1}{3}x^{3}\ln^{2}(x) - \tfrac{2}{9}x^{3}\ln(x) + \tfrac{2}{27}x^{3} + c`,
    antwoord: '1/3 x^3 ln^2(x) - 2/9 x^3 ln(x) + 2/27 x^3 + c',
    alts: ['1/3 x^3 ln(x)^2 - 2/9 x^3 ln(x) + 2/27 x^3 + c', 'x^3 (9ln(x)^2 - 6ln(x) + 2)/27 + c'],
    integrand: 'x^2 * ln(x)^2',
    primitieve: '1/3 * x^3 * ln(x)^2 - 2/9 * x^3 * ln(x) + 2/27 * x^3',
    domein: LN_DOMEIN,
    steps: herhaald({
      schil: SCHIL_LN_MACHT,
      keuze: r`Kies $h'(x) = x^{2}$, dus $h(x) = \tfrac{1}{3}x^{3}$, en $g(x) = \ln^{2}(x)$, dus $g'(x) = \dfrac{2\ln(x)}{x}$.`,
      eerste: r`Dat geeft $\int x^{2}\ln^{2}(x)\,\mathrm{d}x = \tfrac{1}{3}x^{3}\ln^{2}(x) - \int \tfrac{1}{3}x^{3} \cdot \dfrac{2\ln(x)}{x}\,\mathrm{d}x = \tfrac{1}{3}x^{3}\ln^{2}(x) - \tfrac{2}{3}\int x^{2}\ln(x)\,\mathrm{d}x$.`,
      tweede: r`Tweede ronde op $\int x^{2}\ln(x)\,\mathrm{d}x = \tfrac{1}{3}x^{3}\ln(x) - \int \tfrac{1}{3}x^{2}\,\mathrm{d}x = \tfrac{1}{3}x^{3}\ln(x) - \tfrac{1}{9}x^{3}$. Die $\tfrac{2}{3}$ ervoor geeft $F(x) = \tfrac{1}{3}x^{3}\ln^{2}(x) - \tfrac{2}{9}x^{3}\ln(x) + \tfrac{2}{27}x^{3} + c$. Controle: differentiëren geeft $x^{2}\ln^{2}(x) + \tfrac{2}{3}x^{2}\ln(x) - \tfrac{2}{3}x^{2}\ln(x) - \tfrac{2}{9}x^{2} + \tfrac{2}{9}x^{2} = x^{2}\ln^{2}(x)$.`,
    }),
  },
  {
    cluster: 'k2b_ln',
    nummer: 'ln-4',
    level: 2,
    latex: r`Primitiveer: $f(x) = \dfrac{\ln^{2}(x)}{x^{2}}$`,
    antwoordLatex: r`F(x) = -\dfrac{\ln^{2}(x) + 2\ln(x) + 2}{x} + c`,
    antwoord: '-(ln^2(x) + 2ln(x) + 2)/x + c',
    alts: ['-(ln(x)^2 + 2ln(x) + 2)/x + c', '-ln(x)^2/x - 2ln(x)/x - 2/x + c'],
    integrand: 'ln(x)^2 / x^2',
    primitieve: '-(ln(x)^2 + 2 * ln(x) + 2) / x',
    domein: LN_DOMEIN,
    steps: herhaald({
      schil: SCHIL_LN_MACHT,
      keuze: r`Schrijf de breuk als $x^{-2}\ln^{2}(x)$. Kies $h'(x) = x^{-2}$, dus $h(x) = -\dfrac{1}{x}$, en $g(x) = \ln^{2}(x)$, dus $g'(x) = \dfrac{2\ln(x)}{x}$.`,
      eerste: r`Dat geeft $\int \dfrac{\ln^{2}(x)}{x^{2}}\,\mathrm{d}x = -\dfrac{\ln^{2}(x)}{x} + \int \dfrac{1}{x} \cdot \dfrac{2\ln(x)}{x}\,\mathrm{d}x = -\dfrac{\ln^{2}(x)}{x} + 2\int \dfrac{\ln(x)}{x^{2}}\,\mathrm{d}x$. Let op het plusteken: twee mintekens tegen elkaar.`,
      tweede: r`Tweede ronde op $\int \dfrac{\ln(x)}{x^{2}}\,\mathrm{d}x = -\dfrac{\ln(x)}{x} + \int \dfrac{1}{x^{2}}\,\mathrm{d}x = -\dfrac{\ln(x)}{x} - \dfrac{1}{x}$. Samen: $F(x) = -\dfrac{\ln^{2}(x)}{x} - \dfrac{2\ln(x)}{x} - \dfrac{2}{x} + c = -\dfrac{\ln^{2}(x) + 2\ln(x) + 2}{x} + c$. Controle: differentiëren geeft $\dfrac{\ln^{2}(x) + 2\ln(x) + 2}{x^{2}} - \dfrac{2\ln(x) + 2}{x^{2}} = \dfrac{\ln^{2}(x)}{x^{2}}$.`,
    }),
  },
  {
    cluster: 'k2b_ln',
    nummer: 'ln-5',
    level: 3,
    latex: r`Primitiveer: $f(x) = \ln^{2}(2x)$`,
    antwoordLatex: r`F(x) = x\ln^{2}(2x) - 2x\ln(2x) + 2x + c`,
    antwoord: 'x ln^2(2x) - 2x ln(2x) + 2x + c',
    alts: ['x ln(2x)^2 - 2x ln(2x) + 2x + c', 'x (ln(2x)^2 - 2ln(2x) + 2) + c'],
    integrand: 'ln(2 * x)^2',
    primitieve: 'x * ln(2 * x)^2 - 2 * x * ln(2 * x) + 2 * x',
    domein: LN_DOMEIN,
    steps: herhaald({
      schil: SCHIL_LN,
      keuze: r`Weer $h'(x) = 1$, dus $h(x) = x$, en $g(x) = \ln^{2}(2x)$. Voor $g'$ heb je de kettingregel nodig: de kern is $\ln(2x)$, en $\dfrac{\mathrm{d}}{\mathrm{d}x}\ln(2x) = \dfrac{2}{2x} = \dfrac{1}{x}$. Dus $g'(x) = \dfrac{2\ln(2x)}{x}$ — net als bij $\ln^{2}(x)$.`,
      eerste: r`Dat geeft $\int \ln^{2}(2x)\,\mathrm{d}x = x\ln^{2}(2x) - \int x \cdot \dfrac{2\ln(2x)}{x}\,\mathrm{d}x = x\ln^{2}(2x) - 2\int \ln(2x)\,\mathrm{d}x$.`,
      tweede: r`Tweede ronde op $\int \ln(2x)\,\mathrm{d}x = x\ln(2x) - \int x \cdot \dfrac{1}{x}\,\mathrm{d}x = x\ln(2x) - x$. Samen: $F(x) = x\ln^{2}(2x) - 2x\ln(2x) + 2x + c$. Controle: differentiëren geeft $\ln^{2}(2x) + 2\ln(2x) - 2\ln(2x) - 2 + 2 = \ln^{2}(2x)$.`,
    }),
  },
  {
    cluster: 'k2b_ln',
    nummer: 'ln-6',
    level: 3,
    latex: r`Primitiveer: $f(x) = \ln^{3}(x)$`,
    antwoordLatex: r`F(x) = x\ln^{3}(x) - 3x\ln^{2}(x) + 6x\ln(x) - 6x + c`,
    antwoord: 'x ln^3(x) - 3x ln^2(x) + 6x ln(x) - 6x + c',
    alts: ['x ln(x)^3 - 3x ln(x)^2 + 6x ln(x) - 6x + c', 'x (ln(x)^3 - 3ln(x)^2 + 6ln(x) - 6) + c'],
    integrand: 'ln(x)^3',
    primitieve: 'x * ln(x)^3 - 3 * x * ln(x)^2 + 6 * x * ln(x) - 6 * x',
    domein: LN_DOMEIN,
    steps: herhaald({
      schil: SCHIL_LN,
      keuze: r`Weer $h'(x) = 1$, dus $h(x) = x$, en $g(x) = \ln^{3}(x)$, dus $g'(x) = \dfrac{3\ln^{2}(x)}{x}$. De macht is nu 3, dus je hebt drie rondes nodig in plaats van twee.`,
      eerste: r`Dat geeft $\int \ln^{3}(x)\,\mathrm{d}x = x\ln^{3}(x) - 3\int \ln^{2}(x)\,\mathrm{d}x$. Die overgebleven integraal ken je al.`,
      tweede: r`Uit de eerste opgave van dit cluster: $\int \ln^{2}(x)\,\mathrm{d}x = x\ln^{2}(x) - 2x\ln(x) + 2x$. Invullen geeft $F(x) = x\ln^{3}(x) - 3\left(x\ln^{2}(x) - 2x\ln(x) + 2x\right) + c = x\ln^{3}(x) - 3x\ln^{2}(x) + 6x\ln(x) - 6x + c$. Controle: differentiëren geeft $\ln^{3}(x) + 3\ln^{2}(x) - 3\ln^{2}(x) - 6\ln(x) + 6\ln(x) + 6 - 6 = \ln^{3}(x)$.`,
    }),
  },

  // ── Bepaalde integralen en oppervlakte met een macht van ln ───────────────
  {
    cluster: 'k2b_bepaald_ln',
    nummer: 'bepln-1',
    level: 1,
    latex: r`Bereken exact: $\displaystyle\int_{1}^{\mathrm{e}} \ln^{2}(x)\,\mathrm{d}x$`,
    antwoordLatex: r`\mathrm{e} - 2`,
    antwoord: 'e - 2',
    alts: ['-2 + e'],
    integrand: 'ln(x)^2',
    primitieve: 'x * ln(x)^2 - 2 * x * ln(x) + 2 * x',
    domein: LN_DOMEIN,
    grenzen: [1, E],
    waarde: 'e - 2',
    steps: bepaald({
      schil: SCHIL_LN,
      keuze: r`Maak er een product van met $h'(x) = 1$, dus $h(x) = x$, en $g(x) = \ln^{2}(x)$, dus $g'(x) = \dfrac{2\ln(x)}{x}$.`,
      primitiveren: r`Eerste ronde: $\int \ln^{2}(x)\,\mathrm{d}x = x\ln^{2}(x) - 2\int \ln(x)\,\mathrm{d}x$. Tweede ronde: $\int \ln(x)\,\mathrm{d}x = x\ln(x) - x$. De primitieve is dus $F(x) = x\ln^{2}(x) - 2x\ln(x) + 2x$.`,
      invullen: r`Vul de grenzen in. Met $\ln(\mathrm{e}) = 1$ is $F(\mathrm{e}) = \mathrm{e} - 2\mathrm{e} + 2\mathrm{e} = \mathrm{e}$, en met $\ln(1) = 0$ is $F(1) = 0 - 0 + 2 = 2$. De integraal is $\mathrm{e} - 2$.`,
    }),
  },
  {
    cluster: 'k2b_bepaald_ln',
    nummer: 'bepln-2',
    level: 1,
    latex: r`Bereken exact: $\displaystyle\int_{1}^{\mathrm{e}^{2}} \ln^{2}(x)\,\mathrm{d}x$`,
    antwoordLatex: r`2\mathrm{e}^{2} - 2`,
    antwoord: '2e^2 - 2',
    alts: ['2(e^2 - 1)', '-2 + 2e^2'],
    integrand: 'ln(x)^2',
    primitieve: 'x * ln(x)^2 - 2 * x * ln(x) + 2 * x',
    domein: LN_DOMEIN,
    grenzen: [1, E * E],
    waarde: '2 * e^2 - 2',
    steps: bepaald({
      schil: SCHIL_LN,
      keuze: r`Dezelfde primitieve als bij de vorige opgave; alleen de bovengrens verandert. Kies $h'(x) = 1$ en $g(x) = \ln^{2}(x)$.`,
      primitiveren: r`Twee rondes geven $F(x) = x\ln^{2}(x) - 2x\ln(x) + 2x$.`,
      invullen: r`Vul de grenzen in. Nu is $\ln\left(\mathrm{e}^{2}\right) = 2$, dus $F\left(\mathrm{e}^{2}\right) = 4\mathrm{e}^{2} - 4\mathrm{e}^{2} + 2\mathrm{e}^{2} = 2\mathrm{e}^{2}$. En $F(1) = 2$. De integraal is $2\mathrm{e}^{2} - 2$.`,
    }),
  },
  {
    cluster: 'k2b_bepaald_ln',
    nummer: 'bepln-3',
    level: 2,
    latex: r`Bereken exact: $\displaystyle\int_{1}^{\mathrm{e}} x^{2}\ln^{2}(x)\,\mathrm{d}x$`,
    antwoordLatex: r`\dfrac{5\mathrm{e}^{3} - 2}{27}`,
    antwoord: '(5e^3 - 2)/27',
    alts: ['5e^3/27 - 2/27'],
    integrand: 'x^2 * ln(x)^2',
    primitieve: '1/3 * x^3 * ln(x)^2 - 2/9 * x^3 * ln(x) + 2/27 * x^3',
    domein: LN_DOMEIN,
    grenzen: [1, E],
    waarde: '(5 * e^3 - 2) / 27',
    steps: bepaald({
      schil: SCHIL_LN_MACHT,
      keuze: r`Kies $h'(x) = x^{2}$, dus $h(x) = \tfrac{1}{3}x^{3}$, en $g(x) = \ln^{2}(x)$, dus $g'(x) = \dfrac{2\ln(x)}{x}$.`,
      primitiveren: r`Eerste ronde geeft $\tfrac{1}{3}x^{3}\ln^{2}(x) - \tfrac{2}{3}\int x^{2}\ln(x)\,\mathrm{d}x$, en de tweede ronde $\int x^{2}\ln(x)\,\mathrm{d}x = \tfrac{1}{3}x^{3}\ln(x) - \tfrac{1}{9}x^{3}$. Dus $F(x) = \tfrac{1}{3}x^{3}\ln^{2}(x) - \tfrac{2}{9}x^{3}\ln(x) + \tfrac{2}{27}x^{3}$.`,
      invullen: r`Vul de grenzen in: $F(\mathrm{e}) = \tfrac{1}{3}\mathrm{e}^{3} - \tfrac{2}{9}\mathrm{e}^{3} + \tfrac{2}{27}\mathrm{e}^{3} = \tfrac{9 - 6 + 2}{27}\mathrm{e}^{3} = \tfrac{5}{27}\mathrm{e}^{3}$ en $F(1) = \tfrac{2}{27}$. De integraal is $\dfrac{5\mathrm{e}^{3} - 2}{27}$.`,
    }),
  },
  {
    cluster: 'k2b_bepaald_ln',
    nummer: 'bepln-4',
    level: 2,
    latex: r`Bereken exact: $\displaystyle\int_{1}^{\mathrm{e}^{3}} \dfrac{\ln^{2}(x)}{x^{2}}\,\mathrm{d}x$`,
    antwoordLatex: r`2 - \dfrac{17}{\mathrm{e}^{3}}`,
    antwoord: '2 - 17/e^3',
    alts: ['-17e^(-3) + 2', '2 - 17e^(-3)'],
    integrand: 'ln(x)^2 / x^2',
    primitieve: '-(ln(x)^2 + 2 * ln(x) + 2) / x',
    domein: LN_DOMEIN,
    grenzen: [1, E * E * E],
    waarde: '2 - 17 / e^3',
    steps: bepaald({
      schil: SCHIL_LN_MACHT,
      keuze: r`Schrijf de breuk als $x^{-2}\ln^{2}(x)$ en kies $h'(x) = x^{-2}$, dus $h(x) = -\dfrac{1}{x}$, en $g(x) = \ln^{2}(x)$.`,
      primitiveren: r`Twee rondes geven $F(x) = -\dfrac{\ln^{2}(x) + 2\ln(x) + 2}{x}$.`,
      invullen: r`Vul de grenzen in. Met $\ln\left(\mathrm{e}^{3}\right) = 3$ is $F\left(\mathrm{e}^{3}\right) = -\dfrac{9 + 6 + 2}{\mathrm{e}^{3}} = -\dfrac{17}{\mathrm{e}^{3}}$, en $F(1) = -\dfrac{0 + 0 + 2}{1} = -2$. De integraal is $-\dfrac{17}{\mathrm{e}^{3}} + 2 = 2 - \dfrac{17}{\mathrm{e}^{3}}$.`,
    }),
  },
  {
    cluster: 'k2b_bepaald_ln',
    nummer: 'bepln-5',
    level: 3,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \ln^{3}(x)$, de $x$-as en de lijn $x = \mathrm{e}$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`6 - 2\mathrm{e}`,
    antwoord: '6 - 2e',
    alts: ['-2e + 6'],
    integrand: 'ln(x)^3',
    primitieve: 'x * ln(x)^3 - 3 * x * ln(x)^2 + 6 * x * ln(x) - 6 * x',
    domein: LN_DOMEIN,
    grenzen: [1, E],
    waarde: '6 - 2 * e',
    steps: toepassing({
      deel1: r`Deel 1 van de driedeling: $\ln^{3}(x) = 0$ als $\ln(x) = 0$, dus de grafiek snijdt de $x$-as bij $x = 1$. Tussen $x = 1$ en $x = \mathrm{e}$ is $\ln(x) > 0$, dus ook $\ln^{3}(x) > 0$ en ligt de grafiek boven de $x$-as. De oppervlakte is $\displaystyle\int_{1}^{\mathrm{e}} \ln^{3}(x)\,\mathrm{d}x$.`,
      keuze: r`Deel 2: een macht van $\ln(x)$ → partieel integreren met $h'(x) = 1$, dus $h(x) = x$, en $g(x) = \ln^{3}(x)$, dus $g'(x) = \dfrac{3\ln^{2}(x)}{x}$.`,
      primitiveren: r`Eerste ronde: $\int \ln^{3}(x)\,\mathrm{d}x = x\ln^{3}(x) - 3\int \ln^{2}(x)\,\mathrm{d}x$. Daarna nog twee rondes voor $\int \ln^{2}(x)\,\mathrm{d}x = x\ln^{2}(x) - 2x\ln(x) + 2x$. Samen: $F(x) = x\ln^{3}(x) - 3x\ln^{2}(x) + 6x\ln(x) - 6x$.`,
      afronden: r`Vul de grenzen in: $F(\mathrm{e}) = \mathrm{e} - 3\mathrm{e} + 6\mathrm{e} - 6\mathrm{e} = -2\mathrm{e}$ en $F(1) = 0 - 0 + 0 - 6 = -6$. De oppervlakte is $-2\mathrm{e} - (-6) = 6 - 2\mathrm{e}$. Dat is positief, want $\mathrm{e} < 3$.`,
    }),
  },
  {
    cluster: 'k2b_bepaald_ln',
    nummer: 'bepln-6',
    level: 3,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \ln^{2}(x) - 1$ en de $x$-as. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\dfrac{4}{\mathrm{e}}`,
    antwoord: '4/e',
    alts: ['4e^(-1)'],
    integrand: 'ln(x)^2 - 1',
    primitieve: 'x * ln(x)^2 - 2 * x * ln(x) + x',
    domein: LN_DOMEIN,
    grenzen: [1 / E, E],
    waarde: '-4 / e',
    steps: toepassing({
      deel1: r`Deel 1 van de driedeling: zoek eerst de snijpunten met de $x$-as. Uit $\ln^{2}(x) = 1$ volgt $\ln(x) = 1$ of $\ln(x) = -1$, dus $x = \mathrm{e}$ en $x = \dfrac{1}{\mathrm{e}}$. Daartussen is $\left|\ln(x)\right| < 1$, dus $\ln^{2}(x) - 1 < 0$ en ligt de grafiek ónder de $x$-as. De oppervlakte is $-\displaystyle\int_{\frac{1}{\mathrm{e}}}^{\mathrm{e}} \left(\ln^{2}(x) - 1\right)\mathrm{d}x$.`,
      keuze: r`Deel 2: splits de integraal. De $-1$ primitiveer je zo tot $-x$; voor $\int \ln^{2}(x)\,\mathrm{d}x$ ga je twee keer partieel integreren met $h'(x) = 1$ en $g(x) = \ln^{2}(x)$.`,
      primitiveren: r`Twee rondes geven $\int \ln^{2}(x)\,\mathrm{d}x = x\ln^{2}(x) - 2x\ln(x) + 2x$. Met de $-x$ erbij: $F(x) = x\ln^{2}(x) - 2x\ln(x) + 2x - x = x\ln^{2}(x) - 2x\ln(x) + x$.`,
      afronden: r`Vul de grenzen in: $F(\mathrm{e}) = \mathrm{e} - 2\mathrm{e} + \mathrm{e} = 0$ en $F\left(\tfrac{1}{\mathrm{e}}\right) = \tfrac{1}{\mathrm{e}} + \tfrac{2}{\mathrm{e}} + \tfrac{1}{\mathrm{e}} = \dfrac{4}{\mathrm{e}}$ (let op: $\ln\left(\tfrac{1}{\mathrm{e}}\right) = -1$, dus de middelste term wordt positief). De integraal is $0 - \dfrac{4}{\mathrm{e}} = -\dfrac{4}{\mathrm{e}}$, dus negatief. De oppervlakte is het tegengestelde: $\dfrac{4}{\mathrm{e}}$.`,
    }),
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Hoofdstuk, topic en clusters
// ─────────────────────────────────────────────────────────────────────────────

const K2B_LN: AdditiveChapter = {
  chapterSlug: 'k',
  chapterTitle: 'K — Voortgezette integraalrekening',
  bookPart: 4,
  chapterOrder: 12,
  site: 'integralen',
  migrationFile: '0039_k2b_ln.sql',
  headerTitle: 'K.2 Theorie B — Herhaald partieel integreren met een macht van ln',
  sourceScript: 'scripts/k2b-ln-content.ts',
  headerNotes: [
    'Aanvulling op migratie 0038. Die dekt de twee gedaanten waarin een factor',
    'vanzelf eenvoudiger wordt (een veelterm van graad 2) of waarin de integraal',
    'terugkomt (e-macht maal gonio). Dit is de derde: een macht van ln(x), waar je',
    'zelf een product maakt door h\'(x) = 1 te kiezen en de macht van de logaritme',
    'per ronde één zakt.',
    '',
    'Eigen topic en eigen clusters, zodat de controle aan het eind van 0038 blijft',
    'kloppen en die migratie herhaalbaar blijft.',
    '',
    'Eigen oefenvragen, geen boekopgaven. Elke primitieve wordt nagerekend door',
    'src/content/primitieven.test.ts (content/hoofdstuk-k/k2b-ln.json).',
  ],
  topics: [
    {
      slug: 'k2b_logaritme',
      title: 'Herhaald partieel integreren met een macht van ln',
      order: 16,
      category: 'primitiveren',
    },
  ],
  clusters: [
    { topic: 'k2b_logaritme', slug: 'k2b_ln', title: 'Een macht van ln primitiveren', order: 1 },
    {
      topic: 'k2b_logaritme',
      slug: 'k2b_bepaald_ln',
      title: 'Bepaalde integralen en oppervlakte met een macht van ln',
      order: 2,
    },
  ],
  questions: VRAGEN,
}

// ─────────────────────────────────────────────────────────────────────────────
// Schrijven
// ─────────────────────────────────────────────────────────────────────────────

const wortel = process.cwd()

const contentPad = path.join(wortel, 'content', 'hoofdstuk-k', 'k2b-ln.json')
writeFileSync(
  contentPad,
  generateContentFile(
    K2B_LN,
    'K.2 Theorie B — Herhaald partieel integreren met een macht van ln (eigen varianten)',
  ),
)

const migratiePad = path.join(wortel, 'supabase', 'migrations', K2B_LN.migrationFile)
writeFileSync(migratiePad, generateAdditiveMigration(K2B_LN))

console.log(`Geschreven: ${contentPad}`)
console.log(`Geschreven: ${migratiePad}`)
console.log(`Vragen: ${K2B_LN.questions.length}, stappen: ${K2B_LN.questions.length * 4}`)
