import type { ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

import { SITE_CONFIG } from '@/config/site'
import { VOORBEELDEN } from '@/content/voorbeelden'
import { zetStatischeTaal } from '@/i18n/statisch'
import { startpaginaGegevens } from '@/lib/gestructureerde-gegevens'
import { eigenPagina } from '@/lib/seo'

import { AfgeleideVerwijzing } from '@/components/afgeleide-verwijzing'

import { HomeDemo } from './home-demo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  zetStatischeTaal(locale)
  const t = await getTranslations({ locale, namespace: 'Metadata' })
  // De titel in het tabblad komt uit de layout; het kaartje heeft een kortere
  // eigen titel, omdat de sitenaam er toch al los onder staat.
  return eigenPagina({
    locale,
    kaartTitel: t('ogTitle'),
    omschrijving: t('description'),
  })
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  zetStatischeTaal(locale)
  // Een ingelogde leerling gaat via de middleware naar het dashboard.
  // De herkomst (?van=) onthoudt het tabblad zelf; die hoeft niet in deze HTML.
  const aanmelden = '/registreren'

  const t = await getTranslations('Home')

  const domain = SITE_CONFIG.domain
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${domain}`

  const FAQ_ITEMS = [
    { question: t('faq1Q'), answer: t('faq1A') },
    { question: t('faq2Q'), answer: t('faq2A') },
    { question: t('faq3Q'), answer: t('faq3A') },
    { question: t('faq4Q'), answer: t('faq4A') },
    { question: t('faq5Q'), answer: t('faq5A') },
    { question: t('faq6Q'), answer: t('faq6A') },
  ]

  const structuredData = startpaginaGegevens(SITE_URL, FAQ_ITEMS)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="mx-auto max-w-3xl px-4 py-16">
        <section className="text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-accent">
            {t('eyebrow')}
          </p>
          <h1 className="font-serif text-4xl leading-tight text-text sm:text-5xl">
            {t('h1Start')}{' '}
            <span className="whitespace-nowrap text-accent">{t('h1Accent')}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-text-muted">
            {t('lead')}
          </p>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-text-muted">
            {t.rich('subLead', {
              primitieve: (stuk) => (
                <TheorieLink href={'/theorie/primitieve' as '/theorie'}>{stuk}</TheorieLink>
              ),
              substitutie: (stuk) => (
                <TheorieLink href={'/theorie/substitutiemethode' as '/theorie'}>
                  {stuk}
                </TheorieLink>
              ),
              partieel: (stuk) => (
                <TheorieLink href={'/theorie/partieel-integreren' as '/theorie'}>
                  {stuk}
                </TheorieLink>
              ),
              howItWorks: () => (
                <Link
                  href="/hoe-het-werkt"
                  className="font-medium text-accent underline-offset-2 hover:underline"
                >
                  {t('subLeadLink')}
                </Link>
              ),
            })}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={aanmelden}
              className="rounded-lg bg-accent px-5 py-3 text-white shadow-sm hover:bg-accent/90"
            >
              {t('ctaRegister')}
            </Link>
            <Link
              href="/inloggen"
              className="rounded-lg border border-border bg-surface px-5 py-3 text-text hover:bg-surface-2"
            >
              {t('ctaLogin')}
            </Link>
          </div>
          <p className="mt-3 text-sm text-text-muted">{t('tagline')}</p>
          <p className="mt-2">
            <AfgeleideVerwijzing className="inline-flex min-h-11 items-center text-sm font-medium text-accent underline-offset-2 hover:underline" />
          </p>
        </section>

        <HomeDemo aanmelden={aanmelden} />

        <section className="mt-20 grid gap-6 sm:grid-cols-3">
          <Feature title={t('feature1Title')} body={t('feature1Body')} />
          <Feature title={t('feature2Title')} body={t('feature2Body')} />
          <Feature title={t('feature3Title')} body={t('feature3Body')} />
        </section>

        <section className="mt-20">
          <h2 className="font-serif text-3xl text-text">{t('topicsH2')}</h2>
          <p className="mt-3 text-text-muted">{t('topicsIntro')}</p>
          <p className="mt-4">
            <Link
              href={'/theorie/k3' as '/theorie'}
              className="inline-flex min-h-11 items-center font-medium text-accent underline underline-offset-2"
            >
              {t('theoryK3Link')}
            </Link>
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            <Onderwerp
              titel={t('topic1Title')}
              body={t('topic1Body')}
              href={'/theorie/primitieve' as '/theorie'}
            />
            <Onderwerp
              titel={t('topic2Title')}
              body={t('topic2Body')}
              href={'/theorie/primitieve' as '/theorie'}
            />
            <Onderwerp
              titel={t('topic3Title')}
              body={t('topic3Body')}
              href={'/theorie/primitieve' as '/theorie'}
            />
            <Onderwerp
              titel={t('topic4Title')}
              body={t('topic4Body')}
              href={'/theorie/substitutiemethode' as '/theorie'}
            />
            <Onderwerp
              titel={t('topic5Title')}
              body={t('topic5Body')}
              href={'/theorie/partieel-integreren' as '/theorie'}
            />
            <Onderwerp
              titel={t.rich('topic6Title', {
                oppervlakte: (stuk) => (
                  <TheorieLink href={'/theorie/oppervlakte' as '/theorie'}>{stuk}</TheorieLink>
                ),
                inhoud: (stuk) => (
                  <TheorieLink href={'/theorie/inhoud' as '/theorie'}>{stuk}</TheorieLink>
                ),
              })}
              body={t('topic6Body')}
            />
          </ul>
        </section>

        <section className="mt-20">
          <h2 className="font-serif text-3xl text-text">{t('voorbeeldenH2')}</h2>
          <p className="mt-3 text-text-muted">{t('voorbeeldenIntro')}</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {VOORBEELDEN.slice(0, 6).map((voorbeeld) => (
              <li key={voorbeeld.slug}>
                <Link
                  href={`/voorbeeld/${voorbeeld.slug}` as '/voorbeeld'}
                  className="block rounded-xl border border-border bg-surface p-4 font-medium text-text hover:bg-surface-2"
                >
                  {voorbeeld.kop}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4">
            <Link
              href="/voorbeeld"
              className="inline-flex min-h-11 items-center font-medium text-accent underline underline-offset-2"
            >
              {t('voorbeeldenLink')}
            </Link>
          </p>
        </section>

        <section className="mt-20">
          <h2 className="font-serif text-3xl text-text">{t('howH2')}</h2>
          <ol className="mt-6 space-y-4 text-text-muted">
            {[1, 2, 3, 4].map((n) => (
              <li key={n}>
                <span className="font-medium text-text">
                  {t(`how${n}Title` as 'how1Title')}
                </span>{' '}
                {t(`how${n}Body` as 'how1Body')}
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-20">
          <h2 className="font-serif text-3xl text-text">{t('faqH2')}</h2>
          <div className="mt-6 space-y-3">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.question}
                className="group rounded-xl border border-border bg-surface p-4 open:bg-surface-2"
              >
                <summary className="cursor-pointer font-medium text-text">
                  {item.question}
                </summary>
                <p className="mt-2 text-sm text-text-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-2xl border border-border bg-surface px-6 py-10 text-center">
          <h2 className="font-serif text-3xl text-text">{t('ctaH2')}</h2>
          <p className="mx-auto mt-3 max-w-xl text-text-muted">{t('ctaBody')}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={aanmelden}
              className="rounded-lg bg-accent px-5 py-3 text-white shadow-sm hover:bg-accent/90"
            >
              {t('ctaRegister')}
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}

function TheorieLink({
  href,
  children,
}: {
  href: '/theorie'
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      className="font-medium text-accent underline underline-offset-2"
    >
      {children}
    </Link>
  )
}

function Onderwerp({
  titel,
  body,
  href,
}: {
  titel: ReactNode
  body: string
  href?: '/theorie'
}) {
  return (
    <li className="rounded-xl border border-border bg-surface p-4">
      <p className="font-medium text-text">
        {href ? <TheorieLink href={href}>{titel}</TheorieLink> : titel}
      </p>
      <p className="mt-1 text-sm text-text-muted">{body}</p>
    </li>
  )
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h2 className="font-serif text-xl text-text">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">{body}</p>
    </div>
  )
}
