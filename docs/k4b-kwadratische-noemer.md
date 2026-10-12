# K.4 Theorie B · Primitieven bij een kwadratische noemer

Tweede theorieblok van K.4. De discriminant van de noemer kiest de route.

De oefenvragen zijn eigen varianten. De boekopgaven staan alleen lokaal in
`content-bron/k4b.json`.

## 1. Waar het over gaat

Schrijf de breuk eerst zo dat de teller een lineaire functie is (een langere
teller deel je eerst weg, zoals in Theorie A). Daarna:

- **$D < 0$.** Teller = veelvoud van de afgeleide van de noemer, plus een
  constante. Het eerste stuk geeft $\ln|g|$, het tweede een arctangens nadat
  je de noemer als $(x - p)^{2} + q$ schrijft.
- **$D = 0$.** De noemer is $(x - p)^{2}$. Er komt $\ln|x - p|$ uit en een
  breuk $\dfrac{1}{x - p}$.
- **$D > 0$.** Ontbind in twee lineaire factoren en splits. Twee logaritmen.

## 2. Het stappenplan

Vier stappen, net als in de rest van hoofdstuk K.

0. Deel 2. Noem de discriminant en dus welke van de drie routes het is.
1. De splitsing.
2. Primitiveer de stukken.
3. Antwoord met $+ c$, of bij een bepaalde integraal de grenzen invullen.

Bij een vlakdeel komen daar het verhaaltje en de uitkomst of de waarde van $p$
bij. Eén vraag is een omwentelingsinhoud: eerst kwadrateren, dan integreren.

## 3. Topics en clusters

Drie topics, vijf clusters, 40 vragen. Acht per cluster.

| Topic | Cluster | Wat het oefent |
| --- | --- | --- |
| `k4b_primitiveren` | `k4b_negatief` | Logaritme plus arctangens |
| | `k4b_nul` | Logaritme plus een breuk met een kwadraat in de noemer |
| | `k4b_positief` | Twee logaritmen |
| `k4b_bepaald` | `k4b_bepaald` | Van alle drie de gevallen een bepaalde integraal |
| `k4b_toepassing` | `k4b_oppervlakte` | Oppervlakte, twee keer $p$, en één inhoud |

De topics staan achter die van K.4 A (`order_index` 30 t/m 32).

Extremen, ongelijkheden en raaklijnen uit het boek zijn geen integraal. Het
integralenstuk van die opgaven zit in de vlakdelen.

## 4. Waar het staat

| Wat | Waar |
| --- | --- |
| Bron (niet in git) | `content-bron/k4b.json` |
| De vragen | `content/hoofdstuk-k/k4b.json` |
| Het bronscript | `scripts/k4b-content.ts` |
| De migratie | `supabase/migrations/0052_k4b_kwadratische_noemer.sql` |

Zelfde afspraak als bij Theorie A: alleen rijen toevoegen, en de koppeling naar
theorieblok `k4b` alleen zetten als die er nog niet staat.
