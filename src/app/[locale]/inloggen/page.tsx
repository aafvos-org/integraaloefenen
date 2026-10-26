import type { Metadata, ResolvingMetadata } from 'next'
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

import { AlIngelogd } from '@/components/al-ingelogd'
import { GoogleBlok } from '@/components/google-blok'
import { zetStatischeTaal } from '@/i18n/statisch'

import { AanmeldLink } from './aanmeld-link'
import { InloggenMeldingen } from './inloggen-meldingen'
import { LoginForm } from './login-form'

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Login' })
  const vorige = await parent
  return {
    title: t('title'),
    description: t('description'),
    openGraph: { ...vorige.openGraph, description: t('description') },
  }
}

/**
 * Geen `cookies()` en geen `searchParams` meer hier: die maakten deze pagina
 * bij elk bezoek dynamisch, ook voor wie alleen komt inloggen (INT-519). De
 * paar dingen die daarvan afhingen — alvast ingelogd, een melding na een
 * mail-link, `?van=` bij "Account aanmaken" — leest de browser nu zelf, in
 * AlIngelogd, InloggenMeldingen en AanmeldLink. Zo komt dit bezoek, net als
 * theorie en de startpagina, uit de klaargezette versie.
 */
export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  zetStatischeTaal(locale)
  const t = await getTranslations('Login')

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <AlIngelogd naar={`/${locale}/dashboard`} />
      <h1 className="font-serif text-3xl text-text">{t('h1')}</h1>
      <p className="mt-2 text-sm text-text-muted">{t('subtitle')}</p>

      <Suspense fallback={null}>
        <InloggenMeldingen />
      </Suspense>

      <div className="mt-8 rounded-xl border border-border bg-surface p-6">
        <GoogleBlok volgende={`/${locale}/dashboard`} />
        <LoginForm />
      </div>

      <p className="mt-4 text-center text-sm text-text-muted">
        {t('noAccount')}{' '}
        <Suspense
          fallback={
            <Link
              href="/registreren"
              className="inline-flex min-h-11 items-center px-1 font-medium text-accent hover:underline"
            >
              {t('registerLink')}
            </Link>
          }
        >
          <AanmeldLink label={t('registerLink')} />
        </Suspense>
      </p>
      <p className="text-center text-sm text-text-muted">
        <Link
          href="/wachtwoord-vergeten"
          className="inline-flex min-h-11 items-center px-2 text-accent hover:underline"
        >
          {t('forgotPassword')}
        </Link>
      </p>
    </div>
  )
}
