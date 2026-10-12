/**
 * K.5 — Integralen bij parameterkrommen.
 *
 * Theorie A: oppervlakte en inhoud van een vlakdeel langs een kromme en een as.
 * Theorie B: hetzelfde als de kromme een vlakdeel omsluit.
 *
 * Draaien met:  npx jiti scripts/k5-content.ts
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

const DRIE = r`Hier spelen deel 1 en deel 2 van de driedeling: eerst het vlakdeel vertalen naar een integraal, dan die integraal exact uitrekenen.`

function stappen(deel1: string, opzet: string, primitief: string, uitkomst: string): Steps {
  return [`${DRIE} ${deel1}`, opzet, primitief, uitkomst]
}

const VRAGEN: AdditiveQ[] = [
  // ── A · oppervlakte ──────────────────────────────────────────────────────
  {
    cluster: 'k5a_oppervlakte',
    nummer: 'op-1',
    level: 1,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = 2t - t^{2} \\ y(t) = t \end{cases}$ met $0 \le t \le 2$. Het vlakdeel $V$ wordt ingesloten door $K$ en de $y$-as. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\dfrac{4}{3}`,
    antwoord: '4/3',
    integrand: '2 * x - x^2',
    primitieve: 'x^2 - (1/3) * x^3',
    grenzen: [0, 2],
    waarde: '4/3',
    steps: stappen(
      r`De kromme staat rechts van de $y$-as en $y$ stijgt, dus $O(V) = \displaystyle\int x\,\mathrm{d}y$. Die integraal is positief omdat $x \ge 0$.`,
      r`$y(t) = t$, dus $\mathrm{d}y = \mathrm{d}t$. Met $t$ van $0$ tot $2$: $O(V) = \displaystyle\int_{0}^{2} (2t - t^{2})\,\mathrm{d}t$.`,
      r`Een primitieve is $t^{2} - \tfrac{1}{3}t^{3}$.`,
      r`$\left[t^{2} - \tfrac{1}{3}t^{3}\right]_{0}^{2} = 4 - \tfrac{8}{3} = \tfrac{4}{3}$. De oppervlakte is $\tfrac{4}{3}$.`,
    ),
  },
  {
    cluster: 'k5a_oppervlakte',
    nummer: 'op-2',
    level: 1,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = t \\ y(t) = 3t - t^{2} \end{cases}$ met $0 \le t \le 3$. Het vlakdeel $V$ wordt ingesloten door $K$ en de $x$-as. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\dfrac{9}{2}`,
    antwoord: '9/2',
    integrand: '3 * x - x^2',
    primitieve: '(3/2) * x^2 - (1/3) * x^3',
    grenzen: [0, 3],
    waarde: '9/2',
    steps: stappen(
      r`De kromme staat boven de $x$-as en $x$ stijgt, dus $O(V) = \displaystyle\int y\,\mathrm{d}x$. Die integraal is positief omdat $y \ge 0$.`,
      r`$x(t) = t$, dus $\mathrm{d}x = \mathrm{d}t$. Met $t$ van $0$ tot $3$: $O(V) = \displaystyle\int_{0}^{3} (3t - t^{2})\,\mathrm{d}t$.`,
      r`Een primitieve is $\tfrac{3}{2}t^{2} - \tfrac{1}{3}t^{3}$.`,
      r`$\left[\tfrac{3}{2}t^{2} - \tfrac{1}{3}t^{3}\right]_{0}^{3} = \tfrac{27}{2} - 9 = \tfrac{9}{2}$. De oppervlakte is $\tfrac{9}{2}$.`,
    ),
  },
  {
    cluster: 'k5a_oppervlakte',
    nummer: 'op-3',
    level: 1,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = t \\ y(t) = 6 - 2t \end{cases}$ met $0 \le t \le 3$. Het vlakdeel $V$ wordt ingesloten door $K$, de positieve $x$-as en de positieve $y$-as. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`9`,
    antwoord: '9',
    integrand: '6 - 2 * x',
    primitieve: '6 * x - x^2',
    grenzen: [0, 3],
    waarde: '9',
    steps: stappen(
      r`Langs de assen is de integraal $0$. De kromme loopt van de $y$-as naar de $x$-as, van links naar rechts, met $y \ge 0$. Dus $O(V) = \displaystyle\int y\,\mathrm{d}x$.`,
      r`$x(t) = t$ en $t$ loopt van $0$ tot $3$: $O(V) = \displaystyle\int_{0}^{3} (6 - 2t)\,\mathrm{d}t$.`,
      r`Een primitieve is $6t - t^{2}$.`,
      r`$\left[6t - t^{2}\right]_{0}^{3} = 18 - 9 = 9$. De oppervlakte is $9$. (Het is een rechthoekige driehoek met rechthoekszijden $3$ en $6$.)`,
    ),
  },
  {
    cluster: 'k5a_oppervlakte',
    nummer: 'op-4',
    level: 2,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = t \\ y(t) = 4 - t^{2} \end{cases}$ met $0 \le t \le 2$. Het vlakdeel $V$ in het eerste kwadrant wordt ingesloten door $K$, de positieve $x$-as en de positieve $y$-as. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\dfrac{16}{3}`,
    antwoord: '16/3',
    integrand: '4 - x^2',
    primitieve: '4 * x - (1/3) * x^3',
    grenzen: [0, 2],
    waarde: '16/3',
    steps: stappen(
      r`Bij $t = 0$ staat de kromme op de positieve $y$-as, bij $t = 2$ op de positieve $x$-as. Ertussen is $y \ge 0$ en loopt $x$ van links naar rechts, dus $O(V) = \displaystyle\int y\,\mathrm{d}x$.`,
      r`$O(V) = \displaystyle\int_{0}^{2} (4 - t^{2})\,\mathrm{d}t$.`,
      r`Een primitieve is $4t - \tfrac{1}{3}t^{3}$.`,
      r`$\left[4t - \tfrac{1}{3}t^{3}\right]_{0}^{2} = 8 - \tfrac{8}{3} = \tfrac{16}{3}$. De oppervlakte is $\tfrac{16}{3}$.`,
    ),
  },
  {
    cluster: 'k5a_oppervlakte',
    nummer: 'op-5',
    level: 2,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = 4t - t^{2} \\ y(t) = t^{2} \end{cases}$ met $0 \le t \le 4$. Het vlakdeel $V$ wordt ingesloten door $K$ en de $y$-as. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\dfrac{128}{3}`,
    antwoord: '128/3',
    integrand: '(4 * x - x^2) * 2 * x',
    primitieve: '(8/3) * x^3 - (1/2) * x^4',
    grenzen: [0, 4],
    waarde: '128/3',
    steps: stappen(
      r`Op $[0, 4]$ is $x(t) = t(4 - t) \ge 0$ en stijgt $y$. De kromme begint en eindigt op de $y$-as, dus $O(V) = \displaystyle\int x\,\mathrm{d}y$.`,
      r`$\mathrm{d}y = 2t\,\mathrm{d}t$, dus $O(V) = \displaystyle\int_{0}^{4} (4t - t^{2}) \cdot 2t\,\mathrm{d}t = \displaystyle\int_{0}^{4} (8t^{2} - 2t^{3})\,\mathrm{d}t$.`,
      r`Een primitieve is $\tfrac{8}{3}t^{3} - \tfrac{1}{2}t^{4}$.`,
      r`$\left[\tfrac{8}{3}t^{3} - \tfrac{1}{2}t^{4}\right]_{0}^{4} = \tfrac{512}{3} - 128 = \tfrac{128}{3}$. De oppervlakte is $\tfrac{128}{3}$.`,
    ),
  },
  {
    cluster: 'k5a_oppervlakte',
    nummer: 'op-6',
    level: 2,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = t^{2} - 4 \\ y(t) = t \end{cases}$ met $-2 \le t \le 2$. Het vlakdeel $V$ wordt ingesloten door $K$ en de $y$-as. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\dfrac{32}{3}`,
    antwoord: '32/3',
    integrand: '4 - x^2',
    primitieve: '4 * x - (1/3) * x^3',
    grenzen: [-2, 2],
    waarde: '32/3',
    steps: stappen(
      r`De kromme ligt links van de $y$-as ($x \le 0$) en loopt van onder naar boven. $\displaystyle\int x\,\mathrm{d}y$ is dan negatief. De oppervlakte is het tegengestelde.`,
      r`$\mathrm{d}y = \mathrm{d}t$ en $x = t^{2} - 4$, dus $O(V) = -\displaystyle\int_{-2}^{2} (t^{2} - 4)\,\mathrm{d}t = \displaystyle\int_{-2}^{2} (4 - t^{2})\,\mathrm{d}t$.`,
      r`Een primitieve is $4t - \tfrac{1}{3}t^{3}$.`,
      r`$\left[4t - \tfrac{1}{3}t^{3}\right]_{-2}^{2} = \left(8 - \tfrac{8}{3}\right) - \left(-8 + \tfrac{8}{3}\right) = \tfrac{32}{3}$. De oppervlakte is $\tfrac{32}{3}$.`,
    ),
  },
  {
    cluster: 'k5a_oppervlakte',
    nummer: 'op-7',
    level: 3,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = t^{2} \\ y(t) = 4 - t \end{cases}$ met $0 \le t \le 4$. Het vlakdeel $V$ wordt ingesloten door $K$, de positieve $x$-as en de positieve $y$-as. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\dfrac{64}{3}`,
    antwoord: '64/3',
    integrand: '(4 - x) * 2 * x',
    primitieve: '4 * x^2 - (2/3) * x^3',
    grenzen: [0, 4],
    waarde: '64/3',
    steps: stappen(
      r`Bij $t = 0$ is het punt $(0, 4)$ en bij $t = 4$ het punt $(16, 0)$. Ertussen is $y \ge 0$ en stijgt $x$, dus $O(V) = \displaystyle\int y\,\mathrm{d}x$.`,
      r`$\mathrm{d}x = 2t\,\mathrm{d}t$, dus $O(V) = \displaystyle\int_{0}^{4} (4 - t) \cdot 2t\,\mathrm{d}t = \displaystyle\int_{0}^{4} (8t - 2t^{2})\,\mathrm{d}t$.`,
      r`Een primitieve is $4t^{2} - \tfrac{2}{3}t^{3}$.`,
      r`$\left[4t^{2} - \tfrac{2}{3}t^{3}\right]_{0}^{4} = 64 - \tfrac{128}{3} = \tfrac{64}{3}$. De oppervlakte is $\tfrac{64}{3}$.`,
    ),
  },
  {
    cluster: 'k5a_oppervlakte',
    nummer: 'op-8',
    level: 3,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = 2\cos(t) \\ y(t) = 2\sin(t) \end{cases}$ met $0 \le t \le \tfrac{1}{2}\pi$. Het vlakdeel $V$ wordt ingesloten door $K$, de positieve $x$-as en de positieve $y$-as. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\pi`,
    antwoord: 'pi',
    alts: ['1*pi', '4*pi/4'],
    integrand: '4 * sin(x)^2',
    primitieve: '2 * x - sin(2 * x)',
    grenzen: [0, Math.PI / 2],
    waarde: 'pi',
    steps: stappen(
      r`Dit is een kwartcirkel met straal $2$ in het eerste kwadrant. Van $t = \tfrac{1}{2}\pi$ naar $t = 0$ loopt $x$ van links naar rechts en is $y \ge 0$, dus $O(V) = \displaystyle\int y\,\mathrm{d}x$ met die volgorde van $t$.`,
      r`$\mathrm{d}x = -2\sin(t)\,\mathrm{d}t$. $\displaystyle\int_{\pi/2}^{0} 2\sin(t) \cdot (-2\sin(t))\,\mathrm{d}t = \displaystyle\int_{0}^{\pi/2} 4\sin^{2}(t)\,\mathrm{d}t$. Gebruik $\sin^{2}(t) = \tfrac{1}{2}(1 - \cos(2t))$, dus de integrand is $2 - 2\cos(2t)$.`,
      r`Een primitieve is $2t - \sin(2t)$.`,
      r`$\left[2t - \sin(2t)\right]_{0}^{\pi/2} = \pi$. De oppervlakte is $\pi$. (Een kwart van de cirkel met straal $2$ heeft oppervlakte $\tfrac{1}{4} \cdot \pi \cdot 2^{2} = \pi$.)`,
    ),
  },

  // ── A · inhoud ───────────────────────────────────────────────────────────
  {
    cluster: 'k5a_inhoud',
    nummer: 'in-1',
    level: 1,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = t \\ y(t) = t \end{cases}$ met $0 \le t \le 2$. Het vlakdeel $V$ wordt ingesloten door $K$ en de $x$-as. Het lichaam $L$ ontstaat als $V$ om de $x$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{8}{3}\pi`,
    antwoord: '(8/3)*pi',
    alts: ['8*pi/3', '8/3 pi'],
    integrand: 'pi * x^2',
    primitieve: 'pi * x^3 / 3',
    grenzen: [0, 2],
    waarde: '(8/3)*pi',
    steps: stappen(
      r`Wentelen om de $x$-as geeft de inhoud $\pi \displaystyle\int y^{2}\,\mathrm{d}x$. De kromme loopt van links naar rechts en $y \ge 0$.`,
      r`$y = t$ en $\mathrm{d}x = \mathrm{d}t$, met $t$ van $0$ tot $2$: $I(L) = \displaystyle\int_{0}^{2} \pi t^{2}\,\mathrm{d}t$.`,
      r`Een primitieve is $\pi \cdot \tfrac{1}{3}t^{3}$.`,
      r`$\left[\tfrac{1}{3}\pi t^{3}\right]_{0}^{2} = \tfrac{8}{3}\pi$. De inhoud is $\tfrac{8}{3}\pi$. (Het lichaam is een kegel met straal $2$ en hoogte $2$.)`,
    ),
  },
  {
    cluster: 'k5a_inhoud',
    nummer: 'in-2',
    level: 1,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = t \\ y(t) = 2 \end{cases}$ met $0 \le t \le 3$. Het vlakdeel $V$ wordt ingesloten door $K$, de $x$-as en de lijnen $x = 0$ en $x = 3$. Het lichaam $L$ ontstaat als $V$ om de $x$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`12\pi`,
    antwoord: '12*pi',
    alts: ['12pi'],
    integrand: '4 * pi',
    primitieve: '4 * pi * x',
    grenzen: [0, 3],
    waarde: '12*pi',
    steps: stappen(
      r`Wentelen om de $x$-as geeft $\pi \displaystyle\int y^{2}\,\mathrm{d}x$. Hier is $y$ constant $2$, en $x$ loopt van links naar rechts.`,
      r`$I(L) = \displaystyle\int_{0}^{3} \pi \cdot 2^{2}\,\mathrm{d}t = \displaystyle\int_{0}^{3} 4\pi\,\mathrm{d}t$.`,
      r`Een primitieve is $4\pi t$.`,
      r`$\left[4\pi t\right]_{0}^{3} = 12\pi$. De inhoud is $12\pi$. (Het lichaam is een cilinder met straal $2$ en hoogte $3$.)`,
    ),
  },
  {
    cluster: 'k5a_inhoud',
    nummer: 'in-3',
    level: 1,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = t \\ y(t) = 6 - 2t \end{cases}$ met $0 \le t \le 3$. Het vlakdeel $V$ wordt ingesloten door $K$, de positieve $x$-as en de positieve $y$-as. Het lichaam $L$ ontstaat als $V$ om de $x$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`36\pi`,
    antwoord: '36*pi',
    alts: ['36pi'],
    integrand: 'pi * (6 - 2 * x)^2',
    primitieve: 'pi * (36 * x - 12 * x^2 + (4/3) * x^3)',
    grenzen: [0, 3],
    waarde: '36*pi',
    steps: stappen(
      r`Wentelen om de $x$-as geeft $\pi \displaystyle\int y^{2}\,\mathrm{d}x$. Op dit stuk is $y \ge 0$ en loopt $x$ van links naar rechts.`,
      r`$I(L) = \displaystyle\int_{0}^{3} \pi(6 - 2t)^{2}\,\mathrm{d}t = \displaystyle\int_{0}^{3} \pi(36 - 24t + 4t^{2})\,\mathrm{d}t$.`,
      r`Een primitieve is $\pi\left(36t - 12t^{2} + \tfrac{4}{3}t^{3}\right)$.`,
      r`$\pi\left[36t - 12t^{2} + \tfrac{4}{3}t^{3}\right]_{0}^{3} = \pi(108 - 108 + 36) = 36\pi$. De inhoud is $36\pi$.`,
    ),
  },
  {
    cluster: 'k5a_inhoud',
    nummer: 'in-4',
    level: 2,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = t \\ y(t) = 2t - t^{2} \end{cases}$ met $0 \le t \le 2$. Het vlakdeel $V$ wordt ingesloten door $K$ en de $x$-as. Het lichaam $L$ ontstaat als $V$ om de $x$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{16}{15}\pi`,
    antwoord: '(16/15)*pi',
    alts: ['16*pi/15', '16/15 pi'],
    integrand: 'pi * (2 * x - x^2)^2',
    primitieve: 'pi * ((4/3) * x^3 - x^4 + (1/5) * x^5)',
    grenzen: [0, 2],
    waarde: '(16/15)*pi',
    steps: stappen(
      r`Wentelen om de $x$-as geeft $\pi \displaystyle\int y^{2}\,\mathrm{d}x$. De boog ligt boven de $x$-as en $x$ stijgt.`,
      r`$(2t - t^{2})^{2} = 4t^{2} - 4t^{3} + t^{4}$, dus $I(L) = \displaystyle\int_{0}^{2} \pi(4t^{2} - 4t^{3} + t^{4})\,\mathrm{d}t$.`,
      r`Een primitieve is $\pi\left(\tfrac{4}{3}t^{3} - t^{4} + \tfrac{1}{5}t^{5}\right)$.`,
      r`$\pi\left[\tfrac{4}{3}t^{3} - t^{4} + \tfrac{1}{5}t^{5}\right]_{0}^{2} = \pi\left(\tfrac{32}{3} - 16 + \tfrac{32}{5}\right) = \pi \cdot \tfrac{16}{15} = \tfrac{16}{15}\pi$. De inhoud is $\tfrac{16}{15}\pi$.`,
    ),
  },
  {
    cluster: 'k5a_inhoud',
    nummer: 'in-5',
    level: 2,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = 3t - t^{2} \\ y(t) = t \end{cases}$ met $0 \le t \le 3$. Het vlakdeel $V$ wordt ingesloten door $K$ en de $y$-as. Het lichaam $L$ ontstaat als $V$ om de $y$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{81}{10}\pi`,
    antwoord: '(81/10)*pi',
    alts: ['81*pi/10'],
    integrand: 'pi * (3 * x - x^2)^2',
    primitieve: 'pi * (3 * x^3 - (3/2) * x^4 + (1/5) * x^5)',
    grenzen: [0, 3],
    waarde: '(81/10)*pi',
    steps: stappen(
      r`Wentelen om de $y$-as geeft $\pi \displaystyle\int x^{2}\,\mathrm{d}y$. Op $[0, 3]$ is $x \ge 0$ en stijgt $y$.`,
      r`$\mathrm{d}y = \mathrm{d}t$ en $x = 3t - t^{2}$, dus $I(L) = \displaystyle\int_{0}^{3} \pi(3t - t^{2})^{2}\,\mathrm{d}t = \displaystyle\int_{0}^{3} \pi(9t^{2} - 6t^{3} + t^{4})\,\mathrm{d}t$.`,
      r`Een primitieve is $\pi\left(3t^{3} - \tfrac{3}{2}t^{4} + \tfrac{1}{5}t^{5}\right)$.`,
      r`$\pi\left[3t^{3} - \tfrac{3}{2}t^{4} + \tfrac{1}{5}t^{5}\right]_{0}^{3} = \pi\left(81 - \tfrac{243}{2} + \tfrac{243}{5}\right) = \pi \cdot \tfrac{81}{10} = \tfrac{81}{10}\pi$. De inhoud is $\tfrac{81}{10}\pi$.`,
    ),
  },
  {
    cluster: 'k5a_inhoud',
    nummer: 'in-6',
    level: 2,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = 4 - t \\ y(t) = t \end{cases}$ met $0 \le t \le 4$. Het vlakdeel $V$ wordt ingesloten door $K$, de positieve $x$-as en de positieve $y$-as. Het lichaam $L$ ontstaat als $V$ om de $y$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{64}{3}\pi`,
    antwoord: '(64/3)*pi',
    alts: ['64*pi/3', '64/3 pi'],
    integrand: 'pi * (4 - x)^2',
    primitieve: 'pi * (16 * x - 4 * x^2 + (1/3) * x^3)',
    grenzen: [0, 4],
    waarde: '(64/3)*pi',
    steps: stappen(
      r`Wentelen om de $y$-as geeft $\pi \displaystyle\int x^{2}\,\mathrm{d}y$. Hier is $x$ de afstand tot de $y$-as, en $y$ stijgt van $0$ tot $4$.`,
      r`$x = 4 - t$ en $\mathrm{d}y = \mathrm{d}t$: $I(L) = \displaystyle\int_{0}^{4} \pi(4 - t)^{2}\,\mathrm{d}t = \displaystyle\int_{0}^{4} \pi(16 - 8t + t^{2})\,\mathrm{d}t$.`,
      r`Een primitieve is $\pi\left(16t - 4t^{2} + \tfrac{1}{3}t^{3}\right)$.`,
      r`$\pi\left[16t - 4t^{2} + \tfrac{1}{3}t^{3}\right]_{0}^{4} = \pi\left(64 - 64 + \tfrac{64}{3}\right) = \tfrac{64}{3}\pi$. De inhoud is $\tfrac{64}{3}\pi$.`,
    ),
  },
  {
    cluster: 'k5a_inhoud',
    nummer: 'in-7',
    level: 3,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = t \\ y(t) = 4 - t^{2} \end{cases}$ met $-2 \le t \le 2$. Het vlakdeel $V$ wordt ingesloten door $K$ en de $x$-as. Het lichaam $L$ ontstaat als $V$ om de $x$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{512}{15}\pi`,
    antwoord: '(512/15)*pi',
    alts: ['512*pi/15'],
    integrand: 'pi * (4 - x^2)^2',
    primitieve: 'pi * (16 * x - (8/3) * x^3 + (1/5) * x^5)',
    grenzen: [-2, 2],
    waarde: '(512/15)*pi',
    steps: stappen(
      r`Wentelen om de $x$-as geeft $\pi \displaystyle\int y^{2}\,\mathrm{d}x$. Op $[-2, 2]$ is $y \ge 0$ en loopt $x$ van links naar rechts.`,
      r`$(4 - t^{2})^{2} = 16 - 8t^{2} + t^{4}$, dus $I(L) = \displaystyle\int_{-2}^{2} \pi(16 - 8t^{2} + t^{4})\,\mathrm{d}t$.`,
      r`Een primitieve is $\pi\left(16t - \tfrac{8}{3}t^{3} + \tfrac{1}{5}t^{5}\right)$.`,
      r`De integrand is even, dus het verschil van de grenzen is twee keer de waarde bij $t = 2$: $2\pi\left(32 - \tfrac{64}{3} + \tfrac{32}{5}\right) = 2\pi \cdot \tfrac{256}{15} = \tfrac{512}{15}\pi$. De inhoud is $\tfrac{512}{15}\pi$.`,
    ),
  },
  {
    cluster: 'k5a_inhoud',
    nummer: 'in-8',
    level: 3,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = t^{2} - 1 \\ y(t) = t \end{cases}$ met $0 \le t \le 1$. Het vlakdeel $V$ wordt ingesloten door $K$ en de $y$-as. Het lichaam $L$ ontstaat als $V$ om de $y$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{8}{15}\pi`,
    antwoord: '(8/15)*pi',
    alts: ['8*pi/15'],
    integrand: 'pi * (x^2 - 1)^2',
    primitieve: 'pi * ((1/5) * x^5 - (2/3) * x^3 + x)',
    domein: [0, 2],
    grenzen: [0, 1],
    waarde: '(8/15)*pi',
    steps: stappen(
      r`De kromme ligt links van de $y$-as. De straal bij het wentelen om de $y$-as is de afstand tot die as, dus $|x| = 1 - t^{2}$. De inhoud is $\pi \displaystyle\int x^{2}\,\mathrm{d}y$, en $y$ stijgt.`,
      r`$x^{2} = (t^{2} - 1)^{2} = t^{4} - 2t^{2} + 1$ en $\mathrm{d}y = \mathrm{d}t$: $I(L) = \displaystyle\int_{0}^{1} \pi(t^{4} - 2t^{2} + 1)\,\mathrm{d}t$.`,
      r`Een primitieve is $\pi\left(\tfrac{1}{5}t^{5} - \tfrac{2}{3}t^{3} + t\right)$.`,
      r`$\pi\left[\tfrac{1}{5}t^{5} - \tfrac{2}{3}t^{3} + t\right]_{0}^{1} = \pi\left(\tfrac{1}{5} - \tfrac{2}{3} + 1\right) = \pi \cdot \tfrac{8}{15} = \tfrac{8}{15}\pi$. De inhoud is $\tfrac{8}{15}\pi$.`,
    ),
  },

  // ── B · gesloten oppervlakte ─────────────────────────────────────────────
  {
    cluster: 'k5b_oppervlakte',
    nummer: 'sl-1',
    level: 1,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = \cos(t) \\ y(t) = \sin(t) \end{cases}$ met $0 \le t \le 2\pi$. $K$ sluit het vlakdeel $V$ in en wordt in positieve richting omgelopen. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\pi`,
    antwoord: 'pi',
    integrand: 'cos(x)^2',
    primitieve: 'x / 2 + sin(2 * x) / 4',
    grenzen: [0, 2 * Math.PI],
    waarde: 'pi',
    steps: stappen(
      r`Bij een omsloten vlakdeel dat in positieve richting wordt omgelopen, is $O(V) = \displaystyle\int x\,\mathrm{d}y$. Hier loopt $t$ van $0$ tot $2\pi$.`,
      r`$\mathrm{d}y = \cos(t)\,\mathrm{d}t$, dus $O(V) = \displaystyle\int_{0}^{2\pi} \cos(t) \cdot \cos(t)\,\mathrm{d}t = \displaystyle\int_{0}^{2\pi} \cos^{2}(t)\,\mathrm{d}t$. Met $\cos^{2}(t) = \tfrac{1}{2}(1 + \cos(2t))$ wordt dat $\displaystyle\int_{0}^{2\pi} \tfrac{1}{2}(1 + \cos(2t))\,\mathrm{d}t$.`,
      r`Een primitieve is $\tfrac{1}{2}t + \tfrac{1}{4}\sin(2t)$.`,
      r`$\left[\tfrac{1}{2}t + \tfrac{1}{4}\sin(2t)\right]_{0}^{2\pi} = \pi$. De oppervlakte is $\pi$.`,
    ),
  },
  {
    cluster: 'k5b_oppervlakte',
    nummer: 'sl-2',
    level: 1,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = 2\cos(t) \\ y(t) = 2\sin(t) \end{cases}$ met $0 \le t \le 2\pi$. $K$ sluit het vlakdeel $V$ in en wordt in positieve richting omgelopen. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`4\pi`,
    antwoord: '4*pi',
    alts: ['4pi'],
    integrand: '4 * cos(x)^2',
    primitieve: '2 * x + sin(2 * x)',
    grenzen: [0, 2 * Math.PI],
    waarde: '4*pi',
    steps: stappen(
      r`Positieve richting, dus $O(V) = \displaystyle\int x\,\mathrm{d}y$ met $t$ van $0$ tot $2\pi$.`,
      r`$\mathrm{d}y = 2\cos(t)\,\mathrm{d}t$, dus $O(V) = \displaystyle\int_{0}^{2\pi} 2\cos(t) \cdot 2\cos(t)\,\mathrm{d}t = \displaystyle\int_{0}^{2\pi} 4\cos^{2}(t)\,\mathrm{d}t = \displaystyle\int_{0}^{2\pi} (2 + 2\cos(2t))\,\mathrm{d}t$.`,
      r`Een primitieve is $2t + \sin(2t)$.`,
      r`$\left[2t + \sin(2t)\right]_{0}^{2\pi} = 4\pi$. De oppervlakte is $4\pi$.`,
    ),
  },
  {
    cluster: 'k5b_oppervlakte',
    nummer: 'sl-3',
    level: 1,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = 2\cos(t) \\ y(t) = \sin(t) \end{cases}$ met $0 \le t \le 2\pi$. $K$ sluit het vlakdeel $V$ in en wordt in positieve richting omgelopen. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`2\pi`,
    antwoord: '2*pi',
    alts: ['2pi'],
    integrand: '2 * cos(x)^2',
    primitieve: 'x + sin(2 * x) / 2',
    grenzen: [0, 2 * Math.PI],
    waarde: '2*pi',
    steps: stappen(
      r`Positieve richting, dus $O(V) = \displaystyle\int x\,\mathrm{d}y$ met $t$ van $0$ tot $2\pi$.`,
      r`$\mathrm{d}y = \cos(t)\,\mathrm{d}t$, dus $O(V) = \displaystyle\int_{0}^{2\pi} 2\cos(t) \cdot \cos(t)\,\mathrm{d}t = \displaystyle\int_{0}^{2\pi} (1 + \cos(2t))\,\mathrm{d}t$.`,
      r`Een primitieve is $t + \tfrac{1}{2}\sin(2t)$.`,
      r`$\left[t + \tfrac{1}{2}\sin(2t)\right]_{0}^{2\pi} = 2\pi$. De oppervlakte is $2\pi$.`,
    ),
  },
  {
    cluster: 'k5b_oppervlakte',
    nummer: 'sl-4',
    level: 2,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = 3\cos(t) \\ y(t) = 2\sin(t) \end{cases}$ met $0 \le t \le 2\pi$. $K$ sluit het vlakdeel $V$ in en wordt in positieve richting omgelopen. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`6\pi`,
    antwoord: '6*pi',
    alts: ['6pi'],
    integrand: '6 * cos(x)^2',
    primitieve: '3 * x + (3/2) * sin(2 * x)',
    grenzen: [0, 2 * Math.PI],
    waarde: '6*pi',
    steps: stappen(
      r`Positieve richting, dus $O(V) = \displaystyle\int x\,\mathrm{d}y$ met $t$ van $0$ tot $2\pi$.`,
      r`$\mathrm{d}y = 2\cos(t)\,\mathrm{d}t$, dus $O(V) = \displaystyle\int_{0}^{2\pi} 3\cos(t) \cdot 2\cos(t)\,\mathrm{d}t = \displaystyle\int_{0}^{2\pi} 6\cos^{2}(t)\,\mathrm{d}t = \displaystyle\int_{0}^{2\pi} (3 + 3\cos(2t))\,\mathrm{d}t$.`,
      r`Een primitieve is $3t + \tfrac{3}{2}\sin(2t)$.`,
      r`$\left[3t + \tfrac{3}{2}\sin(2t)\right]_{0}^{2\pi} = 6\pi$. De oppervlakte is $6\pi$.`,
    ),
  },
  {
    cluster: 'k5b_oppervlakte',
    nummer: 'sl-5',
    level: 2,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = 1 - t^{2} \\ y(t) = t - t^{3} \end{cases}$ met $-1 \le t \le 1$. $K$ sluit het vlakdeel $V$ in en wordt in positieve richting omgelopen. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\dfrac{8}{15}`,
    antwoord: '8/15',
    integrand: '(1 - x^2) * (1 - 3 * x^2)',
    primitieve: 'x - (4/3) * x^3 + (3/5) * x^5',
    grenzen: [-1, 1],
    waarde: '8/15',
    steps: stappen(
      r`De kromme begint en eindigt in $(0, 0)$. Ze wordt in positieve richting omgelopen, dus $O(V) = \displaystyle\int x\,\mathrm{d}y$ met $t$ van $-1$ tot $1$.`,
      r`$\mathrm{d}y = (1 - 3t^{2})\,\mathrm{d}t$, dus $O(V) = \displaystyle\int_{-1}^{1} (1 - t^{2})(1 - 3t^{2})\,\mathrm{d}t = \displaystyle\int_{-1}^{1} (1 - 4t^{2} + 3t^{4})\,\mathrm{d}t$.`,
      r`Een primitieve is $t - \tfrac{4}{3}t^{3} + \tfrac{3}{5}t^{5}$.`,
      r`De integrand is even, dus het verschil van de grenzen is twee keer de waarde bij $t = 1$: $2\left(1 - \tfrac{4}{3} + \tfrac{3}{5}\right) = 2 \cdot \tfrac{4}{15} = \tfrac{8}{15}$. De oppervlakte is $\tfrac{8}{15}$.`,
    ),
  },
  {
    cluster: 'k5b_oppervlakte',
    nummer: 'sl-6',
    level: 2,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = t^{2} \\ y(t) = 2t^{3} - 2t \end{cases}$ met $-1 \le t \le 1$. $K$ sluit het vlakdeel $V$ in en wordt in positieve richting omgelopen. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\dfrac{16}{15}`,
    antwoord: '16/15',
    integrand: '2 * x^2 * (3 * x^2 - 1)',
    primitieve: '(6/5) * x^5 - (2/3) * x^3',
    grenzen: [-1, 1],
    waarde: '16/15',
    steps: stappen(
      r`Begin- en eindpunt zijn allebei $(1, 0)$. Positieve richting, dus $O(V) = \displaystyle\int x\,\mathrm{d}y$ met $t$ van $-1$ tot $1$.`,
      r`$y(t) = 2(t^{3} - t)$, dus $\mathrm{d}y = 2(3t^{2} - 1)\,\mathrm{d}t$. Dan $O(V) = \displaystyle\int_{-1}^{1} t^{2} \cdot 2(3t^{2} - 1)\,\mathrm{d}t = \displaystyle\int_{-1}^{1} (6t^{4} - 2t^{2})\,\mathrm{d}t$.`,
      r`Een primitieve is $\tfrac{6}{5}t^{5} - \tfrac{2}{3}t^{3}$.`,
      r`$2\left(\tfrac{6}{5} - \tfrac{2}{3}\right) = 2 \cdot \tfrac{8}{15} = \tfrac{16}{15}$. De oppervlakte is $\tfrac{16}{15}$.`,
    ),
  },
  {
    cluster: 'k5b_oppervlakte',
    nummer: 'sl-7',
    level: 3,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = \sin(t) \\ y(t) = \sin(2t) \end{cases}$ met $0 \le t \le 2\pi$. $K$ sluit twee even grote vlakdelen in, symmetrisch in de $y$-as. Bereken exact de totale oppervlakte van deze vlakdelen.`,
    antwoordLatex: r`\dfrac{8}{3}`,
    antwoord: '8/3',
    integrand: '-4 * sin(x) * cos(2 * x)',
    primitieve: '-4 * cos(x) + (8/3) * cos(x)^3',
    domein: [0, 3],
    grenzen: [0, Math.PI],
    waarde: '8/3',
    steps: stappen(
      r`De twee lussen zijn even groot. Eén lus hoort bij $t$ van $0$ tot $\pi$. Omdat de parameter daar de lus de andere kant op loopt, neem je het tegengestelde van $\displaystyle\int x\,\mathrm{d}y$ en tel je de tweede lus erbij.`,
      r`$\mathrm{d}y = 2\cos(2t)\,\mathrm{d}t$. De totale oppervlakte is $2 \cdot \left(-\displaystyle\int_{0}^{\pi} \sin(t) \cdot 2\cos(2t)\,\mathrm{d}t\right) = \displaystyle\int_{0}^{\pi} -4\sin(t)\cos(2t)\,\mathrm{d}t$.`,
      r`Schrijf $\cos(2t) = 1 - 2\sin^{2}(t)$. Dan is de integrand $-4\sin(t) + 8\sin^{3}(t)$. Een primitieve is $-4\cos(t) + \tfrac{8}{3}\cos^{3}(t)$.`,
      r`$\left[-4\cos(t) + \tfrac{8}{3}\cos^{3}(t)\right]_{0}^{\pi} = \left(4 - \tfrac{8}{3}\right) - \left(-4 + \tfrac{8}{3}\right) = \tfrac{8}{3}$. De totale oppervlakte is $\tfrac{8}{3}$.`,
    ),
  },
  {
    cluster: 'k5b_oppervlakte',
    nummer: 'sl-8',
    level: 3,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = 9t - t^{3} \\ y(t) = t^{2} \end{cases}$ met $-3 \le t \le 3$. $K$ sluit het vlakdeel $V$ in en wordt in positieve richting omgelopen. Bereken exact de oppervlakte van $V$.`,
    antwoordLatex: r`\dfrac{648}{5}`,
    antwoord: '648/5',
    integrand: '(9 * x - x^3) * 2 * x',
    primitieve: '6 * x^3 - (2/5) * x^5',
    grenzen: [-3, 3],
    waarde: '648/5',
    steps: stappen(
      r`Bij $t = -3$ en bij $t = 3$ is het punt $(0, 9)$, en bij $t = 0$ het punt $(0, 0)$. Positieve richting, dus $O(V) = \displaystyle\int x\,\mathrm{d}y$.`,
      r`$\mathrm{d}y = 2t\,\mathrm{d}t$, dus $O(V) = \displaystyle\int_{-3}^{3} (9t - t^{3}) \cdot 2t\,\mathrm{d}t = \displaystyle\int_{-3}^{3} (18t^{2} - 2t^{4})\,\mathrm{d}t$.`,
      r`Een primitieve is $6t^{3} - \tfrac{2}{5}t^{5}$.`,
      r`$2\left(6 \cdot 27 - \tfrac{2}{5} \cdot 243\right) = 2\left(162 - \tfrac{486}{5}\right) = 2 \cdot \tfrac{324}{5} = \tfrac{648}{5}$. De oppervlakte is $\tfrac{648}{5}$.`,
    ),
  },

  // ── B · gesloten inhoud ──────────────────────────────────────────────────
  {
    cluster: 'k5b_inhoud',
    nummer: 'li-1',
    level: 1,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = \cos(t) \\ y(t) = \sin(t) \end{cases}$ met $0 \le t \le 2\pi$. $K$ sluit het vlakdeel $V$ in. Het lichaam $L$ ontstaat als $V$ om de $x$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{4}{3}\pi`,
    antwoord: '(4/3)*pi',
    alts: ['4*pi/3', '4/3 pi'],
    integrand: 'pi * sin(x)^3',
    primitieve: 'pi * (-cos(x) + cos(x)^3 / 3)',
    grenzen: [0, Math.PI],
    waarde: '(4/3)*pi',
    steps: stappen(
      r`$V$ is de eenheidscirkel, symmetrisch in de $x$-as. Wentelen om de $x$-as geeft een bol. De straal is $y$ van de bovenste helft, dus $I(L) = \pi \displaystyle\int y^{2}\,\mathrm{d}x$ langs die helft, van links naar rechts.`,
      r`De bovenste helft van rechts naar links is $t$ van $0$ tot $\pi$, met $\mathrm{d}x = -\sin(t)\,\mathrm{d}t$. Omdraaien geeft $I(L) = \displaystyle\int_{0}^{\pi} \pi\sin^{3}(t)\,\mathrm{d}t$. Schrijf $\sin^{3}(t) = (1 - \cos^{2}(t))\sin(t)$.`,
      r`Een primitieve is $\pi\left(-\cos(t) + \tfrac{1}{3}\cos^{3}(t)\right)$.`,
      r`$\pi\left[\left(1 - \tfrac{1}{3}\right) - \left(-1 + \tfrac{1}{3}\right)\right] = \pi \cdot \tfrac{4}{3} = \tfrac{4}{3}\pi$. De inhoud is $\tfrac{4}{3}\pi$.`,
    ),
  },
  {
    cluster: 'k5b_inhoud',
    nummer: 'li-2',
    level: 1,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = 2\cos(t) \\ y(t) = 2\sin(t) \end{cases}$ met $0 \le t \le 2\pi$. $K$ sluit het vlakdeel $V$ in. Het lichaam $L$ ontstaat als $V$ om de $x$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{32}{3}\pi`,
    antwoord: '(32/3)*pi',
    alts: ['32*pi/3'],
    integrand: '8 * pi * sin(x)^3',
    primitieve: '8 * pi * (-cos(x) + cos(x)^3 / 3)',
    grenzen: [0, Math.PI],
    waarde: '(32/3)*pi',
    steps: stappen(
      r`Cirkel met straal $2$, symmetrisch in de $x$-as. $I(L) = \pi \displaystyle\int y^{2}\,\mathrm{d}x$ langs de bovenste helft, van links naar rechts.`,
      r`$y = 2\sin(t)$ en van links naar rechts wordt de factor $-\mathrm{d}x$ positief: $I(L) = \displaystyle\int_{0}^{\pi} \pi \cdot 4\sin^{2}(t) \cdot 2\sin(t)\,\mathrm{d}t = \displaystyle\int_{0}^{\pi} 8\pi\sin^{3}(t)\,\mathrm{d}t$.`,
      r`Een primitieve is $8\pi\left(-\cos(t) + \tfrac{1}{3}\cos^{3}(t)\right)$.`,
      r`$8\pi \cdot \tfrac{4}{3} = \tfrac{32}{3}\pi$. De inhoud is $\tfrac{32}{3}\pi$.`,
    ),
  },
  {
    cluster: 'k5b_inhoud',
    nummer: 'li-3',
    level: 1,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = 2\cos(t) \\ y(t) = \sin(t) \end{cases}$ met $0 \le t \le 2\pi$. $K$ sluit het vlakdeel $V$ in. Het lichaam $L$ ontstaat als $V$ om de $x$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{8}{3}\pi`,
    antwoord: '(8/3)*pi',
    alts: ['8*pi/3'],
    integrand: '2 * pi * sin(x)^3',
    primitieve: '2 * pi * (-cos(x) + cos(x)^3 / 3)',
    grenzen: [0, Math.PI],
    waarde: '(8/3)*pi',
    steps: stappen(
      r`De kromme is symmetrisch in de $x$-as. $I(L) = \pi \displaystyle\int y^{2}\,\mathrm{d}x$ langs de bovenste helft, van links naar rechts.`,
      r`$y = \sin(t)$ en $\mathrm{d}x = -2\sin(t)\,\mathrm{d}t$ op de bovenste helft. Van links naar rechts: $I(L) = \displaystyle\int_{0}^{\pi} \pi\sin^{2}(t) \cdot 2\sin(t)\,\mathrm{d}t = \displaystyle\int_{0}^{\pi} 2\pi\sin^{3}(t)\,\mathrm{d}t$.`,
      r`Een primitieve is $2\pi\left(-\cos(t) + \tfrac{1}{3}\cos^{3}(t)\right)$.`,
      r`$2\pi \cdot \tfrac{4}{3} = \tfrac{8}{3}\pi$. De inhoud is $\tfrac{8}{3}\pi$.`,
    ),
  },
  {
    cluster: 'k5b_inhoud',
    nummer: 'li-4',
    level: 2,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = 1 - t^{2} \\ y(t) = t - t^{3} \end{cases}$ met $-1 \le t \le 1$. $K$ sluit het vlakdeel $V$ in en is symmetrisch in de $x$-as. Het lichaam $L$ ontstaat als $V$ om de $x$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{1}{12}\pi`,
    antwoord: '(1/12)*pi',
    alts: ['pi/12', '1/12 pi'],
    integrand: 'pi * (2 * x^3 - 4 * x^5 + 2 * x^7)',
    primitieve: 'pi * ((1/2) * x^4 - (2/3) * x^6 + (1/4) * x^8)',
    grenzen: [0, 1],
    waarde: '(1/12)*pi',
    steps: stappen(
      r`Door de symmetrie in de $x$-as is de straal de $y$ van de bovenste helft ($t$ van $0$ tot $1$). Daar loopt $x$ van $1$ naar $0$, dus van rechts naar links. Voor de inhoud draai je de grenzen om: $I(L) = \pi \displaystyle\int y^{2}\,\mathrm{d}x$ van links naar rechts.`,
      r`$y = t - t^{3}$ en $\mathrm{d}x = -2t\,\mathrm{d}t$. Van $t = 1$ naar $t = 0$ wordt dat $\displaystyle\int_{0}^{1} \pi \cdot 2t(t - t^{3})^{2}\,\mathrm{d}t = \displaystyle\int_{0}^{1} \pi(2t^{3} - 4t^{5} + 2t^{7})\,\mathrm{d}t$.`,
      r`Een primitieve is $\pi\left(\tfrac{1}{2}t^{4} - \tfrac{2}{3}t^{6} + \tfrac{1}{4}t^{8}\right)$.`,
      r`$\pi\left(\tfrac{1}{2} - \tfrac{2}{3} + \tfrac{1}{4}\right) = \pi \cdot \tfrac{1}{12} = \tfrac{1}{12}\pi$. De inhoud is $\tfrac{1}{12}\pi$.`,
    ),
  },
  {
    cluster: 'k5b_inhoud',
    nummer: 'li-5',
    level: 2,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = t^{2} \\ y(t) = 3t - 3t^{3} \end{cases}$ met $-1 \le t \le 1$. $K$ sluit het vlakdeel $V$ in en is symmetrisch in de $x$-as. Het lichaam $L$ ontstaat als $V$ om de $x$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{3}{4}\pi`,
    antwoord: '(3/4)*pi',
    alts: ['3*pi/4', '3/4 pi'],
    integrand: 'pi * (18 * x^3 - 36 * x^5 + 18 * x^7)',
    primitieve: 'pi * ((9/2) * x^4 - 6 * x^6 + (9/4) * x^8)',
    grenzen: [0, 1],
    waarde: '(3/4)*pi',
    steps: stappen(
      r`Symmetrisch in de $x$-as. Op de bovenste helft, $t$ van $0$ tot $1$, stijgt $x$ van $0$ naar $1$. Dus $I(L) = \pi \displaystyle\int_{0}^{1} y^{2} x'(t)\,\mathrm{d}t$.`,
      r`$y = 3(t - t^{3})$ en $x'(t) = 2t$, dus $y^{2} x'(t) = 18t^{3} - 36t^{5} + 18t^{7}$.`,
      r`Een primitieve van $\pi$ keer die veelterm is $\pi\left(\tfrac{9}{2}t^{4} - 6t^{6} + \tfrac{9}{4}t^{8}\right)$.`,
      r`$\pi\left(\tfrac{9}{2} - 6 + \tfrac{9}{4}\right) = \pi \cdot \tfrac{3}{4} = \tfrac{3}{4}\pi$. De inhoud is $\tfrac{3}{4}\pi$.`,
    ),
  },
  {
    cluster: 'k5b_inhoud',
    nummer: 'li-6',
    level: 2,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = 2\cos(t) \\ y(t) = 3\sin(t) \end{cases}$ met $0 \le t \le 2\pi$. $K$ sluit het vlakdeel $V$ in. Het lichaam $L$ ontstaat als $V$ om de $x$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`24\pi`,
    antwoord: '24*pi',
    alts: ['24pi'],
    integrand: '18 * pi * sin(x)^3',
    primitieve: '18 * pi * (-cos(x) + cos(x)^3 / 3)',
    grenzen: [0, Math.PI],
    waarde: '24*pi',
    steps: stappen(
      r`Symmetrisch in de $x$-as. $I(L) = \pi \displaystyle\int y^{2}\,\mathrm{d}x$ langs de bovenste helft, van links naar rechts.`,
      r`$y = 3\sin(t)$ en $|\mathrm{d}x| = 2\sin(t)\,\mathrm{d}t$ op $[0, \pi]$ na het omdraaien: $I(L) = \displaystyle\int_{0}^{\pi} \pi \cdot 9\sin^{2}(t) \cdot 2\sin(t)\,\mathrm{d}t = \displaystyle\int_{0}^{\pi} 18\pi\sin^{3}(t)\,\mathrm{d}t$.`,
      r`Een primitieve is $18\pi\left(-\cos(t) + \tfrac{1}{3}\cos^{3}(t)\right)$.`,
      r`$18\pi \cdot \tfrac{4}{3} = 24\pi$. De inhoud is $24\pi$.`,
    ),
  },
  {
    cluster: 'k5b_inhoud',
    nummer: 'li-7',
    level: 3,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = \sin(t) \\ y(t) = \sin(2t) \end{cases}$ met $0 \le t \le 2\pi$. $K$ sluit twee even grote vlakdelen in, allebei symmetrisch in de $x$-as. Het lichaam $L$ ontstaat als deze vlakdelen om de $x$-as wentelen. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{16}{15}\pi`,
    antwoord: '(16/15)*pi',
    alts: ['16*pi/15'],
    integrand: '8 * pi * sin(x)^2 * cos(x)^3',
    primitieve: 'pi * ((8/3) * sin(x)^3 - (8/5) * sin(x)^5)',
    domein: [0, 1.5],
    grenzen: [0, Math.PI / 2],
    waarde: '(16/15)*pi',
    steps: stappen(
      r`Elke lus is symmetrisch in de $x$-as, en de lussen zijn even groot. Voor één lus neem je de bovenste helft, $t$ van $0$ tot $\tfrac{1}{2}\pi$: daar stijgt $x$. De totale inhoud is twee keer $\pi \displaystyle\int y^{2}\,\mathrm{d}x$ over die helft.`,
      r`$y = \sin(2t) = 2\sin(t)\cos(t)$ en $\mathrm{d}x = \cos(t)\,\mathrm{d}t$. Twee lussen geven $\displaystyle\int_{0}^{\pi/2} 8\pi\sin^{2}(t)\cos^{3}(t)\,\mathrm{d}t$.`,
      r`Schrijf $\cos^{2}(t) = 1 - \sin^{2}(t)$ en stel de kern $g(t) = \sin(t)$. Dan is een primitieve $\pi\left(\tfrac{8}{3}\sin^{3}(t) - \tfrac{8}{5}\sin^{5}(t)\right)$.`,
      r`$\pi\left(\tfrac{8}{3} - \tfrac{8}{5}\right) = \pi \cdot \tfrac{16}{15} = \tfrac{16}{15}\pi$. De inhoud is $\tfrac{16}{15}\pi$.`,
    ),
  },
  {
    cluster: 'k5b_inhoud',
    nummer: 'li-8',
    level: 3,
    latex: r`De kromme $K$ is gegeven door $\begin{cases} x(t) = 1 - t^{2} \\ y(t) = t - t^{3} \end{cases}$ met $-1 \le t \le 1$. $K$ sluit het vlakdeel $V$ in en wordt in positieve richting omgelopen. Het lichaam $L$ ontstaat als $V$ om de $y$-as wentelt. Bereken exact de inhoud van $L$.`,
    antwoordLatex: r`\dfrac{64}{105}\pi`,
    antwoord: '(64/105)*pi',
    alts: ['64*pi/105'],
    integrand: 'pi * (1 - 5 * x^2 + 7 * x^4 - 3 * x^6)',
    primitieve: 'pi * (x - (5/3) * x^3 + (7/5) * x^5 - (3/7) * x^7)',
    grenzen: [-1, 1],
    waarde: '(64/105)*pi',
    steps: stappen(
      r`De kromme raakt de $y$-as alleen in het begin- en eindpunt en ligt verder rechts daarvan. In positieve richting is de inhoud bij wentelen om de $y$-as $\pi \displaystyle\int x^{2}\,\mathrm{d}y$.`,
      r`$x^{2} = (1 - t^{2})^{2}$ en $\mathrm{d}y = (1 - 3t^{2})\,\mathrm{d}t$, dus $I(L) = \displaystyle\int_{-1}^{1} \pi(1 - 5t^{2} + 7t^{4} - 3t^{6})\,\mathrm{d}t$.`,
      r`Een primitieve is $\pi\left(t - \tfrac{5}{3}t^{3} + \tfrac{7}{5}t^{5} - \tfrac{3}{7}t^{7}\right)$.`,
      r`Twee keer de waarde bij $t = 1$: $2\pi\left(1 - \tfrac{5}{3} + \tfrac{7}{5} - \tfrac{3}{7}\right) = 2\pi \cdot \tfrac{32}{105} = \tfrac{64}{105}\pi$. De inhoud is $\tfrac{64}{105}\pi$.`,
    ),
  },
]

const K5: AdditiveChapter = {
  chapterSlug: 'k',
  chapterTitle: 'K — Voortgezette integraalrekening',
  bookPart: 4,
  chapterOrder: 12,
  site: 'integralen',
  migrationFile: '0053_k5_parameterkrommen.sql',
  headerTitle: 'K.5 — Integralen bij parameterkrommen',
  sourceScript: 'scripts/k5-content.ts',
  headerNotes: [
    'Paragraaf K.5. Twee theorieblokken.',
    'A: oppervlakte en inhoud van een vlakdeel langs een kromme en een as.',
    'B: hetzelfde als de kromme een vlakdeel omsluit.',
    '',
    'Vier clusters, acht vragen per cluster.',
    '',
    'Eigen oefenvragen, geen boekopgaven. Elke integraal wordt nagerekend door',
    'src/content/primitieven.test.ts (content/hoofdstuk-k/k5.json): de',
    'primitieve naar de parameter, en de exacte uitkomst via de grenzen.',
  ],
  topics: [
    { slug: 'k5a_oppervlakte', title: 'Oppervlakte langs een parameterkromme', order: 33, category: 'toepassingen' },
    { slug: 'k5a_inhoud', title: 'Inhoud bij een parameterkromme', order: 34, category: 'toepassingen' },
    { slug: 'k5b_oppervlakte', title: 'Oppervlakte van een gesloten kromme', order: 35, category: 'toepassingen' },
    { slug: 'k5b_inhoud', title: 'Inhoud bij een gesloten kromme', order: 36, category: 'toepassingen' },
  ],
  clusters: [
    { topic: 'k5a_oppervlakte', slug: 'k5a_oppervlakte', title: 'Oppervlakte met de assen', order: 1 },
    { topic: 'k5a_inhoud', slug: 'k5a_inhoud', title: 'Wentelen om een as', order: 1 },
    { topic: 'k5b_oppervlakte', slug: 'k5b_oppervlakte', title: 'Oppervlakte van een omsloten vlakdeel', order: 1 },
    { topic: 'k5b_inhoud', slug: 'k5b_inhoud', title: 'Inhoud van een omwentelingslichaam', order: 1 },
  ],
  questions: VRAGEN,
}

const wortel = process.cwd()
const contentPad = path.join(wortel, 'content', 'hoofdstuk-k', 'k5.json')
writeFileSync(contentPad, generateContentFile(K5, 'K.5 — Integralen bij parameterkrommen (eigen varianten)'))

const migratiePad = path.join(wortel, 'supabase', 'migrations', K5.migrationFile)
let sql = voegTheorieblokToe(generateAdditiveMigration(K5), {
  paragraphSlug: 'k5',
  paragraphLabel: 'K.5',
  paragraphTitle: 'Integralen bij parameterkrommen',
  paragraphOrder: 6,
  blockSlug: 'k5a',
  blockLetter: 'A',
  blockTitle: 'Oppervlakten en inhouden bij parameterkrommen',
  blockOrder: 1,
  topics: ['k5a_oppervlakte', 'k5a_inhoud'],
})

const blokB = `INSERT INTO public.theory_blocks (paragraph_id, site, slug, letter, title, order_index)
SELECT p.id, 'integralen', 'k5b', 'B', 'Oppervlakten en inhouden van omsloten vlakdelen', 2
FROM public.paragraphs p
WHERE p.slug = 'k5' AND p.site = 'integralen'
ON CONFLICT (slug) DO NOTHING;

`

const koppelB = `-- 6b. Topics van theorieblok B koppelen
UPDATE public.topics_new AS t
SET theory_block_id = b.id
FROM (VALUES
  ('k5b_oppervlakte', 'k5b'),
  ('k5b_inhoud', 'k5b')
) AS v(topic_slug, block_slug)
JOIN public.theory_blocks b ON b.slug = v.block_slug AND b.site = 'integralen'
WHERE t.slug = v.topic_slug
  AND t.site = 'integralen'
  AND t.theory_block_id IS DISTINCT FROM b.id;

DO $blokb$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n
  FROM public.topics_new t
  JOIN public.theory_blocks b ON b.id = t.theory_block_id
  WHERE t.site = 'integralen'
    AND b.slug = 'k5b'
    AND t.slug IN ('k5b_oppervlakte', 'k5b_inhoud');
  IF n <> 2 THEN
    RAISE EXCEPTION 'Theorieblok k5b hoort 2 topics te hebben, gevonden %', n;
  END IF;
END $blokb$;

`

const ankerA = `WHERE p.slug = 'k5' AND p.site = 'integralen'
ON CONFLICT (slug) DO NOTHING;
`
if (!sql.includes(ankerA)) throw new Error('Geen plek voor theorieblok B')
sql = sql.replace(ankerA, `${ankerA}\n${blokB}`)
if (!sql.includes('-- 7. Controle')) throw new Error('Geen plek voor de koppeling van B')
sql = sql.replace('-- 7. Controle', `${koppelB}-- 7. Controle`)
sql = sql.replace(
  'De enige UPDATE zet theory_block_id op de topics van dit blok,',
  'De UPDATEs zetten theory_block_id op de topics van K.5 A en K.5 B,',
)

writeFileSync(migratiePad, sql)

console.log(`Geschreven: ${contentPad}`)
console.log(`Geschreven: ${migratiePad}`)
console.log(`Vragen: ${K5.questions.length}, stappen: ${K5.questions.length * 4}`)
