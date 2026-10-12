/**
 * Instellingen van integraaloefenen.nl.
 *
 * Welke site het is, staat hier vast en komt niet uit een omgevingsvariabele:
 * `NEXT_PUBLIC_SITE` wordt nergens meer gelezen, dus die ergens zetten verandert niets.
 */

/** Sleutel in de database (`site`-kolom). Deze repo is alleen integralen. */
export const SITE = 'integralen'

export const SITE_CONFIG = {
  id: SITE,
  brand: 'IntegraalOefenen',
  domain: 'integraaloefenen.nl',
  subjectNounNl: 'integraal',
  subjectNounNlPlural: 'integralen',
  subjectVerbNl: 'integreren',
  /** Zin die in AI-prompts de opgave inleidt. */
  taskPromptNl: 'Bereken de integraal van',
}
