import type { Metadata, ResolvingMetadata } from 'next'
import { getTranslations, getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { redirect } from 'next/navigation'

import { GoogleBlok } from '@/components/google-blok'
import { leesBron } from '@/lib/bron'
import { getCurrentUser } from '@/lib/supabase/request-cache'

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

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ van?: string }>
}) {
  const locale = await getLocale()
  const user = await getCurrentUser()
  const bron = leesBron((await searchParams).van)

  if (user) {
    redirect(`/${locale}/dashboard`)
  }

  const t = await getTranslations('Register')
  // Komt de leerling net van de proefsom op de startpagina, dan is de
  // generieke tekst niet motiverend: hij deed al een som en twijfelt of
  // registreren wat toevoegt.
  const uitProefsom = bron === 'proberen'

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-serif text-3xl text-text">
        {uitProefsom ? t('h1Proefsom') : t('h1')}
      </h1>
      <p className="mt-2 text-sm text-text-muted">
        {uitProefsom ? t('subtitleProefsom') : t('subtitle')}
      </p>

      <div className="mt-8 rounded-xl border border-border bg-surface p-6">
        <GoogleBlok volgende={`/${locale}/oefenen`} />
        <SignupForm bronUitAdres={bron} />
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
