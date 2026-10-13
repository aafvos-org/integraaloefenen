import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

export async function SiteFooter() {
  const t = await getTranslations('Footer')

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-2">
        <p className="text-sm text-text-muted">{t('brand')}</p>
        <Link
          href="/privacy"
          className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-text-muted hover:text-text"
        >
          {t('privacy')}
        </Link>
      </div>
    </footer>
  )
}
