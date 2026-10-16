import { derivative, isComplex, parse, type MathNode } from 'mathjs'
import { describe, expect, it } from 'vitest'

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
const TOLERANTIE = 1e-6
const STANDAARD_DOMEIN: [number, number] = [-2.5, 2.5]
const TE_GROOT = 1e9
const TOEGESTANE_NAMEN = new Set(['x', 'e', 'pi', 'tau', 'phi'])

function lees(formule: string): MathNode {
  if (/\blog\s*\(/.test(formule)) {
    throw new Error('gebruik ln(...) of log10(...), niet log(...)')
  }
  const node = parse(formule.replace(/\bln\s*\(/g, 'log('))
  const onbekend = node
    .filter(
      (kind, pad, ouder) =>
        kind.type === 'SymbolNode' && !(ouder?.type === 'FunctionNode' && pad === 'fn'),
    )
    .map((kind) => (kind as unknown as { name: string }).name)
    .filter((naam) => !TOEGESTANE_NAMEN.has(naam))
  if (onbekend.length > 0) {
    throw new Error(`onbekende naam ${[...new Set(onbekend)].join(', ')}`)
  }
  return node
}

function alsFunctie(node: MathNode): (x: number) => number | null {
  const gecompileerd = node.compile()
  return (x) => {
    try {
      const uitkomst = gecompileerd.evaluate({ x })
      if (isComplex(uitkomst) || typeof uitkomst !== 'number') return null
      if (!Number.isFinite(uitkomst) || Math.abs(uitkomst) > TE_GROOT) return null
      return uitkomst
    } catch {
      return null
    }
  }
}

function alsGetal(waarde: string | number): number {
  if (typeof waarde === 'number') return waarde
  const uitkomst = alsFunctie(lees(waarde))(Number.NaN)
  if (uitkomst === null) throw new Error(`\`${waarde}\` is geen getal`)
  return uitkomst
}

function proefpunten([begin, eind]: [number, number]): number[] {
  const gulden = 0.618033988749895
  return Array.from({ length: AANTAL_PUNTEN }, (_, i) => {
    const deel = ((i + 1) * gulden) % 1
    return begin + (eind - begin) * deel
  })
}

function klopt(gevonden: number, verwacht: number): boolean {
  return Math.abs(gevonden - verwacht) <= TOLERANTIE * Math.max(1, Math.abs(verwacht))
}

function problemenVan(voorbeeld: Voorbeeld): string[] {
  const hier = voorbeeld.slug
  const problemen: string[] = []
  let integrand: MathNode
  let primitieve: MathNode
  try {
    integrand = lees(voorbeeld.integrand)
  } catch (fout) {
    return [`${hier}: integrand — ${fout instanceof Error ? fout.message : fout}`]
  }
  try {
    primitieve = lees(voorbeeld.primitieve)
  } catch (fout) {
    return [`${hier}: primitieve — ${fout instanceof Error ? fout.message : fout}`]
  }
  const afgeleide = derivative(primitieve, 'x')
  const bereken = {
    integrand: alsFunctie(integrand),
    afgeleide: alsFunctie(afgeleide),
  }
  const domein = voorbeeld.domein ?? STANDAARD_DOMEIN
  let bruikbaar = 0
  const afwijkingen: string[] = []
  for (const x of proefpunten(domein)) {
    const verwacht = bereken.integrand(x)
    const gevonden = bereken.afgeleide(x)
    if (verwacht === null || gevonden === null) continue
    bruikbaar += 1
    if (!klopt(gevonden, verwacht)) {
      afwijkingen.push(`x=${x}: afgeleide ${gevonden}, integrand ${verwacht}`)
    }
  }
  if (afwijkingen.length > 0) {
    problemen.push(
      `${hier}: afgeleide van \`${voorbeeld.primitieve}\` is \`${afgeleide.toString()}\`, integrand \`${voorbeeld.integrand}\` — ${afwijkingen.slice(0, 2).join('; ')}`,
    )
  }
  if (bruikbaar < MINIMAAL_BRUIKBAAR) {
    problemen.push(`${hier}: maar ${bruikbaar} bruikbare x-waarden`)
  }
  if (voorbeeld.grenzen && voorbeeld.waarde !== undefined) {
    const [a, b] = voorbeeld.grenzen
    const F = alsFunctie(primitieve)
    const links = F(a)
    const rechts = F(b)
    if (links === null || rechts === null) {
      problemen.push(`${hier}: primitieve bestaat niet op een grens`)
    } else if (!klopt(rechts - links, alsGetal(voorbeeld.waarde))) {
      problemen.push(
        `${hier}: F(b)-F(a)=${rechts - links}, verwacht ${voorbeeld.waarde}`,
      )
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
    expect(uitwerkingenVoor('oppervlakte')).toHaveLength(0)
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
