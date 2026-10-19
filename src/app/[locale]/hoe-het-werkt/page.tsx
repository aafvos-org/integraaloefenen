import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

import { Card } from '@/components/ui'
import { zetStatischeTaal } from '@/i18n/statisch'
import { eigenPagina } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  zetStatischeTaal(locale)
  const t = await getTranslations({ locale, namespace: 'HoeHetWerkt' })
  return eigenPagina({
    locale,
    pad: '/hoe-het-werkt',
    titel: t('title'),
    omschrijving: t('description'),
  })
}

export default async function HoeHetWerktPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  zetStatischeTaal(locale)
  const t = await getTranslations('HoeHetWerkt')

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm font-medium uppercase tracking-wider text-accent">
        {t('eyebrow')}
      </p>
      <h1 className="mt-2 font-serif text-4xl text-text sm:text-[2.75rem]">
        {t('h1')}
      </h1>
      <p className="mt-6 text-lg text-text-muted">{t('intro')}</p>

      <section className="mt-14">
        <h2 className="font-serif text-2xl text-text">{t('doenH2')}</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {(['1', '2', '3', '4'] as const).map((n) => (
            <Card key={n} className="!p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-accent">
                {t(`card${n}Eyebrow` as 'card1Eyebrow')}
              </p>
              <h3 className="mt-2 font-serif text-2xl text-text">
                {t(`card${n}Title` as 'card1Title')}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-text-muted">
                {t(`card${n}Body` as 'card1Body')}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-serif text-2xl text-text">{t('opgaveH2')}</h2>
        <p className="mt-3 text-text-muted">{t('opgaveIntro')}</p>
        <ol className="mt-6 space-y-4 border-l-2 border-border pl-5 text-sm text-text-muted">
          {(['1', '2', '3', '4'] as const).map((n) => (
            <li key={n}>
              <strong className="font-medium text-text">
                {t(`step${n}Title` as 'step1Title')}
              </strong>{' '}
              {t(`step${n}Body` as 'step1Body')}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14">
        <h2 className="font-serif text-2xl text-text">{t('delenH2')}</h2>
        <p className="mt-3 text-text-muted">{t('delenIntro')}</p>
        <ol className="mt-6 space-y-4 border-l-2 border-border pl-5 text-sm text-text-muted">
          {(['1', '2', '3'] as const).map((n) => (
            <li key={n}>
              <strong className="font-medium text-text">
                {t(`deel${n}Title` as 'deel1Title')}
              </strong>{' '}
              {t(`deel${n}Body` as 'deel1Body')}
            </li>
          ))}
        </ol>
        <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
          <h3 className="font-serif text-lg text-text">
            {t('delenVoorbeeldH3')}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            {t('delenVoorbeeld')}
          </p>
        </div>
      </section>

      <section className="mt-14 rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <h2 className="font-serif text-xl text-text">{t('wetenH2')}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-text-muted">
          {(['1', '2', '3'] as const).map((n) => (
            <li key={n}>{t(`weten${n}` as 'weten1')}</li>
          ))}
        </ul>
      </section>

      <div className="mt-12 flex flex-wrap gap-4">
        <Link
          href={'/proberen/primitieve' as '/proberen'}
          data-meet="hoehetwerkt-proefsom"
          className="rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-accent/90"
        >
          {t('ctaTry')}
        </Link>
        <Link
          href="/registreren"
          className="rounded-lg border border-border px-5 py-3 text-sm text-text hover:bg-surface-2"
        >
          {t('ctaRegister')}
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-border px-5 py-3 text-sm text-text hover:bg-surface-2"
        >
          {t('ctaBack')}
        </Link>
      </div>
    </div>
  )
}
