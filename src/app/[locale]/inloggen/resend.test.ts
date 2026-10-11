import { describe, expect, it } from 'vitest'

import { vertaalResendFout } from './resend'

// =====================================================================
// De zinnen van Supabase als een leerling de bevestigingsmail opnieuw
// opvraagt. Hij mag nooit een Engelse tekst te zien krijgen, en als er een
// wachttijd in staat moet die bij de knop terechtkomen.
// =====================================================================

describe('vertaalResendFout', () => {
  it('haalt de seconden uit de wachttijd van max_frequency', () => {
    expect(
      vertaalResendFout(
        'For security purposes, you can only request this after 43 seconds.',
        'over_email_send_rate_limit',
      ),
    ).toEqual({ reden: 'teSnel', wachtSeconden: 43 })
  })

  it('leest ook de enkelvoudige seconde', () => {
    expect(
      vertaalResendFout(
        'For security purposes, you can only request this after 1 second.',
        'over_email_send_rate_limit',
      ),
    ).toEqual({ reden: 'teSnel', wachtSeconden: 1 })
  })

  it('herkent de volle mailgrens van het project aan de code', () => {
    expect(
      vertaalResendFout('Email rate limit exceeded', 'over_email_send_rate_limit'),
    ).toEqual({ reden: 'grensVol', wachtSeconden: 0 })
  })

  it('herkent de volle mailgrens ook zonder code', () => {
    expect(vertaalResendFout('email rate limit exceeded')).toEqual({
      reden: 'grensVol',
      wachtSeconden: 0,
    })
  })

  it('maakt van een onbekende storing één algemene zin', () => {
    expect(vertaalResendFout('Error sending confirmation email', '500')).toEqual({
      reden: 'mislukt',
      wachtSeconden: 0,
    })
  })
})
