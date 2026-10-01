/**
 * Bron van de H2-oefencontent ("De afgeleide berekenen") volgens
 * docs/h2-afgeleide-berekenen.md. Genereert de SQL-migratie
 * supabase/migrations/0032_h2_stappenplan.sql.
 *
 *   npx tsx scripts/h2-content.ts          → schrijft de migratie
 *
 * Sjablonen en generator: scripts/lib/stappenplan-content.ts.
 */
import {
  r,
  termsgewijs,
  uitwerken,
  product,
  KWADRAAT0,
  quotient,
  somGenest,
  drieFactoren,
  toPlain,
  writeMigration,
  type ClusterDef,
  type Q as QDef,
  type ChapterContent,
} from './lib/stappenplan-content'

const TOPICS_NEW = [
  { slug: 'h2_gemengd', title: 'Gemengd: welke regel?', order: 5 },
]

const CLUSTERS: ClusterDef[] = [
  // Topic 1 · Termsgewijs differentiëren
  { topic: 'h2_termsgewijs', slug: 'gehele_coefficienten', title: 'Gehele coëfficiënten', order: 1, renameFrom: 'polynoom_differentieren' },
  { topic: 'h2_termsgewijs', slug: 'breuken_decimalen', title: 'Breuken en decimalen', order: 2 },
  { topic: 'h2_termsgewijs', slug: 'andere_letters', title: 'Andere letters', order: 3 },
  // Topic 2 · Haakjes uitwerken vóór differentiëren
  { topic: 'h2_haakjes_eerst', slug: 'twee_lineaire_factoren', title: 'Twee lineaire factoren', order: 1, renameFrom: 'product_uitwerken' },
  { topic: 'h2_haakjes_eerst', slug: 'merkwaardig_product', title: 'Merkwaardig product', order: 2, renameFrom: 'merkwaardige_producten' },
  { topic: 'h2_haakjes_eerst', slug: 'constante_factor', title: 'Constante factor en extra termen', order: 3 },
  { topic: 'h2_haakjes_eerst', slug: 'hogere_graad', title: 'Hogere graad', order: 4 },
  // Topic 3 · De productregel
  { topic: 'h2_productregel', slug: 'twee_polynomen', title: 'Twee polynomen', order: 1 },
  { topic: 'h2_productregel', slug: 'kwadraat_als_product', title: 'Kwadraat als product', order: 2, renameFrom: 'kwadraat_van_polynoom' },
  { topic: 'h2_productregel', slug: 'genest_in_som', title: 'Genest in een som', order: 3 },
  { topic: 'h2_productregel', slug: 'drie_factoren', title: 'Drie factoren', order: 4 },
  // Topic 4 · De quotiëntregel
  { topic: 'h2_quotientregel', slug: 'lineair_door_lineair', title: 'Lineair gedeeld door lineair', order: 1, renameFrom: 'eenvoudige_breuk' },
  { topic: 'h2_quotientregel', slug: 'polynoom_breuk', title: 'Polynoom-breuk', order: 2 },
  { topic: 'h2_quotientregel', slug: 'som_met_breuk', title: 'Som met breuk', order: 3 },
  // Topic 5 · Gemengd
  { topic: 'h2_gemengd', slug: 'welke_regel', title: 'Welke regel?', order: 1 },
]

const Q: QDef[] = [
  // ═══ Topic 1 · Termsgewijs ═══════════════════════════════════════════════
  // 1a Gehele coëfficiënten
  {
    cluster: 'gehele_coefficienten', level: 1,
    existing: ['polynoom_differentieren', r`f(x) = 5x^{6} - 3x^{5} + 2x - 7`],
    body: r`f(x) = 5x^{6} - 3x^{5} + 2x - 7`, answer: r`30x^{5} - 15x^{4} + 2`,
    steps: termsgewijs(r`f(x) = 5x^{6} - 3x^{5} + 2x - 7`, [['5x^6', '30x^5'], ['-3x^5', '-15x^4'], ['2x', '2'], ['-7', '0']], '30x^5 - 15x^4 + 2'),
  },
  {
    cluster: 'gehele_coefficienten', level: 1,
    existing: ['polynoom_differentieren', r`f(x) = 2x^{3} - 5x^{2} + 8x - 4`],
    body: r`f(x) = 2x^{3} - 5x^{2} + 8x - 4`, answer: r`6x^{2} - 10x + 8`,
    steps: termsgewijs(r`f(x) = 2x^{3} - 5x^{2} + 8x - 4`, [['2x^3', '6x^2'], ['-5x^2', '-10x'], ['8x', '8'], ['-4', '0']], '6x^2 - 10x + 8'),
  },
  {
    cluster: 'gehele_coefficienten', level: 2,
    body: r`f(x) = 4x^{5} - 2x^{3} + 6x - 9`, answer: r`20x^{4} - 6x^{2} + 6`,
    steps: termsgewijs(r`f(x) = 4x^{5} - 2x^{3} + 6x - 9`, [['4x^5', '20x^4'], ['-2x^3', '-6x^2'], ['6x', '6'], ['-9', '0']], '20x^4 - 6x^2 + 6'),
  },
  {
    cluster: 'gehele_coefficienten', level: 2,
    body: r`g(x) = x^{7} - 3x^{4} + x^{2}`, answer: r`7x^{6} - 12x^{3} + 2x`,
    steps: termsgewijs(r`g(x) = x^{7} - 3x^{4} + x^{2}`, [['x^7', '7x^6'], ['-3x^4', '-12x^3'], ['x^2', '2x']], '7x^6 - 12x^3 + 2x'),
  },
  {
    cluster: 'gehele_coefficienten', level: 3,
    body: r`f(x) = -3x^{6} + x^{5} - 4x^{2} + 11`, answer: r`-18x^{5} + 5x^{4} - 8x`,
    steps: termsgewijs(r`f(x) = -3x^{6} + x^{5} - 4x^{2} + 11`, [['-3x^6', '-18x^5'], ['x^5', '5x^4'], ['-4x^2', '-8x'], ['11', '0']], '-18x^5 + 5x^4 - 8x'),
  },
  {
    cluster: 'gehele_coefficienten', level: 3,
    body: r`f(x) = 9 - 2x^{4} + 5x^{9} - x`, answer: r`45x^{8} - 8x^{3} - 1`, alts: ['-8x^3+45x^8-1'],
    steps: termsgewijs(r`f(x) = 9 - 2x^{4} + 5x^{9} - x`, [['9', '0'], ['-2x^4', '-8x^3'], ['5x^9', '45x^8'], ['-x', '-1']], '45x^8 - 8x^3 - 1'),
  },

  // 1b Breuken en decimalen
  {
    cluster: 'breuken_decimalen', level: 1,
    existing: ['polynoom_differentieren', r`f(x) = -2x^{8} - 4x^{4} + 7{,}2`],
    body: r`f(x) = -2x^{8} - 4x^{4} + 7{,}2`, answer: r`-16x^{7} - 16x^{3}`,
    steps: termsgewijs(r`f(x) = -2x^{8} - 4x^{4} + 7{,}2`, [['-2x^8', '-16x^7'], ['-4x^4', '-16x^3'], ['7{,}2', '0']], '-16x^7 - 16x^3'),
  },
  {
    cluster: 'breuken_decimalen', level: 1,
    body: r`f(x) = \tfrac{1}{2}x^{4} - \tfrac{1}{3}x^{3} + 2x`, answer: r`2x^{3} - x^{2} + 2`,
    steps: termsgewijs(r`f(x) = \tfrac{1}{2}x^{4} - \tfrac{1}{3}x^{3} + 2x`, [[r`\tfrac{1}{2}x^4`, r`4 \cdot \tfrac{1}{2}x^3 = 2x^3`], [r`-\tfrac{1}{3}x^3`, r`-3 \cdot \tfrac{1}{3}x^2 = -x^2`], ['2x', '2']], '2x^3 - x^2 + 2'),
  },
  {
    cluster: 'breuken_decimalen', level: 2,
    existing: ['polynoom_differentieren', r`f(x) = 0{,}6x^{3} - 1{,}3x^{2} + 7`],
    body: r`f(x) = 0{,}6x^{3} - 1{,}3x^{2} + 7`, answer: r`1{,}8x^{2} - 2{,}6x`, alts: ['1.8x^2-2.6x'],
    steps: termsgewijs(r`f(x) = 0{,}6x^{3} - 1{,}3x^{2} + 7`, [['0{,}6x^3', r`3 \cdot 0{,}6x^2 = 1{,}8x^2`], ['-1{,}3x^2', r`-2 \cdot 1{,}3x = -2{,}6x`], ['7', '0']], '1{,}8x^2 - 2{,}6x'),
  },
  {
    cluster: 'breuken_decimalen', level: 2,
    body: r`f(x) = 0{,}4x^{5} - 1{,}5x^{2} + 3{,}2`, answer: r`2x^{4} - 3x`,
    steps: termsgewijs(r`f(x) = 0{,}4x^{5} - 1{,}5x^{2} + 3{,}2`, [['0{,}4x^5', r`5 \cdot 0{,}4x^4 = 2x^4`], ['-1{,}5x^2', r`-2 \cdot 1{,}5x = -3x`], ['3{,}2', '0']], '2x^4 - 3x'),
  },
  {
    cluster: 'breuken_decimalen', level: 3,
    body: r`f(x) = -\tfrac{1}{4}x^{8} + \tfrac{2}{3}x^{3} - x`, answer: r`-2x^{7} + 2x^{2} - 1`,
    steps: termsgewijs(r`f(x) = -\tfrac{1}{4}x^{8} + \tfrac{2}{3}x^{3} - x`, [[r`-\tfrac{1}{4}x^8`, r`-8 \cdot \tfrac{1}{4}x^7 = -2x^7`], [r`\tfrac{2}{3}x^3`, r`3 \cdot \tfrac{2}{3}x^2 = 2x^2`], ['-x', '-1']], '-2x^7 + 2x^2 - 1'),
  },
  {
    cluster: 'breuken_decimalen', level: 3,
    body: r`f(x) = 1{,}5x^{4} - \tfrac{3}{2}x^{2} + 0{,}25x`, answer: r`6x^{3} - 3x + 0{,}25`, alts: ['6x^3-3x+1/4', '6x^3-3x+0.25'],
    steps: termsgewijs(r`f(x) = 1{,}5x^{4} - \tfrac{3}{2}x^{2} + 0{,}25x`, [['1{,}5x^4', r`4 \cdot 1{,}5x^3 = 6x^3`], [r`-\tfrac{3}{2}x^2`, r`-2 \cdot \tfrac{3}{2}x = -3x`], ['0{,}25x', '0{,}25']], '6x^3 - 3x + 0{,}25'),
  },

  // 1c Andere letters
  {
    cluster: 'andere_letters', level: 1,
    existing: ['polynoom_differentieren', r`h(t) = 2t^{3} - 4t^{2} + 3t - 2`],
    body: r`h(t) = 2t^{3} - 4t^{2} + 3t - 2`, answer: r`6t^{2} - 8t + 3`,
    steps: termsgewijs(r`h(t) = 2t^{3} - 4t^{2} + 3t - 2`, [['2t^3', '6t^2'], ['-4t^2', '-8t'], ['3t', '3'], ['-2', '0']], '6t^2 - 8t + 3',
      r`Buitenste schil: losse termen met $+$ en $-$ → somregel. De variabele heet $t$, de regels blijven hetzelfde.`),
  },
  {
    cluster: 'andere_letters', level: 1,
    body: r`s(t) = 3t^{4} - 2t^{2} + 5t`, answer: r`12t^{3} - 4t + 5`,
    steps: termsgewijs(r`s(t) = 3t^{4} - 2t^{2} + 5t`, [['3t^4', '12t^3'], ['-2t^2', '-4t'], ['5t', '5']], '12t^3 - 4t + 5',
      r`Buitenste schil: losse termen met $+$ en $-$ → somregel. De variabele heet $t$, de regels blijven hetzelfde.`),
  },
  {
    cluster: 'andere_letters', level: 2,
    existing: ['polynoom_differentieren', r`k(q) = 1 + 3q - 3q^{2} - 5q^{7}`],
    body: r`k(q) = 1 + 3q - 3q^{2} - 5q^{7}`, answer: r`-35q^{6} - 6q + 3`, alts: ['3-6q-35q^6'],
    steps: termsgewijs(r`k(q) = 1 + 3q - 3q^{2} - 5q^{7}`, [['1', '0'], ['3q', '3'], ['-3q^2', '-6q'], ['-5q^7', '-35q^6']], '-35q^6 - 6q + 3',
      r`Buitenste schil: losse termen met $+$ en $-$ → somregel. De variabele heet $q$, de regels blijven hetzelfde.`),
  },
  {
    cluster: 'andere_letters', level: 2,
    body: r`N(p) = 0{,}5p^{2} - 3p + 7`, answer: r`p - 3`,
    steps: termsgewijs(r`N(p) = 0{,}5p^{2} - 3p + 7`, [['0{,}5p^2', r`2 \cdot 0{,}5p = p`], ['-3p', '-3'], ['7', '0']], 'p - 3',
      r`Buitenste schil: losse termen met $+$ en $-$ → somregel. De variabele heet $p$, de regels blijven hetzelfde.`),
  },
  {
    cluster: 'andere_letters', level: 3,
    body: r`k(q) = 2 - q + 4q^{3} - q^{6}`, answer: r`-6q^{5} + 12q^{2} - 1`, alts: ['-1+12q^2-6q^5'],
    steps: termsgewijs(r`k(q) = 2 - q + 4q^{3} - q^{6}`, [['2', '0'], ['-q', '-1'], ['4q^3', '12q^2'], ['-q^6', '-6q^5']], '-6q^5 + 12q^2 - 1',
      r`Buitenste schil: losse termen met $+$ en $-$ → somregel. De variabele heet $q$, de regels blijven hetzelfde.`),
  },
  {
    cluster: 'andere_letters', level: 3,
    body: r`A(r) = \tfrac{1}{3}r^{6} - 2r^{3} + \tfrac{1}{2}r`, answer: r`2r^{5} - 6r^{2} + \tfrac{1}{2}`, alts: ['2r^5-6r^2+0.5', '2r^5-6r^2+0,5'],
    steps: termsgewijs(r`A(r) = \tfrac{1}{3}r^{6} - 2r^{3} + \tfrac{1}{2}r`, [[r`\tfrac{1}{3}r^6`, r`6 \cdot \tfrac{1}{3}r^5 = 2r^5`], ['-2r^3', '-6r^2'], [r`\tfrac{1}{2}r`, r`\tfrac{1}{2}`]], r`2r^5 - 6r^2 + \tfrac{1}{2}`,
      r`Buitenste schil: losse termen met $+$ en $-$ → somregel. De variabele heet $r$, de regels blijven hetzelfde.`),
  },

  // ═══ Topic 2 · Haakjes eerst ═════════════════════════════════════════════
  // 2a Twee lineaire factoren
  {
    cluster: 'twee_lineaire_factoren', level: 1,
    existing: ['product_uitwerken', r`f(x) = (3 - x)(5 + 2x)`],
    body: r`f(x) = (3 - x)(5 + 2x)`, answer: r`-4x + 1`, alts: ['1-4x'],
    steps: uitwerken(r`f(x) = (3 - x)(5 + 2x)`, '15 + 6x - 5x - 2x^2', '-2x^2 + x + 15', '-4x + 1'),
  },
  {
    cluster: 'twee_lineaire_factoren', level: 1,
    existing: ['product_uitwerken', r`f(x) = (5x + 7)(4 - 3x)`],
    body: r`f(x) = (5x + 7)(4 - 3x)`, answer: r`-30x - 1`,
    steps: uitwerken(r`f(x) = (5x + 7)(4 - 3x)`, '20x - 15x^2 + 28 - 21x', '-15x^2 - x + 28', '-30x - 1'),
  },
  {
    cluster: 'twee_lineaire_factoren', level: 2,
    body: r`f(x) = (x + 4)(2x - 3)`, answer: r`4x + 5`,
    steps: uitwerken(r`f(x) = (x + 4)(2x - 3)`, '2x^2 - 3x + 8x - 12', '2x^2 + 5x - 12', '4x + 5'),
  },
  {
    cluster: 'twee_lineaire_factoren', level: 2,
    body: r`f(x) = (4 - x)(3 + 2x)`, answer: r`-4x + 5`, alts: ['5-4x'],
    steps: uitwerken(r`f(x) = (4 - x)(3 + 2x)`, '12 + 8x - 3x - 2x^2', '-2x^2 + 5x + 12', '-4x + 5'),
  },
  {
    cluster: 'twee_lineaire_factoren', level: 3,
    body: r`f(x) = (3x + 2)(2 - 5x)`, answer: r`-30x - 4`,
    steps: uitwerken(r`f(x) = (3x + 2)(2 - 5x)`, '6x - 15x^2 + 4 - 10x', '-15x^2 - 4x + 4', '-30x - 4'),
  },
  {
    cluster: 'twee_lineaire_factoren', level: 3,
    body: r`g(t) = (2t - 1)(3t + 4) - 7t`, answer: r`12t - 2`,
    steps: uitwerken(r`g(t) = (2t - 1)(3t + 4) - 7t`, '6t^2 + 8t - 3t - 4 - 7t', '6t^2 - 2t - 4', '12t - 2'),
  },

  // 2b Merkwaardig product
  {
    cluster: 'merkwaardig_product', level: 1,
    existing: ['merkwaardige_producten', r`f(x) = (3x + 1)^{2}`],
    body: r`f(x) = (3x + 1)^{2}`, answer: r`18x + 6`, alts: ['6(3x+1)', '2*3(3x+1)'],
    steps: uitwerken(r`f(x) = (3x + 1)^{2}`, '(3x)^2 + 2 \\cdot 3x \\cdot 1 + 1^2', '9x^2 + 6x + 1', '18x + 6',
      r`Buitenste schil: een kwadraat van een lineaire vorm, $(a + b)^2 = a^2 + 2ab + b^2$ → eerst uitwerken, dan de somregel.`),
  },
  {
    cluster: 'merkwaardig_product', level: 1,
    existing: ['merkwaardige_producten', r`f(x) = (2x - 5)^{2}`],
    body: r`f(x) = (2x - 5)^{2}`, answer: r`8x - 20`, alts: ['4(2x-5)', '2*2(2x-5)'],
    steps: uitwerken(r`f(x) = (2x - 5)^{2}`, '(2x)^2 - 2 \\cdot 2x \\cdot 5 + 5^2', '4x^2 - 20x + 25', '8x - 20',
      r`Buitenste schil: een kwadraat van een lineaire vorm, $(a - b)^2 = a^2 - 2ab + b^2$ → eerst uitwerken, dan de somregel.`),
  },
  {
    cluster: 'merkwaardig_product', level: 2,
    existing: ['merkwaardige_producten', r`f(x) = (3x + 6)^{2} - 8x`],
    body: r`f(x) = (3x + 6)^{2} - 8x`, answer: r`18x + 28`,
    steps: uitwerken(r`f(x) = (3x + 6)^{2} - 8x`, '9x^2 + 36x + 36 - 8x', '9x^2 + 28x + 36', '18x + 28'),
  },
  {
    cluster: 'merkwaardig_product', level: 2,
    existing: ['merkwaardige_producten', r`f(x) = (2x + 3)^{2} - (x - 4)^{2}`],
    body: r`f(x) = (2x + 3)^{2} - (x - 4)^{2}`, answer: r`6x + 20`,
    steps: uitwerken(r`f(x) = (2x + 3)^{2} - (x - 4)^{2}`, '4x^2 + 12x + 9 - (x^2 - 8x + 16)', '3x^2 + 20x - 7', '6x + 20',
      r`Buitenste schil: twee kwadraten met een $-$ ertussen → beide uitwerken, let op de min vóór het tweede kwadraat.`),
  },
  {
    cluster: 'merkwaardig_product', level: 3,
    body: r`f(x) = (4x - 1)^{2} - 6x`, answer: r`32x - 14`,
    steps: uitwerken(r`f(x) = (4x - 1)^{2} - 6x`, '16x^2 - 8x + 1 - 6x', '16x^2 - 14x + 1', '32x - 14'),
  },
  {
    cluster: 'merkwaardig_product', level: 3,
    body: r`f(x) = (x + 3)^{2} - (2x - 1)^{2}`, answer: r`-6x + 10`, alts: ['10-6x'],
    steps: uitwerken(r`f(x) = (x + 3)^{2} - (2x - 1)^{2}`, 'x^2 + 6x + 9 - (4x^2 - 4x + 1)', '-3x^2 + 10x + 8', '-6x + 10',
      r`Buitenste schil: twee kwadraten met een $-$ ertussen → beide uitwerken, let op de min vóór het tweede kwadraat.`),
  },

  // 2c Constante factor en extra termen
  {
    cluster: 'constante_factor', level: 1,
    body: r`f(x) = 3(x - 2)^{2} + 4(x + 1)`, answer: r`6x - 8`,
    steps: uitwerken(r`f(x) = 3(x - 2)^{2} + 4(x + 1)`, '3(x^2 - 4x + 4) + 4x + 4', '3x^2 - 8x + 16', '6x - 8',
      r`Buitenste schil: haakjes met een getal ervoor → eerst uitwerken (getal mee vermenigvuldigen), dan de somregel.`),
  },
  {
    cluster: 'constante_factor', level: 1,
    body: r`f(x) = 2(x + 1)(x - 3)`, answer: r`4x - 4`,
    steps: uitwerken(r`f(x) = 2(x + 1)(x - 3)`, '2(x^2 - 3x + x - 3)', '2x^2 - 4x - 6', '4x - 4',
      r`Buitenste schil: haakjes met een getal ervoor → eerst uitwerken (getal mee vermenigvuldigen), dan de somregel.`),
  },
  {
    cluster: 'constante_factor', level: 2,
    existing: ['merkwaardige_producten', r`f(x) = 5(x - 3)^{2} + 5(2x - 1)`],
    body: r`f(x) = 5(x - 3)^{2} + 5(2x - 1)`, answer: r`10x - 20`,
    steps: uitwerken(r`f(x) = 5(x - 3)^{2} + 5(2x - 1)`, '5(x^2 - 6x + 9) + 10x - 5', '5x^2 - 20x + 40', '10x - 20',
      r`Buitenste schil: haakjes met een getal ervoor → eerst uitwerken (getal mee vermenigvuldigen), dan de somregel.`),
  },
  {
    cluster: 'constante_factor', level: 2,
    body: r`f(x) = -2(x + 1)(3 - x) + 5(x - 2)`, answer: r`4x + 1`,
    steps: uitwerken(r`f(x) = -2(x + 1)(3 - x) + 5(x - 2)`, '-2(-x^2 + 2x + 3) + 5x - 10', '2x^2 + x - 16', '4x + 1',
      r`Buitenste schil: haakjes met een negatief getal ervoor → eerst uitwerken, de min gaat over álle termen.`),
  },
  {
    cluster: 'constante_factor', level: 3,
    existing: ['merkwaardige_producten', r`f(x) = 2(3x - 2)^{2} + 3(2x - 1)^{2}`],
    body: r`f(x) = 2(3x - 2)^{2} + 3(2x - 1)^{2}`, answer: r`60x - 36`,
    steps: uitwerken(r`f(x) = 2(3x - 2)^{2} + 3(2x - 1)^{2}`, '2(9x^2 - 12x + 4) + 3(4x^2 - 4x + 1)', '30x^2 - 36x + 11', '60x - 36',
      r`Buitenste schil: twee kwadraten met een getal ervoor → beide uitwerken, dan de somregel.`),
  },
  {
    cluster: 'constante_factor', level: 3,
    existing: ['product_uitwerken', r`f(x) = -3(x - 1)(5 - 9x) - 8(x - 7)`],
    body: r`f(x) = -3(x - 1)(5 - 9x) - 8(x - 7)`, answer: r`54x - 50`,
    steps: uitwerken(r`f(x) = -3(x - 1)(5 - 9x) - 8(x - 7)`, '-3(-9x^2 + 14x - 5) - 8x + 56', '27x^2 - 50x + 71', '54x - 50',
      r`Buitenste schil: haakjes met een negatief getal ervoor → eerst uitwerken, de min gaat over álle termen.`),
  },

  // 2d Hogere graad
  {
    cluster: 'hogere_graad', level: 1,
    existing: ['product_uitwerken', r`f(x) = x(2x - 1)^{2}`],
    body: r`f(x) = x(2x - 1)^{2}`, answer: r`12x^{2} - 8x + 1`,
    steps: uitwerken(r`f(x) = x(2x - 1)^{2}`, 'x(4x^2 - 4x + 1)', '4x^3 - 4x^2 + x', '12x^2 - 8x + 1',
      r`Buitenste schil: $x$ maal een kwadraat → eerst het kwadraat uitwerken, dan $x$ erdoor, dan de somregel.`),
  },
  {
    cluster: 'hogere_graad', level: 1,
    body: r`f(x) = x(3x - 2)^{2}`, answer: r`27x^{2} - 24x + 4`,
    steps: uitwerken(r`f(x) = x(3x - 2)^{2}`, 'x(9x^2 - 12x + 4)', '9x^3 - 12x^2 + 4x', '27x^2 - 24x + 4',
      r`Buitenste schil: $x$ maal een kwadraat → eerst het kwadraat uitwerken, dan $x$ erdoor, dan de somregel.`),
  },
  {
    cluster: 'hogere_graad', level: 2,
    existing: ['product_uitwerken', r`f(x) = \tfrac{1}{2}x^{3} + 2x^{2}(x - 4) + 6`],
    body: r`f(x) = \tfrac{1}{2}x^{3} + 2x^{2}(x - 4) + 6`, answer: r`7{,}5x^{2} - 16x`, alts: ['7.5x^2-16x', '15/2x^2-16x'],
    steps: uitwerken(r`f(x) = \tfrac{1}{2}x^{3} + 2x^{2}(x - 4) + 6`, r`\tfrac{1}{2}x^3 + 2x^3 - 8x^2 + 6`, r`2\tfrac{1}{2}x^3 - 8x^2 + 6`, '7{,}5x^2 - 16x',
      r`Buitenste schil: termen met $+$ ertussen, waarvan één met haakjes → eerst die haakjes uitwerken, dan de somregel.`),
  },
  {
    cluster: 'hogere_graad', level: 2,
    body: r`f(x) = x^{2}(x - 5) + \tfrac{1}{4}x^{4}`, answer: r`x^{3} + 3x^{2} - 10x`,
    steps: uitwerken(r`f(x) = x^{2}(x - 5) + \tfrac{1}{4}x^{4}`, r`x^3 - 5x^2 + \tfrac{1}{4}x^4`, r`\tfrac{1}{4}x^4 + x^3 - 5x^2`, 'x^3 + 3x^2 - 10x',
      r`Buitenste schil: termen met $+$ ertussen, waarvan één met haakjes → eerst die haakjes uitwerken, dan de somregel.`),
  },
  {
    cluster: 'hogere_graad', level: 3,
    existing: ['product_uitwerken', r`f(x) = 5(3x - 1)(x^{3} - 4x)`],
    body: r`f(x) = 5(3x - 1)(x^{3} - 4x)`, answer: r`60x^{3} - 15x^{2} - 120x + 20`,
    steps: uitwerken(r`f(x) = 5(3x - 1)(x^{3} - 4x)`, '5(3x^4 - 12x^2 - x^3 + 4x)', '15x^4 - 5x^3 - 60x^2 + 20x', '60x^3 - 15x^2 - 120x + 20',
      r`Buitenste schil: een getal maal twee haakjes → eerst de haakjes uitwerken en met 5 vermenigvuldigen, dan de somregel.`),
  },
  {
    cluster: 'hogere_graad', level: 3,
    body: r`f(x) = 2(x^{2} + 1)(x^{3} - x)`, answer: r`10x^{4} - 2`,
    steps: uitwerken(r`f(x) = 2(x^{2} + 1)(x^{3} - x)`, '2(x^5 - x^3 + x^3 - x)', '2x^5 - 2x', '10x^4 - 2',
      r`Buitenste schil: een getal maal twee haakjes → eerst uitwerken; hier vallen termen tegen elkaar weg, dus dit is sneller dan de productregel.`),
  },

  // ═══ Topic 3 · Productregel ══════════════════════════════════════════════
  // 3a Twee polynomen
  {
    cluster: 'twee_polynomen', level: 1,
    existing: ['twee_polynomen', r`f(x) = (x^{2} - 4)(x^{3} + 2x + 3)`],
    body: r`f(x) = (x^{2} - 4)(x^{3} + 2x + 3)`, answer: r`2x(x^{3} + 2x + 3) + (x^{2} - 4)(3x^{2} + 2)`, alts: ['5x^4-6x^2+6x-8'],
    steps: product(r`f(x) = (x^{2} - 4)(x^{3} + 2x + 3)`, { g: 'x^2 - 4', h: 'x^3 + 2x + 3', dg: '2x', dh: '3x^2 + 2' }, '2x(x^3 + 2x + 3) + (x^2 - 4)(3x^2 + 2)'),
  },
  {
    cluster: 'twee_polynomen', level: 1,
    existing: ['twee_polynomen', r`f(x) = (2 - 3x^{2})(2 + 7x)`],
    body: r`f(x) = (2 - 3x^{2})(2 + 7x)`, answer: r`-6x(2 + 7x) + (2 - 3x^{2}) \cdot 7`, alts: ['-6x(2+7x)+7(2-3x^2)', '-63x^2-12x+14'],
    steps: product(r`f(x) = (2 - 3x^{2})(2 + 7x)`, { g: '2 - 3x^2', h: '2 + 7x', dg: '-6x', dh: '7' }, r`-6x(2 + 7x) + (2 - 3x^2) \cdot 7`),
  },
  {
    cluster: 'twee_polynomen', level: 2,
    existing: ['twee_polynomen', r`f(x) = (3x - 1)(x^{2} + 5x)`],
    body: r`f(x) = (3x - 1)(x^{2} + 5x)`, answer: r`3(x^{2} + 5x) + (3x - 1)(2x + 5)`, alts: ['9x^2+28x-5'],
    steps: product(r`f(x) = (3x - 1)(x^{2} + 5x)`, { g: '3x - 1', h: 'x^2 + 5x', dg: '3', dh: '2x + 5' }, '3(x^2 + 5x) + (3x - 1)(2x + 5)'),
  },
  {
    cluster: 'twee_polynomen', level: 2,
    existing: ['twee_polynomen', r`f(x) = (x^{2} - 3x)(x^{3} + x^{2} + x)`],
    body: r`f(x) = (x^{2} - 3x)(x^{3} + x^{2} + x)`, answer: r`(2x - 3)(x^{3} + x^{2} + x) + (x^{2} - 3x)(3x^{2} + 2x + 1)`, alts: ['5x^4-8x^3-6x^2-6x'],
    steps: product(r`f(x) = (x^{2} - 3x)(x^{3} + x^{2} + x)`, { g: 'x^2 - 3x', h: 'x^3 + x^2 + x', dg: '2x - 3', dh: '3x^2 + 2x + 1' }, '(2x - 3)(x^3 + x^2 + x) + (x^2 - 3x)(3x^2 + 2x + 1)'),
  },
  {
    cluster: 'twee_polynomen', level: 3,
    existing: ['twee_polynomen', r`f(x) = (5x^{5} - 3)(3x - 2)`],
    body: r`f(x) = (5x^{5} - 3)(3x - 2)`, answer: r`25x^{4}(3x - 2) + (5x^{5} - 3) \cdot 3`, alts: ['25x^4(3x-2)+3(5x^5-3)', '90x^5-50x^4-9'],
    steps: product(r`f(x) = (5x^{5} - 3)(3x - 2)`, { g: '5x^5 - 3', h: '3x - 2', dg: '25x^4', dh: '3' }, r`25x^4(3x - 2) + (5x^5 - 3) \cdot 3`),
  },
  {
    cluster: 'twee_polynomen', level: 3,
    existing: ['twee_polynomen', r`l(t) = (5t^{3} - t)(3t^{5} + t)`],
    body: r`l(t) = (5t^{3} - t)(3t^{5} + t)`, answer: r`(15t^{2} - 1)(3t^{5} + t) + (5t^{3} - t)(15t^{4} + 1)`, alts: ['120t^7-18t^5+20t^3-2t'],
    steps: product(r`l(t) = (5t^{3} - t)(3t^{5} + t)`, { g: '5t^3 - t', h: '3t^5 + t', dg: '15t^2 - 1', dh: '15t^4 + 1' }, '(15t^2 - 1)(3t^5 + t) + (5t^3 - t)(15t^4 + 1)',
      r`Buitenste schil: twee factoren met een $\cdot$ ertussen → productregel. De variabele heet $t$.`),
  },

  // 3b Kwadraat als product (twee bestaande rijen krijgen een nieuwe functie:
  //    (2x-5)² en (3x+1)² blijven alleen bij 'Merkwaardig product' staan)
  {
    cluster: 'kwadraat_als_product', level: 1,
    existing: ['kwadraat_van_polynoom', r`f(x) = (2x - 5)^{2}`],
    body: r`f(x) = (x^{2} + 1)^{2}`, answer: r`2x(x^{2} + 1) + (x^{2} + 1) \cdot 2x`, alts: ['4x(x^2+1)', '2*2x(x^2+1)', '4x^3+4x'],
    steps: product(r`f(x) = (x^{2} + 1)^{2}`, { g: 'x^2 + 1', h: 'x^2 + 1', dg: '2x', dh: '2x' }, r`2x(x^2 + 1) + (x^2 + 1) \cdot 2x`, KWADRAAT0),
  },
  {
    cluster: 'kwadraat_als_product', level: 1,
    existing: ['kwadraat_van_polynoom', r`f(x) = (3x + 1)^{2}`],
    body: r`f(x) = (x^{3} + 2)^{2}`, answer: r`3x^{2}(x^{3} + 2) + (x^{3} + 2) \cdot 3x^{2}`, alts: ['6x^2(x^3+2)', '2*3x^2(x^3+2)', '6x^5+12x^2'],
    steps: product(r`f(x) = (x^{3} + 2)^{2}`, { g: 'x^3 + 2', h: 'x^3 + 2', dg: '3x^2', dh: '3x^2' }, r`3x^2(x^3 + 2) + (x^3 + 2) \cdot 3x^2`, KWADRAAT0),
  },
  {
    cluster: 'kwadraat_als_product', level: 2,
    existing: ['kwadraat_van_polynoom', r`f(x) = (3x^{3} - 1)^{2}`],
    body: r`f(x) = (3x^{3} - 1)^{2}`, answer: r`9x^{2}(3x^{3} - 1) + (3x^{3} - 1) \cdot 9x^{2}`, alts: ['18x^2(3x^3-1)', '2*9x^2(3x^3-1)', '54x^5-18x^2'],
    steps: product(r`f(x) = (3x^{3} - 1)^{2}`, { g: '3x^3 - 1', h: '3x^3 - 1', dg: '9x^2', dh: '9x^2' }, r`9x^2(3x^3 - 1) + (3x^3 - 1) \cdot 9x^2`, KWADRAAT0),
  },
  {
    cluster: 'kwadraat_als_product', level: 2,
    existing: ['kwadraat_van_polynoom', r`f(x) = (3x^{2} - 4)^{2}`],
    body: r`f(x) = (3x^{2} - 4)^{2}`, answer: r`6x(3x^{2} - 4) + (3x^{2} - 4) \cdot 6x`, alts: ['12x(3x^2-4)', '2*6x(3x^2-4)', '36x^3-48x'],
    steps: product(r`f(x) = (3x^{2} - 4)^{2}`, { g: '3x^2 - 4', h: '3x^2 - 4', dg: '6x', dh: '6x' }, r`6x(3x^2 - 4) + (3x^2 - 4) \cdot 6x`, KWADRAAT0),
  },
  {
    cluster: 'kwadraat_als_product', level: 3,
    existing: ['kwadraat_van_polynoom', r`m(q) = 1 - (3q^{2} - 2)^{2}`],
    body: r`m(q) = 1 - (3q^{2} - 2)^{2}`, answer: r`-6q(3q^{2} - 2) - (3q^{2} - 2) \cdot 6q`, alts: ['-12q(3q^2-2)', '-2*6q(3q^2-2)', '-36q^3+24q'],
    steps: somGenest(r`m(q) = 1 - (3q^{2} - 2)^{2}`, {
      u: '1', v: '(3q^2 - 2)^2', duPlain: '0', inner: 'v', rule: 'product',
      gh: { g: '3q^2 - 2', h: '3q^2 - 2', dg: '6q', dh: '6q' },
      dInner: r`6q(3q^2 - 2) + (3q^2 - 2) \cdot 6q`, sign: '-',
      result: r`0 - \bigl(6q(3q^2 - 2) + (3q^2 - 2) \cdot 6q\bigr) = -6q(3q^2 - 2) - (3q^2 - 2) \cdot 6q`,
    }, r`Buitenste schil: een $-$ tussen $1$ en een kwadraat → somregel; het kwadraat zelf wordt straks $g \cdot g$ met de productregel.`),
  },
  {
    cluster: 'kwadraat_als_product', level: 3,
    body: r`f(x) = (x^{4} - x)^{2}`, answer: r`(4x^{3} - 1)(x^{4} - x) + (x^{4} - x)(4x^{3} - 1)`, alts: ['2(4x^3-1)(x^4-x)', '8x^7-10x^4+2x'],
    steps: product(r`f(x) = (x^{4} - x)^{2}`, { g: 'x^4 - x', h: 'x^4 - x', dg: '4x^3 - 1', dh: '4x^3 - 1' }, '(4x^3 - 1)(x^4 - x) + (x^4 - x)(4x^3 - 1)', KWADRAAT0),
  },

  // 3c Genest in een som
  {
    cluster: 'genest_in_som', level: 1,
    body: r`f(x) = x^{2} + (x + 1)(x^{2} - 3)`, answer: r`2x + (x^{2} - 3) + (x + 1) \cdot 2x`, alts: ['2x+(x^2-3)+2x(x+1)', '3x^2+4x-3'],
    steps: somGenest(r`f(x) = x^{2} + (x + 1)(x^{2} - 3)`, {
      u: 'x^2', v: '(x + 1)(x^2 - 3)', duPlain: '2x', inner: 'v', rule: 'product',
      gh: { g: 'x + 1', h: 'x^2 - 3', dg: '1', dh: '2x' },
      dInner: r`1 \cdot (x^2 - 3) + (x + 1) \cdot 2x`, sign: '+',
      result: r`2x + (x^2 - 3) + (x + 1) \cdot 2x`,
    }),
  },
  {
    cluster: 'genest_in_som', level: 1,
    body: r`f(x) = (2x - 1)(x^{3} + 4) + 6x`, answer: r`2(x^{3} + 4) + (2x - 1) \cdot 3x^{2} + 6`, alts: ['2(x^3+4)+3x^2(2x-1)+6', '8x^3-3x^2+14'],
    steps: somGenest(r`f(x) = (2x - 1)(x^{3} + 4) + 6x`, {
      u: '(2x - 1)(x^3 + 4)', v: '6x', duPlain: '6', inner: 'u', rule: 'product',
      gh: { g: '2x - 1', h: 'x^3 + 4', dg: '2', dh: '3x^2' },
      dInner: r`2(x^3 + 4) + (2x - 1) \cdot 3x^2`, sign: '+',
      result: r`2(x^3 + 4) + (2x - 1) \cdot 3x^2 + 6`,
    }),
  },
  {
    cluster: 'genest_in_som', level: 2,
    body: r`f(x) = 2x + 3(x^{2} - 1)(x + 4)`, answer: r`2 + 6x(x + 4) + (3x^{2} - 3)`, alts: ['2+6x(x+4)+3x^2-3', '9x^2+24x-1'],
    steps: somGenest(r`f(x) = 2x + 3(x^{2} - 1)(x + 4)`, {
      u: '2x', v: '3(x^2 - 1)(x + 4) = (3x^2 - 3)(x + 4)', duPlain: '2', inner: 'v', rule: 'product',
      gh: { g: '3x^2 - 3', h: 'x + 4', dg: '6x', dh: '1' },
      dInner: r`6x(x + 4) + (3x^2 - 3) \cdot 1`, sign: '+',
      result: '2 + 6x(x + 4) + (3x^2 - 3)',
    }, r`Buitenste schil: een $+$ tussen twee delen → somregel. Handig: haal de 3 naar binnen, dan zie je twee losse factoren.`),
  },
  {
    cluster: 'genest_in_som', level: 2,
    body: r`f(x) = x^{2} - (x^{3} - 2)(x + 5)`, answer: r`2x - 3x^{2}(x + 5) - (x^{3} - 2)`, alts: ['2x-(3x^2(x+5)+(x^3-2))', '-4x^3-15x^2+2x+2'],
    steps: somGenest(r`f(x) = x^{2} - (x^{3} - 2)(x + 5)`, {
      u: 'x^2', v: '(x^3 - 2)(x + 5)', duPlain: '2x', inner: 'v', rule: 'product',
      gh: { g: 'x^3 - 2', h: 'x + 5', dg: '3x^2', dh: '1' },
      dInner: r`3x^2(x + 5) + (x^3 - 2) \cdot 1`, sign: '-',
      result: r`2x - \bigl(3x^2(x + 5) + (x^3 - 2)\bigr) = 2x - 3x^2(x + 5) - (x^3 - 2)`,
    }, r`Buitenste schil: een $-$ tussen twee delen → somregel. De min gaat straks over de hele afgeleide van $v$.`),
  },
  {
    cluster: 'genest_in_som', level: 3,
    existing: ['kwadraat_van_polynoom', r`f(x) = 5 - 3(x^{4} - x)(x + 1)`],
    body: r`f(x) = 5 - 3(x^{4} - x)(x + 1)`, answer: r`-(12x^{3} - 3)(x + 1) - (3x^{4} - 3x)`, alts: ['-3(4x^3-1)(x+1)-3(x^4-x)', '-15x^4-12x^3+6x+3'],
    steps: somGenest(r`f(x) = 5 - 3(x^{4} - x)(x + 1)`, {
      u: '5', v: '3(x^4 - x)(x + 1) = (3x^4 - 3x)(x + 1)', duPlain: '0', inner: 'v', rule: 'product',
      gh: { g: '3x^4 - 3x', h: 'x + 1', dg: '12x^3 - 3', dh: '1' },
      dInner: r`(12x^3 - 3)(x + 1) + (3x^4 - 3x) \cdot 1`, sign: '-',
      result: r`0 - \bigl((12x^3 - 3)(x + 1) + (3x^4 - 3x)\bigr) = -(12x^3 - 3)(x + 1) - (3x^4 - 3x)`,
    }, r`Buitenste schil: een $-$ tussen $5$ en een product → somregel. Handig: haal de 3 naar binnen, dan zie je twee losse factoren.`),
  },
  {
    cluster: 'genest_in_som', level: 3,
    body: r`f(x) = 7 - 2(x^{3} + 1)(x^{2} - x)`, answer: r`-6x^{2}(x^{2} - x) - (2x^{3} + 2)(2x - 1)`, alts: ['-10x^4+8x^3-4x+2'],
    steps: somGenest(r`f(x) = 7 - 2(x^{3} + 1)(x^{2} - x)`, {
      u: '7', v: '2(x^3 + 1)(x^2 - x) = (2x^3 + 2)(x^2 - x)', duPlain: '0', inner: 'v', rule: 'product',
      gh: { g: '2x^3 + 2', h: 'x^2 - x', dg: '6x^2', dh: '2x - 1' },
      dInner: '6x^2(x^2 - x) + (2x^3 + 2)(2x - 1)', sign: '-',
      result: r`0 - \bigl(6x^2(x^2 - x) + (2x^3 + 2)(2x - 1)\bigr) = -6x^2(x^2 - x) - (2x^3 + 2)(2x - 1)`,
    }, r`Buitenste schil: een $-$ tussen $7$ en een product → somregel. Handig: haal de 2 naar binnen, dan zie je twee losse factoren.`),
  },

  // 3d Drie factoren
  {
    cluster: 'drie_factoren', level: 2,
    body: r`f(x) = x(x + 3)(x - 1)`, answer: r`(x + 3)(x - 1) + x(x - 1) + x(x + 3)`, alts: ['3x^2+4x-3'],
    steps: drieFactoren(r`f(x) = x(x + 3)(x - 1)`, { p: 'x', q: 'x + 3', r: 'x - 1', dp: '1', dq: '1', dr: '1' }, r`1 \cdot (x + 3)(x - 1) + x \cdot 1 \cdot (x - 1) + x(x + 3) \cdot 1 = (x + 3)(x - 1) + x(x - 1) + x(x + 3)`),
  },
  {
    cluster: 'drie_factoren', level: 2,
    body: r`f(x) = (x - 2)(x + 2)(x^{2} + 1)`, answer: r`(x + 2)(x^{2} + 1) + (x - 2)(x^{2} + 1) + (x - 2)(x + 2) \cdot 2x`, alts: ['4x^3-6x'],
    steps: drieFactoren(r`f(x) = (x - 2)(x + 2)(x^{2} + 1)`, { p: 'x - 2', q: 'x + 2', r: 'x^2 + 1', dp: '1', dq: '1', dr: '2x' }, r`(x + 2)(x^2 + 1) + (x - 2)(x^2 + 1) + (x - 2)(x + 2) \cdot 2x`),
  },
  {
    cluster: 'drie_factoren', level: 2,
    body: r`f(x) = 2x(x^{2} - 1)(x + 4)`, answer: r`2(x^{2} - 1)(x + 4) + 2x \cdot 2x(x + 4) + 2x(x^{2} - 1)`, alts: ['2(x^2-1)(x+4)+4x^2(x+4)+2x(x^2-1)', '8x^3+24x^2-4x-8'],
    steps: drieFactoren(r`f(x) = 2x(x^{2} - 1)(x + 4)`, { p: '2x', q: 'x^2 - 1', r: 'x + 4', dp: '2', dq: '2x', dr: '1' }, r`2(x^2 - 1)(x + 4) + 2x \cdot 2x(x + 4) + 2x(x^2 - 1)`),
  },
  {
    cluster: 'drie_factoren', level: 3,
    existing: ['drie_factoren', r`f(x) = x(x - 1)(x + 2)`],
    body: r`f(x) = x(x - 1)(x + 2)`, answer: r`(x - 1)(x + 2) + x(x + 2) + x(x - 1)`, alts: ['3x^2+2x-2'],
    steps: drieFactoren(r`f(x) = x(x - 1)(x + 2)`, { p: 'x', q: 'x - 1', r: 'x + 2', dp: '1', dq: '1', dr: '1' }, '(x - 1)(x + 2) + x(x + 2) + x(x - 1)'),
  },
  {
    cluster: 'drie_factoren', level: 3,
    existing: ['drie_factoren', r`F(t) = t(t - 1)(t + 2)`],
    body: r`F(t) = t(t - 1)(t + 2)`, answer: r`(t - 1)(t + 2) + t(t + 2) + t(t - 1)`, alts: ['3t^2+2t-2'],
    steps: drieFactoren(r`F(t) = t(t - 1)(t + 2)`, { p: 't', q: 't - 1', r: 't + 2', dp: '1', dq: '1', dr: '1' }, '(t - 1)(t + 2) + t(t + 2) + t(t - 1)',
      r`Buitenste schil: drie factoren achter elkaar → productregel voor drie factoren: $(pqr)' = p'qr + pq'r + pqr'$. De variabele heet $t$.`),
  },
  {
    cluster: 'drie_factoren', level: 3,
    existing: ['drie_factoren', r`f(x) = (x + 1)(x - 2)(2x + 3)`],
    body: r`f(x) = (x + 1)(x - 2)(2x + 3)`, answer: r`(x - 2)(2x + 3) + (x + 1)(2x + 3) + 2(x + 1)(x - 2)`, alts: ['6x^2+2x-7'],
    steps: drieFactoren(r`f(x) = (x + 1)(x - 2)(2x + 3)`, { p: 'x + 1', q: 'x - 2', r: '2x + 3', dp: '1', dq: '1', dr: '2' }, '(x - 2)(2x + 3) + (x + 1)(2x + 3) + (x + 1)(x - 2) \\cdot 2'),
  },

  // ═══ Topic 4 · Quotiëntregel ═════════════════════════════════════════════
  // 4a Lineair gedeeld door lineair
  {
    cluster: 'lineair_door_lineair', level: 1,
    existing: ['eenvoudige_breuk', r`f(x) = \dfrac{x - 2}{x + 5}`],
    body: r`f(x) = \dfrac{x - 2}{x + 5}`, answer: r`\dfrac{7}{(x + 5)^{2}}`,
    steps: quotient(r`f(x) = \dfrac{x - 2}{x + 5}`, { g: 'x - 2', h: 'x + 5', dg: '1', dh: '1' }, r`1 \cdot (x + 5) - (x - 2) \cdot 1`, '7'),
  },
  {
    cluster: 'lineair_door_lineair', level: 1,
    existing: ['eenvoudige_breuk', r`f(x) = \dfrac{2}{2x - 1}`],
    body: r`f(x) = \dfrac{2}{2x - 1}`, answer: r`\dfrac{-4}{(2x - 1)^{2}}`, alts: ['-4/(2x-1)^2'],
    steps: quotient(r`f(x) = \dfrac{2}{2x - 1}`, { g: '2', h: '2x - 1', dg: '0', dh: '2' }, r`0 \cdot (2x - 1) - 2 \cdot 2`, '-4',
      r`Buitenste schil: een breuk met $x$ in de noemer → quotiëntregel. De teller is een getal, dus $g' = 0$.`),
  },
  {
    cluster: 'lineair_door_lineair', level: 2,
    existing: ['eenvoudige_breuk', r`f(x) = \dfrac{2x + 1}{3x - 1}`],
    body: r`f(x) = \dfrac{2x + 1}{3x - 1}`, answer: r`\dfrac{-5}{(3x - 1)^{2}}`,
    steps: quotient(r`f(x) = \dfrac{2x + 1}{3x - 1}`, { g: '2x + 1', h: '3x - 1', dg: '2', dh: '3' }, r`2(3x - 1) - (2x + 1) \cdot 3`, '-5'),
  },
  {
    cluster: 'lineair_door_lineair', level: 2,
    existing: ['eenvoudige_breuk', r`f(x) = \dfrac{2x - 3}{3x - 1}`],
    body: r`f(x) = \dfrac{2x - 3}{3x - 1}`, answer: r`\dfrac{7}{(3x - 1)^{2}}`,
    steps: quotient(r`f(x) = \dfrac{2x - 3}{3x - 1}`, { g: '2x - 3', h: '3x - 1', dg: '2', dh: '3' }, r`2(3x - 1) - (2x - 3) \cdot 3`, '7'),
  },
  {
    cluster: 'lineair_door_lineair', level: 3,
    existing: ['eenvoudige_breuk', r`f(x) = \dfrac{3 - 4x}{2x + 5}`],
    body: r`f(x) = \dfrac{3 - 4x}{2x + 5}`, answer: r`\dfrac{-26}{(2x + 5)^{2}}`,
    steps: quotient(r`f(x) = \dfrac{3 - 4x}{2x + 5}`, { g: '3 - 4x', h: '2x + 5', dg: '-4', dh: '2' }, r`-4(2x + 5) - (3 - 4x) \cdot 2`, '-26'),
  },
  {
    cluster: 'lineair_door_lineair', level: 3,
    existing: ['eenvoudige_breuk', r`f(t) = \dfrac{5t + 2}{1 - 3t}`],
    body: r`f(t) = \dfrac{5t + 2}{1 - 3t}`, answer: r`\dfrac{11}{(1 - 3t)^{2}}`,
    steps: quotient(r`f(t) = \dfrac{5t + 2}{1 - 3t}`, { g: '5t + 2', h: '1 - 3t', dg: '5', dh: '-3' }, r`5(1 - 3t) - (5t + 2) \cdot (-3)`, '11',
      r`Buitenste schil: een breuk met $t$ in de noemer → quotiëntregel. Let op: $h' = -3$ is negatief.`),
  },

  // 4b Polynoom-breuk
  {
    cluster: 'polynoom_breuk', level: 1,
    existing: ['polynoom_breuk', r`f(x) = \dfrac{x^{2}}{x + 1}`],
    body: r`f(x) = \dfrac{x^{2}}{x + 1}`, answer: r`\dfrac{x^{2} + 2x}{(x + 1)^{2}}`, alts: ['(2x(x+1)-x^2)/(x+1)^2'],
    steps: quotient(r`f(x) = \dfrac{x^{2}}{x + 1}`, { g: 'x^2', h: 'x + 1', dg: '2x', dh: '1' }, r`2x(x + 1) - x^2 \cdot 1`, 'x^2 + 2x'),
  },
  {
    cluster: 'polynoom_breuk', level: 1,
    existing: ['polynoom_breuk', r`f(x) = \dfrac{3}{2x^{2} + 1}`],
    body: r`f(x) = \dfrac{3}{2x^{2} + 1}`, answer: r`\dfrac{-12x}{(2x^{2} + 1)^{2}}`,
    steps: quotient(r`f(x) = \dfrac{3}{2x^{2} + 1}`, { g: '3', h: '2x^2 + 1', dg: '0', dh: '4x' }, r`0 \cdot (2x^2 + 1) - 3 \cdot 4x`, '-12x',
      r`Buitenste schil: een breuk met $x$ in de noemer → quotiëntregel. De teller is een getal, dus $g' = 0$.`),
  },
  {
    cluster: 'polynoom_breuk', level: 2,
    existing: ['polynoom_breuk', r`f(x) = \dfrac{x^{3}}{2x^{2} + 1}`],
    body: r`f(x) = \dfrac{x^{3}}{2x^{2} + 1}`, answer: r`\dfrac{2x^{4} + 3x^{2}}{(2x^{2} + 1)^{2}}`, alts: ['(3x^2(2x^2+1)-x^3*4x)/(2x^2+1)^2'],
    steps: quotient(r`f(x) = \dfrac{x^{3}}{2x^{2} + 1}`, { g: 'x^3', h: '2x^2 + 1', dg: '3x^2', dh: '4x' }, r`3x^2(2x^2 + 1) - x^3 \cdot 4x`, '2x^4 + 3x^2'),
  },
  {
    cluster: 'polynoom_breuk', level: 2,
    existing: ['polynoom_breuk', r`f(x) = \dfrac{x^{4}}{x^{2} + 1}`],
    body: r`f(x) = \dfrac{x^{4}}{x^{2} + 1}`, answer: r`\dfrac{2x^{5} + 4x^{3}}{(x^{2} + 1)^{2}}`, alts: ['(4x^3(x^2+1)-x^4*2x)/(x^2+1)^2'],
    steps: quotient(r`f(x) = \dfrac{x^{4}}{x^{2} + 1}`, { g: 'x^4', h: 'x^2 + 1', dg: '4x^3', dh: '2x' }, r`4x^3(x^2 + 1) - x^4 \cdot 2x`, '2x^5 + 4x^3'),
  },
  {
    cluster: 'polynoom_breuk', level: 3,
    existing: ['polynoom_breuk', r`f(x) = \dfrac{x - 2}{3 - x^{2}}`],
    body: r`f(x) = \dfrac{x - 2}{3 - x^{2}}`, answer: r`\dfrac{x^{2} - 4x + 3}{(3 - x^{2})^{2}}`, alts: ['((3-x^2)-(x-2)(-2x))/(3-x^2)^2'],
    steps: quotient(r`f(x) = \dfrac{x - 2}{3 - x^{2}}`, { g: 'x - 2', h: '3 - x^2', dg: '1', dh: '-2x' }, r`1 \cdot (3 - x^2) - (x - 2) \cdot (-2x)`, 'x^2 - 4x + 3',
      r`Buitenste schil: een breuk met $x$ in de noemer → quotiëntregel. Let op: $h' = -2x$ is negatief, min keer min wordt plus.`),
  },
  {
    cluster: 'polynoom_breuk', level: 3,
    existing: ['polynoom_breuk', r`g(t) = \dfrac{t^{2} + 1}{t^{3} - t}`],
    body: r`g(t) = \dfrac{t^{2} + 1}{t^{3} - t}`, answer: r`\dfrac{-t^{4} - 4t^{2} + 1}{(t^{3} - t)^{2}}`, alts: ['(2t(t^3-t)-(t^2+1)(3t^2-1))/(t^3-t)^2'],
    steps: quotient(r`g(t) = \dfrac{t^{2} + 1}{t^{3} - t}`, { g: 't^2 + 1', h: 't^3 - t', dg: '2t', dh: '3t^2 - 1' }, r`2t(t^3 - t) - (t^2 + 1)(3t^2 - 1)`, '-t^4 - 4t^2 + 1',
      r`Buitenste schil: een breuk met $t$ in de noemer → quotiëntregel.`),
  },

  // 4c Som met breuk
  {
    cluster: 'som_met_breuk', level: 1,
    existing: ['som_met_breuk', r`f(x) = x^{2} - \dfrac{3}{x + 1}`],
    body: r`f(x) = x^{2} - \dfrac{3}{x + 1}`, answer: r`2x + \dfrac{3}{(x + 1)^{2}}`,
    steps: somGenest(r`f(x) = x^{2} - \dfrac{3}{x + 1}`, {
      u: 'x^2', v: r`\dfrac{3}{x + 1}`, duPlain: '2x', inner: 'v', rule: 'quotient',
      gh: { g: '3', h: 'x + 1', dg: '0', dh: '1' },
      dInner: r`\dfrac{0 \cdot (x + 1) - 3 \cdot 1}{(x + 1)^2} = \dfrac{-3}{(x + 1)^2}`, sign: '-',
      result: r`2x - \dfrac{-3}{(x + 1)^2} = 2x + \dfrac{3}{(x + 1)^2}`,
    }),
  },
  {
    cluster: 'som_met_breuk', level: 1,
    existing: ['som_met_breuk', r`f(x) = x^{2} - \dfrac{2}{x + 4}`],
    body: r`f(x) = x^{2} - \dfrac{2}{x + 4}`, answer: r`2x + \dfrac{2}{(x + 4)^{2}}`,
    steps: somGenest(r`f(x) = x^{2} - \dfrac{2}{x + 4}`, {
      u: 'x^2', v: r`\dfrac{2}{x + 4}`, duPlain: '2x', inner: 'v', rule: 'quotient',
      gh: { g: '2', h: 'x + 4', dg: '0', dh: '1' },
      dInner: r`\dfrac{0 \cdot (x + 4) - 2 \cdot 1}{(x + 4)^2} = \dfrac{-2}{(x + 4)^2}`, sign: '-',
      result: r`2x - \dfrac{-2}{(x + 4)^2} = 2x + \dfrac{2}{(x + 4)^2}`,
    }),
  },
  {
    cluster: 'som_met_breuk', level: 2,
    existing: ['som_met_breuk', r`f(x) = 3x + \dfrac{1}{x - 1}`],
    body: r`f(x) = 3x + \dfrac{1}{x - 1}`, answer: r`3 - \dfrac{1}{(x - 1)^{2}}`, alts: ['3+(-1)/(x-1)^2'],
    steps: somGenest(r`f(x) = 3x + \dfrac{1}{x - 1}`, {
      u: '3x', v: r`\dfrac{1}{x - 1}`, duPlain: '3', inner: 'v', rule: 'quotient',
      gh: { g: '1', h: 'x - 1', dg: '0', dh: '1' },
      dInner: r`\dfrac{0 \cdot (x - 1) - 1 \cdot 1}{(x - 1)^2} = \dfrac{-1}{(x - 1)^2}`, sign: '+',
      result: r`3 + \dfrac{-1}{(x - 1)^2} = 3 - \dfrac{1}{(x - 1)^2}`,
    }),
  },
  {
    cluster: 'som_met_breuk', level: 2,
    existing: ['som_met_breuk', r`f(x) = \dfrac{3 - x^{2}}{x - 2} + x^{3}`],
    body: r`f(x) = \dfrac{3 - x^{2}}{x - 2} + x^{3}`, answer: r`\dfrac{-x^{2} + 4x - 3}{(x - 2)^{2}} + 3x^{2}`, alts: ['(-2x(x-2)-(3-x^2))/(x-2)^2+3x^2', '3x^2+(-x^2+4x-3)/(x-2)^2'],
    steps: somGenest(r`f(x) = \dfrac{3 - x^{2}}{x - 2} + x^{3}`, {
      u: r`\dfrac{3 - x^2}{x - 2}`, v: 'x^3', duPlain: '3x^2', inner: 'u', rule: 'quotient',
      gh: { g: '3 - x^2', h: 'x - 2', dg: '-2x', dh: '1' },
      dInner: r`\dfrac{-2x(x - 2) - (3 - x^2) \cdot 1}{(x - 2)^2} = \dfrac{-x^2 + 4x - 3}{(x - 2)^2}`, sign: '+',
      result: r`\dfrac{-x^2 + 4x - 3}{(x - 2)^2} + 3x^2`,
    }),
  },
  {
    cluster: 'som_met_breuk', level: 3,
    existing: ['som_met_breuk', r`f(x) = x^{3} + \dfrac{2x + 1}{x - 3}`],
    body: r`f(x) = x^{3} + \dfrac{2x + 1}{x - 3}`, answer: r`3x^{2} - \dfrac{7}{(x - 3)^{2}}`, alts: ['3x^2+(-7)/(x-3)^2', '3x^2+-7/(x-3)^2'],
    steps: somGenest(r`f(x) = x^{3} + \dfrac{2x + 1}{x - 3}`, {
      u: 'x^3', v: r`\dfrac{2x + 1}{x - 3}`, duPlain: '3x^2', inner: 'v', rule: 'quotient',
      gh: { g: '2x + 1', h: 'x - 3', dg: '2', dh: '1' },
      dInner: r`\dfrac{2(x - 3) - (2x + 1) \cdot 1}{(x - 3)^2} = \dfrac{-7}{(x - 3)^2}`, sign: '+',
      result: r`3x^2 + \dfrac{-7}{(x - 3)^2} = 3x^2 - \dfrac{7}{(x - 3)^2}`,
    }),
  },
  {
    cluster: 'som_met_breuk', level: 3,
    existing: ['som_met_breuk', r`h(q) = q^{2} - \dfrac{q + 1}{2q - 1}`],
    body: r`h(q) = q^{2} - \dfrac{q + 1}{2q - 1}`, answer: r`2q + \dfrac{3}{(2q - 1)^{2}}`, alts: ['2q-(-3)/(2q-1)^2', '2q--3/(2q-1)^2'],
    steps: somGenest(r`h(q) = q^{2} - \dfrac{q + 1}{2q - 1}`, {
      u: 'q^2', v: r`\dfrac{q + 1}{2q - 1}`, duPlain: '2q', inner: 'v', rule: 'quotient',
      gh: { g: 'q + 1', h: '2q - 1', dg: '1', dh: '2' },
      dInner: r`\dfrac{1 \cdot (2q - 1) - (q + 1) \cdot 2}{(2q - 1)^2} = \dfrac{-3}{(2q - 1)^2}`, sign: '-',
      result: r`2q - \dfrac{-3}{(2q - 1)^2} = 2q + \dfrac{3}{(2q - 1)^2}`,
    }, r`Buitenste schil: een $-$ tussen twee delen → somregel. De variabele heet $q$.`),
  },

  // ═══ Topic 5 · Gemengd: welke regel? ═════════════════════════════════════
  {
    cluster: 'welke_regel', level: 1,
    body: r`f(x) = (x + 1)(x - 1)`, answer: r`2x`, alts: ['(x-1)+(x+1)', '1(x-1)+(x+1)1'],
    steps: uitwerken(r`f(x) = (x + 1)(x - 1)`, 'x^2 - x + x - 1', 'x^2 - 1', '2x',
      r`Buitenste schil: twee lineaire factoren → uitwerken is het snelst (de productregel mag ook en geeft hetzelfde).`),
  },
  {
    cluster: 'welke_regel', level: 1,
    body: r`f(x) = \dfrac{x^{2} - 4}{x + 1}`, answer: r`\dfrac{x^{2} + 2x + 4}{(x + 1)^{2}}`, alts: ['(2x(x+1)-(x^2-4))/(x+1)^2'],
    steps: quotient(r`f(x) = \dfrac{x^{2} - 4}{x + 1}`, { g: 'x^2 - 4', h: 'x + 1', dg: '2x', dh: '1' }, r`2x(x + 1) - (x^2 - 4) \cdot 1`, 'x^2 + 2x + 4',
      r`Buitenste schil: een breukstreep met $x$ in de noemer → quotiëntregel.`),
  },
  {
    cluster: 'welke_regel', level: 1,
    body: r`f(x) = 3x^{4} - 2(x + 1)^{2}`, answer: r`12x^{3} - 4x - 4`,
    steps: uitwerken(r`f(x) = 3x^{4} - 2(x + 1)^{2}`, '3x^4 - 2(x^2 + 2x + 1)', '3x^4 - 2x^2 - 4x - 2', '12x^3 - 4x - 4',
      r`Buitenste schil: een $-$ tussen twee delen → somregel; het kwadraat van een lineaire vorm werk je eerst uit.`),
  },
  {
    cluster: 'welke_regel', level: 1,
    body: r`f(x) = (x^{2} + 1)(x^{3} - x)`, answer: r`2x(x^{3} - x) + (x^{2} + 1)(3x^{2} - 1)`, alts: ['5x^4-1'],
    steps: product(r`f(x) = (x^{2} + 1)(x^{3} - x)`, { g: 'x^2 + 1', h: 'x^3 - x', dg: '2x', dh: '3x^2 - 1' }, '2x(x^3 - x) + (x^2 + 1)(3x^2 - 1)',
      r`Buitenste schil: twee polynomen met een $\cdot$ ertussen → productregel (uitwerken mag ook, dan krijg je $5x^4 - 1$).`),
  },
  {
    cluster: 'welke_regel', level: 2,
    body: r`f(x) = x^{2} + \dfrac{1}{x - 2}`, answer: r`2x - \dfrac{1}{(x - 2)^{2}}`, alts: ['2x+(-1)/(x-2)^2'],
    steps: somGenest(r`f(x) = x^{2} + \dfrac{1}{x - 2}`, {
      u: 'x^2', v: r`\dfrac{1}{x - 2}`, duPlain: '2x', inner: 'v', rule: 'quotient',
      gh: { g: '1', h: 'x - 2', dg: '0', dh: '1' },
      dInner: r`\dfrac{0 \cdot (x - 2) - 1 \cdot 1}{(x - 2)^2} = \dfrac{-1}{(x - 2)^2}`, sign: '+',
      result: r`2x + \dfrac{-1}{(x - 2)^2} = 2x - \dfrac{1}{(x - 2)^2}`,
    }, r`Buitenste schil: een $+$ tussen twee delen → somregel; de breuk erin vraagt straks de quotiëntregel.`),
  },
  {
    cluster: 'welke_regel', level: 2,
    body: r`f(x) = (x^{3} - 1)^{2}`, answer: r`3x^{2}(x^{3} - 1) + (x^{3} - 1) \cdot 3x^{2}`, alts: ['6x^2(x^3-1)', '6x^5-6x^2'],
    steps: product(r`f(x) = (x^{3} - 1)^{2}`, { g: 'x^3 - 1', h: 'x^3 - 1', dg: '3x^2', dh: '3x^2' }, r`3x^2(x^3 - 1) + (x^3 - 1) \cdot 3x^2`,
      r`Buitenste schil: een kwadraat van een polynoom van graad 3 → schrijf als $g \cdot g$ en gebruik de productregel.`),
  },
  {
    cluster: 'welke_regel', level: 2,
    body: r`f(x) = 4x^{3} - \tfrac{1}{2}x^{2} + 6`, answer: r`12x^{2} - x`,
    steps: termsgewijs(r`f(x) = 4x^{3} - \tfrac{1}{2}x^{2} + 6`, [['4x^3', '12x^2'], [r`-\tfrac{1}{2}x^2`, r`-2 \cdot \tfrac{1}{2}x = -x`], ['6', '0']], '12x^2 - x',
      r`Buitenste schil: losse termen, geen haakjes, geen breuk met $x$ → gewoon termsgewijs met de machtsregel.`),
  },
  {
    cluster: 'welke_regel', level: 2,
    body: r`f(x) = \dfrac{5}{x^{2} + 3}`, answer: r`\dfrac{-10x}{(x^{2} + 3)^{2}}`,
    steps: quotient(r`f(x) = \dfrac{5}{x^{2} + 3}`, { g: '5', h: 'x^2 + 3', dg: '0', dh: '2x' }, r`0 \cdot (x^2 + 3) - 5 \cdot 2x`, '-10x',
      r`Buitenste schil: een breukstreep met $x$ in de noemer → quotiëntregel. De teller is een getal, dus $g' = 0$.`),
  },
  {
    cluster: 'welke_regel', level: 3,
    body: r`f(x) = (2x - 3)(x^{2} + x) - x^{3}`, answer: r`2(x^{2} + x) + (2x - 3)(2x + 1) - 3x^{2}`, alts: ['3x^2-2x-3'],
    steps: somGenest(r`f(x) = (2x - 3)(x^{2} + x) - x^{3}`, {
      u: '(2x - 3)(x^2 + x)', v: 'x^3', duPlain: '3x^2', inner: 'u', rule: 'product',
      gh: { g: '2x - 3', h: 'x^2 + x', dg: '2', dh: '2x + 1' },
      dInner: '2(x^2 + x) + (2x - 3)(2x + 1)', sign: '-',
      result: '2(x^2 + x) + (2x - 3)(2x + 1) - 3x^2',
    }, r`Buitenste schil: een $-$ tussen twee delen → somregel; het eerste deel is een product en vraagt de productregel.`),
  },
  {
    cluster: 'welke_regel', level: 3,
    body: r`g(t) = \dfrac{t^{2}}{2t - 1}`, answer: r`\dfrac{2t^{2} - 2t}{(2t - 1)^{2}}`, alts: ['(2t(2t-1)-t^2*2)/(2t-1)^2'],
    steps: quotient(r`g(t) = \dfrac{t^{2}}{2t - 1}`, { g: 't^2', h: '2t - 1', dg: '2t', dh: '2' }, r`2t(2t - 1) - t^2 \cdot 2`, '2t^2 - 2t',
      r`Buitenste schil: een breukstreep met $t$ in de noemer → quotiëntregel.`),
  },
  {
    cluster: 'welke_regel', level: 3,
    body: r`f(x) = 2x(x - 1)(x + 3)`, answer: r`6x^{2} + 8x - 6`, alts: ['2(x-1)(x+3)+2x(x+3)+2x(x-1)'],
    steps: uitwerken(r`f(x) = 2x(x - 1)(x + 3)`, '2x(x^2 + 3x - x - 3)', '2x^3 + 4x^2 - 6x', '6x^2 + 8x - 6',
      r`Buitenste schil: drie factoren → productregel voor drie factoren kan, maar uitwerken is hier sneller omdat alles polynoom is.`),
  },
  {
    cluster: 'welke_regel', level: 3,
    body: r`f(x) = 5 - \dfrac{3x}{x^{2} + 1}`, answer: r`\dfrac{3x^{2} - 3}{(x^{2} + 1)^{2}}`, alts: ['-(3-3x^2)/(x^2+1)^2', '0-(3(x^2+1)-3x*2x)/(x^2+1)^2'],
    steps: somGenest(r`f(x) = 5 - \dfrac{3x}{x^{2} + 1}`, {
      u: '5', v: r`\dfrac{3x}{x^2 + 1}`, duPlain: '0', inner: 'v', rule: 'quotient',
      gh: { g: '3x', h: 'x^2 + 1', dg: '3', dh: '2x' },
      dInner: r`\dfrac{3(x^2 + 1) - 3x \cdot 2x}{(x^2 + 1)^2} = \dfrac{3 - 3x^2}{(x^2 + 1)^2}`, sign: '-',
      result: r`0 - \dfrac{3 - 3x^2}{(x^2 + 1)^2} = \dfrac{3x^2 - 3}{(x^2 + 1)^2}`,
    }, r`Buitenste schil: een $-$ tussen $5$ en een breuk → somregel; de breuk vraagt straks de quotiëntregel.`),
  },
]

/** Oude cluster-slug → topic-slug (voor het matchen van bestaande vragen). */
const OLD_CLUSTER_TOPIC: Record<string, string> = {
  polynoom_differentieren: 'h2_termsgewijs',
  merkwaardige_producten: 'h2_haakjes_eerst',
  product_uitwerken: 'h2_haakjes_eerst',
  twee_polynomen: 'h2_productregel',
  kwadraat_van_polynoom: 'h2_productregel',
  drie_factoren: 'h2_productregel',
  eenvoudige_breuk: 'h2_quotientregel',
  polynoom_breuk: 'h2_quotientregel',
  som_met_breuk: 'h2_quotientregel',
}


export const H2: ChapterContent = {
  chapterSlug: 'h2',
  migrationFile: '0032_h2_stappenplan.sql',
  headerTitle: 'H2 "De afgeleide berekenen" — herindeling + stappenplan',
  specDoc: 'docs/h2-afgeleide-berekenen.md',
  sourceScript: 'scripts/h2-content.ts',
  headerNotes: [
    'Nummering springt van 0025 naar 0032: 0026–0031 zijn lokaal bezet door de',
    'gearchiveerde stoomcursus-tak (tag archief/stoomcursus-2026-09).',
  ],
  summaryFirst: 'Nieuw topic h2_gemengd + 6 nieuwe clusters; 5 clusters hernoemd (id blijft)',
  topicsNew: TOPICS_NEW,
  clusters: CLUSTERS,
  oldClusterTopic: OLD_CLUSTER_TOPIC,
  questions: Q,
}

export { Q, CLUSTERS, toPlain }

if (require.main === module) writeMigration(H2)
