/**
 * Kwam deze bezoeker via ChatGPT? Dat is zo bij `?utm_source=chatgpt.com`
 * (of een variant die met "chatgpt" begint) of bij een verwijzer vanaf een
 * ChatGPT-domein. Gebruikt door de proef-strip op de startpagina, niet door
 * de klikmeting.
 */
/** Ook gebruikt door `vakantiebalk.ts` (INT-710), zodat de domeinlijst op één plek staat. */
export const CHATGPT_DOMEINEN_LIJST = ['chatgpt.com', 'chat.openai.com'] as const

const CHATGPT_DOMEINEN = new Set<string>(CHATGPT_DOMEINEN_LIJST)

export function isChatgptHerkomst(
  utmSource: string | null,
  verwijzerDomein: string | null,
): boolean {
  if (utmSource !== null && utmSource.trim().toLowerCase().startsWith('chatgpt')) return true
  if (verwijzerDomein !== null && CHATGPT_DOMEINEN.has(verwijzerDomein)) return true
  return false
}
