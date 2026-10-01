import type { Metadata } from 'next'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { SiteHeader } from '@/components/site-header'
import { domainForLocale } from '@/config/site'
import { routing } from '@/i18n/routing'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isNl = locale === 'nl'
  const domain = domainForLocale(locale)
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
    alternates: {
      canonical: `/${locale}`,
      languages: { nl: '/nl', en: '/en' },
    },
    openGraph: {
      type: 'website',
      locale: isNl ? 'nl_NL' : 'en_US',
      url: siteUrl,
      siteName: domain,
      title: t('ogTitle'),
      description: t('description'),
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: [
        { url: '/favicon.png', type: 'image/png' },
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico' },
      ],
      shortcut: ['/favicon.ico'],
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
    </NextIntlClientProvider>
  )
}
