import { getTranslations } from 'next-intl/server'

import { googleLoginAan } from '@/lib/google-login'

import { GoogleKnop } from './google-knop'

/** De knop plus het streepje "of". Niets als de vlag uit staat. */
export async function GoogleBlok({ volgende }: { volgende: string }) {
  if (!googleLoginAan()) return null

  const t = await getTranslations('Google')

  return (
    <div className="mb-4 space-y-4">
      <GoogleKnop volgende={volgende} />
      <div className="flex items-center gap-3 text-sm text-text-muted">
        <span className="h-px flex-1 bg-border" />
        {t('of')}
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  )
}
