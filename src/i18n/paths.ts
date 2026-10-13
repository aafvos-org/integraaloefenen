// De twee soorten paden op de site, op één plek.
//
// MET_TAAL staat onder src/app/[locale]/ en heeft dus de taal vooraan:
// /nl/oefenen. Wie /oefenen typt of bewaart, krijgt via next.config.ts dezelfde
// pagina, zonder extra doorverwijzing. Vergeet je een pagina hier, dan leest
// Next.js de eerste map als taal, herkent die niet en geeft een 404
// (src/app/[locale]/layout.tsx).
// paths.test.ts vergelijkt deze lijst met de mappen op schijf, zodat een
// nieuwe pagina niet stil kan blijven liggen.
export const MET_TAAL = [
  'dashboard',
  'examentraining',
  'feedback',
  'hoe-het-werkt',
  'inloggen',
  'instellingen',
  'oefenen',
  'privacy',
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
export const OPENBAAR = ['hoe-het-werkt', 'privacy', 'theorie', 'uitleg-videos'] as const

/**
 * De rest van MET_TAAL: persoonlijke pagina's en in-/uitlogformulieren. Die
 * horen niet in de index, dus zet robots.ts ze op slot. Afgeleid van MET_TAAL,
 * zodat een nieuwe pagina standaard dicht staat en niet per ongeluk open.
 */
export const AFGESCHERMD: readonly string[] = MET_TAAL.filter(
  (pad) => !(OPENBAAR as readonly string[]).includes(pad),
)

// ACHTER_INLOG is waar je voor moet inloggen. De middleware stuurt een
// uitgelogde bezoeker hier meteen naar /nl/inloggen, zodat hij niet eerst een
// halve pagina ziet opbouwen. Let op het verschil met AFGESCHERMD: daar staat
// ook /inloggen en /registreren in (die horen niet in een zoekmachine, maar
// zijn juist voor wie nog níet is ingelogd).
//
// Dit is een extra poort, geen vervanging: elke pagina en elke server action
// controleert zelf ook of er iemand is ingelogd. De handleiding van Next.js
// zegt dat met zoveel woorden, omdat een server action op een pad kan zitten
// dat de matcher overslaat (node_modules/next/dist/docs/01-app/03-api-reference/
// 03-file-conventions/proxy.md, kopje "Execution order").
//
// paths.test.ts vergelijkt deze lijst met de pagina's die zelf `if (!user)
// redirect(...)` doen, zodat de twee niet uit elkaar kunnen lopen.
export const ACHTER_INLOG = [
  'dashboard',
  'examentraining',
  'feedback',
  'instellingen',
  'oefenen',
  'zelf-toets',
] as const
