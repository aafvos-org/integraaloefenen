import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { generateJson } from './gemini'

// =====================================================================
// De echte Gemini-aanroep, zonder netwerk.
//
// fetch is hier een nepfunctie: er gaat niets de deur uit. Wat deze test
// vastlegt is de foutafhandeling. Elk pad moet een ok:false teruggeven en
// nooit een uitzondering gooien — de aanroeper (check-answer-new.ts) vangt
// alleen ok:false af en vervangt de tekst door een vaste Nederlandse zin.
// Vliegt er een uitzondering uit, dan ziet de leerling een rauwe melding.
// =====================================================================

const SLEUTEL = 'TEST-SLEUTEL-abc123'

let fetchSpy: ReturnType<typeof vi.spyOn>

/** Een gelukte HTTP-reactie met deze body. */
function reactie(body: unknown, init: { status?: number } = {}): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { 'content-type': 'application/json' },
  })
}

beforeEach(() => {
  vi.stubEnv('GEMINI_API_KEY', SLEUTEL)
  fetchSpy = vi.spyOn(globalThis, 'fetch')
})

afterEach(() => {
  fetchSpy.mockRestore()
  vi.unstubAllEnvs()
})

// =====================================================================
// Het gelukkige pad
// =====================================================================
describe('generateJson — het gaat goed', () => {
  it('geeft de JSON uit de response terug', async () => {
    const antwoord = { is_mathematically_correct: true, error_explanation: '' }
    fetchSpy.mockResolvedValue(
      reactie({
        candidates: [{ content: { parts: [{ text: JSON.stringify(antwoord) }] } }],
      }),
    )

    const resultaat = await generateJson<typeof antwoord>('Klopt 1/3x^3?')

    expect(resultaat).toEqual({
      ok: true,
      data: antwoord,
      raw: JSON.stringify(antwoord),
    })
  })

  it('vraagt JSON aan het ingestelde model en stuurt de prompt mee', async () => {
    fetchSpy.mockResolvedValue(
      reactie({ candidates: [{ content: { parts: [{ text: '{}' }] } }] }),
    )

    await generateJson('Reken 2*x na', { model: 'gemini-test', temperature: 0.1 })

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/gemini-test:generateContent')
    expect(url).toContain(`key=${SLEUTEL}`)
    expect(init.method).toBe('POST')

    const verstuurd = JSON.parse(init.body as string)
    expect(verstuurd.contents[0].parts[0].text).toBe('Reken 2*x na')
    expect(verstuurd.generationConfig).toEqual({
      temperature: 0.1,
      responseMimeType: 'application/json',
    })
  })
})

// =====================================================================
// De foutpaden
// =====================================================================
describe('generateJson — het gaat mis', () => {
  it('zonder GEMINI_API_KEY belt hij niemand', async () => {
    vi.stubEnv('GEMINI_API_KEY', '')

    const resultaat = await generateJson('Wat dan ook')

    expect(resultaat).toEqual({
      ok: false,
      error: 'GEMINI_API_KEY is niet geconfigureerd.',
    })
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('netwerkfout: geeft de melding van fetch terug', async () => {
    fetchSpy.mockRejectedValue(new Error('fetch failed'))

    const resultaat = await generateJson('Wat dan ook')

    expect(resultaat).toEqual({ ok: false, error: 'fetch failed' })
  })

  it('netwerkfout zonder Error-object: vaste Nederlandse tekst', async () => {
    fetchSpy.mockRejectedValue('zomaar een string')

    const resultaat = await generateJson('Wat dan ook')

    expect(resultaat).toEqual({ ok: false, error: 'Netwerkfout naar Gemini.' })
  })

  it('netwerkfout met de URL erin: de API-sleutel gaat eruit', async () => {
    // Cloudflare Workers zet de hele URL in de melding. Die URL bevat de
    // sleutel, en de aanroeper logt deze tekst.
    fetchSpy.mockRejectedValue(
      new Error(
        `Fetch API cannot load: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${SLEUTEL}`,
      ),
    )

    const resultaat = await generateJson('Wat dan ook')

    expect(resultaat.ok).toBe(false)
    expect(resultaat.ok === false && resultaat.error).not.toContain(SLEUTEL)
    expect(resultaat.ok === false && resultaat.error).toContain('***')
  })

  it('niet-OK status: statuscode en de tekst van Gemini', async () => {
    fetchSpy.mockResolvedValue(
      new Response('API key not valid', { status: 400, statusText: 'Bad Request' }),
    )

    const resultaat = await generateJson('Wat dan ook')

    expect(resultaat).toEqual({ ok: false, error: 'Gemini 400: API key not valid' })
  })

  it('niet-OK status zonder body: dan de statusText', async () => {
    fetchSpy.mockResolvedValue(
      new Response('', { status: 503, statusText: 'Service Unavailable' }),
    )

    const resultaat = await generateJson('Wat dan ook')

    expect(resultaat).toEqual({ ok: false, error: 'Gemini 503: Service Unavailable' })
  })

  it('niet-OK status met een enorme body: afgekapt op 400 tekens', async () => {
    fetchSpy.mockResolvedValue(
      new Response('x'.repeat(5000), { status: 500, statusText: 'Internal Server Error' }),
    )

    const resultaat = await generateJson('Wat dan ook')

    expect(resultaat.ok).toBe(false)
    expect(resultaat.ok === false && resultaat.error.length).toBe(400)
  })

  it('niet-OK status waarvan de body de sleutel bevat: die gaat eruit', async () => {
    fetchSpy.mockResolvedValue(
      new Response(`Bad request voor key=${SLEUTEL}`, { status: 400, statusText: 'Bad Request' }),
    )

    const resultaat = await generateJson('Wat dan ook')

    expect(resultaat.ok === false && resultaat.error).not.toContain(SLEUTEL)
  })

  it('geblokkeerde prompt: noemt de reden van Gemini', async () => {
    fetchSpy.mockResolvedValue(reactie({ promptFeedback: { blockReason: 'SAFETY' } }))

    const resultaat = await generateJson('Wat dan ook')

    expect(resultaat).toEqual({
      ok: false,
      error: 'Gemini blokkeerde de prompt (SAFETY).',
    })
  })

  it('lege response: geen candidates', async () => {
    fetchSpy.mockResolvedValue(reactie({ candidates: [] }))

    const resultaat = await generateJson('Wat dan ook')

    expect(resultaat).toEqual({ ok: false, error: 'Lege response van Gemini.' })
  })

  it('lege response: een candidate zonder tekst', async () => {
    fetchSpy.mockResolvedValue(
      reactie({ candidates: [{ content: { parts: [{ text: '' }] } }] }),
    )

    const resultaat = await generateJson('Wat dan ook')

    expect(resultaat).toEqual({ ok: false, error: 'Lege response van Gemini.' })
  })

  it('ongeldige JSON in de tekst: bewaart de rauwe tekst', async () => {
    fetchSpy.mockResolvedValue(
      reactie({ candidates: [{ content: { parts: [{ text: 'dit is geen JSON' }] } }] }),
    )

    const resultaat = await generateJson('Wat dan ook')

    expect(resultaat).toEqual({
      ok: false,
      error: 'Gemini gaf geen geldige JSON terug.',
      raw: 'dit is geen JSON',
    })
  })

  it('een 200 die geen JSON is: ok:false in plaats van een uitzondering', async () => {
    // Een foutpagina van een tussenliggende server. Zou dit gooien, dan komt
    // de uitzondering ongefilterd bij de leerling terecht.
    fetchSpy.mockResolvedValue(
      new Response('<html>502 Bad Gateway</html>', {
        status: 200,
        headers: { 'content-type': 'text/html' },
      }),
    )

    const resultaat = await generateJson('Wat dan ook')

    expect(resultaat).toEqual({ ok: false, error: 'Gemini gaf geen geldige JSON terug.' })
  })
})
