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

describe('home-demo klik op niveau-label en somtekst (INT-461)', () => {
  it('focust het antwoordveld bij een klik, in plaats van alleen de somtekst uit te zonderen', () => {
    const bron = readFileSync(join(process.cwd(), 'src/app/[locale]/home-demo.tsx'), 'utf8')

    // Vóór deze fix stond data-geen-dode-klik alleen op de somtekst zelf; de
    // ruimte eromheen (zoals het niveau-label "Niveau 3") deed niets bij een
    // klik en werd daardoor als dode klik gemeten (INT-461). Beide horen nu
    // samen in één blok te zitten dat een klik oppakt en het antwoordveld
    // focust.
    expect(bron).toMatch(/function focusAntwoord\(\) \{[\s\S]*?inputRef\.current\?\.focus\(\)/)
    expect(bron).toMatch(
      /data-geen-dode-klik\s*\n\s*onClick=\{focusAntwoord\}[\s\S]{0,400}<Badge[\s\S]{0,400}<RichMath/,
    )
  })
})
