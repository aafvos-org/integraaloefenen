import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  BRONNEN,
  aanmeldGegevens,
  leesBron,
  padNaarAanmelden,
  scriptDatBronOnthoudt,
} from './bron'

describe('leesBron', () => {
  it('herkent de vaste woorden', () => {
    for (const bron of BRONNEN) {
      expect(leesBron(bron)).toBe(bron)
    }
  })

  it('negeert hoofdletters en spaties', () => {
    expect(leesBron('  YouTube ')).toBe('youtube')
  })

  it('laat de database precies dezelfde woorden toe', () => {
    const map = join(process.cwd(), 'supabase/migrations')
    const bestanden = readdirSync(map)
      .filter((naam) => naam.endsWith('.sql'))
      .sort()
    let laatste = ''
    for (const naam of bestanden) {
      const sql = readFileSync(join(map, naam), 'utf8')
      const match = sql.match(/bron in \(([^)]+)\)/)
      if (match) laatste = match[1]
    }
    const woorden = [...laatste.matchAll(/'([^']+)'/g)].map((treffer) => treffer[1])
    expect(woorden).toEqual([...BRONNEN])
  })

  it('negeert onbekende waarden, ook die van de bevestigingsmail', () => {
    expect(leesBron('bevestiging')).toBeNull()
    expect(leesBron('tiktok')).toBeNull()
    expect(leesBron('youtube extra')).toBeNull()
    expect(leesBron('')).toBeNull()
    expect(leesBron(null)).toBeNull()
    expect(leesBron(undefined)).toBeNull()
  })
})

describe('aanmeldGegevens', () => {
  it('zet naam en bron samen in de metadata', () => {
    expect(aanmeldGegevens('wiskunde', 'youtube')).toEqual({
      username: 'wiskunde',
      bron: 'youtube',
    })
  })

  it('laat een onbekende bron weg en een lege naam ook', () => {
    expect(aanmeldGegevens(null, 'klas')).toEqual({ bron: 'klas' })
    expect(aanmeldGegevens(null, null)).toBeUndefined()
  })
})

describe('padNaarAanmelden', () => {
  it('plakt de bron achter de aanmeldlink', () => {
    expect(padNaarAanmelden('/nl/registreren', 'docent')).toBe(
      '/nl/registreren?van=docent',
    )
  })

  it('laat de link met rust als er geen bron is', () => {
    expect(padNaarAanmelden('/registreren', null)).toBe('/registreren')
  })
})

describe('scriptDatBronOnthoudt', () => {
  it('noemt elk toegestaan woord en zet geen cookie', () => {
    const script = scriptDatBronOnthoudt()
    for (const bron of BRONNEN) expect(script).toContain(bron)
    expect(script).toContain('sessionStorage')
    expect(script).not.toContain('cookie')
    expect(script).not.toContain('bevestiging')
  })
})
