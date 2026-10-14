import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { ACHTER_INLOG } from '@/i18n/paths'
import { routing } from '@/i18n/routing'
import { leesBron } from '@/lib/bron'

import { heeftInlogsessie } from './sessie-cookie'
import type { Database } from './types'

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname

  // WhatsApp haalt het plaatje op zonder inlogsessie. De oefenpagina zelf blijft dicht.
  if (path.includes('/opengraph-image')) return verderMetBron(request)

  // Geen sessiecookie: Supabase niet bellen. Die ronde hield elke openbare
  // pagina een seconde tegen, ook voor wie alleen komt lezen.
  if (!heeftInlogsessie(request.cookies.getAll())) {
    const taal = taalVanBeschermdPad(path)
    if (taal) return naarInloggen(request, taal)
    return verderMetBron(request)
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const { data: userData, error: userError } = await supabase.auth.getUser()
  const user = userData.user

  // Stale or revoked refresh token (e.g. user was deleted). Clear all Supabase
  // auth cookies so the next request starts fresh — otherwise every request
  // logs an Invalid Refresh Token error.
  if (userError?.code === 'refresh_token_not_found' && !user) {
    for (const cookie of request.cookies.getAll()) {
      if (cookie.name.startsWith('sb-')) {
        supabaseResponse.cookies.delete(cookie.name)
      }
    }
  }

  if (path.startsWith('/admin')) {
    if (!user) {
      return naarInloggen(request, routing.defaultLocale)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // /nl/dashboard heeft de taal vooraan. /dashboard nog niet: de rewrite in
  // next.config.ts komt pas ná de middleware. Beide moeten hier dicht.
  const taal = taalVanBeschermdPad(path)
  if (!user && taal) {
    return naarInloggen(request, taal)
  }

  return supabaseResponse
}

/** `/nl/zelf-toets/loop/abc` wordt `{ taal: 'nl', rest: 'zelf-toets/loop/abc' }`. */
function splitsTaal(path: string): { taal: string; rest: string } | null {
  const match = path.match(TAAL_VOORAAN)
  if (!match) return null
  return { taal: match[1], rest: match[2] ?? '' }
}

const TAAL_VOORAAN = new RegExp(`^/(${routing.locales.join('|')})(?:/(.*))?$`)

/** Kijkt alleen naar het eerste stuk: /oefenen en /oefenen/wat-dan-ook tellen allebei. */
function achterInlog(rest: string): boolean {
  const eerste = rest.split('/')[0]
  return (ACHTER_INLOG as readonly string[]).includes(eerste)
}

/**
 * De taal voor de inlogpagina als dit pad achter de poort zit, anders niks.
 * `/nl/oefenen` en `/oefenen` geven allebei `nl`.
 */
function taalVanBeschermdPad(path: string): string | null {
  if (path === '/admin' || path.startsWith('/admin/')) return routing.defaultLocale
  const taalEnRest = splitsTaal(path)
  if (taalEnRest) {
    return achterInlog(taalEnRest.rest) ? taalEnRest.taal : null
  }
  const rest = path.startsWith('/') ? path.slice(1) : path
  return achterInlog(rest) ? routing.defaultLocale : null
}

/**
 * Geeft `?van=` door aan de pagina, als het een van de vaste woorden is.
 * Een meegestuurd kopje van de browser zelf telt niet: alleen de link.
 * Geen cookie.
 */
function verderMetBron(request: NextRequest) {
  const bron = leesBron(request.nextUrl.searchParams.get('van'))
  const meegestuurd = request.headers.get('x-bron')
  if (!bron && !meegestuurd) return NextResponse.next({ request })

  const headers = new Headers(request.headers)
  if (bron) headers.set('x-bron', bron)
  else headers.delete('x-bron')
  return NextResponse.next({ request: { headers } })
}

function naarInloggen(request: NextRequest, taal: string) {
  const url = request.nextUrl.clone()
  url.pathname = `/${taal}/inloggen`
  // Zonder dit neemt de inlogpagina de zoekwoorden van de vorige pagina over,
  // en toont `?error=` uit een oude URL ineens een foutmelding.
  url.search = ''
  return NextResponse.redirect(url)
}
