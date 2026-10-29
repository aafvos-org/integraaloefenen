import { afterEach, describe, expect, it, vi } from 'vitest'

import { VAKANTIE_BALK_ID, scriptDatVakantieBalkToont } from './vakantiebalk'

describe('scriptDatVakantieBalkToont', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  /** Draait het scriptje zoals de browser dat doet, met een nep-element en een vaste datum. */
  function draaiScript(nu: Date): { hidden: boolean } {
    vi.useFakeTimers()
    vi.setSystemTime(nu)
    const element = { hidden: true }
    const document = {
      getElementById: (id: string) => (id === VAKANTIE_BALK_ID ? element : null),
    }
    const draai = new Function('document', scriptDatVakantieBalkToont())
    draai(document)
    return element
  }

  it('laat de balk verborgen vlak voor de startdatum', () => {
    expect(draaiScript(new Date(2026, 9, 25, 23, 59)).hidden).toBe(true)
  })

  it('toont de balk op de startdatum', () => {
    expect(draaiScript(new Date(2026, 9, 26, 0, 0)).hidden).toBe(false)
  })

  it('toont de balk midden in de periode', () => {
    expect(draaiScript(new Date(2026, 10, 1, 12, 0)).hidden).toBe(false)
  })

  it('toont de balk op de einddatum', () => {
    expect(draaiScript(new Date(2026, 10, 9, 23, 59)).hidden).toBe(false)
  })

  it('laat de balk verborgen na de einddatum', () => {
    expect(draaiScript(new Date(2026, 10, 10, 0, 0)).hidden).toBe(true)
  })

  it('laat de balk verborgen een jaar eerder', () => {
    expect(draaiScript(new Date(2025, 10, 1, 12, 0)).hidden).toBe(true)
  })

  it('faalt stil als het element nog niet in de pagina staat', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 1))
    const draai = new Function('document', scriptDatVakantieBalkToont())
    expect(() => draai({ getElementById: () => null })).not.toThrow()
  })

  it('zoekt op hetzelfde id als de balk in vakantie-balk.tsx', () => {
    expect(scriptDatVakantieBalkToont()).toContain(VAKANTIE_BALK_ID)
  })
})
