import { NextResponse, type NextRequest } from 'next/server'
import type { User } from '@supabase/supabase-js'

import { leesBron } from '@/lib/bron'
import { moetGebruikersnaamVragen, veiligeVolgende } from '@/lib/google-login'
import { zetGekozenBron } from '@/lib/supabase/bron'
import { zetGekozenGebruikersnaam } from '@/lib/supabase/gebruikersnaam'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Respect an explicit `next` param if it's already locale-prefixed;
  // otherwise default to the Dutch dashboard.
  const nextParam = searchParams.get('next')
  const next = nextParam
    ? /^\/nl(\/|$)/.test(nextParam)
      ? nextParam          // already has locale prefix → use as-is
      : `/nl${nextParam}`  // no locale prefix → prepend default locale
    : '/nl/dashboard'      // no next param → default

  // Komt deze link uit de bevestigingsmail? Dan is het account bevestigd, ook
  // als we de code niet kunnen inwisselen (bijvoorbeeld omdat de leerling de
  // mail op zijn telefoon opent terwijl hij zich op de laptop aanmeldde: de
  // code hoort bij die eerste browser). Dan sturen we hem naar de inlogpagina
  // met de melding dat het gelukt is, en niet met een foutmelding.
  const vanBevestiging = searchParams.get('van') === 'bevestiging'

  // Heeft Supabase de bevestiging juist geweigerd (link verlopen of al een
  // keer gebruikt)? Dan mag die melding er niet komen. Supabase zet die fout
  // nu achter een `#` in de link, en dat deel komt nooit bij de server aan —
  // daarom kijkt de inlogpagina er zelf ook nog naar. Zet Supabase hem later
  // wél in de adresregel, dan vangen we hem hier al op.
  const linkFout = Boolean(searchParams.get('error') ?? searchParams.get('error_code'))

  // Komt de leerling uit de mail *wachtwoord vergeten*? De resetlink stuurt
  // hem hier naartoe met `next=/wachtwoord-opnieuw`. Kan de code niet worden
  // ingewisseld, dan is die link verlopen of al een keer gebruikt — de
  // inlogpagina legt dan uit dat hij een nieuwe resetlink moet aanvragen.
  const isHerstelLink = nextParam === '/wachtwoord-opnieuw'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // De bron uit de aanmeldlink (docent, youtube, …) zit bij Google niet
      // in het account. `van` is hier al in gebruik voor de bevestigingsmail,
      // dus de knop stuurt hem mee als `bron`.
      let user = data.user
      const bronUitLink = leesBron(searchParams.get('bron'))
      if (user && bronUitLink && !leesBron(user.user_metadata?.bron)) {
        user = {
          ...user,
          user_metadata: { ...user.user_metadata, bron: bronUitLink },
        }
      }
      // Gekozen gebruikersnaam en bron van het registreren op het profiel
      // zetten (INT-89, INT-240): bij mailbevestiging kon dat nog niet.
      await zetGekozenGebruikersnaam(supabase, user)
      await zetGekozenBron(supabase, user)
      if (await eersteKeerZonderNaam(supabase, user)) {
        const url = new URL('/nl/gebruikersnaam', origin)
        url.searchParams.set('next', veiligeVolgende(next))
        return NextResponse.redirect(url)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  const url = new URL('/nl/inloggen', origin)
  if (vanBevestiging && linkFout) {
    url.searchParams.set('linkfout', '1')
  } else if (vanBevestiging) {
    url.searchParams.set('bevestigd', '1')
  } else if (isHerstelLink) {
    url.searchParams.set('herstel', '1')
  } else {
    url.searchParams.set('error', 'auth_callback_failed')
  }
  return NextResponse.redirect(url)
}

/**
 * Google-account zonder gebruikersnaam: één keer vragen, net als bij
 * registreren. Lukt het opzoeken niet, dan gaat de leerling gewoon door.
 */
async function eersteKeerZonderNaam(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: User | null,
): Promise<boolean> {
  if (!moetGebruikersnaamVragen(user, null) || !user) return false

  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    console.error('[google] kon gebruikersnaam niet lezen:', error.message)
    return false
  }
  return moetGebruikersnaamVragen(user, data?.username)
}
