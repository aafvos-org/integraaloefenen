import { createServiceRoleClient } from '@/lib/supabase/server'
import { Badge, Card } from '@/components/ui'

import { setUserRole } from './actions'
import {
  aggregateAnswers,
  countMasteredClusters,
  fetchAllAuthUsers,
  fetchAllRows,
  type AnswerRow,
} from './stats'

export default async function UsersPage() {
  const admin = createServiceRoleClient()

  // Alles per pagina ophalen: één query geeft hoogstens 1000 rijen terug,
  // en bij meer antwoorden viel een deel stilletjes weg.
  const [authUsers, profiles, progressRows, answerRows] = await Promise.all([
    fetchAllAuthUsers(async (page, perPage) => {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
      if (error) throw error
      return data.users
    }, 200),
    fetchAllRows(async (from, to) => {
      const { data, error } = await admin
        .from('profiles')
        .select('id, username, role, created_at')
        .order('created_at', { ascending: false })
        .order('id', { ascending: true })
        .range(from, to)
      if (error) throw error
      return data ?? []
    }),
    fetchAllRows(async (from, to) => {
      const { data, error } = await admin
        .from('user_progress_new')
        .select('user_id, status')
        .order('id', { ascending: true })
        .range(from, to)
      if (error) throw error
      return data ?? []
    }),
    fetchAllRows(async (from, to) => {
      const { data, error } = await admin
        .from('session_answers_new')
        .select('is_correct, answered_at, user_sessions_new!inner(user_id)')
        .order('id', { ascending: true })
        .range(from, to)
        .returns<AnswerRow[]>()
      if (error) throw error
      return data ?? []
    }),
  ])

  const emailById = new Map(authUsers.map((u) => [u.id, u.email ?? '—']))
  const masteredByUser = countMasteredClusters(progressRows)
  const answersByUser = aggregateAnswers(answerRows)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl text-text">Gebruikers</h2>
        <p className="text-sm text-text-muted">
          {profiles.length} accounts. Klik op een rol om iemand admin te
          maken of terug te zetten naar student.
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left text-xs uppercase tracking-wider text-text-muted">
            <tr>
              <th className="px-4 py-2 font-medium">Gebruikersnaam</th>
              <th className="px-4 py-2 font-medium">E-mail</th>
              <th className="px-4 py-2 font-medium">Rol</th>
              <th className="px-4 py-2 font-medium">Gemasterde clusters</th>
              <th className="px-4 py-2 font-medium">Antwoorden</th>
              <th className="px-4 py-2 font-medium">% correct</th>
              <th className="px-4 py-2 font-medium">Laatste activiteit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {profiles.map((p) => {
              const stats = answersByUser.get(p.id)
              const mastered = masteredByUser.get(p.id) ?? 0
              const pct =
                stats && stats.total > 0
                  ? Math.round((stats.correct / stats.total) * 100)
                  : null
              const setRole = setUserRole.bind(null, p.id)
              return (
                <tr key={p.id} className="align-top">
                  <td className="px-4 py-2">
                    {p.username ?? <span className="text-text-muted">—</span>}
                  </td>
                  <td className="px-4 py-2 text-text-muted">
                    {emailById.get(p.id) ?? '—'}
                  </td>
                  <td className="px-4 py-2">
                    <form action={setRole} className="flex items-center gap-2">
                      <select
                        name="role"
                        defaultValue={p.role}
                        className="rounded-md border border-border bg-surface px-2 py-1 text-sm"
                      >
                        <option value="student">student</option>
                        <option value="admin">admin</option>
                      </select>
                      <button
                        type="submit"
                        className="text-xs font-medium text-accent hover:underline"
                      >
                        zet
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-2">
                    {mastered > 0 ? (
                      <Badge tone="accent">{mastered}</Badge>
                    ) : (
                      <span className="text-text-muted">0</span>
                    )}
                  </td>
                  <td className="px-4 py-2">{stats?.total ?? 0}</td>
                  <td className="px-4 py-2">
                    {pct === null ? (
                      <span className="text-text-muted">—</span>
                    ) : (
                      `${pct}%`
                    )}
                  </td>
                  <td className="px-4 py-2 text-xs text-text-muted">
                    {stats?.lastAnsweredAt
                      ? new Date(stats.lastAnsweredAt).toLocaleString('nl-NL')
                      : '—'}
                  </td>
                </tr>
              )
            })}
            {profiles.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-text-muted"
                >
                  Nog geen gebruikers.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
