import type { Metadata } from 'next'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { SITE_CONFIG } from '@/config/site'
import { routing } from '@/i18n/routing'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
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
    // (dashboard, inloggen): die horen niet in een zoekmachine en hebben geen
    // eigen kaartje nodig.
    openGraph: {
      type: 'website',
      locale: 'nl_NL',
      siteName: domain,
      title: t('ogTitle'),
      description: t('description'),
    },
    robots: {
      index: true,
      follow: true,
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
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <SiteHeader locale={locale} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </NextIntlClientProvider>
  )
}
