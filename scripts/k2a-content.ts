/**
 * K.2 Theorie A — Primitiveren en de productregel (partieel integreren).
 *
 * Eigen oefenvragen in de stijl van dit theorieblok. Uit de productregel
 * $[g \cdot h]' = g' \cdot h + g \cdot h'$ volgt
 *
 *     ∫ g(x) · h'(x) dx = g(x) · h(x) − ∫ h(x) · g'(x) dx
 *
 * Je kiest dus één factor om te primitiveren (dat wordt h') en één om te
 * differentiëren (dat wordt g). De keuze is goed als de overgebleven integraal
 * makkelijker is dan de oorspronkelijke. Hier gaat het steeds om één keer
 * partieel integreren; twee keer achter elkaar is Theorie B.
 *
 * Het boek noemt die twee factoren f en g'; op de site heten functies f, g en
 * h, dus staat de regel er met g en h'.
 *
 * Draaien met:  npx jiti scripts/k2a-content.ts
 *
 * Schrijft twee bestanden:
 *   • content/hoofdstuk-k/k2a.json                  — leest src/content/primitieven.test.ts
 *   • supabase/migrations/0037_k2a_productregel.sql — alleen rijen toevoegen
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
// gewone getallen staan. In de opgave zelf blijft de grens exact ($\tfrac{1}{2}\pi$,
// $\mathrm{e}$); deze constanten zijn alleen de decimale kant daarvan.
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

/** De regel zelf, steeds in dezelfde letters: g differentiëren, h' primitiveren. */
const REGEL = r`$\int g(x) \cdot h'(x)\,\mathrm{d}x = g(x) \cdot h(x) - \int h(x) \cdot g'(x)\,\mathrm{d}x$`

/** De buitenste schil, per soort product steeds in dezelfde woorden. */
const SCHIL = {
  gonio: r`Buitenste schil: een product van een veelterm in $x$ en een sinus of cosinus → partieel integreren. Een gonio primitiveren is net zo makkelijk als de gonio zelf, en de veelterm wordt juist eenvoudiger als je hem differentieert.`,
  emacht: r`Buitenste schil: een product van een veelterm in $x$ en een e-macht → partieel integreren. Een e-macht primitiveren verandert bijna niets, terwijl de veelterm door het differentiëren simpeler wordt.`,
  ln: r`Buitenste schil: een product met $\ln$ erin → partieel integreren, en wel andersom dan je zou denken: de $\ln$ differentiëer je (dat geeft $\dfrac{1}{x}$, een macht van $x$) en de macht van $x$ primitiveer je.`,
}

/** Primitiveren met één keer partieel integreren. */
function partieel(s: { schil: string; keuze: string; invullen: string; klaar: string }): Steps {
  return [`${DEEL2} ${s.schil}`, s.keuze, `Vul de regel in: ${REGEL}. ${s.invullen}`, s.klaar]
}

/** Bepaalde integraal: eerst de primitieve, dan pas de grenzen. */
function bepaald(s: { schil: string; keuze: string; primitiveren: string; invullen: string }): Steps {
  return [
    `${DEEL2} Het is een bepaalde integraal, dus eerst primitiveren en daarna de grenzen invullen. ${s.schil}`,
    s.keuze,
    `Vul de regel in: ${REGEL}. ${s.primitiveren}`,
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
  // ── Een veelterm maal een sinus of cosinus ────────────────────────────────
  {
    cluster: 'k2a_macht_gonio',
    nummer: 'gonio-1',
    level: 1,
    latex: r`Primitiveer: $f(x) = x\cos(2x)$`,
    antwoordLatex: r`F(x) = \tfrac{1}{2}x\sin(2x) + \tfrac{1}{4}\cos(2x) + c`,
    antwoord: 'x sin(2x)/2 + cos(2x)/4 + c',
    alts: ['1/2 x sin(2x) + 1/4 cos(2x) + c', '0,5x sin(2x) + 0,25cos(2x) + c'],
    integrand: 'x * cos(2 * x)',
    primitieve: 'x * sin(2 * x) / 2 + cos(2 * x) / 4',
    steps: partieel({
      schil: SCHIL.gonio,
      keuze: r`Noem de factor die je eerst primitiveert $h'$ en de andere $g$: $h'(x) = \cos(2x)$, dus $h(x) = \tfrac{1}{2}\sin(2x)$, en $g(x) = x$, dus $g'(x) = 1$.`,
      invullen: r`Dat geeft $\int x\cos(2x)\,\mathrm{d}x = x \cdot \tfrac{1}{2}\sin(2x) - \int \tfrac{1}{2}\sin(2x) \cdot 1\,\mathrm{d}x$.`,
      klaar: r`Bereken wat er overblijft: $\int \tfrac{1}{2}\sin(2x)\,\mathrm{d}x = -\tfrac{1}{4}\cos(2x)$, dus $F(x) = \tfrac{1}{2}x\sin(2x) + \tfrac{1}{4}\cos(2x) + c$. Controle: differentiëren geeft $\tfrac{1}{2}\sin(2x) + x\cos(2x) - \tfrac{1}{2}\sin(2x) = x\cos(2x)$.`,
    }),
  },
  {
    cluster: 'k2a_macht_gonio',
    nummer: 'gonio-2',
    level: 1,
    latex: r`Primitiveer: $f(x) = 4x\sin(x)$`,
    antwoordLatex: r`F(x) = -4x\cos(x) + 4\sin(x) + c`,
    antwoord: '-4x cos(x) + 4sin(x) + c',
    alts: ['4sin(x) - 4x cos(x) + c'],
    integrand: '4 * x * sin(x)',
    primitieve: '-4 * x * cos(x) + 4 * sin(x)',
    steps: partieel({
      schil: SCHIL.gonio,
      keuze: r`Noem de factor die je eerst primitiveert $h'$ en de andere $g$: $h'(x) = \sin(x)$, dus $h(x) = -\cos(x)$, en $g(x) = 4x$, dus $g'(x) = 4$.`,
      invullen: r`Dat geeft $\int 4x\sin(x)\,\mathrm{d}x = 4x \cdot \left(-\cos(x)\right) - \int -\cos(x) \cdot 4\,\mathrm{d}x = -4x\cos(x) + \int 4\cos(x)\,\mathrm{d}x$.`,
      klaar: r`Bereken wat er overblijft: $\int 4\cos(x)\,\mathrm{d}x = 4\sin(x)$, dus $F(x) = -4x\cos(x) + 4\sin(x) + c$. Controle: differentiëren geeft $-4\cos(x) + 4x\sin(x) + 4\cos(x) = 4x\sin(x)$.`,
    }),
  },
  {
    cluster: 'k2a_macht_gonio',
    nummer: 'gonio-3',
    level: 2,
    latex: r`Primitiveer: $f(x) = (4x - 1)\cos(x)$`,
    antwoordLatex: r`F(x) = (4x - 1)\sin(x) + 4\cos(x) + c`,
    antwoord: '(4x - 1)sin(x) + 4cos(x) + c',
    alts: ['4x sin(x) - sin(x) + 4cos(x) + c'],
    integrand: '(4 * x - 1) * cos(x)',
    primitieve: '(4 * x - 1) * sin(x) + 4 * cos(x)',
    steps: partieel({
      schil: SCHIL.gonio,
      keuze: r`Noem de factor die je eerst primitiveert $h'$ en de andere $g$: $h'(x) = \cos(x)$, dus $h(x) = \sin(x)$, en $g(x) = 4x - 1$, dus $g'(x) = 4$. De hele haakjesterm gaat in één keer mee als $g$; uitvermenigvuldigen hoeft niet.`,
      invullen: r`Dat geeft $\int (4x - 1)\cos(x)\,\mathrm{d}x = (4x - 1)\sin(x) - \int \sin(x) \cdot 4\,\mathrm{d}x$.`,
      klaar: r`Bereken wat er overblijft: $\int 4\sin(x)\,\mathrm{d}x = -4\cos(x)$, dus $F(x) = (4x - 1)\sin(x) + 4\cos(x) + c$. Controle: differentiëren geeft $4\sin(x) + (4x - 1)\cos(x) - 4\sin(x) = (4x - 1)\cos(x)$.`,
    }),
  },
  {
    cluster: 'k2a_macht_gonio',
    nummer: 'gonio-4',
    level: 2,
    latex: r`Primitiveer: $f(x) = (2 - x)\sin(2x)$`,
    antwoordLatex: r`F(x) = -\tfrac{1}{2}(2 - x)\cos(2x) - \tfrac{1}{4}\sin(2x) + c`,
    antwoord: '-(2 - x)cos(2x)/2 - sin(2x)/4 + c',
    alts: ['-1/2 (2 - x)cos(2x) - 1/4 sin(2x) + c', '(x - 2)cos(2x)/2 - sin(2x)/4 + c'],
    integrand: '(2 - x) * sin(2 * x)',
    primitieve: '-(2 - x) * cos(2 * x) / 2 - sin(2 * x) / 4',
    steps: partieel({
      schil: SCHIL.gonio,
      keuze: r`Noem de factor die je eerst primitiveert $h'$ en de andere $g$: $h'(x) = \sin(2x)$, dus $h(x) = -\tfrac{1}{2}\cos(2x)$, en $g(x) = 2 - x$, dus $g'(x) = -1$. Let op het minteken in $g'$.`,
      invullen: r`Dat geeft $\int (2 - x)\sin(2x)\,\mathrm{d}x = -\tfrac{1}{2}(2 - x)\cos(2x) - \int -\tfrac{1}{2}\cos(2x) \cdot (-1)\,\mathrm{d}x = -\tfrac{1}{2}(2 - x)\cos(2x) - \int \tfrac{1}{2}\cos(2x)\,\mathrm{d}x$.`,
      klaar: r`Bereken wat er overblijft: $\int \tfrac{1}{2}\cos(2x)\,\mathrm{d}x = \tfrac{1}{4}\sin(2x)$, dus $F(x) = -\tfrac{1}{2}(2 - x)\cos(2x) - \tfrac{1}{4}\sin(2x) + c$. Controle: differentiëren geeft $\tfrac{1}{2}\cos(2x) + (2 - x)\sin(2x) - \tfrac{1}{2}\cos(2x) = (2 - x)\sin(2x)$.`,
    }),
  },
  {
    cluster: 'k2a_macht_gonio',
    nummer: 'gonio-5',
    level: 3,
    latex: r`Primitiveer: $f(x) = x\sin(x)\cos(x)$`,
    antwoordLatex: r`F(x) = -\tfrac{1}{4}x\cos(2x) + \tfrac{1}{8}\sin(2x) + c`,
    antwoord: '-x cos(2x)/4 + sin(2x)/8 + c',
    alts: ['-1/4 x cos(2x) + 1/8 sin(2x) + c', 'sin(2x)/8 - x cos(2x)/4 + c'],
    integrand: 'x * sin(x) * cos(x)',
    primitieve: '-x * cos(2 * x) / 4 + sin(2 * x) / 8',
    steps: partieel({
      schil: r`Buitenste schil: drie factoren, dus eerst herschrijven. Met de formule $\sin(2x) = 2\sin(x)\cos(x)$ worden de twee gonio's er één, en dan staat er weer een veelterm maal een gonio → partieel integreren.`,
      keuze: r`Herschrijf eerst: $x\sin(x)\cos(x) = \tfrac{1}{2}x\sin(2x)$. Noem daarna $h'(x) = \tfrac{1}{2}\sin(2x)$, dus $h(x) = -\tfrac{1}{4}\cos(2x)$, en $g(x) = x$, dus $g'(x) = 1$.`,
      invullen: r`Dat geeft $\int \tfrac{1}{2}x\sin(2x)\,\mathrm{d}x = -\tfrac{1}{4}x\cos(2x) + \int \tfrac{1}{4}\cos(2x)\,\mathrm{d}x$.`,
      klaar: r`Bereken wat er overblijft: $\int \tfrac{1}{4}\cos(2x)\,\mathrm{d}x = \tfrac{1}{8}\sin(2x)$, dus $F(x) = -\tfrac{1}{4}x\cos(2x) + \tfrac{1}{8}\sin(2x) + c$. Controle: differentiëren geeft $-\tfrac{1}{4}\cos(2x) + \tfrac{1}{2}x\sin(2x) + \tfrac{1}{4}\cos(2x) = \tfrac{1}{2}x\sin(2x) = x\sin(x)\cos(x)$.`,
    }),
  },
  {
    cluster: 'k2a_macht_gonio',
    nummer: 'gonio-6',
    level: 3,
    latex: r`Primitiveer: $f(x) = x\cos^{2}(x)$`,
    antwoordLatex: r`F(x) = \tfrac{1}{4}x^{2} + \tfrac{1}{4}x\sin(2x) + \tfrac{1}{8}\cos(2x) + c`,
    antwoord: 'x^2/4 + x sin(2x)/4 + cos(2x)/8 + c',
    alts: ['1/4 x^2 + 1/4 x sin(2x) + 1/8 cos(2x) + c'],
    integrand: 'x * cos(x)^2',
    primitieve: 'x^2 / 4 + x * sin(2 * x) / 4 + cos(2 * x) / 8',
    steps: partieel({
      schil: r`Buitenste schil: een kwadraat van een cosinus, en daar is geen standaardprimitieve van. Haal het kwadraat eerst weg met $\cos^{2}(x) = \tfrac{1}{2} + \tfrac{1}{2}\cos(2x)$; dan blijft er een veelterm maal een gonio over → partieel integreren.`,
      keuze: r`Herschrijf eerst: $x\cos^{2}(x) = \tfrac{1}{2}x + \tfrac{1}{2}x\cos(2x)$. De eerste term primitiveer je gewoon. Voor de tweede: $h'(x) = \tfrac{1}{2}\cos(2x)$, dus $h(x) = \tfrac{1}{4}\sin(2x)$, en $g(x) = x$, dus $g'(x) = 1$.`,
      invullen: r`Dat geeft $\int \tfrac{1}{2}x\cos(2x)\,\mathrm{d}x = \tfrac{1}{4}x\sin(2x) - \int \tfrac{1}{4}\sin(2x)\,\mathrm{d}x$, en de losse term geeft $\int \tfrac{1}{2}x\,\mathrm{d}x = \tfrac{1}{4}x^{2}$.`,
      klaar: r`Bereken wat er overblijft: $\int \tfrac{1}{4}\sin(2x)\,\mathrm{d}x = -\tfrac{1}{8}\cos(2x)$, dus $F(x) = \tfrac{1}{4}x^{2} + \tfrac{1}{4}x\sin(2x) + \tfrac{1}{8}\cos(2x) + c$. Controle: differentiëren geeft $\tfrac{1}{2}x + \tfrac{1}{4}\sin(2x) + \tfrac{1}{2}x\cos(2x) - \tfrac{1}{4}\sin(2x) = x\left(\tfrac{1}{2} + \tfrac{1}{2}\cos(2x)\right) = x\cos^{2}(x)$.`,
    }),
  },

  // ── Een veelterm maal een e-macht ─────────────────────────────────────────
  {
    cluster: 'k2a_macht_e',
    nummer: 'emacht-1',
    level: 1,
    latex: r`Primitiveer: $f(x) = x\mathrm{e}^{3x}$`,
    antwoordLatex: r`F(x) = \tfrac{1}{3}x\mathrm{e}^{3x} - \tfrac{1}{9}\mathrm{e}^{3x} + c`,
    antwoord: 'x e^(3x)/3 - e^(3x)/9 + c',
    alts: ['1/3 x e^(3x) - 1/9 e^(3x) + c'],
    integrand: 'x * e^(3 * x)',
    primitieve: 'x * e^(3 * x) / 3 - e^(3 * x) / 9',
    steps: partieel({
      schil: SCHIL.emacht,
      keuze: r`Noem de factor die je eerst primitiveert $h'$ en de andere $g$: $h'(x) = \mathrm{e}^{3x}$, dus $h(x) = \tfrac{1}{3}\mathrm{e}^{3x}$, en $g(x) = x$, dus $g'(x) = 1$.`,
      invullen: r`Dat geeft $\int x\mathrm{e}^{3x}\,\mathrm{d}x = \tfrac{1}{3}x\mathrm{e}^{3x} - \int \tfrac{1}{3}\mathrm{e}^{3x}\,\mathrm{d}x$.`,
      klaar: r`Bereken wat er overblijft: $\int \tfrac{1}{3}\mathrm{e}^{3x}\,\mathrm{d}x = \tfrac{1}{9}\mathrm{e}^{3x}$, dus $F(x) = \tfrac{1}{3}x\mathrm{e}^{3x} - \tfrac{1}{9}\mathrm{e}^{3x} + c$. Controle: differentiëren geeft $\tfrac{1}{3}\mathrm{e}^{3x} + x\mathrm{e}^{3x} - \tfrac{1}{3}\mathrm{e}^{3x} = x\mathrm{e}^{3x}$.`,
    }),
  },
  {
    cluster: 'k2a_macht_e',
    nummer: 'emacht-2',
    level: 1,
    latex: r`Primitiveer: $f(x) = x\mathrm{e}^{-x}$`,
    antwoordLatex: r`F(x) = -(x + 1)\mathrm{e}^{-x} + c`,
    antwoord: '-(x + 1)e^(-x) + c',
    alts: ['-x e^(-x) - e^(-x) + c'],
    integrand: 'x * e^(-x)',
    primitieve: '-(x + 1) * e^(-x)',
    steps: partieel({
      schil: SCHIL.emacht,
      keuze: r`Noem de factor die je eerst primitiveert $h'$ en de andere $g$: $h'(x) = \mathrm{e}^{-x}$, dus $h(x) = -\mathrm{e}^{-x}$, en $g(x) = x$, dus $g'(x) = 1$.`,
      invullen: r`Dat geeft $\int x\mathrm{e}^{-x}\,\mathrm{d}x = -x\mathrm{e}^{-x} - \int -\mathrm{e}^{-x}\,\mathrm{d}x = -x\mathrm{e}^{-x} + \int \mathrm{e}^{-x}\,\mathrm{d}x$.`,
      klaar: r`Bereken wat er overblijft: $\int \mathrm{e}^{-x}\,\mathrm{d}x = -\mathrm{e}^{-x}$, dus $F(x) = -x\mathrm{e}^{-x} - \mathrm{e}^{-x} + c = -(x + 1)\mathrm{e}^{-x} + c$. Controle: differentiëren geeft $-\mathrm{e}^{-x} + (x + 1)\mathrm{e}^{-x} = x\mathrm{e}^{-x}$.`,
    }),
  },
  {
    cluster: 'k2a_macht_e',
    nummer: 'emacht-3',
    level: 2,
    latex: r`Primitiveer: $f(x) = (2x + 1)\mathrm{e}^{x}$`,
    antwoordLatex: r`F(x) = (2x - 1)\mathrm{e}^{x} + c`,
    antwoord: '(2x - 1)e^x + c',
    alts: ['2x e^x - e^x + c'],
    integrand: '(2 * x + 1) * e^x',
    primitieve: '(2 * x - 1) * e^x',
    steps: partieel({
      schil: SCHIL.emacht,
      keuze: r`Noem de factor die je eerst primitiveert $h'$ en de andere $g$: $h'(x) = \mathrm{e}^{x}$, dus $h(x) = \mathrm{e}^{x}$, en $g(x) = 2x + 1$, dus $g'(x) = 2$.`,
      invullen: r`Dat geeft $\int (2x + 1)\mathrm{e}^{x}\,\mathrm{d}x = (2x + 1)\mathrm{e}^{x} - \int 2\mathrm{e}^{x}\,\mathrm{d}x$.`,
      klaar: r`Bereken wat er overblijft: $\int 2\mathrm{e}^{x}\,\mathrm{d}x = 2\mathrm{e}^{x}$, dus $F(x) = (2x + 1)\mathrm{e}^{x} - 2\mathrm{e}^{x} = (2x - 1)\mathrm{e}^{x} + c$. Controle: differentiëren geeft $2\mathrm{e}^{x} + (2x - 1)\mathrm{e}^{x} = (2x + 1)\mathrm{e}^{x}$.`,
    }),
  },
  {
    cluster: 'k2a_macht_e',
    nummer: 'emacht-4',
    level: 2,
    latex: r`Primitiveer: $f(x) = (1 - 4x)\mathrm{e}^{2x}$`,
    antwoordLatex: r`F(x) = \left(\tfrac{3}{2} - 2x\right)\mathrm{e}^{2x} + c`,
    antwoord: '(3/2 - 2x)e^(2x) + c',
    alts: ['(1,5 - 2x)e^(2x) + c', '3/2 e^(2x) - 2x e^(2x) + c'],
    integrand: '(1 - 4 * x) * e^(2 * x)',
    primitieve: '(3/2 - 2 * x) * e^(2 * x)',
    steps: partieel({
      schil: SCHIL.emacht,
      keuze: r`Noem de factor die je eerst primitiveert $h'$ en de andere $g$: $h'(x) = \mathrm{e}^{2x}$, dus $h(x) = \tfrac{1}{2}\mathrm{e}^{2x}$, en $g(x) = 1 - 4x$, dus $g'(x) = -4$.`,
      invullen: r`Dat geeft $\int (1 - 4x)\mathrm{e}^{2x}\,\mathrm{d}x = \tfrac{1}{2}(1 - 4x)\mathrm{e}^{2x} - \int \tfrac{1}{2}\mathrm{e}^{2x} \cdot (-4)\,\mathrm{d}x = \tfrac{1}{2}(1 - 4x)\mathrm{e}^{2x} + \int 2\mathrm{e}^{2x}\,\mathrm{d}x$.`,
      klaar: r`Bereken wat er overblijft: $\int 2\mathrm{e}^{2x}\,\mathrm{d}x = \mathrm{e}^{2x}$, dus $F(x) = \left(\tfrac{1}{2} - 2x\right)\mathrm{e}^{2x} + \mathrm{e}^{2x} = \left(\tfrac{3}{2} - 2x\right)\mathrm{e}^{2x} + c$. Controle: differentiëren geeft $-2\mathrm{e}^{2x} + (3 - 4x)\mathrm{e}^{2x} = (1 - 4x)\mathrm{e}^{2x}$.`,
    }),
  },
  {
    cluster: 'k2a_macht_e',
    nummer: 'emacht-5',
    level: 3,
    latex: r`Primitiveer: $f(x) = (x + 3)\mathrm{e}^{1 - x}$`,
    antwoordLatex: r`F(x) = -(x + 4)\mathrm{e}^{1 - x} + c`,
    antwoord: '-(x + 4)e^(1 - x) + c',
    alts: ['-x e^(1 - x) - 4e^(1 - x) + c'],
    integrand: '(x + 3) * e^(1 - x)',
    primitieve: '-(x + 4) * e^(1 - x)',
    steps: partieel({
      schil: SCHIL.emacht,
      keuze: r`Noem de factor die je eerst primitiveert $h'$ en de andere $g$: $h'(x) = \mathrm{e}^{1 - x}$. De kern $1 - x$ heeft afgeleide $-1$, dus $h(x) = -\mathrm{e}^{1 - x}$. Verder $g(x) = x + 3$, dus $g'(x) = 1$.`,
      invullen: r`Dat geeft $\int (x + 3)\mathrm{e}^{1 - x}\,\mathrm{d}x = -(x + 3)\mathrm{e}^{1 - x} - \int -\mathrm{e}^{1 - x}\,\mathrm{d}x = -(x + 3)\mathrm{e}^{1 - x} + \int \mathrm{e}^{1 - x}\,\mathrm{d}x$.`,
      klaar: r`Bereken wat er overblijft: $\int \mathrm{e}^{1 - x}\,\mathrm{d}x = -\mathrm{e}^{1 - x}$, dus $F(x) = -(x + 3)\mathrm{e}^{1 - x} - \mathrm{e}^{1 - x} = -(x + 4)\mathrm{e}^{1 - x} + c$. Controle: differentiëren geeft $-\mathrm{e}^{1 - x} + (x + 4)\mathrm{e}^{1 - x} = (x + 3)\mathrm{e}^{1 - x}$.`,
    }),
  },
  {
    cluster: 'k2a_macht_e',
    nummer: 'emacht-6',
    level: 3,
    latex: r`Primitiveer: $f(x) = \dfrac{x}{\mathrm{e}^{2x}}$`,
    antwoordLatex: r`F(x) = -\tfrac{1}{2}x\mathrm{e}^{-2x} - \tfrac{1}{4}\mathrm{e}^{-2x} + c`,
    antwoord: '-x e^(-2x)/2 - e^(-2x)/4 + c',
    alts: ['-1/2 x e^(-2x) - 1/4 e^(-2x) + c', '-(2x + 1)e^(-2x)/4 + c'],
    integrand: 'x / e^(2 * x)',
    primitieve: '-x * e^(-2 * x) / 2 - e^(-2 * x) / 4',
    steps: partieel({
      schil: r`Buitenste schil: een breuk met een e-macht in de noemer. Er is geen quotiëntregel voor primitiveren, dus schrijf de noemer eerst als een e-macht met een minteken in de exponent. Dan staat er een veelterm maal een e-macht → partieel integreren.`,
      keuze: r`Herschrijf eerst: $\dfrac{x}{\mathrm{e}^{2x}} = x\mathrm{e}^{-2x}$. Noem daarna $h'(x) = \mathrm{e}^{-2x}$, dus $h(x) = -\tfrac{1}{2}\mathrm{e}^{-2x}$, en $g(x) = x$, dus $g'(x) = 1$.`,
      invullen: r`Dat geeft $\int x\mathrm{e}^{-2x}\,\mathrm{d}x = -\tfrac{1}{2}x\mathrm{e}^{-2x} - \int -\tfrac{1}{2}\mathrm{e}^{-2x}\,\mathrm{d}x = -\tfrac{1}{2}x\mathrm{e}^{-2x} + \int \tfrac{1}{2}\mathrm{e}^{-2x}\,\mathrm{d}x$.`,
      klaar: r`Bereken wat er overblijft: $\int \tfrac{1}{2}\mathrm{e}^{-2x}\,\mathrm{d}x = -\tfrac{1}{4}\mathrm{e}^{-2x}$, dus $F(x) = -\tfrac{1}{2}x\mathrm{e}^{-2x} - \tfrac{1}{4}\mathrm{e}^{-2x} + c$. Controle: differentiëren geeft $-\tfrac{1}{2}\mathrm{e}^{-2x} + x\mathrm{e}^{-2x} + \tfrac{1}{2}\mathrm{e}^{-2x} = x\mathrm{e}^{-2x}$.`,
    }),
  },

  // ── Primitiveren met een logaritme ────────────────────────────────────────
  {
    cluster: 'k2a_ln',
    nummer: 'ln-1',
    level: 1,
    latex: r`Primitiveer: $f(x) = 6x^{2}\ln(x)$`,
    antwoordLatex: r`F(x) = 2x^{3}\ln(x) - \tfrac{2}{3}x^{3} + c`,
    antwoord: '2x^3 ln(x) - 2/3 x^3 + c',
    alts: ['2x^3 ln(x) - 2x^3/3 + c'],
    integrand: '6 * x^2 * ln(x)',
    primitieve: '2 * x^3 * ln(x) - 2 * x^3 / 3',
    domein: [0.2, 4],
    steps: partieel({
      schil: SCHIL.ln,
      keuze: r`Noem de factor die je eerst primitiveert $h'$ en de andere $g$: $h'(x) = 6x^{2}$, dus $h(x) = 2x^{3}$, en $g(x) = \ln(x)$, dus $g'(x) = \dfrac{1}{x}$.`,
      invullen: r`Dat geeft $\int 6x^{2}\ln(x)\,\mathrm{d}x = 2x^{3}\ln(x) - \int 2x^{3} \cdot \dfrac{1}{x}\,\mathrm{d}x = 2x^{3}\ln(x) - \int 2x^{2}\,\mathrm{d}x$. De $\ln$ is verdwenen — dat is precies de bedoeling.`,
      klaar: r`Bereken wat er overblijft: $\int 2x^{2}\,\mathrm{d}x = \tfrac{2}{3}x^{3}$, dus $F(x) = 2x^{3}\ln(x) - \tfrac{2}{3}x^{3} + c$. Controle: differentiëren geeft $6x^{2}\ln(x) + 2x^{2} - 2x^{2} = 6x^{2}\ln(x)$.`,
    }),
  },
  {
    cluster: 'k2a_ln',
    nummer: 'ln-2',
    level: 1,
    latex: r`Primitiveer: $f(x) = \ln(2x)$`,
    antwoordLatex: r`F(x) = x\ln(2x) - x + c`,
    antwoord: 'x ln(2x) - x + c',
    alts: ['x(ln(2x) - 1) + c'],
    integrand: 'ln(2 * x)',
    primitieve: 'x * ln(2 * x) - x',
    domein: [0.2, 4],
    steps: partieel({
      schil: r`Buitenste schil: een kale logaritme, en daar ken je geen standaardprimitieve van. Zie het als een product met $1$: $\ln(2x) = 1 \cdot \ln(2x)$ → partieel integreren, met die $1$ als de factor die je primitiveert.`,
      keuze: r`Noem $h'(x) = 1$, dus $h(x) = x$, en $g(x) = \ln(2x)$. De kern $2x$ heeft afgeleide $2$, dus $g'(x) = \dfrac{2}{2x} = \dfrac{1}{x}$.`,
      invullen: r`Dat geeft $\int 1 \cdot \ln(2x)\,\mathrm{d}x = x\ln(2x) - \int x \cdot \dfrac{1}{x}\,\mathrm{d}x = x\ln(2x) - \int 1\,\mathrm{d}x$.`,
      klaar: r`Bereken wat er overblijft: $\int 1\,\mathrm{d}x = x$, dus $F(x) = x\ln(2x) - x + c$. Controle: differentiëren geeft $\ln(2x) + x \cdot \dfrac{1}{x} - 1 = \ln(2x)$.`,
    }),
  },
  {
    cluster: 'k2a_ln',
    nummer: 'ln-3',
    level: 2,
    latex: r`Primitiveer: $f(x) = \dfrac{\ln(x)}{x^{3}}$`,
    antwoordLatex: r`F(x) = -\dfrac{\ln(x)}{2x^{2}} - \dfrac{1}{4x^{2}} + c`,
    antwoord: '-ln(x)/(2x^2) - 1/(4x^2) + c',
    alts: ['-1/2 x^-2 ln(x) - 1/4 x^-2 + c', '-(2ln(x) + 1)/(4x^2) + c'],
    integrand: 'ln(x) / x^3',
    primitieve: '-ln(x) / (2 * x^2) - 1 / (4 * x^2)',
    domein: [0.3, 4],
    steps: partieel({
      schil: SCHIL.ln,
      keuze: r`Schrijf de breuk eerst als een macht: $\dfrac{\ln(x)}{x^{3}} = \ln(x) \cdot x^{-3}$. Noem dan $h'(x) = x^{-3}$, dus $h(x) = -\tfrac{1}{2}x^{-2}$, en $g(x) = \ln(x)$, dus $g'(x) = \dfrac{1}{x}$.`,
      invullen: r`Dat geeft $\int \ln(x) \cdot x^{-3}\,\mathrm{d}x = -\tfrac{1}{2}x^{-2}\ln(x) - \int -\tfrac{1}{2}x^{-2} \cdot \dfrac{1}{x}\,\mathrm{d}x = -\tfrac{1}{2}x^{-2}\ln(x) + \int \tfrac{1}{2}x^{-3}\,\mathrm{d}x$.`,
      klaar: r`Bereken wat er overblijft: $\int \tfrac{1}{2}x^{-3}\,\mathrm{d}x = -\tfrac{1}{4}x^{-2}$, dus $F(x) = -\dfrac{\ln(x)}{2x^{2}} - \dfrac{1}{4x^{2}} + c$. Controle: differentiëren geeft $\dfrac{\ln(x)}{x^{3}} - \dfrac{1}{2x^{3}} + \dfrac{1}{2x^{3}} = \dfrac{\ln(x)}{x^{3}}$.`,
    }),
  },
  {
    cluster: 'k2a_ln',
    nummer: 'ln-4',
    level: 2,
    latex: r`Primitiveer: $f(x) = \sqrt{x}\,\ln(x)$`,
    antwoordLatex: r`F(x) = \tfrac{2}{3}x\sqrt{x}\,\ln(x) - \tfrac{4}{9}x\sqrt{x} + c`,
    antwoord: '2/3 x sqrt(x) ln(x) - 4/9 x sqrt(x) + c',
    alts: ['2x sqrt(x) ln(x)/3 - 4x sqrt(x)/9 + c'],
    integrand: 'sqrt(x) * ln(x)',
    primitieve: '2 * x * sqrt(x) * ln(x) / 3 - 4 * x * sqrt(x) / 9',
    domein: [0.2, 4],
    steps: partieel({
      schil: SCHIL.ln,
      keuze: r`Schrijf de wortel eerst als macht: $\sqrt{x} = x^{\frac{1}{2}}$. Noem dan $h'(x) = x^{\frac{1}{2}}$, dus $h(x) = \tfrac{2}{3}x^{\frac{3}{2}}$, en $g(x) = \ln(x)$, dus $g'(x) = \dfrac{1}{x}$.`,
      invullen: r`Dat geeft $\int x^{\frac{1}{2}}\ln(x)\,\mathrm{d}x = \tfrac{2}{3}x^{\frac{3}{2}}\ln(x) - \int \tfrac{2}{3}x^{\frac{3}{2}} \cdot \dfrac{1}{x}\,\mathrm{d}x = \tfrac{2}{3}x^{\frac{3}{2}}\ln(x) - \int \tfrac{2}{3}x^{\frac{1}{2}}\,\mathrm{d}x$.`,
      klaar: r`Bereken wat er overblijft: $\int \tfrac{2}{3}x^{\frac{1}{2}}\,\mathrm{d}x = \tfrac{4}{9}x^{\frac{3}{2}}$, dus $F(x) = \tfrac{2}{3}x\sqrt{x}\,\ln(x) - \tfrac{4}{9}x\sqrt{x} + c$. Controle: differentiëren geeft $\sqrt{x}\,\ln(x) + \tfrac{2}{3}\sqrt{x} - \tfrac{2}{3}\sqrt{x} = \sqrt{x}\,\ln(x)$.`,
    }),
  },
  {
    cluster: 'k2a_ln',
    nummer: 'ln-5',
    level: 3,
    latex: r`Primitiveer: $f(x) = \ln(x + 1)$`,
    antwoordLatex: r`F(x) = (x + 1)\ln(x + 1) - x + c`,
    antwoord: '(x + 1)ln(x + 1) - x + c',
    alts: ['(x + 1)ln(x + 1) - x - 1 + c', 'x ln(x + 1) + ln(x + 1) - x + c'],
    integrand: 'ln(x + 1)',
    primitieve: '(x + 1) * ln(x + 1) - x',
    domein: [0, 3],
    steps: partieel({
      schil: r`Buitenste schil: weer een kale logaritme, dus $\ln(x + 1) = 1 \cdot \ln(x + 1)$ → partieel integreren. De slimmigheid zit in $h$: een primitieve van $1$ is $x$, maar $x + 1$ mag óók, want die scheelt alleen een constante.`,
      keuze: r`Noem $h'(x) = 1$ en kies $h(x) = x + 1$ in plaats van $x$; dat maakt de overgebleven integraal veel eenvoudiger. Verder $g(x) = \ln(x + 1)$, dus $g'(x) = \dfrac{1}{x + 1}$.`,
      invullen: r`Dat geeft $\int \ln(x + 1)\,\mathrm{d}x = (x + 1)\ln(x + 1) - \int (x + 1) \cdot \dfrac{1}{x + 1}\,\mathrm{d}x = (x + 1)\ln(x + 1) - \int 1\,\mathrm{d}x$.`,
      klaar: r`Bereken wat er overblijft: $\int 1\,\mathrm{d}x = x$, dus $F(x) = (x + 1)\ln(x + 1) - x + c$. Controle: differentiëren geeft $\ln(x + 1) + (x + 1) \cdot \dfrac{1}{x + 1} - 1 = \ln(x + 1)$.`,
    }),
  },
  {
    cluster: 'k2a_ln',
    nummer: 'ln-6',
    level: 3,
    latex: r`Primitiveer: $f(x) = x^{2}\ln\left(x^{3}\right)$`,
    antwoordLatex: r`F(x) = x^{3}\ln(x) - \tfrac{1}{3}x^{3} + c`,
    antwoord: 'x^3 ln(x) - x^3/3 + c',
    alts: ['x^3 ln(x) - 1/3 x^3 + c'],
    integrand: 'x^2 * ln(x^3)',
    primitieve: 'x^3 * ln(x) - x^3 / 3',
    domein: [0.2, 3],
    steps: partieel({
      schil: r`Buitenste schil: een macht van $x$ maal een logaritme, maar met een macht ín de logaritme. Haal die er eerst uit met de rekenregel $\ln\left(x^{3}\right) = 3\ln(x)$; daarna is het gewoon partieel integreren.`,
      keuze: r`Herschrijf eerst: $x^{2}\ln\left(x^{3}\right) = 3x^{2}\ln(x)$. Noem daarna $h'(x) = 3x^{2}$, dus $h(x) = x^{3}$, en $g(x) = \ln(x)$, dus $g'(x) = \dfrac{1}{x}$.`,
      invullen: r`Dat geeft $\int 3x^{2}\ln(x)\,\mathrm{d}x = x^{3}\ln(x) - \int x^{3} \cdot \dfrac{1}{x}\,\mathrm{d}x = x^{3}\ln(x) - \int x^{2}\,\mathrm{d}x$.`,
      klaar: r`Bereken wat er overblijft: $\int x^{2}\,\mathrm{d}x = \tfrac{1}{3}x^{3}$, dus $F(x) = x^{3}\ln(x) - \tfrac{1}{3}x^{3} + c$. Controle: differentiëren geeft $3x^{2}\ln(x) + x^{2} - x^{2} = 3x^{2}\ln(x) = x^{2}\ln\left(x^{3}\right)$.`,
    }),
  },

  // ── Bepaalde integralen met gonio ─────────────────────────────────────────
  {
    cluster: 'k2a_bepaald_gonio',
    nummer: 'bep-gonio-1',
    level: 1,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{\pi} x\cos(x)\,\mathrm{d}x$`,
    antwoordLatex: r`-2`,
    antwoord: '-2',
    integrand: 'x * cos(x)',
    primitieve: 'x * sin(x) + cos(x)',
    grenzen: [0, PI],
    waarde: -2,
    steps: bepaald({
      schil: SCHIL.gonio,
      keuze: r`Noem $h'(x) = \cos(x)$, dus $h(x) = \sin(x)$, en $g(x) = x$, dus $g'(x) = 1$.`,
      primitiveren: r`Dat geeft $\int x\cos(x)\,\mathrm{d}x = x\sin(x) - \int \sin(x)\,\mathrm{d}x = x\sin(x) + \cos(x)$, dus een primitieve is $F(x) = x\sin(x) + \cos(x)$.`,
      invullen: r`Vul de grenzen in: $\left[x\sin(x) + \cos(x)\right]_{0}^{\pi} = \left(\pi \cdot 0 + (-1)\right) - \left(0 + 1\right) = -2$. Dat de uitkomst negatief is klopt: op $\left\langle \tfrac{1}{2}\pi, \pi \right]$ ligt de grafiek onder de $x$-as.`,
    }),
  },
  {
    cluster: 'k2a_bepaald_gonio',
    nummer: 'bep-gonio-2',
    level: 1,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{\frac{1}{2}\pi} 2x\cos(x)\,\mathrm{d}x$`,
    antwoordLatex: r`\pi - 2`,
    antwoord: 'pi - 2',
    alts: ['-2 + pi'],
    integrand: '2 * x * cos(x)',
    primitieve: '2 * x * sin(x) + 2 * cos(x)',
    grenzen: [0, PI / 2],
    waarde: 'pi - 2',
    steps: bepaald({
      schil: SCHIL.gonio,
      keuze: r`Noem $h'(x) = \cos(x)$, dus $h(x) = \sin(x)$, en $g(x) = 2x$, dus $g'(x) = 2$.`,
      primitiveren: r`Dat geeft $\int 2x\cos(x)\,\mathrm{d}x = 2x\sin(x) - \int 2\sin(x)\,\mathrm{d}x = 2x\sin(x) + 2\cos(x)$, dus een primitieve is $F(x) = 2x\sin(x) + 2\cos(x)$.`,
      invullen: r`Vul de grenzen in: $\left[2x\sin(x) + 2\cos(x)\right]_{0}^{\frac{1}{2}\pi} = \left(\pi \cdot 1 + 0\right) - \left(0 + 2\right) = \pi - 2$. Exact laten staan, dus niet afronden.`,
    }),
  },
  {
    cluster: 'k2a_bepaald_gonio',
    nummer: 'bep-gonio-3',
    level: 2,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{\frac{1}{2}\pi} (2x - 1)\cos(x)\,\mathrm{d}x$`,
    antwoordLatex: r`\pi - 3`,
    antwoord: 'pi - 3',
    alts: ['-3 + pi'],
    integrand: '(2 * x - 1) * cos(x)',
    primitieve: '(2 * x - 1) * sin(x) + 2 * cos(x)',
    grenzen: [0, PI / 2],
    waarde: 'pi - 3',
    steps: bepaald({
      schil: SCHIL.gonio,
      keuze: r`Noem $h'(x) = \cos(x)$, dus $h(x) = \sin(x)$, en $g(x) = 2x - 1$, dus $g'(x) = 2$. De hele haakjesterm gaat in één keer mee als $g$.`,
      primitiveren: r`Dat geeft $\int (2x - 1)\cos(x)\,\mathrm{d}x = (2x - 1)\sin(x) - \int 2\sin(x)\,\mathrm{d}x = (2x - 1)\sin(x) + 2\cos(x)$, dus een primitieve is $F(x) = (2x - 1)\sin(x) + 2\cos(x)$.`,
      invullen: r`Vul de grenzen in: $\left[(2x - 1)\sin(x) + 2\cos(x)\right]_{0}^{\frac{1}{2}\pi} = \left((\pi - 1) \cdot 1 + 0\right) - \left(-1 \cdot 0 + 2\right) = \pi - 3$.`,
    }),
  },
  {
    cluster: 'k2a_bepaald_gonio',
    nummer: 'bep-gonio-4',
    level: 2,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{\frac{1}{2}\pi} x\sin(2x)\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{4}\pi`,
    antwoord: 'pi/4',
    alts: ['1/4 pi', '0,25pi'],
    integrand: 'x * sin(2 * x)',
    primitieve: '-x * cos(2 * x) / 2 + sin(2 * x) / 4',
    grenzen: [0, PI / 2],
    waarde: 'pi / 4',
    steps: bepaald({
      schil: SCHIL.gonio,
      keuze: r`Noem $h'(x) = \sin(2x)$. De kern $2x$ heeft afgeleide $2$, dus $h(x) = -\tfrac{1}{2}\cos(2x)$. Verder $g(x) = x$, dus $g'(x) = 1$.`,
      primitiveren: r`Dat geeft $\int x\sin(2x)\,\mathrm{d}x = -\tfrac{1}{2}x\cos(2x) + \int \tfrac{1}{2}\cos(2x)\,\mathrm{d}x = -\tfrac{1}{2}x\cos(2x) + \tfrac{1}{4}\sin(2x)$, dus een primitieve is $F(x) = -\tfrac{1}{2}x\cos(2x) + \tfrac{1}{4}\sin(2x)$.`,
      invullen: r`Vul de grenzen in; let op dat de hoek $2x$ is, dus bij $x = \tfrac{1}{2}\pi$ hoort $\cos(\pi) = -1$ en $\sin(\pi) = 0$: $\left[-\tfrac{1}{2}x\cos(2x) + \tfrac{1}{4}\sin(2x)\right]_{0}^{\frac{1}{2}\pi} = \tfrac{1}{4}\pi - 0 = \tfrac{1}{4}\pi$.`,
    }),
  },
  {
    cluster: 'k2a_bepaald_gonio',
    nummer: 'bep-gonio-5',
    level: 3,
    latex: r`Bereken exact: $\displaystyle\int_{\frac{1}{6}\pi}^{\frac{1}{2}\pi} x\cos(x)\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{5}{12}\pi - \tfrac{1}{2}\sqrt{3}`,
    antwoord: '5/12 pi - 1/2 sqrt(3)',
    alts: ['5pi/12 - sqrt(3)/2', '-1/2 sqrt(3) + 5/12 pi'],
    integrand: 'x * cos(x)',
    primitieve: 'x * sin(x) + cos(x)',
    grenzen: [PI / 6, PI / 2],
    waarde: '5 * pi / 12 - sqrt(3) / 2',
    steps: bepaald({
      schil: SCHIL.gonio,
      keuze: r`Noem $h'(x) = \cos(x)$, dus $h(x) = \sin(x)$, en $g(x) = x$, dus $g'(x) = 1$.`,
      primitiveren: r`Dat geeft $\int x\cos(x)\,\mathrm{d}x = x\sin(x) - \int \sin(x)\,\mathrm{d}x = x\sin(x) + \cos(x)$, dus een primitieve is $F(x) = x\sin(x) + \cos(x)$.`,
      invullen: r`Vul de grenzen in met de exacte waarden $\sin\left(\tfrac{1}{6}\pi\right) = \tfrac{1}{2}$ en $\cos\left(\tfrac{1}{6}\pi\right) = \tfrac{1}{2}\sqrt{3}$: $\left[x\sin(x) + \cos(x)\right]_{\frac{1}{6}\pi}^{\frac{1}{2}\pi} = \left(\tfrac{1}{2}\pi + 0\right) - \left(\tfrac{1}{12}\pi + \tfrac{1}{2}\sqrt{3}\right) = \tfrac{5}{12}\pi - \tfrac{1}{2}\sqrt{3}$.`,
    }),
  },
  {
    cluster: 'k2a_bepaald_gonio',
    nummer: 'bep-gonio-6',
    level: 3,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{\frac{1}{4}\pi} \dfrac{x}{\cos^{2}(x)}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{4}\pi - \tfrac{1}{2}\ln(2)`,
    antwoord: 'pi/4 - ln(2)/2',
    alts: ['1/4 pi - 1/2 ln(2)', '-1/2 ln(2) + 1/4 pi'],
    integrand: 'x / cos(x)^2',
    primitieve: 'x * tan(x) + ln(cos(x))',
    domein: [-1.4, 1.4],
    grenzen: [0, PI / 4],
    waarde: 'pi / 4 - ln(2) / 2',
    steps: bepaald({
      schil: r`Buitenste schil: een veelterm maal $\dfrac{1}{\cos^{2}(x)}$ → partieel integreren. Je moet hier wel weten dat $\dfrac{1}{\cos^{2}(x)}$ de afgeleide van $\tan(x)$ is, dus dat die factor zich makkelijk laat primitiveren.`,
      keuze: r`Noem $h'(x) = \dfrac{1}{\cos^{2}(x)}$, dus $h(x) = \tan(x)$, en $g(x) = x$, dus $g'(x) = 1$.`,
      primitiveren: r`Dat geeft $\int \dfrac{x}{\cos^{2}(x)}\,\mathrm{d}x = x\tan(x) - \int \tan(x)\,\mathrm{d}x$. Die laatste integraal ken je uit K.1 B: met de kern $g(x) = \cos(x)$ is $\int \tan(x)\,\mathrm{d}x = -\ln|\cos(x)|$. Dus een primitieve is $F(x) = x\tan(x) + \ln|\cos(x)|$.`,
      invullen: r`Op $\left[0, \tfrac{1}{4}\pi\right]$ is $\cos(x)$ positief, dus de strepen mogen weg. Vul in: $\left[x\tan(x) + \ln(\cos(x))\right]_{0}^{\frac{1}{4}\pi} = \left(\tfrac{1}{4}\pi \cdot 1 + \ln\left(\tfrac{1}{2}\sqrt{2}\right)\right) - \left(0 + \ln(1)\right) = \tfrac{1}{4}\pi - \tfrac{1}{2}\ln(2)$.`,
    }),
  },

  // ── Bepaalde integralen met e-machten en logaritmen ───────────────────────
  {
    cluster: 'k2a_bepaald_e_ln',
    nummer: 'bep-eln-1',
    level: 1,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{1} x\mathrm{e}^{x}\,\mathrm{d}x$`,
    antwoordLatex: r`1`,
    antwoord: '1',
    integrand: 'x * e^x',
    primitieve: 'x * e^x - e^x',
    grenzen: [0, 1],
    waarde: 1,
    steps: bepaald({
      schil: SCHIL.emacht,
      keuze: r`Noem $h'(x) = \mathrm{e}^{x}$, dus $h(x) = \mathrm{e}^{x}$, en $g(x) = x$, dus $g'(x) = 1$.`,
      primitiveren: r`Dat geeft $\int x\mathrm{e}^{x}\,\mathrm{d}x = x\mathrm{e}^{x} - \int \mathrm{e}^{x}\,\mathrm{d}x = x\mathrm{e}^{x} - \mathrm{e}^{x}$, dus een primitieve is $F(x) = (x - 1)\mathrm{e}^{x}$.`,
      invullen: r`Vul de grenzen in: $\left[(x - 1)\mathrm{e}^{x}\right]_{0}^{1} = 0 \cdot \mathrm{e} - (-1) \cdot 1 = 1$.`,
    }),
  },
  {
    cluster: 'k2a_bepaald_e_ln',
    nummer: 'bep-eln-2',
    level: 1,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{1} 3x\mathrm{e}^{-x}\,\mathrm{d}x$`,
    antwoordLatex: r`3 - \dfrac{6}{\mathrm{e}}`,
    antwoord: '3 - 6/e',
    alts: ['3 - 6e^(-1)', '-6/e + 3'],
    integrand: '3 * x * e^(-x)',
    primitieve: '-3 * (x + 1) * e^(-x)',
    grenzen: [0, 1],
    waarde: '3 - 6 / e',
    steps: bepaald({
      schil: SCHIL.emacht,
      keuze: r`Noem $h'(x) = \mathrm{e}^{-x}$, dus $h(x) = -\mathrm{e}^{-x}$, en $g(x) = 3x$, dus $g'(x) = 3$.`,
      primitiveren: r`Dat geeft $\int 3x\mathrm{e}^{-x}\,\mathrm{d}x = -3x\mathrm{e}^{-x} + \int 3\mathrm{e}^{-x}\,\mathrm{d}x = -3x\mathrm{e}^{-x} - 3\mathrm{e}^{-x}$, dus een primitieve is $F(x) = -3(x + 1)\mathrm{e}^{-x}$.`,
      invullen: r`Vul de grenzen in: $\left[-3(x + 1)\mathrm{e}^{-x}\right]_{0}^{1} = -6\mathrm{e}^{-1} - (-3) = 3 - \dfrac{6}{\mathrm{e}}$. Exact laten staan.`,
    }),
  },
  {
    cluster: 'k2a_bepaald_e_ln',
    nummer: 'bep-eln-3',
    level: 2,
    latex: r`Bereken exact: $\displaystyle\int_{1}^{\mathrm{e}} \ln(x)\,\mathrm{d}x$`,
    antwoordLatex: r`1`,
    antwoord: '1',
    integrand: 'ln(x)',
    primitieve: 'x * ln(x) - x',
    domein: [0.2, 4],
    grenzen: [1, E],
    waarde: 1,
    steps: bepaald({
      schil: r`Buitenste schil: een kale logaritme. Zie het als $1 \cdot \ln(x)$ → partieel integreren, met de $1$ als de factor die je primitiveert.`,
      keuze: r`Noem $h'(x) = 1$, dus $h(x) = x$, en $g(x) = \ln(x)$, dus $g'(x) = \dfrac{1}{x}$.`,
      primitiveren: r`Dat geeft $\int \ln(x)\,\mathrm{d}x = x\ln(x) - \int x \cdot \dfrac{1}{x}\,\mathrm{d}x = x\ln(x) - x$, dus een primitieve is $F(x) = x\ln(x) - x$.`,
      invullen: r`Vul de grenzen in, met $\ln(\mathrm{e}) = 1$ en $\ln(1) = 0$: $\left[x\ln(x) - x\right]_{1}^{\mathrm{e}} = (\mathrm{e} - \mathrm{e}) - (0 - 1) = 1$.`,
    }),
  },
  {
    cluster: 'k2a_bepaald_e_ln',
    nummer: 'bep-eln-4',
    level: 2,
    latex: r`Bereken exact: $\displaystyle\int_{1}^{\mathrm{e}} 4x\ln(x)\,\mathrm{d}x$`,
    antwoordLatex: r`\mathrm{e}^{2} + 1`,
    antwoord: 'e^2 + 1',
    alts: ['1 + e^2'],
    integrand: '4 * x * ln(x)',
    primitieve: '2 * x^2 * ln(x) - x^2',
    domein: [0.2, 4],
    grenzen: [1, E],
    waarde: 'e^2 + 1',
    steps: bepaald({
      schil: SCHIL.ln,
      keuze: r`Noem $h'(x) = 4x$, dus $h(x) = 2x^{2}$, en $g(x) = \ln(x)$, dus $g'(x) = \dfrac{1}{x}$.`,
      primitiveren: r`Dat geeft $\int 4x\ln(x)\,\mathrm{d}x = 2x^{2}\ln(x) - \int 2x^{2} \cdot \dfrac{1}{x}\,\mathrm{d}x = 2x^{2}\ln(x) - \int 2x\,\mathrm{d}x = 2x^{2}\ln(x) - x^{2}$, dus een primitieve is $F(x) = 2x^{2}\ln(x) - x^{2}$.`,
      invullen: r`Vul de grenzen in: $\left[2x^{2}\ln(x) - x^{2}\right]_{1}^{\mathrm{e}} = \left(2\mathrm{e}^{2} - \mathrm{e}^{2}\right) - (0 - 1) = \mathrm{e}^{2} + 1$.`,
    }),
  },
  {
    cluster: 'k2a_bepaald_e_ln',
    nummer: 'bep-eln-5',
    level: 3,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{2} x\mathrm{e}^{\frac{1}{2}x}\,\mathrm{d}x$`,
    antwoordLatex: r`4`,
    antwoord: '4',
    integrand: 'x * e^(x / 2)',
    primitieve: '2 * x * e^(x / 2) - 4 * e^(x / 2)',
    grenzen: [0, 2],
    waarde: 4,
    steps: bepaald({
      schil: SCHIL.emacht,
      keuze: r`Noem $h'(x) = \mathrm{e}^{\frac{1}{2}x}$. De kern $\tfrac{1}{2}x$ heeft afgeleide $\tfrac{1}{2}$, dus $h(x) = 2\mathrm{e}^{\frac{1}{2}x}$. Verder $g(x) = x$, dus $g'(x) = 1$.`,
      primitiveren: r`Dat geeft $\int x\mathrm{e}^{\frac{1}{2}x}\,\mathrm{d}x = 2x\mathrm{e}^{\frac{1}{2}x} - \int 2\mathrm{e}^{\frac{1}{2}x}\,\mathrm{d}x = 2x\mathrm{e}^{\frac{1}{2}x} - 4\mathrm{e}^{\frac{1}{2}x}$, dus een primitieve is $F(x) = (2x - 4)\mathrm{e}^{\frac{1}{2}x}$.`,
      invullen: r`Vul de grenzen in: $\left[(2x - 4)\mathrm{e}^{\frac{1}{2}x}\right]_{0}^{2} = 0 \cdot \mathrm{e} - (-4) \cdot 1 = 4$. De e-machten vallen hier helemaal weg.`,
    }),
  },
  {
    cluster: 'k2a_bepaald_e_ln',
    nummer: 'bep-eln-6',
    level: 3,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{1} (2x + 1)\mathrm{e}^{2x}\,\mathrm{d}x$`,
    antwoordLatex: r`\mathrm{e}^{2}`,
    antwoord: 'e^2',
    integrand: '(2 * x + 1) * e^(2 * x)',
    primitieve: 'x * e^(2 * x)',
    grenzen: [0, 1],
    waarde: 'e^2',
    steps: bepaald({
      schil: SCHIL.emacht,
      keuze: r`Noem $h'(x) = \mathrm{e}^{2x}$, dus $h(x) = \tfrac{1}{2}\mathrm{e}^{2x}$, en $g(x) = 2x + 1$, dus $g'(x) = 2$.`,
      primitiveren: r`Dat geeft $\int (2x + 1)\mathrm{e}^{2x}\,\mathrm{d}x = \tfrac{1}{2}(2x + 1)\mathrm{e}^{2x} - \int \mathrm{e}^{2x}\,\mathrm{d}x = \left(x + \tfrac{1}{2}\right)\mathrm{e}^{2x} - \tfrac{1}{2}\mathrm{e}^{2x} = x\mathrm{e}^{2x}$. Een primitieve is dus gewoon $F(x) = x\mathrm{e}^{2x}$ — netter dan je zou verwachten, omdat de integrand precies de afgeleide daarvan is.`,
      invullen: r`Vul de grenzen in: $\left[x\mathrm{e}^{2x}\right]_{0}^{1} = 1 \cdot \mathrm{e}^{2} - 0 = \mathrm{e}^{2}$.`,
    }),
  },

  // ── Oppervlakte en p bepalen ──────────────────────────────────────────────
  {
    cluster: 'k2a_opp',
    nummer: 'opp-1',
    level: 1,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = x\mathrm{e}^{x}$, de $x$-as en de lijn $x = 2$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\mathrm{e}^{2} + 1`,
    antwoord: 'e^2 + 1',
    alts: ['1 + e^2'],
    integrand: 'x * e^x',
    primitieve: '(x - 1) * e^x',
    grenzen: [0, 2],
    waarde: 'e^2 + 1',
    steps: toepassing({
      deel1: r`Deel 1 van de driedeling: vertaal het verhaaltje naar een integraal. De grafiek snijdt de $x$-as waar $x\mathrm{e}^{x} = 0$; omdat $\mathrm{e}^{x}$ nooit nul is, is dat alleen bij $x = 0$. Tussen $0$ en $2$ ligt de grafiek boven de $x$-as, dus de oppervlakte is $\displaystyle\int_{0}^{2} x\mathrm{e}^{x}\,\mathrm{d}x$.`,
      keuze: r`Deel 2: een veelterm maal een e-macht → partieel integreren. Noem $h'(x) = \mathrm{e}^{x}$, dus $h(x) = \mathrm{e}^{x}$, en $g(x) = x$, dus $g'(x) = 1$.`,
      primitiveren: r`Vul de regel in: ${REGEL}, dus $\int x\mathrm{e}^{x}\,\mathrm{d}x = x\mathrm{e}^{x} - \int \mathrm{e}^{x}\,\mathrm{d}x = (x - 1)\mathrm{e}^{x}$.`,
      afronden: r`Vul de grenzen in: $\left[(x - 1)\mathrm{e}^{x}\right]_{0}^{2} = \mathrm{e}^{2} - (-1) = \mathrm{e}^{2} + 1$. De oppervlakte is $\mathrm{e}^{2} + 1$; exact laten staan.`,
    }),
  },
  {
    cluster: 'k2a_opp',
    nummer: 'opp-2',
    level: 1,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = x\sin(x)$ en de $x$-as, tussen de twee opeenvolgende nulpunten $x = 0$ en $x = \pi$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\pi`,
    antwoord: 'pi',
    integrand: 'x * sin(x)',
    primitieve: 'sin(x) - x * cos(x)',
    grenzen: [0, PI],
    waarde: 'pi',
    steps: toepassing({
      deel1: r`Deel 1 van de driedeling: op $\left[0, \pi\right]$ zijn $x$ en $\sin(x)$ allebei niet-negatief, dus ligt de grafiek boven de $x$-as. De oppervlakte is $\displaystyle\int_{0}^{\pi} x\sin(x)\,\mathrm{d}x$.`,
      keuze: r`Deel 2: een veelterm maal een gonio → partieel integreren. Noem $h'(x) = \sin(x)$, dus $h(x) = -\cos(x)$, en $g(x) = x$, dus $g'(x) = 1$.`,
      primitiveren: r`Vul de regel in: ${REGEL}, dus $\int x\sin(x)\,\mathrm{d}x = -x\cos(x) + \int \cos(x)\,\mathrm{d}x = -x\cos(x) + \sin(x)$.`,
      afronden: r`Vul de grenzen in: $\left[\sin(x) - x\cos(x)\right]_{0}^{\pi} = \left(0 - \pi \cdot (-1)\right) - (0 - 0) = \pi$. De oppervlakte is $\pi$.`,
    }),
  },
  {
    cluster: 'k2a_opp',
    nummer: 'opp-3',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \ln(x)$, de $x$-as en de lijn $x = 4$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`8\ln(2) - 3`,
    antwoord: '8ln(2) - 3',
    alts: ['4ln(4) - 3', '-3 + 8ln(2)'],
    integrand: 'ln(x)',
    primitieve: 'x * ln(x) - x',
    domein: [0.2, 5],
    grenzen: [1, 4],
    waarde: '8 * ln(2) - 3',
    steps: toepassing({
      deel1: r`Deel 1 van de driedeling: de grafiek van $\ln$ snijdt de $x$-as bij $x = 1$ en ligt daarna erboven. De oppervlakte is dus $\displaystyle\int_{1}^{4} \ln(x)\,\mathrm{d}x$ — de linkergrens haal je uit het nulpunt, niet uit de opgave.`,
      keuze: r`Deel 2: een kale logaritme, dus schrijf $\ln(x) = 1 \cdot \ln(x)$ → partieel integreren. Noem $h'(x) = 1$, dus $h(x) = x$, en $g(x) = \ln(x)$, dus $g'(x) = \dfrac{1}{x}$.`,
      primitiveren: r`Vul de regel in: ${REGEL}, dus $\int \ln(x)\,\mathrm{d}x = x\ln(x) - \int 1\,\mathrm{d}x = x\ln(x) - x$.`,
      afronden: r`Vul de grenzen in: $\left[x\ln(x) - x\right]_{1}^{4} = \left(4\ln(4) - 4\right) - (0 - 1) = 4\ln(4) - 3$. Met $\ln(4) = 2\ln(2)$ is dat $8\ln(2) - 3$.`,
    }),
  },
  {
    cluster: 'k2a_opp',
    nummer: 'opp-4',
    level: 2,
    latex: r`De grafiek van $f(x) = x\cos(x)$ snijdt de $x$-as bij $x = 0$ en bij $x = \tfrac{1}{2}\pi$. Bereken exact de oppervlakte van het vlakdeel $V$ tussen de grafiek en de $x$-as op $\left[0, \tfrac{1}{2}\pi\right]$.`,
    antwoordLatex: r`\tfrac{1}{2}\pi - 1`,
    antwoord: 'pi/2 - 1',
    alts: ['1/2 pi - 1', '-1 + pi/2'],
    integrand: 'x * cos(x)',
    primitieve: 'x * sin(x) + cos(x)',
    grenzen: [0, PI / 2],
    waarde: 'pi / 2 - 1',
    steps: toepassing({
      deel1: r`Deel 1 van de driedeling: op $\left[0, \tfrac{1}{2}\pi\right]$ zijn $x$ en $\cos(x)$ allebei niet-negatief, dus ligt de grafiek boven de $x$-as. De oppervlakte is $\displaystyle\int_{0}^{\frac{1}{2}\pi} x\cos(x)\,\mathrm{d}x$.`,
      keuze: r`Deel 2: een veelterm maal een gonio → partieel integreren. Noem $h'(x) = \cos(x)$, dus $h(x) = \sin(x)$, en $g(x) = x$, dus $g'(x) = 1$.`,
      primitiveren: r`Vul de regel in: ${REGEL}, dus $\int x\cos(x)\,\mathrm{d}x = x\sin(x) - \int \sin(x)\,\mathrm{d}x = x\sin(x) + \cos(x)$.`,
      afronden: r`Vul de grenzen in: $\left[x\sin(x) + \cos(x)\right]_{0}^{\frac{1}{2}\pi} = \left(\tfrac{1}{2}\pi + 0\right) - (0 + 1) = \tfrac{1}{2}\pi - 1$. De oppervlakte is $\tfrac{1}{2}\pi - 1$.`,
    }),
  },
  {
    cluster: 'k2a_opp',
    nummer: 'opp-5',
    level: 3,
    latex: r`De grafiek van $f(x) = x\mathrm{e}^{2x}$, de $x$-as en de lijn $x = p$ met $p > 0$ sluiten een vlakdeel in met oppervlakte $\tfrac{1}{4}$. Bereken exact $p$.`,
    antwoordLatex: r`p = \tfrac{1}{2}`,
    antwoord: '1/2',
    alts: ['p = 1/2', '0,5', 'p = 0,5'],
    integrand: 'x * e^(2 * x)',
    primitieve: 'x * e^(2 * x) / 2 - e^(2 * x) / 4',
    grenzen: [0, 0.5],
    waarde: '1/4',
    steps: toepassing({
      deel1: r`Deel 1 van de driedeling: de grafiek snijdt de $x$-as alleen bij $x = 0$ en ligt daarna erboven, dus de oppervlakte is $\displaystyle\int_{0}^{p} x\mathrm{e}^{2x}\,\mathrm{d}x$, en die moet $\tfrac{1}{4}$ worden.`,
      keuze: r`Deel 2: een veelterm maal een e-macht → partieel integreren. Noem $h'(x) = \mathrm{e}^{2x}$, dus $h(x) = \tfrac{1}{2}\mathrm{e}^{2x}$, en $g(x) = x$, dus $g'(x) = 1$.`,
      primitiveren: r`Vul de regel in: ${REGEL}, dus $\int x\mathrm{e}^{2x}\,\mathrm{d}x = \tfrac{1}{2}x\mathrm{e}^{2x} - \int \tfrac{1}{2}\mathrm{e}^{2x}\,\mathrm{d}x = \tfrac{1}{2}x\mathrm{e}^{2x} - \tfrac{1}{4}\mathrm{e}^{2x}$. Invullen van de grenzen geeft $\left[\tfrac{1}{2}x\mathrm{e}^{2x} - \tfrac{1}{4}\mathrm{e}^{2x}\right]_{0}^{p} = \tfrac{1}{2}p\mathrm{e}^{2p} - \tfrac{1}{4}\mathrm{e}^{2p} + \tfrac{1}{4}$.`,
      afronden: r`Deel 3: los de vergelijking op. Uit $\tfrac{1}{2}p\mathrm{e}^{2p} - \tfrac{1}{4}\mathrm{e}^{2p} + \tfrac{1}{4} = \tfrac{1}{4}$ volgt $\mathrm{e}^{2p}\left(\tfrac{1}{2}p - \tfrac{1}{4}\right) = 0$. Omdat $\mathrm{e}^{2p}$ nooit nul is, moet $\tfrac{1}{2}p = \tfrac{1}{4}$, dus $p = \tfrac{1}{2}$.`,
    }),
  },
  {
    cluster: 'k2a_opp',
    nummer: 'opp-6',
    level: 3,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = (x - 2)\mathrm{e}^{x}$, de $x$-as en de $y$-as. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\mathrm{e}^{2} - 3`,
    antwoord: 'e^2 - 3',
    alts: ['-3 + e^2'],
    integrand: '(x - 2) * e^x',
    primitieve: '(x - 3) * e^x',
    grenzen: [0, 2],
    waarde: '3 - e^2',
    steps: toepassing({
      deel1: r`Deel 1 van de driedeling: de grafiek snijdt de $x$-as bij $x = 2$ (want $\mathrm{e}^{x}$ is nooit nul) en de $y$-as is de lijn $x = 0$. Tussen $0$ en $2$ is $x - 2$ negatief, dus ligt de grafiek ónder de $x$-as. De oppervlakte is daarom $-\displaystyle\int_{0}^{2} (x - 2)\mathrm{e}^{x}\,\mathrm{d}x$.`,
      keuze: r`Deel 2: een veelterm maal een e-macht → partieel integreren. Noem $h'(x) = \mathrm{e}^{x}$, dus $h(x) = \mathrm{e}^{x}$, en $g(x) = x - 2$, dus $g'(x) = 1$.`,
      primitiveren: r`Vul de regel in: ${REGEL}, dus $\int (x - 2)\mathrm{e}^{x}\,\mathrm{d}x = (x - 2)\mathrm{e}^{x} - \int \mathrm{e}^{x}\,\mathrm{d}x = (x - 3)\mathrm{e}^{x}$.`,
      afronden: r`Vul de grenzen in: $\left[(x - 3)\mathrm{e}^{x}\right]_{0}^{2} = -\mathrm{e}^{2} - (-3) = 3 - \mathrm{e}^{2}$. Die uitkomst is negatief; de oppervlakte is het tegengestelde, dus $\mathrm{e}^{2} - 3$.`,
    }),
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Hoofdstuk, topics en clusters
// ─────────────────────────────────────────────────────────────────────────────

const K2A: AdditiveChapter = {
  chapterSlug: 'k',
  chapterTitle: 'K — Voortgezette integraalrekening',
  bookPart: 4,
  chapterOrder: 12,
  site: 'integralen',
  migrationFile: '0037_k2a_productregel.sql',
  headerTitle: 'K.2 Theorie A — Primitiveren en de productregel',
  sourceScript: 'scripts/k2a-content.ts',
  headerNotes: [
    'Theorieblok A van K.2: partieel integreren. Uit de productregel volgt',
    'int g * h\' dx = g * h - int h * g\' dx. Je primitiveert één factor (h\') en',
    'differentieert de andere (g); de keuze is goed als de overgebleven integraal',
    'makkelijker is. Steeds één keer partieel integreren — twee keer is Theorie B.',
    '',
    'Eigen oefenvragen, geen boekopgaven. Elke primitieve wordt nagerekend door',
    'src/content/primitieven.test.ts (content/hoofdstuk-k/k2a.json).',
  ],
  topics: [
    { slug: 'k2a_partieel', title: 'Primitiveren met partieel integreren', order: 10, category: 'primitiveren' },
    { slug: 'k2a_bepaald', title: 'Bepaalde integralen met partieel integreren', order: 11, category: 'integralen' },
    { slug: 'k2a_toepassingen', title: 'Oppervlakte met partieel integreren', order: 12, category: 'toepassingen' },
  ],
  clusters: [
    { topic: 'k2a_partieel', slug: 'k2a_macht_gonio', title: 'Een veelterm maal een sinus of cosinus', order: 1 },
    { topic: 'k2a_partieel', slug: 'k2a_macht_e', title: 'Een veelterm maal een e-macht', order: 2 },
    { topic: 'k2a_partieel', slug: 'k2a_ln', title: 'Primitiveren met een logaritme', order: 3 },
    { topic: 'k2a_bepaald', slug: 'k2a_bepaald_gonio', title: 'Bepaalde integralen met gonio', order: 1 },
    { topic: 'k2a_bepaald', slug: 'k2a_bepaald_e_ln', title: 'Bepaalde integralen met e-machten en logaritmen', order: 2 },
    { topic: 'k2a_toepassingen', slug: 'k2a_opp', title: 'Oppervlakte en p bepalen', order: 1 },
  ],
  questions: VRAGEN,
}

// ─────────────────────────────────────────────────────────────────────────────
// Schrijven
// ─────────────────────────────────────────────────────────────────────────────

const wortel = process.cwd()

const contentPad = path.join(wortel, 'content', 'hoofdstuk-k', 'k2a.json')
writeFileSync(
  contentPad,
  generateContentFile(K2A, 'K.2 Theorie A — Primitiveren en de productregel (eigen varianten)'),
)

const migratiePad = path.join(wortel, 'supabase', 'migrations', K2A.migrationFile)
writeFileSync(migratiePad, generateAdditiveMigration(K2A))

console.log(`Geschreven: ${contentPad}`)
console.log(`Geschreven: ${migratiePad}`)
console.log(`Vragen: ${K2A.questions.length}, stappen: ${K2A.questions.length * 4}`)
