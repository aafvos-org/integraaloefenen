import { describe, expect, it } from 'vitest'

import { antwoordMetLettertype, bestandenVan, lettertypeAdres } from './lettertypen'

function verzoek(pad: string, init: RequestInit = {}) {
  return new Request(`https://www.integraaloefenen.nl${pad}`, init)
}

/** Doet alsof `/_next/static/media/KaTeX_Main-Regular.0462f03b.woff2` bestaat. */
function nepbestanden() {
  const gevraagd: string[] = []
  return {
    gevraagd,
    async fetch(v: Request) {
      gevraagd.push(new URL(v.url).pathname)
      if (new URL(v.url).pathname === '/_next/static/media/KaTeX_Main-Regular.0462f03b.woff2') {
        return new Response('woff2-bytes', {
          status: 200,
          headers: { 'content-type': 'font/woff2' },
        })
      }
      return new Response('niet gevonden', { status: 404 })
    },
  }
}

const appAntwoord = () => Promise.resolve(new Response('de app', { status: 200 }))

describe('lettertypeAdres', () => {
  it('zet /static/media voor /_next/static/media', () => {
    const adres = lettertypeAdres(new URL('https://x.nl/static/media/KaTeX_AMS-Regular.a79f1c31.woff2'))
    expect(adres?.pathname).toBe('/_next/static/media/KaTeX_AMS-Regular.a79f1c31.woff2')
  })

  it('laat andere adressen met rust', () => {
    expect(lettertypeAdres(new URL('https://x.nl/theorie'))).toBeNull()
    expect(lettertypeAdres(new URL('https://x.nl/_next/static/media/a.woff2'))).toBeNull()
    expect(lettertypeAdres(new URL('https://x.nl/static/media/'))).toBeNull()
  })

  it('weigert een naam met een map erin', () => {
    expect(lettertypeAdres(new URL('https://x.nl/static/media/stiekem/a.woff2'))).toBeNull()
    // De URL rekent ../ zelf weg, dus dit komt buiten /static/media uit.
    expect(lettertypeAdres(new URL('https://x.nl/static/media/../../etc/wachtwoord'))).toBeNull()
  })
})

describe('bestandenVan', () => {
  it('vindt de ASSETS-binding', () => {
    const binding = { fetch: async () => new Response('ok') }
    expect(bestandenVan({ ASSETS: binding })).toBe(binding)
  })

  it('geeft niets terug zonder bruikbare binding', () => {
    expect(bestandenVan(undefined)).toBeUndefined()
    expect(bestandenVan({})).toBeUndefined()
    expect(bestandenVan({ ASSETS: 'geen binding' })).toBeUndefined()
  })
})

describe('antwoordMetLettertype', () => {
  it('haalt het lettertype uit de bestanden', async () => {
    const bestanden = nepbestanden()
    const antwoord = await antwoordMetLettertype(
      verzoek('/static/media/KaTeX_Main-Regular.0462f03b.woff2'),
      bestanden,
      appAntwoord,
    )

    expect(antwoord.status).toBe(200)
    expect(antwoord.headers.get('content-type')).toBe('font/woff2')
    expect(await antwoord.text()).toBe('woff2-bytes')
    expect(bestanden.gevraagd).toEqual(['/_next/static/media/KaTeX_Main-Regular.0462f03b.woff2'])
  })

  it('laat een gewone pagina door naar de app', async () => {
    const bestanden = nepbestanden()
    const antwoord = await antwoordMetLettertype(verzoek('/theorie'), bestanden, appAntwoord)

    expect(await antwoord.text()).toBe('de app')
    expect(bestanden.gevraagd).toEqual([])
  })

  it('laat de app antwoorden als het bestand niet bestaat', async () => {
    const antwoord = await antwoordMetLettertype(
      verzoek('/static/media/bestaat-niet.woff2'),
      nepbestanden(),
      appAntwoord,
    )

    expect(await antwoord.text()).toBe('de app')
  })

  it('bemoeit zich niet met een POST', async () => {
    const bestanden = nepbestanden()
    const antwoord = await antwoordMetLettertype(
      verzoek('/static/media/KaTeX_Main-Regular.0462f03b.woff2', { method: 'POST' }),
      bestanden,
      appAntwoord,
    )

    expect(await antwoord.text()).toBe('de app')
    expect(bestanden.gevraagd).toEqual([])
  })

  it('laat alles door als er geen bestandenbinding is', async () => {
    const antwoord = await antwoordMetLettertype(
      verzoek('/static/media/KaTeX_Main-Regular.0462f03b.woff2'),
      undefined,
      appAntwoord,
    )

    expect(await antwoord.text()).toBe('de app')
  })
})
