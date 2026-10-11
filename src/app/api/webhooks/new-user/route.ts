import { seintjeAanmelding, verstuurSeintje } from '@/lib/email/beheer'
import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * Trigger `webhook_nieuwe_gebruiker` op `public.profiles` (INSERT), uit
 * supabase/migrations/0043_webhook_triggers.sql.
 *
 * Deze gaat af bij het **registreren**, dus vóór het bevestigen van het
 * e-mailadres. Het tweede seintje — na het bevestigen — hangt aan de
 * welkomstmail (src/lib/email/welkom.ts).
 */
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

    const uitkomst = await verstuurSeintje(
      seintjeAanmelding(
        { id: String(record.id), email, gebruikersnaam: username },
        new Date(record.created_at),
      ),
    )

    // Geen adres ingesteld? Dan één regel in de logs en toch een 200. De
    // trigger in de database kijkt niet of de webhook aankwam, dus van een 502
    // wordt niemand wijzer; dit is geen mislukte verzending maar een
    // instelling die ontbreekt.
    if (!uitkomst.gelukt && uitkomst.reden === 'geen-ontvanger') {
      console.error(
        'NOTIFY_EMAIL staat niet ingesteld; het seintje over de nieuwe gebruiker gaat nergens heen.',
      )
      return Response.json({ ok: true, verstuurd: false })
    }

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
