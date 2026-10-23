import { describe, expect, it } from 'vitest'

import { SITE_CONFIG } from '@/config/site'

import { buildCheckAnswerPromptNew } from './prompts'

function basisInvoer(overrides: Partial<Parameters<typeof buildCheckAnswerPromptNew>[0]> = {}) {
  return {
    questionBody: '\\int 2x\\,dx',
    correctAnswer: 'x^2',
    studentAnswer: 'x^2 + 1',
    topicTitle: 'Onderdeel 1',
    clusterTitle: 'Cluster 1',
    stepsAlreadyExist: false,
    ...overrides,
  }
}

describe('buildCheckAnswerPromptNew', () => {
  it('stuurt het stappenplan-blok mee als er nog geen stappen bestaan', () => {
    const prompt = buildCheckAnswerPromptNew(basisInvoer({ stepsAlreadyExist: false }))

    expect(prompt).toContain('Schrijf een STAPPENPLAN voor deze specifieke vraag')
    expect(prompt).not.toContain('Er is al een stappenplan voor deze vraag')
  })

  it('laat het stappenplan-blok weg als er al stappen bestaan', () => {
    const prompt = buildCheckAnswerPromptNew(basisInvoer({ stepsAlreadyExist: true }))

    expect(prompt).toContain('Er is al een stappenplan voor deze vraag — laat solution_steps LEEG ([]).')
    expect(prompt).not.toContain('Schrijf een STAPPENPLAN voor deze specifieke vraag')
  })

  it('zet geen opdrachtregel boven een eigen opdracht', () => {
    // Tekst buiten de wiskunde maakt dit een 'eigen-opdracht' (zie opgavesoort).
    const questionBody = 'Bereken exact: $f(x) = 3x^2$'
    const prompt = buildCheckAnswerPromptNew(basisInvoer({ questionBody }))

    expect(prompt).toContain(`Vraag: ${questionBody}`)
    expect(prompt).not.toContain(SITE_CONFIG.taskPromptNl)
  })

  it('zet de opdrachtregel boven een kale opgave', () => {
    // Geen tekst buiten de wiskunde, dus geen 'eigen-opdracht'.
    const questionBody = '\\int 2x\\,dx'
    const prompt = buildCheckAnswerPromptNew(basisInvoer({ questionBody }))

    expect(prompt).toContain(`Vraag: ${SITE_CONFIG.taskPromptNl} ${questionBody}`)
  })
})
