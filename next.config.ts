import path from 'node:path'

import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

// Pagina's zonder taal in de URL sturen we naar de Nederlandse versie.
// Stond eerst in vercel.json; Cloudflare leest dat bestand niet.
const ZONDER_TAAL =
  'dashboard|leerpad|oefenen|theorie|onboarding|inloggen|registreren|wachtwoord-vergeten|wachtwoord-opnieuw'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: `/:pad(${ZONDER_TAAL})/:rest*`, destination: '/nl/:pad/:rest*', permanent: false },
      // De site is alleen Nederlands. Oude Engelse links gaan permanent naar
      // dezelfde pagina onder /nl/. Dit hoort hier en niet in de middleware:
      // van de twee middleware-bestanden draait alleen src/middleware.ts.
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
