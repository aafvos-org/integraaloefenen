/**
 * Generieke bouwstenen voor hoofdstuk-content met het vaste stappenplan
 * (stap 0 · buitenste schil, stap 1–3 per regel) en de generator die er een
 * SQL-migratie van maakt. Bedoeld voor de hoofdstuk-scripts (zie
 * docs/k1-substitutiemethode.md §4); nu nog geen gebruiker in de repo.
 *
 * Elke vraag heeft precies vier stappen (step_order 0 t/m 3). Een geneste regel
 * staat inline in stap 2. Bestaande vragen worden herkend op (oud cluster,
 * latex_body) en houden hun id.
 *
 * Er zijn twee generatoren:
 *
 *   • `generateMigration` — de afgeleiden-variant: verplaatst en hertitelt
 *     bestaande rijen en vervangt alle stappen van het hoofdstuk.
 *   • `generateAdditiveMigration` — voor nieuwe content (hoofdstuk K): voegt
 *     alleen rijen toe, raakt niets aan wat er al staat, en mag twee keer
 *     draaien zonder iets dubbel te zetten.
 */
import { writeFileSync } from 'node:fs'
import path from 'node:path'

export const r = String.raw

export type ClusterDef = {
  topic: string
  slug: string
  title: string
  order: number
  /** Bestaande cluster-slug die hernoemd wordt (rij blijft, id blijft). */
  renameFrom?: string
}

/** Naam en variabele uit "k(q) = …" */
export function parseHead(body: string): { name: string; v: string } {
  const m = body.match(/^([A-Za-z])\(([a-z])\)\s*=/)
  if (!m) throw new Error(`Geen functiekop in: ${body}`)
  return { name: m[1], v: m[2] }
}

export type Steps = [string, string, string, string]

export type Q = {
  /** Doelcluster (nieuwe slug) */
  cluster: string
  /** Bestaande vraag: [oude cluster-slug, oude latex_body]. Ontbreekt → nieuwe vraag. */
  existing?: [string, string]
  body: string
  answer: string // LaTeX
  alts?: string[] // extra goedgekeurde notaties (plain)
  level: 1 | 2 | 3
  steps: Steps
}

// ─────────────────────────────────────────────────────────────────────────────
// Stap-sjablonen per regel
// ─────────────────────────────────────────────────────────────────────────────

/** Termsgewijs: machtsregel per term. */
export function termsgewijs(body: string, terms: Array<[string, string]>, result: string, step0?: string): Steps {
  const { name, v } = parseHead(body)
  return [
    step0 ?? r`Buitenste schil: losse termen met $+$ en $-$ ertussen → somregel. Elke term apart met de machtsregel.`,
    r`Termen: ` + terms.map(([t]) => `$${t}$`).join(', ') + '.',
    r`Machtsregel per term, $[a${v}^n]' = n \cdot a${v}^{n-1}$: ` +
      terms.map(([t, d]) => `$[${t}]' = ${d}$`).join(', ') +
      '.',
    r`Optellen: $${name}'(${v}) = ${result}$.`,
  ]
}

/** Eerst haakjes uitwerken, dan termsgewijs. */
export function uitwerken(body: string, expansion: string, simplified: string, result: string, step0?: string): Steps {
  const { name, v } = parseHead(body)
  return [
    step0 ?? r`Buitenste schil: haakjes die je in één keer kunt uitwerken → eerst uitwerken, dan de somregel.`,
    r`Werk de haakjes uit: $${name}(${v}) = ${expansion}$.`,
    r`Herleid tot een polynoom: $${name}(${v}) = ${simplified}$.`,
    r`Termsgewijs differentiëren: $${name}'(${v}) = ${result}$.`,
  ]
}

export type GH = { g: string; h: string; dg: string; dh: string }

/** Productregel. */
export function product(body: string, p: GH, result: string, step0?: string): Steps {
  const { name, v } = parseHead(body)
  return [
    step0 ?? r`Buitenste schil: twee factoren met een $\cdot$ ertussen → productregel.`,
    r`Kies $g$ en $h$: $g(${v}) = ${p.g}$ en $h(${v}) = ${p.h}$.`,
    r`Bereken $g'$ en $h'$: $g'(${v}) = ${p.dg}$ en $h'(${v}) = ${p.dh}$.`,
    r`Vul de formule in: $${name}'(${v}) = g'(${v}) \cdot h(${v}) + g(${v}) \cdot h'(${v}) = ${result}$. Laat de haakjes staan.`,
  ]
}

export const KWADRAAT0 = r`Buitenste schil: een kwadraat van een polynoom → schrijf als $g \cdot g$ en gebruik de productregel.`

/** Quotiëntregel. filled = teller ingevuld, num = teller uitgewerkt. */
export function quotient(body: string, p: GH, filled: string, num: string, step0?: string): Steps {
  const { name, v } = parseHead(body)
  return [
    step0 ?? r`Buitenste schil: een breuk met $${v}$ in de noemer → quotiëntregel.`,
    r`$g$ is de teller, $h$ de noemer: $g(${v}) = ${p.g}$ en $h(${v}) = ${p.h}$.`,
    r`Bereken $g'$ en $h'$: $g'(${v}) = ${p.dg}$ en $h'(${v}) = ${p.dh}$.`,
    r`Vul de formule in: $${name}'(${v}) = \dfrac{g'(${v}) \cdot h(${v}) - g(${v}) \cdot h'(${v})}{(h(${v}))^2} = \dfrac{${filled}}{(${p.h})^2}$. Teller uitwerken: $${name}'(${v}) = \dfrac{${num}}{(${p.h})^2}$. De noemer laat je staan.`,
  ]
}

export type Genest = {
  u: string
  v: string
  /** Afgeleide van het "gewone" deel */
  duPlain: string
  /** Welk deel de geneste regel nodig heeft */
  inner: 'u' | 'v'
  rule: 'product' | 'quotient'
  gh: GH
  /** Afgeleide van het geneste deel */
  dInner: string
  sign: '+' | '-'
  result: string
}

/** Somregel met een product- of quotiëntregel genest in één van de delen (letters g/h; het geneste deel heet even f). */
export function somGenest(body: string, d: Genest, step0?: string): Steps {
  const { name, v: x } = parseHead(body)
  const L = { u: 'g', v: 'h' } as const
  const inner = L[d.inner]
  const plain = L[d.inner === 'u' ? 'v' : 'u']
  const ruleTxt =
    d.rule === 'product'
      ? r`een product → productregel. Noem dit deel even $f$ met $g(${x}) = ${d.gh.g}$ en $h(${x}) = ${d.gh.h}$; $g'(${x}) = ${d.gh.dg}$, $h'(${x}) = ${d.gh.dh}$`
      : r`een breuk → quotiëntregel. Noem dit deel even $f$ met $g(${x}) = ${d.gh.g}$ (teller) en $h(${x}) = ${d.gh.h}$ (noemer); $g'(${x}) = ${d.gh.dg}$, $h'(${x}) = ${d.gh.dh}$`
  return [
    step0 ?? r`Buitenste schil: een $${d.sign}$ tussen twee delen → somregel.`,
    r`Kies $g$ en $h$: $g(${x}) = ${d.u}$ en $h(${x}) = ${d.v}$.`,
    r`$${plain}'(${x}) = ${d.duPlain}$. Voor $${inner}$: ${ruleTxt}, dus $f'(${x}) = ${d.dInner}$. Dat is de afgeleide van $${inner}$.`,
    r`Voeg samen: $${name}'(${x}) = g'(${x}) ${d.sign} h'(${x}) = ${d.result}$.`,
  ]
}

export type PQR = { p: string; q: string; r: string; dp: string; dq: string; dr: string }

/** Productregel voor drie factoren. */
export function drieFactoren(body: string, f: PQR, result: string, step0?: string): Steps {
  const { name, v } = parseHead(body)
  return [
    step0 ?? r`Buitenste schil: drie factoren achter elkaar → productregel voor drie factoren: $(pqr)' = p'qr + pq'r + pqr'$.`,
    r`Kies de drie factoren: $p(${v}) = ${f.p}$, $q(${v}) = ${f.q}$ en $r(${v}) = ${f.r}$.`,
    r`Bereken de drie afgeleiden: $p'(${v}) = ${f.dp}$, $q'(${v}) = ${f.dq}$ en $r'(${v}) = ${f.dr}$.`,
    r`Vul de formule in: $${name}'(${v}) = ${result}$. Laat de haakjes staan.`,
  ]
}

/** LaTeX-antwoord → typbare tekst (zelfde stijl als bestaande rijen). */
export function toPlain(latex: string): string {
  let s = latex
  s = s.replace(/\\bigl|\\bigr/g, '')
  // eerst exponenten en decimalen ontdoen van accolades, zodat \dfrac-argumenten accoladevrij zijn
  s = s.replace(/\^\{(\d+)\}/g, '^$1')
  s = s.replace(/\{,\}/g, ',')
  // wortels: \sqrt[n]{A} → (A)^(1/n), \sqrt{A} → sqrt(A)
  s = s.replace(/\\sqrt\[(\d+)\]\{([^{}]*)\}/g, (_, n, a) => `(${a})^(1/${n})`)
  s = s.replace(/\\sqrt\{([^{}]*)\}/g, (_, a) => `sqrt(${a})`)
  // \dfrac{A}{B} → A/B met haakjes waar nodig
  const frac = /\\[dt]frac\{([^{}]*)\}\{([^{}]*)\}/
  const wrap = (x: string) => (/^[-0-9a-z]+(\^\d+)?$/.test(x) || /^\([^()]*\)(\^\d+)?$/.test(x) ? x : `(${x})`)
  while (frac.test(s)) s = s.replace(frac, (_, a, b) => `${wrap(a.trim())}/${wrap(b.trim())}`)
  s = s.replace(/\\cdot/g, '*')
  s = s.replace(/[{}]/g, '')
  return s.replace(/\s+/g, ' ').trim()
}


// ─────────────────────────────────────────────────────────────────────────────
// Extra sjablonen (H6): herschrijven, uitdelen, kettingregel
// ─────────────────────────────────────────────────────────────────────────────

/** Herschrijven naar machten (negatieve of gebroken exponent), dan machtsregel, dan terugschrijven. */
export function herschrijf(body: string, rewritten: string, terms: Array<[string, string]>, result: string, step0: string): Steps {
  const { name, v } = parseHead(body)
  return [
    step0,
    r`Herschrijf als macht: $${name}(${v}) = ${rewritten}$.`,
    r`Machtsregel per term, $[a${v}^n]' = n \cdot a${v}^{n-1}$: ` + terms.map(([t, d]) => `$[${t}]' = ${d}$`).join(', ') + '.',
    r`Schrijf terug zonder negatieve of gebroken exponent: $${name}'(${v}) = ${result}$.`,
  ]
}

/** Breuk met één term in de noemer: uitdelen, dan machtsregel, dan terugschrijven. */
export function uitdelen(body: string, split: string, rewritten: string, terms: Array<[string, string]>, result: string, step0?: string): Steps {
  const { name, v } = parseHead(body)
  return [
    step0 ?? r`Buitenste schil: een breuk met één term in de noemer → deel uit, dan termsgewijs (geen quotiëntregel nodig).`,
    r`Deel uit: $${name}(${v}) = ${split} = ${rewritten}$.`,
    r`Machtsregel per term: ` + terms.map(([t, d]) => `$[${t}]' = ${d}$`).join(', ') + '.',
    r`Schrijf terug zonder negatieve exponent: $${name}'(${v}) = ${result}$.`,
  ]
}

export type Ketting = {
  /** Buitenkant met de kern als puntjes, bv. `(\ldots)^3` of `\sqrt{\ldots}` */
  buiten: string
  kern: string
  /** Afgeleide van de buitenkant mét de kern erin, bv. `3(4x + 3)^2` */
  dBuiten: string
  dKern: string
}

/** Kettingregel: buitenkant en kern. */
export function ketting(body: string, k: Ketting, product: string, result: string, step0?: string): Steps {
  const { name, v } = parseHead(body)
  return [
    step0 ?? r`Buitenste schil: een macht of wortel van een expressie → kettingregel.`,
    r`Buitenkant en kern: buitenkant $${k.buiten}$, kern $${k.kern}$.`,
    r`Afgeleide van de buitenkant met de kern erin: $${k.dBuiten}$. Afgeleide van de kern: $${k.dKern}$.`,
    r`Vermenigvuldig: $${name}'(${v}) = ${product} = ${result}$.`,
  ]
}

export type KettingCombi = {
  outer: 'product' | 'quotient'
  g: string
  h: string
  dg: string
  dh: string
  /** In welk deel de kettingregel zit */
  kettingIn: 'g' | 'h'
  k: Ketting
  result: string
}

/** Product- of quotiëntregel met een kettingregel in één van de delen. */
export function kettingCombi(body: string, c: KettingCombi, step0?: string): Steps {
  const { name, v } = parseHead(body)
  const plain = c.kettingIn === 'g' ? 'h' : 'g'
  const dPlain = c.kettingIn === 'g' ? c.dh : c.dg
  const dK = c.kettingIn === 'g' ? c.dg : c.dh
  const step1 =
    c.outer === 'product'
      ? r`Kies $g$ en $h$: $g(${v}) = ${c.g}$ en $h(${v}) = ${c.h}$.`
      : r`$g$ is de teller, $h$ de noemer: $g(${v}) = ${c.g}$ en $h(${v}) = ${c.h}$.`
  const formule =
    c.outer === 'product'
      ? r`g'(${v}) \cdot h(${v}) + g(${v}) \cdot h'(${v})`
      : r`\dfrac{g'(${v}) \cdot h(${v}) - g(${v}) \cdot h'(${v})}{(h(${v}))^2}`
  return [
    step0 ??
      (c.outer === 'product'
        ? r`Buitenste schil: twee factoren met een $\cdot$ ertussen → productregel. In één factor zit een kettingregel.`
        : r`Buitenste schil: een breuk met $${v}$ in de noemer → quotiëntregel. In de breuk zit een kettingregel.`),
    step1,
    r`$${plain}'(${v}) = ${dPlain}$. Voor $${c.kettingIn}$: kettingregel met buitenkant $${c.k.buiten}$ en kern $${c.k.kern}$, dus $${c.kettingIn}'(${v}) = ${c.k.dBuiten} \cdot ${c.k.dKern} = ${dK}$.`,
    r`Vul de formule in: $${name}'(${v}) = ${formule} = ${c.result}$.`,
  ]
}

export type SomKetting = {
  u: string
  v: string
  duPlain: string
  inner: 'u' | 'v'
  k: Ketting
  dInner: string
  sign: '+' | '-'
  result: string
}

/** Somregel met een kettingregel in één van de delen (letters g/h). */
export function somKetting(body: string, d: SomKetting, step0?: string): Steps {
  const { name, v: x } = parseHead(body)
  const L = { u: 'g', v: 'h' } as const
  const inner = L[d.inner]
  const plain = L[d.inner === 'u' ? 'v' : 'u']
  return [
    step0 ?? r`Buitenste schil: een $${d.sign}$ tussen twee delen → somregel.`,
    r`Kies $g$ en $h$: $g(${x}) = ${d.u}$ en $h(${x}) = ${d.v}$.`,
    r`$${plain}'(${x}) = ${d.duPlain}$. Voor $${inner}$: kettingregel met buitenkant $${d.k.buiten}$ en kern $${d.k.kern}$, dus $${inner}'(${x}) = ${d.k.dBuiten} \cdot ${d.k.dKern} = ${d.dInner}$.`,
    r`Voeg samen: $${name}'(${x}) = g'(${x}) ${d.sign} h'(${x}) = ${d.result}$.`,
  ]
}

// ─────────────────────────────────────────────────────────────────────────────
// SQL-generatie
// ─────────────────────────────────────────────────────────────────────────────

export type ChapterContent = {
  /** chapters.slug, bv. 'h2' */
  chapterSlug: string
  /** Bestandsnaam van de migratie, bv. '0032_h2_stappenplan.sql' */
  migrationFile: string
  /** Titel achter "Migration NNNN:" */
  headerTitle: string
  /** Pad van het spec-document */
  specDoc: string
  /** Pad van het bronscript (voor de kop van de migratie) */
  sourceScript: string
  /** Extra toelichting in de kop, regel per regel (zonder "-- ") */
  headerNotes: string[]
  /** Eerste bullet van de samenvatting in de kop */
  summaryFirst: string
  topicsNew: Array<{ slug: string; title: string; order: number }>
  /** Bestaande topics die een andere titel krijgen */
  topicRetitle?: Array<{ slug: string; title: string }>
  clusters: ClusterDef[]
  /** Oude cluster-slug → topic-slug (voor het matchen van bestaande vragen) */
  oldClusterTopic: Record<string, string>
  questions: Q[]
}

function dq(s: string): string {
  if (s.includes('$h2sql$')) throw new Error(`Dollar-quote-conflict in: ${s}`)
  return `$h2sql$${s}$h2sql$`
}

const topicId = (slug: string) => `(SELECT id FROM public.topics_new WHERE slug = '${slug}')`
const clusterId = (topicSlug: string, clusterSlug: string) =>
  `(SELECT id FROM public.topic_clusters_new WHERE slug = '${clusterSlug}' AND topic_id = ${topicId(topicSlug)})`

export function generateMigration(c: ChapterContent): string {
  const { clusters: CLUSTERS, questions: Q, chapterSlug } = c
  const CH = chapterSlug.toUpperCase()
  const CH_TOPICS = `(SELECT id FROM public.topics_new WHERE chapter_id = (SELECT id FROM public.chapters WHERE slug = '${chapterSlug}'))`
  const clusterDef = (slug: string): ClusterDef => {
    const d = CLUSTERS.find((x) => x.slug === slug)
    if (!d) throw new Error(`Onbekend cluster ${slug}`)
    return d
  }
  const migrationNumber = c.migrationFile.slice(0, 4)

  // order_index per cluster: op niveau, dan op volgorde in het bronbestand
  const order = new Map<Q, number>()
  for (const cl of CLUSTERS) {
    const qs = Q.filter((q) => q.cluster === cl.slug).sort((a, b) => a.level - b.level)
    qs.forEach((q, i) => order.set(q, i + 1))
  }

  const out: string[] = []
  const w = (s = '') => out.push(s)

  w(`-- =============================================================================`)
  w(`-- Migration ${migrationNumber}: ${c.headerTitle}`)
  w(`-- =============================================================================`)
  w(`-- Gegenereerd door ${c.sourceScript} — niet met de hand bewerken.`)
  w(`-- Spec: ${c.specDoc}`)
  w(`--`)
  for (const n of c.headerNotes) w(`-- ${n}`)
  if (c.headerNotes.length) w(`--`)
  w(`--   • ${c.summaryFirst}`)
  w(`--   • ${Q.filter((q) => q.existing).length} bestaande vragen: verplaatst/hernummerd, canonieke antwoorden`)
  w(`--   • ${Q.filter((q) => !q.existing).length} nieuwe vragen`)
  w(`--   • Alle ${CH}-stappen vervangen door het vaste stappenplan (stap 0 t/m 3)`)
  w(`-- =============================================================================`)
  w()
  w(`BEGIN;`)
  w()
  w(`-- 1. Nieuw topic`)
  for (const t of c.topicsNew) {
    w(`INSERT INTO public.topics_new (slug, title, chapter_id, order_index, is_unlocked_by_default, site)`)
    w(`VALUES ('${t.slug}', ${dq(t.title)}, (SELECT id FROM public.chapters WHERE slug = '${chapterSlug}'), ${t.order}, false, 'afgeleiden')`)
    w(`ON CONFLICT (slug) DO NOTHING;`)
  }
  for (const t of c.topicRetitle ?? []) {
    w(`UPDATE public.topics_new SET title = ${dq(t.title)} WHERE slug = '${t.slug}';`)
  }
  w()
  w(`-- 2. Nieuwe clusters (hernoemen gebeurt in stap 4, ná het verplaatsen van vragen)`)
  for (const cl of CLUSTERS.filter((x) => !x.renameFrom)) {
    w(`INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)`)
    w(`SELECT ${topicId(cl.topic)}, '${cl.slug}', ${dq(cl.title)}, ${cl.order}, 'afgeleiden'`)
    w(`WHERE NOT EXISTS (SELECT 1 FROM public.topic_clusters_new WHERE slug = '${cl.slug}' AND topic_id = ${topicId(cl.topic)});`)
  }
  w()
  w(`-- 3. Bestaande vragen bijwerken (herkend op oud cluster + latex_body)`)
  w(`DO $do$`)
  w(`DECLARE n int;`)
  w(`BEGIN`)
  for (const q of Q.filter((x) => x.existing)) {
    const [oldCluster, oldBody] = q.existing!
    const target = clusterDef(q.cluster)
    const targetSlugNow = target.renameFrom ?? target.slug
    const alts = (q.alts ?? []).map(dq).join(', ')
    w(`  UPDATE public.questions_new SET`)
    w(`    cluster_id = ${clusterId(target.topic, targetSlugNow)},`)
    w(`    topic_id = ${topicId(target.topic)},`)
    w(`    latex_body = ${dq(q.body)},`)
    w(`    answer = ${dq(toPlain(q.answer))},`)
    w(`    latex_answer = ${dq(q.answer)},`)
    w(`    answer_alternatives = ARRAY[${alts}]::text[],`)
    w(`    difficulty = ${q.level},`)
    w(`    order_index = ${order.get(q)}`)
    w(`  WHERE latex_body = ${dq(oldBody)}`)
    w(`    AND cluster_id = ${clusterId(c.oldClusterTopic[oldCluster], oldCluster)};`)
    w(`  GET DIAGNOSTICS n = ROW_COUNT;`)
    w(`  IF n <> 1 THEN RAISE EXCEPTION 'Verwacht 1 rij voor % in %, gevonden %', ${dq(oldBody)}, '${oldCluster}', n; END IF;`)
  }
  w(`END $do$;`)
  w()
  w(`-- 4. Clusters hernoemen en hertitelen (id blijft; voortgang en video-koppelingen blijven werken)`)
  for (const cl of CLUSTERS) {
    const slugNow = cl.renameFrom ?? cl.slug
    w(`UPDATE public.topic_clusters_new SET slug = '${cl.slug}', title = ${dq(cl.title)}, order_index = ${cl.order}`)
    w(`WHERE slug = '${slugNow}' AND topic_id = ${topicId(cl.topic)};`)
  }
  w()
  w(`-- 5. Nieuwe vragen`)
  w(`INSERT INTO public.questions_new (topic_id, cluster_id, latex_body, answer, latex_answer, difficulty, is_ai_generated, order_index, answer_alternatives, site) VALUES`)
  const news = Q.filter((x) => !x.existing)
  news.forEach((q, i) => {
    const cl = clusterDef(q.cluster)
    const alts = (q.alts ?? []).map(dq).join(', ')
    w(`  (${topicId(cl.topic)}, ${clusterId(cl.topic, cl.slug)}, ${dq(q.body)}, ${dq(toPlain(q.answer))}, ${dq(q.answer)}, ${q.level}, true, ${order.get(q)}, ARRAY[${alts}]::text[], 'afgeleiden')${i === news.length - 1 ? ';' : ','}`)
  })
  w()
  w(`-- 6. Alle ${CH}-stappen vervangen`)
  w(`DELETE FROM public.question_steps_new WHERE question_id IN (SELECT id FROM public.questions_new WHERE topic_id IN ${CH_TOPICS});`)
  w()
  w(`INSERT INTO public.question_steps_new (question_id, step_order, step_description)`)
  w(`SELECT q.id, s.step_order, s.description`)
  w(`FROM (VALUES`)
  const rows: string[] = []
  for (const q of Q) {
    const cl = clusterDef(q.cluster)
    q.steps.forEach((text, i) => {
      rows.push(`  ('${cl.topic}', '${cl.slug}', ${dq(q.body)}, ${i}, ${dq(text)})`)
    })
  }
  w(rows.join(',\n'))
  w(`) AS s(topic_slug, cluster_slug, body, step_order, description)`)
  w(`JOIN public.topics_new t ON t.slug = s.topic_slug`)
  w(`JOIN public.topic_clusters_new c ON c.slug = s.cluster_slug AND c.topic_id = t.id`)
  w(`JOIN public.questions_new q ON q.latex_body = s.body AND q.cluster_id = c.id;`)
  w()
  w(`-- 7. Controle`)
  w(`DO $do$`)
  w(`DECLARE n int;`)
  w(`BEGIN`)
  w(`  SELECT count(*) INTO n FROM public.questions_new WHERE topic_id IN ${CH_TOPICS};`)
  w(`  IF n <> ${Q.length} THEN RAISE EXCEPTION '${CH} hoort ${Q.length} vragen te hebben, gevonden %', n; END IF;`)
  w(`  SELECT count(*) INTO n FROM public.question_steps_new WHERE question_id IN (SELECT id FROM public.questions_new WHERE topic_id IN ${CH_TOPICS});`)
  w(`  IF n <> ${Q.length * 4} THEN RAISE EXCEPTION '${CH} hoort ${Q.length * 4} stappen te hebben, gevonden %', n; END IF;`)
  for (const cl of CLUSTERS) {
    const cnt = Q.filter((q) => q.cluster === cl.slug).length
    w(`  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = ${clusterId(cl.topic, cl.slug)};`)
    w(`  IF n <> ${cnt} THEN RAISE EXCEPTION 'Cluster ${cl.slug} hoort ${cnt} vragen te hebben, gevonden %', n; END IF;`)
  }
  w(`END $do$;`)
  w()
  w(`COMMIT;`)
  return out.join('\n') + '\n'
}

export function validateContent(c: ChapterContent) {
  const keys = new Set<string>()
  const clusterSlugs = new Set(c.clusters.map((x) => x.slug))
  for (const q of c.questions) {
    if (!clusterSlugs.has(q.cluster)) throw new Error(`Onbekend cluster ${q.cluster}`)
    const k = `${q.cluster}|${q.body}`
    if (keys.has(k)) throw new Error(`Dubbele vraag: ${k}`)
    keys.add(k)
    if (q.steps.length !== 4) throw new Error(`Geen 4 stappen: ${q.body}`)
    if (q.existing && !c.oldClusterTopic[q.existing[0]]) throw new Error(`Onbekend oud cluster ${q.existing[0]}`)
  }
  const ex = new Set<string>()
  for (const q of c.questions.filter((x) => x.existing)) {
    const k = q.existing!.join('|')
    if (ex.has(k)) throw new Error(`Bestaande vraag dubbel gebruikt: ${k}`)
    ex.add(k)
  }
}

/** Valideer, schrijf de migratie en print een samenvatting. */
export function writeMigration(c: ChapterContent) {
  validateContent(c)
  const target = path.join(__dirname, '..', '..', 'supabase', 'migrations', c.migrationFile)
  writeFileSync(target, generateMigration(c))
  const Q = c.questions
  console.log(`Geschreven: ${target}`)
  console.log(`Vragen: ${Q.length} (bestaand ${Q.filter((q) => q.existing).length}, nieuw ${Q.filter((q) => !q.existing).length}), stappen: ${Q.length * 4}`)
  for (const cl of c.clusters) {
    const qs = Q.filter((q) => q.cluster === cl.slug)
    console.log(`  ${cl.topic.padEnd(18)} ${cl.slug.padEnd(24)} ${qs.length}  [${[1, 2, 3].map((l) => qs.filter((q) => q.level === l).length).join('/')}]`)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Alleen-toevoegen-migraties (hoofdstuk K)
// ─────────────────────────────────────────────────────────────────────────────

export type TopicCategory = 'primitiveren' | 'integralen' | 'vergelijkingen' | 'toepassingen'

/** Eén oefenvraag: de opgave, het antwoord, de stappen en de narekengegevens. */
export type AdditiveQ = {
  /** Cluster-slug waar de vraag in hoort. */
  cluster: string
  /** Vraagnummer in het JSON-bestand in `content/`; uniek binnen het bestand. */
  nummer: string
  /** De opgave in LaTeX (`questions_new.latex_body`). */
  latex: string
  /** Het antwoord in LaTeX (`questions_new.latex_answer`), met `+ c` waar dat hoort. */
  antwoordLatex: string
  /** Het antwoord zoals een leerling het typt (`questions_new.answer`). */
  antwoord: string
  /** Extra notaties die ook goed zijn. */
  alts?: string[]
  level: 1 | 2 | 3
  steps: Steps
  /**
   * De integrand in mathjs-notatie, voor `src/content/primitieven.test.ts`.
   *
   * Mag weg bij een vraag waar geen integraal in zit — een vergelijking of een
   * exacte waarde. Zo'n vraag komt dan niet in het bestand in `content/` en
   * wordt dus ook niet nagerekend; `integrand` en `primitieve` horen bij
   * elkaar, dus laat je ze allebei weg of allebei staan.
   */
  integrand?: string
  /** De primitieve in mathjs-notatie, zonder integratieconstante. */
  primitieve?: string
  domein?: [number, number]
  grenzen?: [number, number]
  waarde?: string | number
}

export type AdditiveChapter = {
  chapterSlug: string
  chapterTitle: string
  bookPart: number
  chapterOrder: number
  site: 'afgeleiden' | 'integralen'
  /** Bestandsnaam van de migratie, bv. '0034_k0b_primitiveren.sql' */
  migrationFile: string
  /** Titel achter "Migration NNNN:" */
  headerTitle: string
  /** Pad van het bronscript (voor de kop van de migratie) */
  sourceScript: string
  /** Extra toelichting in de kop, regel per regel (zonder "-- ") */
  headerNotes: string[]
  topics: Array<{ slug: string; title: string; order: number; category: TopicCategory }>
  clusters: ClusterDef[]
  questions: AdditiveQ[]
}

/** Dollar-quote met een eigen tag, zodat backslashes en aanhalingstekens niets stuk maken. */
function dollarQuote(s: string, tag: string): string {
  if (s.includes(`$${tag}$`)) throw new Error(`Dollar-quote-conflict in: ${s}`)
  return `$${tag}$${s}$${tag}$`
}

/** order_index per cluster: eerst op niveau, dan op volgorde in het bronbestand. */
function orderPerCluster(c: AdditiveChapter): Map<AdditiveQ, number> {
  const order = new Map<AdditiveQ, number>()
  for (const cl of c.clusters) {
    c.questions
      .filter((q) => q.cluster === cl.slug)
      .sort((a, b) => a.level - b.level)
      .forEach((q, i) => order.set(q, i + 1))
  }
  return order
}

export function validateAdditive(c: AdditiveChapter) {
  const topicSlugs = new Set(c.topics.map((t) => t.slug))
  const clusterSlugs = new Set<string>()
  for (const cl of c.clusters) {
    if (!topicSlugs.has(cl.topic)) throw new Error(`Cluster ${cl.slug} hangt aan onbekend topic ${cl.topic}`)
    if (clusterSlugs.has(cl.slug)) throw new Error(`Dubbel cluster: ${cl.slug}`)
    clusterSlugs.add(cl.slug)
  }

  const nummers = new Set<string>()
  const bodies = new Set<string>()
  for (const q of c.questions) {
    if (!clusterSlugs.has(q.cluster)) throw new Error(`Onbekend cluster ${q.cluster} bij vraag ${q.nummer}`)
    if (nummers.has(q.nummer)) throw new Error(`Dubbel vraagnummer: ${q.nummer}`)
    nummers.add(q.nummer)
    // De migratie koppelt stappen aan vragen op (cluster, latex_body); dat moet
    // één rij opleveren, dus mag die combinatie nergens twee keer voorkomen.
    const sleutel = `${q.cluster}|${q.latex}`
    if (bodies.has(sleutel)) throw new Error(`Dubbele opgave in hetzelfde cluster: ${sleutel}`)
    bodies.add(sleutel)
    if (q.steps.length !== 4) throw new Error(`Geen 4 stappen bij vraag ${q.nummer}`)
    if ((q.grenzen === undefined) !== (q.waarde === undefined)) {
      throw new Error(`Vraag ${q.nummer}: \`grenzen\` en \`waarde\` horen bij elkaar`)
    }
    if ((q.integrand === undefined) !== (q.primitieve === undefined)) {
      throw new Error(`Vraag ${q.nummer}: \`integrand\` en \`primitieve\` horen bij elkaar`)
    }
    if (q.integrand === undefined && q.grenzen !== undefined) {
      throw new Error(`Vraag ${q.nummer}: met \`grenzen\` hoort ook een \`primitieve\` om na te rekenen`)
    }
    for (const veld of ['integrand', 'primitieve'] as const) {
      const formule = q[veld]
      if (formule !== undefined && /\blog\s*\(/.test(formule)) {
        throw new Error(`Vraag ${q.nummer}: schrijf \`ln(...)\` of \`log10(...)\` in \`${veld}\``)
      }
    }
  }
  for (const cl of c.clusters) {
    if (!c.questions.some((q) => q.cluster === cl.slug)) throw new Error(`Cluster ${cl.slug} heeft geen vragen`)
  }
}

/**
 * Het JSON-bestand voor `content/`, dat `src/content/primitieven.test.ts`
 * narekent: per vraag de integrand en de primitieve in mathjs-notatie.
 *
 * Vragen zonder integraal (een vergelijking, een exacte waarde) hebben niets
 * om na te rekenen en blijven er dus buiten.
 */
export function generateContentFile(c: AdditiveChapter, onderdeel: string): string {
  const vragen = c.questions
    .filter((q) => q.integrand !== undefined && q.primitieve !== undefined)
    .map((q) => ({
      nummer: q.nummer,
      cluster: q.cluster,
      niveau: q.level,
      latex: q.latex,
      antwoord_latex: q.antwoordLatex,
      integrand: q.integrand,
      primitieve: q.primitieve,
      ...(q.domein ? { domein: q.domein } : {}),
      ...(q.grenzen ? { grenzen: q.grenzen } : {}),
      ...(q.waarde !== undefined ? { waarde: q.waarde } : {}),
      stappen: q.steps,
    }))
  return `${JSON.stringify({ hoofdstuk: c.chapterSlug.toUpperCase(), onderdeel, vragen }, null, 2)}\n`
}

/**
 * Een migratie die alleen rijen toevoegt. Twee keer draaien voegt niets dubbel
 * toe: hoofdstuk, topics en clusters gaan via `ON CONFLICT DO NOTHING`, vragen
 * via `WHERE NOT EXISTS` op (cluster, latex_body) en stappen via
 * `ON CONFLICT (question_id, step_order)`.
 */
export function generateAdditiveMigration(c: AdditiveChapter): string {
  validateAdditive(c)
  const tag = `${c.chapterSlug}sql`
  const q = (s: string) => dollarQuote(s, tag)
  const order = orderPerCluster(c)
  const nr = c.migrationFile.slice(0, 4)
  const site = `'${c.site}'`
  const chapterRef = `(SELECT id FROM public.chapters WHERE slug = '${c.chapterSlug}' AND site = ${site})`
  const topicRef = (slug: string) =>
    `(SELECT id FROM public.topics_new WHERE slug = '${slug}' AND site = ${site})`
  const clusterRef = (topic: string, cluster: string) =>
    `(SELECT id FROM public.topic_clusters_new WHERE slug = '${cluster}' AND topic_id = ${topicRef(topic)})`
  const clusterOf = (slug: string) => {
    const cl = c.clusters.find((x) => x.slug === slug)
    if (!cl) throw new Error(`Onbekend cluster ${slug}`)
    return cl
  }

  const out: string[] = []
  const w = (s = '') => out.push(s)

  w(`-- =============================================================================`)
  w(`-- Migration ${nr}: ${c.headerTitle}`)
  w(`-- =============================================================================`)
  w(`-- Gegenereerd door ${c.sourceScript} — niet met de hand bewerken.`)
  w(`--`)
  for (const n of c.headerNotes) w(n === '' ? `--` : `-- ${n}`)
  if (c.headerNotes.length) w(`--`)
  w(`-- Alleen toevoegen: geen DELETE, DROP, ALTER of UPDATE. Twee keer draaien`)
  w(`-- voegt niets dubbel toe.`)
  w(`--`)
  w(`--   • 1 hoofdstuk, ${c.topics.length} topics, ${c.clusters.length} clusters`)
  w(`--   • ${c.questions.length} vragen met elk 4 stappen (${c.questions.length * 4} stappen)`)
  w(`-- =============================================================================`)
  w()
  w(`BEGIN;`)
  w()
  w(`-- 1. Hoofdstuk`)
  w(`INSERT INTO public.chapters (slug, title, book_part, order_index, site)`)
  w(`VALUES ('${c.chapterSlug}', ${q(c.chapterTitle)}, ${c.bookPart}, ${c.chapterOrder}, ${site})`)
  w(`ON CONFLICT (slug) DO NOTHING;`)
  w()
  w(`-- 2. Topics`)
  w(`INSERT INTO public.topics_new (slug, title, chapter_id, order_index, is_unlocked_by_default, site, category)`)
  w(`SELECT v.slug, v.title, ${chapterRef}, v.order_index, true, ${site}, v.category`)
  w(`FROM (VALUES`)
  w(
    c.topics
      .map((t) => `  ('${t.slug}', ${q(t.title)}, ${t.order}, '${t.category}')`)
      .join(',\n'),
  )
  w(`) AS v(slug, title, order_index, category)`)
  w(`ON CONFLICT (slug) DO NOTHING;`)
  w()
  w(`-- 3. Clusters`)
  w(`INSERT INTO public.topic_clusters_new (topic_id, slug, title, order_index, site)`)
  w(`SELECT t.id, v.slug, v.title, v.order_index, ${site}`)
  w(`FROM (VALUES`)
  w(
    c.clusters
      .map((cl) => `  ('${cl.topic}', '${cl.slug}', ${q(cl.title)}, ${cl.order})`)
      .join(',\n'),
  )
  w(`) AS v(topic_slug, slug, title, order_index)`)
  w(`JOIN public.topics_new t ON t.slug = v.topic_slug AND t.site = ${site}`)
  w(`ON CONFLICT (topic_id, slug) DO NOTHING;`)
  w()
  w(`-- 4. Vragen`)
  w(`INSERT INTO public.questions_new`)
  w(`  (site, topic_id, cluster_id, latex_body, answer, latex_answer, difficulty, order_index, is_ai_generated, answer_alternatives)`)
  w(`SELECT ${site}, t.id, cl.id, v.latex_body, v.answer, v.latex_answer, v.difficulty, v.order_index, false, v.alternatives`)
  w(`FROM (VALUES`)
  w(
    c.questions
      .map((x) => {
        const cl = clusterOf(x.cluster)
        const alts = (x.alts ?? []).map(q).join(', ')
        return (
          `  ('${cl.topic}', '${cl.slug}', ${q(x.latex)}, ${q(x.antwoord)}, ${q(x.antwoordLatex)},` +
          ` ${x.level}, ${order.get(x)}, ARRAY[${alts}]::text[])`
        )
      })
      .join(',\n'),
  )
  w(`) AS v(topic_slug, cluster_slug, latex_body, answer, latex_answer, difficulty, order_index, alternatives)`)
  w(`JOIN public.topics_new t ON t.slug = v.topic_slug AND t.site = ${site}`)
  w(`JOIN public.topic_clusters_new cl ON cl.slug = v.cluster_slug AND cl.topic_id = t.id`)
  w(`WHERE NOT EXISTS (`)
  w(`  SELECT 1 FROM public.questions_new bestaand`)
  w(`  WHERE bestaand.cluster_id = cl.id AND bestaand.latex_body = v.latex_body`)
  w(`);`)
  w()
  w(`-- 5. Stappen (step_order 0 t/m 3)`)
  w(`INSERT INTO public.question_steps_new (question_id, step_order, step_description)`)
  w(`SELECT vr.id, v.step_order, v.step_description`)
  w(`FROM (VALUES`)
  const stapRijen: string[] = []
  for (const x of c.questions) {
    const cl = clusterOf(x.cluster)
    x.steps.forEach((tekst, i) => {
      stapRijen.push(`  ('${cl.topic}', '${cl.slug}', ${q(x.latex)}, ${i}, ${q(tekst)})`)
    })
  }
  w(stapRijen.join(',\n'))
  w(`) AS v(topic_slug, cluster_slug, latex_body, step_order, step_description)`)
  w(`JOIN public.topics_new t ON t.slug = v.topic_slug AND t.site = ${site}`)
  w(`JOIN public.topic_clusters_new cl ON cl.slug = v.cluster_slug AND cl.topic_id = t.id`)
  w(`JOIN public.questions_new vr ON vr.latex_body = v.latex_body AND vr.cluster_id = cl.id`)
  w(`ON CONFLICT (question_id, step_order) DO NOTHING;`)
  w()
  w(`-- 6. Controle`)
  w(`DO $do$`)
  w(`DECLARE n int;`)
  w(`BEGIN`)
  for (const cl of c.clusters) {
    const aantal = c.questions.filter((x) => x.cluster === cl.slug).length
    w(`  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = ${clusterRef(cl.topic, cl.slug)};`)
    w(`  IF n <> ${aantal} THEN RAISE EXCEPTION 'Cluster ${cl.slug} hoort ${aantal} vragen te hebben, gevonden %', n; END IF;`)
  }
  // Tellen per topic van déze migratie, niet per hoofdstuk: in hetzelfde
  // hoofdstuk staan ook de topics van eerdere migraties, en die moeten niet
  // meetellen — anders klopt het getal niet meer zodra er een blok bij komt.
  const eigenTopics = c.topics.map((t) => `'${t.slug}'`).join(', ')
  w(`  SELECT count(*) INTO n FROM public.question_steps_new s`)
  w(`  JOIN public.questions_new vr ON vr.id = s.question_id`)
  w(`  JOIN public.topics_new t ON t.id = vr.topic_id`)
  w(`  WHERE t.site = ${site} AND t.slug IN (${eigenTopics});`)
  w(`  IF n <> ${c.questions.length * 4} THEN RAISE EXCEPTION 'Deze topics horen samen ${c.questions.length * 4} stappen te hebben, gevonden %', n; END IF;`)
  w(`END $do$;`)
  w()
  w(`COMMIT;`)
  return out.join('\n') + '\n'
}
