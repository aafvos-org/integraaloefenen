import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'

import { updateSession } from './middleware'

function verzoek(pad: string) {
  return new NextRequest(new URL(pad, 'http://localhost'))
}

function bestemming(antwoord: Response) {
  return new URL(antwoord.headers.get('location') ?? '', 'http://localhost')
}

describe('inlogpoort en herkomst', () => {
  it('houdt van=voorbeeld vast en laat de rest van het adres vallen', async () => {
    const antwoord = await updateSession(
      verzoek('/nl/oefenen?blok=k0b&cluster=std&van=Voorbeeld&error=1'),
    )
    const naar = bestemming(antwoord)
    expect(naar.pathname).toBe('/nl/inloggen')
    expect(naar.searchParams.get('van')).toBe('voorbeeld')
    expect(naar.searchParams.has('blok')).toBe(false)
    expect(naar.searchParams.has('cluster')).toBe(false)
    expect(naar.searchParams.has('error')).toBe(false)
  })

  it('neemt een onbekende herkomst niet mee', async () => {
    const antwoord = await updateSession(verzoek('/nl/oefenen?van=tiktok&error=1'))
    const naar = bestemming(antwoord)
    expect(naar.pathname).toBe('/nl/inloggen')
    expect(naar.search).toBe('')
  })

  it('stuurt oefenen zonder herkomst naar inloggen zonder zoekwoorden', async () => {
    const antwoord = await updateSession(verzoek('/nl/oefenen'))
    const naar = bestemming(antwoord)
    expect(naar.pathname).toBe('/nl/inloggen')
    expect(naar.search).toBe('')
  })
})
