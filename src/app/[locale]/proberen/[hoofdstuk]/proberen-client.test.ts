import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('proberen-client klik op opgavetekst en formule (INT-504)', () => {
  it('focust het antwoordveld bij een klik, in plaats van niets te doen', () => {
    const bron = readFileSync(
      join(process.cwd(), "src/app/[locale]/proberen/[hoofdstuk]/proberen-client.tsx"),
      'utf8',
    )

    // Vóór deze fix stond data-geen-dode-klik alleen op de formule-div: dat
    // onderdrukte de meting (INT-434), maar een klik op de opdracht-tekst
    // ("Bepaal de primitieve van:") of de formule zelf deed nog steeds niets
    // (INT-504). Beide horen nu samen in één blok te zitten dat een klik
    // oppakt en het bestaande antwoordveld focust — zelfde patroon als
    // home-demo.tsx (INT-461).
    expect(bron).toMatch(/function focusAntwoord\(\) \{[\s\S]*?invoer\.current\?\.focus\(\)/)
    expect(bron).toMatch(
      /data-geen-dode-klik\s*\n\s*onClick=\{focusAntwoord\}[\s\S]{0,400}\{t\(opdracht\)\}[\s\S]{0,400}<OpgaveTekst/,
    )
  })
})
