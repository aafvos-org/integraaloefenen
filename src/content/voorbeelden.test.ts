import { describe, expect, it } from 'vitest'

import {
  alsGetal,
  controleerBepaaldMetPrimitieve,
  controleerPrimitieve,
  lees,
  melding,
  STANDAARD_DOMEIN,
} from './narekenen.testhulp'
import {
  oefenPad,
  proefPad,
  uitwerkingenVoor,
  VOORBEELDEN,
  vindVoorbeeld,
  type Voorbeeld,
} from './voorbeelden'

const AANTAL_PUNTEN = 13
const MINIMAAL_BRUIKBAAR = 3

/** Namen die een voorbeeld mag gebruiken naast de functies van mathjs. */
const LEES_OPTIES = { extraNamen: ['tau', 'phi'], weigerLog: true }

function problemenVan(voorbeeld: Voorbeeld): string[] {
  const hier = voorbeeld.slug
  const problemen = controleerPrimitieve(voorbeeld.integrand, voorbeeld.primitieve, hier, {
    domein: voorbeeld.domein ?? STANDAARD_DOMEIN,
    aantalPunten: AANTAL_PUNTEN,
    minimaalBruikbaar: MINIMAAL_BRUIKBAAR,
    leesOpties: LEES_OPTIES,
  })

  if (voorbeeld.grenzen && voorbeeld.waarde !== undefined) {
    const [a, b] = voorbeeld.grenzen
    try {
      const primitieve = lees(voorbeeld.primitieve, LEES_OPTIES)
      const verwacht = alsGetal(voorbeeld.waarde, {}, LEES_OPTIES)
      problemen.push(...controleerBepaaldMetPrimitieve(primitieve, a, b, verwacht, hier))
    } catch (fout) {
      problemen.push(`${hier}: ${melding(fout)}`)
    }
  }
  return problemen
}

describe('antwoordpagina’s', () => {
  it('zijn er drieëndertig, elk met een eigen adres', () => {
    expect(VOORBEELDEN).toHaveLength(33)
    expect(new Set(VOORBEELDEN.map((v) => v.slug)).size).toBe(33)
  })

  it('heeft per pagina vier stappen, twee verwante pagina’s en een oefenlink', () => {
    const slugs = new Set(VOORBEELDEN.map((v) => v.slug))
    for (const voorbeeld of VOORBEELDEN) {
      expect(voorbeeld.stappen, voorbeeld.slug).toHaveLength(4)
      expect(voorbeeld.theorie.startsWith('/theorie/'), voorbeeld.slug).toBe(true)
      for (const slug of voorbeeld.verwant) {
        expect(slugs.has(slug), `${voorbeeld.slug} → ${slug}`).toBe(true)
        expect(slug, voorbeeld.slug).not.toBe(voorbeeld.slug)
      }
      expect(new Set(voorbeeld.verwant).size, voorbeeld.slug).toBe(2)
      if (voorbeeld.nietTeVerwarrenMetSlug !== undefined) {
        expect(
          slugs.has(voorbeeld.nietTeVerwarrenMetSlug),
          `${voorbeeld.slug} → ${voorbeeld.nietTeVerwarrenMetSlug}`,
        ).toBe(true)
      }
      const pad = oefenPad(voorbeeld)
      expect(pad, voorbeeld.slug).toContain('van=voorbeeld')
      expect(pad, voorbeeld.slug).toContain(`blok=${voorbeeld.blok}`)
      expect(pad, voorbeeld.slug).toContain(`cluster=${voorbeeld.cluster}`)
      expect(proefPad(voorbeeld), voorbeeld.slug).toBe(
        `/proberen/${voorbeeld.theorie.split('/').pop()}`,
      )
    }
  })

  it('koppelt uitwerkingen aan het theoriehoofdstuk', () => {
    expect(uitwerkingenVoor('primitieve')).toHaveLength(19)
    expect(uitwerkingenVoor('partieel-integreren')).toHaveLength(6)
    expect(uitwerkingenVoor('k3')).toHaveLength(3)
    expect(uitwerkingenVoor('substitutiemethode')).toHaveLength(2)
    expect(uitwerkingenVoor('oppervlakte')).toHaveLength(3)
    expect(uitwerkingenVoor('inhoud')).toHaveLength(0)
    expect(uitwerkingenVoor('primitieve').some((item) => item.kop === 'De primitieve van 1/x')).toBe(
      true,
    )
  })

  it('klopt elke primitieve door terug te differentiëren', () => {
    const problemen = VOORBEELDEN.flatMap(problemenVan)
    expect(problemen).toEqual([])
  })

  it('vindt een pagina op zijn slug', () => {
    expect(vindVoorbeeld('1-over-x')?.kop).toBe('De primitieve van 1/x')
    expect(vindVoorbeeld('bestaat-niet')).toBeUndefined()
  })
})
