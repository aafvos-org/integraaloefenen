import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

/**
 * Migratie 0068 haalt zeven schrijfwijzen uit answer_alternatives, omdat ze niet
 * overal gelijk zijn aan het modelantwoord. De bron van K.0 en K.1 mag ze niet
 * terugzetten, anders komen ze bij een nieuwe generatie weer in de database.
 * De al gedraaide migraties 0034–0036 blijven zoals ze zijn.
 */
const VERBODEN = [
  '0,333sin(3x)',
  '4/3 ln(3x + 2) + c',
  '-3ln(5 - 2x) + c',
  'ln(x^2 + 5x + 1) + c',
  '-ln(cos(4x))/4 + c',
  '-2ln(cos(x/2)) + c',
  '2x ln(x) - x ln(3) - 2x + c',
]

const BRONNEN = ['scripts/k0b-content.ts', 'scripts/k1a-content.ts', 'scripts/k1b-content.ts']

const wortel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

function alternatieven(bestand: string): string[] {
  const tekst = readFileSync(path.join(wortel, bestand), 'utf8')
  return [...tekst.matchAll(/alts:\s*\[([^\]]*)\]/g)].flatMap((m) =>
    [...m[1].matchAll(/'([^']*)'/g)].map((s) => s[1]),
  )
}

describe('goedgekeurde antwoorden in de bron van K.0 en K.1', () => {
  it('zet de zeven foute schrijfwijzen niet meer in de alternatieven', () => {
    const gevonden = BRONNEN.flatMap((bestand) =>
      alternatieven(bestand)
        .filter((alt) => VERBODEN.includes(alt))
        .map((alt) => `${bestand}: ${alt}`),
    )
    expect(gevonden).toEqual([])
  })
})
