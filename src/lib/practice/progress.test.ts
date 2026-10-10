import { describe, expect, it } from 'vitest'

import {
  MASTERY_THRESHOLD,
  progressAfterCorrect,
  progressAfterIncorrect,
  type ProgressState,
} from './progress'

// =====================================================================
// De voortgangsregel: één nagekeken antwoord, één stap in de boekhouding.
// =====================================================================

function state(partial: Partial<ProgressState> = {}): ProgressState {
  return {
    status: 'in_progress',
    correct_streak: 0,
    total_answered: 0,
    total_correct: 0,
    mastered_at: null,
    ...partial,
  }
}

describe('progressAfterCorrect', () => {
  it('telt het antwoord één keer mee en zet de reeks één omhoog', () => {
    const next = progressAfterCorrect(state({ correct_streak: 1, total_answered: 4, total_correct: 2 }))

    expect(next.correct_streak).toBe(2)
    expect(next.total_answered).toBe(5)
    expect(next.total_correct).toBe(3)
    expect(next.status).toBe('in_progress')
    expect(next.mastered_at).toBeNull()
  })

  it('zet het onderdeel op beheerst bij drie goed op rij', () => {
    const next = progressAfterCorrect(
      state({ correct_streak: MASTERY_THRESHOLD - 1, total_answered: 2, total_correct: 2 }),
      '2026-10-10T12:00:00.000Z',
    )

    expect(next.correct_streak).toBe(MASTERY_THRESHOLD)
    expect(next.status).toBe('mastered')
    expect(next.mastered_at).toBe('2026-10-10T12:00:00.000Z')
  })

  it('laat de datum van beheersen staan als die er al is', () => {
    const next = progressAfterCorrect(
      state({ status: 'mastered', correct_streak: 5, mastered_at: '2026-09-01T10:00:00.000Z' }),
      '2026-10-10T12:00:00.000Z',
    )

    expect(next.mastered_at).toBe('2026-09-01T10:00:00.000Z')
  })

  it('houdt een beheerst onderdeel beheerst na een misser tijdens het herhalen', () => {
    // Reeks staat op 0 door de misser, maar het onderdeel was al beheerst.
    const next = progressAfterCorrect(state({ status: 'mastered', correct_streak: 0 }))

    expect(next.correct_streak).toBe(1)
    expect(next.status).toBe('mastered')
  })
})

describe('progressAfterIncorrect', () => {
  it('zet de reeks terug op 0 en telt alleen bij de totalen mee', () => {
    const next = progressAfterIncorrect(
      state({ correct_streak: 2, total_answered: 4, total_correct: 3 }),
    )

    expect(next.correct_streak).toBe(0)
    expect(next.total_answered).toBe(5)
    expect(next.total_correct).toBe(3)
    expect(next.status).toBe('in_progress')
  })

  it('pakt beheerst niet af bij één misser', () => {
    const next = progressAfterIncorrect(
      state({ status: 'mastered', correct_streak: 4, mastered_at: '2026-09-01T10:00:00.000Z' }),
    )

    expect(next.status).toBe('mastered')
    expect(next.mastered_at).toBe('2026-09-01T10:00:00.000Z')
    expect(next.correct_streak).toBe(0)
  })
})
