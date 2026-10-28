/**
 * Theorie-content voor integraaloefenen.nl.
 *
 * Opzet volgt de driedeling die we bij de bijles aanhouden:
 *   Deel 1 — herken het verhaaltje en vertaal het naar de goede formule
 *   Deel 2 — bereken de goede integraal (welke route hoort bij deze vorm?)
 *   Deel 3 — gebruik de goede oplossingsmethode op de uitkomst
 * Deel 1 en 3 ontbreken bij een kale "bereken exact"-opgave; deel 2 zit er
 * altijd in. De letterlijke boekopgaven van K.3 staan alleen lokaal, buiten
 * git, in `content-bron/k3-cyclometrische-functies-opgaven.md`.
 *
 * De vorm van de content staat in `./types`; `@/lib/theory` deelt hem door
 * aan de pagina's.
 *
 * Volgorde volgt de leerlijn van de leerling: opgave → welke vorm is dit?
 * (de keuzehulp van stap 0) → één route → stappen → terug naar de opgave.
 * De driedeling staat als groepskop boven de kaarten, niet als hoofdstuk.
 * Bij K.3 staan de stappen per route alleen in de kaarten; `stappenplan.regels`
 * is daar leeg gelaten omdat die tabel ze verdubbelde. De substitutiemethode
 * en partieel integreren hebben elk één route, dus daar staat het vaste plan
 * (stap 1–3) wél in die tabel. Oppervlakte en inhoud zijn toepassingen, geen
 * rekenmethode: stap 0 kiest welk vlakdeel of lichaam het is, en stap 2 wijst
 * naar die twee methodes. Inhoud gaat alleen over wentelen om de x-as.
 */

import type { ClusterTheory, OverviewChapter } from './types'

/** Nog leeg: wordt gevuld zodra de clusters van de integralen-site in de database staan. */
export const CLUSTER_THEORY: Record<string, ClusterTheory> = {}

export const TOPIC_FORMULA: Record<string, string> = {}

export const TOPIC_INTROS: Record<string, string> = {}

export const THEORY_OVERVIEW: OverviewChapter[] = [
  {
    slug: 'primitieve',
    code: 'Prim',
    title: 'De primitieve en de standaardintegralen',
    zoektitel: 'Primitieve regels en standaardintegralen',
    zoekomschrijving:
      'Alle primitieve regels en standaardintegralen op een rij: machtsregel, somregel, sinus, cosinus, e-macht en 1/x. Probeer meteen 3 sommen, zonder account.',
    intro:
      'Een primitieve van $f$ is een functie $F$ waarvan de afgeleide weer $f$ is. Je zet $+c$ erbij, want de afgeleide van een constante is $0$. De vormen op deze pagina moet je paraat hebben. Het zijn kale integralen: alleen deel 2 van de driedeling.',
    oefenlinks: [
      { label: 'Oefen de standaardprimitieven', href: '/oefenen?blok=k0b' },
    ],
    stappenplan: {
      stap0Titel: 'Stap 0 · Welke vorm is dit?',
      intro: 'Tik de vorm aan die bij jouw integraal past. Daarna doe je de stappen van die kaart.',
      herken: [
        {
          groep: 'Machten en sommen',
          schil: 'Een macht van $x$, en de exponent is niet $-1$.',
          voorbeeld: '\\int 6x^2\\,dx',
          regel: 'Machtsregel',
          kaart: 'prim_macht',
        },
        {
          groep: 'Machten en sommen',
          schil: 'Losse termen met $+$ of $-$ ertussen.',
          voorbeeld: '\\int (6x+5)\\,dx',
          regel: 'Somregel',
          kaart: 'prim_som',
        },
        {
          groep: 'Standaardvormen',
          schil: 'Een sinus van $x$, eventueel met een getal ervoor.',
          voorbeeld: '\\int 4\\sin(x)\\,dx',
          regel: 'Sinus',
          kaart: 'prim_sin',
        },
        {
          groep: 'Standaardvormen',
          schil: 'Een cosinus van $x$, eventueel met een getal ervoor.',
          voorbeeld: '\\int 3\\cos(x)\\,dx',
          regel: 'Cosinus',
          kaart: 'prim_cos',
        },
        {
          groep: 'Standaardvormen',
          schil: 'Een e-macht met exponent $x$.',
          voorbeeld: '\\int 5e^x\\,dx',
          regel: 'e-macht',
          kaart: 'prim_e',
        },
        {
          groep: 'Standaardvormen',
          schil: 'Een breuk met alleen $x$ in de noemer.',
          voorbeeld: '\\int \\frac{2}{x}\\,dx',
          regel: '$1/x$',
          kaart: 'prim_1x',
        },
      ],
      slot: 'Is de exponent $-1$? Dan is het geen machtsregel, maar $\\ln|x|$. Staat er iets anders dan $x$ in de sinus, de cosinus of de e-macht, zoals $3x$? Dan hoort die integraal nog niet bij deze pagina.',
    },
    cards: [
      {
        id: 'prim_macht',
        groep: 'Deel 2 · Machten en sommen',
        title: 'Machtsregel',
        herkenpunt: '\\int x^n\\,dx',
        formula: '\\int x^n\\,dx = \\frac{x^{n+1}}{n+1}+c',
        answerNote: 'De exponent mag niet $-1$ zijn. Een getal ervoor blijft een getal.',
        examples: [
          {
            problem: '\\int 6x^2\\,dx',
            answer: '2x^3+c',
            stappenplan: true,
            steps: [
              'Alleen deel 2. De buitenste schil is een macht van $x$, met een getal ervoor.',
              'De exponent is $2$, en $2$ is niet $-1$. De primitieve van $x^2$ is $\\dfrac{x^3}{3}$.',
              'Het getal $6$ blijft staan: $6\\cdot\\dfrac{1}{3}x^3=2x^3$.',
              'Het antwoord is $2x^3+c$. Terugdifferentiëren geeft $6x^2$.',
            ],
          },
          {
            problem: '\\int \\sqrt{x}\\,dx',
            answer: '\\tfrac{2}{3}x^{\\frac{3}{2}}+c',
            steps: [
              'Schrijf de wortel als een macht: $\\sqrt{x}=x^{\\frac{1}{2}}$. De exponent $\\tfrac{1}{2}$ is niet $-1$.',
              'De nieuwe exponent is $\\tfrac{1}{2}+1=\\tfrac{3}{2}$. Je deelt door $\\tfrac{3}{2}$, en dat is hetzelfde als keer $\\tfrac{2}{3}$.',
              'Het antwoord is $\\tfrac{2}{3}x^{\\frac{3}{2}}+c$. Terugdifferentiëren: $\\tfrac{2}{3}\\cdot\\tfrac{3}{2}x^{\\frac{1}{2}}=\\sqrt{x}$.',
            ],
          },
        ],
        notes: [
          'Bij exponent $-1$ geldt deze regel niet: $\\displaystyle\\int \\dfrac{1}{x}\\,dx=\\ln|x|+c$.',
        ],
      },
      {
        id: 'prim_som',
        groep: 'Deel 2 · Machten en sommen',
        title: 'Somregel',
        herkenpunt: '\\int (f+g)\\,dx',
        formula: '\\int (f(x)+g(x))\\,dx = F(x)+G(x)+c',
        answerNote: 'Elke term apart. Een minteken blijft bij zijn term.',
        examples: [
          {
            problem: '\\int (6x+5)\\,dx',
            answer: '3x^2+5x+c',
            stappenplan: true,
            steps: [
              'Alleen deel 2. Twee losse termen met een plus ertussen: primitiveer elke term apart.',
              '$6x$ is $6x^1$. De machtsregel geeft $6\\cdot\\dfrac{1}{2}x^2=3x^2$.',
              '$5$ is $5x^0$. De machtsregel geeft $5\\cdot\\dfrac{x}{1}=5x$.',
              'Samen: $3x^2+5x+c$. Terugdifferentiëren geeft $6x+5$.',
            ],
          },
        ],
        notes: [
          'Een constante factor mag naar voren: $\\displaystyle\\int 4f(x)\\,dx=4F(x)+c$.',
        ],
      },
      {
        id: 'prim_sin',
        groep: 'Deel 2 · Standaardintegralen',
        title: 'Sinus',
        herkenpunt: '\\int \\sin(x)\\,dx',
        formula: '\\int \\sin(x)\\,dx = -\\cos(x)+c',
        answerNote: 'Het minteken hoort bij de cosinus.',
        examples: [
          {
            problem: '\\int 4\\sin(x)\\,dx',
            answer: '-4\\cos(x)+c',
            stappenplan: true,
            steps: [
              'Alleen deel 2. De buitenste schil is $\\sin(x)$, met een getal ervoor.',
              'Een primitieve van $\\sin(x)$ is $-\\cos(x)$. Het getal $4$ blijft staan.',
              'Het antwoord is $-4\\cos(x)+c$. Terugdifferentiëren: $-4\\cdot(-\\sin(x))=4\\sin(x)$.',
            ],
          },
        ],
        notes: [
          'De afgeleide van $\\cos(x)$ is $-\\sin(x)$. Daarom staat er een min voor de cosinus.',
        ],
      },
      {
        id: 'prim_cos',
        groep: 'Deel 2 · Standaardintegralen',
        title: 'Cosinus',
        herkenpunt: '\\int \\cos(x)\\,dx',
        formula: '\\int \\cos(x)\\,dx = \\sin(x)+c',
        answerNote: 'Hier komt geen minteken bij.',
        examples: [
          {
            problem: '\\int 3\\cos(x)\\,dx',
            answer: '3\\sin(x)+c',
            stappenplan: true,
            steps: [
              'Alleen deel 2. De buitenste schil is $\\cos(x)$, met een getal ervoor.',
              'Een primitieve van $\\cos(x)$ is $\\sin(x)$. Het getal $3$ blijft staan.',
              'Het antwoord is $3\\sin(x)+c$. Terugdifferentiëren geeft $3\\cos(x)$.',
            ],
          },
        ],
      },
      {
        id: 'prim_e',
        groep: 'Deel 2 · Standaardintegralen',
        title: 'e-macht',
        herkenpunt: '\\int e^x\\,dx',
        formula: '\\int e^x\\,dx = e^x+c',
        answerNote: 'De e-macht blijft een e-macht. De exponent is hier precies $x$.',
        examples: [
          {
            problem: '\\int 5e^x\\,dx',
            answer: '5e^x+c',
            stappenplan: true,
            steps: [
              'Alleen deel 2. De buitenste schil is $e^x$, met een getal ervoor.',
              'Een primitieve van $e^x$ is $e^x$ zelf. Het getal $5$ blijft staan.',
              'Het antwoord is $5e^x+c$. Terugdifferentiëren geeft $5e^x$.',
            ],
          },
        ],
        notes: [
          'De afgeleide van $e^x$ is $e^x$. Daarom verandert deze integraal de vorm niet.',
        ],
      },
      {
        id: 'prim_1x',
        groep: 'Deel 2 · Standaardintegralen',
        title: 'Eén gedeeld door $x$',
        herkenpunt: '\\int \\frac{1}{x}\\,dx',
        formula: '\\int \\frac{1}{x}\\,dx = \\ln|x|+c',
        answerNote: 'De strepen van de absolute waarde horen erbij, want een logaritme wil een positief getal.',
        examples: [
          {
            problem: '\\int \\frac{2}{x}\\,dx',
            answer: '2\\ln|x|+c',
            stappenplan: true,
            steps: [
              'Alleen deel 2. De noemer is alleen $x$. Dat is de macht $x^{-1}$, en daarvoor geldt de machtsregel niet.',
              'Een primitieve van $\\dfrac{1}{x}$ is $\\ln|x|$. Het getal $2$ blijft staan.',
              'Het antwoord is $2\\ln|x|+c$. Terugdifferentiëren geeft $\\dfrac{2}{x}$.',
            ],
          },
        ],
        notes: [
          'Op een interval waar $x$ positief is, mag je $\\ln(x)$ schrijven. De strepen dekken ook de negatieve $x$.',
        ],
      },
    ],
  },
  {
    slug: 'substitutiemethode',
    code: 'K.1',
    title: 'K.1 — De substitutiemethode',
    zoektitel: 'Substitutiemethode bij integralen',
    zoekomschrijving:
      'Substitutiemethode bij integralen: een binnenfunctie en zijn afgeleide staan naast elkaar. Probeer meteen 3 sommen, zonder account.',
    intro:
      'Je ziet een binnenfunctie $g$ en zijn afgeleide $g\'$ naast elkaar. Dan primitiveer je alleen de buitenkant $f$. De basis oefen je in K.1 A, de toepassingen in K.1 B.',
    oefenlinks: [
      { label: 'Oefen K.1 A', href: '/oefenen?blok=k1a' },
      { label: 'Oefen K.1 B', href: '/oefenen?blok=k1b' },
    ],
    stappenplan: {
      stap0Titel: 'Stap 0 · Welke vorm is dit?',
      intro: 'Tik de vorm aan die bij jouw integraal past. Daarna doe je stap 1, 2 en 3.',
      herken: [
        {
          groep: 'De afgeleide staat al naast de binnenfunctie',
          schil: 'Een macht, met een factor met $x$ ervoor.',
          voorbeeld: '\\int 10x(2x^2-1)^4\\,dx',
          regel: 'Macht',
          kaart: 'sub_macht',
        },
        {
          groep: 'De afgeleide staat al naast de binnenfunctie',
          schil: 'De teller is de afgeleide van de noemer.',
          voorbeeld: '\\int \\frac{3x^2+2}{x^3+2x}\\,dx',
          regel: 'Breuk',
          kaart: 'sub_breuk',
        },
        {
          groep: 'Eerst een verhaaltje, dan dezelfde truc',
          schil: 'Oppervlakte tussen de grafiek, de $x$-as en twee lijnen.',
          voorbeeld: '\\int_{0}^{1} 6x\\,e^{x^2+1}\\,dx',
          regel: 'Verhaaltje',
          kaart: 'sub_verhaal',
        },
      ],
      regels: [
        {
          regel: 'Substitutie',
          formule: '\\int f(g(x))\\cdot g\'(x)\\,dx = F(g(x))+c',
          stap1: 'Kies de kern $g$ en bereken $g\'$.',
          stap2: 'Schrijf de factor ervoor als een getal maal $g\'$. Dan is $g\'\\,dx$ hetzelfde als $d(g)$.',
          stap3: 'Primitiveer alleen de buitenkant $f$ naar $g$. Schrijf $g$ terug, zet $+c$ en differentieer ter controle.',
        },
      ],
      slot: 'Past de factor niet bij $g\'$? Dan hoort deze integraal niet bij de substitutiemethode. Een getal mag je naar voren halen; een factor waar nog $x$ in zit, niet.',
    },
    cards: [
      {
        id: 'sub_macht',
        groep: 'Deel 2 · Bereken de integraal',
        title: 'Een macht van de kern',
        herkenpunt: '\\int f(g)\\cdot g\'\\,dx',
        formula: '\\int f(g(x))\\cdot g\'(x)\\,dx = F(g(x))+c',
        answerNote: 'Een primitieve eindigt op $+c$.',
        examples: [
          {
            problem: '\\int 10x(2x^2-1)^4\\,dx',
            answer: '\\tfrac12(2x^2-1)^5+c',
            stappenplan: true,
            steps: [
              'Alleen deel 2: de opgave vraagt een primitieve. De buitenste schil is een macht, en ervoor staat een factor met $x$.',
              'De kern is $g(x)=2x^2-1$. Dan is $g\'(x)=4x$. De buitenkant is $f(g)=g^4$.',
              '$10x$ is $\\tfrac52$ keer $4x$, dus $\\tfrac52$ keer $g\'(x)$. De integraal wordt $\\tfrac52\\int g^4\\,dg$.',
              '$\\tfrac52\\cdot\\tfrac15 g^5+c=\\tfrac12(2x^2-1)^5+c$. Terugdifferentiëren geeft $\\tfrac12\\cdot 5(2x^2-1)^4\\cdot 4x=10x(2x^2-1)^4$.',
            ],
          },
        ],
        notes: [
          'De kern $g$ is wat ín de macht staat, niet de macht zelf.',
        ],
      },
      {
        id: 'sub_breuk',
        groep: 'Deel 2 · Bereken de integraal',
        title: 'De afgeleide gedeeld door de kern',
        herkenpunt: '\\int \\frac{g\'}{g}\\,dx',
        formula: '\\int \\frac{g\'(x)}{g(x)}\\,dx = \\ln|g(x)|+c',
        answerNote: 'De strepen van de absolute waarde horen erbij, want een logaritme wil een positief getal.',
        examples: [
          {
            problem: '\\int \\frac{3x^2+2}{x^3+2x}\\,dx',
            answer: '\\ln|x^3+2x|+c',
            stappenplan: true,
            steps: [
              'Alleen deel 2. De buitenste schil is een breuk: in de teller staat precies de afgeleide van de noemer.',
              'De kern is $g(x)=x^3+2x$. Dan is $g\'(x)=3x^2+2$. De buitenkant is $f(g)=\\dfrac{1}{g}$.',
              'De teller is precies $g\'(x)$, dus de integraal is $\\displaystyle\\int \\dfrac{1}{g}\\,dg$.',
              'Dat is $\\ln|g|+c=\\ln|x^3+2x|+c$. Terugdifferentiëren geeft $\\dfrac{3x^2+2}{x^3+2x}$.',
            ],
          },
        ],
        notes: [
          'Staat er een extra getal in de teller, bijvoorbeeld $6x^2$ terwijl $g\'=3x^2$? Haal dat getal naar voren en ga daarna hetzelfde te werk.',
        ],
      },
      {
        id: 'sub_verhaal',
        groep: 'Deel 1 en 3 · Van verhaaltje naar antwoord',
        title: 'Er staat een verhaaltje in plaats van een kale integraal',
        breed: true,
        herkenpunt: 'O(V)=\\int_{a}^{b} f(x)\\,dx',
        formula: 'O(V)=\\int_{a}^{b} f(x)\\,dx',
        answerNote: 'Bij een oppervlakte geef je een exact getal, zonder $+c$.',
        examples: [
          {
            problem: '\\int_{0}^{1} 6x\\,e^{x^2+1}\\,dx',
            answer: '3e(e-1)',
            steps: [
              'Deel 1 — het vlakdeel tussen de grafiek, de $x$-as en de lijnen $x=0$ en $x=1$ is $O(V)=\\displaystyle\\int_{0}^{1} 6x\\,e^{x^2+1}\\,dx$. Op dat stuk is $f(x)$ nul of positief.',
              'Deel 2, stap 1 — de kern is $g(x)=x^2+1$, want die staat in de exponent. Dan is $g\'(x)=2x$.',
              'Deel 2, stap 2 — $6x=3\\cdot 2x$, dus $3$ keer $g\'(x)$. De integraal wordt $3\\displaystyle\\int e^{g}\\,dg$.',
              'Deel 2, stap 3 — een primitieve is $F(x)=3e^{x^2+1}$. Terugdifferentiëren: $3e^{x^2+1}\\cdot 2x=6x\\,e^{x^2+1}$.',
              'Deel 3 — $F(1)-F(0)=3e^{2}-3e=3e(e-1)$.',
            ],
          },
        ],
        notes: [
          'Deel 1 is het zinnetje uit de opgave omzetten naar een integraal. Deel 2 is de substitutie. Deel 3 is de grenzen invullen en het antwoord exact laten staan.',
          'Bij een kale "primitiveer" of "bereken exact" sla je deel 1 over. Deel 3 is dan alleen: $+c$ zetten, of de grenzen invullen.',
        ],
      },
    ],
  },
  {
    slug: 'partieel-integreren',
    code: 'K.2',
    title: 'K.2 — Partieel integreren',
    zoektitel: 'Partieel integreren uitgelegd',
    zoekomschrijving:
      'Partieel integreren uitgelegd: één factor differentieer je, de andere primitiveer je. Probeer meteen 3 sommen, zonder account.',
    intro:
      'Je ziet een product van twee factoren. Eén factor differentieer je, de andere primitiveer je. Eén ronde oefen je in K.2 A, twee rondes in K.2 B.',
    oefenlinks: [
      { label: 'Oefen K.2 A', href: '/oefenen?blok=k2a' },
      { label: 'Oefen K.2 B', href: '/oefenen?blok=k2b' },
    ],
    stappenplan: {
      stap0Titel: 'Stap 0 · Welke vorm is dit?',
      intro: 'Tik de vorm aan die bij jouw integraal past. Daarna doe je stap 1, 2 en 3.',
      herken: [
        {
          groep: 'Eén ronde is genoeg',
          schil: 'Een veelterm maal een sinus, een cosinus of een e-macht.',
          voorbeeld: '\\int x\\sin(2x)\\,dx',
          regel: 'Eén ronde',
          kaart: 'par_een',
        },
        {
          groep: 'Eén ronde is genoeg',
          schil: 'Een logaritme, of een veelterm maal een logaritme.',
          voorbeeld: '\\int x\\ln(x)\\,dx',
          regel: 'Logaritme',
          kaart: 'par_ln',
        },
        {
          groep: 'Je moet nog een keer',
          schil: 'Een kwadraat maal een e-macht of een gonio.',
          voorbeeld: '\\int x^2 e^{3x}\\,dx',
          regel: 'Twee rondes',
          kaart: 'par_twee',
        },
        {
          groep: 'Je moet nog een keer',
          schil: 'Een e-macht maal een sinus of een cosinus. De integraal komt terug.',
          voorbeeld: '\\int e^{x}\\sin(x)\\,dx',
          regel: 'Twee rondes',
          kaart: 'par_twee',
        },
      ],
      regels: [
        {
          regel: 'Partieel',
          formule: '\\int g(x)\\cdot h\'(x)\\,dx = g(x)\\cdot h(x)-\\int h(x)\\cdot g\'(x)\\,dx',
          stap1: 'Noem de factor die je differentieert $g$ en de factor die je primitiveert $h\'$. Bepaal $g\'$ en $h$.',
          stap2: 'Vul de regel in. De integraal die overblijft moet makkelijker zijn dan waar je mee begon.',
          stap3: 'Reken die integraal uit. Is het nog een product, doe dan nog een ronde met dezelfde keuze. Zet $+c$ en differentieer ter controle.',
        },
      ],
      slot: 'Wordt de nieuwe integraal juist moeilijker? Dan staan $g$ en $h\'$ verkeerd om. Begin opnieuw met de andere keuze. Een getal mag je naar voren halen.',
    },
    cards: [
      {
        id: 'par_een',
        groep: 'Deel 2 · Bereken de integraal',
        title: 'Een veelterm maal een gonio of een e-macht',
        herkenpunt: '\\int x\\sin(2x)\\,dx',
        formula: '\\int g(x)\\cdot h\'(x)\\,dx = g(x)\\cdot h(x)-\\int h(x)\\cdot g\'(x)\\,dx',
        answerNote: 'Een primitieve eindigt op $+c$.',
        examples: [
          {
            problem: '\\int x\\sin(2x)\\,dx',
            answer: '-\\tfrac12 x\\cos(2x)+\\tfrac14\\sin(2x)+c',
            stappenplan: true,
            steps: [
              'Alleen deel 2: de opgave vraagt een primitieve. De buitenste schil is een veelterm maal een sinus.',
              'De veelterm wordt eenvoudiger als je hem differentieert, de sinus niet. Dus $g(x)=x$ en $h\'(x)=\\sin(2x)$. Dan is $g\'(x)=1$ en $h(x)=-\\tfrac12\\cos(2x)$.',
              'De regel geeft $-\\tfrac12 x\\cos(2x)-\\displaystyle\\int -\\tfrac12\\cos(2x)\\,dx$. Twee mintekens worden een plus: $-\\tfrac12 x\\cos(2x)+\\tfrac12\\displaystyle\\int\\cos(2x)\\,dx$.',
              '$\\displaystyle\\int\\cos(2x)\\,dx=\\tfrac12\\sin(2x)$, dus $\\tfrac12\\cdot\\tfrac12\\sin(2x)=\\tfrac14\\sin(2x)$. Het antwoord is $-\\tfrac12 x\\cos(2x)+\\tfrac14\\sin(2x)+c$. Terugdifferentiëren: $-\\tfrac12\\cos(2x)+x\\sin(2x)+\\tfrac12\\cos(2x)=x\\sin(2x)$.',
            ],
          },
        ],
        notes: [
          'Een veelterm differentieer je. Een sinus, een cosinus of een e-macht primitiveer je.',
        ],
      },
      {
        id: 'par_ln',
        groep: 'Deel 2 · Bereken de integraal',
        title: 'Een logaritme',
        herkenpunt: '\\int x\\ln(x)\\,dx',
        formula: '\\int g(x)\\cdot h\'(x)\\,dx = g(x)\\cdot h(x)-\\int h(x)\\cdot g\'(x)\\,dx',
        answerNote: 'Een primitieve eindigt op $+c$. Het domein is $x>0$.',
        examples: [
          {
            problem: '\\int x\\ln(x)\\,dx',
            answer: '\\tfrac12 x^2\\ln(x)-\\tfrac14 x^2+c',
            stappenplan: true,
            steps: [
              'Alleen deel 2. De buitenste schil is een veelterm maal een logaritme. Een $\\ln$ kun je niet zomaar primitiveren, wel differentiëren.',
              'Dus $g(x)=\\ln(x)$ en $h\'(x)=x$. Dan is $g\'(x)=\\dfrac{1}{x}$ en $h(x)=\\tfrac12 x^2$.',
              'De regel geeft $\\tfrac12 x^2\\ln(x)-\\displaystyle\\int \\tfrac12 x^2\\cdot\\dfrac{1}{x}\\,dx=\\tfrac12 x^2\\ln(x)-\\tfrac12\\displaystyle\\int x\\,dx$.',
              'Dat is $\\tfrac12 x^2\\ln(x)-\\tfrac14 x^2+c$. Terugdifferentiëren: $x\\ln(x)+\\tfrac12 x-\\tfrac12 x=x\\ln(x)$.',
            ],
          },
        ],
        notes: [
          'Staat er alleen een $\\ln$, zonder factor ervoor? Schrijf hem als $1\\cdot\\ln(x)$ en primitiveer de $1$.',
        ],
      },
      {
        id: 'par_twee',
        groep: 'Deel 2 · Bereken de integraal',
        title: 'Twee rondes',
        breed: true,
        herkenpunt: '\\int x^2 e^{3x}\\,dx',
        formula: '\\int g(x)\\cdot h\'(x)\\,dx = g(x)\\cdot h(x)-\\int h(x)\\cdot g\'(x)\\,dx',
        answerNote: 'Een primitieve eindigt op $+c$.',
        examples: [
          {
            problem: '\\int x^2 e^{3x}\\,dx',
            answer: '\\tfrac13 x^2 e^{3x}-\\tfrac29 x e^{3x}+\\tfrac{2}{27} e^{3x}+c',
            stappenplan: true,
            steps: [
              'Alleen deel 2. De buitenste schil is een kwadraat maal een e-macht. Eén ronde haalt de graad maar één omlaag, dus je doet het twee keer.',
              'Eerste ronde: $g(x)=x^2$ en $h\'(x)=e^{3x}$. Dan is $g\'(x)=2x$ en $h(x)=\\tfrac13 e^{3x}$.',
              'Dat geeft $\\tfrac13 x^2 e^{3x}-\\tfrac23\\displaystyle\\int x e^{3x}\\,dx$. Zelfde keuze nog een keer: nu is $g(x)=x$, dus $\\displaystyle\\int x e^{3x}\\,dx=\\tfrac13 x e^{3x}-\\tfrac19 e^{3x}$.',
              'Invullen: $\\tfrac13 x^2 e^{3x}-\\tfrac23\\left(\\tfrac13 x e^{3x}-\\tfrac19 e^{3x}\\right)+c=\\tfrac13 x^2 e^{3x}-\\tfrac29 x e^{3x}+\\tfrac{2}{27} e^{3x}+c$. Terugdifferentiëren van het eerste stuk geeft $x^2 e^{3x}+\\tfrac23 x e^{3x}$, van het tweede $-\\tfrac23 x e^{3x}-\\tfrac29 e^{3x}$, van het derde $\\tfrac29 e^{3x}$. Samen blijft $x^2 e^{3x}$.',
            ],
          },
        ],
        notes: [
          'Houd in de tweede ronde dezelfde soort factor aan: steeds de e-macht of de gonio primitiveren, steeds de veelterm differentiëren.',
          'Bij een e-macht maal een sinus of een cosinus wordt geen van beide factoren eenvoudiger. Na twee rondes met dezelfde keuze komt de oorspronkelijke integraal terug. Noem hem $I$ en los de vergelijking op.',
        ],
      },
    ],
  },
  {
    slug: 'oppervlakte',
    code: 'Opp',
    title: 'Oppervlakte',
    zoektitel: 'Oppervlakte berekenen met een integraal',
    zoekomschrijving:
      'Oppervlakte tussen een grafiek en de x-as, of tussen twee grafieken, omzetten naar een integraal en die uitrekenen.',
    intro:
      'Eerst maak je van het verhaaltje een integraal. Daarna reken je die uit, met de substitutiemethode of met partieel integreren.',
    oefenlinks: [
      { label: 'Oefen met substitutie', href: '/oefenen?blok=k1b&cluster=k1b_opp_p' },
      { label: 'Oefen met partieel integreren', href: '/oefenen?blok=k2a&cluster=k2a_opp' },
    ],
    stappenplan: {
      stap0Titel: 'Stap 0 · Welk vlakdeel is dit?',
      intro: 'Tik het vlakdeel aan dat bij jouw opgave past. Daarna doe je stap 1, 2 en 3.',
      herken: [
        {
          groep: 'De grafiek en de $x$-as',
          schil: 'De grafiek ligt boven de $x$-as, tussen twee grenzen.',
          voorbeeld: '\\int_{0}^{1} 4x(x^2+1)^2\\,dx',
          regel: 'Boven',
          kaart: 'opp_boven',
        },
        {
          groep: 'De grafiek en de $x$-as',
          schil: 'De grafiek ligt onder de $x$-as. De integraal is dan negatief.',
          voorbeeld: '-\\int_{0}^{1}(x-1)e^{x}\\,dx',
          regel: 'Onder',
          kaart: 'opp_onder',
        },
        {
          groep: 'Twee grafieken',
          schil: 'Het vlakdeel zit tussen twee grafieken. Eerst de snijpunten.',
          voorbeeld: '\\int_{a}^{b}(h(x)-f(x))\\,dx',
          regel: 'Verschil',
          kaart: 'opp_twee',
        },
        {
          groep: 'De oppervlakte is gegeven',
          schil: 'Je moet de grens $p$ uitrekenen.',
          voorbeeld: '\\int_{0}^{p}\\frac{2x}{x^2+1}\\,dx=\\ln(5)',
          regel: 'Vergelijking',
          kaart: 'opp_p',
        },
      ],
      regels: [
        {
          regel: 'Oppervlakte',
          formule: 'O(V)=\\int_{a}^{b} f(x)\\,dx',
          stap1:
            'Schrijf de integraal. Ligt de grafiek boven de $x$-as, dan is dat $\\int_a^b f(x)\\,dx$. Ligt hij eronder, dan zet je er een min voor. Bij twee grafieken zoek je eerst de snijpunten en neem je boven min onder.',
          stap2:
            'Primitiveer. Staat de afgeleide van een kern ernaast, dan is het de substitutiemethode. Is het een product van twee factoren, dan is het partieel integreren.',
          stap3:
            'Vul de grenzen in. Is de uitkomst negatief, dan is de oppervlakte het tegengestelde. Vraagt de opgave om $p$, los de vergelijking exact op. Zet geen $+c$.',
        },
      ],
      slot: 'Een oppervlakte is een positief getal. De integraal zelf mag negatief zijn; dan neem je het tegengestelde. Rond niet af.',
    },
    cards: [
      {
        id: 'opp_boven',
        groep: 'Deel 1 · Van verhaaltje naar integraal',
        title: 'De grafiek ligt boven de $x$-as',
        breed: true,
        herkenpunt: 'O(V)=\\int_{a}^{b} f(x)\\,dx',
        formula: 'O(V)=\\int_{a}^{b} f(x)\\,dx',
        answerNote: 'Een oppervlakte is een positief exact getal, zonder $+c$.',
        examples: [
          {
            problem:
              'f(x)=4x(x^2+1)^2:\\ \\text{oppervlakte tussen de grafiek, de }x\\text{-as en }x=1',
            answer: '\\tfrac{14}{3}',
            steps: [
              'Deel 1 — de grafiek snijdt de $x$-as bij $x=0$ en ligt tussen $0$ en $1$ erboven, want $4x$ en $(x^2+1)^2$ zijn daar allebei nul of positief. De oppervlakte is $O(V)=\\displaystyle\\int_{0}^{1} 4x(x^2+1)^2\\,dx$.',
              'Deel 2 — de kern is $g(x)=x^2+1$, dus $g\'(x)=2x$. Er staat $4x=2\\cdot g\'(x)$. Dat is de substitutiemethode: $\\displaystyle\\int 2g^2\\,dg=\\tfrac{2}{3}g^3$.',
              'Een primitieve is $F(x)=\\tfrac{2}{3}(x^2+1)^3$. Terugdifferentiëren: $\\tfrac{2}{3}\\cdot 3(x^2+1)^2\\cdot 2x=4x(x^2+1)^2$.',
              'Deel 3 — $F(1)-F(0)=\\tfrac{2}{3}\\cdot 8-\\tfrac{2}{3}\\cdot 1=\\tfrac{16}{3}-\\tfrac{2}{3}=\\tfrac{14}{3}$.',
            ],
          },
        ],
        notes: [
          'Noemt de opgave maar één lijn, bijvoorbeeld $x=1$? De andere grens is dan het nulpunt op de $x$-as.',
        ],
      },
      {
        id: 'opp_onder',
        groep: 'Deel 1 · Van verhaaltje naar integraal',
        title: 'De grafiek ligt onder de $x$-as',
        breed: true,
        herkenpunt: 'O(V)=-\\int_{a}^{b} f(x)\\,dx',
        formula: 'O(V)=-\\int_{a}^{b} f(x)\\,dx',
        answerNote: 'Een oppervlakte is een positief exact getal, zonder $+c$.',
        examples: [
          {
            problem:
              'f(x)=(x-1)e^{x}:\\ \\text{oppervlakte tussen de grafiek, de }x\\text{-as en de }y\\text{-as}',
            answer: 'e-2',
            steps: [
              'Deel 1 — $e^{x}$ is nooit nul, dus het nulpunt is $x=1$. De $y$-as is de lijn $x=0$. Tussen $0$ en $1$ is $x-1$ negatief, dus de grafiek ligt onder de $x$-as. De oppervlakte is $-\\displaystyle\\int_{0}^{1}(x-1)e^{x}\\,dx$.',
              'Deel 2 — een veelterm maal een e-macht: partieel integreren. Neem $g(x)=x-1$ en $h\'(x)=e^{x}$. Dan is $g\'(x)=1$ en $h(x)=e^{x}$.',
              'De regel geeft $(x-1)e^{x}-\\displaystyle\\int e^{x}\\,dx=(x-2)e^{x}$. Terugdifferentiëren: $e^{x}+(x-2)e^{x}=(x-1)e^{x}$.',
              'Deel 3 — $\\bigl[(x-2)e^{x}\\bigr]_{0}^{1}=-e-(-2)=2-e$. Dat is negatief. De oppervlakte is het tegengestelde: $e-2$.',
            ],
          },
        ],
        notes: [
          'Een integraal onder de $x$-as komt negatief uit. De oppervlakte is dat getal zonder het minteken.',
        ],
      },
      {
        id: 'opp_twee',
        groep: 'Deel 1 · Van verhaaltje naar integraal',
        title: 'Tussen twee grafieken',
        breed: true,
        herkenpunt: 'O(V)=\\int_{a}^{b}(h(x)-f(x))\\,dx',
        formula: 'O(V)=\\int_{a}^{b}(\\text{boven}-\\text{onder})\\,dx',
        answerNote: 'Een oppervlakte is een positief exact getal, zonder $+c$.',
        examples: [
          {
            problem:
              'f(x)=\\frac{\\ln^2(x)}{x},\\ h(x)=\\frac{1}{x}:\\ \\text{oppervlakte tussen de grafieken}',
            answer: '\\tfrac{4}{3}',
            steps: [
              'Deel 1 — beide functies bestaan alleen voor $x>0$. Snijpunten: $\\dfrac{\\ln^2(x)}{x}=\\dfrac{1}{x}$ geeft $\\ln^2(x)=1$, dus $\\ln(x)=1$ of $\\ln(x)=-1$, en $x=e$ of $x=e^{-1}$. Bij $x=1$ is $f(1)=0$ en $h(1)=1$, dus $h$ ligt erboven. De oppervlakte is de integraal van $\\dfrac{1}{x}-\\dfrac{\\ln^2(x)}{x}$, van $x=e^{-1}$ tot $x=e$.',
              'Deel 2 — haal $\\dfrac{1}{x}$ voorop: $\\left(1-\\ln^2(x)\\right)\\cdot\\dfrac{1}{x}$. De kern is $g(x)=\\ln(x)$ met $g\'(x)=\\dfrac{1}{x}$. Dat is de substitutiemethode.',
              '$\\displaystyle\\int(1-g^2)\\,dg=g-\\tfrac{1}{3}g^3$. Bij $x=e^{-1}$ hoort $g=-1$, bij $x=e$ hoort $g=1$.',
              'Deel 3 — $\\left[g-\\tfrac{1}{3}g^3\\right]_{-1}^{1}=\\left(1-\\tfrac{1}{3}\\right)-\\left(-1+\\tfrac{1}{3}\\right)=\\tfrac{2}{3}-\\left(-\\tfrac{2}{3}\\right)=\\tfrac{4}{3}$.',
            ],
          },
        ],
        notes: [
          'Eerst de snijpunten. Daartussen vul je één $x$-waarde in om te zien welke grafiek boven ligt.',
        ],
      },
      {
        id: 'opp_p',
        groep: 'Deel 3 · Gebruik de uitkomst',
        title: 'De oppervlakte is gegeven, zoek $p$',
        breed: true,
        herkenpunt: '\\int_{0}^{p} f(x)\\,dx=\\ln(5)',
        formula: '\\int_{0}^{p} f(x)\\,dx=\\ln(5)',
        answerNote: 'Je geeft $p$ exact, niet afgerond.',
        examples: [
          {
            problem:
              'f(x)=\\frac{2x}{x^2+1},\\ O(V)=\\ln(5),\\ p>0,\\ \\text{tussen de grafiek, de }x\\text{-as en }x=p',
            answer: 'p=2',
            steps: [
              'Deel 1 — de grafiek snijdt de $x$-as bij $x=0$ en ligt voor $x>0$ erboven. De oppervlakte is $\\displaystyle\\int_{0}^{p}\\dfrac{2x}{x^2+1}\\,dx$, en die moet $\\ln(5)$ worden.',
              'Deel 2 — de kern is $g(x)=x^2+1$ en de teller is $g\'(x)=2x$. Substitutiemethode: $F(x)=\\ln(x^2+1)$. Terugdifferentiëren geeft $\\dfrac{2x}{x^2+1}$.',
              'Deel 3 — $\\left[\\ln(x^2+1)\\right]_{0}^{p}=\\ln(p^2+1)-\\ln(1)=\\ln(p^2+1)$.',
              'Uit $\\ln(p^2+1)=\\ln(5)$ volgt $p^2+1=5$, dus $p^2=4$. Omdat $p>0$ is $p=2$.',
            ],
          },
        ],
        notes: [
          'Deel 3 is de vergelijking. Een logaritme haal je weg door beide kanten als macht van $e$ te lezen: uit $\\ln(A)=\\ln(B)$ volgt $A=B$.',
        ],
      },
    ],
  },
  {
    slug: 'inhoud',
    code: 'Inh',
    title: 'Inhoud',
    zoektitel: 'Inhoud van een omwentelingslichaam',
    zoekomschrijving:
      'Inhoud van een lichaam dat ontstaat als een vlakdeel om de x-as wentelt, via een integraal.',
    intro:
      'Een vlakdeel wentelt om de $x$-as en wordt een lichaam. Eerst maak je van het verhaaltje een integraal: $\\pi$ keer het kwadraat van de grafiek. Daarna reken je die uit, met de substitutiemethode of met partieel integreren.',
    oefenlinks: [
      { label: 'Oefen wentelen om de x-as', href: '/oefenen?blok=h15c&cluster=h15c_xas' },
    ],
    stappenplan: {
      stap0Titel: 'Stap 0 · Welk lichaam is dit?',
      intro: 'Tik het lichaam aan dat bij jouw opgave past. Daarna doe je stap 1, 2 en 3.',
      herken: [
        {
          groep: 'De grafiek en de $x$-as',
          schil: 'De grenzen staan in de opgave. De inhoud is $\\pi$ keer het kwadraat.',
          voorbeeld: '\\pi\\int_{0}^{1} x e^{x}\\,dx',
          regel: 'Grenzen',
          kaart: 'inh_grenzen',
        },
        {
          groep: 'De grafiek en de $x$-as',
          schil: 'De grafiek ligt onder de $x$-as. Je zet geen min voor de integraal.',
          voorbeeld: '\\pi\\int_{0}^{2}(x-2)^{2}\\,dx',
          regel: 'Onder',
          kaart: 'inh_onder',
        },
        {
          groep: 'Twee grafieken',
          schil: 'Eerst elk kwadraat, dan het verschil. De verste grafiek min de dichtste.',
          voorbeeld: '\\pi\\int_{0}^{4}\\left(x-\\tfrac{1}{4}x^{2}\\right)\\,dx',
          regel: 'Verschil',
          kaart: 'inh_twee',
        },
        {
          groep: 'De inhoud is gegeven',
          schil: 'Je moet de grens $p$ uitrekenen.',
          voorbeeld: '\\pi\\int_{0}^{p}\\frac{2x}{x^{2}+1}\\,dx=\\pi\\ln(5)',
          regel: 'Vergelijking',
          kaart: 'inh_p',
        },
      ],
      regels: [
        {
          regel: 'Inhoud',
          formule: 'I(L)=\\pi\\int_{a}^{b}(f(x))^{2}\\,dx',
          stap1:
            'Schrijf $\\pi$ keer de integraal van het kwadraat. Ligt de grafiek onder de $x$-as, dan zet je geen min ervoor: het kwadraat is al positief. Bij twee grafieken kwadrateer je elke grafiek apart. De verste van de $x$-as min de dichtste.',
          stap2:
            'Primitiveer het kwadraat. Is het een veelterm, dan doe je dat term voor term. Staat de afgeleide van een kern ernaast, dan is het de substitutiemethode. Is het een product van twee factoren, dan is het partieel integreren.',
          stap3:
            'Vul de grenzen in. De inhoud is een positief exact getal, met $\\pi$. Vraagt de opgave om $p$, los de vergelijking exact op. Zet geen $+c$.',
        },
      ],
      slot: 'Een inhoud is een positief getal. Het kwadraat van een verschil is iets anders dan het verschil van de kwadraten. Rond niet af.',
    },
    cards: [
      {
        id: 'inh_grenzen',
        groep: 'Deel 1 · Van verhaaltje naar integraal',
        title: 'De grenzen staan in de opgave',
        breed: true,
        herkenpunt: 'I(L)=\\pi\\int_{a}^{b}(f(x))^{2}\\,dx',
        formula: 'I(L)=\\pi\\int_{a}^{b}(f(x))^{2}\\,dx',
        answerNote: 'Een inhoud is een positief exact getal, met $\\pi$, zonder $+c$.',
        examples: [
          {
            problem:
              'f(x)=e^{x/2}\\sqrt{x}:\\ \\text{inhoud als het vlakdeel tussen de grafiek, de }x\\text{-as en }x=1\\text{ om de }x\\text{-as wentelt}',
            answer: '\\pi',
            steps: [
              'Deel 1 — de grafiek snijdt de $x$-as bij $x=0$, want $\\sqrt{x}=0$. Tussen $0$ en $1$ zijn $e^{x/2}$ en $\\sqrt{x}$ allebei nul of positief. De inhoud is $I(L)=\\pi\\displaystyle\\int_{0}^{1}\\left(e^{x/2}\\sqrt{x}\\right)^{2}\\,dx$.',
              'Deel 2 — het kwadraat is $x e^{x}$. Een veelterm maal een e-macht: partieel integreren. Neem $g(x)=x$ en $h\'(x)=e^{x}$. Dan is $g\'(x)=1$ en $h(x)=e^{x}$.',
              'De regel geeft $x e^{x}-\\displaystyle\\int e^{x}\\,dx=(x-1)e^{x}$. Terugdifferentiëren: $e^{x}+(x-1)e^{x}=x e^{x}$.',
              'Deel 3 — $\\pi\\bigl[(x-1)e^{x}\\bigr]_{0}^{1}=\\pi\\bigl(0-(-1)\\bigr)=\\pi$.',
            ],
          },
        ],
        notes: [
          'Noemt de opgave maar één lijn, bijvoorbeeld $x=1$? De andere grens is dan het punt waar de grafiek de $x$-as snijdt.',
          '$\\pi$ blijft voor de integraal staan. Je primitiveert alleen het kwadraat.',
        ],
      },
      {
        id: 'inh_onder',
        groep: 'Deel 1 · Van verhaaltje naar integraal',
        title: 'De grafiek ligt onder de $x$-as',
        breed: true,
        herkenpunt: 'I(L)=\\pi\\int_{a}^{b}(f(x))^{2}\\,dx',
        formula: 'I(L)=\\pi\\int_{a}^{b}(f(x))^{2}\\,dx',
        answerNote: 'Een inhoud is een positief exact getal, met $\\pi$, zonder $+c$.',
        examples: [
          {
            problem:
              'f(x)=x-2:\\ \\text{inhoud als het vlakdeel tussen de grafiek, de }x\\text{-as en de }y\\text{-as om de }x\\text{-as wentelt}',
            answer: '\\tfrac{8}{3}\\pi',
            steps: [
              'Deel 1 — $f(x)=x-2$ snijdt de $x$-as bij $x=2$. De $y$-as is de lijn $x=0$. Tussen $0$ en $2$ is $x-2$ negatief, dus de grafiek ligt onder de $x$-as. De straal is de afstand tot de $x$-as. Die kwadrateer je, zonder min ervoor. $I(L)=\\pi\\displaystyle\\int_{0}^{2}(x-2)^{2}\\,dx$.',
              'Deel 2 — $(x-2)^{2}=x^{2}-4x+4$. Een primitieve van het kwadraat is $\\tfrac{1}{3}x^{3}-2x^{2}+4x$. Terugdifferentiëren geeft $x^{2}-4x+4$.',
              'Deel 3 — $\\bigl[\\tfrac{1}{3}x^{3}-2x^{2}+4x\\bigr]_{0}^{2}=\\tfrac{8}{3}-8+8=\\tfrac{8}{3}$. De inhoud is $\\tfrac{8}{3}\\pi$.',
              'Controle: het lichaam is een kegel met straal $2$ en hoogte $2$. De inhoud van een kegel is $\\tfrac{1}{3}\\pi r^{2} h=\\tfrac{1}{3}\\pi\\cdot 4\\cdot 2=\\tfrac{8}{3}\\pi$.',
            ],
          },
        ],
        notes: [
          'Je zet geen min voor de integraal. Het kwadraat van een negatief getal is positief, en een inhoud is dat ook.',
        ],
      },
      {
        id: 'inh_twee',
        groep: 'Deel 1 · Van verhaaltje naar integraal',
        title: 'Tussen twee grafieken',
        breed: true,
        herkenpunt: 'I(L)=\\pi\\int_{a}^{b}\\left((h(x))^{2}-(f(x))^{2}\\right)\\,dx',
        formula: 'I(L)=\\pi\\int_{a}^{b}\\left((h(x))^{2}-(f(x))^{2}\\right)\\,dx',
        answerNote: 'Een inhoud is een positief exact getal, met $\\pi$, zonder $+c$.',
        examples: [
          {
            problem:
              'f(x)=\\frac{x}{2},\\ h(x)=\\sqrt{x}:\\ \\text{inhoud als het vlakdeel tussen de grafieken om de }x\\text{-as wentelt}',
            answer: '\\tfrac{8}{3}\\pi',
            steps: [
              'Deel 1 — snijpunten: $\\sqrt{x}=\\dfrac{x}{2}$. Kwadrateren geeft $x=\\dfrac{x^{2}}{4}$, dus $x^{2}-4x=0$ en $x=0$ of $x=4$. Beide voldoen. Bij $x=1$ is $h(1)=1$ en $f(1)=\\tfrac{1}{2}$, dus $h$ ligt verder van de $x$-as. De inhoud is $\\pi$ keer de integraal van $(\\sqrt{x})^{2}-\\left(\\dfrac{x}{2}\\right)^{2}$, van $0$ tot $4$.',
              'Deel 2 — $(\\sqrt{x})^{2}=x$ en $\\left(\\dfrac{x}{2}\\right)^{2}=\\dfrac{x^{2}}{4}$. De integrand is $x-\\dfrac{x^{2}}{4}$. Een primitieve is $\\tfrac{1}{2}x^{2}-\\dfrac{1}{12}x^{3}$. Terugdifferentiëren geeft $x-\\dfrac{x^{2}}{4}$.',
              'Deel 3 — $\\bigl[\\tfrac{1}{2}x^{2}-\\tfrac{1}{12}x^{3}\\bigr]_{0}^{4}=8-\\tfrac{64}{12}=8-\\tfrac{16}{3}=\\tfrac{8}{3}$. De inhoud is $\\tfrac{8}{3}\\pi$.',
            ],
          },
        ],
        notes: [
          'Eerst de snijpunten. Daartussen vul je één $x$-waarde in om te zien welke grafiek verder van de $x$-as ligt.',
          'Je kwadrateert elke grafiek apart en trekt daarna af. $\\left(\\sqrt{x}-\\tfrac{x}{2}\\right)^{2}$ is een andere integrand.',
        ],
      },
      {
        id: 'inh_p',
        groep: 'Deel 3 · Gebruik de uitkomst',
        title: 'De inhoud is gegeven, zoek $p$',
        breed: true,
        herkenpunt: '\\pi\\int_{0}^{p}(f(x))^{2}\\,dx=\\pi\\ln(5)',
        formula: '\\pi\\int_{0}^{p}\\frac{2x}{x^{2}+1}\\,dx=\\pi\\ln(5)',
        answerNote: 'Je geeft $p$ exact, niet afgerond.',
        examples: [
          {
            problem:
              'f(x)=\\sqrt{\\frac{2x}{x^{2}+1}},\\ I(L)=\\pi\\ln(5),\\ p>0,\\ \\text{tussen de grafiek, de }x\\text{-as en }x=p',
            answer: 'p=2',
            steps: [
              'Deel 1 — vanaf $x=0$ is de breuk onder de wortel nul of positief. De grafiek snijdt de $x$-as bij $x=0$. De inhoud tot $x=p$ is $\\pi\\displaystyle\\int_{0}^{p}\\dfrac{2x}{x^{2}+1}\\,dx$, en die moet $\\pi\\ln(5)$ worden.',
              'Deel 2 — de kern is $g(x)=x^{2}+1$ en de teller is $g\'(x)=2x$. Dat is de substitutiemethode: een primitieve van de integrand is $\\ln(x^{2}+1)$. Terugdifferentiëren geeft $\\dfrac{2x}{x^{2}+1}$.',
              'Deel 3 — $\\pi\\bigl[\\ln(x^{2}+1)\\bigr]_{0}^{p}=\\pi\\ln(p^{2}+1)$. Uit $\\pi\\ln(p^{2}+1)=\\pi\\ln(5)$ volgt $p^{2}+1=5$, dus $p^{2}=4$. Omdat $p>0$ is $p=2$.',
            ],
          },
        ],
        notes: [
          '$\\pi$ staat aan beide kanten en valt weg. Uit $\\ln(A)=\\ln(B)$ volgt $A=B$.',
        ],
      },
    ],
  },
  {
    slug: 'k3',
    code: 'K.3',
    title: 'K.3 — Cyclometrische functies',
    zoektitel: 'K.3 Cyclometrische integralen: uitleg met routes',
    zoekomschrijving:
      'Theorie K.3: met 8 routes herken je of een integraal arcsin of arctan wordt. Snel antwoord nodig? Bekijk eerst het voorbeeld 1/(x²+1) = arctan(x).',
    intro: 'Elke integraal hier wordt $\\arctan$ of $\\arcsin$. De noemer zegt welke van de twee.',
    uitgelichtVoorbeeld: {
      label: 'Voorbeeld: primitieve van 1/(x²+1) = arctan(x)',
      slug: '1-over-x-kwadraat-plus-1',
    },
    oefenlinks: [
      { label: 'Oefen K.3 A', href: '/oefenen?blok=k3a' },
      { label: 'Oefen K.3 B', href: '/oefenen?blok=k3b' },
      { label: 'Oefen K.3 C', href: '/oefenen?blok=k3c' },
    ],
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
