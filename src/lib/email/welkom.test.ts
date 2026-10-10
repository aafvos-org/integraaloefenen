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

  it('wijst naar de uitlegvideo’s op deze site', () => {
    const videos = `https://www.${SITE_CONFIG.domain}/nl/uitleg-videos`
    expect(mail.html).toContain(`href="${videos}"`)
    expect(mail.tekst).toContain(videos)
    // Niet naar de andere site, en niet naar een half adres.
    expect(mail.html).not.toContain('afgeleideoefenen.nl')
  })

  it('heeft een leesbare versie zonder opmaak voor wie geen html krijgt', () => {
    expect(mail.tekst).not.toContain('<')
    expect(mail.tekst.trim().length).toBeGreaterThan(100)
  })
})
