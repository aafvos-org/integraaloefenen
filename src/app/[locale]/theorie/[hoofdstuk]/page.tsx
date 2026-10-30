import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { zetStatischeTaal } from '@/i18n/statisch'

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
import { GoogleStrip } from '../../google-strip'
import { YoutubeStrip } from '../../youtube-strip'

type Params = Promise<{ locale: string; hoofdstuk: string }>

// Alleen bestaande hoofdstukken. Een verzonnen slug krijgt hier ook notFound(),
// maar op de live site begint theorie/loading.tsx al met streamen en blijft de
// status dan 200. De middleware stuurt zo'n adres daarom eerst weg
// (herschrijfVerzonnenTheorie), nog vóór deze pagina.
export const dynamicParams = false

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    THEORY_OVERVIEW.map((ch) => ({ locale, hoofdstuk: ch.slug })),
  )
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, hoofdstuk } = await params
  zetStatischeTaal(locale)
  const t = await getTranslations({ locale, namespace: 'Theorie' })
  const kaart = THEORY_OVERVIEW.find((ch) => ch.slug === hoofdstuk)
  if (!kaart) notFound()
  const zoektitel = kaart.zoektitel ?? kaart.title
  return eigenPagina({
    locale,
    pad: `/theorie/${hoofdstuk}`,
    titel: `${zoektitel} · ${t('eyebrow')}`,
    omschrijving: kaart.zoekomschrijving ?? hoofdstukOmschrijving(kaart.title, kaart.intro),
    eigenDeelafbeelding: true,
  })
}

export default async function HoofdstukPage({ params }: { params: Params }) {
  const { locale, hoofdstuk } = await params
  zetStatischeTaal(locale)
  const t = await getTranslations('Theorie')

  const kaart = THEORY_OVERVIEW.find((ch) => ch.slug === hoofdstuk)
  if (!kaart) notFound()

  const chapter: TheorieChapter = {
    slug: kaart.slug,
    title: kaart.title,
    intro: kaart.intro,
    uitgelichtVoorbeeld: kaart.uitgelichtVoorbeeld,
    video: kaart.video,
    stappenplan: kaart.stappenplan,
    practiceLabel: t('practiceLink', { topic: stripChapterCode(kaart.title) }),
    oefenlinks: kaart.oefenlinks,
    cards: kaart.cards,
    voorbeelden: VOORBEELDOPGAVEN[kaart.slug],
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${SITE_CONFIG.domain}`
  const zoektitel = kaart.zoektitel ?? kaart.title
  const gegevens = leermiddel({
    titel: `${zoektitel} · ${t('eyebrow')}`,
    url: `${siteUrl}/${locale}/theorie/${hoofdstuk}`,
    omschrijving: kaart.zoekomschrijving ?? hoofdstukOmschrijving(kaart.title, kaart.intro),
  })

  return (
    <TheorieLayout items={theorieNavItems()} active={kaart.slug} labels={layoutLabels(t)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gegevens) }}
      />
      <div className="mx-auto max-w-5xl px-4 pt-6">
        <YoutubeStrip />
        <GoogleStrip />
      </div>
      <TheorieClient chapters={[chapter]} labels={kaartLabels(t)} sidebar={false} eigenKop />
    </TheorieLayout>
  )
}
