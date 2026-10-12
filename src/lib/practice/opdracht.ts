/**
 * Wat er van de leerling gevraagd wordt, afgeleid uit de opgave zelf.
 *
 * De meeste opgaven zeggen het al in gewone taal: "Primitiveer: $f(x) = …$",
 * "Bereken exact: $\int_0^1 …$", "Los exact op: $…$". Daar hoeft er niets bij.
 *
 * Maar een kale opgave — alleen `f(x) = 3x^{2}`, of alleen
 * `\int_{0}^{2} 3x^{2}\,dx` — zegt nergens of je moet primitiveren of
 * differentiëren, en ook niet dat het antwoord exact moet zijn. Dan zetten we
 * de opdracht er in gewone taal boven.
 */

/** Soort opgave, bepaalt welke opdrachtregel erboven komt. */
export type Opgavesoort =
  /** De opgave zegt zelf al wat er moet gebeuren. */
  | 'eigen-opdracht'
  /** Kale functie: `f(x) = 3x^{2}`. */
  | 'primitieve'
  /** Kale integraal met grenzen: `\int_{0}^{2} 3x^{2}\,dx`. */
  | 'bepaalde-integraal'
  /** Kale integraal zonder grenzen: `\int 3x^{2}\,dx`. */
  | 'onbepaalde-integraal'

/**
 * Staat er gewone tekst buiten de wiskunde? Opgaven met een eigen opdracht
 * zetten de wiskunde tussen `$…$` en de instructie eromheen; een kale opgave
 * is helemaal LaTeX en heeft dus nergens een los woord staan.
 */
function heeftTekstBuitenWiskunde(body: string): boolean {
  if (!body.includes('$')) return false
  const zonderWiskunde = body.replace(/\$\$[\s\S]*?\$\$|\$[^$]*\$/g, ' ')
  // Drie letters op rij: korter dan dat is geen woord maar een losse variabele.
  return /\p{L}{3,}/u.test(zonderWiskunde)
}

export function opgavesoort(latexBody: string | null): Opgavesoort {
  const body = latexBody?.trim() ?? ''
  if (!body || heeftTekstBuitenWiskunde(body)) return 'eigen-opdracht'
  if (/\\int\s*_/.test(body)) return 'bepaalde-integraal'
  if (/\\int/.test(body)) return 'onbepaalde-integraal'
  return 'primitieve'
}

/**
 * Sleutel in `PracticeCard` van de opdrachtregel boven de opgave, of `null`
 * als de opgave het zelf al zegt.
 */
export function opdrachtSleutel(
  latexBody: string | null,
): 'promptPrimitieve' | 'promptBepaaldeIntegraal' | 'promptOnbepaaldeIntegraal' | null {
  switch (opgavesoort(latexBody)) {
    case 'primitieve':
      return 'promptPrimitieve'
    case 'bepaalde-integraal':
      return 'promptBepaaldeIntegraal'
    case 'onbepaalde-integraal':
      return 'promptOnbepaaldeIntegraal'
    case 'eigen-opdracht':
      return null
  }
}

/**
 * Vraagt de opgave om een primitieve? Alleen dan hoort er "F(x) =" boven het
 * antwoord. Bij een bepaalde integraal, een vergelijking of een vlakdeel is
 * het antwoord een getal of een waarde van p, en zet "F(x) =" de leerling op
 * het verkeerde been.
 */
function vraagtOmPrimitieve(latexBody: string | null): boolean {
  switch (opgavesoort(latexBody)) {
    case 'primitieve':
    case 'onbepaalde-integraal':
      return true
    case 'bepaalde-integraal':
      return false
    case 'eigen-opdracht':
      // De opgaven die om een primitieve vragen zeggen dat letterlijk:
      // "Primitiveer: $f(x) = …$". De rest ("Bereken exact: …", "Los exact
      // op: …", de verhaaltjessommen) vraagt om een getal of om p.
      return /\bprimitiveer/i.test(latexBody ?? '')
  }
}

/**
 * Notatie voor de antwoordregel onder de opgave, afgeleid van de functieletter
 * in de vraag: "k(x) = …" → "K(x) =". Staat er een andere variabele, dan volgt
 * die mee: "h(t) = …" → "H(t) =".
 *
 * Vraagt de opgave niet om een primitieve, dan is het een lege string: dan
 * staat er alleen het antwoord zelf.
 */
export function antwoordPrefix(latexBody: string | null): string {
  if (!vraagtOmPrimitieve(latexBody)) return ''
  const match = latexBody?.match(/([a-zA-Z])\s*\(\s*([a-zA-Z])\s*\)\s*=/)
  const letter = match?.[1] ?? 'f'
  const variabele = match?.[2] ?? 'x'
  return `${letter.toUpperCase()}(${variabele}) =`
}
