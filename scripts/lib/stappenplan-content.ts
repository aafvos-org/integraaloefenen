/**
 * Generieke bouwstenen voor hoofdstuk-content met het vaste stappenplan
 * (stap 0 · buitenste schil, stap 1–3 per regel) en de generator die er een
 * SQL-migratie van maakt. Bedoeld voor de hoofdstuk-scripts (zie
 * docs/k1-substitutiemethode.md §4); nu nog geen gebruiker in de repo.
 *
 * Elke vraag heeft precies vier stappen (step_order 0 t/m 3). Een geneste regel
 * staat inline in stap 2. Bestaande vragen worden herkend op (oud cluster,
 * latex_body) en houden hun id.
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
