'use server'

import {
  afzender,
  onderwerpAanAaf,
  ontvangerAanAaf,
} from '@/lib/email/adressen'
import { verstuurMail } from '@/lib/email/versturen'
import { createClient } from '@/lib/supabase/server'

export type FeedbackState = {
  error: string | null
  sent: boolean
}

/** Wat de leerling ziet als het bericht niet weg kon. */
const NIET_GELUKT = 'Versturen is niet gelukt. Probeer het later nog eens.'

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

/** Vraag gesteld via Aaf (het hulppoppetje): mailt de vraag door, slaat niets op. */
export async function askAafAction(
  _prev: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
  const message = (formData.get('message') ?? '').toString().trim()

  if (!message) {
    return { error: 'Typ eerst je vraag.', sent: false }
  }
  if (message.length > 2000) {
    return { error: 'Je vraag is te lang (max 2000 tekens).', sent: false }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Niet ingelogd.', sent: false }

  const aan = ontvangerAanAaf()
  if (!aan) {
    console.error('[ask-aaf] NOTIFY_EMAIL staat niet ingesteld; de vraag gaat nergens heen.')
    return { error: NIET_GELUKT, sent: false }
  }

  const vanWie = user.email ?? user.id
  const uitkomst = await verstuurMail({
    van: afzender(),
    aan,
    antwoordNaar: user.email ?? undefined,
    onderwerp: onderwerpAanAaf('vraag', vanWie),
    html: `
        <h2>Vraag via Aaf</h2>
        <p><b>Van:</b> ${escapeHtml(vanWie)}</p>
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      `,
  })
  if (!uitkomst.gelukt) {
    console.error('[ask-aaf]', uitkomst.fout)
    return { error: NIET_GELUKT, sent: false }
  }

  return { error: null, sent: true }
}

export async function sendFeedbackAction(
  _prev: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
  const message = (formData.get('message') ?? '').toString().trim()

  if (!message) {
    return { error: 'Schrijf eerst een bericht.', sent: false }
  }
  if (message.length > 5000) {
    return { error: 'Je bericht is te lang (max 5000 tekens).', sent: false }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Niet ingelogd.', sent: false }

  const aan = ontvangerAanAaf()
  if (!aan) {
    console.error('[feedback] NOTIFY_EMAIL staat niet ingesteld; de feedback gaat nergens heen.')
    return { error: NIET_GELUKT, sent: false }
  }

  const vanWie = user.email ?? user.id
  const uitkomst = await verstuurMail({
    van: afzender(),
    aan,
    antwoordNaar: user.email ?? undefined,
    onderwerp: onderwerpAanAaf('feedback', vanWie),
    html: `
        <h2>Feedback</h2>
        <p><b>Van:</b> ${escapeHtml(vanWie)}</p>
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      `,
  })
  if (!uitkomst.gelukt) {
    console.error('[feedback]', uitkomst.fout)
    return { error: NIET_GELUKT, sent: false }
  }

  return { error: null, sent: true }
}
