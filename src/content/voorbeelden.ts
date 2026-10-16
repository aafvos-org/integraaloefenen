/**
 * Openbare antwoordpagina's: één veelgezochte primitieve per adres.
 *
 * Een nieuwe pagina is een extra object in `VOORBEELDEN`. De pagina, de
 * sitemap en de rekentest lezen deze lijst. `integrand` en `primitieve`
 * staan in mathjs-notatie, zonder integratieconstante. De test
 * differentieert de primitieve en vergelijkt die met de integrand.
 *
 * Geen boekopgaven. Functies heten f, g en h.
 */

import { THEORIE_SLUGS } from '@/lib/theorie-slugs'

export type Voorbeeld = {
  /** Stuk achter /nl/voorbeeld/ */
  slug: string
  /** Zichtbare kop, ook de zoekvraag. */
  kop: string
  /** Titel in het tabblad, zonder de sitenaam. */
  titel: string
  /** Meta-omschrijving, eigen per pagina. */
  omschrijving: string
  /** De integraal, zuivere LaTeX. */
  vraagLatex: string
  /** Het antwoord, zuivere LaTeX, met + c bij een onbepaalde integraal. */
  antwoordLatex: string
  integrand: string
  primitieve: string
  /** Waar de rekentest kijkt. Weglaten = [-2.5, 2.5]. */
  domein?: [number, number]
  /** Alleen bij een bepaalde integraal. */
  grenzen?: [number, number]
  waarde?: string | number
  /** Precies vier stappen: stap 0 t/m 3. Mag $...$ bevatten. */
  stappen: [string, string, string, string]
  /** Eén veelgemaakte fout. Mag $...$ bevatten. */
  fout: string
  /** Oefenblok, bijvoorbeeld k0b. */
  blok: string
  /** Cluster binnen dat blok. */
  cluster: string
  /** Theoriepagina onder de taal, bijvoorbeeld /theorie/primitieve. */
  theorie: string
  /** Twee andere slugs uit deze lijst. */
  verwant: [string, string]
}

/** Knop "Oefen dit soort sommen". `van=voorbeeld` blijft in het adres staan. */
export function oefenPad(voorbeeld: Voorbeeld): string {
  const params = new URLSearchParams({
    blok: voorbeeld.blok,
    cluster: voorbeeld.cluster,
    van: 'voorbeeld',
  })
  return `/oefenen?${params.toString()}`
}

/** Drie proefopgaven van het bijbehorende theoriehoofdstuk, zonder account. */
export function proefPad(voorbeeld: Voorbeeld): string | null {
  const slug = voorbeeld.theorie.split('/').filter(Boolean).pop() ?? ''
  if (!(THEORIE_SLUGS as readonly string[]).includes(slug)) return null
  return `/proberen/${slug}`
}

export function vindVoorbeeld(slug: string): Voorbeeld | undefined {
  return VOORBEELDEN.find((voorbeeld) => voorbeeld.slug === slug)
}

/** Antwoordpagina's waarvan het theoriepad op dit hoofdstuk eindigt. */
export function uitwerkingenVoor(hoofdstuk: string): { slug: string; kop: string }[] {
  return VOORBEELDEN.filter((voorbeeld) =>
    voorbeeld.theorie.endsWith(`/${hoofdstuk}`),
  ).map((voorbeeld) => ({ slug: voorbeeld.slug, kop: voorbeeld.kop }))
}

export const VOORBEELDEN: Voorbeeld[] = [
  {
    slug: '1-over-x',
    kop: 'De primitieve van 1/x',
    titel: 'Primitieve van 1/x',
    omschrijving:
      'De primitieve van 1/x is ln|x| + c. Korte uitwerking met de standaardprimitieve, plus de fout met de machtsregel.',
    vraagLatex: '\\int \\frac{1}{x}\\,dx',
    antwoordLatex: '\\ln|x|+c',
    integrand: '1/x',
    primitieve: 'ln(abs(x))',
    domein: [0.2, 3],
    stappen: [
      'Alleen deel 2 van de driedeling speelt hier: bereken de goede integraal. $1/x$ staat in de lijst met standaardprimitieven.',
      'De machtsregel geldt niet, want de macht is $-1$. Herschrijven is niet nodig.',
      'De primitieve van $1/x$ is $\\ln|x|$.',
      'Schrijf het antwoord op: $F(x)=\\ln|x|+c$. Controle: differentieer $F$ en je krijgt $1/x$ terug.',
    ],
    fout: 'Met de machtsregel zou $x^{-1}$ de primitieve $\\frac{1}{0}x^{0}$ geven. Die deling door nul mag niet. Daarom is het $\\ln|x|$, en niet $x^{0}$.',
    blok: 'k0b',
    cluster: 'k0b_machten_gonio',
    theorie: '/theorie/primitieve',
    verwant: ['1-over-x-kwadraat', '1-over-2x-plus-1'],
  },
  {
    slug: 'ln-x',
    kop: 'De primitieve van ln(x)',
    titel: 'Primitieve van ln(x)',
    omschrijving:
      'De primitieve van ln(x) is x ln(x) − x + c. Uitwerking met partieel integreren, en de fout waarbij de −x wegvalt.',
    vraagLatex: '\\int \\ln(x)\\,dx',
    antwoordLatex: 'x\\ln(x)-x+c',
    integrand: 'ln(x)',
    primitieve: 'x*ln(x) - x',
    domein: [0.2, 3],
    stappen: [
      'Alleen deel 2 speelt hier. $\\ln(x)$ staat niet los in de standaardlijst. Schrijf het als een product: $\\ln(x)\\cdot 1$, en gebruik partieel integreren.',
      'Kies $g(x)=\\ln(x)$ en $h\'(x)=1$. Dan is $g\'(x)=1/x$ en $h(x)=x$.',
      'De formule is $g\\cdot h-\\int h\\cdot g\'\\,dx$. Dat wordt $x\\ln(x)-\\int x\\cdot\\frac{1}{x}\\,dx=x\\ln(x)-\\int 1\\,dx=x\\ln(x)-x$.',
      'Schrijf het antwoord op: $F(x)=x\\ln(x)-x+c$. Controle: differentieer $F$ en je krijgt $\\ln(x)$ terug.',
    ],
    fout: 'Alleen $x\\ln(x)$ is te weinig. Bij het differentiëren komt er dan een extra $1$ bij, en die hoort niet bij $\\ln(x)$. De $-x$ haalt die $1$ weer weg.',
    blok: 'k2a',
    cluster: 'k2a_ln',
    theorie: '/theorie/partieel-integreren',
    verwant: ['x-ln-x', 'ln-2x'],
  },
  {
    slug: 'sin-kwadraat',
    kop: 'De primitieve van sin²(x)',
    titel: 'Primitieve van sin²(x)',
    omschrijving:
      'De primitieve van sin²(x) is x/2 − sin(2x)/4 + c. Eerst de formule voor sin², daarna een lineaire kern.',
    vraagLatex: '\\int \\sin^2(x)\\,dx',
    antwoordLatex: '\\frac{1}{2}x-\\frac{1}{4}\\sin(2x)+c',
    integrand: 'sin(x)^2',
    primitieve: 'x/2 - sin(2*x)/4',
    stappen: [
      'Alleen deel 2 speelt hier. $\\sin^2(x)$ staat niet in de standaardlijst. Gebruik $\\sin^2(x)=\\dfrac{1-\\cos(2x)}{2}$.',
      'Herschrijf: $f(x)=\\dfrac{1}{2}-\\dfrac{1}{2}\\cos(2x)$.',
      '$\\dfrac{1}{2}$ geeft $\\dfrac{1}{2}x$. De kern van $\\cos(2x)$ is $2x$, dus de primitieve van $\\cos(2x)$ is $\\dfrac{1}{2}\\sin(2x)$. Met de factor $-\\dfrac{1}{2}$ wordt dat $-\\dfrac{1}{4}\\sin(2x)$.',
      'Schrijf het antwoord op: $F(x)=\\dfrac{1}{2}x-\\dfrac{1}{4}\\sin(2x)+c$. Controle: differentieer $F$ en je krijgt $\\sin^2(x)$ terug.',
    ],
    fout: '$\\dfrac{1}{3}\\sin^3(x)$ is de primitieve van $\\sin^2(x)\\cdot\\cos(x)$, niet van $\\sin^2(x)$ alleen. De extra $\\cos(x)$ ontbreekt hier.',
    blok: 'k0b',
    cluster: 'k0b_lin_e_gonio',
    theorie: '/theorie/primitieve',
    verwant: ['cos-kwadraat', 'sin-x'],
  },
  {
    slug: 'e-tot-2x',
    kop: 'De primitieve van e^(2x)',
    titel: 'Primitieve van e^(2x)',
    omschrijving:
      'De primitieve van e^(2x) is ½e^(2x) + c. De 2 in de exponent deel je aan het eind weer weg.',
    vraagLatex: '\\int e^{2x}\\,dx',
    antwoordLatex: '\\frac{1}{2}e^{2x}+c',
    integrand: 'e^(2*x)',
    primitieve: 'e^(2*x)/2',
    stappen: [
      'Alleen deel 2 speelt hier. Dit is een standaardfunctie met een lineaire kern: $f(ax+b)$ geeft $\\dfrac{1}{a}F(ax+b)+c$.',
      'De buitenkant is $e^{\\text{even}}$, de kern is $2x$. Dus $a=2$.',
      'Primitiveer alleen de buitenkant en laat de kern staan: $e^{2x}$.',
      'Deel door $a=2$ en schrijf $+c$: $F(x)=\\dfrac{1}{2}e^{2x}+c$. Controle: de kettingregel geeft de factor $2$ terug, en $2\\cdot\\dfrac{1}{2}e^{2x}=e^{2x}$.',
    ],
    fout: '$e^{2x}$ zelf is te veel. Differentiëren geeft $2e^{2x}$, niet $e^{2x}$. Deel daarom door $2$.',
    blok: 'k0b',
    cluster: 'k0b_lin_e_gonio',
    theorie: '/theorie/primitieve',
    verwant: ['e-tot-x', 'e-tot-min-x'],
  },
  {
    slug: 'x-e-tot-x',
    kop: 'De primitieve van x·e^x',
    titel: 'Primitieve van x e^x',
    omschrijving:
      'De primitieve van x·e^x is e^x(x − 1) + c. Uitwerking met partieel integreren.',
    vraagLatex: '\\int x e^{x}\\,dx',
    antwoordLatex: 'e^{x}(x-1)+c',
    integrand: 'x * e^x',
    primitieve: 'e^x * (x - 1)',
    stappen: [
      'Alleen deel 2 speelt hier. Een veelterm maal een e-macht: partieel integreren.',
      'Kies $g(x)=x$ en $h\'(x)=e^{x}$. Dan is $g\'(x)=1$ en $h(x)=e^{x}$.',
      '$g\\cdot h-\\int h\\cdot g\'\\,dx=xe^{x}-\\int e^{x}\\,dx=xe^{x}-e^{x}=e^{x}(x-1)$.',
      'Schrijf het antwoord op: $F(x)=e^{x}(x-1)+c$. Controle: differentieer $F$ en je krijgt $x e^{x}$ terug.',
    ],
    fout: '$xe^{x}$ is te veel. Bij het differentiëren komt er dan een extra $e^{x}$ bij. Die trek je eraf, vandaar de factor $(x-1)$.',
    blok: 'k2a',
    cluster: 'k2a_macht_e',
    theorie: '/theorie/partieel-integreren',
    verwant: ['x-kwadraat-e-tot-x', 'e-tot-x-maal-sin-x'],
  },
  {
    slug: 'x-kwadraat',
    kop: 'De primitieve van x²',
    titel: 'Primitieve van x²',
    omschrijving:
      'De primitieve van x² is ⅓x³ + c. De macht gaat één omhoog, en je deelt door die nieuwe macht.',
    vraagLatex: '\\int x^2\\,dx',
    antwoordLatex: '\\frac{1}{3}x^3+c',
    integrand: 'x^2',
    primitieve: 'x^3/3',
    stappen: [
      'Alleen deel 2 speelt hier. Dit is één macht van $x$.',
      'Herschrijven is niet nodig: $f(x)=x^{2}$.',
      'De regel $x^{n}$ geeft $\\dfrac{1}{n+1}x^{n+1}$. Hier is $n=2$, dus $\\dfrac{1}{3}x^{3}$.',
      'Schrijf het antwoord op: $F(x)=\\dfrac{1}{3}x^{3}+c$. Controle: differentieer $F$ en je krijgt $x^{2}$ terug.',
    ],
    fout: 'De macht wordt $3$, niet $1$. En je deelt door $3$, niet door $2$. $x^{3}$ zonder de $\\dfrac{1}{3}$ differentieert naar $3x^{2}$.',
    blok: 'k0b',
    cluster: 'k0b_machten_gonio',
    theorie: '/theorie/primitieve',
    verwant: ['x-derde', 'wortel-x'],
  },
  {
    slug: 'x-derde',
    kop: 'De primitieve van x³',
    titel: 'Primitieve van x³',
    omschrijving:
      'De primitieve van x³ is ¼x⁴ + c. Zelfde machtsregel als bij x², met een hogere macht.',
    vraagLatex: '\\int x^3\\,dx',
    antwoordLatex: '\\frac{1}{4}x^4+c',
    integrand: 'x^3',
    primitieve: 'x^4/4',
    stappen: [
      'Alleen deel 2 speelt hier. Dit is één macht van $x$.',
      'Herschrijven is niet nodig: $f(x)=x^{3}$.',
      '$n=3$, dus de primitieve is $\\dfrac{1}{4}x^{4}$.',
      'Schrijf het antwoord op: $F(x)=\\dfrac{1}{4}x^{4}+c$. Controle: differentieer $F$ en je krijgt $x^{3}$ terug.',
    ],
    fout: 'Delen door $3$ hoort bij de afgeleide, niet bij de primitieve. Bij primitiveren deel je door de nieuwe macht, hier $4$.',
    blok: 'k0b',
    cluster: 'k0b_machten_gonio',
    theorie: '/theorie/primitieve',
    verwant: ['x-kwadraat', '1-over-x-kwadraat'],
  },
  {
    slug: 'sin-x',
    kop: 'De primitieve van sin(x)',
    titel: 'Primitieve van sin(x)',
    omschrijving:
      'De primitieve van sin(x) is −cos(x) + c. Het minteken hoort bij sinus, niet bij cosinus.',
    vraagLatex: '\\int \\sin(x)\\,dx',
    antwoordLatex: '-\\cos(x)+c',
    integrand: 'sin(x)',
    primitieve: '-cos(x)',
    stappen: [
      'Alleen deel 2 speelt hier. $\\sin(x)$ staat in de lijst met standaardprimitieven.',
      'Herschrijven is niet nodig.',
      'De primitieve van $\\sin(x)$ is $-\\cos(x)$.',
      'Schrijf het antwoord op: $F(x)=-\\cos(x)+c$. Controle: de afgeleide van $-\\cos(x)$ is $\\sin(x)$.',
    ],
    fout: 'Zonder het minteken differentieert $\\cos(x)$ naar $-\\sin(x)$. Dan staat het teken verkeerd.',
    blok: 'k0b',
    cluster: 'k0b_machten_gonio',
    theorie: '/theorie/primitieve',
    verwant: ['cos-x', 'sin-2x'],
  },
  {
    slug: 'cos-x',
    kop: 'De primitieve van cos(x)',
    titel: 'Primitieve van cos(x)',
    omschrijving:
      'De primitieve van cos(x) is sin(x) + c. Hier komt geen minteken bij.',
    vraagLatex: '\\int \\cos(x)\\,dx',
    antwoordLatex: '\\sin(x)+c',
    integrand: 'cos(x)',
    primitieve: 'sin(x)',
    stappen: [
      'Alleen deel 2 speelt hier. $\\cos(x)$ staat in de lijst met standaardprimitieven.',
      'Herschrijven is niet nodig.',
      'De primitieve van $\\cos(x)$ is $\\sin(x)$.',
      'Schrijf het antwoord op: $F(x)=\\sin(x)+c$. Controle: de afgeleide van $\\sin(x)$ is $\\cos(x)$.',
    ],
    fout: 'Het minteken hoort bij de primitieve van $\\sin(x)$, niet bij die van $\\cos(x)$. $-\\sin(x)$ differentieert naar $-\\cos(x)$.',
    blok: 'k0b',
    cluster: 'k0b_machten_gonio',
    theorie: '/theorie/primitieve',
    verwant: ['sin-x', 'cos-3x'],
  },
  {
    slug: 'e-tot-x',
    kop: 'De primitieve van e^x',
    titel: 'Primitieve van e^x',
    omschrijving:
      'De primitieve van e^x is e^x + c. De e-macht blijft dezelfde functie.',
    vraagLatex: '\\int e^{x}\\,dx',
    antwoordLatex: 'e^{x}+c',
    integrand: 'e^x',
    primitieve: 'e^x',
    stappen: [
      'Alleen deel 2 speelt hier. $e^{x}$ staat in de lijst met standaardprimitieven.',
      'Herschrijven is niet nodig. De kern is $x$, dus $a=1$.',
      'De primitieve van $e^{x}$ is $e^{x}$.',
      'Schrijf het antwoord op: $F(x)=e^{x}+c$. Controle: de afgeleide van $e^{x}$ is $e^{x}$.',
    ],
    fout: 'Er komt geen factor voor $e^{x}$. Die factor zie je pas als de exponent niet $x$ is, zoals bij $e^{2x}$.',
    blok: 'k0b',
    cluster: 'k0b_exponenten',
    theorie: '/theorie/primitieve',
    verwant: ['e-tot-2x', '2-tot-x'],
  },
  {
    slug: 'wortel-x',
    kop: 'De primitieve van √x',
    titel: 'Primitieve van √x',
    omschrijving:
      'De primitieve van √x is ⅔x√x + c. Schrijf de wortel eerst als macht x^(1/2).',
    vraagLatex: '\\int \\sqrt{x}\\,dx',
    antwoordLatex: '\\frac{2}{3}x\\sqrt{x}+c',
    integrand: 'sqrt(x)',
    primitieve: '(2/3) * x^(3/2)',
    domein: [0.1, 4],
    stappen: [
      'Alleen deel 2 speelt hier. Een wortel is een macht: eerst herschrijven, dan de machtsregel.',
      '$\\sqrt{x}=x^{1/2}$.',
      'De nieuwe macht is $\\dfrac{1}{2}+1=\\dfrac{3}{2}$. Delen door $\\dfrac{3}{2}$ is vermenigvuldigen met $\\dfrac{2}{3}$. Dus $\\dfrac{2}{3}x^{3/2}=\\dfrac{2}{3}x\\sqrt{x}$.',
      'Schrijf het antwoord op: $F(x)=\\dfrac{2}{3}x\\sqrt{x}+c$. Controle: differentieer $F$ en je krijgt $\\sqrt{x}$ terug.',
    ],
    fout: 'De wortel niet laten staan als $\\sqrt{\\,}$ en dan "iets met een half" doen. Eerst $x^{1/2}$, anders deel je door de verkeerde macht.',
    blok: 'k0b',
    cluster: 'k0b_machten_gonio',
    theorie: '/theorie/primitieve',
    verwant: ['wortel-2x-plus-1', 'x-kwadraat'],
  },
  {
    slug: '1-over-x-kwadraat',
    kop: 'De primitieve van 1/x²',
    titel: 'Primitieve van 1/x²',
    omschrijving:
      'De primitieve van 1/x² is −1/x + c. Schrijf de breuk als x^(−2) en gebruik de machtsregel.',
    vraagLatex: '\\int \\frac{1}{x^2}\\,dx',
    antwoordLatex: '-\\frac{1}{x}+c',
    integrand: '1/x^2',
    primitieve: '-1/x',
    domein: [0.2, 3],
    stappen: [
      'Alleen deel 2 speelt hier. Een breuk met alleen een macht van $x$ in de noemer schrijf je als een negatieve macht.',
      '$\\dfrac{1}{x^{2}}=x^{-2}$. Dit is niet $1/x$, dus geen logaritme.',
      '$n=-2$, dus $\\dfrac{1}{-1}x^{-1}=-x^{-1}=-\\dfrac{1}{x}$.',
      'Schrijf het antwoord op: $F(x)=-\\dfrac{1}{x}+c$. Controle: differentieer $F$ en je krijgt $1/x^{2}$ terug.',
    ],
    fout: '$\\ln|x^{2}|$ of $\\ln|x|$ hoort bij $1/x$, niet bij $1/x^{2}$. De macht is $-2$, en die mag door de machtsregel.',
    blok: 'k0b',
    cluster: 'k0b_machten_gonio',
    theorie: '/theorie/primitieve',
    verwant: ['1-over-x', 'x-kwadraat'],
  },
  {
    slug: '1-over-x-kwadraat-plus-1',
    kop: 'De primitieve van 1/(x²+1)',
    titel: 'Primitieve van 1/(x²+1)',
    omschrijving:
      'De primitieve van 1/(x²+1) is arctan(x) + c. De noemer x²+1 wijst op arctan, niet op een logaritme.',
    vraagLatex: '\\int \\frac{1}{x^2+1}\\,dx',
    antwoordLatex: '\\arctan(x)+c',
    integrand: '1/(x^2+1)',
    primitieve: 'atan(x)',
    stappen: [
      'Alleen deel 2 speelt hier. Kijk naar de noemer: $x^{2}+1$ betekent arctan.',
      'De noemer is al precies $x^{2}+1$. Herschrijven is niet nodig.',
      'De primitieve van $\\dfrac{1}{x^{2}+1}$ is $\\arctan(x)$.',
      'Schrijf het antwoord op: $F(x)=\\arctan(x)+c$. Controle: de afgeleide van $\\arctan(x)$ is $\\dfrac{1}{x^{2}+1}$.',
    ],
    fout: 'Een logaritme hoort bij een noemer die de afgeleide van de teller is, zoals $x/(x^{2}+1)$. Hier staat er een $1$ in de teller, en de afgeleide van de noemer is $2x$.',
    blok: 'k3a',
    cluster: 'k3a_standaard',
    theorie: '/theorie/k3',
    verwant: ['1-over-x-kwadraat-plus-4', '1-over-wortel-1-min-x-kwadraat'],
  },
  {
    slug: '1-over-wortel-1-min-x-kwadraat',
    kop: 'De primitieve van 1/√(1−x²)',
    titel: 'Primitieve van 1/√(1−x²)',
    omschrijving:
      'De primitieve van 1/√(1−x²) is arcsin(x) + c. De wortel van 1−x² wijst op arcsin.',
    vraagLatex: '\\int \\frac{1}{\\sqrt{1-x^2}}\\,dx',
    antwoordLatex: '\\arcsin(x)+c',
    integrand: '1/sqrt(1-x^2)',
    primitieve: 'asin(x)',
    domein: [-0.8, 0.8],
    stappen: [
      'Alleen deel 2 speelt hier. Een wortel $\\sqrt{1-\\ldots^{2}}$ in de noemer wijst op arcsin.',
      'Er staat al precies $\\sqrt{1-x^{2}}$. Herschrijven is niet nodig.',
      'De primitieve van $\\dfrac{1}{\\sqrt{1-x^{2}}}$ is $\\arcsin(x)$.',
      'Schrijf het antwoord op: $F(x)=\\arcsin(x)+c$. Controle: de afgeleide van $\\arcsin(x)$ is $\\dfrac{1}{\\sqrt{1-x^{2}}}$.',
    ],
    fout: 'Arctan hoort bij een noemer $x^{2}+1$, zonder wortel. Hier staat er een min in de wortel, dus arcsin.',
    blok: 'k3c',
    cluster: 'k3c_standaard',
    theorie: '/theorie/k3',
    verwant: ['1-over-x-kwadraat-plus-1', 'wortel-x'],
  },
  {
    slug: '2-tot-x',
    kop: 'De primitieve van 2^x',
    titel: 'Primitieve van 2^x',
    omschrijving:
      'De primitieve van 2^x is 2^x / ln(2) + c. Deel door de natuurlijke logaritme van het grondtal.',
    vraagLatex: '\\int 2^{x}\\,dx',
    antwoordLatex: '\\frac{2^{x}}{\\ln 2}+c',
    integrand: '2^x',
    primitieve: '2^x / ln(2)',
    stappen: [
      'Alleen deel 2 speelt hier. $g^{x}$ staat in de standaardlijst, met grondtal $g=2$.',
      'Herschrijven is niet nodig. Dit is geen $e^{x}$: het grondtal is $2$.',
      'De primitieve van $g^{x}$ is $\\dfrac{g^{x}}{\\ln(g)}$. Dus $\\dfrac{2^{x}}{\\ln 2}$.',
      'Schrijf het antwoord op: $F(x)=\\dfrac{2^{x}}{\\ln 2}+c$. Controle: differentieer $F$ en je krijgt $2^{x}$ terug.',
    ],
    fout: '$2^{x}$ niet behandelen als $e^{x}$. Zonder de deling door $\\ln 2$ differentieert het antwoord naar $2^{x}\\ln 2$.',
    blok: 'k0b',
    cluster: 'k0b_exponenten',
    theorie: '/theorie/primitieve',
    verwant: ['e-tot-x', 'e-tot-2x'],
  },
  {
    slug: 'sin-2x',
    kop: 'De primitieve van sin(2x)',
    titel: 'Primitieve van sin(2x)',
    omschrijving:
      'De primitieve van sin(2x) is −½cos(2x) + c. Deel door de 2 uit de kern.',
    vraagLatex: '\\int \\sin(2x)\\,dx',
    antwoordLatex: '-\\frac{1}{2}\\cos(2x)+c',
    integrand: 'sin(2*x)',
    primitieve: '-cos(2*x)/2',
    stappen: [
      'Alleen deel 2 speelt hier. Lineaire kern: $f(ax+b)$ geeft $\\dfrac{1}{a}F(ax+b)+c$.',
      'De buitenkant is $\\sin$, de kern is $2x$. Dus $a=2$.',
      'De primitieve van de buitenkant $\\sin$ is $-\\cos$. Laat de kern staan: $-\\cos(2x)$.',
      'Deel door $2$: $F(x)=-\\dfrac{1}{2}\\cos(2x)+c$. Controle: de kettingregel geeft de factor $2$ terug.',
    ],
    fout: 'Alleen $-\\cos(2x)$ is te veel. Differentiëren geeft dan $2\\sin(2x)$. Deel door $a=2$.',
    blok: 'k0b',
    cluster: 'k0b_lin_e_gonio',
    theorie: '/theorie/primitieve',
    verwant: ['cos-3x', 'sin-x'],
  },
  {
    slug: 'cos-3x',
    kop: 'De primitieve van cos(3x)',
    titel: 'Primitieve van cos(3x)',
    omschrijving:
      'De primitieve van cos(3x) is ⅓sin(3x) + c. Deel door de 3 uit de kern.',
    vraagLatex: '\\int \\cos(3x)\\,dx',
    antwoordLatex: '\\frac{1}{3}\\sin(3x)+c',
    integrand: 'cos(3*x)',
    primitieve: 'sin(3*x)/3',
    stappen: [
      'Alleen deel 2 speelt hier. Lineaire kern: deel aan het eind door $a$.',
      'De buitenkant is $\\cos$, de kern is $3x$. Dus $a=3$.',
      'De primitieve van de buitenkant is $\\sin(3x)$.',
      'Deel door $3$: $F(x)=\\dfrac{1}{3}\\sin(3x)+c$. Controle: de kettingregel geeft de factor $3$ terug.',
    ],
    fout: 'Het minteken van sinus hoort hier niet. $\\cos$ geeft $\\sin$, en daarna deel je door $3$.',
    blok: 'k0b',
    cluster: 'k0b_lin_e_gonio',
    theorie: '/theorie/primitieve',
    verwant: ['sin-2x', 'cos-x'],
  },
  {
    slug: 'e-tot-min-x',
    kop: 'De primitieve van e^(−x)',
    titel: 'Primitieve van e^(−x)',
    omschrijving:
      'De primitieve van e^(−x) is −e^(−x) + c. De −1 in de exponent geeft het minteken vooraan.',
    vraagLatex: '\\int e^{-x}\\,dx',
    antwoordLatex: '-e^{-x}+c',
    integrand: 'e^(-x)',
    primitieve: '-e^(-x)',
    stappen: [
      'Alleen deel 2 speelt hier. Lineaire kern in de exponent.',
      'De buitenkant is $e^{\\text{even}}$, de kern is $-x$. Dus $a=-1$.',
      'Primitiveer de buitenkant: $e^{-x}$.',
      'Deel door $a=-1$. Delen door $-1$ zet een minteken: $F(x)=-e^{-x}+c$. Controle: de kettingregel geeft $-1\\cdot -e^{-x}=e^{-x}$.',
    ],
    fout: '$e^{-x}$ zonder minteken differentieert naar $-e^{-x}$. Het teken klopt dan niet.',
    blok: 'k0b',
    cluster: 'k0b_lin_e_gonio',
    theorie: '/theorie/primitieve',
    verwant: ['e-tot-2x', 'e-tot-x'],
  },
  {
    slug: '1-over-2x-plus-1',
    kop: 'De primitieve van 1/(2x+1)',
    titel: 'Primitieve van 1/(2x+1)',
    omschrijving:
      'De primitieve van 1/(2x+1) is ½ln|2x+1| + c. Deel door de 2 uit de kern.',
    vraagLatex: '\\int \\frac{1}{2x+1}\\,dx',
    antwoordLatex: '\\frac{1}{2}\\ln|2x+1|+c',
    integrand: '1/(2*x+1)',
    primitieve: 'ln(abs(2*x+1))/2',
    domein: [0, 2],
    stappen: [
      'Alleen deel 2 speelt hier. De buitenkant is $1/\\text{even}$, de kern is lineair.',
      'De kern is $2x+1$, dus $a=2$. De primitieve van $1/t$ is $\\ln|t|$.',
      'Zet de kern erin: $\\ln|2x+1|$.',
      'Deel door $2$: $F(x)=\\dfrac{1}{2}\\ln|2x+1|+c$. Controle: de kettingregel geeft de factor $2$ terug.',
    ],
    fout: 'Zonder de $\\dfrac{1}{2}$ differentieert $\\ln|2x+1|$ naar $\\dfrac{2}{2x+1}$. Dat is twee keer te veel.',
    blok: 'k0b',
    cluster: 'k0b_lin_breuk_wortel',
    theorie: '/theorie/primitieve',
    verwant: ['1-over-x', 'wortel-2x-plus-1'],
  },
  {
    slug: 'ln-2x',
    kop: 'De primitieve van ln(2x)',
    titel: 'Primitieve van ln(2x)',
    omschrijving:
      'De primitieve van ln(2x) is x ln(2x) − x + c. Zelfde vorm als bij ln(x), met 2x in de logaritme.',
    vraagLatex: '\\int \\ln(2x)\\,dx',
    antwoordLatex: 'x\\ln(2x)-x+c',
    integrand: 'ln(2*x)',
    primitieve: 'x*ln(2*x) - x',
    domein: [0.2, 3],
    stappen: [
      'Alleen deel 2 speelt hier. $\\ln(2x)$ is de standaardfunctie $\\ln$ met kern $2x$. De primitieve van $\\ln(t)$ is $t\\ln(t)-t$.',
      'De kern is $2x$, dus $a=2$.',
      'Zet de kern in de bekende primitieve: $(2x)\\ln(2x)-2x$.',
      'Deel door $a=2$: $F(x)=x\\ln(2x)-x+c$. Controle: differentieer $F$ en je krijgt $\\ln(2x)$ terug.',
    ],
    fout: 'Niet eerst $\\ln(2x)=\\ln 2+\\ln(x)$ vergeten en dan alleen $x\\ln(x)-x$ opschrijven. In het antwoord moet $2x$ in de logaritme blijven, of je telt $x\\ln 2$ er apart bij op. Beide vormen zijn gelijk.',
    blok: 'k0b',
    cluster: 'k0b_lin_exp_ln',
    theorie: '/theorie/primitieve',
    verwant: ['ln-x', '1-over-2x-plus-1'],
  },
  {
    slug: 'x-sin-x',
    kop: 'De primitieve van x·sin(x)',
    titel: 'Primitieve van x sin(x)',
    omschrijving:
      'De primitieve van x·sin(x) is −x cos(x) + sin(x) + c. Uitwerking met partieel integreren.',
    vraagLatex: '\\int x\\sin(x)\\,dx',
    antwoordLatex: '-x\\cos(x)+\\sin(x)+c',
    integrand: 'x * sin(x)',
    primitieve: '-x * cos(x) + sin(x)',
    stappen: [
      'Alleen deel 2 speelt hier. Een veelterm maal een sinus: partieel integreren.',
      'Kies $g(x)=x$ en $h\'(x)=\\sin(x)$. Dan is $g\'(x)=1$ en $h(x)=-\\cos(x)$.',
      '$g\\cdot h-\\int h\\cdot g\'\\,dx=-x\\cos(x)-\\int -\\cos(x)\\,dx=-x\\cos(x)+\\sin(x)$.',
      'Schrijf het antwoord op: $F(x)=-x\\cos(x)+\\sin(x)+c$. Controle: differentieer $F$ en je krijgt $x\\sin(x)$ terug.',
    ],
    fout: 'Het minteken zit in de primitieve van $\\sin(x)$, dus in $h(x)=-\\cos(x)$. Laat je dat weg, dan kloppen beide tekens in het antwoord niet.',
    blok: 'k2a',
    cluster: 'k2a_macht_gonio',
    theorie: '/theorie/partieel-integreren',
    verwant: ['x-e-tot-x', 'sin-x'],
  },
  {
    slug: 'x-kwadraat-e-tot-x',
    kop: 'De primitieve van x²·e^x',
    titel: 'Primitieve van x² e^x',
    omschrijving:
      'De primitieve van x²·e^x is e^x(x² − 2x + 2) + c. Twee keer partieel integreren.',
    vraagLatex: '\\int x^2 e^{x}\\,dx',
    antwoordLatex: 'e^{x}(x^2-2x+2)+c',
    integrand: 'x^2 * e^x',
    primitieve: 'e^x * (x^2 - 2*x + 2)',
    stappen: [
      'Alleen deel 2 speelt hier. Een kwadraat maal een e-macht: twee keer partieel integreren. De e-macht blijft steeds $h\'$.',
      'Eerste keer: $g(x)=x^{2}$ en $h\'(x)=e^{x}$. Dan is $g\'(x)=2x$ en $h(x)=e^{x}$. Je krijgt $x^{2}e^{x}-\\int 2x e^{x}\\,dx$.',
      'Tweede keer op $x e^{x}$: $g(x)=x$, $h\'(x)=e^{x}$. Dat geeft $e^{x}(x-1)$. Dus $\\int 2x e^{x}\\,dx=2e^{x}(x-1)$. Samen: $x^{2}e^{x}-2e^{x}(x-1)=e^{x}(x^{2}-2x+2)$.',
      'Schrijf het antwoord op: $F(x)=e^{x}(x^{2}-2x+2)+c$. Controle: differentieer $F$ en je krijgt $x^{2}e^{x}$ terug.',
    ],
    fout: 'Na één keer stoppen laat de integraal van $2xe^{x}$ staan. Die moet ook nog geprimitiveerd worden.',
    blok: 'k2b',
    cluster: 'k2b_kwadraat_e',
    theorie: '/theorie/partieel-integreren',
    verwant: ['x-e-tot-x', 'e-tot-x-maal-sin-x'],
  },
  {
    slug: 'x-over-x-kwadraat-plus-1',
    kop: 'De primitieve van x/(x²+1)',
    titel: 'Primitieve van x/(x²+1)',
    omschrijving:
      'De primitieve van x/(x²+1) is ½ln(x²+1) + c. De teller is bijna de afgeleide van de noemer.',
    vraagLatex: '\\int \\frac{x}{x^2+1}\\,dx',
    antwoordLatex: '\\frac{1}{2}\\ln(x^2+1)+c',
    integrand: 'x/(x^2+1)',
    primitieve: 'ln(x^2+1)/2',
    stappen: [
      'Alleen deel 2 speelt hier. Herken een breuk waarvan de teller bij de afgeleide van de noemer hoort.',
      'Noem de kern $g(x)=x^{2}+1$. Dan is $g\'(x)=2x$. In de teller staat $x$, dus de helft van $g\'(x)$.',
      'De primitieve van $g\'/g$ is $\\ln|g|$. Hier staat $\\dfrac{1}{2}\\cdot\\dfrac{g\'}{g}$, dus $\\dfrac{1}{2}\\ln(x^{2}+1)$. De haakjes zijn altijd positief, de absolute waarde mag weg.',
      'Schrijf het antwoord op: $F(x)=\\dfrac{1}{2}\\ln(x^{2}+1)+c$. Controle: differentieer $F$ en je krijgt $\\dfrac{x}{x^{2}+1}$ terug.',
    ],
    fout: 'Dit is geen arctan. Arctan hoort bij teller $1$ en noemer $x^{2}+1$. Door de $x$ in de teller wordt het een logaritme.',
    blok: 'k1a',
    cluster: 'k1a_wortel_breuk',
    theorie: '/theorie/substitutiemethode',
    verwant: ['1-over-x-kwadraat-plus-1', 'x-maal-macht'],
  },
  {
    slug: 'x-maal-macht',
    kop: 'De primitieve van 4x(x²+3)²',
    titel: 'Primitieve van 4x(x²+3)²',
    omschrijving:
      'De primitieve van 4x(x²+3)² is ⅔(x²+3)³ + c. De factor 4x hoort bij de afgeleide van de kern x²+3.',
    vraagLatex: '\\int 4x(x^2+3)^2\\,dx',
    antwoordLatex: '\\frac{2}{3}(x^2+3)^3+c',
    integrand: '4*x*(x^2+3)^2',
    primitieve: '(2/3)*(x^2+3)^3',
    stappen: [
      'Alleen deel 2 speelt hier. Een macht van een kern, met de afgeleide van die kern ernaast.',
      'De kern is $g(x)=x^{2}+3$, dus $g\'(x)=2x$. Er staat $4x=2\\cdot 2x$, dus twee keer $g\'(x)$, maal $g(x)^{2}$.',
      'De primitieve van $g\'\\cdot g^{2}$ is $\\dfrac{1}{3}g^{3}$. Met de extra factor $2$ wordt dat $\\dfrac{2}{3}(x^{2}+3)^{3}$.',
      'Schrijf het antwoord op: $F(x)=\\dfrac{2}{3}(x^{2}+3)^{3}+c$. Controle: differentieer $F$ en je krijgt $4x(x^{2}+3)^{2}$ terug.',
    ],
    fout: 'De haakjes niet eerst uitwerken als dat niet hoeft. En de macht wordt $3$, niet $2$: je telt er één bij op.',
    blok: 'k1a',
    cluster: 'k1a_macht_kern',
    theorie: '/theorie/substitutiemethode',
    verwant: ['x-over-x-kwadraat-plus-1', 'x-kwadraat'],
  },
  {
    slug: 'integraal-1-over-x',
    kop: 'De integraal van 1/x van 1 tot e',
    titel: 'Integraal van 1/x van 1 tot e',
    omschrijving:
      'De integraal van 1/x van 1 tot e is exact 1. Eerst de primitieve ln|x|, daarna de grenzen invullen.',
    vraagLatex: '\\int_{1}^{e} \\frac{1}{x}\\,dx',
    antwoordLatex: '1',
    integrand: '1/x',
    primitieve: 'ln(abs(x))',
    domein: [0.5, 3],
    grenzen: [1, Math.E],
    waarde: 1,
    stappen: [
      'Dit blijft deel 2: eerst primitiveren, daarna de grenzen invullen. Het antwoord blijft exact.',
      'De primitieve van $1/x$ is $\\ln|x|$. De integratieconstante laat je weg: die valt bij het aftrekken weg.',
      'Op $[1,e]$ is $x$ positief, dus $\\big[\\ln(x)\\big]_{1}^{e}=\\ln(e)-\\ln(1)$.',
      '$\\ln(e)=1$ en $\\ln(1)=0$, dus de uitkomst is $1$.',
    ],
    fout: 'De grenzen niet in $1/x$ zelf invullen. Eerst de primitieve, en pas daarna $x=e$ en $x=1$.',
    blok: 'k0b',
    cluster: 'k0b_bepaald_exact',
    theorie: '/theorie/primitieve',
    verwant: ['1-over-x', 'ln-x'],
  },
  {
    slug: 'cos-kwadraat',
    kop: 'De primitieve van cos²(x)',
    titel: 'Primitieve van cos²(x)',
    omschrijving:
      'De primitieve van cos²(x) is x/2 + sin(2x)/4 + c. Eerst de formule voor cos², daarna een lineaire kern.',
    vraagLatex: '\\int \\cos^2(x)\\,dx',
    antwoordLatex: '\\frac{1}{2}x+\\frac{1}{4}\\sin(2x)+c',
    integrand: 'cos(x)^2',
    primitieve: 'x/2 + sin(2*x)/4',
    stappen: [
      'Alleen deel 2 speelt hier. Gebruik $\\cos^2(x)=\\dfrac{1+\\cos(2x)}{2}$.',
      'Herschrijf: $f(x)=\\dfrac{1}{2}+\\dfrac{1}{2}\\cos(2x)$.',
      '$\\dfrac{1}{2}$ geeft $\\dfrac{1}{2}x$. De primitieve van $\\cos(2x)$ is $\\dfrac{1}{2}\\sin(2x)$, en met de factor $\\dfrac{1}{2}$ wordt dat $\\dfrac{1}{4}\\sin(2x)$.',
      'Schrijf het antwoord op: $F(x)=\\dfrac{1}{2}x+\\dfrac{1}{4}\\sin(2x)+c$. Controle: differentieer $F$ en je krijgt $\\cos^2(x)$ terug.',
    ],
    fout: 'Het teken voor $\\sin(2x)$ is hier plus, niet min. Het minteken hoort bij $\\sin^2(x)$, omdat daar $1-\\cos(2x)$ staat.',
    blok: 'k0b',
    cluster: 'k0b_lin_e_gonio',
    theorie: '/theorie/primitieve',
    verwant: ['sin-kwadraat', 'cos-x'],
  },
  {
    slug: 'x-ln-x',
    kop: 'De primitieve van x·ln(x)',
    titel: 'Primitieve van x ln(x)',
    omschrijving:
      'De primitieve van x·ln(x) is ½x² ln(x) − ¼x² + c. Uitwerking met partieel integreren.',
    vraagLatex: '\\int x\\ln(x)\\,dx',
    antwoordLatex: '\\frac{1}{2}x^{2}\\ln(x)-\\frac{1}{4}x^{2}+c',
    integrand: 'x * ln(x)',
    primitieve: '(1/2)*x^2*ln(x) - (1/4)*x^2',
    domein: [0.2, 3],
    stappen: [
      'Alleen deel 2 speelt hier. Een product met een logaritme: partieel integreren. De logaritme wordt $g$, want die wordt eenvoudiger als je differentieert.',
      'Kies $g(x)=\\ln(x)$ en $h\'(x)=x$. Dan is $g\'(x)=1/x$ en $h(x)=\\dfrac{1}{2}x^{2}$.',
      '$g\\cdot h-\\int h\\cdot g\'\\,dx=\\dfrac{1}{2}x^{2}\\ln(x)-\\int \\dfrac{1}{2}x^{2}\\cdot\\dfrac{1}{x}\\,dx=\\dfrac{1}{2}x^{2}\\ln(x)-\\int \\dfrac{1}{2}x\\,dx=\\dfrac{1}{2}x^{2}\\ln(x)-\\dfrac{1}{4}x^{2}$.',
      'Schrijf het antwoord op: $F(x)=\\dfrac{1}{2}x^{2}\\ln(x)-\\dfrac{1}{4}x^{2}+c$. Controle: differentieer $F$ en je krijgt $x\\ln(x)$ terug.',
    ],
    fout: 'De $\\dfrac{1}{4}x^{2}$ niet vergeten. Zonder dat stuk houdt het differentiëren een extra $\\dfrac{1}{2}x$ over.',
    blok: 'k2a',
    cluster: 'k2a_ln',
    theorie: '/theorie/partieel-integreren',
    verwant: ['ln-x', 'x-e-tot-x'],
  },
  {
    slug: 'e-tot-x-maal-sin-x',
    kop: 'De primitieve van e^x·sin(x)',
    titel: 'Primitieve van e^x sin(x)',
    omschrijving:
      'De primitieve van e^x·sin(x) is ½e^x(sin(x) − cos(x)) + c. Twee keer partieel integreren, daarna de integraal terugbrengen.',
    vraagLatex: '\\int e^{x}\\sin(x)\\,dx',
    antwoordLatex: '\\frac{1}{2}e^{x}\\big(\\sin(x)-\\cos(x)\\big)+c',
    integrand: 'e^x * sin(x)',
    primitieve: '0.5 * e^x * (sin(x) - cos(x))',
    stappen: [
      'Alleen deel 2 speelt hier. Een e-macht maal een sinus: twee keer partieel integreren. Dezelfde integraal komt dan terug en schuif je naar links.',
      'Kies $g(x)=\\sin(x)$ en $h\'(x)=e^{x}$. Dan is $g\'(x)=\\cos(x)$ en $h(x)=e^{x}$. Eerste stap: $e^{x}\\sin(x)-\\int e^{x}\\cos(x)\\,dx$.',
      'Nog een keer, nu op $e^{x}\\cos(x)$ met $g(x)=\\cos(x)$: dat wordt $e^{x}\\cos(x)+\\int e^{x}\\sin(x)\\,dx$. Samen staat er $e^{x}\\sin(x)-e^{x}\\cos(x)-\\int e^{x}\\sin(x)\\,dx$.',
      'Noem de gezochte primitieve $F$, zonder $+c$. Dan is $F=e^{x}(\\sin(x)-\\cos(x))-F$, dus $2F=e^{x}(\\sin(x)-\\cos(x))$. Dus $F(x)=\\dfrac{1}{2}e^{x}(\\sin(x)-\\cos(x))+c$.',
    ],
    fout: 'Na twee stappen de integraal niet aan de andere kant zetten. Hij staat er nog een keer in, en daarom deel je aan het eind door $2$.',
    blok: 'k2b',
    cluster: 'k2b_terugkomen',
    theorie: '/theorie/partieel-integreren',
    verwant: ['x-e-tot-x', 'sin-x'],
  },
  {
    slug: '1-over-x-kwadraat-plus-4',
    kop: 'De primitieve van 1/(x²+4)',
    titel: 'Primitieve van 1/(x²+4)',
    omschrijving:
      'De primitieve van 1/(x²+4) is ½arctan(x/2) + c. Schrijf de noemer eerst als iets met +1.',
    vraagLatex: '\\int \\frac{1}{x^2+4}\\,dx',
    antwoordLatex: '\\frac{1}{2}\\arctan\\!\\left(\\frac{x}{2}\\right)+c',
    integrand: '1/(x^2+4)',
    primitieve: 'atan(x/2)/2',
    stappen: [
      'Alleen deel 2 speelt hier. De noemer is een kwadraat plus een getal, dus het wordt arctan. Eerst herschrijven tot $+1$.',
      '$x^{2}+4=4\\left(\\left(\\dfrac{x}{2}\\right)^{2}+1\\right)$, dus $\\dfrac{1}{x^{2}+4}=\\dfrac{1}{4}\\cdot\\dfrac{1}{(x/2)^{2}+1}$.',
      'De primitieve van $\\dfrac{1}{t^{2}+1}$ is $\\arctan(t)$, met $t=x/2$. De keten geeft nog een factor $\\dfrac{1}{2}$ in de afgeleide, en die deel je weg: $\\dfrac{1}{4}\\cdot 2\\arctan\\!\\left(\\dfrac{x}{2}\\right)=\\dfrac{1}{2}\\arctan\\!\\left(\\dfrac{x}{2}\\right)$.',
      'Schrijf het antwoord op: $F(x)=\\dfrac{1}{2}\\arctan\\!\\left(\\dfrac{x}{2}\\right)+c$. Controle: differentieer $F$ en je krijgt $\\dfrac{1}{x^{2}+4}$ terug.',
    ],
    fout: 'Niet $\\arctan(x^{2}+4)$ opschrijven, en ook niet $\\arctan(x)$ zonder de $4$ te verwerken. De $4$ wordt een factor $\\dfrac{1}{2}$ en een kern $x/2$.',
    blok: 'k3b',
    cluster: 'k3b_herschrijven',
    theorie: '/theorie/k3',
    verwant: ['1-over-x-kwadraat-plus-1', '1-over-x-kwadraat'],
  },
  {
    slug: 'wortel-2x-plus-1',
    kop: 'De primitieve van √(2x+1)',
    titel: 'Primitieve van √(2x+1)',
    omschrijving:
      'De primitieve van √(2x+1) is ⅓(2x+1)√(2x+1) + c. Wortel als macht, daarna delen door de 2 uit de kern.',
    vraagLatex: '\\int \\sqrt{2x+1}\\,dx',
    antwoordLatex: '\\frac{1}{3}(2x+1)\\sqrt{2x+1}+c',
    integrand: 'sqrt(2*x+1)',
    primitieve: '(1/3)*(2*x+1)^(3/2)',
    domein: [0, 3],
    stappen: [
      'Alleen deel 2 speelt hier. Een wortel van een lineaire kern.',
      'Schrijf $\\sqrt{2x+1}=(2x+1)^{1/2}$. De kern is $2x+1$, dus $a=2$.',
      'Primitiveer de macht: $\\dfrac{1}{3/2}(2x+1)^{3/2}=\\dfrac{2}{3}(2x+1)^{3/2}$.',
      'Deel door $a=2$: $F(x)=\\dfrac{1}{3}(2x+1)^{3/2}+c$, en dat is $\\dfrac{1}{3}(2x+1)\\sqrt{2x+1}+c$. Controle: de kettingregel geeft de factor $2$ terug.',
    ],
    fout: 'Alleen $\\dfrac{2}{3}(2x+1)^{3/2}$ vergeet de deling door $a=2$. Differentiëren geeft dan twee keer $\\sqrt{2x+1}$.',
    blok: 'k0b',
    cluster: 'k0b_lin_breuk_wortel',
    theorie: '/theorie/primitieve',
    verwant: ['wortel-x', '1-over-2x-plus-1'],
  },
]
