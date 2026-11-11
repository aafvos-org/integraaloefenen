import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('startpagina-knoppen (INT-830)', () => {
  const pagina = readFileSync(join(process.cwd(), 'src/app/[locale]/page.tsx'), 'utf8')

  it('zet de proefsom (HomeDemo) vóór de lange uitleg, zodat hij op een telefoon in het eerste scherm staat', () => {
    expect(pagina.indexOf('<HomeDemo')).toBeLessThan(pagina.indexOf("t('lead')"))
    expect(pagina.indexOf('<HomeDemo')).toBeLessThan(pagina.indexOf("t.rich('subLead'"))
  })

  it('heeft geen aparte "Probeer drie sommen"-knop meer die naar dezelfde proefsom gaat', () => {
    // Vóór INT-830 stond hier een knop naar /proberen/primitieve, een losse
    // pagina met dezelfde proefsom als HomeDemo hieronder al toont.
    expect(pagina).not.toContain("'/proberen/primitieve'")
    expect(pagina).not.toContain('data-meet="start-proefsom"')
  })

  it('heeft geen losse Registreren/Inloggen-knoppen in de kop, alleen in het menu of na het nakijken', () => {
    expect(pagina).not.toContain('data-meet="start-registreren"')
    expect(pagina).not.toContain('data-meet="start-inloggen"')
    expect(pagina).not.toContain("t('ctaTry')")
    expect(pagina).not.toContain("t('ctaLogin')")
  })

  it('heeft nog precies één bg-accent-hoofdknop: die van de registratie-oproep onderaan', () => {
    const hoofdknoppen = pagina.match(/(?<!hover:)bg-accent\b/g) ?? []
    expect(hoofdknoppen).toHaveLength(1)
    expect(pagina).toContain('data-meet="start-registreren-onder"')
  })
})
