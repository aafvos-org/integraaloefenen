import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('home-demo aanmeldlink', () => {
  it('zet ?van=proberen achter de aanmeldlink na een proefsom', () => {
    const bron = readFileSync(join(process.cwd(), 'src/app/[locale]/home-demo.tsx'), 'utf8')

    // De knoppen na goed en fout antwoord mogen niet meer naar de kale
    // `aanmelden`-link wijzen: die link draagt de herkomst niet mee, en
    // leerlingen die hun proefsom afmaken zagen daardoor dezelfde generieke
    // tekst als iedereen op de registreerpagina.
    expect(bron).not.toContain('href={aanmelden}')
    expect(bron).toContain("padNaarAanmelden(aanmelden, 'proberen')")
    expect(bron.match(/href=\{aanmeldLink\}/g)).toHaveLength(2)
  })
})
