// =====================================================================
// Tellen voor de beheerpagina Gebruikers.
//
// Supabase geeft per query hoogstens 1000 rijen terug. Wie alles in één
// keer opvraagt, mist stilletjes de rest: te weinig antwoorden, en bij
// recente gebruikers vaak helemaal geen laatste activiteit. Daarom halen
// we elke tabel per pagina op tot alles binnen is, en tellen we daarna.
// =====================================================================

/** Hoeveel rijen Supabase per query hoogstens teruggeeft. */
export const PAGE_SIZE = 1000

/**
 * Haalt alle rijen op door te blijven vragen tot een pagina niet meer vol
 * is. `fetchPage` krijgt een bereik mee zoals `.range(from, to)` dat wil:
 * beide grenzen tellen mee.
 */
export async function fetchAllRows<T>(
  fetchPage: (from: number, to: number) => Promise<T[]>,
  pageSize: number = PAGE_SIZE,
): Promise<T[]> {
  const rows: T[] = []

  for (let from = 0; ; from += pageSize) {
    const page = await fetchPage(from, from + pageSize - 1)
    rows.push(...page)
    if (page.length < pageSize) break
  }

  return rows
}

/**
 * Hetzelfde voor de accountlijst van Supabase Auth, die in pagina's van
 * `perPage` werkt in plaats van met een rijbereik.
 */
export async function fetchAllAuthUsers<T>(
  listPage: (page: number, perPage: number) => Promise<T[]>,
  perPage: number = PAGE_SIZE,
): Promise<T[]> {
  const users: T[] = []

  for (let page = 1; ; page += 1) {
    const batch = await listPage(page, perPage)
    users.push(...batch)
    if (batch.length < perPage) break
  }

  return users
}

/** Eén antwoord, met de gebruiker die erbij hoort via de sessie. */
export type AnswerRow = {
  is_correct: boolean | null
  answered_at: string
  user_sessions_new:
    | { user_id: string }
    | { user_id: string }[]
    | null
}

export type UserAnswerStats = {
  total: number
  correct: number
  lastAnsweredAt: string | null
}

/** De `!inner`-koppeling komt soms als rij en soms als lijst binnen. */
function userIdOf(row: AnswerRow): string | undefined {
  const session = Array.isArray(row.user_sessions_new)
    ? row.user_sessions_new[0]
    : row.user_sessions_new
  return session?.user_id
}

/** Per gebruiker: hoeveel antwoorden, hoeveel goed, en wanneer voor het laatst. */
export function aggregateAnswers(
  rows: Iterable<AnswerRow>,
): Map<string, UserAnswerStats> {
  const byUser = new Map<string, UserAnswerStats>()

  for (const row of rows) {
    const userId = userIdOf(row)
    if (!userId) continue

    const stats = byUser.get(userId) ?? {
      total: 0,
      correct: 0,
      lastAnsweredAt: null,
    }
    stats.total += 1
    if (row.is_correct) stats.correct += 1
    if (
      row.answered_at &&
      (!stats.lastAnsweredAt || row.answered_at > stats.lastAnsweredAt)
    ) {
      stats.lastAnsweredAt = row.answered_at
    }
    byUser.set(userId, stats)
  }

  return byUser
}

/** Per gebruiker het aantal clusters met status `mastered`. */
export function countMasteredClusters(
  rows: Iterable<{ user_id: string; status: string }>,
): Map<string, number> {
  const byUser = new Map<string, number>()

  for (const row of rows) {
    if (row.status !== 'mastered') continue
    byUser.set(row.user_id, (byUser.get(row.user_id) ?? 0) + 1)
  }

  return byUser
}
