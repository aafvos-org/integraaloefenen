/**
 * Neppe AI-controle voor tests.
 *
 * De echte controle van een fout antwoord gaat naar Gemini. Dat kost geld,
 * heeft internet nodig en geeft niet elke keer hetzelfde antwoord — alle drie
 * onbruikbaar in een automatische test. Met `AI_CHECK_MODE=stub` slaat de
 * controle Gemini over en geeft hij een vaste, voorspelbare uitkomst terug.
 *
 * Dit mag nooit op de echte site aan staan: als `NODE_ENV` op `production`
 * staat, doet de schakelaar niets. Zie `stub.test.ts`.
 */

import { normalizeAnswer } from '@/lib/practice/engine'

/** Zelfde vorm als het stukje JSON dat Gemini teruggeeft. */
export type StubAnswerJson = {
  is_mathematically_correct: boolean
  error_explanation: string
}

/** Staat de neppe AI-controle aan? Nooit in productie. */
export function aiCheckIsStubbed(): boolean {
  return (
    process.env.AI_CHECK_MODE === 'stub' &&
    process.env.NODE_ENV !== 'production'
  )
}

/**
 * Normalisatie bovenop `normalizeAnswer`, met de twee regels die bij
 * primitiveren het vaakst voorkomen (zie de voorbeelden in `prompts.ts`):
 *
 *   1. de integratieconstante mag weg:   1/3x^3 + C  →  1/3x^3
 *   2. de breuk mag voor of achter:      x^3/3       →  1/3x^3
 *
 * Meer kan de stub niet; hij is er alleen om het pad "AI zegt: wiskundig wél
 * goed, maar anders opgeschreven" te kunnen testen zonder Gemini.
 */
function looseNormalize(raw: string): string {
  return (
    normalizeAnswer(raw)
      // "+ c" aan het eind mag ontbreken: de primitieve blijft dezelfde.
      .replace(/\+c$/, '')
      // x^3/3 → 1/3x^3, zodat beide schrijfwijzes op hetzelfde uitkomen.
      .replace(/([a-z])\^(-?\d+)\/(\d+)/g, '1/$3$1^$2')
  )
}

/**
 * De vaste uitkomst van de neppe AI-controle: goed als het antwoord op de
 * bovenstaande notatie-regels na gelijk is aan het juiste antwoord, anders
 * fout.
 */
export function stubCheckAnswerJson(
  correctAnswer: string,
  studentAnswer: string,
): StubAnswerJson {
  if (looseNormalize(studentAnswer) === looseNormalize(correctAnswer)) {
    return { is_mathematically_correct: true, error_explanation: '' }
  }
  return {
    is_mathematically_correct: false,
    error_explanation:
      'Je antwoord is niet correct. Kijk je tussenstappen eens goed na.',
  }
}
