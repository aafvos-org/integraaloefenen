/**
 * Stuurt een leerling een mailtje dat zijn vraag is beantwoord met een video.
 * Zelfde opmaak als de welkomst- en bevestigingsmail (src/lib/email/welkom.ts,
 * supabase/email-templates/), zodat alle mails als één serie voelen.
 *
 * Gebruik:
 *   npx tsx --env-file=.env.local scripts/mail-vraag-beantwoord.ts \
 *     <e-mailadres> <video-slug> "<onderwerp van de vraag>"
 *
 * Bijvoorbeeld:
 *   npx tsx --env-file=.env.local scripts/mail-vraag-beantwoord.ts \
 *     leerling@example.com quotientregel "de quotiëntregel"
 */
import { Resend } from 'resend'

const BRAND = 'AfgeleideOefenen'
const DOMEIN = 'afgeleideoefenen.nl'
const SITE_URL = `https://www.${DOMEIN}`
const EMAIL_FROM = process.env.EMAIL_FROM ?? `no-reply@${DOMEIN}`
/** Antwoorden komen bij Aaf zelf binnen, niet bij het no-reply-adres. */
const REPLY_TO = 'aaf@example.com'

function html(videoUrl: string, onderwerp: string): string {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #f7f6f3; padding: 32px 12px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 540px;">

        <tr>
          <td align="center" style="padding: 0 0 20px;">
            <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 20px; color: #1a1a18;">
              ${BRAND}<span style="color: #2d6a4f;">.nl</span>
            </span>
          </td>
        </tr>

        <tr>
          <td style="background: #ffffff; border: 1px solid #e6e3db; border-radius: 14px; padding: 36px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">

              <tr>
                <td align="center" style="font-family: Georgia, 'Times New Roman', serif; font-size: 26px; line-height: 1.3; color: #1a1a18; padding-bottom: 12px;">
                  Je vraag is beantwoord.
                </td>
              </tr>

              <tr>
                <td align="center" style="font-family: 'DM Sans', Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #6f6d65; padding-bottom: 26px;">
                  Je vroeg om uitleg over
                  <strong style="color: #1a1a18;">${onderwerp}</strong>. Daar staat
                  nu een video over klaar &mdash; met het stappenplan en een
                  voorbeeld helemaal uitgewerkt.
                </td>
              </tr>

              <tr>
                <td align="center" style="padding-bottom: 24px;">
                  <a href="${videoUrl}"
                     style="display: inline-block; background: #2d6a4f; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-family: 'DM Sans', Arial, sans-serif; font-size: 15px; font-weight: 600;">
                    Bekijk de video
                  </a>
                </td>
              </tr>

              <tr>
                <td align="center" style="font-family: 'DM Sans', Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #6f6d65; padding-bottom: 16px;">
                  Onder de video staan een paar oefenvragen, zodat je meteen
                  kunt checken of het lukt.
                </td>
              </tr>

              <tr>
                <td align="center" style="font-family: 'DM Sans', Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #6f6d65; padding-bottom: 24px;">
                  Loop je weer ergens op vast? Stuur je vraag gerust in, je
                  vrienden mogen dat ook. Hoe meer vragen er binnenkomen, hoe
                  meer uitleg er voor iedereen bij komt.
                </td>
              </tr>

              <tr>
                <td align="center" style="font-family: Georgia, 'Times New Roman', serif; font-size: 15px; color: #1a1a18; border-top: 1px solid #eeece5; padding-top: 22px;">
                  Groeten van Aaf
                </td>
              </tr>

            </table>
          </td>
        </tr>

        <tr>
          <td align="center" style="font-family: 'DM Sans', Arial, sans-serif; font-size: 12px; line-height: 1.6; color: #a8a599; padding: 20px 16px 0;">
            Je krijgt deze e-mail omdat je een vraag hebt ingestuurd op
            ${DOMEIN}.
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>`
}

function tekst(videoUrl: string, onderwerp: string): string {
  return `Je vraag is beantwoord.

Je vroeg om uitleg over ${onderwerp}. Daar staat nu een video over klaar - met het stappenplan en een voorbeeld helemaal uitgewerkt: ${videoUrl}

Onder de video staan een paar oefenvragen, zodat je meteen kunt checken of het lukt.

Loop je weer ergens op vast? Stuur je vraag gerust in, je vrienden mogen dat ook. Hoe meer vragen er binnenkomen, hoe meer uitleg er voor iedereen bij komt.

Groeten van Aaf`
}

async function main() {
  const [adres, slug, onderwerp] = process.argv.slice(2)
  if (!adres || !slug || !onderwerp) {
    console.error(
      'Gebruik: npx tsx scripts/mail-vraag-beantwoord.ts <e-mailadres> <video-slug> "<onderwerp>"',
    )
    process.exit(1)
  }

  const videoUrl = `${SITE_URL}/nl/uitleg-videos?video=${encodeURIComponent(slug)}`
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { data, error } = await resend.emails.send({
    from: `${BRAND} <${EMAIL_FROM}>`,
    to: adres,
    replyTo: REPLY_TO,
    subject: 'Je vraag is beantwoord — er staat een video voor je klaar',
    html: html(videoUrl, onderwerp),
    text: tekst(videoUrl, onderwerp),
  })

  if (error) {
    console.error('Versturen mislukt:', error)
    process.exit(1)
  }
  console.log(`Verstuurd naar ${adres} (id ${data?.id})`)
  console.log(`Link in de mail: ${videoUrl}`)
}

main()
