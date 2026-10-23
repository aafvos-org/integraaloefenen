import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('startpagina-knoppen', () => {
  it('zet drie sommen zonder account als eerste knop en in de zoektekst', () => {
    const pagina = readFileSync(join(process.cwd(), 'src/app/[locale]/page.tsx'), 'utf8')
    const teksten = readFileSync(join(process.cwd(), 'messages/nl.json'), 'utf8')

    const knoppen = pagina.slice(
      pagina.indexOf('mt-8 flex flex-wrap'),
      pagina.indexOf('tagline'),
    )
    expect(knoppen.indexOf("'/proberen/primitieve'")).toBeLessThan(knoppen.indexOf('aanmelden'))
    expect(knoppen.indexOf("t('ctaTry')")).toBeLessThan(knoppen.indexOf("t('ctaRegister')"))
    expect(knoppen.indexOf("t('ctaRegister')")).toBeLessThan(knoppen.indexOf("t('ctaLogin')"))

    expect(teksten).toContain('"ctaTry": "Probeer drie sommen"')
    expect(teksten).toContain('Maak drie sommen zonder account. Integreren oefenen')
  })

  it('heeft maar één hoofdknop, en account aanmaken weegt zwaarder dan inloggen', () => {
    const pagina = readFileSync(join(process.cwd(), 'src/app/[locale]/page.tsx'), 'utf8')

    const knoppen = pagina.slice(
      pagina.indexOf('mt-8 flex flex-wrap'),
      pagina.indexOf('tagline'),
    )

    const hoofdknoppen = knoppen.match(/(?<!hover:)bg-accent\b/g) ?? []
    expect(hoofdknoppen).toHaveLength(1)

    const registrerenBlok = knoppen.slice(
      knoppen.indexOf("t('ctaRegister')") - 200,
      knoppen.indexOf("t('ctaRegister')"),
    )
    const inloggenBlok = knoppen.slice(
      knoppen.indexOf("t('ctaLogin')") - 200,
      knoppen.indexOf("t('ctaLogin')"),
    )

    expect(registrerenBlok).toContain('border border-border')
    expect(inloggenBlok).not.toContain('border')
  })
})
