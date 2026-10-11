'use server'

import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'

import { authFoutmelding } from '@/lib/supabase/auth-fouten'
import { createClient } from '@/lib/supabase/server'

export type NewPasswordState = { error: string | null }

export async function newPasswordAction(
  _prev: NewPasswordState,
  formData: FormData,
): Promise<NewPasswordState> {
  const password = (formData.get('password') ?? '').toString()
  if (!password || password.length < 8) {
    return { error: 'Kies een wachtwoord van minstens 8 tekens.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  // Komt een leerling hier met een verlopen link, dan is er geen sessie en
  // weigert Supabase. Ook dat hoort in het Nederlands op het scherm te staan.
  if (error) return { error: authFoutmelding(error, 'wachtwoord-opnieuw') }

  const locale = await getLocale()
  redirect(`/${locale}/dashboard`)
}
