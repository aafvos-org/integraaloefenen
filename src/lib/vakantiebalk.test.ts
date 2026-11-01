import { afterEach, describe, expect, it, vi } from 'vitest'

import { BRON_TABBLAD } from './bron'
import { VAKANTIE_BALK_ID, scriptDatVakantieBalkToont } from './vakantiebalk'

describe('scriptDatVakantieBalkToont', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  /** Draait het scriptje zoals de browser dat doet, met een nep-element en een vaste datum. */
  function draaiScript(
    nu: Date,
    opties: { zoekreeks?: string; referrer?: string; bronInTabblad?: string } = {},
  ): { hidden: boolean } {
    vi.useFakeTimers()
    vi.setSystemTime(nu)
    const element = { hidden: true }
    const document = {
      getElementById: (id: string) => (id === VAKANTIE_BALK_ID ? element : null),
      referrer: opties.referrer ?? '',
    }
    const location = { search: opties.zoekreeks ?? '' }
    const sessionStorage = {
      getItem: (key: string) => (key === BRON_TABBLAD ? (opties.bronInTabblad ?? null) : null),
    }
    const draai = new Function(
      'document',
      'location',
      'sessionStorage',
      scriptDatVakantieBalkToont(),
    )
    draai(document, location, sessionStorage)
    return element
  }

  it('laat de balk verborgen vlak voor de startdatum', () => {
    expect(draaiScript(new Date(2026, 9, 25, 23, 59)).hidden).toBe(true)
  })

  it('toont de balk op de startdatum', () => {
    expect(draaiScript(new Date(2026, 9, 26, 0, 0)).hidden).toBe(false)
  })

  it('toont de balk midden in de periode', () => {
    expect(draaiScript(new Date(2026, 10, 1, 12, 0)).hidden).toBe(false)
  })

  it('toont de balk op de einddatum', () => {
    expect(draaiScript(new Date(2026, 10, 9, 23, 59)).hidden).toBe(false)
  })

  it('laat de balk verborgen na de einddatum', () => {
    expect(draaiScript(new Date(2026, 10, 10, 0, 0)).hidden).toBe(true)
  })

  it('laat de balk verborgen een jaar eerder', () => {
    expect(draaiScript(new Date(2025, 10, 1, 12, 0)).hidden).toBe(true)
  })

  it('faalt stil als het element nog niet in de pagina staat', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 1))
    const draai = new Function('document', scriptDatVakantieBalkToont())
    expect(() => draai({ getElementById: () => null })).not.toThrow()
  })

  it('zoekt op hetzelfde id als de balk in vakantie-balk.tsx', () => {
    expect(scriptDatVakantieBalkToont()).toContain(VAKANTIE_BALK_ID)
  })

  describe('voorrang voor de YouTube- en Google-strip (INT-709)', () => {
    const MIDDEN_IN_PERIODE = new Date(2026, 10, 1, 12, 0)

    it('blijft verborgen bij ?van=youtube', () => {
      expect(draaiScript(MIDDEN_IN_PERIODE, { zoekreeks: '?van=youtube' }).hidden).toBe(true)
    })

    it('blijft verborgen bij ?van=google', () => {
      expect(draaiScript(MIDDEN_IN_PERIODE, { zoekreeks: '?van=google' }).hidden).toBe(true)
    })

    it('negeert hoofdletters en spaties in ?van=', () => {
      expect(draaiScript(MIDDEN_IN_PERIODE, { zoekreeks: '?van=  YouTube ' }).hidden).toBe(true)
    })

    it('blijft verborgen bij een Google-verwijzer zonder ?van=', () => {
      expect(
        draaiScript(MIDDEN_IN_PERIODE, { referrer: 'https://www.google.nl/search?q=integreren' })
          .hidden,
      ).toBe(true)
    })

    it('toont de balk gewoon bij een andere bron', () => {
      expect(draaiScript(MIDDEN_IN_PERIODE, { zoekreeks: '?van=docent' }).hidden).toBe(false)
    })

    it('toont de balk gewoon bij een niet-Google-verwijzer', () => {
      expect(draaiScript(MIDDEN_IN_PERIODE, { referrer: 'https://example.com' }).hidden).toBe(
        false,
      )
    })

    it('toont de balk gewoon zonder ?van= en zonder verwijzer', () => {
      expect(draaiScript(MIDDEN_IN_PERIODE).hidden).toBe(false)
    })

    it('faalt stil op een onbruikbare verwijzer en toont de balk gewoon', () => {
      expect(draaiScript(MIDDEN_IN_PERIODE, { referrer: 'niet-een-url' }).hidden).toBe(false)
    })

    it('blijft verborgen op een later bezoek zonder ?van= of verwijzer, als het tabblad nog Google als bron onthoudt', () => {
      // Dit is wat er in de praktijk gebeurt bij /nl?van=google -> klik rond -> terug naar /nl:
      // de tweede keer is er geen ?van= en geen Google-verwijzer meer, maar GoogleStrip (bron.ts,
      // `bronUitTabblad`) blijft zichtbaar omdat sessionStorage de bron van de eerste landing nog
      // onthoudt. Zonder deze check stonden hier weer twee balken (INT-709, Controle-FAIL).
      expect(draaiScript(MIDDEN_IN_PERIODE, { bronInTabblad: 'google' }).hidden).toBe(true)
    })

    it('toont de balk weer op een later bezoek zonder ?van=, als het tabblad youtube als bron onthoudt', () => {
      // Anders dan GoogleStrip kijkt YoutubeStrip alleen naar de actuele ?van=, niet naar
      // sessionStorage. Die strip verdwijnt dus vanzelf weer, dus de toetsweekbalk moet dan ook
      // weer verschijnen — niet blijven verbergen op een oude, niet meer tonende bron.
      expect(draaiScript(MIDDEN_IN_PERIODE, { bronInTabblad: 'youtube' }).hidden).toBe(false)
    })

    it('negeert een andere bron in het tabblad', () => {
      expect(draaiScript(MIDDEN_IN_PERIODE, { bronInTabblad: 'docent' }).hidden).toBe(false)
    })
  })

  describe('voorrang voor de ChatGPT-strip (INT-710)', () => {
    const MIDDEN_IN_PERIODE = new Date(2026, 10, 1, 12, 0)

    it('blijft verborgen bij ?utm_source=chatgpt.com', () => {
      expect(
        draaiScript(MIDDEN_IN_PERIODE, { zoekreeks: '?utm_source=chatgpt.com' }).hidden,
      ).toBe(true)
    })

    it('negeert hoofdletters en spaties in ?utm_source=', () => {
      expect(
        draaiScript(MIDDEN_IN_PERIODE, { zoekreeks: '?utm_source=  ChatGPT ' }).hidden,
      ).toBe(true)
    })

    it('blijft verborgen bij een verwijzer vanaf chatgpt.com', () => {
      expect(
        draaiScript(MIDDEN_IN_PERIODE, { referrer: 'https://chatgpt.com/c/iets' }).hidden,
      ).toBe(true)
    })

    it('blijft verborgen bij een verwijzer vanaf chat.openai.com', () => {
      expect(
        draaiScript(MIDDEN_IN_PERIODE, { referrer: 'https://chat.openai.com/c/iets' }).hidden,
      ).toBe(true)
    })

    it('toont de balk gewoon bij een andere utm_source', () => {
      expect(draaiScript(MIDDEN_IN_PERIODE, { zoekreeks: '?utm_source=nieuwsbrief' }).hidden).toBe(
        false,
      )
    })
  })
})
