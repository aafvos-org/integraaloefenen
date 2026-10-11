import { afterEach, describe, expect, it, vi } from 'vitest'

import { authFoutmelding, herkenAuthFout } from './auth-fouten'

// =====================================================================
// De harde eis: er komt nooit Engelse tekst van Supabase op het scherm van
// een leerling. Alles wat we niet herkennen wordt één nette Nederlandse zin,
// en de echte melding gaat naar de logs.
// =====================================================================

describe('herkenAuthFout', () => {
  it('herkent op de code, ook als de Engelse zin verandert', () => {
    expect(herkenAuthFout('whatever Supabase says now', 'invalid_credentials').soort).toBe(
      'onjuisteInlog',
    )
    expect(herkenAuthFout('iets anders', 'email_not_confirmed').soort).toBe('nietBevestigd')
    expect(herkenAuthFout('iets anders', 'user_already_exists').soort).toBe('adresBestaat')
    expect(herkenAuthFout('iets anders', 'weak_password').soort).toBe('zwakWachtwoord')
    expect(herkenAuthFout('iets anders', 'same_password').soort).toBe('zelfdeWachtwoord')
    expect(herkenAuthFout('iets anders', 'over_request_rate_limit').soort).toBe(
      'teVeelPogingen',
    )
  })

  it('herkent op de zin als er geen code meekomt', () => {
    expect(herkenAuthFout('Invalid login credentials').soort).toBe('onjuisteInlog')
    expect(herkenAuthFout('Email not confirmed').soort).toBe('nietBevestigd')
    expect(herkenAuthFout('User already registered').soort).toBe('adresBestaat')
    expect(herkenAuthFout('Password should be at least 6 characters').soort).toBe(
      'zwakWachtwoord',
    )
  })

  it('haalt de wachttijd uit de melding over te snel achter elkaar', () => {
    expect(
      herkenAuthFout(
        'For security purposes, you can only request this after 43 seconds.',
        'over_email_send_rate_limit',
      ),
    ).toEqual({ soort: 'mailTeSnel', wachtSeconden: 43 })
  })

  it('herkent de volle mailgrens van het project', () => {
    expect(
      herkenAuthFout('Email rate limit exceeded', 'over_email_send_rate_limit'),
    ).toEqual({ soort: 'mailGrensVol', wachtSeconden: 0 })
    expect(herkenAuthFout('email rate limit exceeded').soort).toBe('mailGrensVol')
  })

  it('ziet een verlopen link en een verdwenen sessie los van elkaar', () => {
    expect(herkenAuthFout('Token has expired', 'otp_expired').soort).toBe('linkVerlopen')
    expect(herkenAuthFout('Auth session missing!').soort).toBe('nietIngelogd')
  })

  it('noemt al het onbekende onbekend', () => {
    expect(herkenAuthFout('Error sending confirmation email', '500').soort).toBe('onbekend')
    expect(herkenAuthFout('').soort).toBe('onbekend')
  })
})

describe('authFoutmelding', () => {
  afterEach(() => vi.restoreAllMocks())

  it('geeft nooit de Engelse tekst terug', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const engels = 'Database error saving new user'
    expect(authFoutmelding({ message: engels }, 'registreren')).not.toContain(engels)
  })

  it('zet een onbekende melding wel in de logs', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    authFoutmelding({ message: 'Database error saving new user' }, 'registreren')
    expect(log).toHaveBeenCalledWith(
      '[auth registreren]',
      'geen code',
      'Database error saving new user',
    )
  })

  it('houdt een herkende melding uit de logs', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    const zin = authFoutmelding(
      { message: 'Invalid login credentials', code: 'invalid_credentials' },
      'inloggen',
    )
    expect(zin).toBe('Onjuiste combinatie van e-mailadres en wachtwoord.')
    expect(log).not.toHaveBeenCalled()
  })
})
