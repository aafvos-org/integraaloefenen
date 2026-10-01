import { getTranslations, getLocale } from 'next-intl/server'
import { redirect } from 'next/navigation'

import { SITE } from '@/config/site'
import {
  getChapters,
  getCurrentProfile,
  getCurrentUser,
} from '@/lib/supabase/request-cache'
import { createClient } from '@/lib/supabase/server'

import { DashboardGrid } from './dashboard-grid'
import type { ChapterData, TopicData } from './topic-block'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Dashboard' })
  return { title: t('title') }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const locale = await getLocale()
  const user = await getCurrentUser()
  if (!user) redirect(`/${locale}/inloggen`)

  // Activity: last 14 days via user_sessions_new + session_answers_new
  const since14 = new Date()
  since14.setDate(since14.getDate() - 13)
  since14.setHours(0, 0, 0, 0)

  // Deze zeven ophaalacties hangen niet van elkaar af. Ze stonden achter elkaar
  // en kostten samen ruim een seconde aan wachttijd; parallel is dat de duur
  // van de traagste.
  const [t, tv, profile, chapters, topicsRes, clustersRes, progressRes, sessionsRes] =
    await Promise.all([
      getTranslations('Dashboard'),
      getTranslations('UitlegVideos'),
      getCurrentProfile(),
      getChapters(),
      supabase
        .from('topics_new')
        .select('id, title, slug, chapter_id, order_index')
        .eq('site', SITE)
        .order('order_index'),
      supabase
        .from('topic_clusters_new')
        .select('id, title, slug, topic_id, order_index')
        .eq('site', SITE)
        .order('order_index'),
      supabase
        .from('user_progress_new')
        .select('cluster_id, status, total_answered, total_correct, is_skipped')
        .eq('user_id', user.id),
      supabase
        .from('user_sessions_new')
        .select('id')
        .eq('user_id', user.id)
        .gte('started_at', since14.toISOString()),
    ])

  const topics = topicsRes.data
  const clusters = clustersRes.data
  const progressRows = progressRes.data

  const firstName =
    profile?.display_name?.trim().split(/\s+/)[0]?.trim() || null

  const progressByCluster = new Map(
    (progressRows ?? []).map((p) => [p.cluster_id, p]),
  )

  // Deze moet wél wachten: de antwoorden worden opgezocht per sessie-id.
  const sessionIds = (sessionsRes.data ?? []).map((s) => s.id)

  const { data: answersRows } = sessionIds.length > 0
    ? await supabase
        .from('session_answers_new')
        .select('answered_at, is_correct')
        .in('session_id', sessionIds)
        .gte('answered_at', since14.toISOString())
    : { data: [] }

  const dayKey = (d: Date) => d.toISOString().slice(0, 10)
  const bucket = new Map<string, number>()
  for (let i = 0; i < 14; i++) {
    const d = new Date(since14)
    d.setDate(since14.getDate() + i)
    bucket.set(dayKey(d), 0)
  }

  let totalAnswered = 0
  let totalCorrect = 0

  for (const row of answersRows ?? []) {
    const k = dayKey(new Date(row.answered_at))
    if (bucket.has(k)) bucket.set(k, (bucket.get(k) ?? 0) + 1)
    totalAnswered++
    if (row.is_correct) totalCorrect++
  }

  let streakDays = 0
  const todayKey = dayKey(new Date())
  for (const k of Array.from(bucket.keys()).sort().reverse()) {
    if (k > todayKey) continue
    if ((bucket.get(k) ?? 0) > 0) streakDays++
    else break
  }

  // Build chapter → meta map
  const chapterById = new Map((chapters ?? []).map((c) => [c.id, c]))

  // Sort topics by chapter order then topic order
  const sortedTopics = [...(topics ?? [])].sort((a, b) => {
    const ca = chapterById.get(a.chapter_id)?.order_index ?? 999
    const cb = chapterById.get(b.chapter_id)?.order_index ?? 999
    if (ca !== cb) return ca - cb
    return a.order_index - b.order_index
  })

  // Build TopicData per topic
  const topicDataById = new Map<string, TopicData>()
  for (const topic of sortedTopics) {
    const chapterSlug = chapterById.get(topic.chapter_id)?.slug ?? ''
    const topicClusters = (clusters ?? [])
      .filter((c) => c.topic_id === topic.id)
      .sort((a, b) => a.order_index - b.order_index)
      .map((c) => {
        const progress = progressByCluster.get(c.id)
        const isSkipped = progress?.is_skipped === true
        return {
          id: c.id,
          slug: c.slug,
          title: c.title,
          topicId: topic.id,
          totalAnswered: progress?.total_answered ?? 0,
          totalCorrect: progress?.total_correct ?? 0,
          isKnown: !isSkipped && progress?.status === 'mastered',
          isSkipped,
        }
      })
    topicDataById.set(topic.id, {
      id: topic.id,
      slug: topic.slug,
      title: topic.title,
      chapterSlug,
      clusters: topicClusters,
    })
  }

  // Group topics by chapter. Kopie vóór het sorteren: de hoofdstukkenlijst is
  // nu per request gedeeld met de header, en `sort` wijzigt de lijst zelf.
  const chapterData: ChapterData[] = [...(chapters ?? [])]
    .sort((a, b) => a.order_index - b.order_index)
    .map((chapter) => ({
      id: chapter.id,
      slug: chapter.slug,
      title: chapter.title,
      topics: sortedTopics
        .filter((t) => t.chapter_id === chapter.id)
        .map((t) => topicDataById.get(t.id)!)
        .filter(Boolean),
    }))
    .filter((ch) => ch.topics.length > 0)

  return (
    <div className="mx-auto max-w-[1400px] px-3 py-6">
      <div className="mb-2">
        <h1 className="font-serif text-2xl text-text">
          {firstName
            ? t('greetingWithName', { name: firstName })
            : t('progressTitle')}
        </h1>
      </div>

      <DashboardGrid
        chapterData={chapterData}
        streakDays={streakDays}
        totalAnswered={totalAnswered}
        totalCorrect={totalCorrect}
        vraagTitel={tv('askTitle')}
        vraagIntro={tv('askIntro')}
        vraagLabels={{
          askPlaceholder: tv('askPlaceholder'),
          askSend: tv('askSend'),
          askThanks: tv('askThanks'),
          askPhoto: tv('askPhoto'),
          askPhotoHint: tv('askPhotoHint'),
          askPhotoRemove: tv('askPhotoRemove'),
          askPhotoBusy: tv('askPhotoBusy'),
          askPhotoTooBig: tv('askPhotoTooBig'),
        }}
      />
    </div>
  )
}
