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
 * Supabase zegt op twee manieren nee, allebei met code
 * `over_email_send_rate_limit`:
 *
 * - te snel achter elkaar (`max_frequency`): "For security purposes, you can
 *   only request this after 43 seconds." Daar staat in hoelang het nog duurt,
 *   en dat is precies wat een leerling wil weten.
 * - de mailgrens van het hele project is vol: "email rate limit exceeded".
 *   Dan helpt wachten ook, maar veel langer, en het ligt niet aan hem.
 *
 * Alles wat we niet herkennen wordt één algemene zin: liever vaag dan Engels.
 */
export function vertaalResendFout(bericht: string, code?: string): ResendUitkomst {
  const seconden = Number(/after (\d+) seconds?/i.exec(bericht)?.[1])
  if (seconden > 0) {
    return { reden: 'teSnel', wachtSeconden: seconden }
  }
  if (code === 'over_email_send_rate_limit' || /rate limit/i.test(bericht)) {
    return { reden: 'grensVol', wachtSeconden: 0 }
  }
  return { reden: 'mislukt', wachtSeconden: 0 }
}
