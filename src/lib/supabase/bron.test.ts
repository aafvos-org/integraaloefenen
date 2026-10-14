import { describe, expect, it, vi } from 'vitest'

import { zetGekozenBron } from './bron'

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

describe('zetGekozenBron', () => {
  it('zet youtube op een profiel zonder bron', async () => {
    const { supabase, calls } = nepSupabase({ data: [{ id: 'u1' }] })
    const uit = await zetGekozenBron(supabase, {
      id: 'u1',
      user_metadata: { bron: ' YouTube ' },
    })
    expect(uit).toBe('gezet')
    expect(calls.update).toEqual([{ bron: 'youtube' }])
    expect(calls.eq).toEqual(['id', 'u1'])
    expect(calls.is).toEqual(['bron', null])
  })

  it('slaat een onbekende bron over, ook bevestiging', async () => {
    const { supabase, keten } = nepSupabase({ data: [] })
    expect(
      await zetGekozenBron(supabase, { id: 'u1', user_metadata: { bron: 'bevestiging' } }),
    ).toBe('overgeslagen')
    expect(keten.update).not.toHaveBeenCalled()
  })

  it('slaat over als het profiel al een bron had', async () => {
    const { supabase } = nepSupabase({ data: [] })
    expect(
      await zetGekozenBron(supabase, { id: 'u1', user_metadata: { bron: 'klas' } }),
    ).toBe('overgeslagen')
  })

  it('faalt niet hard als de kolom er nog niet is', async () => {
    const { supabase } = nepSupabase({ error: { message: 'column bron does not exist' } })
    const fout = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(
      await zetGekozenBron(supabase, { id: 'u1', user_metadata: { bron: 'forum' } }),
    ).toBe('mislukt')
    fout.mockRestore()
  })

  it('doet niets zonder gebruiker', async () => {
    const { supabase } = nepSupabase({})
    expect(await zetGekozenBron(supabase, null)).toBe('overgeslagen')
  })
})
