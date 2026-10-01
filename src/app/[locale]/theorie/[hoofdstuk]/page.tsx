import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { RichMath } from '@/components/math'
import { METHODE, THEORY_OVERVIEW } from '@/lib/theory'

import { MethodeSchema } from '../methode-schema'
import { TheorieClient, type TheorieChapter } from '../theorie-client'
import { TheorieLayout } from '../theorie-layout'
import { kaartLabels, layoutLabels, schemaLabels, stripChapterCode, theorieNavItems, parseVb, parseHoePad } from '../theorie-shared'

type Params = Promise<{ locale: string; hoofdstuk: string }>

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, hoofdstuk } = await params
  const t = await getTranslations({ locale, namespace: 'Theorie' })
  const methode = METHODE?.hoofdstukken.find((h) => h.slug === hoofdstuk)
  const kaart = THEORY_OVERVIEW.find((ch) => ch.slug === hoofdstuk)
  const naam = methode ? `${methode.code} · ${methode.title}` : kaart ? kaart.title : null
  return {
    title: naam ? `${naam} · ${t('methodeTab')}` : t('title'),
    description: t('description'),
  }
}

export default async function HoofdstukPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams?: Promise<{ vb?: string; hoe?: string }>
}) {
  const { hoofdstuk } = await params
  const sp = await searchParams
  const vb = parseVb(sp?.vb)
  const hoe = parseHoePad(sp?.hoe)
  const t = await getTranslations('Theorie')
  const nav = theorieNavItems(t)

  const methode = METHODE?.hoofdstukken.find((h) => h.slug === hoofdstuk)

  if (METHODE && methode) {
    const M = METHODE
    const voorbeelden = M.voorbeelden.filter((v) => v.chapter === methode.code)
    return (
      <TheorieLayout items={nav} active={methode.slug} labels={layoutLabels(t)}>
        <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div className="max-w-3xl">
            <p className="font-mono text-xs font-semibold text-accent">{methode.code}</p>
            <h1 className="mt-1 font-serif text-3xl text-text">{methode.title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              <RichMath source={methode.intro} />
            </p>
          </div>
          <Link
            href={`/oefenen?chapter=${encodeURIComponent(methode.slug)}` as '/oefenen'}
            className="text-sm font-medium text-accent underline-offset-2 hover:underline"
          >
            {t('oefenChapter', { chapter: methode.code })}
          </Link>
        </header>

        <div className="mt-8">
          <MethodeSchema
            regels={M.regels}
            actieveRegels={methode.regels}
            voorbeelden={voorbeelden}
            notities={methode.notities}
            topics={methode.topics}
            chapterSlug={methode.slug}
            initieelVoorbeeld={vb}
            initieelHoe={hoe}
            labels={schemaLabels(t)}
          />
        </div>

        <section className="mt-12">
          <h2 className="font-serif text-2xl text-text">{t('topicsTitle')}</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {methode.topics.map((tp) => {
              const regel = tp.regel ? M.regels.find((r) => r.id === tp.regel) : null
              return (
                <li key={tp.slug}>
                  <Link
                    href={`/oefenen?chapter=${encodeURIComponent(methode.slug)}&topic=${encodeURIComponent(tp.slug)}` as '/oefenen'}
                    className="flex h-full flex-col gap-1 rounded-xl border border-border bg-surface p-4 transition hover:border-accent"
                  >
                    <p className="font-medium text-text">{tp.title}</p>
                    <p className="text-xs text-text-muted">{regel ? regel.title : t('herkenQuestion')}</p>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
        </div>
      </TheorieLayout>
    )
  }

  // Hoofdstukken zonder methode-data (H7, H9): de bestaande kaartenweergave.
  const kaart = THEORY_OVERVIEW.find((ch) => ch.slug === hoofdstuk)
  if (!kaart) notFound()

  const chapter: TheorieChapter = {
    slug: kaart.slug,
    title: kaart.title,
    intro: kaart.intro,
    stappenplan: kaart.stappenplan,
    practiceLabel: t('practiceLink', { topic: stripChapterCode(kaart.title) }),
    cards: kaart.cards,
  }
  return (
    <TheorieLayout items={nav} active={kaart.slug} labels={layoutLabels(t)}>
      <TheorieClient chapters={[chapter]} labels={kaartLabels(t)} sidebar={false} />
    </TheorieLayout>
  )
}
