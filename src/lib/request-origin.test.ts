import { describe, expect, it } from 'vitest'

import { originFromHeaders } from './request-origin'

// =====================================================================
// Het adres voor de terugkeerlink in een mail.
//
// Supabase weigert een half adres (zonder `https://`), dus elke uitkomst
// hier moet een volledig adres zijn.
// =====================================================================

function headers(values: Record<string, string>) {
  const lower = Object.fromEntries(
    Object.entries(values).map(([k, v]) => [k.toLowerCase(), v]),
  )
  return { get: (name: string) => lower[name.toLowerCase()] ?? null }
}

describe('originFromHeaders', () => {
  it('neemt de origin-header over', () => {
    expect(originFromHeaders(headers({ origin: 'https://preview.workers.dev' })))
      .toBe('https://preview.workers.dev')
  })

  it('haalt een schuine streep aan het eind weg', () => {
    expect(originFromHeaders(headers({ origin: 'https://www.integraaloefenen.nl/' })))
      .toBe('https://www.integraaloefenen.nl')
  })

  it('zet https:// voor een doorgegeven host', () => {
    expect(
      originFromHeaders(headers({ 'x-forwarded-host': 'www.integraaloefenen.nl' })),
    ).toBe('https://www.integraaloefenen.nl')
  })

  it('volgt x-forwarded-proto als die er staat', () => {
    expect(
      originFromHeaders(
        headers({ 'x-forwarded-host': 'test.nl', 'x-forwarded-proto': 'http' }),
      ),
    ).toBe('http://test.nl')
  })

  it('neemt de eerste host als een proxy er meerdere doorgeeft', () => {
    expect(
      originFromHeaders(
        headers({ 'x-forwarded-host': 'eerste.nl, tweede.nl' }),
      ),
    ).toBe('https://eerste.nl')
  })

  it('valt terug op de host-header', () => {
    expect(originFromHeaders(headers({ host: 'www.integraaloefenen.nl' }))).toBe(
      'https://www.integraaloefenen.nl',
    )
  })

  it('gebruikt http op je eigen computer', () => {
    expect(originFromHeaders(headers({ host: 'localhost:3000' }))).toBe(
      'http://localhost:3000',
    )
  })

  it('negeert een origin die geen adres is', () => {
    expect(
      originFromHeaders(headers({ origin: 'null', host: 'www.integraaloefenen.nl' })),
    ).toBe('https://www.integraaloefenen.nl')
  })

  it('levert zonder headers nog steeds een volledig adres', () => {
    expect(originFromHeaders(headers({}))).toMatch(/^https:\/\/\S+$/)
  })
})
