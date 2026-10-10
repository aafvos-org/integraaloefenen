/**
 * Instellingen per site.
 *
 * Deze repo is integraaloefenen.nl. Welke site het is, staat als vaste waarde
 * in `SITE` hieronder en komt niet uit een omgevingsvariabele: `NEXT_PUBLIC_SITE`
 * wordt nergens meer gelezen, dus die ergens zetten verandert niets.
 *
 * De afgeleiden-tak staat er nog in en wordt stap voor stap opgeruimd; alleen
 * merknaam, domein en vakwoorden verschillen.
 */

export type SiteId = 'afgeleiden' | 'integralen'

export const SITE: SiteId = 'integralen'

type SiteDef = {
  id: SiteId
  brand: string
  domain: string
  subjectNounNl: string
  subjectNounNlPlural: string
  subjectVerbNl: string
  /** Zin die in AI-prompts de opgave inleidt, bv. "Bepaal de afgeleide van". */
  taskPromptNl: string
}

const SITES: Record<SiteId, SiteDef> = {
  afgeleiden: {
    id: 'afgeleiden',
    brand: 'AfgeleideOefenen',
    domain: 'afgeleideoefenen.nl',
    subjectNounNl: 'afgeleide',
    subjectNounNlPlural: 'afgeleides',
    subjectVerbNl: 'differentiëren',
    taskPromptNl: 'Bepaal de afgeleide van',
  },
  integralen: {
    id: 'integralen',
    brand: 'IntegraalOefenen',
    domain: 'integraaloefenen.nl',
    subjectNounNl: 'integraal',
    subjectNounNlPlural: 'integralen',
    subjectVerbNl: 'integreren',
    taskPromptNl: 'Bereken de integraal van',
  },
}

export const SITE_CONFIG = SITES[SITE]
