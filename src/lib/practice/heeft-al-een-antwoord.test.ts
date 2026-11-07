import { describe, expect, it } from 'vitest'

import { heeftAlEenAntwoord } from './heeft-al-een-antwoord'

type DbFout = { code: string } | null

/** Minimale nabootsing van de query-builder van Supabase voor deze twee queries. */
function maakSupabase(opts: {
  sessieIds: string[]
  sessieFout?: DbFout
  antwoordFout?: DbFout
  sessiesMetAntwoord?: Set<string>
}) {
  const {
    sessieIds,
    sessieFout = null,
    antwoordFout = null,
    sessiesMetAntwoord = new Set<string>(),
  } = opts
  const inCalls: string[][] = []

  function from(table: string) {
    if (table === 'user_sessions_new') {
      return {
        select: () => ({
          eq: () => ({
            then: (resolve: (v: unknown) => unknown) =>
              Promise.resolve(
                sessieFout
                  ? { data: null, error: sessieFout }
                  : { data: sessieIds.map((id) => ({ id })), error: null },
              ).then(resolve),
          }),
        }),
      }
    }
    if (table === 'session_answers_new') {
      return {
        select: () => ({
          in: (_kolom: string, ids: string[]) => {
            inCalls.push(ids)
            return {
              limit: () => ({
                then: (resolve: (v: unknown) => unknown) =>
                  Promise.resolve(
                    antwoordFout
                      ? { data: null, error: antwoordFout }
                      : {
                          data: ids
                            .filter((id) => sessiesMetAntwoord.has(id))
                            .map((id) => ({ id: `a-${id}` })),
                          error: null,
                        },
                  ).then(resolve),
              }),
            }
          },
        }),
      }
    }
    throw new Error(`onverwachte tabel: ${table}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { client: { from } as any, inCalls }
}

describe('heeftAlEenAntwoord', () => {
  it('geeft false als de leerling nog geen sessie heeft', async () => {
    const { client } = maakSupabase({ sessieIds: [] })

    await expect(heeftAlEenAntwoord(client, 'u1')).resolves.toBe(false)
  })

  it('geeft false bij een sessie zonder opgeslagen antwoorden', async () => {
    const { client } = maakSupabase({ sessieIds: ['s1'] })

    await expect(heeftAlEenAntwoord(client, 'u1')).resolves.toBe(false)
  })

  it('geeft true zodra er bij één sessie een antwoord ligt', async () => {
    const { client } = maakSupabase({
      sessieIds: ['s1', 's2'],
      sessiesMetAntwoord: new Set(['s2']),
    })

    await expect(heeftAlEenAntwoord(client, 'u1')).resolves.toBe(true)
  })

  it('telt een databasefout bij het ophalen van sessies als "al geoefend"', async () => {
    const { client } = maakSupabase({
      sessieIds: [],
      sessieFout: { code: '42501' },
    })

    await expect(heeftAlEenAntwoord(client, 'u1')).resolves.toBe(true)
  })

  it('telt een databasefout bij het ophalen van antwoorden als "al geoefend"', async () => {
    const { client } = maakSupabase({
      sessieIds: ['s1'],
      antwoordFout: { code: '42501' },
    })

    await expect(heeftAlEenAntwoord(client, 'u1')).resolves.toBe(true)
  })

  it('vraagt antwoorden per 100 sessie-ids op en vindt een antwoord in de tweede batch', async () => {
    const sessieIds = Array.from({ length: 150 }, (_, i) => `s${i}`)
    const { client, inCalls } = maakSupabase({
      sessieIds,
      sessiesMetAntwoord: new Set(['s120']),
    })

    await expect(heeftAlEenAntwoord(client, 'u1')).resolves.toBe(true)

    expect(inCalls).toHaveLength(2)
    expect(inCalls[0]).toHaveLength(100)
    expect(inCalls[1]).toHaveLength(50)
  })

  it('geeft false als geen van de batches een antwoord oplevert', async () => {
    const sessieIds = Array.from({ length: 150 }, (_, i) => `s${i}`)
    const { client, inCalls } = maakSupabase({ sessieIds })

    await expect(heeftAlEenAntwoord(client, 'u1')).resolves.toBe(false)
    expect(inCalls).toHaveLength(2)
  })
})
