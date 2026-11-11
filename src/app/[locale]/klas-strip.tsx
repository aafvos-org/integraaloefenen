'use client'

import { useSyncExternalStore } from 'react'
import { useTranslations } from 'next-intl'

import { bronUitTabblad } from '@/lib/bron'

/**
 * Geen abonnement nodig: de tabblad-opslag verandert niet terwijl de pagina
 * open staat. `bronUitTabblad` dekt `?van=klas` ook nadat de leerling is
 * doorgeklikt, want `scriptDatBronOnthoudt` in `bron.ts` onthoudt de bron al
 * vóór deze component rendert.
 */
function useKomtVanKlas(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => bronUitTabblad() === 'klas',
    () => false,
  )
}

/**
 * Eén korte regel boven de proefsom voor bezoekers die via een deellink van
 * een klasgenoot binnenkomen (`?van=klas`, zie `src/lib/delen.ts` en
 * `src/lib/bron.ts`). Puur client-side, zodat de openbare pagina's statisch
 * blijven en er geen cookie of meting bij komt (INT-732). Geen eigen knop
 * (INT-830): de proefsom staat er vlak onder.
 */
export function KlasStrip() {
  const t = useTranslations('KlasStrip')
  const zichtbaar = useKomtVanKlas()

  if (!zichtbaar) return null

  return <p className="mb-3 text-center text-sm font-medium text-accent">{t('title')}</p>
}
