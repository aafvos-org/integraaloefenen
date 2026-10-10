import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { ACHTER_INLOG } from '@/i18n/paths'
import { routing } from '@/i18n/routing'

import type { Database } from './types'

export async function updateSession(request: NextRequest) {
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

  const path = request.nextUrl.pathname

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

  // De rest van de site hangt onder een taal: /nl/dashboard. Next.js past de
  // doorverwijzingen uit next.config.ts toe vóórdat deze code draait, dus hier
  // staat de taal er altijd al voor. Pel hem eraf om te vergelijken en zet hem
  // bij een doorverwijzing weer terug.
  const taalEnRest = splitsTaal(path)
  if (!user && taalEnRest && achterInlog(taalEnRest.rest)) {
    return naarInloggen(request, taalEnRest.taal)
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

function naarInloggen(request: NextRequest, taal: string) {
  const url = request.nextUrl.clone()
  url.pathname = `/${taal}/inloggen`
  // Zonder dit neemt de inlogpagina de zoekwoorden van de vorige pagina over,
  // en toont `?error=` uit een oude URL ineens een foutmelding.
  url.search = ''
  return NextResponse.redirect(url)
}
