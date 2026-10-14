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

/** Wat we van een account bij Supabase Auth gebruiken. */
export type AuthAccount = {
  id: string
  email?: string | null
  created_at?: string | null
  last_sign_in_at?: string | null
  email_confirmed_at?: string | null
}

/** Een rij uit `profiles`. */
export type ProfileRow = {
  id: string
  username: string | null
  role: string
  created_at: string | null
  /** docent, youtube, klas of forum. Leeg als de aanmeldlink die niet had. */
  bron: string | null
}

/** Eén regel in de tabel: het profiel plus wat Auth erover weet. */
export type AdminUserRow = ProfileRow & {
  email: string | null
  /** Wanneer het account is aangemaakt. */
  signedUpAt: string | null
  lastSignInAt: string | null
  /** Of het e-mailadres bevestigd is. */
  confirmed: boolean
}

/**
 * Legt de profielen naast de accounts van Auth en zet ze op volgorde van
 * aanmelden, nieuwste bovenaan. Accounts zonder aanmeldtijd komen onderaan.
 *
 * Een profiel wordt door een trigger aangemaakt bij het account, maar de
 * tijdstippen hoeven niet op de milliseconde gelijk te zijn. We tonen en
 * sorteren daarom op het tijdstip van het account, en vallen terug op dat
 * van het profiel als Auth het account niet (meer) kent.
 */
export function buildUserRows(
  profiles: Iterable<ProfileRow>,
  accounts: Iterable<AuthAccount>,
): AdminUserRow[] {
  const byId = new Map<string, AuthAccount>()
  for (const account of accounts) byId.set(account.id, account)

  const rows: AdminUserRow[] = []
  for (const profile of profiles) {
    const account = byId.get(profile.id)
    rows.push({
      ...profile,
      email: account?.email ?? null,
      signedUpAt: account?.created_at ?? profile.created_at ?? null,
      lastSignInAt: account?.last_sign_in_at ?? null,
      confirmed: Boolean(account?.email_confirmed_at),
    })
  }

  return rows.sort((a, b) => {
    if (a.signedUpAt === b.signedUpAt) return a.id < b.id ? -1 : 1
    if (!a.signedUpAt) return 1
    if (!b.signedUpAt) return -1
    return a.signedUpAt < b.signedUpAt ? 1 : -1
  })
}

/**
 * Een tijdstip als `02-10-2026 14:35`, altijd in Nederlandse tijd: de site
 * draait op Cloudflare en die klok staat op UTC.
 */
export function formatMoment(iso: string | null | undefined): string | null {
  if (!iso) return null
  const moment = new Date(iso)
  if (Number.isNaN(moment.getTime())) return null

  return moment
    .toLocaleString('nl-NL', {
      timeZone: 'Europe/Amsterdam',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    .replace(',', '')
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
