import { getTranslations } from 'next-intl/server'

import { zetStatischeTaal } from '@/i18n/statisch'

import { NewPasswordForm } from './new-password-form'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  zetStatischeTaal(locale)
  const t = await getTranslations({ locale, namespace: 'NewPassword' })
  return { title: t('title') }
}

export default async function WachtwoordOpnieuwPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  zetStatischeTaal(locale)
  const t = await getTranslations('NewPassword')

  return (
    <div className="px-4 py-12 sm:flex sm:min-h-[calc(100vh-3.5rem)] sm:items-center sm:justify-center">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="font-serif text-3xl text-text">{t('h1')}</h1>
        <NewPasswordForm />
      </div>
    </div>
  )
}
