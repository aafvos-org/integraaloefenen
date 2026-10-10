/**
 * Het nakijken van een antwoord, vóór de AI.
 *
 * Alles wat hier al goed gerekend wordt, kost geen Gemini-aanroep. Wat hier
 * niet doorkomt, gaat naar de AI-stap (`src/lib/ai/check-answer-new.ts`).
 */

// =====================================================================
// Normalisatie
// =====================================================================
export function normalizeAnswer(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/\*/g, '')
    .replace(/·/g, '')
    // ^(5), ^(-1), ^(x) → ^5, ^-1, ^x — alleen simpele exponenten, zodat
    // bv. e^(x+1) niet gelijk wordt aan e^x+1
    .replace(/\^\((-?\d+|-?[a-z])\)/g, '^$1')
    .replace(/x\^1\b/g, 'x')
    .replace(/\+-/g, '-')
    // het "echte" minteken dat een leerling meeplakt uit een pdf
    .replace(/−/g, '-')
}

export function answersMatch(
  student: string,
  correct: string,
  alternatives: string[] = [],
): boolean {
  const norm = normalizeAnswer(student)
  if (norm === normalizeAnswer(correct)) return true
  return alternatives.some((alt) => norm === normalizeAnswer(alt))
}
