'use client'

import { useEffect } from 'react'

import { zetMeten } from '@/lib/meten/voorkeur'

/**
 * Zet de klikmeting-schakelaar automatisch uit op elk apparaat waar de
 * beheerder inlogt (INT-554). Geen berichtje hierbij: dit scherm komt
 * toch al niet in de meting voor (`isBeheerpad` in
 * src/lib/meten/gebeurtenis.ts), de vlag werkt alleen verder op de rest
 * van de site.
 */
export function BeheerderMeetUit() {
  useEffect(() => {
    zetMeten('uit')
  }, [])

  return null
}
