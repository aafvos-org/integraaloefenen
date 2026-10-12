# K.4 Theorie A · Staartdelingen

Eerste theorieblok van K.4. De teller is minstens even lang als de lineaire
noemer. Eerst delen, daarna is de rest een logaritme.

De oefenvragen zijn eigen varianten. De boekopgaven staan alleen lokaal in
`content-bron/k4a.json`.

## 1. Waar het over gaat

$$\frac{p(x)}{ax + b} = q(x) + \frac{k}{ax + b}
\qquad\text{geeft}\qquad
F(x) = Q(x) + \frac{k}{a}\ln|ax + b| + c$$

Bij een rest van nul (een factor die wegvalt) blijft alleen het polynoom over.

## 2. Het stappenplan

Elke vraag heeft precies vier stappen.

### Primitiveren

0. Deel 2. Schil: lineaire noemer, teller minstens even lang → staartdeling.
1. De deling: polynoom plus restbreuk.
2. Primitiveer de stukken. Bij $ax + b$ in de noemer nog delen door $a$.
3. Het antwoord met $+ c$, en controleren door terug te differentiëren.

### Bepaalde integralen en vlakdelen

Eerst dezelfde deling, dan de grenzen. Bij een vlakdeel spelen alle drie de
delen: verhaaltje → integraal → uitkomst of de waarde van $p$.

## 3. Topics en clusters

Drie topics, drie clusters, 24 vragen. Acht per cluster.

| Topic | Cluster | Wat het oefent |
| --- | --- | --- |
| `k4a_primitiveren` | `k4a_staart` | Lineaire, kwadratische en derdegraads teller |
| `k4a_bepaald` | `k4a_bepaald` | Exacte uitkomsten, onder andere $4\ln 2$ en $\tfrac{4}{3} - \ln 2$ |
| `k4a_toepassing` | `k4a_oppervlakte` | Oppervlakte, en twee keer de waarde van $p$ |

De topics staan achter die van K.3 C (`order_index` 27 t/m 29).

Raaklijnvragen uit het boek horen bij differentiëren. Hier zit alleen het
integralenstuk van die opgaven: de oppervlakte.

## 4. Waar het staat

| Wat | Waar |
| --- | --- |
| Bron (niet in git) | `content-bron/k4a.json` |
| De vragen | `content/hoofdstuk-k/k4a.json` |
| Het bronscript | `scripts/k4a-content.ts` |
| De migratie | `supabase/migrations/0051_k4a_staartdelingen.sql` |

De migratie voegt alleen rijen toe. De enige wijziging aan een bestaande kolom
zet `theory_block_id` op de drie nieuwe topics, en alleen als die koppeling er
nog niet staat. Paragraaf `k4` en theorieblok `k4a` horen erbij, zodat het blok
in de zijbalk onder K.4 staat.
