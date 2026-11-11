import { getTranslations } from 'next-intl/server'

import { SITE_CONFIG } from '@/config/site'
import { Link } from '@/i18n/navigation'
import { zetStatischeTaal } from '@/i18n/statisch'
import { overPaginaGegevens } from '@/lib/gestructureerde-gegevens'
import { eigenPagina } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  zetStatischeTaal(locale)
  const t = await getTranslations({ locale, namespace: 'Over' })
  return eigenPagina({
    locale,
    pad: '/over',
    titel: t('title'),
    omschrijving: t('description'),
  })
}

const EXTERNE_LINK =
  'inline-flex min-h-11 items-center font-medium text-accent underline underline-offset-2 hover:text-accent/80'

export default async function OverPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  zetStatischeTaal(locale)
  const t = await getTranslations('Over')

  const domain = SITE_CONFIG.domain
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${domain}`
  const structuredData = overPaginaGegevens(SITE_URL)

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <p className="text-sm font-medium uppercase tracking-wider text-accent">
        {t('eyebrow')}
      </p>
      <h1 className="mt-2 font-serif text-4xl text-text sm:text-[2.75rem]">
        {t('h1')}
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-text-muted">{t('intro')}</p>

      <section className="mt-14">
        <h2 className="font-serif text-2xl text-text">{t('sitesH2')}</h2>
        <p className="mt-3 text-text-muted">{t('sitesIntro')}</p>
        <ul className="mt-6 space-y-4 text-sm text-text-muted">
          <li>
            <strong className="font-medium text-text">
              {t('siteIntegraalTitle')}
            </strong>{' '}
            — {t('siteIntegraalBody')}
          </li>
          <li>
            <a
              href="https://www.afgeleideoefenen.nl/?van=integraaloefenen"
              className={EXTERNE_LINK}
            >
              {t('siteAfgeleideTitle')}
            </a>{' '}
            — {t('siteAfgeleideBody')}
          </li>
          <li>
            <a
              href="https://www.wiskundemetaaf.nl/?van=integraaloefenen"
              className={EXTERNE_LINK}
            >
              {t('siteMetaafTitle')}
            </a>{' '}
            — {t('siteMetaafBody')}
          </li>
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="font-serif text-2xl text-text">{t('youtubeH2')}</h2>
        <p className="mt-3 text-text-muted">{t('youtubeBody')}</p>
        <a
          href="https://www.youtube.com/@WiskundeMetAaf?van=integraaloefenen"
          className={`mt-4 ${EXTERNE_LINK}`}
        >
          {t('youtubeLink')} →
        </a>
      </section>

      <div className="mt-12 flex flex-wrap gap-4">
        <Link
          href={'/proberen/primitieve' as '/proberen'}
          data-meet="over-proefsom"
          className="inline-flex min-h-11 items-center rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-accent/90"
        >
          {t('ctaTry')}
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-lg border border-border px-5 py-3 text-sm text-text hover:bg-surface-2"
        >
          {t('ctaBack')}
        </Link>
      </div>
    </div>
  )
}
