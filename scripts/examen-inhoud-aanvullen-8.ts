/**
 * Aanvulling tot 8 vragen per cluster, Examentraining — inhoud.
 *
 * H12 en H15 hadden al acht vragen per soort en blijven buiten deze migratie.
 * Vier clusters over de inhoud van een omwentelingslichaam hadden er vier.
 * Hier komen eigen varianten bij, met andere getallen dan de vragen die er
 * al staan.
 *
 * Draaien met:  npx jiti scripts/examen-inhoud-aanvullen-8.ts
 *
 * Schrijft:
 *   • content/hoofdstuk-examen/inhoud-aanvullen-8.json
 *   • supabase/migrations/0072_examen_inhoud_aanvullen_tot_8.sql
 */
import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import path from 'node:path'

import { derivative, parse } from 'mathjs'

import {
  generateAdditiveMigration,
  generateContentFile,
  r,
  type AdditiveChapter,
  type AdditiveQ,
  type Steps,
} from './lib/stappenplan-content'

const DEEL = r`Hier spelen deel 1 en deel 2 van de driedeling: eerst vertaal je het verhaal naar een integraal, daarna reken je die integraal exact uit.`

function extra(
  cluster: string,
  nummer: string,
  level: 1 | 2 | 3,
  volgorde: number,
  rest: Omit<AdditiveQ, 'cluster' | 'nummer' | 'level' | 'volgorde'>,
): AdditiveQ {
  return { cluster, nummer, level, volgorde, ...rest }
}

const VRAGEN: AdditiveQ[] = [
  // ── Inhoud om de x-as, grenzen gegeven ───────────────────────────────────
  extra('examen_inhoud_xas', 'x5', 2, 5, {
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = 2x + 1$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Het lichaam $L$ ontstaat als $V$ om de $x$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{13}{3}\pi`,
    antwoord: '(13/3)pi',
    alts: ['(13/3)*pi', '13pi/3'],
    integrand: 'pi*(2*x + 1)^2',
    primitieve: 'pi*((4/3)*x^3 + 2*x^2 + x)',
    domein: [0, 1],
    grenzen: [0, 1],
    waarde: '(13/3)*pi',
    steps: [
      `${DEEL} Op $[0, 1]$ is $f(x) \\ge 1$, dus de grafiek ligt boven de $x$-as. De inhoud is $\\pi$ keer de integraal van het kwadraat van $f$.`,
      r`$I(L) = \pi \displaystyle\int_{0}^{1} (2x + 1)^{2}\,\mathrm{d}x = \pi \displaystyle\int_{0}^{1} (4x^{2} + 4x + 1)\,\mathrm{d}x$.`,
      r`Een primitieve van de integrand is $F(x) = \pi\left(\dfrac{4}{3}x^{3} + 2x^{2} + x\right)$.`,
      r`$F(1) - F(0) = \pi\left(\dfrac{4}{3} + 2 + 1\right) = \dfrac{13}{3}\pi$. De inhoud is $\dfrac{13}{3}\pi$.`,
    ],
  }),
  extra('examen_inhoud_xas', 'x6', 2, 6, {
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \sqrt{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = 3$. Het lichaam $L$ ontstaat als $V$ om de $x$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{15}{2}\pi`,
    antwoord: '(15/2)pi',
    alts: ['(15/2)*pi', '15pi/2'],
    integrand: 'pi*(x + 1)',
    primitieve: 'pi*((1/2)*x^2 + x)',
    domein: [0, 3],
    grenzen: [0, 3],
    waarde: '(15/2)*pi',
    steps: [
      `${DEEL} Op $[0, 3]$ is $x + 1 > 0$, dus de grafiek ligt boven de $x$-as. Het kwadraat van de wortel is $x + 1$.`,
      r`$I(L) = \pi \displaystyle\int_{0}^{3} \left(\sqrt{x + 1}\right)^{2}\,\mathrm{d}x = \pi \displaystyle\int_{0}^{3} (x + 1)\,\mathrm{d}x$.`,
      r`Een primitieve van de integrand is $F(x) = \pi\left(\dfrac{1}{2}x^{2} + x\right)$.`,
      r`$F(3) - F(0) = \pi\left(\dfrac{9}{2} + 3\right) = \dfrac{15}{2}\pi$. De inhoud is $\dfrac{15}{2}\pi$.`,
    ],
  }),
  extra('examen_inhoud_xas', 'x7', 3, 7, {
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = e^{2x}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Het lichaam $L$ ontstaat als $V$ om de $x$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{1}{4}(e^{4} - 1)\pi`,
    antwoord: '(1/4)(e^4-1)pi',
    alts: ['(1/4)*pi*(e^4-1)', 'pi*(e^4-1)/4'],
    integrand: 'pi*e^(4*x)',
    primitieve: 'pi*(1/4)*e^(4*x)',
    domein: [0, 1],
    grenzen: [0, 1],
    waarde: '(1/4)*(e^4 - 1)*pi',
    steps: [
      `${DEEL} $e^{2x}$ is overal positief. Het kwadraat is $e^{4x}$. De kern van die macht is $4x$, met afgeleide $4$.`,
      r`$I(L) = \pi \displaystyle\int_{0}^{1} \left(e^{2x}\right)^{2}\,\mathrm{d}x = \pi \displaystyle\int_{0}^{1} e^{4x}\,\mathrm{d}x$.`,
      r`Een primitieve van de integrand is $F(x) = \pi \cdot \dfrac{1}{4}e^{4x}$.`,
      r`$F(1) - F(0) = \dfrac{1}{4}\pi e^{4} - \dfrac{1}{4}\pi = \dfrac{1}{4}(e^{4} - 1)\pi$. De inhoud is $\dfrac{1}{4}(e^{4} - 1)\pi$.`,
    ],
  }),
  extra('examen_inhoud_xas', 'x8', 3, 8, {
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = \dfrac{2x + 3}{x + 1}$, de $x$-as en de lijnen $x = 0$ en $x = 1$. Het lichaam $L$ ontstaat als $V$ om de $x$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\left(\dfrac{9}{2} + 4\ln(2)\right)\pi`,
    antwoord: '(9/2+4ln(2))pi',
    alts: ['pi*(9/2+4*ln(2))', '(9/2)*pi+4*pi*ln(2)'],
    integrand: 'pi*(4 + 4/(x + 1) + 1/(x + 1)^2)',
    primitieve: 'pi*(4*x + 4*ln(x + 1) - 1/(x + 1))',
    domein: [0, 1],
    grenzen: [0, 1],
    waarde: '(9/2 + 4*ln(2))*pi',
    steps: [
      `${DEEL} Op $[0, 1]$ zijn teller en noemer positief, dus de grafiek ligt boven de $x$-as. De inhoud is $\\pi$ keer de integraal van het kwadraat van $f$. Schrijf de breuk eerst als een getal plus een rest.`,
      r`$2x + 3 = 2\cdot(x + 1) + 1$, dus $f(x) = 2 + \dfrac{1}{x + 1}$. Dan $f(x)^{2} = 4 + \dfrac{4}{x + 1} + \dfrac{1}{(x + 1)^{2}}$. $I(L) = \pi \displaystyle\int_{0}^{1} \left(4 + \dfrac{4}{x + 1} + \dfrac{1}{(x + 1)^{2}}\right)\,\mathrm{d}x$.`,
      r`De kern is $x + 1$, met afgeleide $1$. Een primitieve van de integrand is $F(x) = \pi\left(4x + 4\ln(x + 1) - \dfrac{1}{x + 1}\right)$.`,
      r`$F(1) = \pi\left(\dfrac{7}{2} + 4\ln(2)\right)$ en $F(0) = -\pi$. Het verschil is $\dfrac{7}{2} + 4\ln(2) - (-1) = \dfrac{9}{2} + 4\ln(2)$, maal $\pi$. De inhoud is $\left(\dfrac{9}{2} + 4\ln(2)\right)\pi$.`,
    ],
  }),

  // ── Inhoud om de x-as, grenzen zelf ───────────────────────────────────────
  extra('examen_inhoud_xas_grenzen', 'xg5', 3, 5, {
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = 3x - x^{2}$ en de $x$-as. Het lichaam $L$ ontstaat als $V$ om de $x$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{81}{10}\pi`,
    antwoord: '(81/10)pi',
    alts: ['(81/10)*pi', '81pi/10'],
    integrand: 'pi*(3*x - x^2)^2',
    primitieve: 'pi*(3*x^3 - (3/2)*x^4 + (1/5)*x^5)',
    domein: [0, 3],
    grenzen: [0, 3],
    waarde: '(81/10)*pi',
    steps: [
      `${DEEL} De grafiek snijdt de $x$-as waar $3x - x^{2} = 0$, dus $x(3 - x) = 0$. De snijpunten zijn $x = 0$ en $x = 3$. Daartussen is $f(1) = 2$, dus de grafiek ligt boven de $x$-as. De inhoud is $\\pi$ keer de integraal van het kwadraat van $f$.`,
      r`$I(L) = \pi \displaystyle\int_{0}^{3} (3x - x^{2})^{2}\,\mathrm{d}x = \pi \displaystyle\int_{0}^{3} (9x^{2} - 6x^{3} + x^{4})\,\mathrm{d}x$.`,
      r`Een primitieve van de integrand is $F(x) = \pi\left(3x^{3} - \dfrac{3}{2}x^{4} + \dfrac{1}{5}x^{5}\right)$.`,
      r`$F(3) - F(0) = \pi\left(81 - \dfrac{243}{2} + \dfrac{243}{5}\right) = \pi\left(\dfrac{810}{10} - \dfrac{1215}{10} + \dfrac{486}{10}\right) = \dfrac{81}{10}\pi$. De inhoud is $\dfrac{81}{10}\pi$.`,
    ],
  }),
  extra('examen_inhoud_xas_grenzen', 'xg6', 3, 6, {
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafieken van $f(x) = \sqrt{x}$ en $g(x) = x$. Het lichaam $L$ ontstaat als $V$ om de $x$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{1}{6}\pi`,
    antwoord: '(1/6)pi',
    alts: ['(1/6)*pi', 'pi/6'],
    integrand: 'pi*(x - x^2)',
    primitieve: 'pi*((1/2)*x^2 - (1/3)*x^3)',
    domein: [0, 1],
    grenzen: [0, 1],
    waarde: '(1/6)*pi',
    steps: [
      `${DEEL} De grafieken snijden elkaar waar $\\sqrt{x} = x$. Kwadrateren geeft $x = x^{2}$, dus $x(x - 1) = 0$. Beide oplossingen kloppen: $x = 0$ en $x = 1$. Op dat stuk is $f\\left(\\dfrac{1}{4}\\right) = \\dfrac{1}{2}$ groter dan $g\\left(\\dfrac{1}{4}\\right) = \\dfrac{1}{4}$, dus $f$ ligt verder van de $x$-as. De inhoud is $\\pi$ keer de integraal van het verschil van de kwadraten.`,
      r`$I(L) = \pi \displaystyle\int_{0}^{1} \left(x - x^{2}\right)\,\mathrm{d}x$.`,
      r`Een primitieve van de integrand is $F(x) = \pi\left(\dfrac{1}{2}x^{2} - \dfrac{1}{3}x^{3}\right)$.`,
      r`$F(1) - F(0) = \pi\left(\dfrac{1}{2} - \dfrac{1}{3}\right) = \dfrac{1}{6}\pi$. De inhoud is $\dfrac{1}{6}\pi$.`,
    ],
  }),
  extra('examen_inhoud_xas_grenzen', 'xg7', 3, 7, {
    latex: r`Het vlakdeel $V$ in het eerste kwadrant wordt ingesloten door de grafiek van $f(x) = \cos(x)$ en de $x$-as. Het lichaam $L$ ontstaat als $V$ om de $x$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{1}{4}\pi^{2}`,
    antwoord: '(1/4)pi^2',
    alts: ['pi^2/4', '(pi^2)/4'],
    integrand: 'pi*(cos(x))^2',
    primitieve: 'pi*(x/2 + sin(2*x)/4)',
    domein: [0, 1.5707963267948966],
    grenzen: [0, 1.5707963267948966],
    waarde: '(1/4)*pi^2',
    steps: [
      `${DEEL} In het eerste kwadrant snijdt $\\cos(x)$ de $x$-as in $x = \\dfrac{\\pi}{2}$. Samen met de $y$-as, waar $x = 0$, zijn dat de grenzen. Daartussen ligt de grafiek boven de $x$-as. De inhoud is $\\pi$ keer de integraal van $\\cos^{2}(x)$.`,
      r`Gebruik $\cos^{2}(x) = \dfrac{1 + \cos(2x)}{2}$. $I(L) = \pi \displaystyle\int_{0}^{\frac{\pi}{2}} \dfrac{1 + \cos(2x)}{2}\,\mathrm{d}x$. De kern van de cosinus is $2x$, met afgeleide $2$.`,
      r`Een primitieve van de integrand is $F(x) = \pi\left(\dfrac{1}{2}x + \dfrac{1}{4}\sin(2x)\right)$.`,
      r`$F\left(\dfrac{\pi}{2}\right) - F(0) = \pi \cdot \dfrac{\pi}{4} = \dfrac{1}{4}\pi^{2}$. De inhoud is $\dfrac{1}{4}\pi^{2}$.`,
    ],
  }),
  extra('examen_inhoud_xas_grenzen', 'xg8', 3, 8, {
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(x) = 4x - x^{2}$ en de $x$-as. Het lichaam $L$ ontstaat als $V$ om de $x$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{512}{15}\pi`,
    antwoord: '(512/15)pi',
    alts: ['(512/15)*pi', '512pi/15'],
    integrand: 'pi*(4*x - x^2)^2',
    primitieve: 'pi*((16/3)*x^3 - 2*x^4 + (1/5)*x^5)',
    domein: [0, 4],
    grenzen: [0, 4],
    waarde: '(512/15)*pi',
    steps: [
      `${DEEL} De grafiek snijdt de $x$-as waar $4x - x^{2} = 0$, dus $x(4 - x) = 0$. De snijpunten zijn $x = 0$ en $x = 4$. Daartussen is $f(2) = 4$, dus de grafiek ligt boven de $x$-as. De inhoud is $\\pi$ keer de integraal van het kwadraat van $f$.`,
      r`$I(L) = \pi \displaystyle\int_{0}^{4} (4x - x^{2})^{2}\,\mathrm{d}x = \pi \displaystyle\int_{0}^{4} (16x^{2} - 8x^{3} + x^{4})\,\mathrm{d}x$.`,
      r`Een primitieve van de integrand is $F(x) = \pi\left(\dfrac{16}{3}x^{3} - 2x^{4} + \dfrac{1}{5}x^{5}\right)$.`,
      r`$F(4) - F(0) = \pi\left(\dfrac{1024}{3} - 512 + \dfrac{1024}{5}\right) = \pi\left(\dfrac{5120}{15} - \dfrac{7680}{15} + \dfrac{3072}{15}\right) = \dfrac{512}{15}\pi$. De inhoud is $\dfrac{512}{15}\pi$.`,
    ],
  }),

  // ── Inhoud om de y-as, y-waarden gegeven ──────────────────────────────────
  extra('examen_inhoud_yas', 'y9', 2, 5, {
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(y) = y + 2$, de $y$-as en de lijnen $y = 0$ en $y = 2$. Het lichaam $L$ ontstaat als $V$ om de $y$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{56}{3}\pi`,
    antwoord: '(56/3)pi',
    alts: ['(56/3)*pi', '56pi/3'],
    integrand: 'pi*(x + 2)^2',
    primitieve: 'pi*(x^3/3 + 2*x^2 + 4*x)',
    domein: [0, 2],
    grenzen: [0, 2],
    waarde: '(56/3)*pi',
    steps: [
      `${DEEL} De $y$-waarden staan in de opgave: van $0$ tot $2$. Op dat stuk is $f(y) \\ge 2$, dus de grafiek ligt rechts van de $y$-as. De straal is $f(y)$. De inhoud is $\\pi$ keer de integraal van het kwadraat van $f$.`,
      r`$I(L) = \pi \displaystyle\int_{0}^{2} (y + 2)^{2}\,\mathrm{d}y$. Werk het kwadraat uit: dat is $\pi \displaystyle\int_{0}^{2} (y^{2} + 4y + 4)\,\mathrm{d}y$.`,
      r`Een primitieve is $F(y) = \pi\left(\dfrac{1}{3}y^{3} + 2y^{2} + 4y\right)$.`,
      r`$F(2) - F(0) = \pi\left(\dfrac{8}{3} + 8 + 8\right) = \dfrac{56}{3}\pi$. De inhoud is $\dfrac{56}{3}\pi$.`,
    ],
  }),
  extra('examen_inhoud_yas', 'y10', 2, 6, {
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(y) = \sqrt{3y + 1}$, de $y$-as en de lijnen $y = 1$ en $y = 5$. Het lichaam $L$ ontstaat als $V$ om de $y$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`40\pi`,
    antwoord: '40pi',
    alts: ['40*pi'],
    integrand: 'pi*(3*x + 1)',
    primitieve: 'pi*((3/2)*x^2 + x)',
    domein: [1, 5],
    grenzen: [1, 5],
    waarde: '40*pi',
    steps: [
      `${DEEL} De $y$-waarden staan in de opgave: van $1$ tot $5$. Op dat stuk is $3y + 1 > 0$, dus de grafiek ligt rechts van de $y$-as. Het kwadraat van de wortel is $3y + 1$.`,
      r`$I(L) = \pi \displaystyle\int_{1}^{5} \left(\sqrt{3y + 1}\right)^{2}\,\mathrm{d}y = \pi \displaystyle\int_{1}^{5} (3y + 1)\,\mathrm{d}y$.`,
      r`Een primitieve van de integrand is $F(y) = \pi\left(\dfrac{3}{2}y^{2} + y\right)$.`,
      r`$F(5) - F(1) = \pi\left(\dfrac{75}{2} + 5\right) - \pi\left(\dfrac{3}{2} + 1\right) = \dfrac{85}{2}\pi - \dfrac{5}{2}\pi = 40\pi$. De inhoud is $40\pi$.`,
    ],
  }),
  extra('examen_inhoud_yas', 'y11', 3, 7, {
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(y) = e^{3y}$, de $y$-as en de lijnen $y = 0$ en $y = 1$. Het lichaam $L$ ontstaat als $V$ om de $y$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{1}{6}(e^{6} - 1)\pi`,
    antwoord: '(1/6)(e^6-1)pi',
    alts: ['(1/6)*pi*(e^6-1)', 'pi*(e^6-1)/6'],
    integrand: 'pi*e^(6*x)',
    primitieve: 'pi*(1/6)*e^(6*x)',
    domein: [0, 1],
    grenzen: [0, 1],
    waarde: '(1/6)*(e^6 - 1)*pi',
    steps: [
      `${DEEL} De $y$-waarden staan in de opgave: van $0$ tot $1$. $e^{3y}$ is overal positief, dus de grafiek ligt rechts van de $y$-as. Het kwadraat is $e^{6y}$. De kern van die macht is $6y$, met afgeleide $6$.`,
      r`$I(L) = \pi \displaystyle\int_{0}^{1} \left(e^{3y}\right)^{2}\,\mathrm{d}y = \pi \displaystyle\int_{0}^{1} e^{6y}\,\mathrm{d}y$.`,
      r`Een primitieve van de integrand is $F(y) = \pi \cdot \dfrac{1}{6}e^{6y}$.`,
      r`$F(1) - F(0) = \dfrac{1}{6}\pi e^{6} - \dfrac{1}{6}\pi = \dfrac{1}{6}(e^{6} - 1)\pi$. De inhoud is $\dfrac{1}{6}(e^{6} - 1)\pi$.`,
    ],
  }),
  extra('examen_inhoud_yas', 'y12', 3, 8, {
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(y) = \dfrac{y + 4}{y + 1}$, de $y$-as en de lijnen $y = 0$ en $y = 1$. Het lichaam $L$ ontstaat als $V$ om de $y$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\left(\dfrac{11}{2} + 6\ln(2)\right)\pi`,
    antwoord: '(11/2+6ln(2))pi',
    alts: ['pi*(11/2+6*ln(2))', '(11/2)*pi+6*pi*ln(2)'],
    integrand: 'pi*(1 + 6/(x + 1) + 9/(x + 1)^2)',
    primitieve: 'pi*(x + 6*ln(x + 1) - 9/(x + 1))',
    domein: [0, 1],
    grenzen: [0, 1],
    waarde: '(11/2 + 6*ln(2))*pi',
    steps: [
      `${DEEL} De $y$-waarden staan in de opgave: van $0$ tot $1$. Op dat stuk zijn teller en noemer positief, dus de grafiek ligt rechts van de $y$-as. De inhoud is $\\pi$ keer de integraal van het kwadraat van $f$. Schrijf de breuk eerst als een getal plus een rest.`,
      r`$y + 4 = 1\cdot(y + 1) + 3$, dus $f(y) = 1 + \dfrac{3}{y + 1}$. Het kwadraat is $1 + \dfrac{6}{y + 1} + \dfrac{9}{(y + 1)^{2}}$. $I(L)$ is $\pi$ keer de integraal daarvan van $0$ tot $1$.`,
      r`De kern is $y + 1$, met afgeleide $1$. Een primitieve is $F(y) = \pi\left(y + 6\ln(y + 1) - \dfrac{9}{y + 1}\right)$.`,
      r`$F(1) = \pi\left(6\ln(2) - \dfrac{7}{2}\right)$ en $F(0) = -9\pi$. Het verschil is $6\ln(2) - \dfrac{7}{2} - (-9) = 6\ln(2) + \dfrac{11}{2}$, maal $\pi$. De inhoud is $\left(\dfrac{11}{2} + 6\ln(2)\right)\pi$.`,
    ],
  }),

  // ── Inhoud om de y-as, y-waarden zelf ─────────────────────────────────────
  extra('examen_inhoud_yas_grenzen', 'yg5', 3, 5, {
    latex: r`Het vlakdeel $V$ in het eerste kwadrant wordt ingesloten door de grafiek van $f(x) = \sqrt{4 - x}$ en de coördinaatassen. Zoek zelf de $y$-waarden waartussen $V$ ligt. Het lichaam $L$ ontstaat als $V$ om de $y$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{256}{15}\pi`,
    antwoord: '(256/15)pi',
    alts: ['(256/15)*pi', '256pi/15'],
    integrand: 'pi*(4 - x^2)^2',
    primitieve: 'pi*(16*x - (8/3)*x^3 + (1/5)*x^5)',
    domein: [0, 2],
    grenzen: [0, 2],
    waarde: '(256/15)*pi',
    steps: [
      `${DEEL} De grafiek snijdt de $y$-as in $(0, 2)$. Hij snijdt de $x$-as waar $\\sqrt{4 - x} = 0$, dus $x = 4$, en daar is $y = 0$. $V$ ligt dus tussen $y = 0$ en $y = 2$. Uit $y = \\sqrt{4 - x}$ volgt $x = 4 - y^{2}$, met $x \\ge 0$. De inhoud is $\\pi$ keer de integraal van $x^{2}$.`,
      r`$I(L) = \pi \displaystyle\int_{0}^{2} (4 - y^{2})^{2}\,\mathrm{d}y$. Dat is $\pi$ keer de integraal van $16 - 8y^{2} + y^{4}$ van $0$ tot $2$.`,
      r`Een primitieve van de integrand is $F(y) = \pi\left(16y - \dfrac{8}{3}y^{3} + \dfrac{1}{5}y^{5}\right)$.`,
      r`$F(2) - F(0) = \pi\left(32 - \dfrac{64}{3} + \dfrac{32}{5}\right) = \pi\left(\dfrac{480}{15} - \dfrac{320}{15} + \dfrac{96}{15}\right) = \dfrac{256}{15}\pi$. De inhoud is $\dfrac{256}{15}\pi$.`,
    ],
  }),
  extra('examen_inhoud_yas_grenzen', 'yg6', 3, 6, {
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(y) = 3\sin(y)$ en de $y$-as, tussen de kleinste twee niet-negatieve $y$-waarden waar de grafiek de $y$-as snijdt. Zoek die $y$-waarden zelf. Het lichaam $L$ ontstaat als $V$ om de $y$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{9}{2}\pi^{2}`,
    antwoord: '(9/2)pi^2',
    alts: ['(9/2)*pi^2', '9pi^2/2'],
    integrand: '9*pi*(sin(x))^2',
    primitieve: 'pi*((9/2)*x - (9/4)*sin(2*x))',
    domein: [0, 3.141592653589793],
    grenzen: [0, 3.141592653589793],
    waarde: '(9/2)*pi^2',
    steps: [
      `${DEEL} $3\\sin(y) = 0$ als $\\sin(y) = 0$. De kleinste twee niet-negatieve oplossingen zijn $y = 0$ en $y = \\pi$. Daartussen is $\\sin(y) \\ge 0$, dus de grafiek ligt rechts van de $y$-as of erop. De straal is $3\\sin(y)$. De inhoud is $\\pi$ keer de integraal van het kwadraat.`,
      r`$I(L) = \pi \displaystyle\int_{0}^{\pi} (3\sin(y))^{2}\,\mathrm{d}y$. Dat is $\pi$ keer de integraal van $9\sin^{2}(y)$ van $0$ tot $\pi$. Gebruik $\sin^{2}(y) = \dfrac{1 - \cos(2y)}{2}$, dus $9\sin^{2}(y) = \dfrac{9}{2} - \dfrac{9}{2}\cos(2y)$. De kern van de cosinus is $2y$, met afgeleide $2$.`,
      r`Een primitieve van de integrand is $F(y) = \pi\left(\dfrac{9}{2}y - \dfrac{9}{4}\sin(2y)\right)$.`,
      r`$F(\pi) = \dfrac{9}{2}\pi^{2}$ en $F(0) = 0$. De inhoud is $\dfrac{9}{2}\pi^{2}$.`,
    ],
  }),
  extra('examen_inhoud_yas_grenzen', 'yg7', 3, 7, {
    latex: r`Het vlakdeel $V$ in het eerste kwadrant wordt ingesloten door de grafiek van $f(x) = 6 - 3x$ en de coördinaatassen. Zoek zelf de $y$-waarden waartussen $V$ ligt. Het lichaam $L$ ontstaat als $V$ om de $y$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`8\pi`,
    antwoord: '8pi',
    alts: ['8*pi'],
    integrand: 'pi*(2 - x/3)^2',
    primitieve: 'pi*(4*x - (2/3)*x^2 + x^3/27)',
    domein: [0, 6],
    grenzen: [0, 6],
    waarde: '8*pi',
    steps: [
      `${DEEL} De grafiek snijdt de $y$-as in $(0, 6)$. Hij snijdt de $x$-as waar $6 - 3x = 0$, dus $x = 2$, en daar is $y = 0$. $V$ ligt dus tussen $y = 0$ en $y = 6$. Uit $y = 6 - 3x$ volgt $x = \\dfrac{6 - y}{3}$. De inhoud is $\\pi$ keer de integraal van $x^{2}$.`,
      r`$I(L) = \pi \displaystyle\int_{0}^{6} \left(\dfrac{6 - y}{3}\right)^{2}\,\mathrm{d}y$. Dat is $\pi$ keer de integraal van $\left(2 - \dfrac{1}{3}y\right)^{2}$ van $0$ tot $6$.`,
      r`Een primitieve van de integrand is $F(y) = \pi\left(4y - \dfrac{2}{3}y^{2} + \dfrac{1}{27}y^{3}\right)$.`,
      r`$F(6) - F(0) = \pi\left(24 - 24 + 8\right) = 8\pi$. De inhoud is $8\pi$.`,
    ],
  }),
  extra('examen_inhoud_yas_grenzen', 'yg8', 3, 8, {
    latex: r`Het vlakdeel $V$ wordt ingesloten door de grafiek van $f(y) = \cos(2y)$, de $y$-as en de lijn $y = 0$. De onderste $y$-waarde is $0$. Zoek zelf de kleinste positieve $y$-waarde waar de grafiek de $y$-as snijdt. Het lichaam $L$ ontstaat als $V$ om de $y$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{1}{8}\pi^{2}`,
    antwoord: '(1/8)pi^2',
    alts: ['pi^2/8', '(pi^2)/8'],
    integrand: 'pi*(cos(2*x))^2',
    primitieve: 'pi*(x/2 + sin(4*x)/8)',
    domein: [0, 0.7853981633974483],
    grenzen: [0, 0.7853981633974483],
    waarde: '(1/8)*pi^2',
    steps: [
      `${DEEL} De onderste $y$-waarde is $0$. $\\cos(2y) = 0$ bij $2y = \\dfrac{\\pi}{2}$, dus $y = \\dfrac{\\pi}{4}$. Dat is de kleinste positieve oplossing. Daartussen is $\\cos(2y) > 0$, dus de grafiek ligt rechts van de $y$-as. De straal is $\\cos(2y)$. De inhoud is $\\pi$ keer de integraal van $\\cos^{2}(2y)$.`,
      r`Gebruik $\cos^{2}(2y) = \dfrac{1 + \cos(4y)}{2}$. $I(L)$ is $\pi$ keer de integraal daarvan van $0$ tot $\dfrac{\pi}{4}$. De kern van de cosinus is $4y$, met afgeleide $4$.`,
      r`Een primitieve van de integrand is $F(y) = \pi\left(\dfrac{1}{2}y + \dfrac{1}{8}\sin(4y)\right)$.`,
      r`$F\left(\dfrac{\pi}{4}\right) - F(0) = \pi \cdot \dfrac{\pi}{8} = \dfrac{1}{8}\pi^{2}$. De inhoud is $\dfrac{1}{8}\pi^{2}$.`,
    ],
  }),
]

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
    const verwacht = typeof q.waarde === 'number' ? q.waarde : (parse(naarLog(String(q.waarde))).evaluate() as number)
    bijna(gevonden, verwacht, `${q.nummer} F(b) - F(a)`)
  }
}

for (const q of VRAGEN) {
  assert.equal(q.steps.length, 4, q.nummer)
  const tekst = [q.latex, q.antwoordLatex, ...q.steps].join('\n')
  assert.ok(!/\$[uv]\b/.test(tekst) && !/\\(?:mathrm\{[uv]\}|[uv])\(/.test(tekst), `${q.nummer} gebruikt u of v`)
  narekenen(q)
}

assert.equal(VRAGEN.length, 16)
for (const slug of ['examen_inhoud_xas', 'examen_inhoud_xas_grenzen', 'examen_inhoud_yas', 'examen_inhoud_yas_grenzen']) {
  assert.equal(VRAGEN.filter((q) => q.cluster === slug).length, 4, slug)
}

const stappenOk: Steps[] = VRAGEN.map((q) => q.steps)
assert.equal(stappenOk.length, 16)

const HOOFDSTUK: AdditiveChapter = {
  chapterSlug: 'examentraining',
  chapterTitle: 'Examentraining',
  bookPart: 5,
  chapterOrder: 16,
  site: 'integralen',
  migrationFile: '0072_examen_inhoud_aanvullen_tot_8.sql',
  headerTitle: 'Examentraining — inhoud aanvullen tot 8 vragen per soort',
  sourceScript: 'scripts/examen-inhoud-aanvullen-8.ts',
  headerNotes: [
    'Vier clusters over de inhoud van een omwentelingslichaam hadden vier vragen.',
    'Deze migratie vult elk van die clusters aan tot acht, met eigen varianten.',
    'H12, H15 en de andere examenclusters hadden al acht vragen en blijven buiten deze migratie.',
    '',
    'De controle verwacht ná deze migratie acht vragen per cluster. De',
    'stappencontrole telt alleen de nieuwe opgaven.',
  ],
  topics: [
    { slug: 'examen_inhoud_xas', title: 'Inhoud om de x-as', order: 5, category: 'toepassingen' },
    { slug: 'examen_inhoud_xas_grenzen', title: 'Inhoud om de x-as, grenzen zelf', order: 6, category: 'toepassingen' },
    { slug: 'examen_inhoud_yas', title: 'Inhoud om de y-as', order: 7, category: 'toepassingen' },
    { slug: 'examen_inhoud_yas_grenzen', title: 'Inhoud om de y-as, grenzen zelf', order: 8, category: 'toepassingen' },
  ],
  clusters: [
    { topic: 'examen_inhoud_xas', slug: 'examen_inhoud_xas', title: 'Grenzen gegeven', order: 1 },
    { topic: 'examen_inhoud_xas_grenzen', slug: 'examen_inhoud_xas_grenzen', title: 'Grenzen zelf vinden', order: 1 },
    { topic: 'examen_inhoud_yas', slug: 'examen_inhoud_yas', title: 'y-waarden gegeven', order: 1 },
    { topic: 'examen_inhoud_yas_grenzen', slug: 'examen_inhoud_yas_grenzen', title: 'y-waarden zelf zoeken', order: 1 },
  ],
  questions: VRAGEN,
  verwachtAantal: {
    examen_inhoud_xas: 8,
    examen_inhoud_xas_grenzen: 8,
    examen_inhoud_yas: 8,
    examen_inhoud_yas_grenzen: 8,
  },
  alleenEigenStappen: true,
}

const wortel = process.cwd()
const contentPad = path.join(wortel, 'content', 'hoofdstuk-examen', 'inhoud-aanvullen-8.json')
writeFileSync(contentPad, generateContentFile(HOOFDSTUK, 'Examentraining — inhoud, aanvulling tot 8 vragen per soort'))
const migratiePad = path.join(wortel, 'supabase', 'migrations', HOOFDSTUK.migrationFile)
writeFileSync(migratiePad, generateAdditiveMigration(HOOFDSTUK))

console.log(`Geschreven: ${contentPad}`)
console.log(`Geschreven: ${migratiePad}`)
console.log(`Vragen: ${HOOFDSTUK.questions.length}`)
