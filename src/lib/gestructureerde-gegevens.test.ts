import { describe, expect, it } from 'vitest'

import { leermiddel, startpaginaGegevens } from './gestructureerde-gegevens'

describe('gestructureerde gegevens', () => {
  it('zet op de startpagina de site, de organisatie en de vragen', () => {
    const ruw = JSON.stringify(
      startpaginaGegevens('https://integraaloefenen.nl', [
        { question: 'Is het gratis?', answer: 'Ja.' },
      ]),
    )
    const data = JSON.parse(ruw) as {
      '@graph': Array<{ '@type': string; name?: string; inLanguage?: string; mainEntity?: unknown[] }>
    }

    const types = data['@graph'].map((blok) => blok['@type'])
    expect(types).toEqual(['WebSite', 'EducationalOrganization', 'FAQPage'])

    const organisatie = data['@graph'][1]
    expect(organisatie.name).toBe('integraaloefenen.nl')
    expect(organisatie.inLanguage).toBe('nl')
    expect(data['@graph'][2].mainEntity).toHaveLength(1)
  })

  it('beschrijft een theoriepagina als leermiddel', () => {
    const data = JSON.parse(
      JSON.stringify(
        leermiddel({
          titel: 'K3 Primitieven',
          url: 'https://integraaloefenen.nl/nl/theorie/k3',
          omschrijving: 'Korte uitleg over primitiveren.',
        }),
      ),
    ) as { '@type': string; name: string; url: string; description: string; inLanguage: string }

    expect(data['@type']).toBe('LearningResource')
    expect(data.name).toBe('K3 Primitieven')
    expect(data.url).toContain('/nl/theorie/k3')
    expect(data.description).toBe('Korte uitleg over primitiveren.')
    expect(data.inLanguage).toBe('nl')
  })
})