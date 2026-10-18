import { describe, expect, it } from 'vitest'

import {
  legeWoedestaat,
  volgendeWoedestaat,
  type Woedecontext,
  type Woedestaat,
} from './woede-klik'

function klik(overschrijf: Partial<Woedecontext> = {}): Woedecontext {
  return { x: 100, y: 100, t: 0, invoerveld: false, selectie: false, ...overschrijf }
}

/** Klikt een reeks achter elkaar en geeft per klik terug of er gemeld werd. */
function reeks(klikken: Woedecontext[]): boolean[] {
  let staat: Woedestaat = legeWoedestaat()
  const gemeld: boolean[] = []
  for (const een of klikken) {
    const stap = volgendeWoedestaat(staat, een)
    staat = stap.staat
    gemeld.push(stap.melden)
  }
  return gemeld
}

describe('volgendeWoedestaat', () => {
  it('meldt bij de derde klik binnen een seconde op dezelfde plek', () => {
    expect(reeks([klik({ t: 0 }), klik({ t: 200 }), klik({ t: 400 })])).toEqual([
      false,
      false,
      true,
    ])
  })

  it('meldt één keer per reeks, ook bij doorrammen', () => {
    const gemeld = reeks([0, 100, 200, 300, 400].map((t) => klik({ t })))
    expect(gemeld.filter(Boolean)).toHaveLength(1)
  })

  it('meldt niet bij een paar tikken in een invoerveld', () => {
    // Op de telefoon tikt een leerling een paar keer in het antwoordveld om
    // het toetsenbord te krijgen of de cursor te verzetten.
    const gemeld = reeks([0, 200, 400, 600].map((t) => klik({ t, invoerveld: true })))
    expect(gemeld).toEqual([false, false, false, false])
  })

  it('meldt niet als er tekst geselecteerd staat', () => {
    // Drie keer klikken op een alinea selecteert die alinea.
    const gemeld = reeks([klik({ t: 0 }), klik({ t: 100 }), klik({ t: 200, selectie: true })])
    expect(gemeld).toEqual([false, false, false])
  })

  it('telt rustig klikken niet mee', () => {
    const gemeld = reeks([0, 1200, 2400].map((t) => klik({ t })))
    expect(gemeld).toEqual([false, false, false])
  })

  it('begint opnieuw bij een klik verderop', () => {
    const gemeld = reeks([
      klik({ t: 0, x: 100 }),
      klik({ t: 100, x: 100 }),
      klik({ t: 200, x: 400 }),
    ])
    expect(gemeld).toEqual([false, false, false])
  })

  it('telt een klik vlak naast de vorige nog als dezelfde plek', () => {
    const gemeld = reeks([
      klik({ t: 0, x: 100, y: 100 }),
      klik({ t: 100, x: 120, y: 110 }),
      klik({ t: 200, x: 130, y: 120 }),
    ])
    expect(gemeld).toEqual([false, false, true])
  })

  it('kan na het invoerveld nog een woedeklik elders melden', () => {
    let staat = legeWoedestaat()
    for (const t of [0, 100, 200]) {
      staat = volgendeWoedestaat(staat, klik({ t, invoerveld: true })).staat
    }
    const elders = [400, 500, 600].map((t) => {
      const stap = volgendeWoedestaat(staat, klik({ t, x: 500, y: 500 }))
      staat = stap.staat
      return stap.melden
    })
    expect(elders).toEqual([false, false, true])
  })
})
