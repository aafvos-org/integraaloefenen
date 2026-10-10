/**
 * K.2 Theorie B — Herhaald partieel integreren.
 *
 * Eigen oefenvragen in de stijl van dit theorieblok. Waar Theorie A één keer
 * partieel integreert, gaat het hier om twee keer achter elkaar. Dat gebeurt in
 * twee gedaanten:
 *
 *   • de veelterm is van graad 2, dus na één ronde staat er nog steeds een
 *     product (∫ x² e^x dx → ∫ 2x e^x dx) — nog een ronde en je bent klaar;
 *   • een e-macht maal een gonio, waarbij na twee rondes de oorspronkelijke
 *     integraal weer opduikt (∫ e^x sin(x) dx). Dan haal je hem naar één kant
 *     en deel je door de factor die ervoor staat.
 *
 * De regel blijft dezelfde als in Theorie A:
 *
 *     ∫ g(x) · h'(x) dx = g(x) · h(x) − ∫ h(x) · g'(x) dx
 *
 * Het boek noemt die twee factoren f en g'; op de site heten functies f, g en
 * h, dus staat de regel er met g en h'.
 *
 * Draaien met:  npx jiti scripts/k2b-content.ts
 *
 * Schrijft twee bestanden:
 *   • content/hoofdstuk-k/k2b.json                       — leest src/content/primitieven.test.ts
 *   • supabase/migrations/0038_k2b_herhaald_partieel.sql — alleen rijen toevoegen
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
// gewone getallen staan. In de opgave zelf blijft de grens exact
// ($\tfrac{1}{2}\pi$, $\tfrac{1}{4}\pi$).
// ─────────────────────────────────────────────────────────────────────────────

const PI = Math.PI

// ─────────────────────────────────────────────────────────────────────────────
// Stap-sjablonen
//
// Elke vraag krijgt vier stappen (step_order 0 t/m 3). Stap 0 benoemt welk deel
// van de driedeling aan de orde is; bij een kale primitiveer- of bereken-exact-
// opgave is dat alleen deel 2. Bij de toepassingen spelen deel 1 (verhaaltje →
// integraal) en soms deel 3 (vergelijking oplossen) ook mee.
// ─────────────────────────────────────────────────────────────────────────────

const DEEL2 = r`Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal.`

/** De regel zelf, steeds in dezelfde letters: g differentiëren, h' primitiveren. */
const REGEL = r`$\int g(x) \cdot h'(x)\,\mathrm{d}x = g(x) \cdot h(x) - \int h(x) \cdot g'(x)\,\mathrm{d}x$`

/** De buitenste schil, per soort product steeds in dezelfde woorden. */
const SCHIL = {
  kwadraatGonio: r`Buitenste schil: een veelterm van graad 2 maal een sinus of cosinus → partieel integreren. Differentiëren haalt de graad van de veelterm één omlaag, dus na één ronde staat er nog een product van graad 1: dan moet je een tweede keer partieel integreren.`,
  kwadraatE: r`Buitenste schil: een veelterm van graad 2 maal een e-macht → partieel integreren. De e-macht verandert nauwelijks, maar de veelterm zakt per ronde één graad. Van graad 2 naar graad 0 zijn dat twee rondes.`,
  terug: r`Buitenste schil: een e-macht maal een sinus of cosinus → partieel integreren. Geen van beide factoren wordt eenvoudiger, dus dit loopt niet vanzelf af. Doe toch twee rondes: dan staat de oorspronkelijke integraal er weer, en kun je hem naar één kant halen.`,
}

/** Het slot van de terugkom-truc, steeds in dezelfde woorden. */
const TRUC = r`Noem de gevraagde integraal $I$. Na twee rondes staat $I$ rechts ook weer, dus je lost $I$ op zoals een vergelijking: alles met $I$ naar links, daarna delen.`

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
  // ── Een veelterm van graad 2 maal een sinus of cosinus ────────────────────
  {
    cluster: 'k2b_kwadraat_gonio',
    nummer: 'kwgonio-1',
    level: 1,
    latex: r`Primitiveer: $f(x) = x^{2}\sin(x)$`,
    antwoordLatex: r`F(x) = -x^{2}\cos(x) + 2x\sin(x) + 2\cos(x) + c`,
    antwoord: '-x^2 cos(x) + 2x sin(x) + 2cos(x) + c',
    alts: ['2x sin(x) + 2cos(x) - x^2 cos(x) + c'],
    integrand: 'x^2 * sin(x)',
    primitieve: '-x^2 * cos(x) + 2 * x * sin(x) + 2 * cos(x)',
    steps: herhaald({
      schil: SCHIL.kwadraatGonio,
      keuze: r`Noem de factor die je eerst primitiveert $h'$ en de andere $g$: $h'(x) = \sin(x)$, dus $h(x) = -\cos(x)$, en $g(x) = x^{2}$, dus $g'(x) = 2x$.`,
      eerste: r`Dat geeft $\int x^{2}\sin(x)\,\mathrm{d}x = -x^{2}\cos(x) + \int 2x\cos(x)\,\mathrm{d}x$. Er staat nog een product, dus dit is nog niet klaar.`,
      tweede: r`Tweede ronde op $\int 2x\cos(x)\,\mathrm{d}x$: nu is $h'(x) = \cos(x)$, dus $h(x) = \sin(x)$, en $g(x) = 2x$, dus $g'(x) = 2$. Dat geeft $2x\sin(x) - \int 2\sin(x)\,\mathrm{d}x = 2x\sin(x) + 2\cos(x)$. Samen: $F(x) = -x^{2}\cos(x) + 2x\sin(x) + 2\cos(x) + c$. Controle: differentiëren geeft $-2x\cos(x) + x^{2}\sin(x) + 2\sin(x) + 2x\cos(x) - 2\sin(x) = x^{2}\sin(x)$.`,
    }),
  },
  {
    cluster: 'k2b_kwadraat_gonio',
    nummer: 'kwgonio-2',
    level: 1,
    latex: r`Primitiveer: $f(x) = x^{2}\cos(x)$`,
    antwoordLatex: r`F(x) = x^{2}\sin(x) + 2x\cos(x) - 2\sin(x) + c`,
    antwoord: 'x^2 sin(x) + 2x cos(x) - 2sin(x) + c',
    alts: ['x^2 sin(x) - 2sin(x) + 2x cos(x) + c'],
    integrand: 'x^2 * cos(x)',
    primitieve: 'x^2 * sin(x) + 2 * x * cos(x) - 2 * sin(x)',
    steps: herhaald({
      schil: SCHIL.kwadraatGonio,
      keuze: r`Noem de factor die je eerst primitiveert $h'$ en de andere $g$: $h'(x) = \cos(x)$, dus $h(x) = \sin(x)$, en $g(x) = x^{2}$, dus $g'(x) = 2x$.`,
      eerste: r`Dat geeft $\int x^{2}\cos(x)\,\mathrm{d}x = x^{2}\sin(x) - \int 2x\sin(x)\,\mathrm{d}x$. De overgebleven integraal is nog steeds een product, maar wel één graad eenvoudiger.`,
      tweede: r`Tweede ronde op $\int 2x\sin(x)\,\mathrm{d}x$: $h'(x) = \sin(x)$, dus $h(x) = -\cos(x)$, en $g(x) = 2x$, dus $g'(x) = 2$. Dat geeft $-2x\cos(x) + \int 2\cos(x)\,\mathrm{d}x = -2x\cos(x) + 2\sin(x)$. Let op het minteken ervoor: $F(x) = x^{2}\sin(x) + 2x\cos(x) - 2\sin(x) + c$. Controle: differentiëren geeft $2x\sin(x) + x^{2}\cos(x) + 2\cos(x) - 2x\sin(x) - 2\cos(x) = x^{2}\cos(x)$.`,
    }),
  },
  {
    cluster: 'k2b_kwadraat_gonio',
    nummer: 'kwgonio-3',
    level: 2,
    latex: r`Primitiveer: $f(x) = x^{2}\sin(2x)$`,
    antwoordLatex: r`F(x) = -\tfrac{1}{2}x^{2}\cos(2x) + \tfrac{1}{2}x\sin(2x) + \tfrac{1}{4}\cos(2x) + c`,
    antwoord: '-1/2 x^2 cos(2x) + 1/2 x sin(2x) + 1/4 cos(2x) + c',
    alts: ['-x^2 cos(2x)/2 + x sin(2x)/2 + cos(2x)/4 + c'],
    integrand: 'x^2 * sin(2 * x)',
    primitieve: '-x^2 * cos(2 * x) / 2 + x * sin(2 * x) / 2 + cos(2 * x) / 4',
    steps: herhaald({
      schil: SCHIL.kwadraatGonio,
      keuze: r`Noem $h'(x) = \sin(2x)$, dus $h(x) = -\tfrac{1}{2}\cos(2x)$ — door de $2$ in de hoek komt er een $\tfrac{1}{2}$ bij — en $g(x) = x^{2}$, dus $g'(x) = 2x$.`,
      eerste: r`Dat geeft $\int x^{2}\sin(2x)\,\mathrm{d}x = -\tfrac{1}{2}x^{2}\cos(2x) + \int \tfrac{1}{2}\cos(2x) \cdot 2x\,\mathrm{d}x = -\tfrac{1}{2}x^{2}\cos(2x) + \int x\cos(2x)\,\mathrm{d}x$.`,
      tweede: r`Tweede ronde op $\int x\cos(2x)\,\mathrm{d}x$: $h'(x) = \cos(2x)$, dus $h(x) = \tfrac{1}{2}\sin(2x)$, en $g(x) = x$, dus $g'(x) = 1$. Dat geeft $\tfrac{1}{2}x\sin(2x) - \int \tfrac{1}{2}\sin(2x)\,\mathrm{d}x = \tfrac{1}{2}x\sin(2x) + \tfrac{1}{4}\cos(2x)$. Samen: $F(x) = -\tfrac{1}{2}x^{2}\cos(2x) + \tfrac{1}{2}x\sin(2x) + \tfrac{1}{4}\cos(2x) + c$. Controle: differentiëren geeft $-x\cos(2x) + x^{2}\sin(2x) + \tfrac{1}{2}\sin(2x) + x\cos(2x) - \tfrac{1}{2}\sin(2x) = x^{2}\sin(2x)$.`,
    }),
  },
  {
    cluster: 'k2b_kwadraat_gonio',
    nummer: 'kwgonio-4',
    level: 2,
    latex: r`Primitiveer: $f(x) = \left(x^{2} + 4x\right)\cos(x)$`,
    antwoordLatex: r`F(x) = \left(x^{2} + 4x\right)\sin(x) + (2x + 4)\cos(x) - 2\sin(x) + c`,
    antwoord: '(x^2 + 4x) sin(x) + (2x + 4) cos(x) - 2sin(x) + c',
    alts: ['(x^2 + 4x - 2) sin(x) + (2x + 4) cos(x) + c'],
    integrand: '(x^2 + 4 * x) * cos(x)',
    primitieve: '(x^2 + 4 * x) * sin(x) + (2 * x + 4) * cos(x) - 2 * sin(x)',
    steps: herhaald({
      schil: SCHIL.kwadraatGonio,
      keuze: r`De hele haakjesterm gaat in één keer mee als $g$; uitvermenigvuldigen hoeft niet. Noem $h'(x) = \cos(x)$, dus $h(x) = \sin(x)$, en $g(x) = x^{2} + 4x$, dus $g'(x) = 2x + 4$.`,
      eerste: r`Dat geeft $\int \left(x^{2} + 4x\right)\cos(x)\,\mathrm{d}x = \left(x^{2} + 4x\right)\sin(x) - \int (2x + 4)\sin(x)\,\mathrm{d}x$.`,
      tweede: r`Tweede ronde op $\int (2x + 4)\sin(x)\,\mathrm{d}x$: $h'(x) = \sin(x)$, dus $h(x) = -\cos(x)$, en $g(x) = 2x + 4$, dus $g'(x) = 2$. Dat geeft $-(2x + 4)\cos(x) + \int 2\cos(x)\,\mathrm{d}x = -(2x + 4)\cos(x) + 2\sin(x)$. Met het minteken ervoor: $F(x) = \left(x^{2} + 4x\right)\sin(x) + (2x + 4)\cos(x) - 2\sin(x) + c$. Controle: differentiëren geeft $(2x + 4)\sin(x) + \left(x^{2} + 4x\right)\cos(x) + 2\cos(x) - (2x + 4)\sin(x) - 2\cos(x) = \left(x^{2} + 4x\right)\cos(x)$.`,
    }),
  },
  {
    cluster: 'k2b_kwadraat_gonio',
    nummer: 'kwgonio-5',
    level: 3,
    latex: r`Primitiveer: $f(x) = x^{2}\cos(3x)$`,
    antwoordLatex: r`F(x) = \tfrac{1}{3}x^{2}\sin(3x) + \tfrac{2}{9}x\cos(3x) - \tfrac{2}{27}\sin(3x) + c`,
    antwoord: '1/3 x^2 sin(3x) + 2/9 x cos(3x) - 2/27 sin(3x) + c',
    alts: ['x^2 sin(3x)/3 + 2x cos(3x)/9 - 2sin(3x)/27 + c'],
    integrand: 'x^2 * cos(3 * x)',
    primitieve: 'x^2 * sin(3 * x) / 3 + 2 * x * cos(3 * x) / 9 - 2 * sin(3 * x) / 27',
    steps: herhaald({
      schil: SCHIL.kwadraatGonio,
      keuze: r`Noem $h'(x) = \cos(3x)$, dus $h(x) = \tfrac{1}{3}\sin(3x)$, en $g(x) = x^{2}$, dus $g'(x) = 2x$. Elke ronde levert door de $3$ in de hoek weer een factor $\tfrac{1}{3}$ op; daar komen de noemers $3$, $9$ en $27$ vandaan.`,
      eerste: r`Dat geeft $\int x^{2}\cos(3x)\,\mathrm{d}x = \tfrac{1}{3}x^{2}\sin(3x) - \int \tfrac{1}{3}\sin(3x) \cdot 2x\,\mathrm{d}x = \tfrac{1}{3}x^{2}\sin(3x) - \tfrac{2}{3}\int x\sin(3x)\,\mathrm{d}x$.`,
      tweede: r`Tweede ronde op $\int x\sin(3x)\,\mathrm{d}x$: $h'(x) = \sin(3x)$, dus $h(x) = -\tfrac{1}{3}\cos(3x)$, en $g(x) = x$, dus $g'(x) = 1$. Dat geeft $-\tfrac{1}{3}x\cos(3x) + \int \tfrac{1}{3}\cos(3x)\,\mathrm{d}x = -\tfrac{1}{3}x\cos(3x) + \tfrac{1}{9}\sin(3x)$. Vermenigvuldig met $-\tfrac{2}{3}$ en tel op: $F(x) = \tfrac{1}{3}x^{2}\sin(3x) + \tfrac{2}{9}x\cos(3x) - \tfrac{2}{27}\sin(3x) + c$. Controle: differentiëren geeft $\tfrac{2}{3}x\sin(3x) + x^{2}\cos(3x) + \tfrac{2}{9}\cos(3x) - \tfrac{2}{3}x\sin(3x) - \tfrac{2}{9}\cos(3x) = x^{2}\cos(3x)$.`,
    }),
  },
  {
    cluster: 'k2b_kwadraat_gonio',
    nummer: 'kwgonio-6',
    level: 3,
    latex: r`Primitiveer: $f(x) = \left(x^{2} - x\right)\sin(2x)$`,
    antwoordLatex: r`F(x) = -\tfrac{1}{2}\left(x^{2} - x\right)\cos(2x) + \left(\tfrac{1}{2}x - \tfrac{1}{4}\right)\sin(2x) + \tfrac{1}{4}\cos(2x) + c`,
    antwoord: '-1/2 (x^2 - x) cos(2x) + (1/2 x - 1/4) sin(2x) + 1/4 cos(2x) + c',
    alts: ['-(x^2 - x) cos(2x)/2 + (x/2 - 1/4) sin(2x) + cos(2x)/4 + c'],
    integrand: '(x^2 - x) * sin(2 * x)',
    primitieve: '-(x^2 - x) * cos(2 * x) / 2 + (x / 2 - 1 / 4) * sin(2 * x) + cos(2 * x) / 4',
    steps: herhaald({
      schil: SCHIL.kwadraatGonio,
      keuze: r`Noem $h'(x) = \sin(2x)$, dus $h(x) = -\tfrac{1}{2}\cos(2x)$, en $g(x) = x^{2} - x$, dus $g'(x) = 2x - 1$.`,
      eerste: r`Dat geeft $\int \left(x^{2} - x\right)\sin(2x)\,\mathrm{d}x = -\tfrac{1}{2}\left(x^{2} - x\right)\cos(2x) + \int \tfrac{1}{2}\cos(2x)(2x - 1)\,\mathrm{d}x = -\tfrac{1}{2}\left(x^{2} - x\right)\cos(2x) + \int \left(x - \tfrac{1}{2}\right)\cos(2x)\,\mathrm{d}x$.`,
      tweede: r`Tweede ronde op $\int \left(x - \tfrac{1}{2}\right)\cos(2x)\,\mathrm{d}x$: $h'(x) = \cos(2x)$, dus $h(x) = \tfrac{1}{2}\sin(2x)$, en $g(x) = x - \tfrac{1}{2}$, dus $g'(x) = 1$. Dat geeft $\left(\tfrac{1}{2}x - \tfrac{1}{4}\right)\sin(2x) - \int \tfrac{1}{2}\sin(2x)\,\mathrm{d}x = \left(\tfrac{1}{2}x - \tfrac{1}{4}\right)\sin(2x) + \tfrac{1}{4}\cos(2x)$. Samen: $F(x) = -\tfrac{1}{2}\left(x^{2} - x\right)\cos(2x) + \left(\tfrac{1}{2}x - \tfrac{1}{4}\right)\sin(2x) + \tfrac{1}{4}\cos(2x) + c$. Controle: differentiëren laat alle $\cos(2x)$- en losse $\sin(2x)$-termen wegvallen en houdt $\left(x^{2} - x\right)\sin(2x)$ over.`,
    }),
  },

  // ── Een veelterm van graad 2 maal een e-macht ─────────────────────────────
  {
    cluster: 'k2b_kwadraat_e',
    nummer: 'kwe-1',
    level: 1,
    latex: r`Primitiveer: $f(x) = x^{2}\mathrm{e}^{x}$`,
    antwoordLatex: r`F(x) = \left(x^{2} - 2x + 2\right)\mathrm{e}^{x} + c`,
    antwoord: '(x^2 - 2x + 2) e^x + c',
    alts: ['x^2 e^x - 2x e^x + 2e^x + c'],
    integrand: 'x^2 * e^x',
    primitieve: '(x^2 - 2 * x + 2) * e^x',
    steps: herhaald({
      schil: SCHIL.kwadraatE,
      keuze: r`Noem de factor die je eerst primitiveert $h'$ en de andere $g$: $h'(x) = \mathrm{e}^{x}$, dus $h(x) = \mathrm{e}^{x}$, en $g(x) = x^{2}$, dus $g'(x) = 2x$.`,
      eerste: r`Dat geeft $\int x^{2}\mathrm{e}^{x}\,\mathrm{d}x = x^{2}\mathrm{e}^{x} - \int 2x\mathrm{e}^{x}\,\mathrm{d}x$. Er staat nog een product, dus nog een ronde.`,
      tweede: r`Tweede ronde op $\int 2x\mathrm{e}^{x}\,\mathrm{d}x$: $h'(x) = \mathrm{e}^{x}$ en $g(x) = 2x$, dus $g'(x) = 2$. Dat geeft $2x\mathrm{e}^{x} - \int 2\mathrm{e}^{x}\,\mathrm{d}x = 2x\mathrm{e}^{x} - 2\mathrm{e}^{x}$. Samen: $F(x) = x^{2}\mathrm{e}^{x} - 2x\mathrm{e}^{x} + 2\mathrm{e}^{x} = \left(x^{2} - 2x + 2\right)\mathrm{e}^{x} + c$. Controle: differentiëren geeft $(2x - 2)\mathrm{e}^{x} + \left(x^{2} - 2x + 2\right)\mathrm{e}^{x} = x^{2}\mathrm{e}^{x}$.`,
    }),
  },
  {
    cluster: 'k2b_kwadraat_e',
    nummer: 'kwe-2',
    level: 1,
    latex: r`Primitiveer: $f(x) = x^{2}\mathrm{e}^{2x}$`,
    antwoordLatex: r`F(x) = \tfrac{1}{2}x^{2}\mathrm{e}^{2x} - \tfrac{1}{2}x\mathrm{e}^{2x} + \tfrac{1}{4}\mathrm{e}^{2x} + c`,
    antwoord: '1/2 x^2 e^(2x) - 1/2 x e^(2x) + 1/4 e^(2x) + c',
    alts: ['(1/2 x^2 - 1/2 x + 1/4) e^(2x) + c', '(2x^2 - 2x + 1) e^(2x)/4 + c'],
    integrand: 'x^2 * e^(2 * x)',
    primitieve: 'x^2 * e^(2 * x) / 2 - x * e^(2 * x) / 2 + e^(2 * x) / 4',
    steps: herhaald({
      schil: SCHIL.kwadraatE,
      keuze: r`Noem $h'(x) = \mathrm{e}^{2x}$, dus $h(x) = \tfrac{1}{2}\mathrm{e}^{2x}$ — door de $2$ in de exponent komt er een $\tfrac{1}{2}$ bij — en $g(x) = x^{2}$, dus $g'(x) = 2x$.`,
      eerste: r`Dat geeft $\int x^{2}\mathrm{e}^{2x}\,\mathrm{d}x = \tfrac{1}{2}x^{2}\mathrm{e}^{2x} - \int \tfrac{1}{2}\mathrm{e}^{2x} \cdot 2x\,\mathrm{d}x = \tfrac{1}{2}x^{2}\mathrm{e}^{2x} - \int x\mathrm{e}^{2x}\,\mathrm{d}x$.`,
      tweede: r`Tweede ronde op $\int x\mathrm{e}^{2x}\,\mathrm{d}x$: $h'(x) = \mathrm{e}^{2x}$, dus $h(x) = \tfrac{1}{2}\mathrm{e}^{2x}$, en $g(x) = x$, dus $g'(x) = 1$. Dat geeft $\tfrac{1}{2}x\mathrm{e}^{2x} - \int \tfrac{1}{2}\mathrm{e}^{2x}\,\mathrm{d}x = \tfrac{1}{2}x\mathrm{e}^{2x} - \tfrac{1}{4}\mathrm{e}^{2x}$. Samen: $F(x) = \tfrac{1}{2}x^{2}\mathrm{e}^{2x} - \tfrac{1}{2}x\mathrm{e}^{2x} + \tfrac{1}{4}\mathrm{e}^{2x} + c$. Controle: differentiëren geeft $x\mathrm{e}^{2x} + x^{2}\mathrm{e}^{2x} - \tfrac{1}{2}\mathrm{e}^{2x} - x\mathrm{e}^{2x} + \tfrac{1}{2}\mathrm{e}^{2x} = x^{2}\mathrm{e}^{2x}$.`,
    }),
  },
  {
    cluster: 'k2b_kwadraat_e',
    nummer: 'kwe-3',
    level: 2,
    latex: r`Primitiveer: $f(x) = \left(x^{2} + 3\right)\mathrm{e}^{x}$`,
    antwoordLatex: r`F(x) = \left(x^{2} - 2x + 5\right)\mathrm{e}^{x} + c`,
    antwoord: '(x^2 - 2x + 5) e^x + c',
    alts: ['x^2 e^x - 2x e^x + 5e^x + c'],
    integrand: '(x^2 + 3) * e^x',
    primitieve: '(x^2 - 2 * x + 5) * e^x',
    steps: herhaald({
      schil: SCHIL.kwadraatE,
      keuze: r`De hele haakjesterm is $g$: $g(x) = x^{2} + 3$, dus $g'(x) = 2x$ — de $3$ valt bij het differentiëren weg. En $h'(x) = \mathrm{e}^{x}$, dus $h(x) = \mathrm{e}^{x}$.`,
      eerste: r`Dat geeft $\int \left(x^{2} + 3\right)\mathrm{e}^{x}\,\mathrm{d}x = \left(x^{2} + 3\right)\mathrm{e}^{x} - \int 2x\mathrm{e}^{x}\,\mathrm{d}x$.`,
      tweede: r`Tweede ronde op $\int 2x\mathrm{e}^{x}\,\mathrm{d}x = 2x\mathrm{e}^{x} - 2\mathrm{e}^{x}$. Dus $F(x) = \left(x^{2} + 3\right)\mathrm{e}^{x} - 2x\mathrm{e}^{x} + 2\mathrm{e}^{x} = \left(x^{2} - 2x + 5\right)\mathrm{e}^{x} + c$. Controle: differentiëren geeft $(2x - 2)\mathrm{e}^{x} + \left(x^{2} - 2x + 5\right)\mathrm{e}^{x} = \left(x^{2} + 3\right)\mathrm{e}^{x}$.`,
    }),
  },
  {
    cluster: 'k2b_kwadraat_e',
    nummer: 'kwe-4',
    level: 2,
    latex: r`Primitiveer: $f(x) = 3x^{2}\mathrm{e}^{-x}$`,
    antwoordLatex: r`F(x) = -\left(3x^{2} + 6x + 6\right)\mathrm{e}^{-x} + c`,
    antwoord: '-(3x^2 + 6x + 6) e^(-x) + c',
    alts: ['-3x^2 e^(-x) - 6x e^(-x) - 6e^(-x) + c'],
    integrand: '3 * x^2 * e^(-x)',
    primitieve: '-(3 * x^2 + 6 * x + 6) * e^(-x)',
    steps: herhaald({
      schil: SCHIL.kwadraatE,
      keuze: r`Noem $h'(x) = \mathrm{e}^{-x}$, dus $h(x) = -\mathrm{e}^{-x}$ — door de $-1$ in de exponent draait het teken om — en $g(x) = 3x^{2}$, dus $g'(x) = 6x$.`,
      eerste: r`Dat geeft $\int 3x^{2}\mathrm{e}^{-x}\,\mathrm{d}x = -3x^{2}\mathrm{e}^{-x} + \int 6x\mathrm{e}^{-x}\,\mathrm{d}x$.`,
      tweede: r`Tweede ronde op $\int 6x\mathrm{e}^{-x}\,\mathrm{d}x$: $h'(x) = \mathrm{e}^{-x}$, dus $h(x) = -\mathrm{e}^{-x}$, en $g(x) = 6x$, dus $g'(x) = 6$. Dat geeft $-6x\mathrm{e}^{-x} + \int 6\mathrm{e}^{-x}\,\mathrm{d}x = -6x\mathrm{e}^{-x} - 6\mathrm{e}^{-x}$. Samen: $F(x) = -\left(3x^{2} + 6x + 6\right)\mathrm{e}^{-x} + c$. Controle: differentiëren geeft $-(6x + 6)\mathrm{e}^{-x} + \left(3x^{2} + 6x + 6\right)\mathrm{e}^{-x} = 3x^{2}\mathrm{e}^{-x}$.`,
    }),
  },
  {
    cluster: 'k2b_kwadraat_e',
    nummer: 'kwe-5',
    level: 3,
    latex: r`Primitiveer: $f(x) = \left(x^{2} - 4x\right)\mathrm{e}^{2x}$`,
    antwoordLatex: r`F(x) = \left(\tfrac{1}{2}x^{2} - \tfrac{5}{2}x + \tfrac{5}{4}\right)\mathrm{e}^{2x} + c`,
    antwoord: '(1/2 x^2 - 5/2 x + 5/4) e^(2x) + c',
    alts: ['(2x^2 - 10x + 5) e^(2x)/4 + c'],
    integrand: '(x^2 - 4 * x) * e^(2 * x)',
    primitieve: '(x^2 / 2 - 5 * x / 2 + 5 / 4) * e^(2 * x)',
    steps: herhaald({
      schil: SCHIL.kwadraatE,
      keuze: r`Noem $h'(x) = \mathrm{e}^{2x}$, dus $h(x) = \tfrac{1}{2}\mathrm{e}^{2x}$, en $g(x) = x^{2} - 4x$, dus $g'(x) = 2x - 4$.`,
      eerste: r`Dat geeft $\int \left(x^{2} - 4x\right)\mathrm{e}^{2x}\,\mathrm{d}x = \tfrac{1}{2}\left(x^{2} - 4x\right)\mathrm{e}^{2x} - \int \tfrac{1}{2}\mathrm{e}^{2x}(2x - 4)\,\mathrm{d}x = \tfrac{1}{2}\left(x^{2} - 4x\right)\mathrm{e}^{2x} - \int (x - 2)\mathrm{e}^{2x}\,\mathrm{d}x$.`,
      tweede: r`Tweede ronde op $\int (x - 2)\mathrm{e}^{2x}\,\mathrm{d}x$: $h'(x) = \mathrm{e}^{2x}$, dus $h(x) = \tfrac{1}{2}\mathrm{e}^{2x}$, en $g(x) = x - 2$, dus $g'(x) = 1$. Dat geeft $\tfrac{1}{2}(x - 2)\mathrm{e}^{2x} - \tfrac{1}{4}\mathrm{e}^{2x}$. Trek dat ervan af en neem $\mathrm{e}^{2x}$ buiten haakjes: $F(x) = \left(\tfrac{1}{2}x^{2} - 2x - \tfrac{1}{2}x + 1 + \tfrac{1}{4}\right)\mathrm{e}^{2x} = \left(\tfrac{1}{2}x^{2} - \tfrac{5}{2}x + \tfrac{5}{4}\right)\mathrm{e}^{2x} + c$. Controle: differentiëren geeft $\left(x - \tfrac{5}{2}\right)\mathrm{e}^{2x} + \left(x^{2} - 5x + \tfrac{5}{2}\right)\mathrm{e}^{2x} = \left(x^{2} - 4x\right)\mathrm{e}^{2x}$.`,
    }),
  },
  {
    cluster: 'k2b_kwadraat_e',
    nummer: 'kwe-6',
    level: 3,
    latex: r`Primitiveer: $f(x) = \dfrac{x^{2}}{\mathrm{e}^{3x}}$`,
    antwoordLatex: r`F(x) = -\tfrac{1}{27}\left(9x^{2} + 6x + 2\right)\mathrm{e}^{-3x} + c`,
    antwoord: '-1/27 (9x^2 + 6x + 2) e^(-3x) + c',
    alts: ['-(9x^2 + 6x + 2) e^(-3x)/27 + c', '-(9x^2 + 6x + 2)/(27 e^(3x)) + c'],
    integrand: 'x^2 / e^(3 * x)',
    primitieve: '-(9 * x^2 + 6 * x + 2) * e^(-3 * x) / 27',
    steps: herhaald({
      schil: r`Herschrijf eerst: een e-macht in de noemer is een e-macht met een minteken in de exponent, dus $f(x) = x^{2}\mathrm{e}^{-3x}$. ${SCHIL.kwadraatE}`,
      keuze: r`Noem $h'(x) = \mathrm{e}^{-3x}$, dus $h(x) = -\tfrac{1}{3}\mathrm{e}^{-3x}$, en $g(x) = x^{2}$, dus $g'(x) = 2x$.`,
      eerste: r`Dat geeft $\int x^{2}\mathrm{e}^{-3x}\,\mathrm{d}x = -\tfrac{1}{3}x^{2}\mathrm{e}^{-3x} + \int \tfrac{1}{3}\mathrm{e}^{-3x} \cdot 2x\,\mathrm{d}x = -\tfrac{1}{3}x^{2}\mathrm{e}^{-3x} + \tfrac{2}{3}\int x\mathrm{e}^{-3x}\,\mathrm{d}x$.`,
      tweede: r`Tweede ronde op $\int x\mathrm{e}^{-3x}\,\mathrm{d}x = -\tfrac{1}{3}x\mathrm{e}^{-3x} + \int \tfrac{1}{3}\mathrm{e}^{-3x}\,\mathrm{d}x = -\tfrac{1}{3}x\mathrm{e}^{-3x} - \tfrac{1}{9}\mathrm{e}^{-3x}$. Vermenigvuldig met $\tfrac{2}{3}$ en tel op: $F(x) = -\tfrac{1}{3}x^{2}\mathrm{e}^{-3x} - \tfrac{2}{9}x\mathrm{e}^{-3x} - \tfrac{2}{27}\mathrm{e}^{-3x} = -\tfrac{1}{27}\left(9x^{2} + 6x + 2\right)\mathrm{e}^{-3x} + c$. Controle: differentiëren geeft $-\tfrac{1}{27}(18x + 6)\mathrm{e}^{-3x} + \tfrac{1}{9}\left(9x^{2} + 6x + 2\right)\mathrm{e}^{-3x} = x^{2}\mathrm{e}^{-3x}$.`,
    }),
  },

  // ── De integraal komt terug ───────────────────────────────────────────────
  {
    cluster: 'k2b_terugkomen',
    nummer: 'terug-1',
    level: 1,
    latex: r`Primitiveer: $f(x) = \mathrm{e}^{x}\sin(x)$`,
    antwoordLatex: r`F(x) = \tfrac{1}{2}\mathrm{e}^{x}\left(\sin(x) - \cos(x)\right) + c`,
    antwoord: '1/2 e^x (sin(x) - cos(x)) + c',
    alts: ['e^x (sin(x) - cos(x))/2 + c', '1/2 e^x sin(x) - 1/2 e^x cos(x) + c'],
    integrand: 'e^x * sin(x)',
    primitieve: 'e^x * (sin(x) - cos(x)) / 2',
    steps: herhaald({
      schil: SCHIL.terug,
      keuze: r`Kies $h'(x) = \mathrm{e}^{x}$, dus $h(x) = \mathrm{e}^{x}$, en $g(x) = \sin(x)$, dus $g'(x) = \cos(x)$. Houd die keuze in de tweede ronde vol: primitiveer weer de e-macht, anders draai je alles terug en staat er $I = I$.`,
      eerste: r`Eerste ronde: $I = \int \mathrm{e}^{x}\sin(x)\,\mathrm{d}x = \mathrm{e}^{x}\sin(x) - \int \mathrm{e}^{x}\cos(x)\,\mathrm{d}x$. Tweede ronde op die laatste integraal, met $h'(x) = \mathrm{e}^{x}$ en $g(x) = \cos(x)$, dus $g'(x) = -\sin(x)$: $\int \mathrm{e}^{x}\cos(x)\,\mathrm{d}x = \mathrm{e}^{x}\cos(x) + \int \mathrm{e}^{x}\sin(x)\,\mathrm{d}x = \mathrm{e}^{x}\cos(x) + I$.`,
      tweede: `${TRUC} Invullen geeft $I = \\mathrm{e}^{x}\\sin(x) - \\mathrm{e}^{x}\\cos(x) - I$, dus $2I = \\mathrm{e}^{x}\\left(\\sin(x) - \\cos(x)\\right)$ en $F(x) = \\tfrac{1}{2}\\mathrm{e}^{x}\\left(\\sin(x) - \\cos(x)\\right) + c$. Controle: differentiëren geeft $\\tfrac{1}{2}\\mathrm{e}^{x}\\left(\\sin(x) - \\cos(x)\\right) + \\tfrac{1}{2}\\mathrm{e}^{x}\\left(\\cos(x) + \\sin(x)\\right) = \\mathrm{e}^{x}\\sin(x)$.`,
    }),
  },
  {
    cluster: 'k2b_terugkomen',
    nummer: 'terug-2',
    level: 1,
    latex: r`Primitiveer: $f(x) = \mathrm{e}^{x}\cos(x)$`,
    antwoordLatex: r`F(x) = \tfrac{1}{2}\mathrm{e}^{x}\left(\sin(x) + \cos(x)\right) + c`,
    antwoord: '1/2 e^x (sin(x) + cos(x)) + c',
    alts: ['e^x (sin(x) + cos(x))/2 + c', '1/2 e^x sin(x) + 1/2 e^x cos(x) + c'],
    integrand: 'e^x * cos(x)',
    primitieve: 'e^x * (sin(x) + cos(x)) / 2',
    steps: herhaald({
      schil: SCHIL.terug,
      keuze: r`Kies $h'(x) = \mathrm{e}^{x}$, dus $h(x) = \mathrm{e}^{x}$, en $g(x) = \cos(x)$, dus $g'(x) = -\sin(x)$. In de tweede ronde primitiveer je opnieuw de e-macht.`,
      eerste: r`Eerste ronde: $I = \int \mathrm{e}^{x}\cos(x)\,\mathrm{d}x = \mathrm{e}^{x}\cos(x) + \int \mathrm{e}^{x}\sin(x)\,\mathrm{d}x$. Tweede ronde op $\int \mathrm{e}^{x}\sin(x)\,\mathrm{d}x$, met $g(x) = \sin(x)$ en $g'(x) = \cos(x)$: dat is $\mathrm{e}^{x}\sin(x) - \int \mathrm{e}^{x}\cos(x)\,\mathrm{d}x = \mathrm{e}^{x}\sin(x) - I$.`,
      tweede: `${TRUC} Invullen geeft $I = \\mathrm{e}^{x}\\cos(x) + \\mathrm{e}^{x}\\sin(x) - I$, dus $2I = \\mathrm{e}^{x}\\left(\\sin(x) + \\cos(x)\\right)$ en $F(x) = \\tfrac{1}{2}\\mathrm{e}^{x}\\left(\\sin(x) + \\cos(x)\\right) + c$. Controle: differentiëren geeft $\\tfrac{1}{2}\\mathrm{e}^{x}\\left(\\sin(x) + \\cos(x)\\right) + \\tfrac{1}{2}\\mathrm{e}^{x}\\left(\\cos(x) - \\sin(x)\\right) = \\mathrm{e}^{x}\\cos(x)$.`,
    }),
  },
  {
    cluster: 'k2b_terugkomen',
    nummer: 'terug-3',
    level: 2,
    latex: r`Primitiveer: $f(x) = \mathrm{e}^{2x}\sin(x)$`,
    antwoordLatex: r`F(x) = \tfrac{1}{5}\mathrm{e}^{2x}\left(2\sin(x) - \cos(x)\right) + c`,
    antwoord: '1/5 e^(2x) (2sin(x) - cos(x)) + c',
    alts: ['e^(2x) (2sin(x) - cos(x))/5 + c'],
    integrand: 'e^(2 * x) * sin(x)',
    primitieve: 'e^(2 * x) * (2 * sin(x) - cos(x)) / 5',
    steps: herhaald({
      schil: SCHIL.terug,
      keuze: r`Kies $h'(x) = \mathrm{e}^{2x}$, dus $h(x) = \tfrac{1}{2}\mathrm{e}^{2x}$, en $g(x) = \sin(x)$, dus $g'(x) = \cos(x)$. Elke ronde levert een factor $\tfrac{1}{2}$ op; daarom komt $I$ straks met een kwart terug en blijft er $\tfrac{5}{4}$ over.`,
      eerste: r`Eerste ronde: $I = \tfrac{1}{2}\mathrm{e}^{2x}\sin(x) - \tfrac{1}{2}\int \mathrm{e}^{2x}\cos(x)\,\mathrm{d}x$. Tweede ronde op $\int \mathrm{e}^{2x}\cos(x)\,\mathrm{d}x = \tfrac{1}{2}\mathrm{e}^{2x}\cos(x) + \tfrac{1}{2}\int \mathrm{e}^{2x}\sin(x)\,\mathrm{d}x = \tfrac{1}{2}\mathrm{e}^{2x}\cos(x) + \tfrac{1}{2}I$.`,
      tweede: `${TRUC} Invullen geeft $I = \\tfrac{1}{2}\\mathrm{e}^{2x}\\sin(x) - \\tfrac{1}{4}\\mathrm{e}^{2x}\\cos(x) - \\tfrac{1}{4}I$, dus $\\tfrac{5}{4}I = \\tfrac{1}{4}\\mathrm{e}^{2x}\\left(2\\sin(x) - \\cos(x)\\right)$ en $F(x) = \\tfrac{1}{5}\\mathrm{e}^{2x}\\left(2\\sin(x) - \\cos(x)\\right) + c$. Controle: differentiëren geeft $\\tfrac{2}{5}\\mathrm{e}^{2x}\\left(2\\sin(x) - \\cos(x)\\right) + \\tfrac{1}{5}\\mathrm{e}^{2x}\\left(2\\cos(x) + \\sin(x)\\right) = \\mathrm{e}^{2x}\\sin(x)$.`,
    }),
  },
  {
    cluster: 'k2b_terugkomen',
    nummer: 'terug-4',
    level: 2,
    latex: r`Primitiveer: $f(x) = \mathrm{e}^{x}\cos(2x)$`,
    antwoordLatex: r`F(x) = \tfrac{1}{5}\mathrm{e}^{x}\left(\cos(2x) + 2\sin(2x)\right) + c`,
    antwoord: '1/5 e^x (cos(2x) + 2sin(2x)) + c',
    alts: ['e^x (cos(2x) + 2sin(2x))/5 + c'],
    integrand: 'e^x * cos(2 * x)',
    primitieve: 'e^x * (cos(2 * x) + 2 * sin(2 * x)) / 5',
    steps: herhaald({
      schil: SCHIL.terug,
      keuze: r`Kies $h'(x) = \mathrm{e}^{x}$, dus $h(x) = \mathrm{e}^{x}$, en $g(x) = \cos(2x)$, dus $g'(x) = -2\sin(2x)$. Door de $2$ in de hoek komt er bij elke ronde een factor $2$ bij; na twee rondes staat $I$ er dus met een $4$ voor.`,
      eerste: r`Eerste ronde: $I = \mathrm{e}^{x}\cos(2x) + 2\int \mathrm{e}^{x}\sin(2x)\,\mathrm{d}x$. Tweede ronde op $\int \mathrm{e}^{x}\sin(2x)\,\mathrm{d}x$, met $g(x) = \sin(2x)$ en $g'(x) = 2\cos(2x)$: dat is $\mathrm{e}^{x}\sin(2x) - 2\int \mathrm{e}^{x}\cos(2x)\,\mathrm{d}x = \mathrm{e}^{x}\sin(2x) - 2I$.`,
      tweede: `${TRUC} Invullen geeft $I = \\mathrm{e}^{x}\\cos(2x) + 2\\mathrm{e}^{x}\\sin(2x) - 4I$, dus $5I = \\mathrm{e}^{x}\\left(\\cos(2x) + 2\\sin(2x)\\right)$ en $F(x) = \\tfrac{1}{5}\\mathrm{e}^{x}\\left(\\cos(2x) + 2\\sin(2x)\\right) + c$. Controle: differentiëren geeft $\\tfrac{1}{5}\\mathrm{e}^{x}\\left(\\cos(2x) + 2\\sin(2x)\\right) + \\tfrac{1}{5}\\mathrm{e}^{x}\\left(-2\\sin(2x) + 4\\cos(2x)\\right) = \\mathrm{e}^{x}\\cos(2x)$.`,
    }),
  },
  {
    cluster: 'k2b_terugkomen',
    nummer: 'terug-5',
    level: 3,
    latex: r`Primitiveer: $f(x) = \mathrm{e}^{-x}\sin(2x)$`,
    antwoordLatex: r`F(x) = -\tfrac{1}{5}\mathrm{e}^{-x}\left(\sin(2x) + 2\cos(2x)\right) + c`,
    antwoord: '-1/5 e^(-x) (sin(2x) + 2cos(2x)) + c',
    alts: ['-e^(-x) (sin(2x) + 2cos(2x))/5 + c'],
    integrand: 'e^(-x) * sin(2 * x)',
    primitieve: '-e^(-x) * (sin(2 * x) + 2 * cos(2 * x)) / 5',
    steps: herhaald({
      schil: SCHIL.terug,
      keuze: r`Kies $h'(x) = \mathrm{e}^{-x}$, dus $h(x) = -\mathrm{e}^{-x}$, en $g(x) = \sin(2x)$, dus $g'(x) = 2\cos(2x)$. Let op twee dingen tegelijk: de e-macht draait van teken en de gonio levert een factor $2$.`,
      eerste: r`Eerste ronde: $I = -\mathrm{e}^{-x}\sin(2x) + 2\int \mathrm{e}^{-x}\cos(2x)\,\mathrm{d}x$. Tweede ronde op $\int \mathrm{e}^{-x}\cos(2x)\,\mathrm{d}x$, met $g(x) = \cos(2x)$ en $g'(x) = -2\sin(2x)$: dat is $-\mathrm{e}^{-x}\cos(2x) - 2\int \mathrm{e}^{-x}\sin(2x)\,\mathrm{d}x = -\mathrm{e}^{-x}\cos(2x) - 2I$.`,
      tweede: `${TRUC} Invullen geeft $I = -\\mathrm{e}^{-x}\\sin(2x) - 2\\mathrm{e}^{-x}\\cos(2x) - 4I$, dus $5I = -\\mathrm{e}^{-x}\\left(\\sin(2x) + 2\\cos(2x)\\right)$ en $F(x) = -\\tfrac{1}{5}\\mathrm{e}^{-x}\\left(\\sin(2x) + 2\\cos(2x)\\right) + c$. Controle: differentiëren geeft $\\tfrac{1}{5}\\mathrm{e}^{-x}\\left(\\sin(2x) + 2\\cos(2x)\\right) - \\tfrac{1}{5}\\mathrm{e}^{-x}\\left(2\\cos(2x) - 4\\sin(2x)\\right) = \\mathrm{e}^{-x}\\sin(2x)$.`,
    }),
  },
  {
    cluster: 'k2b_terugkomen',
    nummer: 'terug-6',
    level: 3,
    latex: r`Primitiveer: $f(x) = \mathrm{e}^{3x}\cos(2x)$`,
    antwoordLatex: r`F(x) = \tfrac{1}{13}\mathrm{e}^{3x}\left(3\cos(2x) + 2\sin(2x)\right) + c`,
    antwoord: '1/13 e^(3x) (3cos(2x) + 2sin(2x)) + c',
    alts: ['e^(3x) (3cos(2x) + 2sin(2x))/13 + c'],
    integrand: 'e^(3 * x) * cos(2 * x)',
    primitieve: 'e^(3 * x) * (3 * cos(2 * x) + 2 * sin(2 * x)) / 13',
    steps: herhaald({
      schil: SCHIL.terug,
      keuze: r`Kies $h'(x) = \mathrm{e}^{3x}$, dus $h(x) = \tfrac{1}{3}\mathrm{e}^{3x}$, en $g(x) = \cos(2x)$, dus $g'(x) = -2\sin(2x)$. Elke ronde levert $\tfrac{2}{3}$ op, dus na twee rondes staat $I$ er met $\tfrac{4}{9}$ bij.`,
      eerste: r`Eerste ronde: $I = \tfrac{1}{3}\mathrm{e}^{3x}\cos(2x) + \tfrac{2}{3}\int \mathrm{e}^{3x}\sin(2x)\,\mathrm{d}x$. Tweede ronde op $\int \mathrm{e}^{3x}\sin(2x)\,\mathrm{d}x = \tfrac{1}{3}\mathrm{e}^{3x}\sin(2x) - \tfrac{2}{3}\int \mathrm{e}^{3x}\cos(2x)\,\mathrm{d}x = \tfrac{1}{3}\mathrm{e}^{3x}\sin(2x) - \tfrac{2}{3}I$.`,
      tweede: `${TRUC} Invullen geeft $I = \\tfrac{1}{3}\\mathrm{e}^{3x}\\cos(2x) + \\tfrac{2}{9}\\mathrm{e}^{3x}\\sin(2x) - \\tfrac{4}{9}I$, dus $\\tfrac{13}{9}I = \\tfrac{1}{9}\\mathrm{e}^{3x}\\left(3\\cos(2x) + 2\\sin(2x)\\right)$ en $F(x) = \\tfrac{1}{13}\\mathrm{e}^{3x}\\left(3\\cos(2x) + 2\\sin(2x)\\right) + c$. Controle: differentiëren geeft $\\tfrac{3}{13}\\mathrm{e}^{3x}\\left(3\\cos(2x) + 2\\sin(2x)\\right) + \\tfrac{1}{13}\\mathrm{e}^{3x}\\left(-6\\sin(2x) + 4\\cos(2x)\\right) = \\mathrm{e}^{3x}\\cos(2x)$.`,
    }),
  },

  // ── Bepaalde integralen: twee keer partieel ───────────────────────────────
  {
    cluster: 'k2b_bepaald_kwadraat',
    nummer: 'bep-1',
    level: 1,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{\pi} x^{2}\sin(x)\,\mathrm{d}x$`,
    antwoordLatex: r`\pi^{2} - 4`,
    antwoord: 'pi^2 - 4',
    alts: ['-4 + pi^2'],
    integrand: 'x^2 * sin(x)',
    primitieve: '-x^2 * cos(x) + 2 * x * sin(x) + 2 * cos(x)',
    grenzen: [0, PI],
    waarde: 'pi^2 - 4',
    steps: bepaald({
      schil: SCHIL.kwadraatGonio,
      keuze: r`Eerste ronde met $h'(x) = \sin(x)$, dus $h(x) = -\cos(x)$, en $g(x) = x^{2}$, dus $g'(x) = 2x$: $\int x^{2}\sin(x)\,\mathrm{d}x = -x^{2}\cos(x) + \int 2x\cos(x)\,\mathrm{d}x$.`,
      primitiveren: r`Tweede ronde op $\int 2x\cos(x)\,\mathrm{d}x = 2x\sin(x) + 2\cos(x)$. De primitieve is dus $F(x) = -x^{2}\cos(x) + 2x\sin(x) + 2\cos(x)$.`,
      invullen: r`Vul de grenzen in. Met $\cos(\pi) = -1$ en $\sin(\pi) = 0$ is $F(\pi) = \pi^{2} + 0 - 2 = \pi^{2} - 2$, en $F(0) = 0 + 0 + 2 = 2$. De integraal is $\left(\pi^{2} - 2\right) - 2 = \pi^{2} - 4$.`,
    }),
  },
  {
    cluster: 'k2b_bepaald_kwadraat',
    nummer: 'bep-2',
    level: 1,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{1} x^{2}\mathrm{e}^{x}\,\mathrm{d}x$`,
    antwoordLatex: r`\mathrm{e} - 2`,
    antwoord: 'e - 2',
    alts: ['-2 + e'],
    integrand: 'x^2 * e^x',
    primitieve: '(x^2 - 2 * x + 2) * e^x',
    grenzen: [0, 1],
    waarde: 'e - 2',
    steps: bepaald({
      schil: SCHIL.kwadraatE,
      keuze: r`Eerste ronde met $h'(x) = \mathrm{e}^{x}$ en $g(x) = x^{2}$, dus $g'(x) = 2x$: $\int x^{2}\mathrm{e}^{x}\,\mathrm{d}x = x^{2}\mathrm{e}^{x} - \int 2x\mathrm{e}^{x}\,\mathrm{d}x$.`,
      primitiveren: r`Tweede ronde op $\int 2x\mathrm{e}^{x}\,\mathrm{d}x = 2x\mathrm{e}^{x} - 2\mathrm{e}^{x}$. De primitieve is dus $F(x) = \left(x^{2} - 2x + 2\right)\mathrm{e}^{x}$.`,
      invullen: r`Vul de grenzen in: $F(1) = (1 - 2 + 2)\mathrm{e} = \mathrm{e}$ en $F(0) = 2 \cdot 1 = 2$. De integraal is $\mathrm{e} - 2$.`,
    }),
  },
  {
    cluster: 'k2b_bepaald_kwadraat',
    nummer: 'bep-3',
    level: 2,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{\frac{1}{2}\pi} x^{2}\cos(x)\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{4}\pi^{2} - 2`,
    antwoord: '1/4 pi^2 - 2',
    alts: ['pi^2/4 - 2', '-2 + pi^2/4'],
    integrand: 'x^2 * cos(x)',
    primitieve: 'x^2 * sin(x) + 2 * x * cos(x) - 2 * sin(x)',
    grenzen: [0, PI / 2],
    waarde: 'pi^2 / 4 - 2',
    steps: bepaald({
      schil: SCHIL.kwadraatGonio,
      keuze: r`Eerste ronde met $h'(x) = \cos(x)$, dus $h(x) = \sin(x)$, en $g(x) = x^{2}$, dus $g'(x) = 2x$: $\int x^{2}\cos(x)\,\mathrm{d}x = x^{2}\sin(x) - \int 2x\sin(x)\,\mathrm{d}x$.`,
      primitiveren: r`Tweede ronde op $\int 2x\sin(x)\,\mathrm{d}x = -2x\cos(x) + 2\sin(x)$. De primitieve is dus $F(x) = x^{2}\sin(x) + 2x\cos(x) - 2\sin(x)$.`,
      invullen: r`Vul de grenzen in. Met $\sin\left(\tfrac{1}{2}\pi\right) = 1$ en $\cos\left(\tfrac{1}{2}\pi\right) = 0$ is $F\left(\tfrac{1}{2}\pi\right) = \tfrac{1}{4}\pi^{2} + 0 - 2$, en $F(0) = 0$. De integraal is $\tfrac{1}{4}\pi^{2} - 2$.`,
    }),
  },
  {
    cluster: 'k2b_bepaald_kwadraat',
    nummer: 'bep-4',
    level: 2,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{1} x^{2}\mathrm{e}^{2x}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{4}\left(\mathrm{e}^{2} - 1\right)`,
    antwoord: '1/4 (e^2 - 1)',
    alts: ['(e^2 - 1)/4', '1/4 e^2 - 1/4'],
    integrand: 'x^2 * e^(2 * x)',
    primitieve: 'x^2 * e^(2 * x) / 2 - x * e^(2 * x) / 2 + e^(2 * x) / 4',
    grenzen: [0, 1],
    waarde: '(e^2 - 1) / 4',
    steps: bepaald({
      schil: SCHIL.kwadraatE,
      keuze: r`Eerste ronde met $h'(x) = \mathrm{e}^{2x}$, dus $h(x) = \tfrac{1}{2}\mathrm{e}^{2x}$, en $g(x) = x^{2}$: $\int x^{2}\mathrm{e}^{2x}\,\mathrm{d}x = \tfrac{1}{2}x^{2}\mathrm{e}^{2x} - \int x\mathrm{e}^{2x}\,\mathrm{d}x$.`,
      primitiveren: r`Tweede ronde op $\int x\mathrm{e}^{2x}\,\mathrm{d}x = \tfrac{1}{2}x\mathrm{e}^{2x} - \tfrac{1}{4}\mathrm{e}^{2x}$. De primitieve is dus $F(x) = \tfrac{1}{2}x^{2}\mathrm{e}^{2x} - \tfrac{1}{2}x\mathrm{e}^{2x} + \tfrac{1}{4}\mathrm{e}^{2x}$.`,
      invullen: r`Vul de grenzen in: $F(1) = \tfrac{1}{2}\mathrm{e}^{2} - \tfrac{1}{2}\mathrm{e}^{2} + \tfrac{1}{4}\mathrm{e}^{2} = \tfrac{1}{4}\mathrm{e}^{2}$ en $F(0) = \tfrac{1}{4}$. De integraal is $\tfrac{1}{4}\mathrm{e}^{2} - \tfrac{1}{4} = \tfrac{1}{4}\left(\mathrm{e}^{2} - 1\right)$.`,
    }),
  },
  {
    cluster: 'k2b_bepaald_kwadraat',
    nummer: 'bep-5',
    level: 3,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{\frac{1}{2}\pi} x^{2}\sin(2x)\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{8}\pi^{2} - \tfrac{1}{2}`,
    antwoord: '1/8 pi^2 - 1/2',
    alts: ['pi^2/8 - 1/2', '(pi^2 - 4)/8'],
    integrand: 'x^2 * sin(2 * x)',
    primitieve: '-x^2 * cos(2 * x) / 2 + x * sin(2 * x) / 2 + cos(2 * x) / 4',
    grenzen: [0, PI / 2],
    waarde: 'pi^2 / 8 - 1 / 2',
    steps: bepaald({
      schil: SCHIL.kwadraatGonio,
      keuze: r`Eerste ronde met $h'(x) = \sin(2x)$, dus $h(x) = -\tfrac{1}{2}\cos(2x)$, en $g(x) = x^{2}$: $\int x^{2}\sin(2x)\,\mathrm{d}x = -\tfrac{1}{2}x^{2}\cos(2x) + \int x\cos(2x)\,\mathrm{d}x$.`,
      primitiveren: r`Tweede ronde op $\int x\cos(2x)\,\mathrm{d}x = \tfrac{1}{2}x\sin(2x) + \tfrac{1}{4}\cos(2x)$. De primitieve is dus $F(x) = -\tfrac{1}{2}x^{2}\cos(2x) + \tfrac{1}{2}x\sin(2x) + \tfrac{1}{4}\cos(2x)$.`,
      invullen: r`Let op de dubbele hoek: bij $x = \tfrac{1}{2}\pi$ is $2x = \pi$, dus $\cos(2x) = -1$ en $\sin(2x) = 0$. Dan is $F\left(\tfrac{1}{2}\pi\right) = \tfrac{1}{8}\pi^{2} + 0 - \tfrac{1}{4}$, en $F(0) = \tfrac{1}{4}$. De integraal is $\tfrac{1}{8}\pi^{2} - \tfrac{1}{2}$.`,
    }),
  },
  {
    cluster: 'k2b_bepaald_kwadraat',
    nummer: 'bep-6',
    level: 3,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{1} x^{2}\mathrm{e}^{-x}\,\mathrm{d}x$`,
    antwoordLatex: r`2 - \dfrac{5}{\mathrm{e}}`,
    antwoord: '2 - 5/e',
    alts: ['2 - 5e^(-1)', '-5/e + 2'],
    integrand: 'x^2 * e^(-x)',
    primitieve: '-(x^2 + 2 * x + 2) * e^(-x)',
    grenzen: [0, 1],
    waarde: '2 - 5 / e',
    steps: bepaald({
      schil: SCHIL.kwadraatE,
      keuze: r`Eerste ronde met $h'(x) = \mathrm{e}^{-x}$, dus $h(x) = -\mathrm{e}^{-x}$, en $g(x) = x^{2}$, dus $g'(x) = 2x$: $\int x^{2}\mathrm{e}^{-x}\,\mathrm{d}x = -x^{2}\mathrm{e}^{-x} + \int 2x\mathrm{e}^{-x}\,\mathrm{d}x$.`,
      primitiveren: r`Tweede ronde op $\int 2x\mathrm{e}^{-x}\,\mathrm{d}x = -2x\mathrm{e}^{-x} - 2\mathrm{e}^{-x}$. De primitieve is dus $F(x) = -\left(x^{2} + 2x + 2\right)\mathrm{e}^{-x}$.`,
      invullen: r`Vul de grenzen in: $F(1) = -(1 + 2 + 2)\mathrm{e}^{-1} = -\dfrac{5}{\mathrm{e}}$ en $F(0) = -2$. De integraal is $-\dfrac{5}{\mathrm{e}} + 2 = 2 - \dfrac{5}{\mathrm{e}}$.`,
    }),
  },

  // ── Bepaalde integralen: de integraal komt terug ──────────────────────────
  {
    cluster: 'k2b_bepaald_terugkomen',
    nummer: 'bepterug-1',
    level: 1,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{\pi} \mathrm{e}^{x}\sin(x)\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{2}\left(\mathrm{e}^{\pi} + 1\right)`,
    antwoord: '1/2 (e^pi + 1)',
    alts: ['(e^pi + 1)/2', '1/2 e^pi + 1/2'],
    integrand: 'e^x * sin(x)',
    primitieve: 'e^x * (sin(x) - cos(x)) / 2',
    domein: [0, 3.5],
    grenzen: [0, PI],
    waarde: '(e^pi + 1) / 2',
    steps: bepaald({
      schil: SCHIL.terug,
      keuze: r`Kies $h'(x) = \mathrm{e}^{x}$ en $g(x) = \sin(x)$, en houd die keuze in de tweede ronde vol.`,
      primitiveren: r`Na twee rondes staat er $I = \mathrm{e}^{x}\sin(x) - \mathrm{e}^{x}\cos(x) - I$. ${TRUC} Dat geeft $2I = \mathrm{e}^{x}\left(\sin(x) - \cos(x)\right)$, dus $F(x) = \tfrac{1}{2}\mathrm{e}^{x}\left(\sin(x) - \cos(x)\right)$.`,
      invullen: r`Vul de grenzen in. Met $\sin(\pi) = 0$ en $\cos(\pi) = -1$ is $F(\pi) = \tfrac{1}{2}\mathrm{e}^{\pi}(0 + 1) = \tfrac{1}{2}\mathrm{e}^{\pi}$, en $F(0) = \tfrac{1}{2}(0 - 1) = -\tfrac{1}{2}$. De integraal is $\tfrac{1}{2}\mathrm{e}^{\pi} + \tfrac{1}{2} = \tfrac{1}{2}\left(\mathrm{e}^{\pi} + 1\right)$.`,
    }),
  },
  {
    cluster: 'k2b_bepaald_terugkomen',
    nummer: 'bepterug-2',
    level: 1,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{\frac{1}{2}\pi} \mathrm{e}^{x}\cos(x)\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{2}\mathrm{e}^{\frac{1}{2}\pi} - \tfrac{1}{2}`,
    antwoord: '1/2 e^(pi/2) - 1/2',
    alts: ['(e^(pi/2) - 1)/2', '1/2 (e^(1/2 pi) - 1)'],
    integrand: 'e^x * cos(x)',
    primitieve: 'e^x * (sin(x) + cos(x)) / 2',
    domein: [0, 2],
    grenzen: [0, PI / 2],
    waarde: 'e^(pi / 2) / 2 - 1 / 2',
    steps: bepaald({
      schil: SCHIL.terug,
      keuze: r`Kies $h'(x) = \mathrm{e}^{x}$ en $g(x) = \cos(x)$, dus $g'(x) = -\sin(x)$, en houd die keuze vol.`,
      primitiveren: r`Na twee rondes staat er $I = \mathrm{e}^{x}\cos(x) + \mathrm{e}^{x}\sin(x) - I$. ${TRUC} Dat geeft $2I = \mathrm{e}^{x}\left(\sin(x) + \cos(x)\right)$, dus $F(x) = \tfrac{1}{2}\mathrm{e}^{x}\left(\sin(x) + \cos(x)\right)$.`,
      invullen: r`Vul de grenzen in. Met $\sin\left(\tfrac{1}{2}\pi\right) = 1$ en $\cos\left(\tfrac{1}{2}\pi\right) = 0$ is $F\left(\tfrac{1}{2}\pi\right) = \tfrac{1}{2}\mathrm{e}^{\frac{1}{2}\pi}$, en $F(0) = \tfrac{1}{2}(0 + 1) = \tfrac{1}{2}$. De integraal is $\tfrac{1}{2}\mathrm{e}^{\frac{1}{2}\pi} - \tfrac{1}{2}$.`,
    }),
  },
  {
    cluster: 'k2b_bepaald_terugkomen',
    nummer: 'bepterug-3',
    level: 2,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{\pi} \mathrm{e}^{2x}\sin(x)\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{5}\left(\mathrm{e}^{2\pi} + 1\right)`,
    antwoord: '1/5 (e^(2pi) + 1)',
    alts: ['(e^(2pi) + 1)/5'],
    integrand: 'e^(2 * x) * sin(x)',
    primitieve: 'e^(2 * x) * (2 * sin(x) - cos(x)) / 5',
    domein: [0, 3.5],
    grenzen: [0, PI],
    waarde: '(e^(2 * pi) + 1) / 5',
    steps: bepaald({
      schil: SCHIL.terug,
      keuze: r`Kies $h'(x) = \mathrm{e}^{2x}$, dus $h(x) = \tfrac{1}{2}\mathrm{e}^{2x}$, en $g(x) = \sin(x)$.`,
      primitiveren: r`Na twee rondes staat er $I = \tfrac{1}{2}\mathrm{e}^{2x}\sin(x) - \tfrac{1}{4}\mathrm{e}^{2x}\cos(x) - \tfrac{1}{4}I$. ${TRUC} Uit $\tfrac{5}{4}I = \tfrac{1}{4}\mathrm{e}^{2x}\left(2\sin(x) - \cos(x)\right)$ volgt $F(x) = \tfrac{1}{5}\mathrm{e}^{2x}\left(2\sin(x) - \cos(x)\right)$.`,
      invullen: r`Vul de grenzen in: $F(\pi) = \tfrac{1}{5}\mathrm{e}^{2\pi}(0 + 1) = \tfrac{1}{5}\mathrm{e}^{2\pi}$ en $F(0) = \tfrac{1}{5}(0 - 1) = -\tfrac{1}{5}$. De integraal is $\tfrac{1}{5}\mathrm{e}^{2\pi} + \tfrac{1}{5} = \tfrac{1}{5}\left(\mathrm{e}^{2\pi} + 1\right)$.`,
    }),
  },
  {
    cluster: 'k2b_bepaald_terugkomen',
    nummer: 'bepterug-4',
    level: 2,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{\frac{1}{4}\pi} \mathrm{e}^{x}\cos(2x)\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{5}\left(2\mathrm{e}^{\frac{1}{4}\pi} - 1\right)`,
    antwoord: '1/5 (2e^(pi/4) - 1)',
    alts: ['(2e^(pi/4) - 1)/5'],
    integrand: 'e^x * cos(2 * x)',
    primitieve: 'e^x * (cos(2 * x) + 2 * sin(2 * x)) / 5',
    domein: [0, 2],
    grenzen: [0, PI / 4],
    waarde: '(2 * e^(pi / 4) - 1) / 5',
    steps: bepaald({
      schil: SCHIL.terug,
      keuze: r`Kies $h'(x) = \mathrm{e}^{x}$ en $g(x) = \cos(2x)$, dus $g'(x) = -2\sin(2x)$.`,
      primitiveren: r`Na twee rondes staat er $I = \mathrm{e}^{x}\cos(2x) + 2\mathrm{e}^{x}\sin(2x) - 4I$. ${TRUC} Uit $5I = \mathrm{e}^{x}\left(\cos(2x) + 2\sin(2x)\right)$ volgt $F(x) = \tfrac{1}{5}\mathrm{e}^{x}\left(\cos(2x) + 2\sin(2x)\right)$.`,
      invullen: r`Bij $x = \tfrac{1}{4}\pi$ is $2x = \tfrac{1}{2}\pi$, dus $\cos(2x) = 0$ en $\sin(2x) = 1$: $F\left(\tfrac{1}{4}\pi\right) = \tfrac{2}{5}\mathrm{e}^{\frac{1}{4}\pi}$. En $F(0) = \tfrac{1}{5}(1 + 0) = \tfrac{1}{5}$. De integraal is $\tfrac{2}{5}\mathrm{e}^{\frac{1}{4}\pi} - \tfrac{1}{5} = \tfrac{1}{5}\left(2\mathrm{e}^{\frac{1}{4}\pi} - 1\right)$.`,
    }),
  },
  {
    cluster: 'k2b_bepaald_terugkomen',
    nummer: 'bepterug-5',
    level: 3,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{\pi} \mathrm{e}^{-x}\sin(2x)\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{2}{5}\left(1 - \mathrm{e}^{-\pi}\right)`,
    antwoord: '2/5 (1 - e^(-pi))',
    alts: ['(2 - 2e^(-pi))/5', '2/5 - 2/(5e^pi)'],
    integrand: 'e^(-x) * sin(2 * x)',
    primitieve: '-e^(-x) * (sin(2 * x) + 2 * cos(2 * x)) / 5',
    domein: [0, 3.5],
    grenzen: [0, PI],
    waarde: '2 * (1 - e^(-pi)) / 5',
    steps: bepaald({
      schil: SCHIL.terug,
      keuze: r`Kies $h'(x) = \mathrm{e}^{-x}$, dus $h(x) = -\mathrm{e}^{-x}$, en $g(x) = \sin(2x)$, dus $g'(x) = 2\cos(2x)$.`,
      primitiveren: r`Na twee rondes staat er $I = -\mathrm{e}^{-x}\sin(2x) - 2\mathrm{e}^{-x}\cos(2x) - 4I$. ${TRUC} Uit $5I = -\mathrm{e}^{-x}\left(\sin(2x) + 2\cos(2x)\right)$ volgt $F(x) = -\tfrac{1}{5}\mathrm{e}^{-x}\left(\sin(2x) + 2\cos(2x)\right)$.`,
      invullen: r`Bij $x = \pi$ is $2x = 2\pi$, dus $\sin(2x) = 0$ en $\cos(2x) = 1$: $F(\pi) = -\tfrac{2}{5}\mathrm{e}^{-\pi}$. En $F(0) = -\tfrac{1}{5}(0 + 2) = -\tfrac{2}{5}$. De integraal is $-\tfrac{2}{5}\mathrm{e}^{-\pi} + \tfrac{2}{5} = \tfrac{2}{5}\left(1 - \mathrm{e}^{-\pi}\right)$.`,
    }),
  },
  {
    cluster: 'k2b_bepaald_terugkomen',
    nummer: 'bepterug-6',
    level: 3,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{\frac{1}{4}\pi} \mathrm{e}^{3x}\cos(2x)\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{1}{13}\left(2\mathrm{e}^{\frac{3}{4}\pi} - 3\right)`,
    antwoord: '1/13 (2e^(3pi/4) - 3)',
    alts: ['(2e^(3pi/4) - 3)/13'],
    integrand: 'e^(3 * x) * cos(2 * x)',
    primitieve: 'e^(3 * x) * (3 * cos(2 * x) + 2 * sin(2 * x)) / 13',
    domein: [0, 1],
    grenzen: [0, PI / 4],
    waarde: '(2 * e^(3 * pi / 4) - 3) / 13',
    steps: bepaald({
      schil: SCHIL.terug,
      keuze: r`Kies $h'(x) = \mathrm{e}^{3x}$, dus $h(x) = \tfrac{1}{3}\mathrm{e}^{3x}$, en $g(x) = \cos(2x)$, dus $g'(x) = -2\sin(2x)$.`,
      primitiveren: r`Na twee rondes staat er $I = \tfrac{1}{3}\mathrm{e}^{3x}\cos(2x) + \tfrac{2}{9}\mathrm{e}^{3x}\sin(2x) - \tfrac{4}{9}I$. ${TRUC} Uit $\tfrac{13}{9}I = \tfrac{1}{9}\mathrm{e}^{3x}\left(3\cos(2x) + 2\sin(2x)\right)$ volgt $F(x) = \tfrac{1}{13}\mathrm{e}^{3x}\left(3\cos(2x) + 2\sin(2x)\right)$.`,
      invullen: r`Bij $x = \tfrac{1}{4}\pi$ is $2x = \tfrac{1}{2}\pi$, dus $\cos(2x) = 0$ en $\sin(2x) = 1$: $F\left(\tfrac{1}{4}\pi\right) = \tfrac{2}{13}\mathrm{e}^{\frac{3}{4}\pi}$. En $F(0) = \tfrac{3}{13}$. De integraal is $\tfrac{2}{13}\mathrm{e}^{\frac{3}{4}\pi} - \tfrac{3}{13} = \tfrac{1}{13}\left(2\mathrm{e}^{\frac{3}{4}\pi} - 3\right)$.`,
    }),
  },

  // ── Oppervlakte en p bepalen ──────────────────────────────────────────────
  {
    cluster: 'k2b_opp',
    nummer: 'opp-1',
    level: 1,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = x^{2}\mathrm{e}^{-x}$, de $x$-as, de $y$-as en de lijn $x = 2$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`2 - \dfrac{10}{\mathrm{e}^{2}}`,
    antwoord: '2 - 10/e^2',
    alts: ['2 - 10e^(-2)', '-10/e^2 + 2'],
    integrand: 'x^2 * e^(-x)',
    primitieve: '-(x^2 + 2 * x + 2) * e^(-x)',
    grenzen: [0, 2],
    waarde: '2 - 10 / e^2',
    steps: toepassing({
      deel1: r`Deel 1 van de driedeling: $x^{2}$ is nooit negatief en $\mathrm{e}^{-x}$ is altijd positief, dus de grafiek ligt op $[0, 2]$ boven de $x$-as. De oppervlakte is $\displaystyle\int_{0}^{2} x^{2}\mathrm{e}^{-x}\,\mathrm{d}x$.`,
      keuze: r`Deel 2: een veelterm van graad 2 maal een e-macht → twee keer partieel integreren. Eerste ronde met $h'(x) = \mathrm{e}^{-x}$, dus $h(x) = -\mathrm{e}^{-x}$, en $g(x) = x^{2}$, dus $g'(x) = 2x$: $\int x^{2}\mathrm{e}^{-x}\,\mathrm{d}x = -x^{2}\mathrm{e}^{-x} + \int 2x\mathrm{e}^{-x}\,\mathrm{d}x$.`,
      primitiveren: r`Tweede ronde op $\int 2x\mathrm{e}^{-x}\,\mathrm{d}x = -2x\mathrm{e}^{-x} - 2\mathrm{e}^{-x}$. De primitieve is $F(x) = -\left(x^{2} + 2x + 2\right)\mathrm{e}^{-x}$.`,
      afronden: r`Vul de grenzen in: $F(2) = -(4 + 4 + 2)\mathrm{e}^{-2} = -\dfrac{10}{\mathrm{e}^{2}}$ en $F(0) = -2$. De oppervlakte is $-\dfrac{10}{\mathrm{e}^{2}} + 2 = 2 - \dfrac{10}{\mathrm{e}^{2}}$.`,
    }),
  },
  {
    cluster: 'k2b_opp',
    nummer: 'opp-2',
    level: 1,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \left(x^{2} + 2x\right)\mathrm{e}^{x}$, de $x$-as en de lijn $x = 1$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\mathrm{e}`,
    antwoord: 'e',
    alts: ['e^1'],
    integrand: '(x^2 + 2 * x) * e^x',
    primitieve: 'x^2 * e^x',
    grenzen: [0, 1],
    waarde: 'e',
    steps: toepassing({
      deel1: r`Deel 1 van de driedeling: $f(x) = x(x + 2)\mathrm{e}^{x}$ is nul bij $x = 0$ en $x = -2$, want $\mathrm{e}^{x}$ is nooit nul. De grafiek sluit samen met de lijn $x = 1$ het stuk tussen $x = 0$ en $x = 1$ in, en daar is $f$ positief. De oppervlakte is $\displaystyle\int_{0}^{1} \left(x^{2} + 2x\right)\mathrm{e}^{x}\,\mathrm{d}x$.`,
      keuze: r`Deel 2: een veelterm van graad 2 maal een e-macht → twee keer partieel integreren. Eerste ronde met $h'(x) = \mathrm{e}^{x}$ en $g(x) = x^{2} + 2x$, dus $g'(x) = 2x + 2$: $\int \left(x^{2} + 2x\right)\mathrm{e}^{x}\,\mathrm{d}x = \left(x^{2} + 2x\right)\mathrm{e}^{x} - \int (2x + 2)\mathrm{e}^{x}\,\mathrm{d}x$.`,
      primitiveren: r`Tweede ronde op $\int (2x + 2)\mathrm{e}^{x}\,\mathrm{d}x = (2x + 2)\mathrm{e}^{x} - \int 2\mathrm{e}^{x}\,\mathrm{d}x = (2x)\mathrm{e}^{x}$. Dus $F(x) = \left(x^{2} + 2x\right)\mathrm{e}^{x} - 2x\mathrm{e}^{x} = x^{2}\mathrm{e}^{x}$ — verrassend kort. Controle: differentiëren geeft $2x\mathrm{e}^{x} + x^{2}\mathrm{e}^{x} = \left(x^{2} + 2x\right)\mathrm{e}^{x}$.`,
      afronden: r`Vul de grenzen in: $F(1) = 1 \cdot \mathrm{e} = \mathrm{e}$ en $F(0) = 0$. De oppervlakte is $\mathrm{e}$.`,
    }),
  },
  {
    cluster: 'k2b_opp',
    nummer: 'opp-3',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \mathrm{e}^{-x}\cos(x)$, de $x$-as en de $y$-as, op $\left[0, \tfrac{1}{2}\pi\right]$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\tfrac{1}{2}\mathrm{e}^{-\frac{1}{2}\pi} + \tfrac{1}{2}`,
    antwoord: '1/2 e^(-pi/2) + 1/2',
    alts: ['(e^(-pi/2) + 1)/2', '1/2 + 1/(2e^(pi/2))'],
    integrand: 'e^(-x) * cos(x)',
    primitieve: 'e^(-x) * (sin(x) - cos(x)) / 2',
    domein: [0, 2],
    grenzen: [0, PI / 2],
    waarde: 'e^(-pi / 2) / 2 + 1 / 2',
    steps: toepassing({
      deel1: r`Deel 1 van de driedeling: op $\left[0, \tfrac{1}{2}\pi\right]$ is $\cos(x) \geq 0$ en $\mathrm{e}^{-x} > 0$, dus de grafiek ligt boven de $x$-as; bij $x = \tfrac{1}{2}\pi$ raakt hij de $x$-as. De oppervlakte is $\displaystyle\int_{0}^{\frac{1}{2}\pi} \mathrm{e}^{-x}\cos(x)\,\mathrm{d}x$.`,
      keuze: r`Deel 2: een e-macht maal een gonio → twee keer partieel integreren en de integraal komt terug. Kies $h'(x) = \mathrm{e}^{-x}$, dus $h(x) = -\mathrm{e}^{-x}$, en $g(x) = \cos(x)$, dus $g'(x) = -\sin(x)$.`,
      primitiveren: r`Na twee rondes staat er $I = -\mathrm{e}^{-x}\cos(x) + \mathrm{e}^{-x}\sin(x) - I$. ${TRUC} Uit $2I = \mathrm{e}^{-x}\left(\sin(x) - \cos(x)\right)$ volgt $F(x) = \tfrac{1}{2}\mathrm{e}^{-x}\left(\sin(x) - \cos(x)\right)$.`,
      afronden: r`Vul de grenzen in: $F\left(\tfrac{1}{2}\pi\right) = \tfrac{1}{2}\mathrm{e}^{-\frac{1}{2}\pi}(1 - 0) = \tfrac{1}{2}\mathrm{e}^{-\frac{1}{2}\pi}$ en $F(0) = \tfrac{1}{2}(0 - 1) = -\tfrac{1}{2}$. De oppervlakte is $\tfrac{1}{2}\mathrm{e}^{-\frac{1}{2}\pi} + \tfrac{1}{2}$.`,
    }),
  },
  {
    cluster: 'k2b_opp',
    nummer: 'opp-4',
    level: 2,
    latex: r`Het vlakdeel $V$ ligt tussen de grafiek van $f(x) = x^{2}\cos(x)$ en de $x$-as op $\left[\tfrac{1}{2}\pi, \pi\right]$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\tfrac{1}{4}\pi^{2} + 2\pi - 2`,
    antwoord: '1/4 pi^2 + 2pi - 2',
    alts: ['pi^2/4 + 2pi - 2', '-2 + 2pi + pi^2/4'],
    integrand: 'x^2 * cos(x)',
    primitieve: 'x^2 * sin(x) + 2 * x * cos(x) - 2 * sin(x)',
    domein: [1, 3.5],
    grenzen: [PI / 2, PI],
    waarde: '-(pi^2 / 4 + 2 * pi - 2)',
    steps: toepassing({
      deel1: r`Deel 1 van de driedeling: op $\left[\tfrac{1}{2}\pi, \pi\right]$ is $\cos(x) \leq 0$ en $x^{2} > 0$, dus de grafiek ligt ónder de $x$-as. De oppervlakte is dan $-\displaystyle\int_{\frac{1}{2}\pi}^{\pi} x^{2}\cos(x)\,\mathrm{d}x$.`,
      keuze: r`Deel 2: een veelterm van graad 2 maal een gonio → twee keer partieel integreren. Eerste ronde met $h'(x) = \cos(x)$, dus $h(x) = \sin(x)$, en $g(x) = x^{2}$: $\int x^{2}\cos(x)\,\mathrm{d}x = x^{2}\sin(x) - \int 2x\sin(x)\,\mathrm{d}x$.`,
      primitiveren: r`Tweede ronde op $\int 2x\sin(x)\,\mathrm{d}x = -2x\cos(x) + 2\sin(x)$. De primitieve is $F(x) = x^{2}\sin(x) + 2x\cos(x) - 2\sin(x)$.`,
      afronden: r`Vul de grenzen in: $F(\pi) = 0 - 2\pi - 0 = -2\pi$ en $F\left(\tfrac{1}{2}\pi\right) = \tfrac{1}{4}\pi^{2} + 0 - 2$. De integraal is $-2\pi - \tfrac{1}{4}\pi^{2} + 2$, en dat is negatief. De oppervlakte is het tegengestelde: $\tfrac{1}{4}\pi^{2} + 2\pi - 2$.`,
    }),
  },
  {
    cluster: 'k2b_opp',
    nummer: 'opp-5',
    level: 3,
    latex: r`De grafiek van $f(x) = \left(x^{2} + 2x\right)\mathrm{e}^{x}$, de $x$-as en de lijn $x = p$ met $p > 0$ sluiten een vlakdeel in met oppervlakte $4\mathrm{e}^{2}$. Bereken exact $p$.`,
    antwoordLatex: r`p = 2`,
    antwoord: '2',
    alts: ['p = 2'],
    integrand: '(x^2 + 2 * x) * e^x',
    primitieve: 'x^2 * e^x',
    grenzen: [0, 2],
    waarde: '4 * e^2',
    steps: toepassing({
      deel1: r`Deel 1 van de driedeling: $f(x) = x(x + 2)\mathrm{e}^{x}$ snijdt de $x$-as bij $x = 0$ en $x = -2$. Voor $x > 0$ ligt de grafiek erboven, dus de oppervlakte is $\displaystyle\int_{0}^{p} \left(x^{2} + 2x\right)\mathrm{e}^{x}\,\mathrm{d}x$, en die moet $4\mathrm{e}^{2}$ worden.`,
      keuze: r`Deel 2: een veelterm van graad 2 maal een e-macht → twee keer partieel integreren. Eerste ronde met $h'(x) = \mathrm{e}^{x}$ en $g(x) = x^{2} + 2x$, dus $g'(x) = 2x + 2$: er blijft $\int (2x + 2)\mathrm{e}^{x}\,\mathrm{d}x$ over.`,
      primitiveren: r`Tweede ronde op $\int (2x + 2)\mathrm{e}^{x}\,\mathrm{d}x = (2x + 2)\mathrm{e}^{x} - 2\mathrm{e}^{x} = 2x\mathrm{e}^{x}$. Dus $F(x) = \left(x^{2} + 2x\right)\mathrm{e}^{x} - 2x\mathrm{e}^{x} = x^{2}\mathrm{e}^{x}$. Invullen van de grenzen geeft $\left[x^{2}\mathrm{e}^{x}\right]_{0}^{p} = p^{2}\mathrm{e}^{p}$.`,
      afronden: r`Deel 3: los de vergelijking op. Uit $p^{2}\mathrm{e}^{p} = 4\mathrm{e}^{2}$ zie je dat $p = 2$ voldoet, want $2^{2}\mathrm{e}^{2} = 4\mathrm{e}^{2}$. Omdat $p^{2}\mathrm{e}^{p}$ voor $p > 0$ alleen maar stijgt, is dat de enige oplossing: $p = 2$.`,
    }),
  },
  {
    cluster: 'k2b_opp',
    nummer: 'opp-6',
    level: 3,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \left(x^{2} - 1\right)\mathrm{e}^{x}$ en de $x$-as. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\dfrac{4}{\mathrm{e}}`,
    antwoord: '4/e',
    alts: ['4e^(-1)'],
    integrand: '(x^2 - 1) * e^x',
    primitieve: '(x - 1)^2 * e^x',
    grenzen: [-1, 1],
    waarde: '-4 / e',
    steps: toepassing({
      deel1: r`Deel 1 van de driedeling: $\mathrm{e}^{x}$ is nooit nul, dus de grafiek snijdt de $x$-as waar $x^{2} - 1 = 0$, dus bij $x = -1$ en $x = 1$. Daartussen is $x^{2} - 1$ negatief, dus ligt de grafiek ónder de $x$-as. De oppervlakte is $-\displaystyle\int_{-1}^{1} \left(x^{2} - 1\right)\mathrm{e}^{x}\,\mathrm{d}x$.`,
      keuze: r`Deel 2: een veelterm van graad 2 maal een e-macht → twee keer partieel integreren. Eerste ronde met $h'(x) = \mathrm{e}^{x}$ en $g(x) = x^{2} - 1$, dus $g'(x) = 2x$: $\int \left(x^{2} - 1\right)\mathrm{e}^{x}\,\mathrm{d}x = \left(x^{2} - 1\right)\mathrm{e}^{x} - \int 2x\mathrm{e}^{x}\,\mathrm{d}x$.`,
      primitiveren: r`Tweede ronde op $\int 2x\mathrm{e}^{x}\,\mathrm{d}x = 2x\mathrm{e}^{x} - 2\mathrm{e}^{x}$. Dus $F(x) = \left(x^{2} - 2x + 1\right)\mathrm{e}^{x} = (x - 1)^{2}\mathrm{e}^{x}$. Controle: differentiëren geeft $2(x - 1)\mathrm{e}^{x} + (x - 1)^{2}\mathrm{e}^{x} = (x - 1)(x + 1)\mathrm{e}^{x} = \left(x^{2} - 1\right)\mathrm{e}^{x}$.`,
      afronden: r`Vul de grenzen in: $F(1) = 0$ en $F(-1) = 4\mathrm{e}^{-1} = \dfrac{4}{\mathrm{e}}$. De integraal is $0 - \dfrac{4}{\mathrm{e}} = -\dfrac{4}{\mathrm{e}}$, dus negatief. De oppervlakte is het tegengestelde: $\dfrac{4}{\mathrm{e}}$.`,
    }),
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Hoofdstuk, topics en clusters
// ─────────────────────────────────────────────────────────────────────────────

const K2B: AdditiveChapter = {
  chapterSlug: 'k',
  chapterTitle: 'K — Voortgezette integraalrekening',
  bookPart: 4,
  chapterOrder: 12,
  site: 'integralen',
  migrationFile: '0038_k2b_herhaald_partieel.sql',
  headerTitle: 'K.2 Theorie B — Herhaald partieel integreren',
  sourceScript: 'scripts/k2b-content.ts',
  headerNotes: [
    'Theorieblok B van K.2: twee keer achter elkaar partieel integreren. Dat',
    'gebeurt in twee gedaanten: een veelterm van graad 2 zakt per ronde een graad,',
    'en bij een e-macht maal een gonio komt de oorspronkelijke integraal na twee',
    'rondes terug — die haal je naar een kant en deel je weg.',
    '',
    'Eigen oefenvragen, geen boekopgaven. Elke primitieve wordt nagerekend door',
    'src/content/primitieven.test.ts (content/hoofdstuk-k/k2b.json).',
  ],
  topics: [
    { slug: 'k2b_herhaald', title: 'Twee keer partieel integreren', order: 13, category: 'primitiveren' },
    { slug: 'k2b_bepaald', title: 'Bepaalde integralen met herhaald partieel integreren', order: 14, category: 'integralen' },
    { slug: 'k2b_toepassingen', title: 'Oppervlakte met herhaald partieel integreren', order: 15, category: 'toepassingen' },
  ],
  clusters: [
    { topic: 'k2b_herhaald', slug: 'k2b_kwadraat_gonio', title: 'Een veelterm van graad 2 maal een sinus of cosinus', order: 1 },
    { topic: 'k2b_herhaald', slug: 'k2b_kwadraat_e', title: 'Een veelterm van graad 2 maal een e-macht', order: 2 },
    { topic: 'k2b_herhaald', slug: 'k2b_terugkomen', title: 'De integraal komt terug', order: 3 },
    { topic: 'k2b_bepaald', slug: 'k2b_bepaald_kwadraat', title: 'Bepaalde integralen met twee rondes', order: 1 },
    { topic: 'k2b_bepaald', slug: 'k2b_bepaald_terugkomen', title: 'Bepaalde integralen waarbij de integraal terugkomt', order: 2 },
    { topic: 'k2b_toepassingen', slug: 'k2b_opp', title: 'Oppervlakte en p bepalen', order: 1 },
  ],
  questions: VRAGEN,
}

// ─────────────────────────────────────────────────────────────────────────────
// Schrijven
// ─────────────────────────────────────────────────────────────────────────────

const wortel = process.cwd()

const contentPad = path.join(wortel, 'content', 'hoofdstuk-k', 'k2b.json')
writeFileSync(
  contentPad,
  generateContentFile(K2B, 'K.2 Theorie B — Herhaald partieel integreren (eigen varianten)'),
)

const migratiePad = path.join(wortel, 'supabase', 'migrations', K2B.migrationFile)
writeFileSync(migratiePad, generateAdditiveMigration(K2B))

console.log(`Geschreven: ${contentPad}`)
console.log(`Geschreven: ${migratiePad}`)
console.log(`Vragen: ${K2B.questions.length}, stappen: ${K2B.questions.length * 4}`)
