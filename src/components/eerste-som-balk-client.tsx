'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { EersteSomBalk } from './eerste-som-balk'

/**
 * Clientvariant van `EersteSomBalk` voor de theorie-pagina's (INT-731): die
 * pagina's zijn statisch (SEO, ook voor uitgelogde bezoekers), dus of de
 * balk moet verschijnen wordt hier pas ná het laden opgevraagd bij
 * `/api/eerste-som` — dat houdt de pagina zelf statisch.
 */
export function EersteSomBalkClient() {
  const t = useTranslations('EersteSomBalk')
  const [toon, setToon] = useState(false)

  useEffect(() => {
    let actief = true
    fetch('/api/eerste-som')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { toon?: boolean } | null) => {
        if (actief && data?.toon) setToon(true)
      })
      .catch(() => {})
    return () => {
      actief = false
    }
  }, [])

  if (!toon) return null
  return <EersteSomBalk tekst={t('tekst')} knop={t('knop')} />
}
