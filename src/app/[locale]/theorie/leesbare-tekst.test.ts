import { describe, expect, it } from 'vitest'

import { THEORY_OVERVIEW } from '@/lib/theory'

import { leesbareTekst, leesbareWiskunde } from './leesbare-tekst'

describe('leesbare wiskunde', () => {
  it('maakt van een formule een zin zonder LaTeX-commando', () => {
    expect(leesbareWiskunde('\\int \\frac{a}{x^2+1}\\,dx = a\\arctan(x)+c')).toBe(
      '∫ a/(x²+1) dx = a arctan(x)+c',
    )
    expect(leesbareTekst('De noemer is precies $x^2+1$, dus de primitieve is $\\arctan(x)$.')).toBe(
      'De noemer is precies x²+1, dus de primitieve is arctan(x).',
    )
    expect(
      leesbareTekst('Deel teller en noemer door $9$: $\\dfrac{2}{4x^2+9}=\\dfrac{\\frac29}{\\frac49x^2+1}$.'),
    ).toBe('Deel teller en noemer door 9: 2/(4x²+9)=(2/9)/((4/9)x²+1).')
    expect(leesbareWiskunde('\\int_{0}^{1\\frac12} \\frac{2}{4x^2+9}\\,dx')).toBe(
      '∫ van 0 tot 1 (1/2) 2/(4x²+9) dx',
    )
    expect(leesbareWiskunde('\\int_{-\\frac13\\sqrt3}^{\\sqrt3} \\frac{1}{x^2+1}\\,dx')).toBe(
      '∫ van -(1/3)√(3) tot √(3) 1/(x²+1) dx',
    )
  })

  it('laat in elke route geen LaTeX-commando achter', () => {
    const over = []
    for (const ch of THEORY_OVERVIEW) {
      for (const card of ch.cards) {
        const stukken = [
          card.formula,
          card.answerNote,
          ...(card.notes ?? []),
          ...(card.examples ?? []).flatMap((ex) => [ex.problem, ex.answer, ...(ex.steps ?? [])]),
          ...(card.herken ?? []).flatMap((h) => [h.problem, h.regel, h.waarom]),
          ...(card.table?.headers ?? []),
          ...(card.table?.rows ?? []).flat(),
        ].filter((s): s is string => Boolean(s))
        for (const stuk of stukken) {
          const tekst = stuk.includes('$') ? leesbareTekst(stuk) : leesbareWiskunde(stuk)
          if (/\\[a-zA-Z]/.test(tekst)) over.push(`${card.id}: ${tekst}`)
        }
      }
    }
    expect(over).toEqual([])
  })
})

describe('oefenlinks van K.3', () => {
  it('wijst naar de blokken k3a, k3b en k3c, niet naar chapter=k3', () => {
    const k3 = THEORY_OVERVIEW.find((ch) => ch.slug === 'k3')
    expect(k3?.oefenlinks?.map((link) => link.href)).toEqual([
      '/oefenen?blok=k3a',
      '/oefenen?blok=k3b',
      '/oefenen?blok=k3c',
    ])
  })
})
