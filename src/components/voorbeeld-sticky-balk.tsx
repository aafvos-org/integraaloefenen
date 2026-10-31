'use client'

import { ComponentProps, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'

/** Zelfde scrolldiepte als de 75%-stap in de klikmeting (`SCROLLDIEPTES`). */
const SCROLL_DREMPEL = 75

/**
 * Plakkerige balk onderaan een voorbeeldpagina, met een knop naar de
 * proefsom (INT-678). Verschijnt pas na ~75% scroll, zodat iemand die alleen
 * de uitleg leest ook zonder te klikken een duwtje richting oefenen krijgt.
 *
 * Verdwijnt voorgoed zodra `dismissElementId` in beeld komt: de pagina heeft
 * daar al een knop naar dezelfde bestemming staan, en twee knoppen
 * tegelijk is dubbele drukte.
 */
export function VoorbeeldStickyBalk({
  href,
  dataMeet,
  dismissElementId,
}: {
  href: ComponentProps<typeof Link>['href']
  dataMeet: string
  dismissElementId: string
}) {
  const t = useTranslations('Voorbeeld')
  const [zichtbaar, setZichtbaar] = useState(false)
  const [verborgen, setVerborgen] = useState(false)

  useEffect(() => {
    if (verborgen) return

    function opScroll() {
      const totaal = document.documentElement.scrollHeight
      if (totaal <= 0) return
      const diepte = ((window.scrollY + window.innerHeight) / totaal) * 100
      if (diepte >= SCROLL_DREMPEL) setZichtbaar(true)
    }

    opScroll()
    window.addEventListener('scroll', opScroll, { passive: true })
    return () => window.removeEventListener('scroll', opScroll)
  }, [verborgen])

  useEffect(() => {
    const doel = document.getElementById(dismissElementId)
    if (!doel) return
    // threshold 0.5: pas verbergen zodra die knop voor de helft zichtbaar is,
    // niet al bij een paar pixels die nog net de onderkant van het scherm
    // raken (anders knippert de balk op een korte pagina meteen weer weg).
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVerborgen(true)
      },
      { threshold: 0.5 },
    )
    observer.observe(doel)
    return () => observer.disconnect()
  }, [dismissElementId])

  if (!zichtbaar || verborgen) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <p className="min-w-0 flex-1 truncate text-sm text-text">{t('stickyTekst')}</p>
        <Link
          href={href}
          data-meet={dataMeet}
          onClick={() => setVerborgen(true)}
          className="inline-flex min-h-11 shrink-0 items-center rounded-lg bg-accent px-4 text-sm font-medium text-white hover:bg-accent/90"
        >
          {t('stickyKnop')}
        </Link>
      </div>
    </div>
  )
}
