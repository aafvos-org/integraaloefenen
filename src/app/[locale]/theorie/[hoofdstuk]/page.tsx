import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { routing } from '@/i18n/routing'
import { eigenPagina } from '@/lib/seo'
import { THEORY_OVERVIEW } from '@/lib/theory'

import { hoofdstukOmschrijving } from '../hoofdstuk-omschrijving'
import { TheorieClient, type TheorieChapter } from '../theorie-client'
import { TheorieLayout } from '../theorie-layout'
import { kaartLabels, layoutLabels, stripChapterCode, theorieNavItems } from '../theorie-shared'

type Params = Promise<{ locale: string; hoofdstuk: string }>

// Alleen bestaande hoofdstukken. Een verzonnen slug (dynamicParams = false)
// krijgt 404, nog vóór metadata, zodat er geen canonical naar die slug komt.
export const dynamicParams = false

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    THEORY_OVERVIEW.map((ch) => ({ locale, hoofdstuk: ch.slug })),
  )
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, hoofdstuk } = await params
  const t = await getTranslations({ locale, namespace: 'Theorie' })
  const kaart = THEORY_OVERVIEW.find((ch) => ch.slug === hoofdstuk)
  if (!kaart) notFound()
  return eigenPagina({
    locale,
    pad: `/theorie/${hoofdstuk}`,
    titel: `${kaart.title} · ${t('eyebrow')}`,
    omschrijving: hoofdstukOmschrijving(kaart.title, kaart.intro),
  })
}

export default async function HoofdstukPage({ params }: { params: Params }) {
  const { hoofdstuk } = await params
  const t = await getTranslations('Theorie')

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
    <TheorieLayout items={theorieNavItems()} active={kaart.slug} labels={layoutLabels(t)}>
      <TheorieClient chapters={[chapter]} labels={kaartLabels(t)} sidebar={false} eigenKop />
    </TheorieLayout>
  )
}
