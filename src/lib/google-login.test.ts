import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  googleLoginAan,
  moetGebruikersnaamVragen,
  veiligeVolgende,
  type GebruikerVoorGoogle,
} from './google-login'

const google: GebruikerVoorGoogle = {
  app_metadata: { provider: 'google' },
  identities: [{ provider: 'google' }],
  user_metadata: {},
}

describe('googleLoginAan', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('staat uit als de vlag er niet is', () => {
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_LOGIN', '')
    expect(googleLoginAan()).toBe(false)
  })

  it('staat alleen aan bij precies 1', () => {
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_LOGIN', '1')
    expect(googleLoginAan()).toBe(true)
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_LOGIN', 'true')
    expect(googleLoginAan()).toBe(false)
  })
})

describe('moetGebruikersnaamVragen', () => {
  it('vraagt het bij de eerste keer via Google', () => {
    expect(moetGebruikersnaamVragen(google, null)).toBe(true)
  })

  it('vraagt het niet bij een gewoon account', () => {
    expect(
      moetGebruikersnaamVragen(
        { app_metadata: { provider: 'email' }, identities: [{ provider: 'email' }] },
        null,
      ),
    ).toBe(false)
  })

  it('vraagt het niet als het profiel al een naam heeft', () => {
    expect(moetGebruikersnaamVragen(google, 'wiskundefan')).toBe(false)
  })

  it('vraagt het niet als de naam al bij het aanmelden gekozen is', () => {
    expect(
      moetGebruikersnaamVragen({ ...google, user_metadata: { username: 'wiskundefan' } }, null),
    ).toBe(false)
  })

  it('vraagt het niet nog een keer als de leerling het veld leeg liet', () => {
    expect(
      moetGebruikersnaamVragen(
        { ...google, user_metadata: { gebruikersnaam_gevraagd: true } },
        null,
      ),
    ).toBe(false)
  })
})

describe('veiligeVolgende', () => {
  it('laat een pad op de site staan', () => {
    expect(veiligeVolgende('/nl/oefenen')).toBe('/nl/oefenen')
  })

  it('stuurt een vreemd adres naar het dashboard', () => {
    expect(veiligeVolgende('https://example.com')).toBe('/nl/dashboard')
    expect(veiligeVolgende('//example.com')).toBe('/nl/dashboard')
    expect(veiligeVolgende('/nl/gebruikersnaam')).toBe('/nl/dashboard')
    expect(veiligeVolgende(null)).toBe('/nl/dashboard')
  })
})
