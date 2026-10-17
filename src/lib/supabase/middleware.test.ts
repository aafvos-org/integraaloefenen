import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LEERLING_KOP } from './leerling-kop'
import { updateSession } from './middleware'

const { sessie } = vi.hoisted(() => ({
  sessie: {
    user: null as { id: string } | null,
    foutcode: null as string | null,
    rol: null as string | null,
    cookies: [] as { name: string; value: string }[],
  },
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: (
    _url: string,
    _key: string,
    options: {
      cookies: {
        setAll: (cookies: { name: string; value: string }[]) => void
      }
    },
  ) => ({
    auth: {
      getUser: async () => {
        if (sessie.cookies.length > 0) options.cookies.setAll(sessie.cookies)
        return {
          data: { user: sessie.user },
          error: sessie.foutcode ? { code: sessie.foutcode } : null,
        }
      },
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: sessie.rol ? { role: sessie.rol } : null,
            error: null,
          }),
        }),
      }),
    }),
  }),
}))

function verzoek(pad: string) {
  return new NextRequest(new URL(pad, 'http://localhost'))
}

function bestemming(antwoord: Response) {
  return new URL(antwoord.headers.get('location') ?? '', 'http://localhost')
}

function verzoekMetDodeSessie(pad: string) {
  return new NextRequest(new URL(pad, 'http://localhost'), {
    headers: {
      cookie: 'sb-test-auth-token=abc; sb-test-auth-token.0=def; voorkeur=nl',
    },
  })
}

/** Namen van cookies die het antwoord op 1 januari 1970 laat verlopen. */
function gewisteNamen(antwoord: Response) {
  return antwoord.headers
    .getSetCookie()
    .filter((regel) => /expires=thu, 01 jan 1970/i.test(regel))
    .map((regel) => regel.slice(0, regel.indexOf('=')))
}

beforeEach(() => {
  sessie.user = null
  sessie.foutcode = null
  sessie.rol = null
  sessie.cookies = []
})

describe('inlogpoort en herkomst', () => {
  it('houdt van=voorbeeld vast en laat de rest van het adres vallen', async () => {
    const antwoord = await updateSession(
      verzoek('/nl/oefenen?blok=k0b&cluster=std&van=Voorbeeld&error=1'),
    )
    const naar = bestemming(antwoord)
    expect(naar.pathname).toBe('/nl/inloggen')
    expect(naar.searchParams.get('van')).toBe('voorbeeld')
    expect(naar.searchParams.has('blok')).toBe(false)
    expect(naar.searchParams.has('cluster')).toBe(false)
    expect(naar.searchParams.has('error')).toBe(false)
  })

  it('neemt een onbekende herkomst niet mee', async () => {
    const antwoord = await updateSession(verzoek('/nl/oefenen?van=tiktok&error=1'))
    const naar = bestemming(antwoord)
    expect(naar.pathname).toBe('/nl/inloggen')
    expect(naar.search).toBe('')
  })

  it('stuurt oefenen zonder herkomst naar inloggen zonder zoekwoorden', async () => {
    const antwoord = await updateSession(verzoek('/nl/oefenen'))
    const naar = bestemming(antwoord)
    expect(naar.pathname).toBe('/nl/inloggen')
    expect(naar.search).toBe('')
  })

  it('neemt een meegestuurd leerling-id niet over op een openbare pagina', async () => {
    const verzoekMetKop = new NextRequest(new URL('/nl/theorie', 'http://localhost'), {
      headers: {
        cookie: 'sb-test-auth-token=abc',
        [LEERLING_KOP]: 'nep-id',
      },
    })
    const antwoord = await updateSession(verzoekMetKop)
    expect(antwoord.headers.get(`x-middleware-request-${LEERLING_KOP}`)).toBeNull()
    expect(antwoord.status).toBe(200)
  })

  it('laat theorie met een sessiecookie met rust, zonder Supabase', async () => {
    const verzoekMetCookie = new NextRequest(new URL('/nl/theorie', 'http://localhost'), {
      headers: { cookie: 'sb-test-auth-token=abc' },
    })
    const antwoord = await updateSession(verzoekMetCookie)
    expect(antwoord.status).toBe(200)
    expect(antwoord.headers.get('location')).toBeNull()
  })

  it('stuurt de startpagina met een sessiecookie naar het dashboard', async () => {
    for (const pad of ['/', '/nl', '/nl/']) {
      const verzoekMetCookie = new NextRequest(new URL(pad, 'http://localhost'), {
        headers: { cookie: 'sb-test-auth-token=abc' },
      })
      const antwoord = await updateSession(verzoekMetCookie)
      expect(bestemming(antwoord).pathname).toBe('/nl/dashboard')
    }
  })

  it('laat de startpagina zonder cookie staan', async () => {
    const antwoord = await updateSession(verzoek('/nl'))
    expect(antwoord.status).toBe(200)
    expect(antwoord.headers.get('location')).toBeNull()
  })

  it('wist een verlopen inlogcookie op het doorstuurantwoord naar inloggen', async () => {
    sessie.foutcode = 'refresh_token_not_found'
    const antwoord = await updateSession(
      verzoekMetDodeSessie('/nl/oefenen?blok=k0b&van=voorbeeld'),
    )
    const naar = bestemming(antwoord)
    expect(naar.pathname).toBe('/nl/inloggen')
    expect(naar.searchParams.get('van')).toBe('voorbeeld')
    expect(naar.searchParams.has('blok')).toBe(false)
    expect(gewisteNamen(antwoord).sort()).toEqual([
      'sb-test-auth-token',
      'sb-test-auth-token.0',
    ])
  })

  it('wist een verlopen inlogcookie ook als beheer doorstuurt naar inloggen', async () => {
    sessie.foutcode = 'refresh_token_not_found'
    const antwoord = await updateSession(verzoekMetDodeSessie('/admin'))
    expect(bestemming(antwoord).pathname).toBe('/nl/inloggen')
    expect(gewisteNamen(antwoord).sort()).toEqual([
      'sb-test-auth-token',
      'sb-test-auth-token.0',
    ])
  })

  it('neemt een ververste sessie mee als beheer iemand zonder rechten terugstuurt', async () => {
    sessie.user = { id: 'leerling' }
    sessie.rol = 'leerling'
    sessie.cookies = [{ name: 'sb-test-auth-token', value: 'vers' }]
    const antwoord = await updateSession(verzoekMetDodeSessie('/admin'))
    expect(bestemming(antwoord).pathname).toBe('/')
    expect(
      antwoord.headers.getSetCookie().some((regel) => regel.startsWith('sb-test-auth-token=vers')),
    ).toBe(true)
  })

  it('laat de inlogcookie staan als de sessie om een andere reden ontbreekt', async () => {
    sessie.foutcode = 'session_expired'
    const antwoord = await updateSession(verzoekMetDodeSessie('/nl/oefenen'))
    expect(bestemming(antwoord).pathname).toBe('/nl/inloggen')
    expect(gewisteNamen(antwoord)).toEqual([])
  })
})
