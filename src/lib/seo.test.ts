import { describe, expect, it } from 'vitest'

import { SITE_CONFIG } from '@/config/site'

import { eigenPagina } from './seo'

// =====================================================================
// eigenPagina(): het eigen adres en het deelkaartje van één pagina
//
// Allebei stonden ze eerst in de layout, die het pad niet kent. Deze test
// houdt vast dat het adres het pad van de pagina volgt, en dat het kaartje
// compleet is: Next.js vervangt `openGraph` in zijn geheel zodra een pagina
// hem zet, dus een half ingevuld blok kost je de sitenaam en de titel.
// =====================================================================

describe('eigenPagina', () => {
  it('zet het pad achter de taal, in het adres én op het kaartje', () => {
    const m = eigenPagina({
      locale: 'nl',
      pad: '/theorie',
      titel: 'Theorie',
      omschrijving: 'Alle regels op een rij.',
    })

    expect(m.alternates?.canonical).toBe('/nl/theorie')
    expect(m.openGraph?.url).toBe('/nl/theorie')
  })

  it('geeft de startpagina het adres van de taal zelf', () => {
    const m = eigenPagina({ locale: 'nl', omschrijving: 'Oefen integralen.' })

    expect(m.alternates?.canonical).toBe('/nl')
    expect(m.openGraph?.url).toBe('/nl')
  })

  it('levert een compleet kaartje, want Next.js vervangt het hele blok', () => {
    const m = eigenPagina({
      locale: 'nl',
      pad: '/hoe-het-werkt',
      titel: 'Hoe het werkt',
      omschrijving: 'Zo oefen je.',
    })

    expect(m.openGraph).toMatchObject({
      type: 'website',
      locale: 'nl_NL',
      siteName: SITE_CONFIG.domain,
      title: 'Hoe het werkt',
      description: 'Zo oefen je.',
    })
  })

  it('laat de titel weg als de pagina die uit de layout haalt', () => {
    const m = eigenPagina({
      locale: 'nl',
      kaartTitel: 'Integralen oefenen',
      omschrijving: 'Oefen integralen.',
    })

    expect(m.title).toBeUndefined()
    expect(m.openGraph?.title).toBe('Integralen oefenen')
  })

  it('gebruikt de titel van de pagina op het kaartje als er geen aparte is', () => {
    const m = eigenPagina({
      locale: 'nl',
      pad: '/uitleg-videos',
      titel: 'Uitlegvideo’s',
      omschrijving: 'Kijk mee.',
    })

    expect(m.title).toBe('Uitlegvideo’s')
    expect(m.openGraph?.title).toBe('Uitlegvideo’s')
  })
})
