import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const bron = readFileSync(
  join(process.cwd(), 'src', 'app', '[locale]', 'examen-integralen', 'page.tsx'),
  'utf8',
)

describe('openbare pagina over de examentraining', () => {
  it('linkt naar Examenblad en blijft zonder inlog leesbaar', () => {
    expect(bron).toContain(
      'https://www.examenblad.nl/2027/vwo/vakken/exacte-vakken/wiskunde-b-vwo',
    )
    expect(bron).toContain("pad: '/examen-integralen'")
    expect(bron).not.toMatch(/redirect\(`\/\$\{locale\}\/inloggen`\)/)
  })

  it('noemt de examendatum in de tekst die een leerling ziet', () => {
    const teksten = readFileSync(join(process.cwd(), 'messages', 'nl.json'), 'utf8')
    expect(teksten).toContain('vrijdag 28 mei 2027')
    expect(teksten).toContain('13.30 tot 16.30')
  })
})
