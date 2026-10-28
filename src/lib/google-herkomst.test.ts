import { describe, expect, it } from 'vitest'

import { isGoogleZoekdomein } from './google-herkomst'

describe('isGoogleZoekdomein', () => {
  it('herkent google.com', () => {
    expect(isGoogleZoekdomein('google.com')).toBe(true)
  })

  it('herkent een Google-domein met een landcode', () => {
    expect(isGoogleZoekdomein('google.nl')).toBe(true)
    expect(isGoogleZoekdomein('google.de')).toBe(true)
  })

  it('herkent een Google-domein met een dubbel TLD', () => {
    expect(isGoogleZoekdomein('google.co.uk')).toBe(true)
    expect(isGoogleZoekdomein('google.com.au')).toBe(true)
  })

  it('wijst een ander domein af dat met "google" begint', () => {
    expect(isGoogleZoekdomein('googleadservices.com')).toBe(false)
    expect(isGoogleZoekdomein('googleusercontent.com')).toBe(false)
  })

  it('wijst een vals verlengd domein af', () => {
    expect(isGoogleZoekdomein('google.com.voorbeeld.nl')).toBe(false)
  })

  it('wijst chatgpt en lege verwijzers af', () => {
    expect(isGoogleZoekdomein('chatgpt.com')).toBe(false)
    expect(isGoogleZoekdomein(null)).toBe(false)
  })
})
