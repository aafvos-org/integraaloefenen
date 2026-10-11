/**
 * De enige plek waar de site zelf mail verstuurt.
 *
 * Er gaan vier soorten mail uit: de welkomstmail aan de leerling, het seintje
 * aan Aaf bij een nieuwe aanmelding, een vraag of stukje feedback, en een
 * video-verzoek. Die gingen alle vier via hun eigen `new Resend(...)`, en dus
 * kwam geen van vieren in een test voor: in een test is er geen sleutel en mag
 * er niets de deur uit.
 *
 * Nu lopen ze hier langs, met een schakelaar ervoor — net als de neppe
 * AI-controle in `src/lib/ai/stub.ts`:
 *
 *   MAIL_MODE=postbus   de mail gaat naar de testpostbus van de lokale
 *                       Supabase (Mailpit) en kan daar nagekeken worden
 *   anders              de mail gaat via de Resend-API echt de deur uit
 *
 * De schakelaar doet niets als `NODE_ENV` op `production` staat, zodat hij op
 * de echte site nooit kan aanslaan. Zie `versturen.test.ts`.
 */

import { Resend } from 'resend'

/**
 * De testpostbus van de lokale Supabase. Mailpit heeft naast de SMTP-poort ook
 * een HTTP-API om een bericht in te leveren; die gebruiken we, want een
 * SMTP-verbinding kan de Worker van Cloudflare niet eens opzetten en zou een
 * extra pakket kosten.
 */
const POSTBUS_URL = process.env.MAIL_POSTBUS_URL ?? 'http://127.0.0.1:54324'

export type MailBijlage = {
  filename: string
  /** De inhoud van het bestand, als base64. */
  content: string
  contentType?: string
  /** Zonder contentId komt een foto alleen als bijlage mee, niet in de mail zelf. */
  contentId?: string
}

export type TeVersturenMail = {
  /** `naam <adres>` of alleen een adres. */
  van: string
  aan: string
  onderwerp: string
  html: string
  tekst?: string
  antwoordNaar?: string
  bijlagen?: MailBijlage[]
}

export type MailResultaat = { gelukt: true } | { gelukt: false; fout: unknown }

/** Gaat de mail naar de testpostbus in plaats van de deur uit? Nooit in productie. */
export function mailGaatNaarDePostbus(): boolean {
  return (
    process.env.MAIL_MODE === 'postbus' &&
    process.env.NODE_ENV !== 'production'
  )
}

/**
 * `IntegraalOefenen <no-reply@...>` uit elkaar halen. Resend wil die ene regel,
 * de postbus wil naam en adres apart.
 */
export function splitsAfzender(van: string): { naam: string; adres: string } {
  const treffer = /^\s*(.*?)\s*<([^>]+)>\s*$/.exec(van)
  if (!treffer) return { naam: '', adres: van.trim() }
  return { naam: treffer[1].replace(/^"|"$/g, ''), adres: treffer[2].trim() }
}

/** Levert de mail af in de testpostbus, via de HTTP-API van Mailpit. */
async function naarDePostbus(mail: TeVersturenMail): Promise<MailResultaat> {
  const van = splitsAfzender(mail.van)
  let res: Response
  try {
    res = await fetch(`${POSTBUS_URL}/api/v1/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        From: { Email: van.adres, Name: van.naam || undefined },
        To: [{ Email: mail.aan }],
        ReplyTo: mail.antwoordNaar ? [{ Email: mail.antwoordNaar }] : undefined,
        Subject: mail.onderwerp,
        HTML: mail.html,
        Text: mail.tekst,
        Attachments: mail.bijlagen?.map((b) => ({
          Filename: b.filename,
          Content: b.content,
          ContentType: b.contentType,
          ContentID: b.contentId,
        })),
      }),
    })
  } catch (oorzaak) {
    return {
      gelukt: false,
      fout: `De testpostbus op ${POSTBUS_URL} is niet bereikbaar. Draait de lokale Supabase? (${oorzaak})`,
    }
  }

  if (!res.ok) {
    return {
      gelukt: false,
      fout: `De testpostbus op ${POSTBUS_URL} antwoordde met ${res.status}: ${await res.text()}`,
    }
  }
  return { gelukt: true }
}

/** Verstuurt de mail echt, via de Resend-API. */
async function viaResend(mail: TeVersturenMail): Promise<MailResultaat> {
  // Pas hier aanmaken: tijdens de build is RESEND_API_KEY er niet.
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from: mail.van,
    to: mail.aan,
    replyTo: mail.antwoordNaar,
    subject: mail.onderwerp,
    html: mail.html,
    ...(mail.tekst === undefined ? {} : { text: mail.tekst }),
    attachments: mail.bijlagen,
  })
  // De Resend-SDK gooit geen fout bij een geweigerde verzending (bijvoorbeeld
  // een afzenderdomein dat niet geverifieerd is); die zit in `error`.
  if (error) return { gelukt: false, fout: error }
  return { gelukt: true }
}

/**
 * Verstuurt één mail en zegt of dat gelukt is. Gooit nooit: elke aanroeper
 * wil zelf bepalen wat de leerling te zien krijgt als het misgaat.
 */
export async function verstuurMail(
  mail: TeVersturenMail,
): Promise<MailResultaat> {
  if (!mail.aan) {
    return { gelukt: false, fout: 'Er is geen ontvanger voor deze mail.' }
  }

  try {
    return mailGaatNaarDePostbus()
      ? await naarDePostbus(mail)
      : await viaResend(mail)
  } catch (oorzaak) {
    return { gelukt: false, fout: oorzaak }
  }
}
