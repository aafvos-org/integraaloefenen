'use server'

import { requestOrigin } from '@/lib/request-origin'
import { authFoutmelding } from '@/lib/supabase/auth-fouten'
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

  // "Bestaat niet"-fouten verzwijgen we met opzet: anders kan iemand via dit
  // formulier uitvissen welke adressen een account hebben. De rest (de volle
  // mailgrens, een verkeerd ingestelde redirect-URL) hoort de leerling wél te
  // zien — in het Nederlands, de Engelse tekst blijft in de logs.
  if (error && !/user/i.test(error.message)) {
    return { sent: false, error: authFoutmelding(error, 'wachtwoord-vergeten') }
  }

  return { sent: true, error: null }
}
