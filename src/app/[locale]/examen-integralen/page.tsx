import { getTranslations } from 'next-intl/server'

import { zetStatischeTaal } from '@/i18n/statisch'
import { eigenPagina } from '@/lib/seo'

import { ExamenKnoppen } from './examen-knoppen'

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

      <section className="mt-12">
        <h2 className="font-serif text-2xl text-text">{t('opgavenH2')}</h2>
        <p className="mt-3 text-base leading-relaxed text-text-muted">{t('opgaven')}</p>
        <ExamenKnoppen
          ctaOpgaven={t('ctaOpgaven')}
          ctaRegister={t('ctaRegister')}
          ctaLogin={t('ctaLogin')}
        />
      </section>
    </div>
  )
}
