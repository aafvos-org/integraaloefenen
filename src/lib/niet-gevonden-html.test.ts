import { describe, expect, it } from 'vitest'

import nl from '../../messages/nl.json'

import { NIET_GEVONDEN_OMSCHRIJVING } from './niet-gevonden'
import { nietGevondenDocument } from './niet-gevonden-html'

describe('nietGevondenDocument', () => {
  const html = nietGevondenDocument()

  it('heeft een echte kop en de 404-tekst', () => {
    expect(html).toContain('<h1>Deze pagina bestaat niet</h1>')
    expect(html).toContain('Fout 404')
    expect(html).toContain('Naar de startpagina')
    expect(html).toContain('<html lang="nl">')
  })

  it('gebruikt niet de omschrijving van de startpagina', () => {
    expect(html).toContain(`content="${NIET_GEVONDEN_OMSCHRIJVING}"`)
    expect(html).not.toContain(nl.Metadata.description)
    expect(html).not.toContain('Integreren oefenen voor wiskunde B')
  })
})
