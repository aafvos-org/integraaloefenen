/**
 * De KaTeX-lettertypen staan in de stijl op `/static/media/…`, maar de
 * bestanden staan op `/_next/static/media/…`. Dat komt door `inlineCss`:
 * Next.js zet het voorvoegsel van de stijl dan op `/` in plaats van
 * `/_next/` (zie `build/webpack/config/blocks/css/loaders/client.js`), en
 * alle `url(...)` in een meegeleverde stijl — zoals die van KaTeX — raakt
 * daardoor de `_next` kwijt.
 *
 * De doorverwijzing in `next.config.ts` lost dat alleen op bij `next dev`.
 * Op Cloudflare serveert de Worker `/_next/static/…` niet zelf; dat doet de
 * bestandenbinding (`ASSETS`) vóór de Worker. Komt een verzoek daar niet
 * langs, dan belandt het bij de Next-server, en die kent die bestanden niet:
 * 404. Daarom halen we het bestand hier zelf uit die binding op.
 */

type Bestanden = {
  fetch(verzoek: Request): Promise<Response>
}

const VOORVOEGSEL = '/static/media/'

/**
 * Het echte adres van een lettertype, of `null` als dit geen verzoek om een
 * lettertype is. De bestanden staan los naast elkaar, dus een naam met een
 * schuine streep erin hoort er niet bij.
 */
export function lettertypeAdres(url: URL): URL | null {
  if (!url.pathname.startsWith(VOORVOEGSEL)) return null
  const naam = url.pathname.slice(VOORVOEGSEL.length)
  if (naam.length === 0 || naam.includes('/')) return null
  const echt = new URL(url)
  echt.pathname = `/_next/static/media/${naam}`
  return echt
}

/** De `ASSETS`-binding uit de omgeving van de Worker, als die er is. */
export function bestandenVan(env: unknown): Bestanden | undefined {
  if (!env || typeof env !== 'object') return undefined
  const binding = (env as { ASSETS?: unknown }).ASSETS
  if (!binding || typeof (binding as Bestanden).fetch !== 'function') return undefined
  return binding as Bestanden
}

export async function antwoordMetLettertype(
  request: Request,
  bestanden: Bestanden | undefined,
  verder: () => Promise<Response>,
): Promise<Response> {
  if (!bestanden) return verder()
  if (request.method !== 'GET' && request.method !== 'HEAD') return verder()

  const adres = lettertypeAdres(new URL(request.url))
  if (!adres) return verder()

  const antwoord = await bestanden.fetch(
    new Request(adres.toString(), { method: request.method, headers: request.headers }),
  )
  // Bestaat het bestand niet, dan laten we de app zelf antwoorden. Zo blijft
  // de nette 404-pagina staan in plaats van die van de bestandenbinding.
  if (antwoord.status === 404) return verder()
  return antwoord
}
