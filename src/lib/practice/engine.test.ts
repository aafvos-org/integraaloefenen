import { describe, expect, it } from 'vitest'

import { answersMatch, normalizeAnswer } from './engine'

// =====================================================================
// Nakijken: wanneer telt een antwoord meteen als goed?
//
// Dit is de controle vóór de AI. Alles wat hier al goed gerekend wordt,
// kost geen Gemini-aanroep. Wat hier niet doorkomt, gaat naar de AI-stap
// (zie src/lib/ai/stub.ts voor het testpad daarvan).
// =====================================================================
describe('answersMatch', () => {
  it('rekent een exact gelijk antwoord goed', () => {
    expect(answersMatch('1/3x^3 + c', '1/3x^3 + c')).toBe(true)
  })

  it('negeert spaties en hoofdletters', () => {
    expect(answersMatch('  1/3 X^3 + C ', '1/3x^3+c')).toBe(true)
  })

  it('rekent een weggelaten maalteken goed', () => {
    expect(answersMatch('2*ln(x)', '2ln(x)')).toBe(true)
    expect(answersMatch('2·ln(x)', '2ln(x)')).toBe(true)
  })

  it('rekent haakjes om een simpele exponent goed', () => {
    expect(answersMatch('x^(-1)', 'x^-1')).toBe(true)
    expect(answersMatch('e^(x)', 'e^x')).toBe(true)
  })

  it('laat haakjes om een samengestelde exponent staan', () => {
    // e^(x+1) is iets anders dan e^x + 1; dat mag niet samenvallen.
    expect(answersMatch('e^(x+1)', 'e^x+1')).toBe(false)
  })

  it('rekent x^1 gelijk aan x', () => {
    expect(answersMatch('5x^1', '5x')).toBe(true)
  })

  it('rekent het lange minteken als gewoon minteken', () => {
    expect(answersMatch('3x−2', '3x-2')).toBe(true)
  })

  it('rekent +- als minteken', () => {
    expect(answersMatch('3x+-2', '3x-2')).toBe(true)
  })

  it('rekent een alternatieve schrijfwijze uit de vraag goed', () => {
    // De alternatieven staan bij de vraag in de database; daar belandt ook
    // wat de AI-controle eerder als "anders opgeschreven" heeft goedgekeurd.
    expect(answersMatch('x^3/3 + c', '1/3x^3 + c', ['x^3/3 + c'])).toBe(true)
  })

  it('rekent een fout antwoord fout', () => {
    expect(answersMatch('x^2', '1/3x^3 + c')).toBe(false)
    expect(answersMatch('', '1/3x^3 + c')).toBe(false)
  })

  it('laat een ontbrekende + c hier nog staan', () => {
    // Zonder integratieconstante is de primitieve wiskundig nog steeds goed,
    // maar dat beoordeelt de AI-stap — hier blijft het een verschil.
    expect(answersMatch('1/3x^3', '1/3x^3 + c')).toBe(false)
  })
})

describe('normalizeAnswer', () => {
  it('raakt de inhoud van een functie niet aan', () => {
    expect(normalizeAnswer('ln(x^2+1)')).toBe('ln(x^2+1)')
  })

  it('maakt van een lege invoer een lege tekst', () => {
    expect(normalizeAnswer('   ')).toBe('')
  })

  it('maakt van een geplakt minteken een gewoon minteken', () => {
    // U+2212, wat je meekrijgt als je uit een pdf of uit Word plakt
    expect(normalizeAnswer('−cos(x) + c')).toBe('-cos(x)+c')
  })
})
