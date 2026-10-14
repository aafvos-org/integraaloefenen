import { nietGevondenDocument } from '@/lib/niet-gevonden-html'

// Verzonnen theorie-adressen komen hier via de middleware. Een gewone pagina
// zou 200 geven; notFound() zet geen echte kop in de HTML. Deze route doet
// beide: status 404 én de Nederlandse pagina.
export function GET() {
  return new Response(nietGevondenDocument(), {
    status: 404,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'private, no-store',
      'x-robots-tag': 'noindex',
    },
  })
}
