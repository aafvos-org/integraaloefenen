// De twee soorten paden op de site, op één plek.
//
// MET_TAAL staat onder src/app/[locale]/ en heeft dus de taal vooraan:
// /nl/oefenen. Wie /oefenen typt of bewaart, stuurt next.config.ts door naar
// /nl/oefenen. Vergeet je een pagina hier, dan leest Next.js de eerste map als
// taal, herkent die niet en geeft een 404 (src/app/[locale]/layout.tsx).
// paths.test.ts vergelijkt deze lijst met de mappen op schijf, zodat een
// nieuwe pagina niet stil kan blijven liggen.
export const MET_TAAL = [
  'dashboard',
  'feedback',
  'hoe-het-werkt',
  'inloggen',
  'instellingen',
  'oefenen',
  'registreren',
  'theorie',
  'uitleg-videos',
  'wachtwoord-opnieuw',
  'wachtwoord-vergeten',
  'zelf-toets',
] as const

// ZONDER_TAAL hangt juist níet onder een taal. Een oude link als /nl/admin
// stuurt de middleware terug naar /admin. Deze paden mogen nooit in MET_TAAL
// staan: dan sturen de twee regels elkaar heen en weer.
export const ZONDER_TAAL = ['admin', 'api', 'auth', 'uitloggen'] as const

// OPENBAAR is wat een leerling zonder inloggen kan lezen, en dus het enige wat
// een zoekmachine in de index hoort te zetten. sitemap.ts loopt deze lijst af.
export const OPENBAAR = ['hoe-het-werkt', 'theorie', 'uitleg-videos'] as const

/**
 * De rest van MET_TAAL: persoonlijke pagina's en in-/uitlogformulieren. Die
 * horen niet in de index, dus zet robots.ts ze op slot. Afgeleid van MET_TAAL,
 * zodat een nieuwe pagina standaard dicht staat en niet per ongeluk open.
 */
export const AFGESCHERMD: readonly string[] = MET_TAAL.filter(
  (pad) => !(OPENBAAR as readonly string[]).includes(pad),
)
