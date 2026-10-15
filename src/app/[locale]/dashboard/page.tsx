import { getTranslations, getLocale } from 'next-intl/server'
import { redirect } from 'next/navigation'

import { SITE } from '@/config/site'
import { Link } from '@/i18n/navigation'
import { bouwDashboardIndeling, kiesBijnaBeheerst } from '@/lib/dashboard/indeling'
import {
  getChapters,
  getCurrentProfile,
  getIngelogdeLeerlingId,
} from '@/lib/supabase/request-cache'
import { createClient } from '@/lib/supabase/server'

import { DashboardGrid } from './dashboard-grid'

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
  const [supabase, locale, userId] = await Promise.all([
    createClient(),
    getLocale(),
    getIngelogdeLeerlingId(),
  ])
  if (!userId) redirect(`/${locale}/inloggen`)

  // Activity: last 14 days via user_sessions_new + session_answers_new
  const since14 = new Date()
  since14.setDate(since14.getDate() - 13)
  since14.setHours(0, 0, 0, 0)

  // Deze ophaalacties hangen niet van elkaar af. Parallel is dat de duur
  // van de traagste.
  const [
    t,
    tv,
    profile,
    chapters,
    topicsRes,
    paragraphsRes,
    blocksRes,
    clustersRes,
    progressRes,
    sessionsRes,
  ] = await Promise.all([
      getTranslations('Dashboard'),
      getTranslations('UitlegVideos'),
      getCurrentProfile(),
      getChapters(),
      supabase
        .from('topics_new')
        .select('id, title, slug, chapter_id, order_index, theory_block_id')
        .eq('site', SITE)
        .order('order_index'),
      supabase
        .from('paragraphs')
        .select('id, chapter_id, slug, label, title, order_index')
        .eq('site', SITE)
        .order('order_index'),
      supabase
        .from('theory_blocks')
        .select('id, paragraph_id, slug, letter, title, order_index')
        .eq('site', SITE)
        .order('order_index'),
      supabase
        .from('topic_clusters_new')
        .select('id, title, slug, topic_id, order_index')
        .eq('site', SITE)
        .order('order_index'),
      supabase
        .from('user_progress_new')
        .select('cluster_id, status, total_answered, total_correct, is_skipped, correct_streak')
        .eq('user_id', userId),
      supabase
        .from('user_sessions_new')
        .select('id')
        .eq('user_id', userId)
        .gte('started_at', since14.toISOString()),
    ])

  const topics = topicsRes.data
  const clusters = clustersRes.data
  const progressRows = progressRes.data

  const firstName =
    profile?.display_name?.trim().split(/\s+/)[0]?.trim() || null

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

  const bijna = kiesBijnaBeheerst({
    chapters: chapters ?? [],
    topics: topics ?? [],
    clusters: clusters ?? [],
    voortgang: progressRows ?? [],
  })

  const indeling = bouwDashboardIndeling({
    chapters: chapters ?? [],
    paragraphs: paragraphsRes.data ?? [],
    blocks: blocksRes.data ?? [],
    topics: topics ?? [],
    clusters: clusters ?? [],
    voortgang: progressRows ?? [],
  })

  return (
    <div className="mx-auto max-w-[1400px] px-3 py-6">
      <div className="mb-2">
        <h1 className="font-serif text-2xl text-text">
          {firstName
            ? t('greetingWithName', { name: firstName })
            : t('progressTitle')}
        </h1>
      </div>

      {bijna && (
        <p className="mb-4">
          <Link
            href={bijna.href}
            className="inline-flex min-h-11 items-center text-sm text-accent underline-offset-2 hover:underline"
          >
            {bijna.reeks === 2
              ? t('almostOne', { onderdeel: bijna.naam })
              : t('almostTwo', { onderdeel: bijna.naam })}
          </Link>
        </p>
      )}

      <DashboardGrid
        indeling={indeling}
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
