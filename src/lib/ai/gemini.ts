/**
 * Minimal client voor de Google Gemini REST API.
 *
 * Gebruikt geen SDK zodat we geen grote dependency nodig hebben en de
 * endpoint-URL expliciet in view blijft.
 *
 * Docs: https://ai.google.dev/api/generate-content
 */

const DEFAULT_MODEL = 'gemini-2.5-flash'
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

export type GeminiJsonResponse<T> =
  | { ok: true; data: T; raw: string }
  | { ok: false; error: string; raw?: string }

/**
 * Haal de API-sleutel uit een foutmelding.
 *
 * De sleutel staat in de URL. Op Cloudflare Workers zet fetch die URL soms in
 * de melding ("Fetch API cannot load: ..."), en de aanroeper logt die tekst.
 * Zo komt hij niet in het log terecht.
 */
function zonderSleutel(tekst: string, apiKey: string): string {
  return apiKey ? tekst.split(apiKey).join('***') : tekst
}

/**
 * Roep Gemini aan en forceer een JSON-response.
 * T is de verwachte shape van de JSON.
 */
export async function generateJson<T>(
  prompt: string,
  options: {
    model?: string
    temperature?: number
    signal?: AbortSignal
  } = {},
): Promise<GeminiJsonResponse<T>> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return { ok: false, error: 'GEMINI_API_KEY is niet geconfigureerd.' }
  }

  const model = options.model ?? DEFAULT_MODEL
  const url = `${BASE_URL}/${model}:generateContent?key=${apiKey}`

  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal: options.signal,
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: options.temperature ?? 0.4,
          responseMimeType: 'application/json',
        },
      }),
    })
  } catch (err) {
    return {
      ok: false,
      error: zonderSleutel(
        err instanceof Error ? err.message : 'Netwerkfout naar Gemini.',
        apiKey,
      ),
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    return {
      ok: false,
      error: zonderSleutel(
        `Gemini ${res.status}: ${text || res.statusText}`,
        apiKey,
      ).slice(0, 400),
    }
  }

  type GeminiResp = {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> }
      finishReason?: string
    }>
    promptFeedback?: { blockReason?: string }
  }
  // Een 200 met een niet-JSON body (een foutpagina van een tussenliggende
  // server) mag hier niet als uitzondering naar buiten vliegen: de aanroeper
  // vangt alleen ok:false af, en een uitzondering komt bij de leerling terecht.
  let json: GeminiResp
  try {
    json = (await res.json()) as GeminiResp
  } catch {
    return { ok: false, error: 'Gemini gaf geen geldige JSON terug.' }
  }

  if (json.promptFeedback?.blockReason) {
    return {
      ok: false,
      error: `Gemini blokkeerde de prompt (${json.promptFeedback.blockReason}).`,
    }
  }

  const text = json.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    return { ok: false, error: 'Lege response van Gemini.' }
  }

  try {
    const data = JSON.parse(text) as T
    return { ok: true, data, raw: text }
  } catch {
    return { ok: false, error: 'Gemini gaf geen geldige JSON terug.', raw: text }
  }
}
