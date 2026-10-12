/**
 * K.4 Theorie A — Staartdelingen.
 *
 * Een breuk waarvan de teller minstens zo lang is als de lineaire noemer,
 * deel je eerst: polynoom plus een restbreuk met constante teller. Die rest
 * geeft een logaritme.
 *
 * Draaien met:  npx jiti scripts/k4a-content.ts
 *
 * Schrijft:
 *   • content/hoofdstuk-k/k4a.json
 *   • supabase/migrations/0051_k4a_staartdelingen.sql
 *
 * Eigen oefenvragen. De boekopgaven staan alleen lokaal in content-bron/.
 */
import { writeFileSync } from 'node:fs'
import path from 'node:path'

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
const DEEL2_BEPAALD = `${DEEL2} Eerst een primitieve zoeken, daarna de grenzen invullen. Het antwoord blijft exact.`
const DRIEDELING = r`Hier spelen alle drie de delen van de driedeling: eerst het verhaaltje vertalen naar een integraal (deel 1), dan die integraal berekenen (deel 2), en daarna nog iets doen met de uitkomst (deel 3).`
const SCHIL = r`Buitenste schil: een breuk met een lineaire noemer, en een teller die minstens even lang is → staartdeling. Er komt een polynoom uit plus een restbreuk met een constante teller, en die rest geeft een logaritme.`
const CONTROLE = r`Controle: differentieer $F$ en je krijgt $f$ terug.`

function primitiveren(s: { deling: string; regel: string; antwoord: string }): Steps {
  return [`${DEEL2} ${SCHIL}`, s.deling, s.regel, `${s.antwoord} ${CONTROLE}`]
}

function bepaald(s: { deling: string; primitieve: string; invullen: string }): Steps {
  return [`${DEEL2_BEPAALD} ${SCHIL}`, s.deling, s.primitieve, s.invullen]
}

function oppervlakte(s: { integraal: string; deling: string; primitieve: string; uitkomst: string }): Steps {
  return [`${DRIEDELING} ${s.integraal}`, s.deling, s.primitieve, s.uitkomst]
}

const VRAGEN: AdditiveQ[] = [
  {
    cluster: 'k4a_staart',
    nummer: 'st-1',
    level: 1,
    latex: r`Primitiveer: $f(x) = \dfrac{3x + 7}{x + 2}$`,
    antwoordLatex: r`F(x) = 3x + \ln|x + 2| + c`,
    antwoord: '3x + ln(abs(x + 2)) + c',
    integrand: '(3 * x + 7) / (x + 2)',
    primitieve: '3 * x + ln(abs(x + 2))',
    domein: [-1, 2],
    steps: primitiveren({
      deling: r`Deel $3x + 7$ door $x + 2$. Omdat $3(x + 2) = 3x + 6$, blijft er $1$ over: $f(x) = 3 + \dfrac{1}{x + 2}$.`,
      regel: r`Het getal $3$ geeft $3x$. De rest is de standaardvorm $\dfrac{1}{x}$: $\displaystyle\int \dfrac{1}{x + 2}\,\mathrm{d}x = \ln|x + 2|$. De noemer is al van de vorm $x + b$, dus je hoeft niet nog eens te delen.`,
      antwoord: r`Dus $F(x) = 3x + \ln|x + 2| + c$.`,
    }),
  },
  {
    cluster: 'k4a_staart',
    nummer: 'st-2',
    level: 1,
    latex: r`Primitiveer: $f(x) = \dfrac{5x - 3}{x - 1}$`,
    antwoordLatex: r`F(x) = 5x + 2\ln|x - 1| + c`,
    antwoord: '5x + 2ln(abs(x - 1)) + c',
    integrand: '(5 * x - 3) / (x - 1)',
    primitieve: '5 * x + 2 * ln(abs(x - 1))',
    domein: [2, 4],
    steps: primitiveren({
      deling: r`Deel $5x - 3$ door $x - 1$. Omdat $5(x - 1) = 5x - 5$, blijft er $2$ over: $f(x) = 5 + \dfrac{2}{x - 1}$.`,
      regel: r`Het getal $5$ geeft $5x$. De rest: $\displaystyle\int \dfrac{2}{x - 1}\,\mathrm{d}x = 2\ln|x - 1|$.`,
      antwoord: r`Dus $F(x) = 5x + 2\ln|x - 1| + c$.`,
    }),
  },
  {
    cluster: 'k4a_staart',
    nummer: 'st-3',
    level: 1,
    latex: r`Primitiveer: $f(x) = \dfrac{6x + 3}{3x - 1}$`,
    antwoordLatex: r`F(x) = 2x + \tfrac{5}{3}\ln|3x - 1| + c`,
    antwoord: '2x + (5/3)ln(abs(3x - 1)) + c',
    integrand: '(6 * x + 3) / (3 * x - 1)',
    primitieve: '2 * x + (5/3) * ln(abs(3 * x - 1))',
    domein: [1, 3],
    steps: primitiveren({
      deling: r`Deel $6x + 3$ door $3x - 1$. Omdat $2(3x - 1) = 6x - 2$, blijft er $5$ over: $f(x) = 2 + \dfrac{5}{3x - 1}$.`,
      regel: r`Het getal $2$ geeft $2x$. Bij de rest staat in de noemer $3x - 1$, dus $a = 3$: primitiveer alsof er $x$ staat en deel daarna door $3$. $\displaystyle\int \dfrac{5}{3x - 1}\,\mathrm{d}x = \tfrac{5}{3}\ln|3x - 1|$.`,
      antwoord: r`Dus $F(x) = 2x + \tfrac{5}{3}\ln|3x - 1| + c$.`,
    }),
  },
  {
    cluster: 'k4a_staart',
    nummer: 'st-4',
    level: 2,
    latex: r`Primitiveer: $f(x) = \dfrac{x^{2} + 5x}{x + 2}$`,
    antwoordLatex: r`F(x) = \tfrac{1}{2}x^{2} + 3x - 6\ln|x + 2| + c`,
    antwoord: '(1/2)x^2 + 3x - 6ln(abs(x + 2)) + c',
    integrand: '(x^2 + 5 * x) / (x + 2)',
    primitieve: '(1/2) * x^2 + 3 * x - 6 * ln(abs(x + 2))',
    domein: [-1, 2],
    steps: primitiveren({
      deling: r`De teller is nu een kwadraat, dus het quotiënt is lineair. $(x + 2)(x + 3) = x^{2} + 5x + 6$, en de teller is $6$ kleiner: $f(x) = x + 3 - \dfrac{6}{x + 2}$.`,
      regel: r`$x + 3$ geeft $\tfrac{1}{2}x^{2} + 3x$. De rest geeft $-6\ln|x + 2|$.`,
      antwoord: r`Dus $F(x) = \tfrac{1}{2}x^{2} + 3x - 6\ln|x + 2| + c$.`,
    }),
  },
  {
    cluster: 'k4a_staart',
    nummer: 'st-5',
    level: 2,
    latex: r`Primitiveer: $f(x) = \dfrac{2x^{2} + x + 3}{x + 1}$`,
    antwoordLatex: r`F(x) = x^{2} - x + 4\ln|x + 1| + c`,
    antwoord: 'x^2 - x + 4ln(abs(x + 1)) + c',
    integrand: '(2 * x^2 + x + 3) / (x + 1)',
    primitieve: 'x^2 - x + 4 * ln(abs(x + 1))',
    domein: [0, 3],
    steps: primitiveren({
      deling: r`$(x + 1)(2x - 1) = 2x^{2} + x - 1$. De teller is $4$ groter, dus $f(x) = 2x - 1 + \dfrac{4}{x + 1}$.`,
      regel: r`$2x - 1$ geeft $x^{2} - x$. De rest geeft $4\ln|x + 1|$.`,
      antwoord: r`Dus $F(x) = x^{2} - x + 4\ln|x + 1| + c$.`,
    }),
  },
  {
    cluster: 'k4a_staart',
    nummer: 'st-6',
    level: 2,
    latex: r`Primitiveer: $f(x) = \dfrac{x^{2} - 9}{x - 3}$`,
    antwoordLatex: r`F(x) = \tfrac{1}{2}x^{2} + 3x + c`,
    antwoord: '(1/2)x^2 + 3x + c',
    integrand: '(x^2 - 9) / (x - 3)',
    primitieve: '(1/2) * x^2 + 3 * x',
    domein: [0, 2],
    steps: primitiveren({
      deling: r`Dit is een merkwaardig product: $x^{2} - 9 = (x - 3)(x + 3)$. Voor $x \ne 3$ blijft er dus alleen $x + 3$ over. De rest is $0$; er komt geen logaritme.`,
      regel: r`Primitiveer $x + 3$: dat geeft $\tfrac{1}{2}x^{2} + 3x$.`,
      antwoord: r`Dus $F(x) = \tfrac{1}{2}x^{2} + 3x + c$. De breuk zelf bestaat niet bij $x = 3$, maar de primitieve wel.`,
    }),
  },
  {
    cluster: 'k4a_staart',
    nummer: 'st-7',
    level: 3,
    latex: r`Primitiveer: $f(x) = \dfrac{x^{3} + 2}{x - 1}$`,
    antwoordLatex: r`F(x) = \tfrac{1}{3}x^{3} + \tfrac{1}{2}x^{2} + x + 3\ln|x - 1| + c`,
    antwoord: '(1/3)x^3 + (1/2)x^2 + x + 3ln(abs(x - 1)) + c',
    integrand: '(x^3 + 2) / (x - 1)',
    primitieve: '(1/3) * x^3 + (1/2) * x^2 + x + 3 * ln(abs(x - 1))',
    domein: [2, 4],
    steps: primitiveren({
      deling: r`De teller is een derdegraads, dus het quotiënt is een kwadraat. Deel $x^{3} + 0x^{2} + 0x + 2$ door $x - 1$: het quotiënt is $x^{2} + x + 1$ en de rest is $3$. Dus $f(x) = x^{2} + x + 1 + \dfrac{3}{x - 1}$.`,
      regel: r`$x^{2} + x + 1$ geeft $\tfrac{1}{3}x^{3} + \tfrac{1}{2}x^{2} + x$. De rest geeft $3\ln|x - 1|$.`,
      antwoord: r`Dus $F(x) = \tfrac{1}{3}x^{3} + \tfrac{1}{2}x^{2} + x + 3\ln|x - 1| + c$.`,
    }),
  },
  {
    cluster: 'k4a_staart',
    nummer: 'st-8',
    level: 3,
    latex: r`Primitiveer: $f(x) = \dfrac{x^{3} - x^{2} + 1}{x + 1}$`,
    antwoordLatex: r`F(x) = \tfrac{1}{3}x^{3} - x^{2} + 2x - \ln|x + 1| + c`,
    antwoord: '(1/3)x^3 - x^2 + 2x - ln(abs(x + 1)) + c',
    integrand: '(x^3 - x^2 + 1) / (x + 1)',
    primitieve: '(1/3) * x^3 - x^2 + 2 * x - ln(abs(x + 1))',
    domein: [0, 3],
    steps: primitiveren({
      deling: r`Deel $x^{3} - x^{2} + 0x + 1$ door $x + 1$. Het quotiënt is $x^{2} - 2x + 2$ en de rest is $-1$: $f(x) = x^{2} - 2x + 2 - \dfrac{1}{x + 1}$.`,
      regel: r`$x^{2} - 2x + 2$ geeft $\tfrac{1}{3}x^{3} - x^{2} + 2x$. De rest geeft $-\ln|x + 1|$.`,
      antwoord: r`Dus $F(x) = \tfrac{1}{3}x^{3} - x^{2} + 2x - \ln|x + 1| + c$.`,
    }),
  },

  {
    cluster: 'k4a_bepaald',
    nummer: 'bd-1',
    level: 1,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{1} \dfrac{3x + 7}{x + 2}\,\mathrm{d}x$`,
    antwoordLatex: r`3 + \ln\left(\tfrac{3}{2}\right)`,
    antwoord: '3 + ln(3/2)',
    alts: ['3 + ln(3) - ln(2)', '3 + ln(1,5)'],
    integrand: '(3 * x + 7) / (x + 2)',
    primitieve: '3 * x + ln(x + 2)',
    domein: [-1, 2],
    grenzen: [0, 1],
    waarde: '3 + ln(3/2)',
    steps: bepaald({
      deling: r`Deel eerst: $3(x + 2) = 3x + 6$, dus $\dfrac{3x + 7}{x + 2} = 3 + \dfrac{1}{x + 2}$. Op $[0, 1]$ is $x + 2$ positief, dus de absoluutstrepen mogen straks weg.`,
      primitieve: r`Een primitieve is $F(x) = 3x + \ln(x + 2)$.`,
      invullen: r`Vul de grenzen in: $F(1) - F(0) = \left(3 + \ln 3\right) - \ln 2 = 3 + \ln\left(\tfrac{3}{2}\right)$.`,
    }),
  },
  {
    cluster: 'k4a_bepaald',
    nummer: 'bd-2',
    level: 1,
    latex: r`Bereken exact: $\displaystyle\int_{2}^{4} \dfrac{5x - 3}{x - 1}\,\mathrm{d}x$`,
    antwoordLatex: r`10 + 2\ln(3)`,
    antwoord: '10 + 2ln(3)',
    integrand: '(5 * x - 3) / (x - 1)',
    primitieve: '5 * x + 2 * ln(x - 1)',
    domein: [2, 5],
    grenzen: [2, 4],
    waarde: '10 + 2 * ln(3)',
    steps: bepaald({
      deling: r`Deel eerst: $5(x - 1) = 5x - 5$, dus $\dfrac{5x - 3}{x - 1} = 5 + \dfrac{2}{x - 1}$. Op $[2, 4]$ is $x - 1$ positief.`,
      primitieve: r`Een primitieve is $F(x) = 5x + 2\ln(x - 1)$.`,
      invullen: r`$F(4) - F(2) = \left(20 + 2\ln 3\right) - \left(10 + 2\ln 1\right) = 10 + 2\ln 3$, want $\ln 1 = 0$.`,
    }),
  },
  {
    cluster: 'k4a_bepaald',
    nummer: 'bd-3',
    level: 1,
    latex: r`Bereken exact: $\displaystyle\int_{1}^{2} \dfrac{6x + 3}{3x - 1}\,\mathrm{d}x$`,
    antwoordLatex: r`2 + \tfrac{5}{3}\ln\left(\tfrac{5}{2}\right)`,
    antwoord: '2 + (5/3)ln(5/2)',
    alts: ['2 + (5/3)ln(5) - (5/3)ln(2)'],
    integrand: '(6 * x + 3) / (3 * x - 1)',
    primitieve: '2 * x + (5/3) * ln(3 * x - 1)',
    domein: [1, 3],
    grenzen: [1, 2],
    waarde: '2 + (5/3) * ln(5/2)',
    steps: bepaald({
      deling: r`Deel eerst: $2(3x - 1) = 6x - 2$, dus $\dfrac{6x + 3}{3x - 1} = 2 + \dfrac{5}{3x - 1}$. Op $[1, 2]$ is $3x - 1$ positief.`,
      primitieve: r`Deel bij de logaritme door $a = 3$: een primitieve is $F(x) = 2x + \tfrac{5}{3}\ln(3x - 1)$.`,
      invullen: r`$F(2) - F(1) = \left(4 + \tfrac{5}{3}\ln 5\right) - \left(2 + \tfrac{5}{3}\ln 2\right) = 2 + \tfrac{5}{3}\ln\left(\tfrac{5}{2}\right)$.`,
    }),
  },
  {
    cluster: 'k4a_bepaald',
    nummer: 'bd-4',
    level: 2,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{2} \dfrac{x^{2} + 5x}{x + 2}\,\mathrm{d}x$`,
    antwoordLatex: r`8 - 6\ln(2)`,
    antwoord: '8 - 6ln(2)',
    integrand: '(x^2 + 5 * x) / (x + 2)',
    primitieve: '(1/2) * x^2 + 3 * x - 6 * ln(x + 2)',
    domein: [-1, 3],
    grenzen: [0, 2],
    waarde: '8 - 6 * ln(2)',
    steps: bepaald({
      deling: r`$(x + 2)(x + 3) = x^{2} + 5x + 6$, dus $\dfrac{x^{2} + 5x}{x + 2} = x + 3 - \dfrac{6}{x + 2}$. Op $[0, 2]$ is de noemer positief.`,
      primitieve: r`Een primitieve is $F(x) = \tfrac{1}{2}x^{2} + 3x - 6\ln(x + 2)$.`,
      invullen: r`$F(2) = 2 + 6 - 6\ln 4 = 8 - 12\ln 2$, want $\ln 4 = 2\ln 2$. $F(0) = -6\ln 2$. Het verschil is $8 - 12\ln 2 + 6\ln 2 = 8 - 6\ln 2$.`,
    }),
  },
  {
    cluster: 'k4a_bepaald',
    nummer: 'bd-5',
    level: 2,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{1} \dfrac{2x^{2} + x + 3}{x + 1}\,\mathrm{d}x$`,
    antwoordLatex: r`4\ln(2)`,
    antwoord: '4ln(2)',
    alts: ['ln(16)', 'ln(2^4)'],
    integrand: '(2 * x^2 + x + 3) / (x + 1)',
    primitieve: 'x^2 - x + 4 * ln(x + 1)',
    domein: [0, 3],
    grenzen: [0, 1],
    waarde: '4 * ln(2)',
    steps: bepaald({
      deling: r`$(x + 1)(2x - 1) = 2x^{2} + x - 1$, dus $\dfrac{2x^{2} + x + 3}{x + 1} = 2x - 1 + \dfrac{4}{x + 1}$.`,
      primitieve: r`Een primitieve is $F(x) = x^{2} - x + 4\ln(x + 1)$.`,
      invullen: r`$F(1) - F(0) = \left(1 - 1 + 4\ln 2\right) - 4\ln 1 = 4\ln 2$.`,
    }),
  },
  {
    cluster: 'k4a_bepaald',
    nummer: 'bd-6',
    level: 2,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{2} \dfrac{2x^{2} + 8x + 3}{x + 4}\,\mathrm{d}x$`,
    antwoordLatex: r`4 + 3\ln\left(\tfrac{3}{2}\right)`,
    antwoord: '4 + 3ln(3/2)',
    alts: ['4 + 3ln(3) - 3ln(2)', '4 + 3ln(6) - 6ln(2)'],
    integrand: '(2 * x^2 + 8 * x + 3) / (x + 4)',
    primitieve: 'x^2 + 3 * ln(x + 4)',
    domein: [-1, 3],
    grenzen: [0, 2],
    waarde: '4 + 3 * ln(3/2)',
    steps: bepaald({
      deling: r`$(x + 4) \cdot 2x = 2x^{2} + 8x$, dus $\dfrac{2x^{2} + 8x + 3}{x + 4} = 2x + \dfrac{3}{x + 4}$.`,
      primitieve: r`Een primitieve is $F(x) = x^{2} + 3\ln(x + 4)$.`,
      invullen: r`$F(2) - F(0) = \left(4 + 3\ln 6\right) - 3\ln 4$. Schrijf $\ln 6 = \ln 2 + \ln 3$ en $\ln 4 = 2\ln 2$: $4 + 3\ln 2 + 3\ln 3 - 6\ln 2 = 4 + 3\ln\left(\tfrac{3}{2}\right)$.`,
    }),
  },
  {
    cluster: 'k4a_bepaald',
    nummer: 'bd-7',
    level: 3,
    latex: r`Bereken exact: $\displaystyle\int_{2}^{3} \dfrac{x^{3} + 2}{x - 1}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{59}{6} + 3\ln(2)`,
    antwoord: '59/6 + 3ln(2)',
    integrand: '(x^3 + 2) / (x - 1)',
    primitieve: '(1/3) * x^3 + (1/2) * x^2 + x + 3 * ln(x - 1)',
    domein: [2, 4],
    grenzen: [2, 3],
    waarde: '59/6 + 3 * ln(2)',
    steps: bepaald({
      deling: r`Deel $x^{3} + 2$ door $x - 1$: quotiënt $x^{2} + x + 1$, rest $3$. Dus de integrand is $x^{2} + x + 1 + \dfrac{3}{x - 1}$.`,
      primitieve: r`Een primitieve is $F(x) = \tfrac{1}{3}x^{3} + \tfrac{1}{2}x^{2} + x + 3\ln(x - 1)$.`,
      invullen: r`$F(3) = 9 + \tfrac{9}{2} + 3 + 3\ln 2 = \tfrac{33}{2} + 3\ln 2$. $F(2) = \tfrac{8}{3} + 2 + 2 = \tfrac{20}{3}$. Het verschil is $\tfrac{33}{2} - \tfrac{20}{3} + 3\ln 2 = \tfrac{59}{6} + 3\ln 2$.`,
    }),
  },
  {
    cluster: 'k4a_bepaald',
    nummer: 'bd-8',
    level: 3,
    latex: r`Bereken exact: $\displaystyle\int_{0}^{1} \dfrac{x^{3} - x^{2} + 1}{x + 1}\,\mathrm{d}x$`,
    antwoordLatex: r`\tfrac{4}{3} - \ln(2)`,
    antwoord: '4/3 - ln(2)',
    integrand: '(x^3 - x^2 + 1) / (x + 1)',
    primitieve: '(1/3) * x^3 - x^2 + 2 * x - ln(x + 1)',
    domein: [0, 3],
    grenzen: [0, 1],
    waarde: '4/3 - ln(2)',
    steps: bepaald({
      deling: r`Deel door $x + 1$: quotiënt $x^{2} - 2x + 2$, rest $-1$. De integrand is $x^{2} - 2x + 2 - \dfrac{1}{x + 1}$.`,
      primitieve: r`Een primitieve is $F(x) = \tfrac{1}{3}x^{3} - x^{2} + 2x - \ln(x + 1)$.`,
      invullen: r`$F(1) - F(0) = \left(\tfrac{1}{3} - 1 + 2 - \ln 2\right) - 0 = \tfrac{1}{3} + 1 - \ln 2 = \tfrac{4}{3} - \ln 2$.`,
    }),
  },

  {
    cluster: 'k4a_oppervlakte',
    nummer: 'op-1',
    level: 1,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{4x + 2}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`4 - 2\ln(2)`,
    antwoord: '4 - 2ln(2)',
    integrand: '(4 * x + 2) / (x + 1)',
    primitieve: '4 * x - 2 * ln(x + 1)',
    domein: [0, 2],
    grenzen: [0, 1],
    waarde: '4 - 2 * ln(2)',
    steps: oppervlakte({
      integraal: r`Deel 1: $O(V) = \displaystyle\int_{0}^{1} \dfrac{4x + 2}{x + 1}\,\mathrm{d}x$. Op $[0, 1]$ is $f$ positief, dus er hoeft geen minteken bij.`,
      deling: r`Deel: $4(x + 1) = 4x + 4$, dus $f(x) = 4 - \dfrac{2}{x + 1}$.`,
      primitieve: r`Deel 2: een primitieve is $F(x) = 4x - 2\ln(x + 1)$.`,
      uitkomst: r`Deel 3: $F(1) - F(0) = \left(4 - 2\ln 2\right) - 0 = 4 - 2\ln 2$.`,
    }),
  },
  {
    cluster: 'k4a_oppervlakte',
    nummer: 'op-2',
    level: 1,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{5x - 3}{x - 1}$, de $x$-as en de lijnen $x = 2$ en $x = 3$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`5 + 2\ln(2)`,
    antwoord: '5 + 2ln(2)',
    integrand: '(5 * x - 3) / (x - 1)',
    primitieve: '5 * x + 2 * ln(x - 1)',
    domein: [2, 4],
    grenzen: [2, 3],
    waarde: '5 + 2 * ln(2)',
    steps: oppervlakte({
      integraal: r`Deel 1: $O(V) = \displaystyle\int_{2}^{3} \dfrac{5x - 3}{x - 1}\,\mathrm{d}x$. Op $[2, 3]$ liggen teller en noemer allebei boven nul.`,
      deling: r`Deel: $5(x - 1) = 5x - 5$, dus $f(x) = 5 + \dfrac{2}{x - 1}$.`,
      primitieve: r`Deel 2: een primitieve is $F(x) = 5x + 2\ln(x - 1)$.`,
      uitkomst: r`Deel 3: $F(3) - F(2) = \left(15 + 2\ln 2\right) - 10 = 5 + 2\ln 2$.`,
    }),
  },
  {
    cluster: 'k4a_oppervlakte',
    nummer: 'op-3',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x^{2} + 1}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`2\ln(2) - \tfrac{1}{2}`,
    antwoord: '2ln(2) - 1/2',
    alts: ['2ln(2) - 0,5', 'ln(4) - 1/2'],
    integrand: '(x^2 + 1) / (x + 1)',
    primitieve: '(1/2) * x^2 - x + 2 * ln(x + 1)',
    domein: [0, 2],
    grenzen: [0, 1],
    waarde: '2 * ln(2) - 1/2',
    steps: oppervlakte({
      integraal: r`Deel 1: $O(V) = \displaystyle\int_{0}^{1} \dfrac{x^{2} + 1}{x + 1}\,\mathrm{d}x$. Teller en noemer zijn op $[0, 1]$ positief.`,
      deling: r`$(x + 1)(x - 1) = x^{2} - 1$, dus $x^{2} + 1 = (x + 1)(x - 1) + 2$ en $f(x) = x - 1 + \dfrac{2}{x + 1}$.`,
      primitieve: r`Deel 2: een primitieve is $F(x) = \tfrac{1}{2}x^{2} - x + 2\ln(x + 1)$.`,
      uitkomst: r`Deel 3: $F(1) - F(0) = \left(\tfrac{1}{2} - 1 + 2\ln 2\right) - 0 = 2\ln 2 - \tfrac{1}{2}$.`,
    }),
  },
  {
    cluster: 'k4a_oppervlakte',
    nummer: 'op-4',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x^{2} + 2x + 2}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\tfrac{3}{2} + \ln(2)`,
    antwoord: '3/2 + ln(2)',
    alts: ['1,5 + ln(2)', '1 1/2 + ln(2)'],
    integrand: '(x^2 + 2 * x + 2) / (x + 1)',
    primitieve: '(1/2) * x^2 + x + ln(x + 1)',
    domein: [0, 2],
    grenzen: [0, 1],
    waarde: '3/2 + ln(2)',
    steps: oppervlakte({
      integraal: r`Deel 1: $O(V) = \displaystyle\int_{0}^{1} \dfrac{x^{2} + 2x + 2}{x + 1}\,\mathrm{d}x$.`,
      deling: r`$(x + 1)^{2} = x^{2} + 2x + 1$, dus de teller is $1$ groter: $f(x) = x + 1 + \dfrac{1}{x + 1}$.`,
      primitieve: r`Deel 2: een primitieve is $F(x) = \tfrac{1}{2}x^{2} + x + \ln(x + 1)$.`,
      uitkomst: r`Deel 3: $F(1) - F(0) = \left(\tfrac{1}{2} + 1 + \ln 2\right) - 0 = \tfrac{3}{2} + \ln 2$.`,
    }),
  },
  {
    cluster: 'k4a_oppervlakte',
    nummer: 'op-5',
    level: 2,
    latex: r`Het vlakdeel $V_p$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x + 3}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = p$ met $p > 0$. Bereken exact de waarde van $p$ waarvoor de oppervlakte van $V_p$ gelijk is aan $2 + 2\ln(3)$.`,
    antwoordLatex: r`p = 2`,
    antwoord: 'p = 2',
    alts: ['2'],
    integrand: '(x + 3) / (x + 1)',
    primitieve: 'x + 2 * ln(x + 1)',
    domein: [0, 3],
    steps: oppervlakte({
      integraal: r`Deel 1: $O(V_p) = \displaystyle\int_{0}^{p} \dfrac{x + 3}{x + 1}\,\mathrm{d}x$. Op $[0, p]$ is $f$ positief.`,
      deling: r`Deel: $(x + 1) + 2 = x + 3$, dus $f(x) = 1 + \dfrac{2}{x + 1}$.`,
      primitieve: r`Deel 2: een primitieve is $F(x) = x + 2\ln(x + 1)$. Omdat $F(0) = 0$ is $O(V_p) = p + 2\ln(p + 1)$.`,
      uitkomst: r`Deel 3: los $p + 2\ln(p + 1) = 2 + 2\ln 3$ op. Probeer $p = 2$: links staat $2 + 2\ln 3$. Dat klopt, en $p > 0$. Dus $p = 2$.`,
    }),
  },
  {
    cluster: 'k4a_oppervlakte',
    nummer: 'op-6',
    level: 2,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{2x^{2} + 8x + 3}{x + 4}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`1 + 3\ln(5) - 6\ln(2)`,
    antwoord: '1 + 3ln(5) - 6ln(2)',
    alts: ['1 + 3ln(5/4)', '1 + ln(125/64)'],
    integrand: '(2 * x^2 + 8 * x + 3) / (x + 4)',
    primitieve: 'x^2 + 3 * ln(x + 4)',
    domein: [0, 2],
    grenzen: [0, 1],
    waarde: '1 + 3 * ln(5) - 6 * ln(2)',
    steps: oppervlakte({
      integraal: r`Deel 1: $O(V) = \displaystyle\int_{0}^{1} \dfrac{2x^{2} + 8x + 3}{x + 4}\,\mathrm{d}x$. Teller en noemer zijn op $[0, 1]$ positief.`,
      deling: r`$(x + 4) \cdot 2x = 2x^{2} + 8x$, dus $f(x) = 2x + \dfrac{3}{x + 4}$.`,
      primitieve: r`Deel 2: een primitieve is $F(x) = x^{2} + 3\ln(x + 4)$.`,
      uitkomst: r`Deel 3: $F(1) - F(0) = \left(1 + 3\ln 5\right) - 3\ln 4 = 1 + 3\ln 5 - 6\ln 2$, want $\ln 4 = 2\ln 2$.`,
    }),
  },
  {
    cluster: 'k4a_oppervlakte',
    nummer: 'op-7',
    level: 3,
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x^{3} - x^{2} + 1}{x + 1}$, de $x$-as en de lijnen $x = 1$ en $x = 2$. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\tfrac{4}{3} + \ln\left(\tfrac{2}{3}\right)`,
    antwoord: '4/3 + ln(2/3)',
    alts: ['4/3 + ln(2) - ln(3)'],
    integrand: '(x^3 - x^2 + 1) / (x + 1)',
    primitieve: '(1/3) * x^3 - x^2 + 2 * x - ln(x + 1)',
    domein: [0, 3],
    grenzen: [1, 2],
    waarde: '4/3 + ln(2/3)',
    steps: oppervlakte({
      integraal: r`Deel 1: $O(V) = \displaystyle\int_{1}^{2} \dfrac{x^{3} - x^{2} + 1}{x + 1}\,\mathrm{d}x$. Op $[1, 2]$ zijn teller en noemer positief.`,
      deling: r`Deel $x^{3} - x^{2} + 1$ door $x + 1$: quotiënt $x^{2} - 2x + 2$, rest $-1$. Dus $f(x) = x^{2} - 2x + 2 - \dfrac{1}{x + 1}$.`,
      primitieve: r`Deel 2: een primitieve is $F(x) = \tfrac{1}{3}x^{3} - x^{2} + 2x - \ln(x + 1)$.`,
      uitkomst: r`Deel 3: $F(2) = \tfrac{8}{3} - \ln 3$ en $F(1) = \tfrac{4}{3} - \ln 2$. Het verschil is $\tfrac{4}{3} - \ln 3 + \ln 2 = \tfrac{4}{3} + \ln\left(\tfrac{2}{3}\right)$.`,
    }),
  },
  {
    cluster: 'k4a_oppervlakte',
    nummer: 'op-8',
    level: 3,
    latex: r`Het vlakdeel $V_p$ wordt ingesloten door de grafiek van $f(x) = \dfrac{x + 4}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = p$ met $p > 0$. Bereken exact de waarde van $p$ waarvoor de oppervlakte van $V_p$ gelijk is aan $1 + 3\ln(2)$.`,
    antwoordLatex: r`p = 1`,
    antwoord: 'p = 1',
    alts: ['1'],
    integrand: '(x + 4) / (x + 1)',
    primitieve: 'x + 3 * ln(x + 1)',
    domein: [0, 3],
    steps: oppervlakte({
      integraal: r`Deel 1: $O(V_p) = \displaystyle\int_{0}^{p} \dfrac{x + 4}{x + 1}\,\mathrm{d}x$.`,
      deling: r`Deel: $(x + 1) + 3 = x + 4$, dus $f(x) = 1 + \dfrac{3}{x + 1}$.`,
      primitieve: r`Deel 2: een primitieve is $F(x) = x + 3\ln(x + 1)$. Omdat $F(0) = 0$ is $O(V_p) = p + 3\ln(p + 1)$.`,
      uitkomst: r`Deel 3: los $p + 3\ln(p + 1) = 1 + 3\ln 2$ op. Probeer $p = 1$: links staat $1 + 3\ln 2$. Dat klopt, en $p > 0$. Dus $p = 1$.`,
    }),
  },
]

const K4A: AdditiveChapter = {
  chapterSlug: 'k',
  chapterTitle: 'K — Voortgezette integraalrekening',
  bookPart: 4,
  chapterOrder: 12,
  site: 'integralen',
  migrationFile: '0051_k4a_staartdelingen.sql',
  headerTitle: 'K.4 Theorie A — Staartdelingen',
  sourceScript: 'scripts/k4a-content.ts',
  headerNotes: [
    'Het eerste theorieblok van K.4. Een breuk met een lineaire noemer en een',
    'teller die minstens even lang is, deel je eerst. Daarna geeft de rest een',
    'logaritme.',
    '',
    'Drie clusters: onbepaald primitiveren, bepaalde integralen, en vlakdelen',
    '(twee keer de waarde van p).',
    '',
    'Eigen oefenvragen, geen boekopgaven. Elke primitieve wordt nagerekend door',
    'src/content/primitieven.test.ts (content/hoofdstuk-k/k4a.json).',
  ],
  topics: [
    { slug: 'k4a_primitiveren', title: 'Staartdelen en primitiveren', order: 27, category: 'primitiveren' },
    { slug: 'k4a_bepaald', title: 'Bepaalde integralen na een staartdeling', order: 28, category: 'integralen' },
    { slug: 'k4a_toepassing', title: 'Vlakdelen na een staartdeling', order: 29, category: 'toepassingen' },
  ],
  clusters: [
    { topic: 'k4a_primitiveren', slug: 'k4a_staart', title: 'Een breuk met een lineaire noemer delen', order: 1 },
    { topic: 'k4a_bepaald', slug: 'k4a_bepaald', title: 'Bepaalde integralen na een staartdeling', order: 1 },
    { topic: 'k4a_toepassing', slug: 'k4a_oppervlakte', title: 'Oppervlakte, inhoud en de waarde van p', order: 1 },
  ],
  questions: VRAGEN,
}

const wortel = process.cwd()
const contentPad = path.join(wortel, 'content', 'hoofdstuk-k', 'k4a.json')
writeFileSync(contentPad, generateContentFile(K4A, 'K.4 Theorie A — Staartdelingen (eigen varianten)'))

const migratiePad = path.join(wortel, 'supabase', 'migrations', K4A.migrationFile)
const sql = voegTheorieblokToe(generateAdditiveMigration(K4A), {
  paragraphSlug: 'k4',
  paragraphLabel: 'K.4',
  paragraphTitle: 'Breuksplitsen',
  paragraphOrder: 5,
  blockSlug: 'k4a',
  blockLetter: 'A',
  blockTitle: 'Staartdelingen',
  blockOrder: 1,
  topics: ['k4a_primitiveren', 'k4a_bepaald', 'k4a_toepassing'],
})
writeFileSync(migratiePad, sql)

console.log(`Geschreven: ${contentPad}`)
console.log(`Geschreven: ${migratiePad}`)
console.log(`Vragen: ${K4A.questions.length}, stappen: ${K4A.questions.length * 4}`)
