import { describe, expect, it } from 'vitest'

import { deelAdres, openDeelmenu } from './delen'

describe('deelAdres', () => {
  it('zet van=klas op de huidige pagina', () => {
    expect(deelAdres('https://integraaloefenen.nl/nl/theorie/primitieve')).toBe(
      'https://integraaloefenen.nl/nl/theorie/primitieve?van=klas',
    )
  })

  it('houdt bestaande parameters en vervangt een oude herkomst', () => {
    expect(
      deelAdres('https://integraaloefenen.nl/nl/oefenen?blok=k1a&van=youtube'),
    ).toBe('https://integraaloefenen.nl/nl/oefenen?blok=k1a&van=klas')
  })

  it('wijst naar een ander pad als de knop een hoofdstuk deelt', () => {
    expect(
      deelAdres('https://integraaloefenen.nl/nl/theorie', '/nl/theorie/oppervlakte#voorbeeldopgaven'),
    ).toBe('https://integraaloefenen.nl/nl/theorie/oppervlakte?van=klas#voorbeeldopgaven')
  })
})

describe('openDeelmenu', () => {
  it('opent het menu alleen op een telefoon die dat kan', () => {
    expect(openDeelmenu(390, true)).toBe(true)
    expect(openDeelmenu(1280, true)).toBe(false)
    expect(openDeelmenu(390, false)).toBe(false)
  })
})
