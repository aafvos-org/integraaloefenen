import { describe, expect, it } from 'vitest'

import {
  antwoordMetStartpaginaCache,
  magAntwoordBewaren,
  magStartpaginaUitCache,
  startpaginaCachesleutel,
} from './startpagina-cache'

function verzoek(pad: string, extra: Record<string, string> = {}) {
  return new Request(`https://www.integraaloefenen.nl${pad}`, { headers: extra })
}

function htmlAntwoord(tekst = '<p>start</p>', extra: Record<string, string> = {}) {
  return new Response(tekst, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 's-maxage=31536000',
      ...extra,
    },
  })
}

function nepcache() {
  const bak = new Map<string, Response>()
  return {
    bak,
    async match(verzoek: Request) {
      const gevonden = bak.get(verzoek.url)
      return gevonden ? gevonden.clone() : undefined
    },
    async put(verzoek: Request, antwoord: Response) {
      bak.set(verzoek.url, antwoord)
    },
  }
}

describe('magStartpaginaUitCache', () => {
  it('laat de openbare startpagina toe', () => {
    expect(magStartpaginaUitCache(verzoek('/nl'))).toBe(true)
    expect(magStartpaginaUitCache(verzoek('/'))).toBe(true)
    expect(magStartpaginaUitCache(verzoek('/nl/'))).toBe(true)
    expect(magStartpaginaUitCache(verzoek('/nl?van=voorbeeld'))).toBe(true)
  })

  it('slaat een ingelogde leerling, een andere pagina en een app-navigatie over', () => {
    expect(
      magStartpaginaUitCache(
        verzoek('/nl', { cookie: 'sb-project-auth-token=geheim' }),
      ),
    ).toBe(false)
    expect(
      magStartpaginaUitCache(
        verzoek('/nl', { cookie: 'sb-project-auth-token.0=geheim' }),
      ),
    ).toBe(false)
    expect(magStartpaginaUitCache(verzoek('/nl/theorie'))).toBe(false)
    expect(magStartpaginaUitCache(verzoek('/nl?van=tiktok'))).toBe(false)
    expect(magStartpaginaUitCache(verzoek('/nl?x=1'))).toBe(false)
    expect(magStartpaginaUitCache(verzoek('/nl', { rsc: '1' }))).toBe(false)
    expect(
      magStartpaginaUitCache(verzoek('/nl', { 'next-router-prefetch': '1' })),
    ).toBe(false)
  })
})

describe('magAntwoordBewaren', () => {
  it('bewaart alleen openbare html', () => {
    expect(magAntwoordBewaren(htmlAntwoord())).toBe(true)
    expect(magAntwoordBewaren(new Response('weg', { status: 302 }))).toBe(false)
    expect(
      magAntwoordBewaren(htmlAntwoord('<p>x</p>', { 'set-cookie': 'a=b' })),
    ).toBe(false)
    expect(
      magAntwoordBewaren(
        htmlAntwoord('<p>x</p>', { 'cache-control': 'private, no-store' }),
      ),
    ).toBe(false)
  })
})

describe('antwoordMetStartpaginaCache', () => {
  it('bewaart het eerste antwoord en geeft daarna de kopie', async () => {
    const cache = nepcache()
    let gebouwd = 0
    const verder = async () => {
      gebouwd += 1
      return htmlAntwoord('<p>start</p>')
    }

    const eerste = await antwoordMetStartpaginaCache(
      verzoek('/nl'),
      'bouw-1',
      cache,
      verder,
    )
    expect(await eerste.text()).toBe('<p>start</p>')
    expect(gebouwd).toBe(1)
    expect(cache.bak.size).toBe(1)

    const tweede = await antwoordMetStartpaginaCache(
      verzoek('/?van=youtube'),
      'bouw-1',
      cache,
      verder,
    )
    expect(tweede.headers.get('x-startpagina-cache')).toBe('HIT')
    expect(await tweede.text()).toBe('<p>start</p>')
    expect(gebouwd).toBe(1)
  })

  it('roept de site aan voor een ingelogde leerling en bij een nieuwe livegang', async () => {
    const cache = nepcache()
    let gebouwd = 0
    const verder = async () => {
      gebouwd += 1
      return htmlAntwoord(`<p>${gebouwd}</p>`)
    }

    await antwoordMetStartpaginaCache(
      verzoek('/nl', { cookie: 'sb-project-auth-token=geheim' }),
      'bouw-1',
      cache,
      verder,
    )
    expect(cache.bak.size).toBe(0)

    await antwoordMetStartpaginaCache(verzoek('/nl'), 'bouw-1', cache, verder)
    await antwoordMetStartpaginaCache(verzoek('/nl'), 'bouw-2', cache, verder)
    expect(gebouwd).toBe(3)
    expect(startpaginaCachesleutel('bouw-1').url).not.toBe(
      startpaginaCachesleutel('bouw-2').url,
    )
  })

  it('geeft de pagina toch als het bewaren meteen mislukt', async () => {
    const cache = {
      async match() {
        return undefined
      },
      put() {
        throw new Error('Illegal invocation')
      },
    }
    const antwoord = await antwoordMetStartpaginaCache(
      verzoek('/nl'),
      'bouw-1',
      cache,
      async () => htmlAntwoord('<p>start</p>'),
    )
    expect(antwoord.status).toBe(200)
    expect(await antwoord.text()).toBe('<p>start</p>')
  })
})
