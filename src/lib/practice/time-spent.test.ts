import { describe, expect, it } from 'vitest'

import { timeSpentSecVoorOpslag } from './time-spent'

describe('timeSpentSecVoorOpslag', () => {
  it('bewaart een gewone meting', () => {
    expect(timeSpentSecVoorOpslag(12)).toBe(12)
    expect(timeSpentSecVoorOpslag(0)).toBe(0)
  })

  it('rondt af op hele seconden', () => {
    expect(timeSpentSecVoorOpslag(12.4)).toBe(12)
    expect(timeSpentSecVoorOpslag(12.6)).toBe(13)
  })

  it('laat de tijd leeg als de kaart niets meegeeft', () => {
    expect(timeSpentSecVoorOpslag(undefined)).toBeNull()
  })

  it('weigert onmogelijke waarden', () => {
    expect(timeSpentSecVoorOpslag(-5)).toBeNull()
    expect(timeSpentSecVoorOpslag(Number.NaN)).toBeNull()
    expect(timeSpentSecVoorOpslag(Number.POSITIVE_INFINITY)).toBeNull()
  })

  it('weigert een tabblad dat uren open stond', () => {
    expect(timeSpentSecVoorOpslag(2 * 60 * 60)).toBe(7200)
    expect(timeSpentSecVoorOpslag(2 * 60 * 60 + 1)).toBeNull()
  })
})
