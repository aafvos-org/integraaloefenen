import { SITE_CONFIG } from '@/config/site'
import { NIET_GEVONDEN_OMSCHRIJVING, NIET_GEVONDEN_TITEL } from '@/lib/niet-gevonden'

import berichten from '../../messages/nl.json'

const tekst = berichten.NotFound

function escapeHtml(waarde: string): string {
  return waarde
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

/**
 * Volledige 404-pagina als HTML, mét een echte kop. notFound() van Next.js
 * zet die kop alleen in een script, niet in de pagina zelf.
 */
export function nietGevondenDocument(): string {
  const titel = escapeHtml(NIET_GEVONDEN_TITEL)
  const omschrijving = escapeHtml(NIET_GEVONDEN_OMSCHRIJVING)
  const merk = escapeHtml(SITE_CONFIG.brand)

  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="robots" content="noindex"/>
<title>${titel}</title>
<meta name="description" content="${omschrijving}"/>
<meta property="og:title" content="${titel}"/>
<meta property="og:description" content="${omschrijving}"/>
<meta property="og:locale" content="nl_NL"/>
<meta property="og:site_name" content="${escapeHtml(SITE_CONFIG.domain)}"/>
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; max-width: 100%; background: #f7f6f3; color: #1a1a18; font-family: ui-sans-serif, system-ui, sans-serif; }
  header { display: flex; align-items: center; min-height: 4rem; padding: 0 1rem; border-bottom: 1px solid #e4e2d9; background: #fff; }
  header a { color: inherit; font-weight: 600; text-decoration: none; font-size: 1.05rem; min-height: 44px; display: inline-flex; align-items: center; }
  header a span { color: #2d6a4f; }
  main { width: 100%; max-width: 42rem; margin: 0 auto; padding: 4rem 1.25rem 6rem; text-align: center; }
  .wenkbrauw { margin: 0; color: #2d6a4f; font-size: 0.875rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; }
  h1, .tekst { overflow-wrap: break-word; }
  h1 { margin: 0.5rem 0 0; font-family: Georgia, "Times New Roman", serif; font-size: clamp(1.75rem, 8vw, 3rem); font-weight: 400; line-height: 1.2; }
  p.tekst { margin: 1.5rem 0 0; color: #6e6c66; font-size: 1.125rem; line-height: 1.5; }
  .knop { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; margin-top: 2.5rem; padding: 0 1.5rem; border-radius: 0.5rem; background: #2d6a4f; color: #fff; text-decoration: none; }
</style>
</head>
<body>
<header><a href="/nl">${merk}<span>.nl</span></a></header>
<main>
<p class="wenkbrauw">${escapeHtml(tekst.eyebrow)}</p>
<h1>${escapeHtml(tekst.title)}</h1>
<p class="tekst">${escapeHtml(tekst.body)}</p>
<a class="knop" href="/nl">${escapeHtml(tekst.cta)}</a>
</main>
</body>
</html>
`
}
