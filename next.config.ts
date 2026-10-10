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
      { source: `/:pad(${PADEN})/:rest*`, destination: '/nl/:pad/:rest*', permanent: false },
      // De site is alleen Nederlands. Oude Engelse links gaan permanent naar
      // dezelfde pagina onder /nl/. Dit hoort hier en niet in de middleware,
      // want deze doorverwijzing hoeft niet eerst Supabase te raadplegen.
      { source: '/en/:rest*', destination: '/nl/:rest*', permanent: true },
    ]
  },
  // Meerdere package-lock.json-bestanden op één machine brengen het bijhouden
  // van bestanden (file tracing) van Next.js in de war. Zet de hoofdmap daarom
  // expliciet vast, zodat een build altijd dezelfde bestanden meeneemt.
  outputFileTracingRoot: path.resolve(__dirname),
  experimental: {
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
