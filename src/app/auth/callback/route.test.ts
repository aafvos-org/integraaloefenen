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

/** Wie er na het inwisselen ingelogd is. `null` is de gewone mail-link. */
let gebruiker: {
  id: string
  app_metadata?: { provider?: string }
  identities?: { provider?: string }[]
  user_metadata?: Record<string, unknown>
} | null = null

/** Naam die al op het profiel staat, of `null` als die er nog niet is. */
let profielNaam: string | null = null

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      exchangeCodeForSession: async () =>
        codeWisseltIn
          ? { data: { user: gebruiker }, error: null }
          : { data: { user: null }, error: { message: 'code verifier ontbreekt' } },
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: { username: profielNaam }, error: null }),
        }),
      }),
      update: () => ({
        eq: () => ({
          is: () => ({
            select: async () => ({ data: [{ id: 'u' }], error: null }),
          }),
        }),
      }),
    }),
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
  gebruiker = null
  profielNaam = null
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

  it('stuurt een verlopen of gebruikte herstellink naar de inlogpagina met een duidelijke melding', async () => {
    // Bij een verlopen of al gebruikte link lukt het inwisselen van de code
    // niet. De callback herkent de resetlink aan `next=/wachtwoord-opnieuw`
    // en stuurt de leerling door naar de inlogpagina, die uitlegt dat hij een
    // nieuwe resetlink moet aanvragen in plaats van de algemene foutmelding.
    codeWisseltIn = false

    const bestemming = await volgDeLink('code=abc&next=%2Fwachtwoord-opnieuw')

    expect(bestemming).toBe(`${ORIGIN}/nl/inloggen?herstel=1`)
  })

  it('herkent een verlopen herstellink ook zonder code in de adresregel', async () => {
    // Supabase zet zo'n fout nu achter een `#`; dat deel komt nooit bij de
    // server aan. De inlogpagina kijkt er zelf naar, de callback herkent de
    // resetlink hier aan `next` en vult de melding alvast aan.
    const bestemming = await volgDeLink('next=%2Fwachtwoord-opnieuw')

    expect(bestemming).toBe(`${ORIGIN}/nl/inloggen?herstel=1`)
  })

  it('vangt ook de fout op als Supabase hem wél in de adresregel zet', async () => {
    const bestemming = await volgDeLink(
      'next=%2Fwachtwoord-opnieuw&error=access_denied&error_code=otp_expired',
    )

    expect(bestemming).toBe(`${ORIGIN}/nl/inloggen?herstel=1`)
  })

  it('vraagt bij de eerste keer met Google om een gebruikersnaam', async () => {
    gebruiker = {
      id: 'google-1',
      app_metadata: { provider: 'google' },
      identities: [{ provider: 'google' }],
      user_metadata: {},
    }

    const bestemming = await volgDeLink('code=abc')

    expect(bestemming).toBe(`${ORIGIN}/nl/gebruikersnaam?next=%2Fnl%2Fdashboard`)
  })

  it('slaat die vraag over als het Google-account al een naam heeft', async () => {
    gebruiker = {
      id: 'google-1',
      app_metadata: { provider: 'google' },
      identities: [{ provider: 'google' }],
      user_metadata: {},
    }
    profielNaam = 'wiskundefan'

    const bestemming = await volgDeLink('code=abc&next=%2Fnl%2Foefenen')

    expect(bestemming).toBe(`${ORIGIN}/nl/oefenen`)
  })

  it('stuurt een gewoon account niet naar de naam-pagina', async () => {
    gebruiker = {
      id: 'mail-1',
      app_metadata: { provider: 'email' },
      identities: [{ provider: 'email' }],
      user_metadata: {},
    }

    const bestemming = await volgDeLink('code=abc&next=%2Fnl%2Foefenen')

    expect(bestemming).toBe(`${ORIGIN}/nl/oefenen`)
  })

  it('stuurt zonder code naar de inlogpagina met een foutmelding', async () => {
    const bestemming = await volgDeLink('next=%2Fnl%2Foefenen')

    expect(bestemming).toBe(`${ORIGIN}/nl/inloggen?error=auth_callback_failed`)
  })
})
