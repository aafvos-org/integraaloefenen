# integraaloefenen.nl

Nederlandse wiskundesite waarop vwo-leerlingen **integreren en primitiveren**
oefenen (wiskunde B). Gebouwd met Next.js, Supabase en Gemini; draait op
Cloudflare Workers via OpenNext.

> **Lees eerst [`AGENTS.md`](./AGENTS.md).** Daar staan de afspraken die
> gelden: hoe je test, wat je niet zelf doet, en hoe de notatie en de
> driedeling van een opgave eruitzien. Die afspraken gaan voor op dit bestand.

Deze repo is in oktober 2026 afgesplitst van afgeleideoefenen.nl. Er zit nog
afgeleiden-code in die stap voor stap weggaat. De oude plannen staan in
[`docs/archief/`](./docs/archief/) (`PLANNING.md` en `idea.md`) en beschrijven
code die er niet meer is — volg ze niet.

---

## Tech stack

| Laag       | Technologie                                      |
|------------|--------------------------------------------------|
| Frontend   | Next.js 16 (App Router) + TypeScript + Tailwind 4 |
| Backend    | Route handlers en server actions in diezelfde app |
| Database   | Supabase (PostgreSQL + Auth), eigen project `IntegraalOefenen` |
| AI         | Google Gemini (nakijken van antwoorden)           |
| Wiskunde   | KaTeX                                             |
| Mail       | Resend                                            |
| Statistiek | PostHog                                           |
| Hosting    | Cloudflare Workers via OpenNext (`@opennextjs/cloudflare`) |

---

## Snelstart

### 1. Installeren

```bash
npm install
```

### 2. Sleutels klaarzetten

```bash
cp .env.local.example .env.local
```

In `.env.local.example` staat per sleutel waar je hem vandaan haalt en wat er
misgaat als hij leeg blijft. Om de site lokaal te zien heb je genoeg aan de
Supabase-sleutels; mail, Gemini en PostHog mogen leeg blijven.

`.env*` en `.dev.vars*` staan in `.gitignore` en blijven daar. Geheimen voor
de live site staan als Worker-secrets in Cloudflare, nooit in deze repo.

### 3. Dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Zelf controleren

Voor elke pull request moeten deze vier slagen:

```bash
npm run lint
npx tsc --noEmit
npm test
npx opennextjs-cloudflare build
```

Raak je iets aan dat een leerling ziet, draai dan ook de browsertests:

```bash
npx playwright install chromium
npx supabase start      # Docker moet draaien
npx supabase db reset   # zet de testleerling en het testhoofdstuk klaar
npm run test:e2e
```

Gebruik altijd `npm run test:e2e` en niet `npx playwright test`: het scriptje
`scripts/e2e.mjs` zoekt de sleutels van de lokale Supabase op, controleert dat
die écht lokaal is, en zet `AI_CHECK_MODE=stub` zodat er geen Gemini aan te
pas komt. Zie [`AGENTS.md`](./AGENTS.md) voor de details en voor wat je doet
als de poorten al bezet zijn.

---

## Scripts

| Commando                | Actie                                              |
|-------------------------|----------------------------------------------------|
| `npm run dev`           | Dev server                                         |
| `npm run build`         | Next.js-build (niet wat Cloudflare draait)         |
| `npm run lint`          | ESLint                                             |
| `npm run typecheck`     | `tsc --noEmit`                                     |
| `npm test`              | Vitest, één keer                                   |
| `npm run test:watch`    | Vitest, blijft meekijken                           |
| `npm run test:e2e`      | Playwright tegen lokale Supabase                   |
| `npm run cf:build`      | OpenNext-build voor Workers                        |
| `npm run cf:preview`    | Die build lokaal draaien in de Workers-omgeving    |
| `npm run cf-typegen`    | Types van de Cloudflare-omgeving bijwerken         |

`npm run cf:deploy` en `npm run cf:upload` staan er wel, maar die draai je
niet zelf — zie hieronder.

---

## Hoe iets live komt

1. Eigen tak vanaf de nieuwste `main`.
2. Pull request met `gh pr create`.
3. **Cloudflare Workers Builds** bouwt vanzelf bij elke pull request en zet er
   een voorbeeldversie op een `*.workers.dev`-adres bij. Die controle moet
   groen zijn.
4. Merge naar `main` → dezelfde build gaat live op integraaloefenen.nl.

Deployen met `wrangler` of `opennextjs-cloudflare deploy` doe je niet. Live
zetten gebeurt alleen via een merge naar `main`.

---

## Database

De oefenstof en het schema staan in [`supabase/migrations/`](./supabase/migrations/).
Lokaal zet je alles klaar met:

```bash
npx supabase start
npx supabase db reset   # draait de migraties + supabase/seed.sql
```

- [`supabase/seed.sql`](./supabase/seed.sql) is **alleen lokaal**: een vaste
  testleerling en een testhoofdstuk voor de browsertests. Draai dat bestand
  nooit op het echte project.
- Plak geen SQL met de hand in de Supabase SQL Editor van het echte project.
  Een wijziging aan het schema gaat via een migratie, en alleen nadat Aaf dat
  in de taak heeft goedgekeurd.
- `IntegraalOefenen` is een eigen Supabase-project (`oyevapifmenqjuklprws`) en
  wordt niet meer gedeeld met afgeleideoefenen.nl.

### De instellingen van het echte project

[`supabase/config.toml`](./supabase/config.toml) beschrijft standaard de
Supabase op je eigen computer. Wat op de echte site anders moet, staat onderaan
datzelfde bestand in `[remotes.production]` — nu: de mailserver van Resend aan,
en hoeveel mails er per uur de deur uit mogen. De CLI legt dat blok over de
waarden erboven heen zodra je met projectnummer `oyevapifmenqjuklprws` werkt;
lokaal gebeurt er niets mee.

Verander die instellingen daar, niet in het Supabase-dashboard — anders weet
niemand meer wat er staat. Kijken mag altijd:

```bash
npx supabase config diff --project-ref oyevapifmenqjuklprws   # alleen kijken
```

Schrijven doet `npx supabase config push`. Draai altijd eerst `config diff` en
lees elke regel. Gebruik nooit `--yes`. Zet `RESEND_API_KEY_INTEGRAAL` in je
omgeving voordat je pusht: zonder die sleutel gaat er een leeg wachtwoord naar
de mailserver en verstuurt de echte site geen mail meer.

Het blok is nog **niet** nagekeken tegen het dashboard. Hoeveel mails er nu per
uur mogen, hoe lang een bevestigingslink geldig is en of de teksten in
[`supabase/email-templates/`](./supabase/email-templates/) nog kloppen, laat
`npx supabase config pull --project-ref oyevapifmenqjuklprws --dry-run` zien
zonder iets aan te raken. Zolang dat niet gedaan is: niet pushen.

---

## Projectstructuur

```
.
├── AGENTS.md                  # De afspraken — lees dit eerst
├── wrangler.jsonc             # Cloudflare Worker-config
├── open-next.config.ts        # OpenNext-adapter
├── src/
│   ├── middleware.ts          # Edge-runtime, nodig voor Cloudflare
│   ├── app/
│   │   ├── [locale]/          # De pagina's die een leerling ziet
│   │   ├── admin/             # Beheer
│   │   └── api/               # Route handlers (nakijken, mail, webhooks)
│   ├── components/            # Gedeelde UI (header, math, toetsenbord)
│   ├── config/site.ts         # Welke site dit is
│   ├── content/               # Theorie en uitleg
│   └── lib/
│       ├── ai/                # Gemini + de stub voor tests
│       ├── practice/          # Vraagselectie, nakijken, voortgang
│       ├── email/             # Resend
│       └── supabase/          # Clients voor browser en server
├── supabase/
│   ├── migrations/            # Schema + oefenstof
│   ├── seed.sql               # Alleen lokaal
│   └── config.toml
├── e2e/                       # Playwright
└── scripts/                   # Hulpscripts (e2e, migratiewerk, mail)
```

Tests staan naast de code die ze controleren (`src/**/*.test.ts`).

---

## Licentie

Privéproject — nog geen open-source licentie toegevoegd.
