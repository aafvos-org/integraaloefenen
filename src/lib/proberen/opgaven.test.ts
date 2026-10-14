import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { THEORIE_SLUGS } from '@/lib/theorie-slugs'

import { beoordeelProef, proefKlopt, proefSommen } from './opgaven'

describe('proefSommen', () => {
  it('geeft elk theoriehoofdstuk drie opgaven, zonder het antwoord', () => {
    for (const slug of THEORIE_SLUGS) {
      const sommen = proefSommen(slug)
      expect(sommen, slug).toHaveLength(3)
      for (const som of sommen!) {
        expect(Object.keys(som).sort()).toEqual(['latex', 'volgnummer'])
        expect(som.latex.length).toBeGreaterThan(0)
      }
    }
  })

  it('kent een verzonnen hoofdstuk niet', () => {
    expect(proefSommen('bestaat-niet')).toBeNull()
  })
})

describe('beoordeelProef', () => {
  it('rekent de standaardprimitieven goed, ook met + c en een andere schrijfwijze', () => {
    expect(beoordeelProef('primitieve', 0, 'x^4/4 + sin(x)')).toEqual({ soort: 'goed' })
    expect(beoordeelProef('primitieve', 0, 'x^4/4 + sin(x) + c')).toEqual({ soort: 'goed' })
    expect(beoordeelProef('primitieve', 1, '2*x^3 + cos(x)')).toEqual({ soort: 'goed' })
    expect(beoordeelProef('primitieve', 2, '5*2^x/ln(2)')).toEqual({ soort: 'goed' })
  })

  it('keurt een fout of leeg antwoord af en geeft dan pas het stappenplan', () => {
    const fout = beoordeelProef('primitieve', 0, 'x')
    expect(fout.soort).toBe('fout')
    if (fout.soort === 'fout') {
      expect(fout.stappen.length).toBeGreaterThan(0)
      expect(fout.antwoordLatex.length).toBeGreaterThan(0)
    }
    expect(beoordeelProef('primitieve', 0, '   ')).toEqual({ soort: 'leeg' })
    expect(beoordeelProef('primitieve', 9, 'x')).toEqual({ soort: 'onbekend' })
  })

  it('herkent arctan als atan, en de uitkomst van een oppervlakte', () => {
    expect(proefKlopt('2*arctan(x/3)', '2 * atan(x / 3)', [])).toBe(true)
    expect(beoordeelProef('k3', 0, '2*arctan(x/3)')).toEqual({ soort: 'goed' })
    expect(beoordeelProef('oppervlakte', 0, '12')).toEqual({ soort: 'goed' })
    expect(beoordeelProef('oppervlakte', 0, '(1/3)*x^3 - x^2 + 4*x').soort).toBe('fout')
    expect(beoordeelProef('inhoud', 0, '(28/15)*pi')).toEqual({ soort: 'goed' })
    expect(beoordeelProef('substitutiemethode', 0, '-ln(cos(4*x))/4')).toEqual({ soort: 'goed' })
    expect(
      beoordeelProef('partieel-integreren', 0, 'x*sin(2*x)/2 + cos(2*x)/4'),
    ).toEqual({ soort: 'goed' })
  })
})

describe('de proefroute', () => {
  it('roept geen database en geen AI aan', () => {
    const map = join(process.cwd(), 'src', 'app', '[locale]', 'proberen')
    const action = readFileSync(join(map, '[hoofdstuk]', 'actions.ts'), 'utf8')
    const opgaven = readFileSync(join(process.cwd(), 'src', 'lib', 'proberen', 'opgaven.ts'), 'utf8')
    for (const bron of [action, opgaven]) {
      expect(bron).not.toContain('supabase')
      expect(bron).not.toContain('check-answer')
      expect(bron).not.toContain('cookie')
    }
  })
})
