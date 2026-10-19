<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Regels voor agents (integraaloefenen.nl)

Deze repo is de live site integraaloefenen.nl, voor vwo-leerlingen. Hij draait op Cloudflare Workers via OpenNext.

## Werkwijze
- Werk nooit direct op `main`. Altijd een eigen tak en een pull request met `gh pr create`.
- Draai voor elke pull request `npm run lint`, `npx tsc --noEmit`, `npm test` en `npx opennextjs-cloudflare build`. Alle vier moeten slagen. Raak je iets aan dat een leerling ziet, draai dan ook `npm run test:e2e`.
- Houd elke pull request klein en bij één onderwerp. Zet in de beschrijving wat je hebt veranderd en hoe je het hebt gecontroleerd.

## Rechtstreeks naar `main`

`main` is de live site. Maak je werktak vanaf `origin/main` en open je pull
request naar `main` met `gh pr create`. Zijn de verplichte controles groen,
dan merge je de pull request zelf (squash), zichtbaar werk of niet.

## Zelf controleren

### Controles op de pull request

De controles **Lint en types**, **Tests** en **Weg van een leerling** draaien
op de versie waarin jouw tak al met `main` is samengevoegd. Botst de pull
request met `main`, dan bestaat die versie niet en start GitHub die controles
niet. Ze blijven dan ontbreken. **Workers Builds** kan intussen wél groen
worden, en `gh pr checks` ziet eruit alsof alles in orde is.

Kijk daarom vóór `gh pr checks <nummer> --watch` eerst:

    gh pr view <nummer> --json mergeable,mergeStateStatus,baseRefName

Is `mergeable` gelijk aan `CONFLICTING` (dan is `mergeStateStatus` meestal
`DIRTY`), haal dan eerst `main` binnen en los het conflict op:

    git fetch origin && git merge origin/main

Wacht niet op controles die nooit starten. Pas als `mergeable` `MERGEABLE` is,
wacht je de controles af. Is `mergeable` nog `UNKNOWN`, kijk dan even later
opnieuw: GitHub is dan nog aan het rekenen.

Staat de controle **Geen conflict** op rood, dan botst de pull request met
zijn doeltak. Die controle draait geen code van de pull request; hij kijkt
alleen of samenvoegen lukt, en noemt in de melding om welke tak het gaat.

### `npm test` — de rekenregels
Vitest, zonder browser en zonder database. Draait in een paar seconden:

    npm test            # één keer
    npm run test:watch  # blijft meekijken terwijl je typt

De tests staan naast de code die ze controleren (`src/**/*.test.ts`): het
nakijken van antwoorden, de voortgangsregel, de grens van de neppe AI-controle
en het narekenen van de primitieven in `content/`.

### `npm run test:e2e` — de weg van een leerling
Playwright klikt in een echte browser door de site: registreren →
bevestigingsmail → inloggen → oefenen → antwoord nakijken → voortgang op het
dashboard, plus wachtwoord vergeten. Dit draait **alleen** tegen een lokale
Supabase, nooit tegen de echte database of de voorbeeldversie.

De mail gaat niet de deur uit: een lokale Supabase levert hem af in de
testpostbus (Mailpit, http://127.0.0.1:54324) en `e2e/postbus.ts` haalt hem
daar via de HTTP-API op. Daarom staat `[auth.email.smtp]` in
`supabase/config.toml` uit en `[local_smtp]` aan — ook in de controle.

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

## De instellingen van het echte Supabase-project

`supabase/config.toml` beschrijft standaard de Supabase op je eigen computer.
Wat op de echte site anders moet, staat onderaan datzelfde bestand in
`[remotes.production]`: nu de mailserver van Resend (aan), hoeveel mails er per
uur mogen en hoeveel aanmeldingen en bevestigingslinks er per 5 minuten per
netwerk-adres mogen. De CLI legt dat blok over de waarden erboven heen zodra je
met projectnummer `oyevapifmenqjuklprws` werkt — veld voor veld, tot in de diepste
onderverdeling. Lokaal (`npx supabase start`, `npm run test:e2e`) gebeurt er
niets mee.

Verander zo'n instelling daar en niet in het Supabase-dashboard, anders weet
niemand meer wat er staat. Kijken mag altijd, schrijven niet zomaar:

    npx supabase config diff --project-ref oyevapifmenqjuklprws   # alleen kijken
    npx supabase config push --project-ref oyevapifmenqjuklprws   # schrijft écht

Draai altijd eerst `config diff` en lees elke regel die hij noemt. Gebruik
nooit `--yes`. Zet `RESEND_API_KEY_INTEGRAAL` in je omgeving voordat je pusht:
zonder die sleutel gaat er een leeg wachtwoord naar de mailserver en verstuurt
de echte site geen mail meer.

Het blok is nog niet nagekeken tegen het dashboard — zie de opmerking erboven
in `config.toml`. Pushen doet Aaf, niet een agent.

## Oefenvragen in `content/`

De vragen staan in `content/hoofdstuk-<naam>/<wat-dan-ook>.json`, bijvoorbeeld
`content/hoofdstuk-k/` of `content/hoofdstuk-h11/`. Elk bestand
heeft een lijst `vragen`; per vraag staat er een `integrand` en een
`primitieve`:

    {
      "hoofdstuk": "K",
      "vragen": [
        {
          "nummer": "1b",
          "integrand": "2 * x / (x^2 + 1)",
          "primitieve": "ln(x^2 + 1)",
          "domein": [-2, 2],
          "grenzen": [0, 1],
          "waarde": "ln(2)"
        }
      ]
    }

`nummer`, `integrand` en `primitieve` moeten erbij. `domein` is het stuk van de
x-as waar de test kijkt (laat je het weg, dan is het `[-2.5, 2.5]`). `grenzen`
en `waarde` horen bij elkaar en zijn alleen voor bepaalde integralen; `waarde`
mag een getal zijn of een formule tussen aanhalingstekens.

Schrijf de formules zoals een rekenmachine ze leest: `*` voor maal (nooit
weglaten), `^` voor machten, `sqrt(x)`, `sin(x)`, `asin(x)`, `e^x`, `pi`. Voor
de natuurlijke logaritme schrijf je `ln(x)`. `log(...)` wordt geweigerd, want
dat betekent in de wiskundeles grondtal 10 en in de meeste software grondtal e;
bedoel je echt grondtal 10, schrijf dan `log10(x)`. Laat de integratieconstante
weg: `x^3`, niet `x^3 + C`.

`src/content/primitieven.test.ts` leest al die bestanden en rekent elke vraag
na: hij differentieert de primitieve naar x en vergelijkt die met de integrand
op dertien x-waarden in het domein (punten waar een van beide niet bestaat
slaat hij over, maar er moeten er minstens drie overblijven). Staan er grenzen
bij, dan rekent hij ook `F(b) − F(a)` uit en legt dat naast `waarde`. Klopt er
iets niet, dan noemt de melding het bestand, het vraagnummer en de x-waarde.

Deze test draait mee in `npm test` en dus in de verplichte controle **Tests**:
een rekenfout in een primitieve kan niet naar `main`.

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
