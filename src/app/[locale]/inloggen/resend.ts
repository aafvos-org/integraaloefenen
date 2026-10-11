// =====================================================================
// "Stuur bevestigingsmail opnieuw": wat Supabase ervan vindt, in het
// Nederlands.
//
// Supabase stuurt lang niet altijd een mail als je erom vraagt, en zegt dat
// in het Engels. Een leerling die dat niet te zien krijgt, zit te wachten op
// post die nooit komt. Deze module vertaalt het antwoord naar één van de
// zinnen in messages/nl.json → Login, plus het aantal seconden dat de knop
// uit moet blijven staan.
//
// Dit staat los van actions.ts, omdat een bestand met 'use server' alleen
// async functies mag exporteren — een constante of een rekenfunctie niet.
// =====================================================================

import { herkenAuthFout } from '@/lib/supabase/auth-fouten'

/**
 * Hoe lang de knop uit blijft na een mail die wél de deur uit ging.
 * Supabase weigert een volgende mail binnen `max_frequency`
 * (supabase/config.toml, nu 1 minuut), dus een tweede klik binnen die minuut
 * levert sowieso niets op.
 */
export const RESEND_WACHTTIJD = 60

/**
 * `reden` is de sleutel van de zin die de leerling te zien krijgt
 * (messages/nl.json → Login); de kale Engelse tekst van Supabase komt nooit
 * op het scherm. `wachtSeconden` is hoelang de knop uitgeschakeld blijft.
 */
export type ResendUitkomst = {
  reden: 'gelukt' | 'teSnel' | 'grensVol' | 'mislukt'
  wachtSeconden: number
}

/**
 * Welke zin en welke wachttijd horen bij het antwoord van Supabase?
 *
 * Het herkennen zelf gebeurt in `herkenAuthFout`, want dezelfde meldingen
 * komen ook langs bij registreren en wachtwoord vergeten. Hier staat alleen
 * wat deze knop ermee doet: te snel achter elkaar geeft een aftelling, een
 * volle mailgrens niet. Alles wat we niet herkennen wordt één algemene zin:
 * liever vaag dan Engels.
 */
export function vertaalResendFout(bericht: string, code?: string): ResendUitkomst {
  const { soort, wachtSeconden } = herkenAuthFout(bericht, code)
  if (soort === 'mailTeSnel') return { reden: 'teSnel', wachtSeconden }
  if (soort === 'mailGrensVol') return { reden: 'grensVol', wachtSeconden: 0 }
  return { reden: 'mislukt', wachtSeconden: 0 }
}
