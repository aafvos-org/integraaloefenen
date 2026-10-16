import type { Metadata, ResolvingMetadata } from 'next'
import { getTranslations, getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { redirect } from 'next/navigation'

import { GoogleBlok } from '@/components/google-blok'
import { leesBron, padNaarAanmelden } from '@/lib/bron'
import { getCurrentUser } from '@/lib/supabase/request-cache'

import { BevestigingsMelding } from './bevestigings-melding'
import { HerstelMelding } from './herstel-melding'
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

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string
    bevestigd?: string
    linkfout?: string
    herstel?: string
    van?: string
  }>
}) {
  const locale = await getLocale()
  const user = await getCurrentUser()

  if (user) {
    redirect(`/${locale}/dashboard`)
  }

  const t = await getTranslations('Login')
  const { error, bevestigd, linkfout, herstel, van } = await searchParams
  const aanmelden = padNaarAanmelden('/registreren', leesBron(van))
  const callbackError = error === 'auth_callback_failed'
  const herstelFout = herstel === '1'

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-serif text-3xl text-text">{t('h1')}</h1>
      <p className="mt-2 text-sm text-text-muted">{t('subtitle')}</p>

      {(bevestigd || linkfout) && <BevestigingsMelding linkFout={Boolean(linkfout)} />}
      {(callbackError || herstelFout) && <HerstelMelding kapot={herstelFout} />}

      <div className="mt-8 rounded-xl border border-border bg-surface p-6">
        <GoogleBlok volgende={`/${locale}/dashboard`} bron={leesBron(van)} />
        <LoginForm />
      </div>

      <p className="mt-6 text-center text-sm text-text-muted">
        {t('noAccount')}{' '}
        <Link href={aanmelden} className="font-medium text-accent hover:underline">
          {t('registerLink')}
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-text-muted">
        <Link href="/wachtwoord-vergeten" className="text-accent hover:underline">
          {t('forgotPassword')}
        </Link>
      </p>
    </div>
  )
}
