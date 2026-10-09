import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { AFGESCHERMD, OPENBAAR, ZONDER_TAAL } from '@/i18n/paths'
import { routing } from '@/i18n/routing'
import { THEORIE_HOOFDSTUKKEN } from '@/lib/theory'

import robots from './robots'
import sitemap from './sitemap'

// =====================================================================
// robots.txt en sitemap.xml moeten hetzelfde zeggen
//
// Eerder stonden /inloggen en /registreren in allebei: in de sitemap als
// "indexeer mij", in robots als "blijf weg". En de paden misten de taal
// vooraan, waardoor /nl/oefenen helemaal niet geblokkeerd was. Deze test
// houdt die twee bestanden op één lijn.
// =====================================================================

const TAAL = routing.defaultLocale

/** De paden (zonder domein) die robots.txt blokkeert. */
function geblokkeerd(): string[] {
  const regel = robots().rules
  const regels = Array.isArray(regel) ? regel : [regel]
  return regels.flatMap((r) => {
    const d = r.disallow
    return d === undefined ? [] : Array.isArray(d) ? d : [d]
  })
}

/** De paden (zonder domein) die in de sitemap staan. */
function inSitemap(): string[] {
  return sitemap().map((item) => new URL(item.url).pathname)
}

describe('robots.txt', () => {
  it('blokkeert elke afgeschermde pagina met én zonder taal vooraan', () => {
    for (const pad of AFGESCHERMD) {
      expect(geblokkeerd()).toContain(`/${TAAL}/${pad}`)
      expect(geblokkeerd()).toContain(`/${pad}`)
    }
  })

  it('blokkeert de pagina’s die buiten de taalmappen staan', () => {
    for (const pad of ZONDER_TAAL) {
      expect(geblokkeerd()).toContain(`/${pad}`)
    }
  })

  it('blokkeert geen openbare pagina', () => {
    for (const pad of OPENBAAR) {
      expect(geblokkeerd()).not.toContain(`/${TAAL}/${pad}`)
      expect(geblokkeerd()).not.toContain(`/${pad}`)
    }
  })
})

describe('sitemap.xml', () => {
  it('zet de taal vooraan in elk adres', () => {
    for (const pad of inSitemap()) {
      expect(pad === `/${TAAL}` || pad.startsWith(`/${TAAL}/`)).toBe(true)
    }
  })

  it('spreekt robots.txt niet tegen', () => {
    for (const pad of inSitemap()) {
      for (const blok of geblokkeerd()) {
        expect(pad.startsWith(blok)).toBe(false)
      }
    }
  })

  it('noemt elk theorie-hoofdstuk', () => {
    for (const h of THEORIE_HOOFDSTUKKEN) {
      expect(inSitemap()).toContain(`/${TAAL}/theorie/${h.slug}`)
    }
  })

  it('heeft geen dubbele adressen', () => {
    const paden = inSitemap()
    expect(new Set(paden).size).toBe(paden.length)
  })
})

// =====================================================================
// Elke openbare pagina noemt zijn eigen adres
//
// De canonical stond in src/app/[locale]/layout.tsx. Een layout weet niet op
// welke pagina hij staat, dus riep elke pagina dat ze de startpagina was en
// bleef de rest uit de index. Nu zet elke openbare pagina hem zelf, met
// eigenAdres() uit src/lib/seo.ts.
//
// Deze test leest de broncode: hij ziet dat de regel er staat, niet wat de
// pagina uiteindelijk naar de browser stuurt. Dat is genoeg om te merken dat
// een nieuwe openbare pagina hem vergeet.
// =====================================================================

/** De broncode van een pagina onder src/app/[locale]/. */
function broncode(...pad: string[]): string {
  return readFileSync(
    join(process.cwd(), 'src', 'app', '[locale]', ...pad, 'page.tsx'),
    'utf8',
  )
}

describe('canonical', () => {
  it('staat niet in de layout, want die kent het pad niet', () => {
    const layout = readFileSync(
      join(process.cwd(), 'src', 'app', '[locale]', 'layout.tsx'),
      'utf8',
    )
    expect(layout).not.toMatch(/canonical:/)
  })

  it('staat op de startpagina', () => {
    expect(broncode()).toContain('eigenAdres(locale)')
  })

  it('staat op elke openbare pagina, met het eigen pad', () => {
    for (const pad of OPENBAAR) {
      expect(broncode(pad)).toContain(`eigenAdres(locale, '/${pad}')`)
    }
  })

  it('staat op een theorie-hoofdstuk, met het hoofdstuk erin', () => {
    expect(broncode('theorie', '[hoofdstuk]')).toContain(
      'eigenAdres(locale, `/theorie/${hoofdstuk}`)',
    )
  })
})
