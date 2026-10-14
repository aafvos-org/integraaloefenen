'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { veiligeVolgende } from '@/lib/google-login'
import { AUTH_FOUT_ZINNEN } from '@/lib/supabase/auth-fouten'
import { createClient } from '@/lib/supabase/server'

export type NaamState = { error: string | null }

export async function kiesGebruikersnaamAction(
  _prev: NaamState,
  formData: FormData,
): Promise<NaamState> {
  const username = (formData.get('username') ?? '').toString().trim()
  const next = veiligeVolgende((formData.get('next') ?? '').toString())

  if (username.length > 40) {
    return { error: 'Gebruik maximaal 40 tekens.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/nl/inloggen')

  if (username) {
    const { error } = await supabase.from('profiles').update({ username }).eq('id', user.id)

    if (error) {
      if (error.code === '23505' || /duplicate key|unique/i.test(error.message)) {
        return { error: 'Deze gebruikersnaam is al bezet. Kies een andere.' }
      }
      console.error('[gebruikersnaam google]', error.code, error.message)
      return { error: AUTH_FOUT_ZINNEN.onbekend }
    }
  }

  const { error: metaFout } = await supabase.auth.updateUser({
    data: {
      ...(username ? { username } : {}),
      gebruikersnaam_gevraagd: true,
    },
  })

  // De naam staat al op het profiel. De vlag is dan alleen een extra
  // herinnering; zonder naam moet de vlag wél lukken, anders vragen we
  // de volgende keer opnieuw.
  if (metaFout && !username) {
    console.error('[gebruikersnaam google vlag]', metaFout.message)
    return { error: AUTH_FOUT_ZINNEN.onbekend }
  }
  if (metaFout) {
    console.error('[gebruikersnaam google vlag]', metaFout.message)
  }

  revalidatePath('/', 'layout')
  redirect(next)
}
