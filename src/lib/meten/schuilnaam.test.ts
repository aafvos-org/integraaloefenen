import { describe, expect, it } from 'vitest'

import { SCHUILNAAM_LENGTE, schuilnaamVoor } from './schuilnaam'

const GEBRUIKER = '11111111-2222-3333-4444-555555555555'

describe('schuilnaamVoor', () => {
  it('geeft precies zestien tekens hex', async () => {
    const schuilnaam = await schuilnaamVoor(GEBRUIKER, 'geheim')
    expect(schuilnaam).toMatch(/^[0-9a-f]{16}$/)
    expect(schuilnaam!.length).toBe(SCHUILNAAM_LENGTE)
  })

  it('geeft dezelfde leerling elke keer dezelfde schuilnaam', async () => {
    const eerst = await schuilnaamVoor(GEBRUIKER, 'geheim')
    const later = await schuilnaamVoor(GEBRUIKER, 'geheim')
    expect(later).toBe(eerst)
  })

  it('geeft een andere leerling een andere schuilnaam', async () => {
    const een = await schuilnaamVoor(GEBRUIKER, 'geheim')
    const ander = await schuilnaamVoor('99999999-8888-7777-6666-555555555555', 'geheim')
    expect(ander).not.toBe(een)
  })

  it('geeft met een ander geheim een andere schuilnaam', async () => {
    const een = await schuilnaamVoor(GEBRUIKER, 'geheim')
    const ander = await schuilnaamVoor(GEBRUIKER, 'ander geheim')
    expect(ander).not.toBe(een)
  })

  // Deze waarde moet gelijk zijn aan wat Postgres uitrekent in migratie 0078:
  //   select left(encode(hmac('11111111-2222-3333-4444-555555555555',
  //                           'geheim', 'sha256'), 'hex'), 16);
  // Verandert een van de twee, dan loopt de analyse per schuilnaam stuk.
  it('rekent hetzelfde uit als public.meet_schuilnaam in SQL', async () => {
    expect(await schuilnaamVoor(GEBRUIKER, 'geheim')).toBe('f716a6479c837ae3')
  })

  it('geeft niets terug zonder gebruiker of zonder geheim', async () => {
    expect(await schuilnaamVoor('', 'geheim')).toBeNull()
    expect(await schuilnaamVoor(GEBRUIKER, '')).toBeNull()
  })
})
