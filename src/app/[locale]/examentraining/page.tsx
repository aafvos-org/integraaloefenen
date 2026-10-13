import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'

import { getCurrentUser } from '@/lib/supabase/request-cache'

const REGELS = ['regel1', 'regel2', 'regel3', 'regel4'] as const

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Examentraining' })
  return { title: t('title') }
}

export default async function ExamentrainingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const user = await getCurrentUser()
  if (!user) redirect(`/${locale}/inloggen`)

  const t = await getTranslations('Examentraining')

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <h1 className="font-serif text-3xl text-text">{t('h1')}</h1>
      <ol className="mt-8 space-y-5">
        {REGELS.map((sleutel, index) => (
          <li key={sleutel} className="flex gap-3 text-base leading-relaxed text-text">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-sm font-medium tabular-nums">
              {index + 1}
            </span>
            <span className="min-w-0 break-words">{t(sleutel)}</span>
          </li>
        ))}
      </ol>
      <p className="mt-10 text-base leading-relaxed text-text">{t('geenOpgaven')}</p>
    </div>
  )
}
