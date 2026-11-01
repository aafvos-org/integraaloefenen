import { describe, expect, it } from 'vitest'

import { genereerStandaardNaam } from './standaard-naam'

/** Een random-functie die een vaste rij getallen afgeeft, voor een voorspelbare uitkomst. */
function vasteRij(...waarden: number[]): () => number {
  let i = 0
  return () => waarden[i++ % waarden.length]
}

describe('genereerStandaardNaam', () => {
  it('plakt bijvoeglijk naamwoord, zelfstandig naamwoord en een getal aan elkaar', () => {
    const naam = genereerStandaardNaam(vasteRij(0, 0, 0))
    expect(naam).toMatch(/^[A-Za-z]+ [A-Za-z]+\d{4}$/)
  })

  it('kiest een ander woord bij een andere random-uitkomst', () => {
    const eerste = genereerStandaardNaam(vasteRij(0, 0, 0))
    const tweede = genereerStandaardNaam(vasteRij(0.99, 0.99, 0.99))
    expect(tweede).not.toBe(eerste)
  })

  it('past altijd binnen de 40 tekens van het veld', () => {
    for (let i = 0; i < 100; i++) {
      const naam = genereerStandaardNaam(() => Math.random())
      expect(naam.length).toBeLessThanOrEqual(40)
    }
  })

  it('gebruikt Math.random als er geen random-functie wordt meegegeven', () => {
    const naam = genereerStandaardNaam()
    expect(naam).toMatch(/^[A-Za-z]+ [A-Za-z]+\d{4}$/)
  })
})
