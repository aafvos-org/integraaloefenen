import { describe, expect, it } from 'vitest'

import { proberenAdres, proberenSlug } from './proberen-redirect'

describe('proberenSlug', () => {
  it('gebruikt een chapter die al een echte theorieslug is', () => {
    expect(proberenSlug({ chapter: 'k3' })).toBe('k3')
  })

  it('leidt de slug af uit blok en cluster van een voorbeeldpagina', () => {
    // k2a_ln hoort bij /theorie/partieel-integreren, zie content/voorbeelden.ts
    expect(proberenSlug({ blok: 'k2a', cluster: 'k2a_ln' })).toBe('partieel-integreren')
  })

  it('leidt de slug af uit blok alleen, zonder cluster', () => {
    expect(proberenSlug({ blok: 'k0b' })).toBe('primitieve')
  })

  it('valt terug op primitieve zonder enige herkenbare combinatie', () => {
    expect(proberenSlug({})).toBe('primitieve')
    expect(proberenSlug({ blok: 'onbestaand', cluster: 'ook-onbestaand' })).toBe('primitieve')
  })
})

describe('proberenAdres', () => {
  it('behoudt van=voorbeeld in het adres', () => {
    expect(proberenAdres('nl', { blok: 'k2a', cluster: 'k2a_ln', van: 'voorbeeld' })).toBe(
      '/nl/proberen/partieel-integreren?van=voorbeeld',
    )
  })

  it('zet geen van in het adres als die er niet was', () => {
    expect(proberenAdres('nl', { blok: 'k0b' })).toBe('/nl/proberen/primitieve')
  })
})
