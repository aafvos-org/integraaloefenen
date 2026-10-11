import { describe, expect, it } from 'vitest'

import { seintjeAanmelding, seintjeBevestigd } from './beheer'

/**
 * De twee seintjes aan de beheerder. Ze gaan over twee verschillende
 * momenten en moeten in het postvak uit elkaar te houden zijn zónder dat
 * ze geopend worden — dus staat het verschil vooraan in het onderwerp.
 */

const LEERLING = {
  id: '11111111-2222-3333-4444-555555555555',
  email: 'iemand@voorbeeld.nl',
  gebruikersnaam: 'iemand',
}

const MOMENT = new Date('2026-10-11T09:30:00Z')

describe('de onderwerpen', () => {
  it('beginnen met het moment waar het seintje over gaat', () => {
    expect(seintjeAanmelding(LEERLING, MOMENT).onderwerp).toMatch(
      /^Aanmelding: /,
    )
    expect(seintjeBevestigd(LEERLING, MOMENT).onderwerp).toMatch(
      /^Bevestigd: /,
    )
  })

  it('zijn niet hetzelfde', () => {
    expect(seintjeAanmelding(LEERLING, MOMENT).onderwerp).not.toEqual(
      seintjeBevestigd(LEERLING, MOMENT).onderwerp,
    )
  })

  it('blijven kort genoeg om in een postvak te lezen', () => {
    for (const seintje of [
      seintjeAanmelding(LEERLING, MOMENT),
      seintjeBevestigd(LEERLING, MOMENT),
    ]) {
      expect(seintje.onderwerp.length).toBeLessThanOrEqual(78)
    }
  })
})

describe('wat er in het seintje staat', () => {
  it('noemt adres, gebruikersnaam, moment en id', () => {
    const { html } = seintjeAanmelding(LEERLING, MOMENT)
    expect(html).toContain('iemand@voorbeeld.nl')
    expect(html).toContain('iemand')
    expect(html).toContain(LEERLING.id)
    // Nederlandse tijd: 09:30 UTC is 11:30 in Amsterdam.
    expect(html).toContain('11:30')
  })

  it('zet een streepje neer waar niets bekend is', () => {
    const { html } = seintjeAanmelding(
      { id: 'abc', email: null, gebruikersnaam: null },
      MOMENT,
    )
    expect(html).toContain('<td>—</td>')
  })

  it('laat een gebruikersnaam met punthaken geen HTML worden', () => {
    const { html } = seintjeBevestigd(
      { id: 'abc', email: null, gebruikersnaam: '<b>stout</b>' },
      MOMENT,
    )
    expect(html).not.toContain('<b>stout</b>')
    expect(html).toContain('&lt;b&gt;stout&lt;/b&gt;')
  })

  it('zegt bij een aanmelding dat het adres nog niet bevestigd is', () => {
    expect(seintjeAanmelding(LEERLING, MOMENT).html).toMatch(
      /nog\s+niet\s+bevestigd/,
    )
  })
})
