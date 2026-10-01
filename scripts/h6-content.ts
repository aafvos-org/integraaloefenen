/**
 * Bron van de H6-oefencontent ("Machten, wortels en de kettingregel") volgens
 * docs/h6-afgeleide-berekenen.md. Genereert de SQL-migratie
 * supabase/migrations/0033_h6_stappenplan.sql.
 *
 *   npx tsx scripts/h6-content.ts          → schrijft de migratie
 *
 * Sjablonen en generator: scripts/lib/stappenplan-content.ts.
 * Kettingregel zonder letters: "buitenkant" en "kern" (u/v en g/h blijven vrij).
 */
import {
  r,
  product,
  quotient,
  herschrijf,
  uitdelen,
  ketting,
  kettingCombi,
  somKetting,
  writeMigration,
  type ClusterDef,
  type Q as QDef,
  type ChapterContent,
} from './lib/stappenplan-content'

const TOPICS_NEW = [{ slug: 'h6_gemengd', title: 'Gemengd: welke regel?', order: 4 }]

const CLUSTERS: ClusterDef[] = [
  // Topic 1 · Machten en wortels herschrijven
  { topic: 'h6_machten', slug: 'negatieve_macht', title: 'Negatieve machten', order: 1 },
  { topic: 'h6_machten', slug: 'uitdelen', title: 'Uitdelen vóór differentiëren', order: 2 },
  { topic: 'h6_machten', slug: 'wortelvorm', title: 'Wortels als macht', order: 3 },
  { topic: 'h6_machten', slug: 'nde_wortel', title: 'N-de machtswortels', order: 4 },
  { topic: 'h6_machten', slug: 'gemengd_macht_wortel', title: 'Gemengde machten en wortels', order: 5 },
  // Topic 2 · De kettingregel
  { topic: 'h6_kettingregel', slug: 'macht_lineair', title: 'Macht met lineaire kern', order: 1 },
  { topic: 'h6_kettingregel', slug: 'macht_polynoom', title: 'Macht met polynoom-kern', order: 2 },
  { topic: 'h6_kettingregel', slug: 'wortel_lineair', title: 'Wortel met lineaire kern', order: 3 },
  { topic: 'h6_kettingregel', slug: 'wortel_polynoom', title: 'Wortel met polynoom-kern', order: 4 },
  { topic: 'h6_kettingregel', slug: 'negatieve_macht_expressie', title: 'Negatieve macht van een kern', order: 5 },
  { topic: 'h6_kettingregel', slug: 'gebroken_macht_kern', title: 'Gebroken macht van een kern', order: 6 },
  { topic: 'h6_kettingregel', slug: 'ketting_in_som', title: 'Kettingregel in een som', order: 7 },
  // Topic 3 · Kettingregel gecombineerd
  { topic: 'h6_combinaties', slug: 'ketting_plus_product', title: 'Kettingregel + productregel', order: 1 },
  { topic: 'h6_combinaties', slug: 'ketting_plus_quotient', title: 'Kettingregel + quotiëntregel', order: 2 },
  // Topic 4 · Gemengd
  { topic: 'h6_gemengd', slug: 'welke_regel', title: 'Welke regel?', order: 1 },
]

const OLD_CLUSTER_TOPIC: Record<string, string> = {
  negatieve_macht: 'h6_machten',
  uitdelen: 'h6_machten',
  wortelvorm: 'h6_machten',
  gemengd_macht_wortel: 'h6_machten',
  macht_lineair: 'h6_kettingregel',
  macht_polynoom: 'h6_kettingregel',
  wortel_lineair: 'h6_kettingregel',
  wortel_polynoom: 'h6_kettingregel',
  negatieve_macht_expressie: 'h6_kettingregel',
  ketting_plus_product: 'h6_combinaties',
  ketting_plus_quotient: 'h6_combinaties',
}

// Stap 0-teksten
const NEG0 = r`Buitenste schil: een getal gedeeld door een macht van $x$ → herschrijf als negatieve macht, $\dfrac{a}{x^n} = ax^{-n}$, dan de machtsregel.`
const WORTEL0 = r`Buitenste schil: een wortel van $x$ → herschrijf als macht, $\sqrt{x} = x^{1/2}$, dan de machtsregel.`
const NDE0 = r`Buitenste schil: een $n$-de machtswortel → herschrijf als macht, $\sqrt[n]{x^m} = x^{m/n}$, dan de machtsregel.`
const GEM0 = r`Buitenste schil: $x$-machten en wortels door elkaar → schrijf alles als macht van $x$ en tel de exponenten op, dan de machtsregel.`
const MACHT0 = r`Buitenste schil: haakjes tot een macht → kettingregel. Buitenkant is $(\ldots)^n$, kern is wat tussen de haakjes staat.`
const WORTELK0 = r`Buitenste schil: een wortel van een expressie → kettingregel. Buitenkant is $\sqrt{\ldots}$, kern is wat onder de wortel staat.`
const NEGK0 = r`Buitenste schil: een getal gedeeld door een expressie tot een macht → schrijf als $(\ldots)^{-n}$ en gebruik de kettingregel.`
const GEBR0 = r`Buitenste schil: een expressie maal de wortel van diezelfde expressie → schrijf als $(\ldots)^{3/2}$ en gebruik de kettingregel.`

const Q: QDef[] = [
  // ═══ Topic 1 · Machten en wortels herschrijven ═══════════════════════════
  // 1a Negatieve machten
  {
    cluster: 'negatieve_macht', level: 1, existing: ['negatieve_macht', r`f(x) = \dfrac{6}{x}`],
    body: r`f(x) = \dfrac{6}{x}`, answer: r`-\dfrac{6}{x^{2}}`, alts: ['-6x^-2'],
    steps: herschrijf(r`f(x) = \dfrac{6}{x}`, '6x^{-1}', [['6x^{-1}', '-6x^{-2}']], r`-\dfrac{6}{x^2}`, NEG0),
  },
  {
    cluster: 'negatieve_macht', level: 1, existing: ['negatieve_macht', r`f(x) = \dfrac{1}{x^{2}}`],
    body: r`f(x) = \dfrac{1}{x^{2}}`, answer: r`-\dfrac{2}{x^{3}}`, alts: ['-2x^-3'],
    steps: herschrijf(r`f(x) = \dfrac{1}{x^{2}}`, 'x^{-2}', [['x^{-2}', '-2x^{-3}']], r`-\dfrac{2}{x^3}`, NEG0),
  },
  {
    cluster: 'negatieve_macht', level: 2, existing: ['negatieve_macht', r`f(x) = \dfrac{6}{x^{3}}`],
    body: r`f(x) = \dfrac{6}{x^{3}}`, answer: r`-\dfrac{18}{x^{4}}`, alts: ['-18x^-4'],
    steps: herschrijf(r`f(x) = \dfrac{6}{x^{3}}`, '6x^{-3}', [['6x^{-3}', '-18x^{-4}']], r`-\dfrac{18}{x^4}`, NEG0),
  },
  {
    cluster: 'negatieve_macht', level: 2, existing: ['negatieve_macht', r`g(x) = 5 - \dfrac{3}{x^{2}}`],
    body: r`g(x) = 5 - \dfrac{3}{x^{2}}`, answer: r`\dfrac{6}{x^{3}}`, alts: ['6x^-3'],
    steps: herschrijf(r`g(x) = 5 - \dfrac{3}{x^{2}}`, '5 - 3x^{-2}', [['5', '0'], ['-3x^{-2}', '6x^{-3}']], r`\dfrac{6}{x^3}`,
      r`Buitenste schil: een $-$ tussen een getal en een breuk met alleen een macht van $x$ eronder → somregel; de breuk herschrijf je als negatieve macht.`),
  },
  {
    cluster: 'negatieve_macht', level: 3, existing: ['negatieve_macht', r`h(x) = ax^{4} - \dfrac{b}{x^{4}}`],
    body: r`h(x) = ax^{4} - \dfrac{b}{x^{4}}`, answer: r`4ax^{3} + \dfrac{4b}{x^{5}}`, alts: ['4ax^3+4bx^-5'],
    steps: herschrijf(r`h(x) = ax^{4} - \dfrac{b}{x^{4}}`, 'ax^4 - bx^{-4}', [['ax^4', '4ax^3'], ['-bx^{-4}', '4bx^{-5}']], r`4ax^3 + \dfrac{4b}{x^5}`,
      r`Buitenste schil: een $-$ tussen twee termen → somregel; $a$ en $b$ zijn getallen, de breuk herschrijf je als negatieve macht.`),
  },
  {
    cluster: 'negatieve_macht', level: 3, existing: ['negatieve_macht', r`f(x) = 5x^{2} - \dfrac{5}{x^{2}}`],
    body: r`f(x) = 5x^{2} - \dfrac{5}{x^{2}}`, answer: r`10x + \dfrac{10}{x^{3}}`, alts: ['10x+10x^-3'],
    steps: herschrijf(r`f(x) = 5x^{2} - \dfrac{5}{x^{2}}`, '5x^2 - 5x^{-2}', [['5x^2', '10x'], ['-5x^{-2}', '10x^{-3}']], r`10x + \dfrac{10}{x^3}`,
      r`Buitenste schil: een $-$ tussen twee termen → somregel; de breuk herschrijf je als negatieve macht.`),
  },

  // 1b Uitdelen
  {
    cluster: 'uitdelen', level: 1, existing: ['uitdelen', r`f(x) = \dfrac{2x - 1}{x^{3}}`],
    body: r`f(x) = \dfrac{2x - 1}{x^{3}}`, answer: r`-\dfrac{4}{x^{3}} + \dfrac{3}{x^{4}}`, alts: ['-4x^-3+3x^-4'],
    steps: uitdelen(r`f(x) = \dfrac{2x - 1}{x^{3}}`, r`\dfrac{2x}{x^3} - \dfrac{1}{x^3}`, '2x^{-2} - x^{-3}', [['2x^{-2}', '-4x^{-3}'], ['-x^{-3}', '3x^{-4}']], r`-\dfrac{4}{x^3} + \dfrac{3}{x^4}`),
  },
  {
    cluster: 'uitdelen', level: 1, existing: ['uitdelen', r`f(x) = \dfrac{x^{3} + 1}{x^{3}}`],
    body: r`f(x) = \dfrac{x^{3} + 1}{x^{3}}`, answer: r`-\dfrac{3}{x^{4}}`, alts: ['-3x^-4'],
    steps: uitdelen(r`f(x) = \dfrac{x^{3} + 1}{x^{3}}`, r`\dfrac{x^3}{x^3} + \dfrac{1}{x^3}`, '1 + x^{-3}', [['1', '0'], ['x^{-3}', '-3x^{-4}']], r`-\dfrac{3}{x^4}`),
  },
  {
    cluster: 'uitdelen', level: 2, existing: ['uitdelen', r`g(x) = \dfrac{x^{2} + 1}{x}`],
    body: r`g(x) = \dfrac{x^{2} + 1}{x}`, answer: r`1 - \dfrac{1}{x^{2}}`, alts: ['1-x^-2'],
    steps: uitdelen(r`g(x) = \dfrac{x^{2} + 1}{x}`, r`\dfrac{x^2}{x} + \dfrac{1}{x}`, 'x + x^{-1}', [['x', '1'], ['x^{-1}', '-x^{-2}']], r`1 - \dfrac{1}{x^2}`),
  },
  {
    cluster: 'uitdelen', level: 2, existing: ['uitdelen', r`h(x) = \dfrac{3x^{6} - 3}{x^{3}}`],
    body: r`h(x) = \dfrac{3x^{6} - 3}{x^{3}}`, answer: r`9x^{2} + \dfrac{9}{x^{4}}`, alts: ['9x^2+9x^-4'],
    steps: uitdelen(r`h(x) = \dfrac{3x^{6} - 3}{x^{3}}`, r`\dfrac{3x^6}{x^3} - \dfrac{3}{x^3}`, '3x^3 - 3x^{-3}', [['3x^3', '9x^2'], ['-3x^{-3}', '9x^{-4}']], r`9x^2 + \dfrac{9}{x^4}`),
  },
  {
    cluster: 'uitdelen', level: 3, existing: ['uitdelen', r`f(x) = \dfrac{2x^{2} - 5}{2x^{2}}`],
    body: r`f(x) = \dfrac{2x^{2} - 5}{2x^{2}}`, answer: r`\dfrac{5}{x^{3}}`, alts: ['5x^-3'],
    steps: uitdelen(r`f(x) = \dfrac{2x^{2} - 5}{2x^{2}}`, r`\dfrac{2x^2}{2x^2} - \dfrac{5}{2x^2}`, r`1 - \tfrac{5}{2}x^{-2}`, [['1', '0'], [r`-\tfrac{5}{2}x^{-2}`, '5x^{-3}']], r`\dfrac{5}{x^3}`),
  },
  {
    // vervangt de kapotte vraag (x²−1)/(6−x²) met antwoord "Quotiëntregel: zie h2"
    cluster: 'uitdelen', level: 3, existing: ['uitdelen', r`f(x) = \dfrac{x^{2} - 1}{6 - x^{2}}`],
    body: r`h(x) = 6 - \dfrac{x^{2} - 1}{x}`, answer: r`-1 - \dfrac{1}{x^{2}}`, alts: ['-1-x^-2'],
    steps: uitdelen(r`h(x) = 6 - \dfrac{x^{2} - 1}{x}`, r`6 - \left(\dfrac{x^2}{x} - \dfrac{1}{x}\right)`, '6 - x + x^{-1}', [['6', '0'], ['-x', '-1'], ['x^{-1}', '-x^{-2}']], r`-1 - \dfrac{1}{x^2}`,
      r`Buitenste schil: een $-$ tussen een getal en een breuk met één term in de noemer → somregel; de breuk deel je uit. Let op: de min gaat over beide termen.`),
  },

  // 1c Wortels als macht
  {
    cluster: 'wortelvorm', level: 1, existing: ['wortelvorm', r`f(x) = \sqrt{x}`],
    body: r`f(x) = \sqrt{x}`, answer: r`\dfrac{1}{2\sqrt{x}}`, alts: ['1/2x^(-1/2)', '0.5x^-0.5'],
    steps: herschrijf(r`f(x) = \sqrt{x}`, 'x^{1/2}', [['x^{1/2}', r`\tfrac{1}{2}x^{-1/2}`]], r`\dfrac{1}{2\sqrt{x}}`, WORTEL0),
  },
  {
    cluster: 'wortelvorm', level: 1, existing: ['wortelvorm', r`f(x) = 2\sqrt{x}`],
    body: r`f(x) = 2\sqrt{x}`, answer: r`\dfrac{1}{\sqrt{x}}`, alts: ['x^(-1/2)'],
    steps: herschrijf(r`f(x) = 2\sqrt{x}`, '2x^{1/2}', [['2x^{1/2}', 'x^{-1/2}']], r`\dfrac{1}{\sqrt{x}}`, WORTEL0),
  },
  {
    cluster: 'wortelvorm', level: 2, existing: ['wortelvorm', r`g(x) = \sqrt{x} - \dfrac{1}{\sqrt{x}}`],
    body: r`g(x) = \sqrt{x} - \dfrac{1}{\sqrt{x}}`, answer: r`\dfrac{1}{2\sqrt{x}} + \dfrac{1}{2x\sqrt{x}}`, alts: ['1/2x^(-1/2)+1/2x^(-3/2)'],
    steps: herschrijf(r`g(x) = \sqrt{x} - \dfrac{1}{\sqrt{x}}`, 'x^{1/2} - x^{-1/2}', [['x^{1/2}', r`\tfrac{1}{2}x^{-1/2}`], ['-x^{-1/2}', r`\tfrac{1}{2}x^{-3/2}`]], r`\dfrac{1}{2\sqrt{x}} + \dfrac{1}{2x\sqrt{x}}`,
      r`Buitenste schil: een $-$ tussen twee termen → somregel; beide termen herschrijf je als macht van $x$.`),
  },
  {
    cluster: 'wortelvorm', level: 2, existing: ['wortelvorm', r`f(x) = 3\sqrt{x} + 5`],
    body: r`f(x) = 3\sqrt{x} + 5`, answer: r`\dfrac{3}{2\sqrt{x}}`, alts: ['1.5x^(-1/2)', '1,5/sqrt(x)'],
    steps: herschrijf(r`f(x) = 3\sqrt{x} + 5`, '3x^{1/2} + 5', [['3x^{1/2}', r`1{,}5x^{-1/2}`], ['5', '0']], r`\dfrac{3}{2\sqrt{x}}`,
      r`Buitenste schil: een $+$ tussen twee termen → somregel; de wortel herschrijf je als macht.`),
  },
  {
    cluster: 'wortelvorm', level: 3, existing: ['wortelvorm', r`h(x) = \dfrac{1}{\sqrt{x}}`],
    body: r`h(x) = \dfrac{1}{\sqrt{x}}`, answer: r`-\dfrac{1}{2x\sqrt{x}}`, alts: ['-1/2x^(-3/2)'],
    steps: herschrijf(r`h(x) = \dfrac{1}{\sqrt{x}}`, 'x^{-1/2}', [['x^{-1/2}', r`-\tfrac{1}{2}x^{-3/2}`]], r`-\dfrac{1}{2x\sqrt{x}}`,
      r`Buitenste schil: $1$ gedeeld door een wortel van $x$ → herschrijf als macht, $\dfrac{1}{\sqrt{x}} = x^{-1/2}$, dan de machtsregel.`),
  },
  {
    cluster: 'wortelvorm', level: 3, existing: ['wortelvorm', r`k(x) = x^{3} \cdot \sqrt{x}`],
    body: r`k(x) = x^{3} \cdot \sqrt{x}`, answer: r`3{,}5x^{2}\sqrt{x}`, alts: ['7/2x^2sqrt(x)', '3.5x^(5/2)'],
    steps: herschrijf(r`k(x) = x^{3} \cdot \sqrt{x}`, r`x^3 \cdot x^{1/2} = x^{7/2}`, [['x^{7/2}', r`\tfrac{7}{2}x^{5/2}`]], r`3{,}5x^2\sqrt{x}`, GEM0),
  },

  // 1d N-de machtswortels (nieuw)
  {
    cluster: 'nde_wortel', level: 1,
    body: r`f(x) = \sqrt[3]{x}`, answer: r`\dfrac{1}{3\sqrt[3]{x^{2}}}`, alts: ['1/3x^(-2/3)'],
    steps: herschrijf(r`f(x) = \sqrt[3]{x}`, 'x^{1/3}', [['x^{1/3}', r`\tfrac{1}{3}x^{-2/3}`]], r`\dfrac{1}{3\sqrt[3]{x^2}}`, NDE0),
  },
  {
    cluster: 'nde_wortel', level: 1,
    body: r`f(x) = \sqrt[4]{x}`, answer: r`\dfrac{1}{4\sqrt[4]{x^{3}}}`, alts: ['1/4x^(-3/4)'],
    steps: herschrijf(r`f(x) = \sqrt[4]{x}`, 'x^{1/4}', [['x^{1/4}', r`\tfrac{1}{4}x^{-3/4}`]], r`\dfrac{1}{4\sqrt[4]{x^3}}`, NDE0),
  },
  {
    cluster: 'nde_wortel', level: 2,
    body: r`g(x) = \sqrt[3]{x^{2}}`, answer: r`\dfrac{2}{3\sqrt[3]{x}}`, alts: ['2/3x^(-1/3)'],
    steps: herschrijf(r`g(x) = \sqrt[3]{x^{2}}`, 'x^{2/3}', [['x^{2/3}', r`\tfrac{2}{3}x^{-1/3}`]], r`\dfrac{2}{3\sqrt[3]{x}}`, NDE0),
  },
  {
    cluster: 'nde_wortel', level: 2,
    body: r`f(x) = x \cdot \sqrt[3]{x}`, answer: r`\tfrac{4}{3}\sqrt[3]{x}`, alts: ['4/3x^(1/3)', '1 1/3 (x)^(1/3)'],
    steps: herschrijf(r`f(x) = x \cdot \sqrt[3]{x}`, r`x \cdot x^{1/3} = x^{4/3}`, [['x^{4/3}', r`\tfrac{4}{3}x^{1/3}`]], r`\tfrac{4}{3}\sqrt[3]{x}`, GEM0),
  },
  {
    cluster: 'nde_wortel', level: 3,
    body: r`k(x) = x^{3} \cdot \sqrt[5]{x^{3}}`, answer: r`3{,}6x^{2}\sqrt[5]{x^{3}}`, alts: ['18/5x^(13/5)', '3.6x^(13/5)'],
    steps: herschrijf(r`k(x) = x^{3} \cdot \sqrt[5]{x^{3}}`, r`x^3 \cdot x^{3/5} = x^{18/5}`, [['x^{18/5}', r`\tfrac{18}{5}x^{13/5}`]], r`3{,}6x^2\sqrt[5]{x^3}`,
      r`Buitenste schil: een macht maal een $n$-de machtswortel → schrijf alles als macht van $x$, tel de exponenten op ($3 + \tfrac{3}{5} = \tfrac{18}{5}$), dan de machtsregel.`),
  },
  {
    cluster: 'nde_wortel', level: 3,
    body: r`f(x) = x^{2} \cdot \sqrt[4]{x}`, answer: r`2{,}25x\sqrt[4]{x}`, alts: ['9/4x^(5/4)', '2.25x^(5/4)'],
    steps: herschrijf(r`f(x) = x^{2} \cdot \sqrt[4]{x}`, r`x^2 \cdot x^{1/4} = x^{9/4}`, [['x^{9/4}', r`\tfrac{9}{4}x^{5/4}`]], r`2{,}25x\sqrt[4]{x}`,
      r`Buitenste schil: een macht maal een $n$-de machtswortel → schrijf alles als macht van $x$, tel de exponenten op ($2 + \tfrac{1}{4} = \tfrac{9}{4}$), dan de machtsregel.`),
  },

  // 1e Gemengde machten en wortels
  {
    cluster: 'gemengd_macht_wortel', level: 1, existing: ['gemengd_macht_wortel', r`f(x) = x \cdot \sqrt{x}`],
    body: r`f(x) = x \cdot \sqrt{x}`, answer: r`1{,}5\sqrt{x}`, alts: ['3/2sqrt(x)', '1.5x^(1/2)'],
    steps: herschrijf(r`f(x) = x \cdot \sqrt{x}`, r`x \cdot x^{1/2} = x^{3/2}`, [['x^{3/2}', r`\tfrac{3}{2}x^{1/2}`]], r`1{,}5\sqrt{x}`, GEM0),
  },
  {
    cluster: 'gemengd_macht_wortel', level: 1, existing: ['gemengd_macht_wortel', r`f(x) = x^{2} \cdot \sqrt{x}`],
    body: r`f(x) = x^{2} \cdot \sqrt{x}`, answer: r`2{,}5x\sqrt{x}`, alts: ['5/2xsqrt(x)', '2.5x^(3/2)'],
    steps: herschrijf(r`f(x) = x^{2} \cdot \sqrt{x}`, r`x^2 \cdot x^{1/2} = x^{5/2}`, [['x^{5/2}', r`\tfrac{5}{2}x^{3/2}`]], r`2{,}5x\sqrt{x}`, GEM0),
  },
  {
    cluster: 'gemengd_macht_wortel', level: 2, existing: ['gemengd_macht_wortel', r`g(x) = \dfrac{x}{\sqrt{x}}`],
    body: r`g(x) = \dfrac{x}{\sqrt{x}}`, answer: r`\dfrac{1}{2\sqrt{x}}`, alts: ['1/2x^(-1/2)'],
    steps: herschrijf(r`g(x) = \dfrac{x}{\sqrt{x}}`, r`\dfrac{x^1}{x^{1/2}} = x^{1/2}`, [['x^{1/2}', r`\tfrac{1}{2}x^{-1/2}`]], r`\dfrac{1}{2\sqrt{x}}`,
      r`Buitenste schil: $x$ gedeeld door een wortel van $x$ → schrijf als machten en trek de exponenten af, dan de machtsregel. Geen quotiëntregel nodig.`),
  },
  {
    cluster: 'gemengd_macht_wortel', level: 2, existing: ['gemengd_macht_wortel', r`h(x) = \dfrac{1}{x\sqrt{x}}`],
    body: r`h(x) = \dfrac{1}{x\sqrt{x}}`, answer: r`-\dfrac{1{,}5}{x^{2}\sqrt{x}}`, alts: ['-3/2x^(-5/2)', '-1.5x^(-5/2)'],
    steps: herschrijf(r`h(x) = \dfrac{1}{x\sqrt{x}}`, r`\dfrac{1}{x^{3/2}} = x^{-3/2}`, [['x^{-3/2}', r`-\tfrac{3}{2}x^{-5/2}`]], r`-\dfrac{1{,}5}{x^2\sqrt{x}}`,
      r`Buitenste schil: $1$ gedeeld door $x\sqrt{x}$ → schrijf de noemer als $x^{3/2}$ en het geheel als $x^{-3/2}$, dan de machtsregel.`),
  },
  {
    cluster: 'gemengd_macht_wortel', level: 3, existing: ['gemengd_macht_wortel', r`k(x) = x^{2}(x\sqrt{x} - 3)`],
    body: r`k(x) = x^{2}(x\sqrt{x} - 3)`, answer: r`3{,}5x^{2}\sqrt{x} - 6x`, alts: ['7/2x^2sqrt(x)-6x', '3.5x^(5/2)-6x'],
    steps: herschrijf(r`k(x) = x^{2}(x\sqrt{x} - 3)`, r`x^2 \cdot x^{3/2} - 3x^2 = x^{7/2} - 3x^2`, [['x^{7/2}', r`\tfrac{7}{2}x^{5/2}`], ['-3x^2', '-6x']], r`3{,}5x^2\sqrt{x} - 6x`,
      r`Buitenste schil: $x^2$ maal haakjes → werk de haakjes uit en schrijf alles als macht van $x$, dan termsgewijs.`),
  },
  {
    cluster: 'gemengd_macht_wortel', level: 3, existing: ['gemengd_macht_wortel', r`f(x) = \dfrac{x^{2} - 2}{x\sqrt{x}}`],
    body: r`f(x) = \dfrac{x^{2} - 2}{x\sqrt{x}}`, answer: r`\dfrac{0{,}5}{\sqrt{x}} + \dfrac{3}{x^{2}\sqrt{x}}`, alts: ['1/2x^(-1/2)+3x^(-5/2)', '1/(2sqrt(x))+3/(x^2sqrt(x))'],
    steps: uitdelen(r`f(x) = \dfrac{x^{2} - 2}{x\sqrt{x}}`, r`\dfrac{x^2}{x^{3/2}} - \dfrac{2}{x^{3/2}}`, 'x^{1/2} - 2x^{-3/2}', [['x^{1/2}', r`\tfrac{1}{2}x^{-1/2}`], ['-2x^{-3/2}', '3x^{-5/2}']], r`\dfrac{0{,}5}{\sqrt{x}} + \dfrac{3}{x^2\sqrt{x}}`,
      r`Buitenste schil: een breuk met één term in de noemer ($x\sqrt{x} = x^{3/2}$) → deel uit, dan termsgewijs. Geen quotiëntregel nodig.`),
  },

  // ═══ Topic 2 · De kettingregel ═══════════════════════════════════════════
  // 2a Macht met lineaire kern
  {
    cluster: 'macht_lineair', level: 1, existing: ['macht_lineair', r`f(x) = (4x + 3)^{3}`],
    body: r`f(x) = (4x + 3)^{3}`, answer: r`12(4x + 3)^{2}`, alts: ['3(4x+3)^2*4'],
    steps: ketting(r`f(x) = (4x + 3)^{3}`, { buiten: r`(\ldots)^3`, kern: '4x + 3', dBuiten: '3(4x + 3)^2', dKern: '4' }, r`3(4x + 3)^2 \cdot 4`, '12(4x + 3)^2', MACHT0),
  },
  {
    cluster: 'macht_lineair', level: 1, existing: ['macht_lineair', r`f(x) = (2x - 1)^{4}`],
    body: r`f(x) = (2x - 1)^{4}`, answer: r`8(2x - 1)^{3}`, alts: ['4(2x-1)^3*2'],
    steps: ketting(r`f(x) = (2x - 1)^{4}`, { buiten: r`(\ldots)^4`, kern: '2x - 1', dBuiten: '4(2x - 1)^3', dKern: '2' }, r`4(2x - 1)^3 \cdot 2`, '8(2x - 1)^3', MACHT0),
  },
  {
    cluster: 'macht_lineair', level: 2, existing: ['macht_lineair', r`g(x) = 6(\tfrac{1}{2}x - 4)^{5}`],
    body: r`g(x) = 6(\tfrac{1}{2}x - 4)^{5}`, answer: r`15(\tfrac{1}{2}x - 4)^{4}`, alts: ['15(0.5x-4)^4', '15(0,5x-4)^4'],
    steps: ketting(r`g(x) = 6(\tfrac{1}{2}x - 4)^{5}`, { buiten: r`6(\ldots)^5`, kern: r`\tfrac{1}{2}x - 4`, dBuiten: r`30(\tfrac{1}{2}x - 4)^4`, dKern: r`\tfrac{1}{2}` }, r`30(\tfrac{1}{2}x - 4)^4 \cdot \tfrac{1}{2}`, r`15(\tfrac{1}{2}x - 4)^4`,
      r`Buitenste schil: een getal maal haakjes tot een macht → kettingregel; het getal blijft gewoon voor de buitenkant staan.`),
  },
  {
    cluster: 'macht_lineair', level: 2, existing: ['macht_lineair', r`h(x) = -2(2x + 1)^{4}`],
    body: r`h(x) = -2(2x + 1)^{4}`, answer: r`-16(2x + 1)^{3}`, alts: ['-8(2x+1)^3*2'],
    steps: ketting(r`h(x) = -2(2x + 1)^{4}`, { buiten: r`-2(\ldots)^4`, kern: '2x + 1', dBuiten: '-8(2x + 1)^3', dKern: '2' }, r`-8(2x + 1)^3 \cdot 2`, '-16(2x + 1)^3',
      r`Buitenste schil: een getal maal haakjes tot een macht → kettingregel; het getal blijft gewoon voor de buitenkant staan.`),
  },
  {
    cluster: 'macht_lineair', level: 3,
    body: r`f(x) = (5 - 2x)^{6}`, answer: r`-12(5 - 2x)^{5}`, alts: ['6(5-2x)^5*-2'],
    steps: ketting(r`f(x) = (5 - 2x)^{6}`, { buiten: r`(\ldots)^6`, kern: '5 - 2x', dBuiten: '6(5 - 2x)^5', dKern: '-2' }, r`6(5 - 2x)^5 \cdot (-2)`, '-12(5 - 2x)^5',
      r`Buitenste schil: haakjes tot een macht → kettingregel. Let op: de kern $5 - 2x$ heeft afgeleide $-2$.`),
  },
  {
    cluster: 'macht_lineair', level: 3,
    body: r`f(x) = \tfrac{1}{4}(2x - 3)^{4}`, answer: r`2(2x - 3)^{3}`, alts: ['(2x-3)^3*2'],
    steps: ketting(r`f(x) = \tfrac{1}{4}(2x - 3)^{4}`, { buiten: r`\tfrac{1}{4}(\ldots)^4`, kern: '2x - 3', dBuiten: r`4 \cdot \tfrac{1}{4}(2x - 3)^3 = (2x - 3)^3`, dKern: '2' }, r`(2x - 3)^3 \cdot 2`, '2(2x - 3)^3',
      r`Buitenste schil: een breuk maal haakjes tot een macht → kettingregel; $4 \cdot \tfrac{1}{4} = 1$ valt weg.`),
  },

  // 2b Macht met polynoom-kern
  {
    cluster: 'macht_polynoom', level: 1, existing: ['macht_polynoom', r`f(x) = (x^{2} + 1)^{3}`],
    body: r`f(x) = (x^{2} + 1)^{3}`, answer: r`6x(x^{2} + 1)^{2}`, alts: ['3(x^2+1)^2*2x'],
    steps: ketting(r`f(x) = (x^{2} + 1)^{3}`, { buiten: r`(\ldots)^3`, kern: 'x^2 + 1', dBuiten: '3(x^2 + 1)^2', dKern: '2x' }, r`3(x^2 + 1)^2 \cdot 2x`, '6x(x^2 + 1)^2', MACHT0),
  },
  {
    cluster: 'macht_polynoom', level: 1, existing: ['macht_polynoom', r`f(x) = (4x^{2} - 3)^{4}`],
    body: r`f(x) = (4x^{2} - 3)^{4}`, answer: r`32x(4x^{2} - 3)^{3}`, alts: ['4(4x^2-3)^3*8x'],
    steps: ketting(r`f(x) = (4x^{2} - 3)^{4}`, { buiten: r`(\ldots)^4`, kern: '4x^2 - 3', dBuiten: '4(4x^2 - 3)^3', dKern: '8x' }, r`4(4x^2 - 3)^3 \cdot 8x`, '32x(4x^2 - 3)^3', MACHT0),
  },
  {
    cluster: 'macht_polynoom', level: 2, existing: ['macht_polynoom', r`h(x) = (x^{2} - 2x + 3)^{3}`],
    body: r`h(x) = (x^{2} - 2x + 3)^{3}`, answer: r`3(2x - 2)(x^{2} - 2x + 3)^{2}`, alts: ['(6x-6)(x^2-2x+3)^2', '3(x^2-2x+3)^2*(2x-2)'],
    steps: ketting(r`h(x) = (x^{2} - 2x + 3)^{3}`, { buiten: r`(\ldots)^3`, kern: 'x^2 - 2x + 3', dBuiten: '3(x^2 - 2x + 3)^2', dKern: '2x - 2' }, r`3(x^2 - 2x + 3)^2 \cdot (2x - 2)`, '3(2x - 2)(x^2 - 2x + 3)^2', MACHT0),
  },
  {
    cluster: 'macht_polynoom', level: 2, existing: ['macht_polynoom', r`f(x) = (x^{2} - 5)^{3}`],
    body: r`f(x) = (x^{2} - 5)^{3}`, answer: r`6x(x^{2} - 5)^{2}`, alts: ['3(x^2-5)^2*2x'],
    steps: ketting(r`f(x) = (x^{2} - 5)^{3}`, { buiten: r`(\ldots)^3`, kern: 'x^2 - 5', dBuiten: '3(x^2 - 5)^2', dKern: '2x' }, r`3(x^2 - 5)^2 \cdot 2x`, '6x(x^2 - 5)^2', MACHT0),
  },
  {
    cluster: 'macht_polynoom', level: 3, existing: ['macht_polynoom', r`g(x) = 4(x^{3} + 7x - 2)^{2}`],
    body: r`g(x) = 4(x^{3} + 7x - 2)^{2}`, answer: r`8(3x^{2} + 7)(x^{3} + 7x - 2)`, alts: ['8(x^3+7x-2)*(3x^2+7)'],
    steps: ketting(r`g(x) = 4(x^{3} + 7x - 2)^{2}`, { buiten: r`4(\ldots)^2`, kern: 'x^3 + 7x - 2', dBuiten: '8(x^3 + 7x - 2)', dKern: '3x^2 + 7' }, r`8(x^3 + 7x - 2) \cdot (3x^2 + 7)`, '8(3x^2 + 7)(x^3 + 7x - 2)',
      r`Buitenste schil: een getal maal haakjes tot een macht → kettingregel; het getal blijft voor de buitenkant staan.`),
  },
  {
    cluster: 'macht_polynoom', level: 3, existing: ['macht_polynoom', r`k(x) = (\tfrac{1}{2}x^{2} - 2x)^{3}`],
    body: r`k(x) = (\tfrac{1}{2}x^{2} - 2x)^{3}`, answer: r`3(x - 2)(\tfrac{1}{2}x^{2} - 2x)^{2}`, alts: ['3(0.5x^2-2x)^2*(x-2)', '(3x-6)(1/2x^2-2x)^2'],
    steps: ketting(r`k(x) = (\tfrac{1}{2}x^{2} - 2x)^{3}`, { buiten: r`(\ldots)^3`, kern: r`\tfrac{1}{2}x^2 - 2x`, dBuiten: r`3(\tfrac{1}{2}x^2 - 2x)^2`, dKern: 'x - 2' }, r`3(\tfrac{1}{2}x^2 - 2x)^2 \cdot (x - 2)`, r`3(x - 2)(\tfrac{1}{2}x^2 - 2x)^2`, MACHT0),
  },

  // 2c Wortel met lineaire kern
  {
    cluster: 'wortel_lineair', level: 1, existing: ['wortel_lineair', r`f(x) = \sqrt{4x + 1}`],
    body: r`f(x) = \sqrt{4x + 1}`, answer: r`\dfrac{2}{\sqrt{4x + 1}}`, alts: ['4/(2sqrt(4x+1))'],
    steps: ketting(r`f(x) = \sqrt{4x + 1}`, { buiten: r`\sqrt{\ldots}`, kern: '4x + 1', dBuiten: r`\dfrac{1}{2\sqrt{4x + 1}}`, dKern: '4' }, r`\dfrac{1}{2\sqrt{4x + 1}} \cdot 4`, r`\dfrac{2}{\sqrt{4x + 1}}`, WORTELK0),
  },
  {
    cluster: 'wortel_lineair', level: 1, existing: ['wortel_lineair', r`f(x) = \sqrt{3x + 1}`],
    body: r`f(x) = \sqrt{3x + 1}`, answer: r`\dfrac{3}{2\sqrt{3x + 1}}`, alts: ['1.5/sqrt(3x+1)'],
    steps: ketting(r`f(x) = \sqrt{3x + 1}`, { buiten: r`\sqrt{\ldots}`, kern: '3x + 1', dBuiten: r`\dfrac{1}{2\sqrt{3x + 1}}`, dKern: '3' }, r`\dfrac{1}{2\sqrt{3x + 1}} \cdot 3`, r`\dfrac{3}{2\sqrt{3x + 1}}`, WORTELK0),
  },
  {
    cluster: 'wortel_lineair', level: 2, existing: ['wortel_lineair', r`g(x) = \sqrt{2x - 5}`],
    body: r`g(x) = \sqrt{2x - 5}`, answer: r`\dfrac{1}{\sqrt{2x - 5}}`, alts: ['2/(2sqrt(2x-5))'],
    steps: ketting(r`g(x) = \sqrt{2x - 5}`, { buiten: r`\sqrt{\ldots}`, kern: '2x - 5', dBuiten: r`\dfrac{1}{2\sqrt{2x - 5}}`, dKern: '2' }, r`\dfrac{1}{2\sqrt{2x - 5}} \cdot 2`, r`\dfrac{1}{\sqrt{2x - 5}}`, WORTELK0),
  },
  {
    cluster: 'wortel_lineair', level: 2, existing: ['wortel_lineair', r`h(x) = 3\sqrt{2x + 1}`],
    body: r`h(x) = 3\sqrt{2x + 1}`, answer: r`\dfrac{3}{\sqrt{2x + 1}}`, alts: ['6/(2sqrt(2x+1))'],
    steps: ketting(r`h(x) = 3\sqrt{2x + 1}`, { buiten: r`3\sqrt{\ldots}`, kern: '2x + 1', dBuiten: r`\dfrac{3}{2\sqrt{2x + 1}}`, dKern: '2' }, r`\dfrac{3}{2\sqrt{2x + 1}} \cdot 2`, r`\dfrac{3}{\sqrt{2x + 1}}`,
      r`Buitenste schil: een getal maal een wortel van een expressie → kettingregel; het getal blijft voor de buitenkant staan.`),
  },
  {
    cluster: 'wortel_lineair', level: 3, existing: ['wortel_lineair', r`f(x) = \dfrac{1}{\sqrt{4x - 1}}`],
    body: r`f(x) = \dfrac{1}{\sqrt{4x - 1}}`, answer: r`-\dfrac{2}{(4x - 1)\sqrt{4x - 1}}`, alts: ['-2(4x-1)^(-3/2)'],
    steps: ketting(r`f(x) = \dfrac{1}{\sqrt{4x - 1}}`, { buiten: r`(\ldots)^{-1/2}`, kern: '4x - 1', dBuiten: r`-\tfrac{1}{2}(4x - 1)^{-3/2}`, dKern: '4' }, r`-\tfrac{1}{2}(4x - 1)^{-3/2} \cdot 4 = -2(4x - 1)^{-3/2}`, r`-\dfrac{2}{(4x - 1)\sqrt{4x - 1}}`,
      r`Buitenste schil: $1$ gedeeld door een wortel van een expressie → schrijf als $(\ldots)^{-1/2}$ en gebruik de kettingregel.`),
  },
  {
    cluster: 'wortel_lineair', level: 3, existing: ['wortel_lineair', r`k(x) = 5\sqrt{3x - 2} + 7`],
    body: r`k(x) = 5\sqrt{3x - 2} + 7`, answer: r`\dfrac{15}{2\sqrt{3x - 2}}`, alts: ['7.5/sqrt(3x-2)', '7,5/sqrt(3x-2)'],
    steps: somKetting(r`k(x) = 5\sqrt{3x - 2} + 7`, {
      u: r`5\sqrt{3x - 2}`, v: '7', duPlain: '0', inner: 'u',
      k: { buiten: r`5\sqrt{\ldots}`, kern: '3x - 2', dBuiten: r`\dfrac{5}{2\sqrt{3x - 2}}`, dKern: '3' },
      dInner: r`\dfrac{15}{2\sqrt{3x - 2}}`, sign: '+', result: r`\dfrac{15}{2\sqrt{3x - 2}} + 0 = \dfrac{15}{2\sqrt{3x - 2}}`,
    }),
  },

  // 2d Wortel met polynoom-kern
  {
    cluster: 'wortel_polynoom', level: 1, existing: ['wortel_polynoom', r`f(x) = \sqrt{x^{2} + 1}`],
    body: r`f(x) = \sqrt{x^{2} + 1}`, answer: r`\dfrac{x}{\sqrt{x^{2} + 1}}`, alts: ['2x/(2sqrt(x^2+1))'],
    steps: ketting(r`f(x) = \sqrt{x^{2} + 1}`, { buiten: r`\sqrt{\ldots}`, kern: 'x^2 + 1', dBuiten: r`\dfrac{1}{2\sqrt{x^2 + 1}}`, dKern: '2x' }, r`\dfrac{1}{2\sqrt{x^2 + 1}} \cdot 2x`, r`\dfrac{x}{\sqrt{x^2 + 1}}`, WORTELK0),
  },
  {
    cluster: 'wortel_polynoom', level: 1, existing: ['wortel_polynoom', r`f(x) = \sqrt{x^{2} + 9}`],
    body: r`f(x) = \sqrt{x^{2} + 9}`, answer: r`\dfrac{x}{\sqrt{x^{2} + 9}}`, alts: ['2x/(2sqrt(x^2+9))'],
    steps: ketting(r`f(x) = \sqrt{x^{2} + 9}`, { buiten: r`\sqrt{\ldots}`, kern: 'x^2 + 9', dBuiten: r`\dfrac{1}{2\sqrt{x^2 + 9}}`, dKern: '2x' }, r`\dfrac{1}{2\sqrt{x^2 + 9}} \cdot 2x`, r`\dfrac{x}{\sqrt{x^2 + 9}}`, WORTELK0),
  },
  {
    cluster: 'wortel_polynoom', level: 2, existing: ['wortel_polynoom', r`g(x) = \sqrt{2x^{2} + 4x}`],
    body: r`g(x) = \sqrt{2x^{2} + 4x}`, answer: r`\dfrac{2x + 2}{\sqrt{2x^{2} + 4x}}`, alts: ['(4x+4)/(2sqrt(2x^2+4x))'],
    steps: ketting(r`g(x) = \sqrt{2x^{2} + 4x}`, { buiten: r`\sqrt{\ldots}`, kern: '2x^2 + 4x', dBuiten: r`\dfrac{1}{2\sqrt{2x^2 + 4x}}`, dKern: '4x + 4' }, r`\dfrac{1}{2\sqrt{2x^2 + 4x}} \cdot (4x + 4)`, r`\dfrac{2x + 2}{\sqrt{2x^2 + 4x}}`, WORTELK0),
  },
  {
    cluster: 'wortel_polynoom', level: 2, existing: ['wortel_polynoom', r`h(x) = \sqrt{x^{3} + 3x}`],
    body: r`h(x) = \sqrt{x^{3} + 3x}`, answer: r`\dfrac{3x^{2} + 3}{2\sqrt{x^{3} + 3x}}`,
    steps: ketting(r`h(x) = \sqrt{x^{3} + 3x}`, { buiten: r`\sqrt{\ldots}`, kern: 'x^3 + 3x', dBuiten: r`\dfrac{1}{2\sqrt{x^3 + 3x}}`, dKern: '3x^2 + 3' }, r`\dfrac{1}{2\sqrt{x^3 + 3x}} \cdot (3x^2 + 3)`, r`\dfrac{3x^2 + 3}{2\sqrt{x^3 + 3x}}`, WORTELK0),
  },
  {
    cluster: 'wortel_polynoom', level: 3, existing: ['wortel_polynoom', r`f(x) = \sqrt{x^{2} + 2x + 3}`],
    body: r`f(x) = \sqrt{x^{2} + 2x + 3}`, answer: r`\dfrac{x + 1}{\sqrt{x^{2} + 2x + 3}}`, alts: ['(2x+2)/(2sqrt(x^2+2x+3))'],
    steps: ketting(r`f(x) = \sqrt{x^{2} + 2x + 3}`, { buiten: r`\sqrt{\ldots}`, kern: 'x^2 + 2x + 3', dBuiten: r`\dfrac{1}{2\sqrt{x^2 + 2x + 3}}`, dKern: '2x + 2' }, r`\dfrac{1}{2\sqrt{x^2 + 2x + 3}} \cdot (2x + 2)`, r`\dfrac{x + 1}{\sqrt{x^2 + 2x + 3}}`, WORTELK0),
  },
  {
    cluster: 'wortel_polynoom', level: 3, existing: ['wortel_polynoom', r`k(x) = 5\sqrt{2x^{4} + x^{2}}`],
    body: r`k(x) = 5\sqrt{2x^{4} + x^{2}}`, answer: r`\dfrac{5(4x^{3} + x)}{\sqrt{2x^{4} + x^{2}}}`, alts: ['5(8x^3+2x)/(2sqrt(2x^4+x^2))', '(20x^3+5x)/sqrt(2x^4+x^2)'],
    steps: ketting(r`k(x) = 5\sqrt{2x^{4} + x^{2}}`, { buiten: r`5\sqrt{\ldots}`, kern: '2x^4 + x^2', dBuiten: r`\dfrac{5}{2\sqrt{2x^4 + x^2}}`, dKern: '8x^3 + 2x' }, r`\dfrac{5}{2\sqrt{2x^4 + x^2}} \cdot (8x^3 + 2x)`, r`\dfrac{5(4x^3 + x)}{\sqrt{2x^4 + x^2}}`,
      r`Buitenste schil: een getal maal een wortel van een expressie → kettingregel; het getal blijft voor de buitenkant staan.`),
  },

  // 2e Negatieve macht van een kern
  {
    cluster: 'negatieve_macht_expressie', level: 1, existing: ['negatieve_macht_expressie', r`f(x) = \dfrac{1}{(2x + 1)^{2}}`],
    body: r`f(x) = \dfrac{1}{(2x + 1)^{2}}`, answer: r`-\dfrac{4}{(2x + 1)^{3}}`, alts: ['-4(2x+1)^-3'],
    steps: ketting(r`f(x) = \dfrac{1}{(2x + 1)^{2}}`, { buiten: r`(\ldots)^{-2}`, kern: '2x + 1', dBuiten: '-2(2x + 1)^{-3}', dKern: '2' }, r`-2(2x + 1)^{-3} \cdot 2 = -4(2x + 1)^{-3}`, r`-\dfrac{4}{(2x + 1)^3}`, NEGK0),
  },
  {
    cluster: 'negatieve_macht_expressie', level: 1, existing: ['negatieve_macht_expressie', r`f(x) = \dfrac{1}{(3x - 2)^{3}}`],
    body: r`f(x) = \dfrac{1}{(3x - 2)^{3}}`, answer: r`-\dfrac{9}{(3x - 2)^{4}}`, alts: ['-9(3x-2)^-4'],
    steps: ketting(r`f(x) = \dfrac{1}{(3x - 2)^{3}}`, { buiten: r`(\ldots)^{-3}`, kern: '3x - 2', dBuiten: '-3(3x - 2)^{-4}', dKern: '3' }, r`-3(3x - 2)^{-4} \cdot 3 = -9(3x - 2)^{-4}`, r`-\dfrac{9}{(3x - 2)^4}`, NEGK0),
  },
  {
    cluster: 'negatieve_macht_expressie', level: 2, existing: ['negatieve_macht_expressie', r`g(x) = \dfrac{5}{(2x^{3} - 7x)^{4}}`],
    body: r`g(x) = \dfrac{5}{(2x^{3} - 7x)^{4}}`, answer: r`-\dfrac{20(6x^{2} - 7)}{(2x^{3} - 7x)^{5}}`, alts: ['-20(6x^2-7)(2x^3-7x)^-5'],
    steps: ketting(r`g(x) = \dfrac{5}{(2x^{3} - 7x)^{4}}`, { buiten: r`5(\ldots)^{-4}`, kern: '2x^3 - 7x', dBuiten: '-20(2x^3 - 7x)^{-5}', dKern: '6x^2 - 7' }, r`-20(2x^3 - 7x)^{-5} \cdot (6x^2 - 7)`, r`-\dfrac{20(6x^2 - 7)}{(2x^3 - 7x)^5}`, NEGK0),
  },
  {
    cluster: 'negatieve_macht_expressie', level: 2, existing: ['negatieve_macht_expressie', r`h(x) = \dfrac{6}{(x^{2} + 3x)^{3}}`],
    body: r`h(x) = \dfrac{6}{(x^{2} + 3x)^{3}}`, answer: r`-\dfrac{18(2x + 3)}{(x^{2} + 3x)^{4}}`, alts: ['-18(2x+3)(x^2+3x)^-4'],
    steps: ketting(r`h(x) = \dfrac{6}{(x^{2} + 3x)^{3}}`, { buiten: r`6(\ldots)^{-3}`, kern: 'x^2 + 3x', dBuiten: '-18(x^2 + 3x)^{-4}', dKern: '2x + 3' }, r`-18(x^2 + 3x)^{-4} \cdot (2x + 3)`, r`-\dfrac{18(2x + 3)}{(x^2 + 3x)^4}`, NEGK0),
  },
  {
    cluster: 'negatieve_macht_expressie', level: 3, existing: ['negatieve_macht_expressie', r`f(x) = \dfrac{3}{\sqrt{2x + 1}}`],
    body: r`f(x) = \dfrac{3}{\sqrt{2x + 1}}`, answer: r`-\dfrac{3}{(2x + 1)\sqrt{2x + 1}}`, alts: ['-3(2x+1)^(-3/2)'],
    steps: ketting(r`f(x) = \dfrac{3}{\sqrt{2x + 1}}`, { buiten: r`3(\ldots)^{-1/2}`, kern: '2x + 1', dBuiten: r`-1{,}5(2x + 1)^{-3/2}`, dKern: '2' }, r`-1{,}5(2x + 1)^{-3/2} \cdot 2 = -3(2x + 1)^{-3/2}`, r`-\dfrac{3}{(2x + 1)\sqrt{2x + 1}}`,
      r`Buitenste schil: een getal gedeeld door een wortel van een expressie → schrijf als $3(\ldots)^{-1/2}$ en gebruik de kettingregel.`),
  },
  {
    cluster: 'negatieve_macht_expressie', level: 3, existing: ['negatieve_macht_expressie', r`k(x) = \dfrac{2}{\sqrt{x^{2} + 4}}`],
    body: r`k(x) = \dfrac{2}{\sqrt{x^{2} + 4}}`, answer: r`-\dfrac{2x}{(x^{2} + 4)\sqrt{x^{2} + 4}}`, alts: ['-2x(x^2+4)^(-3/2)'],
    steps: ketting(r`k(x) = \dfrac{2}{\sqrt{x^{2} + 4}}`, { buiten: r`2(\ldots)^{-1/2}`, kern: 'x^2 + 4', dBuiten: r`-(x^2 + 4)^{-3/2}`, dKern: '2x' }, r`-(x^2 + 4)^{-3/2} \cdot 2x = -2x(x^2 + 4)^{-3/2}`, r`-\dfrac{2x}{(x^2 + 4)\sqrt{x^2 + 4}}`,
      r`Buitenste schil: een getal gedeeld door een wortel van een expressie → schrijf als $2(\ldots)^{-1/2}$ en gebruik de kettingregel.`),
  },

  // 2f Gebroken macht van een kern (nieuw)
  {
    cluster: 'gebroken_macht_kern', level: 1,
    body: r`f(x) = (2x + 1)\sqrt{2x + 1}`, answer: r`3\sqrt{2x + 1}`, alts: ['1.5(2x+1)^(1/2)*2', '3(2x+1)^(1/2)'],
    steps: ketting(r`f(x) = (2x + 1)\sqrt{2x + 1}`, { buiten: r`(\ldots)^{3/2}`, kern: '2x + 1', dBuiten: r`1{,}5(2x + 1)^{1/2} = 1{,}5\sqrt{2x + 1}`, dKern: '2' }, r`1{,}5\sqrt{2x + 1} \cdot 2`, r`3\sqrt{2x + 1}`, GEBR0),
  },
  {
    cluster: 'gebroken_macht_kern', level: 1,
    body: r`f(x) = (x^{2} + 3)\sqrt{x^{2} + 3}`, answer: r`3x\sqrt{x^{2} + 3}`, alts: ['1.5(x^2+3)^(1/2)*2x', '3x(x^2+3)^(1/2)'],
    steps: ketting(r`f(x) = (x^{2} + 3)\sqrt{x^{2} + 3}`, { buiten: r`(\ldots)^{3/2}`, kern: 'x^2 + 3', dBuiten: r`1{,}5\sqrt{x^2 + 3}`, dKern: '2x' }, r`1{,}5\sqrt{x^2 + 3} \cdot 2x`, r`3x\sqrt{x^2 + 3}`, GEBR0),
  },
  {
    cluster: 'gebroken_macht_kern', level: 2,
    body: r`g(x) = \dfrac{x^{2} + 4}{\sqrt{x^{2} + 4}}`, answer: r`\dfrac{x}{\sqrt{x^{2} + 4}}`, alts: ['2x/(2sqrt(x^2+4))'],
    steps: [
      r`Buitenste schil: een expressie gedeeld door de wortel van diezelfde expressie → vereenvoudig eerst: $\dfrac{a}{\sqrt{a}} = \sqrt{a}$. Dan is het een wortel van een expressie → kettingregel.`,
      r`Vereenvoudig en benoem: $g(x) = \sqrt{x^2 + 4}$, buitenkant $\sqrt{\ldots}$, kern $x^2 + 4$.`,
      r`Afgeleide van de buitenkant met de kern erin: $\dfrac{1}{2\sqrt{x^2 + 4}}$. Afgeleide van de kern: $2x$.`,
      r`Vermenigvuldig: $g'(x) = \dfrac{1}{2\sqrt{x^2 + 4}} \cdot 2x = \dfrac{x}{\sqrt{x^2 + 4}}$.`,
    ],
  },
  {
    cluster: 'gebroken_macht_kern', level: 2,
    body: r`h(x) = \sqrt[3]{x^{3} + 3x}`, answer: r`\dfrac{x^{2} + 1}{\sqrt[3]{(x^{3} + 3x)^{2}}}`, alts: ['(3x^2+3)/(3(x^3+3x)^(2/3))', '1/3(x^3+3x)^(-2/3)*(3x^2+3)'],
    steps: ketting(r`h(x) = \sqrt[3]{x^{3} + 3x}`, { buiten: r`(\ldots)^{1/3}`, kern: 'x^3 + 3x', dBuiten: r`\tfrac{1}{3}(x^3 + 3x)^{-2/3}`, dKern: '3x^2 + 3' }, r`\tfrac{1}{3}(x^3 + 3x)^{-2/3} \cdot (3x^2 + 3) = (x^2 + 1)(x^3 + 3x)^{-2/3}`, r`\dfrac{x^2 + 1}{\sqrt[3]{(x^3 + 3x)^2}}`,
      r`Buitenste schil: een derdemachtswortel van een expressie → schrijf als $(\ldots)^{1/3}$ en gebruik de kettingregel.`),
  },
  {
    cluster: 'gebroken_macht_kern', level: 3,
    body: r`f(x) = \dfrac{1}{(4 - x)\sqrt{4 - x}}`, answer: r`\dfrac{1{,}5}{(4 - x)^{2}\sqrt{4 - x}}`, alts: ['1.5(4-x)^(-5/2)', '3/(2(4-x)^2sqrt(4-x))'],
    steps: ketting(r`f(x) = \dfrac{1}{(4 - x)\sqrt{4 - x}}`, { buiten: r`(\ldots)^{-3/2}`, kern: '4 - x', dBuiten: r`-1{,}5(4 - x)^{-5/2}`, dKern: '-1' }, r`-1{,}5(4 - x)^{-5/2} \cdot (-1) = 1{,}5(4 - x)^{-5/2}`, r`\dfrac{1{,}5}{(4 - x)^2\sqrt{4 - x}}`,
      r`Buitenste schil: $1$ gedeeld door een expressie maal de wortel van diezelfde expressie → schrijf als $(\ldots)^{-3/2}$ en gebruik de kettingregel. Let op: de kern $4 - x$ heeft afgeleide $-1$.`),
  },
  {
    cluster: 'gebroken_macht_kern', level: 3,
    body: r`k(x) = \sqrt[3]{(2x - 1)^{2}}`, answer: r`\dfrac{4}{3\sqrt[3]{2x - 1}}`, alts: ['4/3(2x-1)^(-1/3)', '2/3(2x-1)^(-1/3)*2'],
    steps: ketting(r`k(x) = \sqrt[3]{(2x - 1)^{2}}`, { buiten: r`(\ldots)^{2/3}`, kern: '2x - 1', dBuiten: r`\tfrac{2}{3}(2x - 1)^{-1/3}`, dKern: '2' }, r`\tfrac{2}{3}(2x - 1)^{-1/3} \cdot 2 = \tfrac{4}{3}(2x - 1)^{-1/3}`, r`\dfrac{4}{3\sqrt[3]{2x - 1}}`,
      r`Buitenste schil: een derdemachtswortel van een kwadraat → schrijf als $(\ldots)^{2/3}$ en gebruik de kettingregel.`),
  },

  // 2g Kettingregel in een som (nieuw; twee bestaande verhuizen hierheen)
  {
    cluster: 'ketting_in_som', level: 1,
    body: r`f(x) = x^{2} + (2x + 1)^{4}`, answer: r`2x + 8(2x + 1)^{3}`, alts: ['2x+4(2x+1)^3*2'],
    steps: somKetting(r`f(x) = x^{2} + (2x + 1)^{4}`, {
      u: 'x^2', v: '(2x + 1)^4', duPlain: '2x', inner: 'v',
      k: { buiten: r`(\ldots)^4`, kern: '2x + 1', dBuiten: '4(2x + 1)^3', dKern: '2' },
      dInner: '8(2x + 1)^3', sign: '+', result: '2x + 8(2x + 1)^3',
    }),
  },
  {
    cluster: 'ketting_in_som', level: 1, existing: ['macht_lineair', r`k(x) = 3x^{2} - \tfrac{1}{2}(x - 2)^{3}`],
    body: r`k(x) = 3x^{2} - \tfrac{1}{2}(x - 2)^{3}`, answer: r`6x - 1{,}5(x - 2)^{2}`, alts: ['6x-3/2(x-2)^2', '6x-1.5(x-2)^2'],
    steps: somKetting(r`k(x) = 3x^{2} - \tfrac{1}{2}(x - 2)^{3}`, {
      u: '3x^2', v: r`\tfrac{1}{2}(x - 2)^3`, duPlain: '6x', inner: 'v',
      k: { buiten: r`\tfrac{1}{2}(\ldots)^3`, kern: 'x - 2', dBuiten: r`1{,}5(x - 2)^2`, dKern: '1' },
      dInner: r`1{,}5(x - 2)^2`, sign: '-', result: r`6x - 1{,}5(x - 2)^2`,
    }),
  },
  {
    cluster: 'ketting_in_som', level: 2,
    body: r`h(x) = 3x^{2} - (\tfrac{1}{4}x - 2)^{3}`, answer: r`6x - \tfrac{3}{4}(\tfrac{1}{4}x - 2)^{2}`, alts: ['6x-0.75(0.25x-2)^2', '6x-3(1/4x-2)^2*1/4'],
    steps: somKetting(r`h(x) = 3x^{2} - (\tfrac{1}{4}x - 2)^{3}`, {
      u: '3x^2', v: r`(\tfrac{1}{4}x - 2)^3`, duPlain: '6x', inner: 'v',
      k: { buiten: r`(\ldots)^3`, kern: r`\tfrac{1}{4}x - 2`, dBuiten: r`3(\tfrac{1}{4}x - 2)^2`, dKern: r`\tfrac{1}{4}` },
      dInner: r`\tfrac{3}{4}(\tfrac{1}{4}x - 2)^2`, sign: '-', result: r`6x - \tfrac{3}{4}(\tfrac{1}{4}x - 2)^2`,
    }),
  },
  {
    cluster: 'ketting_in_som', level: 2,
    body: r`f(x) = (\tfrac{1}{4}x - 1)^{4} - x + 2`, answer: r`(\tfrac{1}{4}x - 1)^{3} - 1`, alts: ['(0.25x-1)^3-1', '4(1/4x-1)^3*1/4-1'],
    steps: somKetting(r`f(x) = (\tfrac{1}{4}x - 1)^{4} - x + 2`, {
      u: r`(\tfrac{1}{4}x - 1)^4`, v: '-x + 2', duPlain: '-1', inner: 'u',
      k: { buiten: r`(\ldots)^4`, kern: r`\tfrac{1}{4}x - 1`, dBuiten: r`4(\tfrac{1}{4}x - 1)^3`, dKern: r`\tfrac{1}{4}` },
      dInner: r`(\tfrac{1}{4}x - 1)^3`, sign: '+', result: r`(\tfrac{1}{4}x - 1)^3 - 1`,
    }, r`Buitenste schil: termen met $+$ en $-$ ertussen → somregel; de eerste term is haakjes tot een macht en vraagt de kettingregel.`),
  },
  {
    cluster: 'ketting_in_som', level: 3, existing: ['macht_lineair', r`f(x) = 5x - \dfrac{4}{(3x + 2)^{3}}`],
    body: r`f(x) = 5x - \dfrac{4}{(3x + 2)^{3}}`, answer: r`5 + \dfrac{36}{(3x + 2)^{4}}`, alts: ['5+36(3x+2)^-4'],
    steps: somKetting(r`f(x) = 5x - \dfrac{4}{(3x + 2)^{3}}`, {
      u: '5x', v: r`\dfrac{4}{(3x + 2)^3} = 4(3x + 2)^{-3}`, duPlain: '5', inner: 'v',
      k: { buiten: r`4(\ldots)^{-3}`, kern: '3x + 2', dBuiten: '-12(3x + 2)^{-4}', dKern: '3' },
      dInner: r`-36(3x + 2)^{-4} = -\dfrac{36}{(3x + 2)^4}`, sign: '-', result: r`5 - \left(-\dfrac{36}{(3x + 2)^4}\right) = 5 + \dfrac{36}{(3x + 2)^4}`,
    }, r`Buitenste schil: een $-$ tussen twee delen → somregel; de breuk schrijf je als $4(\ldots)^{-3}$ en die vraagt de kettingregel.`),
  },
  {
    cluster: 'ketting_in_som', level: 3,
    body: r`f(x) = \sqrt{x^{2} + 9} - x^{2} + 5x`, answer: r`\dfrac{x}{\sqrt{x^{2} + 9}} - 2x + 5`, alts: ['2x/(2sqrt(x^2+9))-2x+5', 'x/sqrt(x^2+9)-(2x-5)'],
    steps: somKetting(r`f(x) = \sqrt{x^{2} + 9} - x^{2} + 5x`, {
      u: r`\sqrt{x^2 + 9}`, v: 'x^2 - 5x', duPlain: '2x - 5', inner: 'u',
      k: { buiten: r`\sqrt{\ldots}`, kern: 'x^2 + 9', dBuiten: r`\dfrac{1}{2\sqrt{x^2 + 9}}`, dKern: '2x' },
      dInner: r`\dfrac{x}{\sqrt{x^2 + 9}}`, sign: '-', result: r`\dfrac{x}{\sqrt{x^2 + 9}} - (2x - 5) = \dfrac{x}{\sqrt{x^2 + 9}} - 2x + 5`,
    }, r`Buitenste schil: termen met $-$ en $+$ ertussen → somregel, hier als $u - v$ met $v = x^2 - 5x$; de wortel vraagt de kettingregel.`),
  },

  // ═══ Topic 3 · Kettingregel gecombineerd ═════════════════════════════════
  // 3a Kettingregel + productregel (antwoord: ingevuld, haakjes en wortels laten staan)
  {
    cluster: 'ketting_plus_product', level: 1, existing: ['ketting_plus_product', r`f(x) = x\sqrt{2x + 1}`],
    body: r`f(x) = x\sqrt{2x + 1}`, answer: r`\sqrt{2x + 1} + \dfrac{x}{\sqrt{2x + 1}}`, alts: ['(3x+1)/sqrt(2x+1)'],
    steps: kettingCombi(r`f(x) = x\sqrt{2x + 1}`, {
      outer: 'product', g: 'x', h: r`\sqrt{2x + 1}`, dg: '1', dh: r`\dfrac{1}{\sqrt{2x + 1}}`, kettingIn: 'h',
      k: { buiten: r`\sqrt{\ldots}`, kern: '2x + 1', dBuiten: r`\dfrac{1}{2\sqrt{2x + 1}}`, dKern: '2' },
      result: r`1 \cdot \sqrt{2x + 1} + x \cdot \dfrac{1}{\sqrt{2x + 1}} = \sqrt{2x + 1} + \dfrac{x}{\sqrt{2x + 1}}`,
    }),
  },
  {
    cluster: 'ketting_plus_product', level: 1, existing: ['ketting_plus_product', r`f(x) = x(2x + 1)^{3}`],
    body: r`f(x) = x(2x + 1)^{3}`, answer: r`(2x + 1)^{3} + 6x(2x + 1)^{2}`, alts: ['(2x+1)^2(8x+1)'],
    steps: kettingCombi(r`f(x) = x(2x + 1)^{3}`, {
      outer: 'product', g: 'x', h: '(2x + 1)^3', dg: '1', dh: '6(2x + 1)^2', kettingIn: 'h',
      k: { buiten: r`(\ldots)^3`, kern: '2x + 1', dBuiten: '3(2x + 1)^2', dKern: '2' },
      result: r`1 \cdot (2x + 1)^3 + x \cdot 6(2x + 1)^2 = (2x + 1)^3 + 6x(2x + 1)^2`,
    }),
  },
  {
    cluster: 'ketting_plus_product', level: 2, existing: ['ketting_plus_product', r`g(x) = x\sqrt{3x + 1}`],
    body: r`g(x) = x\sqrt{3x + 1}`, answer: r`\sqrt{3x + 1} + \dfrac{3x}{2\sqrt{3x + 1}}`, alts: ['(9x+2)/(2sqrt(3x+1))'],
    steps: kettingCombi(r`g(x) = x\sqrt{3x + 1}`, {
      outer: 'product', g: 'x', h: r`\sqrt{3x + 1}`, dg: '1', dh: r`\dfrac{3}{2\sqrt{3x + 1}}`, kettingIn: 'h',
      k: { buiten: r`\sqrt{\ldots}`, kern: '3x + 1', dBuiten: r`\dfrac{1}{2\sqrt{3x + 1}}`, dKern: '3' },
      result: r`1 \cdot \sqrt{3x + 1} + x \cdot \dfrac{3}{2\sqrt{3x + 1}} = \sqrt{3x + 1} + \dfrac{3x}{2\sqrt{3x + 1}}`,
    }),
  },
  {
    cluster: 'ketting_plus_product', level: 2, existing: ['ketting_plus_product', r`h(x) = x(3x + 1)^{3}`],
    body: r`h(x) = x(3x + 1)^{3}`, answer: r`(3x + 1)^{3} + 9x(3x + 1)^{2}`, alts: ['(3x+1)^2(12x+1)'],
    steps: kettingCombi(r`h(x) = x(3x + 1)^{3}`, {
      outer: 'product', g: 'x', h: '(3x + 1)^3', dg: '1', dh: '9(3x + 1)^2', kettingIn: 'h',
      k: { buiten: r`(\ldots)^3`, kern: '3x + 1', dBuiten: '3(3x + 1)^2', dKern: '3' },
      result: r`1 \cdot (3x + 1)^3 + x \cdot 9(3x + 1)^2 = (3x + 1)^3 + 9x(3x + 1)^2`,
    }),
  },
  {
    cluster: 'ketting_plus_product', level: 3, existing: ['ketting_plus_product', r`f(x) = x^{2}\sqrt{x + 1}`],
    body: r`f(x) = x^{2}\sqrt{x + 1}`, answer: r`2x\sqrt{x + 1} + \dfrac{x^{2}}{2\sqrt{x + 1}}`, alts: ['(5x^2+4x)/(2sqrt(x+1))'],
    steps: kettingCombi(r`f(x) = x^{2}\sqrt{x + 1}`, {
      outer: 'product', g: 'x^2', h: r`\sqrt{x + 1}`, dg: '2x', dh: r`\dfrac{1}{2\sqrt{x + 1}}`, kettingIn: 'h',
      k: { buiten: r`\sqrt{\ldots}`, kern: 'x + 1', dBuiten: r`\dfrac{1}{2\sqrt{x + 1}}`, dKern: '1' },
      result: r`2x \cdot \sqrt{x + 1} + x^2 \cdot \dfrac{1}{2\sqrt{x + 1}} = 2x\sqrt{x + 1} + \dfrac{x^2}{2\sqrt{x + 1}}`,
    }),
  },
  {
    cluster: 'ketting_plus_product', level: 3, existing: ['ketting_plus_product', r`k(x) = (x + 1)(2x - 1)^{3}`],
    body: r`k(x) = (x + 1)(2x - 1)^{3}`, answer: r`(2x - 1)^{3} + 6(x + 1)(2x - 1)^{2}`, alts: ['(2x-1)^2(8x+5)'],
    steps: kettingCombi(r`k(x) = (x + 1)(2x - 1)^{3}`, {
      outer: 'product', g: 'x + 1', h: '(2x - 1)^3', dg: '1', dh: '6(2x - 1)^2', kettingIn: 'h',
      k: { buiten: r`(\ldots)^3`, kern: '2x - 1', dBuiten: '3(2x - 1)^2', dKern: '2' },
      result: r`1 \cdot (2x - 1)^3 + (x + 1) \cdot 6(2x - 1)^2 = (2x - 1)^3 + 6(x + 1)(2x - 1)^2`,
    }),
  },

  // 3b Kettingregel + quotiëntregel (antwoord: ingevuld, noemer als kwadraat)
  {
    cluster: 'ketting_plus_quotient', level: 1, existing: ['ketting_plus_quotient', r`f(x) = \dfrac{x + 6}{\sqrt{8x + 9}}`],
    body: r`f(x) = \dfrac{x + 6}{\sqrt{8x + 9}}`, answer: r`\dfrac{\sqrt{8x + 9} - \dfrac{4(x + 6)}{\sqrt{8x + 9}}}{8x + 9}`, alts: ['(4x-15)/((8x+9)sqrt(8x+9))'],
    steps: kettingCombi(r`f(x) = \dfrac{x + 6}{\sqrt{8x + 9}}`, {
      outer: 'quotient', g: 'x + 6', h: r`\sqrt{8x + 9}`, dg: '1', dh: r`\dfrac{4}{\sqrt{8x + 9}}`, kettingIn: 'h',
      k: { buiten: r`\sqrt{\ldots}`, kern: '8x + 9', dBuiten: r`\dfrac{1}{2\sqrt{8x + 9}}`, dKern: '8' },
      result: r`\dfrac{1 \cdot \sqrt{8x + 9} - (x + 6) \cdot \dfrac{4}{\sqrt{8x + 9}}}{(\sqrt{8x + 9})^2} = \dfrac{\sqrt{8x + 9} - \dfrac{4(x + 6)}{\sqrt{8x + 9}}}{8x + 9}`,
    }),
  },
  {
    cluster: 'ketting_plus_quotient', level: 1, existing: ['ketting_plus_quotient', r`f(x) = \dfrac{x}{\sqrt{2x + 1}}`],
    body: r`f(x) = \dfrac{x}{\sqrt{2x + 1}}`, answer: r`\dfrac{\sqrt{2x + 1} - \dfrac{x}{\sqrt{2x + 1}}}{2x + 1}`, alts: ['(x+1)/((2x+1)sqrt(2x+1))'],
    steps: kettingCombi(r`f(x) = \dfrac{x}{\sqrt{2x + 1}}`, {
      outer: 'quotient', g: 'x', h: r`\sqrt{2x + 1}`, dg: '1', dh: r`\dfrac{1}{\sqrt{2x + 1}}`, kettingIn: 'h',
      k: { buiten: r`\sqrt{\ldots}`, kern: '2x + 1', dBuiten: r`\dfrac{1}{2\sqrt{2x + 1}}`, dKern: '2' },
      result: r`\dfrac{1 \cdot \sqrt{2x + 1} - x \cdot \dfrac{1}{\sqrt{2x + 1}}}{(\sqrt{2x + 1})^2} = \dfrac{\sqrt{2x + 1} - \dfrac{x}{\sqrt{2x + 1}}}{2x + 1}`,
    }),
  },
  {
    cluster: 'ketting_plus_quotient', level: 2, existing: ['ketting_plus_quotient', r`g(x) = \dfrac{\sqrt{x^{2} + 1}}{2x + 1}`],
    body: r`g(x) = \dfrac{\sqrt{x^{2} + 1}}{2x + 1}`, answer: r`\dfrac{\dfrac{x(2x + 1)}{\sqrt{x^{2} + 1}} - 2\sqrt{x^{2} + 1}}{(2x + 1)^{2}}`, alts: ['(x(2x+1)/sqrt(x^2+1)-2sqrt(x^2+1))/(2x+1)^2'],
    steps: kettingCombi(r`g(x) = \dfrac{\sqrt{x^{2} + 1}}{2x + 1}`, {
      outer: 'quotient', g: r`\sqrt{x^2 + 1}`, h: '2x + 1', dg: r`\dfrac{x}{\sqrt{x^2 + 1}}`, dh: '2', kettingIn: 'g',
      k: { buiten: r`\sqrt{\ldots}`, kern: 'x^2 + 1', dBuiten: r`\dfrac{1}{2\sqrt{x^2 + 1}}`, dKern: '2x' },
      result: r`\dfrac{\dfrac{x}{\sqrt{x^2 + 1}} \cdot (2x + 1) - \sqrt{x^2 + 1} \cdot 2}{(2x + 1)^2} = \dfrac{\dfrac{x(2x + 1)}{\sqrt{x^2 + 1}} - 2\sqrt{x^2 + 1}}{(2x + 1)^2}`,
    }),
  },
  {
    cluster: 'ketting_plus_quotient', level: 2, existing: ['ketting_plus_quotient', r`h(x) = \dfrac{x^{2} - 1}{\sqrt{4x + 1}}`],
    body: r`h(x) = \dfrac{x^{2} - 1}{\sqrt{4x + 1}}`, answer: r`\dfrac{2x\sqrt{4x + 1} - \dfrac{2(x^{2} - 1)}{\sqrt{4x + 1}}}{4x + 1}`, alts: ['(2xsqrt(4x+1)-2(x^2-1)/sqrt(4x+1))/(4x+1)'],
    steps: kettingCombi(r`h(x) = \dfrac{x^{2} - 1}{\sqrt{4x + 1}}`, {
      outer: 'quotient', g: 'x^2 - 1', h: r`\sqrt{4x + 1}`, dg: '2x', dh: r`\dfrac{2}{\sqrt{4x + 1}}`, kettingIn: 'h',
      k: { buiten: r`\sqrt{\ldots}`, kern: '4x + 1', dBuiten: r`\dfrac{1}{2\sqrt{4x + 1}}`, dKern: '4' },
      result: r`\dfrac{2x \cdot \sqrt{4x + 1} - (x^2 - 1) \cdot \dfrac{2}{\sqrt{4x + 1}}}{(\sqrt{4x + 1})^2} = \dfrac{2x\sqrt{4x + 1} - \dfrac{2(x^2 - 1)}{\sqrt{4x + 1}}}{4x + 1}`,
    }),
  },
  {
    cluster: 'ketting_plus_quotient', level: 3, existing: ['ketting_plus_quotient', r`f(x) = \dfrac{(2x + 1)^{2}}{x + 1}`],
    body: r`f(x) = \dfrac{(2x + 1)^{2}}{x + 1}`, answer: r`\dfrac{4(2x + 1)(x + 1) - (2x + 1)^{2}}{(x + 1)^{2}}`, alts: ['(2x+1)(2x+3)/(x+1)^2'],
    steps: kettingCombi(r`f(x) = \dfrac{(2x + 1)^{2}}{x + 1}`, {
      outer: 'quotient', g: '(2x + 1)^2', h: 'x + 1', dg: '4(2x + 1)', dh: '1', kettingIn: 'g',
      k: { buiten: r`(\ldots)^2`, kern: '2x + 1', dBuiten: '2(2x + 1)', dKern: '2' },
      result: r`\dfrac{4(2x + 1) \cdot (x + 1) - (2x + 1)^2 \cdot 1}{(x + 1)^2} = \dfrac{4(2x + 1)(x + 1) - (2x + 1)^2}{(x + 1)^2}`,
    }),
  },
  {
    cluster: 'ketting_plus_quotient', level: 3, existing: ['ketting_plus_quotient', r`k(x) = \dfrac{x^{2} + 1}{(3x - 2)^{2}}`],
    body: r`k(x) = \dfrac{x^{2} + 1}{(3x - 2)^{2}}`, answer: r`\dfrac{2x(3x - 2)^{2} - 6(x^{2} + 1)(3x - 2)}{(3x - 2)^{4}}`, alts: ['(2x(3x-2)-6(x^2+1))/(3x-2)^3'],
    steps: kettingCombi(r`k(x) = \dfrac{x^{2} + 1}{(3x - 2)^{2}}`, {
      outer: 'quotient', g: 'x^2 + 1', h: '(3x - 2)^2', dg: '2x', dh: '6(3x - 2)', kettingIn: 'h',
      k: { buiten: r`(\ldots)^2`, kern: '3x - 2', dBuiten: '2(3x - 2)', dKern: '3' },
      result: r`\dfrac{2x \cdot (3x - 2)^2 - (x^2 + 1) \cdot 6(3x - 2)}{((3x - 2)^2)^2} = \dfrac{2x(3x - 2)^2 - 6(x^2 + 1)(3x - 2)}{(3x - 2)^4}`,
    }),
  },

  // ═══ Topic 4 · Gemengd: welke regel? ═════════════════════════════════════
  {
    cluster: 'welke_regel', level: 1,
    body: r`f(x) = \dfrac{4}{x^{3}}`, answer: r`-\dfrac{12}{x^{4}}`, alts: ['-12x^-4'],
    steps: herschrijf(r`f(x) = \dfrac{4}{x^{3}}`, '4x^{-3}', [['4x^{-3}', '-12x^{-4}']], r`-\dfrac{12}{x^4}`,
      r`Buitenste schil: een getal gedeeld door een macht van $x$ → geen quotiëntregel nodig, herschrijf als $4x^{-3}$ en gebruik de machtsregel.`),
  },
  {
    cluster: 'welke_regel', level: 1,
    body: r`f(x) = (3x - 1)^{4}`, answer: r`12(3x - 1)^{3}`, alts: ['4(3x-1)^3*3'],
    steps: ketting(r`f(x) = (3x - 1)^{4}`, { buiten: r`(\ldots)^4`, kern: '3x - 1', dBuiten: '4(3x - 1)^3', dKern: '3' }, r`4(3x - 1)^3 \cdot 3`, '12(3x - 1)^3',
      r`Buitenste schil: haakjes tot de vierde macht → uitwerken is veel werk, kettingregel is de weg.`),
  },
  {
    cluster: 'welke_regel', level: 1,
    body: r`f(x) = \dfrac{x^{3} + 5x^{2}}{x}`, answer: r`2x + 5`,
    steps: uitdelen(r`f(x) = \dfrac{x^{3} + 5x^{2}}{x}`, r`\dfrac{x^3}{x} + \dfrac{5x^2}{x}`, 'x^2 + 5x', [['x^2', '2x'], ['5x', '5']], '2x + 5',
      r`Buitenste schil: een breuk met één term in de noemer → uitdelen is sneller dan de quotiëntregel.`),
  },
  {
    cluster: 'welke_regel', level: 1,
    body: r`f(x) = (x^{2} - 4)(x^{3} + 1)`, answer: r`2x(x^{3} + 1) + (x^{2} - 4) \cdot 3x^{2}`, alts: ['5x^4-12x^2+2x'],
    steps: product(r`f(x) = (x^{2} - 4)(x^{3} + 1)`, { g: 'x^2 - 4', h: 'x^3 + 1', dg: '2x', dh: '3x^2' }, r`2x(x^3 + 1) + (x^2 - 4) \cdot 3x^2`,
      r`Buitenste schil: twee polynomen met een $\cdot$ ertussen → productregel (uitwerken mag ook).`),
  },
  {
    cluster: 'welke_regel', level: 2,
    body: r`f(x) = \dfrac{2x^{3}}{x^{2} + 4}`, answer: r`\dfrac{2x^{4} + 24x^{2}}{(x^{2} + 4)^{2}}`, alts: ['(6x^2(x^2+4)-2x^3*2x)/(x^2+4)^2'],
    steps: quotient(r`f(x) = \dfrac{2x^{3}}{x^{2} + 4}`, { g: '2x^3', h: 'x^2 + 4', dg: '6x^2', dh: '2x' }, r`6x^2(x^2 + 4) - 2x^3 \cdot 2x`, '2x^4 + 24x^2',
      r`Buitenste schil: een breuk met een som in de noemer → uitdelen kan niet, dus quotiëntregel.`),
  },
  {
    cluster: 'welke_regel', level: 2,
    body: r`g(x) = \dfrac{x^{2} + 4}{2x^{3}}`, answer: r`-\dfrac{1}{2x^{2}} - \dfrac{6}{x^{4}}`, alts: ['-1/2x^-2-6x^-4', '-0.5/x^2-6/x^4'],
    steps: uitdelen(r`g(x) = \dfrac{x^{2} + 4}{2x^{3}}`, r`\dfrac{x^2}{2x^3} + \dfrac{4}{2x^3}`, r`\tfrac{1}{2}x^{-1} + 2x^{-3}`, [[r`\tfrac{1}{2}x^{-1}`, r`-\tfrac{1}{2}x^{-2}`], ['2x^{-3}', '-6x^{-4}']], r`-\dfrac{1}{2x^2} - \dfrac{6}{x^4}`,
      r`Buitenste schil: een breuk met één term in de noemer ($2x^3$) → uitdelen, geen quotiëntregel nodig.`),
  },
  {
    cluster: 'welke_regel', level: 2,
    body: r`f(x) = \sqrt{5x - 2}`, answer: r`\dfrac{5}{2\sqrt{5x - 2}}`, alts: ['2.5/sqrt(5x-2)'],
    steps: ketting(r`f(x) = \sqrt{5x - 2}`, { buiten: r`\sqrt{\ldots}`, kern: '5x - 2', dBuiten: r`\dfrac{1}{2\sqrt{5x - 2}}`, dKern: '5' }, r`\dfrac{1}{2\sqrt{5x - 2}} \cdot 5`, r`\dfrac{5}{2\sqrt{5x - 2}}`,
      r`Buitenste schil: een wortel van een expressie (niet alleen $x$) → kettingregel.`),
  },
  {
    cluster: 'welke_regel', level: 2,
    body: r`f(x) = x\sqrt{x} - 3x`, answer: r`1{,}5\sqrt{x} - 3`, alts: ['3/2sqrt(x)-3', '1.5x^(1/2)-3'],
    steps: herschrijf(r`f(x) = x\sqrt{x} - 3x`, 'x^{3/2} - 3x', [['x^{3/2}', r`\tfrac{3}{2}x^{1/2}`], ['-3x', '-3']], r`1{,}5\sqrt{x} - 3`,
      r`Buitenste schil: een $-$ tussen twee termen → somregel; $x\sqrt{x}$ is geen kettingregel maar een macht van $x$: $x^{3/2}$.`),
  },
  {
    cluster: 'welke_regel', level: 3,
    body: r`f(x) = x(x^{2} + 1)^{4}`, answer: r`(x^{2} + 1)^{4} + 8x^{2}(x^{2} + 1)^{3}`, alts: ['(x^2+1)^3(9x^2+1)'],
    steps: kettingCombi(r`f(x) = x(x^{2} + 1)^{4}`, {
      outer: 'product', g: 'x', h: '(x^2 + 1)^4', dg: '1', dh: '8x(x^2 + 1)^3', kettingIn: 'h',
      k: { buiten: r`(\ldots)^4`, kern: 'x^2 + 1', dBuiten: '4(x^2 + 1)^3', dKern: '2x' },
      result: r`1 \cdot (x^2 + 1)^4 + x \cdot 8x(x^2 + 1)^3 = (x^2 + 1)^4 + 8x^2(x^2 + 1)^3`,
    }, r`Buitenste schil: $x$ maal haakjes tot een macht → productregel; in de tweede factor zit de kettingregel.`),
  },
  {
    cluster: 'welke_regel', level: 3,
    body: r`f(x) = \dfrac{6}{(x^{2} + 1)^{2}}`, answer: r`-\dfrac{24x}{(x^{2} + 1)^{3}}`, alts: ['-24x(x^2+1)^-3'],
    steps: ketting(r`f(x) = \dfrac{6}{(x^{2} + 1)^{2}}`, { buiten: r`6(\ldots)^{-2}`, kern: 'x^2 + 1', dBuiten: '-12(x^2 + 1)^{-3}', dKern: '2x' }, r`-12(x^2 + 1)^{-3} \cdot 2x = -24x(x^2 + 1)^{-3}`, r`-\dfrac{24x}{(x^2 + 1)^3}`,
      r`Buitenste schil: een getal gedeeld door een expressie tot een macht → schrijf als $6(\ldots)^{-2}$ en gebruik de kettingregel; de quotiëntregel is hier een omweg.`),
  },
  {
    cluster: 'welke_regel', level: 3,
    body: r`h(x) = \dfrac{x + 2}{4x}`, answer: r`-\dfrac{1}{2x^{2}}`, alts: ['-1/2x^-2', '-0.5/x^2'],
    steps: uitdelen(r`h(x) = \dfrac{x + 2}{4x}`, r`\dfrac{x}{4x} + \dfrac{2}{4x}`, r`\tfrac{1}{4} + \tfrac{1}{2}x^{-1}`, [[r`\tfrac{1}{4}`, '0'], [r`\tfrac{1}{2}x^{-1}`, r`-\tfrac{1}{2}x^{-2}`]], r`-\dfrac{1}{2x^2}`,
      r`Buitenste schil: een breuk met één term in de noemer ($4x$) → uitdelen; de quotiëntregel werkt ook maar is meer werk.`),
  },
  {
    cluster: 'welke_regel', level: 3,
    body: r`f(x) = \dfrac{2}{x\sqrt{x}} - x^{2}`, answer: r`-\dfrac{3}{x^{2}\sqrt{x}} - 2x`, alts: ['-3x^(-5/2)-2x'],
    steps: herschrijf(r`f(x) = \dfrac{2}{x\sqrt{x}} - x^{2}`, '2x^{-3/2} - x^2', [['2x^{-3/2}', '-3x^{-5/2}'], ['-x^2', '-2x']], r`-\dfrac{3}{x^2\sqrt{x}} - 2x`,
      r`Buitenste schil: een $-$ tussen twee termen → somregel; $\dfrac{2}{x\sqrt{x}}$ is een macht van $x$ ($2x^{-3/2}$), geen kettingregel.`),
  },
]

export const H6: ChapterContent = {
  chapterSlug: 'h6',
  migrationFile: '0033_h6_stappenplan.sql',
  headerTitle: 'H6 "Machten, wortels en de kettingregel" — herindeling + stappenplan',
  specDoc: 'docs/h6-afgeleide-berekenen.md',
  sourceScript: 'scripts/h6-content.ts',
  headerNotes: [
    'Kettingregel zonder letters: "buitenkant" en "kern" (u/v = somregel, g/h = product- en',
    'quotiëntregel, zoals in H2). Antwoorden zonder negatieve of gebroken exponent.',
  ],
  summaryFirst: 'Nieuw topic h6_gemengd + 4 nieuwe clusters; topic h6_machten hertiteld; 1 kapotte vraag vervangen',
  topicsNew: TOPICS_NEW,
  topicRetitle: [{ slug: 'h6_machten', title: 'Machten en wortels herschrijven' }],
  clusters: CLUSTERS,
  oldClusterTopic: OLD_CLUSTER_TOPIC,
  questions: Q,
}

export { Q, CLUSTERS }

if (require.main === module) writeMigration(H6)
