'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'

import { aanmeldGegevens, leesBron } from '@/lib/bron'
import { requestOrigin } from '@/lib/request-origin'
import { authFoutmelding } from '@/lib/supabase/auth-fouten'
import { zetGekozenBron } from '@/lib/supabase/bron'
import { zetGekozenGebruikersnaam } from '@/lib/supabase/gebruikersnaam'
import { createClient } from '@/lib/supabase/server'

export type SignupState = {
  error: string | null
  notice: string | null
  /** Ingevulde velden terugzetten na een foutmelding */
  values?: { username: string; email: string }
}

export async function signupAction(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const email = (formData.get('email') ?? '').toString().trim()
  const password = (formData.get('password') ?? '').toString()
  const username = (formData.get('username') ?? '').toString().trim() || null
  const bron = leesBron(formData.get('van'))

  const values = { username: username ?? '', email }

  if (!email || !password) {
    return {
      error: 'Vul een e-mailadres en wachtwoord in.',
      notice: null,
      values,
    }
  }

  if (password.length < 8) {
    return {
      error: 'Je wachtwoord moet minstens 8 tekens lang zijn.',
      notice: null,
      values,
    }
  }

  const passwordConfirm = (formData.get('passwordConfirm') ?? '').toString()
  if (password !== passwordConfirm) {
    return {
      error: 'De wachtwoorden komen niet overeen.',
      notice: null,
      values,
    }
  }

  const supabase = await createClient()
  const origin = await requestOrigin()
  const locale = await getLocale()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Na het bevestigen van de e-mail meteen ingelogd op de oefenpagina,
      // net als iemand die zich aanmeldt zonder bevestigingsmail. `van`
      // vertelt de callback dat deze link uit de bevestigingsmail komt.
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(`/${locale}/oefenen`)}&van=bevestiging`,
      // `van=bevestiging` hoort bij de mail. De bron (youtube, docent, …)
      // gaat apart mee in het account, niet in die link en niet in een cookie.
      data: aanmeldGegevens(username, bron),
    },
  })

  if (error) {
    return { error: authFoutmelding(error, 'registreren'), notice: null, values }
  }

  // If email confirmation is enabled, the user isn't logged in yet.
  if (!data.session) {
    return {
      error: null,
      notice:
        'Account aangemaakt. Klik op de link in de bevestigingsmail, dan kun je meteen beginnen.',
    }
  }

  // Zonder mailbevestiging is er meteen een sessie: zet naam en bron nu al.
  await zetGekozenGebruikersnaam(supabase, data.user)
  await zetGekozenBron(supabase, data.user)

  revalidatePath('/', 'layout')
  redirect(`/${locale}/oefenen`)
}
