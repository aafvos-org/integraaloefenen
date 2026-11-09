import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('registreren-pagina met ?van=proberen', () => {
  it('toont een andere koptekst voor wie net een proefsom deed', () => {
    const component = readFileSync(
      join(process.cwd(), 'src/app/[locale]/registreren/kop-uit-adres.tsx'),
      'utf8',
    )

    expect(component).toContain("leesBron(searchParams.get('van')) === 'proberen'")
    expect(component).toContain('h1Proefsom')
    expect(component).toContain('subtitleProefsom')
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

describe('registreren-pagina zonder Wachtwoord vergeten-link (INT-735)', () => {
  it('toont geen link naar /wachtwoord-vergeten: wie net registreert heeft nog geen wachtwoord om te vergeten', () => {
    const pagina = readFileSync(
      join(process.cwd(), 'src/app/[locale]/registreren/page.tsx'),
      'utf8',
    )

    expect(pagina).not.toContain('wachtwoord-vergeten')
    expect(pagina).not.toContain('forgotPassword')
  })

  it('laat de vertaalsleutel Register.forgotPassword niet meer bestaan', () => {
    const teksten = JSON.parse(
      readFileSync(join(process.cwd(), 'messages/nl.json'), 'utf8'),
    ) as { Register: Record<string, string> }

    expect(teksten.Register.forgotPassword).toBeUndefined()
  })

  it('laat de link op /nl/inloggen ongewijzigd staan: daar is hij wel relevant', () => {
    const inloggenPagina = readFileSync(
      join(process.cwd(), 'src/app/[locale]/inloggen/page.tsx'),
      'utf8',
    )

    expect(inloggenPagina).toContain('wachtwoord-vergeten')
    expect(inloggenPagina).toContain('forgotPassword')
  })
})
