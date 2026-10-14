import type { Metadata } from 'next'
import Link from 'next/link'

import { getTranslations } from 'next-intl/server'

import { nietGevondenMetadata } from '@/lib/niet-gevonden'

export const metadata: Metadata = nietGevondenMetadata

// De paden buiten de taalmappen (zoals /leerpad of /bestaat-niet) eindigen
// hier. De pagina's onder /nl/ krijgen hun eigen Nederlandse versie uit
// src/app/[locale]/not-found.tsx, die ook de header meeneemt.
export default async function NotFound() {
  const t = await getTranslations('NotFound')

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-4">
      <div className="mx-auto max-w-2xl py-24 text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-accent">
          {t('eyebrow')}
        </p>
        <h1 className="mt-2 text-balance font-serif text-3xl text-text sm:text-5xl">
          {t('title')}
        </h1>
        <p className="mt-6 text-balance text-lg text-text-muted">{t('body')}</p>
        <div className="mt-10">
          <Link
            href="/nl"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-6 text-white shadow-sm hover:bg-accent/90"
          >
            {t('cta')}
          </Link>
        </div>
      </div>
    </main>
  )
}