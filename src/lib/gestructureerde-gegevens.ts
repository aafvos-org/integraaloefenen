import { SITE_CONFIG } from '@/config/site'

type VraagAntwoord = { question: string; answer: string }

/**
 * Kaart voor zoekmachines op de startpagina: de site, de organisatie en de
 * veelgestelde vragen. De FAQ stond er al; de organisatie is erbij gekomen.
 */
export function startpaginaGegevens(siteUrl: string, faq: VraagAntwoord[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}#website`,
        url: siteUrl,
        name: SITE_CONFIG.domain,
      },
      {
        '@type': 'EducationalOrganization',
        '@id': `${siteUrl}#organisatie`,
        name: SITE_CONFIG.domain,
        url: siteUrl,
        inLanguage: 'nl',
      },
      {
        '@type': 'FAQPage',
        '@id': `${siteUrl}#faq`,
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  }
}

/**
 * Kaart voor /over: Aaf en de organisatie "Wiskunde met Aaf" erachter, met
 * `@id` en `url` op dit domein (INT-832). Zo ziet een chatbot op elke site
 * dezelfde afzender, met `sameAs` naar de andere twee sites en YouTube.
 */
export function overPaginaGegevens(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}#wiskunde-met-aaf`,
        name: 'Wiskunde met Aaf',
        url: siteUrl,
        sameAs: [
          'https://www.wiskundemetaaf.nl/',
          'https://www.afgeleideoefenen.nl/',
          'https://www.youtube.com/@WiskundeMetAaf',
        ],
        founder: { '@id': `${siteUrl}#aaf` },
      },
      {
        '@type': 'Person',
        '@id': `${siteUrl}#aaf`,
        name: 'Aaf',
        jobTitle: 'Docent wiskunde B',
        url: `${siteUrl}/nl/over`,
        worksFor: { '@id': `${siteUrl}#wiskunde-met-aaf` },
        sameAs: [
          'https://www.wiskundemetaaf.nl/nl/over',
          'https://www.youtube.com/@WiskundeMetAaf',
        ],
      },
    ],
  }
}

/** Kaart voor één theoriepagina: titel, adres en een korte beschrijving. */
export function leermiddel({
  titel,
  url,
  omschrijving,
}: {
  titel: string
  url: string
  omschrijving: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: titel,
    url,
    description: omschrijving,
    inLanguage: 'nl',
  }
}

/**
 * Kaart voor één antwoordpagina: de vraag met het antwoord (voor het
 * zoekresultaat) en de vier stappen (voor de uitwerking).
 */
export function voorbeeldGegevens({
  url,
  vraag,
  antwoord,
  stappen,
}: {
  url: string
  vraag: string
  antwoord: string
  stappen: string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        url,
        inLanguage: 'nl',
        mainEntity: [
          {
            '@type': 'Question',
            name: vraag,
            acceptedAnswer: { '@type': 'Answer', text: antwoord },
          },
        ],
      },
      {
        '@type': 'HowTo',
        name: vraag,
        inLanguage: 'nl',
        step: stappen.map((text, i) => ({
          '@type': 'HowToStep',
          position: i + 1,
          name: `Stap ${i}`,
          text,
        })),
      },
    ],
  }
}
