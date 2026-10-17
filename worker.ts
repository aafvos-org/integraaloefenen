/**
 * Eigen Worker-ingang rond de OpenNext-worker (zie wrangler.jsonc "main").
 *
 * Drie dingen vóór de app. Het kale domein integraaloefenen.nl gaat naar www
 * (dat deed eerst Vercel; in middleware.ts kan het niet, die draait op de
 * Worker niet mee). De lettertypen van de formules worden op hun echte plek
 * opgehaald (zie src/worker/lettertypen.ts). En de openbare startpagina komt
 * uit de randcache als die er al staat, zodat een koud bezoek niet telkens
 * het hele bestand opnieuw inleest.
 */

// .open-next/worker.js ontstaat pas bij `opennextjs-cloudflare build`.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { default as handler } from './.open-next/worker.js'

import { antwoordMetLettertype, bestandenVan } from './src/worker/lettertypen'
import { antwoordMetStartpaginaCache } from './src/worker/startpagina-cache'

const KAAL_DOMEIN = 'integraaloefenen.nl'
const WWW_DOMEIN = 'www.integraaloefenen.nl'

function versieVan(env: unknown): string | undefined {
  if (!env || typeof env !== 'object') return undefined
  const meta = (env as { CF_VERSION_METADATA?: { id?: unknown } }).CF_VERSION_METADATA
  return typeof meta?.id === 'string' && meta.id.length > 0 ? meta.id : undefined
}

const worker = {
  async fetch(request: Request, env: unknown, ctx: unknown): Promise<Response> {
    const url = new URL(request.url)
    if (url.hostname === KAAL_DOMEIN) {
      url.protocol = 'https:'
      url.hostname = WWW_DOMEIN
      return Response.redirect(url.toString(), 308)
    }

    // `caches.default` is een getter. De methode moet in dezelfde aanroep
    // blijven, anders gooit workerd 'Illegal invocation'.
    const randcache = caches as unknown as { default: Cache }
    const cache = {
      match(verzoek: Request) {
        return randcache.default.match(verzoek)
      },
      put(verzoek: Request, antwoord: Response) {
        return randcache.default.put(verzoek, antwoord)
      },
    }

    return antwoordMetLettertype(request, bestandenVan(env), () =>
      antwoordMetStartpaginaCache(request, versieVan(env), cache, () =>
        Promise.resolve(handler.fetch(request, env, ctx)),
      ),
    )
  },
}

export default worker

// Durable Objects van OpenNext moeten vanuit de ingang geëxporteerd blijven.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from './.open-next/worker.js'
