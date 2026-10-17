import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { zetStatischeTaal } from '@/i18n/statisch'

import { ForgotForm } from './forgot-form'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  zetStatischeTaal(locale)
  const t = await getTranslations({ locale, namespace: 'ForgotPassword' })
  return { title: t('title') }
}

export default async function WachtwoordVergetenPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  zetStatischeTaal(locale)
  const t = await getTranslations('ForgotPassword')

  return (
    <div className="px-4 py-12 sm:flex sm:min-h-[calc(100vh-3.5rem)] sm:items-center sm:justify-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl text-text">{t('h1')}</h1>
          <p className="text-sm text-text-muted">{t('subtitle')}</p>
        </div>
        <ForgotForm />
        <Link
          href="/inloggen"
          className="flex min-h-11 items-center justify-center text-center text-sm text-text-muted underline-offset-2 hover:underline"
        >
          {t('backToLogin')}
        </Link>
      </div>
    </div>
  )
}
