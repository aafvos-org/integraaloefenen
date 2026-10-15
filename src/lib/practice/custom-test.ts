/**
 * Custom self-test ("zelf-toets") — data loading + question picking.
 *
 * Actions live in src/app/[locale]/zelf-toets/actions.ts.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

import { SITE } from '@/config/site'
import { EXAMEN_HOOFDSTUK } from '@/lib/practice/examentraining'
import type { Database } from '@/lib/supabase/types'

type DB = SupabaseClient<Database>

export type QuestionSource = 'new' | 'all' | 'wrong'

export type ConfigChapter = {
  id: string
  slug: string
  title: string
  order_index: number
}

export type ConfigTopic = {
  id: string
  slug: string
  title: string
  chapter_id: string
  order_index: number
  theory_block_id: string | null
}

export type ConfigParagraph = {
  id: string
  chapter_id: string
  slug: string
  label: string
  title: string
  order_index: number
}

export type ConfigBlock = {
  id: string
  paragraph_id: string
  slug: string
  letter: string
  title: string
  order_index: number
}

export type ConfigCluster = {
  id: string
  slug: string
  title: string
  topic_id: string
  order_index: number
  questionCount: number
  newCount: number
  wrongCount: number
}

export type ConfigData = {
  chapters: ConfigChapter[]
  paragraphs: ConfigParagraph[]
  blocks: ConfigBlock[]
  topics: ConfigTopic[]
  clusters: ConfigCluster[]
}

export async function loadConfigData(db: DB, userId: string): Promise<ConfigData> {
  const [
    { data: chapters },
    { data: paragraphs },
    { data: blocks },
    { data: topics },
    { data: clusters },
    { data: questions },
    { data: sessions },
  ] = await Promise.all([
    db
      .from('chapters')
      .select('id, slug, title, order_index')
      .eq('site', SITE)
      .order('order_index'),
    db
      .from('paragraphs')
      .select('id, chapter_id, slug, label, title, order_index')
      .eq('site', SITE)
      .order('order_index'),
    db
      .from('theory_blocks')
      .select('id, paragraph_id, slug, letter, title, order_index')
      .eq('site', SITE)
      .order('order_index'),
    db
      .from('topics_new')
      .select('id, slug, title, chapter_id, order_index, theory_block_id')
      .eq('site', SITE)
      .order('order_index'),
    db
      .from('topic_clusters_new')
      .select('id, slug, title, topic_id, order_index')
      .eq('site', SITE)
      .order('order_index'),
    db
      .from('questions_new')
      .select('id, cluster_id')
      .eq('site', SITE),
    db.from('user_sessions_new').select('id').eq('user_id', userId),
  ])

  // Build cluster → question IDs map
  const questionsByCluster = new Map<string, string[]>()
  for (const q of questions ?? []) {
    const arr = questionsByCluster.get(q.cluster_id) ?? []
    arr.push(q.id)
    questionsByCluster.set(q.cluster_id, arr)
  }

  const sessionIds = (sessions ?? []).map((s) => s.id)

  const answeredIds = new Set<string>()
  const wrongIds = new Set<string>()
  if (sessionIds.length > 0) {
    const { data: answers } = await db
      .from('session_answers_new')
      .select('question_id, is_correct')
      .in('session_id', sessionIds)
    for (const a of answers ?? []) {
      answeredIds.add(a.question_id)
      if (a.is_correct === false) wrongIds.add(a.question_id)
    }
  }

  const enrichedClusters: ConfigCluster[] = (clusters ?? []).map((c) => {
    const qIds = questionsByCluster.get(c.id) ?? []
    let newCount = 0
    let wrongCount = 0
    for (const qid of qIds) {
      if (!answeredIds.has(qid)) newCount++
      if (wrongIds.has(qid)) wrongCount++
    }
    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      topic_id: c.topic_id,
      order_index: c.order_index,
      questionCount: qIds.length,
      newCount,
      wrongCount,
    }
  })

  return {
    chapters: ((chapters ?? []) as ConfigChapter[]).filter(
      (hoofdstuk) => hoofdstuk.slug !== EXAMEN_HOOFDSTUK,
    ),
    paragraphs: (paragraphs ?? []) as ConfigParagraph[],
    blocks: (blocks ?? []) as ConfigBlock[],
    topics: (topics ?? []) as ConfigTopic[],
    clusters: enrichedClusters,
  }
}

/**
 * Pick `count` random question IDs from `clusterIds`, filtered by source.
 * Returns an empty list when nothing matches.
 *
 * De lijst is altijd zonder dubbelen: `custom_test_questions` heeft een
 * UNIQUE op (session_id, question_id), dus één dubbele id laat de hele
 * toets klappen.
 */
export async function pickQuestionsForTest(
  db: DB,
  userId: string,
  clusterIds: string[],
  source: QuestionSource,
  count: number,
): Promise<string[]> {
  if (clusterIds.length === 0 || count <= 0) return []

  const { data: questions } = await db
    .from('questions_new')
    .select('id, cluster_id')
    .eq('site', SITE)
    .in('cluster_id', clusterIds)

  let pool = Array.from(new Set((questions ?? []).map((q) => q.id)))
  if (pool.length === 0) return []

  if (source !== 'all') {
    const { data: sessions } = await db
      .from('user_sessions_new')
      .select('id')
      .eq('user_id', userId)
    const sessionIds = (sessions ?? []).map((s) => s.id)

    const answeredIds = new Set<string>()
    const wrongIds = new Set<string>()

    if (sessionIds.length > 0) {
      const { data: answers } = await db
        .from('session_answers_new')
        .select('question_id, is_correct')
        .in('session_id', sessionIds)
      for (const a of answers ?? []) {
        answeredIds.add(a.question_id)
        if (a.is_correct === false) wrongIds.add(a.question_id)
      }
    }

    if (source === 'new') pool = pool.filter((id) => !answeredIds.has(id))
    else if (source === 'wrong') pool = pool.filter((id) => wrongIds.has(id))
  }

  // Fisher–Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j]!, pool[i]!]
  }

  return pool.slice(0, count)
}

/**
 * Een zelf-toets bestaat uit twee rijen-groepen: de sessie in
 * `user_sessions_new` en de gekozen vragen in `custom_test_questions`. Die
 * kunnen niet in één keer weg (de vragen verwijzen naar de sessie), dus hier
 * wordt met de hand opgeruimd als de tweede stap misgaat. Zonder dat blijft
 * er een toets zonder vragen staan: de leerling krijgt een foutmelding, ziet
 * daarna "Bezig" in zijn lijst, en de teller achter de naam loopt op (INT-80).
 */
export type CreateCustomTestResult =
  | { ok: true; sessionId: string }
  | { ok: false; error: string }

/** Wat de leerling te zien krijgt. De echte fout gaat naar de serverlog. */
const AANMAKEN_MISLUKT =
  'Het maken van je toets lukte niet. Probeer het nog een keer.'

/** Hoeveel keer het wegschrijven van de vragen opnieuw geprobeerd wordt. */
const POGINGEN = 2

/**
 * Een databasefout in stukjes die veilig in de log mogen: geen antwoorden,
 * geen e-mailadressen, alleen wat PostgREST zelf teruggeeft.
 */
function foutDetails(error: unknown): Record<string, unknown> {
  if (!error || typeof error !== 'object') return { message: String(error) }
  const e = error as { code?: string; message?: string; details?: string; hint?: string }
  return { code: e.code, message: e.message, details: e.details, hint: e.hint }
}

export async function createCustomTest(
  db: DB,
  userId: string,
  input: {
    questionIds: string[]
    name: string
    showAnswers: 'immediate' | 'end'
  },
): Promise<CreateCustomTestResult> {
  const questionIds = Array.from(new Set(input.questionIds))
  if (questionIds.length === 0) {
    return { ok: false, error: 'Geen vragen beschikbaar voor deze selectie.' }
  }

  const { data: session, error: sessionErr } = await db
    .from('user_sessions_new')
    .insert({
      user_id: userId,
      session_type: 'custom_test',
      name: input.name,
      show_answers: input.showAnswers,
    })
    .select('id')
    .single()
  if (sessionErr || !session) {
    console.error('[zelf-toets] sessie aanmaken mislukt', foutDetails(sessionErr))
    return { ok: false, error: AANMAKEN_MISLUKT }
  }

  const rows = questionIds.map((questionId, index) => ({
    session_id: session.id,
    question_id: questionId,
    order_index: index,
  }))

  for (let poging = 1; poging <= POGINGEN; poging++) {
    const { error: insertErr } = await db
      .from('custom_test_questions')
      .insert(rows)

    if (insertErr) {
      console.error(`[zelf-toets] poging ${poging}: vragen wegschrijven mislukt`, {
        aantal: rows.length,
        ...foutDetails(insertErr),
      })
    } else {
      // Pas doortellen als de vragen er écht in staan. Zonder deze controle
      // sturen we de leerling door naar een toets die leeg blijkt te zijn.
      const { count, error: countErr } = await db
        .from('custom_test_questions')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', session.id)

      if (!countErr && count === rows.length) {
        return { ok: true, sessionId: session.id }
      }
      console.error(`[zelf-toets] poging ${poging}: ${count ?? '?'} van ${rows.length} vragen opgeslagen`, foutDetails(countErr))
    }

    // Schone lei voor de volgende poging: een halve vullingen zou op de
    // primaire sleutel (session_id, order_index) stuklopen.
    await db.from('custom_test_questions').delete().eq('session_id', session.id)
  }

  const { error: opruimErr } = await db
    .from('user_sessions_new')
    .delete()
    .eq('id', session.id)
  if (opruimErr) {
    console.error('[zelf-toets] lege toets kon niet worden opgeruimd', {
      sessionId: session.id,
      ...foutDetails(opruimErr),
    })
  }

  return { ok: false, error: AANMAKEN_MISLUKT }
}

/** Hoeveel lege toetsen er per keer worden opgeruimd. */
const MAX_OPRUIMEN = 25

/**
 * Ruim zelf-toetsen van deze leerling op waar geen enkele vraag in staat.
 * Die zijn blijven liggen toen het aanmaken halverwege misging: de leerling
 * kan er niets mee ("Bezig", maar de knop brengt je terug naar het begin), ze
 * tellen mee in de naam van de volgende toets, en ze vervuilen de metingen.
 *
 * Alleen toetsen van een paar minuten oud, zodat een toets die op dit moment
 * ergens anders wordt aangemaakt met rust wordt gelaten.
 */
export async function removeEmptyCustomTests(
  db: DB,
  userId: string,
): Promise<number> {
  const grens = new Date(Date.now() - 5 * 60 * 1000).toISOString()

  const { data: sessions } = await db
    .from('user_sessions_new')
    .select('id')
    .eq('user_id', userId)
    .eq('session_type', 'custom_test')
    .lt('started_at', grens)

  const ids = (sessions ?? []).map((s) => s.id)
  if (ids.length === 0) return 0

  // Een gevulde toets heeft altijd een vraag op plek 0. Door daarop te
  // filteren komt er hooguit één rij per toets terug, dus de rijlimiet van
  // PostgREST kan een volle toets nooit per ongeluk leeg laten lijken.
  const { data: eerste, error: eersteErr } = await db
    .from('custom_test_questions')
    .select('session_id')
    .in('session_id', ids)
    .eq('order_index', 0)
  if (eersteErr) return 0

  const gevuld = new Set((eerste ?? []).map((r) => r.session_id))
  const kandidaten = ids.filter((id) => !gevuld.has(id)).slice(0, MAX_OPRUIMEN)
  if (kandidaten.length === 0) return 0

  // Dubbelcheck: alleen weg als er echt niets aan hangt.
  const [{ data: vragen }, { data: antwoorden }] = await Promise.all([
    db.from('custom_test_questions').select('session_id').in('session_id', kandidaten),
    db.from('session_answers_new').select('session_id').in('session_id', kandidaten),
  ])
  const inGebruik = new Set([
    ...(vragen ?? []).map((r) => r.session_id),
    ...(antwoorden ?? []).map((r) => r.session_id),
  ])

  const leeg = kandidaten.filter((id) => !inGebruik.has(id))
  if (leeg.length === 0) return 0

  const { error } = await db.from('user_sessions_new').delete().in('id', leeg)
  if (error) {
    console.error('[zelf-toets] opruimen van lege toetsen mislukt', foutDetails(error))
    return 0
  }
  return leeg.length
}

export type TestSessionState = {
  sessionId: string
  totalCount: number
  answeredCount: number
  ended: boolean
  showAnswers: 'immediate' | 'end'
  /** First unanswered question id, or null when all done */
  nextQuestionId: string | null
  /** 1-based ordinal of the next question */
  nextOrdinal: number | null
}

export async function loadTestSessionState(
  db: DB,
  userId: string,
  sessionId: string,
): Promise<TestSessionState | null> {
  const { data: session } = await db
    .from('user_sessions_new')
    .select('id, user_id, session_type, ended_at, show_answers')
    .eq('id', sessionId)
    .maybeSingle()
  if (!session || session.user_id !== userId || session.session_type !== 'custom_test') {
    return null
  }

  const { data: questions } = await db
    .from('custom_test_questions')
    .select('question_id, order_index')
    .eq('session_id', sessionId)
    .order('order_index')

  const { data: answers } = await db
    .from('session_answers_new')
    .select('question_id')
    .eq('session_id', sessionId)

  const answeredIds = new Set((answers ?? []).map((a) => a.question_id))
  const totalCount = (questions ?? []).length
  const answeredCount = (questions ?? []).filter((q) => answeredIds.has(q.question_id)).length

  const nextEntry = (questions ?? []).find((q) => !answeredIds.has(q.question_id))

  return {
    sessionId,
    totalCount,
    answeredCount,
    ended: session.ended_at != null,
    showAnswers: (session.show_answers as 'immediate' | 'end') ?? 'immediate',
    nextQuestionId: nextEntry?.question_id ?? null,
    nextOrdinal: nextEntry ? nextEntry.order_index + 1 : null,
  }
}

export type ResultBreakdown = {
  totalCount: number
  correctCount: number
  perCluster: Array<{
    clusterId: string
    clusterTitle: string
    topicTitle: string
    chapterSlug: string
    topicSlug: string
    clusterSlug: string
    /** Leeg als de som niet aan een theorieblok hangt. */
    blockSlug: string
    /** Bijvoorbeeld "K.1 A". Leeg zonder blok. */
    blockLabel: string
    total: number
    correct: number
    items: Array<{
      questionId: string
      latexBody: string | null
      userAnswer: string | null
      correctAnswer: string
      latexAnswer: string | null
      isCorrect: boolean
    }>
  }>
}

export async function loadTestResults(
  db: DB,
  userId: string,
  sessionId: string,
): Promise<ResultBreakdown | null> {
  const { data: session } = await db
    .from('user_sessions_new')
    .select('id, user_id, session_type')
    .eq('id', sessionId)
    .maybeSingle()
  if (!session || session.user_id !== userId || session.session_type !== 'custom_test') {
    return null
  }

  const { data: testQuestions } = await db
    .from('custom_test_questions')
    .select('question_id, order_index')
    .eq('session_id', sessionId)
    .order('order_index')

  const questionIds = (testQuestions ?? []).map((q) => q.question_id)
  if (questionIds.length === 0) {
    return { totalCount: 0, correctCount: 0, perCluster: [] }
  }

  const [{ data: questions }, { data: answers }] = await Promise.all([
    db
      .from('questions_new')
      .select('id, cluster_id, latex_body, answer, latex_answer')
      .in('id', questionIds),
    db
      .from('session_answers_new')
      .select('question_id, user_answer, is_correct')
      .eq('session_id', sessionId),
  ])

  const clusterIds = Array.from(
    new Set((questions ?? []).map((q) => q.cluster_id)),
  )

  const { data: clusters } = await db
    .from('topic_clusters_new')
    .select('id, slug, title, topic_id')
    .in('id', clusterIds.length ? clusterIds : ['__none__'])

  const topicIds = Array.from(new Set((clusters ?? []).map((c) => c.topic_id)))
  const { data: topics } = await db
    .from('topics_new')
    .select('id, slug, title, chapter_id, theory_block_id')
    .in('id', topicIds.length ? topicIds : ['__none__'])

  const chapterIds = Array.from(new Set((topics ?? []).map((t) => t.chapter_id)))
  const blockIds = Array.from(
    new Set(
      (topics ?? [])
        .map((t) => t.theory_block_id)
        .filter((id): id is string => id != null),
    ),
  )
  const [{ data: chapters }, { data: blocks }] = await Promise.all([
    db
      .from('chapters')
      .select('id, slug')
      .in('id', chapterIds.length ? chapterIds : ['__none__']),
    db
      .from('theory_blocks')
      .select('id, slug, letter, paragraph_id')
      .in('id', blockIds.length ? blockIds : ['__none__']),
  ])

  const paragraphIds = Array.from(new Set((blocks ?? []).map((b) => b.paragraph_id)))
  const { data: paragraphs } = await db
    .from('paragraphs')
    .select('id, label')
    .in('id', paragraphIds.length ? paragraphIds : ['__none__'])

  const clusterById = new Map((clusters ?? []).map((c) => [c.id, c]))
  const topicById = new Map((topics ?? []).map((t) => [t.id, t]))
  const chapterById = new Map((chapters ?? []).map((c) => [c.id, c]))
  const blockById = new Map((blocks ?? []).map((b) => [b.id, b]))
  const paragraphById = new Map((paragraphs ?? []).map((p) => [p.id, p]))
  const questionById = new Map((questions ?? []).map((q) => [q.id, q]))
  const answerByQuestion = new Map((answers ?? []).map((a) => [a.question_id, a]))

  const groups = new Map<string, ResultBreakdown['perCluster'][number]>()

  let totalCount = 0
  let correctCount = 0

  for (const tq of testQuestions ?? []) {
    const q = questionById.get(tq.question_id)
    if (!q) continue
    const cluster = clusterById.get(q.cluster_id)
    const topic = cluster ? topicById.get(cluster.topic_id) : null
    const chapter = topic ? chapterById.get(topic.chapter_id) : null
    const block = topic?.theory_block_id ? blockById.get(topic.theory_block_id) : null
    const paragraph = block ? paragraphById.get(block.paragraph_id) : null
    const a = answerByQuestion.get(tq.question_id)
    const isCorrect = a?.is_correct === true

    totalCount++
    if (isCorrect) correctCount++

    const key = q.cluster_id
    if (!groups.has(key)) {
      groups.set(key, {
        clusterId: q.cluster_id,
        clusterTitle: cluster?.title ?? '—',
        topicTitle: topic?.title ?? '—',
        chapterSlug: chapter?.slug ?? '',
        topicSlug: topic?.slug ?? '',
        clusterSlug: cluster?.slug ?? '',
        blockSlug: block?.slug ?? '',
        blockLabel: block && paragraph ? `${paragraph.label} ${block.letter}` : '',
        total: 0,
        correct: 0,
        items: [],
      })
    }
    const g = groups.get(key)!
    g.total++
    if (isCorrect) g.correct++
    g.items.push({
      questionId: q.id,
      latexBody: q.latex_body,
      userAnswer: a?.user_answer ?? null,
      correctAnswer: q.answer,
      latexAnswer: q.latex_answer,
      isCorrect,
    })
  }

  return {
    totalCount,
    correctCount,
    perCluster: Array.from(groups.values()),
  }
}
