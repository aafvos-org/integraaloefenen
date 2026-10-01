import { getTranslations } from 'next-intl/server'

import { METHODE, THEORY_OVERVIEW } from '@/lib/theory'

import { MethodeSchema } from './methode-schema'
import { TheorieClient, type TheorieChapter } from './theorie-client'
import { TheorieLayout } from './theorie-layout'
import { kaartLabels, layoutLabels, schemaLabels, stripChapterCode, theorieNavItems } from './theorie-shared'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Theorie' })
  return { title: t('title'), description: t('description') }
}

export default async function TheoriePage() {
  const t = await getTranslations('Theorie')

  // Sites zonder methode-data (integralen): de oude kaartenweergave met alle hoofdstukken.
  if (!METHODE) {
    const chapters: TheorieChapter[] = THEORY_OVERVIEW.map((ch) => ({
      slug: ch.slug,
      title: ch.title,
      intro: ch.intro,
      stappenplan: ch.stappenplan,
      practiceLabel: t('practiceLink', { topic: stripChapterCode(ch.title) }),
      cards: ch.cards,
    }))
    return <TheorieClient chapters={chapters} labels={kaartLabels(t)} />
  }

  const M = METHODE
  const alleRegels = M.regels.map((r) => r.id)

  return (
    <TheorieLayout items={theorieNavItems(t)} active={null} labels={layoutLabels(t)}>
      <div className="mx-auto max-w-7xl px-4 py-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] lg:gap-10">
        <header className="lg:sticky lg:top-8 lg:self-start">
          <p className="text-xs font-medium uppercase tracking-wider text-accent">{t('eyebrow')}</p>
          <h1 className="mt-1 font-serif text-3xl text-text">{t('methodeTitle')}</h1>
          <p className="mt-3 text-sm leading-relaxed text-text-muted">{t('methodeIntro')}</p>
        </header>

        <div className="mt-8 lg:mt-0">
          <MethodeSchema regels={M.regels} actieveRegels={alleRegels} voorbeelden={[]} labels={schemaLabels(t)} />
        </div>
      </div>
    </TheorieLayout>
  )
}
