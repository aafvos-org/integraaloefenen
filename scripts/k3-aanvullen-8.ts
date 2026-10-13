/**
 * Aanvulling tot 8 vragen per cluster, K.3 A t/m K.3 C.
 *
 * K.4 en K.5 hadden al acht vragen per soort en blijven buiten deze migratie.
 * K.3 A en K.3 B hadden er zes; K.3 C zat lager. Hier komen eigen varianten
 * bij, met andere getallen dan de vragen die er al staan.
 *
 * Draaien met:  npx jiti scripts/k3-aanvullen-8.ts
 *
 * Schrijft:
 *   • content/hoofdstuk-k/k3-aanvullen-8.json
 *   • supabase/migrations/0071_k3_aanvullen_tot_8.sql
 */
import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
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

const DEEL2 = r`Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal.`
const DEEL2_BEPAALD = `${DEEL2} Eerst een primitieve zoeken, daarna de grenzen invullen. Het antwoord blijft exact.`
const DRIEDELING = r`Hier spelen alle drie de delen van de driedeling: eerst het verhaaltje vertalen naar een integraal (deel 1), dan die integraal berekenen (deel 2), en daarna nog iets doen met de uitkomst (deel 3).`
const DEEL3_ARCTAN = r`Hier speelt alleen deel 3 van de driedeling: de goede oplossingsmethode gebruiken. Er staat geen integraal in deze opgave; je hebt alleen nodig wat $\arctan$ betekent.`
const DEEL3_ARCSIN = r`Hier speelt alleen deel 3 van de driedeling: de goede oplossingsmethode gebruiken. Er staat geen integraal in deze opgave; je hebt alleen nodig wat $\arcsin$ betekent.`
const WAT_IS_ARCTAN = r`$\arctan(a)$ is de hoek $t$ met $\tan(t) = a$ én $-\tfrac{1}{2}\pi < t < \tfrac{1}{2}\pi$. Dat laatste stukje is de hele truc: er zijn oneindig veel hoeken met dezelfde tangens, maar $\arctan$ kiest er altijd één uit dat gebied.`
const WAT_IS_ARCSIN = r`$\arcsin(a)$ is de hoek $t$ met $\sin(t) = a$ én $-\tfrac{1}{2}\pi \le t \le \tfrac{1}{2}\pi$. Dat laatste stukje is de hele truc: er zijn oneindig veel hoeken met dezelfde sinus, maar $\arcsin$ kiest er altijd één uit dat gebied. En omdat een sinus nooit buiten $[-1, 1]$ komt, is dat ook meteen het domein van $\arcsin$.`
const TABEL_TAN = r`Uit de tabel die je uit het hoofd kent: $\tan\left(\tfrac{1}{6}\pi\right) = \tfrac{1}{3}\sqrt{3}$, $\tan\left(\tfrac{1}{4}\pi\right) = 1$ en $\tan\left(\tfrac{1}{3}\pi\right) = \sqrt{3}$. Omdat $\tan$ oneven is, hoort bij een negatief getal dezelfde hoek met een minteken.`
const TABEL_SIN = r`Uit de tabel die je uit het hoofd kent: $\sin\left(\tfrac{1}{6}\pi\right) = \tfrac{1}{2}$, $\sin\left(\tfrac{1}{4}\pi\right) = \tfrac{1}{2}\sqrt{2}$, $\sin\left(\tfrac{1}{3}\pi\right) = \tfrac{1}{2}\sqrt{3}$ en $\sin\left(\tfrac{1}{2}\pi\right) = 1$. Omdat $\sin$ oneven is, hoort bij een negatief getal dezelfde hoek met een minteken.`
const STANDAARD_ARCTAN = r`$\dfrac{1}{x^{2} + 1}$ geeft $\arctan(x) + c$`
const SCHIL_STANDAARD = r`Buitenste schil: een breuk met $x^{2} + 1$ in de noemer → de standaardvorm ${STANDAARD_ARCTAN}.`
const SCHIL_KERN = r`Buitenste schil: een breuk met in de noemer een kwadraat plus $1$, maar niet kaal $x^{2} + 1$ → lees eerst de kern af. De regel voor $f(ax + b)$ zegt dat je daarna nog door $a$ moet delen.`
const SCHIL_SUBSTITUTIE_ARCTAN = r`Buitenste schil: in de noemer staat het kwadraat van iets anders dan $x$, en de afgeleide daarvan staat in de teller → substitutie. Met $\int \dfrac{g'}{g^{2} + 1}\,\mathrm{d}x = \arctan(g) + c$ ben je er in één stap.`
const SCHIL_AFGELEIDE = r`De afgeleide van $\arctan$ is precies de standaardvorm die je bij deel 2 van de driedeling moet herkennen: $[\arctan(x)]' = \dfrac{1}{x^{2} + 1}$. Daarom oefen je hem eerst andersom. Buitenste schil: $\arctan$ van een kern → kettingregel.`
const SCHIL_HERSCHRIJVEN = r`Buitenste schil: een breuk met een getal in de teller en $px^{2} + q$ in de noemer → nog geen standaardvorm, want achter het kwadraat staat niet $1$. Deel eerst teller en noemer door $q$, zodat er $\dfrac{a}{(bx)^{2} + 1}$ komt te staan.`
const SCHIL_KWADRAAT = r`Buitenste schil: een breuk met in de noemer een polynoom $x^{2} + bx + c$ waar geen kwadraat in te zien is → eerst kwadraatafsplitsen, en dan pas kijken welke standaardvorm erbij hoort.`
const KWADRAATAFSPLITSEN = r`Kwadraatafsplitsen: neem de helft van het getal voor $x$, zet dat in het kwadraat, en corrigeer met een getal.`
const STANDAARD_ARCSIN = r`$\dfrac{1}{\sqrt{1 - x^{2}}}$ geeft $\arcsin(x) + c$`
const SCHIL_ARCSIN = r`Buitenste schil: een breuk met $\sqrt{1 - (\ldots)^{2}}$ in de noemer → de standaardvorm ${STANDAARD_ARCSIN}. Lees eerst de kern af; de regel voor $f(ax + b)$ zegt dat je daarna nog door $a$ moet delen.`
const SCHIL_WORTEL = r`Buitenste schil: een breuk met $\sqrt{a^{2} - x^{2}}$ in de noemer → nog geen standaardvorm, want achter de $1$ hoort een min en vóór het kwadraat een $1$. Haal eerst $a$ buiten de wortel: $\sqrt{a^{2} - x^{2}} = a\sqrt{1 - \left(\tfrac{x}{a}\right)^{2}}$.`
const SCHIL_SUBSTITUTIE_ARCSIN = r`Buitenste schil: onder de wortel staat $1$ min het kwadraat van iets anders dan $x$, en de afgeleide daarvan staat in de teller → substitutie. Met $\int \dfrac{g'}{\sqrt{1 - g^{2}}}\,\mathrm{d}x = \arcsin(g) + c$ ben je er in één stap.`
const SCHIL_PARTIEEL = r`Buitenste schil: een kale $\arcsin$ of $\arctan$ → partieel integreren. Die twee kun je niet zomaar primitiveren, maar wél differentiëren, dus zet ze op de plek van $g$ en maak er zelf een product van met $h'(x) = 1$.`
const REGEL_PARTIEEL = r`$\int g(x) \cdot h'(x)\,\mathrm{d}x = g(x) \cdot h(x) - \int h(x) \cdot g'(x)\,\mathrm{d}x$`
const REGEL_AXB = r`De regel voor $f(ax + b)$ zegt: primitiveer alsof er $x$ staat en deel daarna door $a$.`
const CONTROLE = r`Controle: differentieer $F$ en je krijgt $f$ terug.`
const CONTROLE_AFGELEIDE = r`Controle: de afgeleide van $\arctan$ van de kern, maal de afgeleide van de kern, geeft precies deze breuk terug.`

function waardeArctan(s: { vraag: string; tabel: string; antwoord: string }): Steps {
  return [DEEL3_ARCTAN, `${WAT_IS_ARCTAN} ${s.vraag}`, s.tabel, s.antwoord]
}

function waardeArcsin(s: { vraag: string; tabel: string; antwoord: string }): Steps {
  return [DEEL3_ARCSIN, `${WAT_IS_ARCSIN} ${s.vraag}`, s.tabel, s.antwoord]
}

function vergelijking(deel: string, s: { schil: string; omschrijven: string; oplossen: string; antwoord: string }): Steps {
  return [`${deel} ${s.schil}`, s.omschrijven, s.oplossen, s.antwoord]
}

function afgeleide(s: { kern: string; dBuiten: string; dKern: string; samen: string }): Steps {
  return [
    SCHIL_AFGELEIDE,
    r`Buitenkant en kern: buitenkant $\arctan(\ldots)$, kern $${s.kern}$.`,
    r`Afgeleide van de buitenkant met de kern erin: $${s.dBuiten}$. Afgeleide van de kern: $${s.dKern}$.`,
    s.samen,
  ]
}

function primitiveren(s: { schil: string; herschrijven: string; regel: string; antwoord: string }): Steps {
  return [`${DEEL2} ${s.schil}`, s.herschrijven, s.regel, `${s.antwoord} ${CONTROLE}`]
}

function partieel(s: { keuze: string; invullen: string; antwoord: string }): Steps {
  return [`${DEEL2} ${SCHIL_PARTIEEL}`, s.keuze, `Vul de regel in: ${REGEL_PARTIEEL}. ${s.invullen}`, s.antwoord]
}

function bepaald(s: { schil: string; herschrijven: string; primitieve: string; invullen: string }): Steps {
  return [`${DEEL2_BEPAALD} ${s.schil}`, s.herschrijven, s.primitieve, s.invullen]
}

function oppervlakte(s: { integraal: string; herschrijven: string; primitieve: string; uitkomst: string }): Steps {
  return [`${DRIEDELING} ${s.integraal}`, s.herschrijven, s.primitieve, s.uitkomst]
}

function extra(cluster: string, nummer: string, level: 1 | 2 | 3, volgorde: number, rest: Omit<AdditiveQ, 'cluster' | 'nummer' | 'level' | 'volgorde'>): AdditiveQ {
  return { cluster, nummer, level, volgorde, ...rest }
}

const VRAGEN: AdditiveQ[] = [
  // ── K.3 A exacte waarden ──────────────────────────────────────────────────
  extra('k3a_waarden', 'k3a-w-7', 2, 7, {
    latex: r`Bereken exact: $\arctan\left(-\sqrt{3}\right) + \arctan(1)$`,
    antwoordLatex: r`-\tfrac{1}{12}\pi`,
    antwoord: '-1/12 pi',
    alts: ['-pi/12', '-(1/12)pi', '-1/12pi'],
    steps: waardeArctan({
      vraag: r`Je telt twee hoeken bij elkaar op. Zoek ze elk apart in de tabel en tel daarna.`,
      tabel: `${TABEL_TAN} $\\arctan\\left(-\\sqrt{3}\\right) = -\\tfrac{1}{3}\\pi$ en $\\arctan(1) = \\tfrac{1}{4}\\pi$.`,
      antwoord: r`Samen: $-\tfrac{1}{3}\pi + \tfrac{1}{4}\pi = -\tfrac{4}{12}\pi + \tfrac{3}{12}\pi = -\tfrac{1}{12}\pi$.`,
    }),
  }),
  extra('k3a_waarden', 'k3a-w-8', 3, 8, {
    latex: r`Bereken exact: $\arctan\left(\tan\left(\tfrac{5}{6}\pi\right)\right)$`,
    antwoordLatex: r`-\tfrac{1}{6}\pi`,
    antwoord: '-1/6 pi',
    alts: ['-pi/6', '-(1/6)pi', '-1/6pi'],
    steps: waardeArctan({
      vraag: r`Eerst de tangens uitrekenen, en daarna pas $\arctan$. De hoek $\tfrac{5}{6}\pi$ ligt buiten het gebied van $\arctan$, dus het antwoord is niet vanzelf $\tfrac{5}{6}\pi$.`,
      tabel: `${TABEL_TAN} $\\tan\\left(\\tfrac{5}{6}\\pi\\right) = \\tan\\left(\\pi - \\tfrac{1}{6}\\pi\\right) = -\\tan\\left(\\tfrac{1}{6}\\pi\\right) = -\\tfrac{1}{3}\\sqrt{3}$.`,
      antwoord: r`$\arctan\left(-\tfrac{1}{3}\sqrt{3}\right) = -\tfrac{1}{6}\pi$, want die hoek ligt wél tussen $-\tfrac{1}{2}\pi$ en $\tfrac{1}{2}\pi$ en heeft dezelfde tangens.`,
    }),
  }),

  // ── K.3 A vergelijkingen ──────────────────────────────────────────────────
  extra('k3a_vergelijking', 'k3a-v-7', 2, 7, {
    latex: r`Los exact op: $2\arctan(x) = \tfrac{1}{3}\pi$`,
    antwoordLatex: r`x = \tfrac{1}{3}\sqrt{3}`,
    antwoord: '1/3 sqrt(3)',
    alts: ['x = 1/3 sqrt(3)', 'sqrt(3)/3', 'x = sqrt(3)/3', '(1/3)sqrt(3)'],
    steps: vergelijking(DEEL3_ARCTAN, {
      schil: r`Buitenste schil: een veelvoud van $\arctan(x)$ is gelijk aan een hoek uit de tabel → eerst $\arctan(x)$ vrijmaken.`,
      omschrijven: r`Deel door $2$: $\arctan(x) = \tfrac{1}{6}\pi$. Die hoek ligt tussen $-\tfrac{1}{2}\pi$ en $\tfrac{1}{2}\pi$, dus er is een oplossing.`,
      oplossen: r`Tangens nemen: $x = \tan\left(\tfrac{1}{6}\pi\right) = \tfrac{1}{3}\sqrt{3}$.`,
      antwoord: r`Dus $x = \tfrac{1}{3}\sqrt{3}$. Controle: $\arctan\left(\tfrac{1}{3}\sqrt{3}\right) = \tfrac{1}{6}\pi$, en twee keer die hoek is $\tfrac{1}{3}\pi$.`,
    }),
  }),
  extra('k3a_vergelijking', 'k3a-v-8', 3, 8, {
    latex: r`Los op: $\arctan(3x) = 1{,}2$. Rond af op drie decimalen.`,
    antwoordLatex: r`x \approx 0{,}857`,
    antwoord: '0,857',
    alts: ['0.857', 'x = 0,857', 'x = 0.857', 'x ≈ 0,857', 'x ≈ 0.857'],
    steps: vergelijking(DEEL3_ARCTAN, {
      schil: r`Buitenste schil: $\arctan$ van een kern is gelijk aan een getal → eerst de kern vrijmaken. Rechts staat $1{,}2$ in radialen, geen hoek uit de tabel.`,
      omschrijven: r`Kan het? $1{,}2 < \tfrac{1}{2}\pi \approx 1{,}571$, dus $1{,}2$ ligt in het bereik van $\arctan$ en er is een oplossing. Tangens nemen geeft $3x = \tan(1{,}2)$.`,
      oplossen: r`Dus $x = \dfrac{\tan(1{,}2)}{3}$. Dat is de exacte oplossing; $1{,}2$ staat niet in de tabel.`,
      antwoord: r`Met de rekenmachine (in radialen!): $\tan(1{,}2) \approx 2{,}5722$, dus $x \approx \dfrac{2{,}5722}{3} \approx 0{,}857$.`,
    }),
  }),

  // ── K.3 A afgeleide ───────────────────────────────────────────────────────
  extra('k3a_afgeleide', 'k3a-a-7', 2, 7, {
    latex: r`Differentieer: $f(x) = \arctan(5x - 1)$`,
    antwoordLatex: r`f'(x) = \dfrac{5}{25x^{2} - 10x + 2}`,
    antwoord: '5/(25x^2 - 10x + 2)',
    alts: ['5/((5x - 1)^2 + 1)', '5/(25x^2 - 10x + 2)'],
    integrand: '5 / ((5 * x - 1)^2 + 1)',
    primitieve: 'atan(5 * x - 1)',
    steps: afgeleide({
      kern: '5x - 1',
      dBuiten: r`\dfrac{1}{(5x - 1)^{2} + 1}`,
      dKern: '5',
      samen: r`Vermenigvuldig: $f'(x) = \dfrac{5}{(5x - 1)^{2} + 1}$. Werk het kwadraat uit: $(5x - 1)^{2} + 1 = 25x^{2} - 10x + 2$, dus $f'(x) = \dfrac{5}{25x^{2} - 10x + 2}$. ${CONTROLE_AFGELEIDE}`,
    }),
  }),
  extra('k3a_afgeleide', 'k3a-a-8', 3, 8, {
    latex: r`Differentieer: $f(x) = x^{2}\arctan(x)$`,
    antwoordLatex: r`f'(x) = 2x\arctan(x) + \dfrac{x^{2}}{x^{2} + 1}`,
    antwoord: '2x arctan(x) + x^2/(x^2 + 1)',
    alts: ['2x atan(x) + x^2/(x^2+1)', 'x^2/(x^2 + 1) + 2x arctan(x)'],
    integrand: '2 * x * atan(x) + x^2 / (x^2 + 1)',
    primitieve: 'x^2 * atan(x)',
    steps: [
      r`De afgeleide van $\arctan$ is $\dfrac{1}{x^{2} + 1}$. Hier staat een product van $x^{2}$ en $\arctan(x)$, dus de productregel: $(g \cdot h)' = g' \cdot h + g \cdot h'$.`,
      r`Neem $g(x) = x^{2}$ en $h(x) = \arctan(x)$. Dan is $g'(x) = 2x$ en $h'(x) = \dfrac{1}{x^{2} + 1}$.`,
      r`Vul in: $f'(x) = 2x \cdot \arctan(x) + x^{2} \cdot \dfrac{1}{x^{2} + 1}$.`,
      r`Schrijf het antwoord op: $f'(x) = 2x\arctan(x) + \dfrac{x^{2}}{x^{2} + 1}$. Controle: differentieer $x^{2}\arctan(x)$ met de productregel en je krijgt deze twee termen terug.`,
    ],
  }),

  // ── K.3 A standaardvorm ───────────────────────────────────────────────────
  extra('k3a_standaard', 'k3a-s-7', 2, 7, {
    latex: r`Primitiveer: $f(x) = \dfrac{3x^{2} + 1}{x^{2} + 1}$`,
    antwoordLatex: r`F(x) = 3x - 2\arctan(x) + c`,
    antwoord: '3x - 2arctan(x) + c',
    alts: ['3x - 2 atan(x) + c', '-2 arctan(x) + 3x + c'],
    integrand: '(3 * x^2 + 1) / (x^2 + 1)',
    primitieve: '3 * x - 2 * atan(x)',
    steps: primitiveren({
      schil: SCHIL_STANDAARD,
      herschrijven: r`De teller is nog geen veelvoud van de noemer. Schrijf $3x^{2} + 1 = 3(x^{2} + 1) - 2$, dus $f(x) = 3 - \dfrac{2}{x^{2} + 1}$.`,
      regel: r`De constante $3$ geeft $3x$. En $\dfrac{2}{x^{2} + 1}$ geeft $2\arctan(x)$, met een minteken ervoor.`,
      antwoord: r`Dus $F(x) = 3x - 2\arctan(x) + c$.`,
    }),
  }),
  extra('k3a_standaard', 'k3a-s-8', 3, 8, {
    latex: r`Primitiveer: $f(x) = \dfrac{6x - 2}{x^{2} + 1}$`,
    antwoordLatex: r`F(x) = 3\ln\left(x^{2} + 1\right) - 2\arctan(x) + c`,
    antwoord: '3 ln(x^2 + 1) - 2 arctan(x) + c',
    alts: ['3ln(x^2 + 1) - 2 arctan(x) + c', '3 ln(x^2 + 1) - 2 atan(x) + c'],
    integrand: '(6 * x - 2) / (x^2 + 1)',
    primitieve: '3 * ln(x^2 + 1) - 2 * atan(x)',
    steps: primitiveren({
      schil: SCHIL_STANDAARD,
      herschrijven: r`Splits de breuk: $f(x) = \dfrac{6x}{x^{2} + 1} - \dfrac{2}{x^{2} + 1}$. De eerste term hoort bij $\ln$, de tweede bij $\arctan$.`,
      regel: r`$\left[\ln\left(x^{2} + 1\right)\right]' = \dfrac{2x}{x^{2} + 1}$, dus $\dfrac{6x}{x^{2} + 1}$ is daar drie keer van en geeft $3\ln\left(x^{2} + 1\right)$. En $\dfrac{2}{x^{2} + 1}$ geeft $2\arctan(x)$.`,
      antwoord: r`Dus $F(x) = 3\ln\left(x^{2} + 1\right) - 2\arctan(x) + c$.`,
    }),
  }),

  // ── K.3 A kern ────────────────────────────────────────────────────────────
  extra('k3a_kern', 'k3a-k-7', 2, 7, {
    latex: r`Primitiveer: $f(x) = \dfrac{1}{(3x + 1)^{2} + 1}$`,
    antwoordLatex: r`F(x) = \tfrac{1}{3}\arctan(3x + 1) + c`,
    antwoord: '1/3 arctan(3x + 1) + c',
    alts: ['arctan(3x + 1)/3 + c', '(1/3) arctan(3x + 1) + c'],
    integrand: '1 / ((3 * x + 1)^2 + 1)',
    primitieve: 'atan(3 * x + 1) / 3',
    steps: primitiveren({
      schil: SCHIL_KERN,
      herschrijven: r`Er staat al een kwadraat plus $1$. De kern is $3x + 1$, dus $a = 3$.`,
      regel: `${REGEL_AXB} ${STANDAARD_ARCTAN} met de kern erin geeft $\\arctan(3x + 1)$. Delen door $3$ zet er $\\tfrac{1}{3}$ voor.`,
      antwoord: r`Dus $F(x) = \tfrac{1}{3}\arctan(3x + 1) + c$.`,
    }),
  }),
  extra('k3a_kern', 'k3a-k-8', 3, 8, {
    latex: r`Primitiveer: $f(x) = \dfrac{4x^{3}}{x^{8} + 1}$`,
    antwoordLatex: r`F(x) = \arctan\left(x^{4}\right) + c`,
    antwoord: 'arctan(x^4) + c',
    alts: ['atan(x^4) + c', 'arctan(x^4)+c'],
    integrand: '4 * x^3 / (x^8 + 1)',
    primitieve: 'atan(x^4)',
    steps: primitiveren({
      schil: SCHIL_SUBSTITUTIE_ARCTAN,
      herschrijven: r`Neem $g(x) = x^{4}$. Dan is $g'(x) = 4x^{3}$, en die staat precies in de teller. In de noemer staat $(x^{4})^{2} + 1 = g^{2} + 1$.`,
      regel: r`Naar $g$ staat er $\int \dfrac{1}{g^{2} + 1}\,\mathrm{d}g = \arctan(g)$.`,
      antwoord: r`Schrijf $g$ terug: $F(x) = \arctan\left(x^{4}\right) + c$.`,
    }),
  }),

  // ── K.3 A bepaalde integralen ─────────────────────────────────────────────
  extra('k3a_bepaald_exact', 'k3a-b-7', 2, 7, {
    latex: r`Bereken exact: $\displaystyle\int_{0}^{\sqrt{3}} \dfrac{1}{x^{2} + 1}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{3}\pi`,
    antwoord: '1/3 pi',
    alts: ['pi/3', '(1/3)pi', '1/3pi'],
    integrand: '1 / (x^2 + 1)',
    primitieve: 'atan(x)',
    grenzen: [0, Math.sqrt(3)],
    waarde: 'pi / 3',
    steps: bepaald({
      schil: SCHIL_STANDAARD,
      herschrijven: r`Er staat al de standaardvorm. De bovengrens $\sqrt{3}$ is een hint dat er straks een hoek uit de tabel komt.`,
      primitieve: r`Een primitieve is $F(x) = \arctan(x)$, zonder integratieconstante — bij een bepaalde integraal valt die toch weg.`,
      invullen: r`Vul de grenzen in: $\big[\arctan(x)\big]_{0}^{\sqrt{3}} = \arctan\left(\sqrt{3}\right) - \arctan(0) = \tfrac{1}{3}\pi - 0 = \tfrac{1}{3}\pi$.`,
    }),
  }),
  extra('k3a_bepaald_exact', 'k3a-b-8', 3, 8, {
    latex: r`Bereken exact: $\displaystyle\int_{0}^{1} \dfrac{4x^{3}}{x^{8} + 1}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{4}\pi`,
    antwoord: '1/4 pi',
    alts: ['pi/4', '(1/4)pi', '1/4pi'],
    integrand: '4 * x^3 / (x^8 + 1)',
    primitieve: 'atan(x^4)',
    grenzen: [0, 1],
    waarde: 'pi / 4',
    steps: bepaald({
      schil: SCHIL_SUBSTITUTIE_ARCTAN,
      herschrijven: r`Neem $g(x) = x^{4}$. Dan is $g'(x) = 4x^{3}$ en de noemer is $g^{2} + 1$.`,
      primitieve: r`Een primitieve is $F(x) = \arctan\left(x^{4}\right)$.`,
      invullen: r`Vul de grenzen in: $\big[\arctan\left(x^{4}\right)\big]_{0}^{1} = \arctan(1) - \arctan(0) = \tfrac{1}{4}\pi - 0 = \tfrac{1}{4}\pi$.`,
    }),
  }),

  // ── K.3 B herschrijven ────────────────────────────────────────────────────
  extra('k3b_herschrijven', 'k3b-h-7', 2, 7, {
    latex: r`Primitiveer: $f(x) = \dfrac{4}{x^{2} + 4}$`,
    antwoordLatex: r`F(x) = 2\arctan\left(\tfrac{1}{2}x\right) + c`,
    antwoord: '2 arctan(1/2 x) + c',
    alts: ['2 atan(x/2) + c', '2 arctan(x/2) + c'],
    integrand: '4 / (x^2 + 4)',
    primitieve: '2 * atan(x / 2)',
    steps: primitiveren({
      schil: SCHIL_HERSCHRIJVEN,
      herschrijven: r`Deel teller en noemer door $4$: $f(x) = \dfrac{1}{\tfrac{1}{4}x^{2} + 1} = \dfrac{1}{\left(\tfrac{1}{2}x\right)^{2} + 1}$. Kern $\tfrac{1}{2}x$, dus $a = \tfrac{1}{2}$.`,
      regel: `${REGEL_AXB} Delen door $\\tfrac{1}{2}$ is vermenigvuldigen met $2$, dus er komt $2\\arctan\\left(\\tfrac{1}{2}x\\right)$.`,
      antwoord: r`Dus $F(x) = 2\arctan\left(\tfrac{1}{2}x\right) + c$.`,
    }),
  }),
  extra('k3b_herschrijven', 'k3b-h-8', 3, 8, {
    latex: r`Primitiveer: $f(x) = \dfrac{x^{2} + 8}{x^{2} + 4}$`,
    antwoordLatex: r`F(x) = x + 2\arctan\left(\tfrac{1}{2}x\right) + c`,
    antwoord: 'x + 2 arctan(1/2 x) + c',
    alts: ['x + 2 atan(x/2) + c', 'x + 2 arctan(x/2) + c'],
    integrand: '(x^2 + 8) / (x^2 + 4)',
    primitieve: 'x + 2 * atan(x / 2)',
    steps: primitiveren({
      schil: SCHIL_HERSCHRIJVEN,
      herschrijven: r`Deel eerst de teller door de noemer: $x^{2} + 8 = (x^{2} + 4) + 4$, dus $f(x) = 1 + \dfrac{4}{x^{2} + 4}$. Daarna de tweede term naar de standaardvorm: $\dfrac{4}{x^{2} + 4} = \dfrac{1}{\left(\tfrac{1}{2}x\right)^{2} + 1}$.`,
      regel: r`De $1$ geeft $x$. De breuk heeft kern $\tfrac{1}{2}x$, dus delen door $\tfrac{1}{2}$ geeft $2\arctan\left(\tfrac{1}{2}x\right)$.`,
      antwoord: r`Dus $F(x) = x + 2\arctan\left(\tfrac{1}{2}x\right) + c$.`,
    }),
  }),

  // ── K.3 B kwadraatafsplitsen ──────────────────────────────────────────────
  extra('k3b_kwadraat', 'k3b-q-7', 2, 7, {
    latex: r`Primitiveer: $f(x) = \dfrac{1}{x^{2} + 6x + 10}$`,
    antwoordLatex: r`F(x) = \arctan(x + 3) + c`,
    antwoord: 'arctan(x + 3) + c',
    alts: ['atan(x + 3) + c', 'arctan(x+3) + c'],
    integrand: '1 / (x^2 + 6 * x + 10)',
    primitieve: 'atan(x + 3)',
    steps: primitiveren({
      schil: SCHIL_KWADRAAT,
      herschrijven: `${KWADRAATAFSPLITSEN} De helft van $6$ is $3$: $(x + 3)^{2} = x^{2} + 6x + 9$, dus $x^{2} + 6x + 10 = (x + 3)^{2} + 1$.`,
      regel: r`Er staat nu precies de standaardvorm met kern $x + 3$ en $a = 1$. Delen door $1$ verandert niets: $\arctan(x + 3)$.`,
      antwoord: r`Dus $F(x) = \arctan(x + 3) + c$.`,
    }),
  }),
  extra('k3b_kwadraat', 'k3b-q-8', 3, 8, {
    latex: r`Primitiveer: $f(x) = \dfrac{8}{x^{2} - 2x + 5}$`,
    antwoordLatex: r`F(x) = 4\arctan\left(\tfrac{1}{2}(x - 1)\right) + c`,
    antwoord: '4 arctan((x - 1)/2) + c',
    alts: ['4 atan((x - 1)/2) + c', '4 arctan(1/2 (x - 1)) + c'],
    integrand: '8 / (x^2 - 2 * x + 5)',
    primitieve: '4 * atan((x - 1) / 2)',
    steps: primitiveren({
      schil: SCHIL_KWADRAAT,
      herschrijven: `${KWADRAATAFSPLITSEN} De helft van $-2$ is $-1$: $(x - 1)^{2} = x^{2} - 2x + 1$, dus $x^{2} - 2x + 5 = (x - 1)^{2} + 4$. Haal de $4$ eruit: $(x - 1)^{2} + 4 = 4\\left(\\left(\\tfrac{1}{2}(x - 1)\\right)^{2} + 1\\right)$. De breuk wordt $\\dfrac{8}{4\\left(\\left(\\tfrac{1}{2}(x - 1)\\right)^{2} + 1\\right)} = \\dfrac{2}{\\left(\\tfrac{1}{2}(x - 1)\\right)^{2} + 1}$.`,
      regel: r`Kern $\tfrac{1}{2}(x - 1)$, dus $a = \tfrac{1}{2}$. De factor $2$ maal delen door $\tfrac{1}{2}$ geeft $2 \cdot 2 = 4$ ervoor.`,
      antwoord: r`Dus $F(x) = 4\arctan\left(\tfrac{1}{2}(x - 1)\right) + c$.`,
    }),
  }),

  // ── K.3 B bepaalde integralen ─────────────────────────────────────────────
  extra('k3b_bepaald_exact', 'k3b-b-7', 2, 7, {
    latex: r`Bereken exact: $\displaystyle\int_{0}^{3} \dfrac{1}{x^{2} + 9}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{12}\pi`,
    antwoord: '1/12 pi',
    alts: ['pi/12', '(1/12)pi', '1/12pi'],
    integrand: '1 / (x^2 + 9)',
    primitieve: 'atan(x / 3) / 3',
    grenzen: [0, 3],
    waarde: 'pi / 12',
    steps: bepaald({
      schil: SCHIL_HERSCHRIJVEN,
      herschrijven: r`Deel teller en noemer door $9$: $\dfrac{1}{x^{2} + 9} = \dfrac{\tfrac{1}{9}}{\left(\tfrac{1}{3}x\right)^{2} + 1}$. Kern $\tfrac{1}{3}x$, dus $a = \tfrac{1}{3}$.`,
      primitieve: r`Delen door $\tfrac{1}{3}$ is vermenigvuldigen met $3$, en $\tfrac{1}{9} \cdot 3 = \tfrac{1}{3}$. Een primitieve is $F(x) = \tfrac{1}{3}\arctan\left(\tfrac{1}{3}x\right)$.`,
      invullen: r`Bij $x = 3$ is de kern $1$ en bij $x = 0$ is de kern $0$: $\tfrac{1}{3}\arctan(1) - \tfrac{1}{3}\arctan(0) = \tfrac{1}{3} \cdot \tfrac{1}{4}\pi = \tfrac{1}{12}\pi$.`,
    }),
  }),
  extra('k3b_bepaald_exact', 'k3b-b-8', 3, 8, {
    latex: r`Bereken exact: $\displaystyle\int_{1}^{1 + \sqrt{3}} \dfrac{3}{x^{2} - 2x + 2}\,\mathrm{d}x$`,
    antwoordLatex: r`\pi`,
    antwoord: 'pi',
    alts: ['π', '1pi'],
    integrand: '3 / (x^2 - 2 * x + 2)',
    primitieve: '3 * atan(x - 1)',
    grenzen: [1, 1 + Math.sqrt(3)],
    waarde: 'pi',
    steps: bepaald({
      schil: SCHIL_KWADRAAT,
      herschrijven: `${KWADRAATAFSPLITSEN} $x^{2} - 2x + 2 = (x - 1)^{2} + 1$. Er staat dus $\\dfrac{3}{(x - 1)^{2} + 1}$, met kern $x - 1$ en $a = 1$.`,
      primitieve: r`De factor $3$ blijft ervoor staan: $F(x) = 3\arctan(x - 1)$.`,
      invullen: r`Bij $x = 1 + \sqrt{3}$ is de kern $\sqrt{3}$ en bij $x = 1$ is de kern $0$: $3\arctan\left(\sqrt{3}\right) - 3\arctan(0) = 3 \cdot \tfrac{1}{3}\pi = \pi$.`,
    }),
  }),

  // ── K.3 B oppervlakte ─────────────────────────────────────────────────────
  extra('k3b_oppervlakte', 'k3b-o-7', 2, 7, {
    latex: r`Gegeven is de functie $f(x) = \dfrac{18}{x^{2} + 6x + 18}$. Bereken exact het maximum van $f$.`,
    antwoordLatex: r`\text{maximum is } f(-3) = 2`,
    antwoord: '2',
    alts: ['f(-3) = 2', 'maximum is 2', '2 (bij x = -3)'],
    steps: [
      r`Er zit geen integraal in deze opgave, maar wel precies dezelfde eerste stap als bij het primitiveren: kwadraatafsplitsen in de noemer. Daarna zie je het antwoord zo staan.`,
      `${KWADRAATAFSPLITSEN} De helft van $6$ is $3$: $(x + 3)^{2} = x^{2} + 6x + 9$, dus $x^{2} + 6x + 18 = (x + 3)^{2} + 9$. Dus $f(x) = \\dfrac{18}{(x + 3)^{2} + 9}$.`,
      r`De teller staat vast, dus $f$ is het grootst waar de noemer het kleinst is. Een kwadraat is nooit negatief, dus $(x + 3)^{2} + 9$ is het kleinst als $(x + 3)^{2} = 0$, en dat is bij $x = -3$. De noemer is daar $9$.`,
      r`Dus het maximum is $f(-3) = \dfrac{18}{9} = 2$. Voor elke andere $x$ is de noemer groter dan $9$ en de breuk dus kleiner dan $2$.`,
    ],
  }),
  extra('k3b_oppervlakte', 'k3b-o-8', 3, 8, {
    latex: r`Het vlakdeel $V_p$ wordt ingesloten door de grafiek van $f(x) = \dfrac{4}{x^{2} + 4}$, de $x$-as en de lijnen $x = 0$ en $x = p$ met $p > 0$. Bereken exact de waarde van $p$ waarvoor $O(V_p) = \tfrac{1}{2}\pi$.`,
    antwoordLatex: r`p = 2`,
    antwoord: '2',
    alts: ['p = 2', 'p=2'],
    integrand: '4 / (x^2 + 4)',
    primitieve: '2 * atan(x / 2)',
    steps: oppervlakte({
      integraal: r`Deel 1: $O(V_p) = \displaystyle\int_{0}^{p} \dfrac{4}{x^{2} + 4}\,\mathrm{d}x$. Op $[0, p]$ is $f$ positief.`,
      herschrijven: r`$\dfrac{4}{x^{2} + 4} = \dfrac{1}{\left(\tfrac{1}{2}x\right)^{2} + 1}$, met kern $\tfrac{1}{2}x$ en $a = \tfrac{1}{2}$.`,
      primitieve: r`Deel 2: delen door $\tfrac{1}{2}$ geeft $F(x) = 2\arctan\left(\tfrac{1}{2}x\right)$. Omdat $\arctan(0) = 0$ is $O(V_p) = 2\arctan\left(\tfrac{1}{2}p\right)$.`,
      uitkomst: r`Deel 3: $2\arctan\left(\tfrac{1}{2}p\right) = \tfrac{1}{2}\pi$ geeft $\arctan\left(\tfrac{1}{2}p\right) = \tfrac{1}{4}\pi$. Dus $\tfrac{1}{2}p = \tan\left(\tfrac{1}{4}\pi\right) = 1$ en $p = 2$.`,
    }),
  }),

  // ── K.3 C exacte waarden ──────────────────────────────────────────────────
  extra('k3c_waarden', 'k3c-w-4', 1, 4, {
    latex: r`Bereken exact: $\arcsin\left(\tfrac{1}{2}\right)$`,
    antwoordLatex: r`\tfrac{1}{6}\pi`,
    antwoord: '1/6 pi',
    alts: ['pi/6', '(1/6)pi', '1/6pi'],
    steps: waardeArcsin({
      vraag: r`Zoek de hoek in de tabel waarvan de sinus $\tfrac{1}{2}$ is.`,
      tabel: TABEL_SIN,
      antwoord: r`$\sin\left(\tfrac{1}{6}\pi\right) = \tfrac{1}{2}$ en $\tfrac{1}{6}\pi$ ligt tussen $-\tfrac{1}{2}\pi$ en $\tfrac{1}{2}\pi$, dus $\arcsin\left(\tfrac{1}{2}\right) = \tfrac{1}{6}\pi$.`,
    }),
  }),
  extra('k3c_waarden', 'k3c-w-5', 1, 5, {
    latex: r`Bereken exact: $\arcsin(-1)$`,
    antwoordLatex: r`-\tfrac{1}{2}\pi`,
    antwoord: '-1/2 pi',
    alts: ['-pi/2', '-(1/2)pi', '-1/2pi'],
    steps: waardeArcsin({
      vraag: r`Zoek de hoek waarvan de sinus $-1$ is. Omdat $\sin$ oneven is, hoort bij $-1$ de tegenovergestelde hoek van $\arcsin(1)$.`,
      tabel: `${TABEL_SIN} $\\arcsin(1) = \\tfrac{1}{2}\\pi$.`,
      antwoord: r`Dus $\arcsin(-1) = -\tfrac{1}{2}\pi$. Dat is meteen de onderkant van het bereik van $\arcsin$.`,
    }),
  }),
  extra('k3c_waarden', 'k3c-w-6', 2, 6, {
    latex: r`Bereken exact: $\arcsin\left(\tfrac{1}{2}\sqrt{2}\right) + \arcsin\left(-\tfrac{1}{2}\right)$`,
    antwoordLatex: r`\tfrac{1}{12}\pi`,
    antwoord: '1/12 pi',
    alts: ['pi/12', '(1/12)pi', '1/12pi'],
    steps: waardeArcsin({
      vraag: r`Twee hoeken apart opzoeken en daarna optellen.`,
      tabel: `${TABEL_SIN} $\\arcsin\\left(\\tfrac{1}{2}\\sqrt{2}\\right) = \\tfrac{1}{4}\\pi$ en $\\arcsin\\left(-\\tfrac{1}{2}\\right) = -\\tfrac{1}{6}\\pi$.`,
      antwoord: r`Samen: $\tfrac{1}{4}\pi - \tfrac{1}{6}\pi = \tfrac{3}{12}\pi - \tfrac{2}{12}\pi = \tfrac{1}{12}\pi$.`,
    }),
  }),
  extra('k3c_waarden', 'k3c-w-7', 2, 7, {
    latex: r`Bereken exact: $2\arcsin\left(\tfrac{1}{2}\sqrt{3}\right) - \arcsin(1)$`,
    antwoordLatex: r`\tfrac{1}{6}\pi`,
    antwoord: '1/6 pi',
    alts: ['pi/6', '(1/6)pi', '1/6pi'],
    steps: waardeArcsin({
      vraag: r`Eerst de twee hoeken uit de tabel, daarna het verschil.`,
      tabel: `${TABEL_SIN} $\\arcsin\\left(\\tfrac{1}{2}\\sqrt{3}\\right) = \\tfrac{1}{3}\\pi$ en $\\arcsin(1) = \\tfrac{1}{2}\\pi$.`,
      antwoord: r`$2 \cdot \tfrac{1}{3}\pi - \tfrac{1}{2}\pi = \tfrac{2}{3}\pi - \tfrac{1}{2}\pi = \tfrac{4}{6}\pi - \tfrac{3}{6}\pi = \tfrac{1}{6}\pi$.`,
    }),
  }),
  extra('k3c_waarden', 'k3c-w-8', 3, 8, {
    latex: r`Bereken exact: $\arcsin\left(\sin\left(\tfrac{7}{6}\pi\right)\right)$`,
    antwoordLatex: r`-\tfrac{1}{6}\pi`,
    antwoord: '-1/6 pi',
    alts: ['-pi/6', '-(1/6)pi', '-1/6pi'],
    steps: waardeArcsin({
      vraag: r`Eerst de sinus uitrekenen. De hoek $\tfrac{7}{6}\pi$ ligt buiten het bereik van $\arcsin$, dus het antwoord is niet vanzelf $\tfrac{7}{6}\pi$.`,
      tabel: `${TABEL_SIN} $\\sin\\left(\\tfrac{7}{6}\\pi\\right) = \\sin\\left(\\pi + \\tfrac{1}{6}\\pi\\right) = -\\sin\\left(\\tfrac{1}{6}\\pi\\right) = -\\tfrac{1}{2}$.`,
      antwoord: r`$\arcsin\left(-\tfrac{1}{2}\right) = -\tfrac{1}{6}\pi$, want die hoek ligt wél tussen $-\tfrac{1}{2}\pi$ en $\tfrac{1}{2}\pi$.`,
    }),
  }),

  // ── K.3 C vergelijkingen ──────────────────────────────────────────────────
  extra('k3c_vergelijking', 'k3c-v-5', 1, 5, {
    latex: r`Los exact op: $\arcsin(x) = \tfrac{1}{4}\pi$`,
    antwoordLatex: r`x = \tfrac{1}{2}\sqrt{2}`,
    antwoord: '1/2 sqrt(2)',
    alts: ['x = 1/2 sqrt(2)', 'sqrt(2)/2', 'x = sqrt(2)/2', '(1/2)sqrt(2)'],
    steps: vergelijking(DEEL3_ARCSIN, {
      schil: r`Buitenste schil: $\arcsin(x)$ is gelijk aan een hoek uit de tabel → sinus nemen.`,
      omschrijven: r`$\tfrac{1}{4}\pi$ ligt tussen $-\tfrac{1}{2}\pi$ en $\tfrac{1}{2}\pi$, dus er is een oplossing.`,
      oplossen: r`$x = \sin\left(\tfrac{1}{4}\pi\right) = \tfrac{1}{2}\sqrt{2}$.`,
      antwoord: r`Dus $x = \tfrac{1}{2}\sqrt{2}$. Die waarde ligt tussen $-1$ en $1$, dus hij mag in $\arcsin$.`,
    }),
  }),
  extra('k3c_vergelijking', 'k3c-v-6', 2, 6, {
    latex: r`Los exact op: $\arcsin(2x) = -\tfrac{1}{6}\pi$`,
    antwoordLatex: r`x = -\tfrac{1}{4}`,
    antwoord: '-1/4',
    alts: ['x = -1/4', '-0,25', '-0.25', 'x = -0,25'],
    steps: vergelijking(DEEL3_ARCSIN, {
      schil: r`Buitenste schil: $\arcsin$ van een kern is gelijk aan een hoek → eerst sinus nemen, daarna de kern vrijmaken.`,
      omschrijven: r`$-\tfrac{1}{6}\pi$ ligt in het bereik van $\arcsin$. Sinus nemen geeft $2x = \sin\left(-\tfrac{1}{6}\pi\right) = -\tfrac{1}{2}$.`,
      oplossen: r`Dus $x = -\tfrac{1}{4}$.`,
      antwoord: r`Controle: $2x = -\tfrac{1}{2}$ ligt tussen $-1$ en $1$, en $\arcsin\left(-\tfrac{1}{2}\right) = -\tfrac{1}{6}\pi$.`,
    }),
  }),
  extra('k3c_vergelijking', 'k3c-v-7', 2, 7, {
    latex: r`Los op: $\arcsin(x) = \pi$`,
    antwoordLatex: r`\text{geen oplossing}`,
    antwoord: 'geen oplossing',
    alts: ['er is geen oplossing', 'geen', 'geen oplossingen'],
    steps: vergelijking(DEEL3_ARCSIN, {
      schil: r`Buitenste schil: $\arcsin$ van iets is gelijk aan een hoek → kijk eerst of die hoek überhaupt kan.`,
      omschrijven: r`Het bereik van $\arcsin$ is $\left[-\tfrac{1}{2}\pi, \tfrac{1}{2}\pi\right]$.`,
      oplossen: r`$\pi$ is groter dan $\tfrac{1}{2}\pi$, dus die waarde wordt nooit bereikt.`,
      antwoord: r`De vergelijking heeft geen oplossing. Schrijf niet $x = \sin(\pi) = 0$ op: $\arcsin(0)$ is $0$ en niet $\pi$.`,
    }),
  }),
  extra('k3c_vergelijking', 'k3c-v-8', 3, 8, {
    latex: r`Los op: $\arcsin(x) = 0{,}8$. Rond af op drie decimalen.`,
    antwoordLatex: r`x \approx 0{,}717`,
    antwoord: '0,717',
    alts: ['0.717', 'x = 0,717', 'x = 0.717', 'x ≈ 0,717', 'x ≈ 0.717'],
    steps: vergelijking(DEEL3_ARCSIN, {
      schil: r`Buitenste schil: $\arcsin(x)$ is gelijk aan een getal in radialen → sinus nemen. $0{,}8$ staat niet in de tabel.`,
      omschrijven: r`Kan het? $0{,}8 < \tfrac{1}{2}\pi \approx 1{,}571$, dus $0{,}8$ ligt in het bereik en er is een oplossing.`,
      oplossen: r`$x = \sin(0{,}8)$.`,
      antwoord: r`Met de rekenmachine (in radialen!): $\sin(0{,}8) \approx 0{,}7174$, afgerond op drie decimalen $x \approx 0{,}717$. Die waarde ligt tussen $-1$ en $1$.`,
    }),
  }),

  // ── K.3 C standaardvorm ───────────────────────────────────────────────────
  extra('k3c_standaard', 'k3c-s-6', 2, 6, {
    latex: r`Primitiveer: $f(x) = \dfrac{1}{\sqrt{1 - 9x^{2}}}$`,
    antwoordLatex: r`F(x) = \tfrac{1}{3}\arcsin(3x) + c`,
    antwoord: '1/3 arcsin(3x) + c',
    alts: ['arcsin(3x)/3 + c', '(1/3) arcsin(3x) + c'],
    integrand: '1 / sqrt(1 - 9 * x^2)',
    primitieve: 'asin(3 * x) / 3',
    domein: [-0.3, 0.3],
    steps: primitiveren({
      schil: SCHIL_ARCSIN,
      herschrijven: r`$9x^{2} = (3x)^{2}$, dus er staat $\dfrac{1}{\sqrt{1 - (3x)^{2}}}$: kern $3x$ met $a = 3$.`,
      regel: `${REGEL_AXB} Delen door $3$ zet er $\\tfrac{1}{3}$ voor.`,
      antwoord: r`Dus $F(x) = \tfrac{1}{3}\arcsin(3x) + c$. Dit bestaat alleen waar $-1 \le 3x \le 1$, dus voor $-\tfrac{1}{3} \le x \le \tfrac{1}{3}$.`,
    }),
  }),
  extra('k3c_standaard', 'k3c-s-7', 2, 7, {
    latex: r`Primitiveer: $f(x) = \dfrac{4}{\sqrt{16 - x^{2}}}$`,
    antwoordLatex: r`F(x) = 4\arcsin\left(\tfrac{1}{4}x\right) + c`,
    antwoord: '4 arcsin(1/4 x) + c',
    alts: ['4 arcsin(x/4) + c', '4 asin(x/4) + c'],
    integrand: '4 / sqrt(16 - x^2)',
    primitieve: '4 * asin(x / 4)',
    domein: [-3.5, 3.5],
    steps: primitiveren({
      schil: SCHIL_WORTEL,
      herschrijven: r`Haal de $4$ buiten de wortel: $\sqrt{16 - x^{2}} = 4\sqrt{1 - \left(\tfrac{1}{4}x\right)^{2}}$. De integrand wordt $\dfrac{1}{\sqrt{1 - \left(\frac{1}{4}x\right)^{2}}}$, met kern $\tfrac{1}{4}x$ en $a = \tfrac{1}{4}$.`,
      regel: r`Delen door $\tfrac{1}{4}$ is vermenigvuldigen met $4$, dus $F(x) = 4\arcsin\left(\tfrac{1}{4}x\right)$.`,
      antwoord: r`Dus $F(x) = 4\arcsin\left(\tfrac{1}{4}x\right) + c$. Dit bestaat alleen voor $-4 < x < 4$.`,
    }),
  }),
  extra('k3c_standaard', 'k3c-s-8', 3, 8, {
    latex: r`Primitiveer: $f(x) = \dfrac{1}{\sqrt{6x - x^{2} - 5}}$`,
    antwoordLatex: r`F(x) = \arcsin\left(\tfrac{1}{2}(x - 3)\right) + c`,
    antwoord: 'arcsin((x - 3)/2) + c',
    alts: ['asin((x - 3)/2) + c', 'arcsin(1/2 (x - 3)) + c'],
    integrand: '1 / sqrt(6 * x - x^2 - 5)',
    primitieve: 'asin((x - 3) / 2)',
    domein: [1.2, 4.8],
    steps: primitiveren({
      schil: r`Buitenste schil: onder de wortel staat een kwadratische vorm met een min voor $x^{2}$ → eerst kwadraatafsplitsen, daarna de standaardvorm.`,
      herschrijven: r`$6x - x^{2} - 5 = 4 - (x^{2} - 6x + 9) = 4 - (x - 3)^{2}$. Haal de $2$ buiten de wortel: $\sqrt{4 - (x - 3)^{2}} = 2\sqrt{1 - \left(\tfrac{1}{2}(x - 3)\right)^{2}}$. De integrand wordt $\dfrac{\tfrac{1}{2}}{\sqrt{1 - \left(\frac{1}{2}(x - 3)\right)^{2}}}$, met kern $\tfrac{1}{2}(x - 3)$ en $a = \tfrac{1}{2}$.`,
      regel: r`Delen door $\tfrac{1}{2}$ is vermenigvuldigen met $2$. De factor $\tfrac{1}{2}$ ervoor valt daartegen weg, dus er blijft $\arcsin\left(\tfrac{1}{2}(x - 3)\right)$ over.`,
      antwoord: r`Dus $F(x) = \arcsin\left(\tfrac{1}{2}(x - 3)\right) + c$. Dit bestaat alleen voor $1 < x < 5$.`,
    }),
  }),

  // ── K.3 C kern ────────────────────────────────────────────────────────────
  extra('k3c_kern', 'k3c-k-5', 1, 5, {
    latex: r`Primitiveer: $f(x) = \dfrac{3x^{2}}{\sqrt{1 - x^{6}}}$`,
    antwoordLatex: r`F(x) = \arcsin\left(x^{3}\right) + c`,
    antwoord: 'arcsin(x^3) + c',
    alts: ['asin(x^3) + c', 'arcsin(x^3)+c'],
    integrand: '3 * x^2 / sqrt(1 - x^6)',
    primitieve: 'asin(x^3)',
    domein: [-0.9, 0.9],
    steps: primitiveren({
      schil: SCHIL_SUBSTITUTIE_ARCSIN,
      herschrijven: r`Neem $g(x) = x^{3}$. Dan is $g'(x) = 3x^{2}$, en die staat in de teller. Onder de wortel staat $1 - (x^{3})^{2} = 1 - g^{2}$.`,
      regel: r`Naar $g$ staat er $\int \dfrac{1}{\sqrt{1 - g^{2}}}\,\mathrm{d}g = \arcsin(g)$.`,
      antwoord: r`Schrijf $g$ terug: $F(x) = \arcsin\left(x^{3}\right) + c$.`,
    }),
  }),
  extra('k3c_kern', 'k3c-k-6', 2, 6, {
    latex: r`Primitiveer: $f(x) = \dfrac{2\arcsin(x)}{\sqrt{1 - x^{2}}}$`,
    antwoordLatex: r`F(x) = \arcsin^{2}(x) + c`,
    antwoord: 'arcsin(x)^2 + c',
    alts: ['asin(x)^2 + c', '(arcsin(x))^2 + c', 'arcsin^2(x) + c'],
    integrand: '2 * asin(x) / sqrt(1 - x^2)',
    primitieve: 'asin(x)^2',
    domein: [-0.9, 0.9],
    steps: primitiveren({
      schil: SCHIL_SUBSTITUTIE_ARCSIN,
      herschrijven: r`Neem $g(x) = \arcsin(x)$. Dan is $g'(x) = \dfrac{1}{\sqrt{1 - x^{2}}}$. In de teller staat $2\arcsin(x)$ keer die afgeleide, dus $f(x) = 2g \cdot g'$.`,
      regel: r`$\int 2g \cdot g'\,\mathrm{d}x = g^{2}$.`,
      antwoord: r`Schrijf $g$ terug: $F(x) = \arcsin^{2}(x) + c$.`,
    }),
  }),
  extra('k3c_kern', 'k3c-k-7', 3, 7, {
    latex: r`Primitiveer: $f(x) = \dfrac{2\mathrm{e}^{2x}}{\sqrt{1 - \mathrm{e}^{4x}}}$`,
    antwoordLatex: r`F(x) = \arcsin\left(\mathrm{e}^{2x}\right) + c`,
    antwoord: 'arcsin(e^(2x)) + c',
    alts: ['asin(e^(2x)) + c', 'arcsin(e^{2x}) + c'],
    integrand: '2 * e^(2 * x) / sqrt(1 - e^(4 * x))',
    primitieve: 'asin(e^(2 * x))',
    domein: [-2, -0.2],
    steps: primitiveren({
      schil: SCHIL_SUBSTITUTIE_ARCSIN,
      herschrijven: r`Neem $g(x) = \mathrm{e}^{2x}$. Dan is $g'(x) = 2\mathrm{e}^{2x}$, en die staat in de teller. Onder de wortel staat $1 - \mathrm{e}^{4x} = 1 - g^{2}$.`,
      regel: r`Naar $g$ staat er $\int \dfrac{1}{\sqrt{1 - g^{2}}}\,\mathrm{d}g = \arcsin(g)$.`,
      antwoord: r`Schrijf $g$ terug: $F(x) = \arcsin\left(\mathrm{e}^{2x}\right) + c$. Dit bestaat alleen waar $-1 \le \mathrm{e}^{2x} \le 1$. Omdat een e-macht positief is, blijft $x \le 0$.`,
    }),
  }),
  extra('k3c_kern', 'k3c-k-8', 3, 8, {
    latex: r`Primitiveer: $f(x) = \dfrac{1}{x\sqrt{9 - \ln^{2}(x)}}$`,
    antwoordLatex: r`F(x) = \arcsin\left(\tfrac{1}{3}\ln(x)\right) + c`,
    antwoord: 'arcsin(1/3 ln(x)) + c',
    alts: ['asin(ln(x)/3) + c', 'arcsin(ln(x)/3) + c'],
    integrand: '1 / (x * sqrt(9 - ln(x)^2))',
    primitieve: 'asin(ln(x) / 3)',
    domein: [0.2, 4],
    steps: primitiveren({
      schil: r`Buitenste schil: onder de wortel staat $\ln^{2}(x)$ en de afgeleide van $\ln(x)$ is $\tfrac{1}{x}$, en die staat als factor vooraan → substitutie. De wortel is nog niet van de vorm $\sqrt{1 - g^{2}}$, dus eerst de $3$ eruit halen.`,
      herschrijven: r`$\sqrt{9 - \ln^{2}(x)} = 3\sqrt{1 - \left(\tfrac{1}{3}\ln(x)\right)^{2}}$. Neem $g(x) = \tfrac{1}{3}\ln(x)$, dan is $g'(x) = \dfrac{1}{3x}$. Er staat dus $f(x) = \dfrac{g'}{\sqrt{1 - g^{2}}}$.`,
      regel: r`Dat is de standaardvorm naar $g$: $\int \dfrac{g'}{\sqrt{1 - g^{2}}}\,\mathrm{d}x = \arcsin(g)$.`,
      antwoord: r`Schrijf $g$ terug: $F(x) = \arcsin\left(\tfrac{1}{3}\ln(x)\right) + c$. Dit bestaat alleen waar $-3 \le \ln(x) \le 3$, dus voor $\mathrm{e}^{-3} \le x \le \mathrm{e}^{3}$.`,
    }),
  }),

  // ── K.3 C partieel ────────────────────────────────────────────────────────
  extra('k3c_partieel', 'k3c-p-4', 1, 4, {
    latex: r`Primitiveer met behulp van partieel integreren: $f(x) = \arcsin(x)$`,
    antwoordLatex: r`F(x) = x\arcsin(x) + \sqrt{1 - x^{2}} + c`,
    antwoord: 'x arcsin(x) + sqrt(1 - x^2) + c',
    alts: ['x asin(x) + sqrt(1 - x^2) + c', 'x*arcsin(x) + sqrt(1-x^2) + c'],
    integrand: 'asin(x)',
    primitieve: 'x * asin(x) + sqrt(1 - x^2)',
    domein: [-0.9, 0.9],
    steps: partieel({
      keuze: r`Er staat maar één factor, dus maak er zelf een product van: $h'(x) = 1$, dus $h(x) = x$, en $g(x) = \arcsin(x)$. Dan is $g'(x) = \dfrac{1}{\sqrt{1 - x^{2}}}$.`,
      invullen: r`Dat geeft $\int \arcsin(x)\,\mathrm{d}x = x\arcsin(x) - \int \dfrac{x}{\sqrt{1 - x^{2}}}\,\mathrm{d}x$.`,
      antwoord: r`Die laatste integraal is $-\sqrt{1 - x^{2}}$, want $\left[\sqrt{1 - x^{2}}\right]' = \dfrac{-x}{\sqrt{1 - x^{2}}}$. Met het minteken ervoor wordt het een plus: $F(x) = x\arcsin(x) + \sqrt{1 - x^{2}} + c$. ${CONTROLE}`,
    }),
  }),
  extra('k3c_partieel', 'k3c-p-5', 2, 5, {
    latex: r`Primitiveer met behulp van partieel integreren: $f(x) = \arctan(x)$`,
    antwoordLatex: r`F(x) = x\arctan(x) - \tfrac{1}{2}\ln\left(x^{2} + 1\right) + c`,
    antwoord: 'x arctan(x) - 1/2 ln(x^2 + 1) + c',
    alts: ['x atan(x) - 1/2 ln(x^2 + 1) + c', 'x arctan(x) - ln(x^2 + 1)/2 + c'],
    integrand: 'atan(x)',
    primitieve: 'x * atan(x) - 1/2 * ln(x^2 + 1)',
    steps: partieel({
      keuze: r`Weer één factor: $h'(x) = 1$ en $h(x) = x$, met $g(x) = \arctan(x)$. Dan is $g'(x) = \dfrac{1}{x^{2} + 1}$.`,
      invullen: r`Dat geeft $\int \arctan(x)\,\mathrm{d}x = x\arctan(x) - \int \dfrac{x}{x^{2} + 1}\,\mathrm{d}x$.`,
      antwoord: r`$\left[x^{2} + 1\right]' = 2x$, en in de teller staat de helft daarvan. Dus $\int \dfrac{x}{x^{2} + 1}\,\mathrm{d}x = \tfrac{1}{2}\ln\left(x^{2} + 1\right)$. Samen: $F(x) = x\arctan(x) - \tfrac{1}{2}\ln\left(x^{2} + 1\right) + c$. ${CONTROLE}`,
    }),
  }),
  extra('k3c_partieel', 'k3c-p-6', 2, 6, {
    latex: r`Primitiveer met behulp van partieel integreren: $f(x) = \arcsin(3x)$`,
    antwoordLatex: r`F(x) = x\arcsin(3x) + \tfrac{1}{3}\sqrt{1 - 9x^{2}} + c`,
    antwoord: 'x arcsin(3x) + 1/3 sqrt(1 - 9x^2) + c',
    alts: ['x asin(3x) + sqrt(1 - 9x^2)/3 + c', 'x*arcsin(3x) + 1/3*sqrt(1-9x^2) + c'],
    integrand: 'asin(3 * x)',
    primitieve: 'x * asin(3 * x) + 1/3 * sqrt(1 - 9 * x^2)',
    domein: [-0.3, 0.3],
    steps: partieel({
      keuze: r`$h'(x) = 1$, dus $h(x) = x$, en $g(x) = \arcsin(3x)$. Met de kettingregel is $g'(x) = \dfrac{3}{\sqrt{1 - 9x^{2}}}$.`,
      invullen: r`Dat geeft $\int \arcsin(3x)\,\mathrm{d}x = x\arcsin(3x) - \int \dfrac{3x}{\sqrt{1 - 9x^{2}}}\,\mathrm{d}x$.`,
      antwoord: r`$\left[\sqrt{1 - 9x^{2}}\right]' = \dfrac{-9x}{\sqrt{1 - 9x^{2}}}$, en de integrand van de rest is daar $-\tfrac{1}{3}$ van. De rest-integraal is dus $-\tfrac{1}{3}\sqrt{1 - 9x^{2}}$. Met het minteken ervoor: $F(x) = x\arcsin(3x) + \tfrac{1}{3}\sqrt{1 - 9x^{2}} + c$. ${CONTROLE}`,
    }),
  }),
  extra('k3c_partieel', 'k3c-p-7', 3, 7, {
    latex: r`Primitiveer met behulp van partieel integreren: $f(x) = \arctan(2x)$`,
    antwoordLatex: r`F(x) = x\arctan(2x) - \tfrac{1}{4}\ln\left(4x^{2} + 1\right) + c`,
    antwoord: 'x arctan(2x) - 1/4 ln(4x^2 + 1) + c',
    alts: ['x atan(2x) - ln(4x^2 + 1)/4 + c', 'x*arctan(2x) - 1/4*ln(4x^2+1) + c'],
    integrand: 'atan(2 * x)',
    primitieve: 'x * atan(2 * x) - 1/4 * ln(4 * x^2 + 1)',
    steps: partieel({
      keuze: r`$h'(x) = 1$ en $h(x) = x$, met $g(x) = \arctan(2x)$. Dan is $g'(x) = \dfrac{2}{4x^{2} + 1}$.`,
      invullen: r`Dat geeft $\int \arctan(2x)\,\mathrm{d}x = x\arctan(2x) - \int \dfrac{2x}{4x^{2} + 1}\,\mathrm{d}x$.`,
      antwoord: r`$\left[4x^{2} + 1\right]' = 8x$, en $2x$ is daar $\tfrac{1}{4}$ van. Dus de rest is $\tfrac{1}{4}\ln\left(4x^{2} + 1\right)$. Samen: $F(x) = x\arctan(2x) - \tfrac{1}{4}\ln\left(4x^{2} + 1\right) + c$. ${CONTROLE}`,
    }),
  }),
  extra('k3c_partieel', 'k3c-p-8', 3, 8, {
    latex: r`Bereken exact: $\displaystyle\int_{0}^{\frac{1}{2}} \arcsin(2x)\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{4}\pi - \tfrac{1}{2}`,
    antwoord: '1/4 pi - 1/2',
    alts: ['pi/4 - 1/2', '(1/4)pi - 0,5', 'pi/4 - 0.5', '-1/2 + 1/4 pi'],
    integrand: 'asin(2 * x)',
    primitieve: 'x * asin(2 * x) + 1/2 * sqrt(1 - 4 * x^2)',
    domein: [-0.4, 0.4],
    grenzen: [0, 0.5],
    waarde: 'pi / 4 - 1/2',
    steps: [
      `${DEEL2_BEPAALD} ${SCHIL_PARTIEEL}`,
      r`$h'(x) = 1$, dus $h(x) = x$, en $g(x) = \arcsin(2x)$ met $g'(x) = \dfrac{2}{\sqrt{1 - 4x^{2}}}$.`,
      r`Vul de regel in: ${REGEL_PARTIEEL}. Dat geeft $\int \arcsin(2x)\,\mathrm{d}x = x\arcsin(2x) - \int \dfrac{2x}{\sqrt{1 - 4x^{2}}}\,\mathrm{d}x$. Die laatste integraal is $-\tfrac{1}{2}\sqrt{1 - 4x^{2}}$, want $\left[\sqrt{1 - 4x^{2}}\right]' = \dfrac{-4x}{\sqrt{1 - 4x^{2}}}$. Dus $F(x) = x\arcsin(2x) + \tfrac{1}{2}\sqrt{1 - 4x^{2}}$.`,
      r`Vul de grenzen in: $\left[x\arcsin(2x) + \tfrac{1}{2}\sqrt{1 - 4x^{2}}\right]_{0}^{\frac{1}{2}} = \left(\tfrac{1}{2} \cdot \tfrac{1}{2}\pi + 0\right) - \left(0 + \tfrac{1}{2}\right) = \tfrac{1}{4}\pi - \tfrac{1}{2}$.`,
    ],
  }),

  // ── K.3 C bepaalde integralen ─────────────────────────────────────────────
  extra('k3c_bepaald_exact', 'k3c-b-5', 1, 5, {
    latex: r`Bereken exact: $\displaystyle\int_{0}^{\frac{1}{2}} \dfrac{1}{\sqrt{1 - x^{2}}}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{6}\pi`,
    antwoord: '1/6 pi',
    alts: ['pi/6', '(1/6)pi', '1/6pi'],
    integrand: '1 / sqrt(1 - x^2)',
    primitieve: 'asin(x)',
    domein: [-0.9, 0.9],
    grenzen: [0, 0.5],
    waarde: 'pi / 6',
    steps: bepaald({
      schil: SCHIL_ARCSIN,
      herschrijven: r`Er staat al de standaardvorm, met kern $x$ en $a = 1$.`,
      primitieve: r`Een primitieve is $F(x) = \arcsin(x)$.`,
      invullen: r`$\big[\arcsin(x)\big]_{0}^{\frac{1}{2}} = \arcsin\left(\tfrac{1}{2}\right) - \arcsin(0) = \tfrac{1}{6}\pi - 0 = \tfrac{1}{6}\pi$.`,
    }),
  }),
  extra('k3c_bepaald_exact', 'k3c-b-6', 2, 6, {
    latex: r`Bereken exact: $\displaystyle\int_{0}^{\frac{1}{2}} \dfrac{2}{\sqrt{1 - 4x^{2}}}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{2}\pi`,
    antwoord: '1/2 pi',
    alts: ['pi/2', '(1/2)pi', '1/2pi'],
    integrand: '2 / sqrt(1 - 4 * x^2)',
    primitieve: 'asin(2 * x)',
    domein: [-0.4, 0.4],
    grenzen: [0, 0.5],
    waarde: 'pi / 2',
    steps: bepaald({
      schil: SCHIL_ARCSIN,
      herschrijven: r`$4x^{2} = (2x)^{2}$, dus $\dfrac{2}{\sqrt{1 - (2x)^{2}}}$: kern $2x$ met $a = 2$, en er staat al een factor $2$ voor.`,
      primitieve: r`Delen door $a = 2$ valt tegen die factor $2$ weg. Een primitieve is $F(x) = \arcsin(2x)$.`,
      invullen: r`Bij $x = \tfrac{1}{2}$ is de kern $1$ en bij $x = 0$ is de kern $0$: $\arcsin(1) - \arcsin(0) = \tfrac{1}{2}\pi$.`,
    }),
  }),
  extra('k3c_bepaald_exact', 'k3c-b-7', 2, 7, {
    latex: r`Bereken exact: $\displaystyle\int_{0}^{3} \dfrac{1}{\sqrt{9 - x^{2}}}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{2}\pi`,
    antwoord: '1/2 pi',
    alts: ['pi/2', '(1/2)pi', '1/2pi'],
    integrand: '1 / sqrt(9 - x^2)',
    primitieve: 'asin(x / 3)',
    domein: [-2.5, 2.5],
    grenzen: [0, 3],
    waarde: 'pi / 2',
    steps: bepaald({
      schil: SCHIL_WORTEL,
      herschrijven: r`$\sqrt{9 - x^{2}} = 3\sqrt{1 - \left(\tfrac{1}{3}x\right)^{2}}$. De integrand wordt $\dfrac{\tfrac{1}{3}}{\sqrt{1 - \left(\frac{1}{3}x\right)^{2}}}$, met kern $\tfrac{1}{3}x$ en $a = \tfrac{1}{3}$.`,
      primitieve: r`Delen door $\tfrac{1}{3}$ is vermenigvuldigen met $3$. De factor $\tfrac{1}{3}$ valt daartegen weg: $F(x) = \arcsin\left(\tfrac{1}{3}x\right)$.`,
      invullen: r`Bij $x = 3$ is de kern $1$ en bij $x = 0$ is de kern $0$: $\arcsin(1) - \arcsin(0) = \tfrac{1}{2}\pi$.`,
    }),
  }),
  extra('k3c_bepaald_exact', 'k3c-b-8', 3, 8, {
    latex: r`Bereken exact: $\displaystyle\int_{0}^{1} \dfrac{2x}{\sqrt{4 - x^{4}}}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{6}\pi`,
    antwoord: '1/6 pi',
    alts: ['pi/6', '(1/6)pi', '1/6pi'],
    integrand: '2 * x / sqrt(4 - x^4)',
    primitieve: 'asin(x^2 / 2)',
    domein: [-1.2, 1.2],
    grenzen: [0, 1],
    waarde: 'pi / 6',
    steps: bepaald({
      schil: r`Buitenste schil: onder de wortel staat een getal min $x^{4}$, en in de teller staat een $x$ → eerst het getal buiten de wortel halen, daarna substitueren.`,
      herschrijven: r`$\sqrt{4 - x^{4}} = 2\sqrt{1 - \left(\tfrac{x^{2}}{2}\right)^{2}}$. Neem $g(x) = \tfrac{x^{2}}{2}$, dan is $g'(x) = x$. In de teller staat na het delen $\tfrac{1}{2} \cdot 2x = x$, en dat is precies $g'$.`,
      primitieve: r`Naar $g$ staat er $\int \dfrac{1}{\sqrt{1 - g^{2}}}\,\mathrm{d}g = \arcsin(g)$, dus $F(x) = \arcsin\left(\tfrac{x^{2}}{2}\right)$.`,
      invullen: r`Bij $x = 1$ is de kern $\tfrac{1}{2}$ en bij $x = 0$ is de kern $0$: $\arcsin\left(\tfrac{1}{2}\right) - 0 = \tfrac{1}{6}\pi$.`,
    }),
  }),

  // ── K.3 C oppervlakte ─────────────────────────────────────────────────────
  extra('k3c_oppervlakte', 'k3c-o-4', 1, 4, {
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{1}{\sqrt{1 - x^{2}}}$, de $x$-as en de lijnen $x = 0$ en $x = \tfrac{1}{2}$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\tfrac{1}{6}\pi`,
    antwoord: '1/6 pi',
    alts: ['pi/6', '(1/6)pi', '1/6pi'],
    integrand: '1 / sqrt(1 - x^2)',
    primitieve: 'asin(x)',
    domein: [-0.9, 0.9],
    grenzen: [0, 0.5],
    waarde: 'pi / 6',
    steps: oppervlakte({
      integraal: r`Deel 1: $O(V) = \displaystyle\int_{0}^{\frac{1}{2}} \dfrac{1}{\sqrt{1 - x^{2}}}\,\mathrm{d}x$. Op $\left[0, \tfrac{1}{2}\right]$ is $f$ positief.`,
      herschrijven: r`Er staat al de standaardvorm, met kern $x$.`,
      primitieve: r`Deel 2: $F(x) = \arcsin(x)$.`,
      uitkomst: r`Deel 3: $O(V) = \arcsin\left(\tfrac{1}{2}\right) - \arcsin(0) = \tfrac{1}{6}\pi$.`,
    }),
  }),
  extra('k3c_oppervlakte', 'k3c-o-5', 2, 5, {
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{2}{\sqrt{4 - x^{2}}}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\tfrac{1}{3}\pi`,
    antwoord: '1/3 pi',
    alts: ['pi/3', '(1/3)pi', '1/3pi'],
    integrand: '2 / sqrt(4 - x^2)',
    primitieve: '2 * asin(x / 2)',
    domein: [-1.8, 1.8],
    grenzen: [0, 1],
    waarde: 'pi / 3',
    steps: oppervlakte({
      integraal: r`Deel 1: $O(V) = \displaystyle\int_{0}^{1} \dfrac{2}{\sqrt{4 - x^{2}}}\,\mathrm{d}x$. Op $[0, 1]$ is $f$ positief.`,
      herschrijven: r`$\sqrt{4 - x^{2}} = 2\sqrt{1 - \left(\tfrac{1}{2}x\right)^{2}}$. De integrand wordt $\dfrac{1}{\sqrt{1 - \left(\frac{1}{2}x\right)^{2}}}$, met kern $\tfrac{1}{2}x$ en $a = \tfrac{1}{2}$.`,
      primitieve: r`Deel 2: delen door $\tfrac{1}{2}$ is vermenigvuldigen met $2$, dus $F(x) = 2\arcsin\left(\tfrac{1}{2}x\right)$.`,
      uitkomst: r`Deel 3: bij $x = 1$ is de kern $\tfrac{1}{2}$ en bij $x = 0$ is de kern $0$. $O(V) = 2\arcsin\left(\tfrac{1}{2}\right) = 2 \cdot \tfrac{1}{6}\pi = \tfrac{1}{3}\pi$.`,
    }),
  }),
  extra('k3c_oppervlakte', 'k3c-o-6', 2, 6, {
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{1}{\sqrt{4 - x^{2}}}$, de $x$-as en de lijnen $x = -2$ en $x = 2$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\pi`,
    antwoord: 'pi',
    alts: ['π', '1pi'],
    integrand: '1 / sqrt(4 - x^2)',
    primitieve: 'asin(x / 2)',
    domein: [-1.8, 1.8],
    grenzen: [-2, 2],
    waarde: 'pi',
    steps: oppervlakte({
      integraal: r`Deel 1: $O(V) = \displaystyle\int_{-2}^{2} \dfrac{1}{\sqrt{4 - x^{2}}}\,\mathrm{d}x$. Op $\langle-2, 2\rangle$ is $f$ positief.`,
      herschrijven: r`$\sqrt{4 - x^{2}} = 2\sqrt{1 - \left(\tfrac{1}{2}x\right)^{2}}$. De integrand wordt $\dfrac{\tfrac{1}{2}}{\sqrt{1 - \left(\frac{1}{2}x\right)^{2}}}$, met kern $\tfrac{1}{2}x$ en $a = \tfrac{1}{2}$.`,
      primitieve: r`Deel 2: de factor $\tfrac{1}{2}$ en het delen door $\tfrac{1}{2}$ vallen tegen elkaar weg. $F(x) = \arcsin\left(\tfrac{1}{2}x\right)$.`,
      uitkomst: r`Deel 3: $\arcsin(1) - \arcsin(-1) = \tfrac{1}{2}\pi - \left(-\tfrac{1}{2}\pi\right) = \pi$.`,
    }),
  }),
  extra('k3c_oppervlakte', 'k3c-o-7', 3, 7, {
    latex: r`Het vlakdeel $V_p$ wordt ingesloten door de grafiek van $f(x) = \dfrac{2}{\sqrt{1 - x^{2}}}$, de $x$-as en de lijnen $x = 0$ en $x = p$ met $0 < p < 1$. Bereken exact de waarde van $p$ waarvoor $O(V_p) = \tfrac{1}{3}\pi$.`,
    antwoordLatex: r`p = \tfrac{1}{2}`,
    antwoord: '1/2',
    alts: ['p = 1/2', '0,5', '0.5', 'p = 0,5', 'p = 0.5'],
    integrand: '2 / sqrt(1 - x^2)',
    primitieve: '2 * asin(x)',
    domein: [-0.9, 0.9],
    steps: oppervlakte({
      integraal: r`Deel 1: $O(V_p) = \displaystyle\int_{0}^{p} \dfrac{2}{\sqrt{1 - x^{2}}}\,\mathrm{d}x$. De voorwaarde $p < 1$ staat erbij omdat $f$ buiten $\langle-1, 1\rangle$ niet bestaat.`,
      herschrijven: r`Er staat twee keer de standaardvorm, met kern $x$ en $a = 1$.`,
      primitieve: r`Deel 2: $F(x) = 2\arcsin(x)$. Omdat $\arcsin(0) = 0$ is $O(V_p) = 2\arcsin(p)$.`,
      uitkomst: r`Deel 3: $2\arcsin(p) = \tfrac{1}{3}\pi$ geeft $\arcsin(p) = \tfrac{1}{6}\pi$. Dus $p = \sin\left(\tfrac{1}{6}\pi\right) = \tfrac{1}{2}$. Dat is inderdaad kleiner dan $1$.`,
    }),
  }),
  extra('k3c_oppervlakte', 'k3c-o-8', 3, 8, {
    latex: r`Het vlakdeel $V_p$ wordt ingesloten door de grafiek van $f(x) = \dfrac{6}{\sqrt{36 - x^{2}}}$, de $x$-as en de lijnen $x = 0$ en $x = p$ met $0 < p < 6$. Bereken exact de waarde van $p$ waarvoor $O(V_p) = \pi$.`,
    antwoordLatex: r`p = 3`,
    antwoord: '3',
    alts: ['p = 3', 'p=3'],
    integrand: '6 / sqrt(36 - x^2)',
    primitieve: '6 * asin(x / 6)',
    domein: [-5, 5],
    steps: oppervlakte({
      integraal: r`Deel 1: $O(V_p) = \displaystyle\int_{0}^{p} \dfrac{6}{\sqrt{36 - x^{2}}}\,\mathrm{d}x$. De voorwaarde $p < 6$ staat erbij omdat $f$ buiten $\langle-6, 6\rangle$ niet bestaat.`,
      herschrijven: r`$\sqrt{36 - x^{2}} = 6\sqrt{1 - \left(\tfrac{1}{6}x\right)^{2}}$. De integrand wordt $\dfrac{1}{\sqrt{1 - \left(\frac{1}{6}x\right)^{2}}}$, met kern $\tfrac{1}{6}x$ en $a = \tfrac{1}{6}$.`,
      primitieve: r`Deel 2: delen door $\tfrac{1}{6}$ is vermenigvuldigen met $6$, dus $F(x) = 6\arcsin\left(\tfrac{1}{6}x\right)$. Omdat $\arcsin(0) = 0$ is $O(V_p) = 6\arcsin\left(\tfrac{1}{6}p\right)$.`,
      uitkomst: r`Deel 3: $6\arcsin\left(\tfrac{1}{6}p\right) = \pi$ geeft $\arcsin\left(\tfrac{1}{6}p\right) = \tfrac{1}{6}\pi$. Dus $\tfrac{1}{6}p = \sin\left(\tfrac{1}{6}\pi\right) = \tfrac{1}{2}$ en $p = 3$. Dat is kleiner dan $6$.`,
    }),
  }),
]

const verwachtNieuw: Record<string, number> = {
  k3a_waarden: 2,
  k3a_vergelijking: 2,
  k3a_afgeleide: 2,
  k3a_standaard: 2,
  k3a_kern: 2,
  k3a_bepaald_exact: 2,
  k3b_herschrijven: 2,
  k3b_kwadraat: 2,
  k3b_bepaald_exact: 2,
  k3b_oppervlakte: 2,
  k3c_waarden: 5,
  k3c_vergelijking: 4,
  k3c_standaard: 3,
  k3c_kern: 4,
  k3c_partieel: 5,
  k3c_bepaald_exact: 4,
  k3c_oppervlakte: 5,
}

const clusters = [
  ['k3a_arctangens', 'k3a_waarden', 'Exacte waarden van arctan', 1],
  ['k3a_arctangens', 'k3a_vergelijking', 'Vergelijkingen met arctan oplossen', 2],
  ['k3a_primitiveren', 'k3a_afgeleide', 'De afgeleide van arctan', 1],
  ['k3a_primitiveren', 'k3a_standaard', 'De standaardvorm 1/(x² + 1) primitiveren', 2],
  ['k3a_primitiveren', 'k3a_kern', 'Een kern in de noemer', 3],
  ['k3a_bepaald', 'k3a_bepaald_exact', 'Bepaalde integralen met arctan', 1],
  ['k3b_primitiveren', 'k3b_herschrijven', 'Naar de vorm a/((bx)² + 1)', 1],
  ['k3b_primitiveren', 'k3b_kwadraat', 'Kwadraatafsplitsen in de noemer', 2],
  ['k3b_bepaald', 'k3b_bepaald_exact', 'Bepaalde integralen met arctan', 1],
  ['k3b_toepassing', 'k3b_oppervlakte', 'Oppervlakte en de waarde van p', 1],
  ['k3c_arcsinus', 'k3c_waarden', 'Exacte waarden van arcsin', 1],
  ['k3c_arcsinus', 'k3c_vergelijking', 'Vergelijkingen met arcsin oplossen', 2],
  ['k3c_primitiveren', 'k3c_standaard', 'De standaardvorm 1/√(1 - x²) primitiveren', 1],
  ['k3c_primitiveren', 'k3c_kern', 'Een kern onder de wortel', 2],
  ['k3c_primitiveren', 'k3c_partieel', 'arcsin en arctan partieel integreren', 3],
  ['k3c_bepaald', 'k3c_bepaald_exact', 'Bepaalde integralen met arcsin', 1],
  ['k3c_toepassing', 'k3c_oppervlakte', 'Oppervlakte en de waarde van p', 1],
] as const

function naarLog(formule: string): string {
  if (/\blog\s*\(/.test(formule)) throw new Error(`log() in ${formule}`)
  return formule.replace(/\bln\s*\(/g, 'log(')
}

function bijna(gevonden: number, verwacht: number, label: string) {
  const tol = 1e-8 * Math.max(1, Math.abs(verwacht))
  assert.ok(Math.abs(gevonden - verwacht) <= tol, `${label}: ${gevonden} tegen ${verwacht}`)
}

function narekenen(q: AdditiveQ) {
  if (q.integrand === undefined || q.primitieve === undefined) return
  const afgeleide = derivative(parse(naarLog(q.primitieve)), 'x').compile()
  const integrand = parse(naarLog(q.integrand)).compile()
  const [begin, eind] = q.domein ?? [-2, 2]
  let bruikbaar = 0
  for (let i = 1; i <= 9; i += 1) {
    const x = begin + ((eind - begin) * i) / 10
    let links: unknown
    let rechts: unknown
    try {
      links = afgeleide.evaluate({ x })
      rechts = integrand.evaluate({ x })
    } catch {
      continue
    }
    if (typeof links !== 'number' || typeof rechts !== 'number') continue
    if (!Number.isFinite(links) || !Number.isFinite(rechts)) continue
    bruikbaar += 1
    bijna(links, rechts, `${q.nummer} bij x = ${x}`)
  }
  assert.ok(bruikbaar >= 3, `${q.nummer}: maar ${bruikbaar} bruikbare x-waarden`)
  if (q.grenzen !== undefined && q.waarde !== undefined) {
    const F = parse(naarLog(q.primitieve)).compile()
    const gevonden = (F.evaluate({ x: q.grenzen[1] }) as number) - (F.evaluate({ x: q.grenzen[0] }) as number)
    const verwacht = typeof q.waarde === 'number' ? q.waarde : (evaluate(naarLog(String(q.waarde))) as number)
    bijna(gevonden, verwacht, `${q.nummer} F(b) - F(a)`)
  }
}

const pi = Math.PI
bijna(Math.atan(-Math.sqrt(3)) + Math.atan(1), -pi / 12, 'k3a-w-7')
bijna(Math.atan(Math.tan((5 * pi) / 6)), -pi / 6, 'k3a-w-8')
bijna(Math.tan(pi / 6), Math.sqrt(3) / 3, 'k3a-v-7')
bijna(Math.tan(1.2) / 3, 0.857383874, 'k3a-v-8 ruw')
assert.equal((Math.tan(1.2) / 3).toFixed(3), '0.857')
bijna(Math.asin(0.5), pi / 6, 'k3c-w-4')
bijna(Math.asin(-1), -pi / 2, 'k3c-w-5')
bijna(Math.asin(Math.SQRT1_2) + Math.asin(-0.5), pi / 12, 'k3c-w-6')
bijna(2 * Math.asin(Math.sqrt(3) / 2) - Math.asin(1), pi / 6, 'k3c-w-7')
bijna(Math.asin(Math.sin((7 * pi) / 6)), -pi / 6, 'k3c-w-8')
bijna(Math.sin(pi / 4), Math.SQRT1_2, 'k3c-v-5')
bijna(Math.sin(-pi / 6) / 2, -0.25, 'k3c-v-6')
assert.ok(pi > pi / 2, 'k3c-v-7 buiten bereik')
assert.equal(Math.sin(0.8).toFixed(3), '0.717')

for (const q of VRAGEN) narekenen(q)

for (const [slug, n] of Object.entries(verwachtNieuw)) {
  const gevonden = VRAGEN.filter((q) => q.cluster === slug).length
  assert.equal(gevonden, n, slug)
}
assert.equal(VRAGEN.length, 50)

const verwachtAantal: Record<string, number> = {}
for (const rij of clusters) verwachtAantal[rij[1]] = 8

const HOOFDSTUK: AdditiveChapter = {
  chapterSlug: 'k',
  chapterTitle: 'K — Voortgezette integraalrekening',
  bookPart: 4,
  chapterOrder: 12,
  site: 'integralen',
  migrationFile: '0071_k3_aanvullen_tot_8.sql',
  headerTitle: 'K.3 A t/m K.3 C — aanvullen tot 8 vragen per soort',
  sourceScript: 'scripts/k3-aanvullen-8.ts',
  headerNotes: [
    'K.3 A en K.3 B hadden zes vragen per soort. K.3 C had er drie tot vijf.',
    'Deze migratie vult elk cluster aan tot acht, met eigen varianten.',
    'K.4 en K.5 hadden al acht vragen en blijven buiten deze migratie.',
    '',
    'De controle verwacht ná deze migratie acht vragen per cluster. De',
    'stappencontrole telt alleen de nieuwe opgaven.',
  ],
  topics: [
    { slug: 'k3a_arctangens', title: 'De functie arctan', order: 17, category: 'vergelijkingen' },
    { slug: 'k3a_primitiveren', title: 'Primitiveren met arctan', order: 18, category: 'primitiveren' },
    { slug: 'k3a_bepaald', title: 'Bepaalde integralen met arctan', order: 19, category: 'integralen' },
    { slug: 'k3b_primitiveren', title: 'Primitiveren naar arctan: de vorm zoeken', order: 20, category: 'primitiveren' },
    { slug: 'k3b_bepaald', title: 'Bepaalde integralen naar arctan', order: 21, category: 'integralen' },
    { slug: 'k3b_toepassing', title: 'Vlakdelen met arctan', order: 22, category: 'toepassingen' },
    { slug: 'k3c_arcsinus', title: 'De functie arcsin', order: 23, category: 'vergelijkingen' },
    { slug: 'k3c_primitiveren', title: 'Primitiveren naar arcsin', order: 24, category: 'primitiveren' },
    { slug: 'k3c_bepaald', title: 'Bepaalde integralen met arcsin', order: 25, category: 'integralen' },
    { slug: 'k3c_toepassing', title: 'Vlakdelen met arcsin', order: 26, category: 'toepassingen' },
  ],
  clusters: clusters.map(([topic, slug, title, order]) => ({ topic, slug, title, order })),
  questions: VRAGEN,
  verwachtAantal,
  alleenEigenStappen: true,
}

const wortel = process.cwd()
const contentPad = path.join(wortel, 'content', 'hoofdstuk-k', 'k3-aanvullen-8.json')
writeFileSync(contentPad, generateContentFile(HOOFDSTUK, 'K.3 A t/m K.3 C — aanvulling tot 8 vragen per soort'))
const migratiePad = path.join(wortel, 'supabase', 'migrations', HOOFDSTUK.migrationFile)
writeFileSync(migratiePad, generateAdditiveMigration(HOOFDSTUK))

console.log(`Geschreven: ${contentPad}`)
console.log(`Geschreven: ${migratiePad}`)
console.log(`Vragen: ${HOOFDSTUK.questions.length}`)
