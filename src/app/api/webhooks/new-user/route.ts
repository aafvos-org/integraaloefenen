import { SITE_CONFIG } from '@/config/site'
import { verstuurMail } from '@/lib/email/versturen'
import { createServiceRoleClient } from '@/lib/supabase/server'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export async function POST(req: Request) {
  // Verify webhook secret
  const secret = req.headers.get('x-webhook-secret')
  if (secret !== process.env.WEBHOOK_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await req.json()

    if (payload.type !== 'INSERT') {
      return Response.json({ ok: true })
    }

    const record = payload.record
    const aangemeldOp = new Date(record.created_at).toLocaleString('nl-NL', {
      timeZone: 'Europe/Amsterdam',
    })

    // De record uit de profiles-trigger bevat het id, maar niet altijd het
    // e-mailadres. Haal e-mail en gebruikersnaam op via de service-role.
    let email: string | null = record.email ?? null
    let username: string | null = record.username ?? null
    try {
      const supabase = createServiceRoleClient()
      const { data } = await supabase.auth.admin.getUserById(record.id)
      email = data.user?.email ?? email
      if (!username) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', record.id)
          .maybeSingle()
        username = profile?.username ?? null
      }
    } catch (lookupErr) {
      console.error('Kon gebruikersgegevens niet ophalen:', lookupErr)
    }

    const uitkomst = await verstuurMail({
      van: process.env.EMAIL_FROM ?? `no-reply@${SITE_CONFIG.domain}`,
      aan: process.env.NOTIFY_EMAIL ?? '',
      onderwerp: `Nieuwe gebruiker op ${SITE_CONFIG.domain}`,
      html: `
        <h2>Nieuwe registratie</h2>
        <table cellpadding="6">
          <tr><td><b>E-mail</b></td><td>${email ? escapeHtml(email) : '—'}</td></tr>
          <tr><td><b>Gebruikersnaam</b></td><td>${username ? escapeHtml(username) : '—'}</td></tr>
          <tr><td><b>Aangemeld op</b></td><td>${aangemeldOp}</td></tr>
          <tr><td><b>ID</b></td><td>${escapeHtml(String(record.id))}</td></tr>
        </table>
      `,
    })

    if (!uitkomst.gelukt) {
      console.error('Kon het seintje over de nieuwe gebruiker niet versturen:', uitkomst.fout)
      return Response.json(
        { error: 'Email not sent', detail: uitkomst.fout },
        { status: 502 },
      )
    }

    return Response.json({ ok: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return Response.json({ error: 'Failed' }, { status: 500 })
  }
}
