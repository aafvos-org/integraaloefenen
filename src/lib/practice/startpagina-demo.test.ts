import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { startpaginaKlopt } from './startpagina-demo'

function leesHomeDemoPlaceholder(): string {
  const nl = JSON.parse(readFileSync(join(process.cwd(), 'messages/nl.json'), 'utf8'))
  return nl.HomeDemo.placeholder
}

describe('voorbeeldopgaven op de startpagina', () => {
  it('rekent de primitieve van 6x+5 goed, ook zonder constante', () => {
    expect(startpaginaKlopt('easy', '3x^2+5x')).toBe(true)
    expect(startpaginaKlopt('easy', '3x^2 + 5x + c')).toBe(true)
    expect(startpaginaKlopt('easy', '5x+3x^2')).toBe(true)
    expect(startpaginaKlopt('easy', '3*x^(2)+5*x')).toBe(true)
    expect(startpaginaKlopt('easy', '6x+5')).toBe(false)
    expect(startpaginaKlopt('easy', '')).toBe(false)
  })

  it('telt een geplakt minteken bij 3x^2+5x als goed', () => {
    expect(startpaginaKlopt('easy', '3x^2+5x−c')).toBe(true)
    expect(startpaginaKlopt('easy', '3x^2−5x')).toBe(false)
  })

  it('rekent de primitieve van cos(3x) goed', () => {
    expect(startpaginaKlopt('medium', '1/3sin(3x)')).toBe(true)
    expect(startpaginaKlopt('medium', '(1/3)sin(3x)')).toBe(true)
    expect(startpaginaKlopt('medium', 'sin(3x)/3 + c')).toBe(true)
    expect(startpaginaKlopt('medium', '3cos(3x)')).toBe(false)
  })

  it('rekent de primitieve van x*e^x goed', () => {
    expect(startpaginaKlopt('hard', '(x-1)e^x')).toBe(true)
    expect(startpaginaKlopt('hard', 'xe^x-e^x')).toBe(true)
    expect(startpaginaKlopt('hard', '-e^x+xe^x + c')).toBe(true)
    expect(startpaginaKlopt('hard', 'e^x(x-1)')).toBe(true)
    expect(startpaginaKlopt('hard', '(x−1)e^x')).toBe(true)
    expect(startpaginaKlopt('hard', '(x^2+2x)e^x')).toBe(false)
  })
})

describe('placeholder van de proefsom-demo (INT-486)', () => {
  it('verklapt bij geen van de drie niveaus het juiste antwoord', () => {
    const typvoorbeeld = leesHomeDemoPlaceholder().replace(/^Bijv\.\s*/, '')

    // Een leerling hoeft de placeholder maar over te typen; die mag dus nooit
    // zelf het goede antwoord zijn — ook niet in een andere maar wiskundig
    // gelijke vorm (bijv. "sin(3x)/3" in plaats van "1/3sin(3x)").
    expect(startpaginaKlopt('easy', typvoorbeeld)).toBe(false)
    expect(startpaginaKlopt('medium', typvoorbeeld)).toBe(false)
    expect(startpaginaKlopt('hard', typvoorbeeld)).toBe(false)
  })
})
