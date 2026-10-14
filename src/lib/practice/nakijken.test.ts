import { describe, expect, it, vi } from 'vitest'

import type { CheckAnswerResultNew } from '@/lib/ai/check-answer-new'

import { beoordeelAntwoord } from './nakijken'

const GOED_VOLGENS_AI: CheckAnswerResultNew = {
  errorExplanation: '',
  category: null,
  fromCache: false,
  isMathematicallyCorrect: true,
  generatedSteps: [],
}

describe('beoordeelAntwoord', () => {
  it('telt een wiskundig goed antwoord in een andere notatie één keer, zonder de AI', async () => {
    // x^3/3 en 1/3x^3 zijn dezelfde primitieve. De rekenregel ziet dat
    // zelf, dus de AI komt er niet aan te pas — ook niet als die stuk is.
    let aanroepen = 0
    const uitslag = await beoordeelAntwoord({
      leerling: 'x^3/3 + c',
      goedAntwoord: '1/3x^3 + c',
      alternatieven: [],
      vraagAi: async () => {
        aanroepen += 1
        throw new Error('AI niet bereikbaar')
      },
    })

    expect(uitslag).toEqual({ goed: true, uitleg: null })
    expect(aanroepen).toBe(0)
  })

  it('laat een mislukte AI-aanroep het antwoord niet verdwijnen', async () => {
    // De rekenregel zegt fout. De AI gooit én geeft een fout terug. In
    // beide gevallen blijft er een uitslag, zodat het scherm het antwoord
    // kan bewaren in plaats van de hele inzending te laten mislukken.
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})

    const gegooid = await beoordeelAntwoord({
      leerling: 'x^2',
      goedAntwoord: '1/3x^3 + c',
      alternatieven: [],
      vraagAi: async () => {
        throw new Error('AI niet bereikbaar')
      },
    })
    const foutTerug = await beoordeelAntwoord({
      leerling: 'x^2',
      goedAntwoord: '1/3x^3 + c',
      alternatieven: [],
      vraagAi: async () => ({ error: 'AI niet bereikbaar' }),
    })

    expect(gegooid).toEqual({ goed: false, uitleg: null })
    expect(foutTerug).toEqual({ goed: false, uitleg: null })
    log.mockRestore()
  })

  it('keurt een notatie die alleen de AI herkent in één uitspraak goed', async () => {
    // `log` kent de rekenregel niet; die schrijfwijze gaat naar de AI.
    let aanroepen = 0
    const uitslag = await beoordeelAntwoord({
      leerling: 'log(x) + c',
      goedAntwoord: 'ln(x) + c',
      alternatieven: [],
      vraagAi: async () => {
        aanroepen += 1
        return GOED_VOLGENS_AI
      },
    })

    expect(uitslag).toEqual({ goed: true, uitleg: null })
    expect(aanroepen).toBe(1)
  })
})
