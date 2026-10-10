import { describe, expect, it } from 'vitest'

import { antwoordPrefix, opdrachtSleutel, opgavesoort } from './opdracht'

// De opgaven hieronder staan letterlijk zo in de databank (supabase/migrations
// en supabase/seed.sql), zodat de test over echte vragen gaat.

describe('opgavesoort', () => {
  it('ziet een kale functie als primitiveer-opgave', () => {
    expect(opgavesoort('f(x) = 3x^{2}')).toBe('primitieve')
    expect(opgavesoort('f(x) = -2x^{8} + 3x^{3} - x')).toBe('primitieve')
    expect(opgavesoort('h(t) = 4t^{5} - 3t^{2} + 1')).toBe('primitieve')
    expect(opgavesoort('f(x) = \\dfrac{(\\sqrt{x} + 1)^{2}}{x}')).toBe('primitieve')
  })

  it('ziet een kale integraal met grenzen als bepaalde integraal', () => {
    expect(opgavesoort('\\int_{0}^{1} e^{x}\\,dx')).toBe('bepaalde-integraal')
    expect(opgavesoort('\\int_{-1}^{2} (x^{2} + x)\\,dx')).toBe('bepaalde-integraal')
    expect(opgavesoort('\\int_{\\frac{1}{4}\\pi}^{\\frac{3}{4}\\pi} \\sin(x)\\,dx')).toBe(
      'bepaalde-integraal',
    )
  })

  it('ziet een kale integraal zonder grenzen als onbepaalde integraal', () => {
    expect(opgavesoort('\\int (2x+1)^{3}\\,dx')).toBe('onbepaalde-integraal')
  })

  it('laat een opgave die zelf al zegt wat er moet gebeuren met rust', () => {
    const eigen = [
      'Primitiveer: $f(x) = \\tan(4x)$',
      'Bereken exact: $\\displaystyle\\int_{0}^{1} x\\mathrm{e}^{x}\\,\\mathrm{d}x$',
      'Bereken exact met de substitutie $\\sqrt{x + 4} = g$: $\\displaystyle\\int_{0}^{12} \\dfrac{x}{\\sqrt{x + 4}}\\,\\mathrm{d}x$',
      'Los exact op: $e^{2x} - 5e^{x} + 6 = 0$',
      '$\\int_{0}^{p} 3x^{2}\\,dx = 8$. Bereken $p$.',
      'Gegeven is $f(x) = 4 - x^{2}$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafiek van $f$ en de $x$-as.',
    ]
    for (const body of eigen) {
      expect(opgavesoort(body), body).toBe('eigen-opdracht')
    }
  })

  it('valt terug op niets-erbij als de opgave leeg is', () => {
    expect(opgavesoort(null)).toBe('eigen-opdracht')
    expect(opgavesoort('   ')).toBe('eigen-opdracht')
  })
})

describe('opdrachtSleutel', () => {
  it('geeft per soort de goede regel', () => {
    expect(opdrachtSleutel('f(x) = 3x^{2}')).toBe('promptPrimitieve')
    expect(opdrachtSleutel('\\int_{0}^{1} e^{x}\\,dx')).toBe('promptBepaaldeIntegraal')
    expect(opdrachtSleutel('\\int (2x+1)^{3}\\,dx')).toBe('promptOnbepaaldeIntegraal')
    expect(opdrachtSleutel('Primitiveer: $f(x) = \\tan(4x)$')).toBeNull()
  })
})

describe('antwoordPrefix', () => {
  it('neemt de functieletter en de variabele over', () => {
    expect(antwoordPrefix('f(x) = 3x^{2}')).toBe('F(x) =')
    expect(antwoordPrefix('h(t) = 4t^{5} - 3t^{2} + 1')).toBe('H(t) =')
    expect(antwoordPrefix('Primitiveer: $h(x) = \\dfrac{\\cos(x)}{\\sin^{3}(x)}$')).toBe(
      'H(x) =',
    )
  })

  it('zet niets boven het antwoord als er geen primitieve gevraagd wordt', () => {
    // Het antwoord is een getal of een waarde van p; "F(x) = 1,72" zou de
    // leerling op het verkeerde been zetten.
    const geenPrimitieve = [
      '\\int_{0}^{1} e^{x}\\,dx',
      'Bereken exact: $\\displaystyle\\int_{0}^{1} x\\mathrm{e}^{x}\\,\\mathrm{d}x$',
      'Los exact op: $e^{2x} - 5e^{x} + 6 = 0$',
      '$\\int_{0}^{p} 3x^{2}\\,dx = 8$. Bereken $p$.',
      'Gegeven is $f(x) = 4 - x^{2}$. Bereken exact de oppervlakte van het vlakdeel ingesloten door de grafiek van $f$ en de $x$-as.',
    ]
    for (const body of geenPrimitieve) {
      expect(antwoordPrefix(body), body).toBe('')
    }
  })

  it('valt terug op f als er geen functieletter staat', () => {
    expect(antwoordPrefix('\\int (2x+1)^{3}\\,dx')).toBe('F(x) =')
  })

  it('zet niets boven het antwoord bij een lege opgave', () => {
    expect(antwoordPrefix(null)).toBe('')
  })
})
