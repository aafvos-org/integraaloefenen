'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { after } from 'next/server'
import { getLocale } from 'next-intl/server'

import { stuurWelkomstmail } from '@/lib/email/welkom'
import { authFoutmelding, herkenAuthFout } from '@/lib/supabase/auth-fouten'
import { createClient } from '@/lib/supabase/server'

import {
  RESEND_WACHTTIJD,
  vertaalResendFout,
  type ResendUitkomst,
} from './resend'

export type LoginState = { error: string | null; unconfirmedEmail?: string | null }

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = (formData.get('email') ?? '').toString().trim()
  const password = (formData.get('password') ?? '').toString()

  if (!email || !password) {
    return { error: 'Vul je e-mailadres en wachtwoord in.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // Alleen bij een onbevestigd adres heeft de knop "stuur de mail opnieuw"
    // zin; daarvoor moet de pagina weten om welk adres het ging.
    const nietBevestigd = herkenAuthFout(error.message, error.code).soort === 'nietBevestigd'
    return {
      error: authFoutmelding(error, 'inloggen'),
      unconfirmedEmail: nietBevestigd ? email : null,
    }
  }

  // Vangnet naast de webhook op e-mailbevestiging: wie daar tussendoor valt,
  // krijgt de welkomstmail alsnog bij de eerste keer inloggen. De functie is
  // idempotent, dus dubbel aanroepen levert geen tweede mail op.
  //
  // Via `after` in plaats van een `await`: de mail kost een admin-call en een
  // Resend-call, en daar hoefde de leerling voorheen op te wachten voordat hij
  // doorgestuurd werd — ook als de mail allang verstuurd was. `after` draait
  // het werk ná de response, en blijft ook lopen als hieronder `redirect` wordt
  // aangeroepen.
  if (data.user) {
    const userId = data.user.id
    after(() => stuurWelkomstmail(userId))
  }

  const locale = await getLocale()
  revalidatePath('/', 'layout')
  redirect(`/${locale}/dashboard`)
}

/**
 * De bevestigingsmail nog een keer. Of dat lukt bepaalt Supabase: hij weigert
 * als er net al een mail de deur uit ging, en als de mailgrens van het project
 * vol zit. De inlogpagina leest de uitkomst en zegt wat er aan de hand is —
 * zie resend.ts.
 */
export async function resendConfirmationAction(
  email: string,
): Promise<ResendUitkomst> {
  const supabase = await createClient()
  const { error } = await supabase.auth.resend({ type: 'signup', email })
  if (!error) return { reden: 'gelukt', wachtSeconden: RESEND_WACHTTIJD }
  return vertaalResendFout(error.message, error.code)
}
