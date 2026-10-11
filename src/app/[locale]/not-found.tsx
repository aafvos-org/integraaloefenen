import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

export default async function NotFound() {
  const t = await getTranslations('NotFound')

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="text-sm font-medium uppercase tracking-wider text-accent">
        {t('eyebrow')}
      </p>
        <h1 className="mt-2 text-balance font-serif text-3xl text-text sm:text-5xl">
          {t('title')}
        </h1>
        <p className="mt-6 text-balance text-lg text-text-muted">{t('body')}</p>
      <div className="mt-10">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-6 text-white shadow-sm hover:bg-accent/90"
        >
          {t('cta')}
        </Link>
      </div>
    </div>
  )
}