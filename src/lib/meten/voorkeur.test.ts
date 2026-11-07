import { describe, expect, it } from 'vitest'

import { leesMetenActie } from './voorkeur'

describe('leesMetenActie', () => {
  it('herkent uit en aan', () => {
    expect(leesMetenActie('uit')).toBe('uit')
    expect(leesMetenActie('aan')).toBe('aan')
  })

  it('negeert alles wat geen uit of aan is', () => {
    expect(leesMetenActie('Uit')).toBeNull()
    expect(leesMetenActie('')).toBeNull()
    expect(leesMetenActie('1')).toBeNull()
    expect(leesMetenActie(null)).toBeNull()
    expect(leesMetenActie(undefined)).toBeNull()
  })
})
