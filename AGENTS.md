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
- Geen bestanden in `supabase/migrations/` toevoegen of aanpassen. De database wordt gedeeld met afgeleideoefenen.nl; vraag het eerst in de taak.
- Niet deployen met `wrangler` of `opennextjs-cloudflare deploy`. Live zetten gebeurt alleen via een merge naar `main`.
- Geen geheimen in code, configuratie of pull requests. `.env*` en `.dev.vars` blijven buiten git.
- Geen nieuwe npm-pakketten zonder het eerst in de taak te vragen.

## Inhoud
- Alle tekst op de site in het Nederlands.
- Letters f, g en h voor functies, nooit u of v.
- `middleware.ts` blijft `middleware.ts`: de edge-runtime is nodig voor Cloudflare. Niet omzetten naar `proxy.ts`.
