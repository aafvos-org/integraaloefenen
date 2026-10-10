'use server'

import { requestOrigin } from '@/lib/request-origin'
import { createClient } from '@/lib/supabase/server'

export type ForgotState = { sent: boolean; error: string | null }

export async function forgotPasswordAction(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const email = (formData.get('email') ?? '').toString().trim()
  if (!email) return { sent: false, error: 'Vul je e-mailadres in.' }

  // Het adres van het huidige verzoek, zodat de link in de mail terugwijst
  // naar waar de leerling vandaan kwam (bv. een voorbeeldversie).
  const origin = await requestOrigin()

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/wachtwoord-opnieuw`,
  })

  // Surface configuration errors (e.g. "Redirect URL not allowed") so they
  // are visible in the UI. We deliberately hide "user not found" style errors
  // to prevent email enumeration.
  if (error && !/user/i.test(error.message)) {
    return { sent: false, error: error.message }
  }

  return { sent: true, error: null }
}
