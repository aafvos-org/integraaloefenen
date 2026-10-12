/**
 * H15.4 — Integralen bij oppervlakte en inhoud.
 *
 * Eigen oefenvragen bij drie theorieblokken: eerstegraads gebroken functies,
 * verhouding van oppervlakten, en wentelen om de x-as of de y-as.
 * De boekopgaven staan alleen lokaal in content-bron/h154.json.
 *
 * Draaien met:  npx jiti scripts/h154-content.ts
 *
 * Schrijft:
 *   • content/hoofdstuk-h15/h154.json
 *   • supabase/migrations/0055_h154_oppervlakte_en_inhoud.sql
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { derivative, evaluate, parse } from 'mathjs'

import { voegTheorieblokToe } from './lib/theorieblok'
import {
  generateAdditiveMigration,
  generateContentFile,
  r,
  type AdditiveChapter,
  type AdditiveQ,
  type Steps,
} from './lib/stappenplan-content'

const DEEL2 = r`Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal.`
const DEEL12 = r`Hier spelen deel 1 en deel 2 van de driedeling: eerst het verhaal vertalen naar een integraal, dan die integraal exact uitrekenen.`
const DEEL123 = r`Hier spelen alle drie de delen: het verhaal wordt een integraal, die reken je exact uit, en met die uitkomst vind je de gevraagde waarde.`

function vier(a: string, b: string, c: string, d: string): Steps {
  return [a, b, c, d]
}

type Basis = {
  cluster: string
  nummer: string
  level: 1 | 2 | 3
  latex: string
  antwoordLatex: string
  antwoord: string
  alts?: string[]
  integrand: string
  primitieve: string
  domein?: [number, number]
  grenzen?: [number, number]
  waarde?: string | number
  steps: Steps
}

function vraag(q: Basis): AdditiveQ {
  return q
}

const VRAGEN: AdditiveQ[] = [
  // ── Theorie A: primitiveren ───────────────────────────────────────────────
  vraag({
    cluster: 'h15a_primitief',
    nummer: 'ap-1',
    level: 1,
    latex: r`Primitiveer $f(x) = \dfrac{x + 3}{x + 1}$.`,
    antwoordLatex: r`F(x) = x + 2\ln|x + 1| + c`,
    antwoord: 'x + 2ln(abs(x + 1)) + c',
    alts: ['x + 2ln(abs(x+1)) + c'],
    integrand: '(x + 3)/(x + 1)',
    primitieve: 'x + 2*ln(abs(x + 1))',
    domein: [0, 3],
    steps: vier(
      `${DEEL2} Schrijf de breuk eerst als een getal plus een breuk met een constante teller.`,
      r`$(x + 3) = 1\cdot(x + 1) + 2$, dus $f(x) = 1 + \dfrac{2}{x + 1}$.`,
      r`Een primitieve van $1$ is $x$. De kern van de tweede term is $x + 1$, en die kern heeft afgeleide $1$, dus een primitieve van $\dfrac{2}{x + 1}$ is $2\ln|x + 1|$.`,
      r`$F(x) = x + 2\ln|x + 1| + c$. Controle: de afgeleide is $1 + \dfrac{2}{x + 1} = \dfrac{x + 3}{x + 1}$.`,
    ),
  }),
  vraag({
    cluster: 'h15a_primitief',
    nummer: 'ap-2',
    level: 1,
    latex: r`Primitiveer $f(x) = \dfrac{2x + 5}{x + 2}$.`,
    antwoordLatex: r`F(x) = 2x + \ln|x + 2| + c`,
    antwoord: '2x + ln(abs(x + 2)) + c',
    integrand: '(2*x + 5)/(x + 2)',
    primitieve: '2*x + ln(abs(x + 2))',
    domein: [0, 3],
    steps: vier(
      `${DEEL2} Schrijf de breuk als een getal plus een breuk met een constante teller.`,
      r`$2x + 5 = 2(x + 2) + 1$, dus $f(x) = 2 + \dfrac{1}{x + 2}$.`,
      r`Een primitieve van $2$ is $2x$. De kern is $x + 2$, met afgeleide $1$, dus een primitieve van $\dfrac{1}{x + 2}$ is $\ln|x + 2|$.`,
      r`$F(x) = 2x + \ln|x + 2| + c$. Controle: de afgeleide is $2 + \dfrac{1}{x + 2} = f(x)$.`,
    ),
  }),
  vraag({
    cluster: 'h15a_primitief',
    nummer: 'ap-3',
    level: 1,
    latex: r`Primitiveer $f(x) = \dfrac{3x - 1}{x + 1}$.`,
    antwoordLatex: r`F(x) = 3x - 4\ln|x + 1| + c`,
    antwoord: '3x - 4ln(abs(x + 1)) + c',
    integrand: '(3*x - 1)/(x + 1)',
    primitieve: '3*x - 4*ln(abs(x + 1))',
    domein: [0, 3],
    steps: vier(
      `${DEEL2} Schrijf de breuk als een getal plus een breuk met een constante teller.`,
      r`$3x - 1 = 3(x + 1) - 4$, dus $f(x) = 3 - \dfrac{4}{x + 1}$.`,
      r`Een primitieve van $3$ is $3x$. De kern is $x + 1$, dus een primitieve van $-\dfrac{4}{x + 1}$ is $-4\ln|x + 1|$.`,
      r`$F(x) = 3x - 4\ln|x + 1| + c$. Controle: de afgeleide is $3 - \dfrac{4}{x + 1} = f(x)$.`,
    ),
  }),
  vraag({
    cluster: 'h15a_primitief',
    nummer: 'ap-4',
    level: 2,
    latex: r`Primitiveer $f(x) = \dfrac{4x + 1}{2x + 1}$.`,
    antwoordLatex: r`F(x) = 2x - \tfrac{1}{2}\ln|2x + 1| + c`,
    antwoord: '2x - (1/2)ln(abs(2x + 1)) + c',
    alts: ['2x - 0,5ln(abs(2x + 1)) + c'],
    integrand: '(4*x + 1)/(2*x + 1)',
    primitieve: '2*x - (1/2)*ln(abs(2*x + 1))',
    domein: [0, 3],
    steps: vier(
      `${DEEL2} De noemer is niet alleen $x$ plus een getal. Schrijf de breuk toch als een getal plus een restbreuk, en let bij het primitiveren op de afgeleide van de kern.`,
      r`$4x + 1 = 2(2x + 1) - 1$, dus $f(x) = 2 - \dfrac{1}{2x + 1}$.`,
      r`Een primitieve van $2$ is $2x$. De kern is $2x + 1$, met afgeleide $2$. Een primitieve van $\dfrac{1}{2x + 1}$ is daarom $\dfrac{1}{2}\ln|2x + 1|$, en met het minteken erbij wordt dat $-\dfrac{1}{2}\ln|2x + 1|$.`,
      r`$F(x) = 2x - \dfrac{1}{2}\ln|2x + 1| + c$. Controle: de afgeleide is $2 - \dfrac{1}{2x + 1} = f(x)$.`,
    ),
  }),
  vraag({
    cluster: 'h15a_primitief',
    nummer: 'ap-5',
    level: 2,
    latex: r`Primitiveer $g(x) = \dfrac{x - 4}{2x + 3}$.`,
    antwoordLatex: r`G(x) = \tfrac{1}{2}x - \tfrac{11}{4}\ln|2x + 3| + c`,
    antwoord: '(1/2)x - (11/4)ln(abs(2x + 3)) + c',
    integrand: '(x - 4)/(2*x + 3)',
    primitieve: '(1/2)*x - (11/4)*ln(abs(2*x + 3))',
    domein: [0, 3],
    steps: vier(
      `${DEEL2} Schrijf de breuk als een getal plus een restbreuk. De teller van de rest bepaal je door de deling.`,
      r`$x - 4 = \dfrac{1}{2}(2x + 3) - \dfrac{11}{2}$, dus $g(x) = \dfrac{1}{2} - \dfrac{11/2}{2x + 3}$.`,
      r`Een primitieve van $\dfrac{1}{2}$ is $\dfrac{1}{2}x$. De kern is $2x + 3$, met afgeleide $2$. Deel de factor $\dfrac{11}{2}$ door $2$: een primitieve van de restterm is $-\dfrac{11}{4}\ln|2x + 3|$.`,
      r`$G(x) = \dfrac{1}{2}x - \dfrac{11}{4}\ln|2x + 3| + c$. Controle: de afgeleide is $g(x)$.`,
    ),
  }),
  vraag({
    cluster: 'h15a_primitief',
    nummer: 'ap-6',
    level: 2,
    latex: r`Primitiveer $f(x) = \dfrac{5 - 2x}{x + 3}$.`,
    antwoordLatex: r`F(x) = -2x + 11\ln|x + 3| + c`,
    antwoord: '-2x + 11ln(abs(x + 3)) + c',
    integrand: '(5 - 2*x)/(x + 3)',
    primitieve: '-2*x + 11*ln(abs(x + 3))',
    domein: [0, 3],
    steps: vier(
      `${DEEL2} Het minteken bij $x$ hoort bij het getal vóór de restbreuk.`,
      r`$5 - 2x = -2(x + 3) + 11$, dus $f(x) = -2 + \dfrac{11}{x + 3}$.`,
      r`Een primitieve van $-2$ is $-2x$. De kern is $x + 3$, met afgeleide $1$, dus een primitieve van $\dfrac{11}{x + 3}$ is $11\ln|x + 3|$.`,
      r`$F(x) = -2x + 11\ln|x + 3| + c$. Controle: de afgeleide is $-2 + \dfrac{11}{x + 3} = f(x)$.`,
    ),
  }),
  vraag({
    cluster: 'h15a_primitief',
    nummer: 'ap-7',
    level: 3,
    latex: r`Primitiveer $f(x) = \dfrac{6x - 1}{3x + 2}$.`,
    antwoordLatex: r`F(x) = 2x - \tfrac{5}{3}\ln|3x + 2| + c`,
    antwoord: '2x - (5/3)ln(abs(3x + 2)) + c',
    integrand: '(6*x - 1)/(3*x + 2)',
    primitieve: '2*x - (5/3)*ln(abs(3*x + 2))',
    domein: [0, 3],
    steps: vier(
      `${DEEL2} Deel de teller door de noemer. De afgeleide van de kern is $3$, dus daarna deel je door $3$.`,
      r`$6x - 1 = 2(3x + 2) - 5$, dus $f(x) = 2 - \dfrac{5}{3x + 2}$.`,
      r`Een primitieve van $2$ is $2x$. De kern is $3x + 2$. Een primitieve van $\dfrac{5}{3x + 2}$ is $\dfrac{5}{3}\ln|3x + 2|$.`,
      r`$F(x) = 2x - \dfrac{5}{3}\ln|3x + 2| + c$. Controle: de afgeleide is $2 - \dfrac{5}{3x + 2} = f(x)$.`,
    ),
  }),
  vraag({
    cluster: 'h15a_primitief',
    nummer: 'ap-8',
    level: 3,
    latex: r`Primitiveer $h(x) = \dfrac{3x + 5}{x - 2}$.`,
    antwoordLatex: r`H(x) = 3x + 11\ln|x - 2| + c`,
    antwoord: '3x + 11ln(abs(x - 2)) + c',
    integrand: '(3*x + 5)/(x - 2)',
    primitieve: '3*x + 11*ln(abs(x - 2))',
    domein: [3, 5],
    steps: vier(
      `${DEEL2} De noemer is $x - 2$. Schrijf de teller als een veelvoud van die noemer, plus een constante.`,
      r`$3x + 5 = 3(x - 2) + 11$, dus $h(x) = 3 + \dfrac{11}{x - 2}$.`,
      r`Een primitieve van $3$ is $3x$. De kern is $x - 2$, met afgeleide $1$, dus een primitieve van $\dfrac{11}{x - 2}$ is $11\ln|x - 2|$.`,
      r`$H(x) = 3x + 11\ln|x - 2| + c$. Controle: de afgeleide is $3 + \dfrac{11}{x - 2} = h(x)$.`,
    ),
  }),

  // ── Theorie A: bepaalde integralen ────────────────────────────────────────
  vraag({
    cluster: 'h15a_bepaald',
    nummer: 'ab-1',
    level: 1,
    latex: r`Bereken exact $\displaystyle\int_{0}^{1} \dfrac{x + 3}{x + 1}\,\mathrm{d}x$.`,
    antwoordLatex: r`1 + 2\ln(2)`,
    antwoord: '1 + 2ln(2)',
    integrand: '(x + 3)/(x + 1)',
    primitieve: 'x + 2*ln(x + 1)',
    domein: [0, 2],
    grenzen: [0, 1],
    waarde: '1 + 2*ln(2)',
    steps: vier(
      `${DEEL2} Herschrijf de breuk en vul daarna de grenzen in.`,
      r`$\dfrac{x + 3}{x + 1} = 1 + \dfrac{2}{x + 1}$. Op $[0, 1]$ is de noemer positief.`,
      r`Een primitieve is $F(x) = x + 2\ln(x + 1)$.`,
      r`$F(1) - F(0) = (1 + 2\ln(2)) - 0 = 1 + 2\ln(2)$.`,
    ),
  }),
  vraag({
    cluster: 'h15a_bepaald',
    nummer: 'ab-2',
    level: 1,
    latex: r`Bereken exact $\displaystyle\int_{0}^{2} \dfrac{2x + 5}{x + 2}\,\mathrm{d}x$.`,
    antwoordLatex: r`4 + \ln(2)`,
    antwoord: '4 + ln(2)',
    integrand: '(2*x + 5)/(x + 2)',
    primitieve: '2*x + ln(x + 2)',
    domein: [0, 3],
    grenzen: [0, 2],
    waarde: '4 + ln(2)',
    steps: vier(
      `${DEEL2} Herschrijf de breuk en vul daarna de grenzen in.`,
      r`$\dfrac{2x + 5}{x + 2} = 2 + \dfrac{1}{x + 2}$.`,
      r`Een primitieve is $F(x) = 2x + \ln(x + 2)$.`,
      r`$F(2) - F(0) = (4 + \ln(4)) - \ln(2) = 4 + 2\ln(2) - \ln(2) = 4 + \ln(2)$.`,
    ),
  }),
  vraag({
    cluster: 'h15a_bepaald',
    nummer: 'ab-3',
    level: 1,
    latex: r`Bereken exact $\displaystyle\int_{1}^{3} \dfrac{3x - 1}{x + 1}\,\mathrm{d}x$.`,
    antwoordLatex: r`6 - 4\ln(2)`,
    antwoord: '6 - 4ln(2)',
    integrand: '(3*x - 1)/(x + 1)',
    primitieve: '3*x - 4*ln(x + 1)',
    domein: [0.5, 4],
    grenzen: [1, 3],
    waarde: '6 - 4*ln(2)',
    steps: vier(
      `${DEEL2} Herschrijf de breuk en vul daarna de grenzen in.`,
      r`$\dfrac{3x - 1}{x + 1} = 3 - \dfrac{4}{x + 1}$.`,
      r`Een primitieve is $F(x) = 3x - 4\ln(x + 1)$.`,
      r`$F(3) - F(1) = (9 - 4\ln(4)) - (3 - 4\ln(2)) = 6 - 8\ln(2) + 4\ln(2) = 6 - 4\ln(2)$.`,
    ),
  }),
  vraag({
    cluster: 'h15a_bepaald',
    nummer: 'ab-4',
    level: 2,
    latex: r`Bereken exact $\displaystyle\int_{0}^{1} \dfrac{4x + 1}{2x + 1}\,\mathrm{d}x$.`,
    antwoordLatex: r`2 - \tfrac{1}{2}\ln(3)`,
    antwoord: '2 - (1/2)ln(3)',
    alts: ['2 - 0,5ln(3)'],
    integrand: '(4*x + 1)/(2*x + 1)',
    primitieve: '2*x - (1/2)*ln(2*x + 1)',
    domein: [0, 2],
    grenzen: [0, 1],
    waarde: '2 - (1/2)*ln(3)',
    steps: vier(
      `${DEEL2} Herschrijf de breuk. De kern is $2x + 1$, dus bij de logaritme deel je door $2$.`,
      r`$\dfrac{4x + 1}{2x + 1} = 2 - \dfrac{1}{2x + 1}$.`,
      r`Een primitieve is $F(x) = 2x - \dfrac{1}{2}\ln(2x + 1)$.`,
      r`$F(1) - F(0) = \left(2 - \dfrac{1}{2}\ln(3)\right) - 0 = 2 - \dfrac{1}{2}\ln(3)$.`,
    ),
  }),
  vraag({
    cluster: 'h15a_bepaald',
    nummer: 'ab-5',
    level: 2,
    latex: r`Bereken exact $\displaystyle\int_{0}^{3} \dfrac{x + 2}{x + 1}\,\mathrm{d}x$.`,
    antwoordLatex: r`3 + 2\ln(2)`,
    antwoord: '3 + 2ln(2)',
    alts: ['3 + ln(4)'],
    integrand: '(x + 2)/(x + 1)',
    primitieve: 'x + ln(x + 1)',
    domein: [0, 4],
    grenzen: [0, 3],
    waarde: '3 + 2*ln(2)',
    steps: vier(
      `${DEEL2} Herschrijf de breuk en vul daarna de grenzen in.`,
      r`$\dfrac{x + 2}{x + 1} = 1 + \dfrac{1}{x + 1}$.`,
      r`Een primitieve is $F(x) = x + \ln(x + 1)$.`,
      r`$F(3) - F(0) = 3 + \ln(4) = 3 + 2\ln(2)$.`,
    ),
  }),
  vraag({
    cluster: 'h15a_bepaald',
    nummer: 'ab-6',
    level: 2,
    latex: r`Bereken exact $\displaystyle\int_{1}^{2} \dfrac{5 - x}{x + 1}\,\mathrm{d}x$.`,
    antwoordLatex: r`-1 + 6\ln\left(\dfrac{3}{2}\right)`,
    antwoord: '-1 + 6ln(3/2)',
    alts: ['6ln(3/2) - 1'],
    integrand: '(5 - x)/(x + 1)',
    primitieve: '-x + 6*ln(x + 1)',
    domein: [0, 3],
    grenzen: [1, 2],
    waarde: '-1 + 6*ln(3/2)',
    steps: vier(
      `${DEEL2} Het minteken bij $x$ hoort in de herschrijving.`,
      r`$\dfrac{5 - x}{x + 1} = -1 + \dfrac{6}{x + 1}$.`,
      r`Een primitieve is $F(x) = -x + 6\ln(x + 1)$.`,
      r`$F(2) - F(1) = (-2 + 6\ln(3)) - (-1 + 6\ln(2)) = -1 + 6\ln\left(\dfrac{3}{2}\right)$.`,
    ),
  }),
  vraag({
    cluster: 'h15a_bepaald',
    nummer: 'ab-7',
    level: 3,
    latex: r`Bereken exact $\displaystyle\int_{0}^{1} \dfrac{2x + 3}{x + 2}\,\mathrm{d}x$.`,
    antwoordLatex: r`2 + \ln\left(\dfrac{2}{3}\right)`,
    antwoord: '2 + ln(2/3)',
    alts: ['2 - ln(3/2)', '2 + ln(2) - ln(3)'],
    integrand: '(2*x + 3)/(x + 2)',
    primitieve: '2*x - ln(x + 2)',
    domein: [0, 2],
    grenzen: [0, 1],
    waarde: '2 + ln(2/3)',
    steps: vier(
      `${DEEL2} Herschrijf de breuk. De restterm heeft een minteken.`,
      r`$2x + 3 = 2(x + 2) - 1$, dus $\dfrac{2x + 3}{x + 2} = 2 - \dfrac{1}{x + 2}$.`,
      r`Een primitieve is $F(x) = 2x - \ln(x + 2)$.`,
      r`$F(1) - F(0) = (2 - \ln(3)) - (-\ln(2)) = 2 + \ln\left(\dfrac{2}{3}\right)$.`,
    ),
  }),
  vraag({
    cluster: 'h15a_bepaald',
    nummer: 'ab-8',
    level: 3,
    latex: r`Bereken exact $\displaystyle\int_{2}^{4} \dfrac{3x - 2}{x - 1}\,\mathrm{d}x$.`,
    antwoordLatex: r`6 + \ln(3)`,
    antwoord: '6 + ln(3)',
    integrand: '(3*x - 2)/(x - 1)',
    primitieve: '3*x + ln(x - 1)',
    domein: [1.5, 5],
    grenzen: [2, 4],
    waarde: '6 + ln(3)',
    steps: vier(
      `${DEEL2} De noemer is $x - 1$. Op $[2, 4]$ blijft die positief.`,
      r`$3x - 2 = 3(x - 1) + 1$, dus $\dfrac{3x - 2}{x - 1} = 3 + \dfrac{1}{x - 1}$.`,
      r`Een primitieve is $F(x) = 3x + \ln(x - 1)$.`,
      r`$F(4) - F(2) = (12 + \ln(3)) - (6 + \ln(1)) = 6 + \ln(3)$.`,
    ),
  }),

  // ── Theorie A: oppervlakte ────────────────────────────────────────────────
  vraag({
    cluster: 'h15a_oppervlakte',
    nummer: 'ao-1',
    level: 1,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x + 3}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`1 + 2\ln(2)`,
    antwoord: '1 + 2ln(2)',
    integrand: '(x + 3)/(x + 1)',
    primitieve: 'x + 2*ln(x + 1)',
    domein: [0, 2],
    grenzen: [0, 1],
    waarde: '1 + 2*ln(2)',
    steps: vier(
      `${DEEL12} Op $[0, 1]$ ligt de grafiek boven de $x$-as, dus de oppervlakte is de integraal zelf.`,
      r`$O(V) = \displaystyle\int_{0}^{1} \dfrac{x + 3}{x + 1}\,\mathrm{d}x$ en $\dfrac{x + 3}{x + 1} = 1 + \dfrac{2}{x + 1}$.`,
      r`Een primitieve is $F(x) = x + 2\ln(x + 1)$.`,
      r`$F(1) - F(0) = 1 + 2\ln(2)$. De oppervlakte is $1 + 2\ln(2)$.`,
    ),
  }),
  vraag({
    cluster: 'h15a_oppervlakte',
    nummer: 'ao-2',
    level: 1,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{2x + 4}{x + 1}$ en de lijn $y = 2$, tussen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`2\ln(2)`,
    antwoord: '2ln(2)',
    alts: ['ln(4)'],
    integrand: '2/(x + 1)',
    primitieve: '2*ln(x + 1)',
    domein: [0, 2],
    grenzen: [0, 1],
    waarde: '2*ln(2)',
    steps: vier(
      `${DEEL12} Eerst zien welke grafiek boven ligt, dan het verschil integreren.`,
      r`$\dfrac{2x + 4}{x + 1} = 2 + \dfrac{2}{x + 1}$. Op $[0, 1]$ ligt $f$ dus boven $y = 2$. $O(V) = \displaystyle\int_{0}^{1} \dfrac{2}{x + 1}\,\mathrm{d}x$.`,
      r`Een primitieve is $F(x) = 2\ln(x + 1)$.`,
      r`$F(1) - F(0) = 2\ln(2)$. De oppervlakte is $2\ln(2)$.`,
    ),
  }),
  vraag({
    cluster: 'h15a_oppervlakte',
    nummer: 'ao-3',
    level: 1,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{3x + 6}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = 2$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`6 + 3\ln(3)`,
    antwoord: '6 + 3ln(3)',
    integrand: '(3*x + 6)/(x + 1)',
    primitieve: '3*x + 3*ln(x + 1)',
    domein: [0, 3],
    grenzen: [0, 2],
    waarde: '6 + 3*ln(3)',
    steps: vier(
      `${DEEL12} Op $[0, 2]$ is $f(x) > 0$, dus de oppervlakte is de integraal.`,
      r`$\dfrac{3x + 6}{x + 1} = 3 + \dfrac{3}{x + 1}$, dus $O(V) = \displaystyle\int_{0}^{2} \left(3 + \dfrac{3}{x + 1}\right)\,\mathrm{d}x$.`,
      r`Een primitieve is $F(x) = 3x + 3\ln(x + 1)$.`,
      r`$F(2) - F(0) = 6 + 3\ln(3)$. De oppervlakte is $6 + 3\ln(3)$.`,
    ),
  }),
  vraag({
    cluster: 'h15a_oppervlakte',
    nummer: 'ao-4',
    level: 2,
    latex: r`Voor elke $a > 0$ sluit de grafiek van $f(x) = \dfrac{a}{x + 1}$ met de $x$-as en de lijnen $x = 0$ en $x = 1$ een vlakdeel $V_a$ in. Bereken exact de waarde van $a$ waarvoor de oppervlakte van $V_a$ gelijk is aan $2\ln(2)$.`,
    antwoordLatex: r`a = 2`,
    antwoord: '2',
    alts: ['a = 2', 'a=2'],
    integrand: '1/(x + 1)',
    primitieve: 'ln(x + 1)',
    domein: [0, 2],
    grenzen: [0, 1],
    waarde: 'ln(2)',
    steps: vier(
      DEEL123,
      r`Op $[0, 1]$ is $f(x) > 0$. $O(V_a) = \displaystyle\int_{0}^{1} \dfrac{a}{x + 1}\,\mathrm{d}x$.`,
      r`Zonder de $a$ is een primitieve $\ln(x + 1)$. Van $0$ tot $1$ geeft dat $\ln(2)$. Dus $O(V_a) = a\ln(2)$.`,
      r`Deel 3: $a\ln(2) = 2\ln(2)$, dus $a = 2$.`,
    ),
  }),
  vraag({
    cluster: 'h15a_oppervlakte',
    nummer: 'ao-5',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x + 5}{x + 1}$ en de lijn $y = 1$, tussen $x = 0$ en $x = 3$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`8\ln(2)`,
    antwoord: '8ln(2)',
    alts: ['4ln(4)'],
    integrand: '4/(x + 1)',
    primitieve: '4*ln(x + 1)',
    domein: [0, 4],
    grenzen: [0, 3],
    waarde: '8*ln(2)',
    steps: vier(
      `${DEEL12} Het verschil van de twee grafieken is de integrand.`,
      r`$\dfrac{x + 5}{x + 1} = 1 + \dfrac{4}{x + 1}$. Op $[0, 3]$ ligt $f$ boven $y = 1$. $O(V) = \displaystyle\int_{0}^{3} \dfrac{4}{x + 1}\,\mathrm{d}x$.`,
      r`Een primitieve is $F(x) = 4\ln(x + 1)$.`,
      r`$F(3) - F(0) = 4\ln(4) = 8\ln(2)$. De oppervlakte is $8\ln(2)$.`,
    ),
  }),
  vraag({
    cluster: 'h15a_oppervlakte',
    nummer: 'ao-6',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{4x + 2}{x + 2}$, de $x$-as en de lijnen $x = 0$ en $x = 2$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`8 - 6\ln(2)`,
    antwoord: '8 - 6ln(2)',
    integrand: '(4*x + 2)/(x + 2)',
    primitieve: '4*x - 6*ln(x + 2)',
    domein: [0, 3],
    grenzen: [0, 2],
    waarde: '8 - 6*ln(2)',
    steps: vier(
      `${DEEL12} Eerst controleren dat de grafiek op dit stuk boven de $x$-as ligt, dan integreren.`,
      r`$4x + 2 = 4(x + 2) - 6$, dus $f(x) = 4 - \dfrac{6}{x + 2}$. Op $[0, 2]$ is $f(x) > 0$. $O(V) = \displaystyle\int_{0}^{2} \left(4 - \dfrac{6}{x + 2}\right)\,\mathrm{d}x$.`,
      r`Een primitieve is $F(x) = 4x - 6\ln(x + 2)$.`,
      r`$F(2) - F(0) = (8 - 6\ln(4)) - (-6\ln(2)) = 8 - 12\ln(2) + 6\ln(2) = 8 - 6\ln(2)$.`,
    ),
  }),
  vraag({
    cluster: 'h15a_oppervlakte',
    nummer: 'ao-7',
    level: 3,
    latex: r`Voor elke $p > 0$ sluit de grafiek van $f(x) = \dfrac{3}{x + 2}$ met de $x$-as en de lijnen $x = 0$ en $x = p$ een vlakdeel $V_p$ in. Bereken exact de waarde van $p$ waarvoor de oppervlakte van $V_p$ gelijk is aan $\ln(8)$.`,
    antwoordLatex: r`p = 2`,
    antwoord: '2',
    alts: ['p = 2', 'p=2'],
    integrand: '3/(x + 2)',
    primitieve: '3*ln(x + 2)',
    domein: [0, 3],
    grenzen: [0, 2],
    waarde: '3*ln(2)',
    steps: vier(
      DEEL123,
      r`Op $[0, p]$ is $f(x) > 0$. $O(V_p) = \displaystyle\int_{0}^{p} \dfrac{3}{x + 2}\,\mathrm{d}x$.`,
      r`Een primitieve is $3\ln(x + 2)$. Dus $O(V_p) = 3\ln(p + 2) - 3\ln(2) = 3\ln\left(\dfrac{p + 2}{2}\right)$.`,
      r`Deel 3: $3\ln\left(\dfrac{p + 2}{2}\right) = \ln(8) = 3\ln(2)$. Dus $\dfrac{p + 2}{2} = 2$, en $p = 2$.`,
    ),
  }),
  vraag({
    cluster: 'h15a_oppervlakte',
    nummer: 'ao-8',
    level: 3,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \dfrac{2x + 1}{x + 1}$ en $g(x) = \dfrac{x + 2}{x + 1}$ en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`2\ln(2) - 1`,
    antwoord: '2ln(2) - 1',
    integrand: '2/(x + 1) - 1',
    primitieve: '2*ln(x + 1) - x',
    domein: [0, 2],
    grenzen: [0, 1],
    waarde: '2*ln(2) - 1',
    steps: vier(
      `${DEEL12} Eerst welke grafiek boven ligt, dan het verschil integreren.`,
      r`$f(x) = 2 - \dfrac{1}{x + 1}$ en $g(x) = 1 + \dfrac{1}{x + 1}$. Dus $g(x) - f(x) = \dfrac{2}{x + 1} - 1$. Op $[0, 1]$ is dat positief, dus $g$ ligt boven. $O(V) = \displaystyle\int_{0}^{1} \left(\dfrac{2}{x + 1} - 1\right)\,\mathrm{d}x$.`,
      r`Een primitieve is $F(x) = 2\ln(x + 1) - x$.`,
      r`$F(1) - F(0) = 2\ln(2) - 1$. De oppervlakte is $2\ln(2) - 1$.`,
    ),
  }),

  // ── Theorie B: verhouding ─────────────────────────────────────────────────
  vraag({
    cluster: 'h15b_verhouding',
    nummer: 'bv-1',
    level: 1,
    latex: r`De grafiek van $f(x) = x$ snijdt de rechthoek met hoekpunten $(0, 0)$, $(4, 0)$, $(4, 4)$ en $(0, 4)$ in een onderste vlakdeel $V$ en een bovenste vlakdeel $W$. Bereken de verhouding $O(V) : O(W)$.`,
    antwoordLatex: r`1 : 1`,
    antwoord: '1 : 1',
    alts: ['1:1', '1/1'],
    integrand: 'x',
    primitieve: 'x^2/2',
    domein: [0, 5],
    grenzen: [0, 4],
    waarde: 8,
    steps: vier(
      `${DEEL12} $V$ ligt onder de lijn, $W$ is de rest van de rechthoek.`,
      r`$O(V) = \displaystyle\int_{0}^{4} x\,\mathrm{d}x$. De rechthoek heeft oppervlakte $4 \cdot 4 = 16$, en $O(W) = 16 - O(V)$.`,
      r`Een primitieve is $\dfrac{1}{2}x^{2}$. Dus $O(V) = 8$ en $O(W) = 8$.`,
      r`$O(V) : O(W) = 8 : 8 = 1 : 1$.`,
    ),
  }),
  vraag({
    cluster: 'h15b_verhouding',
    nummer: 'bv-2',
    level: 1,
    latex: r`De grafiek van $f(x) = x^{2}$ en de lijn $y = 9$ sluiten op $[0, 3]$ twee vlakdelen in: $V$ onder de parabool en $W$ tussen de parabool en de lijn $y = 9$. Bereken de verhouding $O(V) : O(W)$.`,
    antwoordLatex: r`1 : 2`,
    antwoord: '1 : 2',
    alts: ['1:2', '1/2'],
    integrand: 'x^2',
    primitieve: 'x^3/3',
    domein: [0, 4],
    grenzen: [0, 3],
    waarde: 9,
    steps: vier(
      `${DEEL12} $V$ is de integraal van $x^{2}$. $W$ is de rechthoek minus $V$.`,
      r`$O(V) = \displaystyle\int_{0}^{3} x^{2}\,\mathrm{d}x$. De rechthoek heeft oppervlakte $3 \cdot 9 = 27$.`,
      r`Een primitieve is $\dfrac{1}{3}x^{3}$. Dus $O(V) = 9$ en $O(W) = 18$.`,
      r`$O(V) : O(W) = 9 : 18 = 1 : 2$.`,
    ),
  }),
  vraag({
    cluster: 'h15b_verhouding',
    nummer: 'bv-3',
    level: 1,
    latex: r`De grafiek van $f(x) = \sqrt{x}$ en de lijn $y = 3$ sluiten op $[0, 9]$ twee vlakdelen in: $V$ onder de grafiek en $W$ tussen de grafiek en $y = 3$. Bereken de verhouding $O(V) : O(W)$.`,
    antwoordLatex: r`2 : 1`,
    antwoord: '2 : 1',
    alts: ['2:1', '2/1', '2'],
    integrand: 'sqrt(x)',
    primitieve: '(2/3)*x^(3/2)',
    domein: [0, 9],
    grenzen: [0, 9],
    waarde: 18,
    steps: vier(
      `${DEEL12} Op $[0, 9]$ loopt de grafiek van $0$ tot $3$, dus de lijn $y = 3$ sluit er precies op aan.`,
      r`$O(V) = \displaystyle\int_{0}^{9} \sqrt{x}\,\mathrm{d}x$. De rechthoek heeft oppervlakte $9 \cdot 3 = 27$.`,
      r`Een primitieve van $\sqrt{x}$ is $\dfrac{2}{3}x^{3/2}$. Dus $O(V) = \dfrac{2}{3} \cdot 27 = 18$ en $O(W) = 9$.`,
      r`$O(V) : O(W) = 18 : 9 = 2 : 1$.`,
    ),
  }),
  vraag({
    cluster: 'h15b_verhouding',
    nummer: 'bv-4',
    level: 2,
    latex: r`De grafiek van $f(x) = x^{3}$ en de lijn $y = 8$ sluiten op $[0, 2]$ twee vlakdelen in: $V$ onder de grafiek en $W$ tussen de grafiek en $y = 8$. Bereken de verhouding $O(V) : O(W)$.`,
    antwoordLatex: r`1 : 3`,
    antwoord: '1 : 3',
    alts: ['1:3', '1/3'],
    integrand: 'x^3',
    primitieve: 'x^4/4',
    domein: [0, 3],
    grenzen: [0, 2],
    waarde: 4,
    steps: vier(
      `${DEEL12} $V$ is de integraal van $x^{3}$. $W$ is de rest van de rechthoek.`,
      r`$O(V) = \displaystyle\int_{0}^{2} x^{3}\,\mathrm{d}x$. De rechthoek heeft oppervlakte $2 \cdot 8 = 16$.`,
      r`Een primitieve is $\dfrac{1}{4}x^{4}$. Dus $O(V) = 4$ en $O(W) = 12$.`,
      r`$O(V) : O(W) = 4 : 12 = 1 : 3$.`,
    ),
  }),
  vraag({
    cluster: 'h15b_verhouding',
    nummer: 'bv-5',
    level: 2,
    latex: r`De grafieken van $f(x) = x$ en $g(x) = x^{2}$ sluiten op $[0, 1]$ het vlakdeel $V$ in. Het vlakdeel $W$ ligt onder $g$ op datzelfde interval. Bereken de verhouding $O(V) : O(W)$.`,
    antwoordLatex: r`1 : 2`,
    antwoord: '1 : 2',
    alts: ['1:2', '1/2'],
    integrand: 'x - x^2',
    primitieve: 'x^2/2 - x^3/3',
    domein: [0, 1.5],
    grenzen: [0, 1],
    waarde: '1/6',
    steps: vier(
      `${DEEL12} Op $[0, 1]$ ligt $y = x$ boven $y = x^{2}$.`,
      r`$O(V) = \displaystyle\int_{0}^{1} (x - x^{2})\,\mathrm{d}x$ en $O(W) = \displaystyle\int_{0}^{1} x^{2}\,\mathrm{d}x$.`,
      r`Een primitieve van $x - x^{2}$ is $\dfrac{1}{2}x^{2} - \dfrac{1}{3}x^{3}$. Dus $O(V) = \dfrac{1}{2} - \dfrac{1}{3} = \dfrac{1}{6}$. En $O(W) = \dfrac{1}{3}$.`,
      r`$O(V) : O(W) = \dfrac{1}{6} : \dfrac{1}{3} = 1 : 2$.`,
    ),
  }),
  vraag({
    cluster: 'h15b_verhouding',
    nummer: 'bv-6',
    level: 2,
    latex: r`De grafieken van $f(x) = \sqrt{x}$ en $g(x) = x$ sluiten op $[0, 1]$ het vlakdeel $V$ in. Het vlakdeel $W$ ligt onder $g$ op datzelfde interval. Bereken de verhouding $O(V) : O(W)$.`,
    antwoordLatex: r`1 : 3`,
    antwoord: '1 : 3',
    alts: ['1:3', '1/3'],
    integrand: 'sqrt(x) - x',
    primitieve: '(2/3)*x^(3/2) - x^2/2',
    domein: [0, 1.5],
    grenzen: [0, 1],
    waarde: '1/6',
    steps: vier(
      `${DEEL12} Op $[0, 1]$ ligt $\sqrt{x}$ boven $y = x$.`,
      r`$O(V) = \displaystyle\int_{0}^{1} \left(\sqrt{x} - x\right)\,\mathrm{d}x$ en $O(W) = \displaystyle\int_{0}^{1} x\,\mathrm{d}x = \dfrac{1}{2}$.`,
      r`Een primitieve van $\sqrt{x} - x$ is $\dfrac{2}{3}x^{3/2} - \dfrac{1}{2}x^{2}$. Dus $O(V) = \dfrac{2}{3} - \dfrac{1}{2} = \dfrac{1}{6}$.`,
      r`$O(V) : O(W) = \dfrac{1}{6} : \dfrac{1}{2} = 1 : 3$.`,
    ),
  }),
  vraag({
    cluster: 'h15b_verhouding',
    nummer: 'bv-7',
    level: 3,
    latex: r`Voor elke $a > 0$ deelt de lijn $y = ax$ de rechthoek met hoekpunten $(0, 0)$, $(1, 0)$, $(1, a)$ en $(0, a)$ in een onderste vlakdeel $V$ en een bovenste vlakdeel $W$. Bereken de verhouding $O(V) : O(W)$. Die verhouding hangt niet van $a$ af.`,
    antwoordLatex: r`1 : 1`,
    antwoord: '1 : 1',
    alts: ['1:1'],
    integrand: 'x',
    primitieve: 'x^2/2',
    domein: [0, 2],
    grenzen: [0, 1],
    waarde: '1/2',
    steps: vier(
      `${DEEL12} De factor $a$ komt in beide oppervlakten voor en valt in de verhouding weg.`,
      r`$O(V) = \displaystyle\int_{0}^{1} ax\,\mathrm{d}x$. De rechthoek heeft oppervlakte $1 \cdot a = a$, dus $O(W) = a - O(V)$.`,
      r`Een primitieve van $x$ is $\dfrac{1}{2}x^{2}$, dus de integraal van $x$ van $0$ tot $1$ is $\dfrac{1}{2}$. Dus $O(V) = \dfrac{1}{2}a$ en $O(W) = \dfrac{1}{2}a$.`,
      r`$O(V) : O(W) = 1 : 1$, voor elke $a > 0$.`,
    ),
  }),
  vraag({
    cluster: 'h15b_verhouding',
    nummer: 'bv-8',
    level: 3,
    latex: r`De grafiek van $f(x) = 6x - x^{2}$ en de $x$-as sluiten op $[0, 6]$ een vlakdeel in. De lijn $x = 3$ deelt dat vlakdeel in $V$ links en $W$ rechts. Bereken de verhouding $O(V) : O(W)$.`,
    antwoordLatex: r`1 : 1`,
    antwoord: '1 : 1',
    alts: ['1:1'],
    integrand: '6*x - x^2',
    primitieve: '3*x^2 - x^3/3',
    domein: [0, 6],
    grenzen: [0, 3],
    waarde: 18,
    steps: vier(
      `${DEEL12} De parabool is symmetrisch om $x = 3$, en de lijn $x = 3$ is precies die as.`,
      r`$O(V) = \displaystyle\int_{0}^{3} (6x - x^{2})\,\mathrm{d}x$. Het hele vlakdeel loopt van $0$ tot $6$.`,
      r`Een primitieve is $3x^{2} - \dfrac{1}{3}x^{3}$. Dus $O(V) = 27 - 9 = 18$. Het hele vlakdeel heeft oppervlakte $36$, dus $O(W) = 18$.`,
      r`$O(V) : O(W) = 18 : 18 = 1 : 1$.`,
    ),
  }),

  // ── Theorie B: parameter ──────────────────────────────────────────────────
  vraag({
    cluster: 'h15b_parameter',
    nummer: 'bp-1',
    level: 1,
    latex: r`Voor elke $p > 0$ sluit de grafiek van $f(x) = x$ met de $x$-as en de lijn $x = p$ een vlakdeel $V_p$ in. Bereken exact de waarde van $p$ waarvoor de oppervlakte van $V_p$ gelijk is aan $8$.`,
    antwoordLatex: r`p = 4`,
    antwoord: '4',
    alts: ['p = 4', 'p=4'],
    integrand: 'x',
    primitieve: 'x^2/2',
    domein: [0, 5],
    grenzen: [0, 4],
    waarde: 8,
    steps: vier(
      DEEL123,
      r`$O(V_p) = \displaystyle\int_{0}^{p} x\,\mathrm{d}x$.`,
      r`Een primitieve is $\dfrac{1}{2}x^{2}$. Dus $O(V_p) = \dfrac{1}{2}p^{2}$.`,
      r`Deel 3: $\dfrac{1}{2}p^{2} = 8$, dus $p^{2} = 16$. Omdat $p > 0$ is $p = 4$.`,
    ),
  }),
  vraag({
    cluster: 'h15b_parameter',
    nummer: 'bp-2',
    level: 1,
    latex: r`Voor elke $p > 0$ sluit de grafiek van $f(x) = x^{2}$ met de $x$-as en de lijn $x = p$ een vlakdeel $V_p$ in. Bereken exact de waarde van $p$ waarvoor de oppervlakte van $V_p$ gelijk is aan $9$.`,
    antwoordLatex: r`p = 3`,
    antwoord: '3',
    alts: ['p = 3', 'p=3'],
    integrand: 'x^2',
    primitieve: 'x^3/3',
    domein: [0, 4],
    grenzen: [0, 3],
    waarde: 9,
    steps: vier(
      DEEL123,
      r`$O(V_p) = \displaystyle\int_{0}^{p} x^{2}\,\mathrm{d}x$.`,
      r`Een primitieve is $\dfrac{1}{3}x^{3}$. Dus $O(V_p) = \dfrac{1}{3}p^{3}$.`,
      r`Deel 3: $\dfrac{1}{3}p^{3} = 9$, dus $p^{3} = 27$ en $p = 3$.`,
    ),
  }),
  vraag({
    cluster: 'h15b_parameter',
    nummer: 'bp-3',
    level: 1,
    latex: r`Voor elke $p > 0$ sluit de grafiek van $f(x) = \sqrt{x}$ met de $x$-as en de lijn $x = p$ een vlakdeel $V_p$ in. Bereken exact de waarde van $p$ waarvoor de oppervlakte van $V_p$ gelijk is aan $\dfrac{16}{3}$.`,
    antwoordLatex: r`p = 4`,
    antwoord: '4',
    alts: ['p = 4', 'p=4'],
    integrand: 'sqrt(x)',
    primitieve: '(2/3)*x^(3/2)',
    domein: [0, 5],
    grenzen: [0, 4],
    waarde: '16/3',
    steps: vier(
      DEEL123,
      r`$O(V_p) = \displaystyle\int_{0}^{p} \sqrt{x}\,\mathrm{d}x$.`,
      r`Een primitieve is $\dfrac{2}{3}x^{3/2}$. Dus $O(V_p) = \dfrac{2}{3}p^{3/2}$.`,
      r`Deel 3: $\dfrac{2}{3}p^{3/2} = \dfrac{16}{3}$, dus $p^{3/2} = 8$. Dan $p = 4$, want $4^{3/2} = 8$.`,
    ),
  }),
  vraag({
    cluster: 'h15b_parameter',
    nummer: 'bp-4',
    level: 2,
    latex: r`Voor elke $a$ met $0 < a < 4$ zijn gegeven $f(x) = 4 - x^{2}$ en $g(x) = a - x^{2}$. Het vlakdeel $V$ ligt tussen de grafieken van $f$ en $g$. Het vlakdeel $W$ ligt onder de grafiek van $g$, tot aan de $x$-as. Bereken exact de waarde van $a$ waarvoor $O(V) = O(W)$.`,
    antwoordLatex: r`a = \dfrac{12}{5}`,
    antwoord: '12/5',
    alts: ['a = 12/5', 'a=12/5', '2,4', '2.4'],
    integrand: '8/5',
    primitieve: '(8/5)*x',
    domein: [-2, 2],
    grenzen: [-Math.sqrt(12 / 5), Math.sqrt(12 / 5)],
    waarde: '(16/5)*sqrt(12/5)',
    steps: vier(
      DEEL123,
      r`$g$ snijdt de $x$-as bij $x = \pm\sqrt{a}$. Tussen die punten is $f(x) - g(x) = 4 - a$. Dus $O(V) = 2\sqrt{a}\,(4 - a)$. En $O(W) = \displaystyle\int_{-\sqrt{a}}^{\sqrt{a}} (a - x^{2})\,\mathrm{d}x = \dfrac{4}{3}a^{3/2}$.`,
      r`Stel $O(V) = O(W)$: $2\sqrt{a}\,(4 - a) = \dfrac{4}{3}a^{3/2}$. Deel door $2\sqrt{a}$, dat mag omdat $a > 0$: $4 - a = \dfrac{2}{3}a$.`,
      r`Deel 3: $4 = \dfrac{5}{3}a$, dus $a = \dfrac{12}{5}$. Die waarde ligt tussen $0$ en $4$.`,
    ),
  }),
  vraag({
    cluster: 'h15b_parameter',
    nummer: 'bp-5',
    level: 2,
    latex: r`Voor elke $p > 1$ sluit de grafiek van $f(x) = \dfrac{1}{x}$ met de $x$-as en de lijnen $x = 1$ en $x = p$ een vlakdeel $V_p$ in. Bereken exact de waarde van $p$ waarvoor de oppervlakte van $V_p$ gelijk is aan $\ln(3)$.`,
    antwoordLatex: r`p = 3`,
    antwoord: '3',
    alts: ['p = 3', 'p=3'],
    integrand: '1/x',
    primitieve: 'ln(x)',
    domein: [0.5, 4],
    grenzen: [1, 3],
    waarde: 'ln(3)',
    steps: vier(
      DEEL123,
      r`Op $[1, p]$ is $f(x) > 0$. $O(V_p) = \displaystyle\int_{1}^{p} \dfrac{1}{x}\,\mathrm{d}x$.`,
      r`Een primitieve is $\ln(x)$. Dus $O(V_p) = \ln(p) - \ln(1) = \ln(p)$.`,
      r`Deel 3: $\ln(p) = \ln(3)$, dus $p = 3$.`,
    ),
  }),
  vraag({
    cluster: 'h15b_parameter',
    nummer: 'bp-6',
    level: 2,
    latex: r`Voor elke $a > 0$ snijden de grafieken van $f(x) = x$ en $g(x) = ax^{2}$ elkaar in de oorsprong en in $\left(\dfrac{1}{a}, \dfrac{1}{a}\right)$. Het vlakdeel $V_a$ ligt daartussen. Bereken exact de waarde van $a$ waarvoor de oppervlakte van $V_a$ gelijk is aan $\dfrac{1}{24}$.`,
    antwoordLatex: r`a = 2`,
    antwoord: '2',
    alts: ['a = 2', 'a=2'],
    integrand: 'x - 2*x^2',
    primitieve: 'x^2/2 - (2/3)*x^3',
    domein: [0, 1],
    grenzen: [0, 0.5],
    waarde: '1/24',
    steps: vier(
      DEEL123,
      r`Op $\left(0, \dfrac{1}{a}\right)$ ligt $y = x$ boven $y = ax^{2}$. $O(V_a) = \displaystyle\int_{0}^{1/a} \left(x - ax^{2}\right)\,\mathrm{d}x$.`,
      r`Een primitieve is $\dfrac{1}{2}x^{2} - \dfrac{a}{3}x^{3}$. Invullen van de bovengrens geeft $\dfrac{1}{2a^{2}} - \dfrac{1}{3a^{2}} = \dfrac{1}{6a^{2}}$.`,
      r`Deel 3: $\dfrac{1}{6a^{2}} = \dfrac{1}{24}$, dus $a^{2} = 4$. Omdat $a > 0$ is $a = 2$.`,
    ),
  }),
  vraag({
    cluster: 'h15b_parameter',
    nummer: 'bp-7',
    level: 3,
    latex: r`Voor elke $p > 0$ sluit de grafiek van $f(x) = e^{x}$ met de $x$-as, de $y$-as en de lijn $x = p$ een vlakdeel $V_p$ in. Bereken exact de waarde van $p$ waarvoor de oppervlakte van $V_p$ gelijk is aan $e^{2} - 1$.`,
    antwoordLatex: r`p = 2`,
    antwoord: '2',
    alts: ['p = 2', 'p=2'],
    integrand: 'e^x',
    primitieve: 'e^x',
    domein: [0, 3],
    grenzen: [0, 2],
    waarde: 'e^2 - 1',
    steps: vier(
      DEEL123,
      r`$f(x) > 0$, dus $O(V_p) = \displaystyle\int_{0}^{p} e^{x}\,\mathrm{d}x$.`,
      r`Een primitieve is $e^{x}$. Dus $O(V_p) = e^{p} - 1$.`,
      r`Deel 3: $e^{p} - 1 = e^{2} - 1$, dus $e^{p} = e^{2}$ en $p = 2$.`,
    ),
  }),
  vraag({
    cluster: 'h15b_parameter',
    nummer: 'bp-8',
    level: 3,
    latex: r`Voor elke $p > 0$ sluit de grafiek van $f(x) = p(4 - x^{2})$ met de $x$-as een vlakdeel $V_p$ in. Bereken exact de waarde van $p$ waarvoor de oppervlakte van $V_p$ gelijk is aan $16$.`,
    antwoordLatex: r`p = \dfrac{3}{2}`,
    antwoord: '3/2',
    alts: ['p = 3/2', 'p=3/2', '1,5', '1.5'],
    integrand: '(3/2)*(4 - x^2)',
    primitieve: '(3/2)*(4*x - x^3/3)',
    domein: [-2, 2],
    grenzen: [-2, 2],
    waarde: 16,
    steps: vier(
      DEEL123,
      r`De grafiek snijdt de $x$-as in $x = -2$ en $x = 2$. Voor $p > 0$ ligt hij daartussen boven de as. $O(V_p) = \displaystyle\int_{-2}^{2} p(4 - x^{2})\,\mathrm{d}x$.`,
      r`Zonder de $p$ is een primitieve $4x - \dfrac{1}{3}x^{3}$. Van $-2$ tot $2$ geeft dat $\dfrac{32}{3}$. Dus $O(V_p) = \dfrac{32}{3}p$.`,
      r`Deel 3: $\dfrac{32}{3}p = 16$, dus $p = 16 \cdot \dfrac{3}{32} = \dfrac{3}{2}$.`,
    ),
  }),

  // ── Theorie C: wentelen om de x-as ────────────────────────────────────────
  vraag({
    cluster: 'h15c_xas',
    nummer: 'cx-1',
    level: 1,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = x$, de $x$-as en de lijn $x = 3$. Het lichaam $L$ ontstaat als $V$ wentelt om de $x$-as. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`9\pi`,
    antwoord: '9pi',
    alts: ['9*pi'],
    integrand: 'pi*x^2',
    primitieve: 'pi*x^3/3',
    domein: [0, 4],
    grenzen: [0, 3],
    waarde: '9*pi',
    steps: vier(
      `${DEEL12} De inhoud bij wentelen om de $x$-as is $\\pi$ keer de integraal van het kwadraat van $f$.`,
      r`$I(L) = \pi \displaystyle\int_{0}^{3} x^{2}\,\mathrm{d}x$.`,
      r`Een primitieve van de integrand is $F(x) = \pi \cdot \dfrac{1}{3}x^{3}$.`,
      r`$F(3) - F(0) = \pi \cdot 9 = 9\pi$. De inhoud is $9\pi$.`,
    ),
  }),
  vraag({
    cluster: 'h15c_xas',
    nummer: 'cx-2',
    level: 1,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de lijn $y = 2$, de $x$-as en de lijnen $x = 0$ en $x = 3$. Het lichaam $L$ ontstaat als $V$ wentelt om de $x$-as. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`12\pi`,
    antwoord: '12pi',
    alts: ['12*pi'],
    integrand: '4*pi',
    primitieve: '4*pi*x',
    domein: [0, 4],
    grenzen: [0, 3],
    waarde: '12*pi',
    steps: vier(
      `${DEEL12} De straal van de schijf is overal $2$.`,
      r`$I(L) = \pi \displaystyle\int_{0}^{3} 2^{2}\,\mathrm{d}x = \pi \displaystyle\int_{0}^{3} 4\,\mathrm{d}x$.`,
      r`Een primitieve van de integrand is $F(x) = 4\pi x$.`,
      r`$F(3) - F(0) = 12\pi$. De inhoud is $12\pi$.`,
    ),
  }),
  vraag({
    cluster: 'h15c_xas',
    nummer: 'cx-3',
    level: 1,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sqrt{x}$, de $x$-as en de lijn $x = 4$. Het lichaam $L$ ontstaat als $V$ wentelt om de $x$-as. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`8\pi`,
    antwoord: '8pi',
    alts: ['8*pi'],
    integrand: 'pi*x',
    primitieve: 'pi*x^2/2',
    domein: [0, 5],
    grenzen: [0, 4],
    waarde: '8*pi',
    steps: vier(
      `${DEEL12} Het kwadraat van $\\sqrt{x}$ is gewoon $x$.`,
      r`$I(L) = \pi \displaystyle\int_{0}^{4} \left(\sqrt{x}\right)^{2}\,\mathrm{d}x = \pi \displaystyle\int_{0}^{4} x\,\mathrm{d}x$.`,
      r`Een primitieve van de integrand is $F(x) = \pi \cdot \dfrac{1}{2}x^{2}$.`,
      r`$F(4) - F(0) = \pi \cdot 8 = 8\pi$. De inhoud is $8\pi$.`,
    ),
  }),
  vraag({
    cluster: 'h15c_xas',
    nummer: 'cx-4',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = x + 1$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Het lichaam $L$ ontstaat als $V$ wentelt om de $x$-as. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{7}{3}\pi`,
    antwoord: '(7/3)pi',
    alts: ['7pi/3', '(7/3)*pi'],
    integrand: 'pi*(x + 1)^2',
    primitieve: 'pi*(x^3/3 + x^2 + x)',
    domein: [0, 2],
    grenzen: [0, 1],
    waarde: '(7/3)*pi',
    steps: vier(
      `${DEEL12} De straal is $x + 1$. Kwadrateer die eerst.`,
      r`$I(L) = \pi \displaystyle\int_{0}^{1} (x + 1)^{2}\,\mathrm{d}x = \pi \displaystyle\int_{0}^{1} (x^{2} + 2x + 1)\,\mathrm{d}x$.`,
      r`Een primitieve van de integrand is $F(x) = \pi\left(\dfrac{1}{3}x^{3} + x^{2} + x\right)$.`,
      r`$F(1) - F(0) = \pi\left(\dfrac{1}{3} + 1 + 1\right) = \dfrac{7}{3}\pi$. De inhoud is $\dfrac{7}{3}\pi$.`,
    ),
  }),
  vraag({
    cluster: 'h15c_xas',
    nummer: 'cx-5',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de lijn $y = 3 - x$, de $x$-as en de $y$-as. Het lichaam $L$ ontstaat als $V$ wentelt om de $x$-as. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`9\pi`,
    antwoord: '9pi',
    alts: ['9*pi'],
    integrand: 'pi*(3 - x)^2',
    primitieve: 'pi*(9*x - 3*x^2 + x^3/3)',
    domein: [0, 3],
    grenzen: [0, 3],
    waarde: '9*pi',
    steps: vier(
      `${DEEL12} De lijn snijdt de $x$-as in $x = 3$ en de $y$-as in $y = 3$. Op $[0, 3]$ ligt hij boven de $x$-as.`,
      r`$I(L) = \pi \displaystyle\int_{0}^{3} (3 - x)^{2}\,\mathrm{d}x = \pi \displaystyle\int_{0}^{3} (9 - 6x + x^{2})\,\mathrm{d}x$.`,
      r`Een primitieve van de integrand is $F(x) = \pi\left(9x - 3x^{2} + \dfrac{1}{3}x^{3}\right)$.`,
      r`$F(3) - F(0) = \pi(27 - 27 + 9) = 9\pi$. De inhoud is $9\pi$.`,
    ),
  }),
  vraag({
    cluster: 'h15c_xas',
    nummer: 'cx-6',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = x$ en $g(x) = x^{2}$. Het lichaam $L$ ontstaat als $V$ wentelt om de $x$-as. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{2}{15}\pi`,
    antwoord: '(2/15)pi',
    alts: ['2pi/15', '(2/15)*pi'],
    integrand: 'pi*(x^2 - x^4)',
    primitieve: 'pi*(x^3/3 - x^5/5)',
    domein: [0, 1.5],
    grenzen: [0, 1],
    waarde: '(2/15)*pi',
    steps: vier(
      `${DEEL12} De grafieken snijden elkaar in $x = 0$ en $x = 1$. Op dat stuk ligt $y = x$ boven $y = x^{2}$. De inhoud is $\\pi$ keer de integraal van het verschil van de kwadraten.`,
      r`$I(L) = \pi \displaystyle\int_{0}^{1} \left(x^{2} - (x^{2})^{2}\right)\,\mathrm{d}x = \pi \displaystyle\int_{0}^{1} (x^{2} - x^{4})\,\mathrm{d}x$.`,
      r`Een primitieve van de integrand is $F(x) = \pi\left(\dfrac{1}{3}x^{3} - \dfrac{1}{5}x^{5}\right)$.`,
      r`$F(1) - F(0) = \pi\left(\dfrac{1}{3} - \dfrac{1}{5}\right) = \dfrac{2}{15}\pi$. De inhoud is $\dfrac{2}{15}\pi$.`,
    ),
  }),
  vraag({
    cluster: 'h15c_xas',
    nummer: 'cx-7',
    level: 3,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de lijnen $y = 2$ en $y = x$ en de $y$-as. Het lichaam $L$ ontstaat als $V$ wentelt om de $x$-as. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{16}{3}\pi`,
    antwoord: '(16/3)pi',
    alts: ['16pi/3', '(16/3)*pi'],
    integrand: 'pi*(4 - x^2)',
    primitieve: 'pi*(4*x - x^3/3)',
    domein: [0, 2],
    grenzen: [0, 2],
    waarde: '(16/3)*pi',
    steps: vier(
      `${DEEL12} De lijnen snijden elkaar in $x = 2$. Op $[0, 2]$ is de buitenste straal $2$ en de binnenste straal $x$.`,
      r`$I(L) = \pi \displaystyle\int_{0}^{2} \left(2^{2} - x^{2}\right)\,\mathrm{d}x = \pi \displaystyle\int_{0}^{2} (4 - x^{2})\,\mathrm{d}x$.`,
      r`Een primitieve van de integrand is $F(x) = \pi\left(4x - \dfrac{1}{3}x^{3}\right)$.`,
      r`$F(2) - F(0) = \pi\left(8 - \dfrac{8}{3}\right) = \dfrac{16}{3}\pi$. De inhoud is $\dfrac{16}{3}\pi$.`,
    ),
  }),
  vraag({
    cluster: 'h15c_xas',
    nummer: 'cx-8',
    level: 3,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = 2x$, de $x$-as en de lijn $x = 2$. Het lichaam $L$ ontstaat als $V$ wentelt om de $x$-as. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{32}{3}\pi`,
    antwoord: '(32/3)pi',
    alts: ['32pi/3', '(32/3)*pi'],
    integrand: 'pi*4*x^2',
    primitieve: 'pi*(4/3)*x^3',
    domein: [0, 3],
    grenzen: [0, 2],
    waarde: '(32/3)*pi',
    steps: vier(
      `${DEEL12} De straal is $2x$, dus het kwadraat is $4x^{2}$.`,
      r`$I(L) = \pi \displaystyle\int_{0}^{2} (2x)^{2}\,\mathrm{d}x = \pi \displaystyle\int_{0}^{2} 4x^{2}\,\mathrm{d}x$.`,
      r`Een primitieve van de integrand is $F(x) = \pi \cdot \dfrac{4}{3}x^{3}$.`,
      r`$F(2) - F(0) = \pi \cdot \dfrac{4}{3} \cdot 8 = \dfrac{32}{3}\pi$. De inhoud is $\dfrac{32}{3}\pi$.`,
    ),
  }),

  // ── Theorie C: wentelen om de y-as ────────────────────────────────────────
  vraag({
    cluster: 'h15c_yas',
    nummer: 'cy-1',
    level: 1,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de lijn $y = x$, de $y$-as en de lijn $y = 2$. Het lichaam $L$ ontstaat als $V$ wentelt om de $y$-as. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{8}{3}\pi`,
    antwoord: '(8/3)pi',
    alts: ['8pi/3', '(8/3)*pi'],
    integrand: 'pi*x^2',
    primitieve: 'pi*x^3/3',
    domein: [0, 3],
    grenzen: [0, 2],
    waarde: '(8/3)*pi',
    steps: vier(
      `${DEEL12} Bij wentelen om de $y$-as is de straal de $x$-waarde, en integreer je naar $y$.`,
      r`Uit $y = x$ volgt $x = y$. Met $y$ van $0$ tot $2$: $I(L) = \pi \displaystyle\int_{0}^{2} y^{2}\,\mathrm{d}y$. In de berekening hieronder heet de integratievariabele $x$.`,
      r`Een primitieve van $\pi x^{2}$ is $F(x) = \pi \cdot \dfrac{1}{3}x^{3}$.`,
      r`$F(2) - F(0) = \dfrac{8}{3}\pi$. De inhoud is $\dfrac{8}{3}\pi$.`,
    ),
  }),
  vraag({
    cluster: 'h15c_yas',
    nummer: 'cy-2',
    level: 1,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $y = \sqrt{x}$, de $x$-as en de lijn $x = 4$. Het lichaam $L$ ontstaat als $V$ wentelt om de $y$-as. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{32}{5}\pi`,
    antwoord: '(32/5)pi',
    alts: ['32pi/5', '(32/5)*pi'],
    integrand: 'pi*x^4',
    primitieve: 'pi*x^5/5',
    domein: [0, 3],
    grenzen: [0, 2],
    waarde: '(32/5)*pi',
    steps: vier(
      `${DEEL12} Schrijf $x$ als functie van $y$ en integreer het kwadraat van die straal.`,
      r`$y = \sqrt{x}$ geeft $x = y^{2}$, en $y$ loopt van $0$ tot $2$. $I(L) = \pi \displaystyle\int_{0}^{2} (y^{2})^{2}\,\mathrm{d}y = \pi \displaystyle\int_{0}^{2} y^{4}\,\mathrm{d}y$.`,
      r`Een primitieve van $\pi x^{4}$ is $F(x) = \pi \cdot \dfrac{1}{5}x^{5}$.`,
      r`$F(2) - F(0) = \pi \cdot \dfrac{32}{5} = \dfrac{32}{5}\pi$. De inhoud is $\dfrac{32}{5}\pi$.`,
    ),
  }),
  vraag({
    cluster: 'h15c_yas',
    nummer: 'cy-3',
    level: 1,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $y = x^{2}$, de $x$-as en de lijn $x = 2$. Het lichaam $L$ ontstaat als $V$ wentelt om de $y$-as. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`8\pi`,
    antwoord: '8pi',
    alts: ['8*pi'],
    integrand: 'pi*x',
    primitieve: 'pi*x^2/2',
    domein: [0, 5],
    grenzen: [0, 4],
    waarde: '8*pi',
    steps: vier(
      `${DEEL12} Druk de straal uit in $y$.`,
      r`$y = x^{2}$ met $x \ge 0$ geeft $x = \sqrt{y}$. En $y$ loopt van $0$ tot $4$. $I(L) = \pi \displaystyle\int_{0}^{4} y\,\mathrm{d}y$.`,
      r`Een primitieve van $\pi x$ is $F(x) = \pi \cdot \dfrac{1}{2}x^{2}$.`,
      r`$F(4) - F(0) = 8\pi$. De inhoud is $8\pi$.`,
    ),
  }),
  vraag({
    cluster: 'h15c_yas',
    nummer: 'cy-4',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de lijn $y = 2x$, de $y$-as en de lijn $y = 4$. Het lichaam $L$ ontstaat als $V$ wentelt om de $y$-as. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{16}{3}\pi`,
    antwoord: '(16/3)pi',
    alts: ['16pi/3', '(16/3)*pi'],
    integrand: 'pi*(x/2)^2',
    primitieve: 'pi*x^3/12',
    domein: [0, 5],
    grenzen: [0, 4],
    waarde: '(16/3)*pi',
    steps: vier(
      `${DEEL12} Uit $y = 2x$ volgt de straal $x = \dfrac{1}{2}y$.`,
      r`$y$ loopt van $0$ tot $4$. $I(L) = \pi \displaystyle\int_{0}^{4} \left(\dfrac{y}{2}\right)^{2}\,\mathrm{d}y = \pi \displaystyle\int_{0}^{4} \dfrac{1}{4}y^{2}\,\mathrm{d}y$.`,
      r`Een primitieve van $\pi\left(\dfrac{x}{2}\right)^{2}$ is $F(x) = \pi \cdot \dfrac{1}{12}x^{3}$.`,
      r`$F(4) - F(0) = \pi \cdot \dfrac{64}{12} = \dfrac{16}{3}\pi$. De inhoud is $\dfrac{16}{3}\pi$.`,
    ),
  }),
  vraag({
    cluster: 'h15c_yas',
    nummer: 'cy-5',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de lijnen $y = x$ en $y = 2x$ en de lijn $y = 2$. Het lichaam $L$ ontstaat als $V$ wentelt om de $y$-as. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`2\pi`,
    antwoord: '2pi',
    alts: ['2*pi'],
    integrand: 'pi*(x^2 - (x/2)^2)',
    primitieve: 'pi*x^3/4',
    domein: [0, 3],
    grenzen: [0, 2],
    waarde: '2*pi',
    steps: vier(
      `${DEEL12} Op een hoogte $y$ loopt het vlakdeel van de lijn $y = 2x$ tot de lijn $y = x$. De buitenste straal is $y$, de binnenste is $\\dfrac{1}{2}y$.`,
      r`$I(L) = \pi \displaystyle\int_{0}^{2} \left(y^{2} - \left(\dfrac{y}{2}\right)^{2}\right)\,\mathrm{d}y = \pi \displaystyle\int_{0}^{2} \dfrac{3}{4}y^{2}\,\mathrm{d}y$.`,
      r`Een primitieve van $\pi\left(x^{2} - \left(\dfrac{x}{2}\right)^{2}\right)$ is $F(x) = \pi \cdot \dfrac{1}{4}x^{3}$.`,
      r`$F(2) - F(0) = \pi \cdot 2 = 2\pi$. De inhoud is $2\pi$.`,
    ),
  }),
  vraag({
    cluster: 'h15c_yas',
    nummer: 'cy-6',
    level: 2,
    latex: r`Het vlakdeel $V$ is de rechthoek met hoekpunten $(0, 0)$, $(3, 0)$, $(3, 2)$ en $(0, 2)$. Het lichaam $L$ ontstaat als $V$ wentelt om de $y$-as. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`18\pi`,
    antwoord: '18pi',
    alts: ['18*pi'],
    integrand: '9*pi',
    primitieve: '9*pi*x',
    domein: [0, 3],
    grenzen: [0, 2],
    waarde: '18*pi',
    steps: vier(
      `${DEEL12} De straal is overal $3$, en de hoogte loopt van $y = 0$ tot $y = 2$.`,
      r`$I(L) = \pi \displaystyle\int_{0}^{2} 3^{2}\,\mathrm{d}y = \pi \displaystyle\int_{0}^{2} 9\,\mathrm{d}y$.`,
      r`Een primitieve van $9\pi$ is $F(x) = 9\pi x$.`,
      r`$F(2) - F(0) = 18\pi$. De inhoud is $18\pi$.`,
    ),
  }),
  vraag({
    cluster: 'h15c_yas',
    nummer: 'cy-7',
    level: 3,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $y = 4 - x^{2}$ en de coördinaatassen in het eerste kwadrant. Het lichaam $L$ ontstaat als $V$ wentelt om de $y$-as. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`8\pi`,
    antwoord: '8pi',
    alts: ['8*pi'],
    integrand: 'pi*(4 - x)',
    primitieve: 'pi*(4*x - x^2/2)',
    domein: [0, 4],
    grenzen: [0, 4],
    waarde: '8*pi',
    steps: vier(
      `${DEEL12} In het eerste kwadrant loopt $y$ van $0$ tot $4$. De straal is de bijbehorende $x$.`,
      r`Uit $y = 4 - x^{2}$ volgt $x^{2} = 4 - y$, met $x \ge 0$. $I(L) = \pi \displaystyle\int_{0}^{4} (4 - y)\,\mathrm{d}y$.`,
      r`Een primitieve van $\pi(4 - x)$ is $F(x) = \pi\left(4x - \dfrac{1}{2}x^{2}\right)$.`,
      r`$F(4) - F(0) = \pi(16 - 8) = 8\pi$. De inhoud is $8\pi$.`,
    ),
  }),
  vraag({
    cluster: 'h15c_yas',
    nummer: 'cy-8',
    level: 3,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafieken van $x = y$ en $x = y^{2}$, met $0 \le y \le 1$. Het lichaam $L$ ontstaat als $V$ wentelt om de $y$-as. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{2}{15}\pi`,
    antwoord: '(2/15)pi',
    alts: ['2pi/15', '(2/15)*pi'],
    integrand: 'pi*(x^2 - x^4)',
    primitieve: 'pi*(x^3/3 - x^5/5)',
    domein: [0, 1.5],
    grenzen: [0, 1],
    waarde: '(2/15)*pi',
    steps: vier(
      `${DEEL12} Op $[0, 1]$ is $y \ge y^{2}$, dus de buitenste straal is $y$ en de binnenste is $y^{2}$.`,
      r`$I(L) = \pi \displaystyle\int_{0}^{1} \left(y^{2} - (y^{2})^{2}\right)\,\mathrm{d}y = \pi \displaystyle\int_{0}^{1} (y^{2} - y^{4})\,\mathrm{d}y$.`,
      r`Een primitieve van $\pi(x^{2} - x^{4})$ is $F(x) = \pi\left(\dfrac{1}{3}x^{3} - \dfrac{1}{5}x^{5}\right)$.`,
      r`$F(1) - F(0) = \pi\left(\dfrac{1}{3} - \dfrac{1}{5}\right) = \dfrac{2}{15}\pi$. De inhoud is $\dfrac{2}{15}\pi$.`,
    ),
  }),

  // ── Theorie C: twee inhouden vergelijken ──────────────────────────────────
  vraag({
    cluster: 'h15c_vergelijk',
    nummer: 'cv-1',
    level: 1,
    latex: r`Voor elke $p > 0$ ontstaat het lichaam $L_p$ als het vlakdeel onder $y = x$ van $x = 0$ tot $x = p$ wentelt om de $x$-as. Bereken exact de waarde van $p$ waarvoor de inhoud van $L_p$ gelijk is aan $9\pi$.`,
    antwoordLatex: r`p = 3`,
    antwoord: '3',
    alts: ['p = 3', 'p=3'],
    integrand: 'pi*x^2',
    primitieve: 'pi*x^3/3',
    domein: [0, 4],
    grenzen: [0, 3],
    waarde: '9*pi',
    steps: vier(
      DEEL123,
      r`$I(L_p) = \pi \displaystyle\int_{0}^{p} x^{2}\,\mathrm{d}x$.`,
      r`Een primitieve van $x^{2}$ is $\dfrac{1}{3}x^{3}$. Dus $I(L_p) = \pi \cdot \dfrac{1}{3}p^{3}$.`,
      r`Deel 3: $\dfrac{1}{3}p^{3} = 9$, dus $p^{3} = 27$ en $p = 3$.`,
    ),
  }),
  vraag({
    cluster: 'h15c_vergelijk',
    nummer: 'cv-2',
    level: 1,
    latex: r`Voor elke $p > 0$ ontstaat het lichaam $L_p$ als het vlakdeel onder $y = \sqrt{x}$ van $x = 0$ tot $x = p$ wentelt om de $x$-as. Bereken exact de waarde van $p$ waarvoor de inhoud van $L_p$ gelijk is aan $8\pi$.`,
    antwoordLatex: r`p = 4`,
    antwoord: '4',
    alts: ['p = 4', 'p=4'],
    integrand: 'pi*x',
    primitieve: 'pi*x^2/2',
    domein: [0, 5],
    grenzen: [0, 4],
    waarde: '8*pi',
    steps: vier(
      DEEL123,
      r`$I(L_p) = \pi \displaystyle\int_{0}^{p} x\,\mathrm{d}x$, want $\left(\sqrt{x}\right)^{2} = x$.`,
      r`Een primitieve van $x$ is $\dfrac{1}{2}x^{2}$. Dus $I(L_p) = \pi \cdot \dfrac{1}{2}p^{2}$.`,
      r`Deel 3: $\dfrac{1}{2}p^{2} = 8$, dus $p^{2} = 16$ en $p = 4$.`,
    ),
  }),
  vraag({
    cluster: 'h15c_vergelijk',
    nummer: 'cv-3',
    level: 2,
    latex: r`Voor elke $a > 0$ wordt het vlakdeel onder $y = x^{2}$ van $x = 0$ tot $x = a$ bekeken. Lichaam $L$ ontstaat bij wentelen om de $x$-as, lichaam $M$ bij wentelen om de $y$-as. Bereken exact de waarde van $a$ waarvoor de inhoud van $L$ gelijk is aan de inhoud van $M$.`,
    antwoordLatex: r`a = \dfrac{5}{2}`,
    antwoord: '5/2',
    alts: ['a = 5/2', 'a=5/2', '2,5', '2.5'],
    integrand: 'pi*x^4',
    primitieve: 'pi*x^5/5',
    domein: [0, 3],
    grenzen: [0, 2.5],
    waarde: '(625/32)*pi',
    steps: vier(
      DEEL123,
      r`$I(L) = \pi \displaystyle\int_{0}^{a} x^{4}\,\mathrm{d}x = \pi \cdot \dfrac{1}{5}a^{5}$. Voor $M$ geldt $x = \sqrt{y}$ en $y$ loopt van $0$ tot $a^{2}$, dus $I(M) = \pi \displaystyle\int_{0}^{a^{2}} y\,\mathrm{d}y = \pi \cdot \dfrac{1}{2}a^{4}$.`,
      r`Stel $I(L) = I(M)$: $\dfrac{1}{5}a^{5} = \dfrac{1}{2}a^{4}$. Deel door $a^{4}$, dat mag omdat $a > 0$: $\dfrac{1}{5}a = \dfrac{1}{2}$.`,
      r`Deel 3: $a = \dfrac{5}{2}$.`,
    ),
  }),
  vraag({
    cluster: 'h15c_vergelijk',
    nummer: 'cv-4',
    level: 2,
    latex: r`Voor elke $k > 0$ ontstaat het lichaam $L_k$ als de rechthoek onder $y = k$ van $x = 0$ tot $x = 2$ wentelt om de $x$-as. Bereken exact de waarde van $k$ waarvoor de inhoud van $L_k$ gelijk is aan $18\pi$.`,
    antwoordLatex: r`k = 3`,
    antwoord: '3',
    alts: ['k = 3', 'k=3'],
    integrand: '9*pi',
    primitieve: '9*pi*x',
    domein: [0, 3],
    grenzen: [0, 2],
    waarde: '18*pi',
    steps: vier(
      DEEL123,
      r`$I(L_k) = \pi \displaystyle\int_{0}^{2} k^{2}\,\mathrm{d}x = 2\pi k^{2}$.`,
      r`De vergelijking is $2k^{2} = 18$, dus $k^{2} = 9$.`,
      r`Deel 3: $k > 0$, dus $k = 3$.`,
    ),
  }),
  vraag({
    cluster: 'h15c_vergelijk',
    nummer: 'cv-5',
    level: 2,
    latex: r`Voor elke $p > 0$ ontstaat het lichaam $L_p$ als het vlakdeel onder $y = \sqrt{x}$ van $x = 0$ tot $x = p$ wentelt om de $y$-as. Bereken exact de waarde van $p$ waarvoor de inhoud van $L_p$ gelijk is aan $\dfrac{32}{5}\pi$.`,
    antwoordLatex: r`p = 4`,
    antwoord: '4',
    alts: ['p = 4', 'p=4'],
    integrand: 'pi*x^4',
    primitieve: 'pi*x^5/5',
    domein: [0, 3],
    grenzen: [0, 2],
    waarde: '(32/5)*pi',
    steps: vier(
      DEEL123,
      r`$y$ loopt van $0$ tot $\sqrt{p}$ en de straal is $x = y^{2}$. $I(L_p) = \pi \displaystyle\int_{0}^{\sqrt{p}} y^{4}\,\mathrm{d}y = \pi \cdot \dfrac{1}{5}p^{5/2}$.`,
      r`Stel $\dfrac{1}{5}p^{5/2} = \dfrac{32}{5}$. Dan $p^{5/2} = 32 = 2^{5}$.`,
      r`Deel 3: $\sqrt{p} = 2$, dus $p = 4$.`,
    ),
  }),
  vraag({
    cluster: 'h15c_vergelijk',
    nummer: 'cv-6',
    level: 3,
    latex: r`Lichaam $L$ ontstaat als het vlakdeel onder $y = x$ van $x = 0$ tot $x = 2$ wentelt om de $x$-as. Lichaam $M_p$ ontstaat op dezelfde manier, maar tot $x = p$ met $p > 0$. Bereken exact de waarde van $p$ waarvoor de inhoud van $M_p$ twee keer zo groot is als de inhoud van $L$.`,
    antwoordLatex: r`p = \sqrt[3]{16}`,
    antwoord: '16^(1/3)',
    alts: ['2*2^(1/3)', 'p = 16^(1/3)'],
    integrand: 'pi*x^2',
    primitieve: 'pi*x^3/3',
    domein: [0, 3],
    grenzen: [0, 16 ** (1 / 3)],
    waarde: '(16/3)*pi',
    steps: vier(
      DEEL123,
      r`$I(L) = \pi \displaystyle\int_{0}^{2} x^{2}\,\mathrm{d}x = \pi \cdot \dfrac{8}{3}$. En $I(M_p) = \pi \cdot \dfrac{1}{3}p^{3}$.`,
      r`Twee keer de inhoud van $L$ is $\dfrac{16}{3}\pi$. Dus $\dfrac{1}{3}p^{3} = \dfrac{16}{3}$.`,
      r`Deel 3: $p^{3} = 16$, dus $p = \sqrt[3]{16}$.`,
    ),
  }),
  vraag({
    cluster: 'h15c_vergelijk',
    nummer: 'cv-7',
    level: 3,
    latex: r`Voor elke $a > 0$ wordt het vlakdeel onder $y = \sqrt{x}$ van $x = 0$ tot $x = a$ bekeken. Lichaam $L$ ontstaat bij wentelen om de $x$-as, lichaam $M$ bij wentelen om de $y$-as. Bereken exact de waarde van $a$ waarvoor de inhoud van $L$ gelijk is aan de inhoud van $M$.`,
    antwoordLatex: r`a = \dfrac{25}{4}`,
    antwoord: '25/4',
    alts: ['a = 25/4', 'a=25/4', '6,25', '6.25'],
    integrand: 'pi*x',
    primitieve: 'pi*x^2/2',
    domein: [0, 7],
    grenzen: [0, 6.25],
    waarde: '(625/32)*pi',
    steps: vier(
      DEEL123,
      r`$I(L) = \pi \displaystyle\int_{0}^{a} x\,\mathrm{d}x = \pi \cdot \dfrac{1}{2}a^{2}$. Voor $M$ loopt $y$ van $0$ tot $\sqrt{a}$ en is de straal $y^{2}$, dus $I(M) = \pi \displaystyle\int_{0}^{\sqrt{a}} y^{4}\,\mathrm{d}y = \pi \cdot \dfrac{1}{5}a^{5/2}$.`,
      r`Stel $\dfrac{1}{2}a^{2} = \dfrac{1}{5}a^{5/2}$. Deel door $a^{2}$, dat mag omdat $a > 0$: $\dfrac{1}{2} = \dfrac{1}{5}\sqrt{a}$.`,
      r`Deel 3: $\sqrt{a} = \dfrac{5}{2}$, dus $a = \dfrac{25}{4}$.`,
    ),
  }),
  vraag({
    cluster: 'h15c_vergelijk',
    nummer: 'cv-8',
    level: 3,
    latex: r`Lichaam $L$ ontstaat als het vlakdeel tussen $y = 2$ en $y = x$ op $[0, 2]$ wentelt om de $x$-as. Voor elke $q > 0$ ontstaat lichaam $M_q$ als de rechthoek onder $y = q$ van $x = 0$ tot $x = 3$ wentelt om de $x$-as. Bereken exact de waarde van $q$ waarvoor de inhoud van $M_q$ gelijk is aan de inhoud van $L$.`,
    antwoordLatex: r`q = \dfrac{4}{3}`,
    antwoord: '4/3',
    alts: ['q = 4/3', 'q=4/3'],
    integrand: 'pi*(16/9)',
    primitieve: 'pi*(16/9)*x',
    domein: [0, 4],
    grenzen: [0, 3],
    waarde: '(16/3)*pi',
    steps: vier(
      DEEL123,
      r`$I(L) = \pi \displaystyle\int_{0}^{2} (4 - x^{2})\,\mathrm{d}x = \pi\left[4x - \dfrac{1}{3}x^{3}\right]_{0}^{2} = \dfrac{16}{3}\pi$. En $I(M_q) = \pi \displaystyle\int_{0}^{3} q^{2}\,\mathrm{d}x = 3\pi q^{2}$.`,
      r`Stel $3q^{2} = \dfrac{16}{3}$. Dan $q^{2} = \dfrac{16}{9}$.`,
      r`Deel 3: $q > 0$, dus $q = \dfrac{4}{3}$.`,
    ),
  }),
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

const H154: AdditiveChapter = {
  chapterSlug: 'h15',
  chapterTitle: 'H15 — Afgeleiden en primitieven',
  bookPart: 4,
  chapterOrder: 15,
  site: 'integralen',
  migrationFile: '0055_h154_oppervlakte_en_inhoud.sql',
  headerTitle: 'H15.4 — Integralen bij oppervlakte en inhoud',
  sourceScript: 'scripts/h154-content.ts',
  headerNotes: [
    'Nieuw hoofdstuk H15, alleen paragraaf 15.4. Drie theorieblokken:',
    'A eerstegraads gebroken functies, B verhouding van oppervlakten,',
    'C wentelen om de x-as en om de y-as.',
    '',
    'Acht clusters, acht vragen per cluster.',
    '',
    'De volgorde van het hoofdstuk is 15, na hoofdstuk K (volgorde 12).',
    '',
    'Eigen oefenvragen, geen boekopgaven. Elke integraal wordt nagerekend door',
    'src/content/primitieven.test.ts (content/hoofdstuk-h15/h154.json).',
  ],
  topics: [
    { slug: 'h15a_primitiveren', title: 'Eerstegraads gebroken functies primitiveren', order: 40, category: 'primitiveren' },
    { slug: 'h15a_bepaald', title: 'Bepaalde integralen van gebroken functies', order: 41, category: 'integralen' },
    { slug: 'h15a_oppervlakte', title: 'Oppervlakte bij gebroken functies', order: 42, category: 'toepassingen' },
    { slug: 'h15b_verhouding', title: 'Verhouding van oppervlakten', order: 43, category: 'toepassingen' },
    { slug: 'h15b_parameter', title: 'Oppervlakte en de waarde van p', order: 44, category: 'toepassingen' },
    { slug: 'h15c_xas', title: 'Wentelen om de x-as', order: 45, category: 'toepassingen' },
    { slug: 'h15c_yas', title: 'Wentelen om de y-as', order: 46, category: 'toepassingen' },
    { slug: 'h15c_vergelijk', title: 'Twee inhouden vergelijken', order: 47, category: 'toepassingen' },
  ],
  clusters: [
    { topic: 'h15a_primitiveren', slug: 'h15a_primitief', title: 'Breuk herschrijven en primitiveren', order: 1 },
    { topic: 'h15a_bepaald', slug: 'h15a_bepaald', title: 'Bereken exact', order: 1 },
    { topic: 'h15a_oppervlakte', slug: 'h15a_oppervlakte', title: 'Oppervlakte en de waarde van a of p', order: 1 },
    { topic: 'h15b_verhouding', slug: 'h15b_verhouding', title: 'De verhouding van twee vlakdelen', order: 1 },
    { topic: 'h15b_parameter', slug: 'h15b_parameter', title: 'Parameter bij een gegeven oppervlakte', order: 1 },
    { topic: 'h15c_xas', slug: 'h15c_xas', title: 'Inhoud bij wentelen om de x-as', order: 1 },
    { topic: 'h15c_yas', slug: 'h15c_yas', title: 'Inhoud bij wentelen om de y-as', order: 1 },
    { topic: 'h15c_vergelijk', slug: 'h15c_vergelijk', title: 'Parameter zodat twee inhouden kloppen', order: 1 },
  ],
  questions: VRAGEN,
}

const wortel = process.cwd()
const contentMap = path.join(wortel, 'content', 'hoofdstuk-h15')
mkdirSync(contentMap, { recursive: true })
const contentPad = path.join(contentMap, 'h154.json')
writeFileSync(
  contentPad,
  generateContentFile(H154, '15.4 — Integralen bij oppervlakte en inhoud (eigen varianten)'),
)

const migratiePad = path.join(wortel, 'supabase', 'migrations', H154.migrationFile)
let sql = voegTheorieblokToe(generateAdditiveMigration(H154), {
  chapterSlug: 'h15',
  paragraphSlug: 'h15-4',
  paragraphLabel: '15.4',
  paragraphTitle: 'Integralen bij oppervlakte en inhoud',
  paragraphOrder: 1,
  blockSlug: 'h15a',
  blockLetter: 'A',
  blockTitle: 'Integralen bij eerstegraads gebroken functies',
  blockOrder: 1,
  topics: ['h15a_primitiveren', 'h15a_bepaald', 'h15a_oppervlakte'],
})

const extraBlokken = `INSERT INTO public.theory_blocks (paragraph_id, site, slug, letter, title, order_index)
SELECT p.id, 'integralen', 'h15b', 'B', 'Verhouding van oppervlakten', 2
FROM public.paragraphs p
WHERE p.slug = 'h15-4' AND p.site = 'integralen'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.theory_blocks (paragraph_id, site, slug, letter, title, order_index)
SELECT p.id, 'integralen', 'h15c', 'C', 'Wentelen om de x-as en om de y-as', 3
FROM public.paragraphs p
WHERE p.slug = 'h15-4' AND p.site = 'integralen'
ON CONFLICT (slug) DO NOTHING;

`

const koppelRest = `-- 6b. Topics van theorieblok B en C koppelen
UPDATE public.topics_new AS t
SET theory_block_id = b.id
FROM (VALUES
  ('h15b_verhouding', 'h15b'),
  ('h15b_parameter', 'h15b'),
  ('h15c_xas', 'h15c'),
  ('h15c_yas', 'h15c'),
  ('h15c_vergelijk', 'h15c')
) AS v(topic_slug, block_slug)
JOIN public.theory_blocks b ON b.slug = v.block_slug AND b.site = 'integralen'
WHERE t.slug = v.topic_slug
  AND t.site = 'integralen'
  AND t.theory_block_id IS DISTINCT FROM b.id;

DO $blokbc$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n
  FROM public.topics_new t
  JOIN public.theory_blocks b ON b.id = t.theory_block_id
  WHERE t.site = 'integralen'
    AND b.slug = 'h15b'
    AND t.slug IN ('h15b_verhouding', 'h15b_parameter');
  IF n <> 2 THEN
    RAISE EXCEPTION 'Theorieblok h15b hoort 2 topics te hebben, gevonden %', n;
  END IF;
  SELECT count(*) INTO n
  FROM public.topics_new t
  JOIN public.theory_blocks b ON b.id = t.theory_block_id
  WHERE t.site = 'integralen'
    AND b.slug = 'h15c'
    AND t.slug IN ('h15c_xas', 'h15c_yas', 'h15c_vergelijk');
  IF n <> 3 THEN
    RAISE EXCEPTION 'Theorieblok h15c hoort 3 topics te hebben, gevonden %', n;
  END IF;
END $blokbc$;

`

const ankerA = `WHERE p.slug = 'h15-4' AND p.site = 'integralen'
ON CONFLICT (slug) DO NOTHING;
`
if (!sql.includes(ankerA)) throw new Error('Geen plek voor theorieblok B en C')
sql = sql.replace(ankerA, `${ankerA}\n${extraBlokken}`)
if (!sql.includes('-- 7. Controle')) throw new Error('Geen plek voor de koppeling van B en C')
sql = sql.replace('-- 7. Controle', `${koppelRest}-- 7. Controle`)
sql = sql.replace(
  'De enige UPDATE zet theory_block_id op de topics van dit blok,',
  'De UPDATEs zetten theory_block_id op de topics van 15.4 A, B en C,',
)

writeFileSync(migratiePad, sql)

console.log(`Geschreven: ${contentPad}`)
console.log(`Geschreven: ${migratiePad}`)
console.log(`Vragen: ${H154.questions.length}, stappen: ${H154.questions.length * 4}`)
