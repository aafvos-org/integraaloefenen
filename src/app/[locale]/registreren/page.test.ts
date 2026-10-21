import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('registreren-pagina met ?van=proberen', () => {
  it('toont een andere koptekst voor wie net een proefsom deed', () => {
    const pagina = readFileSync(
      join(process.cwd(), 'src/app/[locale]/registreren/page.tsx'),
      'utf8',
    )

    expect(pagina).toContain("bron === 'proberen'")
    expect(pagina).toContain("t('h1Proefsom')")
    expect(pagina).toContain("t('subtitleProefsom')")
  })

  it('heeft andere teksten dan de generieke koptekst', () => {
    const teksten = JSON.parse(
      readFileSync(join(process.cwd(), 'messages/nl.json'), 'utf8'),
    ) as { Register: Record<string, string> }

    const { h1, subtitle, h1Proefsom, subtitleProefsom } = teksten.Register
    expect(h1Proefsom).toBeTruthy()
    expect(subtitleProefsom).toBeTruthy()
    expect(h1Proefsom).not.toBe(h1)
    expect(subtitleProefsom).not.toBe(subtitle)
  })
})
