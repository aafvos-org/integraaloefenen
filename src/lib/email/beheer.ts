/**
 * De twee seintjes aan Aaf rond een nieuw account.
 *
 * Er zijn er twee, en ze gaan over verschillende momenten:
 *
 *   Aanmelding  — iemand heeft het registratieformulier ingevuld. Het adres is
 *                 dan nog niet bevestigd; dat kan ook nooit meer gebeuren.
 *   Bevestigd   — diezelfde leerling heeft op de link in de bevestigingsmail
 *                 geklikt. Pas dan is het een account dat echt werkt.
 *
 * Wie de mail krijgt, van wie hij komt en waaraan Aaf hem in zijn postvak
 * herkent, staat in `adressen.ts`. Hier staat alleen wat erin staat.
 */

import {
  afzender,
  onderwerpAanAaf,
  ontvangerAanAaf,
  type BerichtAanAaf,
} from '@/lib/email/adressen'
import { verstuurMail } from '@/lib/email/versturen'

export type Leerling = {
  id: string
  email: string | null
  gebruikersnaam: string | null
}

export type Seintje = {
  onderwerp: string
  html: string
}

export type SeintjeResultaat =
  | { gelukt: true }
  /** `NOTIFY_EMAIL` staat niet ingesteld; er is niets verstuurd. */
  | { gelukt: false; reden: 'geen-ontvanger' }
  | { gelukt: false; reden: 'mislukt'; fout: unknown }

function escapeHtml(waarde: string): string {
  return waarde
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/** Een datum zoals Aaf hem leest: Nederlandse notatie, Nederlandse tijd. */
function moment(wanneer: Date): string {
  return wanneer.toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' })
}

/** Waaraan Aaf ziet over wie het gaat, ook als er nog geen naam is. */
function overWie(leerling: Leerling): string {
  return leerling.email ?? leerling.gebruikersnaam ?? leerling.id
}

function tabel(rijen: [label: string, waarde: string | null][]): string {
  const cellen = rijen
    .map(
      ([label, waarde]) =>
        `<tr><td><b>${label}</b></td><td>${waarde ? escapeHtml(waarde) : '—'}</td></tr>`,
    )
    .join('\n          ')
  return `<table cellpadding="6">
          ${cellen}
        </table>`
}

function seintje(
  soort: BerichtAanAaf,
  leerling: Leerling,
  kop: string,
  uitleg: string,
  momentLabel: string,
  wanneer: Date,
): Seintje {
  return {
    onderwerp: onderwerpAanAaf(soort, overWie(leerling)),
    html: `
        <h2>${kop}</h2>
        <p>${uitleg}</p>
        ${tabel([
          ['E-mail', leerling.email],
          ['Gebruikersnaam', leerling.gebruikersnaam],
          [momentLabel, moment(wanneer)],
          ['ID', leerling.id],
        ])}
      `,
  }
}

/** Seintje bij het registreren: het adres is nog niet bevestigd. */
export function seintjeAanmelding(
  leerling: Leerling,
  aangemeldOp: Date,
): Seintje {
  return seintje(
    'aanmelding',
    leerling,
    'Aanmelding',
    `Iemand heeft zich geregistreerd. Het e-mailadres is nog niet bevestigd;
        daar komt een tweede bericht over zodra dat gebeurt.`,
    'Aangemeld op',
    aangemeldOp,
  )
}

/** Seintje bij het bevestigen: vanaf nu is het een account dat werkt. */
export function seintjeBevestigd(
  leerling: Leerling,
  bevestigdOp: Date,
): Seintje {
  return seintje(
    'bevestigd',
    leerling,
    'E-mailadres bevestigd',
    `Deze leerling heeft op de link in de bevestigingsmail geklikt en heeft de
        welkomstmail gekregen.`,
    'Bevestigd op',
    bevestigdOp,
  )
}

/**
 * Verstuurt een seintje aan Aaf. Gooit nooit.
 *
 * Staat `NOTIFY_EMAIL` niet ingesteld, dan gaat er niets uit en zegt dit dat
 * ook: een lege ontvanger wordt geweigerd, en daar is een trigger in de
 * database niet mee geholpen.
 */
export async function verstuurSeintje(
  bericht: Seintje,
): Promise<SeintjeResultaat> {
  const aan = ontvangerAanAaf()
  if (!aan) return { gelukt: false, reden: 'geen-ontvanger' }

  const uitkomst = await verstuurMail({
    van: afzender(),
    aan,
    onderwerp: bericht.onderwerp,
    html: bericht.html,
  })
  return uitkomst.gelukt
    ? { gelukt: true }
    : { gelukt: false, reden: 'mislukt', fout: uitkomst.fout }
}
