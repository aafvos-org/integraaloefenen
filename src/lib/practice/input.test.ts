import { describe, expect, it } from 'vitest'

import { insertAtCursor, toLatexPreview } from './input'

describe('live formule-voorvertoning', () => {
  it('toont niets bij lege invoer', () => {
    expect(toLatexPreview('')).toBe('')
    expect(toLatexPreview('   ')).toBe('')
  })

  it('zet sqrt(x) om naar een wortelteken', () => {
    expect(toLatexPreview('sqrt(x)')).toBe('\\sqrt{x}')
  })

  it('zet een breuk (1)/(2) om naar een breukstreep', () => {
    expect(toLatexPreview('(1)/(2)')).toBe('\\dfrac{1}{2}')
  })

  it('laat bij een open macht x^ een leeg vakje zien', () => {
    expect(toLatexPreview('x^')).toBe('x^{\\square}')
  })

  it('zet pi om naar het pi-teken', () => {
    expect(toLatexPreview('pi')).toBe('\\pi')
  })
})

describe('invoegen op de cursor', () => {
  it('zet de tekst op de cursorplek', () => {
    expect(insertAtCursor('x', 1, 1, '+1')).toEqual({ value: 'x+1', caret: 3 })
  })

  it('zet de cursor op het | -teken in de invoegtekst', () => {
    expect(insertAtCursor('', 0, 0, 'sqrt(|)')).toEqual({
      value: 'sqrt()',
      caret: 5,
    })
  })
})
