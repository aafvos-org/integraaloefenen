/**
 * Eigen Worker-ingang rond de OpenNext-worker (zie wrangler.jsonc "main").
 *
 * Doet één ding vóór de app: het kale domein integraaloefenen.nl doorsturen
 * naar www. Dat deed eerst Vercel. In middleware.ts kan het niet: die draait
 * op de Worker niet mee.
 */

// .open-next/worker.js ontstaat pas bij `opennextjs-cloudflare build`.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { default as handler } from './.open-next/worker.js'

const KAAL_DOMEIN = 'integraaloefenen.nl'
const WWW_DOMEIN = 'www.integraaloefenen.nl'

const worker = {
  fetch(request: Request, env: unknown, ctx: unknown): Promise<Response> | Response {
    const url = new URL(request.url)
    if (url.hostname === KAAL_DOMEIN) {
      url.protocol = 'https:'
      url.hostname = WWW_DOMEIN
      return Response.redirect(url.toString(), 308)
    }
    return handler.fetch(request, env, ctx)
  },
}

export default worker

// Durable Objects van OpenNext moeten vanuit de ingang geëxporteerd blijven.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from './.open-next/worker.js'
