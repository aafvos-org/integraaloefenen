import { describe, expect, it } from 'vitest'

import { heeftLinkFout } from './link-fout'

// =====================================================================
// Was de bevestigingslink stuk?
//
// Supabase stuurt een geweigerde bevestiging terug in het stuk achter de
// `#`. Zo ziet zo'n link eruit als hij verlopen is of al een keer gebruikt:
//
//   /nl/inloggen?bevestigd=1#error=access_denied&error_code=otp_expired
//     &error_description=Email+link+is+invalid+or+has+expired
//
// (nagemeten op 11 oktober 2026, lokaal en op de echte Supabase)
// =====================================================================

describe('heeftLinkFout', () => {
  it('ziet een verlopen of opgebruikte link', () => {
    expect(
      heeftLinkFout(
        '#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired',
      ),
    ).toBe(true)
  })

  it('ziet een fout ook zonder de `#` ervoor', () => {
    expect(heeftLinkFout('error=access_denied')).toBe(true)
  })

  it('ziet een losse error_code zonder error', () => {
    expect(heeftLinkFout('#error_code=otp_expired')).toBe(true)
  })

  it('laat een lege hash met rust', () => {
    expect(heeftLinkFout('')).toBe(false)
    expect(heeftLinkFout('#')).toBe(false)
  })

  it('laat een hash zonder fout met rust', () => {
    // Bij een gelukte bevestiging staat er geen fout in, hooguit iets anders.
    expect(heeftLinkFout('#access_token=abc&type=signup')).toBe(false)
  })
})
