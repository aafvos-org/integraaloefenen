/**
 * Formules als gewone tekst, voor in de HTML van een dichte theoriekaart.
 *
 * KaTeX maakt van één formule een grote boom van span-elementen. Die hoort
 * pas in de pagina als de leerling de kaart opent. Tot die tijd staat de
 * uitleg hier als leesbare tekst, zodat een zoekmachine hem kan lezen
 * zonder het script uit te voeren.
 */

const BREUK = /\\(?:d|t)?frac(?![a-zA-Z])/
const WORTEL = /\\sqrt(?![a-zA-Z])/

function sluit(s: string, open: number, openHaak: string, dichtHaak: string): number {
  let diepte = 0
  for (let i = open; i < s.length; i++) {
    if (s[i] === '\\') {
      i++
      continue
    }
    if (s[i] === openHaak) diepte++
    else if (s[i] === dichtHaak) {
      diepte--
      if (diepte === 0) return i
    }
  }
  return -1
}

function sluitHaak(s: string, open: number): number {
  return sluit(s, open, '{', '}')
}

/** Eén argument: `{...}` of een los teken / commando, zoals in `\frac12`. */
function pakArg(s: string, i: number): { arg: string; next: number } | null {
  while (s[i] === ' ') i++
  if (s[i] === '{') {
    const end = sluitHaak(s, i)
    if (end < 0) return null
    return { arg: s.slice(i + 1, end), next: end + 1 }
  }
  if (s[i] === '\\') {
    const m = /^\\[a-zA-Z]+/.exec(s.slice(i))
    if (!m) return null
    return { arg: m[0], next: i + m[0].length }
  }
  if (s[i] && /[0-9a-zA-Z]/.test(s[i])) return { arg: s[i], next: i + 1 }
  return null
}

function eenvoudig(s: string): boolean {
  return /^[0-9a-zA-Z]+$/.test(s)
}

/** Haakjes alleen als de tekst anders aan de buurman vastplakt. */
function omwikkel(s: string): string {
  if (eenvoudig(s)) return s
  if (s.startsWith('(') && sluit(s, 0, '(', ')') === s.length - 1) return s
  return `(${s})`
}

function formatBreuk(a: string, b: string): string {
  // (1/3) en niet 1/3, anders leest -1/3√3 als -(1/(3√3)).
  if (eenvoudig(a) && eenvoudig(b)) return `(${a}/${b})`
  return `${omwikkel(a)}/${omwikkel(b)}`
}

function vervangBreuken(s: string): string {
  let out = s
  for (let poging = 0; poging < 40; poging++) {
    const m = BREUK.exec(out)
    if (!m) return out
    const start = m.index
    const a = pakArg(out, start + m[0].length)
    if (!a) return out
    const b = pakArg(out, a.next)
    if (!b) return out
    let stuk = formatBreuk(vervangBreuken(a.arg), vervangBreuken(b.arg))
    if (start > 0 && /\d/.test(out[start - 1]!) && /^[\d(]/.test(stuk)) stuk = ` ${stuk}`
    out = out.slice(0, start) + stuk + out.slice(b.next)
  }
  return out
}

function vervangWortels(s: string): string {
  let out = s
  for (let poging = 0; poging < 40; poging++) {
    const m = WORTEL.exec(out)
    if (!m) return out
    let i = m.index + m[0].length
    if (out[i] === '[') {
      const end = out.indexOf(']', i)
      if (end < 0) return out
      i = end + 1
    }
    const a = pakArg(out, i)
    if (!a) return out
    const binnen = vervangWortels(a.arg)
    out = out.slice(0, m.index) + `√(${binnen})` + out.slice(a.next)
  }
  return out
}

function vervangTekstcommando(s: string, naam: string): string {
  const needle = `\\${naam}`
  let out = ''
  let i = 0
  while (i < s.length) {
    const at = s.indexOf(needle, i)
    if (at < 0) return out + s.slice(i)
    const grens = at + needle.length
    if (/[a-zA-Z]/.test(s[grens] ?? '')) {
      out += s.slice(i, at + 1)
      i = at + 1
      continue
    }
    const arg = pakArg(s, grens)
    if (!arg) return out + s.slice(i)
    out += s.slice(i, at) + arg.arg
    i = arg.next
  }
  return out
}

const SUPER: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '+': '⁺',
  '-': '⁻',
  n: 'ⁿ',
  '(': '⁽',
  ')': '⁾',
}

function naarSup(t: string): string | null {
  let uit = ''
  for (const c of t) {
    const s = SUPER[c]
    if (!s) return null
    uit += s
  }
  return uit
}

/** Zuivere LaTeX (zonder `$...$`) naar een zin die je hardop kunt lezen. */
export function leesbareWiskunde(tex: string): string {
  let s = tex.trim()
  s = s.replace(/\\begin\{[a-zA-Z*]+\}/g, ' ')
  s = s.replace(/\\end\{[a-zA-Z*]+\}/g, ' ')
  s = s.replace(/\\(?:left|right|bigl|bigr|Bigl|Bigr|biggl|biggr|displaystyle)(?![a-zA-Z])/g, '')
  // \! is een negatieve spatie (geen gat); de rest is wel een spatie.
  s = s.replace(/\\!/g, '')
  s = s.replace(/\\[,;:]|\\quad(?![a-zA-Z])|\\qquad(?![a-zA-Z])/g, ' ')
  s = s.replace(/\\\\/g, ' ')
  s = vervangTekstcommando(s, 'text')
  s = s.replace(/\\mathbb\{R\}/g, 'ℝ')
  s = vervangBreuken(s)
  s = vervangWortels(s)
  s = s.replace(/\\(arctan|arcsin|arccos|sin|cos|tan|ln|log)(?![a-zA-Z])/g, (m, naam: string, offset: number, str: string) => {
    const prev = str[offset - 1]
    return prev && /[0-9a-zA-Z)]/.test(prev) ? ` ${naam}` : naam
  })
  s = s.replace(/\\int(?![a-zA-Z])/g, '∫')
  s = s.replace(/([0-9)])\\pi(?![a-zA-Z])/g, '$1 π')
  s = s.replace(/\\pi(?![a-zA-Z])/g, 'π')
  s = s.replace(/\\cdot(?![a-zA-Z])/g, '·')
  s = s.replace(/\\ldots(?![a-zA-Z])/g, '…')
  s = s.replace(/\\langle(?![a-zA-Z])/g, '⟨')
  s = s.replace(/\\rangle(?![a-zA-Z])/g, '⟩')
  // Grenzen: \int_{0}^{1} → ∫ van 0 tot 1
  s = s.replace(/_\{([^{}]*)\}\^\{([^{}]*)\}/g, ' van $1 tot $2')
  s = s.replace(/\^\{([^{}]*)\}/g, (_, inner: string) => {
    const net = inner.replace(/\s+/g, '')
    return naarSup(net) ?? `^(${inner.trim()})`
  })
  s = s.replace(/\^([0-9n])/g, (_, d: string) => SUPER[d] ?? d)
  s = s.replace(/_\{([^{}]*)\}/g, '_($1)')
  s = s.replace(/[{}]/g, '')
  s = s.replace(/[ \t]+/g, ' ')
  s = s.replace(/\s+([.,;])/g, '$1')
  return s.trim()
}

/** Zin met hier en daar `$...$` of `$$...$$`. De gewone woorden blijven staan. */
export function leesbareTekst(raw: string): string {
  const zonder = raw
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, tex: string) => leesbareWiskunde(tex))
    .replace(/(?<!\\)\$((?:\\.|[^$])+)\$/g, (_, tex: string) => leesbareWiskunde(tex.replace(/\\\$/g, '$')))
  return zonder.replace(/[ \t]+/g, ' ').replace(/\s+([.,;])/g, '$1').trim()
}
