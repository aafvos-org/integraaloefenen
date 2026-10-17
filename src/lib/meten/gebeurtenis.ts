/**
 * Wat de klikmeting bijhoudt, en wat ze beslist niet bijhoudt.
 *
 * Deze module is gedeeld: de browser gebruikt hem om een pakketje te maken,
 * /api/meet gebruikt hem om datzelfde pakketje na te kijken voordat er iets
 * naar de database gaat. Alles hier is pure rekenwerk, zodat `npm test` het
 * kan narekenen zonder browser en zonder database.
 *
 * Wat er NIET in mag, en waarom het hier niet te vinden is:
 * geen IP-adres, geen volledige user-agent, geen e-mailadres, geen user_id,
 * geen ingetypte antwoorden en geen tekst uit invoervelden. Een bezoeker
 * zonder account krijgt niets blijvends mee: alleen een id van dit tabblad,
 * dat verdwijnt als het tabblad dichtgaat.
 */

/** Soorten gebeurtenis. Een onbekend woord wordt geweigerd. */
export const SOORTEN = [
  /** Een paginabezoek, ook als de app zelf doorklikt zonder herladen. */
  'pagina',
  /** Een klik op iets klikbaars. */
  'klik',
  /** Een klik op iets dat niet klikbaar is. */
  'dode_klik',
  /** Drie of meer klikken binnen een seconde op dezelfde plek. */
  'woedeklik',
  /** Een JavaScript-fout of een 404. */
  'fout',
  /** Hoe ver iemand kwam: 25, 50, 75 of 100 procent. */
  'scroll',
  /** In dit bezoek is een account aangemaakt. */
  'geregistreerd',
  /** In dit bezoek is iemand ingelogd. */
  'ingelogd',
] as const

export type Soort = (typeof SOORTEN)[number]

/** Alleen de grofste indeling, op schermbreedte. Niet het model telefoon. */
export const APPARATEN = ['telefoon', 'tablet', 'computer'] as const

export type Apparaat = (typeof APPARATEN)[number]

/** Scrolldieptes die we tellen. Iets anders wordt geweigerd. */
export const SCROLLDIEPTES = [25, 50, 75, 100] as const

/** Hoogstens zoveel gebeurtenissen in één pakketje. */
export const MAX_PER_PAKKET = 50

/** Hoogstens zoveel gebeurtenissen per sessie per uur. Daarna negeren we ze. */
export const MAX_PER_UUR = 300

/**
 * Onder dit volgnummer kan een sessie het uurmaximum nog niet gehaald hebben,
 * want het volgnummer telt alleen maar op. De server hoeft dan niet te tellen.
 */
export const VOLGNUMMER_ZONDER_TELLEN = MAX_PER_UUR

/** Harde bovengrens per sessie. Daarboven is het geen leerling meer. */
export const MAX_VOLGNUMMER = 5000

const MAX_PAD = 120
const MAX_DOEL = 60
const MAX_VERWIJZER = 60
const MAX_SESSIE_ID = 40
const MAX_UTM = 40

/** Hoeveel een tijdstip uit de browser mag afwijken voordat we `nu` nemen. */
const MAX_TIJDSVERSCHIL_MS = 10 * 60 * 1000

const SOORT_SET = new Set<string>(SOORTEN)
const APPARAAT_SET = new Set<string>(APPARATEN)
const SCROLL_SET = new Set<number>(SCROLLDIEPTES)

/** Een gebeurtenis zoals de browser hem opstuurt. Korte namen: het gaat over de lijn. */
export type RuweGebeurtenis = {
  /** volgnummer binnen de sessie */
  n: number
  /** soort */
  k: string
  /** pad */
  p: string
  /** doel van de klik, of korte omschrijving van de fout */
  d?: string | null
  /** scrolldiepte */
  w?: number | null
  /** tijdstip in milliseconden sinds 1970 */
  t?: number | null
}

export type RuwPakket = {
  /** sessie-id van dit tabblad */
  s: string
  /** apparaat */
  a: string
  /** domein van de verwijzer */
  v?: string | null
  /** waarde van ?van= */
  b?: string | null
  /** waarde van ?utm_source= */
  u?: string | null
  g: RuweGebeurtenis[]
}

/** Een nagekeken gebeurtenis, klaar voor de database. */
export type Gebeurtenis = {
  volgnummer: number
  soort: Soort
  pad: string
  doel: string | null
  scrolldiepte: number | null
  tijdstip: string
}

export type Pakket = {
  sessieId: string
  apparaat: Apparaat
  verwijzer: string | null
  van: string | null
  utmSource: string | null
  gebeurtenissen: Gebeurtenis[]
}

/** Spaties en regelafbrekingen worden één spatie; daarna afknippen. */
function korteTekst(waarde: unknown, max: number): string | null {
  if (typeof waarde !== 'string') return null
  const schoon = waarde.replace(/\s+/g, ' ').trim()
  if (!schoon) return null
  return schoon.slice(0, max)
}

/**
 * Het pad, zonder queryparameters en zonder #anker. `?van=` en `?utm_source=`
 * gaan niet verloren: die staan in hun eigen veld, zodat twee bezoeken aan
 * dezelfde pagina in een overzicht ook op één regel terechtkomen.
 */
export function schoonPad(ruw: unknown): string | null {
  if (typeof ruw !== 'string') return null
  const zonderVraag = ruw.split('?')[0].split('#')[0].trim()
  if (!zonderVraag.startsWith('/')) return null
  const zonderSlash =
    zonderVraag.length > 1 ? zonderVraag.replace(/\/+$/, '') : zonderVraag
  return (zonderSlash || '/').slice(0, MAX_PAD)
}

/** Beheerpagina's meten we niet. Daar komt alleen Aaf. */
export function isBeheerpad(pad: string): boolean {
  return pad === '/admin' || pad.startsWith('/admin/')
}

/** Alleen de grofste indeling, op schermbreedte. */
export function apparaatVanBreedte(breedte: number): Apparaat {
  if (!Number.isFinite(breedte) || breedte < 640) return 'telefoon'
  if (breedte < 1024) return 'tablet'
  return 'computer'
}

/**
 * Het domein van de verwijzer, dus `google.com` en niet het hele adres met de
 * zoekopdracht erin. Een verwijzing vanaf de site zelf telt niet.
 */
export function verwijzerDomein(
  verwijzer: string,
  eigenHost: string,
): string | null {
  if (!verwijzer) return null
  let host: string
  try {
    host = new URL(verwijzer).hostname.toLowerCase()
  } catch {
    return null
  }
  if (!host) return null
  const kaal = host.replace(/^www\./, '')
  if (kaal === eigenHost.toLowerCase().replace(/^www\./, '')) return null
  return kaal.slice(0, MAX_VERWIJZER)
}

/** Alleen letters, cijfers, streepjes en punten. Geen vrije tekst. */
function korteCode(waarde: unknown, max: number): string | null {
  const tekst = korteTekst(waarde, max)
  if (tekst === null) return null
  const schoon = tekst.toLowerCase()
  return /^[a-z0-9._-]+$/.test(schoon) ? schoon : null
}

function leesTijdstip(ruw: unknown, nu: number): string {
  if (typeof ruw !== 'number' || !Number.isFinite(ruw)) {
    return new Date(nu).toISOString()
  }
  // Een klok die ver voor- of achterloopt vertrouwen we niet; dan telt de
  // tijd waarop het pakketje binnenkwam.
  if (Math.abs(nu - ruw) > MAX_TIJDSVERSCHIL_MS) return new Date(nu).toISOString()
  return new Date(ruw).toISOString()
}

function leesGebeurtenis(ruw: unknown, nu: number): Gebeurtenis | null {
  if (typeof ruw !== 'object' || ruw === null) return null
  const g = ruw as RuweGebeurtenis

  if (
    typeof g.n !== 'number' ||
    !Number.isInteger(g.n) ||
    g.n < 1 ||
    g.n > MAX_VOLGNUMMER
  ) {
    return null
  }

  if (typeof g.k !== 'string' || !SOORT_SET.has(g.k)) return null
  const soort = g.k as Soort

  const pad = schoonPad(g.p)
  if (pad === null || isBeheerpad(pad)) return null

  let scrolldiepte: number | null = null
  if (soort === 'scroll') {
    if (typeof g.w !== 'number' || !SCROLL_SET.has(g.w)) return null
    scrolldiepte = g.w
  }

  return {
    volgnummer: g.n,
    soort,
    pad,
    doel: korteTekst(g.d, MAX_DOEL),
    scrolldiepte,
    tijdstip: leesTijdstip(g.t, nu),
  }
}

/**
 * Kijkt een binnengekomen pakketje na. Alles wat niet klopt gaat eruit; is er
 * daarna niets over, dan is het antwoord `null` en schrijven we niets weg.
 */
export function leesPakket(ruw: unknown, nu: number = Date.now()): Pakket | null {
  if (typeof ruw !== 'object' || ruw === null) return null
  const p = ruw as RuwPakket

  const sessieId = korteCode(p.s, MAX_SESSIE_ID)
  if (sessieId === null || sessieId.length < 8) return null

  if (typeof p.a !== 'string' || !APPARAAT_SET.has(p.a)) return null

  if (!Array.isArray(p.g) || p.g.length === 0) return null
  if (p.g.length > MAX_PER_PAKKET) return null

  const gebeurtenissen: Gebeurtenis[] = []
  const gezien = new Set<number>()
  for (const ruweGebeurtenis of p.g) {
    const gebeurtenis = leesGebeurtenis(ruweGebeurtenis, nu)
    if (gebeurtenis === null) continue
    // Twee keer hetzelfde volgnummer kan niet; de database zou de tweede toch
    // weigeren.
    if (gezien.has(gebeurtenis.volgnummer)) continue
    gezien.add(gebeurtenis.volgnummer)
    gebeurtenissen.push(gebeurtenis)
  }
  if (gebeurtenissen.length === 0) return null

  return {
    sessieId,
    apparaat: p.a as Apparaat,
    verwijzer: korteCode(p.v, MAX_VERWIJZER),
    van: korteCode(p.b, 20),
    utmSource: korteCode(p.u, MAX_UTM),
    gebeurtenissen,
  }
}

/** Het hoogste volgnummer in een pakketje. */
export function hoogsteVolgnummer(pakket: Pakket): number {
  return pakket.gebeurtenissen.reduce(
    (hoogste, gebeurtenis) => Math.max(hoogste, gebeurtenis.volgnummer),
    0,
  )
}

const BOTWOORDEN = [
  'bot',
  'crawler',
  'spider',
  'slurp',
  'headless',
  'phantomjs',
  'puppeteer',
  'playwright',
  'lighthouse',
  'curl',
  'wget',
  'python-requests',
  'axios',
  'scrapy',
  'preview',
  'monitor',
  'pingdom',
  'facebookexternalhit',
]

/**
 * Of dit een bezoeker is die we niet willen meetellen. We kijken alleen naar
 * een paar woorden in de user-agent; de user-agent zelf bewaren we nooit.
 */
export function isBot(userAgent: string | null): boolean {
  if (!userAgent) return true
  const tekst = userAgent.toLowerCase()
  return BOTWOORDEN.some((woord) => tekst.includes(woord))
}
