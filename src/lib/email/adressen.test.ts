import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  afzender,
  onderwerpAanAaf,
  ontvangerAanAaf,
  type BerichtAanAaf,
} from './adressen'

afterEach(() => {
  vi.unstubAllEnvs()
})

// =====================================================================
// De afzender
// =====================================================================
describe('afzender', () => {
  it('valt terug op no-reply met de merknaam ervoor', () => {
    vi.stubEnv('EMAIL_FROM', undefined)
    expect(afzender()).toBe('IntegraalOefenen <no-reply@integraaloefenen.nl>')
  })

  it('pakt een kaal adres uit EMAIL_FROM in met de merknaam', () => {
    vi.stubEnv('EMAIL_FROM', 'post@integraaloefenen.nl')
    expect(afzender()).toBe('IntegraalOefenen <post@integraaloefenen.nl>')
  })

  it('laat een EMAIL_FROM die al een naam heeft met rust', () => {
    vi.stubEnv('EMAIL_FROM', 'Aaf van IntegraalOefenen <post@integraaloefenen.nl>')
    expect(afzender()).toBe('Aaf van IntegraalOefenen <post@integraaloefenen.nl>')
  })

  it('behandelt een lege EMAIL_FROM als niet ingesteld', () => {
    vi.stubEnv('EMAIL_FROM', '   ')
    expect(afzender()).toBe('IntegraalOefenen <no-reply@integraaloefenen.nl>')
  })
})

// =====================================================================
// De ontvanger: één adres voor alle berichten aan Aaf
// =====================================================================
describe('ontvangerAanAaf', () => {
  it('geeft het adres uit NOTIFY_EMAIL', () => {
    vi.stubEnv('NOTIFY_EMAIL', ' aaf@test.local ')
    expect(ontvangerAanAaf()).toBe('aaf@test.local')
  })

  it('geeft null als NOTIFY_EMAIL niet ingesteld is', () => {
    // Stond dit op `undefined`, dan ging er vroeger een mail naar de ontvanger
    // "undefined": Resend weigert die, en de webhook antwoordde met 502.
    vi.stubEnv('NOTIFY_EMAIL', undefined)
    expect(ontvangerAanAaf()).toBeNull()

    vi.stubEnv('NOTIFY_EMAIL', '')
    expect(ontvangerAanAaf()).toBeNull()
  })
})

// =====================================================================
// Het onderwerp: welk bericht is dit, en over wie gaat het?
// =====================================================================
describe('onderwerpAanAaf', () => {
  const SOORTEN: BerichtAanAaf[] = [
    'aanmelding',
    'bevestigd',
    'vraag',
    'video',
    'feedback',
  ]

  it('zet de soort voorop en daarachter om wie het gaat', () => {
    expect(onderwerpAanAaf('aanmelding', 'leerling@test.local')).toBe(
      'Aanmelding: leerling@test.local',
    )
    expect(onderwerpAanAaf('bevestigd', 'leerling@test.local')).toBe(
      'Bevestigd: leerling@test.local',
    )
  })

  it('houdt aanmelding en bevestiging uit elkaar vóór de dubbele punt', () => {
    // Op een telefoon ziet Aaf alleen het begin van het onderwerp, en deze
    // twee gaan over dezelfde leerling. Het verschil moet dus vooraan staan.
    const aanmelding = onderwerpAanAaf('aanmelding', 'leerling@test.local')
    const bevestigd = onderwerpAanAaf('bevestigd', 'leerling@test.local')
    expect(aanmelding.slice(0, 6)).not.toBe(bevestigd.slice(0, 6))
  })

  it('geeft elke soort zijn eigen begin', () => {
    const koppen = SOORTEN.map((soort) => onderwerpAanAaf(soort, 'wie@test.local').split(':')[0])
    expect(new Set(koppen).size).toBe(SOORTEN.length)
  })

  it('laat de dubbele punt weg als er niemand bij hoort', () => {
    expect(onderwerpAanAaf('feedback', '  ')).toBe('Feedback')
  })
})

// =====================================================================
// Geen enkel adres staat nog in de code
// =====================================================================
describe('de adressen staan niet in de code', () => {
  const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

  /** Elk .ts/.tsx-bestand onder src/, behalve de tests zelf. */
  function bronbestanden(map: string): string[] {
    return readdirSync(map, { withFileTypes: true }).flatMap((item) => {
      const pad = path.join(map, item.name)
      if (item.isDirectory()) return bronbestanden(pad)
      if (!/\.tsx?$/.test(item.name) || item.name.endsWith('.test.ts')) return []
      return [pad]
    })
  }

  /** Een e-mailadres tussen aanhalingstekens, zoals `'aaf@ergens.nl'`. */
  const ADRES = /['"`][A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}['"`]/g

  it('staat in geen enkel bestand onder src/ een vast e-mailadres', () => {
    // Waar een mail heen gaat hoort uit NOTIFY_EMAIL te komen en van wie uit
    // EMAIL_FROM. Stond het adres in de code, dan verhuisde maar de helft van
    // de post zodra Aaf een ander adres instelde.
    const gevonden = bronbestanden(SRC).flatMap((pad) => {
      const treffers = readFileSync(pad, 'utf8').match(ADRES) ?? []
      return treffers.map((adres) => `${path.relative(SRC, pad)}: ${adres}`)
    })

    expect(gevonden).toEqual([])
  })
})
