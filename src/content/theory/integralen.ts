/**
 * Theorie-content voor integraaloefenen.nl.
 *
 * Opzet volgt de driedeling die we bij de bijles aanhouden:
 *   Deel 1 — herken het verhaaltje en vertaal het naar de goede formule
 *   Deel 2 — bereken de goede integraal (welke route hoort bij deze vorm?)
 *   Deel 3 — gebruik de goede oplossingsmethode op de uitkomst
 * Deel 1 en 3 ontbreken bij een kale "bereken exact"-opgave; deel 2 zit er
 * altijd in. Zie `docs/k3-cyclometrische-functies-opgaven.md` voor de bron
 * (alle opgaven en antwoorden van K.3).
 *
 * Behoudt dezelfde shape als `afgeleiden.ts` zodat de loader en consumers
 * niets hoeven aan te passen.
 *
 * Volgorde volgt de leerlijn van de leerling: opgave → welke vorm is dit?
 * (de keuzehulp van stap 0) → één route → stappen → terug naar de opgave.
 * De driedeling staat als groepskop boven de kaarten, niet als hoofdstuk.
 * De stappen per route staan alleen in de kaarten zelf; `stappenplan.regels`
 * is bewust leeg gelaten omdat die tabel ze verdubbelde.
 */

import type {
  ClusterTheory,
  OverviewChapter,
} from './afgeleiden'

export type { ClusterTheory, OverviewChapter }

/** Nog leeg: wordt gevuld zodra de clusters van de integralen-site in de database staan. */
export const CLUSTER_THEORY: Record<string, ClusterTheory> = {}

export const TOPIC_FORMULA: Record<string, string> = {}

export const TOPIC_INTROS: Record<string, string> = {}

export const THEORY_OVERVIEW: OverviewChapter[] = [
  {
    slug: 'k3',
    title: 'K.3 — Cyclometrische functies',
    intro: 'Elke integraal hier wordt $\\arctan$ of $\\arcsin$. De noemer zegt welke van de twee.',
    stappenplan: {
      intro: 'Tik de vorm aan die bij jouw integraal past; je springt dan naar de stappen.',
      herken: [
        {
          groep: 'Noemer $\\ldots^2+1$ → het wordt $\\arctan$',
          schil: 'Precies $x^2+1$.',
          voorbeeld: '\\int \\frac{4}{x^2+1}\\,dx',
          regel: 'Route 1',
          kaart: 'k3_route1',
        },
        {
          groep: 'Noemer $\\ldots^2+1$ → het wordt $\\arctan$',
          schil: 'Geen losse $x$-term.',
          voorbeeld: '\\int \\frac{2}{4x^2+9}\\,dx',
          regel: 'Route 2',
          kaart: 'k3_route2',
        },
        {
          groep: 'Noemer $\\ldots^2+1$ → het wordt $\\arctan$',
          schil: 'Wél een losse $x$-term.',
          voorbeeld: '\\int \\frac{5}{x^2-6x+18}\\,dx',
          regel: 'Route 3',
          kaart: 'k3_route3',
        },
        {
          groep: 'Noemer $\\ldots^2+1$ → het wordt $\\arctan$',
          schil: 'De teller is de afgeleide van het gekwadrateerde.',
          voorbeeld: '\\int \\frac{e^x}{e^{2x}+1}\\,dx',
          regel: 'Route 4',
          kaart: 'k3_route4',
        },
        {
          groep: 'Wortel $\\sqrt{1-\\ldots^2}$ → het wordt $\\arcsin$',
          schil: 'De teller is een getal.',
          voorbeeld: '\\int \\frac{1}{\\sqrt{9-x^2}}\\,dx',
          regel: 'Route 5',
          kaart: 'k3_route5',
        },
        {
          groep: 'Wortel $\\sqrt{1-\\ldots^2}$ → het wordt $\\arcsin$',
          schil: 'De teller is de afgeleide van het gekwadrateerde.',
          voorbeeld: '\\int \\frac{x}{\\sqrt{1-x^4}}\\,dx',
          regel: 'Route 6',
          kaart: 'k3_route6',
        },
        {
          groep: '$\\arctan$ of $\\arcsin$ staat zelf in de opgave',
          schil: 'In de teller, met zijn afgeleide eronder.',
          voorbeeld: '\\int \\frac{\\arctan(x)}{x^2+1}\\,dx',
          regel: 'Route 4b',
          kaart: 'k3_route4b',
        },
        {
          groep: '$\\arctan$ of $\\arcsin$ staat zelf in de opgave',
          schil: 'Kaal, zonder breuk eromheen.',
          voorbeeld: '\\int \\arctan(x)\\,dx',
          regel: 'Route 7',
          kaart: 'k3_route7',
        },
      ],
    },
    cards: [
      // ── Deel 2 · de routes, in de volgorde van de keuzehulp ──────────────
      {
        id: 'k3_route1',
        groep: 'Deel 2 · Bereken de integraal',
        title: 'Route 1 · De noemer is precies $x^2+1$',
        herkenpunt: '\\int \\frac{a}{x^2+1}\\,dx',
        formula: '\\int \\frac{a}{x^2+1}\\,dx = a\\arctan(x)+c',
        examples: [
          {
            problem: '\\int_{-\\frac13\\sqrt3}^{\\sqrt3} \\frac{1}{x^2+1}\\,dx',
            answer: '\\tfrac12\\pi',
            steps: [
              'De noemer is precies $x^2+1$, dus de primitieve is $\\arctan(x)$.',
              'Grenzen invullen: $\\arctan(\\sqrt3)-\\arctan(-\\tfrac13\\sqrt3)$.',
              'Uit de tabel: $\\tfrac13\\pi-\\left(-\\tfrac16\\pi\\right)=\\tfrac12\\pi$.',
            ],
          },
        ],
        notes: [
          'Dit is de enige route zonder voorwerk. Komt bijna nooit kaal voor — meestal moet je er eerst route 2 of 3 op loslaten.',
        ],
      },
      {
        id: 'k3_route2',
        groep: 'Deel 2 · Bereken de integraal',
        title: 'Route 2 · Noemer $px^2+q$, geen losse $x$-term',
        herkenpunt: '\\int \\frac{a}{px^2+q}\\,dx',
        formula:
          '\\begin{gathered} \\int \\frac{a}{(bx)^2+1}\\,dx = \\frac ab\\arctan(bx)+c \\\\ \\frac{a}{px^2+q} = \\frac{a/q}{\\frac pq x^2+1},\\qquad b=\\sqrt{\\tfrac pq} \\end{gathered}',
        examples: [
          {
            problem: '\\int_{0}^{1\\frac12} \\frac{2}{4x^2+9}\\,dx',
            answer: '\\tfrac{1}{12}\\pi',
            steps: [
              'Deel teller en noemer door $9$: $\\dfrac{2}{4x^2+9}=\\dfrac{\\frac29}{\\frac49x^2+1}$.',
              'Lees $b$ af: $\\tfrac49x^2=\\left(\\tfrac23x\\right)^2$, dus $b=\\tfrac23$.',
              'Primitieve: $\\tfrac29\\cdot\\tfrac32\\arctan\\!\\left(\\tfrac23x\\right)=\\tfrac13\\arctan\\!\\left(\\tfrac23x\\right)$.',
              'Grenzen: $\\tfrac13\\arctan(1)-0=\\tfrac13\\cdot\\tfrac14\\pi=\\tfrac1{12}\\pi$.',
            ],
          },
          {
            problem: 'f(x)=\\frac{10}{x^2+4}',
            answer: 'F(x)=5\\arctan\\!\\left(\\tfrac12x\\right)+c',
            steps: [
              'Deel door $4$: $\\dfrac{10}{x^2+4}=\\dfrac{2\\frac12}{\\frac14x^2+1}$, dus $a=2\\tfrac12$.',
              '$\\tfrac14x^2=\\left(\\tfrac12x\\right)^2$, dus $b=\\tfrac12$.',
              '$F(x)=2\\tfrac12\\cdot 2\\arctan\\!\\left(\\tfrac12x\\right)+c=5\\arctan\\!\\left(\\tfrac12x\\right)+c$.',
            ],
          },
          {
            problem: 'f(x)=\\frac{5}{32x^2+2}',
            answer: 'F(x)=\\tfrac58\\arctan(4x)+c',
            steps: [
              'Deel door $2$: $\\dfrac{5}{32x^2+2}=\\dfrac{\\frac52}{16x^2+1}$.',
              '$16x^2=(4x)^2$, dus $b=4$.',
              '$F(x)=\\tfrac52\\cdot\\tfrac14\\arctan(4x)+c=\\tfrac58\\arctan(4x)+c$.',
            ],
          },
        ],
        notes: [
          'Vergeet de $\\tfrac1b$ niet. Controleer achteraf door te differentiëren: de kettingregel moet de $b$ precies wegdelen.',
        ],
      },
      {
        id: 'k3_route3',
        groep: 'Deel 2 · Bereken de integraal',
        title: 'Route 3 · Noemer $x^2+px+q$, wél een losse $x$-term',
        herkenpunt: '\\int \\frac{a}{x^2+px+q}\\,dx',
        formula:
          '\\begin{gathered} x^2+px+q=\\left(x+\\tfrac12p\\right)^2+r,\\quad r=q-\\tfrac14p^2 \\\\ \\int \\frac{a}{\\left(x+s\\right)^2+r}\\,dx=\\frac{a}{\\sqrt r}\\arctan\\!\\left(\\frac{x+s}{\\sqrt r}\\right)+c \\end{gathered}',
        examples: [
          {
            problem: 'h(x)=\\frac{5}{x^2+6x+10}',
            answer: 'H(x)=5\\arctan(x+3)+c',
            steps: [
              'Splits af: $x^2+6x+10=(x+3)^2+1$.',
              'De noemer eindigt al op $+1$, dus $b=1$.',
              '$H(x)=5\\arctan(x+3)+c$.',
            ],
          },
          {
            problem: '\\int_{3}^{6} \\frac{5}{x^2-6x+18}\\,dx',
            answer: '\\tfrac{5}{12}\\pi',
            steps: [
              'Splits af: $x^2-6x+18=(x-3)^2+9$.',
              'Deel door $9$: de primitieve wordt $\\tfrac59\\cdot 3\\arctan\\!\\left(\\tfrac{x-3}{3}\\right)=\\tfrac53\\arctan\\!\\left(\\tfrac{x-3}{3}\\right)$.',
              'Grenzen: $\\tfrac53\\arctan(1)-\\tfrac53\\arctan(0)=\\tfrac53\\cdot\\tfrac14\\pi=\\tfrac{5}{12}\\pi$.',
            ],
          },
          {
            problem: '\\int_{0}^{1} \\frac{1}{4x^2-4x+2}\\,dx',
            answer: '\\tfrac14\\pi',
            steps: [
              'Er staat een $4$ voor $x^2$: schrijf het kwadraat met $2x$ erin, $4x^2-4x+2=(2x-1)^2+1$.',
              'Nu is $b=2$, dus de primitieve is $\\tfrac12\\arctan(2x-1)$.',
              'Grenzen: $\\tfrac12\\arctan(1)-\\tfrac12\\arctan(-1)=\\tfrac12\\left(\\tfrac14\\pi+\\tfrac14\\pi\\right)=\\tfrac14\\pi$.',
            ],
          },
        ],
        notes: [
          'Herken je deze route? De noemer is een kwadratische die je niet kunt ontbinden — de discriminant is negatief. Kon je hem wél ontbinden, dan was het een breuksplitsing geweest en geen $\\arctan$.',
        ],
      },
      {
        id: 'k3_route4',
        groep: 'Deel 2 · Bereken de integraal',
        title: 'Route 4 · De teller is de afgeleide van het gekwadrateerde',
        herkenpunt: '\\int \\frac{g\'}{g^2+1}\\,dx',
        formula: '\\int \\frac{g\'(x)}{\\bigl(g(x)\\bigr)^2+1}\\,dx = \\arctan\\bigl(g(x)\\bigr)+c',
        examples: [
          {
            problem: '\\int_{0}^{\\frac12\\ln(3)} \\frac{e^x}{e^{2x}+1}\\,dx',
            answer: '\\tfrac{1}{12}\\pi',
            steps: [
              '$e^{2x}=\\left(e^x\\right)^2$, dus $g=e^x$.',
              'De teller is precies $g\'=e^x$: de primitieve is $\\arctan(e^x)$.',
              'Grenzen: $\\arctan\\!\\left(e^{\\frac12\\ln 3}\\right)-\\arctan(1)=\\arctan(\\sqrt3)-\\tfrac14\\pi=\\tfrac13\\pi-\\tfrac14\\pi=\\tfrac1{12}\\pi$.',
            ],
          },
          {
            problem: '\\int_{0}^{1} \\frac{2x}{x^4+1}\\,dx',
            answer: '\\tfrac14\\pi',
            steps: [
              '$x^4=\\left(x^2\\right)^2$, dus $g=x^2$ en $g\'=2x$ — dat is precies de teller.',
              'Primitieve: $\\arctan\\!\\left(x^2\\right)$.',
              'Grenzen: $\\arctan(1)-\\arctan(0)=\\tfrac14\\pi$.',
            ],
          },
          {
            problem: '\\int_{0}^{\\frac12\\pi} \\frac{\\sin(x)}{\\cos^2(x)+1}\\,dx',
            answer: '\\tfrac14\\pi',
            steps: [
              '$g=\\cos(x)$, dus $g\'=-\\sin(x)$: de teller is $-g\'$.',
              'Primitieve: $-\\arctan\\bigl(\\cos(x)\\bigr)$.',
              'Grenzen: $-\\arctan(0)+\\arctan(1)=\\tfrac14\\pi$.',
            ],
          },
          {
            problem: '\\int_{-1}^{1} \\frac{3x^2}{x^6+1}\\,dx',
            answer: '\\tfrac12\\pi',
            steps: [
              '$x^6=\\left(x^3\\right)^2$, dus $g=x^3$ en $g\'=3x^2$ — precies de teller.',
              'Primitieve: $\\arctan\\!\\left(x^3\\right)$.',
              'Grenzen: $\\arctan(1)-\\arctan(-1)=\\tfrac14\\pi+\\tfrac14\\pi=\\tfrac12\\pi$.',
            ],
          },
        ],
        notes: [
          'Zoek altijd eerst het kwadraat in de noemer. Wat daarin gekwadrateerd staat, is je $g$; de teller moet daar de afgeleide van zijn.',
          'Staat de teller er niet precies, maar scheelt het een constante? Haal die constante naar voren, bijvoorbeeld $\\displaystyle\\int \\frac{x}{x^4+1}\\,dx=\\tfrac12\\arctan\\!\\left(x^2\\right)+c$.',
        ],
      },
      {
        id: 'k3_route4b',
        groep: 'Deel 2 · Bereken de integraal',
        title: 'Route 4b · In de teller staat $\\arctan$ of $\\arcsin$ zelf',
        herkenpunt: '\\int \\frac{\\arctan^n(x)}{x^2+1}\\,dx',
        formula:
          '\\begin{gathered} \\int \\frac{\\arctan^n(x)}{x^2+1}\\,dx = \\frac{\\arctan^{\\,n+1}(x)}{n+1}+c \\\\ \\int \\frac{\\arcsin^n(x)}{\\sqrt{1-x^2}}\\,dx = \\frac{\\arcsin^{\\,n+1}(x)}{n+1}+c \\end{gathered}',
        examples: [
          {
            problem: '\\int_{0}^{\\sqrt3} \\frac{\\arctan(x)}{x^2+1}\\,dx',
            answer: '\\tfrac{1}{18}\\pi^2',
            steps: [
              'Neem $g=\\arctan(x)$; dan is $g\'=\\dfrac{1}{x^2+1}$ en staat er $\\displaystyle\\int g\\cdot g\'\\,dx$.',
              'Primitieve: $\\tfrac12\\arctan^2(x)$.',
              'Grenzen: $\\tfrac12\\left(\\tfrac13\\pi\\right)^2-0=\\tfrac12\\cdot\\tfrac19\\pi^2=\\tfrac1{18}\\pi^2$.',
            ],
          },
          {
            problem: '\\int_{0}^{1} \\frac{\\arctan^2(x)}{x^2+1}\\,dx',
            answer: '\\tfrac{1}{192}\\pi^3',
            steps: [
              '$g=\\arctan(x)$, dus er staat $\\displaystyle\\int g^2\\cdot g\'\\,dx$.',
              'Primitieve: $\\tfrac13\\arctan^3(x)$.',
              'Grenzen: $\\tfrac13\\left(\\tfrac14\\pi\\right)^3=\\tfrac13\\cdot\\tfrac{1}{64}\\pi^3=\\tfrac{1}{192}\\pi^3$.',
            ],
          },
          {
            problem: 'f(x)=\\frac{\\arcsin(x)}{\\sqrt{1-x^2}}',
            answer: 'F(x)=\\tfrac12\\arcsin^2(x)+c',
            steps: [
              '$g=\\arcsin(x)$ geeft $g\'=\\dfrac{1}{\\sqrt{1-x^2}}$, precies de rest van de breuk.',
              'Dus $F(x)=\\tfrac12\\arcsin^2(x)+c$.',
            ],
          },
        ],
        notes: [
          'Dit is gewoon route 4 of 6, maar met $\\arctan$ of $\\arcsin$ in de teller in plaats van eronder. Herken de vorm $\\displaystyle\\int g^n\\cdot g\'\\,dx$.',
        ],
      },
      {
        id: 'k3_route5',
        groep: 'Deel 2 · Bereken de integraal',
        title: 'Route 5 · Onder de wortel staat $1-\\ldots^2$, teller is een getal',
        herkenpunt: '\\int \\frac{a}{\\sqrt{1-(bx)^2}}\\,dx',
        formula:
          '\\begin{gathered} \\int \\frac{a}{\\sqrt{1-(bx)^2}}\\,dx = \\frac ab\\arcsin(bx)+c \\\\ \\sqrt{c^2-x^2}=c\\sqrt{1-\\left(\\tfrac xc\\right)^2} \\end{gathered}',
        examples: [
          {
            problem: '\\int_{\\frac16}^{\\frac16\\sqrt3} \\frac{1}{\\sqrt{1-9x^2}}\\,dx',
            answer: '\\tfrac{1}{18}\\pi',
            steps: [
              'Onder de wortel staat al $1-\\ldots^2$: $9x^2=(3x)^2$, dus $b=3$.',
              'Primitieve: $\\tfrac13\\arcsin(3x)$.',
              'Grenzen: $\\tfrac13\\left(\\arcsin\\!\\left(\\tfrac12\\sqrt3\\right)-\\arcsin\\!\\left(\\tfrac12\\right)\\right)=\\tfrac13\\left(\\tfrac13\\pi-\\tfrac16\\pi\\right)=\\tfrac1{18}\\pi$.',
            ],
          },
          {
            problem: '\\int_{-1\\frac12\\sqrt2}^{1\\frac12\\sqrt2} \\frac{1}{\\sqrt{9-x^2}}\\,dx',
            answer: '\\tfrac12\\pi',
            steps: [
              'Haal de $3$ buiten de wortel: $\\sqrt{9-x^2}=3\\sqrt{1-\\left(\\tfrac x3\\right)^2}$.',
              'Dus $a=\\tfrac13$ en $b=\\tfrac13$: de primitieve is $\\arcsin\\!\\left(\\tfrac x3\\right)$.',
              'Grenzen: $\\arcsin\\!\\left(\\tfrac12\\sqrt2\\right)-\\arcsin\\!\\left(-\\tfrac12\\sqrt2\\right)=\\tfrac14\\pi+\\tfrac14\\pi=\\tfrac12\\pi$.',
            ],
          },
          {
            problem: 'f(x)=\\frac{1}{\\sqrt{1-4x^2}}',
            answer: 'F(x)=\\tfrac12\\arcsin(2x)+c',
            steps: ['$4x^2=(2x)^2$, dus $b=2$.', '$F(x)=\\tfrac12\\arcsin(2x)+c$.'],
          },
        ],
        notes: [
          'Bij $\\sqrt{c^2-x^2}$ valt de $c$ uit de wortel weg tegen de $\\tfrac1b$: $\\displaystyle\\int \\frac{1}{\\sqrt{c^2-x^2}}\\,dx=\\arcsin\\!\\left(\\tfrac xc\\right)+c$. Handig om te onthouden.',
        ],
      },
      {
        id: 'k3_route6',
        groep: 'Deel 2 · Bereken de integraal',
        title: 'Route 6 · De teller is de afgeleide van wat onder de wortel staat',
        herkenpunt: '\\int \\frac{g\'}{\\sqrt{1-g^2}}\\,dx',
        formula: '\\int \\frac{g\'(x)}{\\sqrt{1-\\bigl(g(x)\\bigr)^2}}\\,dx = \\arcsin\\bigl(g(x)\\bigr)+c',
        examples: [
          {
            problem: '\\int_{0}^{\\frac12\\sqrt2} \\frac{x}{\\sqrt{1-x^4}}\\,dx',
            answer: '\\tfrac{1}{12}\\pi',
            steps: [
              '$x^4=\\left(x^2\\right)^2$, dus $g=x^2$ en $g\'=2x$; de teller is $\\tfrac12 g\'$.',
              'Primitieve: $\\tfrac12\\arcsin\\!\\left(x^2\\right)$.',
              'Grenzen: $\\tfrac12\\arcsin\\!\\left(\\tfrac12\\right)-0=\\tfrac12\\cdot\\tfrac16\\pi=\\tfrac1{12}\\pi$.',
            ],
          },
          {
            problem: '\\int_{0}^{1} \\frac{x}{\\sqrt{4-x^4}}\\,dx',
            answer: '\\tfrac{1}{12}\\pi',
            steps: [
              'Eerst route 5: $\\sqrt{4-x^4}=2\\sqrt{1-\\left(\\tfrac{x^2}{2}\\right)^2}$.',
              'Dan route 6 met $g=\\tfrac12x^2$, dus $g\'=x$ — precies de teller. Primitieve: $\\tfrac12\\arcsin\\!\\left(\\tfrac12x^2\\right)$.',
              'Grenzen: $\\tfrac12\\arcsin\\!\\left(\\tfrac12\\right)-0=\\tfrac1{12}\\pi$.',
            ],
          },
          {
            problem: 'g(x)=\\frac{1}{x\\sqrt{1-\\ln^2(x)}}',
            answer: 'G(x)=\\arcsin\\bigl(\\ln(x)\\bigr)+c',
            steps: [
              'Onder de wortel staat $\\ln^2(x)$, dus $g=\\ln(x)$ en $g\'=\\dfrac1x$.',
              'Die $\\tfrac1x$ staat al als factor vóór de wortel: $G(x)=\\arcsin\\bigl(\\ln(x)\\bigr)+c$.',
            ],
          },
          {
            problem: 'g(x)=\\frac{5x^4}{\\sqrt{1-x^{10}}}',
            answer: 'G(x)=\\arcsin\\!\\left(x^5\\right)+c',
            steps: [
              '$x^{10}=\\left(x^5\\right)^2$, dus $g=x^5$ en $g\'=5x^4$ — precies de teller.',
              '$G(x)=\\arcsin\\!\\left(x^5\\right)+c$.',
            ],
          },
        ],
        notes: [
          'Vaak moet je route 5 en 6 combineren: eerst de constante onder de wortel wegwerken, dan pas substitueren.',
        ],
      },
      {
        id: 'k3_route7',
        groep: 'Deel 2 · Bereken de integraal',
        title: 'Route 7 · $\\arctan$ of $\\arcsin$ staat er kaal',
        herkenpunt: '\\int \\arctan(x)\\,dx',
        formula: '\\int g\\cdot h\'\\,dx = g\\cdot h-\\int g\'\\cdot h\\,dx',
        examples: [
          {
            problem: 'f(x)=\\arctan(x)',
            answer: 'F(x)=x\\arctan(x)-\\tfrac12\\ln\\!\\left(x^2+1\\right)+c',
            steps: [
              'Neem $g=\\arctan(x)$ en $h\'=1$, dus $g\'=\\dfrac{1}{x^2+1}$ en $h=x$.',
              'Invullen: $x\\arctan(x)-\\displaystyle\\int \\frac{x}{x^2+1}\\,dx$.',
              'Die integraal is $\\tfrac12$ keer „afgeleide gedeeld door functie”, dus hij geeft $\\tfrac12\\ln\\!\\left(x^2+1\\right)$.',
            ],
          },
          {
            problem: 'g(x)=\\arcsin(x)',
            answer: 'G(x)=x\\arcsin(x)+\\sqrt{1-x^2}+c',
            steps: [
              'Neem $g=\\arcsin(x)$ en $h\'=1$, dus $g\'=\\dfrac{1}{\\sqrt{1-x^2}}$ en $h=x$.',
              'Invullen: $x\\arcsin(x)-\\displaystyle\\int \\frac{x}{\\sqrt{1-x^2}}\\,dx$.',
              'Die integraal geeft $-\\sqrt{1-x^2}$, en min min wordt plus: $G(x)=x\\arcsin(x)+\\sqrt{1-x^2}+c$.',
            ],
          },
        ],
        notes: [
          'Staat $\\arctan$ of $\\arcsin$ er kaal, zonder breuk? Dan is het altijd partieel integreren met $h\'=1$.',
        ],
      },

      // ── Deel 1 en 3 · het verhaaltje en wat je met de uitkomst doet ──────
      {
        id: 'k3_verhaaltjes',
        groep: 'Deel 1 en 3 · Van verhaaltje naar antwoord',
        title: 'Er staat een verhaaltje in plaats van een kale integraal',
        herkenpunt: 'O(V)=\\int_{a}^{b} f(x)\\,dx',
        formula: 'O(V)=\\int_{a}^{b} f(x)\\,dx',
        answerNote:
          'Bij een vraag naar $p$ geef je een exact antwoord; vaak staat daar $\\tan$ of $\\sin$ in, bijvoorbeeld $p=4+\\tan(1)$.',
        examples: [
          {
            problem: 'f(x)=\\frac{10}{x^2-8x+17},\\quad O(W_p)=10,\\ p>4',
            answer: 'p=4+\\tan(1)',
            steps: [
              'Deel 1 — "het vlakdeel tussen de grafiek, de $x$-as en de lijnen $x=4$ en $x=p$" wordt $O(W_p)=\\displaystyle\\int_{4}^{p} f(x)\\,dx$.',
              'Deel 2 — route 3: $x^2-8x+17=(x-4)^2+1$, dus $F(x)=10\\arctan(x-4)$ en $O(W_p)=10\\arctan(p-4)$.',
              'Deel 3 — los op: $10\\arctan(p-4)=10$ geeft $\\arctan(p-4)=1$, dus $p-4=\\tan(1)$ en $p=4+\\tan(1)$.',
            ],
          },
          {
            problem: 'f(x)=\\frac{4}{x\\ln^2(x)+x},\\quad O(V_p)=\\pi,\\ p>1',
            answer: 'p=e',
            steps: [
              'Deel 1 — $O(V_p)=\\displaystyle\\int_{1}^{p} f(x)\\,dx$.',
              'Deel 2 — haal $x$ buiten haakjes: $\\dfrac{4}{x\\left(\\ln^2(x)+1\\right)}$. Route 4 met $g=\\ln(x)$, $g\'=\\tfrac1x$, dus $F(x)=4\\arctan\\bigl(\\ln(x)\\bigr)$.',
              'Deel 3 — $4\\arctan\\bigl(\\ln(p)\\bigr)=\\pi$ geeft $\\arctan\\bigl(\\ln(p)\\bigr)=\\tfrac14\\pi$, dus $\\ln(p)=1$ en $p=e$.',
            ],
          },
          {
            problem: 'f(x)=\\frac{1}{x^2-4x+5}:\\ \\text{oppervlakte tussen de grafiek en de lijn } y=\\tfrac12',
            answer: '\\tfrac12\\pi-1',
            steps: [
              'Deel 1 — twee grafieken: eerst de snijpunten. $\\dfrac{1}{(x-2)^2+1}=\\tfrac12$ geeft $(x-2)^2=1$, dus $x=1$ en $x=3$.',
              'Deel 1 — de grafiek ligt daar boven de lijn, dus $O(V)=\\displaystyle\\int_{1}^{3}\\left(f(x)-\\tfrac12\\right)dx$.',
              'Deel 2 — route 3: $F(x)=\\arctan(x-2)$, dus $O(V)=\\bigl[\\arctan(x-2)-\\tfrac12x\\bigr]_{1}^{3}$.',
              'Deel 3 — invullen: $\\left(\\tfrac14\\pi-\\tfrac32\\right)-\\left(-\\tfrac14\\pi-\\tfrac12\\right)=\\tfrac12\\pi-1$.',
            ],
          },
          {
            problem: 'f(x)=\\frac{x}{\\sqrt{25-x^4}}:\\ O(V)\\ \\text{tussen de grafiek, de } x\\text{-as en } x=\\tfrac12\\sqrt{10}',
            answer: '\\tfrac{1}{12}\\pi',
            steps: [
              'Deel 1 — $O(V)=\\displaystyle\\int_{0}^{\\frac12\\sqrt{10}} f(x)\\,dx$; de linkergrens is het nulpunt $x=0$.',
              'Deel 2 — route 5 en 6: $\\sqrt{25-x^4}=5\\sqrt{1-\\left(\\tfrac{x^2}{5}\\right)^2}$, met $g=\\tfrac15x^2$ en $g\'=\\tfrac25x$ volgt $F(x)=\\tfrac12\\arcsin\\!\\left(\\tfrac15x^2\\right)$.',
              'Deel 3 — invullen: $x=\\tfrac12\\sqrt{10}$ geeft $x^2=2\\tfrac12$, dus $\\tfrac12\\arcsin\\!\\left(\\tfrac12\\right)=\\tfrac12\\cdot\\tfrac16\\pi=\\tfrac1{12}\\pi$.',
            ],
          },
        ],
        notes: [
          'Deel 1 is bijna altijd hetzelfde zinnetje: "het vlakdeel ingesloten door de grafiek, de $x$-as en de lijnen $x=a$ en $x=p$". Dat is $\\displaystyle\\int_a^p f(x)\\,dx$.',
          'Twee grafieken? Eerst de snijpunten oplossen, dan $\\displaystyle\\int (\\text{boven}-\\text{onder})\\,dx$.',
          'Deel 3 is de omgekeerde weg: uit $\\arctan(\\ldots)=k$ volgt $\\ldots=\\tan(k)$, en uit $\\arcsin(\\ldots)=k$ volgt $\\ldots=\\sin(k)$.',
        ],
      },

      // ── Naslag · opzoeken als je vastloopt ───────────────────────────────
      {
        id: 'k3_standaardintegralen',
        groep: 'Naslag',
        title: 'De twee standaardintegralen waar alles op terugkomt',
        formula:
          '\\begin{gathered} \\int \\frac{1}{x^2+1}\\,dx = \\arctan(x)+c \\\\ \\int \\frac{1}{\\sqrt{1-x^2}}\\,dx = \\arcsin(x)+c \\end{gathered}',
        answerNote:
          'Een onbepaalde integraal eindigt altijd op $+c$; een bepaalde integraal geef je exact, dus als veelvoud van $\\pi$ (of $\\pi^2$, $\\pi^3$).',
        notes: [
          'Andersom: $g(x)=\\arctan(x)$ geeft $g\'(x)=\\dfrac{1}{x^2+1}$ en $g(x)=\\arcsin(x)$ geeft $g\'(x)=\\dfrac{1}{\\sqrt{1-x^2}}$.',
          'Domein en bereik: $\\arctan$ heeft $D=\\mathbb{R}$ en $B=\\left\\langle-\\tfrac12\\pi,\\tfrac12\\pi\\right\\rangle$; $\\arcsin$ heeft $D=[-1,1]$ en $B=\\left[-\\tfrac12\\pi,\\tfrac12\\pi\\right]$.',
          'Daarom heeft $\\arctan(x)=\\tfrac23\\pi$ geen oplossing: $\\tfrac23\\pi$ ligt buiten het bereik.',
        ],
      },
      {
        id: 'k3_tabel_arctan',
        groep: 'Naslag',
        title: 'Exacte waarden van $\\arctan$',
        table: {
          headers: ['$x$', '$\\arctan(x)$'],
          rows: [
            ['$-\\sqrt3$', '$-\\tfrac13\\pi$'],
            ['$-1$', '$-\\tfrac14\\pi$'],
            ['$-\\tfrac13\\sqrt3$', '$-\\tfrac16\\pi$'],
            ['$0$', '$0$'],
            ['$\\tfrac13\\sqrt3$', '$\\tfrac16\\pi$'],
            ['$1$', '$\\tfrac14\\pi$'],
            ['$\\sqrt3$', '$\\tfrac13\\pi$'],
          ],
        },
        notes: [
          '$\\arctan$ is oneven: $\\arctan(-x)=-\\arctan(x)$. Je hoeft dus maar de helft te onthouden.',
          'Deze tabel ken je uit je hoofd — zonder hem kun je geen enkele opgave van K.3 exact afmaken.',
        ],
      },
      {
        id: 'k3_tabel_arcsin',
        groep: 'Naslag',
        title: 'Exacte waarden van $\\arcsin$',
        table: {
          headers: ['$x$', '$\\arcsin(x)$'],
          rows: [
            ['$-1$', '$-\\tfrac12\\pi$'],
            ['$-\\tfrac12\\sqrt3$', '$-\\tfrac13\\pi$'],
            ['$-\\tfrac12\\sqrt2$', '$-\\tfrac14\\pi$'],
            ['$-\\tfrac12$', '$-\\tfrac16\\pi$'],
            ['$0$', '$0$'],
            ['$\\tfrac12$', '$\\tfrac16\\pi$'],
            ['$\\tfrac12\\sqrt2$', '$\\tfrac14\\pi$'],
            ['$\\tfrac12\\sqrt3$', '$\\tfrac13\\pi$'],
            ['$1$', '$\\tfrac12\\pi$'],
          ],
        },
        notes: ['Ook $\\arcsin$ is oneven: $\\arcsin(-x)=-\\arcsin(x)$.'],
      },

      // ── Test jezelf ──────────────────────────────────────────────────────
      {
        id: 'k3_zelftest',
        groep: 'Test jezelf',
        title: 'Welke route pak je bij deze zes?',
        herken: [
          {
            problem: '\\int \\frac{3}{x^2+3}\\,dx',
            regel: 'Route 2',
            waarom: 'Geen $x$-term, dus alleen de noemer op $+1$ brengen: $\\dfrac{1}{\\frac13x^2+1}$ met $b=\\tfrac13\\sqrt3$.',
          },
          {
            problem: '\\int \\frac{3}{x^2+4x+5}\\,dx',
            regel: 'Route 3',
            waarom: 'Er is een losse $x$-term, dus eerst kwadraatafsplitsen: $(x+2)^2+1$.',
          },
          {
            problem: '\\int \\frac{x}{x^4+1}\\,dx',
            regel: 'Route 4',
            waarom: 'De teller is op een factor $2$ na de afgeleide van $x^2$, en $x^4=\\left(x^2\\right)^2$.',
          },
          {
            problem: '\\int \\frac{1}{\\sqrt{1-4x^2}}\\,dx',
            regel: 'Route 5',
            waarom: 'Onder de wortel staat al $1-(2x)^2$; alleen de $\\tfrac1b$ erbij.',
          },
          {
            problem: '\\int \\frac{\\arcsin(x)}{\\sqrt{1-x^2}}\\,dx',
            regel: 'Route 4b',
            waarom: 'De vorm $\\displaystyle\\int g\\cdot g\'\\,dx$ met $g=\\arcsin(x)$, dus $\\tfrac12\\arcsin^2(x)+c$.',
          },
          {
            problem: '\\int \\arcsin(x)\\,dx',
            regel: 'Route 7',
            waarom: 'Kale $\\arcsin$ zonder breuk: partieel integreren met $h\'=1$.',
          },
        ],
        notes: [
          'Twijfel je tussen route 2 en 3? Kijk alleen naar de losse $x$-term in de noemer: wél een $x$-term is kwadraatafsplitsen.',
        ],
      },
    ],
  },
]

import type { Methode } from './methode'

/** Geen methode-pagina voor integralen (nog). */
export const METHODE: Methode | null = null
