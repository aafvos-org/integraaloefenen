import { describe, expect, it } from 'vitest'

import { SITE_CONFIG } from '@/config/site'

import { welkomstmail } from './welkom'

/**
 * De welkomstmail is de enige mail die de site zelf verstuurt (via Resend, na
 * het bevestigen van het adres). Hij komt dus níet in de testpostbus van de
 * lokale Supabase, en de e2e-tests kunnen hem niet openen. Daarom hier: klopt
 * wat erin staat?
 */
describe('welkomstmail', () => {
  const mail = welkomstmail()

  it('komt van de merknaam van deze site, niet van een persoon', () => {
    expect(mail.van).toBe(`${SITE_CONFIG.brand} <no-reply@${SITE_CONFIG.domain}>`)
  })

  it('heeft een Nederlands onderwerp met de merknaam erin', () => {
    expect(mail.onderwerp).toBe(`Welkom bij ${SITE_CONFIG.brand}!`)
  })

  it('zegt in de je-vorm dat het account klaar is', () => {
    for (const versie of [mail.html, mail.tekst]) {
      expect(versie).toContain('Je account is klaar.')
      expect(versie).toContain('Leuk dat je er bent.')
      expect(versie).toContain('Groeten van Aaf')
    }
  })

  it('zet de knop op de makkelijkste som van de machtsregel', () => {
    const metSom = welkomstmail('vraag-1')
    const som = `https://www.${SITE_CONFIG.domain}/nl/oefenen?blok=k0b&q=vraag-1`
    expect(metSom.html).toContain('Maak je eerste som')
    expect(metSom.html).toContain(`href="${som}"`)
    expect(metSom.tekst).toContain(`Maak je eerste som: ${som}`)
    expect(metSom.html).not.toContain('Stel je eerste vraag')
    expect(metSom.html).not.toContain('/nl/uitleg-videos')
    expect(metSom.html).not.toContain('afgeleideoefenen.nl')
    // De zin over een vraag insturen blijft tekst, geen knop.
    expect(metSom.html).toContain('Stuur hem in, dan maak ik er een')
    expect(metSom.html).toContain('uitlegvideo van.')
    expect(metSom.html).toContain('Vertel het door aan vrienden.')
  })

  it('wijst zonder somnummer nog steeds naar het blok van de machtsregel', () => {
    const blok = `https://www.${SITE_CONFIG.domain}/nl/oefenen?blok=k0b`
    expect(mail.html).toContain(`href="${blok}"`)
    expect(mail.html).not.toContain('blok=k0b&q=')
  })

  it('heeft een leesbare versie zonder opmaak voor wie geen html krijgt', () => {
    expect(mail.tekst).not.toContain('<')
    expect(mail.tekst.trim().length).toBeGreaterThan(100)
  })
})
