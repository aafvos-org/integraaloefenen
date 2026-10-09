<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Regels voor agents (integraaloefenen.nl)

Deze repo is de live site integraaloefenen.nl, voor vwo-leerlingen. Hij draait op Cloudflare Workers via OpenNext.

## Werkwijze
- Werk nooit direct op `main`. Altijd een eigen tak en een pull request met `gh pr create`. Merge niet zelf.
- Draai voor elke pull request `npm run lint`, `npx tsc --noEmit`, `npm test` en `npx opennextjs-cloudflare build`. Alle vier moeten slagen. Raak je iets aan dat een leerling ziet, draai dan ook `npm run test:e2e`.
- Houd elke pull request klein en bij één onderwerp. Zet in de beschrijving wat je hebt veranderd en hoe je het hebt gecontroleerd.

## Zelf controleren

### `npm test` — de rekenregels
Vitest, zonder browser en zonder database. Draait in een paar seconden:

    npm test            # één keer
    npm run test:watch  # blijft meekijken terwijl je typt

De tests staan naast de code die ze controleren (`src/**/*.test.ts`): het
nakijken van antwoorden, de voortgangsregel en de grens van de neppe
AI-controle.

### `npm run test:e2e` — de weg van een leerling
Playwright klikt in een echte browser door de site: inloggen → oefenen →
antwoord nakijken → voortgang op het dashboard. Dit draait **alleen** tegen een
lokale Supabase, nooit tegen de echte database of de voorbeeldversie.

Eén keer klaarzetten:

    npx playwright install chromium
    npx supabase start     # Docker moet draaien
    npx supabase db reset  # zet de testleerling en het testhoofdstuk klaar

Daarna:

    npm run test:e2e                      # alles
    npm run test:e2e -- --project=computer # alleen computerformaat
    npm run test:e2e -- --headed           # meekijken in de browser

Gebruik altijd `npm run test:e2e` en niet `npx playwright test`: het scriptje
`scripts/e2e.mjs` zoekt de sleutels van de lokale Supabase op, controleert dat
die écht lokaal is, en zet `AI_CHECK_MODE=stub` zodat er geen Gemini aan te pas
komt. Die schakelaar werkt nooit in productie (zie `src/lib/ai/stub.ts`).

De testleerling en de opgaven staan in `supabase/seed.sql`. Dat bestand draait
alleen lokaal; de oefenstof zelf komt uit `supabase/migrations/`.

Draait er al een andere Supabase op je computer (bijvoorbeeld die van
afgeleideoefenen), dan zijn de poorten bezet. Zet die eerst stil, of geef deze
tijdelijk andere poorten in `supabase/config.toml` — en draai die wijziging
terug voordat je commit.

## Wat je niet zelf doet
- Wijzigingen aan de database (`supabase/migrations/`, `supabase/sql/`, `supabase/config.toml`) eerst in de taak vragen. Integraaloefenen.nl heeft een eigen Supabase-project (IntegraalOefenen, `oyevapifmenqjuklprws`); de database wordt niet meer gedeeld met afgeleideoefenen.nl.
- Niet deployen met `wrangler` of `opennextjs-cloudflare deploy`. Live zetten gebeurt alleen via een merge naar `main`.
- Geen geheimen in code, configuratie of pull requests. `.env*` en `.dev.vars` blijven buiten git.
- Geen nieuwe npm-pakketten zonder het eerst in de taak te vragen.

## Inhoud
- Alle tekst op de site in het Nederlands.
- Letters f, g en h voor functies, nooit u of v. Dat geldt ook voor substitutie
  en partieel integreren: schrijf $\int g' / (g^2+1)\,dx$ en $\int g \cdot h'\,dx$.

## De driedeling van een opgave
Elke vraag over integralen of afgeleides valt uiteen in drie delen. Deel 1 en 3
ontbreken soms, deel 2 zit er altijd in. Houd deze indeling aan in theorie,
uitleg, stappenplannen en nieuwe content, en benoem welk deel je behandelt.

1. Herken het verhaaltje en pas de goede formule toe — vertaal de tekst naar een
   integraal, bijvoorbeeld "het vlakdeel tussen de grafiek, de x-as en de lijnen
   x = a en x = p" wordt de integraal van f van a tot p.
2. Bereken de goede integraal — welke standaardvorm hoort bij deze vorm?
3. Gebruik de goede oplossingsmethode op de uitkomst — vergelijking oplossen,
   p bepalen, afronden.

Bij een kale "bereken exact"-opgave speelt alleen deel 2.
- `middleware.ts` blijft `middleware.ts`: de edge-runtime is nodig voor Cloudflare. Niet omzetten naar `proxy.ts`.
