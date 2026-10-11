import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  mailGaatNaarDePostbus,
  splitsAfzender,
  verstuurMail,
} from './versturen'

/**
 * De schakelaar en de weg naar de testpostbus. De inhoud van de mails staat
 * elders (`welkom.test.ts`); hier gaat het alleen om de vraag: waar gaat hij
 * heen, en wat gebeurt er als dat misgaat?
 */

/** Doet alsof er een server antwoordt, en onthoudt wat er heen ging. */
function nepFetch(antwoord: Response) {
  const nep = vi.fn<(url: string, opties?: RequestInit) => Promise<Response>>(
    async () => antwoord.clone(),
  )
  vi.stubGlobal('fetch', nep)
  return nep
}

/** Het JSON-pakketje dat bij de zoveelste aanroep de deur uit ging. */
function verstuurdePakket(
  nep: ReturnType<typeof nepFetch>,
  nummer = 0,
): unknown {
  return JSON.parse(String(nep.mock.calls[nummer]?.[1]?.body))
}

const MAIL = {
  van: 'IntegraalOefenen <no-reply@integraaloefenen.nl>',
  aan: 'leerling@test.local',
  onderwerp: 'Welkom bij IntegraalOefenen!',
  html: '<p>Je account is klaar.</p>',
  tekst: 'Je account is klaar.',
}

beforeEach(() => {
  vi.stubEnv('RESEND_API_KEY', 're_nep_sleutel')
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

// =====================================================================
// De schakelaar: wanneer gaat de mail naar de testpostbus?
// =====================================================================
describe('mailGaatNaarDePostbus', () => {
  it('staat uit zonder MAIL_MODE', () => {
    vi.stubEnv('MAIL_MODE', undefined)
    vi.stubEnv('NODE_ENV', 'test')
    expect(mailGaatNaarDePostbus()).toBe(false)
  })

  it('staat uit bij een andere waarde dan postbus', () => {
    vi.stubEnv('MAIL_MODE', 'resend')
    vi.stubEnv('NODE_ENV', 'test')
    expect(mailGaatNaarDePostbus()).toBe(false)
  })

  it('staat aan met MAIL_MODE=postbus buiten productie', () => {
    vi.stubEnv('MAIL_MODE', 'postbus')
    vi.stubEnv('NODE_ENV', 'test')
    expect(mailGaatNaarDePostbus()).toBe(true)

    vi.stubEnv('NODE_ENV', 'development')
    expect(mailGaatNaarDePostbus()).toBe(true)
  })

  it('staat NOOIT aan in productie, ook niet met MAIL_MODE=postbus', () => {
    vi.stubEnv('MAIL_MODE', 'postbus')
    vi.stubEnv('NODE_ENV', 'production')
    expect(mailGaatNaarDePostbus()).toBe(false)
  })

  it('stuurt in productie echte mail, ook met MAIL_MODE=postbus', async () => {
    vi.stubEnv('MAIL_MODE', 'postbus')
    vi.stubEnv('NODE_ENV', 'production')
    const nep = nepFetch(Response.json({ id: 'nep' }))

    await verstuurMail(MAIL)

    const adres = String(nep.mock.calls[0]?.[0])
    expect(adres).not.toContain('54324')
    expect(adres).toContain('resend.com')
  })
})

// =====================================================================
// De afzender uit elkaar halen
// =====================================================================
describe('splitsAfzender', () => {
  it('haalt naam en adres uit "Naam <adres>"', () => {
    expect(splitsAfzender('IntegraalOefenen <no-reply@integraaloefenen.nl>')).toEqual({
      naam: 'IntegraalOefenen',
      adres: 'no-reply@integraaloefenen.nl',
    })
  })

  it('laat de naam leeg bij een kaal adres', () => {
    expect(splitsAfzender('no-reply@integraaloefenen.nl')).toEqual({
      naam: '',
      adres: 'no-reply@integraaloefenen.nl',
    })
  })

  it('haalt de aanhalingstekens om de naam weg', () => {
    expect(splitsAfzender('"Aaf Vos" <aaf@test.local>').naam).toBe('Aaf Vos')
  })
})

// =====================================================================
// De weg naar de testpostbus
// =====================================================================
describe('verstuurMail naar de testpostbus', () => {
  beforeEach(() => {
    vi.stubEnv('MAIL_MODE', 'postbus')
    vi.stubEnv('NODE_ENV', 'test')
  })

  it('levert de mail af bij Mailpit, met afzender, ontvanger en inhoud', async () => {
    const nep = nepFetch(Response.json({ ID: 'abc' }))

    expect(await verstuurMail(MAIL)).toEqual({ gelukt: true })

    expect(nep.mock.calls[0]?.[0]).toBe('http://127.0.0.1:54324/api/v1/send')
    expect(verstuurdePakket(nep)).toMatchObject({
      From: { Email: 'no-reply@integraaloefenen.nl', Name: 'IntegraalOefenen' },
      To: [{ Email: 'leerling@test.local' }],
      Subject: 'Welkom bij IntegraalOefenen!',
      HTML: '<p>Je account is klaar.</p>',
      Text: 'Je account is klaar.',
    })
  })

  it('stuurt een bijlage mee met zijn contentId, zodat de foto in de mail staat', async () => {
    const nep = nepFetch(Response.json({ ID: 'abc' }))

    await verstuurMail({
      ...MAIL,
      antwoordNaar: 'leerling@test.local',
      bijlagen: [
        {
          filename: 'foto-1.jpg',
          content: 'aGFsbG8=',
          contentType: 'image/jpeg',
          contentId: 'foto-1',
        },
      ],
    })

    expect(verstuurdePakket(nep)).toMatchObject({
      ReplyTo: [{ Email: 'leerling@test.local' }],
      Attachments: [
        {
          Filename: 'foto-1.jpg',
          Content: 'aGFsbG8=',
          ContentType: 'image/jpeg',
          ContentID: 'foto-1',
        },
      ],
    })
  })

  it('zegt het als de postbus niet draait, in plaats van te klappen', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('connect ECONNREFUSED')
      }),
    )

    const uitkomst = await verstuurMail(MAIL)
    expect(uitkomst.gelukt).toBe(false)
    expect(String((uitkomst as { fout: unknown }).fout)).toContain('testpostbus')
  })

  it('zegt het als de postbus de mail weigert', async () => {
    nepFetch(new Response('ongeldig adres', { status: 400 }))

    const uitkomst = await verstuurMail(MAIL)
    expect(uitkomst.gelukt).toBe(false)
    expect(String((uitkomst as { fout: unknown }).fout)).toContain('400')
  })
})

// =====================================================================
// Zonder ontvanger
// =====================================================================
describe('verstuurMail zonder ontvanger', () => {
  it('verstuurt niets en zegt waarom', async () => {
    // NOTIFY_EMAIL die niet gezet is leverde vroeger een verzending naar
    // "undefined" op; die kwam stil in de logs terecht.
    vi.stubEnv('MAIL_MODE', 'postbus')
    vi.stubEnv('NODE_ENV', 'test')
    const nep = nepFetch(Response.json({ ID: 'abc' }))

    const uitkomst = await verstuurMail({ ...MAIL, aan: '' })

    expect(uitkomst.gelukt).toBe(false)
    expect(nep).not.toHaveBeenCalled()
  })
})
