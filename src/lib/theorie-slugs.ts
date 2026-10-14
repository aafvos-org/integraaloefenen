import { routing } from '@/i18n/routing'

/**
 * Slugs van echte theoriepagina's. De middleware vergelijkt het adres hiermee.
 * De test houdt deze lijst gelijk aan THEORY_OVERVIEW.
 *
 * Bewust alleen de slugs, niet de theorie-tekst: de middleware draait bij
 * elk verzoek.
 */
export const THEORIE_SLUGS = [
  'primitieve',
  'substitutiemethode',
  'partieel-integreren',
  'oppervlakte',
  'inhoud',
  'k3',
] as const

const THEORIE_ADRES = new RegExp(
  `^/(?:(${routing.locales.join('|')})/)?theorie/([^/]+)/?$`,
)

/**
 * Een verzonnen theorie-adres hoort 404 te geven, met de pagina "Pagina niet
 * gevonden". Op /theorie begint loading.tsx al met HTML sturen voordat de
 * pagina notFound() kan aanroepen, en dan blijft de status 200. Daarom
 * herschrijven we zo'n adres naar een pad buiten /theorie, waar de
 * vangnet-pagina notFound() aanroept vóórdat er iets de deur uit gaat.
 *
 * Geeft het nieuwe pad terug, of null als dit adres gewoon de theoriepagina is.
 */
export function herschrijfVerzonnenTheorie(pathname: string): string | null {
  const match = pathname.match(THEORIE_ADRES)
  if (!match) return null
  const slug = decodeURIComponent(match[2])
  // Het WhatsApp-plaatje staat op /theorie/opengraph-image, niet op een hoofdstuk.
  if (slug === 'opengraph-image' || slug.startsWith('opengraph-image.')) return null
  if ((THEORIE_SLUGS as readonly string[]).includes(slug)) return null
  return '/pagina-bestaat-niet'
}
