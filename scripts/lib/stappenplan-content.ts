/**
 * Generieke bouwstenen voor hoofdstuk-content en de generator die er een
 * alleen-toevoegen SQL-migratie van maakt. Gebruikt door de hoofdstuk-scripts
 * (`scripts/k*-content.ts`, `scripts/h1*-content.ts`, `scripts/examen-*.ts`).
 *
 * Elke vraag heeft precies vier stappen (step_order 0 t/m 3).
 */
export const r = String.raw

export type ClusterDef = {
  topic: string
  slug: string
  title: string
  order: number
  /** Bestaande cluster-slug die hernoemd wordt (rij blijft, id blijft). */
  renameFrom?: string
}

export type Steps = [string, string, string, string]

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
  /**
   * Vaste `order_index` in het cluster. Zonder dit veld nummert de generator
   * zelf, op niveau. Bij aanvullen op bestaande vragen zet je hier 7, 8, …
   * zodat de nieuwe vragen achter de oude komen.
   */
  volgorde?: number
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
  /**
   * Verwacht totaal aantal vragen in het cluster ná deze migratie, inclusief
   * vragen uit een eerdere migratie. Zonder dit veld verwacht de controle
   * precies de vragen uit deze migratie.
   */
  verwachtAantal?: Record<string, number>
  /**
   * Tel bij de stapcontrole alleen de stappen van de vragen in deze migratie.
   * Nodig als de topics al stappen hebben uit een eerdere migratie.
   */
  alleenEigenStappen?: boolean
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
      .sort((a, b) => a.level - b.level || (a.volgorde ?? 0) - (b.volgorde ?? 0))
      .forEach((q, i) => order.set(q, q.volgorde ?? i + 1))
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
    const aantal = c.verwachtAantal?.[cl.slug] ?? c.questions.filter((x) => x.cluster === cl.slug).length
    w(`  SELECT count(*) INTO n FROM public.questions_new WHERE cluster_id = ${clusterRef(cl.topic, cl.slug)};`)
    w(`  IF n <> ${aantal} THEN RAISE EXCEPTION 'Cluster ${cl.slug} hoort ${aantal} vragen te hebben, gevonden %', n; END IF;`)
  }
  // Tellen per topic van déze migratie, niet per hoofdstuk: in hetzelfde
  // hoofdstuk staan ook de topics van eerdere migraties, en die moeten niet
  // meetellen — anders klopt het getal niet meer zodra er een blok bij komt.
  // Bij aanvullen (`alleenEigenStappen`) tellen we alleen de stappen van de
  // nieuwe opgaven: de topics hebben al stappen uit een eerdere migratie.
  const verwachtStappen = c.questions.length * 4
  if (c.alleenEigenStappen) {
    w(`  SELECT count(*) INTO n FROM public.question_steps_new s`)
    w(`  JOIN public.questions_new vr ON vr.id = s.question_id`)
    w(`  JOIN public.topic_clusters_new cl ON cl.id = vr.cluster_id`)
    w(`  JOIN public.topics_new t ON t.id = vr.topic_id`)
    w(`  JOIN (VALUES`)
    w(
      c.questions
        .map((x) => {
          const cl = clusterOf(x.cluster)
          return `    ('${cl.topic}', '${cl.slug}', ${q(x.latex)})`
        })
        .join(',\n'),
    )
    w(`  ) AS v(topic_slug, cluster_slug, latex_body)`)
    w(`    ON t.slug = v.topic_slug AND t.site = ${site}`)
    w(`   AND cl.slug = v.cluster_slug AND cl.topic_id = t.id`)
    w(`   AND vr.latex_body = v.latex_body;`)
  } else {
    const eigenTopics = c.topics.map((t) => `'${t.slug}'`).join(', ')
    w(`  SELECT count(*) INTO n FROM public.question_steps_new s`)
    w(`  JOIN public.questions_new vr ON vr.id = s.question_id`)
    w(`  JOIN public.topics_new t ON t.id = vr.topic_id`)
    w(`  WHERE t.site = ${site} AND t.slug IN (${eigenTopics});`)
  }
  const stapMelding = c.alleenEigenStappen
    ? `Deze vragen horen samen ${verwachtStappen} stappen te hebben`
    : `Deze topics horen samen ${verwachtStappen} stappen te hebben`
  w(`  IF n <> ${verwachtStappen} THEN RAISE EXCEPTION '${stapMelding}, gevonden %', n; END IF;`)
  w(`END $do$;`)
  w()
  w(`COMMIT;`)
  return out.join('\n') + '\n'
}
