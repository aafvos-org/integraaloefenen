import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { leesbareWiskunde } from '@/app/[locale]/theorie/leesbare-tekst'
import { VOORBEELDEN } from '@/content/voorbeelden'
import { eigenPagina } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Voorbeeld' })
  return eigenPagina({
    locale,
    pad: '/voorbeeld',
    titel: t('overzichtTitel'),
    omschrijving: t('overzichtOmschrijving'),
  })
}

export default async function VoorbeeldenOverzicht() {
  const t = await getTranslations('Voorbeeld')

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm font-medium uppercase tracking-wider text-accent">{t('eyebrow')}</p>
      <h1 className="mt-2 font-serif text-4xl text-text sm:text-[2.75rem]">{t('overzichtKop')}</h1>
      <p className="mt-6 text-lg text-text-muted">{t('overzichtIntro')}</p>
      <ul className="mt-10 divide-y divide-border rounded-xl border border-border bg-surface">
        {VOORBEELDEN.map((voorbeeld) => (
          <li key={voorbeeld.slug}>
            <Link
              href={`/voorbeeld/${voorbeeld.slug}` as '/voorbeeld'}
              className="flex flex-col gap-1 px-5 py-4 hover:bg-surface-2 sm:flex-row sm:items-baseline sm:justify-between"
            >
              <span className="font-medium text-text">{voorbeeld.kop}</span>
              <span className="text-sm text-text-muted">
                {leesbareWiskunde(voorbeeld.antwoordLatex)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
