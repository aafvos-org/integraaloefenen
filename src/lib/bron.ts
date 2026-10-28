/**
 * Waar een nieuw account vandaan kwam.
 *
 * Alleen deze woorden. Een link met `?van=youtube` (of docent, klas, forum,
 * proberen, voorbeeld, google) onthouden we op het profiel. Iets anders — ook
 * `bevestiging`, dat de bevestigingsmail al gebruikt — negeren we. Geen vrije tekst.
 */
export const BRONNEN = [
  'docent',
  'youtube',
  'klas',
  'forum',
  'proberen',
  'voorbeeld',
  'google',
] as const

export type Bron = (typeof BRONNEN)[number]

/**
 * Sleutel in de opslag van dit tabblad. Geen cookie: het gaat niet mee naar
 * de server en het verdwijnt als het tabblad dichtgaat.
 */
export const BRON_TABBLAD = 'integraal-bron'

const TOEGESTAAN = new Set<string>(BRONNEN)

/**
 * Alleen docent, youtube, klas, forum, proberen, voorbeeld of google. Leeg, onbekend of
 * een lange tekst wordt niets. Hoofdletters en spaties eromheen tellen niet.
 */
export function leesBron(waarde: unknown): Bron | null {
  if (typeof waarde !== 'string') return null
  const schoon = waarde.trim().toLowerCase()
  if (!TOEGESTAAN.has(schoon)) return null
  return schoon as Bron
}

/** Leest de bron die dit tabblad onthield. Faalt stil als er geen opslag is. */
export function bronUitTabblad(): Bron | null {
  try {
    return leesBron(sessionStorage.getItem(BRON_TABBLAD))
  } catch {
    return null
  }
}

/**
 * Draait vóór de pagina klikbaar is. Zet `?van=` in de tabblad-opslag, zodat
 * de bron blijft als de leerling eerst rondkijkt. Geen cookie.
 *
 * Is er geen `?van=` en komt de verwijzer van een Google-zoekdomein
 * (`google.com`, `google.nl`, …), dan onthoudt dit script zelf de bron
 * `google` — dit is de enige manier om Google-landingen zonder koppelteken
 * toch toe te schrijven. De regel hieronder is dezelfde als
 * `GOOGLE_ZOEKDOMEIN` in `google-herkomst.ts`; `bron.test.ts` bewaakt dat ze
 * gelijk blijven. We slaan alleen het kale hostname op, nooit de
 * zoekopdracht of het hele verwijzer-adres.
 */
export function scriptDatBronOnthoudt(): string {
  const woorden = BRONNEN.join('|')
  return `try{var p=new URLSearchParams(location.search).get("van");if(typeof p==="string"){var s=p.trim().toLowerCase();if(/^(${woorden})$/.test(s))sessionStorage.setItem("${BRON_TABBLAD}",s)}else if(document.referrer){var h=new URL(document.referrer).hostname.toLowerCase().replace(/^www\\./,"");if(/^google\\.[a-z]{2,3}(\\.[a-z]{2,3})?$/.test(h))sessionStorage.setItem("${BRON_TABBLAD}","google")}}catch(e){}`
}

/** Wat er bij het aanmelden in de metadata van het account komt. */
export function aanmeldGegevens(
  username: string | null,
  bron: Bron | null,
): { username?: string; bron?: Bron } | undefined {
  const data: { username?: string; bron?: Bron } = {}
  if (username) data.username = username
  if (bron) data.bron = bron
  return Object.keys(data).length > 0 ? data : undefined
}

/** Zet `?van=` achter een aanmeldlink, of laat de link met rust. */
export function padNaarAanmelden(pad: string, bron: Bron | null): string {
  if (!bron) return pad
  return `${pad}${pad.includes('?') ? '&' : '?'}van=${encodeURIComponent(bron)}`
}
