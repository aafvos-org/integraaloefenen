import { NextResponse, type NextRequest } from 'next/server'

import { routing } from '@/i18n/routing'
import { updateSession } from '@/lib/supabase/middleware'

// Deze pagina's hangen niet onder een taal in de URL. Een oude link als
// /nl/admin sturen we door naar /admin, anders krijgt de bezoeker een 404.
const ZONDER_TAAL = ['admin', 'api', 'auth', 'uitloggen']

const MET_TAAL_ERVOOR = new RegExp(
  `^/(?:${routing.locales.join('|')})/(${ZONDER_TAAL.join('|')})(/.*)?$`,
)

export async function middleware(request: NextRequest) {
  const metTaalErvoor = request.nextUrl.pathname.match(MET_TAAL_ERVOOR)
  if (metTaalErvoor) {
    const url = request.nextUrl.clone()
    url.pathname = `/${metTaalErvoor[1]}${metTaalErvoor[2] ?? ''}`
    return NextResponse.redirect(url)
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml, images, fonts
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)',
  ],
}
