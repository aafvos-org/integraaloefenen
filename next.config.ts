import path from 'node:path'

import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

import { MET_TAAL } from './src/i18n/paths'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

// Links zonder taal vooraan sturen we naar de Nederlandse versie.
const PADEN = MET_TAAL.join('|')

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // De site is alleen Nederlands. Oude Engelse links gaan permanent naar
      // dezelfde pagina onder /nl/. Dit hoort hier en niet in de middleware,
      // want deze doorverwijzing hoeft niet eerst Supabase te raadplegen.
      // Zonder stuk erachter mag :rest* niet letterlijk in het adres blijven
      // staan (/nl/:rest* bestaat niet). Die twee adressen gaan daarom rechtstreeks.
      { source: '/en', destination: '/nl', permanent: true },
      { source: '/en/', destination: '/nl', permanent: true },
      // Een langer Engels adres, bijvoorbeeld /en/theorie/primitieve.
      { source: '/en/:rest+', destination: '/nl/:rest+', permanent: true },
    ]
  },
  // /theorie en / blijven in de adresbalk staan, maar tonen /nl/…. Een
  // doorverwijzing kostte op de telefoon ongeveer een seconde extra, op elke
  // pagina die nog zonder /nl/ werd geopend. De middleware draait vóór deze
  // rewrite en houdt de inlogpoort dus zelf in de gaten.
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/', destination: '/nl' },
        { source: `/:pad(${PADEN})/:rest*`, destination: '/nl/:pad/:rest*' },
        // De stijl staat in de pagina zelf (inlineCss). Next.js zet de
        // lettertype-adressen dan op /static/media, terwijl de bestanden op
        // /_next/static/media staan. Zonder deze regel laden de formules
        // hun lettertype niet.
        //
        // Let op: deze regel helpt alleen bij `next dev` en `next start`,
        // want daar serveert de Next-server /_next/static zelf. Op Cloudflare
        // doet de bestandenbinding dat, nog vóór de Worker, en komt de
        // Next-server nooit bij het bestand. Daar lost src/worker/lettertypen.ts
        // het op.
        { source: '/static/media/:path*', destination: '/_next/static/media/:path*' },
      ],
    }
  },
  // Meerdere package-lock.json-bestanden op één machine brengen het bijhouden
  // van bestanden (file tracing) van Next.js in de war. Zet de hoofdmap daarom
  // expliciet vast, zodat een build altijd dezelfde bestanden meeneemt.
  outputFileTracingRoot: path.resolve(__dirname),
  experimental: {
    // De stijl staat in de pagina zelf, zodat de telefoon niet eerst een
    // tweede bestand hoeft op te halen voordat er iets verschijnt.
    inlineCss: true,
    serverActions: {
      // Video-verzoeken mogen foto's van een boekopgave meesturen. Standaard
      // is 1 MB, te weinig voor een telefoonfoto. De browser verkleint ze al
      // (zie lib/images/compress.ts); 4 MB is de marge.
      //
      // Let op: die 4 MB komt nog uit de tijd dat de site op Vercel draaide,
      // dat per request rond 4,5 MB afkapte. Voor Cloudflare Workers is de
      // grens niet opnieuw nagekeken; hij is nu dus mogelijk strenger dan nodig.
      bodySizeLimit: '4mb',
    },
  },
}

export default withNextIntl(nextConfig)
