import { describe, expect, it, vi } from 'vitest'

import { zetGekozenGebruikersnaam } from './gebruikersnaam'

/** Kleine nep-Supabase die de update-keten nabootst. */
function nepSupabase(uitkomst: { data?: unknown[]; error?: { message: string } | null }) {
  const calls: Record<string, unknown[]> = {}
  const keten = {
    update: vi.fn((v: unknown) => ((calls.update = [v]), keten)),
    eq: vi.fn((k: string, v: unknown) => ((calls.eq = [k, v]), keten)),
    is: vi.fn((k: string, v: unknown) => ((calls.is = [k, v]), keten)),
    select: vi.fn(async () => ({ data: uitkomst.data ?? null, error: uitkomst.error ?? null })),
  }
  const supabase = { from: vi.fn(() => keten) }
  return { supabase: supabase as never, calls, keten }
}

describe('zetGekozenGebruikersnaam', () => {
  it('zet de gekozen naam op een profiel zonder naam', async () => {
    const { supabase, calls } = nepSupabase({ data: [{ id: 'u1' }] })
    const uit = await zetGekozenGebruikersnaam(supabase, {
      id: 'u1',
      user_metadata: { username: '  wiskundefan ' },
    })
    expect(uit).toBe('gezet')
    expect(calls.update).toEqual([{ username: 'wiskundefan' }])
    expect(calls.eq).toEqual(['id', 'u1'])
    // Nooit een bestaande naam overschrijven.
    expect(calls.is).toEqual(['username', null])
  })

  it('slaat over als er geen naam gekozen is', async () => {
    const { supabase, keten } = nepSupabase({ data: [] })
    expect(await zetGekozenGebruikersnaam(supabase, { id: 'u1', user_metadata: {} })).toBe(
      'overgeslagen',
    )
    expect(keten.update).not.toHaveBeenCalled()
  })

  it('slaat over als het profiel al een naam had', async () => {
    const { supabase } = nepSupabase({ data: [] })
    expect(
      await zetGekozenGebruikersnaam(supabase, { id: 'u1', user_metadata: { username: 'x' } }),
    ).toBe('overgeslagen')
  })

  it('faalt niet hard als de naam intussen bezet is', async () => {
    const { supabase } = nepSupabase({ error: { message: 'duplicate key value' } })
    const fout = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(
      await zetGekozenGebruikersnaam(supabase, { id: 'u1', user_metadata: { username: 'bezet' } }),
    ).toBe('mislukt')
    fout.mockRestore()
  })

  it('doet niets zonder gebruiker', async () => {
    const { supabase } = nepSupabase({})
    expect(await zetGekozenGebruikersnaam(supabase, null)).toBe('overgeslagen')
  })
})
