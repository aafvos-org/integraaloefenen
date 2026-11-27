import type { Soort } from '@/lib/meten/gebeurtenis'

import type { LeerlingRij } from './leerlingen'
import type { MeetSoort } from './overzicht'

// De klikmeting van integraal bewaart een paar dingen anders dan het
// rekenwerk (overgenomen van afgeleideoefenen.nl) verwacht. Hier staat de
// vertaling, los van de database zodat hij te testen is.

const SOORT_VERTALING: Record<Soort, MeetSoort> = {
  pagina: 'pagina',
  klik: 'klik',
  dode_klik: 'dode_klik',
  woedeklik: 'woedeklik',
  fout: 'fout',
  scroll: 'scroll',
  geregistreerd: 'registratie',
  ingelogd: 'inlog',
}

export type TabelRij = {
  sessie_id: string
  tijdstip: string
  volgnummer: number
  soort: Soort
  pad: string
  doel: string | null
  scrolldiepte: number | null
  apparaat: LeerlingRij['apparaat']
  verwijzer: string | null
  van: string | null
  utm_source: string | null
  ingelogd: boolean
  schuilnaam: string | null
  site: string
}

/**
 * Eén rij in de vorm van het rekenwerk. `van` en `utm_source` gaan terug in
 * de zoekreeks van het pad, zoals afgeleide ze bewaart.
 */
export function vertaalRij(rij: TabelRij): LeerlingRij {
  const zoek = new URLSearchParams()
  if (rij.van) zoek.set('van', rij.van)
  if (rij.utm_source) zoek.set('utm_source', rij.utm_source)
  const zoekreeks = zoek.toString()
  return {
    sessie_id: rij.sessie_id,
    tijdstip: rij.tijdstip,
    volgnummer: rij.volgnummer,
    soort: SOORT_VERTALING[rij.soort] ?? 'klik',
    pad: zoekreeks ? `${rij.pad}?${zoekreeks}` : rij.pad,
    doel: rij.doel,
    waarde: rij.scrolldiepte,
    apparaat: rij.apparaat,
    verwijzer: rij.verwijzer,
    ingelogd: rij.ingelogd,
    schuilnaam: rij.schuilnaam,
    site: rij.site,
  }
}

