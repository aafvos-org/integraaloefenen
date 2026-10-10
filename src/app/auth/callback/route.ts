import { NextResponse, type NextRequest } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Respect an explicit `next` param if it's already locale-prefixed;
  // otherwise default to the Dutch dashboard.
  const nextParam = searchParams.get('next')
  const next = nextParam
    ? /^\/(nl|en)(\/|$)/.test(nextParam)
      ? nextParam          // already has locale prefix → use as-is
      : `/nl${nextParam}`  // no locale prefix → prepend default locale
    : '/nl/dashboard'      // no next param → default

  // Komt deze link uit de bevestigingsmail? Dan is het account bevestigd, ook
  // als we de code niet kunnen inwisselen (bijvoorbeeld omdat de leerling de
  // mail op zijn telefoon opent terwijl hij zich op de laptop aanmeldde: de
  // code hoort bij die eerste browser). Dan sturen we hem naar de inlogpagina
  // met de melding dat het gelukt is, en niet met een foutmelding.
  const vanBevestiging = searchParams.get('van') === 'bevestiging'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  const url = new URL('/nl/inloggen', origin)
  if (vanBevestiging) {
    url.searchParams.set('bevestigd', '1')
  } else {
    url.searchParams.set('error', 'auth_callback_failed')
  }
  return NextResponse.redirect(url)
}
