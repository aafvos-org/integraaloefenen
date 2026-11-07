import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { zetStatischeTaal } from '@/i18n/statisch'
import { eigenPagina } from '@/lib/seo'

import { VideoAanvraagFormulier } from './formulier'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  zetStatischeTaal(locale)
  const t = await getTranslations({ locale, namespace: 'VideoAanvragen' })
  return eigenPagina({
    locale,
    pad: '/video-aanvragen',
    titel: t('title'),
    omschrijving: t('description'),
  })
}

export default async function VideoAanvragenPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  zetStatischeTaal(locale)
  const t = await getTranslations('VideoAanvragen')

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:py-14">
      <p className="text-sm font-medium uppercase tracking-wider text-accent">
        {t('eyebrow')}
      </p>
      <h1 className="mt-2 font-serif text-3xl text-text sm:text-4xl">{t('h1')}</h1>
      <p className="mt-3 text-text-muted">{t('intro')}</p>

      <div className="mt-8 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <VideoAanvraagFormulier
          labels={{
            jaarLabel: t('jaarLabel'),
            tijdvakLabel: t('tijdvakLabel'),
            vraagnummerLabel: t('vraagnummerLabel'),
            vraagnummerPlaceholder: t('vraagnummerPlaceholder'),
            toelichtingLabel: t('toelichtingLabel'),
            toelichtingHint: t('toelichtingHint'),
            toelichtingPlaceholder: t('toelichtingPlaceholder'),
            magMailenLabel: t('magMailenLabel'),
            emailLabel: t('emailLabel'),
            emailPlaceholder: t('emailPlaceholder'),
            submit: t('submit'),
            submitPending: t('submitPending'),
            thanks: t('thanks'),
          }}
        />
      </div>

      <p className="mt-6 text-sm text-text-muted">
        {t('videosLinkBefore')}{' '}
        <Link
          href="/uitleg-videos"
          data-meet="video-aanvraag-naar-videos"
          className="text-accent underline underline-offset-2"
        >
          {t('videosLinkText')}
        </Link>
        . {t('privacyLinkBefore')}{' '}
        <Link
          href="/privacy"
          data-meet="video-aanvraag-naar-privacy"
          className="text-accent underline underline-offset-2"
        >
          {t('privacyLinkText')}
        </Link>
        .
      </p>
    </div>
  )
}
