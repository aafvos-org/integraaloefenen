import { getTranslations } from 'next-intl/server'

import { VideoKaart } from '@/components/video-kaart'
import { Link } from '@/i18n/navigation'
import { zetStatischeTaal } from '@/i18n/statisch'
import { eigenPagina } from '@/lib/seo'
import { getUitlegVideos } from '@/lib/videos'

import { ExamenKnoppen } from './examen-knoppen'

const EXAMENVIDEO = getUitlegVideos().find((v) => v.slug === 'examen-2024-1-wachttijden')

/** Officiële pagina van het examen. Geen opgaven overnemen, alleen hierheen linken. */
const EXAMENBLAD =
  'https://www.examenblad.nl/2027/vwo/vakken/exacte-vakken/wiskunde-b-vwo'

const PUNTEN = ['punt1', 'punt2', 'punt3', 'punt4'] as const

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  zetStatischeTaal(locale)
  const t = await getTranslations({ locale, namespace: 'ExamenUitleg' })
  return eigenPagina({
    locale,
    pad: '/examen-integralen',
    titel: t('title'),
    omschrijving: t('description'),
  })
}

export default async function ExamenIntegralenPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  zetStatischeTaal(locale)
  const t = await getTranslations('ExamenUitleg')

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm font-medium uppercase tracking-wider text-accent">
        {t('eyebrow')}
      </p>
      <h1 className="mt-2 font-serif text-4xl text-text sm:text-[2.75rem]">
        {t('h1')}
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-text-muted">{t('intro')}</p>

      <div className="mt-6">
        <Link
          href={'/proberen/oppervlakte' as '/proberen'}
          data-meet="examen-proberen"
          className="inline-flex min-h-11 items-center rounded-lg bg-accent px-5 text-sm font-medium text-white shadow-sm hover:bg-accent/90"
        >
          {t('ctaProberen')}
        </Link>
      </div>

      <p className="mt-4 text-base leading-relaxed text-text-muted">
        {t('examenbladVoor')}{' '}
        <a
          href={EXAMENBLAD}
          className="font-medium text-accent underline underline-offset-2"
        >
          {t('examenbladLink')}
        </a>
        .
      </p>

      <section className="mt-12">
        <h2 className="font-serif text-2xl text-text">{t('watH2')}</h2>
        <ol className="mt-6 space-y-5">
          {PUNTEN.map((sleutel, index) => (
            <li key={sleutel} className="flex gap-3 text-base leading-relaxed text-text">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-sm font-medium tabular-nums">
                {index + 1}
              </span>
              <span className="min-w-0">{t(sleutel)}</span>
            </li>
          ))}
        </ol>
      </section>

      {EXAMENVIDEO && (
        <section className="mt-12">
          <h2 className="font-serif text-2xl text-text">{t('videoH2')}</h2>
          <VideoKaart
            video={EXAMENVIDEO}
            bron={t('videoBron')}
            cta={
              <Link
                href={'/proberen/oppervlakte' as '/proberen'}
                data-meet="examen-video-proberen"
                className="inline-flex min-h-11 items-center rounded-lg bg-accent px-4 text-sm font-medium text-white hover:bg-accent/90"
              >
                {t('ctaProberen')}
              </Link>
            }
          />
        </section>
      )}

      <section className="mt-12">
        <h2 className="font-serif text-2xl text-text">{t('opgavenH2')}</h2>
        <p className="mt-3 text-base leading-relaxed text-text-muted">{t('opgaven')}</p>
        <ExamenKnoppen
          ctaOpgaven={t('ctaOpgaven')}
          ctaRegister={t('ctaRegister')}
          ctaLogin={t('ctaLogin')}
        />
      </section>

      <section className="mt-12 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="font-serif text-2xl text-text">{t('videoAanvraagH2')}</h2>
        <p className="mt-3 text-base leading-relaxed text-text-muted">{t('videoBody')}</p>
        <div className="mt-4">
          <Link
            href="/video-aanvragen"
            data-meet="examen-video-aanvragen"
            className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface-2 px-5 text-sm font-medium text-text hover:bg-surface"
          >
            {t('videoCta')}
          </Link>
        </div>
      </section>
    </div>
  )
}
