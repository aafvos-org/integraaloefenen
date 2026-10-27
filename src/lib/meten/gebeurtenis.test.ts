import { describe, expect, it } from 'vitest'

import {
  MAX_PER_PAKKET,
  apparaatVanBreedte,
  apparaatVoorSessie,
  hoogsteVolgnummer,
  isBeheerpad,
  isBot,
  leesPakket,
  schoonPad,
  verwijzerDomein,
  type RuwPakket,
} from './gebeurtenis'

const NU = Date.parse('2026-10-16T10:00:00.000Z')

function pakket(aanpassing: Partial<RuwPakket> = {}): RuwPakket {
  return {
    s: 'a1b2c3d4e5f60718',
    a: 'telefoon',
    g: [{ n: 1, k: 'pagina', p: '/nl', t: NU }],
    ...aanpassing,
  }
}

describe('schoonPad', () => {
  it('haalt de queryparameters en het anker eraf', () => {
    expect(schoonPad('/nl/oefenen?chapter=k1&antwoord=ln(2)#top')).toBe('/nl/oefenen')
  })

  it('laat de slash achteraan weg, maar niet die van de startpagina', () => {
    expect(schoonPad('/nl/theorie/')).toBe('/nl/theorie')
    expect(schoonPad('/')).toBe('/')
  })

  it('weigert iets dat geen pad is', () => {
    expect(schoonPad('https://ergensanders.nl/nl')).toBeNull()
    expect(schoonPad('')).toBeNull()
    expect(schoonPad(42)).toBeNull()
  })
})

describe('isBeheerpad', () => {
  it('herkent de beheerpagina', () => {
    expect(isBeheerpad('/admin')).toBe(true)
    expect(isBeheerpad('/admin/flags')).toBe(true)
  })

  it('laat gewone paginas met rust', () => {
    expect(isBeheerpad('/nl/oefenen')).toBe(false)
    expect(isBeheerpad('/nl/administratie')).toBe(false)
  })
})

describe('apparaatVanBreedte', () => {
  it('deelt in op schermbreedte', () => {
    expect(apparaatVanBreedte(390)).toBe('telefoon')
    expect(apparaatVanBreedte(639)).toBe('telefoon')
    expect(apparaatVanBreedte(640)).toBe('tablet')
    expect(apparaatVanBreedte(1023)).toBe('tablet')
    expect(apparaatVanBreedte(1280)).toBe('computer')
  })
})

describe('apparaatVoorSessie', () => {
  it('bepaalt het apparaat op de schermbreedte als er nog niets is opgeslagen', () => {
    expect(apparaatVoorSessie(null, 1280)).toBe('computer')
  })

  it('houdt de eerder opgeslagen waarde aan, ook als de breedte intussen anders is', () => {
    // Dit was de bug (INT-560): bij elk verstuurd pakketje werd de breedte
    // opnieuw gelezen, zodat één sessie bijvoorbeeld eerst "computer" en
    // even later "telefoon" kreeg door een resize zonder paginawissel.
    expect(apparaatVoorSessie('telefoon', 1280)).toBe('telefoon')
    expect(apparaatVoorSessie('computer', 390)).toBe('computer')
  })

  it('negeert een opgeslagen waarde die geen geldig apparaat is', () => {
    expect(apparaatVoorSessie('onzin', 1280)).toBe('computer')
  })
})

describe('verwijzerDomein', () => {
  it('houdt alleen het domein over, zonder www en zonder zoekopdracht', () => {
    expect(verwijzerDomein('https://www.google.com/search?q=primitieve+van+sin', 'integraaloefenen.nl'))
      .toBe('google.com')
  })

  it('telt een verwijzing vanaf de site zelf niet', () => {
    expect(verwijzerDomein('https://integraaloefenen.nl/nl/theorie', 'www.integraaloefenen.nl'))
      .toBeNull()
  })

  it('geeft niets terug bij een leeg of kapot adres', () => {
    expect(verwijzerDomein('', 'integraaloefenen.nl')).toBeNull()
    expect(verwijzerDomein('zomaar wat', 'integraaloefenen.nl')).toBeNull()
  })
})

describe('leesPakket', () => {
  it('neemt een gewoon pakketje over', () => {
    const uitkomst = leesPakket(pakket(), NU)
    expect(uitkomst).not.toBeNull()
    expect(uitkomst!.sessieId).toBe('a1b2c3d4e5f60718')
    expect(uitkomst!.apparaat).toBe('telefoon')
    expect(uitkomst!.gebeurtenissen).toEqual([
      {
        volgnummer: 1,
        soort: 'pagina',
        pad: '/nl',
        doel: null,
        scrolldiepte: null,
        tijdstip: '2026-10-16T10:00:00.000Z',
      },
    ])
  })

  it('weigert een sessie-id dat geen korte code is', () => {
    expect(leesPakket(pakket({ s: 'kort' }), NU)).toBeNull()
    expect(leesPakket(pakket({ s: 'iets met spaties erin' }), NU)).toBeNull()
  })

  it('weigert een onbekend apparaat en een onbekende soort', () => {
    expect(leesPakket(pakket({ a: 'horloge' }), NU)).toBeNull()
    expect(leesPakket(pakket({ g: [{ n: 1, k: 'toetsaanslag', p: '/nl' }] }), NU)).toBeNull()
  })

  it('laat beheerpaginas eruit', () => {
    expect(leesPakket(pakket({ g: [{ n: 1, k: 'pagina', p: '/admin/flags' }] }), NU)).toBeNull()
  })

  it('wil bij een scroll een van de vier dieptes', () => {
    expect(leesPakket(pakket({ g: [{ n: 1, k: 'scroll', p: '/nl', w: 33 }] }), NU)).toBeNull()
    const goed = leesPakket(pakket({ g: [{ n: 1, k: 'scroll', p: '/nl', w: 75 }] }), NU)
    expect(goed!.gebeurtenissen[0].scrolldiepte).toBe(75)
  })

  it('houdt hetzelfde volgnummer maar één keer', () => {
    const uitkomst = leesPakket(
      pakket({
        g: [
          { n: 4, k: 'pagina', p: '/nl' },
          { n: 4, k: 'klik', p: '/nl', d: 'start-proefsom' },
          { n: 5, k: 'klik', p: '/nl', d: 'start-proefsom' },
        ],
      }),
      NU,
    )
    expect(uitkomst!.gebeurtenissen.map((g) => g.volgnummer)).toEqual([4, 5])
  })

  it('weigert een pakketje dat te groot is', () => {
    const teveel = Array.from({ length: MAX_PER_PAKKET + 1 }, (_, i) => ({
      n: i + 1,
      k: 'klik',
      p: '/nl',
    }))
    expect(leesPakket(pakket({ g: teveel }), NU)).toBeNull()
  })

  it('knipt een lang doel af en plakt de regels aan elkaar', () => {
    const uitkomst = leesPakket(
      pakket({ g: [{ n: 1, k: 'klik', p: '/nl', d: `  twee\n  regels  ${'x'.repeat(100)}` }] }),
      NU,
    )
    const doel = uitkomst!.gebeurtenissen[0].doel!
    expect(doel.startsWith('twee regels')).toBe(true)
    expect(doel.length).toBe(60)
  })

  it('neemt een klok die ver afwijkt niet over', () => {
    const uitkomst = leesPakket(
      pakket({ g: [{ n: 1, k: 'pagina', p: '/nl', t: Date.parse('2001-01-01T00:00:00Z') }] }),
      NU,
    )
    expect(uitkomst!.gebeurtenissen[0].tijdstip).toBe('2026-10-16T10:00:00.000Z')
  })

  it('houdt alleen `van` en `utm_source` over', () => {
    const uitkomst = leesPakket(pakket({ b: 'YouTube', u: 'nieuwsbrief', v: 'Google.com' }), NU)
    expect(uitkomst!.van).toBe('youtube')
    expect(uitkomst!.utmSource).toBe('nieuwsbrief')
    expect(uitkomst!.verwijzer).toBe('google.com')
  })

  it('laat vrije tekst in die velden niet door', () => {
    const uitkomst = leesPakket(pakket({ b: 'mijn e-mail is iemand@school.nl' }), NU)
    expect(uitkomst!.van).toBeNull()
  })

  it('weigert iets dat helemaal geen pakketje is', () => {
    expect(leesPakket(null, NU)).toBeNull()
    expect(leesPakket('hallo', NU)).toBeNull()
    expect(leesPakket(pakket({ g: [] }), NU)).toBeNull()
  })
})

describe('hoogsteVolgnummer', () => {
  it('vindt het hoogste nummer in het pakketje', () => {
    const uitkomst = leesPakket(
      pakket({
        g: [
          { n: 7, k: 'klik', p: '/nl' },
          { n: 3, k: 'pagina', p: '/nl' },
        ],
      }),
      NU,
    )
    expect(hoogsteVolgnummer(uitkomst!)).toBe(7)
  })
})

describe('isBot', () => {
  it('herkent crawlers en testbrowsers', () => {
    expect(isBot('Mozilla/5.0 (compatible; Googlebot/2.1)')).toBe(true)
    expect(isBot('HeadlessChrome/120.0.0.0')).toBe(true)
    expect(isBot('curl/8.4.0')).toBe(true)
  })

  it('ziet een lege user-agent als bot', () => {
    expect(isBot(null)).toBe(true)
    expect(isBot('')).toBe(true)
  })

  it('laat een gewone telefoon door', () => {
    expect(
      isBot(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      ),
    ).toBe(false)
  })
})
