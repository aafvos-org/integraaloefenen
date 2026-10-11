'use server'

import { SITE_CONFIG } from '@/config/site'
import { verstuurMail } from '@/lib/email/versturen'
import { createClient } from '@/lib/supabase/server'

export type FeedbackState = {
  error: string | null
  sent: boolean
}

/**
 * Afzender: zet EMAIL_FROM zodra het eigen domein in Resend geverifieerd is;
 * tot die tijd valt dit terug op het domein van de site.
 */
const EMAIL_FROM = process.env.EMAIL_FROM ?? `no-reply@${SITE_CONFIG.domain}`

/** Waar een vraag via Aaf heen gaat; feedback gaat naar NOTIFY_EMAIL. */
const VRAGEN_NAAR = 'aaf@example.com'

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

  const uitkomst = await verstuurMail({
    van: EMAIL_FROM,
    aan: VRAGEN_NAAR,
    antwoordNaar: user.email ?? undefined,
    onderwerp: `Vraag via Aaf op ${SITE_CONFIG.domain}`,
    html: `
        <h2>Vraag via Aaf</h2>
        <p><b>Van:</b> ${escapeHtml(user.email ?? user.id)}</p>
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      `,
  })
  if (!uitkomst.gelukt) {
    console.error('[ask-aaf]', uitkomst.fout)
    return {
      error: 'Versturen is niet gelukt. Probeer het later nog eens.',
      sent: false,
    }
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

  const uitkomst = await verstuurMail({
    van: EMAIL_FROM,
    aan: process.env.NOTIFY_EMAIL ?? '',
    antwoordNaar: user.email ?? undefined,
    onderwerp: `Feedback op ${SITE_CONFIG.domain}`,
    html: `
        <h2>Feedback</h2>
        <p><b>Van:</b> ${escapeHtml(user.email ?? user.id)}</p>
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      `,
  })
  if (!uitkomst.gelukt) {
    console.error('[feedback]', uitkomst.fout)
    return {
      error: 'Versturen is niet gelukt. Probeer het later nog eens.',
      sent: false,
    }
  }

  return { error: null, sent: true }
}
