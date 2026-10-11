import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// =====================================================================
// Waar komt iemand uit die op een link in zijn mail klikt?
//
// Alleen het doorsturen wordt getest: Supabase is nep, er is geen browser
// en geen database.
// =====================================================================

/** Lukt het inwisselen van de code voor een sessie? */
let codeWisseltIn = true

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      exchangeCodeForSession: async () =>
        codeWisseltIn
          ? { data: { user: null }, error: null }
          : { data: { user: null }, error: { message: 'code verifier ontbreekt' } },
    },
  }),
}))

const { GET } = await import('./route')

const ORIGIN = 'https://integraaloefenen.nl'

async function volgDeLink(query: string): Promise<string> {
  const antwoord = await GET(new NextRequest(`${ORIGIN}/auth/callback?${query}`))
  return antwoord.headers.get('location') ?? ''
}

beforeEach(() => {
  codeWisseltIn = true
})

describe('de link uit de bevestigingsmail', () => {
  it('zet de leerling ingelogd op de oefenpagina', async () => {
    const bestemming = await volgDeLink(
      'code=abc&next=%2Fnl%2Foefenen&van=bevestiging',
    )

    expect(bestemming).toBe(`${ORIGIN}/nl/oefenen`)
  })

  it('stuurt bij een code die niet werkt naar de inlogpagina met de bevestigingsmelding, niet met een fout', async () => {
    // Bijvoorbeeld: aangemeld op de laptop, mail geopend op de telefoon.
    codeWisseltIn = false

    const bestemming = await volgDeLink(
      'code=abc&next=%2Fnl%2Foefenen&van=bevestiging',
    )

    expect(bestemming).toBe(`${ORIGIN}/nl/inloggen?bevestigd=1`)
  })

  it('meldt niet dat het gelukt is als Supabase de bevestiging weigert', async () => {
    // Supabase zet zo'n fout nu achter een `#` (daar kijkt de inlogpagina
    // zelf naar), maar als hij hem in de adresregel zet, vangen we hem hier.
    const bestemming = await volgDeLink(
      'van=bevestiging&error=access_denied&error_code=otp_expired',
    )

    expect(bestemming).toBe(`${ORIGIN}/nl/inloggen?linkfout=1`)
  })

  it('maakt ook voor oude mails die naar de inlogpagina wijzen een sessie aan', async () => {
    // Mails die al verstuurd zijn, hebben nog next=/nl/inloggen. De
    // inlogpagina stuurt een ingelogde leerling door naar het dashboard.
    const bestemming = await volgDeLink('code=abc&next=%2Fnl%2Finloggen')

    expect(bestemming).toBe(`${ORIGIN}/nl/inloggen`)
  })
})

describe('andere links naar de callback', () => {
  it('stuurt een geldige herstellink naar de pagina voor een nieuw wachtwoord', async () => {
    const bestemming = await volgDeLink('code=abc&next=%2Fwachtwoord-opnieuw')

    expect(bestemming).toBe(`${ORIGIN}/nl/wachtwoord-opnieuw`)
  })

  it('toont bij een mislukte herstellink wel een foutmelding', async () => {
    codeWisseltIn = false

    const bestemming = await volgDeLink('code=abc&next=%2Fwachtwoord-opnieuw')

    expect(bestemming).toBe(`${ORIGIN}/nl/inloggen?error=auth_callback_failed`)
  })

  it('stuurt zonder code naar de inlogpagina met een foutmelding', async () => {
    const bestemming = await volgDeLink('next=%2Fnl%2Foefenen')

    expect(bestemming).toBe(`${ORIGIN}/nl/inloggen?error=auth_callback_failed`)
  })
})
