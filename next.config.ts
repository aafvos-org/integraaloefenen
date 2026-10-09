import path from 'node:path'

import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

import { MET_TAAL } from './src/i18n/paths'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

// Links zonder taal vooraan sturen we naar de Nederlandse versie.
// Stond eerst in vercel.json; Cloudflare leest dat bestand niet.
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
  // Fix: multiple package-lock.json files on this machine confuse Next.js
  // file tracing. Pin the root explicitly so Vercel builds work correctly.
  outputFileTracingRoot: path.resolve(__dirname),
  experimental: {
    serverActions: {
      // Video-verzoeken mogen foto's van een boekopgave meesturen. Standaard
      // is 1 MB, te weinig voor een telefoonfoto. De browser verkleint ze al
      // (zie lib/images/compress.ts); 4 MB is de marge, en blijft onder de
      // ~4,5 MB die Vercel per request toestaat.
      bodySizeLimit: '4mb',
    },
  },
}

export default withNextIntl(nextConfig)
