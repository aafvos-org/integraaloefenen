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
let ingelogd = true
let vraagRijen: Array<{
  id: string
  cluster_id: string
  difficulty: number
  latex_body: string | null
}> = []
let vraagFout: { message: string } | null = null

function from(table: string) {
  const builder = {
    select: () => builder,
    eq: () => builder,
    in: () => builder,
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
    then: (resolve: (value: { data: unknown; error: { message: string } | null }) => unknown) =>
      Promise.resolve({
        data: table === 'questions_new' ? vraagRijen : [],
        error: table === 'questions_new' ? vraagFout : null,
      }).then(resolve),
  }
  return builder
}

const fakeClient = {
  auth: {
    getUser: async () => ({ data: { user: ingelogd ? { id: 'u1' } : null } }),
  },
  from,
}

vi.mock('@/lib/videos', () => ({
  getUitlegVideos: () => [
    {
      slug: 'deel',
      clusterIds: ['c1', 'c2'],
    },
  ],
}))

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

const { checkVideoAnswerAction, haalVideoOefenvragenAction } = await import('./actions')

describe('checkVideoAnswerAction', () => {
  beforeEach(() => {
    aiSaysCorrect = false
    aiGooit = false
    aiAanroepen = 0
    ingelogd = true
    vraagRijen = []
    vraagFout = null
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

describe('haalVideoOefenvragenAction', () => {
  beforeEach(() => {
    ingelogd = true
    vraagRijen = []
    vraagFout = null
  })

  it('geeft niets terug zonder account of bij een onbekende video', async () => {
    ingelogd = false
    vraagRijen = [
      { id: 'q1', cluster_id: 'c1', difficulty: 1, latex_body: 'x' },
    ]

    expect(await haalVideoOefenvragenAction('deel')).toEqual({ kind: 'ok', vragen: [] })

    ingelogd = true
    expect(await haalVideoOefenvragenAction('bestaat-niet')).toEqual({
      kind: 'ok',
      vragen: [],
    })
  })

  it('kiest hoogstens drie vragen en meldt een mislukte ophaalactie', async () => {
    vraagRijen = [
      { id: 'q1', cluster_id: 'c1', difficulty: 2, latex_body: 'een' },
      { id: 'q2', cluster_id: 'c1', difficulty: 1, latex_body: 'twee' },
      { id: 'q3', cluster_id: 'c2', difficulty: 3, latex_body: 'drie' },
      { id: 'q4', cluster_id: 'c2', difficulty: 4, latex_body: 'vier' },
    ]

    const goed = await haalVideoOefenvragenAction('deel')
    expect(goed.kind).toBe('ok')
    if (goed.kind === 'ok') {
      expect(goed.vragen).toHaveLength(3)
      const ids = goed.vragen.map((vraag) => vraag.id)
      expect(ids).toEqual(expect.arrayContaining(['q1', 'q2']))
      expect(ids.filter((id) => id === 'q3' || id === 'q4')).toHaveLength(1)
    }

    vraagFout = { message: 'database niet bereikbaar' }
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(await haalVideoOefenvragenAction('deel')).toEqual({ kind: 'error' })
    log.mockRestore()
  })
})
