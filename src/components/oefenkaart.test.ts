import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('Stappenplan klik op formule in de uitwerking (INT-588)', () => {
  it('markeert de buitenste div als geen dode klik', () => {
    const bron = readFileSync(
      join(process.cwd(), 'src/components/oefenkaart.tsx'),
      'utf8',
    )

    // Zelfde patroon als INT-580 in proberen-client.tsx: de genummerde
    // stappenlijst (RichMath/KaTeX) heeft geen antwoordveld om naar te
    // focussen, dus een tik daarop moet gewoon niet als dode klik tellen.
    expect(bron).toMatch(
      /export function Stappenplan[\s\S]*?data-geen-dode-klik[\s\S]{0,200}<ol[\s\S]{0,450}<RichMath/,
    )
  })
})
