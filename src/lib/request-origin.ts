import { headers } from 'next/headers'

import { SITE_CONFIG } from '@/config/site'

/**
 * Het adres waar een leerling nu zit, als volledig adres (`https://host`),
 * zonder schuine streep aan het eind.
 *
 * Supabase zet dit adres voor de terugkeerlink in een mail (bevestigen van je
 * account, wachtwoord opnieuw). Een half adres zoals `www.integraaloefenen.nl`
 * of `/auth/callback` wordt door Supabase geweigerd: die valt dan terug op de
 * `site_url` van het project, en de leerling komt op de echte site in plaats
 * van op de voorbeeldversie waar hij vandaan kwam. Daarom levert dit altijd
 * schema + host op.
 */

const FALLBACK_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${SITE_CONFIG.domain}`

type HeaderBag = { get(name: string): string | null }

function withoutTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '')
}

function isLocal(host: string): boolean {
  return /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(host)
}

/** Dezelfde regel als `requestOrigin()`, maar met headers die je zelf aanlevert. */
export function originFromHeaders(headersList: HeaderBag): string {
  // 1. De `origin`-header: die heeft het schema al bij zich. Bij een gewone
  //    formulierverzending staat die er altijd.
  const origin = headersList.get('origin')
  if (origin && /^https?:\/\/.+/i.test(origin)) {
    return withoutTrailingSlash(origin)
  }

  // 2. Anders de host van het verzoek. Die komt zonder schema binnen, dus dat
  //    zetten we er zelf voor. Een proxy kan meerdere hosts doorgeven; de
  //    eerste is die van de leerling.
  const host = (headersList.get('x-forwarded-host') ?? headersList.get('host'))
    ?.split(',')[0]
    ?.trim()
  if (host) {
    const protocol =
      headersList.get('x-forwarded-proto')?.split(',')[0]?.trim() ||
      (isLocal(host) ? 'http' : 'https')
    return `${protocol}://${host}`
  }

  // 3. Helemaal geen headers: terug naar het vaste adres van de site.
  return withoutTrailingSlash(FALLBACK_ORIGIN)
}

/** Het volledige adres van het huidige verzoek, bv. `https://www.integraaloefenen.nl`. */
export async function requestOrigin(): Promise<string> {
  return originFromHeaders(await headers())
}
