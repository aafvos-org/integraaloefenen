import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('study-card: eerste-goede-tip (INT-811)', () => {
  it('sluitknop heeft een duimvriendelijk tikgebied van minstens 44px', () => {
    const bron = readFileSync(
      join(process.cwd(), 'src/app/[locale]/oefenen/study-card.tsx'),
      'utf8',
    )
    const vanaf = bron.indexOf('deelTipSluiten')
    expect(vanaf).toBeGreaterThan(-1)
    const sluitknop = bron.slice(vanaf, bron.indexOf('</button>', vanaf))

    expect(sluitknop).toMatch(/\b(?:h-11|min-h-11|size-11)\b/)
    expect(sluitknop).toMatch(/\b(?:w-11|min-w-11|size-11)\b/)
  })
})
