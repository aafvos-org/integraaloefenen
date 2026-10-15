import { describe, expect, it } from 'vitest'

import { getPathMatch } from 'next/dist/shared/lib/router/utils/path-match'
import { prepareDestination } from 'next/dist/shared/lib/router/utils/prepare-destination'

import nextConfig from '../../next.config'

type Doorverwijzing = {
  source: string
  destination: string
}

async function engelseRegels(): Promise<Doorverwijzing[]> {
  if (!nextConfig.redirects) throw new Error('Geen doorverwijzingen in next.config')
  const regels = await nextConfig.redirects()
  return regels.filter((regel) => regel.source.startsWith('/en'))
}

/** Zelfde stappen als Next: eerste passende bron, dan het doel invullen. */
function doelVan(regels: Doorverwijzing[], pad: string): string | undefined {
  for (const regel of regels) {
    const match = getPathMatch(regel.source, { strict: true })(pad)
    if (!match) continue
    const { parsedDestination } = prepareDestination({
      appendParamsToQuery: false,
      destination: regel.destination,
      params: match,
      query: {},
    })
    return parsedDestination.pathname
  }
  return undefined
}

describe('Engelse adressen', () => {
  it('stuurt /en en /en/ naar /nl', async () => {
    const regels = await engelseRegels()
    expect(doelVan(regels, '/en')).toBe('/nl')
    expect(doelVan(regels, '/en/')).toBe('/nl')
  })

  it('houdt een langer adres hetzelfde onder /nl', async () => {
    const regels = await engelseRegels()
    expect(doelVan(regels, '/en/theorie/primitieve')).toBe('/nl/theorie/primitieve')
  })
})
