import { getTranslations } from 'next-intl/server'

import type { Bron } from '@/lib/bron'
import { googleLoginAan } from '@/lib/google-login'

import { GoogleKnop } from './google-knop'

/** De knop plus het streepje "of". Niets als de vlag uit staat. */
export async function GoogleBlok({
  volgende,
  bron = null,
}: {
  volgende: string
  bron?: Bron | null
}) {
  if (!googleLoginAan()) return null

  const t = await getTranslations('Google')

  return (
    <div className="mb-4 space-y-4">
      <GoogleKnop volgende={volgende} bron={bron} />
      <div className="flex items-center gap-3 text-sm text-text-muted">
        <span className="h-px flex-1 bg-border" />
        {t('of')}
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  )
}
