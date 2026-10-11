/**
 * De enige plek die bepaalt wie een mail verstuurt en wie hem krijgt.
 *
 * `versturen.ts` weet hóé een mail de deur uit gaat; dit bestand weet naar
 * wie. Dat stond eerst op vier plekken los van elkaar: twee berichten aan Aaf
 * hadden zijn adres letterlijk in de code staan en twee lazen `NOTIFY_EMAIL`,
 * en de afzender werd vier keer apart in elkaar gezet. Eén adres omzetten
 * verplaatste dus maar de helft van de post.
 *
 * Twee omgevingsvariabelen, allebei alleen hier gelezen:
 *
 *   EMAIL_FROM     de afzender van elke mail die de site stuurt. Mag een kaal
 *                  adres zijn of `Naam <adres>`. Niet gezet? Dan
 *                  `no-reply@<domein>`.
 *   NOTIFY_EMAIL   het adres van Aaf: hier komt élk bericht aan hem binnen.
 *                  Niet gezet? Dan `null`, en de aanroeper verstuurt niets —
 *                  liever geen mail dan een mail aan "undefined".
 *
 * Het onderwerp staat hier ook, want wie bepaalt waar een bericht heen gaat
 * bepaalt ook waaraan Aaf het in zijn postvak herkent.
 */

import { SITE_CONFIG } from '@/config/site'

/**
 * De afzender, als één regel voor Resend: `IntegraalOefenen <no-reply@…>`.
 *
 * `EMAIL_FROM` mag de merknaam al bevatten; dan pakken we hem niet nog eens in.
 */
export function afzender(): string {
  const ingesteld = process.env.EMAIL_FROM?.trim()
  const adres = ingesteld || `no-reply@${SITE_CONFIG.domain}`
  return adres.includes('<') ? adres : `${SITE_CONFIG.brand} <${adres}>`
}

/**
 * Het adres van Aaf, of `null` als `NOTIFY_EMAIL` niet ingesteld is.
 *
 * De aanroeper logt dat zelf in één regel en stuurt niets: een lege ontvanger
 * wordt door Resend geweigerd, en bij de webhook struikelde de database daar
 * dan over.
 */
export function ontvangerAanAaf(): string | null {
  return process.env.NOTIFY_EMAIL?.trim() || null
}

/** De soorten bericht die de site aan Aaf stuurt. */
export type BerichtAanAaf =
  /** Iemand heeft een account aangemaakt. */
  | 'aanmelding'
  /** Diezelfde iemand heeft zijn e-mailadres bevestigd. */
  | 'bevestigd'
  /** Een vraag via Aaf, het hulppoppetje. */
  | 'vraag'
  /** Een verzoek om een uitlegvideo. */
  | 'video'
  /** Feedback over de site. */
  | 'feedback'

/**
 * Het begin van het onderwerp per soort.
 *
 * Het verschil staat vooraan, niet achteraan: op een telefoon ziet Aaf alleen
 * de eerste woorden, en "Aanmelding" en "Bevestigd" gaan over dezelfde
 * leerling. De domeinnaam staat er niet meer bij — deze repo is één site, en
 * die naam kostte alleen maar ruimte op het schermpje.
 */
const KOP: Record<BerichtAanAaf, string> = {
  aanmelding: 'Aanmelding',
  bevestigd: 'Bevestigd',
  vraag: 'Vraag via Aaf',
  video: 'Video-verzoek',
  feedback: 'Feedback',
}

/**
 * Het onderwerp van een bericht aan Aaf: de soort voorop, daarachter om wie
 * het gaat (e-mailadres, anders de gebruikersnaam of het id).
 */
export function onderwerpAanAaf(soort: BerichtAanAaf, wie: string): string {
  const over = wie.trim()
  return over ? `${KOP[soort]}: ${over}` : KOP[soort]
}
