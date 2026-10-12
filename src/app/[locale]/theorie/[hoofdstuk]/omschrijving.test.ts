import { describe, expect, it } from 'vitest'

import { hoofdstukOmschrijving } from '../hoofdstuk-omschrijving'

describe('hoofdstukOmschrijving', () => {
  it('noemt het hoofdstuk en haalt de formules uit de intro', () => {
    const tekst = hoofdstukOmschrijving(
      'K.3 — Cyclometrische functies',
      'Elke integraal hier wordt $\\arctan$ of $\\arcsin$. De noemer zegt welke van de twee.',
    )
    expect(tekst).toContain('K.3')
    expect(tekst).toContain('arctan')
    expect(tekst).toContain('arcsin')
    expect(tekst).not.toContain('$')
  })
})
