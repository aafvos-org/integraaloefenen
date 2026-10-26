import type { Metadata, ResolvingMetadata } from 'next'
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

import { AlIngelogd } from '@/components/al-ingelogd'
import { GoogleBlok } from '@/components/google-blok'

import { Kop } from './kop'
import { KopUitAdres } from './kop-uit-adres'
import { SignupForm } from './signup-form'

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Register' })
  const vorige = await parent
  return {
    title: t('title'),
    description: t('description'),
    openGraph: { ...vorige.openGraph, description: t('description') },
  }
}

/**
 * Geen `cookies()` en geen `searchParams` meer hier: die maakten deze pagina
 * bij elk bezoek dynamisch, ook voor wie alleen komt registreren (INT-549,
 * zie ook INT-519 voor /inloggen). Alvast ingelogd leest de browser nu zelf
 * (AlIngelogd), en ook `?van=` voor de proefsom-tekst en de bron bij het
 * account (KopUitAdres, SignupForm). Zo komt dit bezoek, net als theorie en
 * de startpagina, uit de klaargezette versie.
 */
export default async function SignupPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Register' })

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <AlIngelogd naar={`/${locale}/dashboard`} />

      <Suspense fallback={<Kop h1={t('h1')} subtitle={t('subtitle')} />}>
        <KopUitAdres
          h1={t('h1')}
          h1Proefsom={t('h1Proefsom')}
          subtitle={t('subtitle')}
          subtitleProefsom={t('subtitleProefsom')}
        />
      </Suspense>

      <div className="mt-8 rounded-xl border border-border bg-surface p-6">
        <GoogleBlok volgende={`/${locale}/oefenen`} />
        <SignupForm />
      </div>

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
