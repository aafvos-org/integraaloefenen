import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { parse } from 'mathjs'
import { describe, expect, it } from 'vitest'

import { answersMatch } from '@/lib/practice/engine'

/**
 * De vragen uit hoofdstuk 11 over numeriek benaderen hebben geen primitieve.
 * Deze test rekent elke integraal zelf uit en kijkt of het afgeronde antwoord
 * daarbij past, ver genoeg van een grens waar de afronding zou kunnen omslaan.
 */

type Vraag = {
  nummer: string
  decimalen: number
  integrand: string
  grenzen: [number, number]
  ruwe: number
  benadering: string
  antwoord: string
  antwoord_latex: string
  stappen: string[]
}

const bestand = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../content/hoofdstuk-h11/h11-numeriek.json',
)

const vragen = (JSON.parse(readFileSync(bestand, 'utf8')) as { soort: string; vragen: Vraag[] }).vragen

function simpson(f: (x: number) => number, a: number, b: number, n: number): number {
  const h = (b - a) / n
  let som = f(a) + f(b)
  for (let i = 1; i < n; i++) som += (i % 2 === 0 ? 2 : 4) * f(a + i * h)
  return (som * h) / 3
}

function integreer(integrand: string, a: number, b: number): number {
  const code = parse(integrand.replace(/\bln\s*\(/g, 'log(')).compile()
  const fijn = simpson((x) => code.evaluate({ x }) as number, a, b, 80_000)
  const grof = simpson((x) => code.evaluate({ x }) as number, a, b, 20_000)
  if (Math.abs(fijn - grof) > 1e-8) {
    throw new Error(`integratie van ${integrand} is niet stabiel`)
  }
  return fijn
}

function schoolRond(waarde: number, decimalen: number): string {
  const factor = 10 ** decimalen
  const verschoven = waarde * factor
  return (Math.round(verschoven) / factor).toFixed(decimalen).replace('.', ',')
}

describe('H11 integralen numeriek berekenen', () => {
  it('heeft minstens acht vragen', () => {
    expect(vragen.length).toBeGreaterThanOrEqual(8)
  })

  for (const vraag of vragen) {
    it(`vraag ${vraag.nummer}: de integraal rondt af op ${vraag.antwoord}`, () => {
      expect(vraag.stappen).toHaveLength(4)
      const [a, b] = vraag.grenzen
      const uitkomst = integreer(vraag.integrand, a, b)
      expect(Math.abs(uitkomst - vraag.ruwe)).toBeLessThan(1e-7)

      const verschoven = vraag.ruwe * 10 ** vraag.decimalen
      const afstandTotGrens = Math.abs(verschoven - Math.trunc(verschoven) - 0.5)
      expect(afstandTotGrens).toBeGreaterThan(0.1)

      expect(schoolRond(vraag.ruwe, vraag.decimalen)).toBe(vraag.antwoord)
      expect(schoolRond(vraag.ruwe, 5).replace(',', '{,}')).toBe(vraag.benadering)
      const tweede = Math.floor(vraag.ruwe * 100 + 1e-8) % 10
      const derde = Math.floor(vraag.ruwe * 1000 + 1e-8) % 10
      expect(vraag.stappen[2]).toContain(vraag.benadering)
      expect(vraag.stappen[3]).toContain(vraag.antwoord_latex)
      expect(vraag.stappen[3]).toContain(`Het derde cijfer achter de komma is $${derde}$`)
      expect(vraag.stappen[3]).toContain(`het tweede cijfer achter de komma, $${tweede}$`)
      const tweedeInAntwoord = Number(vraag.antwoord.split(',')[1]?.[1])
      expect(tweedeInAntwoord).toBe(derde >= 5 ? tweede + 1 : tweede)
      expect(answersMatch(vraag.antwoord.replace(',', '.'), vraag.antwoord)).toBe(true)
      expect(answersMatch(schoolRond(vraag.ruwe + 0.01, vraag.decimalen), vraag.antwoord)).toBe(false)
    })
  }
})
