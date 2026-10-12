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
