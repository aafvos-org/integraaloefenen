import { getTranslations } from 'next-intl/server'

import { AfgeleideVerwijzing } from '@/components/afgeleide-verwijzing'
import { Link } from '@/i18n/navigation'

export async function SiteFooter() {
  const t = await getTranslations('Footer')

  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-5xl px-4 py-2">
        <p>
          <AfgeleideVerwijzing className="inline-flex min-h-11 items-center text-sm text-text-muted underline-offset-2 hover:text-text hover:underline" />
        </p>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-text-muted">{t('brand')}</p>
          <div className="flex items-center gap-2">
            <Link
              href="/video-aanvragen"
              data-meet="footer-video-aanvraag"
              className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-text-muted hover:text-text"
            >
              {t('videoAanvraag')}
            </Link>
            <Link
              href="/privacy"
              className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-text-muted hover:text-text"
            >
              {t('privacy')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
