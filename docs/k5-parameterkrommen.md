# K.5 · Integralen bij parameterkrommen

Twee theorieblokken. Het antwoord is een oppervlakte of een inhoud, een exact
getal. De parameter heet `t` in de opgave. In `content/` heet die parameter `x`,
omdat de rekentest naar `x` differentieert.

De oefenvragen zijn eigen varianten. De boekopgaven staan alleen lokaal in
`content-bron/k5a.json` en `content-bron/k5b.json`.

## 1. Waar het over gaat

**Theorie A.** Een vlakdeel tussen een kromme en een as (of beide assen).

- Oppervlakte: $\int y\,\mathrm{d}x$ van links naar rechts, of $\int x\,\mathrm{d}y$
  van onder naar boven. Staat de kromme aan de verkeerde kant van de as, dan
  is die integraal negatief en neem je het tegengestelde.
- Inhoud: $\pi\int y^{2}\,\mathrm{d}x$ om de $x$-as, $\pi\int x^{2}\,\mathrm{d}y$
  om de $y$-as.

**Theorie B.** De kromme sluit zelf een vlakdeel in.

- Positieve richting: oppervlakte $\int x\,\mathrm{d}y$.
- Twee even grote lussen tel je bij elkaar op.
- Inhoud: dezelfde wentelformule, langs de helft die de straal geeft.

## 2. Het stappenplan

Vier stappen.

0. Deel 1. Welke integraal hoort bij dit vlakdeel, en welke kant loopt `t` op.
1. Schrijf de integraal in `t`.
2. Zoek een primitieve.
3. Vul de grenzen in. Het antwoord blijft exact.

## 3. Topics en clusters

Twee blokken, vier topics, vier clusters, 32 vragen. Acht per cluster.

| Blok | Topic | Cluster | Wat het oefent |
| --- | --- | --- | --- |
| A | `k5a_oppervlakte` | `k5a_oppervlakte` | Oppervlakte met de assen |
| A | `k5a_inhoud` | `k5a_inhoud` | Wentelen om een as |
| B | `k5b_oppervlakte` | `k5b_oppervlakte` | Oppervlakte van een omsloten vlakdeel |
| B | `k5b_inhoud` | `k5b_inhoud` | Inhoud van een omwentelingslichaam |

De topics staan achter die van K.4 B (`order_index` 33 t/m 36).

Bewijzen uit het boek (de rekenregels zelf afleiden) zijn geen intikvraag.
Die staan niet als variant op de site.

## 4. Waar het staat

| Wat | Waar |
| --- | --- |
| Bron (niet in git) | `content-bron/k5a.json`, `content-bron/k5b.json` |
| De vragen | `content/hoofdstuk-k/k5.json` |
| Het bronscript | `scripts/k5-content.ts` |
| De migratie | `supabase/migrations/0053_k5_parameterkrommen.sql` |

Alleen rijen toevoegen. De koppeling naar theorieblok `k5a` of `k5b` wordt
alleen gezet als die er nog niet staat.
