import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

// =====================================================================
// `public/_headers` geeft de gehashte bestanden onder /_next/static/ een
// lange cache-kop. Raakt dat bestand of die regel kwijt, dan valt Workers
// Assets terug op `max-age=0, must-revalidate` en vraagt de browser bij elk
// bezoek opnieuw na of elk lettertype nog klopt. Dat zie je nergens aan,
// behalve aan een tragere site, dus bewaakt deze test het.
// =====================================================================

const KOPPEN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../public/_headers')

describe('_headers', () => {
  it('geeft /_next/static/* een jaar cache', () => {
    const regels = readFileSync(KOPPEN, 'utf8')
      .split('\n')
      .map((regel) => regel.trimEnd())
      .filter((regel) => regel.length > 0 && !regel.trimStart().startsWith('#'))

    const index = regels.indexOf('/_next/static/*')
    expect(index, 'geen regel /_next/static/* in public/_headers').toBeGreaterThanOrEqual(0)

    const kop = regels[index + 1] ?? ''
    expect(kop.trim()).toBe('Cache-Control: public,max-age=31536000,immutable')
  })
})
