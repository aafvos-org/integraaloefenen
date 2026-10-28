'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'

import { leesMetenActie, zetMeten } from '@/lib/meten/voorkeur'

/**
 * Leest `?meten=uit` of `?meten=aan` in de browser en zet de schakelaar
 * (INT-554). Toont daarna één keer een bevestiging.
 *
 * Alleen de browser kijkt hiernaar: het adres zelf verandert niet, en de
 * pagina blijft statisch (vergelijk `InloggenMeldingen`).
 */
export function MeetSchakelaar() {
  const searchParams = useSearchParams()
  const t = useTranslations('Meting')
  const actie = leesMetenActie(searchParams.get('meten'))

  useEffect(() => {
    if (actie !== null) zetMeten(actie)
  }, [actie])

  if (actie === null) return null

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <p className="rounded-md border border-accent/30 bg-accent-light px-3 py-2 text-sm text-accent shadow-sm">
        {actie === 'uit' ? t('uitMelding') : t('aanMelding')}
      </p>
    </div>
  )
}
