<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Regels voor agents (integraaloefenen.nl)

Deze repo is de live site integraaloefenen.nl, voor vwo-leerlingen. Hij draait op Cloudflare Workers via OpenNext.

## Werkwijze
- Werk nooit direct op `main`. Altijd een eigen tak en een pull request met `gh pr create`. Merge niet zelf.
- Draai voor elke pull request `npx tsc --noEmit` en `npx opennextjs-cloudflare build`. Beide moeten slagen.
- Houd elke pull request klein en bij één onderwerp. Zet in de beschrijving wat je hebt veranderd en hoe je het hebt gecontroleerd.

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
