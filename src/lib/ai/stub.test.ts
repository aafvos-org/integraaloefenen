import { afterEach, describe, expect, it, vi } from 'vitest'

import { aiCheckIsStubbed, stubCheckAnswerJson } from './stub'

afterEach(() => {
  vi.unstubAllEnvs()
})

// =====================================================================
// De schakelaar: wanneer staat de neppe AI-controle aan?
// =====================================================================
describe('aiCheckIsStubbed', () => {
  it('staat uit zonder AI_CHECK_MODE', () => {
    vi.stubEnv('AI_CHECK_MODE', undefined)
    vi.stubEnv('NODE_ENV', 'test')
    expect(aiCheckIsStubbed()).toBe(false)
  })

  it('staat uit bij een andere waarde dan stub', () => {
    vi.stubEnv('AI_CHECK_MODE', 'gemini')
    vi.stubEnv('NODE_ENV', 'test')
    expect(aiCheckIsStubbed()).toBe(false)
  })

  it('staat aan met AI_CHECK_MODE=stub buiten productie', () => {
    vi.stubEnv('AI_CHECK_MODE', 'stub')
    vi.stubEnv('NODE_ENV', 'test')
    expect(aiCheckIsStubbed()).toBe(true)

    vi.stubEnv('NODE_ENV', 'development')
    expect(aiCheckIsStubbed()).toBe(true)
  })

  it('staat NOOIT aan in productie, ook niet met AI_CHECK_MODE=stub', () => {
    vi.stubEnv('AI_CHECK_MODE', 'stub')
    vi.stubEnv('NODE_ENV', 'production')
    expect(aiCheckIsStubbed()).toBe(false)
  })
})

// =====================================================================
// De vaste uitkomst
// =====================================================================
describe('stubCheckAnswerJson', () => {
  it('keurt een primitieve goed waar de + C bij ontbreekt', () => {
    expect(stubCheckAnswerJson('1/3x^3 + c', '1/3x^3')).toEqual({
      is_mathematically_correct: true,
      error_explanation: '',
    })
  })

  it('keurt dezelfde primitieve in een andere notatie goed', () => {
    // x^3/3 is hetzelfde als 1/3x^3, en de hoofdletter C telt ook.
    expect(stubCheckAnswerJson('1/3x^3 + c', 'x^3/3 + C')).toMatchObject({
      is_mathematically_correct: true,
    })
  })

  it('rekent een fout antwoord fout en geeft uitleg mee', () => {
    // Terugdifferentiëren van -cos(2x) geeft 2sin(2x), niet sin(2x).
    const result = stubCheckAnswerJson('-1/2cos(2x) + c', '-cos(2x) + c')
    expect(result.is_mathematically_correct).toBe(false)
    expect(result.error_explanation.length).toBeGreaterThan(0)
  })

  it('rekent een leeg antwoord fout', () => {
    expect(
      stubCheckAnswerJson('1/3x^3 + c', '').is_mathematically_correct,
    ).toBe(false)
  })

  it('geeft altijd dezelfde uitkomst voor dezelfde invoer', () => {
    const a = stubCheckAnswerJson('1/4x^4 + c', 'x^3')
    const b = stubCheckAnswerJson('1/4x^4 + c', 'x^3')
    expect(a).toEqual(b)
  })
})
