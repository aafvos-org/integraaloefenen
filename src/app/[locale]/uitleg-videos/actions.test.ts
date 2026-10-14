import { beforeEach, describe, expect, it, vi } from 'vitest'

// =====================================================================
// Een antwoord bij een uitlegvideo: dezelfde uitslag als bij oefenen,
// zonder dat er een rij wordt bewaard.
// =====================================================================

const QUESTION = {
  id: 'q1',
  answer: '1/3x^3 + c',
  latex_answer: '\\tfrac{1}{3}x^{3} + c',
  answer_alternatives: [] as string[],
}

let aiSaysCorrect: boolean
let aiGooit: boolean
let aiAanroepen: number

function from(table: string) {
  const builder = {
    select: () => builder,
    eq: () => builder,
    order: () => builder,
    insert: () => {
      throw new Error(`${table} hoort bij een video-opgave niet beschreven te worden`)
    },
    update: () => {
      throw new Error(`${table} hoort bij een video-opgave niet bijgewerkt te worden`)
    },
    maybeSingle: async () => {
      if (table === 'questions_new') return { data: QUESTION, error: null }
      return { data: null, error: null }
    },
    then: (resolve: (value: { data: unknown; error: null }) => unknown) =>
      Promise.resolve({ data: [], error: null }).then(resolve),
  }
  return builder
}

const fakeClient = {
  auth: { getUser: async () => ({ data: { user: { id: 'u1' } } }) },
  from,
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => fakeClient,
  createServiceRoleClient: () => fakeClient,
}))

vi.mock('@/lib/ai/check-answer-new', () => ({
  checkWrongAnswerNew: async () => {
    aiAanroepen += 1
    if (aiGooit) throw new Error('AI niet bereikbaar')
    return {
      errorExplanation: '',
      category: null,
      fromCache: false,
      isMathematicallyCorrect: aiSaysCorrect,
      generatedSteps: [],
    }
  },
}))

const { checkVideoAnswerAction } = await import('./actions')

describe('checkVideoAnswerAction', () => {
  beforeEach(() => {
    aiSaysCorrect = false
    aiGooit = false
    aiAanroepen = 0
  })

  it('telt een andere notatie als goed en laat een mislukte AI het antwoord niet verdwijnen', async () => {
    aiGooit = true
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})

    const goed = await checkVideoAnswerAction('q1', 'x^3/3 + c')

    expect(goed).toEqual({ kind: 'correct' })
    expect(aiAanroepen).toBe(0)

    const fout = await checkVideoAnswerAction('q1', 'x^2')

    expect(fout).toMatchObject({ kind: 'wrong', correctAnswer: '1/3x^3 + c' })
    expect(aiAanroepen).toBe(1)
    log.mockRestore()
  })
})
