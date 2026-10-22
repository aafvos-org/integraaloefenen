import { describe, expect, it } from 'vitest'

import { isTerugVanVakantiePeriode } from './vakantiebalk'

describe('isTerugVanVakantiePeriode', () => {
  it('is onzichtbaar vlak voor de startdatum', () => {
    expect(isTerugVanVakantiePeriode(new Date(2026, 9, 25, 23, 59))).toBe(false)
  })

  it('is zichtbaar op de startdatum', () => {
    expect(isTerugVanVakantiePeriode(new Date(2026, 9, 26, 0, 0))).toBe(true)
  })

  it('is zichtbaar midden in de periode', () => {
    expect(isTerugVanVakantiePeriode(new Date(2026, 10, 1, 12, 0))).toBe(true)
  })

  it('is zichtbaar op de einddatum', () => {
    expect(isTerugVanVakantiePeriode(new Date(2026, 10, 9, 23, 59))).toBe(true)
  })

  it('is onzichtbaar na de einddatum', () => {
    expect(isTerugVanVakantiePeriode(new Date(2026, 10, 10, 0, 0))).toBe(false)
  })

  it('is onzichtbaar een jaar eerder', () => {
    expect(isTerugVanVakantiePeriode(new Date(2025, 10, 1, 12, 0))).toBe(false)
  })
})
