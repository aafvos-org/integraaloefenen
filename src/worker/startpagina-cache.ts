import { leesBron } from '../lib/bron'
import { heeftInlogsessie } from '../lib/supabase/sessie-cookie'

/**
 * De startpagina staat al klaar bij de build, maar de worker leest dat
 * bestand bij élk bezoek opnieuw in. Op een koude worker kost dat ongeveer
 * een halve seconde, nog vóór de eerste byte. De randcache van Cloudflare
 * bewaart het antwoord per livegang, zodat het volgende bezoek die stap
 * overslaat.
 *
 * Een ingelogde leerling hoort hier niet: de middleware stuurt die naar het
 * dashboard. Die controle blijft daarom vóór de cache.
 */

type Paginacache = {
  match(verzoek: Request): Promise<Response | undefined>
  put(verzoek: Request, antwoord: Response): Promise<void>
}

function cookiesUitKop(cookieKop: string | null): { name: string }[] {
  if (!cookieKop) return []
  return cookieKop.split(';').map((deel) => ({
    name: deel.split('=')[0]?.trim() ?? '',
  }))
}

/** `/`, `/nl` en `/nl/` zijn dezelfde startpagina. */
export function isStartpaginaPad(pathname: string): boolean {
  return pathname === '/' || pathname === '/nl' || pathname === '/nl/'
}

/**
 * Alleen een leeg adres of `?van=` met een bekend woord deelt de cache.
 * De HTML is daar hetzelfde. Een ander zoekwoord gaat langs de cache, zodat
 * een vreemd adres het bewaarde antwoord niet kan overschrijven.
 */
export function zoekwoordenDelenDeCache(url: URL): boolean {
  const sleutels = [...url.searchParams.keys()]
  if (sleutels.length === 0) return true
  if (sleutels.length !== 1 || sleutels[0] !== 'van') return false
  return leesBron(url.searchParams.get('van')) !== null
}

/** Een gewoon documentverzoek van iemand die niet is ingelogd. */
export function magStartpaginaUitCache(request: Request): boolean {
  if (request.method !== 'GET') return false
  const url = new URL(request.url)
  if (!isStartpaginaPad(url.pathname)) return false
  if (!zoekwoordenDelenDeCache(url)) return false
  if (heeftInlogsessie(cookiesUitKop(request.headers.get('cookie')))) return false
  // Een navigatie in de app vraagt geen HTML. Die mag de bewaarde pagina niet raken.
  if (request.headers.get('rsc') === '1') return false
  if (request.headers.get('next-router-prefetch')) return false
  if (request.headers.get('next-router-segment-prefetch')) return false
  if (request.headers.get('next-router-state-tree')) return false
  return true
}

/**
 * Zelfde sleutel voor `/` en `/nl`, en een nieuwe sleutel bij elke livegang.
 * Het pad hoort niet bij de site; het is alleen de sleutel in de randcache.
 */
export function startpaginaCachesleutel(versie: string): Request {
  return new Request(
    `https://startpagina-cache.intern/volledig?bouw=${encodeURIComponent(versie)}`,
  )
}

export function magAntwoordBewaren(antwoord: Response): boolean {
  if (antwoord.status !== 200) return false
  if (antwoord.headers.has('set-cookie')) return false
  const controle = (antwoord.headers.get('cache-control') ?? '').toLowerCase()
  if (controle.includes('private') || controle.includes('no-store')) return false
  const type = antwoord.headers.get('content-type') ?? ''
  return type.includes('text/html')
}

/** Kopie voor de randcache. De versie zit in de sleutel, niet in een korte houdbaarheid. */
export function antwoordVoorCache(bytes: ArrayBuffer, antwoord: Response): Response {
  const headers = new Headers(antwoord.headers)
  headers.delete('set-cookie')
  headers.delete('vary')
  headers.delete('content-encoding')
  headers.set('content-length', String(bytes.byteLength))
  headers.set('cache-control', 'public, s-maxage=31536000')
  return new Response(bytes, {
    status: antwoord.status,
    statusText: antwoord.statusText,
    headers,
  })
}

export async function antwoordMetStartpaginaCache(
  request: Request,
  versie: string | undefined,
  cache: Paginacache,
  verder: () => Promise<Response>,
): Promise<Response> {
  if (!versie || !magStartpaginaUitCache(request)) {
    return verder()
  }

  const sleutel = startpaginaCachesleutel(versie)
  const geraakt = await cache.match(sleutel)
  if (geraakt) {
    const headers = new Headers(geraakt.headers)
    headers.set('x-startpagina-cache', 'HIT')
    return new Response(geraakt.body, {
      status: geraakt.status,
      statusText: geraakt.statusText,
      headers,
    })
  }

  const antwoord = await verder()
  if (!magAntwoordBewaren(antwoord)) return antwoord

  // Eerst de bytes pakken, zodat de bezoeker en de cache allebei de hele
  // pagina krijgen. Een gedeelde stroom liet de cache leeg achter.
  const bytes = await antwoord.arrayBuffer()
  try {
    // Afwachten, anders slaat de cache een leeg lijf op zodra het verzoek
    // afloopt voordat het schrijven klaar is.
    await cache.put(sleutel, antwoordVoorCache(bytes.slice(0), antwoord))
  } catch {
    // Bewaren is mislukt. De pagina hieronder gaat wel de deur uit.
  }
  return new Response(bytes, {
    status: antwoord.status,
    statusText: antwoord.statusText,
    headers: antwoord.headers,
  })
}
