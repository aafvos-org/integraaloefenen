/**
 * "De methode": het vaste stappenplan als ruggengraat van de theoriepagina.
 *
 *   Stap 0 · herken de buitenste schil, kies de regel
 *   Stap 1 · stel de onderdelen vast (g en h, of buitenkant en kern)
 *   Stap 2 · bereken hun afgeleides (een geneste regel begint hier opnieuw bij stap 1)
 *   Stap 3 · vul de formule in
 *
 * Letters: overal f, g en h, net als in het boek. Een genest deel noemen we
 * "even f" en krijgt zijn eigen g en h. De kettingregel gebruikt geen letters
 * maar "buitenkant" en "kern".
 *
 * Gebruikt door /theorie (de methode) en /theorie/[hoofdstuk] (de toepassing).
 */

export type RegelId = 'machtsregel' | 'somregel' | 'productregel' | 'quotientregel' | 'kettingregel'

export type Regel = {
  id: RegelId
  title: string
  /** Hoofdstuk waarin de regel wordt geïntroduceerd, bv. "H2" */
  chapter: string
  /** Eén regel herkenning, onder het hokje in het schema (mag `$...$` bevatten) */
  kort: string
  /** Uitgebreide herkenning voor stap 0 */
  herken: string
  /** Regelkaart (LaTeX, display mode) */
  formule: string
  /** Compacte versie zonder (x), voor in het regelhokje; twee regels gescheiden door \\implies */
  formuleKort: string
  stap1: string
  stap2: string
  stap3: string
  /** Afspraak over de vorm van het antwoord */
  antwoord: string
}

export const REGELS: Regel[] = [
  {
    id: 'machtsregel',
    title: 'Machtsregel',
    chapter: 'H2',
    kort: 'één term $a \\cdot x^n$',
    herken:
      'Eén term $a \\cdot x^n$, of een los getal. Er is geen teken dat delen van elkaar scheidt. Dit is de regel waar alle andere regels uiteindelijk op uitkomen.',
    formule: "f(x) = ax^n \\implies f'(x) = n \\cdot ax^{n-1}",
    formuleKort: "f = ax^n \\implies f' = n \\cdot ax^{n-1}",
    stap1: 'Lees $a$ en $n$ af.',
    stap2: "Vul meteen in: $f'(x) = n \\cdot a \\cdot x^{n-1}$. Exponent naar voren, exponent één lager; een los getal wordt $0$.",
    stap3: '',
    antwoord:
      'Breuken en decimalen blijven zoals in de opgave: $0{,}6x^3$ geeft $1{,}8x^2$, $\\tfrac{1}{3}x^6$ geeft $2x^5$.',
  },
  {
    id: 'somregel',
    title: 'Somregel',
    chapter: 'H2',
    kort: '$+$ of $-$ tussen delen',
    herken:
      'Een $+$ of $-$ tussen delen. Dat is de buitenste schil, ook als de delen losse termen $ax^n$ zijn: dan krijgt elk deel daarbinnen de machtsregel. Is een deel een product, breuk of macht van haakjes, dan krijgt dat deel zijn eigen regel.',
    formule: "f(x) = g(x) + h(x) \\implies f'(x) = g'(x) + h'(x)",
    formuleKort: "f = g + h \\implies f' = g' + h'",
    stap1: 'Kies de delen links en rechts van de tekens: $g$ en $h$. Bij meer delen: elk deel apart.',
    stap2:
      "Bereken van elk deel de afgeleide met zijn eigen regel, meestal de machtsregel. Vraagt een deel een andere regel, dan noem je dat deel even $f$ en begin je ervoor opnieuw bij stap 1.",
    stap3: "Voeg samen: $f'(x) = g'(x) + h'(x)$, met de tekens zoals ze in de opgave stonden.",
    antwoord: 'De afgeleides van de delen achter elkaar, elk in de vorm die bij zijn eigen regel hoort.',
  },
  {
    id: 'productregel',
    title: 'Productregel',
    chapter: 'H2',
    kort: 'twee factoren met $\\cdot$ ertussen',
    herken:
      'Twee factoren met een $\\cdot$ ertussen: twee haakjesgroepen, of $x$ maal haakjes. Ook een kwadraat van een polynoom, als $g \\cdot g$. Twee lineaire factoren werk je meestal sneller uit.',
    formule: "f(x) = g(x) \\cdot h(x) \\implies f'(x) = g'(x) \\cdot h(x) + g(x) \\cdot h'(x)",
    formuleKort: "f = g \\cdot h \\implies f' = g' \\cdot h + g \\cdot h'",
    stap1: 'Kies $g$ en $h$: de linker en de rechter factor.',
    stap2: "Bereken $g'$ en $h'$.",
    stap3: "Vul in: $f'(x) = g'(x) \\cdot h(x) + g(x) \\cdot h'(x)$.",
    antwoord: 'Laat de haakjes staan; uitwerken hoeft niet.',
  },
  {
    id: 'quotientregel',
    title: 'Quotiëntregel',
    chapter: 'H2',
    kort: 'breukstreep met $x$ in de noemer',
    herken:
      'Een breukstreep met $x$ in de noemer. Staat er in de noemer maar één term ($x^n$), dan deel je liever uit en is het de machtsregel.',
    formule: "f(x) = \\dfrac{g(x)}{h(x)} \\implies f'(x) = \\dfrac{g'(x) \\cdot h(x) - g(x) \\cdot h'(x)}{\\bigl(h(x)\\bigr)^2}",
    formuleKort: "f = \\dfrac{g}{h} \\implies f' = \\dfrac{g' \\cdot h - g \\cdot h'}{h^2}",
    stap1: '$g$ is de teller, $h$ de noemer.',
    stap2: "Bereken $g'$ en $h'$.",
    stap3: "Vul in: $f'(x) = \\dfrac{g'(x) \\cdot h(x) - g(x) \\cdot h'(x)}{(h(x))^2}$. Let op de min.",
    antwoord: 'Teller uitwerken en herleiden; de noemer laat je staan als $(\\ldots)^2$.',
  },
  {
    id: 'kettingregel',
    title: 'Kettingregel',
    chapter: 'H6',
    kort: 'een expressie ín een macht of wortel',
    herken:
      'Een expressie ín een macht of wortel: haakjes tot een macht, een wortel van een expressie, of een getal gedeeld door een expressie tot een macht. Staat er alleen $x$ in de macht of wortel, dan is het de machtsregel.',
    formule: "f(x) = \\text{buitenkant}(\\text{kern}) \\implies f'(x) = \\text{buitenkant}'(\\text{kern}) \\cdot \\text{kern}'",
    formuleKort: "f = \\text{buitenkant}(\\text{kern}) \\implies f' = \\text{buitenkant}'(\\text{kern}) \\cdot \\text{kern}'",
    stap1: 'Benoem de buitenkant ($(\\ldots)^n$, $\\sqrt{\\ldots}$) en de kern (wat erin staat).',
    stap2: 'Afgeleide van de buitenkant mét de kern erin, en afgeleide van de kern.',
    stap3: 'Vermenigvuldig die twee.',
    antwoord: 'Getallen uitvermenigvuldigen: $12(4x+3)^2$. Wortels en negatieve machten schrijf je terug: $\\dfrac{2}{\\sqrt{4x+1}}$.',
  },
]

/** Eén onderdeel in stap 1 of stap 2: `naam = waarde` (beide LaTeX). */
export type Deel = {
  naam: string
  waarde: string
  /** Bij een omschrijving in `waarde`: de regel die je daarbij gebruikt (LaTeX), komt eronder te staan */
  omschrijving?: string
  /** Alleen bij afgeleides: hoe je aan deze afgeleide komt (eigen mini-schema, opent na een klik) */
  hoe?: Genest
}

/**
 * Uitwerking van een voorbeeld in stap 1 t/m 3.
 * In `ingevuld` verwijzen `{d1}`, `{d2}`, … naar de delen uit stap 1 en
 * `{a1}`, `{a2}`, … naar de afgeleides uit stap 2; die worden in het schema
 * in de kleur van hun stap ingevuld.
 */
export type Uitwerking = {
  /**
   * De functie zoals hij in stap 1 herhaald wordt, met de delen gemarkeerd:
   * `{1:…}` krijgt de kleur van het eerste deel, `{2:…}` van het tweede, enz.
   * Ontbreekt dit, dan wordt de functie zonder markering herhaald.
   */
  functie?: string
  /** Stap 1 */
  delen: Deel[]
  noot1?: string
  /** Stap 2 (leeg bij de machtsregel: die vult meteen in na stap 1) */
  afgeleiden: Deel[]
  noot2?: string
  /** Stap 3: de regel symbolisch, bv. "f'(x) = g'(x) \\cdot h(x) + g(x) \\cdot h'(x)" */
  formule?: string
  /** Stap 3: ingevuld met {d…} en {a…} */
  ingevuld: string
  /** Stap 3: herleid resultaat (LaTeX, zonder f'(x) =) */
  herleid?: string
  noot3?: string
}

/** Een genest deel: begint opnieuw bij stap 1 met zijn eigen g en h (of buitenkant en kern). */
export type Genest = {
  regel: RegelId
  /** Extra kopje, bv. "noem dit deel even $f$" (optioneel) */
  label?: string
  uitwerking: Uitwerking
}

export type Voorbeeld = {
  /** Hoofdstuk waar het voorbeeld bij hoort, bv. "H2" */
  chapter: string
  regel: RegelId
  /** Korte naam op de keuzeknop, bv. "haakjes eerst" (optioneel) */
  label?: string
  /** LaTeX, met f(x) = */
  problem: string
  /** LaTeX, met f'(x) = */
  answer: string
  /** Stap 0: wat je ziet in de buitenste schil (bron voor toelichting; wordt in het schema niet getoond) */
  stap0: string
  uitwerking: Uitwerking
}

const G = 'g(x)'
const H = 'h(x)'
const DG = "g'(x)"
const DH = "h'(x)"
const BUITEN = '\\text{buitenkant}'
const KERN = '\\text{kern}'
const DBUITEN = "\\text{buitenkant}'(\\text{kern})"
const DKERN = "\\text{kern}'"
const PRODUCT = "f'(x) = g'(x) \\cdot h(x) + g(x) \\cdot h'(x)"
const QUOTIENT = "f'(x) = \\dfrac{g'(x) \\cdot h(x) - g(x) \\cdot h'(x)}{(h(x))^2}"
const SOM = "f'(x) = g'(x) + h'(x)"
const KETTING = "f'(x) = \\text{buitenkant}'(\\text{kern}) \\cdot \\text{kern}'"
const MACHT = "f'(x) = n \\cdot a \\cdot x^{n-1}"

/** Uitwerking van één term $a x^n$ met de machtsregel, voor een vraagteken achter een afgeleide. */
function macht(letter: string, a: string, n: string, herleid: string, functie?: string): Genest {
  return {
    regel: 'machtsregel',
    uitwerking: {
      functie,
      delen: [
        { naam: 'a', waarde: a },
        { naam: 'n', waarde: n },
      ],
      afgeleiden: [],
      formule: MACHT,
      ingevuld: `${letter}'(x) = {d2} \\cdot {d1} \\cdot x^{{d2} - 1}`,
      herleid,
    },
  }
}

/** Uitwerking van een som van twee termen met de somregel, elk met de machtsregel erachter. */
function somTwee(
  functie: string,
  g: { waarde: string; a: string; n: string; afg: string },
  h: { waarde: string; a: string; n: string; afg: string },
  herleid: string,
): Genest {
  return {
    regel: 'somregel',
    uitwerking: {
      functie,
      delen: [
        { naam: G, waarde: g.waarde },
        { naam: H, waarde: h.waarde },
      ],
      afgeleiden: [
        { naam: DG, waarde: g.afg, hoe: macht('g', g.a, g.n, g.afg) },
        { naam: DH, waarde: h.afg, hoe: macht('h', h.a, h.n, h.afg) },
      ],
      formule: SOM,
      ingevuld: "f'(x) = {a1} + ({a2})",
      herleid,
    },
  }
}

export const VOORBEELDEN: Voorbeeld[] = [
  // ── H2 ────────────────────────────────────────────────────────────────────
  {
    chapter: 'H2',
    regel: 'machtsregel',
    problem: 'f(x) = 3x^{4}',
    answer: "f'(x) = 12x^{3}",
    stap0: 'Eén term $a \\cdot x^n$: er is geen teken dat delen scheidt.',
    uitwerking: {
      functie: 'f(x) = {1:3}x^{{2:4}}',
      delen: [
        { naam: 'a', waarde: '3' },
        { naam: 'n', waarde: '4' },
      ],
      afgeleiden: [],
      formule: "f'(x) = n \\cdot a \\cdot x^{n-1}",
      ingevuld: "f'(x) = {d2} \\cdot {d1} \\cdot x^{{d2} - 1}",
      herleid: '12x^3',
    },
  },
  {
    chapter: 'H2',
    regel: 'somregel',
    label: 'losse termen',
    problem: 'f(x) = 0{,}6x^{3} - 1{,}3x^{2} + 7',
    answer: "f'(x) = 1{,}8x^{2} - 2{,}6x",
    stap0: 'De buitenste schil is het $-$ en het $+$ tussen de termen.',
    uitwerking: {
      functie: 'f(x) = {1:0{,}6x^{3}} \\; {2:-\\,1{,}3x^{2}} \\; + \\; {3:7}',
      delen: [
        { naam: G, waarde: '0{,}6x^3' },
        { naam: H, waarde: '-1{,}3x^2' },
        { naam: 'k(x)', waarde: '7' },
      ],
      afgeleiden: [
        {
          naam: DG,
          waarde: '1{,}8x^2',
          hoe: {
            regel: 'machtsregel',
            uitwerking: {
              delen: [{ naam: 'a', waarde: '0{,}6' }, { naam: 'n', waarde: '3' }],
              afgeleiden: [],
              formule: MACHT,
              ingevuld: "g'(x) = {d2} \\cdot {d1} \\cdot x^{{d2} - 1}",
              herleid: '1{,}8x^2',
            },
          },
        },
        {
          naam: DH,
          waarde: '-2{,}6x',
          hoe: {
            regel: 'machtsregel',
            uitwerking: {
              delen: [{ naam: 'a', waarde: '-1{,}3' }, { naam: 'n', waarde: '2' }],
              afgeleiden: [],
              formule: MACHT,
              ingevuld: "h'(x) = {d2} \\cdot ({d1}) \\cdot x^{{d2} - 1}",
              herleid: '-2{,}6x',
            },
          },
        },
        {
          naam: "k'(x)",
          waarde: '0',
          hoe: {
            regel: 'machtsregel',
            uitwerking: {
              delen: [{ naam: 'a', waarde: '7' }, { naam: 'n', waarde: '0' }],
              afgeleiden: [],
              formule: MACHT,
              ingevuld: "k'(x) = {d2} \\cdot {d1} \\cdot x^{{d2} - 1}",
              herleid: '0',
            },
          },
        },
      ],
      formule: "f'(x) = g'(x) + h'(x) + k'(x)",
      ingevuld: "f'(x) = {a1} + ({a2}) + {a3}",
      herleid: '1{,}8x^2 - 2{,}6x',
    },
  },
  {
    chapter: 'H2',
    regel: 'somregel',
    label: 'haakjes eerst',
    problem: 'f(x) = 5(x - 3)^{2} + 5(2x - 1)',
    answer: "f'(x) = 10x - 20",
    stap0: 'De buitenste schil is het $+$ tussen twee delen met haakjes.',
    uitwerking: {
      functie: 'f(x) = {1:5(x - 3)^{2}} + {2:5(2x - 1)}',
      delen: [
        { naam: G, waarde: '5(x - 3)^2 = 5x^2 - 30x + 45', omschrijving: '(a - b)^2 = a^2 - 2ab + b^2' },
        { naam: H, waarde: '5(2x - 1) = 10x - 5', omschrijving: 'a(b + c) = ab + ac' },
      ],
      afgeleiden: [
        {
          naam: DG,
          waarde: '10x - 30',
          hoe: {
            regel: 'somregel',
            label: 'noem dit deel even $f$',
            uitwerking: {
              functie: 'g(x) = {1:5x^{2}} \\; {2:-\\,30x} \\; + \\; {3:45}',
              delen: [
                { naam: G, waarde: '5x^2' },
                { naam: H, waarde: '-30x' },
                { naam: 'k(x)', waarde: '45' },
              ],
              afgeleiden: [
                { naam: DG, waarde: '10x', hoe: macht('g', '5', '2', '10x') },
                { naam: DH, waarde: '-30', hoe: macht('h', '-30', '1', '-30') },
                { naam: "k'(x)", waarde: '0', hoe: macht('k', '45', '0', '0') },
              ],
              formule: "f'(x) = g'(x) + h'(x) + k'(x)",
              ingevuld: "f'(x) = {a1} + ({a2}) + {a3}",
              herleid: '10x - 30',
            },
          },
        },
        {
          naam: DH,
          waarde: '10',
          hoe: {
            regel: 'somregel',
            label: 'noem dit deel even $f$',
            uitwerking: {
              functie: 'h(x) = {1:10x} \\; {2:-\\,5}',
              delen: [
                { naam: G, waarde: '10x' },
                { naam: H, waarde: '-5' },
              ],
              afgeleiden: [
                { naam: DG, waarde: '10', hoe: macht('g', '10', '1', '10') },
                { naam: DH, waarde: '0', hoe: macht('h', '-5', '0', '0') },
              ],
              formule: SOM,
              ingevuld: "f'(x) = {a1} + {a2}",
              herleid: '10',
            },
          },
        },
      ],
      formule: SOM,
      ingevuld: "f'(x) = {a1} + {a2}",
      herleid: '10x - 20',
    },
  },
  {
    chapter: 'H2',
    regel: 'somregel',
    problem: 'f(x) = 5 - 3(x^{4} - x)(x + 1)',
    answer: "f'(x) = -(12x^{3} - 3)(x + 1) - (3x^{4} - 3x)",
    stap0: 'De buitenste schil is het $-$ tussen $5$ en het product.',
    uitwerking: {
      functie: 'f(x) = {1:5} - {2:3(x^{4} - x)(x + 1)}',
      delen: [
        { naam: G, waarde: '5' },
        { naam: H, waarde: '3(x^4 - x)(x + 1) = (3x^4 - 3x)(x + 1)', omschrijving: 'c \\cdot (a)(b) = (c \\cdot a)(b)' },
      ],
      afgeleiden: [
        { naam: DG, waarde: '0' },
        {
          naam: DH,
          waarde: '(12x^3 - 3)(x + 1) + (3x^4 - 3x)',
          hoe: {
            regel: 'productregel',
            label: 'noem dit deel even $f$',
            uitwerking: {
              functie: 'h(x) = {1:(3x^{4} - 3x)}{2:(x + 1)}',
              delen: [
                { naam: G, waarde: '3x^4 - 3x' },
                { naam: H, waarde: 'x + 1' },
              ],
              afgeleiden: [
                {
                  naam: DG,
                  waarde: '12x^3 - 3',
                  hoe: somTwee('g(x) = {1:3x^{4}} \\; {2:-\\,3x}', { waarde: '3x^4', a: '3', n: '4', afg: '12x^3' }, { waarde: '-3x', a: '-3', n: '1', afg: '-3' }, '12x^3 - 3'),
                },
                {
                  naam: DH,
                  waarde: '1',
                  hoe: somTwee('h(x) = {1:x} + {2:1}', { waarde: 'x', a: '1', n: '1', afg: '1' }, { waarde: '1', a: '1', n: '0', afg: '0' }, '1'),
                },
              ],
              formule: PRODUCT,
              ingevuld: "f'(x) = ({a1}) \\cdot ({d2}) + ({d1}) \\cdot {a2}",
              herleid: '(12x^3 - 3)(x + 1) + (3x^4 - 3x)',
            },
          },
        },
      ],
      formule: "f'(x) = g'(x) - h'(x)",
      ingevuld: "f'(x) = {a1} - \\bigl({a2}\\bigr)",
      herleid: '-(12x^3 - 3)(x + 1) - (3x^4 - 3x)',
    },
  },
  {
    chapter: 'H2',
    regel: 'somregel',
    label: 'met een breuk',
    problem: 'f(x) = x^{3} + \\dfrac{2x + 1}{x - 3}',
    answer: "f'(x) = 3x^{2} - \\dfrac{7}{(x - 3)^{2}}",
    stap0: 'De buitenste schil is het $+$ tussen $x^3$ en de breuk.',
    uitwerking: {
      functie: 'f(x) = {1:x^{3}} + {2:\\dfrac{2x + 1}{x - 3}}',
      delen: [
        { naam: G, waarde: 'x^3' },
        { naam: H, waarde: '\\dfrac{2x + 1}{x - 3}' },
      ],
      afgeleiden: [
        { naam: DG, waarde: '3x^2' },
        {
          naam: DH,
          waarde: '\\dfrac{-7}{(x - 3)^2}',
          hoe: {
            regel: 'quotientregel',
            label: 'noem dit deel even $f$',
            uitwerking: {
              functie: 'h(x) = \\dfrac{{1:2x + 1}}{{2:x - 3}}',
              delen: [
                { naam: G + '\\ \\text{(teller)}', waarde: '2x + 1' },
                { naam: H + '\\ \\text{(noemer)}', waarde: 'x - 3' },
              ],
              afgeleiden: [
                {
                  naam: DG,
                  waarde: '2',
                  hoe: somTwee('g(x) = {1:2x} + {2:1}', { waarde: '2x', a: '2', n: '1', afg: '2' }, { waarde: '1', a: '1', n: '0', afg: '0' }, '2'),
                },
                {
                  naam: DH,
                  waarde: '1',
                  hoe: somTwee('h(x) = {1:x} \\; {2:-\\,3}', { waarde: 'x', a: '1', n: '1', afg: '1' }, { waarde: '-3', a: '-3', n: '0', afg: '0' }, '1'),
                },
              ],
              formule: QUOTIENT,
              ingevuld: "f'(x) = \\dfrac{{a1} \\cdot ({d2}) - ({d1}) \\cdot {a2}}{({d2})^2}",
              herleid: '\\dfrac{2x - 6 - 2x - 1}{(x - 3)^2} = \\dfrac{-7}{(x - 3)^2}',
            },
          },
        },
      ],
      formule: SOM,
      ingevuld: "f'(x) = {a1} + {a2}",
      herleid: '3x^2 - \\dfrac{7}{(x - 3)^2}',
    },
  },
  {
    chapter: 'H2',
    regel: 'productregel',
    problem: 'f(x) = (x^{2} - 4)(x^{3} + 2x + 3)',
    answer: "f'(x) = 2x(x^{3} + 2x + 3) + (x^{2} - 4)(3x^{2} + 2)",
    stap0: 'Twee haakjesgroepen met een $\\cdot$ ertussen.',
    uitwerking: {
      functie: 'f(x) = {1:(x^{2} - 4)}{2:(x^{3} + 2x + 3)}',
      delen: [
        { naam: G, waarde: 'x^2 - 4' },
        { naam: H, waarde: 'x^3 + 2x + 3' },
      ],
      afgeleiden: [
        { naam: DG, waarde: '2x', hoe: somTwee('g(x) = {1:x^{2}} \\; {2:-\\,4}', { waarde: 'x^2', a: '1', n: '2', afg: '2x' }, { waarde: '-4', a: '-4', n: '0', afg: '0' }, '2x') },
        {
          naam: DH,
          waarde: '3x^2 + 2',
          hoe: {
            regel: 'somregel',
            uitwerking: {
              functie: 'h(x) = {1:x^{3}} + {2:2x} + {3:3}',
              delen: [
                { naam: G, waarde: 'x^3' },
                { naam: H, waarde: '2x' },
                { naam: 'k(x)', waarde: '3' },
              ],
              afgeleiden: [
                { naam: DG, waarde: '3x^2', hoe: macht('g', '1', '3', '3x^2') },
                { naam: DH, waarde: '2', hoe: macht('h', '2', '1', '2') },
                { naam: "k'(x)", waarde: '0', hoe: macht('k', '3', '0', '0') },
              ],
              formule: "f'(x) = g'(x) + h'(x) + k'(x)",
              ingevuld: "f'(x) = {a1} + {a2} + {a3}",
              herleid: '3x^2 + 2',
            },
          },
        },
      ],
      formule: PRODUCT,
      ingevuld: "f'(x) = {a1} \\cdot ({d2}) + ({d1}) \\cdot ({a2})",
    },
  },
  {
    chapter: 'H2',
    regel: 'quotientregel',
    problem: 'f(x) = \\dfrac{2x + 1}{3x - 1}',
    answer: "f'(x) = \\dfrac{-5}{(3x - 1)^{2}}",
    stap0: 'Een breukstreep met $x$ in de noemer.',
    uitwerking: {
      functie: 'f(x) = \\dfrac{{1:2x + 1}}{{2:3x - 1}}',
      delen: [
        { naam: G + '\\ \\text{(teller)}', waarde: '2x + 1' },
        { naam: H + '\\ \\text{(noemer)}', waarde: '3x - 1' },
      ],
      afgeleiden: [
        { naam: DG, waarde: '2', hoe: somTwee('g(x) = {1:2x} + {2:1}', { waarde: '2x', a: '2', n: '1', afg: '2' }, { waarde: '1', a: '1', n: '0', afg: '0' }, '2') },
        { naam: DH, waarde: '3', hoe: somTwee('h(x) = {1:3x} \\; {2:-\\,1}', { waarde: '3x', a: '3', n: '1', afg: '3' }, { waarde: '-1', a: '-1', n: '0', afg: '0' }, '3') },
      ],
      formule: QUOTIENT,
      ingevuld: "f'(x) = \\dfrac{{a1} \\cdot ({d2}) - ({d1}) \\cdot {a2}}{({d2})^2}",
      herleid: '\\dfrac{6x - 2 - 6x - 3}{(3x - 1)^2} = \\dfrac{-5}{(3x - 1)^2}',
    },
  },

  // ── H6 ────────────────────────────────────────────────────────────────────
  {
    chapter: 'H6',
    regel: 'machtsregel',
    label: 'herschrijven',
    problem: 'f(x) = x^{2} \\cdot \\sqrt{x}',
    answer: "f'(x) = 2{,}5x\\sqrt{x}",
    stap0: 'Eén term: onder de wortel staat alleen $x$, geen expressie. Alles is samen één macht van $x$.',
    uitwerking: {
      delen: [
        { naam: 'a', waarde: '1' },
        { naam: 'n', waarde: '\\tfrac{5}{2}', omschrijving: 'x^2 \\cdot \\sqrt{x} = x^2 \\cdot x^{1/2} = x^{2 + 1/2}' },
      ],
      afgeleiden: [],
      formule: "f'(x) = n \\cdot a \\cdot x^{n-1}",
      ingevuld: "f'(x) = {d2} \\cdot {d1} \\cdot x^{{d2} - 1}",
      herleid: '\\tfrac{5}{2}x^{3/2} = 2{,}5x\\sqrt{x}',
    },
  },
  {
    chapter: 'H6',
    regel: 'somregel',
    label: 'uitdelen',
    problem: 'f(x) = \\dfrac{2x - 1}{x^{3}}',
    answer: "f'(x) = -\\dfrac{4}{x^{3}} + \\dfrac{3}{x^{4}}",
    stap0: 'Een breuk met maar één term in de noemer: deel eerst uit. Dan staat er een $-$ tussen twee termen.',
    uitwerking: {
      functie: 'f(x) = \\dfrac{{1:2x} \\; {2:-\\,1}}{x^{3}}',
      delen: [
        { naam: G, waarde: '\\dfrac{2x}{x^3} = 2x^{-2}', omschrijving: '\\dfrac{x^a}{x^b} = x^{a - b}' },
        { naam: H, waarde: '-\\dfrac{1}{x^3} = -x^{-3}', omschrijving: '\\dfrac{1}{x^b} = x^{-b}' },
      ],
      afgeleiden: [
        { naam: DG, waarde: '-4x^{-3}' },
        { naam: DH, waarde: '3x^{-4}' },
      ],
      formule: SOM,
      ingevuld: "f'(x) = {a1} + {a2}",
      herleid: '-\\dfrac{4}{x^3} + \\dfrac{3}{x^4}',
    },
  },
  {
    chapter: 'H6',
    regel: 'kettingregel',
    problem: 'f(x) = (4x + 3)^{3}',
    answer: "f'(x) = 12(4x + 3)^{2}",
    stap0: 'Haakjes tot een macht: er staat een expressie ín de macht.',
    uitwerking: {
      functie: 'f(x) = {1:(\\,}{2:4x + 3}{1:\\,)^{3}}',
      delen: [
        { naam: BUITEN, waarde: '(\\ldots)^3' },
        { naam: KERN, waarde: '4x + 3' },
      ],
      afgeleiden: [
        { naam: DBUITEN, waarde: '3(4x + 3)^2' },
        { naam: DKERN, waarde: '4' },
      ],
      formule: KETTING,
      ingevuld: "f'(x) = {a1} \\cdot {a2}",
      herleid: '12(4x + 3)^2',
    },
  },
  {
    chapter: 'H6',
    regel: 'kettingregel',
    label: 'wortel',
    problem: 'f(x) = \\sqrt{x^{2} + 1}',
    answer: "f'(x) = \\dfrac{x}{\\sqrt{x^{2} + 1}}",
    stap0: 'Onder de wortel staat een expressie, niet alleen $x$.',
    uitwerking: {
      functie: 'f(x) = \\sqrt{{2:x^{2} + 1}}',
      delen: [
        { naam: BUITEN, waarde: '\\sqrt{\\ldots}' },
        { naam: KERN, waarde: 'x^2 + 1' },
      ],
      afgeleiden: [
        { naam: DBUITEN, waarde: '\\dfrac{1}{2\\sqrt{x^2 + 1}}' },
        { naam: DKERN, waarde: '2x' },
      ],
      formule: KETTING,
      ingevuld: "f'(x) = {a1} \\cdot {a2}",
      herleid: '\\dfrac{x}{\\sqrt{x^2 + 1}}',
    },
  },
  {
    chapter: 'H6',
    regel: 'productregel',
    label: 'met kettingregel',
    problem: 'f(x) = x\\sqrt{2x + 1}',
    answer: "f'(x) = \\sqrt{2x + 1} + \\dfrac{x}{\\sqrt{2x + 1}}",
    stap0: 'De buitenste schil is het $\\cdot$ tussen $x$ en de wortel: twee factoren.',
    uitwerking: {
      functie: 'f(x) = {1:x}{2:\\sqrt{2x + 1}}',
      delen: [
        { naam: G, waarde: 'x' },
        { naam: H, waarde: '\\sqrt{2x + 1}' },
      ],
      afgeleiden: [
        { naam: DG, waarde: '1' },
        {
          naam: DH,
          waarde: '\\dfrac{1}{\\sqrt{2x + 1}}',
          hoe: {
            regel: 'kettingregel',
            uitwerking: {
              functie: 'h(x) = \\sqrt{{2:2x + 1}}',
              delen: [
                { naam: BUITEN, waarde: '\\sqrt{\\ldots}' },
                { naam: KERN, waarde: '2x + 1' },
              ],
              afgeleiden: [
                { naam: DBUITEN, waarde: '\\dfrac{1}{2\\sqrt{2x + 1}}' },
                { naam: DKERN, waarde: '2' },
              ],
              formule: KETTING,
              ingevuld: "h'(x) = {a1} \\cdot {a2}",
              herleid: '\\dfrac{1}{\\sqrt{2x + 1}}',
            },
          },
        },
      ],
      formule: PRODUCT,
      ingevuld: "f'(x) = {a1} \\cdot {d2} + {d1} \\cdot {a2}",
      herleid: '\\sqrt{2x + 1} + \\dfrac{x}{\\sqrt{2x + 1}}',
    },
  },
]

export type HoofdstukTopic = {
  /** topics_new.slug */
  slug: string
  title: string
  /** Bij welke regel de knop "Oefen" verschijnt; null = alleen in de topiclijst */
  regel: RegelId | null
  videos?: Array<{ slug: string; label: string }>
}

export type Hoofdstuk = {
  slug: string
  code: string
  title: string
  intro: string
  /** Regels die in dit hoofdstuk actief zijn; de rest staat grijs met "vanaf H…" */
  regels: RegelId[]
  /** Wat dit hoofdstuk per regel toevoegt, getoond in het regelpaneel */
  notities?: Partial<Record<RegelId, string>>
  topics: HoofdstukTopic[]
}

export const HOOFDSTUKKEN: Hoofdstuk[] = [
  {
    slug: 'h2',
    code: 'H2',
    title: 'De afgeleide berekenen',
    intro:
      'In H2 leer je vier regels: de machtsregel voor losse termen, en de som-, product- en quotiëntregel voor functies die uit delen bestaan. Elke som volgt het stappenplan hieronder. Kies een voorbeeld en zie hoe het schema zich vult.',
    regels: ['machtsregel', 'somregel', 'productregel', 'quotientregel'],
    notities: {
      somregel:
        'In H2 is bijna elke som een somregel met daarbinnen de machtsregel per term. "Haakjes eerst uitwerken" hoort hier ook bij: twee lineaire factoren of een kwadraat van een lineaire vorm werk je uit, en dan zie je de termen.',
      productregel: 'Een kwadraat van een polynoom, zoals $(3x^2 - 4)^2$, schrijf je als $g \\cdot g$. De kettingregel komt pas in H6.',
    },
    topics: [
      { slug: 'h2_termsgewijs', title: 'Termsgewijs differentiëren', regel: 'somregel' },
      { slug: 'h2_haakjes_eerst', title: 'Haakjes uitwerken vóór differentiëren', regel: 'somregel' },
      {
        slug: 'h2_productregel',
        title: 'De productregel',
        regel: 'productregel',
        videos: [
          { slug: 'somregel-of-productregel', label: 'Somregel of productregel?' },
          { slug: 'som-30', label: 'Uitwerking van #30' },
        ],
      },
      {
        slug: 'h2_quotientregel',
        title: 'De quotiëntregel',
        regel: 'quotientregel',
        videos: [
          { slug: 'quotientregel', label: 'De quotiëntregel en het stappenplan (#36)' },
          { slug: 'som-34', label: 'Uitwerking van #34' },
        ],
      },
      { slug: 'h2_gemengd', title: 'Gemengd: welke regel?', regel: null },
    ],
  },
  {
    slug: 'h6',
    code: 'H6',
    title: 'Machten, wortels en de kettingregel',
    intro:
      'H6 voegt twee dingen toe. Functies met $1/x^n$, wortels of één term in de noemer schrijf je eerst als macht van $x$; dan is het de machtsregel. En voor een expressie ín een macht of wortel komt er een nieuwe regel bij: de kettingregel.',
    regels: ['machtsregel', 'somregel', 'productregel', 'quotientregel', 'kettingregel'],
    notities: {
      machtsregel:
        'In H6 hoort hier het herschrijven bij: $\\dfrac{a}{x^n} = ax^{-n}$ en $\\sqrt[n]{x^m} = x^{m/n}$. Daarna is het de machtsregel, en schrijf je het antwoord terug zonder negatieve of gebroken exponent.',
      somregel:
        'Een breuk met één term in de noemer deel je eerst uit; dan zie je de termen en is het de somregel met de machtsregel per term.',
      kettingregel:
        'Let op het verschil met herschrijven: $x\\sqrt{x}$ is een macht van $x$ (machtsregel), $\\sqrt{x^2 + 1}$ heeft een expressie onder de wortel (kettingregel).',
    },
    topics: [
      { slug: 'h6_machten', title: 'Machten en wortels herschrijven', regel: 'machtsregel' },
      { slug: 'h6_kettingregel', title: 'De kettingregel', regel: 'kettingregel' },
      { slug: 'h6_combinaties', title: 'Kettingregel gecombineerd', regel: 'kettingregel' },
      { slug: 'h6_gemengd', title: 'Gemengd: welke regel?', regel: null },
    ],
  },
]

export type Methode = {
  regels: Regel[]
  voorbeelden: Voorbeeld[]
  hoofdstukken: Hoofdstuk[]
}

export const METHODE: Methode = { regels: REGELS, voorbeelden: VOORBEELDEN, hoofdstukken: HOOFDSTUKKEN }
