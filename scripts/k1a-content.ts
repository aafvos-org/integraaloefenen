/**
 * K.1 Theorie A — Primitiveren en de kettingregel.
 *
 * Eigen oefenvragen in de stijl van dit theorieblok: de omgekeerde
 * kettingregel. Je zoekt in de integrand een kern g(x) terug met ervóór een
 * factor die (op een constante na) gelijk is aan g'(x); dan is
 * g'(x) dx = d(g(x)) en hoef je alleen de buitenkant nog te primitiveren.
 * Geen boekopgaven; alles hieronder is nieuw bedacht.
 *
 * Draaien met:  npx jiti scripts/k1a-content.ts
 *
 * Schrijft twee bestanden:
 *   • content/hoofdstuk-k/k1a.json          — leest src/content/primitieven.test.ts
 *   • supabase/migrations/0035_k1a_kettingregel.sql — alleen rijen toevoegen
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
// Stap-sjablonen
//
// Elke vraag krijgt vier stappen (step_order 0 t/m 3). Stap 0 benoemt welk
// deel van de driedeling aan de orde is; bij een kale primitiveer-opgave is
// dat alleen deel 2: bereken de goede integraal. Bij de toepassingen spelen
// deel 1 (verhaaltje → integraal) en soms deel 3 (vergelijking oplossen) ook.
// ─────────────────────────────────────────────────────────────────────────────

const DEEL2 = r`Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal.`

/** De buitenste schil, per soort opgave steeds in dezelfde woorden. */
const SCHIL = {
  macht: r`Buitenste schil: een macht van een kern, met ervóór een factor met $x$ → omgekeerde kettingregel. Kijk of die factor de afgeleide van de kern is.`,
  wortel: r`Buitenste schil: een wortel van een kern, met ervóór een factor met $x$ → omgekeerde kettingregel. Schrijf de wortel als macht $\tfrac{1}{2}$.`,
  breuk: r`Buitenste schil: een breuk met een kern in de noemer → omgekeerde kettingregel. Is de teller een constante maal de afgeleide van de noemer, dan komt er $\ln$ uit.`,
  wortelNoemer: r`Buitenste schil: een breuk met een wortel van een kern in de noemer → omgekeerde kettingregel. Schrijf de wortel als macht $-\tfrac{1}{2}$.`,
  emacht: r`Buitenste schil: een e-macht met een kern in de exponent, met ervóór een factor met $x$ → omgekeerde kettingregel.`,
  gonio: r`Buitenste schil: een sinus of cosinus van een kern, met ervóór een factor met $x$ → omgekeerde kettingregel.`,
  logaritme: r`Buitenste schil: een $\ln$ van een kern, met ervóór een factor met $x$ → omgekeerde kettingregel. De buitenkant $\ln$ primitiveer je met $\int \ln(g)\,\mathrm{d}g = g\ln(g) - g$.`,
}

/**
 * Primitiveren met de omgekeerde kettingregel: schil, kern, factor kloppend
 * maken, buitenkant primitiveren.
 */
function ketting(s: { schil: string; kern: string; dKern: string; factor: string; buitenkant: string }): Steps {
  return [
    `${DEEL2} ${s.schil}`,
    r`Kies de kern: $g(x) = ${s.kern}$, dus $g'(x) = ${s.dKern}$.`,
    s.factor,
    s.buitenkant,
  ]
}

/** Invullen met de d(…)-notatie: welke functie staat op de puntjes? */
function differentiaal(s: { vorm: string; herken: string; primitiveer: string; antwoord: string }): Steps {
  return [
    `${DEEL2} ${r`De notatie $\mathrm{d}(G(x)) = G'(x)\,\mathrm{d}x$ draai je om: op de puntjes staat een functie die je differentieert tot wat er vóór de $\mathrm{d}x$ staat.`}`,
    s.herken,
    s.primitiveer,
    r`Op de puntjes staat $${s.antwoord}$: $${s.vorm}$. Controle: differentieer wat tussen de haakjes staat en je krijgt terug wat er vóór de $\mathrm{d}x$ staat; een losse constante erbij verandert daar niets aan.`,
  ]
}

/** Voor welke a lukt het primitiveren, en wat is dan de primitieve? */
function welkeA(s: { kern: string; dKern: string; vergelijk: string; buitenkant: string }): Steps {
  return [
    `${DEEL2} ${r`Buitenste schil: een kern met ervóór (of erboven) een factor met $x$ → omgekeerde kettingregel. Die factor moet een constante maal $g'(x)$ zijn; daar volgt $a$ uit.`}`,
    r`Kies de kern: $g(x) = ${s.kern}$, dus $g'(x) = ${s.dKern}$.`,
    s.vergelijk,
    s.buitenkant,
  ]
}

/** Toepassing: eerst de integraal opschrijven (deel 1), dan rekenen. */
function toepassing(s: { deel1: string; integraal: string; primitiveren: string; afronden: string }): Steps {
  return [`${s.deel1}`, s.integraal, s.primitiveren, s.afronden]
}

// ─────────────────────────────────────────────────────────────────────────────
// De vragen
// ─────────────────────────────────────────────────────────────────────────────

const VRAGEN: AdditiveQ[] = [
  // ── Invullen met de d(…)-notatie ───────────────────────────────────────────
  {
    cluster: 'k1a_differentiaal',
    nummer: 'differentiaal-1',
    level: 1,
    latex: r`Vul in: $4x^{3}\,\mathrm{d}x = \mathrm{d}(\ldots + 2)$`,
    antwoordLatex: r`x^{4}`,
    antwoord: 'x^4',
    integrand: '4 * x^3',
    primitieve: 'x^4',
    steps: differentiaal({
      vorm: r`4x^{3}\,\mathrm{d}x = \mathrm{d}(x^{4} + 2)`,
      herken: r`Vóór de $\mathrm{d}x$ staat $4x^{3}$: één losse macht, zonder kern.`,
      primitiveer: r`Primitiveer $4x^{3}$ met de machtsregel: $4 \cdot \tfrac{1}{4}x^{4} = x^{4}$.`,
      antwoord: r`x^{4}`,
    }),
  },
  {
    cluster: 'k1a_differentiaal',
    nummer: 'differentiaal-2',
    level: 1,
    latex: r`Vul in: $\cos(3x)\,\mathrm{d}x = \mathrm{d}(\ldots - 1)$`,
    antwoordLatex: r`\tfrac{1}{3}\sin(3x)`,
    antwoord: 'sin(3x)/3',
    alts: ['1/3sin(3x)', '0,333sin(3x)'],
    integrand: 'cos(3 * x)',
    primitieve: 'sin(3 * x) / 3',
    steps: differentiaal({
      vorm: r`\cos(3x)\,\mathrm{d}x = \mathrm{d}\left(\tfrac{1}{3}\sin(3x) - 1\right)`,
      herken: r`Vóór de $\mathrm{d}x$ staat $\cos(3x)$: een cosinus met de lineaire kern $3x$.`,
      primitiveer: r`De primitieve van $\cos(x)$ is $\sin(x)$; door de kern $3x$ komt er een factor $\tfrac{1}{3}$ bij: $\tfrac{1}{3}\sin(3x)$.`,
      antwoord: r`\tfrac{1}{3}\sin(3x)`,
    }),
  },
  {
    cluster: 'k1a_differentiaal',
    nummer: 'differentiaal-3',
    level: 2,
    latex: r`Vul in: $(6x + 2)\,\mathrm{d}x = \mathrm{d}(\ldots + \pi)$`,
    antwoordLatex: r`3x^{2} + 2x`,
    antwoord: '3x^2 + 2x',
    integrand: '6 * x + 2',
    primitieve: '3 * x^2 + 2 * x',
    steps: differentiaal({
      vorm: r`(6x + 2)\,\mathrm{d}x = \mathrm{d}(3x^{2} + 2x + \pi)`,
      herken: r`Vóór de $\mathrm{d}x$ staat $6x + 2$: twee losse termen, dus term voor term primitiveren.`,
      primitiveer: r`$6x$ geeft $3x^{2}$ en $2$ geeft $2x$.`,
      antwoord: r`3x^{2} + 2x`,
    }),
  },
  {
    cluster: 'k1a_differentiaal',
    nummer: 'differentiaal-4',
    level: 2,
    latex: r`Vul in: $6x\,\mathrm{e}^{3x^{2}}\,\mathrm{d}x = \mathrm{d}(\ldots)$`,
    antwoordLatex: r`\mathrm{e}^{3x^{2}}`,
    antwoord: 'e^(3x^2)',
    integrand: '6 * x * e^(3 * x^2)',
    primitieve: 'e^(3 * x^2)',
    domein: [-1.5, 1.5],
    steps: differentiaal({
      vorm: r`6x\,\mathrm{e}^{3x^{2}}\,\mathrm{d}x = \mathrm{d}\left(\mathrm{e}^{3x^{2}}\right)`,
      herken: r`Vóór de $\mathrm{d}x$ staat een e-macht met kern $3x^{2}$, en daarvóór de factor $6x$. De afgeleide van de kern is $6x$: dat past precies.`,
      primitiveer: r`Dus $6x\,\mathrm{d}x = \mathrm{d}(3x^{2})$ en $\int \mathrm{e}^{g}\,\mathrm{d}g = \mathrm{e}^{g}$, met $g = 3x^{2}$.`,
      antwoord: r`\mathrm{e}^{3x^{2}}`,
    }),
  },
  {
    cluster: 'k1a_differentiaal',
    nummer: 'differentiaal-5',
    level: 3,
    latex: r`Vul in: $\dfrac{2x}{x^{2} + 5}\,\mathrm{d}x = \mathrm{d}(\ldots + 4)$`,
    antwoordLatex: r`\ln(x^{2} + 5)`,
    antwoord: 'ln(x^2 + 5)',
    integrand: '2 * x / (x^2 + 5)',
    primitieve: 'ln(x^2 + 5)',
    steps: differentiaal({
      vorm: r`\dfrac{2x}{x^{2} + 5}\,\mathrm{d}x = \mathrm{d}\big(\ln(x^{2} + 5) + 4\big)`,
      herken: r`Vóór de $\mathrm{d}x$ staat een breuk met de kern $x^{2} + 5$ in de noemer. De afgeleide van die kern is $2x$ en dat is precies de teller.`,
      primitiveer: r`Dus $2x\,\mathrm{d}x = \mathrm{d}(x^{2} + 5)$ en $\int \dfrac{1}{g}\,\mathrm{d}g = \ln|g|$, met $g = x^{2} + 5$. Die kern is altijd positief, dus de strepen mogen weg.`,
      antwoord: r`\ln(x^{2} + 5)`,
    }),
  },
  {
    cluster: 'k1a_differentiaal',
    nummer: 'differentiaal-6',
    level: 3,
    latex: r`Vul in: $3x^{2}\sqrt{x^{3} + 1}\,\mathrm{d}x = \mathrm{d}(\ldots)$`,
    antwoordLatex: r`\tfrac{2}{3}(x^{3} + 1)\sqrt{x^{3} + 1}`,
    antwoord: '2/3 (x^3 + 1)sqrt(x^3 + 1)',
    alts: ['2/3(x^3 + 1)^(3/2)', '2(x^3 + 1)sqrt(x^3 + 1)/3'],
    integrand: '3 * x^2 * sqrt(x^3 + 1)',
    primitieve: '2 * (x^3 + 1) * sqrt(x^3 + 1) / 3',
    domein: [-0.5, 2],
    steps: differentiaal({
      vorm: r`3x^{2}\sqrt{x^{3} + 1}\,\mathrm{d}x = \mathrm{d}\left(\tfrac{2}{3}(x^{3} + 1)\sqrt{x^{3} + 1}\right)`,
      herken: r`Vóór de $\mathrm{d}x$ staat een wortel met kern $x^{3} + 1$, en daarvóór $3x^{2}$. De afgeleide van de kern is $3x^{2}$: dat past.`,
      primitiveer: r`Dus $3x^{2}\,\mathrm{d}x = \mathrm{d}(x^{3} + 1)$ en $\int g^{\frac{1}{2}}\,\mathrm{d}g = \tfrac{2}{3}g^{1\frac{1}{2}} = \tfrac{2}{3}g\sqrt{g}$, met $g = x^{3} + 1$.`,
      antwoord: r`\tfrac{2}{3}(x^{3} + 1)\sqrt{x^{3} + 1}`,
    }),
  },

  // ── Voor welke a lukt het? ─────────────────────────────────────────────────
  {
    cluster: 'k1a_welke_a',
    nummer: 'welke-a-1',
    level: 1,
    latex: r`Voor precies één waarde van $a$ lukt het primitiveren met de omgekeerde kettingregel: $f(x) = (6x + a)\cos(3x^{2} + x)$. Bepaal die $a$ en primitiveer $f$.`,
    antwoordLatex: r`F(x) = \sin(3x^{2} + x) + c`,
    antwoord: 'sin(3x^2 + x) + c',
    integrand: '(6 * x + 1) * cos(3 * x^2 + x)',
    primitieve: 'sin(3 * x^2 + x)',
    steps: welkeA({
      kern: r`3x^{2} + x`,
      dKern: r`6x + 1`,
      vergelijk: r`De factor vóór de cosinus is $6x + a$. Die moet gelijk zijn aan een constante maal $6x + 1$; bij de $x$-term staat al dezelfde $6$, dus die constante is $1$ en $a = 1$.`,
      buitenkant: r`Dan is $(6x + 1)\,\mathrm{d}x = \mathrm{d}(3x^{2} + x)$, dus $\int f(x)\,\mathrm{d}x = \int \cos(g)\,\mathrm{d}g = \sin(g)$. Terugschrijven: $F(x) = \sin(3x^{2} + x) + c$. Controle: differentiëren geeft $\cos(3x^{2} + x) \cdot (6x + 1)$.`,
    }),
  },
  {
    cluster: 'k1a_welke_a',
    nummer: 'welke-a-2',
    level: 1,
    latex: r`Voor precies één waarde van $a$ lukt het primitiveren met de omgekeerde kettingregel: $f(x) = (4x + a)(x^{2} + 3x)^{4}$. Bepaal die $a$ en primitiveer $f$.`,
    antwoordLatex: r`F(x) = \tfrac{2}{5}(x^{2} + 3x)^{5} + c`,
    antwoord: '2/5 (x^2 + 3x)^5 + c',
    alts: ['0,4(x^2 + 3x)^5 + c', '2(x^2 + 3x)^5/5 + c'],
    integrand: '(4 * x + 6) * (x^2 + 3 * x)^4',
    primitieve: '2 * (x^2 + 3 * x)^5 / 5',
    steps: welkeA({
      kern: r`x^{2} + 3x`,
      dKern: r`2x + 3`,
      vergelijk: r`De factor vóór de haakjes is $4x + a$. Die moet gelijk zijn aan een constante maal $2x + 3$: uit $4x = 2 \cdot 2x$ volgt de constante $2$, en dan is $a = 2 \cdot 3 = 6$.`,
      buitenkant: r`Dan is $\int f(x)\,\mathrm{d}x = \int 2(2x + 3)(x^{2} + 3x)^{4}\,\mathrm{d}x = \int 2g^{4}\,\mathrm{d}g = \tfrac{2}{5}g^{5}$. Terugschrijven: $F(x) = \tfrac{2}{5}(x^{2} + 3x)^{5} + c$. Controle: differentiëren geeft $2(x^{2} + 3x)^{4}(2x + 3) = (4x + 6)(x^{2} + 3x)^{4}$.`,
    }),
  },
  {
    cluster: 'k1a_welke_a',
    nummer: 'welke-a-3',
    level: 2,
    latex: r`Voor precies één waarde van $a$ lukt het primitiveren met de omgekeerde kettingregel: $f(x) = \dfrac{6x^{3} + a}{\sqrt{x^{4} + 2x}}$. Bepaal die $a$ en primitiveer $f$.`,
    antwoordLatex: r`F(x) = 3\sqrt{x^{4} + 2x} + c`,
    antwoord: '3sqrt(x^4 + 2x) + c',
    alts: ['3(x^4 + 2x)^(1/2) + c'],
    integrand: '(6 * x^3 + 3) / sqrt(x^4 + 2 * x)',
    primitieve: '3 * sqrt(x^4 + 2 * x)',
    domein: [0.2, 2],
    steps: welkeA({
      kern: r`x^{4} + 2x`,
      dKern: r`4x^{3} + 2`,
      vergelijk: r`De teller is $6x^{3} + a$. Die moet gelijk zijn aan een constante maal $4x^{3} + 2$: uit $6x^{3} = 1\tfrac{1}{2} \cdot 4x^{3}$ volgt de constante $1\tfrac{1}{2}$, en dan is $a = 1\tfrac{1}{2} \cdot 2 = 3$.`,
      buitenkant: r`Dan is $\int f(x)\,\mathrm{d}x = \int 1\tfrac{1}{2}\,g^{-\frac{1}{2}}\,\mathrm{d}g = 1\tfrac{1}{2} \cdot 2\sqrt{g} = 3\sqrt{g}$. Terugschrijven: $F(x) = 3\sqrt{x^{4} + 2x} + c$. Controle: differentiëren geeft $\dfrac{3(4x^{3} + 2)}{2\sqrt{x^{4} + 2x}} = \dfrac{6x^{3} + 3}{\sqrt{x^{4} + 2x}}$.`,
    }),
  },
  {
    cluster: 'k1a_welke_a',
    nummer: 'welke-a-4',
    level: 2,
    latex: r`Voor precies één waarde van $a$ lukt het primitiveren met de omgekeerde kettingregel: $f(x) = \dfrac{ax + 5}{x^{2} + 5x + 1}$. Bepaal die $a$ en primitiveer $f$.`,
    antwoordLatex: r`F(x) = \ln|x^{2} + 5x + 1| + c`,
    antwoord: 'ln|x^2 + 5x + 1| + c',
    alts: ['ln(x^2 + 5x + 1) + c'],
    integrand: '(2 * x + 5) / (x^2 + 5 * x + 1)',
    primitieve: 'ln(x^2 + 5 * x + 1)',
    domein: [0.5, 3],
    steps: welkeA({
      kern: r`x^{2} + 5x + 1`,
      dKern: r`2x + 5`,
      vergelijk: r`De teller is $ax + 5$. Die moet gelijk zijn aan een constante maal $2x + 5$: de losse $5$ staat er al, dus die constante is $1$ en $a = 2$.`,
      buitenkant: r`Dan is $\int f(x)\,\mathrm{d}x = \int \dfrac{1}{g}\,\mathrm{d}g = \ln|g|$. Terugschrijven: $F(x) = \ln|x^{2} + 5x + 1| + c$. De strepen blijven staan, want deze kern kan negatief zijn. Controle: differentiëren geeft $\dfrac{2x + 5}{x^{2} + 5x + 1}$.`,
    }),
  },
  {
    cluster: 'k1a_welke_a',
    nummer: 'welke-a-5',
    level: 3,
    latex: r`Voor precies één waarde van $a$ lukt het primitiveren met de omgekeerde kettingregel: $f(x) = \dfrac{3x^{2} + a}{(x^{3} + x)^{2}}$. Bepaal die $a$ en primitiveer $f$.`,
    antwoordLatex: r`F(x) = -\dfrac{1}{x^{3} + x} + c`,
    antwoord: '-1/(x^3 + x) + c',
    alts: ['-(x^3 + x)^(-1) + c'],
    integrand: '(3 * x^2 + 1) / (x^3 + x)^2',
    primitieve: '-1 / (x^3 + x)',
    domein: [0.5, 2.5],
    steps: welkeA({
      kern: r`x^{3} + x`,
      dKern: r`3x^{2} + 1`,
      vergelijk: r`De teller is $3x^{2} + a$. Die moet gelijk zijn aan een constante maal $3x^{2} + 1$: uit $3x^{2} = 1 \cdot 3x^{2}$ volgt de constante $1$, en dan is $a = 1$.`,
      buitenkant: r`Schrijf de breuk als macht: $\int g^{-2}\,\mathrm{d}g = -g^{-1}$. Terugschrijven: $F(x) = -\dfrac{1}{x^{3} + x} + c$. Controle: differentiëren geeft $\dfrac{3x^{2} + 1}{(x^{3} + x)^{2}}$.`,
    }),
  },
  {
    cluster: 'k1a_welke_a',
    nummer: 'welke-a-6',
    level: 3,
    latex: r`Voor precies één waarde van $a$ lukt het primitiveren met de omgekeerde kettingregel: $f(x) = (ax + 6)\sqrt{x^{2} + 6x + 10}$. Bepaal die $a$ en primitiveer $f$.`,
    antwoordLatex: r`F(x) = \tfrac{2}{3}(x^{2} + 6x + 10)\sqrt{x^{2} + 6x + 10} + c`,
    antwoord: '2/3 (x^2 + 6x + 10)sqrt(x^2 + 6x + 10) + c',
    alts: ['2/3(x^2 + 6x + 10)^(3/2) + c'],
    integrand: '(2 * x + 6) * sqrt(x^2 + 6 * x + 10)',
    primitieve: '2 * (x^2 + 6 * x + 10) * sqrt(x^2 + 6 * x + 10) / 3',
    steps: welkeA({
      kern: r`x^{2} + 6x + 10`,
      dKern: r`2x + 6`,
      vergelijk: r`De factor vóór de wortel is $ax + 6$. Die moet gelijk zijn aan een constante maal $2x + 6$: de losse $6$ staat er al, dus die constante is $1$ en $a = 2$.`,
      buitenkant: r`Dan is $\int f(x)\,\mathrm{d}x = \int g^{\frac{1}{2}}\,\mathrm{d}g = \tfrac{2}{3}g\sqrt{g}$. Terugschrijven: $F(x) = \tfrac{2}{3}(x^{2} + 6x + 10)\sqrt{x^{2} + 6x + 10} + c$. Controle: differentiëren geeft $\sqrt{x^{2} + 6x + 10} \cdot (2x + 6)$.`,
    }),
  },

  // ── Een macht van een kern ─────────────────────────────────────────────────
  {
    cluster: 'k1a_macht_kern',
    nummer: 'macht-1',
    level: 1,
    latex: r`f(x) = 2x(x^{2} + 5)^{4}`,
    antwoordLatex: r`F(x) = \tfrac{1}{5}(x^{2} + 5)^{5} + c`,
    antwoord: '(x^2 + 5)^5/5 + c',
    alts: ['1/5(x^2 + 5)^5 + c', '0,2(x^2 + 5)^5 + c'],
    integrand: '2 * x * (x^2 + 5)^4',
    primitieve: '(x^2 + 5)^5 / 5',
    steps: ketting({
      schil: SCHIL.macht,
      kern: r`x^{2} + 5`,
      dKern: r`2x`,
      factor: r`Vóór de haakjes staat precies $2x = g'(x)$, dus $2x\,\mathrm{d}x = \mathrm{d}(x^{2} + 5)$ en $\int 2x(x^{2} + 5)^{4}\,\mathrm{d}x = \int g^{4}\,\mathrm{d}g$.`,
      buitenkant: r`Primitiveer de buitenkant: $\int g^{4}\,\mathrm{d}g = \tfrac{1}{5}g^{5}$. Schrijf de kern terug: $F(x) = \tfrac{1}{5}(x^{2} + 5)^{5} + c$. Controle: differentiëren geeft $(x^{2} + 5)^{4} \cdot 2x$ — dat is $f(x)$.`,
    }),
  },
  {
    cluster: 'k1a_macht_kern',
    nummer: 'macht-2',
    level: 1,
    latex: r`f(x) = 3x^{2}(x^{3} + 2)^{5}`,
    antwoordLatex: r`F(x) = \tfrac{1}{6}(x^{3} + 2)^{6} + c`,
    antwoord: '(x^3 + 2)^6/6 + c',
    alts: ['1/6(x^3 + 2)^6 + c'],
    integrand: '3 * x^2 * (x^3 + 2)^5',
    primitieve: '(x^3 + 2)^6 / 6',
    domein: [-2, 2],
    steps: ketting({
      schil: SCHIL.macht,
      kern: r`x^{3} + 2`,
      dKern: r`3x^{2}`,
      factor: r`Vóór de haakjes staat precies $3x^{2} = g'(x)$, dus $3x^{2}\,\mathrm{d}x = \mathrm{d}(x^{3} + 2)$ en $\int 3x^{2}(x^{3} + 2)^{5}\,\mathrm{d}x = \int g^{5}\,\mathrm{d}g$.`,
      buitenkant: r`Primitiveer de buitenkant: $\int g^{5}\,\mathrm{d}g = \tfrac{1}{6}g^{6}$. Schrijf de kern terug: $F(x) = \tfrac{1}{6}(x^{3} + 2)^{6} + c$. Controle: differentiëren geeft $(x^{3} + 2)^{5} \cdot 3x^{2}$.`,
    }),
  },
  {
    cluster: 'k1a_macht_kern',
    nummer: 'macht-3',
    level: 2,
    latex: r`f(x) = 8x(x^{2} - 3)^{3}`,
    antwoordLatex: r`F(x) = (x^{2} - 3)^{4} + c`,
    antwoord: '(x^2 - 3)^4 + c',
    integrand: '8 * x * (x^2 - 3)^3',
    primitieve: '(x^2 - 3)^4',
    steps: ketting({
      schil: SCHIL.macht,
      kern: r`x^{2} - 3`,
      dKern: r`2x`,
      factor: r`Vóór de haakjes staat $8x$ en dat is $4 \cdot 2x$, dus $\int 8x(x^{2} - 3)^{3}\,\mathrm{d}x = \int 4 \cdot (x^{2} - 3)^{3} \cdot 2x\,\mathrm{d}x = \int 4g^{3}\,\mathrm{d}g$.`,
      buitenkant: r`Primitiveer de buitenkant: $\int 4g^{3}\,\mathrm{d}g = g^{4}$. Schrijf de kern terug: $F(x) = (x^{2} - 3)^{4} + c$. Controle: differentiëren geeft $4(x^{2} - 3)^{3} \cdot 2x = 8x(x^{2} - 3)^{3}$.`,
    }),
  },
  {
    cluster: 'k1a_macht_kern',
    nummer: 'macht-4',
    level: 2,
    latex: r`f(x) = x(2x^{2} + 1)^{4}`,
    antwoordLatex: r`F(x) = \tfrac{1}{20}(2x^{2} + 1)^{5} + c`,
    antwoord: '(2x^2 + 1)^5/20 + c',
    alts: ['1/20(2x^2 + 1)^5 + c', '0,05(2x^2 + 1)^5 + c'],
    integrand: 'x * (2 * x^2 + 1)^4',
    primitieve: '(2 * x^2 + 1)^5 / 20',
    domein: [-2, 2],
    steps: ketting({
      schil: SCHIL.macht,
      kern: r`2x^{2} + 1`,
      dKern: r`4x`,
      factor: r`Vóór de haakjes staat $x$ en dat is $\tfrac{1}{4} \cdot 4x$, dus $\int x(2x^{2} + 1)^{4}\,\mathrm{d}x = \int \tfrac{1}{4}g^{4}\,\mathrm{d}g$.`,
      buitenkant: r`Primitiveer de buitenkant: $\int \tfrac{1}{4}g^{4}\,\mathrm{d}g = \tfrac{1}{20}g^{5}$. Schrijf de kern terug: $F(x) = \tfrac{1}{20}(2x^{2} + 1)^{5} + c$. Controle: differentiëren geeft $\tfrac{1}{4}(2x^{2} + 1)^{4} \cdot 4x = x(2x^{2} + 1)^{4}$.`,
    }),
  },
  {
    cluster: 'k1a_macht_kern',
    nummer: 'macht-5',
    level: 3,
    latex: r`f(x) = (x + 1)(x^{2} + 2x - 3)^{5}`,
    antwoordLatex: r`F(x) = \tfrac{1}{12}(x^{2} + 2x - 3)^{6} + c`,
    antwoord: '(x^2 + 2x - 3)^6/12 + c',
    alts: ['1/12(x^2 + 2x - 3)^6 + c'],
    integrand: '(x + 1) * (x^2 + 2 * x - 3)^5',
    primitieve: '(x^2 + 2 * x - 3)^6 / 12',
    steps: ketting({
      schil: SCHIL.macht,
      kern: r`x^{2} + 2x - 3`,
      dKern: r`2x + 2`,
      factor: r`Vóór de haakjes staat $x + 1$ en dat is $\tfrac{1}{2}(2x + 2) = \tfrac{1}{2}g'(x)$, dus $\int (x + 1)(x^{2} + 2x - 3)^{5}\,\mathrm{d}x = \int \tfrac{1}{2}g^{5}\,\mathrm{d}g$.`,
      buitenkant: r`Primitiveer de buitenkant: $\int \tfrac{1}{2}g^{5}\,\mathrm{d}g = \tfrac{1}{12}g^{6}$. Schrijf de kern terug: $F(x) = \tfrac{1}{12}(x^{2} + 2x - 3)^{6} + c$. Controle: differentiëren geeft $\tfrac{1}{2}(x^{2} + 2x - 3)^{5}(2x + 2) = (x + 1)(x^{2} + 2x - 3)^{5}$.`,
    }),
  },
  {
    cluster: 'k1a_macht_kern',
    nummer: 'macht-6',
    level: 3,
    latex: r`f(x) = \dfrac{4x^{3}}{(x^{4} + 1)^{3}}`,
    antwoordLatex: r`F(x) = -\dfrac{1}{2(x^{4} + 1)^{2}} + c`,
    antwoord: '-1/(2(x^4 + 1)^2) + c',
    alts: ['-0,5/(x^4 + 1)^2 + c', '-1/2 (x^4 + 1)^(-2) + c'],
    integrand: '4 * x^3 / (x^4 + 1)^3',
    primitieve: '-1 / (2 * (x^4 + 1)^2)',
    steps: ketting({
      schil: SCHIL.macht,
      kern: r`x^{4} + 1`,
      dKern: r`4x^{3}`,
      factor: r`De teller is precies $4x^{3} = g'(x)$. Schrijf de breuk als macht: $\int \dfrac{4x^{3}}{(x^{4} + 1)^{3}}\,\mathrm{d}x = \int g^{-3}\,\mathrm{d}g$.`,
      buitenkant: r`Primitiveer de buitenkant: $\int g^{-3}\,\mathrm{d}g = -\tfrac{1}{2}g^{-2}$. Schrijf de kern terug: $F(x) = -\dfrac{1}{2(x^{4} + 1)^{2}} + c$. Controle: differentiëren geeft $(x^{4} + 1)^{-3} \cdot 4x^{3}$.`,
    }),
  },

  // ── Wortels en breuken met een kern ────────────────────────────────────────
  {
    cluster: 'k1a_wortel_breuk',
    nummer: 'wortel-1',
    level: 1,
    latex: r`f(x) = 2x\sqrt{x^{2} + 4}`,
    antwoordLatex: r`F(x) = \tfrac{2}{3}(x^{2} + 4)\sqrt{x^{2} + 4} + c`,
    antwoord: '2/3 (x^2 + 4)sqrt(x^2 + 4) + c',
    alts: ['2/3(x^2 + 4)^(3/2) + c', '2(x^2 + 4)sqrt(x^2 + 4)/3 + c'],
    integrand: '2 * x * sqrt(x^2 + 4)',
    primitieve: '2 * (x^2 + 4) * sqrt(x^2 + 4) / 3',
    steps: ketting({
      schil: SCHIL.wortel,
      kern: r`x^{2} + 4`,
      dKern: r`2x`,
      factor: r`Vóór de wortel staat precies $2x = g'(x)$, dus $2x\,\mathrm{d}x = \mathrm{d}(x^{2} + 4)$ en $\int 2x\sqrt{x^{2} + 4}\,\mathrm{d}x = \int g^{\frac{1}{2}}\,\mathrm{d}g$.`,
      buitenkant: r`Primitiveer de buitenkant: $\int g^{\frac{1}{2}}\,\mathrm{d}g = \tfrac{2}{3}g^{1\frac{1}{2}} = \tfrac{2}{3}g\sqrt{g}$. Schrijf de kern terug: $F(x) = \tfrac{2}{3}(x^{2} + 4)\sqrt{x^{2} + 4} + c$. Controle: differentiëren geeft $\sqrt{x^{2} + 4} \cdot 2x$.`,
    }),
  },
  {
    cluster: 'k1a_wortel_breuk',
    nummer: 'wortel-2',
    level: 1,
    latex: r`f(x) = \dfrac{2x}{x^{2} + 3}`,
    antwoordLatex: r`F(x) = \ln(x^{2} + 3) + c`,
    antwoord: 'ln(x^2 + 3) + c',
    alts: ['ln|x^2 + 3| + c'],
    integrand: '2 * x / (x^2 + 3)',
    primitieve: 'ln(x^2 + 3)',
    steps: ketting({
      schil: SCHIL.breuk,
      kern: r`x^{2} + 3`,
      dKern: r`2x`,
      factor: r`De teller is precies $2x = g'(x)$, dus $\int \dfrac{2x}{x^{2} + 3}\,\mathrm{d}x = \int \dfrac{1}{g}\,\mathrm{d}g$.`,
      buitenkant: r`Primitiveer de buitenkant: $\int \dfrac{1}{g}\,\mathrm{d}g = \ln|g|$. De kern $x^{2} + 3$ is altijd positief, dus de strepen mogen weg: $F(x) = \ln(x^{2} + 3) + c$. Controle: differentiëren geeft $\dfrac{2x}{x^{2} + 3}$.`,
    }),
  },
  {
    cluster: 'k1a_wortel_breuk',
    nummer: 'wortel-3',
    level: 2,
    latex: r`f(x) = \dfrac{x}{\sqrt{x^{2} + 9}}`,
    antwoordLatex: r`F(x) = \sqrt{x^{2} + 9} + c`,
    antwoord: 'sqrt(x^2 + 9) + c',
    alts: ['(x^2 + 9)^(1/2) + c'],
    integrand: 'x / sqrt(x^2 + 9)',
    primitieve: 'sqrt(x^2 + 9)',
    steps: ketting({
      schil: SCHIL.wortelNoemer,
      kern: r`x^{2} + 9`,
      dKern: r`2x`,
      factor: r`De teller is $x = \tfrac{1}{2} \cdot 2x = \tfrac{1}{2}g'(x)$, dus $\int \dfrac{x}{\sqrt{x^{2} + 9}}\,\mathrm{d}x = \int \tfrac{1}{2}g^{-\frac{1}{2}}\,\mathrm{d}g$.`,
      buitenkant: r`Primitiveer de buitenkant: $\int \tfrac{1}{2}g^{-\frac{1}{2}}\,\mathrm{d}g = \tfrac{1}{2} \cdot 2g^{\frac{1}{2}} = \sqrt{g}$. Schrijf de kern terug: $F(x) = \sqrt{x^{2} + 9} + c$. Controle: differentiëren geeft $\dfrac{2x}{2\sqrt{x^{2} + 9}} = \dfrac{x}{\sqrt{x^{2} + 9}}$.`,
    }),
  },
  {
    cluster: 'k1a_wortel_breuk',
    nummer: 'wortel-4',
    level: 2,
    latex: r`f(x) = \dfrac{8x}{4x^{2} + 5}`,
    antwoordLatex: r`F(x) = \ln(4x^{2} + 5) + c`,
    antwoord: 'ln(4x^2 + 5) + c',
    alts: ['ln|4x^2 + 5| + c'],
    integrand: '8 * x / (4 * x^2 + 5)',
    primitieve: 'ln(4 * x^2 + 5)',
    steps: ketting({
      schil: SCHIL.breuk,
      kern: r`4x^{2} + 5`,
      dKern: r`8x`,
      factor: r`De teller is precies $8x = g'(x)$, dus $\int \dfrac{8x}{4x^{2} + 5}\,\mathrm{d}x = \int \dfrac{1}{g}\,\mathrm{d}g$.`,
      buitenkant: r`Primitiveer de buitenkant: $\int \dfrac{1}{g}\,\mathrm{d}g = \ln|g|$. Deze kern is altijd positief: $F(x) = \ln(4x^{2} + 5) + c$. Controle: differentiëren geeft $\dfrac{8x}{4x^{2} + 5}$.`,
    }),
  },
  {
    cluster: 'k1a_wortel_breuk',
    nummer: 'wortel-5',
    level: 3,
    latex: r`f(x) = x\sqrt{7 - x^{2}}`,
    antwoordLatex: r`F(x) = -\tfrac{1}{3}(7 - x^{2})\sqrt{7 - x^{2}} + c`,
    antwoord: '-1/3 (7 - x^2)sqrt(7 - x^2) + c',
    alts: ['-1/3(7 - x^2)^(3/2) + c', '-(7 - x^2)sqrt(7 - x^2)/3 + c'],
    integrand: 'x * sqrt(7 - x^2)',
    primitieve: '-(7 - x^2) * sqrt(7 - x^2) / 3',
    steps: ketting({
      schil: SCHIL.wortel,
      kern: r`7 - x^{2}`,
      dKern: r`-2x`,
      factor: r`Let op het minteken: $x = -\tfrac{1}{2} \cdot (-2x) = -\tfrac{1}{2}g'(x)$, dus $\int x\sqrt{7 - x^{2}}\,\mathrm{d}x = \int -\tfrac{1}{2}g^{\frac{1}{2}}\,\mathrm{d}g$.`,
      buitenkant: r`Primitiveer de buitenkant: $\int -\tfrac{1}{2}g^{\frac{1}{2}}\,\mathrm{d}g = -\tfrac{1}{2} \cdot \tfrac{2}{3}g\sqrt{g} = -\tfrac{1}{3}g\sqrt{g}$. Schrijf de kern terug: $F(x) = -\tfrac{1}{3}(7 - x^{2})\sqrt{7 - x^{2}} + c$. Controle: differentiëren geeft $-\tfrac{1}{2}\sqrt{7 - x^{2}} \cdot (-2x) = x\sqrt{7 - x^{2}}$.`,
    }),
  },
  {
    cluster: 'k1a_wortel_breuk',
    nummer: 'wortel-6',
    level: 3,
    latex: r`f(x) = \dfrac{6x^{2}}{\sqrt{x^{3} + 5}}`,
    antwoordLatex: r`F(x) = 4\sqrt{x^{3} + 5} + c`,
    antwoord: '4sqrt(x^3 + 5) + c',
    alts: ['4(x^3 + 5)^(1/2) + c'],
    integrand: '6 * x^2 / sqrt(x^3 + 5)',
    primitieve: '4 * sqrt(x^3 + 5)',
    domein: [-1.5, 2.5],
    steps: ketting({
      schil: SCHIL.wortelNoemer,
      kern: r`x^{3} + 5`,
      dKern: r`3x^{2}`,
      factor: r`De teller is $6x^{2} = 2 \cdot 3x^{2} = 2g'(x)$, dus $\int \dfrac{6x^{2}}{\sqrt{x^{3} + 5}}\,\mathrm{d}x = \int 2g^{-\frac{1}{2}}\,\mathrm{d}g$.`,
      buitenkant: r`Primitiveer de buitenkant: $\int 2g^{-\frac{1}{2}}\,\mathrm{d}g = 2 \cdot 2\sqrt{g} = 4\sqrt{g}$. Schrijf de kern terug: $F(x) = 4\sqrt{x^{3} + 5} + c$. Controle: differentiëren geeft $\dfrac{4 \cdot 3x^{2}}{2\sqrt{x^{3} + 5}} = \dfrac{6x^{2}}{\sqrt{x^{3} + 5}}$.`,
    }),
  },

  // ── e-macht, ln en gonio met een kern ──────────────────────────────────────
  {
    cluster: 'k1a_e_ln_gonio',
    nummer: 'e-ln-gonio-1',
    level: 1,
    latex: r`f(x) = 2x\,\mathrm{e}^{x^{2}}`,
    antwoordLatex: r`F(x) = \mathrm{e}^{x^{2}} + c`,
    antwoord: 'e^(x^2) + c',
    integrand: '2 * x * e^(x^2)',
    primitieve: 'e^(x^2)',
    domein: [-2, 2],
    steps: ketting({
      schil: SCHIL.emacht,
      kern: r`x^{2}`,
      dKern: r`2x`,
      factor: r`Vóór de e-macht staat precies $2x = g'(x)$, dus $2x\,\mathrm{d}x = \mathrm{d}(x^{2})$ en $\int 2x\,\mathrm{e}^{x^{2}}\,\mathrm{d}x = \int \mathrm{e}^{g}\,\mathrm{d}g$.`,
      buitenkant: r`Primitiveer de buitenkant: $\int \mathrm{e}^{g}\,\mathrm{d}g = \mathrm{e}^{g}$. Schrijf de kern terug: $F(x) = \mathrm{e}^{x^{2}} + c$. Controle: differentiëren geeft $\mathrm{e}^{x^{2}} \cdot 2x$.`,
    }),
  },
  {
    cluster: 'k1a_e_ln_gonio',
    nummer: 'e-ln-gonio-2',
    level: 1,
    latex: r`f(x) = 3x^{2}\cos(x^{3})`,
    antwoordLatex: r`F(x) = \sin(x^{3}) + c`,
    antwoord: 'sin(x^3) + c',
    integrand: '3 * x^2 * cos(x^3)',
    primitieve: 'sin(x^3)',
    steps: ketting({
      schil: SCHIL.gonio,
      kern: r`x^{3}`,
      dKern: r`3x^{2}`,
      factor: r`Vóór de cosinus staat precies $3x^{2} = g'(x)$, dus $3x^{2}\,\mathrm{d}x = \mathrm{d}(x^{3})$ en $\int 3x^{2}\cos(x^{3})\,\mathrm{d}x = \int \cos(g)\,\mathrm{d}g$.`,
      buitenkant: r`Primitiveer de buitenkant: $\int \cos(g)\,\mathrm{d}g = \sin(g)$. Schrijf de kern terug: $F(x) = \sin(x^{3}) + c$. Controle: differentiëren geeft $\cos(x^{3}) \cdot 3x^{2}$.`,
    }),
  },
  {
    cluster: 'k1a_e_ln_gonio',
    nummer: 'e-ln-gonio-3',
    level: 2,
    latex: r`f(x) = x\,\mathrm{e}^{-2x^{2}}`,
    antwoordLatex: r`F(x) = -\tfrac{1}{4}\mathrm{e}^{-2x^{2}} + c`,
    antwoord: '-e^(-2x^2)/4 + c',
    alts: ['-1/4e^(-2x^2) + c', '-0,25e^(-2x^2) + c'],
    integrand: 'x * e^(-2 * x^2)',
    primitieve: '-e^(-2 * x^2) / 4',
    steps: ketting({
      schil: SCHIL.emacht,
      kern: r`-2x^{2}`,
      dKern: r`-4x`,
      factor: r`Vóór de e-macht staat $x$ en dat is $-\tfrac{1}{4} \cdot (-4x) = -\tfrac{1}{4}g'(x)$, dus $\int x\,\mathrm{e}^{-2x^{2}}\,\mathrm{d}x = \int -\tfrac{1}{4}\mathrm{e}^{g}\,\mathrm{d}g$.`,
      buitenkant: r`Primitiveer de buitenkant: $\int -\tfrac{1}{4}\mathrm{e}^{g}\,\mathrm{d}g = -\tfrac{1}{4}\mathrm{e}^{g}$. Schrijf de kern terug: $F(x) = -\tfrac{1}{4}\mathrm{e}^{-2x^{2}} + c$. Controle: differentiëren geeft $-\tfrac{1}{4}\mathrm{e}^{-2x^{2}} \cdot (-4x) = x\,\mathrm{e}^{-2x^{2}}$.`,
    }),
  },
  {
    cluster: 'k1a_e_ln_gonio',
    nummer: 'e-ln-gonio-4',
    level: 2,
    latex: r`f(x) = \dfrac{4\ln(x)}{x}`,
    antwoordLatex: r`F(x) = 2\ln^{2}(x) + c`,
    antwoord: '2ln(x)^2 + c',
    alts: ['2(ln(x))^2 + c', '2ln^2(x) + c'],
    integrand: '4 * ln(x) / x',
    primitieve: '2 * ln(x)^2',
    domein: [0.3, 3],
    steps: ketting({
      schil: r`Buitenste schil: een $\ln$ met ervóór $\dfrac{1}{x}$ → omgekeerde kettingregel. De afgeleide van $\ln(x)$ is juist $\dfrac{1}{x}$, dus neem $\ln(x)$ als kern.`,
      kern: r`\ln(x)`,
      dKern: r`\dfrac{1}{x}`,
      factor: r`Schrijf $f(x) = 4\ln(x) \cdot \dfrac{1}{x}$. Omdat $\dfrac{1}{x}\,\mathrm{d}x = \mathrm{d}\ln(x)$ wordt dit $\int 4g\,\mathrm{d}g$.`,
      buitenkant: r`Primitiveer de buitenkant: $\int 4g\,\mathrm{d}g = 2g^{2}$. Schrijf de kern terug: $F(x) = 2\ln^{2}(x) + c$. Controle: differentiëren geeft $4\ln(x) \cdot \dfrac{1}{x}$.`,
    }),
  },
  {
    cluster: 'k1a_e_ln_gonio',
    nummer: 'e-ln-gonio-5',
    level: 3,
    latex: r`f(x) = \sin(x)\cos^{3}(x)`,
    antwoordLatex: r`F(x) = -\tfrac{1}{4}\cos^{4}(x) + c`,
    antwoord: '-cos(x)^4/4 + c',
    alts: ['-1/4cos^4(x) + c', '-0,25cos(x)^4 + c'],
    integrand: 'sin(x) * cos(x)^3',
    primitieve: '-cos(x)^4 / 4',
    steps: ketting({
      schil: r`Buitenste schil: een macht van $\cos(x)$, met ervóór $\sin(x)$ → omgekeerde kettingregel. De afgeleide van $\cos(x)$ is $-\sin(x)$, dus neem $\cos(x)$ als kern.`,
      kern: r`\cos(x)`,
      dKern: r`-\sin(x)`,
      factor: r`Let op het minteken: $\sin(x) = -1 \cdot (-\sin(x)) = -g'(x)$, dus $\int \sin(x)\cos^{3}(x)\,\mathrm{d}x = \int -g^{3}\,\mathrm{d}g$.`,
      buitenkant: r`Primitiveer de buitenkant: $\int -g^{3}\,\mathrm{d}g = -\tfrac{1}{4}g^{4}$. Schrijf de kern terug: $F(x) = -\tfrac{1}{4}\cos^{4}(x) + c$. Controle: differentiëren geeft $-\cos^{3}(x) \cdot (-\sin(x)) = \sin(x)\cos^{3}(x)$.`,
    }),
  },
  {
    cluster: 'k1a_e_ln_gonio',
    nummer: 'e-ln-gonio-6',
    level: 3,
    latex: r`f(x) = 3x\ln(x^{2} + 4)`,
    antwoordLatex: r`F(x) = \tfrac{3}{2}\big((x^{2} + 4)\ln(x^{2} + 4) - (x^{2} + 4)\big) + c`,
    antwoord: '3/2 ((x^2 + 4)ln(x^2 + 4) - (x^2 + 4)) + c',
    alts: ['1,5(x^2 + 4)ln(x^2 + 4) - 1,5x^2 - 6 + c'],
    integrand: '3 * x * ln(x^2 + 4)',
    primitieve: '3 * ((x^2 + 4) * ln(x^2 + 4) - (x^2 + 4)) / 2',
    steps: ketting({
      schil: SCHIL.logaritme,
      kern: r`x^{2} + 4`,
      dKern: r`2x`,
      factor: r`Vóór de $\ln$ staat $3x$ en dat is $1\tfrac{1}{2} \cdot 2x = 1\tfrac{1}{2}g'(x)$, dus $\int 3x\ln(x^{2} + 4)\,\mathrm{d}x = \int 1\tfrac{1}{2}\ln(g)\,\mathrm{d}g$.`,
      buitenkant: r`Primitiveer de buitenkant met de standaardprimitieve van $\ln$: $\int 1\tfrac{1}{2}\ln(g)\,\mathrm{d}g = 1\tfrac{1}{2}\big(g\ln(g) - g\big)$. Schrijf de kern terug: $F(x) = \tfrac{3}{2}\big((x^{2} + 4)\ln(x^{2} + 4) - (x^{2} + 4)\big) + c$. Controle: differentiëren geeft $\tfrac{3}{2}\left(2x\ln(x^{2} + 4) + (x^{2} + 4)\cdot\dfrac{2x}{x^{2} + 4} - 2x\right) = 3x\ln(x^{2} + 4)$.`,
    }),
  },

  // ── Oppervlakte en inhoud ──────────────────────────────────────────────────
  {
    cluster: 'k1a_opp_inhoud',
    nummer: 'toepassing-1',
    level: 1,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = 2x(x^{2} + 1)^{3}$, de $x$-as en de lijn $x = 1$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\tfrac{15}{4}`,
    antwoord: '15/4',
    alts: ['3,75', '3 3/4'],
    integrand: '2 * x * (x^2 + 1)^3',
    primitieve: '(x^2 + 1)^4 / 4',
    grenzen: [0, 1],
    waarde: '15/4',
    steps: toepassing({
      deel1: r`Deel 1 van de driedeling: vertaal het verhaaltje naar een integraal. De grafiek snijdt de $x$-as bij $x = 0$ en is positief tussen $0$ en $1$, dus de oppervlakte is $\int_{0}^{1} f(x)\,\mathrm{d}x$.`,
      integraal: r`De integraal: $\int_{0}^{1} 2x(x^{2} + 1)^{3}\,\mathrm{d}x$. Deel 2: welke standaardvorm is dit? Een macht van de kern $g(x) = x^{2} + 1$, met ervóór $g'(x) = 2x$ → omgekeerde kettingregel.`,
      primitiveren: r`Primitiveer: $\int g^{3}\,\mathrm{d}g = \tfrac{1}{4}g^{4}$, dus $F(x) = \tfrac{1}{4}(x^{2} + 1)^{4}$. De integratieconstante laat je weg; die valt bij het aftrekken toch weg.`,
      afronden: r`Vul de grenzen in: $\big[\tfrac{1}{4}(x^{2} + 1)^{4}\big]_{0}^{1} = \tfrac{1}{4} \cdot 2^{4} - \tfrac{1}{4} \cdot 1 = 4 - \tfrac{1}{4} = \tfrac{15}{4}$. De oppervlakte is $3\tfrac{3}{4}$.`,
    }),
  },
  {
    cluster: 'k1a_opp_inhoud',
    nummer: 'toepassing-2',
    level: 1,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{2x}{x^{2} + 1}$, de $x$-as en de lijn $x = 2$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\ln(5)`,
    antwoord: 'ln(5)',
    integrand: '2 * x / (x^2 + 1)',
    primitieve: 'ln(x^2 + 1)',
    grenzen: [0, 2],
    waarde: 'ln(5)',
    steps: toepassing({
      deel1: r`Deel 1 van de driedeling: vertaal het verhaaltje naar een integraal. De grafiek snijdt de $x$-as bij $x = 0$ en is positief tussen $0$ en $2$, dus de oppervlakte is $\int_{0}^{2} f(x)\,\mathrm{d}x$.`,
      integraal: r`De integraal: $\int_{0}^{2} \dfrac{2x}{x^{2} + 1}\,\mathrm{d}x$. Deel 2: een breuk met de kern $g(x) = x^{2} + 1$ in de noemer, en de teller is precies $g'(x) = 2x$ → omgekeerde kettingregel, met $\ln$ als uitkomst.`,
      primitiveren: r`Primitiveer: $\int \dfrac{1}{g}\,\mathrm{d}g = \ln|g|$, dus $F(x) = \ln(x^{2} + 1)$; die kern is altijd positief.`,
      afronden: r`Vul de grenzen in: $\big[\ln(x^{2} + 1)\big]_{0}^{2} = \ln(5) - \ln(1) = \ln(5)$. Exact laten staan, dus niet afronden.`,
    }),
  },
  {
    cluster: 'k1a_opp_inhoud',
    nummer: 'toepassing-3',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = x\sqrt{x^{2} + 9}$, de $x$-as en de lijnen $x = 0$ en $x = 4$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\tfrac{98}{3}`,
    antwoord: '98/3',
    alts: ['32 2/3'],
    integrand: 'x * sqrt(x^2 + 9)',
    primitieve: '(x^2 + 9) * sqrt(x^2 + 9) / 3',
    grenzen: [0, 4],
    waarde: '98/3',
    steps: toepassing({
      deel1: r`Deel 1 van de driedeling: vertaal het verhaaltje naar een integraal. Op $[0, 4]$ ligt de grafiek boven de $x$-as, dus de oppervlakte is $\int_{0}^{4} f(x)\,\mathrm{d}x$.`,
      integraal: r`De integraal: $\int_{0}^{4} x\sqrt{x^{2} + 9}\,\mathrm{d}x$. Deel 2: een wortel met kern $g(x) = x^{2} + 9$; er staat $x = \tfrac{1}{2}g'(x)$ vóór → omgekeerde kettingregel.`,
      primitiveren: r`Primitiveer: $\int \tfrac{1}{2}g^{\frac{1}{2}}\,\mathrm{d}g = \tfrac{1}{3}g\sqrt{g}$, dus $F(x) = \tfrac{1}{3}(x^{2} + 9)\sqrt{x^{2} + 9}$.`,
      afronden: r`Vul de grenzen in: $\tfrac{1}{3} \cdot 25 \cdot 5 - \tfrac{1}{3} \cdot 9 \cdot 3 = \tfrac{125}{3} - 9 = \tfrac{98}{3}$. De oppervlakte is $32\tfrac{2}{3}$.`,
    }),
  },
  {
    cluster: 'k1a_opp_inhoud',
    nummer: 'toepassing-4',
    level: 2,
    latex: r`De grafiek van $f(x) = \dfrac{2x}{x^{2} + 1}$, de $x$-as en de lijnen $x = 0$ en $x = p$ met $p > 0$ sluiten een vlakdeel in met oppervlakte $\ln(10)$. Bereken exact $p$.`,
    antwoordLatex: r`p = 3`,
    antwoord: '3',
    alts: ['p = 3'],
    integrand: '2 * x / (x^2 + 1)',
    primitieve: 'ln(x^2 + 1)',
    grenzen: [0, 3],
    waarde: 'ln(10)',
    steps: toepassing({
      deel1: r`Deel 1 van de driedeling: de oppervlakte is $\int_{0}^{p} \dfrac{2x}{x^{2} + 1}\,\mathrm{d}x$, en die moet $\ln(10)$ worden.`,
      integraal: r`Deel 2: een breuk met kern $g(x) = x^{2} + 1$ in de noemer en teller $g'(x) = 2x$ → omgekeerde kettingregel, met $\ln$ als uitkomst.`,
      primitiveren: r`Primitiveer en vul de grenzen in: $\big[\ln(x^{2} + 1)\big]_{0}^{p} = \ln(p^{2} + 1) - \ln(1) = \ln(p^{2} + 1)$.`,
      afronden: r`Deel 3: los de vergelijking op. Uit $\ln(p^{2} + 1) = \ln(10)$ volgt $p^{2} + 1 = 10$, dus $p^{2} = 9$ en $p = 3$ (want $p > 0$).`,
    }),
  },
  {
    cluster: 'k1a_opp_inhoud',
    nummer: 'toepassing-5',
    level: 3,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sqrt{x}\,\mathrm{e}^{x^{2}}$, de $x$-as en de lijn $x = 1$. Het lichaam $L$ ontstaat als $V$ wentelt om de $x$-as. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\tfrac{1}{4}\pi\left(\mathrm{e}^{2} - 1\right)`,
    antwoord: 'pi(e^2 - 1)/4',
    alts: ['1/4pi(e^2 - 1)', '(pi e^2 - pi)/4'],
    integrand: 'pi * x * e^(2 * x^2)',
    primitieve: 'pi * e^(2 * x^2) / 4',
    grenzen: [0, 1],
    waarde: 'pi * (e^2 - 1) / 4',
    steps: toepassing({
      deel1: r`Deel 1 van de driedeling: wentelen om de $x$-as geeft inhoud $\pi\int_{a}^{b} \big(f(x)\big)^{2}\,\mathrm{d}x$. Hier loopt $x$ van $0$ (daar begint de grafiek) tot $1$.`,
      integraal: r`Kwadrateer eerst: $\big(f(x)\big)^{2} = \left(\sqrt{x}\,\mathrm{e}^{x^{2}}\right)^{2} = x\,\mathrm{e}^{2x^{2}}$. De integraal wordt $\pi\int_{0}^{1} x\,\mathrm{e}^{2x^{2}}\,\mathrm{d}x$.`,
      primitiveren: r`Deel 2: een e-macht met kern $g(x) = 2x^{2}$, dus $g'(x) = 4x$ en $x = \tfrac{1}{4}g'(x)$. Primitiveren geeft $\int \tfrac{1}{4}\mathrm{e}^{g}\,\mathrm{d}g = \tfrac{1}{4}\mathrm{e}^{2x^{2}}$.`,
      afronden: r`Vul de grenzen in: $\pi\big[\tfrac{1}{4}\mathrm{e}^{2x^{2}}\big]_{0}^{1} = \pi\left(\tfrac{1}{4}\mathrm{e}^{2} - \tfrac{1}{4}\right) = \tfrac{1}{4}\pi\left(\mathrm{e}^{2} - 1\right)$. Exact laten staan.`,
    }),
  },
  {
    cluster: 'k1a_opp_inhoud',
    nummer: 'toepassing-6',
    level: 3,
    latex: r`Het vlakdeel $V_p$ wordt ingesloten door de grafiek van $f(x) = \tfrac{1}{2}\sqrt{x}\,\mathrm{e}^{x^{2}}$, de $x$-as en de lijn $x = p$ met $p > 0$. Het lichaam $L_p$ ontstaat als $V_p$ wentelt om de $x$-as. Bereken exact voor welke $p$ de inhoud van $L_p$ gelijk is aan $3\pi$. Schrijf het antwoord in de vorm $p = \sqrt{\ln(a)}$.`,
    antwoordLatex: r`p = \sqrt{\ln(7)}`,
    antwoord: 'sqrt(ln(7))',
    alts: ['p = sqrt(ln(7))', 'ln(7)^(1/2)'],
    integrand: 'pi * x * e^(2 * x^2) / 4',
    primitieve: 'pi * e^(2 * x^2) / 16',
    // De bovengrens is het antwoord zelf: p = √(ln(7)) ≈ 1,3949588341794583.
    grenzen: [0, 1.3949588341794583],
    waarde: '3 * pi',
    steps: toepassing({
      deel1: r`Deel 1 van de driedeling: de inhoud is $\pi\int_{0}^{p} \big(f(x)\big)^{2}\,\mathrm{d}x$, en die moet $3\pi$ worden.`,
      integraal: r`Kwadrateer eerst: $\big(f(x)\big)^{2} = \tfrac{1}{4}x\,\mathrm{e}^{2x^{2}}$. De inhoud is dus $\pi\int_{0}^{p} \tfrac{1}{4}x\,\mathrm{e}^{2x^{2}}\,\mathrm{d}x$.`,
      primitiveren: r`Deel 2: kern $g(x) = 2x^{2}$ met $g'(x) = 4x$, dus $\tfrac{1}{4}x = \tfrac{1}{16}g'(x)$. Primitiveren en invullen geeft $\pi\big[\tfrac{1}{16}\mathrm{e}^{2x^{2}}\big]_{0}^{p} = \tfrac{1}{16}\pi\left(\mathrm{e}^{2p^{2}} - 1\right)$.`,
      afronden: r`Deel 3: los de vergelijking op. Uit $\tfrac{1}{16}\pi\left(\mathrm{e}^{2p^{2}} - 1\right) = 3\pi$ volgt $\mathrm{e}^{2p^{2}} = 49$, dus $2p^{2} = \ln(49) = 2\ln(7)$ en $p^{2} = \ln(7)$. Omdat $p > 0$: $p = \sqrt{\ln(7)}$.`,
    }),
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Hoofdstuk, topics en clusters
// ─────────────────────────────────────────────────────────────────────────────

const K1A: AdditiveChapter = {
  chapterSlug: 'k',
  chapterTitle: 'K — Voortgezette integraalrekening',
  bookPart: 4,
  chapterOrder: 12,
  site: 'integralen',
  migrationFile: '0035_k1a_kettingregel.sql',
  headerTitle: 'K.1 Theorie A — Primitiveren en de kettingregel',
  sourceScript: 'scripts/k1a-content.ts',
  headerNotes: [
    'Theorieblok A van K.1: de omgekeerde kettingregel. Zoek in de integrand een',
    'kern g(x) met ervóór een factor die (op een constante na) g’(x) is; dan is',
    'g’(x) dx = d(g(x)) en hoef je alleen de buitenkant nog te primitiveren.',
    '',
    'Eigen oefenvragen, geen boekopgaven. Elke primitieve wordt nagerekend door',
    'src/content/primitieven.test.ts (content/hoofdstuk-k/k1a.json).',
  ],
  topics: [
    { slug: 'k1a_kern_herkennen', title: 'De kern herkennen', order: 4, category: 'primitiveren' },
    { slug: 'k1a_primitiveren_ketting', title: 'Primitiveren met de omgekeerde kettingregel', order: 5, category: 'primitiveren' },
    { slug: 'k1a_toepassingen', title: 'Oppervlakte en inhoud met de omgekeerde kettingregel', order: 6, category: 'toepassingen' },
  ],
  clusters: [
    { topic: 'k1a_kern_herkennen', slug: 'k1a_differentiaal', title: 'Invullen met de d(…)-notatie', order: 1 },
    { topic: 'k1a_kern_herkennen', slug: 'k1a_welke_a', title: 'Voor welke a lukt het?', order: 2 },
    { topic: 'k1a_primitiveren_ketting', slug: 'k1a_macht_kern', title: 'Een macht van een kern', order: 1 },
    { topic: 'k1a_primitiveren_ketting', slug: 'k1a_wortel_breuk', title: 'Wortels en breuken met een kern', order: 2 },
    { topic: 'k1a_primitiveren_ketting', slug: 'k1a_e_ln_gonio', title: 'e-macht, ln en gonio met een kern', order: 3 },
    { topic: 'k1a_toepassingen', slug: 'k1a_opp_inhoud', title: 'Oppervlakte en inhoud', order: 1 },
  ],
  questions: VRAGEN,
}

// ─────────────────────────────────────────────────────────────────────────────
// Schrijven
// ─────────────────────────────────────────────────────────────────────────────

const wortel = process.cwd()

const contentPad = path.join(wortel, 'content', 'hoofdstuk-k', 'k1a.json')
writeFileSync(
  contentPad,
  generateContentFile(K1A, 'K.1 Theorie A — Primitiveren en de kettingregel (eigen varianten)'),
)

const migratiePad = path.join(wortel, 'supabase', 'migrations', K1A.migrationFile)
writeFileSync(migratiePad, generateAdditiveMigration(K1A))

console.log(`Geschreven: ${contentPad}`)
console.log(`Geschreven: ${migratiePad}`)
console.log(`Vragen: ${K1A.questions.length}, stappen: ${K1A.questions.length * 4}`)
for (const cl of K1A.clusters) {
  const qs = K1A.questions.filter((q) => q.cluster === cl.slug)
  const perNiveau = [1, 2, 3].map((n) => qs.filter((q) => q.level === n).length).join('/')
  console.log(`  ${cl.topic.padEnd(26)} ${cl.slug.padEnd(24)} ${qs.length}  [${perNiveau}]`)
}
