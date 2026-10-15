import type { SupabaseClient } from '@supabase/supabase-js'

import { SITE } from '@/config/site'
import { EXAMEN_HOOFDSTUK } from '@/lib/practice/examentraining'
import type { Database } from '@/lib/supabase/types'

type DB = SupabaseClient<Database>

export type ChapterInfo = {
  id: string
  slug: string
  title: string
  book_part: number
  order_index: number
}

export type TopicCategory =
  | 'primitiveren'
  | 'integralen'
  | 'vergelijkingen'
  | 'toepassingen'

export type TopicInfo = {
  id: string
  slug: string
  title: string
  chapter_id: string
  order_index: number
  category: TopicCategory | null
  theory_block_id: string | null
}

export type ParagraphInfo = {
  id: string
  chapter_id: string
  slug: string
  label: string
  title: string
  order_index: number
}

export type TheoryBlockInfo = {
  id: string
  paragraph_id: string
  slug: string
  letter: string
  title: string
  order_index: number
}

export type ClusterInfo = {
  id: string
  slug: string
  title: string
  topic_id: string
  order_index: number
}

export type NewExerciseTile = {
  questionId: string
  clusterId: string
  ordinal: number
  difficulty: 1 | 2 | 3
  latex_body: string | null
  preview: string
  lastCorrect: boolean | null
}

function stripForPreview(raw: string, maxLen: number): string {
  const oneLine = raw
    .replace(/\$\$/g, ' ')
    .replace(/\$/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return oneLine.length <= maxLen
    ? oneLine
    : `${oneLine.slice(0, maxLen - 1).trim()}…`
}

function clampDiff(n: number): 1 | 2 | 3 {
  if (n <= 1) return 1
  if (n >= 3) return 3
  return 2 as 1 | 2 | 3
}

export async function loadChapters(db: DB): Promise<ChapterInfo[]> {
  const { data, error } = await db
    .from('chapters')
    .select('id, slug, title, book_part, order_index')
    .eq('site', SITE)
    .order('order_index')
  if (error) throw new Error(error.message)
  // Examentraining is een eigen pagina, geen hoofdstuk onder Oefenen.
  return ((data ?? []) as ChapterInfo[]).filter((hoofdstuk) => hoofdstuk.slug !== EXAMEN_HOOFDSTUK)
}

export async function loadAllTopics(db: DB): Promise<TopicInfo[]> {
  const { data, error } = await db
    .from('topics_new')
    .select('id, slug, title, chapter_id, order_index, category, theory_block_id')
    .eq('site', SITE)
    .order('order_index')
  if (error) throw new Error(error.message)
  return (data ?? []) as TopicInfo[]
}

export async function loadParagraphs(db: DB): Promise<ParagraphInfo[]> {
  const { data, error } = await db
    .from('paragraphs')
    .select('id, chapter_id, slug, label, title, order_index')
    .eq('site', SITE)
    .order('order_index')
  if (error) throw new Error(error.message)
  return (data ?? []) as ParagraphInfo[]
}

export async function loadTheoryBlocks(db: DB): Promise<TheoryBlockInfo[]> {
  const { data, error } = await db
    .from('theory_blocks')
    .select('id, paragraph_id, slug, letter, title, order_index')
    .eq('site', SITE)
    .order('order_index')
  if (error) throw new Error(error.message)
  return (data ?? []) as TheoryBlockInfo[]
}

export async function loadClustersForTopics(
  db: DB,
  topicIds: string[],
): Promise<ClusterInfo[]> {
  if (!topicIds.length) return []
  const { data, error } = await db
    .from('topic_clusters_new')
    .select('id, slug, title, topic_id, order_index')
    .eq('site', SITE)
    .in('topic_id', topicIds)
    .order('order_index')
  if (error) throw new Error(error.message)
  return (data ?? []) as ClusterInfo[]
}

/** Alle clusters van deze site, zonder eerst de onderwerp-id's af te wachten. */
export async function loadAllClusters(db: DB): Promise<ClusterInfo[]> {
  const { data, error } = await db
    .from('topic_clusters_new')
    .select('id, slug, title, topic_id, order_index')
    .eq('site', SITE)
    .order('order_index')
  if (error) throw new Error(error.message)
  return (data ?? []) as ClusterInfo[]
}

export type VraagRij = {
  id: string
  cluster_id: string
  difficulty: number
  order_index: number | null
  latex_body: string | null
}

/** Alle opgaven van deze site. De volgorde bepaalt de aanroeper. */
export async function loadVragenVoorSite(db: DB): Promise<VraagRij[]> {
  const { data, error } = await db
    .from('questions_new')
    .select('id, cluster_id, difficulty, order_index, latex_body')
    .eq('site', SITE)
  if (error) throw new Error(error.message)
  return (data ?? []) as VraagRij[]
}

export async function loadTilesForClusters(
  db: DB,
  clusterIds: string[],
): Promise<NewExerciseTile[]> {
  if (!clusterIds.length) return []
  const { data, error } = await db
    .from('questions_new')
    .select('id, cluster_id, difficulty, order_index, latex_body')
    .eq('site', SITE)
    .in('cluster_id', clusterIds)
  if (error) throw new Error(error.message)
  return tegelsVanVragen(db, (data ?? []) as VraagRij[], clusterIds)
}

/**
 * Maakt tegels van al opgehaalde opgaven, in de volgorde van `clusterIds`.
 * De laatste goed/fout-status loopt daarna, in brokken, tegelijk.
 */
export async function tegelsVanVragen(
  db: DB,
  vragen: VraagRij[],
  clusterIds: string[],
): Promise<NewExerciseTile[]> {
  if (!clusterIds.length) return []
  const toegestaan = new Set(clusterIds)
  const sorted = vragen.filter((vraag) => toegestaan.has(vraag.cluster_id)).sort((a, b) => {
    const ai = clusterIds.indexOf(a.cluster_id)
    const bi = clusterIds.indexOf(b.cluster_id)
    if (ai !== bi) return ai - bi
    if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty
    return (a.order_index ?? 999) - (b.order_index ?? 999)
  })

  const lastCorrectByQuestionId = await laatsteAntwoorden(
    db,
    sorted.map((vraag) => vraag.id),
  )

  return sorted.map((q, i) => ({
    questionId: q.id,
    clusterId: q.cluster_id,
    ordinal: i + 1,
    difficulty: clampDiff(q.difficulty),
    latex_body: q.latex_body,
    preview: stripForPreview(q.latex_body ?? '', 56),
    lastCorrect: lastCorrectByQuestionId.get(q.id) ?? null,
  }))
}

/** Laatste goed/fout per vraag. RLS beperkt dit tot de eigen sessies. */
async function laatsteAntwoorden(
  db: DB,
  questionIds: string[],
): Promise<Map<string, boolean>> {
  const lastCorrectByQuestionId = new Map<string, boolean>()
  if (!questionIds.length) return lastCorrectByQuestionId

  // In brokken van 100 id's: alle id's in één .in() maakt de request-URI te lang.
  const chunks: string[][] = []
  for (let i = 0; i < questionIds.length; i += 100) chunks.push(questionIds.slice(i, i + 100))
  const results = await Promise.all(
    chunks.map((chunk) =>
      db
        .from('session_answers_new')
        .select('question_id, is_correct, answered_at')
        .in('question_id', chunk)
        .order('answered_at', { ascending: false }),
    ),
  )
  for (const { data: attempts, error: aErr } of results) {
    if (aErr) throw new Error(aErr.message)
    for (const row of attempts ?? []) {
      if (row.is_correct !== true && row.is_correct !== false) continue
      if (!lastCorrectByQuestionId.has(row.question_id)) {
        lastCorrectByQuestionId.set(row.question_id, row.is_correct)
      }
    }
  }
  return lastCorrectByQuestionId
}

export async function loadQuestionNew(
  db: DB,
  questionId: string,
): Promise<{
  id: string
  cluster_id: string | null
  latex_body: string | null
  difficulty: 1 | 2 | 3
  steps: Array<{ id: string; step_order: number; step_description: string }>
} | null> {
  const { data: q, error: qErr } = await db
    .from('questions_new')
    .select('id, cluster_id, difficulty, latex_body')
    .eq('id', questionId)
    .maybeSingle()
  if (qErr) throw new Error(qErr.message)
  if (!q) return null

  const { data: steps } = await db
    .from('question_steps_new')
    .select('id, step_order, step_description')
    .eq('question_id', q.id)
    .order('step_order')

  return {
    id: q.id,
    cluster_id: q.cluster_id ?? null,
    latex_body: q.latex_body,
    difficulty: clampDiff(q.difficulty),
    steps: (steps ?? []) as Array<{
      id: string
      step_order: number
      step_description: string
    }>,
  }
}
