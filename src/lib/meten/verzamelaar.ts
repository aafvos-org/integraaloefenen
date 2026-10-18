/**
 * De klikmeting in de browser.
 *
 * Dit bestand wordt pas na de eerste weergave ingeladen (zie
 * src/components/klikmeting.tsx), zodat de pagina er niet trager van wordt.
 * Het verzamelt een paar seconden en stuurt dan één pakketje met
 * `navigator.sendBeacon` naar /api/meet.
 *
 * Geen cookie. Het id van dit bezoek staat in `sessionStorage` en verdwijnt
 * als het tabblad dichtgaat. Een bezoeker zonder account krijgt niets
 * blijvends mee. Wie ingelogd is, krijgt op de server een schuilnaam; die
 * berekening gebeurt niet hier en het user_id gaat niet mee over de lijn.
 *
 * Uit invoervelden lezen we nooit een waarde of een ingetypte tekst.
 */

import {
  apparaatVanBreedte,
  isBeheerpad,
  schoonPad,
  verwijzerDomein,
  MAX_PER_PAKKET,
  MAX_PER_UUR,
  MAX_VOLGNUMMER,
  SCROLLDIEPTES,
  type RuweGebeurtenis,
  type RuwPakket,
  type Soort,
} from './gebeurtenis'
import { heeftInlogsessie } from '@/lib/supabase/sessie-cookie'

const ROUTE = '/api/meet'

/** Sleutels in de opslag van dit tabblad. Geen cookie. */
const SLEUTEL_SESSIE = 'integraal-meet-sessie'
const SLEUTEL_VOLGNUMMER = 'integraal-meet-nr'
const SLEUTEL_UURVENSTER = 'integraal-meet-uur'
const SLEUTEL_INGELOGD = 'integraal-meet-ingelogd'
const SLEUTEL_VAN = 'integraal-meet-van'
const SLEUTEL_UTM = 'integraal-meet-utm'

/** Hoe lang we verzamelen voordat er een pakketje weggaat. */
const WACHT_MS = 3000

/** Woedeklik: zoveel klikken binnen zoveel milliseconden op dezelfde plek. */
const WOEDE_KLIKKEN = 3
const WOEDE_MS = 1000
const WOEDE_PIXELS = 30

const buffer: RuweGebeurtenis[] = []
let gestart = false
let timer: number | null = null
let laatstePad: string | null = null
let gehaaldeScroll = new Set<number>()
let woedeKlikken: { x: number; y: number; t: number }[] = []
let woedeGemeld = false

/** Een id dat alleen in dit tabblad bestaat. */
function nieuwSessieId(): string {
  const bytes = new Uint8Array(12)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function lees(sleutel: string): string | null {
  try {
    return sessionStorage.getItem(sleutel)
  } catch {
    return null
  }
}

function schrijf(sleutel: string, waarde: string): void {
  try {
    sessionStorage.setItem(sleutel, waarde)
  } catch {
    // Geen opslag (privévenster met alles dicht): dan meten we niet.
  }
}

function sessieId(): string | null {
  const bestaand = lees(SLEUTEL_SESSIE)
  if (bestaand && /^[a-f0-9]{16,40}$/.test(bestaand)) return bestaand
  const nieuw = nieuwSessieId()
  schrijf(SLEUTEL_SESSIE, nieuw)
  return lees(SLEUTEL_SESSIE) === nieuw ? nieuw : null
}

/**
 * Het volgende volgnummer binnen dit bezoek. Het telt door over een herlaadactie
 * heen, zodat de route op volgorde te leggen is.
 */
function volgendVolgnummer(): number | null {
  const huidig = Number(lees(SLEUTEL_VOLGNUMMER) ?? '0')
  const volgend = (Number.isInteger(huidig) && huidig > 0 ? huidig : 0) + 1
  if (volgend > MAX_VOLGNUMMER) return null
  schrijf(SLEUTEL_VOLGNUMMER, String(volgend))
  return volgend
}

/** Hoogstens MAX_PER_UUR gebeurtenissen per uur, ook als er van alles misgaat. */
function binnenUurgrens(): boolean {
  const nu = Date.now()
  let begin = nu
  let aantal = 0
  const opgeslagen = lees(SLEUTEL_UURVENSTER)
  if (opgeslagen) {
    const [ruwBegin, ruwAantal] = opgeslagen.split(':')
    const geparsteBegin = Number(ruwBegin)
    const geparstAantal = Number(ruwAantal)
    if (
      Number.isFinite(geparsteBegin) &&
      Number.isFinite(geparstAantal) &&
      nu - geparsteBegin < 60 * 60 * 1000
    ) {
      begin = geparsteBegin
      aantal = geparstAantal
    }
  }
  if (aantal >= MAX_PER_UUR) return false
  schrijf(SLEUTEL_UURVENSTER, `${begin}:${aantal + 1}`)
  return true
}

/**
 * Of we op deze computer mogen meten. De e2e-tests en een lokale dev-server
 * tellen niet mee; die zouden de cijfers vervuilen.
 */
function magMeten(): boolean {
  if (typeof window === 'undefined') return false
  if (navigator.webdriver) return false
  if (typeof navigator.sendBeacon !== 'function') return false
  const host = location.hostname
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host === '[::1]' ||
    host.endsWith('.local')
  ) {
    return false
  }
  return true
}

function huidigPad(): string | null {
  const pad = schoonPad(location.pathname)
  if (pad === null || isBeheerpad(pad)) return null
  return pad
}

function noteer(soort: Soort, doel?: string | null, scrolldiepte?: number): void {
  const pad = huidigPad()
  if (pad === null) return
  if (!binnenUurgrens()) return
  const volgnummer = volgendVolgnummer()
  if (volgnummer === null) return

  buffer.push({
    n: volgnummer,
    k: soort,
    p: pad,
    d: doel ?? null,
    w: scrolldiepte ?? null,
    t: Date.now(),
  })

  if (buffer.length >= MAX_PER_PAKKET) {
    verstuur()
    return
  }
  if (timer === null) {
    timer = window.setTimeout(verstuur, WACHT_MS)
  }
}

/**
 * Waar dit bezoek vandaan kwam: `?van=` en `?utm_source=` zoals ze in het
 * adres stonden toen de bezoeker binnenkwam.
 *
 * We onthouden ze in de opslag van dit tabblad, net als `integraal-bron` dat
 * doet. Dat moet: een pakketje gaat pas een paar seconden later weg, en dan
 * is de bezoeker vaak al een pagina verder en staan die parameters niet meer
 * in het adres. De eerste waarde wint, zodat een link verderop de herkomst
 * van het bezoek niet overschrijft.
 */
function onthoudHerkomst(): void {
  try {
    const parameters = new URLSearchParams(location.search)
    for (const [naam, sleutel] of [
      ['van', SLEUTEL_VAN],
      ['utm_source', SLEUTEL_UTM],
    ] as const) {
      const waarde = parameters.get(naam)
      if (waarde && lees(sleutel) === null) schrijf(sleutel, waarde.slice(0, 40))
    }
  } catch {
    // Geen opslag of een kapot adres: dan weten we de herkomst niet.
  }
}

function verstuur(): void {
  if (timer !== null) {
    window.clearTimeout(timer)
    timer = null
  }
  if (buffer.length === 0) return

  const sessie = sessieId()
  if (sessie === null) {
    buffer.length = 0
    return
  }

  const pakket: RuwPakket = {
    s: sessie,
    a: apparaatVanBreedte(window.innerWidth),
    v: verwijzerDomein(document.referrer, location.hostname),
    b: lees(SLEUTEL_VAN),
    u: lees(SLEUTEL_UTM),
    g: buffer.splice(0, MAX_PER_PAKKET),
  }

  try {
    const verstuurd = navigator.sendBeacon(
      ROUTE,
      new Blob([JSON.stringify(pakket)], { type: 'application/json' }),
    )
    // Lukt het niet (te groot, of de browser weigert), dan laten we het los.
    // Een meting is nooit belangrijk genoeg om opnieuw te proberen.
    if (!verstuurd) return
  } catch {
    // Stil: de leerling mag hier niets van merken.
  }
}

// ── Wat we opvangen ──────────────────────────────────────────────────────────

/**
 * De naam van wat er aangeklikt is. Bij voorkeur de vaste naam uit
 * `data-meet`; anders het soort element met de zichtbare tekst erachter.
 * Uit een invoerveld halen we nooit de inhoud.
 */
function doelVan(element: Element): string {
  const metNaam = element.closest<HTMLElement>('[data-meet]')
  const naam = metNaam?.dataset.meet?.trim()
  if (naam) return naam

  const tag = element.tagName.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return tag
  if (element.closest('input, textarea, select, [contenteditable]')) return tag

  const tekst = (element.textContent ?? '').replace(/\s+/g, ' ').trim()
  return tekst ? `${tag}: ${tekst.slice(0, 40)}` : tag
}

/**
 * Waar een klik iets doet. Invoervelden horen er ook bij: wie in het
 * antwoordveld tikt om te typen, doet precies wat de bedoeling is. Telden we
 * dat als dode klik, dan zou dat lijken op een stuk scherm terwijl er niets
 * mis is.
 */
const KLIKBAAR =
  'a, button, summary, label, input, textarea, select, [role="button"], [role="link"], [role="tab"], [onclick], [contenteditable]:not([contenteditable="false"])'

function opKlik(gebeurtenis: MouseEvent): void {
  const doelElement = gebeurtenis.target
  if (!(doelElement instanceof Element)) return

  const klikbaar = doelElement.closest(KLIKBAAR)
  noteer(klikbaar ? 'klik' : 'dode_klik', doelVan(klikbaar ?? doelElement))

  // Drie klikken binnen een seconde, bijna op dezelfde plek: iemand is aan
  // het rammen omdat er niets gebeurt.
  const nu = Date.now()
  woedeKlikken = woedeKlikken.filter((klik) => nu - klik.t < WOEDE_MS)
  const vorige = woedeKlikken[woedeKlikken.length - 1]
  if (
    vorige &&
    (Math.abs(vorige.x - gebeurtenis.clientX) > WOEDE_PIXELS ||
      Math.abs(vorige.y - gebeurtenis.clientY) > WOEDE_PIXELS)
  ) {
    woedeKlikken = []
    woedeGemeld = false
  }
  woedeKlikken.push({ x: gebeurtenis.clientX, y: gebeurtenis.clientY, t: nu })
  if (woedeKlikken.length >= WOEDE_KLIKKEN && !woedeGemeld) {
    woedeGemeld = true
    noteer('woedeklik', doelVan(klikbaar ?? doelElement))
  }
  if (woedeKlikken.length < WOEDE_KLIKKEN) woedeGemeld = false
}

function opScroll(): void {
  const totaal = document.documentElement.scrollHeight
  if (totaal <= 0) return
  // Hoe ver de onderkant van het venster staat, in procenten van de pagina.
  // Past de pagina in één scherm, dan is dat meteen 100%.
  const diepte = ((window.scrollY + window.innerHeight) / totaal) * 100
  for (const grens of SCROLLDIEPTES) {
    if (diepte >= grens && !gehaaldeScroll.has(grens)) {
      gehaaldeScroll.add(grens)
      noteer('scroll', null, grens)
    }
  }
}

/** Alleen de naam van de fout en de eerste woorden. Geen stacktrace. */
function opFout(gebeurtenis: ErrorEvent): void {
  const bericht = gebeurtenis.message || 'onbekende fout'
  noteer('fout', bericht.slice(0, 60))
}

function opAfgewezenBelofte(gebeurtenis: PromiseRejectionEvent): void {
  const reden = gebeurtenis.reason
  const bericht =
    reden instanceof Error ? reden.message : typeof reden === 'string' ? reden : 'belofte afgewezen'
  noteer('fout', `belofte: ${bericht.slice(0, 50)}`)
}

/**
 * Is er in dit bezoek ingelogd?
 *
 * We kijken alleen of de inlogcookie er nu wél is en net nog niet. Zo is de
 * weg naar een account te volgen zonder te weten wie er inlogt. Komt iemand
 * de volgende dag in een nieuw tabblad terug, dan is hij al ingelogd bij de
 * eerste pagina: dat is geen inlogmoment en telt dus niet mee.
 */
function kijkNaarInloggen(): void {
  const nu = heeftInlogsessie(
    document.cookie.split(';').map((deel) => ({ name: deel.split('=')[0]?.trim() ?? '' })),
  )
  const eerder = lees(SLEUTEL_INGELOGD)
  schrijf(SLEUTEL_INGELOGD, nu ? 'ja' : 'nee')
  if (eerder === 'nee' && nu) noteer('ingelogd')
}

// ── Aanzetten ────────────────────────────────────────────────────────────────

function start(): boolean {
  if (!magMeten()) return false
  if (gestart) return true
  gestart = true

  document.addEventListener('click', opKlik, { capture: true, passive: true })
  window.addEventListener('scroll', opScroll, { passive: true })
  window.addEventListener('error', opFout)
  window.addEventListener('unhandledrejection', opAfgewezenBelofte)
  // Een tabblad dat dichtgaat of naar de achtergrond schuift, krijgt geen
  // timer meer. `visibilitychange` is de enige die op iOS betrouwbaar afgaat.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') verstuur()
  })
  window.addEventListener('pagehide', verstuur)

  return true
}

/**
 * Een paginabezoek. Draait ook bij navigatie binnen de app, want dan wordt er
 * geen nieuwe pagina geladen.
 */
export function meldPagina(): void {
  if (!start()) return

  onthoudHerkomst()

  const pad = huidigPad()
  if (pad === null) return
  // Next.js laat `usePathname` ook lopen bij een enkele render zonder wissel.
  if (pad === laatstePad) return
  laatstePad = pad

  gehaaldeScroll = new Set()
  woedeKlikken = []
  woedeGemeld = false

  noteer('pagina')
  kijkNaarInloggen()

  // Een 404 wordt door de server als pagina geserveerd, dus die zien we hier.
  if (document.querySelector('[data-meet-404]')) {
    noteer('fout', '404')
  }
  // Een korte pagina waar niets te scrollen valt, telt meteen als helemaal gezien.
  opScroll()
}

/**
 * Een geslaagde registratie of inlog in dit bezoek. Daarmee is de route naar
 * een account te volgen zonder dat we weten wie het is.
 */
export function meldAccountstap(soort: 'geregistreerd' | 'ingelogd'): void {
  if (!start()) return
  noteer(soort)
  // Niet wachten: na deze stap gaat de leerling bijna altijd naar een andere
  // pagina, en dan is het tabblad even weg.
  verstuur()
}
