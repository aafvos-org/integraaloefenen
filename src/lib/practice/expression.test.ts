import { describe, expect, it } from 'vitest'

import { readFormula } from './expression'
import { normalizeAnswer } from './engine'

/** Leest de formule zoals `answersMatch` dat doet en rekent hem uit. */
function reken(bron: string, x: number): number | null {
  const formule = readFormula(normalizeAnswer(bron))
  return formule ? formule(x) : null
}

describe('readFormula', () => {
  it('rekent machten en breuken uit', () => {
    expect(reken('x^3', 2)).toBe(8)
    expect(reken('1/3x^3', 3)).toBe(9)
    expect(reken('x^3/3', 3)).toBe(9)
    expect(reken('1/x^2', 2)).toBe(0.25)
  })

  it('leest een weggelaten maalteken', () => {
    expect(reken('2*x', 3)).toBe(6)
    expect(reken('2x', 3)).toBe(6)
    expect(reken('2(x+1)', 3)).toBe(8)
    expect(reken('(x+1)(x+2)', 3)).toBe(20)
    expect(reken('x*ln(x)', Math.E)).toBeCloseTo(Math.E, 12)
  })

  it('leest een negatieve exponent', () => {
    expect(reken('x^-2', 2)).toBe(0.25)
    expect(reken('x^(-2)', 2)).toBe(0.25)
    expect(reken('-x^2', 3)).toBe(-9)
  })

  it('kent de functies en de constanten uit AGENTS.md', () => {
    expect(reken('sqrt(x)', 9)).toBe(3)
    expect(reken('e^x', 1)).toBeCloseTo(Math.E, 12)
    expect(reken('ln(x)', Math.E)).toBeCloseTo(1, 12)
    expect(reken('log10(x)', 1000)).toBeCloseTo(3, 12)
    expect(reken('sin(pi)', 0)).toBeCloseTo(0, 12)
    expect(reken('asin(x)', 1)).toBeCloseTo(Math.PI / 2, 12)
  })

  it('leest een komma als decimaalteken', () => {
    expect(reken('0,5x', 4)).toBe(2)
  })

  it('weigert wat hij niet kent', () => {
    // log(...) is te verwarrend: grondtal 10 in de les, grondtal e in software
    expect(readFormula('log(x)')).toBeNull()
    // de integratieconstante is geen getal dat we kunnen invullen
    expect(readFormula('x^3+c')).toBeNull()
    expect(readFormula('p=2')).toBeNull()
    expect(readFormula('')).toBeNull()
    expect(readFormula('x^')).toBeNull()
    expect(readFormula('(x+1')).toBeNull()
    expect(readFormula('sin')).toBeNull()
  })
})
