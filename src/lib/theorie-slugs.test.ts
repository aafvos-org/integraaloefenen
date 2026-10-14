import { describe, expect, it } from 'vitest'

import { THEORY_OVERVIEW } from '@/lib/theory'

import { THEORIE_SLUGS, herschrijfVerzonnenTheorie } from './theorie-slugs'

describe('THEORIE_SLUGS', () => {
  it('noemt precies de hoofdstukken uit de theorie', () => {
    expect([...THEORIE_SLUGS].sort()).toEqual(THEORY_OVERVIEW.map((ch) => ch.slug).sort())
  })
})

describe('herschrijfVerzonnenTheorie', () => {
  it('laat een bestaand hoofdstuk met rust', () => {
    expect(herschrijfVerzonnenTheorie('/nl/theorie/k3')).toBeNull()
    expect(herschrijfVerzonnenTheorie('/theorie/k3')).toBeNull()
    expect(herschrijfVerzonnenTheorie('/nl/theorie/substitutiemethode')).toBeNull()
    expect(herschrijfVerzonnenTheorie('/nl/theorie/primitieve')).toBeNull()
    expect(herschrijfVerzonnenTheorie('/theorie/primitieve')).toBeNull()
  })

  it('laat het overzicht en andere pagina’s met rust', () => {
    expect(herschrijfVerzonnenTheorie('/nl/theorie/opengraph-image')).toBeNull()
    expect(herschrijfVerzonnenTheorie('/nl/theorie')).toBeNull()
    expect(herschrijfVerzonnenTheorie('/theorie')).toBeNull()
    expect(herschrijfVerzonnenTheorie('/nl/dit-pad-bestaat-niet')).toBeNull()
    expect(herschrijfVerzonnenTheorie('/nl/oefenen')).toBeNull()
  })

  it('stuurt een verzonnen slug naar een pad buiten /theorie', () => {
    expect(herschrijfVerzonnenTheorie('/nl/theorie/bestaat-niet-xyz')).toBe(
      '/pagina-bestaat-niet',
    )
    expect(herschrijfVerzonnenTheorie('/nl/theorie/verzonnen-slug')).toBe('/pagina-bestaat-niet')
    expect(herschrijfVerzonnenTheorie('/theorie/verzonnen-slug')).toBe('/pagina-bestaat-niet')
    expect(herschrijfVerzonnenTheorie('/nl/theorie/bestaat-niet-xyz/')).toBe(
      '/pagina-bestaat-niet',
    )
  })
})
