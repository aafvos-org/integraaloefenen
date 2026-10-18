/**
 * Kwam deze bezoeker via ChatGPT? Dat is zo bij `?utm_source=chatgpt.com`
 * (of een variant die met "chatgpt" begint) of bij een verwijzer vanaf een
 * ChatGPT-domein. Gebruikt door de proef-strip op de startpagina, niet door
 * de klikmeting.
 */
const CHATGPT_DOMEINEN = new Set(['chatgpt.com', 'chat.openai.com'])

export function isChatgptHerkomst(
  utmSource: string | null,
  verwijzerDomein: string | null,
): boolean {
  if (utmSource !== null && utmSource.trim().toLowerCase().startsWith('chatgpt')) return true
  if (verwijzerDomein !== null && CHATGPT_DOMEINEN.has(verwijzerDomein)) return true
  return false
}
