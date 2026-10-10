import { describe, expect, it } from 'vitest'

import {
  aggregateAnswers,
  countMasteredClusters,
  fetchAllAuthUsers,
  fetchAllRows,
  PAGE_SIZE,
  type AnswerRow,
} from './stats'

// =====================================================================
// De beheerpagina mag niet blijven steken op de 1000 rijen die Supabase
// per query teruggeeft.
// =====================================================================

/** Een neptabel die zich gedraagt als Supabase: nooit meer dan 1000 rijen. */
function fakeTable<T>(rows: T[], maxRows = PAGE_SIZE) {
  let calls = 0
  return {
    get calls() {
      return calls
    },
    fetchPage(from: number, to: number) {
      calls += 1
      const end = Math.min(to, from + maxRows - 1)
      return Promise.resolve(rows.slice(from, end + 1))
    },
  }
}

function answer(userId: string, index: number, isCorrect: boolean): AnswerRow {
  // Oplopende tijdstippen, één minuut uit elkaar, vanaf 1 januari 2026.
  const answeredAt = new Date(
    Date.UTC(2026, 0, 1, 0, 0, 0) + index * 60_000,
  ).toISOString()
  return {
    is_correct: isCorrect,
    answered_at: answeredAt,
    user_sessions_new: { user_id: userId },
  }
}

describe('fetchAllRows', () => {
  it('haalt meer dan duizend rijen op in meerdere stappen', async () => {
    const rows = Array.from({ length: 2480 }, (_, i) => i)
    const table = fakeTable(rows)

    const all = await fetchAllRows(table.fetchPage)

    expect(all).toHaveLength(2480)
    expect(all[2479]).toBe(2479)
    expect(table.calls).toBe(3)
  })

  it('stopt netjes als het aantal rijen precies op een pagina uitkomt', async () => {
    const table = fakeTable(Array.from({ length: 2 * PAGE_SIZE }, (_, i) => i))

    const all = await fetchAllRows(table.fetchPage)

    expect(all).toHaveLength(2 * PAGE_SIZE)
    expect(table.calls).toBe(3)
  })

  it('geeft een lege lijst bij een lege tabel', async () => {
    const table = fakeTable<number>([])

    expect(await fetchAllRows(table.fetchPage)).toEqual([])
    expect(table.calls).toBe(1)
  })
})

describe('antwoorden tellen', () => {
  it('telt ruim meer dan duizend antwoorden volledig mee, mét laatste activiteit', async () => {
    // 2500 antwoorden, om en om over drie leerlingen verdeeld.
    const leerlingen = ['leerling-a', 'leerling-b', 'leerling-c']
    const rows = Array.from({ length: 2500 }, (_, i) =>
      answer(leerlingen[i % 3], i, i % 2 === 0),
    )
    const table = fakeTable(rows)

    const stats = aggregateAnswers(await fetchAllRows(table.fetchPage))

    // 2500 = 834 + 833 + 833.
    expect(stats.get('leerling-a')?.total).toBe(834)
    expect(stats.get('leerling-b')?.total).toBe(833)
    expect(stats.get('leerling-c')?.total).toBe(833)
    expect(
      leerlingen.reduce((som, id) => som + (stats.get(id)?.total ?? 0), 0),
    ).toBe(2500)

    // Elke leerling heeft een laatste activiteit; de allerlaatste rij
    // (nummer 2499, index 2499 % 3 = 0) hoort bij leerling-a.
    for (const id of leerlingen) {
      expect(stats.get(id)?.lastAnsweredAt).not.toBeNull()
    }
    expect(stats.get('leerling-a')?.lastAnsweredAt).toBe(
      rows[2499].answered_at,
    )

    // Goed/fout wisselt elkaar af: 1250 van de 2500 zijn goed.
    expect(
      leerlingen.reduce((som, id) => som + (stats.get(id)?.correct ?? 0), 0),
    ).toBe(1250)
  })

  it('laat zien wat er misging: één query levert hoogstens duizend rijen', async () => {
    const rows = Array.from({ length: 2500 }, (_, i) =>
      answer(leerlingVan(i), i, true),
    )
    const table = fakeTable(rows)

    // Zo deed de pagina het eerst: één keer vragen, zonder bereik.
    const eenQuery = await table.fetchPage(0, 10_000)

    expect(eenQuery).toHaveLength(PAGE_SIZE)
    // De leerling die pas na rij 1000 begon te oefenen, valt weg.
    expect(aggregateAnswers(eenQuery).get('laatkomer')).toBeUndefined()
    expect(
      (await fetchAllRows(table.fetchPage).then(aggregateAnswers)).get(
        'laatkomer',
      )?.total,
    ).toBe(1500)
  })

  it('kiest het laatste tijdstip, ook als de rijen door elkaar binnenkomen', () => {
    const stats = aggregateAnswers([
      answer('leerling-a', 5, true),
      answer('leerling-a', 1, false),
      answer('leerling-a', 3, true),
    ])

    expect(stats.get('leerling-a')).toEqual({
      total: 3,
      correct: 2,
      lastAnsweredAt: answer('leerling-a', 5, true).answered_at,
    })
  })

  it('verwerkt de koppeling met de sessie ook als lijst, en slaat rijen zonder gebruiker over', () => {
    const stats = aggregateAnswers([
      {
        is_correct: true,
        answered_at: '2026-01-01T00:00:00.000Z',
        user_sessions_new: [{ user_id: 'leerling-a' }],
      },
      {
        is_correct: true,
        answered_at: '2026-01-02T00:00:00.000Z',
        user_sessions_new: null,
      },
    ])

    expect(stats.size).toBe(1)
    expect(stats.get('leerling-a')?.total).toBe(1)
  })
})

/** Eerst alleen de vroege leerling, vanaf rij 1000 ook een laatkomer. */
function leerlingVan(index: number): string {
  return index < 1000 ? 'vroege-vogel' : 'laatkomer'
}

describe('fetchAllAuthUsers', () => {
  it('haalt alle accounts op, ook voorbij de eerste pagina', async () => {
    const accounts = Array.from({ length: 450 }, (_, i) => ({ id: `u${i}` }))
    const gevraagd: number[] = []

    const all = await fetchAllAuthUsers((page, perPage) => {
      gevraagd.push(page)
      return Promise.resolve(accounts.slice((page - 1) * perPage, page * perPage))
    }, 200)

    expect(all).toHaveLength(450)
    expect(gevraagd).toEqual([1, 2, 3])
  })
})

describe('countMasteredClusters', () => {
  it('telt alleen de beheerste clusters, per gebruiker', () => {
    const mastered = countMasteredClusters([
      { user_id: 'leerling-a', status: 'mastered' },
      { user_id: 'leerling-a', status: 'in_progress' },
      { user_id: 'leerling-a', status: 'mastered' },
      { user_id: 'leerling-b', status: 'not_started' },
    ])

    expect(mastered.get('leerling-a')).toBe(2)
    expect(mastered.get('leerling-b')).toBeUndefined()
  })
})
