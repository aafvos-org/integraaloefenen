import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'

import { Link } from '@/i18n/navigation'
import { RichMath } from '@/components/math'
import { SITE } from '@/config/site'
import { StudyCard } from '@/app/[locale]/oefenen/study-card'
import {
  loadClustersForTopics,
  loadQuestionNew,
  loadTilesForClusters,
  type NewExerciseTile,
  type TopicInfo,
} from '@/lib/practice/chapter-overview'
import { EXAMEN_HOOFDSTUK } from '@/lib/practice/examentraining'
import { getIngelogdeLeerlingId } from '@/lib/supabase/request-cache'
import { createClient } from '@/lib/supabase/server'

const REGELS = ['regel1', 'regel2', 'regel3', 'regel4'] as const

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Examentraining' })
  return { title: t('title') }
}

export default async function ExamentrainingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams?: Promise<{ q?: string }>
}) {
  const { locale } = await params
  const userId = await getIngelogdeLeerlingId()
  if (!userId) redirect(`/${locale}/inloggen`)

  const t = await getTranslations('Examentraining')
  const supabase = await createClient()
  const qParam = ((await searchParams)?.q ?? '').trim()

  const { data: hoofdstuk } = await supabase
    .from('chapters')
    .select('id')
    .eq('site', SITE)
    .eq('slug', EXAMEN_HOOFDSTUK)
    .maybeSingle()

  const { data: onderwerpen } = hoofdstuk
    ? await supabase
        .from('topics_new')
        .select('id, slug, title, chapter_id, order_index, category, theory_block_id')
        .eq('site', SITE)
        .eq('chapter_id', hoofdstuk.id)
        .order('order_index')
    : { data: [] }

  const topics = (onderwerpen ?? []) as TopicInfo[]
  const clusters = await loadClustersForTopics(
    supabase,
    topics.map((topic) => topic.id),
  )
  const tiles = await loadTilesForClusters(
    supabase,
    clusters.map((cluster) => cluster.id),
  )
  const vraag =
    qParam && tiles.some((tegel) => tegel.questionId === qParam)
      ? await loadQuestionNew(supabase, qParam)
      : null
  const index = vraag ? tiles.findIndex((tegel) => tegel.questionId === vraag.id) : -1
  const volgende = index >= 0 ? tiles[index + 1] : undefined

  return (
    <div className="mx-auto min-w-0 max-w-3xl px-4 py-8 sm:py-12">
      <h1 className="font-serif text-3xl text-text">{t('h1')}</h1>

      {vraag ? (
        <div className="mt-6 min-w-0">
          <Link
            href="/examentraining"
            className="mb-5 inline-flex text-sm text-text-muted hover:text-text"
          >
            {t('terug')}
          </Link>
          <StudyCard
            key={vraag.id}
            question={vraag}
            steps={vraag.steps}
            questionNumber={index + 1}
            nextHref={
              volgende
                ? `/examentraining?q=${encodeURIComponent(volgende.questionId)}`
                : '/examentraining'
            }
          />
        </div>
      ) : (
        <>
          <ol className="mt-8 space-y-5">
            {REGELS.map((sleutel, index) => (
              <li key={sleutel} className="flex gap-3 text-base leading-relaxed text-text">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-sm font-medium tabular-nums">
                  {index + 1}
                </span>
                <span className="min-w-0 break-words">{t(sleutel)}</span>
              </li>
            ))}
          </ol>

          {tiles.length === 0 ? (
            <p className="mt-10 text-base leading-relaxed text-text">{t('geenOpgaven')}</p>
          ) : (
            <div className="mt-10 space-y-10">
              <p className="text-base leading-relaxed text-text">{t('kiesOpgave')}</p>
              {topics.map((topic) => {
                const vanTopic = clusters
                  .filter((cluster) => cluster.topic_id === topic.id)
                  .flatMap((cluster) => tiles.filter((tegel) => tegel.clusterId === cluster.id))
                if (vanTopic.length === 0) return null
                return (
                  <section key={topic.id}>
                    <h2 className="font-serif text-2xl text-text">{topic.title}</h2>
                    <ul className="mt-4 grid grid-cols-1 gap-3">
                      {vanTopic.map((tegel, nummer) => (
                        <li key={tegel.questionId} className="min-w-0">
                          <OpgaveTegel tegel={tegel} nummer={nummer + 1} />
                        </li>
                      ))}
                    </ul>
                  </section>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function OpgaveTegel({ tegel, nummer }: { tegel: NewExerciseTile; nummer: number }) {
  return (
    <Link
      href={`/examentraining?q=${encodeURIComponent(tegel.questionId)}` as '/examentraining'}
      className="block min-w-0 overflow-x-auto rounded-xl border border-border bg-surface px-4 py-3 hover:bg-surface-2"
    >
      <span className="text-xs font-medium text-text-muted">#{nummer}</span>
      <div className="mt-1 min-w-0 font-serif text-base leading-snug text-text">
        <RichMath source={tegel.latex_body ?? ''} />
      </div>
    </Link>
  )
}
