/**
 * K.1 Theorie B — Toepassingen van de substitutiemethode.
 *
 * Eigen oefenvragen in de stijl van dit theorieblok. Waar Theorie A de kern
 * zomaar in de integrand zag staan, moet je hier eerst herschrijven voordat de
 * kern zichtbaar wordt: tangens als sin/cos, een oneven macht van sinus of
 * cosinus met sin² + cos² = 1, of een wortel die je helemaal tot nieuwe
 * variabele promoveert. Bij een bepaalde integraal gaan de grenzen mee.
 * Geen boekopgaven; alles hieronder is nieuw bedacht.
 *
 * Draaien met:  npx jiti scripts/k1b-content.ts
 *
 * Schrijft twee bestanden:
 *   • content/hoofdstuk-k/k1b.json                    — leest src/content/primitieven.test.ts
 *   • supabase/migrations/0036_k1b_substitutiemethode.sql — alleen rijen toevoegen
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
// Grenzen die geen rond getal zijn
//
// `grenzen` in het JSON-bestand is er voor het narekenen, dus daar moeten
// gewone getallen staan. In de opgave zelf blijft de grens natuurlijk exact
// ($\tfrac{1}{4}\pi$, $\mathrm{e}^{2}$); deze constanten zijn alleen de
// decimale kant daarvan.
// ─────────────────────────────────────────────────────────────────────────────

const PI = Math.PI
const E = Math.E

// ─────────────────────────────────────────────────────────────────────────────
// Stap-sjablonen
//
// Elke vraag krijgt vier stappen (step_order 0 t/m 3). Stap 0 benoemt welk
// deel van de driedeling aan de orde is; bij een kale primitiveer- of
// bereken-exact-opgave is dat alleen deel 2. Bij de toepassingen spelen deel 1
// (verhaaltje → integraal) en soms deel 3 (vergelijking oplossen) ook.
// ─────────────────────────────────────────────────────────────────────────────

const DEEL2 = r`Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal.`

/** De buitenste schil, per soort opgave steeds in dezelfde woorden. */
const SCHIL = {
  tangens: r`Buitenste schil: een tangens, of een breuk met een sinus en een cosinus → substitutiemethode. Schrijf $\tan = \dfrac{\sin}{\cos}$ en kijk welke van de twee de kern is: de ándere staat er dan als afgeleide bij.`,
  gonioBreuk: r`Buitenste schil: een breuk met een sinus en een cosinus → substitutiemethode. De ene gonio is de kern, de andere is (op een teken na) zijn afgeleide.`,
  oneven: r`Buitenste schil: een oneven macht van een sinus of cosinus → splits er één factor af en herschrijf de rest met $\sin^{2} + \cos^{2} = 1$. Die ene losse factor is precies de afgeleide die je nodig hebt.`,
  bepaaldGonio: r`${DEEL2} Het is een bepaalde integraal, dus na het primitiveren komen de grenzen aan de beurt. Buitenste schil: gonio die je eerst herschrijft tot een kern met zijn afgeleide ernaast.`,
  bepaaldLnE: r`${DEEL2} Het is een bepaalde integraal, dus na het primitiveren komen de grenzen aan de beurt. Buitenste schil: een $\ln$ of een e-macht met een kern erin → substitutiemethode.`,
}

/**
 * Primitiveren met de substitutiemethode: eerst herschrijven, dan de kern
 * aanwijzen, dan naar $\mathrm{d}g$ en primitiveren.
 */
function substitueer(s: { schil: string; herschrijf: string; kern: string; naarDg: string; klaar: string }): Steps {
  return [`${DEEL2} ${s.schil}`, s.herschrijf, `${s.kern} ${s.naarDg}`, s.klaar]
}

/** Bepaalde integraal: kern kiezen, grenzen meenemen, invullen. */
function bepaald(s: { schil: string; kern: string; grenzen: string; invullen: string }): Steps {
  return [s.schil, s.kern, s.grenzen, s.invullen]
}

/**
 * De substitutie √(… ) = g: hier verdwijnt x helemaal uit beeld, want de
 * afgeleide van de kern staat er níét bij. Je drukt x uit in g.
 */
function wortelSubstitutie(s: { stel: string; terug: string; omschrijven: string; invullen: string }): Steps {
  return [
    r`${DEEL2} Buitenste schil: een wortel van $x$ plus (of min) een getal, met ervóór een losse $x$. De afgeleide van wat onder de wortel staat is $1$, dus de omgekeerde kettingregel helpt hier niet. Stel daarom de hele wortel gelijk aan een nieuwe variabele $g$. ${s.stel}`,
    s.terug,
    s.omschrijven,
    s.invullen,
  ]
}

/** Toepassing: eerst de integraal opschrijven (deel 1), dan rekenen. */
function toepassing(s: { deel1: string; integraal: string; primitiveren: string; afronden: string }): Steps {
  return [s.deel1, s.integraal, s.primitiveren, s.afronden]
}

// ─────────────────────────────────────────────────────────────────────────────
// De vragen
// ─────────────────────────────────────────────────────────────────────────────

const VRAGEN: AdditiveQ[] = [
  // ── Tangens en breuken met sinus en cosinus ────────────────────────────────
  {
    cluster: 'k1b_tangens',
    nummer: 'tangens-1',
    level: 1,
    latex: r`Primitiveer: $f(x) = \tan(4x)$`,
    antwoordLatex: r`F(x) = -\tfrac{1}{4}\ln|\cos(4x)| + c`,
    antwoord: '-ln|cos(4x)|/4 + c',
    // Zonder absolute-waardestrepen is `-ln(cos(4x))/4 + c` niet overal gelijk (INT-188).
    alts: ['-1/4 ln|cos(4x)| + c', '-0,25ln|cos(4x)| + c'],
    integrand: 'tan(4 * x)',
    primitieve: '-ln(cos(4 * x)) / 4',
    domein: [-0.35, 0.35],
    steps: substitueer({
      schil: SCHIL.tangens,
      herschrijf: r`Herschrijf: $\tan(4x) = \dfrac{\sin(4x)}{\cos(4x)}$.`,
      kern: r`Kies de kern: $g(x) = \cos(4x)$, dus $g'(x) = -4\sin(4x)$.`,
      naarDg: r`Dat betekent $\sin(4x)\,\mathrm{d}x = -\tfrac{1}{4}\,\mathrm{d}(\cos(4x))$, dus $\int \tan(4x)\,\mathrm{d}x = \int -\tfrac{1}{4} \cdot \dfrac{1}{g}\,\mathrm{d}g$.`,
      klaar: r`Primitiveer: $\int \dfrac{1}{g}\,\mathrm{d}g = \ln|g|$, dus $F(x) = -\tfrac{1}{4}\ln|\cos(4x)| + c$. Controle: differentiëren geeft $-\tfrac{1}{4} \cdot \dfrac{-4\sin(4x)}{\cos(4x)} = \tan(4x)$.`,
    }),
  },
  {
    cluster: 'k1b_tangens',
    nummer: 'tangens-2',
    level: 1,
    latex: r`Primitiveer: $f(x) = \tan\left(\tfrac{1}{2}x\right)$`,
    antwoordLatex: r`F(x) = -2\ln\left|\cos\left(\tfrac{1}{2}x\right)\right| + c`,
    antwoord: '-2ln|cos(1/2 x)| + c',
    // Zonder absolute-waardestrepen is `-2ln(cos(x/2)) + c` niet overal gelijk (INT-188).
    alts: ['-2ln|cos(0,5x)| + c', '-2ln|cos(x/2)| + c'],
    integrand: 'tan(x / 2)',
    primitieve: '-2 * ln(cos(x / 2))',
    steps: substitueer({
      schil: SCHIL.tangens,
      herschrijf: r`Herschrijf: $\tan\left(\tfrac{1}{2}x\right) = \dfrac{\sin\left(\tfrac{1}{2}x\right)}{\cos\left(\tfrac{1}{2}x\right)}$.`,
      kern: r`Kies de kern: $g(x) = \cos\left(\tfrac{1}{2}x\right)$, dus $g'(x) = -\tfrac{1}{2}\sin\left(\tfrac{1}{2}x\right)$.`,
      naarDg: r`Dat betekent $\sin\left(\tfrac{1}{2}x\right)\mathrm{d}x = -2\,\mathrm{d}\left(\cos\left(\tfrac{1}{2}x\right)\right)$, dus de integraal wordt $\int -2 \cdot \dfrac{1}{g}\,\mathrm{d}g$.`,
      klaar: r`Primitiveer: $\int \dfrac{1}{g}\,\mathrm{d}g = \ln|g|$, dus $F(x) = -2\ln\left|\cos\left(\tfrac{1}{2}x\right)\right| + c$. Controle: differentiëren geeft $-2 \cdot \dfrac{-\tfrac{1}{2}\sin\left(\tfrac{1}{2}x\right)}{\cos\left(\tfrac{1}{2}x\right)} = \tan\left(\tfrac{1}{2}x\right)$.`,
    }),
  },
  {
    cluster: 'k1b_tangens',
    nummer: 'tangens-3',
    level: 2,
    latex: r`Primitiveer: $f(x) = \dfrac{\sin(x)}{\cos^{4}(x)}$`,
    antwoordLatex: r`F(x) = \dfrac{1}{3\cos^{3}(x)} + c`,
    antwoord: '1/(3cos(x)^3) + c',
    alts: ['1/3 cos(x)^(-3) + c', '(1/3)/cos(x)^3 + c'],
    integrand: 'sin(x) / cos(x)^4',
    primitieve: '1 / (3 * cos(x)^3)',
    domein: [-1.4, 1.4],
    steps: substitueer({
      schil: SCHIL.gonioBreuk,
      herschrijf: r`Herschrijf de noemer als macht: $f(x) = \sin(x) \cdot \cos^{-4}(x)$.`,
      kern: r`Kies de kern: $g(x) = \cos(x)$, dus $g'(x) = -\sin(x)$.`,
      naarDg: r`Dat betekent $\sin(x)\,\mathrm{d}x = -\mathrm{d}(\cos(x))$, dus de integraal wordt $\int -g^{-4}\,\mathrm{d}g$.`,
      klaar: r`Primitiveer: $\int -g^{-4}\,\mathrm{d}g = \tfrac{1}{3}g^{-3}$, dus $F(x) = \dfrac{1}{3\cos^{3}(x)} + c$. Controle: differentiëren geeft $\tfrac{1}{3} \cdot -3\cos^{-4}(x) \cdot -\sin(x) = \dfrac{\sin(x)}{\cos^{4}(x)}$.`,
    }),
  },
  {
    cluster: 'k1b_tangens',
    nummer: 'tangens-4',
    level: 2,
    latex: r`Primitiveer: $h(x) = \dfrac{\cos(x)}{\sin^{3}(x)}$`,
    antwoordLatex: r`H(x) = -\dfrac{1}{2\sin^{2}(x)} + c`,
    antwoord: '-1/(2sin(x)^2) + c',
    alts: ['-1/2 sin(x)^(-2) + c', '-(1/2)/sin(x)^2 + c'],
    integrand: 'cos(x) / sin(x)^3',
    primitieve: '-1 / (2 * sin(x)^2)',
    domein: [0.3, 2.8],
    steps: substitueer({
      schil: SCHIL.gonioBreuk,
      herschrijf: r`Herschrijf de noemer als macht: $h(x) = \cos(x) \cdot \sin^{-3}(x)$.`,
      kern: r`Nu is de sinus de kern: $g(x) = \sin(x)$, dus $g'(x) = \cos(x)$.`,
      naarDg: r`Dat betekent $\cos(x)\,\mathrm{d}x = \mathrm{d}(\sin(x))$, dus de integraal wordt $\int g^{-3}\,\mathrm{d}g$ — hier zonder minteken.`,
      klaar: r`Primitiveer: $\int g^{-3}\,\mathrm{d}g = -\tfrac{1}{2}g^{-2}$, dus $H(x) = -\dfrac{1}{2\sin^{2}(x)} + c$. Controle: differentiëren geeft $-\tfrac{1}{2} \cdot -2\sin^{-3}(x) \cdot \cos(x) = \dfrac{\cos(x)}{\sin^{3}(x)}$.`,
    }),
  },
  {
    cluster: 'k1b_tangens',
    nummer: 'tangens-5',
    level: 3,
    latex: r`Primitiveer: $f(x) = \sin(x) + \dfrac{\sin(x)}{\cos^{2}(x)}$`,
    antwoordLatex: r`F(x) = -\cos(x) + \dfrac{1}{\cos(x)} + c`,
    antwoord: '-cos(x) + 1/cos(x) + c',
    alts: ['1/cos(x) - cos(x) + c', '-cos(x) + cos(x)^(-1) + c'],
    integrand: 'sin(x) + sin(x) / cos(x)^2',
    primitieve: '-cos(x) + 1 / cos(x)',
    domein: [-1.4, 1.4],
    steps: substitueer({
      schil: r`Buitenste schil: een $+$ tussen twee delen → somregel, dus elk deel apart primitiveren. Het tweede deel is een breuk met een sinus en een cosinus → substitutiemethode.`,
      herschrijf: r`Het eerste deel is een standaardprimitieve: $\int \sin(x)\,\mathrm{d}x = -\cos(x)$. Het tweede deel schrijf je als $\sin(x) \cdot \cos^{-2}(x)$.`,
      kern: r`Kies voor dat tweede deel de kern: $g(x) = \cos(x)$, dus $g'(x) = -\sin(x)$.`,
      naarDg: r`Dat betekent $\sin(x)\,\mathrm{d}x = -\mathrm{d}(\cos(x))$, dus dat deel wordt $\int -g^{-2}\,\mathrm{d}g = g^{-1}$.`,
      klaar: r`Tel op: $F(x) = -\cos(x) + \dfrac{1}{\cos(x)} + c$. Controle: differentiëren geeft $\sin(x) + \left(-\cos^{-2}(x) \cdot -\sin(x)\right) = \sin(x) + \dfrac{\sin(x)}{\cos^{2}(x)}$.`,
    }),
  },
  {
    cluster: 'k1b_tangens',
    nummer: 'tangens-6',
    level: 3,
    latex: r`Primitiveer: $f(x) = \dfrac{\cos(x)}{2 + \sin(x)}$`,
    antwoordLatex: r`F(x) = \ln(2 + \sin(x)) + c`,
    antwoord: 'ln(2 + sin(x)) + c',
    alts: ['ln|2 + sin(x)| + c'],
    integrand: 'cos(x) / (2 + sin(x))',
    primitieve: 'ln(2 + sin(x))',
    steps: substitueer({
      schil: r`Buitenste schil: een breuk met een hele uitdrukking in de noemer → kijk of de teller de afgeleide van die noemer is. Zo ja, dan komt er $\ln$ uit.`,
      herschrijf: r`De noemer is niet zomaar een sinus of cosinus, maar $2 + \sin(x)$. Juist dát hele stuk is de kern.`,
      kern: r`Kies de kern: $g(x) = 2 + \sin(x)$, dus $g'(x) = \cos(x)$.`,
      naarDg: r`De teller is precies $g'(x)$, dus $\cos(x)\,\mathrm{d}x = \mathrm{d}(2 + \sin(x))$ en de integraal wordt $\int \dfrac{1}{g}\,\mathrm{d}g$.`,
      klaar: r`Primitiveer: $\int \dfrac{1}{g}\,\mathrm{d}g = \ln|g|$, dus $F(x) = \ln(2 + \sin(x)) + c$; omdat $\sin(x)$ nooit onder $-1$ komt, is $2 + \sin(x)$ altijd positief en mogen de strepen weg. Controle: differentiëren geeft $\dfrac{\cos(x)}{2 + \sin(x)}$.`,
    }),
  },

  // ── Oneven machten van sinus en cosinus ────────────────────────────────────
  {
    cluster: 'k1b_oneven_macht',
    nummer: 'oneven-1',
    level: 1,
    latex: r`Primitiveer: $f(x) = \sin(x)\cos^{2}(x)$`,
    antwoordLatex: r`F(x) = -\tfrac{1}{3}\cos^{3}(x) + c`,
    antwoord: '-cos(x)^3/3 + c',
    alts: ['-1/3 cos(x)^3 + c', '-(1/3)cos(x)^3 + c'],
    integrand: 'sin(x) * cos(x)^2',
    primitieve: '-cos(x)^3 / 3',
    steps: substitueer({
      schil: r`Buitenste schil: een macht van een cosinus met een losse sinus ernaast. Die losse sinus is (op een minteken na) de afgeleide van de cosinus → substitutiemethode. Hier hoeft er nog niets herschreven te worden.`,
      herschrijf: r`Er staat al $\cos^{2}(x) \cdot \sin(x)$: een macht van de kern, met de afgeleide van de kern ernaast.`,
      kern: r`Kies de kern: $g(x) = \cos(x)$, dus $g'(x) = -\sin(x)$.`,
      naarDg: r`Dat betekent $\sin(x)\,\mathrm{d}x = -\mathrm{d}(\cos(x))$, dus de integraal wordt $\int -g^{2}\,\mathrm{d}g$.`,
      klaar: r`Primitiveer: $\int -g^{2}\,\mathrm{d}g = -\tfrac{1}{3}g^{3}$, dus $F(x) = -\tfrac{1}{3}\cos^{3}(x) + c$. Controle: differentiëren geeft $-\tfrac{1}{3} \cdot 3\cos^{2}(x) \cdot -\sin(x) = \sin(x)\cos^{2}(x)$.`,
    }),
  },
  {
    cluster: 'k1b_oneven_macht',
    nummer: 'oneven-2',
    level: 1,
    latex: r`Primitiveer: $f(x) = \cos^{3}(x)$`,
    antwoordLatex: r`F(x) = \sin(x) - \tfrac{1}{3}\sin^{3}(x) + c`,
    antwoord: 'sin(x) - sin(x)^3/3 + c',
    alts: ['sin(x) - 1/3 sin(x)^3 + c'],
    integrand: 'cos(x)^3',
    primitieve: 'sin(x) - sin(x)^3 / 3',
    steps: substitueer({
      schil: SCHIL.oneven,
      herschrijf: r`Splits één cosinus af en herschrijf de rest: $\cos^{3}(x) = \cos^{2}(x) \cdot \cos(x) = \left(1 - \sin^{2}(x)\right)\cos(x)$.`,
      kern: r`Nu is de sinus de kern: $g(x) = \sin(x)$, dus $g'(x) = \cos(x)$.`,
      naarDg: r`De losse cosinus is precies $g'(x)$: $\cos(x)\,\mathrm{d}x = \mathrm{d}(\sin(x))$, dus de integraal wordt $\int \left(1 - g^{2}\right)\mathrm{d}g$.`,
      klaar: r`Primitiveer term voor term: $\int \left(1 - g^{2}\right)\mathrm{d}g = g - \tfrac{1}{3}g^{3}$, dus $F(x) = \sin(x) - \tfrac{1}{3}\sin^{3}(x) + c$. Controle: differentiëren geeft $\cos(x) - \sin^{2}(x)\cos(x) = \cos(x)\left(1 - \sin^{2}(x)\right) = \cos^{3}(x)$.`,
    }),
  },
  {
    cluster: 'k1b_oneven_macht',
    nummer: 'oneven-3',
    level: 2,
    latex: r`Primitiveer: $f(x) = \sin^{3}(2x)$`,
    antwoordLatex: r`F(x) = -\tfrac{1}{2}\cos(2x) + \tfrac{1}{6}\cos^{3}(2x) + c`,
    antwoord: '-cos(2x)/2 + cos(2x)^3/6 + c',
    alts: ['-1/2 cos(2x) + 1/6 cos(2x)^3 + c', 'cos(2x)^3/6 - cos(2x)/2 + c'],
    integrand: 'sin(2 * x)^3',
    primitieve: '-cos(2 * x) / 2 + cos(2 * x)^3 / 6',
    steps: substitueer({
      schil: SCHIL.oneven,
      herschrijf: r`Splits één sinus af en herschrijf de rest: $\sin^{3}(2x) = \left(1 - \cos^{2}(2x)\right)\sin(2x)$.`,
      kern: r`Kies de kern: $g(x) = \cos(2x)$, dus $g'(x) = -2\sin(2x)$.`,
      naarDg: r`Dat betekent $\sin(2x)\,\mathrm{d}x = -\tfrac{1}{2}\,\mathrm{d}(\cos(2x))$, dus de integraal wordt $\int -\tfrac{1}{2}\left(1 - g^{2}\right)\mathrm{d}g$.`,
      klaar: r`Primitiveer: $-\tfrac{1}{2}\left(g - \tfrac{1}{3}g^{3}\right) = -\tfrac{1}{2}g + \tfrac{1}{6}g^{3}$, dus $F(x) = -\tfrac{1}{2}\cos(2x) + \tfrac{1}{6}\cos^{3}(2x) + c$. Controle: differentiëren geeft $\sin(2x) - \cos^{2}(2x)\sin(2x) = \sin^{3}(2x)$.`,
    }),
  },
  {
    cluster: 'k1b_oneven_macht',
    nummer: 'oneven-4',
    level: 2,
    latex: r`Primitiveer: $f(x) = \cos^{5}(x)$`,
    antwoordLatex: r`F(x) = \sin(x) - \tfrac{2}{3}\sin^{3}(x) + \tfrac{1}{5}\sin^{5}(x) + c`,
    antwoord: 'sin(x) - 2/3 sin(x)^3 + 1/5 sin(x)^5 + c',
    alts: ['sin(x) - 2sin(x)^3/3 + sin(x)^5/5 + c'],
    integrand: 'cos(x)^5',
    primitieve: 'sin(x) - 2 * sin(x)^3 / 3 + sin(x)^5 / 5',
    steps: substitueer({
      schil: SCHIL.oneven,
      herschrijf: r`Splits één cosinus af: $\cos^{5}(x) = \left(\cos^{2}(x)\right)^{2}\cos(x) = \left(1 - \sin^{2}(x)\right)^{2}\cos(x)$. Werk het kwadraat uit: $\left(1 - 2\sin^{2}(x) + \sin^{4}(x)\right)\cos(x)$.`,
      kern: r`Kies de kern: $g(x) = \sin(x)$, dus $g'(x) = \cos(x)$.`,
      naarDg: r`De losse cosinus is precies $g'(x)$, dus de integraal wordt $\int \left(1 - 2g^{2} + g^{4}\right)\mathrm{d}g$.`,
      klaar: r`Primitiveer term voor term: $g - \tfrac{2}{3}g^{3} + \tfrac{1}{5}g^{5}$, dus $F(x) = \sin(x) - \tfrac{2}{3}\sin^{3}(x) + \tfrac{1}{5}\sin^{5}(x) + c$. Controle: differentiëren geeft $\cos(x)\left(1 - 2\sin^{2}(x) + \sin^{4}(x)\right) = \cos(x)\left(1 - \sin^{2}(x)\right)^{2} = \cos^{5}(x)$.`,
    }),
  },
  {
    cluster: 'k1b_oneven_macht',
    nummer: 'oneven-5',
    level: 3,
    latex: r`Primitiveer: $f(x) = \sin^{3}(x)\cos^{2}(x)$`,
    antwoordLatex: r`F(x) = -\tfrac{1}{3}\cos^{3}(x) + \tfrac{1}{5}\cos^{5}(x) + c`,
    antwoord: '-cos(x)^3/3 + cos(x)^5/5 + c',
    alts: ['-1/3 cos(x)^3 + 1/5 cos(x)^5 + c', 'cos(x)^5/5 - cos(x)^3/3 + c'],
    integrand: 'sin(x)^3 * cos(x)^2',
    primitieve: '-cos(x)^3 / 3 + cos(x)^5 / 5',
    steps: substitueer({
      schil: r`Buitenste schil: een sinus én een cosinus met machten. Omdat de macht van de sinus oneven is, splits je dáár één factor af → substitutiemethode met de cosinus als kern.`,
      herschrijf: r`Splits één sinus af: $\sin^{3}(x)\cos^{2}(x) = \left(1 - \cos^{2}(x)\right)\cos^{2}(x)\sin(x) = \left(\cos^{2}(x) - \cos^{4}(x)\right)\sin(x)$.`,
      kern: r`Kies de kern: $g(x) = \cos(x)$, dus $g'(x) = -\sin(x)$.`,
      naarDg: r`Dat betekent $\sin(x)\,\mathrm{d}x = -\mathrm{d}(\cos(x))$, dus de integraal wordt $\int -\left(g^{2} - g^{4}\right)\mathrm{d}g$.`,
      klaar: r`Primitiveer term voor term: $-\tfrac{1}{3}g^{3} + \tfrac{1}{5}g^{5}$, dus $F(x) = -\tfrac{1}{3}\cos^{3}(x) + \tfrac{1}{5}\cos^{5}(x) + c$. Controle: differentiëren geeft $\sin(x)\cos^{2}(x) - \sin(x)\cos^{4}(x) = \sin(x)\cos^{2}(x)\left(1 - \cos^{2}(x)\right) = \sin^{3}(x)\cos^{2}(x)$.`,
    }),
  },
  {
    cluster: 'k1b_oneven_macht',
    nummer: 'oneven-6',
    level: 3,
    latex: r`Primitiveer: $h(x) = \dfrac{\cos^{3}(x)}{\sin^{2}(x)}$`,
    antwoordLatex: r`H(x) = -\dfrac{1}{\sin(x)} - \sin(x) + c`,
    antwoord: '-1/sin(x) - sin(x) + c',
    alts: ['-sin(x) - 1/sin(x) + c', '-sin(x)^(-1) - sin(x) + c'],
    integrand: 'cos(x)^3 / sin(x)^2',
    primitieve: '-1 / sin(x) - sin(x)',
    domein: [0.3, 2.8],
    steps: substitueer({
      schil: r`Buitenste schil: een breuk met een oneven macht van de cosinus boven en een macht van de sinus onder. Splits één cosinus af → substitutiemethode met de sinus als kern.`,
      herschrijf: r`Splits één cosinus af: $\dfrac{\cos^{3}(x)}{\sin^{2}(x)} = \dfrac{1 - \sin^{2}(x)}{\sin^{2}(x)} \cdot \cos(x)$.`,
      kern: r`Kies de kern: $g(x) = \sin(x)$, dus $g'(x) = \cos(x)$.`,
      naarDg: r`De losse cosinus is precies $g'(x)$, dus de integraal wordt $\int \dfrac{1 - g^{2}}{g^{2}}\,\mathrm{d}g = \int \left(g^{-2} - 1\right)\mathrm{d}g$.`,
      klaar: r`Primitiveer term voor term: $-g^{-1} - g$, dus $H(x) = -\dfrac{1}{\sin(x)} - \sin(x) + c$. Controle: differentiëren geeft $\dfrac{\cos(x)}{\sin^{2}(x)} - \cos(x) = \dfrac{\cos(x)\left(1 - \sin^{2}(x)\right)}{\sin^{2}(x)} = \dfrac{\cos^{3}(x)}{\sin^{2}(x)}$.`,
    }),
  },

  // ── Bepaalde integralen met gonio ──────────────────────────────────────────
  {
    cluster: 'k1b_grenzen_gonio',
    nummer: 'grenzen-gonio-1',
    level: 1,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{\frac{1}{8}\pi} \tan(2x)\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{4}\ln(2)`,
    antwoord: 'ln(2)/4',
    alts: ['1/4 ln(2)', '0,25ln(2)'],
    integrand: 'tan(2 * x)',
    primitieve: '-ln(cos(2 * x)) / 2',
    domein: [-0.7, 0.7],
    grenzen: [0, PI / 8],
    waarde: 'ln(2) / 4',
    steps: bepaald({
      schil: SCHIL.bepaaldGonio,
      kern: r`Herschrijf $\tan(2x) = \dfrac{\sin(2x)}{\cos(2x)}$ en kies de kern $g(x) = \cos(2x)$, dus $g'(x) = -2\sin(2x)$ en $\sin(2x)\,\mathrm{d}x = -\tfrac{1}{2}\,\mathrm{d}(\cos(2x))$.`,
      grenzen: r`Primitiveer naar de kern: $\int -\tfrac{1}{2} \cdot \dfrac{1}{g}\,\mathrm{d}g = -\tfrac{1}{2}\ln|g|$, dus een primitieve is $-\tfrac{1}{2}\ln|\cos(2x)|$. Je kunt ook de grenzen van $g$ opschrijven: bij $x = 0$ hoort $g = 1$ en bij $x = \tfrac{1}{8}\pi$ hoort $g = \cos\left(\tfrac{1}{4}\pi\right) = \tfrac{1}{2}\sqrt{2}$.`,
      invullen: r`Vul in: $\left[-\tfrac{1}{2}\ln|\cos(2x)|\right]_{0}^{\frac{1}{8}\pi} = -\tfrac{1}{2}\ln\left(\tfrac{1}{2}\sqrt{2}\right) + \tfrac{1}{2}\ln(1)$. Omdat $\tfrac{1}{2}\sqrt{2} = 2^{-\frac{1}{2}}$ is dat $-\tfrac{1}{2} \cdot -\tfrac{1}{2}\ln(2) = \tfrac{1}{4}\ln(2)$. Exact laten staan.`,
    }),
  },
  {
    cluster: 'k1b_grenzen_gonio',
    nummer: 'grenzen-gonio-2',
    level: 1,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{\frac{1}{4}\pi} \dfrac{\sin(x)}{\cos^{2}(x)}\,\mathrm{d}x$`,
    antwoordLatex: r`\sqrt{2} - 1`,
    antwoord: 'sqrt(2) - 1',
    alts: ['-1 + sqrt(2)'],
    integrand: 'sin(x) / cos(x)^2',
    primitieve: '1 / cos(x)',
    domein: [-1.4, 1.4],
    grenzen: [0, PI / 4],
    waarde: 'sqrt(2) - 1',
    steps: bepaald({
      schil: SCHIL.bepaaldGonio,
      kern: r`Schrijf als macht: $\sin(x) \cdot \cos^{-2}(x)$. Kies de kern $g(x) = \cos(x)$, dus $g'(x) = -\sin(x)$ en $\sin(x)\,\mathrm{d}x = -\mathrm{d}(\cos(x))$.`,
      grenzen: r`De integraal wordt $\int -g^{-2}\,\mathrm{d}g = g^{-1}$, dus een primitieve is $\dfrac{1}{\cos(x)}$. De grenzen van $g$: bij $x = 0$ hoort $g = 1$, bij $x = \tfrac{1}{4}\pi$ hoort $g = \tfrac{1}{2}\sqrt{2}$.`,
      invullen: r`Vul in: $\left[\dfrac{1}{\cos(x)}\right]_{0}^{\frac{1}{4}\pi} = \dfrac{1}{\tfrac{1}{2}\sqrt{2}} - \dfrac{1}{1} = \sqrt{2} - 1$. Exact laten staan, dus niet afronden.`,
    }),
  },
  {
    cluster: 'k1b_grenzen_gonio',
    nummer: 'grenzen-gonio-3',
    level: 2,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{\frac{1}{2}\pi} \sin^{3}(x)\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{2}{3}`,
    antwoord: '2/3',
    integrand: 'sin(x)^3',
    primitieve: 'cos(x)^3 / 3 - cos(x)',
    grenzen: [0, PI / 2],
    waarde: '2/3',
    steps: bepaald({
      schil: SCHIL.bepaaldGonio,
      kern: r`Splits één sinus af: $\sin^{3}(x) = \left(1 - \cos^{2}(x)\right)\sin(x)$. Kies de kern $g(x) = \cos(x)$, dus $\sin(x)\,\mathrm{d}x = -\mathrm{d}(\cos(x))$.`,
      grenzen: r`De integraal wordt $\int -\left(1 - g^{2}\right)\mathrm{d}g = \tfrac{1}{3}g^{3} - g$, dus een primitieve is $\tfrac{1}{3}\cos^{3}(x) - \cos(x)$. De grenzen van $g$: bij $x = 0$ hoort $g = 1$, bij $x = \tfrac{1}{2}\pi$ hoort $g = 0$.`,
      invullen: r`Vul in: $\left[\tfrac{1}{3}\cos^{3}(x) - \cos(x)\right]_{0}^{\frac{1}{2}\pi} = (0 - 0) - \left(\tfrac{1}{3} - 1\right) = \tfrac{2}{3}$.`,
    }),
  },
  {
    cluster: 'k1b_grenzen_gonio',
    nummer: 'grenzen-gonio-4',
    level: 2,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{\frac{1}{3}\pi} \cos^{3}(x)\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{3}{8}\sqrt{3}`,
    antwoord: '3/8 sqrt(3)',
    alts: ['3sqrt(3)/8', '0,375sqrt(3)'],
    integrand: 'cos(x)^3',
    primitieve: 'sin(x) - sin(x)^3 / 3',
    grenzen: [0, PI / 3],
    waarde: '3 * sqrt(3) / 8',
    steps: bepaald({
      schil: SCHIL.bepaaldGonio,
      kern: r`Splits één cosinus af: $\cos^{3}(x) = \left(1 - \sin^{2}(x)\right)\cos(x)$. Kies de kern $g(x) = \sin(x)$, dus $\cos(x)\,\mathrm{d}x = \mathrm{d}(\sin(x))$.`,
      grenzen: r`De integraal wordt $\int \left(1 - g^{2}\right)\mathrm{d}g = g - \tfrac{1}{3}g^{3}$, dus een primitieve is $\sin(x) - \tfrac{1}{3}\sin^{3}(x)$. De grenzen van $g$: bij $x = 0$ hoort $g = 0$, bij $x = \tfrac{1}{3}\pi$ hoort $g = \tfrac{1}{2}\sqrt{3}$.`,
      invullen: r`Vul in: $\left[g - \tfrac{1}{3}g^{3}\right]_{0}^{\frac{1}{2}\sqrt{3}} = \tfrac{1}{2}\sqrt{3} - \tfrac{1}{3} \cdot \tfrac{3}{8}\sqrt{3} = \tfrac{1}{2}\sqrt{3} - \tfrac{1}{8}\sqrt{3} = \tfrac{3}{8}\sqrt{3}$.`,
    }),
  },
  {
    cluster: 'k1b_grenzen_gonio',
    nummer: 'grenzen-gonio-5',
    level: 3,
    latex: r`Bereken exact: $\displaystyle\int_{\frac{1}{6}\pi}^{\frac{1}{2}\pi} \dfrac{\cos(x)}{\sin^{3}(x)}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{3}{2}`,
    antwoord: '3/2',
    alts: ['1,5'],
    integrand: 'cos(x) / sin(x)^3',
    primitieve: '-1 / (2 * sin(x)^2)',
    domein: [0.3, 2.8],
    grenzen: [PI / 6, PI / 2],
    waarde: '3/2',
    steps: bepaald({
      schil: SCHIL.bepaaldGonio,
      kern: r`Schrijf als macht: $\cos(x) \cdot \sin^{-3}(x)$. Kies de kern $g(x) = \sin(x)$, dus $g'(x) = \cos(x)$ en $\cos(x)\,\mathrm{d}x = \mathrm{d}(\sin(x))$.`,
      grenzen: r`De integraal wordt $\int g^{-3}\,\mathrm{d}g = -\tfrac{1}{2}g^{-2}$. De grenzen van $g$: bij $x = \tfrac{1}{6}\pi$ hoort $g = \tfrac{1}{2}$, bij $x = \tfrac{1}{2}\pi$ hoort $g = 1$.`,
      invullen: r`Vul in: $\left[-\dfrac{1}{2g^{2}}\right]_{\frac{1}{2}}^{1} = -\tfrac{1}{2} - \left(-\dfrac{1}{2 \cdot \tfrac{1}{4}}\right) = -\tfrac{1}{2} + 2 = 1\tfrac{1}{2}$.`,
    }),
  },
  {
    cluster: 'k1b_grenzen_gonio',
    nummer: 'grenzen-gonio-6',
    level: 3,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{\frac{1}{4}\pi} \dfrac{\cos(x)}{3 + \sin(x)}\,\mathrm{d}x$`,
    antwoordLatex: r`\ln\left(\dfrac{6 + \sqrt{2}}{6}\right)`,
    antwoord: 'ln((6 + sqrt(2))/6)',
    alts: ['ln(3 + 1/2 sqrt(2)) - ln(3)', 'ln(1 + sqrt(2)/6)'],
    integrand: 'cos(x) / (3 + sin(x))',
    primitieve: 'ln(3 + sin(x))',
    grenzen: [0, PI / 4],
    waarde: 'ln((6 + sqrt(2)) / 6)',
    steps: bepaald({
      schil: r`${DEEL2} Het is een bepaalde integraal, dus na het primitiveren komen de grenzen aan de beurt. Buitenste schil: een breuk met een hele uitdrukking in de noemer en de afgeleide daarvan in de teller → er komt $\ln$ uit.`,
      kern: r`Kies de kern: $g(x) = 3 + \sin(x)$, dus $g'(x) = \cos(x)$. De teller is precies $g'(x)$, dus $\cos(x)\,\mathrm{d}x = \mathrm{d}(3 + \sin(x))$.`,
      grenzen: r`De integraal wordt $\int \dfrac{1}{g}\,\mathrm{d}g = \ln|g|$. De grenzen van $g$: bij $x = 0$ hoort $g = 3$, bij $x = \tfrac{1}{4}\pi$ hoort $g = 3 + \tfrac{1}{2}\sqrt{2}$. Beide zijn positief, dus de strepen mogen weg.`,
      invullen: r`Vul in: $\left[\ln(g)\right]_{3}^{3 + \frac{1}{2}\sqrt{2}} = \ln\left(3 + \tfrac{1}{2}\sqrt{2}\right) - \ln(3) = \ln\left(\dfrac{6 + \sqrt{2}}{6}\right)$. Exact laten staan.`,
    }),
  },

  // ── Bepaalde integralen met ln en e ────────────────────────────────────────
  {
    cluster: 'k1b_grenzen_ln_e',
    nummer: 'grenzen-ln-1',
    level: 1,
    latex: r`Bereken exact: $\displaystyle\int_{1}^{\mathrm{e}} \dfrac{\ln(x)}{x}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{2}`,
    antwoord: '1/2',
    alts: ['0,5'],
    integrand: 'ln(x) / x',
    primitieve: 'ln(x)^2 / 2',
    domein: [0.5, 3],
    grenzen: [1, E],
    waarde: '1/2',
    steps: bepaald({
      schil: SCHIL.bepaaldLnE,
      kern: r`Kies de kern: $g(x) = \ln(x)$, dus $g'(x) = \dfrac{1}{x}$. Die $\dfrac{1}{x}$ staat er als factor bij: $\dfrac{\ln(x)}{x} = \ln(x) \cdot \dfrac{1}{x}$.`,
      grenzen: r`Dan is $\dfrac{1}{x}\,\mathrm{d}x = \mathrm{d}(\ln(x))$ en wordt de integraal $\int g\,\mathrm{d}g = \tfrac{1}{2}g^{2}$. De grenzen van $g$: bij $x = 1$ hoort $g = 0$, bij $x = \mathrm{e}$ hoort $g = 1$.`,
      invullen: r`Vul in: $\left[\tfrac{1}{2}g^{2}\right]_{0}^{1} = \tfrac{1}{2} - 0 = \tfrac{1}{2}$.`,
    }),
  },
  {
    cluster: 'k1b_grenzen_ln_e',
    nummer: 'grenzen-ln-2',
    level: 1,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{1} x\,\mathrm{e}^{x^{2}}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{2}\left(\mathrm{e} - 1\right)`,
    antwoord: '(e - 1)/2',
    alts: ['1/2 e - 1/2', '1/2(e - 1)'],
    integrand: 'x * e^(x^2)',
    primitieve: 'e^(x^2) / 2',
    domein: [-1.5, 1.5],
    grenzen: [0, 1],
    waarde: '(e - 1) / 2',
    steps: bepaald({
      schil: SCHIL.bepaaldLnE,
      kern: r`Kies de kern: $g(x) = x^{2}$, dus $g'(x) = 2x$. Vóór de e-macht staat $x = \tfrac{1}{2}g'(x)$: dat past op een constante na.`,
      grenzen: r`Dan is $x\,\mathrm{d}x = \tfrac{1}{2}\,\mathrm{d}\left(x^{2}\right)$ en wordt de integraal $\int \tfrac{1}{2}\mathrm{e}^{g}\,\mathrm{d}g = \tfrac{1}{2}\mathrm{e}^{g}$. De grenzen van $g$: bij $x = 0$ hoort $g = 0$, bij $x = 1$ hoort $g = 1$.`,
      invullen: r`Vul in: $\left[\tfrac{1}{2}\mathrm{e}^{g}\right]_{0}^{1} = \tfrac{1}{2}\mathrm{e} - \tfrac{1}{2} = \tfrac{1}{2}\left(\mathrm{e} - 1\right)$. Exact laten staan.`,
    }),
  },
  {
    cluster: 'k1b_grenzen_ln_e',
    nummer: 'grenzen-ln-3',
    level: 2,
    latex: r`Bereken exact: $\displaystyle\int_{1}^{\mathrm{e}^{3}} \dfrac{\ln^{2}(x)}{x}\,\mathrm{d}x$`,
    antwoordLatex: r`9`,
    antwoord: '9',
    integrand: 'ln(x)^2 / x',
    primitieve: 'ln(x)^3 / 3',
    domein: [0.5, 25],
    grenzen: [1, E ** 3],
    waarde: '9',
    steps: bepaald({
      schil: SCHIL.bepaaldLnE,
      kern: r`Kies de kern: $g(x) = \ln(x)$, dus $g'(x) = \dfrac{1}{x}$. Er staat $\ln^{2}(x) \cdot \dfrac{1}{x}$: een macht van de kern met zijn afgeleide ernaast.`,
      grenzen: r`De integraal wordt $\int g^{2}\,\mathrm{d}g = \tfrac{1}{3}g^{3}$. De grenzen van $g$: bij $x = 1$ hoort $g = \ln(1) = 0$, bij $x = \mathrm{e}^{3}$ hoort $g = \ln\left(\mathrm{e}^{3}\right) = 3$.`,
      invullen: r`Vul in: $\left[\tfrac{1}{3}g^{3}\right]_{0}^{3} = \tfrac{1}{3} \cdot 27 - 0 = 9$.`,
    }),
  },
  {
    cluster: 'k1b_grenzen_ln_e',
    nummer: 'grenzen-ln-4',
    level: 2,
    latex: r`Bereken exact: $\displaystyle\int_{\mathrm{e}}^{\mathrm{e}^{4}} \dfrac{1}{x\ln(x)}\,\mathrm{d}x$`,
    antwoordLatex: r`\ln(4)`,
    antwoord: 'ln(4)',
    alts: ['2ln(2)'],
    integrand: '1 / (x * ln(x))',
    primitieve: 'ln(ln(x))',
    domein: [1.5, 60],
    grenzen: [E, E ** 4],
    waarde: 'ln(4)',
    steps: bepaald({
      schil: SCHIL.bepaaldLnE,
      kern: r`Kies de kern: $g(x) = \ln(x)$, dus $g'(x) = \dfrac{1}{x}$. Herschrijf de breuk als $\dfrac{1}{\ln(x)} \cdot \dfrac{1}{x}$: de kern staat in de noemer, zijn afgeleide ernaast.`,
      grenzen: r`De integraal wordt $\int \dfrac{1}{g}\,\mathrm{d}g = \ln|g|$. De grenzen van $g$: bij $x = \mathrm{e}$ hoort $g = 1$, bij $x = \mathrm{e}^{4}$ hoort $g = 4$. Allebei positief, dus de strepen mogen weg.`,
      invullen: r`Vul in: $\left[\ln(g)\right]_{1}^{4} = \ln(4) - \ln(1) = \ln(4)$. Exact laten staan.`,
    }),
  },
  {
    cluster: 'k1b_grenzen_ln_e',
    nummer: 'grenzen-ln-5',
    level: 3,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{1} \dfrac{x^{2}}{\mathrm{e}^{x^{3}}}\,\mathrm{d}x$`,
    antwoordLatex: r`\dfrac{\mathrm{e} - 1}{3\mathrm{e}}`,
    antwoord: '(e - 1)/(3e)',
    alts: ['1/3 - 1/(3e)', '(1 - e^(-1))/3'],
    integrand: 'x^2 / e^(x^3)',
    primitieve: '-e^(-x^3) / 3',
    domein: [-1.2, 1.2],
    grenzen: [0, 1],
    waarde: '(e - 1) / (3 * e)',
    steps: bepaald({
      schil: SCHIL.bepaaldLnE,
      kern: r`Haal de e-macht eerst naar boven: $\dfrac{x^{2}}{\mathrm{e}^{x^{3}}} = x^{2}\mathrm{e}^{-x^{3}}$. Kies de kern $g(x) = -x^{3}$, dus $g'(x) = -3x^{2}$ en $x^{2}\,\mathrm{d}x = -\tfrac{1}{3}\,\mathrm{d}\left(-x^{3}\right)$.`,
      grenzen: r`De integraal wordt $\int -\tfrac{1}{3}\mathrm{e}^{g}\,\mathrm{d}g = -\tfrac{1}{3}\mathrm{e}^{g}$. De grenzen van $g$: bij $x = 0$ hoort $g = 0$, bij $x = 1$ hoort $g = -1$.`,
      invullen: r`Vul in: $\left[-\tfrac{1}{3}\mathrm{e}^{g}\right]_{0}^{-1} = -\tfrac{1}{3}\mathrm{e}^{-1} + \tfrac{1}{3} = \dfrac{\mathrm{e} - 1}{3\mathrm{e}}$. Exact laten staan.`,
    }),
  },
  {
    cluster: 'k1b_grenzen_ln_e',
    nummer: 'grenzen-ln-6',
    level: 3,
    latex: r`Bereken exact: $\displaystyle\int_{\mathrm{e}}^{\mathrm{e}^{2}} \dfrac{1}{x\sqrt{\ln(x)}}\,\mathrm{d}x$`,
    antwoordLatex: r`2\sqrt{2} - 2`,
    antwoord: '2sqrt(2) - 2',
    alts: ['2(sqrt(2) - 1)', '-2 + 2sqrt(2)'],
    integrand: '1 / (x * sqrt(ln(x)))',
    primitieve: '2 * sqrt(ln(x))',
    domein: [1.2, 9],
    grenzen: [E, E ** 2],
    waarde: '2 * sqrt(2) - 2',
    steps: bepaald({
      schil: SCHIL.bepaaldLnE,
      kern: r`Kies de kern: $g(x) = \ln(x)$, dus $g'(x) = \dfrac{1}{x}$. Herschrijf als $\dfrac{1}{\sqrt{\ln(x)}} \cdot \dfrac{1}{x}$, en de wortel als macht: $g^{-\frac{1}{2}}$.`,
      grenzen: r`De integraal wordt $\int g^{-\frac{1}{2}}\,\mathrm{d}g = 2g^{\frac{1}{2}} = 2\sqrt{g}$. De grenzen van $g$: bij $x = \mathrm{e}$ hoort $g = 1$, bij $x = \mathrm{e}^{2}$ hoort $g = 2$.`,
      invullen: r`Vul in: $\left[2\sqrt{g}\right]_{1}^{2} = 2\sqrt{2} - 2$. Exact laten staan.`,
    }),
  },

  // ── De substitutie √(…) = g ────────────────────────────────────────────────
  {
    cluster: 'k1b_wortelsubstitutie',
    nummer: 'wortel-1',
    level: 1,
    latex: r`Bereken exact met de substitutie $\sqrt{x + 4} = g$: $\displaystyle\int_{0}^{12} \dfrac{x}{\sqrt{x + 4}}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{64}{3}`,
    antwoord: '64/3',
    alts: ['21 1/3', '21⅓'],
    integrand: 'x / sqrt(x + 4)',
    primitieve: '2 * (x + 4) * sqrt(x + 4) / 3 - 8 * sqrt(x + 4)',
    domein: [-3, 14],
    grenzen: [0, 12],
    waarde: '64/3',
    steps: wortelSubstitutie({
      stel: r`Hier is dat $g = \sqrt{x + 4}$.`,
      terug: r`Kwadrateren geeft $g^{2} = x + 4$, dus $x = g^{2} - 4$ en $\mathrm{d}x = \mathrm{d}\left(g^{2} - 4\right) = 2g\,\mathrm{d}g$. De grenzen gaan mee: bij $x = 0$ hoort $g = \sqrt{4} = 2$ en bij $x = 12$ hoort $g = \sqrt{16} = 4$.`,
      omschrijven: r`Zet alles om: $\displaystyle\int_{0}^{12} \dfrac{x}{\sqrt{x + 4}}\,\mathrm{d}x = \int_{2}^{4} \dfrac{g^{2} - 4}{g} \cdot 2g\,\mathrm{d}g = \int_{2}^{4} \left(2g^{2} - 8\right)\mathrm{d}g$. Er staat geen $x$ meer in: dat is het teken dat de substitutie klopt.`,
      invullen: r`Primitiveer en vul de grenzen in: $\left[\tfrac{2}{3}g^{3} - 8g\right]_{2}^{4} = \left(\tfrac{128}{3} - 32\right) - \left(\tfrac{16}{3} - 16\right) = \tfrac{112}{3} - 16 = \tfrac{64}{3}$. De uitkomst is $21\tfrac{1}{3}$.`,
    }),
  },
  {
    cluster: 'k1b_wortelsubstitutie',
    nummer: 'wortel-2',
    level: 1,
    latex: r`Bereken exact met de substitutie $\sqrt{x + 3} = g$: $\displaystyle\int_{1}^{6} x\sqrt{x + 3}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{232}{5}`,
    antwoord: '232/5',
    alts: ['46 2/5', '46,4'],
    integrand: 'x * sqrt(x + 3)',
    primitieve: '2 * (x + 3)^2 * sqrt(x + 3) / 5 - 2 * (x + 3) * sqrt(x + 3)',
    domein: [-2, 8],
    grenzen: [1, 6],
    waarde: '232/5',
    steps: wortelSubstitutie({
      stel: r`Hier is dat $g = \sqrt{x + 3}$.`,
      terug: r`Kwadrateren geeft $g^{2} = x + 3$, dus $x = g^{2} - 3$ en $\mathrm{d}x = 2g\,\mathrm{d}g$. De grenzen gaan mee: bij $x = 1$ hoort $g = \sqrt{4} = 2$ en bij $x = 6$ hoort $g = \sqrt{9} = 3$.`,
      omschrijven: r`Zet alles om: $\displaystyle\int_{1}^{6} x\sqrt{x + 3}\,\mathrm{d}x = \int_{2}^{3} \left(g^{2} - 3\right) \cdot g \cdot 2g\,\mathrm{d}g = \int_{2}^{3} \left(2g^{4} - 6g^{2}\right)\mathrm{d}g$.`,
      invullen: r`Primitiveer en vul de grenzen in: $\left[\tfrac{2}{5}g^{5} - 2g^{3}\right]_{2}^{3} = \left(\tfrac{486}{5} - 54\right) - \left(\tfrac{64}{5} - 16\right) = \tfrac{422}{5} - 38 = \tfrac{232}{5}$. De uitkomst is $46\tfrac{2}{5}$.`,
    }),
  },
  {
    cluster: 'k1b_wortelsubstitutie',
    nummer: 'wortel-3',
    level: 2,
    latex: r`Bereken exact met de substitutie $\sqrt{x - 1} = g$: $\displaystyle\int_{1}^{10} x\sqrt{x - 1}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{576}{5}`,
    antwoord: '576/5',
    alts: ['115 1/5', '115,2'],
    integrand: 'x * sqrt(x - 1)',
    primitieve: '2 * (x - 1)^2 * sqrt(x - 1) / 5 + 2 * (x - 1) * sqrt(x - 1) / 3',
    domein: [1.1, 12],
    grenzen: [1, 10],
    waarde: '576/5',
    steps: wortelSubstitutie({
      stel: r`Hier staat een min onder de wortel: $g = \sqrt{x - 1}$.`,
      terug: r`Kwadrateren geeft $g^{2} = x - 1$, dus nu $x = g^{2} + 1$ — let op het plusteken — en $\mathrm{d}x = 2g\,\mathrm{d}g$. De grenzen: bij $x = 1$ hoort $g = 0$ en bij $x = 10$ hoort $g = 3$.`,
      omschrijven: r`Zet alles om: $\displaystyle\int_{1}^{10} x\sqrt{x - 1}\,\mathrm{d}x = \int_{0}^{3} \left(g^{2} + 1\right) \cdot g \cdot 2g\,\mathrm{d}g = \int_{0}^{3} \left(2g^{4} + 2g^{2}\right)\mathrm{d}g$.`,
      invullen: r`Primitiveer en vul de grenzen in: $\left[\tfrac{2}{5}g^{5} + \tfrac{2}{3}g^{3}\right]_{0}^{3} = \tfrac{486}{5} + 18 - 0 = \tfrac{576}{5}$. De uitkomst is $115\tfrac{1}{5}$.`,
    }),
  },
  {
    cluster: 'k1b_wortelsubstitutie',
    nummer: 'wortel-4',
    level: 2,
    latex: r`Bereken exact met de substitutie $\sqrt{x + 4} = g$: $\displaystyle\int_{0}^{5} \dfrac{6x}{\sqrt{x + 4}}\,\mathrm{d}x$`,
    antwoordLatex: r`28`,
    antwoord: '28',
    integrand: '6 * x / sqrt(x + 4)',
    primitieve: '4 * (x + 4) * sqrt(x + 4) - 48 * sqrt(x + 4)',
    domein: [-3, 8],
    grenzen: [0, 5],
    waarde: '28',
    steps: wortelSubstitutie({
      stel: r`Hier is dat $g = \sqrt{x + 4}$; de factor $6$ zet je gewoon vóór de integraal.`,
      terug: r`Kwadrateren geeft $g^{2} = x + 4$, dus $x = g^{2} - 4$ en $\mathrm{d}x = 2g\,\mathrm{d}g$. De grenzen: bij $x = 0$ hoort $g = 2$ en bij $x = 5$ hoort $g = 3$.`,
      omschrijven: r`Zet alles om: $\displaystyle\int_{0}^{5} \dfrac{6x}{\sqrt{x + 4}}\,\mathrm{d}x = \int_{2}^{3} \dfrac{6\left(g^{2} - 4\right)}{g} \cdot 2g\,\mathrm{d}g = \int_{2}^{3} \left(12g^{2} - 48\right)\mathrm{d}g$.`,
      invullen: r`Primitiveer en vul de grenzen in: $\left[4g^{3} - 48g\right]_{2}^{3} = (108 - 144) - (32 - 96) = -36 + 64 = 28$.`,
    }),
  },
  {
    cluster: 'k1b_wortelsubstitutie',
    nummer: 'wortel-5',
    level: 3,
    latex: r`Bereken exact met de substitutie $\sqrt{2x + 1} = g$: $\displaystyle\int_{0}^{4} \dfrac{x}{\sqrt{2x + 1}}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{10}{3}`,
    antwoord: '10/3',
    alts: ['3 1/3', '3⅓'],
    integrand: 'x / sqrt(2 * x + 1)',
    primitieve: '(2 * x + 1) * sqrt(2 * x + 1) / 6 - sqrt(2 * x + 1) / 2',
    domein: [-0.4, 6],
    grenzen: [0, 4],
    waarde: '10/3',
    steps: wortelSubstitutie({
      stel: r`Nu staat er $2x$ onder de wortel: $g = \sqrt{2x + 1}$.`,
      terug: r`Kwadrateren geeft $g^{2} = 2x + 1$, dus $x = \tfrac{1}{2}\left(g^{2} - 1\right)$ en $\mathrm{d}x = \mathrm{d}\left(\tfrac{1}{2}g^{2} - \tfrac{1}{2}\right) = g\,\mathrm{d}g$ — door die $2$ valt de factor $2$ hier weg. De grenzen: bij $x = 0$ hoort $g = 1$ en bij $x = 4$ hoort $g = 3$.`,
      omschrijven: r`Zet alles om: $\displaystyle\int_{0}^{4} \dfrac{x}{\sqrt{2x + 1}}\,\mathrm{d}x = \int_{1}^{3} \dfrac{\tfrac{1}{2}\left(g^{2} - 1\right)}{g} \cdot g\,\mathrm{d}g = \int_{1}^{3} \tfrac{1}{2}\left(g^{2} - 1\right)\mathrm{d}g$.`,
      invullen: r`Primitiveer en vul de grenzen in: $\left[\tfrac{1}{6}g^{3} - \tfrac{1}{2}g\right]_{1}^{3} = \left(\tfrac{27}{6} - \tfrac{3}{2}\right) - \left(\tfrac{1}{6} - \tfrac{1}{2}\right) = 3 + \tfrac{1}{3} = \tfrac{10}{3}$. De uitkomst is $3\tfrac{1}{3}$.`,
    }),
  },
  {
    cluster: 'k1b_wortelsubstitutie',
    nummer: 'wortel-6',
    level: 3,
    latex: r`Bereken exact met de substitutie $\sqrt{2x + 3} = g$: $\displaystyle\int_{-1}^{3} x\sqrt{2x + 3}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{56}{5}`,
    antwoord: '56/5',
    alts: ['11 1/5', '11,2'],
    integrand: 'x * sqrt(2 * x + 3)',
    primitieve: '(2 * x + 3)^2 * sqrt(2 * x + 3) / 10 - (2 * x + 3) * sqrt(2 * x + 3) / 2',
    domein: [-1.4, 4],
    grenzen: [-1, 3],
    waarde: '56/5',
    steps: wortelSubstitutie({
      stel: r`Hier is dat $g = \sqrt{2x + 3}$.`,
      terug: r`Kwadrateren geeft $g^{2} = 2x + 3$, dus $x = \tfrac{1}{2}\left(g^{2} - 3\right)$ en $\mathrm{d}x = g\,\mathrm{d}g$. De grenzen: bij $x = -1$ hoort $g = \sqrt{1} = 1$ en bij $x = 3$ hoort $g = \sqrt{9} = 3$.`,
      omschrijven: r`Zet alles om: $\displaystyle\int_{-1}^{3} x\sqrt{2x + 3}\,\mathrm{d}x = \int_{1}^{3} \tfrac{1}{2}\left(g^{2} - 3\right) \cdot g \cdot g\,\mathrm{d}g = \int_{1}^{3} \left(\tfrac{1}{2}g^{4} - \tfrac{3}{2}g^{2}\right)\mathrm{d}g$.`,
      invullen: r`Primitiveer en vul de grenzen in: $\left[\tfrac{1}{10}g^{5} - \tfrac{1}{2}g^{3}\right]_{1}^{3} = \left(\tfrac{243}{10} - \tfrac{27}{2}\right) - \left(\tfrac{1}{10} - \tfrac{1}{2}\right) = \tfrac{54}{5} + \tfrac{2}{5} = \tfrac{56}{5}$. De uitkomst is $11\tfrac{1}{5}$.`,
    }),
  },

  // ── Oppervlakte en p bepalen ───────────────────────────────────────────────
  {
    cluster: 'k1b_opp_p',
    nummer: 'opp-1',
    level: 1,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{\ln(x)}{x}$, de $x$-as en de lijn $x = \mathrm{e}^{2}$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`2`,
    antwoord: '2',
    integrand: 'ln(x) / x',
    primitieve: 'ln(x)^2 / 2',
    domein: [0.5, 9],
    grenzen: [1, E ** 2],
    waarde: '2',
    steps: toepassing({
      deel1: r`Deel 1 van de driedeling: vertaal het verhaaltje naar een integraal. De grafiek snijdt de $x$-as waar $\ln(x) = 0$, dus bij $x = 1$; tussen $1$ en $\mathrm{e}^{2}$ ligt hij erboven. De oppervlakte is $\displaystyle\int_{1}^{\mathrm{e}^{2}} \dfrac{\ln(x)}{x}\,\mathrm{d}x$.`,
      integraal: r`Deel 2: welke standaardvorm is dit? Schrijf $\dfrac{\ln(x)}{x} = \ln(x) \cdot \dfrac{1}{x}$: de kern $g(x) = \ln(x)$ met zijn afgeleide $g'(x) = \dfrac{1}{x}$ ernaast → substitutiemethode.`,
      primitiveren: r`Primitiveer: $\int g\,\mathrm{d}g = \tfrac{1}{2}g^{2}$, dus $F(x) = \tfrac{1}{2}\ln^{2}(x)$. De grenzen van $g$: bij $x = 1$ hoort $g = 0$, bij $x = \mathrm{e}^{2}$ hoort $g = 2$.`,
      afronden: r`Vul de grenzen in: $\left[\tfrac{1}{2}g^{2}\right]_{0}^{2} = \tfrac{1}{2} \cdot 4 - 0 = 2$. De oppervlakte is $2$.`,
    }),
  },
  {
    cluster: 'k1b_opp_p',
    nummer: 'opp-2',
    level: 1,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sin(x)\cos^{2}(x)$, de $x$-as en de lijn $x = \tfrac{1}{2}\pi$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\tfrac{1}{3}`,
    antwoord: '1/3',
    integrand: 'sin(x) * cos(x)^2',
    primitieve: '-cos(x)^3 / 3',
    grenzen: [0, PI / 2],
    waarde: '1/3',
    steps: toepassing({
      deel1: r`Deel 1 van de driedeling: vertaal het verhaaltje naar een integraal. De grafiek snijdt de $x$-as bij $x = 0$ (want $\sin(0) = 0$) en ligt tussen $0$ en $\tfrac{1}{2}\pi$ erboven. De oppervlakte is $\displaystyle\int_{0}^{\frac{1}{2}\pi} \sin(x)\cos^{2}(x)\,\mathrm{d}x$.`,
      integraal: r`Deel 2: een macht van de cosinus met een losse sinus ernaast → substitutiemethode met de kern $g(x) = \cos(x)$, dus $g'(x) = -\sin(x)$ en $\sin(x)\,\mathrm{d}x = -\mathrm{d}(\cos(x))$.`,
      primitiveren: r`Primitiveer: $\int -g^{2}\,\mathrm{d}g = -\tfrac{1}{3}g^{3}$, dus $F(x) = -\tfrac{1}{3}\cos^{3}(x)$. De grenzen van $g$: bij $x = 0$ hoort $g = 1$, bij $x = \tfrac{1}{2}\pi$ hoort $g = 0$.`,
      afronden: r`Vul de grenzen in: $\left[-\tfrac{1}{3}g^{3}\right]_{1}^{0} = 0 - \left(-\tfrac{1}{3}\right) = \tfrac{1}{3}$. De oppervlakte is $\tfrac{1}{3}$.`,
    }),
  },
  {
    cluster: 'k1b_opp_p',
    nummer: 'opp-3',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \tan(x)$, de $x$-as en de lijn $x = \tfrac{1}{3}\pi$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\ln(2)`,
    antwoord: 'ln(2)',
    integrand: 'tan(x)',
    primitieve: '-ln(cos(x))',
    domein: [-1.4, 1.4],
    grenzen: [0, PI / 3],
    waarde: 'ln(2)',
    steps: toepassing({
      deel1: r`Deel 1 van de driedeling: vertaal het verhaaltje naar een integraal. De grafiek van $\tan$ snijdt de $x$-as bij $x = 0$ en ligt tussen $0$ en $\tfrac{1}{3}\pi$ erboven. De oppervlakte is $\displaystyle\int_{0}^{\frac{1}{3}\pi} \tan(x)\,\mathrm{d}x$.`,
      integraal: r`Deel 2: schrijf $\tan(x) = \dfrac{\sin(x)}{\cos(x)}$. De kern is $g(x) = \cos(x)$ met $g'(x) = -\sin(x)$, dus $\sin(x)\,\mathrm{d}x = -\mathrm{d}(\cos(x))$ → substitutiemethode.`,
      primitiveren: r`Primitiveer: $\int -\dfrac{1}{g}\,\mathrm{d}g = -\ln|g|$, dus $F(x) = -\ln|\cos(x)|$. Op $\left[0, \tfrac{1}{3}\pi\right]$ is $\cos(x)$ positief, dus de strepen mogen weg.`,
      afronden: r`Vul de grenzen in: $\left[-\ln(\cos(x))\right]_{0}^{\frac{1}{3}\pi} = -\ln\left(\tfrac{1}{2}\right) + \ln(1) = \ln(2)$. De oppervlakte is $\ln(2)$; exact laten staan.`,
    }),
  },
  {
    cluster: 'k1b_opp_p',
    nummer: 'opp-4',
    level: 2,
    latex: r`De grafiek van $f(x) = \dfrac{3x^{2}}{x^{3} + 1}$, de $x$-as en de lijnen $x = 0$ en $x = p$ met $p > 0$ sluiten een vlakdeel in met oppervlakte $\ln(9)$. Bereken exact $p$.`,
    antwoordLatex: r`p = 2`,
    antwoord: '2',
    alts: ['p = 2'],
    integrand: '3 * x^2 / (x^3 + 1)',
    primitieve: 'ln(x^3 + 1)',
    domein: [0.1, 3],
    grenzen: [0, 2],
    waarde: 'ln(9)',
    steps: toepassing({
      deel1: r`Deel 1 van de driedeling: de oppervlakte is $\displaystyle\int_{0}^{p} \dfrac{3x^{2}}{x^{3} + 1}\,\mathrm{d}x$, en die moet $\ln(9)$ worden.`,
      integraal: r`Deel 2: een breuk met de kern $g(x) = x^{3} + 1$ in de noemer en teller $g'(x) = 3x^{2}$ → substitutiemethode, met $\ln$ als uitkomst.`,
      primitiveren: r`Primitiveer: $\int \dfrac{1}{g}\,\mathrm{d}g = \ln|g|$, dus $F(x) = \ln\left(x^{3} + 1\right)$; voor $x > 0$ is die kern positief. Invullen: $\left[\ln\left(x^{3} + 1\right)\right]_{0}^{p} = \ln\left(p^{3} + 1\right) - \ln(1) = \ln\left(p^{3} + 1\right)$.`,
      afronden: r`Deel 3: los de vergelijking op. Uit $\ln\left(p^{3} + 1\right) = \ln(9)$ volgt $p^{3} + 1 = 9$, dus $p^{3} = 8$ en $p = 2$.`,
    }),
  },
  {
    cluster: 'k1b_opp_p',
    nummer: 'opp-5',
    level: 3,
    latex: r`Gegeven zijn de functies $f(x) = \dfrac{9\ln^{2}(x)}{x}$ en $h(x) = \dfrac{1}{x}$. Bereken exact de oppervlakte van het vlakdeel $V$ dat wordt ingesloten door de grafieken van $f$ en $h$.`,
    antwoordLatex: r`\tfrac{4}{9}`,
    antwoord: '4/9',
    integrand: '1 / x - 9 * ln(x)^2 / x',
    primitieve: 'ln(x) - 3 * ln(x)^3',
    domein: [0.3, 3],
    grenzen: [Math.exp(-1 / 3), Math.exp(1 / 3)],
    waarde: '4/9',
    steps: toepassing({
      deel1: r`Deel 1 van de driedeling: zoek eerst de snijpunten. Beide functies bestaan alleen voor $x > 0$, dus je mag met $x$ vermenigvuldigen: $9\ln^{2}(x) = 1$ geeft $\ln(x) = \pm\tfrac{1}{3}$, dus $x = \mathrm{e}^{-\frac{1}{3}}$ en $x = \mathrm{e}^{\frac{1}{3}}$. Daartussen ligt $h$ boven $f$, dus de oppervlakte is $\displaystyle\int_{\mathrm{e}^{-1/3}}^{\mathrm{e}^{1/3}} \left(\dfrac{1}{x} - \dfrac{9\ln^{2}(x)}{x}\right)\mathrm{d}x$.`,
      integraal: r`Deel 2: haal $\dfrac{1}{x}$ voorop: $\left(1 - 9\ln^{2}(x)\right) \cdot \dfrac{1}{x}$. De kern is $g(x) = \ln(x)$ met $g'(x) = \dfrac{1}{x}$ → substitutiemethode.`,
      primitiveren: r`Primitiveer: $\int \left(1 - 9g^{2}\right)\mathrm{d}g = g - 3g^{3}$. De grenzen van $g$: bij $x = \mathrm{e}^{-\frac{1}{3}}$ hoort $g = -\tfrac{1}{3}$, bij $x = \mathrm{e}^{\frac{1}{3}}$ hoort $g = \tfrac{1}{3}$.`,
      afronden: r`Vul de grenzen in: $\left[g - 3g^{3}\right]_{-\frac{1}{3}}^{\frac{1}{3}} = \left(\tfrac{1}{3} - \tfrac{1}{9}\right) - \left(-\tfrac{1}{3} + \tfrac{1}{9}\right) = \tfrac{2}{9} + \tfrac{2}{9} = \tfrac{4}{9}$. De oppervlakte is $\tfrac{4}{9}$.`,
    }),
  },
  {
    cluster: 'k1b_opp_p',
    nummer: 'opp-6',
    level: 3,
    latex: r`De grafiek van $f(x) = \dfrac{x}{x^{2} + 1}$, de $x$-as en de lijnen $x = 0$ en $x = p$ met $p > 0$ sluiten een vlakdeel in met oppervlakte $\ln(3)$. Bereken exact $p$.`,
    antwoordLatex: r`p = 2\sqrt{2}`,
    antwoord: '2sqrt(2)',
    alts: ['p = 2sqrt(2)', 'sqrt(8)', 'p = sqrt(8)'],
    integrand: 'x / (x^2 + 1)',
    primitieve: 'ln(x^2 + 1) / 2',
    grenzen: [0, 2 * Math.SQRT2],
    waarde: 'ln(3)',
    steps: toepassing({
      deel1: r`Deel 1 van de driedeling: de oppervlakte is $\displaystyle\int_{0}^{p} \dfrac{x}{x^{2} + 1}\,\mathrm{d}x$, en die moet $\ln(3)$ worden.`,
      integraal: r`Deel 2: een breuk met de kern $g(x) = x^{2} + 1$ in de noemer. Nu is $g'(x) = 2x$ en staat er maar $x$ in de teller, dus $x\,\mathrm{d}x = \tfrac{1}{2}\,\mathrm{d}\left(x^{2} + 1\right)$ → substitutiemethode, met een halve erbij.`,
      primitiveren: r`Primitiveer: $\int \tfrac{1}{2} \cdot \dfrac{1}{g}\,\mathrm{d}g = \tfrac{1}{2}\ln|g|$, dus $F(x) = \tfrac{1}{2}\ln\left(x^{2} + 1\right)$. Invullen: $\left[\tfrac{1}{2}\ln\left(x^{2} + 1\right)\right]_{0}^{p} = \tfrac{1}{2}\ln\left(p^{2} + 1\right)$.`,
      afronden: r`Deel 3: los de vergelijking op. Uit $\tfrac{1}{2}\ln\left(p^{2} + 1\right) = \ln(3)$ volgt $\ln\left(p^{2} + 1\right) = 2\ln(3) = \ln(9)$, dus $p^{2} + 1 = 9$ en $p^{2} = 8$. Omdat $p > 0$: $p = \sqrt{8} = 2\sqrt{2}$.`,
    }),
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Hoofdstuk, topics en clusters
// ─────────────────────────────────────────────────────────────────────────────

const K1B: AdditiveChapter = {
  chapterSlug: 'k',
  chapterTitle: 'K — Voortgezette integraalrekening',
  bookPart: 4,
  chapterOrder: 12,
  site: 'integralen',
  migrationFile: '0036_k1b_substitutiemethode.sql',
  headerTitle: 'K.1 Theorie B — Toepassingen van de substitutiemethode',
  sourceScript: 'scripts/k1b-content.ts',
  headerNotes: [
    'Theorieblok B van K.1: de substitutiemethode toepassen waar de kern niet',
    'meteen zichtbaar is. Tangens wordt sin/cos, een oneven macht van sinus of',
    'cosinus wordt herschreven met sin² + cos² = 1, en bij een wortel maak je de',
    'wortel zelf tot nieuwe variabele g. Bij een bepaalde integraal gaan de',
    'grenzen mee naar g.',
    '',
    'Eigen oefenvragen, geen boekopgaven. Elke primitieve wordt nagerekend door',
    'src/content/primitieven.test.ts (content/hoofdstuk-k/k1b.json).',
  ],
  topics: [
    { slug: 'k1b_gonio', title: 'Gonio primitiveren met de substitutiemethode', order: 7, category: 'primitiveren' },
    { slug: 'k1b_bepaald', title: 'Bepaalde integralen met de substitutiemethode', order: 8, category: 'integralen' },
    { slug: 'k1b_toepassingen', title: 'Oppervlakte met de substitutiemethode', order: 9, category: 'toepassingen' },
  ],
  clusters: [
    { topic: 'k1b_gonio', slug: 'k1b_tangens', title: 'Tangens en breuken met sinus en cosinus', order: 1 },
    { topic: 'k1b_gonio', slug: 'k1b_oneven_macht', title: 'Oneven machten van sinus en cosinus', order: 2 },
    { topic: 'k1b_bepaald', slug: 'k1b_grenzen_gonio', title: 'Grenzen omzetten bij gonio', order: 1 },
    { topic: 'k1b_bepaald', slug: 'k1b_grenzen_ln_e', title: 'Grenzen omzetten bij ln en e', order: 2 },
    { topic: 'k1b_bepaald', slug: 'k1b_wortelsubstitutie', title: 'De substitutie wortel(x + a) = g', order: 3 },
    { topic: 'k1b_toepassingen', slug: 'k1b_opp_p', title: 'Oppervlakte en p bepalen', order: 1 },
  ],
  questions: VRAGEN,
}

// ─────────────────────────────────────────────────────────────────────────────
// Schrijven
// ─────────────────────────────────────────────────────────────────────────────

const wortel = process.cwd()

const contentPad = path.join(wortel, 'content', 'hoofdstuk-k', 'k1b.json')
writeFileSync(
  contentPad,
  generateContentFile(K1B, 'K.1 Theorie B — Toepassingen van de substitutiemethode (eigen varianten)'),
)

const migratiePad = path.join(wortel, 'supabase', 'migrations', K1B.migrationFile)
writeFileSync(migratiePad, generateAdditiveMigration(K1B))

console.log(`Geschreven: ${contentPad}`)
console.log(`Geschreven: ${migratiePad}`)
console.log(`Vragen: ${K1B.questions.length}, stappen: ${K1B.questions.length * 4}`)
