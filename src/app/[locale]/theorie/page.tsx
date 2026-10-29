import { getTranslations } from 'next-intl/server'

import { zetStatischeTaal } from '@/i18n/statisch'

import { SITE_CONFIG } from '@/config/site'
import { leermiddel } from '@/lib/gestructureerde-gegevens'
import { eigenPagina } from '@/lib/seo'
import { VOORBEELDOPGAVEN } from '@/content/theory/voorbeeldopgaven'
import { VOORBEELDEN } from '@/content/voorbeelden'
import { THEORY_OVERVIEW } from '@/lib/theory'

import { TheorieClient, type TheorieChapter } from './theorie-client'
import { kaartLabels, stripChapterCode } from './theorie-shared'
import { GoogleStrip } from '../google-strip'
import { YoutubeStrip } from '../youtube-strip'

// Deze drie voorbeeldpagina's krijgen vertoningen in Google (zoekwoorden als
// "integraal wortel x"), terwijl /theorie zelf nauwelijks wordt aangeklikt.
// Daarom staan ze als kortste route bovenaan het overzicht.
const VAAK_GEZOCHT_SLUGS = ['wortel-x', 'ln-x', '1-over-x']

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  zetStatischeTaal(locale)
  const t = await getTranslations({ locale, namespace: 'Theorie' })
  return eigenPagina({
    locale,
    pad: '/theorie',
    titel: t('title'),
    omschrijving: t('description'),
    eigenDeelafbeelding: true,
  })
}

export default async function TheoriePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  zetStatischeTaal(locale)
  const t = await getTranslations('Theorie')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${SITE_CONFIG.domain}`
  const gegevens = leermiddel({
    titel: t('title'),
    url: `${siteUrl}/${locale}/theorie`,
    omschrijving: t('description'),
  })

  const chapters: TheorieChapter[] = THEORY_OVERVIEW.map((ch) => ({
    slug: ch.slug,
    title: ch.title,
    intro: ch.intro,
    uitgelichtVoorbeeld: ch.uitgelichtVoorbeeld,
    video: ch.video,
    stappenplan: ch.stappenplan,
    practiceLabel: t('practiceLink', { topic: stripChapterCode(ch.title) }),
    oefenlinks: ch.oefenlinks,
    cards: ch.cards,
    voorbeelden: VOORBEELDOPGAVEN[ch.slug],
  }))
  const vaakGezocht = VAAK_GEZOCHT_SLUGS.map((slug) => VOORBEELDEN.find((v) => v.slug === slug)).filter(
    (v): v is (typeof VOORBEELDEN)[number] => v !== undefined,
  )
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gegevens) }}
      />
      <div className="mx-auto max-w-5xl px-4 pt-6">
        <YoutubeStrip />
        <GoogleStrip />
      </div>
      <TheorieClient chapters={chapters} labels={kaartLabels(t)} vaakGezocht={vaakGezocht} />
    </>
  )
}
