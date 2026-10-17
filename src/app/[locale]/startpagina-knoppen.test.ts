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
})
