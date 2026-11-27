import { describe, expect, it } from 'vitest'

import { bouwBezoeken, herkomstVan } from './overzicht'
import { vertaalRij, type TabelRij } from './vertalen'

// De rijen van integraal krijgen de vorm die het rekenwerk verwacht.

function tabelRij(deel: Partial<TabelRij>): TabelRij {
  return {
    sessie_id: 's1',
    tijdstip: '2026-11-27T10:00:00.000Z',
    volgnummer: 1,
    soort: 'pagina',
    pad: '/nl',
    doel: null,
    scrolldiepte: null,
    apparaat: 'telefoon',
    verwijzer: null,
    van: null,
    utm_source: null,
    ingelogd: false,
    schuilnaam: null,
    site: 'integralen',
    ...deel,
  }
}

describe('vertaalRij', () => {
  it('noemt geregistreerd en ingelogd zoals het rekenwerk ze kent', () => {
    expect(vertaalRij(tabelRij({ soort: 'geregistreerd' })).soort).toBe('registratie')
    expect(vertaalRij(tabelRij({ soort: 'ingelogd' })).soort).toBe('inlog')
    expect(vertaalRij(tabelRij({ soort: 'dode_klik' })).soort).toBe('dode_klik')
  })

  it('zet scrolldiepte in waarde', () => {
    expect(vertaalRij(tabelRij({ soort: 'scroll', scrolldiepte: 75 })).waarde).toBe(75)
  })

  it('zet van en utm_source terug in het pad, zodat de herkomst klopt', () => {
    const rij = vertaalRij(tabelRij({ pad: '/nl/voorbeeld/sin-2x', van: 'youtube' }))
    expect(rij.pad).toBe('/nl/voorbeeld/sin-2x?van=youtube')
    expect(herkomstVan([rij])).toBe('van=youtube')
    expect(herkomstVan([vertaalRij(tabelRij({ utm_source: 'chatgpt.com' }))])).toBe('chatgpt.com')
  })

  it('telt een registratie mee in de trechter', () => {
    const [bezoek] = bouwBezoeken([
      vertaalRij(tabelRij({ volgnummer: 1, pad: '/nl/registreren' })),
      vertaalRij(tabelRij({ volgnummer: 2, soort: 'geregistreerd', pad: '/nl/registreren' })),
    ])
    expect(bezoek.trechter.registratiepagina).toBe(true)
    expect(bezoek.trechter.account).toBe(true)
  })
})
