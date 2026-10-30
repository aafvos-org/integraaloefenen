import { describe, expect, it } from 'vitest'

import { isActiveNavHref } from './nav-active'

describe('isActiveNavHref', () => {
  it('herkent Examentraining als actief op /nl/examen-integralen, de rest niet', () => {
    const pathname = '/nl/examen-integralen'
    expect(isActiveNavHref(pathname, '/nl/examen-integralen')).toBe(true)
    expect(isActiveNavHref(pathname, '/nl/theorie')).toBe(false)
    expect(isActiveNavHref(pathname, '/nl/uitleg-videos')).toBe(false)
  })

  it('herkent Theorie als actief op een theoriehoofdstuk, de rest niet', () => {
    const pathname = '/nl/theorie/k3'
    expect(isActiveNavHref(pathname, '/nl/theorie')).toBe(true)
    expect(isActiveNavHref(pathname, '/nl/examen-integralen')).toBe(false)
    expect(isActiveNavHref(pathname, '/nl/uitleg-videos')).toBe(false)
  })

  it('herkent Uitlegvideo’s als actief op /nl/uitleg-videos, de rest niet', () => {
    const pathname = '/nl/uitleg-videos'
    expect(isActiveNavHref(pathname, '/nl/uitleg-videos')).toBe(true)
    expect(isActiveNavHref(pathname, '/nl/theorie')).toBe(false)
    expect(isActiveNavHref(pathname, '/nl/examen-integralen')).toBe(false)
  })

  it('markeert geen andere link als pad alleen begint met dezelfde tekst', () => {
    expect(isActiveNavHref('/nl/theorieboekenlijst', '/nl/theorie')).toBe(false)
  })

  it('negeert querystring in de href', () => {
    expect(isActiveNavHref('/nl/oefenen', '/nl/oefenen?bron=menu')).toBe(true)
  })
})
