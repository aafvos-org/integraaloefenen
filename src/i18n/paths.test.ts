import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { MET_TAAL, ZONDER_TAAL } from './paths'

// =====================================================================
// De lijst met paden tegen de mappen op schijf
//
// Een nieuwe pagina onder src/app/[locale]/ is pas bereikbaar zonder taal
// vooraan als hij ook in MET_TAAL staat. Dat werd eerder vergeten en dan
// liep /zelf-toets dood op een 404. Deze test vergelijkt de lijst met wat
// er echt staat, zodat dat niet nog een keer stil gebeurt.
// =====================================================================

/** De mappen met een gewone pagina erin; haakjes en blokhaken slaan we over. */
function paginamappen(map: string): string[] {
  return readdirSync(map, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => item.name)
    .filter((naam) => !/^[([_.]/.test(naam))
    .sort()
}

describe('MET_TAAL', () => {
  it('bevat precies de mappen onder src/app/[locale]/', () => {
    const opSchijf = paginamappen(join(process.cwd(), 'src', 'app', '[locale]'))
    expect([...MET_TAAL].sort()).toEqual(opSchijf)
  })
})

describe('ZONDER_TAAL', () => {
  it('bevat alleen mappen die naast [locale] staan', () => {
    const opSchijf = paginamappen(join(process.cwd(), 'src', 'app'))
    for (const pad of ZONDER_TAAL) {
      expect(opSchijf).toContain(pad)
    }
  })

  it('overlapt niet met MET_TAAL', () => {
    const metTaal = new Set<string>(MET_TAAL)
    expect(ZONDER_TAAL.filter((pad) => metTaal.has(pad))).toEqual([])
  })
})
