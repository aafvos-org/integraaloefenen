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

  it('plakt twee getallen niet aan elkaar bij een maalteken', () => {
    expect(answersMatch('2*3', '6')).toBe(true)
    expect(answersMatch('1/2*3', '1,5')).toBe(true)
    expect(answersMatch('1/2·3', '1,5')).toBe(true)
    expect(answersMatch('2*e^3*5', '10e^3')).toBe(true)
    expect(answersMatch('1/2*x^2', '0,5x^2')).toBe(true)
    // en fout blijft fout
    expect(answersMatch('2*3', '23')).toBe(false)
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

  it('rekent een primitieve zonder + c goed', () => {
    // Zonder integratieconstante is de primitieve nog steeds een goede
    // primitieve. In content/ staat de constante er met opzet niet bij, in de
    // database vaak wel; die twee horen samen te vallen.
    expect(answersMatch('1/3x^3', '1/3x^3 + c')).toBe(true)
    expect(answersMatch('x^3', 'x^3 + c')).toBe(true)
    expect(answersMatch('x^3 + C', 'x^3')).toBe(true)
    expect(answersMatch('-cos(x)', '-cos(x) + c')).toBe(true)
    // ook met een min ervoor: F - c is net zo goed een primitieve
    expect(answersMatch('x^3', 'x^3 - c')).toBe(true)
  })

  it('rekent een andere, even geldige constante bij + c goed', () => {
    // Bij een onbepaalde integraal loopt c over alle getallen: F(x) + c en
    // F(x) - 1 + c zijn precies dezelfde verzameling primitieven. Wie via de
    // substitutie g = x + 1 primitiveert, houdt die -1 over (INT-362).
    expect(answersMatch('(x+1)*ln(x+1)-x-1+c', '(x+1)ln(x+1) - x + c')).toBe(true)
    expect(answersMatch('(x+1)*ln(x+1)-x+5+c', '(x+1)ln(x+1) - x + c')).toBe(true)
    expect(answersMatch('1/3x^3 + 2 + c', '1/3x^3 + c')).toBe(true)
    // ook zonder dat de leerling zelf + c opschrijft
    expect(answersMatch('1/3x^3 + 2', '1/3x^3 + c')).toBe(true)
    // maar een andere functie blijft fout, ook met + c erbij
    expect(answersMatch('1/3x^3 + 2x + c', '1/3x^3 + c')).toBe(false)
  })

  it('geeft geen vrije constante weg zonder + c in het goede antwoord', () => {
    // Hier hoort geen integratieconstante bij, dus een getal ernaast is fout.
    expect(answersMatch('p=5', 'p=2')).toBe(false)
    expect(answersMatch('5 + c', '2')).toBe(false)
    expect(answersMatch('ln(2) - 1 + c', 'ln(2)')).toBe(false)
    expect(answersMatch('x^3 + 1', 'x^3')).toBe(false)
  })

  it('rekent dezelfde functie anders opgeschreven goed', () => {
    // De drie gevallen uit de echte data (INT-79).
    expect(answersMatch('x^3', 'x^3 + c')).toBe(true)
    expect(answersMatch('((3x+4)^(6))/(18)', '(3x+4)^6 / 18 + c')).toBe(true)
    expect(answersMatch('x^-1-x^-2-x^-3', '1/x - 1/x^2 - 1/x^3 + c')).toBe(true)
  })

  it('rekent andere schrijfwijzen van dezelfde primitieve goed', () => {
    expect(answersMatch('x^3/3', '1/3x^3 + c')).toBe(true)
    expect(answersMatch('(1/2)x^2', '0,5x^2 + c')).toBe(true)
    expect(answersMatch('2sqrt(x)', '2x^(1/2) + c')).toBe(true)
    expect(answersMatch('e^(2x)/2', '1/2e^(2x) + c')).toBe(true)
  })

  it('slaat niet door naar een fout antwoord', () => {
    expect(answersMatch('x^3', 'x^4 + c')).toBe(false)
    // een losse c is geen antwoord
    expect(answersMatch('c', 'x^3 + c')).toBe(false)
    expect(answersMatch('c', 'c')).toBe(true) // alleen nog via de tekst
    expect(answersMatch('1/3x^3', 'x^3 + c')).toBe(false)
    expect(answersMatch('ln(x)', 'ln(-x) + c')).toBe(false)
    expect(answersMatch('sqrt(x^2)', 'x + c')).toBe(false)
    // een bepaalde integraal blijft een exact getal
    expect(answersMatch('0,69', 'ln(2)')).toBe(false)
    expect(answersMatch('5', '7')).toBe(false)
  })

  it('rekent een getal dat uitkomt op hetzelfde goed', () => {
    expect(answersMatch('6/18', '1/3')).toBe(true)
    expect(answersMatch('2ln(2)', 'ln(4)')).toBe(true)
  })

  it('leest de wetenschappelijke notatie van een rekenmachine', () => {
    expect(answersMatch('1e5', '100000')).toBe(true)
    expect(answersMatch('2,5e3', '2500')).toBe(true)
    expect(answersMatch('1e5', '13,59')).toBe(false)
    // een teken achter de e houdt de constante van Euler: 2e - 3, niet 0,002
    expect(answersMatch('2e-3', '-3 + 2e')).toBe(true)
    expect(answersMatch('2e-3', '0,002')).toBe(false)
  })

  it('kent arctan, arcsin en arccos, ook zonder + c', () => {
    // In de les en in de database staan de schoolnamen. De rekenmachine
    // kende alleen atan, asin en acos, waardoor een goed antwoord zonder
    // + c niet doorgerekend werd en als fout telde.
    expect(answersMatch('arctan(x)', 'arctan(x) + c')).toBe(true)
    expect(answersMatch('arcsin(x)', 'arcsin(x) + c')).toBe(true)
    expect(answersMatch('arccos(x)', 'arccos(x) + c')).toBe(true)
    expect(answersMatch('2arctan(x)', '2*arctan(x)+c')).toBe(true)
    expect(answersMatch('atan(x)', 'arctan(x)')).toBe(true)
    expect(answersMatch('asin(x)', 'arcsin(x) + c')).toBe(true)
    expect(answersMatch('acos(x)', 'arccos(x)')).toBe(true)
    expect(answersMatch('arcsin(x)', 'arctan(x) + c')).toBe(false)
  })

  it('rekent staafjes hetzelfde als abs', () => {
    expect(answersMatch('ln|x+2|', 'ln(abs(x+2))')).toBe(true)
    expect(answersMatch('ln(|x+2|)', 'ln(abs(x+2))')).toBe(true)
    expect(answersMatch('ln|x+2| + c', 'ln(abs(x+2)) + c')).toBe(true)
    expect(answersMatch('x + 2ln|x+1| + c', 'x + 2ln(abs(x+1)) + c')).toBe(true)
    expect(answersMatch('ln|x+3|', 'ln(abs(x+2))')).toBe(false)
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

  it('maakt van het π-teken gewoon pi', () => {
    expect(normalizeAnswer('π')).toBe('pi')
    expect(normalizeAnswer('2π')).toBe('2pi')
    expect(normalizeAnswer('sin(πx)')).toBe('sin(pix)')
  })

  it('haalt het maalteken weg waar dat niets verandert', () => {
    expect(normalizeAnswer('2 * x')).toBe('2x')
    expect(normalizeAnswer('2 · ln(x)')).toBe('2ln(x)')
    expect(normalizeAnswer('(x+1)*3')).toBe('(x+1)3')
    expect(normalizeAnswer('2*(x+1)')).toBe('2(x+1)')
  })

  it('laat het maalteken staan waar weglaten iets anders betekent', () => {
    // anders wordt dit 1/23 in plaats van 1,5
    expect(normalizeAnswer('1/2*3')).toBe('1/2*3')
    expect(normalizeAnswer('1/2·3')).toBe('1/2*3')
    expect(normalizeAnswer('2*3')).toBe('2*3')
    expect(normalizeAnswer('x²*3')).toBe('x^2*3')
    expect(normalizeAnswer('2*-3')).toBe('2*-3')
  })

  it('maakt van een getypte macht een macht met een dakje', () => {
    expect(normalizeAnswer('x²')).toBe('x^2')
    expect(normalizeAnswer('x³ + c')).toBe('x^3+c')
    // een hele rij machttekens hoort bij één exponent
    expect(normalizeAnswer('x¹⁰')).toBe('x^10')
    expect(normalizeAnswer('x⁻¹')).toBe('x^-1')
    // x^1 blijft gewoon x, net als bij een getypt dakje
    expect(normalizeAnswer('x¹')).toBe('x')
  })
})

describe('antwoorden van het symbolentoetsenbord', () => {
  it('rekent π en pi hetzelfde', () => {
    expect(answersMatch('π', 'pi', [])).toBe(true)
    expect(answersMatch('2π', '2 * pi', [])).toBe(true)
  })

  it('rekent x² en x^2 hetzelfde', () => {
    expect(answersMatch('arcsin(x²) + c', 'arcsin(x^2) + c', [])).toBe(true)
    expect(answersMatch('(1/3)x³ + c', '(1/3) * x^3 + c', [])).toBe(true)
  })

  it('blijft een fout antwoord fout rekenen', () => {
    expect(answersMatch('x²', 'x^3', [])).toBe(false)
  })
})
