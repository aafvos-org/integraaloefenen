'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Zet de klikmeting aan, en meldt elke paginawissel.
 *
 * Het eigenlijke scriptje wordt hier pas opgehaald, dus ná de eerste
 * weergave en in een eigen bestandje. Een bezoeker wacht er niet op, en een
 * pagina wordt er niet trager van.
 *
 * Alles wat er daarna gebeurt staat in src/lib/meten/verzamelaar.ts.
 */
export function Klikmeting() {
  const pathname = usePathname()

  useEffect(() => {
    let afgebroken = false
    void import('@/lib/meten/verzamelaar')
      .then((meting) => {
        if (!afgebroken) meting.meldPagina()
      })
      .catch(() => {
        // Geen meting is geen probleem. De leerling merkt er niets van.
      })
    return () => {
      afgebroken = true
    }
  }, [pathname])

  return null
}
