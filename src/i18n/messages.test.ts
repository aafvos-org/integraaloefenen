import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describe, expect, it } from 'vitest'

// =====================================================================
// Dubbele sleutels in de tekstbestanden
//
// JSON staat toe dat dezelfde sleutel twee keer in hetzelfde blok staat:
// de laatste wint en de eerste verdwijnt geruisloos. In messages/ is dat
// een valkuil, want de eerste tekst leest alsof hij geldt terwijl een
// leerling hem nooit ziet. JSON.parse kan dat niet melden — het slikt de
// eerste sleutel al voordat wij erbij kunnen. Daarom lopen we de ruwe
// tekst zelf na.
// =====================================================================

/** Paden van sleutels die binnen hetzelfde blok twee keer voorkomen. */
function dubbeleSleutels(raw: string): string[] {
  const gevonden: string[] = []
  let i = 0

  function spaties() {
    while (i < raw.length && ' \n\r\t'.includes(raw[i])) i++
  }

  function tekst(): string {
    let uit = ''
    i++ // openingsaanhalingsteken
    while (i < raw.length) {
      const teken = raw[i]
      if (teken === '\\') {
        uit += raw[i] + raw[i + 1]
        i += 2
        continue
      }
      if (teken === '"') {
        i++
        return uit
      }
      uit += teken
      i++
    }
    throw new Error('onafgesloten tekst in JSON')
  }

  function waarde(pad: string) {
    spaties()
    const teken = raw[i]
    if (teken === '{') return blok(pad)
    if (teken === '[') return lijst(pad)
    if (teken === '"') {
      tekst()
      return
    }
    // getal, true, false of null: doorlopen tot het eind van de waarde
    while (i < raw.length && !',}] \n\r\t'.includes(raw[i])) i++
  }

  function blok(pad: string) {
    i++ // {
    const gezien = new Set<string>()
    spaties()
    if (raw[i] === '}') {
      i++
      return
    }
    for (;;) {
      spaties()
      const sleutel = tekst()
      const volledig = pad ? `${pad}.${sleutel}` : sleutel
      if (gezien.has(sleutel)) gevonden.push(volledig)
      gezien.add(sleutel)
      spaties()
      i++ // :
      waarde(volledig)
      spaties()
      if (raw[i] === ',') {
        i++
        continue
      }
      i++ // }
      return
    }
  }

  function lijst(pad: string) {
    i++ // [
    spaties()
    if (raw[i] === ']') {
      i++
      return
    }
    let n = 0
    for (;;) {
      waarde(`${pad}[${n++}]`)
      spaties()
      if (raw[i] === ',') {
        i++
        continue
      }
      i++ // ]
      return
    }
  }

  waarde('')
  return gevonden
}

/** Alle .json-bestanden onder een map, ook in onderliggende mappen. */
function jsonBestanden(map: string): string[] {
  return readdirSync(map, { withFileTypes: true }).flatMap((item) => {
    const pad = join(map, item.name)
    if (item.isDirectory()) return jsonBestanden(pad)
    return item.name.endsWith('.json') ? [pad] : []
  })
}

describe('dubbeleSleutels', () => {
  it('ziet een sleutel die twee keer in hetzelfde blok staat', () => {
    expect(dubbeleSleutels('{"Theorie": {"h1": "a"}, "Theorie": {"h1": "b"}}'))
      .toEqual(['Theorie'])
  })

  it('ziet een dubbele sleutel ook een blok dieper', () => {
    expect(dubbeleSleutels('{"Home": {"h1": "a", "h1": "b"}}')).toEqual([
      'Home.h1',
    ])
  })

  it('laat dezelfde sleutel in twee verschillende blokken met rust', () => {
    expect(
      dubbeleSleutels('{"Home": {"title": "a"}, "Theorie": {"title": "b"}}'),
    ).toEqual([])
  })

  it('trapt niet in accolades en aanhalingstekens binnen een tekst', () => {
    const raw = '{"a": "{\\"a\\": 1, \\"a\\": 2}", "b": "x"}'
    expect(dubbeleSleutels(raw)).toEqual([])
  })

  it('kijkt ook in lijsten', () => {
    expect(dubbeleSleutels('{"regels": [{"naam": "a", "naam": "b"}]}')).toEqual([
      'regels[0].naam',
    ])
  })
})

describe('de tekstbestanden in messages/', () => {
  const map = join(process.cwd(), 'messages')
  const bestanden = jsonBestanden(map)

  it('zijn er', () => {
    expect(bestanden.length).toBeGreaterThan(0)
  })

  it.each(bestanden.map((b) => relative(process.cwd(), b)))(
    '%s heeft geen sleutel die twee keer voorkomt',
    (bestand) => {
      expect(dubbeleSleutels(readFileSync(bestand, 'utf8'))).toEqual([])
    },
  )
})

describe('paginatitels', () => {
  it('bevatten het domein niet, want de layout plakt het er achter', () => {
    const overrides = JSON.parse(
      readFileSync(
        join(process.cwd(), 'messages', 'overrides', 'integralen.nl.json'),
        'utf8',
      ),
    ) as Record<string, Record<string, unknown>>
    for (const [namespace, sleutels] of Object.entries(overrides)) {
      // Metadata.title is de standaardtitel van de layout zelf en wordt niet
      // door de titel-sjabloon heen gehaald: daar hoort het domein wél in.
      if (namespace === 'Metadata') continue
      for (const [sleutel, waarde] of Object.entries(sleutels)) {
        if (sleutel === 'title' && typeof waarde === 'string') {
          expect(waarde).not.toContain('__DOMAIN__')
        }
      }
    }
  })
})
