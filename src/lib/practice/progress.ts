/**
 * De voortgangsregel: wat doet één nagekeken antwoord met de reeks, de
 * tellers en de status van een onderdeel?
 *
 * Deze functies rekenen alleen; het schrijven naar de database gebeurt in
 * `chapter-actions.ts`. Ze worden pas aangeroepen als vaststaat of het
 * antwoord goed is — ook na de AI-controle, zodat één antwoord één keer
 * meetelt.
 */

import type { ProgressStatus } from '@/lib/supabase/types'

/** Zoveel goede antwoorden op rij en het onderdeel is beheerst. */
export const MASTERY_THRESHOLD = 3

/** De velden van `user_progress_new` waar de voortgangsregel iets mee doet. */
export type ProgressState = {
  status: ProgressStatus
  correct_streak: number
  total_answered: number
  total_correct: number
  mastered_at: string | null
}

export function progressAfterCorrect(
  p: ProgressState,
  now: string = new Date().toISOString(),
): ProgressState {
  const correct_streak = p.correct_streak + 1
  // Eenmaal beheerst blijft beheerst: een misser tijdens het herhalen zet de
  // reeks terug op 0, maar pakt de status niet af.
  const mastered = correct_streak >= MASTERY_THRESHOLD || p.status === 'mastered'

  return {
    status: mastered ? 'mastered' : 'in_progress',
    correct_streak,
    total_answered: p.total_answered + 1,
    total_correct: p.total_correct + 1,
    mastered_at: mastered ? (p.mastered_at ?? now) : p.mastered_at,
  }
}

export function progressAfterIncorrect(p: ProgressState): ProgressState {
  return {
    // De status blijft staan: een beheerst onderdeel blijft beheerst.
    status: p.status,
    correct_streak: 0,
    total_answered: p.total_answered + 1,
    total_correct: p.total_correct,
    mastered_at: p.mastered_at,
  }
}
