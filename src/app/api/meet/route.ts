/**
 * Waar de klikmeting binnenkomt.
 *
 * De browser stuurt elke paar seconden één pakketje met `navigator.sendBeacon`.
 * Deze route kijkt het na en schrijft het via de service-role weg in
 * `public.site_gebeurtenissen`.
 *
 * Wat hier NIET gebeurt: geen IP-adres opslaan, geen user-agent opslaan (we
 * kijken er alleen naar om bots over te slaan), geen user_id opslaan. Is er
 * iemand ingelogd, dan rekenen we hier de schuilnaam uit — een HMAC over het
 * user_id met een geheim dat alleen in Cloudflare staat. Het user_id zelf gaat
 * de tabel niet in.
 *
 * Het antwoord is altijd leeg (204). `sendBeacon` kijkt er toch niet naar, en
 * een meting mag nooit iets over de bezoeker terugvertellen.
 */

import { SITE } from '@/config/site'
import {
  MAX_PER_UUR,
  VOLGNUMMER_ZONDER_TELLEN,
  hoogsteVolgnummer,
  isBot,
  leesPakket,
  type Pakket,
} from '@/lib/meten/gebeurtenis'
import { schuilnaamVoor } from '@/lib/meten/schuilnaam'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { heeftInlogsessie } from '@/lib/supabase/sessie-cookie'

export const dynamic = 'force-dynamic'

/** Groter dan dit leest de route niet eens in. */
const MAX_BYTES = 16 * 1024

const LEEG = new Response(null, { status: 204 })

/**
 * Het user_id van wie dit verstuurt, of `null`. `getClaims` kijkt de
 * handtekening van het token na zonder bij elke meting de inlogserver te
 * bellen; dat zou per leerling honderden keren per uur gebeuren.
 */
async function ingelogdeGebruiker(): Promise<string | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getClaims()
    if (error || !data?.claims?.sub) return null
    return data.claims.sub
  } catch {
    return null
  }
}

export async function POST(req: Request): Promise<Response> {
  // Bots en testbrowsers tellen niet mee.
  if (isBot(req.headers.get('user-agent'))) return LEEG

  const lengte = Number(req.headers.get('content-length') ?? '0')
  if (Number.isFinite(lengte) && lengte > MAX_BYTES) return LEEG

  let ruw: unknown
  try {
    const tekst = await req.text()
    if (tekst.length > MAX_BYTES) return LEEG
    ruw = JSON.parse(tekst)
  } catch {
    return LEEG
  }

  const pakket = leesPakket(ruw)
  if (pakket === null) return LEEG

  // Wat hierna misgaat, blijft binnen deze route. Een meting die niet lukt mag
  // nooit een 500 opleveren: de bezoeker merkt er niets van, maar de foutteller
  // van de Worker zou ervan volschieten.
  try {
    await schrijfWeg(req, pakket)
  } catch (fout) {
    console.error(
      'Klikmeting opslaan mislukt:',
      fout instanceof Error ? fout.message : 'onbekende fout',
    )
  }

  return LEEG
}

async function schrijfWeg(req: Request, pakket: Pakket): Promise<void> {
  const admin = createServiceRoleClient()

  // Pas tellen als het volgnummer boven de uurgrens uitkomt. Daaronder kan de
  // sessie er onmogelijk overheen zijn, want het volgnummer telt alleen op.
  if (hoogsteVolgnummer(pakket) > VOLGNUMMER_ZONDER_TELLEN) {
    const eenUurGeleden = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count, error } = await admin
      .from('site_gebeurtenissen')
      .select('*', { count: 'exact', head: true })
      .eq('sessie_id', pakket.sessieId)
      .gte('tijdstip', eenUurGeleden)
    if (error) return
    if ((count ?? 0) >= MAX_PER_UUR) return
  }

  // Een inlogcookie is er vaak niet; dan slaan we het nakijken van het token
  // over. Dat scheelt werk op elke openbare pagina.
  let schuilnaam: string | null = null
  const ingelogd = heeftInlogsessie(cookieNamen(req))
  if (ingelogd) {
    const geheim = process.env.MEET_SCHUILNAAM_GEHEIM
    const userId = await ingelogdeGebruiker()
    if (userId && geheim) {
      schuilnaam = await schuilnaamVoor(userId, geheim)
    }
  }

  const rijen = pakket.gebeurtenissen.map((gebeurtenis) => ({
    site: SITE,
    tijdstip: gebeurtenis.tijdstip,
    sessie_id: pakket.sessieId,
    volgnummer: gebeurtenis.volgnummer,
    soort: gebeurtenis.soort,
    pad: gebeurtenis.pad,
    doel: gebeurtenis.doel,
    scrolldiepte: gebeurtenis.scrolldiepte,
    apparaat: pakket.apparaat,
    verwijzer: pakket.verwijzer,
    van: pakket.van,
    utm_source: pakket.utmSource,
    ingelogd,
    schuilnaam,
  }))

  // Hetzelfde volgnummer twee keer (een pakketje dat de browser opnieuw
  // stuurde) laten we liggen in plaats van het als fout te melden.
  const { error } = await admin
    .from('site_gebeurtenissen')
    .upsert(rijen, { onConflict: 'sessie_id,volgnummer', ignoreDuplicates: true })
  if (error) {
    // Alleen de melding van de database, nooit de rijen zelf.
    console.error('Klikmeting opslaan mislukt:', error.message)
  }
}

/** De namen van de cookies op dit verzoek. De waarden lezen we niet. */
function cookieNamen(req: Request): { name: string }[] {
  const kop = req.headers.get('cookie') ?? ''
  return kop
    .split(';')
    .map((deel) => ({ name: deel.split('=')[0]?.trim() ?? '' }))
    .filter((cookie) => cookie.name !== '')
}
