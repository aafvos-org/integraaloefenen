/**
 * Of een antwoord goed is, op één plek.
 *
 * Oefenen, de zelftoets en de video-opgave riepen de rekenregel en de AI
 * elk apart aan, en niet in dezelfde volgorde. Een reparatie op één scherm
 * miste daardoor de andere twee.
 *
 * Eerst de rekenregel. Alleen als die het antwoord niet herkent, de AI.
 * Een mislukte AI-aanroep laat die rekenregel staan: een goed antwoord
 * wordt niet alsnog fout, en de aanroeper krijgt altijd een uitslag terug
 * zodat het antwoord niet verdwijnt. Opslaan doet deze functie niet — dat
 * doet elk scherm zelf, ná de uitslag, en alleen waar een antwoord hoort
 * te blijven staan.
 */
import type { CheckAnswerErrorNew, CheckAnswerResultNew } from '@/lib/ai/check-answer-new'

import { answersMatch } from './engine'

export type Beoordeling = {
  /** De rekenregel of de AI zegt dat dit antwoord klopt. */
  goed: boolean
  /** Uitleg bij een fout antwoord, als de AI die gegeven heeft. */
  uitleg: string | null
}

type AiUitslag = CheckAnswerResultNew | CheckAnswerErrorNew

export async function beoordeelAntwoord(input: {
  leerling: string
  goedAntwoord: string
  alternatieven: string[]
  /** Alleen aangeroepen als de rekenregel het antwoord niet kent. */
  vraagAi: () => Promise<AiUitslag>
}): Promise<Beoordeling> {
  if (answersMatch(input.leerling, input.goedAntwoord, input.alternatieven)) {
    return { goed: true, uitleg: null }
  }

  let ai: AiUitslag
  try {
    ai = await input.vraagAi()
  } catch (e) {
    console.error('[nakijken] onverwacht', e)
    return { goed: false, uitleg: null }
  }

  if ('error' in ai) {
    console.error('[nakijken]', ai.error)
    return { goed: false, uitleg: null }
  }

  if (ai.isMathematicallyCorrect) {
    return { goed: true, uitleg: null }
  }

  return { goed: false, uitleg: ai.errorExplanation || null }
}
