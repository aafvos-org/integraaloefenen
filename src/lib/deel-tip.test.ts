import { describe, expect, it } from 'vitest'

import { magEersteGoedeTipTonen, onthoudEersteGoedeTipGetoond } from './deel-tip'

/** Nep-opslag met dezelfde vorm als localStorage, zonder een browser nodig te hebben. */
function nepOpslag(): Storage {
  const data = new Map<string, string>()
  return {
    getItem: (sleutel: string) => data.get(sleutel) ?? null,
    setItem: (sleutel: string, waarde: string) => void data.set(sleutel, waarde),
  } as Storage
}

describe('eerste-goede-tip', () => {
  it('mag getoond worden bij het eerste goede antwoord', () => {
    expect(magEersteGoedeTipTonen(nepOpslag())).toBe(true)
  })

  it('mag niet nog eens getoond worden na het tweede goede antwoord', () => {
    const opslag = nepOpslag()
    expect(magEersteGoedeTipTonen(opslag)).toBe(true)
    onthoudEersteGoedeTipGetoond(opslag)

    // Een volgend goed antwoord, in dezelfde of een nieuwe sessie: de vlag staat al.
    expect(magEersteGoedeTipTonen(opslag)).toBe(false)
  })

  it('zonder opslag (bijv. privévenster) blokkeert niets, maar onthoudt ook niets', () => {
    expect(magEersteGoedeTipTonen(null)).toBe(true)
    expect(() => onthoudEersteGoedeTipGetoond(null)).not.toThrow()
  })
})
