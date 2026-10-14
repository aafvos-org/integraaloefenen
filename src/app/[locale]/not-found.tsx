import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { zetStatischeTaal } from '@/i18n/statisch'
import { nietGevondenMetadata } from '@/lib/niet-gevonden'

// absolute titel, anders plakt de titel-sjabloon van de taallayout het domein
// er nog een keer achter. Zelfde tekst als src/app/not-found.tsx.
export const metadata: Metadata = nietGevondenMetadata

export default async function NotFound() {
  zetStatischeTaal(routing.defaultLocale)
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