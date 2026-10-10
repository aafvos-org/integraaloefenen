/**
 * K.3 Theorie C — De functie f(x) = arcsin(x).
 *
 * Het derde en laatste theorieblok van K.3. Dezelfde opbouw als bij arctan,
 * maar nu met de inverse van de sinus:
 *
 *     arcsin is de inverse van sin op [-½π, ½π]
 *     D = [-1, 1] en B = [-½π, ½π]
 *
 *     f(x) = 1/√(1 - x²)   geeft   F(x) = arcsin(x) + c
 *     g(x) = arcsin(x)     geeft   g'(x) = 1/√(1 - x²)
 *
 * Drie manieren om de standaardvorm tevoorschijn te halen:
 *
 *     1/√(1 - (ax)²)   → kern ax, dus na het primitiveren nog delen door a
 *     1/√(a² - x²)     → haal a buiten de wortel: a√(1 - (x/a)²)
 *     g'/√(1 - g²)     → substitutie, geeft arcsin(g) + c
 *
 * En één die uit K.2 komt: arcsin en arctan zelf primitiveren met partieel
 * integreren, door er zelf een product van te maken met h'(x) = 1.
 *
 * Draaien met:  npx jiti scripts/k3c-content.ts
 *
 * Schrijft twee bestanden:
 *   • content/hoofdstuk-k/k3c.json              — leest src/content/primitieven.test.ts
 *   • supabase/migrations/0042_k3c_arcsinus.sql — alleen rijen toevoegen
 *
 * Eigen topics en eigen clusters, zodat de controles aan het eind van de
 * eerdere K-migraties blijven kloppen en die migraties herhaalbaar blijven.
 *
 * Het kader over arccos (bladzijde 205) is in het boek informatief en hoort
 * niet bij de verplichte stof; daar zitten hier dus geen vragen over.
 *
 * Twee clusters gaan over de functie zelf (exacte waarden, vergelijkingen).
 * Daar zit geen integraal in, dus daar staat geen `integrand` en `primitieve`
 * bij en die zeven vragen komen niet in `content/`. De antwoorden daarvan zijn
 * met de hand nagerekend; zie de toelichting per vraag.
 *
 * Elke vraag met een integraal heeft een eigen `domein`: $\arcsin$ en
 * $\sqrt{1 - x^{2}}$ bestaan alleen op $[-1, 1]$, en het standaarddomein van de
 * test ($[-2,5;\ 2,5]$) levert daar complexe getallen op.
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

/** Binnen de eenheidscirkel: daar bestaan arcsin en √(1 - x²) allebei. */
const EENHEID: [number, number] = [-0.9, 0.9]

// ─────────────────────────────────────────────────────────────────────────────
// Vaste zinnen — dezelfde woorden als in de eerdere K-scripts
// ─────────────────────────────────────────────────────────────────────────────

const DEEL2 = r`Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal.`

const DEEL2_BEPAALD = `${DEEL2} Eerst een primitieve zoeken, daarna de grenzen invullen. Het antwoord blijft exact.`

/** Vragen over de functie zelf: geen integraal, alleen deel 3. */
const DEEL3 = r`Hier speelt alleen deel 3 van de driedeling: de goede oplossingsmethode gebruiken. Er staat geen integraal in deze opgave; je hebt alleen nodig wat $\arcsin$ betekent.`

/** Oppervlakte-opgaven: alle drie de delen van de driedeling. */
const DRIEDELING = r`Hier spelen alle drie de delen van de driedeling: eerst het verhaaltje vertalen naar een integraal (deel 1), dan die integraal berekenen (deel 2), en daarna nog iets doen met de uitkomst (deel 3).`

const WAT_IS_ARCSIN = r`$\arcsin(a)$ is de hoek $t$ met $\sin(t) = a$ én $-\tfrac{1}{2}\pi \le t \le \tfrac{1}{2}\pi$. Dat laatste stukje is de hele truc: er zijn oneindig veel hoeken met dezelfde sinus, maar $\arcsin$ kiest er altijd één uit dat gebied. En omdat een sinus nooit buiten $[-1, 1]$ komt, is dat ook meteen het domein van $\arcsin$.`

const TABEL = r`Uit de tabel die je uit het hoofd kent: $\sin\left(\tfrac{1}{6}\pi\right) = \tfrac{1}{2}$, $\sin\left(\tfrac{1}{4}\pi\right) = \tfrac{1}{2}\sqrt{2}$, $\sin\left(\tfrac{1}{3}\pi\right) = \tfrac{1}{2}\sqrt{3}$ en $\sin\left(\tfrac{1}{2}\pi\right) = 1$. Omdat $\sin$ oneven is, hoort bij een negatief getal dezelfde hoek met een minteken.`

/** De standaardvorm waar alles in dit blok op neerkomt. */
const STANDAARDVORM = r`$\dfrac{1}{\sqrt{1 - x^{2}}}$ geeft $\arcsin(x) + c$`

const SCHIL_STANDAARD = r`Buitenste schil: een breuk met $\sqrt{1 - (\ldots)^{2}}$ in de noemer → de standaardvorm ${STANDAARDVORM}. Lees eerst de kern af; de regel voor $f(ax + b)$ zegt dat je daarna nog door $a$ moet delen.`

const SCHIL_WORTEL = r`Buitenste schil: een breuk met $\sqrt{a^{2} - x^{2}}$ in de noemer → nog geen standaardvorm, want achter de $1$ hoort een min en vóór het kwadraat een $1$. Haal eerst $a$ buiten de wortel: $\sqrt{a^{2} - x^{2}} = a\sqrt{1 - \left(\tfrac{x}{a}\right)^{2}}$.`

const SCHIL_SUBSTITUTIE = r`Buitenste schil: onder de wortel staat $1$ min het kwadraat van iets anders dan $x$, en de afgeleide daarvan staat in de teller → substitutie. Met $\int \dfrac{g'}{\sqrt{1 - g^{2}}}\,\mathrm{d}x = \arcsin(g) + c$ ben je er in één stap.`

const SCHIL_PARTIEEL = r`Buitenste schil: een kale $\arcsin$ of $\arctan$ → partieel integreren. Die twee kun je niet zomaar primitiveren, maar wél differentiëren, dus zet ze op de plek van $g$ en maak er zelf een product van met $h'(x) = 1$.`

const REGEL_PARTIEEL = r`$\int g(x) \cdot h'(x)\,\mathrm{d}x = g(x) \cdot h(x) - \int h(x) \cdot g'(x)\,\mathrm{d}x$`

const REGEL_AXB = r`De regel voor $f(ax + b)$ zegt: primitiveer alsof er $x$ staat en deel daarna door $a$.`

const CONTROLE = r`Controle: differentieer $F$ en je krijgt $f$ terug.`

// ─────────────────────────────────────────────────────────────────────────────
// Stap-sjablonen
// ─────────────────────────────────────────────────────────────────────────────

/** Exacte waarde van arcsin: betekenis, tabel, antwoord. */
function waarde(s: { vraag: string; tabel: string; antwoord: string }): Steps {
  return [DEEL3, `${WAT_IS_ARCSIN} ${s.vraag}`, s.tabel, s.antwoord]
}

/** Vergelijking met arcsin: omschrijven naar sin, oplossen, nakijken. */
function vergelijking(s: { schil: string; omschrijven: string; oplossen: string; antwoord: string }): Steps {
  return [`${DEEL3} ${s.schil}`, s.omschrijven, s.oplossen, s.antwoord]
}

/** Primitiveren: schil, herschrijven, regel toepassen, antwoord. */
function primitiveren(s: { schil: string; herschrijven: string; regel: string; antwoord: string }): Steps {
  return [`${DEEL2} ${s.schil}`, s.herschrijven, s.regel, `${s.antwoord} ${CONTROLE}`]
}

/** Partieel integreren: schil, g en h kiezen, regel invullen, de rest-integraal. */
function partieel(s: { keuze: string; invullen: string; antwoord: string }): Steps {
  return [`${DEEL2} ${SCHIL_PARTIEEL}`, s.keuze, `Vul de regel in: ${REGEL_PARTIEEL}. ${s.invullen}`, s.antwoord]
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
  // ── Exacte waarden van arcsin ─────────────────────────────────────────────
  {
    cluster: 'k3c_waarden',
    nummer: 'waarde-1',
    level: 1,
    latex: r`Bereken exact: $\arcsin\left(\tfrac{1}{2}\sqrt{3}\right)$`,
    antwoordLatex: r`\tfrac{1}{3}\pi`,
    antwoord: '1/3 pi',
    alts: ['pi/3', '(1/3)pi', '1/3pi'],
    steps: waarde({
      vraag: r`De vraag is dus: welke hoek tussen $-\tfrac{1}{2}\pi$ en $\tfrac{1}{2}\pi$ heeft sinus $\tfrac{1}{2}\sqrt{3}$?`,
      tabel: TABEL,
      antwoord: r`$\sin\left(\tfrac{1}{3}\pi\right) = \tfrac{1}{2}\sqrt{3}$ en $\tfrac{1}{3}\pi$ ligt tussen $-\tfrac{1}{2}\pi$ en $\tfrac{1}{2}\pi$, dus $\arcsin\left(\tfrac{1}{2}\sqrt{3}\right) = \tfrac{1}{3}\pi$. Let op: $\tfrac{2}{3}\pi$ heeft dezelfde sinus, maar valt buiten het bereik.`,
    }),
  },
  {
    cluster: 'k3c_waarden',
    nummer: 'waarde-2',
    level: 2,
    latex: r`Bereken exact: $\arcsin\left(-\tfrac{1}{2}\sqrt{2}\right) + \arcsin(1)$`,
    antwoordLatex: r`\tfrac{1}{4}\pi`,
    antwoord: '1/4 pi',
    alts: ['pi/4', '(1/4)pi', '1/4pi'],
    steps: waarde({
      vraag: r`Zoek de twee hoeken apart op en tel ze daarna pas bij elkaar op.`,
      tabel: `${TABEL} Dus $\\arcsin\\left(-\\tfrac{1}{2}\\sqrt{2}\\right) = -\\tfrac{1}{4}\\pi$ en $\\arcsin(1) = \\tfrac{1}{2}\\pi$. Die laatste ligt nog net in het bereik, want dat is een gesloten interval.`,
      antwoord: r`Optellen: $-\tfrac{1}{4}\pi + \tfrac{1}{2}\pi = -\tfrac{1}{4}\pi + \tfrac{2}{4}\pi = \tfrac{1}{4}\pi$.`,
    }),
  },
  {
    cluster: 'k3c_waarden',
    nummer: 'waarde-3',
    level: 3,
    latex: r`Bereken exact: $\arcsin\left(\sin\left(\tfrac{5}{6}\pi\right)\right)$`,
    antwoordLatex: r`\tfrac{1}{6}\pi`,
    antwoord: '1/6 pi',
    alts: ['pi/6', '(1/6)pi', '1/6pi'],
    steps: waarde({
      vraag: r`Het ligt voor de hand om $\tfrac{5}{6}\pi$ te antwoorden, maar dat is fout: $\tfrac{5}{6}\pi$ ligt niet tussen $-\tfrac{1}{2}\pi$ en $\tfrac{1}{2}\pi$, en dat is wel waar $\arcsin$ altijd uitkomt. Reken daarom van binnen naar buiten.`,
      tabel: r`Eerst de binnenkant: $\sin\left(\tfrac{5}{6}\pi\right) = \sin\left(\pi - \tfrac{5}{6}\pi\right) = \sin\left(\tfrac{1}{6}\pi\right) = \tfrac{1}{2}$, want twee hoeken die samen $\pi$ zijn hebben dezelfde sinus.`,
      antwoord: r`Dan de buitenkant: $\arcsin\left(\tfrac{1}{2}\right) = \tfrac{1}{6}\pi$. Die hoek ligt wél in het bereik. Dus $\arcsin\left(\sin\left(\tfrac{5}{6}\pi\right)\right) = \tfrac{1}{6}\pi$, en niet $\tfrac{5}{6}\pi$. Andersom, $\sin(\arcsin(a))$, gaat altijd goed zolang $a$ tussen $-1$ en $1$ ligt.`,
    }),
  },

  // ── Vergelijkingen met arcsin ─────────────────────────────────────────────
  {
    cluster: 'k3c_vergelijking',
    nummer: 'verg-1',
    level: 1,
    latex: r`Los exact op: $\arcsin(x) = \tfrac{1}{6}\pi$`,
    antwoordLatex: r`x = \tfrac{1}{2}`,
    antwoord: '1/2',
    alts: ['x = 1/2', '0,5', 'x = 0,5', '0.5'],
    steps: vergelijking({
      schil: r`Buitenste schil: $\arcsin$ van iets is gelijk aan een hoek → neem aan beide kanten de sinus.`,
      omschrijven: r`Omdat $\arcsin$ en $\sin$ elkaars inverse zijn, is $\arcsin(x) = \tfrac{1}{6}\pi$ hetzelfde als $x = \sin\left(\tfrac{1}{6}\pi\right)$.`,
      oplossen: r`Controleer eerst of de rechterkant kán: $\tfrac{1}{6}\pi$ ligt tussen $-\tfrac{1}{2}\pi$ en $\tfrac{1}{2}\pi$, dus er is een oplossing. Uit de tabel: $\sin\left(\tfrac{1}{6}\pi\right) = \tfrac{1}{2}$.`,
      antwoord: r`Dus $x = \tfrac{1}{2}$. Die ligt netjes in $[-1, 1]$, het domein van $\arcsin$.`,
    }),
  },
  {
    cluster: 'k3c_vergelijking',
    nummer: 'verg-2',
    level: 1,
    latex: r`Los op: $\arcsin(x) = \tfrac{4}{5}\pi$`,
    antwoordLatex: r`\text{geen oplossing}`,
    antwoord: 'geen oplossing',
    alts: ['er is geen oplossing', 'geen', 'geen oplossingen'],
    steps: vergelijking({
      schil: r`Buitenste schil: $\arcsin$ van iets is gelijk aan een hoek → kijk eerst of die hoek überhaupt kan.`,
      omschrijven: r`Het bereik van $\arcsin$ is $\left[-\tfrac{1}{2}\pi, \tfrac{1}{2}\pi\right]$: wat je ook invult, er komt altijd een hoek tussen $-\tfrac{1}{2}\pi$ en $\tfrac{1}{2}\pi$ uit.`,
      oplossen: r`En $\tfrac{4}{5}\pi$ is groter dan $\tfrac{1}{2}\pi$, dus die waarde wordt nooit bereikt.`,
      antwoord: r`De vergelijking heeft geen oplossing. Val niet in de val om $x = \sin\left(\tfrac{4}{5}\pi\right)$ op te schrijven: dat getal bestaat wel, maar zijn $\arcsin$ is $\tfrac{1}{5}\pi$ en niet $\tfrac{4}{5}\pi$.`,
    }),
  },
  {
    cluster: 'k3c_vergelijking',
    nummer: 'verg-3',
    level: 2,
    latex: r`Los exact op: $2\arcsin(x + 1) = \tfrac{2}{3}\pi$`,
    antwoordLatex: r`x = \tfrac{1}{2}\sqrt{3} - 1`,
    antwoord: '1/2 sqrt(3) - 1',
    alts: ['x = 1/2 sqrt(3) - 1', 'sqrt(3)/2 - 1', 'x = sqrt(3)/2 - 1', '-1 + 1/2 sqrt(3)'],
    steps: vergelijking({
      schil: r`Buitenste schil: er staat een getal vóór de $\arcsin$ → maak eerst de $\arcsin$ alleen, daarna de kern, en pas als laatste $x$.`,
      omschrijven: r`Deel beide kanten door $2$: $\arcsin(x + 1) = \tfrac{1}{3}\pi$. Sinus nemen aan beide kanten geeft $x + 1 = \sin\left(\tfrac{1}{3}\pi\right)$.`,
      oplossen: r`$\tfrac{1}{3}\pi$ ligt in het bereik van $\arcsin$, dus er is een oplossing, en $\sin\left(\tfrac{1}{3}\pi\right) = \tfrac{1}{2}\sqrt{3}$. Dus $x + 1 = \tfrac{1}{2}\sqrt{3}$.`,
      antwoord: r`Haal er $1$ af: $x = \tfrac{1}{2}\sqrt{3} - 1 \approx -0{,}13$. Controleer de kern: $x + 1 = \tfrac{1}{2}\sqrt{3} \approx 0{,}87$ ligt in $[-1, 1]$, dus het antwoord mag.`,
    }),
  },
  {
    cluster: 'k3c_vergelijking',
    nummer: 'verg-4',
    level: 3,
    latex: r`Los exact op: $\arcsin\left(x^{2} - 1\right) = -\tfrac{1}{6}\pi$`,
    antwoordLatex: r`x = \tfrac{1}{2}\sqrt{2} \ \vee \ x = -\tfrac{1}{2}\sqrt{2}`,
    antwoord: 'x = 1/2 sqrt(2) of x = -1/2 sqrt(2)',
    alts: [
      'x = -1/2 sqrt(2) of x = 1/2 sqrt(2)',
      '1/2 sqrt(2) of -1/2 sqrt(2)',
      'x = ±1/2 sqrt(2)',
      'x = sqrt(2)/2 of x = -sqrt(2)/2',
    ],
    steps: vergelijking({
      schil: r`Buitenste schil: $\arcsin$ van een kern is gelijk aan een hoek → eerst de kern vrijmaken. De kern is hier een kwadraat min een getal, dus let op: dat geeft straks twee oplossingen.`,
      omschrijven: r`Sinus nemen aan beide kanten: $x^{2} - 1 = \sin\left(-\tfrac{1}{6}\pi\right) = -\tfrac{1}{2}$.`,
      oplossen: r`Dus $x^{2} = 1 - \tfrac{1}{2} = \tfrac{1}{2}$. Een kwadraat gelijk aan een positief getal geeft twee oplossingen: $x = \sqrt{\tfrac{1}{2}} = \tfrac{1}{2}\sqrt{2}$ of $x = -\tfrac{1}{2}\sqrt{2}$.`,
      antwoord: r`Dus $x = \tfrac{1}{2}\sqrt{2} \ \vee \ x = -\tfrac{1}{2}\sqrt{2}$. Allebei kloppen ze, want $\left(\pm\tfrac{1}{2}\sqrt{2}\right)^{2} - 1 = \tfrac{1}{2} - 1 = -\tfrac{1}{2}$, en dat ligt in $[-1, 1]$.`,
    }),
  },

  // ── De standaardvorm 1/√(1 - x²) ──────────────────────────────────────────
  {
    cluster: 'k3c_standaard',
    nummer: 'st-1',
    level: 1,
    latex: r`Primitiveer: $f(x) = \dfrac{3}{\sqrt{1 - x^{2}}}$`,
    antwoordLatex: r`F(x) = 3\arcsin(x) + c`,
    antwoord: '3arcsin(x) + c',
    alts: ['3 arcsin(x) + c', '3asin(x) + c', '3 asin(x) + c'],
    integrand: '3 / sqrt(1 - x^2)',
    primitieve: '3 * asin(x)',
    domein: EENHEID,
    steps: primitiveren({
      schil: SCHIL_STANDAARD,
      herschrijven: r`Onder de wortel staat al kaal $1 - x^{2}$, dus de kern is $x$ en $a = 1$: er valt niets te herschrijven. Het getal $3$ zet je zolang buiten de integraal: $\int \dfrac{3}{\sqrt{1 - x^{2}}}\,\mathrm{d}x = 3\int \dfrac{1}{\sqrt{1 - x^{2}}}\,\mathrm{d}x$.`,
      regel: r`De standaardvorm ${STANDAARDVORM} geeft $\arcsin(x)$. Omdat $a = 1$ is, hoef je niet te delen.`,
      antwoord: r`Zet de $3$ er weer voor: $F(x) = 3\arcsin(x) + c$.`,
    }),
  },
  {
    cluster: 'k3c_standaard',
    nummer: 'st-2',
    level: 1,
    latex: r`Primitiveer: $f(x) = \dfrac{1}{\sqrt{1 - 16x^{2}}}$`,
    antwoordLatex: r`F(x) = \tfrac{1}{4}\arcsin(4x) + c`,
    antwoord: '1/4 arcsin(4x) + c',
    alts: ['arcsin(4x)/4 + c', '(1/4)arcsin(4x) + c', '1/4 asin(4x) + c', '0,25 arcsin(4x) + c'],
    integrand: '1 / sqrt(1 - 16 * x^2)',
    primitieve: '1/4 * asin(4 * x)',
    domein: [-0.2, 0.2],
    steps: primitiveren({
      schil: SCHIL_STANDAARD,
      herschrijven: r`Schrijf $16x^{2}$ als een kwadraat: $16x^{2} = (4x)^{2}$. Er staat dus $\dfrac{1}{\sqrt{1 - (4x)^{2}}}$, met kern $4x$ en $a = 4$.`,
      regel: r`De standaardvorm geeft $\arcsin(4x)$. ${REGEL_AXB} Hier is $a = 4$, dus er komt $\tfrac{1}{4}$ voor.`,
      antwoord: r`Dus $F(x) = \tfrac{1}{4}\arcsin(4x) + c$.`,
    }),
  },
  {
    cluster: 'k3c_standaard',
    nummer: 'st-3',
    level: 2,
    latex: r`Primitiveer: $f(x) = \dfrac{1}{\sqrt{4 - x^{2}}}$`,
    antwoordLatex: r`F(x) = \arcsin\left(\tfrac{1}{2}x\right) + c`,
    antwoord: 'arcsin(1/2 x) + c',
    alts: ['arcsin(x/2) + c', 'asin(x/2) + c', 'asin(1/2 x) + c'],
    integrand: '1 / sqrt(4 - x^2)',
    primitieve: 'asin(x / 2)',
    domein: [-1.8, 1.8],
    steps: primitiveren({
      schil: SCHIL_WORTEL,
      herschrijven: r`Haal de $2$ buiten de wortel: $\sqrt{4 - x^{2}} = \sqrt{4\left(1 - \tfrac{x^{2}}{4}\right)} = 2\sqrt{1 - \left(\tfrac{1}{2}x\right)^{2}}$. Dus $f(x) = \dfrac{\tfrac{1}{2}}{\sqrt{1 - \left(\tfrac{1}{2}x\right)^{2}}}$, met kern $\tfrac{1}{2}x$ en $a = \tfrac{1}{2}$.`,
      regel: r`De standaardvorm geeft $\arcsin\left(\tfrac{1}{2}x\right)$. ${REGEL_AXB} Delen door $\tfrac{1}{2}$ is vermenigvuldigen met $2$, dus $\dfrac{1}{\sqrt{1 - \left(\frac{1}{2}x\right)^{2}}}$ geeft $2\arcsin\left(\tfrac{1}{2}x\right)$.`,
      antwoord: r`Zet de $\tfrac{1}{2}$ er weer voor: $F(x) = \tfrac{1}{2} \cdot 2\arcsin\left(\tfrac{1}{2}x\right) + c = \arcsin\left(\tfrac{1}{2}x\right) + c$. De twee factoren vallen tegen elkaar weg — dat is bij $\dfrac{1}{\sqrt{a^{2} - x^{2}}}$ altijd zo.`,
    }),
  },
  {
    cluster: 'k3c_standaard',
    nummer: 'st-4',
    level: 2,
    latex: r`Primitiveer: $f(x) = \dfrac{6}{\sqrt{9 - 4x^{2}}}$`,
    antwoordLatex: r`F(x) = 3\arcsin\left(\tfrac{2}{3}x\right) + c`,
    antwoord: '3arcsin(2/3 x) + c',
    alts: ['3 arcsin(2x/3) + c', '3arcsin(2x/3) + c', '3 asin(2x/3) + c', '3asin(2/3 x) + c'],
    integrand: '6 / sqrt(9 - 4 * x^2)',
    primitieve: '3 * asin(2 * x / 3)',
    domein: [-1.3, 1.3],
    steps: primitiveren({
      schil: SCHIL_WORTEL,
      herschrijven: r`Haal de $9$ buiten de wortel: $\sqrt{9 - 4x^{2}} = 3\sqrt{1 - \tfrac{4x^{2}}{9}} = 3\sqrt{1 - \left(\tfrac{2}{3}x\right)^{2}}$, want $\tfrac{4x^{2}}{9} = \left(\tfrac{2}{3}x\right)^{2}$. Dus $f(x) = \dfrac{2}{\sqrt{1 - \left(\frac{2}{3}x\right)^{2}}}$, met kern $\tfrac{2}{3}x$ en $a = \tfrac{2}{3}$.`,
      regel: r`De standaardvorm geeft $\arcsin\left(\tfrac{2}{3}x\right)$. ${REGEL_AXB} Delen door $\tfrac{2}{3}$ is vermenigvuldigen met $\tfrac{3}{2}$, dus er komt $\tfrac{3}{2}\arcsin\left(\tfrac{2}{3}x\right)$.`,
      antwoord: r`Zet de $2$ er weer voor: $F(x) = 2 \cdot \tfrac{3}{2}\arcsin\left(\tfrac{2}{3}x\right) + c = 3\arcsin\left(\tfrac{2}{3}x\right) + c$.`,
    }),
  },
  {
    cluster: 'k3c_standaard',
    nummer: 'st-5',
    level: 3,
    latex: r`Primitiveer: $f(x) = \dfrac{1}{\sqrt{4x - x^{2} - 3}}$`,
    antwoordLatex: r`F(x) = \arcsin(x - 2) + c`,
    antwoord: 'arcsin(x - 2) + c',
    alts: ['asin(x - 2) + c', 'arcsin(x-2) + c'],
    integrand: '1 / sqrt(4 * x - x^2 - 3)',
    primitieve: 'asin(x - 2)',
    domein: [1.2, 2.8],
    steps: primitiveren({
      schil: r`Buitenste schil: onder de wortel staat een polynoom waar geen kwadraat in te zien is → eerst kwadraatafsplitsen, net als bij $\arctan$, en dan pas kijken welke standaardvorm erbij hoort.`,
      herschrijven: r`Zet de termen op volgorde en haal $-1$ buiten haakjes: $4x - x^{2} - 3 = -\left(x^{2} - 4x + 3\right)$. Kwadraatafsplitsen: de helft van $-4$ is $-2$, dus $x^{2} - 4x + 3 = (x - 2)^{2} - 1$. Samen: $4x - x^{2} - 3 = -\left((x - 2)^{2} - 1\right) = 1 - (x - 2)^{2}$.`,
      regel: r`Er staat nu $f(x) = \dfrac{1}{\sqrt{1 - (x - 2)^{2}}}$: precies de standaardvorm, met kern $x - 2$ en $a = 1$. ${REGEL_AXB} Hier is $a = 1$, dus delen verandert niets.`,
      antwoord: r`Dus $F(x) = \arcsin(x - 2) + c$. Dit bestaat alleen waar $-1 \le x - 2 \le 1$, dus voor $1 \le x \le 3$ — en daarbuiten is de wortel ook niet te trekken.`,
    }),
  },

  // ── Een kern onder de wortel: substitutie ─────────────────────────────────
  {
    cluster: 'k3c_kern',
    nummer: 'kn-1',
    level: 1,
    latex: r`Primitiveer: $f(x) = \dfrac{2x}{\sqrt{1 - x^{4}}}$`,
    antwoordLatex: r`F(x) = \arcsin\left(x^{2}\right) + c`,
    antwoord: 'arcsin(x^2) + c',
    alts: ['asin(x^2) + c', 'arcsin(x²) + c'],
    integrand: '2 * x / sqrt(1 - x^4)',
    primitieve: 'asin(x^2)',
    domein: EENHEID,
    steps: primitiveren({
      schil: SCHIL_SUBSTITUTIE,
      herschrijven: r`$x^{4}$ is het kwadraat van $x^{2}$, dus er staat $\dfrac{2x}{\sqrt{1 - \left(x^{2}\right)^{2}}}$. Neem $g(x) = x^{2}$; dan is $g'(x) = 2x$, en dat staat precies in de teller.`,
      regel: r`Naar $g$ staat er dus $\int \dfrac{1}{\sqrt{1 - g^{2}}}\,\mathrm{d}g$, en dat is de standaardvorm: $\arcsin(g)$.`,
      antwoord: r`Schrijf $g$ terug: $F(x) = \arcsin\left(x^{2}\right) + c$.`,
    }),
  },
  {
    cluster: 'k3c_kern',
    nummer: 'kn-2',
    level: 2,
    latex: r`Primitiveer: $f(x) = \dfrac{\mathrm{e}^{x}}{\sqrt{1 - \mathrm{e}^{2x}}}$`,
    antwoordLatex: r`F(x) = \arcsin\left(\mathrm{e}^{x}\right) + c`,
    antwoord: 'arcsin(e^x) + c',
    alts: ['asin(e^x) + c', 'arcsin(e^(x)) + c'],
    integrand: 'e^x / sqrt(1 - e^(2 * x))',
    primitieve: 'asin(e^x)',
    domein: [-3, -0.2],
    steps: primitiveren({
      schil: SCHIL_SUBSTITUTIE,
      herschrijven: r`Schrijf $\mathrm{e}^{2x}$ als een kwadraat: $\mathrm{e}^{2x} = \left(\mathrm{e}^{x}\right)^{2}$. Neem $g(x) = \mathrm{e}^{x}$; dan is $g'(x) = \mathrm{e}^{x}$ — de e-macht is zijn eigen afgeleide — en die staat in de teller.`,
      regel: r`Naar $g$ staat er $\int \dfrac{1}{\sqrt{1 - g^{2}}}\,\mathrm{d}g = \arcsin(g)$.`,
      antwoord: r`Schrijf $g$ terug: $F(x) = \arcsin\left(\mathrm{e}^{x}\right) + c$. Dit bestaat alleen waar $\mathrm{e}^{x} \le 1$, dus voor $x \le 0$.`,
    }),
  },
  {
    cluster: 'k3c_kern',
    nummer: 'kn-3',
    level: 3,
    latex: r`Primitiveer: $f(x) = \dfrac{\arcsin^{2}(x)}{\sqrt{1 - x^{2}}}$`,
    antwoordLatex: r`F(x) = \tfrac{1}{3}\arcsin^{3}(x) + c`,
    antwoord: '1/3 arcsin^3(x) + c',
    alts: ['arcsin(x)^3/3 + c', '1/3 arcsin(x)^3 + c', '(1/3)asin(x)^3 + c', '1/3 asin^3(x) + c'],
    integrand: 'asin(x)^2 / sqrt(1 - x^2)',
    primitieve: '1/3 * asin(x)^3',
    domein: EENHEID,
    steps: primitiveren({
      schil: r`Buitenste schil: $\arcsin(x)$ staat zelf in de teller en $\dfrac{1}{\sqrt{1 - x^{2}}}$ is zijn eigen afgeleide → substitutie met $g(x) = \arcsin(x)$.`,
      herschrijven: r`Neem $g(x) = \arcsin(x)$, dan is $g'(x) = \dfrac{1}{\sqrt{1 - x^{2}}}$. Er staat dus $f(x) = g^{2} \cdot g'$.`,
      regel: r`Primitiveer naar $g$ met de machtsregel: $\int g^{2}\,\mathrm{d}g = \tfrac{1}{3}g^{3}$.`,
      antwoord: r`Schrijf $g$ terug: $F(x) = \tfrac{1}{3}\arcsin^{3}(x) + c$. Hier komt dus géén nieuwe $\arcsin$ bij; de $\arcsin$ die er al stond is de kern.`,
    }),
  },
  {
    cluster: 'k3c_kern',
    nummer: 'kn-4',
    level: 3,
    latex: r`Primitiveer: $f(x) = \dfrac{1}{x\sqrt{4 - \ln^{2}(x)}}$`,
    antwoordLatex: r`F(x) = \arcsin\left(\tfrac{1}{2}\ln(x)\right) + c`,
    antwoord: 'arcsin(1/2 ln(x)) + c',
    alts: ['arcsin(ln(x)/2) + c', 'asin(ln(x)/2) + c', 'asin(1/2 ln(x)) + c'],
    integrand: '1 / (x * sqrt(4 - ln(x)^2))',
    primitieve: 'asin(ln(x) / 2)',
    domein: [0.3, 6],
    steps: primitiveren({
      schil: r`Buitenste schil: onder de wortel staat $\ln^{2}(x)$ en de afgeleide van $\ln(x)$ is $\tfrac{1}{x}$, en die staat als factor vooraan → substitutie. Maar de wortel is nog niet van de vorm $\sqrt{1 - g^{2}}$, dus eerst de $4$ eruit halen.`,
      herschrijven: r`Haal de $4$ buiten de wortel: $\sqrt{4 - \ln^{2}(x)} = 2\sqrt{1 - \left(\tfrac{1}{2}\ln(x)\right)^{2}}$. Neem $g(x) = \tfrac{1}{2}\ln(x)$, dan is $g'(x) = \dfrac{1}{2x}$. Er staat dus $f(x) = \dfrac{\tfrac{1}{2x}}{\sqrt{1 - g^{2}}} = \dfrac{g'}{\sqrt{1 - g^{2}}}$.`,
      regel: r`Dat is de standaardvorm naar $g$: $\int \dfrac{g'}{\sqrt{1 - g^{2}}}\,\mathrm{d}x = \arcsin(g)$.`,
      antwoord: r`Schrijf $g$ terug: $F(x) = \arcsin\left(\tfrac{1}{2}\ln(x)\right) + c$. Dit bestaat alleen waar $-2 \le \ln(x) \le 2$, dus voor $\mathrm{e}^{-2} \le x \le \mathrm{e}^{2}$.`,
    }),
  },

  // ── Partieel integreren: arcsin en arctan zelf ────────────────────────────
  {
    cluster: 'k3c_partieel',
    nummer: 'pt-1',
    level: 1,
    latex: r`Primitiveer met behulp van partieel integreren: $f(x) = \arcsin(2x)$`,
    antwoordLatex: r`F(x) = x\arcsin(2x) + \tfrac{1}{2}\sqrt{1 - 4x^{2}} + c`,
    antwoord: 'x arcsin(2x) + 1/2 sqrt(1 - 4x^2) + c',
    alts: [
      'x asin(2x) + 1/2 sqrt(1 - 4x^2) + c',
      'x arcsin(2x) + sqrt(1 - 4x^2)/2 + c',
      'x*arcsin(2x) + 1/2*sqrt(1-4x^2) + c',
    ],
    integrand: 'asin(2 * x)',
    primitieve: 'x * asin(2 * x) + 1/2 * sqrt(1 - 4 * x^2)',
    domein: [-0.4, 0.4],
    steps: partieel({
      keuze: r`Er staat maar één factor, dus maak er zelf een product van: $h'(x) = 1$, dus $h(x) = x$, en $g(x) = \arcsin(2x)$. Met de kettingregel is $g'(x) = \dfrac{2}{\sqrt{1 - 4x^{2}}}$.`,
      invullen: r`Dat geeft $\int \arcsin(2x)\,\mathrm{d}x = x\arcsin(2x) - \int \dfrac{2x}{\sqrt{1 - 4x^{2}}}\,\mathrm{d}x$. De nieuwe integraal is makkelijker: er staat een $x$ in de teller en $x^{2}$ onder de wortel.`,
      antwoord: r`Die laatste integraal is $-\tfrac{1}{2}\sqrt{1 - 4x^{2}}$, want $\left[\sqrt{1 - 4x^{2}}\right]' = \dfrac{-4x}{\sqrt{1 - 4x^{2}}}$ en dat is $-2$ keer de integrand. Met het minteken ervoor wordt het een plus: $F(x) = x\arcsin(2x) + \tfrac{1}{2}\sqrt{1 - 4x^{2}} + c$. ${CONTROLE}`,
    }),
  },
  {
    cluster: 'k3c_partieel',
    nummer: 'pt-2',
    level: 2,
    latex: r`Primitiveer met behulp van partieel integreren: $f(x) = \arctan(3x)$`,
    antwoordLatex: r`F(x) = x\arctan(3x) - \tfrac{1}{6}\ln\left(9x^{2} + 1\right) + c`,
    antwoord: 'x arctan(3x) - 1/6 ln(9x^2 + 1) + c',
    alts: [
      'x atan(3x) - 1/6 ln(9x^2 + 1) + c',
      'x arctan(3x) - ln(9x^2 + 1)/6 + c',
      'x*arctan(3x) - 1/6*ln(9x^2+1) + c',
    ],
    integrand: 'atan(3 * x)',
    primitieve: 'x * atan(3 * x) - 1/6 * ln(9 * x^2 + 1)',
    steps: partieel({
      keuze: r`Weer één factor, dus weer $h'(x) = 1$ en $h(x) = x$, met $g(x) = \arctan(3x)$. Met de kettingregel is $g'(x) = \dfrac{3}{9x^{2} + 1}$.`,
      invullen: r`Dat geeft $\int \arctan(3x)\,\mathrm{d}x = x\arctan(3x) - \int \dfrac{3x}{9x^{2} + 1}\,\mathrm{d}x$.`,
      antwoord: r`In die laatste integraal staat de afgeleide van de noemer bijna in de teller: $\left[9x^{2} + 1\right]' = 18x$, en $3x$ is daar $\tfrac{1}{6}$ van. Dus $\int \dfrac{3x}{9x^{2} + 1}\,\mathrm{d}x = \tfrac{1}{6}\ln\left(9x^{2} + 1\right)$ — een logaritme, geen arctangens, want de teller is de afgeleide van de noemer. Samen: $F(x) = x\arctan(3x) - \tfrac{1}{6}\ln\left(9x^{2} + 1\right) + c$. ${CONTROLE}`,
    }),
  },
  {
    cluster: 'k3c_partieel',
    nummer: 'pt-3',
    level: 3,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{1} \arcsin(x)\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{2}\pi - 1`,
    antwoord: '1/2 pi - 1',
    alts: ['pi/2 - 1', '(1/2)pi - 1', '-1 + 1/2 pi', '1/2pi - 1'],
    integrand: 'asin(x)',
    primitieve: 'x * asin(x) + sqrt(1 - x^2)',
    domein: EENHEID,
    grenzen: [0, 1],
    waarde: 'pi / 2 - 1',
    steps: [
      `${DEEL2_BEPAALD} ${SCHIL_PARTIEEL}`,
      r`Maak er een product van: $h'(x) = 1$, dus $h(x) = x$, en $g(x) = \arcsin(x)$ met $g'(x) = \dfrac{1}{\sqrt{1 - x^{2}}}$.`,
      r`Vul de regel in: ${REGEL_PARTIEEL}. Dat geeft $\int \arcsin(x)\,\mathrm{d}x = x\arcsin(x) - \int \dfrac{x}{\sqrt{1 - x^{2}}}\,\mathrm{d}x$. Die laatste integraal is $-\sqrt{1 - x^{2}}$, want $\left[\sqrt{1 - x^{2}}\right]' = \dfrac{-x}{\sqrt{1 - x^{2}}}$. De twee mintekens maken er een plus van: $F(x) = x\arcsin(x) + \sqrt{1 - x^{2}}$.`,
      r`Vul de grenzen in: $\left[x\arcsin(x) + \sqrt{1 - x^{2}}\right]_{0}^{1} = \left(1 \cdot \tfrac{1}{2}\pi + 0\right) - \left(0 + 1\right) = \tfrac{1}{2}\pi - 1$. Bij $x = 1$ is de wortel $0$ en bij $x = 0$ is de $\arcsin$-term $0$, dus er blijft van allebei maar één stuk over.`,
    ],
  },

  // ── Bepaalde integralen met arcsin ────────────────────────────────────────
  {
    cluster: 'k3c_bepaald_exact',
    nummer: 'bp-1',
    level: 1,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{\frac{1}{2}\sqrt{2}} \dfrac{1}{\sqrt{1 - x^{2}}}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{4}\pi`,
    antwoord: '1/4 pi',
    alts: ['pi/4', '(1/4)pi', '1/4pi'],
    integrand: '1 / sqrt(1 - x^2)',
    primitieve: 'asin(x)',
    domein: EENHEID,
    grenzen: [0, Math.SQRT1_2],
    waarde: 'pi / 4',
    steps: bepaald({
      schil: SCHIL_STANDAARD,
      herschrijven: r`Er staat al precies de standaardvorm: kern $x$ en $a = 1$. De rare bovengrens is een hint dat er straks een mooie waarde uit de tabel komt.`,
      primitieve: r`Een primitieve is $F(x) = \arcsin(x)$, zonder integratieconstante — bij een bepaalde integraal valt die toch weg.`,
      invullen: r`Vul de grenzen in: $\big[\arcsin(x)\big]_{0}^{\frac{1}{2}\sqrt{2}} = \arcsin\left(\tfrac{1}{2}\sqrt{2}\right) - \arcsin(0) = \tfrac{1}{4}\pi - 0 = \tfrac{1}{4}\pi$.`,
    }),
  },
  {
    cluster: 'k3c_bepaald_exact',
    nummer: 'bp-2',
    level: 2,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{\frac{1}{4}} \dfrac{1}{\sqrt{1 - 4x^{2}}}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{12}\pi`,
    antwoord: '1/12 pi',
    alts: ['pi/12', '(1/12)pi', '1/12pi'],
    integrand: '1 / sqrt(1 - 4 * x^2)',
    primitieve: '1/2 * asin(2 * x)',
    domein: [-0.45, 0.45],
    grenzen: [0, 0.25],
    waarde: 'pi / 12',
    steps: bepaald({
      schil: SCHIL_STANDAARD,
      herschrijven: r`$4x^{2} = (2x)^{2}$, dus er staat $\dfrac{1}{\sqrt{1 - (2x)^{2}}}$: kern $2x$ met $a = 2$.`,
      primitieve: r`${REGEL_AXB} Delen door $2$ geeft $F(x) = \tfrac{1}{2}\arcsin(2x)$.`,
      invullen: r`Vul de grenzen in. Bij $x = \tfrac{1}{4}$ is de kern $\tfrac{1}{2}$ en bij $x = 0$ is de kern $0$: $\tfrac{1}{2}\arcsin\left(\tfrac{1}{2}\right) - \tfrac{1}{2}\arcsin(0) = \tfrac{1}{2} \cdot \tfrac{1}{6}\pi = \tfrac{1}{12}\pi$.`,
    }),
  },
  {
    cluster: 'k3c_bepaald_exact',
    nummer: 'bp-3',
    level: 2,
    latex: r`Bereken exact: $\displaystyle\int_{-2}^{2} \dfrac{1}{\sqrt{16 - x^{2}}}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{3}\pi`,
    antwoord: '1/3 pi',
    alts: ['pi/3', '(1/3)pi', '1/3pi'],
    integrand: '1 / sqrt(16 - x^2)',
    primitieve: 'asin(x / 4)',
    domein: [-3.5, 3.5],
    grenzen: [-2, 2],
    waarde: 'pi / 3',
    steps: bepaald({
      schil: SCHIL_WORTEL,
      herschrijven: r`Haal de $4$ buiten de wortel: $\sqrt{16 - x^{2}} = 4\sqrt{1 - \left(\tfrac{1}{4}x\right)^{2}}$. Dus de integrand is $\dfrac{\tfrac{1}{4}}{\sqrt{1 - \left(\frac{1}{4}x\right)^{2}}}$, met kern $\tfrac{1}{4}x$ en $a = \tfrac{1}{4}$.`,
      primitieve: r`Delen door $\tfrac{1}{4}$ is vermenigvuldigen met $4$, dus $\tfrac{1}{4} \cdot 4\arcsin\left(\tfrac{1}{4}x\right) = \arcsin\left(\tfrac{1}{4}x\right)$: $F(x) = \arcsin\left(\tfrac{1}{4}x\right)$.`,
      invullen: r`Vul de grenzen in. Bij $x = 2$ is de kern $\tfrac{1}{2}$ en bij $x = -2$ is de kern $-\tfrac{1}{2}$: $\arcsin\left(\tfrac{1}{2}\right) - \arcsin\left(-\tfrac{1}{2}\right) = \tfrac{1}{6}\pi + \tfrac{1}{6}\pi = \tfrac{1}{3}\pi$. Let op het dubbele minteken bij de ondergrens.`,
    }),
  },
  {
    cluster: 'k3c_bepaald_exact',
    nummer: 'bp-4',
    level: 3,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{\frac{1}{2}\sqrt{6}} \dfrac{x}{\sqrt{9 - x^{4}}}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{12}\pi`,
    antwoord: '1/12 pi',
    alts: ['pi/12', '(1/12)pi', '1/12pi'],
    integrand: 'x / sqrt(9 - x^4)',
    primitieve: '1/2 * asin(x^2 / 3)',
    domein: [-1.7, 1.7],
    grenzen: [0, Math.sqrt(6) / 2],
    waarde: 'pi / 12',
    steps: bepaald({
      schil: r`Buitenste schil: onder de wortel staat een getal min $x^{4}$, en in de teller staat een $x$ → eerst het getal buiten de wortel halen, daarna substitueren.`,
      herschrijven: r`Haal de $3$ buiten de wortel: $\sqrt{9 - x^{4}} = 3\sqrt{1 - \left(\tfrac{x^{2}}{3}\right)^{2}}$, want $\tfrac{x^{4}}{9} = \left(\tfrac{x^{2}}{3}\right)^{2}$. Neem $g(x) = \tfrac{x^{2}}{3}$, dan is $g'(x) = \tfrac{2}{3}x$. In de teller staat $\tfrac{1}{3}x$, en dat is $\tfrac{1}{2}g'$.`,
      primitieve: r`Naar $g$ staat er dus $\tfrac{1}{2}\int \dfrac{1}{\sqrt{1 - g^{2}}}\,\mathrm{d}g = \tfrac{1}{2}\arcsin(g)$, dus $F(x) = \tfrac{1}{2}\arcsin\left(\tfrac{x^{2}}{3}\right)$.`,
      invullen: r`Vul de grenzen in. Bij $x = \tfrac{1}{2}\sqrt{6}$ is $x^{2} = \tfrac{6}{4} = 1\tfrac{1}{2}$, dus de kern is $\tfrac{1\frac{1}{2}}{3} = \tfrac{1}{2}$; bij $x = 0$ is de kern $0$. Dat geeft $\tfrac{1}{2}\arcsin\left(\tfrac{1}{2}\right) - 0 = \tfrac{1}{2} \cdot \tfrac{1}{6}\pi = \tfrac{1}{12}\pi$.`,
    }),
  },

  // ── Vlakdelen met arcsin ──────────────────────────────────────────────────
  {
    cluster: 'k3c_oppervlakte',
    nummer: 'op-1',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{3}{\sqrt{9 - x^{2}}}$, de $x$-as en de lijnen $x = 0$ en $x = 1\tfrac{1}{2}$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\tfrac{1}{2}\pi`,
    antwoord: '1/2 pi',
    alts: ['pi/2', '(1/2)pi', '1/2pi'],
    integrand: '3 / sqrt(9 - x^2)',
    primitieve: '3 * asin(x / 3)',
    domein: [-2.7, 2.7],
    grenzen: [0, 1.5],
    waarde: 'pi / 2',
    steps: oppervlakte({
      integraal: r`Deel 1: het vlakdeel tussen de grafiek, de $x$-as en de lijnen $x = 0$ en $x = 1\tfrac{1}{2}$ wordt $O(V) = \displaystyle\int_{0}^{1\frac{1}{2}} \dfrac{3}{\sqrt{9 - x^{2}}}\,\mathrm{d}x$. Op $[0; 1\tfrac{1}{2}]$ is $f$ positief, dus er hoeft geen minteken bij.`,
      herschrijven: r`Haal de $3$ buiten de wortel: $\sqrt{9 - x^{2}} = 3\sqrt{1 - \left(\tfrac{1}{3}x\right)^{2}}$. De integrand wordt $\dfrac{1}{\sqrt{1 - \left(\frac{1}{3}x\right)^{2}}}$, met kern $\tfrac{1}{3}x$ en $a = \tfrac{1}{3}$.`,
      primitieve: r`Deel 2: delen door $\tfrac{1}{3}$ is vermenigvuldigen met $3$, dus $F(x) = 3\arcsin\left(\tfrac{1}{3}x\right)$.`,
      uitkomst: r`Deel 3: de grenzen invullen. Bij $x = 1\tfrac{1}{2}$ is de kern $\tfrac{1}{2}$ en bij $x = 0$ is de kern $0$: $O(V) = 3\arcsin\left(\tfrac{1}{2}\right) - 3\arcsin(0) = 3 \cdot \tfrac{1}{6}\pi = \tfrac{1}{2}\pi$.`,
    }),
  },
  {
    cluster: 'k3c_oppervlakte',
    nummer: 'op-2',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x}{\sqrt{16 - x^{4}}}$, de $x$-as en de lijn $x = \sqrt{2}$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\tfrac{1}{12}\pi`,
    antwoord: '1/12 pi',
    alts: ['pi/12', '(1/12)pi', '1/12pi'],
    integrand: 'x / sqrt(16 - x^4)',
    primitieve: '1/2 * asin(x^2 / 4)',
    domein: [-1.9, 1.9],
    grenzen: [0, Math.SQRT2],
    waarde: 'pi / 12',
    steps: oppervlakte({
      integraal: r`Deel 1: er staat maar één lijn bij, dus de andere grens moet je zelf vinden. De grafiek snijdt de $x$-as waar de teller $0$ is, dus bij $x = 0$: $O(V) = \displaystyle\int_{0}^{\sqrt{2}} \dfrac{x}{\sqrt{16 - x^{4}}}\,\mathrm{d}x$.`,
      herschrijven: r`Haal de $4$ buiten de wortel: $\sqrt{16 - x^{4}} = 4\sqrt{1 - \left(\tfrac{x^{2}}{4}\right)^{2}}$. Neem $g(x) = \tfrac{x^{2}}{4}$, dan is $g'(x) = \tfrac{1}{2}x$. In de teller staat na het delen $\tfrac{1}{4}x$, en dat is $\tfrac{1}{2}g'$.`,
      primitieve: r`Deel 2: naar $g$ staat er $\tfrac{1}{2}\int \dfrac{1}{\sqrt{1 - g^{2}}}\,\mathrm{d}g = \tfrac{1}{2}\arcsin(g)$, dus $F(x) = \tfrac{1}{2}\arcsin\left(\tfrac{x^{2}}{4}\right)$.`,
      uitkomst: r`Deel 3: de grenzen invullen. Bij $x = \sqrt{2}$ is $x^{2} = 2$, dus de kern is $\tfrac{2}{4} = \tfrac{1}{2}$; bij $x = 0$ is de kern $0$. Dat geeft $O(V) = \tfrac{1}{2}\arcsin\left(\tfrac{1}{2}\right) = \tfrac{1}{2} \cdot \tfrac{1}{6}\pi = \tfrac{1}{12}\pi$.`,
    }),
  },
  {
    cluster: 'k3c_oppervlakte',
    nummer: 'op-3',
    level: 3,
    latex: r`Het vlakdeel $V_p$ wordt ingesloten door de grafiek van $f(x) = \dfrac{4}{\sqrt{25 - x^{2}}}$, de $x$-as en de lijnen $x = 0$ en $x = p$ met $0 < p < 5$. Bereken exact de waarde van $p$ waarvoor $O(V_p) = \pi$.`,
    antwoordLatex: r`p = 2\tfrac{1}{2}\sqrt{2}`,
    antwoord: '2 1/2 sqrt(2)',
    alts: ['p = 2 1/2 sqrt(2)', '5/2 sqrt(2)', 'p = 5/2 sqrt(2)', '2,5 sqrt(2)', '5 sqrt(2)/2'],
    integrand: '4 / sqrt(25 - x^2)',
    primitieve: '4 * asin(x / 5)',
    domein: [-4.5, 4.5],
    steps: oppervlakte({
      integraal: r`Deel 1: $O(V_p) = \displaystyle\int_{0}^{p} \dfrac{4}{\sqrt{25 - x^{2}}}\,\mathrm{d}x$. De bovengrens is nu een letter; verder verandert er niets. De voorwaarde $p < 5$ staat erbij omdat $f$ buiten $\langle-5, 5\rangle$ niet bestaat.`,
      herschrijven: r`Haal de $5$ buiten de wortel: $\sqrt{25 - x^{2}} = 5\sqrt{1 - \left(\tfrac{1}{5}x\right)^{2}}$. De integrand wordt $\dfrac{\tfrac{4}{5}}{\sqrt{1 - \left(\frac{1}{5}x\right)^{2}}}$, met kern $\tfrac{1}{5}x$ en $a = \tfrac{1}{5}$.`,
      primitieve: r`Deel 2: delen door $\tfrac{1}{5}$ is vermenigvuldigen met $5$, dus $F(x) = \tfrac{4}{5} \cdot 5\arcsin\left(\tfrac{1}{5}x\right) = 4\arcsin\left(\tfrac{1}{5}x\right)$. Omdat $\arcsin(0) = 0$ is $O(V_p) = 4\arcsin\left(\tfrac{1}{5}p\right)$.`,
      uitkomst: r`Deel 3: de vergelijking oplossen. $4\arcsin\left(\tfrac{1}{5}p\right) = \pi$ geeft $\arcsin\left(\tfrac{1}{5}p\right) = \tfrac{1}{4}\pi$. Die hoek ligt tussen $-\tfrac{1}{2}\pi$ en $\tfrac{1}{2}\pi$, dus er is een oplossing: $\tfrac{1}{5}p = \sin\left(\tfrac{1}{4}\pi\right) = \tfrac{1}{2}\sqrt{2}$, dus $p = 2\tfrac{1}{2}\sqrt{2} \approx 3{,}54$. Dat is inderdaad kleiner dan $5$.`,
    }),
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Hoofdstuk, topics en clusters
// ─────────────────────────────────────────────────────────────────────────────

const K3C: AdditiveChapter = {
  chapterSlug: 'k',
  chapterTitle: 'K — Voortgezette integraalrekening',
  bookPart: 4,
  chapterOrder: 12,
  site: 'integralen',
  migrationFile: '0042_k3c_arcsinus.sql',
  headerTitle: 'K.3 Theorie C — De functie arcsin',
  sourceScript: 'scripts/k3c-content.ts',
  headerNotes: [
    'Het derde theorieblok van K.3, met de inverse van de sinus:',
    '',
    '    f(x) = 1/√(1 - x²)   geeft   F(x) = arcsin(x) + c',
    '    g(x) = arcsin(x)     geeft   g\'(x) = 1/√(1 - x²)',
    '',
    'Zeven clusters: exacte waarden, vergelijkingen, de standaardvorm, een kern',
    'onder de wortel, partieel integreren met arcsin en arctan, bepaalde',
    'integralen en vlakdelen.',
    '',
    'Eigen topics en eigen clusters, zodat de controles aan het eind van de eerdere',
    'K-migraties blijven kloppen en die migraties herhaalbaar blijven.',
    '',
    'Eigen oefenvragen, geen boekopgaven. De 19 vragen met een integraal worden',
    'nagerekend door src/content/primitieven.test.ts (content/hoofdstuk-k/k3c.json);',
    'de zeven vragen over de functie zelf hebben geen integraal en staan daar niet in.',
  ],
  topics: [
    {
      slug: 'k3c_arcsinus',
      title: 'De functie arcsin',
      order: 23,
      category: 'vergelijkingen',
    },
    {
      slug: 'k3c_primitiveren',
      title: 'Primitiveren naar arcsin',
      order: 24,
      category: 'primitiveren',
    },
    {
      slug: 'k3c_bepaald',
      title: 'Bepaalde integralen met arcsin',
      order: 25,
      category: 'integralen',
    },
    {
      slug: 'k3c_toepassing',
      title: 'Vlakdelen met arcsin',
      order: 26,
      category: 'toepassingen',
    },
  ],
  clusters: [
    { topic: 'k3c_arcsinus', slug: 'k3c_waarden', title: 'Exacte waarden van arcsin', order: 1 },
    {
      topic: 'k3c_arcsinus',
      slug: 'k3c_vergelijking',
      title: 'Vergelijkingen met arcsin oplossen',
      order: 2,
    },
    {
      topic: 'k3c_primitiveren',
      slug: 'k3c_standaard',
      title: 'De standaardvorm 1/√(1 - x²) primitiveren',
      order: 1,
    },
    { topic: 'k3c_primitiveren', slug: 'k3c_kern', title: 'Een kern onder de wortel', order: 2 },
    {
      topic: 'k3c_primitiveren',
      slug: 'k3c_partieel',
      title: 'arcsin en arctan partieel integreren',
      order: 3,
    },
    {
      topic: 'k3c_bepaald',
      slug: 'k3c_bepaald_exact',
      title: 'Bepaalde integralen met arcsin',
      order: 1,
    },
    {
      topic: 'k3c_toepassing',
      slug: 'k3c_oppervlakte',
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

const contentPad = path.join(wortel, 'content', 'hoofdstuk-k', 'k3c.json')
writeFileSync(contentPad, generateContentFile(K3C, 'K.3 Theorie C — De functie arcsin (eigen varianten)'))

const migratiePad = path.join(wortel, 'supabase', 'migrations', K3C.migrationFile)
writeFileSync(migratiePad, generateAdditiveMigration(K3C))

const metIntegraal = K3C.questions.filter((q) => q.integrand !== undefined).length

console.log(`Geschreven: ${contentPad}`)
console.log(`Geschreven: ${migratiePad}`)
console.log(`Vragen: ${K3C.questions.length}, stappen: ${K3C.questions.length * 4}`)
console.log(`Daarvan nagerekend door de test: ${metIntegraal}`)
