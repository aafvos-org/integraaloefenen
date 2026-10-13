import { describe, expect, it } from 'vitest'

import { heeftInlogsessie } from './sessie-cookie'

describe('heeftInlogsessie', () => {
  it('herkent de gewone sessiecookie en een opgeknipte', () => {
    expect(
      heeftInlogsessie([{ name: 'sb-oyevapifmenqjuklprws-auth-token' }]),
    ).toBe(true)
    expect(
      heeftInlogsessie([{ name: 'sb-oyevapifmenqjuklprws-auth-token.0' }]),
    ).toBe(true)
  })

  it('slaat een lege bezoeker en de tijdelijke inlogcode over', () => {
    expect(heeftInlogsessie([])).toBe(false)
    expect(heeftInlogsessie([{ name: 'sb-abc-auth-token-code-verifier' }])).toBe(
      false,
    )
    expect(heeftInlogsessie([{ name: 'anders' }])).toBe(false)
  })
})
