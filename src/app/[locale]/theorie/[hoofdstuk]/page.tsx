import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { SITE_CONFIG } from '@/config/site'
import { routing } from '@/i18n/routing'
import { leermiddel } from '@/lib/gestructureerde-gegevens'
import { eigenPagina } from '@/lib/seo'
import { VOORBEELDOPGAVEN } from '@/content/theory/voorbeeldopgaven'
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
  const { locale, hoofdstuk } = await params
  const t = await getTranslations('Theorie')

  const kaart = THEORY_OVERVIEW.find((ch) => ch.slug === hoofdstuk)
  if (!kaart) notFound()

  const chapter: TheorieChapter = {
    slug: kaart.slug,
    title: kaart.title,
    intro: kaart.intro,
    stappenplan: kaart.stappenplan,
    practiceLabel: t('practiceLink', { topic: stripChapterCode(kaart.title) }),
    oefenlinks: kaart.oefenlinks,
    cards: kaart.cards,
    voorbeelden: VOORBEELDOPGAVEN[kaart.slug],
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${SITE_CONFIG.domain}`
  const gegevens = leermiddel({
    titel: `${kaart.title} · ${t('eyebrow')}`,
    url: `${siteUrl}/${locale}/theorie/${hoofdstuk}`,
    omschrijving: hoofdstukOmschrijving(kaart.title, kaart.intro),
  })

  return (
    <TheorieLayout items={theorieNavItems()} active={kaart.slug} labels={layoutLabels(t)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gegevens) }}
      />
      <TheorieClient chapters={[chapter]} labels={kaartLabels(t)} sidebar={false} eigenKop />
    </TheorieLayout>
  )
}
