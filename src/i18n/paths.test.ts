import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { ACHTER_INLOG, AFGESCHERMD, MET_TAAL, OPENBAAR, ZONDER_TAAL } from './paths'

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

describe('OPENBAAR en AFGESCHERMD', () => {
  it('noemt alleen pagina’s die echt bestaan', () => {
    const metTaal = new Set<string>(MET_TAAL)
    expect(OPENBAAR.filter((pad) => !metTaal.has(pad))).toEqual([])
  })

  it('verdeelt MET_TAAL zonder iets over te slaan of dubbel te doen', () => {
    expect([...OPENBAAR, ...AFGESCHERMD].sort()).toEqual([...MET_TAAL].sort())
  })
})

// =====================================================================
// De inlogpoort van de middleware tegen de pagina's zelf
//
// De middleware stuurt een uitgelogde bezoeker weg bij alles wat in
// ACHTER_INLOG staat. Die lijst mag niet uit de pas lopen met de pagina's,
// want dan sluit de poort te veel (een openbare pagina wordt onbereikbaar)
// of te weinig (een leerling ziet weer een halve pagina opbouwen voordat de
// pagina zelf doorverwijst). Daarom leest deze test de pagina's zelf.
// =====================================================================

/** Alle page.tsx onder src/app/[locale]/<map>/, ook die dieper liggen. */
function paginas(map: string): string[] {
  const gevonden: string[] = []
  for (const item of readdirSync(map, { withFileTypes: true })) {
    const pad = join(map, item.name)
    if (item.isDirectory()) gevonden.push(...paginas(pad))
    else if (item.name === 'page.tsx') gevonden.push(pad)
  }
  return gevonden
}

/** De regel waarmee een pagina zelf een uitgelogde bezoeker wegstuurt. */
const EIGEN_INLOGCHECK = /if \(!user\) redirect\(`\/\$\{locale\}\/inloggen`\)/

describe('ACHTER_INLOG', () => {
  const taalmap = join(process.cwd(), 'src', 'app', '[locale]')

  it('noemt alleen pagina’s die echt bestaan', () => {
    const metTaal = new Set<string>(MET_TAAL)
    expect(ACHTER_INLOG.filter((pad) => !metTaal.has(pad))).toEqual([])
  })

  it('bevat geen pagina die iedereen mag lezen', () => {
    const openbaar = new Set<string>(OPENBAAR)
    expect(ACHTER_INLOG.filter((pad) => openbaar.has(pad))).toEqual([])
  })

  it('komt overeen met de pagina’s die zelf naar /inloggen sturen', () => {
    const uitDeMappen = MET_TAAL.filter((pad) => {
      const bestanden = paginas(join(taalmap, pad))
      return (
        bestanden.length > 0 &&
        bestanden.every((bestand) =>
          EIGEN_INLOGCHECK.test(readFileSync(bestand, 'utf8')),
        )
      )
    })
    expect([...ACHTER_INLOG].sort()).toEqual([...uitDeMappen].sort())
  })
})
