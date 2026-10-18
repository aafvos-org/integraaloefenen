import { describe, expect, it } from 'vitest'

import { isChatgptHerkomst } from './chatgpt-herkomst'

describe('isChatgptHerkomst', () => {
  it('herkent utm_source=chatgpt.com', () => {
    expect(isChatgptHerkomst('chatgpt.com', null)).toBe(true)
  })

  it('negeert hoofdletters en spaties in utm_source', () => {
    expect(isChatgptHerkomst(' ChatGPT.com ', null)).toBe(true)
  })

  it('herkent een verwijzer vanaf chatgpt.com', () => {
    expect(isChatgptHerkomst(null, 'chatgpt.com')).toBe(true)
  })

  it('herkent een verwijzer vanaf chat.openai.com', () => {
    expect(isChatgptHerkomst(null, 'chat.openai.com')).toBe(true)
  })

  it('wijst een andere herkomst af', () => {
    expect(isChatgptHerkomst('google', 'google.com')).toBe(false)
  })

  it('wijst niets af', () => {
    expect(isChatgptHerkomst(null, null)).toBe(false)
  })
})
