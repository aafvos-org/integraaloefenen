import { describe, expect, it } from 'vitest'

import { teltAlsDodeKlik, type Klikcontext } from './dode-klik'

function klik(overschrijf: Partial<Klikcontext> = {}): Klikcontext {
  return { tag: 'span', klikbaar: false, selectie: false, ...overschrijf }
}

describe('teltAlsDodeKlik', () => {
  it('telt een klik op iets klikbaars nooit mee', () => {
    expect(teltAlsDodeKlik(klik({ tag: 'a', klikbaar: true }))).toBe(false)
  })

  it('telt een klik op tekst die nergens heen gaat wel mee', () => {
    expect(teltAlsDodeKlik(klik({ tag: 'span' }))).toBe(true)
    expect(teltAlsDodeKlik(klik({ tag: 'p' }))).toBe(true)
  })

  it('telt een kaart die klikbaar lijkt maar het niet is wel mee', () => {
    expect(teltAlsDodeKlik(klik({ tag: 'div' }))).toBe(true)
  })

  it('telt een tik naast de inhoud niet mee', () => {
    // Op de telefoon tikt een leerling naast de oefenkaart om het
    // toetsenbord weg te krijgen. Dan landt de tik op <main> zelf.
    for (const tag of ['main', 'body', 'html', 'header', 'footer', 'nav', 'form']) {
      expect(teltAlsDodeKlik(klik({ tag }))).toBe(false)
    }
  })

  it('kijkt niet naar hoofdletters in de tagnaam', () => {
    expect(teltAlsDodeKlik(klik({ tag: 'MAIN' }))).toBe(false)
  })

  it('telt een klik niet mee als er tekst geselecteerd staat', () => {
    expect(teltAlsDodeKlik(klik({ tag: 'span', selectie: true }))).toBe(false)
  })
})
