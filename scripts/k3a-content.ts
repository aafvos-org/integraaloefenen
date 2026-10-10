/**
 * K.3 Theorie A — De functie f(x) = arctan(x).
 *
 * De paragraaf begint met de inverse van de tangens:
 *
 *     arctan is de inverse van tan op ⟨-½π, ½π⟩
 *     D = ℝ en B = ⟨-½π, ½π⟩
 *
 *     f(x) = 1/(x² + 1)   geeft   F(x) = arctan(x) + c
 *     g(x) = arctan(x)    geeft   g'(x) = 1/(x² + 1)
 *
 * Het boek oefent dat in vier soorten opgaven: exacte waarden uit de tabel,
 * vergelijkingen met arctan, differentiëren, en bepaalde integralen van
 * 1/(x² + 1) en van de vormen waar de kern meteen af te lezen is. Die vier
 * soorten zijn hier zes clusters geworden, elk met zes eigen varianten.
 *
 * Kwadraatafsplitsen (x² - 4x + 8 = (x - 2)² + 4) en het herschrijven van
 * a/(px² + q) naar a/((bx)² + 1) horen bij Theorie B en staan hier dus niet in.
 *
 * Draaien met:  npx jiti scripts/k3a-content.ts
 *
 * Schrijft twee bestanden:
 *   • content/hoofdstuk-k/k3a.json      — leest src/content/primitieven.test.ts
 *   • supabase/migrations/0040_k3a_arctangens.sql — alleen rijen toevoegen
 *
 * Eigen topics en eigen clusters, zodat de controles aan het eind van de
 * eerdere K-migraties blijven kloppen.
 *
 * Twee clusters gaan over de functie zelf (exacte waarden, vergelijkingen).
 * Daar zit geen integraal in, dus daar staat geen `integrand` en `primitieve`
 * bij en die twaalf vragen komen niet in `content/`. De antwoorden daarvan zijn
 * met de hand nagerekend; zie de toelichting per vraag.
 *
 * Bij het cluster "de afgeleide van arctan" staat de functie zelf als
 * `primitieve` en de afgeleide als `integrand`. Dat is precies dezelfde
 * controle: de test differentieert de primitieve en legt hem naast de
 * integrand, en dat is hier exact het antwoord van de opgave.
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

/** Vragen over de functie zelf: geen integraal, alleen deel 3. */
const DEEL3 = r`Hier speelt alleen deel 3 van de driedeling: de goede oplossingsmethode gebruiken. Er staat geen integraal in deze opgave; je hebt alleen nodig wat $\arctan$ betekent.`

const WAT_IS_ARCTAN = r`$\arctan(a)$ is de hoek $t$ met $\tan(t) = a$ én $-\tfrac{1}{2}\pi < t < \tfrac{1}{2}\pi$. Dat laatste stukje is de hele truc: er zijn oneindig veel hoeken met dezelfde tangens, maar $\arctan$ kiest er altijd één uit dat gebied.`

const TABEL = r`Uit de tabel die je uit het hoofd kent: $\tan\left(\tfrac{1}{6}\pi\right) = \tfrac{1}{3}\sqrt{3}$, $\tan\left(\tfrac{1}{4}\pi\right) = 1$ en $\tan\left(\tfrac{1}{3}\pi\right) = \sqrt{3}$. Omdat $\tan$ oneven is, hoort bij een negatief getal dezelfde hoek met een minteken.`

/** De standaardvorm waar alles in dit blok op neerkomt. */
const STANDAARDVORM = r`$\dfrac{1}{x^{2} + 1}$ geeft $\arctan(x) + c$`

const SCHIL_STANDAARD = r`Buitenste schil: een breuk met $x^{2} + 1$ in de noemer → de standaardvorm ${STANDAARDVORM}.`

const SCHIL_KERN = r`Buitenste schil: een breuk met in de noemer een kwadraat plus $1$, maar niet kaal $x^{2} + 1$ → lees eerst de kern af. De regel voor $f(ax + b)$ zegt dat je daarna nog door $a$ moet delen.`

const SCHIL_SUBSTITUTIE = r`Buitenste schil: in de noemer staat het kwadraat van iets anders dan $x$, en de afgeleide daarvan staat in de teller → substitutie. Met $\int \dfrac{g'}{g^{2} + 1}\,\mathrm{d}x = \arctan(g) + c$ ben je er in één stap.`

/** De kettingregel-zin voor het cluster over differentiëren. */
const SCHIL_AFGELEIDE = r`De afgeleide van $\arctan$ is precies de standaardvorm die je bij deel 2 van de driedeling moet herkennen: $[\arctan(x)]' = \dfrac{1}{x^{2} + 1}$. Daarom oefen je hem eerst andersom. Buitenste schil: $\arctan$ van een kern → kettingregel.`

const CONTROLE = r`Controle: differentieer $F$ en je krijgt $f$ terug.`

// ─────────────────────────────────────────────────────────────────────────────
// Stap-sjablonen
// ─────────────────────────────────────────────────────────────────────────────

/** Exacte waarde van arctan: betekenis, tabel, antwoord. */
function waarde(s: { vraag: string; tabel: string; antwoord: string }): Steps {
  return [DEEL3, `${WAT_IS_ARCTAN} ${s.vraag}`, s.tabel, s.antwoord]
}

/** Vergelijking met arctan: omschrijven naar tan, oplossen, nakijken. */
function vergelijking(s: { schil: string; omschrijven: string; oplossen: string; antwoord: string }): Steps {
  return [`${DEEL3} ${s.schil}`, s.omschrijven, s.oplossen, s.antwoord]
}

/** Kettingregel met arctan als buitenkant. */
function afgeleide(s: { kern: string; dBuiten: string; dKern: string; samen: string }): Steps {
  return [
    SCHIL_AFGELEIDE,
    r`Buitenkant en kern: buitenkant $\arctan(\ldots)$, kern $${s.kern}$.`,
    r`Afgeleide van de buitenkant met de kern erin: $${s.dBuiten}$. Afgeleide van de kern: $${s.dKern}$.`,
    s.samen,
  ]
}

/** Primitiveren: schil, herschrijven, regel toepassen, antwoord. */
function primitiveren(s: { schil: string; herschrijven: string; regel: string; antwoord: string }): Steps {
  return [`${DEEL2} ${s.schil}`, s.herschrijven, s.regel, `${s.antwoord} ${CONTROLE}`]
}

/** Bepaalde integraal: eerst de primitieve, dan de grenzen. */
function bepaald(s: { schil: string; herschrijven: string; primitieve: string; invullen: string }): Steps {
  return [`${DEEL2_BEPAALD} ${s.schil}`, s.herschrijven, s.primitieve, s.invullen]
}

// ─────────────────────────────────────────────────────────────────────────────
// De vragen
// ─────────────────────────────────────────────────────────────────────────────

const VRAGEN: AdditiveQ[] = [
  // ── Exacte waarden van arctan ─────────────────────────────────────────────
  {
    cluster: 'k3a_waarden',
    nummer: 'waarde-1',
    level: 1,
    latex: r`Bereken exact: $\arctan\left(\sqrt{3}\right)$`,
    antwoordLatex: r`\tfrac{1}{3}\pi`,
    antwoord: '1/3 pi',
    alts: ['pi/3', '(1/3)pi', '1/3pi'],
    steps: waarde({
      vraag: r`De vraag is dus: welke hoek tussen $-\tfrac{1}{2}\pi$ en $\tfrac{1}{2}\pi$ heeft tangens $\sqrt{3}$?`,
      tabel: TABEL,
      antwoord: r`$\tan\left(\tfrac{1}{3}\pi\right) = \sqrt{3}$ en $\tfrac{1}{3}\pi$ ligt tussen $-\tfrac{1}{2}\pi$ en $\tfrac{1}{2}\pi$, dus $\arctan\left(\sqrt{3}\right) = \tfrac{1}{3}\pi$.`,
    }),
  },
  {
    cluster: 'k3a_waarden',
    nummer: 'waarde-2',
    level: 1,
    latex: r`Bereken exact: $\arctan(-1)$`,
    antwoordLatex: r`-\tfrac{1}{4}\pi`,
    antwoord: '-1/4 pi',
    alts: ['-pi/4', '-(1/4)pi', '-1/4pi'],
    steps: waarde({
      vraag: r`De vraag is dus: welke hoek tussen $-\tfrac{1}{2}\pi$ en $\tfrac{1}{2}\pi$ heeft tangens $-1$?`,
      tabel: TABEL,
      antwoord: r`Bij $1$ hoort $\tfrac{1}{4}\pi$, dus bij $-1$ hoort $-\tfrac{1}{4}\pi$. Die ligt in het goede gebied, dus $\arctan(-1) = -\tfrac{1}{4}\pi$. Let op het minteken: $1\tfrac{3}{4}\pi$ heeft ook tangens $-1$, maar valt buiten het bereik van $\arctan$.`,
    }),
  },
  {
    cluster: 'k3a_waarden',
    nummer: 'waarde-3',
    level: 2,
    latex: r`Bereken exact: $\arctan\left(\tfrac{1}{3}\sqrt{3}\right) + \arctan\left(-\sqrt{3}\right)$`,
    antwoordLatex: r`-\tfrac{1}{6}\pi`,
    antwoord: '-1/6 pi',
    alts: ['-pi/6', '-(1/6)pi', '-1/6pi'],
    steps: waarde({
      vraag: r`Zoek de twee hoeken apart op en tel ze daarna pas bij elkaar op.`,
      tabel: `${TABEL} Dus $\\arctan\\left(\\tfrac{1}{3}\\sqrt{3}\\right) = \\tfrac{1}{6}\\pi$ en $\\arctan\\left(-\\sqrt{3}\\right) = -\\tfrac{1}{3}\\pi$.`,
      antwoord: r`Optellen: $\tfrac{1}{6}\pi - \tfrac{1}{3}\pi = \tfrac{1}{6}\pi - \tfrac{2}{6}\pi = -\tfrac{1}{6}\pi$.`,
    }),
  },
  {
    cluster: 'k3a_waarden',
    nummer: 'waarde-4',
    level: 2,
    latex: r`Bereken exact: $3\arctan(1) - \arctan\left(-\tfrac{1}{3}\sqrt{3}\right)$`,
    antwoordLatex: r`\tfrac{11}{12}\pi`,
    antwoord: '11/12 pi',
    alts: ['11pi/12', '(11/12)pi', '11/12pi'],
    steps: waarde({
      vraag: r`Zoek de twee hoeken apart op; de factor $3$ en het minteken komen daarna.`,
      tabel: `${TABEL} Dus $\\arctan(1) = \\tfrac{1}{4}\\pi$ en $\\arctan\\left(-\\tfrac{1}{3}\\sqrt{3}\\right) = -\\tfrac{1}{6}\\pi$.`,
      antwoord: r`Invullen: $3 \cdot \tfrac{1}{4}\pi - \left(-\tfrac{1}{6}\pi\right) = \tfrac{3}{4}\pi + \tfrac{1}{6}\pi = \tfrac{9}{12}\pi + \tfrac{2}{12}\pi = \tfrac{11}{12}\pi$.`,
    }),
  },
  {
    cluster: 'k3a_waarden',
    nummer: 'waarde-5',
    level: 3,
    latex: r`Bereken exact: $\arctan\left(\tan\left(\tfrac{2}{3}\pi\right)\right)$`,
    antwoordLatex: r`-\tfrac{1}{3}\pi`,
    antwoord: '-1/3 pi',
    alts: ['-pi/3', '-(1/3)pi', '-1/3pi'],
    steps: waarde({
      vraag: r`Het ligt voor de hand om $\tfrac{2}{3}\pi$ te antwoorden, maar dat is fout: $\tfrac{2}{3}\pi$ ligt niet tussen $-\tfrac{1}{2}\pi$ en $\tfrac{1}{2}\pi$, en dat is wel waar $\arctan$ altijd uitkomt. Reken daarom van binnen naar buiten.`,
      tabel: r`Eerst de binnenkant: $\tan\left(\tfrac{2}{3}\pi\right) = -\tan\left(\tfrac{1}{3}\pi\right) = -\sqrt{3}$, want de tangens heeft periode $\pi$ en $\tfrac{2}{3}\pi = \pi - \tfrac{1}{3}\pi$.`,
      antwoord: r`Dan de buitenkant: $\arctan\left(-\sqrt{3}\right) = -\tfrac{1}{3}\pi$. Die hoek ligt wél in het bereik. Dus $\arctan\left(\tan\left(\tfrac{2}{3}\pi\right)\right) = -\tfrac{1}{3}\pi$, en niet $\tfrac{2}{3}\pi$.`,
    }),
  },
  {
    cluster: 'k3a_waarden',
    nummer: 'waarde-6',
    level: 3,
    latex: r`Bereken exact: $\tan\left(\arctan(5)\right)$`,
    antwoordLatex: r`5`,
    antwoord: '5',
    steps: waarde({
      vraag: r`Hier staan dezelfde twee functies als in de vorige opgave, maar in de andere volgorde. Dat maakt wél verschil.`,
      tabel: r`$\arctan(5)$ is per definitie de hoek $t$ tussen $-\tfrac{1}{2}\pi$ en $\tfrac{1}{2}\pi$ met $\tan(t) = 5$. Zo'n hoek bestaat, want $D_{\arctan} = \mathbb{R}$; hij is alleen geen mooie waarde uit de tabel.`,
      antwoord: r`Je hoeft die hoek niet te kennen: er staat $\tan(t)$ en dat is per definitie $5$. Dus $\tan\left(\arctan(5)\right) = 5$. Andersom gaat het mis zodra de hoek buiten $\left\langle-\tfrac{1}{2}\pi, \tfrac{1}{2}\pi\right\rangle$ ligt, zoals in de vorige opgave; deze kant klopt altijd.`,
    }),
  },

  // ── Vergelijkingen met arctan ─────────────────────────────────────────────
  {
    cluster: 'k3a_vergelijking',
    nummer: 'verg-1',
    level: 1,
    latex: r`Los exact op: $\arctan(x) = \tfrac{1}{4}\pi$`,
    antwoordLatex: r`x = 1`,
    antwoord: '1',
    alts: ['x = 1'],
    steps: vergelijking({
      schil: r`Buitenste schil: $\arctan$ van iets is gelijk aan een hoek → neem aan beide kanten de tangens.`,
      omschrijven: r`Omdat $\arctan$ en $\tan$ elkaars inverse zijn, is $\arctan(x) = \tfrac{1}{4}\pi$ hetzelfde als $x = \tan\left(\tfrac{1}{4}\pi\right)$.`,
      oplossen: r`Controleer eerst of de rechterkant kán: $\tfrac{1}{4}\pi$ ligt tussen $-\tfrac{1}{2}\pi$ en $\tfrac{1}{2}\pi$, dus er is een oplossing. Uit de tabel: $\tan\left(\tfrac{1}{4}\pi\right) = 1$.`,
      antwoord: r`Dus $x = 1$.`,
    }),
  },
  {
    cluster: 'k3a_vergelijking',
    nummer: 'verg-2',
    level: 1,
    latex: r`Los exact op: $\arctan(x) = -\tfrac{1}{6}\pi$`,
    antwoordLatex: r`x = -\tfrac{1}{3}\sqrt{3}`,
    antwoord: '-1/3 sqrt(3)',
    alts: ['x = -1/3 sqrt(3)', '-sqrt(3)/3', 'x = -sqrt(3)/3', '-1/sqrt(3)'],
    steps: vergelijking({
      schil: r`Buitenste schil: $\arctan$ van iets is gelijk aan een hoek → neem aan beide kanten de tangens.`,
      omschrijven: r`$\arctan(x) = -\tfrac{1}{6}\pi$ geeft $x = \tan\left(-\tfrac{1}{6}\pi\right)$.`,
      oplossen: r`$-\tfrac{1}{6}\pi$ ligt tussen $-\tfrac{1}{2}\pi$ en $\tfrac{1}{2}\pi$, dus er is een oplossing. De tangens is oneven, dus $\tan\left(-\tfrac{1}{6}\pi\right) = -\tan\left(\tfrac{1}{6}\pi\right) = -\tfrac{1}{3}\sqrt{3}$.`,
      antwoord: r`Dus $x = -\tfrac{1}{3}\sqrt{3}$.`,
    }),
  },
  {
    cluster: 'k3a_vergelijking',
    nummer: 'verg-3',
    level: 2,
    latex: r`Los exact op: $\arctan(x - 3) = \tfrac{1}{3}\pi$`,
    antwoordLatex: r`x = 3 + \sqrt{3}`,
    antwoord: '3 + sqrt(3)',
    alts: ['x = 3 + sqrt(3)', 'sqrt(3) + 3', 'x = sqrt(3) + 3'],
    steps: vergelijking({
      schil: r`Buitenste schil: $\arctan$ van een kern is gelijk aan een hoek → eerst de hele kern vrijmaken, daarna pas $x$.`,
      omschrijven: r`De kern is $x - 3$. Tangens nemen aan beide kanten geeft $x - 3 = \tan\left(\tfrac{1}{3}\pi\right)$.`,
      oplossen: r`$\tfrac{1}{3}\pi$ ligt in het bereik van $\arctan$, dus er is een oplossing, en $\tan\left(\tfrac{1}{3}\pi\right) = \sqrt{3}$. Dus $x - 3 = \sqrt{3}$.`,
      antwoord: r`Tel er $3$ bij op: $x = 3 + \sqrt{3}$.`,
    }),
  },
  {
    cluster: 'k3a_vergelijking',
    nummer: 'verg-4',
    level: 2,
    latex: r`Los op: $\arctan(x) = \tfrac{3}{4}\pi$`,
    antwoordLatex: r`\text{geen oplossing}`,
    antwoord: 'geen oplossing',
    alts: ['er is geen oplossing', 'geen', 'geen oplossingen'],
    steps: vergelijking({
      schil: r`Buitenste schil: $\arctan$ van iets is gelijk aan een hoek → kijk eerst of die hoek überhaupt kan.`,
      omschrijven: r`Het bereik van $\arctan$ is $\left\langle-\tfrac{1}{2}\pi, \tfrac{1}{2}\pi\right\rangle$: wat je ook invult, er komt altijd een hoek tussen $-\tfrac{1}{2}\pi$ en $\tfrac{1}{2}\pi$ uit.`,
      oplossen: r`En $\tfrac{3}{4}\pi$ is groter dan $\tfrac{1}{2}\pi$, dus die waarde wordt nooit bereikt.`,
      antwoord: r`De vergelijking heeft geen oplossing. Val niet in de val om $x = \tan\left(\tfrac{3}{4}\pi\right) = -1$ op te schrijven: $\arctan(-1)$ is $-\tfrac{1}{4}\pi$ en niet $\tfrac{3}{4}\pi$.`,
    }),
  },
  {
    cluster: 'k3a_vergelijking',
    nummer: 'verg-5',
    level: 3,
    latex: r`Los exact op: $\arctan\left(x^{2} - 2\right) = \tfrac{1}{4}\pi$`,
    antwoordLatex: r`x = \sqrt{3} \ \vee \ x = -\sqrt{3}`,
    antwoord: 'x = sqrt(3) of x = -sqrt(3)',
    alts: [
      'x = -sqrt(3) of x = sqrt(3)',
      'sqrt(3) of -sqrt(3)',
      'x = sqrt(3) v x = -sqrt(3)',
      'x = ±sqrt(3)',
    ],
    steps: vergelijking({
      schil: r`Buitenste schil: $\arctan$ van een kern is gelijk aan een hoek → eerst de kern vrijmaken. De kern is hier een kwadraat, dus let op: dat geeft straks twee oplossingen.`,
      omschrijven: r`Tangens nemen aan beide kanten: $x^{2} - 2 = \tan\left(\tfrac{1}{4}\pi\right) = 1$.`,
      oplossen: r`Dus $x^{2} = 3$. Een kwadraat gelijk aan een positief getal geeft twee oplossingen: $x = \sqrt{3}$ of $x = -\sqrt{3}$.`,
      antwoord: r`Dus $x = \sqrt{3} \ \vee \ x = -\sqrt{3}$. Allebei kloppen ze, want $\left(\pm\sqrt{3}\right)^{2} - 2 = 1$.`,
    }),
  },
  {
    cluster: 'k3a_vergelijking',
    nummer: 'verg-6',
    level: 3,
    latex: r`Los op: $\arctan(2x + 1) = 1$. Rond af op drie decimalen.`,
    antwoordLatex: r`x \approx 0{,}279`,
    antwoord: '0,279',
    alts: ['0.279', 'x = 0,279', 'x = 0.279', 'x ≈ 0,279'],
    steps: vergelijking({
      schil: r`Buitenste schil: $\arctan$ van een kern is gelijk aan een getal → eerst de kern vrijmaken. Let op: rechts staat $1$ en dat is een getal in radialen, geen hoek uit de tabel.`,
      omschrijven: r`Kan het? $1 < \tfrac{1}{2}\pi \approx 1{,}571$, dus $1$ ligt in het bereik van $\arctan$ en er is een oplossing. Tangens nemen geeft $2x + 1 = \tan(1)$.`,
      oplossen: r`Dus $2x = \tan(1) - 1$ en $x = \tfrac{1}{2}\tan(1) - \tfrac{1}{2}$. Dat is de exacte oplossing; er is geen mooiere vorm, want $1$ staat niet in de tabel.`,
      antwoord: r`Met de rekenmachine (in radialen!): $\tan(1) \approx 1{,}5574$, dus $x \approx \tfrac{1{,}5574 - 1}{2} \approx 0{,}279$.`,
    }),
  },

  // ── De afgeleide van arctan ───────────────────────────────────────────────
  {
    cluster: 'k3a_afgeleide',
    nummer: 'afg-1',
    level: 1,
    latex: r`Differentieer: $f(x) = \arctan(3x)$`,
    antwoordLatex: r`f'(x) = \dfrac{3}{9x^{2} + 1}`,
    antwoord: '3/(9x^2 + 1)',
    alts: ['3/(1 + 9x^2)'],
    integrand: '3 / (9 * x^2 + 1)',
    primitieve: 'atan(3 * x)',
    steps: afgeleide({
      kern: '3x',
      dBuiten: r`\dfrac{1}{(3x)^{2} + 1} = \dfrac{1}{9x^{2} + 1}`,
      dKern: '3',
      samen: r`Vermenigvuldig: $f'(x) = \dfrac{1}{9x^{2} + 1} \cdot 3 = \dfrac{3}{9x^{2} + 1}$. Werk het kwadraat van de kern altijd uit, anders herken je de noemer straks niet terug bij het primitiveren.`,
    }),
  },
  {
    cluster: 'k3a_afgeleide',
    nummer: 'afg-2',
    level: 1,
    latex: r`Differentieer: $g(x) = 4\arctan\left(\tfrac{1}{2}x\right)$`,
    antwoordLatex: r`g'(x) = \dfrac{8}{x^{2} + 4}`,
    antwoord: '8/(x^2 + 4)',
    alts: ['8/(4 + x^2)', '2/((1/2x)^2 + 1)'],
    integrand: '8 / (x^2 + 4)',
    primitieve: '4 * atan(x / 2)',
    steps: afgeleide({
      kern: r`\tfrac{1}{2}x`,
      dBuiten: r`\dfrac{1}{\left(\tfrac{1}{2}x\right)^{2} + 1} = \dfrac{1}{\tfrac{1}{4}x^{2} + 1}`,
      dKern: r`\tfrac{1}{2}`,
      samen: r`Vermenigvuldig, met de factor $4$ erbij: $g'(x) = 4 \cdot \dfrac{1}{\tfrac{1}{4}x^{2} + 1} \cdot \tfrac{1}{2} = \dfrac{2}{\tfrac{1}{4}x^{2} + 1}$. Vermenigvuldig teller en noemer met $4$ om de breuken in de noemer weg te werken: $g'(x) = \dfrac{8}{x^{2} + 4}$.`,
    }),
  },
  {
    cluster: 'k3a_afgeleide',
    nummer: 'afg-3',
    level: 2,
    latex: r`Differentieer: $h(x) = \arctan(x + 2)$`,
    antwoordLatex: r`h'(x) = \dfrac{1}{x^{2} + 4x + 5}`,
    antwoord: '1/(x^2 + 4x + 5)',
    alts: ['1/((x + 2)^2 + 1)'],
    integrand: '1 / (x^2 + 4 * x + 5)',
    primitieve: 'atan(x + 2)',
    steps: afgeleide({
      kern: 'x + 2',
      dBuiten: r`\dfrac{1}{(x + 2)^{2} + 1}`,
      dKern: '1',
      samen: r`Vermenigvuldig: $h'(x) = \dfrac{1}{(x + 2)^{2} + 1} \cdot 1$. Werk de noemer uit: $(x + 2)^{2} + 1 = x^{2} + 4x + 4 + 1 = x^{2} + 4x + 5$, dus $h'(x) = \dfrac{1}{x^{2} + 4x + 5}$. Andersom is dit het signaal om bij zo'n noemer aan $\arctan$ te denken.`,
    }),
  },
  {
    cluster: 'k3a_afgeleide',
    nummer: 'afg-4',
    level: 2,
    latex: r`Differentieer: $f(x) = \arctan\left(x^{2}\right)$`,
    antwoordLatex: r`f'(x) = \dfrac{2x}{x^{4} + 1}`,
    antwoord: '2x/(x^4 + 1)',
    alts: ['2x/(1 + x^4)'],
    integrand: '2 * x / (x^4 + 1)',
    primitieve: 'atan(x^2)',
    steps: afgeleide({
      kern: 'x^{2}',
      dBuiten: r`\dfrac{1}{\left(x^{2}\right)^{2} + 1} = \dfrac{1}{x^{4} + 1}`,
      dKern: '2x',
      samen: r`Vermenigvuldig: $f'(x) = \dfrac{1}{x^{4} + 1} \cdot 2x = \dfrac{2x}{x^{4} + 1}$. De $2x$ in de teller is de afgeleide van de kern; dat is precies wat je bij het primitiveren terug moet zien.`,
    }),
  },
  {
    cluster: 'k3a_afgeleide',
    nummer: 'afg-5',
    level: 3,
    latex: r`Differentieer: $f(x) = \arctan\left(3x^{2} + 1\right)$`,
    antwoordLatex: r`f'(x) = \dfrac{6x}{9x^{4} + 6x^{2} + 2}`,
    antwoord: '6x/(9x^4 + 6x^2 + 2)',
    alts: ['6x/((3x^2 + 1)^2 + 1)'],
    integrand: '6 * x / (9 * x^4 + 6 * x^2 + 2)',
    primitieve: 'atan(3 * x^2 + 1)',
    steps: afgeleide({
      kern: '3x^{2} + 1',
      dBuiten: r`\dfrac{1}{\left(3x^{2} + 1\right)^{2} + 1}`,
      dKern: '6x',
      samen: r`Vermenigvuldig: $f'(x) = \dfrac{6x}{\left(3x^{2} + 1\right)^{2} + 1}$. Werk de noemer uit: $\left(3x^{2} + 1\right)^{2} + 1 = 9x^{4} + 6x^{2} + 1 + 1 = 9x^{4} + 6x^{2} + 2$, dus $f'(x) = \dfrac{6x}{9x^{4} + 6x^{2} + 2}$.`,
    }),
  },
  {
    cluster: 'k3a_afgeleide',
    nummer: 'afg-6',
    level: 3,
    latex: r`Differentieer: $f(x) = x\arctan(x)$`,
    antwoordLatex: r`f'(x) = \arctan(x) + \dfrac{x}{x^{2} + 1}`,
    antwoord: 'arctan(x) + x/(x^2 + 1)',
    alts: ['atan(x) + x/(x^2 + 1)', 'x/(x^2 + 1) + arctan(x)', 'tan^-1(x) + x/(x^2 + 1)'],
    integrand: 'atan(x) + x / (x^2 + 1)',
    primitieve: 'x * atan(x)',
    steps: [
      r`De afgeleide van $\arctan$ is de standaardvorm $[\arctan(x)]' = \dfrac{1}{x^{2} + 1}$. Buitenste schil: twee factoren met een $\cdot$ ertussen → productregel, met $\arctan$ als een van de twee.`,
      r`Kies $g$ en $h$: $g(x) = x$ en $h(x) = \arctan(x)$.`,
      r`Bereken $g'$ en $h'$: $g'(x) = 1$ en $h'(x) = \dfrac{1}{x^{2} + 1}$. Hier is geen kettingregel nodig, want de kern is kaal $x$.`,
      r`Vul de formule in: $f'(x) = g'(x) \cdot h(x) + g(x) \cdot h'(x) = 1 \cdot \arctan(x) + x \cdot \dfrac{1}{x^{2} + 1} = \arctan(x) + \dfrac{x}{x^{2} + 1}$. Deze opgave komt in K.3 nog terug: andersom geeft hij de primitieve van $\arctan(x)$ zelf.`,
    ],
  },

  // ── De standaardvorm 1/(x² + 1) primitiveren ──────────────────────────────
  {
    cluster: 'k3a_standaard',
    nummer: 'std-1',
    level: 1,
    latex: r`Primitiveer: $f(x) = \dfrac{1}{x^{2} + 1}$`,
    antwoordLatex: r`F(x) = \arctan(x) + c`,
    antwoord: 'arctan(x) + c',
    alts: ['atan(x) + c', 'tan^-1(x) + c'],
    integrand: '1 / (x^2 + 1)',
    primitieve: 'atan(x)',
    steps: primitiveren({
      schil: SCHIL_STANDAARD,
      herschrijven: r`Herschrijven hoeft niet: er staat al precies $\dfrac{1}{x^{2} + 1}$, met een kale $x$ in het kwadraat en een $1$ erachter.`,
      regel: r`Pas de standaardvorm toe: ${STANDAARDVORM}.`,
      antwoord: r`Schrijf het antwoord op: $F(x) = \arctan(x) + c$. Vergeet de integratieconstante niet.`,
    }),
  },
  {
    cluster: 'k3a_standaard',
    nummer: 'std-2',
    level: 1,
    latex: r`Primitiveer: $f(x) = \dfrac{5}{x^{2} + 1}$`,
    antwoordLatex: r`F(x) = 5\arctan(x) + c`,
    antwoord: '5arctan(x) + c',
    alts: ['5 arctan(x) + c', '5atan(x) + c', '5 atan(x) + c'],
    integrand: '5 / (x^2 + 1)',
    primitieve: '5 * atan(x)',
    steps: primitiveren({
      schil: SCHIL_STANDAARD,
      herschrijven: r`Haal de constante naar voren: $f(x) = 5 \cdot \dfrac{1}{x^{2} + 1}$. Een getal voor de breuk mag je bij het primitiveren gewoon laten staan.`,
      regel: r`Pas de standaardvorm toe op wat er overblijft: ${STANDAARDVORM}.`,
      antwoord: r`Schrijf het antwoord op: $F(x) = 5\arctan(x) + c$.`,
    }),
  },
  {
    cluster: 'k3a_standaard',
    nummer: 'std-3',
    level: 2,
    latex: r`Primitiveer: $f(x) = \dfrac{x^{2} + 3}{x^{2} + 1}$`,
    antwoordLatex: r`F(x) = x + 2\arctan(x) + c`,
    antwoord: 'x + 2arctan(x) + c',
    alts: ['x + 2 arctan(x) + c', 'x + 2atan(x) + c', '2arctan(x) + x + c'],
    integrand: '(x^2 + 3) / (x^2 + 1)',
    primitieve: 'x + 2 * atan(x)',
    steps: primitiveren({
      schil: r`Buitenste schil: een breuk met $x^{2}$ in de teller én in de noemer → eerst splitsen. Zo'n breuk is geen standaardvorm; er is ook geen quotiëntregel voor primitiveren.`,
      herschrijven: r`Maak in de teller de noemer zichtbaar: $x^{2} + 3 = \left(x^{2} + 1\right) + 2$. Dus $f(x) = \dfrac{x^{2} + 1}{x^{2} + 1} + \dfrac{2}{x^{2} + 1} = 1 + \dfrac{2}{x^{2} + 1}$.`,
      regel: r`Nu twee losse stukken: $1$ geeft $x$, en $\dfrac{2}{x^{2} + 1}$ geeft $2\arctan(x)$ met de standaardvorm ${STANDAARDVORM}.`,
      antwoord: r`Schrijf het antwoord op: $F(x) = x + 2\arctan(x) + c$.`,
    }),
  },
  {
    cluster: 'k3a_standaard',
    nummer: 'std-4',
    level: 2,
    latex: r`Primitiveer: $f(x) = \dfrac{x^{2}}{x^{2} + 1}$`,
    antwoordLatex: r`F(x) = x - \arctan(x) + c`,
    antwoord: 'x - arctan(x) + c',
    alts: ['x - atan(x) + c', '-arctan(x) + x + c'],
    integrand: 'x^2 / (x^2 + 1)',
    primitieve: 'x - atan(x)',
    steps: primitiveren({
      schil: r`Buitenste schil: een breuk met $x^{2}$ in de teller én in de noemer → eerst splitsen.`,
      herschrijven: r`Maak in de teller de noemer zichtbaar: $x^{2} = \left(x^{2} + 1\right) - 1$. Dus $f(x) = \dfrac{x^{2} + 1}{x^{2} + 1} - \dfrac{1}{x^{2} + 1} = 1 - \dfrac{1}{x^{2} + 1}$.`,
      regel: r`Nu twee losse stukken: $1$ geeft $x$, en $\dfrac{1}{x^{2} + 1}$ geeft $\arctan(x)$. Het minteken blijft staan.`,
      antwoord: r`Schrijf het antwoord op: $F(x) = x - \arctan(x) + c$.`,
    }),
  },
  {
    cluster: 'k3a_standaard',
    nummer: 'std-5',
    level: 3,
    latex: r`Primitiveer: $f(x) = \dfrac{2x + 4}{x^{2} + 1}$`,
    antwoordLatex: r`F(x) = \ln\left(x^{2} + 1\right) + 4\arctan(x) + c`,
    antwoord: 'ln(x^2 + 1) + 4arctan(x) + c',
    alts: [
      'ln(x^2 + 1) + 4 arctan(x) + c',
      'ln(x^2 + 1) + 4atan(x) + c',
      '4arctan(x) + ln(x^2 + 1) + c',
    ],
    integrand: '(2 * x + 4) / (x^2 + 1)',
    primitieve: 'ln(x^2 + 1) + 4 * atan(x)',
    steps: primitiveren({
      schil: r`Buitenste schil: dezelfde noemer, maar twee heel verschillende tellers → splits de breuk in twee stukken en kijk per stuk welke standaardvorm erbij hoort.`,
      herschrijven: r`Splitsen: $f(x) = \dfrac{2x}{x^{2} + 1} + \dfrac{4}{x^{2} + 1}$. In het eerste stuk is de teller $2x$ precies de afgeleide van de noemer; in het tweede stuk staat alleen een getal.`,
      regel: r`Eerste stuk: $\int \dfrac{g'}{g}\,\mathrm{d}x = \ln|g| + c$ met $g(x) = x^{2} + 1$, dus dat geeft $\ln\left(x^{2} + 1\right)$ — de absoluutstrepen mogen weg, want $x^{2} + 1$ is altijd positief. Tweede stuk: de standaardvorm ${STANDAARDVORM} geeft $4\arctan(x)$.`,
      antwoord: r`Schrijf het antwoord op: $F(x) = \ln\left(x^{2} + 1\right) + 4\arctan(x) + c$. Let op het verschil: een teller met $x$ erin geeft een logaritme, een teller zonder $x$ geeft een arctangens.`,
    }),
  },
  {
    cluster: 'k3a_standaard',
    nummer: 'std-6',
    level: 3,
    latex: r`Primitiveer: $f(x) = \dfrac{\arctan(x)}{x^{2} + 1}$`,
    antwoordLatex: r`F(x) = \tfrac{1}{2}\arctan^{2}(x) + c`,
    antwoord: '1/2 arctan^2(x) + c',
    alts: [
      '1/2 arctan(x)^2 + c',
      '1/2 atan(x)^2 + c',
      'arctan(x)^2/2 + c',
      '(1/2)(arctan(x))^2 + c',
    ],
    integrand: 'atan(x) / (x^2 + 1)',
    primitieve: '1/2 * atan(x)^2',
    steps: primitiveren({
      schil: r`Buitenste schil: $\arctan(x)$ staat zelf in de teller en $\dfrac{1}{x^{2} + 1}$ is zijn eigen afgeleide → substitutie met $g(x) = \arctan(x)$.`,
      herschrijven: r`Neem $g(x) = \arctan(x)$, dan is $g'(x) = \dfrac{1}{x^{2} + 1}$. De integraal is dus $\int g \cdot g'\,\mathrm{d}x$, oftewel $\int g\,\mathrm{d}g$.`,
      regel: r`Primitiveer naar $g$ met de machtsregel: $\int g\,\mathrm{d}g = \tfrac{1}{2}g^{2}$.`,
      antwoord: r`Vul $g$ terug in: $F(x) = \tfrac{1}{2}\arctan^{2}(x) + c$.`,
    }),
  },

  // ── Een kern in de noemer ─────────────────────────────────────────────────
  {
    cluster: 'k3a_kern',
    nummer: 'kern-1',
    level: 1,
    latex: r`Primitiveer: $f(x) = \dfrac{1}{(x + 3)^{2} + 1}$`,
    antwoordLatex: r`F(x) = \arctan(x + 3) + c`,
    antwoord: 'arctan(x + 3) + c',
    alts: ['atan(x + 3) + c', 'tan^-1(x + 3) + c'],
    integrand: '1 / ((x + 3)^2 + 1)',
    primitieve: 'atan(x + 3)',
    steps: primitiveren({
      schil: SCHIL_KERN,
      herschrijven: r`De kern is $x + 3$, dus $a = 1$ en $b = 3$. Vergelijk met de standaardvorm: in plaats van $x^{2} + 1$ staat er $(x + 3)^{2} + 1$.`,
      regel: r`De regel voor $f(ax + b)$ geeft $\tfrac{1}{a}F(ax + b)$, en hier is $a = 1$, dus delen door $a$ verandert niets.`,
      antwoord: r`Schrijf het antwoord op: $F(x) = \arctan(x + 3) + c$.`,
    }),
  },
  {
    cluster: 'k3a_kern',
    nummer: 'kern-2',
    level: 1,
    latex: r`Primitiveer: $f(x) = \dfrac{2}{4x^{2} + 1}$`,
    antwoordLatex: r`F(x) = \arctan(2x) + c`,
    antwoord: 'arctan(2x) + c',
    alts: ['atan(2x) + c', 'tan^-1(2x) + c'],
    integrand: '2 / (4 * x^2 + 1)',
    primitieve: 'atan(2 * x)',
    steps: primitiveren({
      schil: SCHIL_KERN,
      herschrijven: r`Schrijf de noemer als een kwadraat plus $1$: $4x^{2} + 1 = (2x)^{2} + 1$. De kern is dus $2x$ en $a = 2$.`,
      regel: r`De standaardvorm geeft $\arctan(2x)$, en de regel voor $f(ax + b)$ zegt: deel door $a = 2$. Dat geeft $\tfrac{1}{2}\arctan(2x)$ voor $\dfrac{1}{4x^{2} + 1}$. De factor $2$ uit de teller maakt dat weer ongedaan.`,
      antwoord: r`Schrijf het antwoord op: $F(x) = 2 \cdot \tfrac{1}{2}\arctan(2x) + c = \arctan(2x) + c$.`,
    }),
  },
  {
    cluster: 'k3a_kern',
    nummer: 'kern-3',
    level: 2,
    latex: r`Primitiveer: $f(x) = \dfrac{1}{(2x - 1)^{2} + 1}$`,
    antwoordLatex: r`F(x) = \tfrac{1}{2}\arctan(2x - 1) + c`,
    antwoord: '1/2 arctan(2x - 1) + c',
    alts: ['1/2 atan(2x - 1) + c', 'arctan(2x - 1)/2 + c', '(1/2)arctan(2x - 1) + c'],
    integrand: '1 / ((2 * x - 1)^2 + 1)',
    primitieve: '1/2 * atan(2 * x - 1)',
    steps: primitiveren({
      schil: SCHIL_KERN,
      herschrijven: r`De kern is $2x - 1$, dus $a = 2$ en $b = -1$. De noemer staat al in de vorm kern-kwadraat plus $1$.`,
      regel: r`De standaardvorm geeft $\arctan(2x - 1)$; de regel voor $f(ax + b)$ zegt dat je nog door $a = 2$ moet delen.`,
      antwoord: r`Schrijf het antwoord op: $F(x) = \tfrac{1}{2}\arctan(2x - 1) + c$.`,
    }),
  },
  {
    cluster: 'k3a_kern',
    nummer: 'kern-4',
    level: 2,
    latex: r`Primitiveer: $f(x) = \dfrac{6}{9x^{2} + 1}$`,
    antwoordLatex: r`F(x) = 2\arctan(3x) + c`,
    antwoord: '2arctan(3x) + c',
    alts: ['2 arctan(3x) + c', '2atan(3x) + c', '2 atan(3x) + c'],
    integrand: '6 / (9 * x^2 + 1)',
    primitieve: '2 * atan(3 * x)',
    steps: primitiveren({
      schil: SCHIL_KERN,
      herschrijven: r`Schrijf de noemer als een kwadraat plus $1$: $9x^{2} + 1 = (3x)^{2} + 1$. De kern is $3x$ en $a = 3$. De $6$ uit de teller houd je apart.`,
      regel: r`$\dfrac{1}{(3x)^{2} + 1}$ geeft $\tfrac{1}{3}\arctan(3x)$: standaardvorm, daarna delen door $a = 3$.`,
      antwoord: r`Zet de $6$ er weer voor: $F(x) = 6 \cdot \tfrac{1}{3}\arctan(3x) + c = 2\arctan(3x) + c$.`,
    }),
  },
  {
    cluster: 'k3a_kern',
    nummer: 'kern-5',
    level: 3,
    latex: r`Primitiveer: $f(x) = \dfrac{2x}{x^{4} + 1}$`,
    antwoordLatex: r`F(x) = \arctan\left(x^{2}\right) + c`,
    antwoord: 'arctan(x^2) + c',
    alts: ['atan(x^2) + c', 'tan^-1(x^2) + c'],
    integrand: '2 * x / (x^4 + 1)',
    primitieve: 'atan(x^2)',
    steps: primitiveren({
      schil: SCHIL_SUBSTITUTIE,
      herschrijven: r`Schrijf de noemer als een kwadraat plus $1$: $x^{4} + 1 = \left(x^{2}\right)^{2} + 1$. Neem $g(x) = x^{2}$, dan is $g'(x) = 2x$ — en dat staat precies in de teller.`,
      regel: r`Dus $\int \dfrac{2x}{\left(x^{2}\right)^{2} + 1}\,\mathrm{d}x = \int \dfrac{1}{g^{2} + 1}\,\mathrm{d}g = \arctan(g)$. De regel voor $f(ax + b)$ helpt hier niet: de kern is geen $ax + b$.`,
      antwoord: r`Vul $g$ terug in: $F(x) = \arctan\left(x^{2}\right) + c$.`,
    }),
  },
  {
    cluster: 'k3a_kern',
    nummer: 'kern-6',
    level: 3,
    latex: r`Primitiveer: $f(x) = \dfrac{\mathrm{e}^{x}}{\mathrm{e}^{2x} + 1}$`,
    antwoordLatex: r`F(x) = \arctan\left(\mathrm{e}^{x}\right) + c`,
    antwoord: 'arctan(e^x) + c',
    alts: ['atan(e^x) + c', 'tan^-1(e^x) + c'],
    integrand: 'e^x / (e^(2 * x) + 1)',
    primitieve: 'atan(e^x)',
    steps: primitiveren({
      schil: SCHIL_SUBSTITUTIE,
      herschrijven: r`Gebruik de rekenregel $\mathrm{e}^{2x} = \left(\mathrm{e}^{x}\right)^{2}$: de noemer is $\left(\mathrm{e}^{x}\right)^{2} + 1$. Neem $g(x) = \mathrm{e}^{x}$, dan is $g'(x) = \mathrm{e}^{x}$ — en dat staat in de teller.`,
      regel: r`Dus $\int \dfrac{\mathrm{e}^{x}}{\left(\mathrm{e}^{x}\right)^{2} + 1}\,\mathrm{d}x = \int \dfrac{1}{g^{2} + 1}\,\mathrm{d}g = \arctan(g)$.`,
      antwoord: r`Vul $g$ terug in: $F(x) = \arctan\left(\mathrm{e}^{x}\right) + c$.`,
    }),
  },

  // ── Bepaalde integralen met arctan ────────────────────────────────────────
  {
    cluster: 'k3a_bepaald_exact',
    nummer: 'bep-1',
    level: 1,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{1} \dfrac{1}{x^{2} + 1}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{4}\pi`,
    antwoord: '1/4 pi',
    alts: ['pi/4', '(1/4)pi', '1/4pi'],
    integrand: '1 / (x^2 + 1)',
    primitieve: 'atan(x)',
    grenzen: [0, 1],
    waarde: 'pi / 4',
    steps: bepaald({
      schil: SCHIL_STANDAARD,
      herschrijven: r`Er staat al precies de standaardvorm; herschrijven is niet nodig.`,
      primitieve: r`Primitiveer: $F(x) = \arctan(x)$. De integratieconstante laat je weg; die valt bij het aftrekken toch weg.`,
      invullen: r`Vul de grenzen in: $\big[\arctan(x)\big]_{0}^{1} = \arctan(1) - \arctan(0) = \tfrac{1}{4}\pi - 0 = \tfrac{1}{4}\pi$.`,
    }),
  },
  {
    cluster: 'k3a_bepaald_exact',
    nummer: 'bep-2',
    level: 1,
    latex: r`Bereken exact: $\displaystyle\int_{-1}^{\sqrt{3}} \dfrac{1}{x^{2} + 1}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{7}{12}\pi`,
    antwoord: '7/12 pi',
    alts: ['7pi/12', '(7/12)pi', '7/12pi'],
    integrand: '1 / (x^2 + 1)',
    primitieve: 'atan(x)',
    grenzen: [-1, Math.sqrt(3)],
    waarde: '7 * pi / 12',
    steps: bepaald({
      schil: SCHIL_STANDAARD,
      herschrijven: r`Er staat al precies de standaardvorm; alleen de grenzen zijn anders dan je gewend bent.`,
      primitieve: r`Primitiveer: $F(x) = \arctan(x)$.`,
      invullen: r`Vul de grenzen in: $\big[\arctan(x)\big]_{-1}^{\sqrt{3}} = \arctan\left(\sqrt{3}\right) - \arctan(-1) = \tfrac{1}{3}\pi - \left(-\tfrac{1}{4}\pi\right) = \tfrac{4}{12}\pi + \tfrac{3}{12}\pi = \tfrac{7}{12}\pi$. Let op de dubbele mintekens bij de ondergrens.`,
    }),
  },
  {
    cluster: 'k3a_bepaald_exact',
    nummer: 'bep-3',
    level: 2,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{\frac{1}{2}} \dfrac{2}{4x^{2} + 1}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{4}\pi`,
    antwoord: '1/4 pi',
    alts: ['pi/4', '(1/4)pi', '1/4pi'],
    integrand: '2 / (4 * x^2 + 1)',
    primitieve: 'atan(2 * x)',
    grenzen: [0, 0.5],
    waarde: 'pi / 4',
    steps: bepaald({
      schil: SCHIL_KERN,
      herschrijven: r`Schrijf de noemer als een kwadraat plus $1$: $4x^{2} + 1 = (2x)^{2} + 1$. De kern is $2x$, dus $a = 2$.`,
      primitieve: r`$\dfrac{1}{(2x)^{2} + 1}$ geeft $\tfrac{1}{2}\arctan(2x)$, en met de $2$ uit de teller erbij is $F(x) = \arctan(2x)$.`,
      invullen: r`Vul de grenzen in: $\big[\arctan(2x)\big]_{0}^{\frac{1}{2}} = \arctan(1) - \arctan(0) = \tfrac{1}{4}\pi$.`,
    }),
  },
  {
    cluster: 'k3a_bepaald_exact',
    nummer: 'bep-4',
    level: 2,
    latex: r`Bereken exact: $\displaystyle\int_{-1}^{\sqrt{3} - 1} \dfrac{1}{(x + 1)^{2} + 1}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{3}\pi`,
    antwoord: '1/3 pi',
    alts: ['pi/3', '(1/3)pi', '1/3pi'],
    integrand: '1 / ((x + 1)^2 + 1)',
    primitieve: 'atan(x + 1)',
    grenzen: [-1, Math.sqrt(3) - 1],
    waarde: 'pi / 3',
    steps: bepaald({
      schil: SCHIL_KERN,
      herschrijven: r`De kern is $x + 1$, dus $a = 1$: delen door $a$ verandert hier niets. De rare grenzen zijn een hint dat de kern straks mooie waarden aanneemt.`,
      primitieve: r`Primitiveer: $F(x) = \arctan(x + 1)$.`,
      invullen: r`Vul de grenzen in. Bij $x = \sqrt{3} - 1$ is de kern $\sqrt{3}$ en bij $x = -1$ is de kern $0$: $\big[\arctan(x + 1)\big]_{-1}^{\sqrt{3} - 1} = \arctan\left(\sqrt{3}\right) - \arctan(0) = \tfrac{1}{3}\pi$.`,
    }),
  },
  {
    cluster: 'k3a_bepaald_exact',
    nummer: 'bep-5',
    level: 3,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{\frac{1}{2}\ln(3)} \dfrac{\mathrm{e}^{x}}{\mathrm{e}^{2x} + 1}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{12}\pi`,
    antwoord: '1/12 pi',
    alts: ['pi/12', '(1/12)pi', '1/12pi'],
    integrand: 'e^x / (e^(2 * x) + 1)',
    primitieve: 'atan(e^x)',
    grenzen: [0, Math.log(3) / 2],
    waarde: 'pi / 12',
    steps: bepaald({
      schil: SCHIL_SUBSTITUTIE,
      herschrijven: r`Met $\mathrm{e}^{2x} = \left(\mathrm{e}^{x}\right)^{2}$ is de noemer $\left(\mathrm{e}^{x}\right)^{2} + 1$. Neem $g(x) = \mathrm{e}^{x}$; dan is $g'(x) = \mathrm{e}^{x}$ en dat staat in de teller.`,
      primitieve: r`Dus $\int \dfrac{1}{g^{2} + 1}\,\mathrm{d}g = \arctan(g)$, oftewel $F(x) = \arctan\left(\mathrm{e}^{x}\right)$.`,
      invullen: r`Vul de grenzen in. Bij $x = \tfrac{1}{2}\ln(3)$ is $\mathrm{e}^{x} = \mathrm{e}^{\frac{1}{2}\ln(3)} = \sqrt{3}$ en bij $x = 0$ is $\mathrm{e}^{x} = 1$: $\arctan\left(\sqrt{3}\right) - \arctan(1) = \tfrac{1}{3}\pi - \tfrac{1}{4}\pi = \tfrac{4}{12}\pi - \tfrac{3}{12}\pi = \tfrac{1}{12}\pi$.`,
    }),
  },
  {
    cluster: 'k3a_bepaald_exact',
    nummer: 'bep-6',
    level: 3,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{1} \dfrac{\arctan(x)}{x^{2} + 1}\,\mathrm{d}x$`,
    antwoordLatex: r`\dfrac{\pi^{2}}{32}`,
    antwoord: 'pi^2/32',
    alts: ['(1/32)pi^2', '1/32 pi^2', 'pi^2 / 32'],
    integrand: 'atan(x) / (x^2 + 1)',
    primitieve: '1/2 * atan(x)^2',
    grenzen: [0, 1],
    waarde: 'pi^2 / 32',
    steps: bepaald({
      schil: r`Buitenste schil: $\arctan(x)$ staat zelf in de teller en $\dfrac{1}{x^{2} + 1}$ is zijn eigen afgeleide → substitutie met $g(x) = \arctan(x)$.`,
      herschrijven: r`Neem $g(x) = \arctan(x)$, dan is $g'(x) = \dfrac{1}{x^{2} + 1}$ en staat er $\int g\,\mathrm{d}g$.`,
      primitieve: r`Primitiveer naar $g$: $\int g\,\mathrm{d}g = \tfrac{1}{2}g^{2}$, dus $F(x) = \tfrac{1}{2}\arctan^{2}(x)$.`,
      invullen: r`Vul de grenzen in: $\left[\tfrac{1}{2}\arctan^{2}(x)\right]_{0}^{1} = \tfrac{1}{2}\left(\tfrac{1}{4}\pi\right)^{2} - 0 = \tfrac{1}{2} \cdot \dfrac{\pi^{2}}{16} = \dfrac{\pi^{2}}{32}$.`,
    }),
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Hoofdstuk, topics en clusters
// ─────────────────────────────────────────────────────────────────────────────

const K3A: AdditiveChapter = {
  chapterSlug: 'k',
  chapterTitle: 'K — Voortgezette integraalrekening',
  bookPart: 4,
  chapterOrder: 12,
  site: 'integralen',
  migrationFile: '0040_k3a_arctangens.sql',
  headerTitle: 'K.3 Theorie A — De functie arctan',
  sourceScript: 'scripts/k3a-content.ts',
  headerNotes: [
    'De inverse van de tangens op ⟨-½π, ½π⟩, en de twee regels die daarbij horen:',
    '',
    '    1/(x² + 1) geeft arctan(x) + c      arctan(x) geeft 1/(x² + 1) als afgeleide',
    '',
    'Zes clusters: exacte waarden, vergelijkingen, differentiëren, de kale',
    'standaardvorm, een kern in de noemer, en bepaalde integralen.',
    '',
    'Kwadraatafsplitsen en het herschrijven van a/(px² + q) horen bij Theorie B en',
    'zitten hier dus niet in.',
    '',
    'Eigen topics en eigen clusters, zodat de controles aan het eind van de eerdere',
    'K-migraties blijven kloppen en die migraties herhaalbaar blijven.',
    '',
    'Eigen oefenvragen, geen boekopgaven. De 24 vragen met een integraal worden',
    'nagerekend door src/content/primitieven.test.ts (content/hoofdstuk-k/k3a.json);',
    'de 12 vragen over de functie zelf (waarden en vergelijkingen) hebben geen',
    'integraal en staan daar niet in.',
  ],
  topics: [
    {
      slug: 'k3a_arctangens',
      title: 'De functie arctan',
      order: 17,
      category: 'vergelijkingen',
    },
    {
      slug: 'k3a_primitiveren',
      title: 'Primitiveren met arctan',
      order: 18,
      category: 'primitiveren',
    },
    {
      slug: 'k3a_bepaald',
      title: 'Bepaalde integralen met arctan',
      order: 19,
      category: 'integralen',
    },
  ],
  clusters: [
    { topic: 'k3a_arctangens', slug: 'k3a_waarden', title: 'Exacte waarden van arctan', order: 1 },
    {
      topic: 'k3a_arctangens',
      slug: 'k3a_vergelijking',
      title: 'Vergelijkingen met arctan oplossen',
      order: 2,
    },
    {
      topic: 'k3a_primitiveren',
      slug: 'k3a_afgeleide',
      title: 'De afgeleide van arctan',
      order: 1,
    },
    {
      topic: 'k3a_primitiveren',
      slug: 'k3a_standaard',
      title: 'De standaardvorm 1/(x² + 1) primitiveren',
      order: 2,
    },
    { topic: 'k3a_primitiveren', slug: 'k3a_kern', title: 'Een kern in de noemer', order: 3 },
    {
      topic: 'k3a_bepaald',
      slug: 'k3a_bepaald_exact',
      title: 'Bepaalde integralen met arctan',
      order: 1,
    },
  ],
  questions: VRAGEN,
}

// ─────────────────────────────────────────────────────────────────────────────
// Schrijven
// ─────────────────────────────────────────────────────────────────────────────

const wortel = process.cwd()

const contentPad = path.join(wortel, 'content', 'hoofdstuk-k', 'k3a.json')
writeFileSync(
  contentPad,
  generateContentFile(K3A, 'K.3 Theorie A — De functie arctan (eigen varianten)'),
)

const migratiePad = path.join(wortel, 'supabase', 'migrations', K3A.migrationFile)
writeFileSync(migratiePad, generateAdditiveMigration(K3A))

const metIntegraal = K3A.questions.filter((q) => q.integrand !== undefined).length

console.log(`Geschreven: ${contentPad}`)
console.log(`Geschreven: ${migratiePad}`)
console.log(`Vragen: ${K3A.questions.length}, stappen: ${K3A.questions.length * 4}`)
console.log(`Daarvan nagerekend door de test: ${metIntegraal}`)
