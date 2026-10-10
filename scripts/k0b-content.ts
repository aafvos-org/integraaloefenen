/**
 * K.0 Theorie B — Regels voor het primitiveren.
 *
 * Eigen oefenvragen in de stijl van het voorkennisblok: de standaardprimitieven
 * en de regel dat de primitieven van f(ax + b) gelijk zijn aan
 * 1/a · F(ax + b) + c. Geen boekopgaven; alles hieronder is nieuw bedacht.
 *
 * Draaien met:  npx jiti scripts/k0b-content.ts
 *
 * Schrijft twee bestanden:
 *   • content/hoofdstuk-k/k0b.json          — leest src/content/primitieven.test.ts
 *   • supabase/migrations/0034_k0b_primitiveren.sql — alleen rijen toevoegen
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
// Elke vraag krijgt vier stappen (step_order 0 t/m 3). Stap 0 benoemt welk deel
// van de driedeling aan de orde is; bij een kale primitiveer- of
// "bereken exact"-opgave is dat alleen deel 2: bereken de goede integraal.
// ─────────────────────────────────────────────────────────────────────────────

const DEEL2 = r`Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal.`

/** Primitiveren met de standaardprimitieven, term voor term. */
function standaard(s: { schil: string; herschrijf: string; regel: string; F: string }): Steps {
  return [
    `${DEEL2} ${s.schil}`,
    s.herschrijf,
    s.regel,
    r`Schrijf het antwoord op: $F(x) = ${s.F} + c$. Controle: differentieer $F$ en je krijgt $f$ terug.`,
  ]
}

/** Primitiveren met de regel voor f(ax + b). */
function lineair(s: { buiten: string; kern: string; a: string; buitenF: string; F: string }): Steps {
  return [
    `${DEEL2} In $f$ zit een kern $ax + b$, dus gebruik: de primitieven van $f(ax + b)$ zijn $\\dfrac{1}{a}F(ax + b) + c$.`,
    r`Buitenkant en kern: buitenkant $${s.buiten}$, kern $${s.kern}$. Dus $a = ${s.a}$.`,
    r`Primitiveer alleen de buitenkant, met de kern erin: ${s.buitenF}`,
    r`Deel door $a = ${s.a}$: $F(x) = ${s.F} + c$. Controle: differentieer $F$; de kettingregel geeft de factor $${s.a}$ weer terug.`,
  ]
}

/** Bepaalde integraal: eerst primitiveren, dan de grenzen invullen. */
function bepaald(s: { herken: string; F: string; invullen: string }): Steps {
  return [
    `${DEEL2} Eerst een primitieve zoeken, daarna de grenzen invullen. Het antwoord blijft exact.`,
    s.herken,
    r`Primitiveer: $F(x) = ${s.F}$. De integratieconstante laat je weg; die valt bij het aftrekken toch weg.`,
    s.invullen,
  ]
}

// ─────────────────────────────────────────────────────────────────────────────
// De vragen
// ─────────────────────────────────────────────────────────────────────────────

const VRAGEN: AdditiveQ[] = [
  // ── Machten, breuken en sin/cos ────────────────────────────────────────────
  {
    cluster: 'k0b_machten_gonio',
    nummer: 'machten-1',
    level: 1,
    latex: r`f(x) = x^{3} + \cos(x)`,
    antwoordLatex: r`F(x) = \tfrac{1}{4}x^{4} + \sin(x) + c`,
    antwoord: 'x^4/4 + sin(x) + c',
    alts: ['1/4x^4 + sin(x) + c', '0,25x^4 + sin(x) + c'],
    integrand: 'x^3 + cos(x)',
    primitieve: 'x^4/4 + sin(x)',
    steps: standaard({
      schil: r`Twee losse termen met een $+$ ertussen: primitiveer elke term apart.`,
      herschrijf: r`De termen zijn $x^{3}$ (een macht) en $\cos(x)$ (een standaardfunctie); herschrijven is niet nodig.`,
      regel: r`$ax^{n}$ geeft $a \cdot \dfrac{1}{n + 1}x^{n + 1}$, dus $x^{3}$ geeft $\tfrac{1}{4}x^{4}$. En $\cos(x)$ geeft $\sin(x)$.`,
      F: r`\tfrac{1}{4}x^{4} + \sin(x)`,
    }),
  },
  {
    cluster: 'k0b_machten_gonio',
    nummer: 'machten-2',
    level: 1,
    latex: r`f(x) = 6x^{2} - \sin(x)`,
    antwoordLatex: r`F(x) = 2x^{3} + \cos(x) + c`,
    antwoord: '2x^3 + cos(x) + c',
    integrand: '6 * x^2 - sin(x)',
    primitieve: '2 * x^3 + cos(x)',
    steps: standaard({
      schil: r`Twee losse termen met een $-$ ertussen: primitiveer elke term apart en houd het minteken vast.`,
      herschrijf: r`De termen zijn $6x^{2}$ en $-\sin(x)$.`,
      regel: r`$6x^{2}$ geeft $6 \cdot \tfrac{1}{3}x^{3} = 2x^{3}$. En $\sin(x)$ geeft $-\cos(x)$, dus $-\sin(x)$ geeft $+\cos(x)$.`,
      F: r`2x^{3} + \cos(x)`,
    }),
  },
  {
    cluster: 'k0b_machten_gonio',
    nummer: 'machten-3',
    level: 2,
    latex: r`f(x) = \dfrac{x^{3} + 4}{x^{2}}`,
    antwoordLatex: r`F(x) = \tfrac{1}{2}x^{2} - \dfrac{4}{x} + c`,
    antwoord: 'x^2/2 - 4/x + c',
    alts: ['1/2x^2 - 4/x + c', '0,5x^2 - 4/x + c'],
    integrand: '(x^3 + 4) / x^2',
    primitieve: 'x^2/2 - 4/x',
    domein: [0.5, 3],
    steps: standaard({
      schil: r`Een breuk met één term in de noemer: deel eerst uit, dan heb je losse machten van $x$. Er is geen quotiëntregel voor primitiveren.`,
      herschrijf: r`Deel uit: $f(x) = \dfrac{x^{3}}{x^{2}} + \dfrac{4}{x^{2}} = x + 4x^{-2}$.`,
      regel: r`$x$ geeft $\tfrac{1}{2}x^{2}$. En $4x^{-2}$ geeft $4 \cdot \dfrac{1}{-1}x^{-1} = -4x^{-1} = -\dfrac{4}{x}$.`,
      F: r`\tfrac{1}{2}x^{2} - \dfrac{4}{x}`,
    }),
  },
  {
    cluster: 'k0b_machten_gonio',
    nummer: 'machten-4',
    level: 2,
    latex: r`f(x) = \sqrt{x}\,(x - 3)`,
    antwoordLatex: r`F(x) = \tfrac{2}{5}x^{2}\sqrt{x} - 2x\sqrt{x} + c`,
    antwoord: '2/5 x^2 sqrt(x) - 2x sqrt(x) + c',
    alts: ['2/5x^(5/2) - 2x^(3/2) + c', '0,4x^2sqrt(x) - 2xsqrt(x) + c'],
    integrand: 'sqrt(x) * (x - 3)',
    primitieve: '0.4 * x^2 * sqrt(x) - 2 * x * sqrt(x)',
    domein: [0.1, 4],
    steps: standaard({
      schil: r`Een wortel maal haakjes: werk de haakjes uit en schrijf de wortel als een macht, dan is het weer de machtsregel.`,
      herschrijf: r`$\sqrt{x} = x^{\frac{1}{2}}$, dus $f(x) = x^{\frac{1}{2}} \cdot x - 3x^{\frac{1}{2}} = x^{\frac{3}{2}} - 3x^{\frac{1}{2}}$.`,
      regel: r`$x^{\frac{3}{2}}$ geeft $\dfrac{1}{\frac{5}{2}}x^{\frac{5}{2}} = \tfrac{2}{5}x^{\frac{5}{2}}$. En $3x^{\frac{1}{2}}$ geeft $3 \cdot \tfrac{2}{3}x^{\frac{3}{2}} = 2x^{\frac{3}{2}}$.`,
      F: r`\tfrac{2}{5}x^{2}\sqrt{x} - 2x\sqrt{x}`,
    }),
  },
  {
    cluster: 'k0b_machten_gonio',
    nummer: 'machten-5',
    level: 3,
    latex: r`f(x) = \dfrac{2x^{2} - 5}{x^{4}}`,
    antwoordLatex: r`F(x) = -\dfrac{2}{x} + \dfrac{5}{3x^{3}} + c`,
    antwoord: '-2/x + 5/(3x^3) + c',
    alts: ['-2x^-1 + 5/3x^-3 + c'],
    integrand: '(2 * x^2 - 5) / x^4',
    primitieve: '-2/x + 5/(3 * x^3)',
    domein: [0.5, 3],
    steps: standaard({
      schil: r`Een breuk met één term in de noemer: uitdelen, en let op de negatieve exponenten die je dan krijgt.`,
      herschrijf: r`Deel uit: $f(x) = \dfrac{2x^{2}}{x^{4}} - \dfrac{5}{x^{4}} = 2x^{-2} - 5x^{-4}$.`,
      regel: r`$2x^{-2}$ geeft $2 \cdot \dfrac{1}{-1}x^{-1} = -2x^{-1}$. En $5x^{-4}$ geeft $5 \cdot \dfrac{1}{-3}x^{-3} = -\tfrac{5}{3}x^{-3}$; met het minteken ervoor wordt dat $+\tfrac{5}{3}x^{-3}$.`,
      F: r`-\dfrac{2}{x} + \dfrac{5}{3x^{3}}`,
    }),
  },
  {
    cluster: 'k0b_machten_gonio',
    nummer: 'machten-6',
    level: 3,
    latex: r`f(x) = \dfrac{(\sqrt{x} + 1)^{2}}{x}`,
    antwoordLatex: r`F(x) = x + 4\sqrt{x} + \ln(x) + c`,
    antwoord: 'x + 4sqrt(x) + ln(x) + c',
    alts: ['x + 4x^(1/2) + ln(x) + c'],
    integrand: '(sqrt(x) + 1)^2 / x',
    primitieve: 'x + 4 * sqrt(x) + ln(x)',
    domein: [0.3, 4],
    steps: standaard({
      schil: r`Eerst het kwadraat uitwerken, dan uitdelen; pas daarna zie je de standaardvormen. Let op de term $\dfrac{1}{x}$: die geeft $\ln$, niet een macht.`,
      herschrijf: r`$(\sqrt{x} + 1)^{2} = x + 2\sqrt{x} + 1$, dus $f(x) = \dfrac{x + 2\sqrt{x} + 1}{x} = 1 + 2x^{-\frac{1}{2}} + x^{-1}$.`,
      regel: r`$1$ geeft $x$. En $2x^{-\frac{1}{2}}$ geeft $2 \cdot \dfrac{1}{\frac{1}{2}}x^{\frac{1}{2}} = 4\sqrt{x}$. De term $x^{-1} = \dfrac{1}{x}$ valt buiten de machtsregel ($n = -1$) en geeft $\ln(x)$.`,
      F: r`x + 4\sqrt{x} + \ln(x)`,
    }),
  },

  // ── e-machten en g^x ──────────────────────────────────────────────────────
  {
    cluster: 'k0b_exponenten',
    nummer: 'exp-1',
    level: 1,
    latex: r`f(x) = 5 \cdot 2^{x}`,
    antwoordLatex: r`F(x) = \dfrac{5 \cdot 2^{x}}{\ln(2)} + c`,
    antwoord: '5 * 2^x / ln(2) + c',
    alts: ['5*2^x/ln2 + c'],
    integrand: '5 * 2^x',
    primitieve: '5 * 2^x / ln(2)',
    steps: standaard({
      schil: r`Een getal maal een macht met $x$ in de exponent: dat is de standaardvorm $g^{x}$.`,
      herschrijf: r`Hier is $g = 2$; de factor $5$ blijft staan.`,
      regel: r`$g^{x}$ geeft $\dfrac{g^{x}}{\ln(g)}$, dus $2^{x}$ geeft $\dfrac{2^{x}}{\ln(2)}$.`,
      F: r`\dfrac{5 \cdot 2^{x}}{\ln(2)}`,
    }),
  },
  {
    cluster: 'k0b_exponenten',
    nummer: 'exp-2',
    level: 1,
    latex: r`f(x) = e^{x} + 3x^{2}`,
    antwoordLatex: r`F(x) = e^{x} + x^{3} + c`,
    antwoord: 'e^x + x^3 + c',
    integrand: 'e^x + 3 * x^2',
    primitieve: 'e^x + x^3',
    steps: standaard({
      schil: r`Twee losse termen: een $e$-macht en een macht van $x$. Primitiveer ze apart.`,
      herschrijf: r`De termen zijn $e^{x}$ en $3x^{2}$.`,
      regel: r`$e^{x}$ geeft $e^{x}$ — die verandert niet. En $3x^{2}$ geeft $3 \cdot \tfrac{1}{3}x^{3} = x^{3}$.`,
      F: r`e^{x} + x^{3}`,
    }),
  },
  {
    cluster: 'k0b_exponenten',
    nummer: 'exp-3',
    level: 2,
    latex: r`f(x) = 3^{x} - 2e^{x}`,
    antwoordLatex: r`F(x) = \dfrac{3^{x}}{\ln(3)} - 2e^{x} + c`,
    antwoord: '3^x/ln(3) - 2e^x + c',
    integrand: '3^x - 2 * e^x',
    primitieve: '3^x / ln(3) - 2 * e^x',
    steps: standaard({
      schil: r`Twee exponentiële termen, maar met verschillende grondtallen: $g = 3$ en $g = e$. Dat zijn twee verschillende regels.`,
      herschrijf: r`De termen zijn $3^{x}$ en $-2e^{x}$.`,
      regel: r`$3^{x}$ geeft $\dfrac{3^{x}}{\ln(3)}$. Bij $e^{x}$ hoeft dat delen niet, want $\ln(e) = 1$: $-2e^{x}$ geeft $-2e^{x}$.`,
      F: r`\dfrac{3^{x}}{\ln(3)} - 2e^{x}`,
    }),
  },
  {
    cluster: 'k0b_exponenten',
    nummer: 'exp-4',
    level: 2,
    latex: r`f(x) = \dfrac{9^{x} + 3^{x}}{3^{x}}`,
    antwoordLatex: r`F(x) = \dfrac{3^{x}}{\ln(3)} + x + c`,
    antwoord: '3^x/ln(3) + x + c',
    integrand: '(9^x + 3^x) / 3^x',
    primitieve: '3^x / ln(3) + x',
    steps: standaard({
      schil: r`Een breuk met machten: eerst uitdelen met de rekenregels voor machten, dan staan er standaardvormen.`,
      herschrijf: r`$\dfrac{9^{x}}{3^{x}} = \left(\dfrac{9}{3}\right)^{x} = 3^{x}$ en $\dfrac{3^{x}}{3^{x}} = 1$, dus $f(x) = 3^{x} + 1$.`,
      regel: r`$3^{x}$ geeft $\dfrac{3^{x}}{\ln(3)}$. En $1$ geeft $x$.`,
      F: r`\dfrac{3^{x}}{\ln(3)} + x`,
    }),
  },
  {
    cluster: 'k0b_exponenten',
    nummer: 'exp-5',
    level: 3,
    latex: r`f(x) = \dfrac{(2^{x} + 1)^{2}}{2^{x}}`,
    antwoordLatex: r`F(x) = \dfrac{2^{x}}{\ln(2)} + 2x - \dfrac{1}{2^{x}\ln(2)} + c`,
    antwoord: '2^x/ln(2) + 2x - 1/(2^x ln(2)) + c',
    alts: ['2^x/ln2 + 2x - 2^-x/ln2 + c'],
    integrand: '(2^x + 1)^2 / 2^x',
    primitieve: '2^x / ln(2) + 2 * x - 1 / (2^x * ln(2))',
    steps: standaard({
      schil: r`Eerst het kwadraat uitwerken, dan uitdelen. Er komt een term met $2^{-x}$ uit; dat is $g^{x}$ met $g = \tfrac{1}{2}$.`,
      herschrijf: r`$(2^{x} + 1)^{2} = 4^{x} + 2 \cdot 2^{x} + 1$, dus $f(x) = \dfrac{4^{x}}{2^{x}} + 2 + \dfrac{1}{2^{x}} = 2^{x} + 2 + 2^{-x}$.`,
      regel: r`$2^{x}$ geeft $\dfrac{2^{x}}{\ln(2)}$ en $2$ geeft $2x$. Voor $2^{-x} = \left(\tfrac{1}{2}\right)^{x}$ geldt $\ln\left(\tfrac{1}{2}\right) = -\ln(2)$, dus dat geeft $\dfrac{2^{-x}}{-\ln(2)} = -\dfrac{1}{2^{x}\ln(2)}$.`,
      F: r`\dfrac{2^{x}}{\ln(2)} + 2x - \dfrac{1}{2^{x}\ln(2)}`,
    }),
  },
  {
    cluster: 'k0b_exponenten',
    nummer: 'exp-6',
    level: 3,
    latex: r`f(x) = \dfrac{6^{x} - 3^{x}}{2^{x}}`,
    antwoordLatex: r`F(x) = \dfrac{3^{x}}{\ln(3)} - \dfrac{\left(\frac{3}{2}\right)^{x}}{\ln\left(\frac{3}{2}\right)} + c`,
    antwoord: '3^x/ln(3) - (3/2)^x/ln(3/2) + c',
    alts: ['3^x/ln3 - 1,5^x/ln(1,5) + c'],
    integrand: '(6^x - 3^x) / 2^x',
    primitieve: '3^x / ln(3) - (3/2)^x / ln(3/2)',
    steps: standaard({
      schil: r`Een breuk met drie verschillende grondtallen: uitdelen levert twee keer de standaardvorm $g^{x}$, met een gebroken grondtal erbij.`,
      herschrijf: r`$\dfrac{6^{x}}{2^{x}} = 3^{x}$ en $\dfrac{3^{x}}{2^{x}} = \left(\tfrac{3}{2}\right)^{x}$, dus $f(x) = 3^{x} - \left(\tfrac{3}{2}\right)^{x}$.`,
      regel: r`$3^{x}$ geeft $\dfrac{3^{x}}{\ln(3)}$ en $\left(\tfrac{3}{2}\right)^{x}$ geeft $\dfrac{\left(\frac{3}{2}\right)^{x}}{\ln\left(\frac{3}{2}\right)}$.`,
      F: r`\dfrac{3^{x}}{\ln(3)} - \dfrac{\left(\frac{3}{2}\right)^{x}}{\ln\left(\frac{3}{2}\right)}`,
    }),
  },

  // ── ln(x) en log(x) ───────────────────────────────────────────────────────
  {
    cluster: 'k0b_logaritmen',
    nummer: 'log-1',
    level: 1,
    latex: r`f(x) = 3\ln(x)`,
    antwoordLatex: r`F(x) = 3x\ln(x) - 3x + c`,
    antwoord: '3x ln(x) - 3x + c',
    alts: ['3(x ln(x) - x) + c'],
    integrand: '3 * ln(x)',
    primitieve: '3 * x * ln(x) - 3 * x',
    domein: [0.2, 3],
    steps: standaard({
      schil: r`Een getal maal $\ln(x)$: dat is de standaardvorm $\ln(x)$, met de factor $3$ ervoor.`,
      herschrijf: r`Herschrijven is niet nodig; de factor $3$ mag je voor de primitieve zetten.`,
      regel: r`$\ln(x)$ geeft $x\ln(x) - x$, dus $3\ln(x)$ geeft $3\big(x\ln(x) - x\big)$.`,
      F: r`3x\ln(x) - 3x`,
    }),
  },
  {
    cluster: 'k0b_logaritmen',
    nummer: 'log-2',
    level: 1,
    latex: r`f(x) = \ln(x) + \dfrac{1}{x}`,
    antwoordLatex: r`F(x) = x\ln(x) - x + \ln(x) + c`,
    antwoord: 'x ln(x) - x + ln(x) + c',
    integrand: 'ln(x) + 1/x',
    primitieve: 'x * ln(x) - x + ln(x)',
    domein: [0.2, 3],
    steps: standaard({
      schil: r`Twee losse termen die er op elkaar lijken, maar elk een eigen regel hebben: $\ln(x)$ en $\dfrac{1}{x}$.`,
      herschrijf: r`De termen zijn $\ln(x)$ en $\dfrac{1}{x}$.`,
      regel: r`$\ln(x)$ geeft $x\ln(x) - x$. En $\dfrac{1}{x}$ geeft $\ln(x)$ — dat is precies de andere kant op.`,
      F: r`x\ln(x) - x + \ln(x)`,
    }),
  },
  {
    cluster: 'k0b_logaritmen',
    nummer: 'log-3',
    level: 2,
    latex: r`f(x) = \ln(5x)`,
    antwoordLatex: r`F(x) = x\ln(5x) - x + c`,
    antwoord: 'x ln(5x) - x + c',
    alts: ['x ln(5) + x ln(x) - x + c'],
    integrand: 'ln(5 * x)',
    primitieve: 'x * ln(5 * x) - x',
    domein: [0.2, 3],
    steps: standaard({
      schil: r`$\ln$ van een product: splits dat eerst met $\ln(ab) = \ln(a) + \ln(b)$, dan staat er een getal plus de standaardvorm $\ln(x)$.`,
      herschrijf: r`$f(x) = \ln(5) + \ln(x)$; $\ln(5)$ is gewoon een getal.`,
      regel: r`$\ln(5)$ geeft $x\ln(5)$. En $\ln(x)$ geeft $x\ln(x) - x$. Samen: $x\ln(5) + x\ln(x) - x$, en met $\ln(ab) = \ln(a) + \ln(b)$ terug is dat $x\ln(5x) - x$.`,
      F: r`x\ln(5x) - x`,
    }),
  },
  {
    cluster: 'k0b_logaritmen',
    nummer: 'log-4',
    level: 2,
    latex: r`f(x) = 4 \cdot \log(x)`,
    antwoordLatex: r`F(x) = \dfrac{4\big(x\ln(x) - x\big)}{\ln(10)} + c`,
    antwoord: '4(x ln(x) - x)/ln(10) + c',
    integrand: '4 * log10(x)',
    primitieve: '4 * (x * ln(x) - x) / ln(10)',
    domein: [0.2, 3],
    steps: standaard({
      schil: r`Hier staat $\log$ met grondtal $10$, niet $\ln$. Gebruik de regel voor $^{g}\!\log(x)$ met $g = 10$.`,
      herschrijf: r`Je kunt ook eerst omschrijven: $\log(x) = \dfrac{\ln(x)}{\ln(10)}$, dus $f(x) = \dfrac{4}{\ln(10)}\ln(x)$ met $\dfrac{4}{\ln(10)}$ als getal ervoor.`,
      regel: r`$^{g}\!\log(x)$ geeft $\dfrac{1}{\ln(g)}\big(x\ln(x) - x\big)$, dus met $g = 10$ en de factor $4$ ervoor: $\dfrac{4}{\ln(10)}\big(x\ln(x) - x\big)$.`,
      F: r`\dfrac{4\big(x\ln(x) - x\big)}{\ln(10)}`,
    }),
  },
  {
    cluster: 'k0b_logaritmen',
    nummer: 'log-5',
    level: 3,
    latex: r`f(x) = \ln\left(\dfrac{x^{2}}{3}\right)`,
    antwoordLatex: r`F(x) = x\ln\left(\dfrac{x^{2}}{3}\right) - 2x + c`,
    antwoord: 'x ln(x^2/3) - 2x + c',
    alts: ['2x ln(x) - x ln(3) - 2x + c'],
    integrand: 'ln(x^2/3)',
    primitieve: 'x * ln(x^2/3) - 2 * x',
    domein: [0.2, 3],
    steps: standaard({
      schil: r`$\ln$ van een breuk met een macht erin: eerst helemaal uitsplitsen met de rekenregels voor $\ln$, dan blijft er $\ln(x)$ over.`,
      herschrijf: r`$f(x) = \ln(x^{2}) - \ln(3) = 2\ln(x) - \ln(3)$.`,
      regel: r`$2\ln(x)$ geeft $2\big(x\ln(x) - x\big)$ en $-\ln(3)$ geeft $-x\ln(3)$. Samen: $2x\ln(x) - x\ln(3) - 2x$, en dat is $x\big(2\ln(x) - \ln(3)\big) - 2x = x\ln\left(\dfrac{x^{2}}{3}\right) - 2x$.`,
      F: r`x\ln\left(\dfrac{x^{2}}{3}\right) - 2x`,
    }),
  },
  {
    cluster: 'k0b_logaritmen',
    nummer: 'log-6',
    level: 3,
    latex: r`f(x) = 2 \cdot \log(4x)`,
    antwoordLatex: r`F(x) = \dfrac{2x\big(\ln(4x) - 1\big)}{\ln(10)} + c`,
    antwoord: '2x(ln(4x) - 1)/ln(10) + c',
    alts: ['2(x ln(4x) - x)/ln(10) + c'],
    integrand: '2 * log10(4 * x)',
    primitieve: '2 * x * (ln(4 * x) - 1) / ln(10)',
    domein: [0.2, 3],
    steps: standaard({
      schil: r`Grondtal $10$ én een getal in de logaritme: schrijf eerst alles om naar $\ln$, dan is het weer de standaardvorm $\ln(x)$.`,
      herschrijf: r`$f(x) = \dfrac{2\ln(4x)}{\ln(10)} = \dfrac{2}{\ln(10)}\big(\ln(4) + \ln(x)\big)$.`,
      regel: r`$\ln(4)$ geeft $x\ln(4)$ en $\ln(x)$ geeft $x\ln(x) - x$. Samen, met $\dfrac{2}{\ln(10)}$ ervoor: $\dfrac{2}{\ln(10)}\big(x\ln(4) + x\ln(x) - x\big) = \dfrac{2}{\ln(10)}\big(x\ln(4x) - x\big)$.`,
      F: r`\dfrac{2x\big(\ln(4x) - 1\big)}{\ln(10)}`,
    }),
  },

  // ── e-macht, sinus en cosinus met kern ax + b ─────────────────────────────
  {
    cluster: 'k0b_lin_e_gonio',
    nummer: 'linexp-1',
    level: 1,
    latex: r`f(x) = e^{3x}`,
    antwoordLatex: r`F(x) = \tfrac{1}{3}e^{3x} + c`,
    antwoord: 'e^(3x)/3 + c',
    alts: ['1/3e^(3x) + c'],
    integrand: 'e^(3 * x)',
    primitieve: 'e^(3 * x) / 3',
    steps: lineair({
      buiten: r`e^{\ldots}`,
      kern: r`3x`,
      a: '3',
      buitenF: r`$e^{\ldots}$ geeft $e^{\ldots}$, dus met de kern erin: $e^{3x}$.`,
      F: r`\tfrac{1}{3}e^{3x}`,
    }),
  },
  {
    cluster: 'k0b_lin_e_gonio',
    nummer: 'linexp-2',
    level: 1,
    latex: r`f(x) = \cos(2x)`,
    antwoordLatex: r`F(x) = \tfrac{1}{2}\sin(2x) + c`,
    antwoord: 'sin(2x)/2 + c',
    alts: ['1/2sin(2x) + c', '0,5sin(2x) + c'],
    integrand: 'cos(2 * x)',
    primitieve: 'sin(2 * x) / 2',
    steps: lineair({
      buiten: r`\cos(\ldots)`,
      kern: r`2x`,
      a: '2',
      buitenF: r`$\cos(\ldots)$ geeft $\sin(\ldots)$, dus met de kern erin: $\sin(2x)$.`,
      F: r`\tfrac{1}{2}\sin(2x)`,
    }),
  },
  {
    cluster: 'k0b_lin_e_gonio',
    nummer: 'linexp-3',
    level: 2,
    latex: r`f(x) = e^{2x + 5}`,
    antwoordLatex: r`F(x) = \tfrac{1}{2}e^{2x + 5} + c`,
    antwoord: 'e^(2x+5)/2 + c',
    alts: ['1/2e^(2x+5) + c'],
    integrand: 'e^(2 * x + 5)',
    primitieve: 'e^(2 * x + 5) / 2',
    steps: lineair({
      buiten: r`e^{\ldots}`,
      kern: r`2x + 5`,
      a: '2',
      buitenF: r`$e^{\ldots}$ geeft $e^{\ldots}$, dus met de kern erin: $e^{2x + 5}$. De $+5$ verandert niets aan de factor; alleen de $a$ telt.`,
      F: r`\tfrac{1}{2}e^{2x + 5}`,
    }),
  },
  {
    cluster: 'k0b_lin_e_gonio',
    nummer: 'linexp-4',
    level: 2,
    latex: r`f(x) = 2\cos\left(\tfrac{1}{2}\pi x\right)`,
    antwoordLatex: r`F(x) = \dfrac{4}{\pi}\sin\left(\tfrac{1}{2}\pi x\right) + c`,
    antwoord: '4sin(1/2 pi x)/pi + c',
    alts: ['4/pi sin(0,5pi x) + c'],
    integrand: '2 * cos(0.5 * pi * x)',
    primitieve: '4 * sin(0.5 * pi * x) / pi',
    steps: lineair({
      buiten: r`\cos(\ldots)`,
      kern: r`\tfrac{1}{2}\pi x`,
      a: r`\tfrac{1}{2}\pi`,
      buitenF: r`$\cos(\ldots)$ geeft $\sin(\ldots)$, dus met de kern erin en de factor $2$ ervoor: $2\sin\left(\tfrac{1}{2}\pi x\right)$.`,
      F: r`\dfrac{2}{\frac{1}{2}\pi}\sin\left(\tfrac{1}{2}\pi x\right) = \dfrac{4}{\pi}\sin\left(\tfrac{1}{2}\pi x\right)`,
    }),
  },
  {
    cluster: 'k0b_lin_e_gonio',
    nummer: 'linexp-5',
    level: 3,
    latex: r`f(x) = 3e^{1 - 2x}`,
    antwoordLatex: r`F(x) = -1\tfrac{1}{2}e^{1 - 2x} + c`,
    antwoord: '-1,5e^(1-2x) + c',
    alts: ['-3e^(1-2x)/2 + c', '-3/2e^(1-2x) + c'],
    integrand: '3 * e^(1 - 2 * x)',
    primitieve: '-1.5 * e^(1 - 2 * x)',
    steps: lineair({
      buiten: r`e^{\ldots}`,
      kern: r`1 - 2x`,
      a: '-2',
      buitenF: r`$e^{\ldots}$ geeft $e^{\ldots}$, dus met de kern erin en de factor $3$ ervoor: $3e^{1 - 2x}$.`,
      F: r`\dfrac{3}{-2}e^{1 - 2x} = -1\tfrac{1}{2}e^{1 - 2x}`,
    }),
  },
  {
    cluster: 'k0b_lin_e_gonio',
    nummer: 'linexp-6',
    level: 3,
    latex: r`f(x) = \sin(2x) - \cos(3x)`,
    antwoordLatex: r`F(x) = -\tfrac{1}{2}\cos(2x) - \tfrac{1}{3}\sin(3x) + c`,
    antwoord: '-cos(2x)/2 - sin(3x)/3 + c',
    alts: ['-1/2cos(2x) - 1/3sin(3x) + c'],
    integrand: 'sin(2 * x) - cos(3 * x)',
    primitieve: '-cos(2 * x) / 2 - sin(3 * x) / 3',
    steps: [
      `${DEEL2} Twee termen, elk met een eigen kern $ax + b$. Pas de regel voor $f(ax + b)$ per term toe; de $a$ is niet voor beide hetzelfde.`,
      r`Eerste term: buitenkant $\sin(\ldots)$, kern $2x$, dus $a = 2$. Tweede term: buitenkant $\cos(\ldots)$, kern $3x$, dus $a = 3$.`,
      r`Primitiveer de buitenkanten: $\sin(\ldots)$ geeft $-\cos(\ldots)$ en $\cos(\ldots)$ geeft $\sin(\ldots)$. Met de kernen erin: $-\cos(2x)$ en $\sin(3x)$.`,
      r`Deel elke term door zijn eigen $a$: $F(x) = -\tfrac{1}{2}\cos(2x) - \tfrac{1}{3}\sin(3x) + c$. Controle: differentieer $F$ en je krijgt $f$ terug.`,
    ],
  },

  // ── Breuken en wortels met kern ax + b ────────────────────────────────────
  {
    cluster: 'k0b_lin_breuk_wortel',
    nummer: 'linbreuk-1',
    level: 1,
    latex: r`f(x) = \dfrac{1}{x + 4}`,
    antwoordLatex: r`F(x) = \ln|x + 4| + c`,
    antwoord: 'ln|x + 4| + c',
    alts: ['ln(x + 4) + c'],
    integrand: '1 / (x + 4)',
    primitieve: 'ln(x + 4)',
    domein: [-3, 3],
    steps: lineair({
      buiten: r`\dfrac{1}{\ldots}`,
      kern: r`x + 4`,
      a: '1',
      buitenF: r`$\dfrac{1}{x}$ geeft $\ln|x|$, dus met de kern erin: $\ln|x + 4|$.`,
      F: r`\ln|x + 4|`,
    }),
  },
  {
    cluster: 'k0b_lin_breuk_wortel',
    nummer: 'linbreuk-2',
    level: 1,
    latex: r`f(x) = (3x - 2)^{4}`,
    antwoordLatex: r`F(x) = \tfrac{1}{15}(3x - 2)^{5} + c`,
    antwoord: '(3x-2)^5/15 + c',
    alts: ['1/15(3x-2)^5 + c'],
    integrand: '(3 * x - 2)^4',
    primitieve: '(3 * x - 2)^5 / 15',
    steps: lineair({
      buiten: r`(\ldots)^{4}`,
      kern: r`3x - 2`,
      a: '3',
      buitenF: r`$(\ldots)^{4}$ geeft $\tfrac{1}{5}(\ldots)^{5}$, dus met de kern erin: $\tfrac{1}{5}(3x - 2)^{5}$.`,
      F: r`\dfrac{1}{3} \cdot \tfrac{1}{5}(3x - 2)^{5} = \tfrac{1}{15}(3x - 2)^{5}`,
    }),
  },
  {
    cluster: 'k0b_lin_breuk_wortel',
    nummer: 'linbreuk-3',
    level: 2,
    latex: r`f(x) = \dfrac{4}{3x + 2}`,
    antwoordLatex: r`F(x) = \tfrac{4}{3}\ln|3x + 2| + c`,
    antwoord: '4ln|3x + 2|/3 + c',
    alts: ['4/3 ln(3x + 2) + c', '1 1/3 ln|3x+2| + c'],
    integrand: '4 / (3 * x + 2)',
    primitieve: '4 * ln(3 * x + 2) / 3',
    domein: [0, 3],
    steps: lineair({
      buiten: r`\dfrac{1}{\ldots}`,
      kern: r`3x + 2`,
      a: '3',
      buitenF: r`$\dfrac{1}{x}$ geeft $\ln|x|$, dus met de kern erin en de factor $4$ ervoor: $4\ln|3x + 2|$.`,
      F: r`\tfrac{4}{3}\ln|3x + 2|`,
    }),
  },
  {
    cluster: 'k0b_lin_breuk_wortel',
    nummer: 'linbreuk-4',
    level: 2,
    latex: r`f(x) = \sqrt{2x + 3}`,
    antwoordLatex: r`F(x) = \tfrac{1}{3}(2x + 3)\sqrt{2x + 3} + c`,
    antwoord: '(2x+3)sqrt(2x+3)/3 + c',
    alts: ['1/3(2x+3)^(3/2) + c'],
    integrand: 'sqrt(2 * x + 3)',
    primitieve: '(2 * x + 3) * sqrt(2 * x + 3) / 3',
    domein: [-1, 3],
    steps: lineair({
      buiten: r`\sqrt{\ldots} = (\ldots)^{\frac{1}{2}}`,
      kern: r`2x + 3`,
      a: '2',
      buitenF: r`$(\ldots)^{\frac{1}{2}}$ geeft $\tfrac{2}{3}(\ldots)^{\frac{3}{2}}$, dus met de kern erin: $\tfrac{2}{3}(2x + 3)\sqrt{2x + 3}$.`,
      F: r`\dfrac{1}{2} \cdot \tfrac{2}{3}(2x + 3)\sqrt{2x + 3} = \tfrac{1}{3}(2x + 3)\sqrt{2x + 3}`,
    }),
  },
  {
    cluster: 'k0b_lin_breuk_wortel',
    nummer: 'linbreuk-5',
    level: 3,
    latex: r`f(x) = \dfrac{6}{5 - 2x}`,
    antwoordLatex: r`F(x) = -3\ln|5 - 2x| + c`,
    antwoord: '-3ln|5 - 2x| + c',
    alts: ['-3ln(5 - 2x) + c'],
    integrand: '6 / (5 - 2 * x)',
    primitieve: '-3 * ln(5 - 2 * x)',
    domein: [-2, 2],
    steps: lineair({
      buiten: r`\dfrac{1}{\ldots}`,
      kern: r`5 - 2x`,
      a: '-2',
      buitenF: r`$\dfrac{1}{x}$ geeft $\ln|x|$, dus met de kern erin en de factor $6$ ervoor: $6\ln|5 - 2x|$.`,
      F: r`\dfrac{6}{-2}\ln|5 - 2x| = -3\ln|5 - 2x|`,
    }),
  },
  {
    cluster: 'k0b_lin_breuk_wortel',
    nummer: 'linbreuk-6',
    level: 3,
    latex: r`f(x) = \dfrac{1}{\sqrt{4x + 1}}`,
    antwoordLatex: r`F(x) = \tfrac{1}{2}\sqrt{4x + 1} + c`,
    antwoord: 'sqrt(4x+1)/2 + c',
    alts: ['1/2sqrt(4x+1) + c', '0,5(4x+1)^(1/2) + c'],
    integrand: '1 / sqrt(4 * x + 1)',
    primitieve: 'sqrt(4 * x + 1) / 2',
    domein: [0, 3],
    steps: lineair({
      buiten: r`\dfrac{1}{\sqrt{\ldots}} = (\ldots)^{-\frac{1}{2}}`,
      kern: r`4x + 1`,
      a: '4',
      buitenF: r`$(\ldots)^{-\frac{1}{2}}$ geeft $\dfrac{1}{\frac{1}{2}}(\ldots)^{\frac{1}{2}} = 2\sqrt{\ldots}$, dus met de kern erin: $2\sqrt{4x + 1}$.`,
      F: r`\dfrac{1}{4} \cdot 2\sqrt{4x + 1} = \tfrac{1}{2}\sqrt{4x + 1}`,
    }),
  },

  // ── g^x en ln met kern ax + b ─────────────────────────────────────────────
  {
    cluster: 'k0b_lin_exp_ln',
    nummer: 'linlog-1',
    level: 1,
    latex: r`f(x) = 2^{3x}`,
    antwoordLatex: r`F(x) = \dfrac{2^{3x}}{3\ln(2)} + c`,
    antwoord: '2^(3x)/(3ln(2)) + c',
    integrand: '2^(3 * x)',
    primitieve: '2^(3 * x) / (3 * ln(2))',
    steps: lineair({
      buiten: r`2^{\ldots}`,
      kern: r`3x`,
      a: '3',
      buitenF: r`$2^{x}$ geeft $\dfrac{2^{x}}{\ln(2)}$, dus met de kern erin: $\dfrac{2^{3x}}{\ln(2)}$.`,
      F: r`\dfrac{2^{3x}}{3\ln(2)}`,
    }),
  },
  {
    cluster: 'k0b_lin_exp_ln',
    nummer: 'linlog-2',
    level: 1,
    latex: r`f(x) = \ln(x + 2)`,
    antwoordLatex: r`F(x) = (x + 2)\ln(x + 2) - (x + 2) + c`,
    antwoord: '(x+2)ln(x+2) - (x+2) + c',
    integrand: 'ln(x + 2)',
    primitieve: '(x + 2) * ln(x + 2) - (x + 2)',
    domein: [-1, 3],
    steps: lineair({
      buiten: r`\ln(\ldots)`,
      kern: r`x + 2`,
      a: '1',
      buitenF: r`$\ln(x)$ geeft $x\ln(x) - x$, dus met de kern erin: $(x + 2)\ln(x + 2) - (x + 2)$.`,
      F: r`(x + 2)\ln(x + 2) - (x + 2)`,
    }),
  },
  {
    cluster: 'k0b_lin_exp_ln',
    nummer: 'linlog-3',
    level: 2,
    latex: r`f(x) = 5^{2x - 1}`,
    antwoordLatex: r`F(x) = \dfrac{5^{2x - 1}}{2\ln(5)} + c`,
    antwoord: '5^(2x-1)/(2ln(5)) + c',
    integrand: '5^(2 * x - 1)',
    primitieve: '5^(2 * x - 1) / (2 * ln(5))',
    steps: lineair({
      buiten: r`5^{\ldots}`,
      kern: r`2x - 1`,
      a: '2',
      buitenF: r`$5^{x}$ geeft $\dfrac{5^{x}}{\ln(5)}$, dus met de kern erin: $\dfrac{5^{2x - 1}}{\ln(5)}$.`,
      F: r`\dfrac{5^{2x - 1}}{2\ln(5)}`,
    }),
  },
  {
    cluster: 'k0b_lin_exp_ln',
    nummer: 'linlog-4',
    level: 2,
    latex: r`f(x) = \ln(2x - 1)`,
    antwoordLatex: r`F(x) = \tfrac{1}{2}\big((2x - 1)\ln(2x - 1) - (2x - 1)\big) + c`,
    antwoord: '((2x-1)ln(2x-1) - (2x-1))/2 + c',
    alts: ['1/2((2x-1)ln(2x-1) - (2x-1)) + c'],
    integrand: 'ln(2 * x - 1)',
    primitieve: '((2 * x - 1) * ln(2 * x - 1) - (2 * x - 1)) / 2',
    domein: [1, 3],
    steps: lineair({
      buiten: r`\ln(\ldots)`,
      kern: r`2x - 1`,
      a: '2',
      buitenF: r`$\ln(x)$ geeft $x\ln(x) - x$, dus met de kern erin: $(2x - 1)\ln(2x - 1) - (2x - 1)$.`,
      F: r`\tfrac{1}{2}\big((2x - 1)\ln(2x - 1) - (2x - 1)\big)`,
    }),
  },
  {
    cluster: 'k0b_lin_exp_ln',
    nummer: 'linlog-5',
    level: 3,
    latex: r`f(x) = \left(\tfrac{1}{3}\right)^{2x + 1}`,
    antwoordLatex: r`F(x) = \dfrac{\left(\frac{1}{3}\right)^{2x + 1}}{2\ln\left(\frac{1}{3}\right)} + c`,
    antwoord: '(1/3)^(2x+1)/(2ln(1/3)) + c',
    alts: ['-(1/3)^(2x+1)/(2ln(3)) + c'],
    integrand: '(1/3)^(2 * x + 1)',
    primitieve: '(1/3)^(2 * x + 1) / (2 * ln(1/3))',
    steps: lineair({
      buiten: r`\left(\tfrac{1}{3}\right)^{\ldots}`,
      kern: r`2x + 1`,
      a: '2',
      buitenF: r`$g^{x}$ geeft $\dfrac{g^{x}}{\ln(g)}$ met $g = \tfrac{1}{3}$, dus met de kern erin: $\dfrac{\left(\frac{1}{3}\right)^{2x + 1}}{\ln\left(\frac{1}{3}\right)}$. Let op: $\ln\left(\tfrac{1}{3}\right)$ is negatief.`,
      F: r`\dfrac{\left(\frac{1}{3}\right)^{2x + 1}}{2\ln\left(\frac{1}{3}\right)}`,
    }),
  },
  {
    cluster: 'k0b_lin_exp_ln',
    nummer: 'linlog-6',
    level: 3,
    latex: r`f(x) = 6\ln(3x + 2)`,
    antwoordLatex: r`F(x) = 2\big((3x + 2)\ln(3x + 2) - (3x + 2)\big) + c`,
    antwoord: '2((3x+2)ln(3x+2) - (3x+2)) + c',
    integrand: '6 * ln(3 * x + 2)',
    primitieve: '2 * ((3 * x + 2) * ln(3 * x + 2) - (3 * x + 2))',
    domein: [0, 3],
    steps: lineair({
      buiten: r`\ln(\ldots)`,
      kern: r`3x + 2`,
      a: '3',
      buitenF: r`$\ln(x)$ geeft $x\ln(x) - x$, dus met de kern erin en de factor $6$ ervoor: $6\big((3x + 2)\ln(3x + 2) - (3x + 2)\big)$.`,
      F: r`\dfrac{6}{3}\big((3x + 2)\ln(3x + 2) - (3x + 2)\big) = 2\big((3x + 2)\ln(3x + 2) - (3x + 2)\big)`,
    }),
  },

  // ── Bereken exact ─────────────────────────────────────────────────────────
  {
    cluster: 'k0b_bepaald_exact',
    nummer: 'bepaald-1',
    level: 1,
    latex: r`\int_{0}^{\frac{1}{4}\pi} \cos(2x)\,dx`,
    antwoordLatex: r`\tfrac{1}{2}`,
    antwoord: '1/2',
    alts: ['0,5', '0.5'],
    integrand: 'cos(2 * x)',
    primitieve: 'sin(2 * x) / 2',
    grenzen: [0, 0.7853981633974483],
    waarde: 0.5,
    steps: bepaald({
      herken: r`Buitenkant $\cos(\ldots)$, kern $2x$, dus $a = 2$: de regel voor $f(ax + b)$.`,
      F: r`\tfrac{1}{2}\sin(2x)`,
      invullen: r`Vul de grenzen in: $\left[\tfrac{1}{2}\sin(2x)\right]_{0}^{\frac{1}{4}\pi} = \tfrac{1}{2}\sin\left(\tfrac{1}{2}\pi\right) - \tfrac{1}{2}\sin(0) = \tfrac{1}{2} \cdot 1 - 0 = \tfrac{1}{2}$.`,
    }),
  },
  {
    cluster: 'k0b_bepaald_exact',
    nummer: 'bepaald-2',
    level: 1,
    latex: r`\int_{0}^{2} \dfrac{1}{x + 1}\,dx`,
    antwoordLatex: r`\ln(3)`,
    antwoord: 'ln(3)',
    integrand: '1 / (x + 1)',
    primitieve: 'ln(x + 1)',
    domein: [0, 2],
    grenzen: [0, 2],
    waarde: 'ln(3)',
    steps: bepaald({
      herken: r`Buitenkant $\dfrac{1}{\ldots}$, kern $x + 1$, dus $a = 1$: delen door $a$ verandert hier niets.`,
      F: r`\ln|x + 1|`,
      invullen: r`Vul de grenzen in: $\big[\ln|x + 1|\big]_{0}^{2} = \ln(3) - \ln(1) = \ln(3)$, want $\ln(1) = 0$. Dat laat je zo staan; niet afronden.`,
    }),
  },
  {
    cluster: 'k0b_bepaald_exact',
    nummer: 'bepaald-3',
    level: 1,
    latex: r`\int_{0}^{2} e^{\frac{1}{2}x}\,dx`,
    antwoordLatex: r`2e - 2`,
    antwoord: '2e - 2',
    alts: ['2(e - 1)'],
    integrand: 'e^(0.5 * x)',
    primitieve: '2 * e^(0.5 * x)',
    grenzen: [0, 2],
    waarde: '2*e - 2',
    steps: bepaald({
      herken: r`Buitenkant $e^{\ldots}$, kern $\tfrac{1}{2}x$, dus $a = \tfrac{1}{2}$. Delen door $\tfrac{1}{2}$ is keer $2$.`,
      F: r`2e^{\frac{1}{2}x}`,
      invullen: r`Vul de grenzen in: $\left[2e^{\frac{1}{2}x}\right]_{0}^{2} = 2e^{1} - 2e^{0} = 2e - 2$.`,
    }),
  },
  {
    cluster: 'k0b_bepaald_exact',
    nummer: 'bepaald-4',
    level: 2,
    latex: r`\int_{\frac{1}{6}\pi}^{\frac{1}{2}\pi} 4\sin(2x)\,dx`,
    antwoordLatex: r`3`,
    antwoord: '3',
    integrand: '4 * sin(2 * x)',
    primitieve: '-2 * cos(2 * x)',
    grenzen: [0.5235987755982988, 1.5707963267948966],
    waarde: 3,
    steps: bepaald({
      herken: r`Buitenkant $\sin(\ldots)$, kern $2x$, dus $a = 2$; de factor $4$ blijft ervoor staan.`,
      F: r`\dfrac{4}{2} \cdot -\cos(2x) = -2\cos(2x)`,
      invullen: r`Vul de grenzen in: $\big[-2\cos(2x)\big]_{\frac{1}{6}\pi}^{\frac{1}{2}\pi} = -2\cos(\pi) + 2\cos\left(\tfrac{1}{3}\pi\right) = -2 \cdot (-1) + 2 \cdot \tfrac{1}{2} = 2 + 1 = 3$.`,
    }),
  },
  {
    cluster: 'k0b_bepaald_exact',
    nummer: 'bepaald-5',
    level: 2,
    latex: r`\int_{1}^{3} \dfrac{4}{2x - 1}\,dx`,
    antwoordLatex: r`2\ln(5)`,
    antwoord: '2ln(5)',
    alts: ['ln(25)'],
    integrand: '4 / (2 * x - 1)',
    primitieve: '2 * ln(2 * x - 1)',
    domein: [1, 3],
    grenzen: [1, 3],
    waarde: '2 * ln(5)',
    steps: bepaald({
      herken: r`Buitenkant $\dfrac{1}{\ldots}$, kern $2x - 1$, dus $a = 2$; de factor $4$ blijft ervoor staan.`,
      F: r`\dfrac{4}{2}\ln|2x - 1| = 2\ln|2x - 1|`,
      invullen: r`Vul de grenzen in: $\big[2\ln|2x - 1|\big]_{1}^{3} = 2\ln(5) - 2\ln(1) = 2\ln(5)$.`,
    }),
  },
  {
    cluster: 'k0b_bepaald_exact',
    nummer: 'bepaald-6',
    level: 2,
    latex: r`\int_{1}^{e} 3\ln(x)\,dx`,
    antwoordLatex: r`3`,
    antwoord: '3',
    integrand: '3 * ln(x)',
    primitieve: '3 * (x * ln(x) - x)',
    domein: [0.2, 3],
    grenzen: [1, 2.718281828459045],
    waarde: 3,
    steps: bepaald({
      herken: r`Geen kern: dit is gewoon de standaardprimitieve van $\ln(x)$, met de factor $3$ ervoor.`,
      F: r`3\big(x\ln(x) - x\big)`,
      invullen: r`Vul de grenzen in: $\big[3(x\ln(x) - x)\big]_{1}^{e} = 3(e \cdot 1 - e) - 3(1 \cdot 0 - 1) = 0 + 3 = 3$, want $\ln(e) = 1$ en $\ln(1) = 0$.`,
    }),
  },
  {
    cluster: 'k0b_bepaald_exact',
    nummer: 'bepaald-7',
    level: 3,
    latex: r`\int_{e}^{e^{3}} 6\ln\left(\sqrt{x}\right)\,dx`,
    antwoordLatex: r`6e^{3}`,
    antwoord: '6e^3',
    integrand: '6 * ln(sqrt(x))',
    primitieve: '3 * (x * ln(x) - x)',
    domein: [1, 21],
    grenzen: [2.718281828459045, 20.085536923187668],
    waarde: '6 * e^3',
    steps: bepaald({
      herken: r`Eerst herschrijven: $\ln\left(\sqrt{x}\right) = \ln\left(x^{\frac{1}{2}}\right) = \tfrac{1}{2}\ln(x)$, dus de integrand is $3\ln(x)$.`,
      F: r`3\big(x\ln(x) - x\big)`,
      invullen: r`Vul de grenzen in: $\big[3(x\ln(x) - x)\big]_{e}^{e^{3}} = 3(3e^{3} - e^{3}) - 3(e - e) = 6e^{3}$, want $\ln\left(e^{3}\right) = 3$ en $\ln(e) = 1$.`,
    }),
  },
  {
    cluster: 'k0b_bepaald_exact',
    nummer: 'bepaald-8',
    level: 3,
    latex: r`\int_{-1}^{1} 6e^{2x + 1}\,dx`,
    antwoordLatex: r`3e^{3} - \dfrac{3}{e}`,
    antwoord: '3e^3 - 3/e',
    alts: ['3e^3 - 3e^-1'],
    integrand: '6 * e^(2 * x + 1)',
    primitieve: '3 * e^(2 * x + 1)',
    grenzen: [-1, 1],
    waarde: '3 * e^3 - 3/e',
    steps: bepaald({
      herken: r`Buitenkant $e^{\ldots}$, kern $2x + 1$, dus $a = 2$; de factor $6$ blijft ervoor staan.`,
      F: r`\dfrac{6}{2}e^{2x + 1} = 3e^{2x + 1}`,
      invullen: r`Vul de grenzen in: $\left[3e^{2x + 1}\right]_{-1}^{1} = 3e^{3} - 3e^{-1} = 3e^{3} - \dfrac{3}{e}$.`,
    }),
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Hoofdstuk, topics en clusters
// ─────────────────────────────────────────────────────────────────────────────

const K0B: AdditiveChapter = {
  chapterSlug: 'k',
  chapterTitle: 'K — Voortgezette integraalrekening',
  bookPart: 4,
  chapterOrder: 12,
  site: 'integralen',
  migrationFile: '0034_k0b_primitiveren.sql',
  headerTitle: 'K.0 Theorie B — Regels voor het primitiveren',
  sourceScript: 'scripts/k0b-content.ts',
  headerNotes: [
    'Voorkennisblok B van hoofdstuk K: de standaardprimitieven en de regel dat',
    'de primitieven van f(ax + b) gelijk zijn aan 1/a · F(ax + b) + c.',
    '',
    'Eigen oefenvragen, geen boekopgaven. Elke primitieve wordt nagerekend door',
    'src/content/primitieven.test.ts (content/hoofdstuk-k/k0b.json).',
  ],
  topics: [
    { slug: 'k0b_standaardprimitieven', title: 'Standaardprimitieven', order: 1, category: 'primitiveren' },
    { slug: 'k0b_lineaire_kern', title: 'De regel voor f(ax + b)', order: 2, category: 'primitiveren' },
    { slug: 'k0b_bepaalde_integralen', title: 'Bepaalde integralen met standaardprimitieven', order: 3, category: 'integralen' },
  ],
  clusters: [
    { topic: 'k0b_standaardprimitieven', slug: 'k0b_machten_gonio', title: 'Machten, breuken en sin/cos', order: 1 },
    { topic: 'k0b_standaardprimitieven', slug: 'k0b_exponenten', title: 'e-machten en g^x', order: 2 },
    { topic: 'k0b_standaardprimitieven', slug: 'k0b_logaritmen', title: 'ln(x) en log(x)', order: 3 },
    { topic: 'k0b_lineaire_kern', slug: 'k0b_lin_e_gonio', title: 'e-macht, sinus en cosinus met kern ax + b', order: 1 },
    { topic: 'k0b_lineaire_kern', slug: 'k0b_lin_breuk_wortel', title: 'Breuken en wortels met kern ax + b', order: 2 },
    { topic: 'k0b_lineaire_kern', slug: 'k0b_lin_exp_ln', title: 'g^x en ln met kern ax + b', order: 3 },
    { topic: 'k0b_bepaalde_integralen', slug: 'k0b_bepaald_exact', title: 'Bereken exact', order: 1 },
  ],
  questions: VRAGEN,
}

// ─────────────────────────────────────────────────────────────────────────────
// Schrijven
// ─────────────────────────────────────────────────────────────────────────────

const wortel = process.cwd()

const contentPad = path.join(wortel, 'content', 'hoofdstuk-k', 'k0b.json')
writeFileSync(
  contentPad,
  generateContentFile(K0B, 'K.0 Theorie B — Regels voor het primitiveren (eigen varianten)'),
)

const migratiePad = path.join(wortel, 'supabase', 'migrations', K0B.migrationFile)
writeFileSync(migratiePad, generateAdditiveMigration(K0B))

console.log(`Geschreven: ${contentPad}`)
console.log(`Geschreven: ${migratiePad}`)
console.log(`Vragen: ${K0B.questions.length}, stappen: ${K0B.questions.length * 4}`)
for (const cl of K0B.clusters) {
  const qs = K0B.questions.filter((q) => q.cluster === cl.slug)
  const perNiveau = [1, 2, 3].map((n) => qs.filter((q) => q.level === n).length).join('/')
  console.log(`  ${cl.topic.padEnd(26)} ${cl.slug.padEnd(24)} ${qs.length}  [${perNiveau}]`)
}
