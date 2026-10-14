/**
 * Drie proefopgaven per theoriehoofdstuk, uit de bestanden in content/.
 *
 * Niets uit de database: een bezoeker zonder account mag deze sommen maken,
 * en het antwoord wordt nergens opgeslagen. De nakijking gebruikt alleen het
 * vaste antwoord en eventuele alternatieven, geen AI.
 *
 * De pagina krijgt alleen de opgavetekst. Het antwoord en het stappenplan
 * blijven in deze module, tot de bezoeker een antwoord instuurt.
 */
import inhoudXas from '../../../content/hoofdstuk-examen/inhoud-om-de-x-as.json'
import oppervlakteEen from '../../../content/hoofdstuk-examen/oppervlakte-een-grafiek.json'
import k0b from '../../../content/hoofdstuk-k/k0b.json'
import k1b from '../../../content/hoofdstuk-k/k1b.json'
import k2a from '../../../content/hoofdstuk-k/k2a.json'
import k3b from '../../../content/hoofdstuk-k/k3b.json'

import { THEORIE_SLUGS } from '@/lib/theorie-slugs'
import { answersMatch } from '@/lib/practice/engine'

/** Wat de pagina aan de browser geeft. Geen antwoord, geen stappen. */
export type ProefSom = {
  volgnummer: number
  latex: string
}

type BronVraag = {
  niveau?: number
  latex?: string
  antwoord_latex?: string
  primitieve?: string
  waarde?: string | number
  stappen?: string[]
  alternatieven?: string[]
}

type VolledigeSom = ProefSom & {
  goedAntwoord: string
  alternatieven: string[]
  antwoordLatex: string
  stappen: string[]
}

export type ProefUitslag =
  | { soort: 'onbekend' }
  | { soort: 'leeg' }
  | { soort: 'goed' }
  | { soort: 'fout'; stappen: string[]; antwoordLatex: string }

/**
 * In de les heet het arctan, in de rekenmachine atan. Zonder AI-controle
 * herkennen we die schoolnaam hier zelf, anders telt een goed antwoord fout.
 */
const SCHOOLNAAM: Array<[RegExp, string]> = [
  [/\barctan\b/gi, 'atan'],
  [/\barcsin\b/gi, 'asin'],
  [/\barccos\b/gi, 'acos'],
]

const BESTANDEN: Record<(typeof THEORIE_SLUGS)[number], BronVraag[][]> = {
  primitieve: [k0b.vragen],
  substitutiemethode: [k1b.vragen],
  'partieel-integreren': [k2a.vragen],
  oppervlakte: [oppervlakteEen.vragen],
  inhoud: [inhoudXas.vragen],
  k3: [k3b.vragen],
}

function goedAntwoord(vraag: BronVraag): string | null {
  // Bij een bepaalde integraal of een toepassing is het antwoord de uitkomst,
  // niet de primitieve. Een leerling die alleen F(x) opschrijft, is dan nog niet klaar.
  if (vraag.waarde !== undefined && vraag.waarde !== null) return String(vraag.waarde)
  if (vraag.primitieve) return vraag.primitieve
  return null
}

function geschikt(vraag: BronVraag): vraag is BronVraag & {
  latex: string
  antwoord_latex: string
  stappen: string[]
} {
  return Boolean(
    vraag.latex &&
      vraag.antwoord_latex &&
      vraag.stappen &&
      vraag.stappen.length > 0 &&
      goedAntwoord(vraag),
  )
}

/** Eerst de makkelijkste drie. Zijn die er niet, dan de eerste drie die wel nakijkbaar zijn. */
function kiesDrie(vragen: BronVraag[]): VolledigeSom[] {
  const bruikbaar = vragen.filter(geschikt)
  const makkelijk = bruikbaar.filter((vraag) => vraag.niveau === 1)
  const bron = makkelijk.length >= 3 ? makkelijk : bruikbaar
  return bron.slice(0, 3).map((vraag, volgnummer) => ({
    volgnummer,
    latex: vraag.latex,
    goedAntwoord: goedAntwoord(vraag)!,
    alternatieven: vraag.alternatieven ?? [],
    antwoordLatex: vraag.antwoord_latex,
    stappen: vraag.stappen,
  }))
}

const PER_HOOFDSTUK = new Map<string, VolledigeSom[]>(
  THEORIE_SLUGS.map((slug) => {
    const bestanden = BESTANDEN[slug] ?? []
    return [slug, kiesDrie(bestanden.flat())]
  }),
)

export function proefSommen(slug: string): ProefSom[] | null {
  const lijst = PER_HOOFDSTUK.get(slug)
  if (!lijst || lijst.length < 3) return null
  return lijst.map(({ volgnummer, latex }) => ({ volgnummer, latex }))
}

function naarRekenmachine(tekst: string): string {
  let uit = tekst
  for (const [van, naar] of SCHOOLNAAM) uit = uit.replace(van, naar)
  return uit
}

export function proefKlopt(leerling: string, goed: string, alternatieven: string[]): boolean {
  const tekst = leerling.trim()
  if (!tekst) return false
  const vormen = tekst === naarRekenmachine(tekst) ? [tekst] : [tekst, naarRekenmachine(tekst)]
  return vormen.some((vorm) => answersMatch(vorm, goed, alternatieven))
}

export function beoordeelProef(slug: string, volgnummer: number, leerling: string): ProefUitslag {
  const vraag = PER_HOOFDSTUK.get(slug)?.find((som) => som.volgnummer === volgnummer)
  if (!vraag) return { soort: 'onbekend' }
  if (!leerling.trim()) return { soort: 'leeg' }
  if (proefKlopt(leerling, vraag.goedAntwoord, vraag.alternatieven)) return { soort: 'goed' }
  return { soort: 'fout', stappen: vraag.stappen, antwoordLatex: vraag.antwoordLatex }
}
