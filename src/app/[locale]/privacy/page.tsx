import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { zetStatischeTaal } from '@/i18n/statisch'
import { eigenPagina } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  zetStatischeTaal(locale)
  const t = await getTranslations({ locale, namespace: 'Privacy' })
  return eigenPagina({
    locale,
    pad: '/privacy',
    titel: t('title'),
    omschrijving: t('description'),
  })
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  zetStatischeTaal(locale)
  const t = await getTranslations('Privacy')

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm font-medium uppercase tracking-wider text-accent">
        {t('eyebrow')}
      </p>
      <h1 className="mt-2 font-serif text-4xl text-text sm:text-[2.75rem]">
        {t('h1')}
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-text-muted">{t('intro')}</p>

      <Blok titel={t('accountH2')}>
        <p>{t('accountLead')}</p>
        <Lijst items={[t('account1'), t('account2'), t('account3')]} />
        <p>{t('accountNot')}</p>
      </Blok>

      <Blok titel={t('practiceH2')}>
        <p>{t('practiceLead')}</p>
        <Lijst items={[t('practice1'), t('practice2'), t('practice3')]} />
        <p>{t('practiceWhy')}</p>
        <p>{t('flag')}</p>
      </Blok>

      <Blok titel={t('aiH2')}>
        <p>{t('aiBody')}</p>
        <p>{t('aiCache')}</p>
      </Blok>

      <Blok titel={t('mailH2')}>
        <p>{t('mailBody')}</p>
        <p>{t('mailResend')}</p>
      </Blok>

      <Blok titel={t('visitH2')}>
        <p>{t('analytics')}</p>
        <p>{t('klikmeting')}</p>
        <p>{t('schuilnaam')}</p>
        <p>{t('cookie')}</p>
        <p>{t('host')}</p>
      </Blok>

      <Blok titel={t('keepH2')}>
        <p>{t('keepBody')}</p>
      </Blok>

      <Blok titel={t('deleteH2')}>
        <p>
          {t.rich('deleteBody', {
            feedback: (stuk) => (
              <Link
                href="/feedback"
                className="font-medium text-accent underline-offset-2 hover:underline"
              >
                {stuk}
              </Link>
            ),
          })}
        </p>
        <p>{t('deleteParent')}</p>
        <p>{t('deleteAfter')}</p>
      </Blok>

      <Blok titel={t('whoH2')}>
        <p>{t('whoLead')}</p>
        <Lijst
          items={[
            t('who1'),
            t('who2'),
            t('who3'),
            t('who4'),
            t('who5'),
            t('who6'),
          ]}
        />
      </Blok>

      <p className="mt-12 text-sm text-text-muted">{t('updated')}</p>
    </div>
  )
}

function Blok({
  titel,
  children,
}: {
  titel: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-10">
      <h2 className="font-serif text-2xl text-text">{titel}</h2>
      <div className="mt-3 space-y-3 text-base leading-relaxed text-text-muted">
        {children}
      </div>
    </section>
  )
}

function Lijst({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}
