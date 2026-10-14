import { getLocale, getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'

import { moetGebruikersnaamVragen, veiligeVolgende } from '@/lib/google-login'
import { getCurrentProfile, getCurrentUser } from '@/lib/supabase/request-cache'

import { GebruikersnaamForm } from './form'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Google' })
  return { title: t('nameTitle') }
}

export default async function GebruikersnaamPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const locale = await getLocale()
  const user = await getCurrentUser()
  if (!user) redirect(`/${locale}/inloggen`)

  const volgende = veiligeVolgende((await searchParams).next)
  const profiel = await getCurrentProfile()
  if (!moetGebruikersnaamVragen(user, profiel?.username)) {
    redirect(volgende)
  }

  const t = await getTranslations('Google')

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-serif text-3xl text-text">{t('nameTitle')}</h1>
      <p className="mt-2 text-sm text-text-muted">{t('nameSubtitle')}</p>

      <div className="mt-8 rounded-xl border border-border bg-surface p-6">
        <GebruikersnaamForm volgende={volgende} />
      </div>
    </div>
  )
}
