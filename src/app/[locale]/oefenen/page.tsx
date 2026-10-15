import { getTranslations, getLocale } from 'next-intl/server'
import { redirect } from 'next/navigation'

import {
  loadAllClusters,
  loadAllTopics,
  loadParagraphs,
  loadTheoryBlocks,
  loadQuestionNew,
  loadVragenVoorSite,
  tegelsVanVragen,
  type ClusterInfo,
  type TopicCategory,
} from '@/lib/practice/chapter-overview'
import {
  MACHTSREGEL_BLOK,
  eersteSomVoorLegeLeerling,
  makkelijksteSomInBlok,
} from '@/lib/practice/eerste-som'
import {
  clusterIdsVoorSelectie,
  losSelectieOp,
  oefenIndeling,
} from '@/lib/practice/oefenen-indeling'
import { getChapters, getIngelogdeLeerlingId } from '@/lib/supabase/request-cache'
import { createClient } from '@/lib/supabase/server'

import { eigenPagina } from '@/lib/seo'

import { OefenenClient } from './oefenen-client'

const CATEGORY_ORDER: TopicCategory[] = [
  'primitiveren',
  'integralen',
  'vergelijkingen',
  'toepassingen',
]
const CATEGORY_LABELS: Record<TopicCategory, string> = {
  primitiveren: 'Primitiveren',
  integralen: 'Integralen',
  vergelijkingen: 'Vergelijkingen',
  toepassingen: 'Toepassingen',
}

/**
 * Of deze leerling al een antwoord heeft opgeslagen.
 * Een fout telt als "al geoefend", zodat een vaste leerling het keuzescherm niet kwijtraakt.
 */
async function heeftAlEenAntwoord(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<boolean> {
  const { data: sessies, error: sessieFout } = await supabase
    .from('user_sessions_new')
    .select('id')
    .eq('user_id', userId)
  if (sessieFout) {
    console.error('[oefenen] sessies tellen mislukt', sessieFout.code ?? 'geen code')
    return true
  }
  const ids = (sessies ?? []).map((sessie) => sessie.id)
  if (ids.length === 0) return false

  for (let i = 0; i < ids.length; i += 100) {
    const { data, error } = await supabase
      .from('session_answers_new')
      .select('id')
      .in('session_id', ids.slice(i, i + 100))
      .limit(1)
    if (error) {
      console.error('[oefenen] antwoorden tellen mislukt', error.code ?? 'geen code')
      return true
    }
    if ((data ?? []).length > 0) return true
  }
  return false
}

function isCategory(v: string | null): v is TopicCategory {
  return (
    v === 'primitiveren' ||
    v === 'integralen' ||
    v === 'vergelijkingen' ||
    v === 'toepassingen'
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'FreeExercise' })
  return eigenPagina({
    locale,
    pad: '/oefenen',
    titel: t('title'),
    omschrijving: 'Oefen primitiveren en integralen voor wiskunde B. Kies een hoofdstuk en stuur de link naar een klasgenoot.',
  })
}

type PageProps = {
  searchParams?: Promise<{
    category?: string
    chapter?: string
    topic?: string
    cluster?: string
    blok?: string
    q?: string
  }>
}

export default async function OefenenPage(props: PageProps) {
  if (oefenIndeling() === 'onderwerp') return <OnderwerpPagina {...props} />
  return <BlokPagina {...props} />
}

async function OnderwerpPagina({ searchParams }: PageProps) {
  const [supabase, locale, userId] = await Promise.all([
    createClient(),
    getLocale(),
    getIngelogdeLeerlingId(),
  ])
  if (!userId) redirect(`/${locale}/inloggen`)

  const params = (await searchParams) ?? {}
  const categoryParam = params.category?.trim() ?? null
  const chapterParam = params.chapter?.trim() ?? null
  const topicParam = params.topic?.trim() ?? null
  const clusterParam = params.cluster?.trim() ?? null
  const qParam = params.q?.trim() ?? null

  const activeCategory: TopicCategory = isCategory(categoryParam)
    ? categoryParam
    : 'primitiveren'

  const [t, chapters, allTopicsRaw, alleClusters, vragen] = await Promise.all([
    getTranslations('FreeExercise'),
    getChapters(),
    loadAllTopics(supabase),
    loadAllClusters(supabase),
    loadVragenVoorSite(supabase),
  ])

  const allTopics = activeCategory
    ? allTopicsRaw.filter((t) => t.category === activeCategory)
    : allTopicsRaw

  const visibleChapterIds = new Set(allTopics.map((t) => t.chapter_id))
  const visibleChapters = activeCategory
    ? chapters.filter((c) => visibleChapterIds.has(c.id))
    : chapters

  const zichtbareOnderwerpen = new Set(allTopics.map((onderwerp) => onderwerp.id))
  const allClusters = alleClusters.filter((cluster) =>
    zichtbareOnderwerpen.has(cluster.topic_id),
  )

  // Resolve initial selection from URL params for first render
  const activeChapter =
    (chapterParam ? visibleChapters.find((c) => c.slug === chapterParam) : null) ??
    visibleChapters[0] ??
    null

  const chapterTopics = activeChapter
    ? allTopics.filter((t) => t.chapter_id === activeChapter.id)
    : []

  const activeTopic = topicParam
    ? (chapterTopics.find((t) => t.slug === topicParam) ?? null)
    : null

  const clustersByTopic = new Map<string, ClusterInfo[]>()
  for (const cl of allClusters) {
    const arr = clustersByTopic.get(cl.topic_id) ?? []
    arr.push(cl)
    clustersByTopic.set(cl.topic_id, arr)
  }

  const topicClusters = activeTopic ? (clustersByTopic.get(activeTopic.id) ?? []) : []
  const activeCluster = clusterParam
    ? (topicClusters.find((c) => c.slug === clusterParam) ?? null)
    : null

  const tileClusterIds: string[] = activeCluster
    ? [activeCluster.id]
    : activeTopic
      ? topicClusters.map((c) => c.id)
      : chapterTopics.flatMap((t) => (clustersByTopic.get(t.id) ?? []).map((c) => c.id))

  // Alle opgaven van alle zichtbare hoofdstukken (overzicht + navigator)
  const allClusterIdsOrdered = visibleChapters.flatMap((ch) =>
    allTopics
      .filter((t) => t.chapter_id === ch.id)
      .flatMap((t) => (clustersByTopic.get(t.id) ?? []).map((c) => c.id)),
  )
  const gekozenVraag = qParam ? loadQuestionNew(supabase, qParam) : null
  const allTiles = await tegelsVanVragen(supabase, vragen, allClusterIdsOrdered)

  // Starttegels afleiden uit allTiles i.p.v. een tweede query; de client
  // hernummert bij navigatie op dezelfde manier (zie chapterGroups)
  const tileClusterIdSet = new Set(tileClusterIds)
  const initialTiles = allTiles
    .filter((tile) => tileClusterIdSet.has(tile.clusterId))
    .map((tile, i) => ({ ...tile, ordinal: i + 1 }))

  const validQuestionIds = new Set(initialTiles.map((t) => t.questionId))
  const question =
    qParam && validQuestionIds.has(qParam) && gekozenVraag ? await gekozenVraag : null

  return (
    <OefenenClient
      indeling="onderwerp"
      key={activeCategory}
      chapters={visibleChapters}
      allTopics={allTopics}
      allClusters={allClusters}
      activeCategory={activeCategory}
      categoryOrder={CATEGORY_ORDER}
      categoryLabels={CATEGORY_LABELS}
      initialChapterSlug={activeChapter?.slug ?? null}
      initialTopicSlug={activeTopic?.slug ?? null}
      initialClusterSlug={activeCluster?.slug ?? null}
      initialTiles={initialTiles}
      allTiles={allTiles}
      question={question}
      labels={{
        chapterLabel: t('chapterLabel'),
        h1: t('h1'),
        difficultyHint: t('difficultyHint'),
        tilesHeading: t('tilesHeading'),
        tileLastCorrect: t('tileLastCorrect'),
        tileLastWrong: t('tileLastWrong'),
        tileNotTried: t('tileNotTried'),
        tileExercise: t('tileExercise'),
        backToAll: t('backToAll'),
        noExercises: t('noExercises'),
        questionsNav: t('questionsNav'),
        collapseSidebar: t('collapseSidebar'),
        expandSidebar: t('expandSidebar'),
      }}
    />
  )
}

async function BlokPagina({ searchParams }: PageProps) {
  const [supabase, locale, userId] = await Promise.all([
    createClient(),
    getLocale(),
    getIngelogdeLeerlingId(),
  ])
  if (!userId) redirect(`/${locale}/inloggen`)

  const params = (await searchParams) ?? {}
  const ruwAdres = {
    blok: params.blok?.trim() || null,
    topic: params.topic?.trim() || null,
    cluster: params.cluster?.trim() || null,
    chapter: params.chapter?.trim() || null,
  }
  const qParam = params.q?.trim() ?? null
  const zelfGekozen = Boolean(
    ruwAdres.blok || ruwAdres.topic || ruwAdres.cluster || ruwAdres.chapter || qParam,
  )

  // Catalogus en "heeft deze leerling al geoefend" hangen niet van elkaar af.
  const [t, chapters, allTopics, paragraphs, blocks, allClusters, vragen, heeftAntwoord] =
    await Promise.all([
      getTranslations('FreeExercise'),
      getChapters(),
      loadAllTopics(supabase),
      loadParagraphs(supabase),
      loadTheoryBlocks(supabase),
      loadAllClusters(supabase),
      loadVragenVoorSite(supabase),
      heeftAlEenAntwoord(supabase, userId),
    ])

  const allClusterIds = chapters.flatMap((ch) =>
    allTopics
      .filter((topic) => topic.chapter_id === ch.id)
      .flatMap((topic) =>
        allClusters.filter((cl) => cl.topic_id === topic.id).map((cl) => cl.id),
      ),
  )
  const gekozenVraag =
    zelfGekozen && qParam ? loadQuestionNew(supabase, qParam) : null
  const allTiles = await tegelsVanVragen(supabase, vragen, allClusterIds)

  const makkelijksteId = makkelijksteSomInBlok(
    MACHTSREGEL_BLOK,
    blocks,
    allTopics,
    allClusters,
    allTiles,
  )
  const start =
    !zelfGekozen && makkelijksteId
      ? eersteSomVoorLegeLeerling({
          heeftAntwoord,
          zelfGekozen: false,
          vraagId: makkelijksteId,
          blokSlug: MACHTSREGEL_BLOK,
        })
      : null
  const adres = start
    ? { blok: start.blok, topic: null, cluster: null, chapter: null }
    : ruwAdres
  const vraagId = start ? start.vraagId : qParam

  const data = { chapters, paragraphs, blocks, topics: allTopics, clusters: allClusters, tiles: allTiles }
  const selectie = losSelectieOp(adres, data)
  const scope = new Set(
    selectie ? clusterIdsVoorSelectie(selectie, allTopics, allClusters) : [],
  )
  const vraagMag =
    vraagId != null &&
    allTiles.some((tile) => tile.questionId === vraagId && scope.has(tile.clusterId))
  const question = vraagMag
    ? gekozenVraag && vraagId === qParam
      ? await gekozenVraag
      : await loadQuestionNew(supabase, vraagId)
    : null

  return (
    <OefenenClient
      indeling="blok"
      chapters={chapters}
      paragraphs={paragraphs}
      blocks={blocks}
      allTopics={allTopics}
      allClusters={allClusters}
      adres={adres}
      allTiles={allTiles}
      question={question}
      toonBeginzin={Boolean(start && question)}
      labels={{
        chapterLabel: t('chapterLabel'),
        h1: t('h1'),
        difficultyHint: t('difficultyHint'),
        tilesHeading: t('tilesHeading'),
        tileLastCorrect: t('tileLastCorrect'),
        tileLastWrong: t('tileLastWrong'),
        tileNotTried: t('tileNotTried'),
        tileExercise: t('tileExercise'),
        backToAll: t('backToAll'),
        noExercises: t('noExercises'),
        questionsNav: t('questionsNav'),
        collapseSidebar: t('collapseSidebar'),
        expandSidebar: t('expandSidebar'),
        oudeOpgaven: 'Oude opgaven',
        nogGeenOpgaven: 'nog geen opgaven',
        kiesOnderdeel: 'Kies een onderdeel',
        sluiten: 'Sluiten',
        beginMetDeze: 'Begin met deze. Links kies je iets anders als je dit al kunt.',
      }}
    />
  )
}
