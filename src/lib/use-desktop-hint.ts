import { useSyncExternalStore } from 'react'

/**
 * Alleen voor de aria/tekst van de toggle-knop, ná hydratatie: begint `false`
 * (zelfde als de CSS-standaard op de telefoon) en synchroniseert daarna met
 * het echte scherm. Bepaalt nooit de zichtbare opmaak zelf — dat doet CSS via
 * het lg-breakpoint — dus dit geeft geen layout shift.
 */
export function useDesktopHint(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia('(min-width: 1024px)')
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    () => window.matchMedia('(min-width: 1024px)').matches,
    () => false,
  )
}
