import type { Metadata } from 'next'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { SITE_CONFIG } from '@/config/site'
import { routing } from '@/i18n/routing'
import { zetStatischeTaal } from '@/i18n/statisch'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  zetStatischeTaal(locale)
  const domain = SITE_CONFIG.domain
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${domain}`
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t('title'),
      template: `%s · ${domain}`,
    },
    description: t('description'),
    applicationName: domain,
    authors: [{ name: domain }],
    // Geen canonical en geen og:url hier: een layout weet niet op welke pagina
    // hij staat, dus zou elke pagina het adres van de startpagina opgeven. Elke
    // openbare pagina zet ze zelf, met eigenPagina() uit src/lib/seo.ts.
    //
    // Wat hieronder blijft staan is de terugval voor de afgeschermde pagina's
    // (dashboard, inloggen, proberen): die horen niet in een zoekmachine en
    // hebben geen eigen kaartje nodig. Openbare pagina's overschrijven dit
    // via eigenPagina() met index, follow.
    openGraph: {
      type: 'website',
      locale: 'nl_NL',
      siteName: domain,
      title: t('ogTitle'),
      description: t('description'),
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: domain }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('ogTitle'),
      description: t('description'),
      images: ['/og-image.png'],
    },
    robots: {
      index: false,
      follow: false,
    },
    icons: {
      icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    },
  }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  zetStatischeTaal(locale)
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const messages = await getMessages()
  const t = await getTranslations({ locale, namespace: 'Header' })

  return (
    <NextIntlClientProvider messages={messages}>
      <a
        href="#inhoud"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
      >
        {t('skipToContent')}
      </a>
      <SiteHeader locale={locale} />
      <main id="inhoud" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <SiteFooter />
    </NextIntlClientProvider>
  )
}
