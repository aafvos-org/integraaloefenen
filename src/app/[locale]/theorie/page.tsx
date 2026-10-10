import { getTranslations } from 'next-intl/server'

import { eigenPagina } from '@/lib/seo'
import { THEORY_OVERVIEW } from '@/lib/theory'

import { TheorieClient, type TheorieChapter } from './theorie-client'
import { kaartLabels, stripChapterCode } from './theorie-shared'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Theorie' })
  return eigenPagina({
    locale,
    pad: '/theorie',
    titel: t('title'),
    omschrijving: t('description'),
  })
}

export default async function TheoriePage() {
  const t = await getTranslations('Theorie')

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
