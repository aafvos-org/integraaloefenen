import { setRequestLocale } from 'next-intl/server'

/**
 * Zonder deze aanroep leest next-intl de request-headers. Dan wordt de pagina
 * bij elk bezoek opnieuw gebouwd, ook als de inhoud nooit verandert.
 * Roep dit aan vóór `getTranslations` of `getMessages`.
 */
export function zetStatischeTaal(locale: string) {
  setRequestLocale(locale)
}
