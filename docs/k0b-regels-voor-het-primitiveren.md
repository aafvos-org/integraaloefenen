# K.0 Theorie B · Regels voor het primitiveren

Het voorkennisblok van hoofdstuk K waar alle andere blokken op leunen: de
standaardprimitieven en de regel voor $f(ax + b)$. Theorieblok A van de
voorkennis (regels voor het differentiëren) hoort hier niet bij — dat is
afgeleiden-stof.

De oefenvragen zijn eigen varianten in de stijl van het boek; de boekopgaven
zelf staan alleen lokaal in `content-bron/k0b.json`.

## 1. Waar het over gaat

Twee dingen moet een leerling hier kunnen.

**De standaardprimitieven**, elk in één richting te leren:

| $f(x)$ | $F(x)$ |
| --- | --- |
| $ax^n$ ($n \neq -1$) | $a \cdot \dfrac{1}{n+1}x^{n+1} + c$ |
| $e^x$ | $e^x + c$ |
| $g^x$ | $\dfrac{g^x}{\ln(g)} + c$ |
| $\dfrac{1}{x}$ | $\ln\|x\| + c$ |
| $\ln(x)$ | $x\ln(x) - x + c$ |
| $^g\!\log(x)$ | $\dfrac{1}{\ln(g)}\big(x\ln(x) - x\big) + c$ |
| $\sin(x)$ | $-\cos(x) + c$ |
| $\cos(x)$ | $\sin(x) + c$ |

**De regel voor een lineaire kern:** de primitieven van $f(ax + b)$ zijn
$\dfrac{1}{a}F(ax + b) + c$. Alleen de $a$ telt; de $b$ doet niets met de
factor.

Twee valkuilen die in de stappen expliciet benoemd worden:

- $\dfrac{1}{x}$ valt buiten de machtsregel ($n = -1$) en geeft $\ln|x|$.
- Er is geen quotiëntregel voor primitiveren: een breuk met één term in de
  noemer deel je eerst uit.

## 2. Het stappenplan

Elke vraag heeft precies vier stappen (`step_order` 0 t/m 3). Van de
driedeling speelt bij deze opgaven alleen **deel 2**: bereken de goede
integraal. Stap 0 zegt dat ook, zodat de leerling de indeling blijft zien.

### Primitiveren met een standaardprimitieve

0. Deel 2 van de driedeling. Wat is de buitenste schil: losse termen, een
   breuk om uit te delen, haakjes om uit te werken?
1. Herschrijf tot standaardvormen (wortels en breuken als macht, $\ln$-regels,
   machten uitdelen).
2. Pas per term de standaardprimitieve toe, met de regel erbij genoemd.
3. Schrijf $F(x) + c$ op en controleer door terug te differentiëren.

### Primitiveren met kern $ax + b$

0. Deel 2 van de driedeling, plus de regel: $f(ax + b)$ geeft
   $\frac{1}{a}F(ax + b) + c$.
1. Buitenkant en kern benoemen, en daarmee de $a$.
2. Primitiveer alleen de buitenkant, met de kern erin.
3. Deel door $a$, schrijf $+ c$ en controleer: de kettingregel moet de factor
   $a$ weer teruggeven.

### Bereken exact

0. Deel 2 van de driedeling: eerst primitiveren, dan de grenzen invullen. Het
   antwoord blijft exact.
1. Herken of herschrijf de standaardvorm (en de kern, als die er is).
2. Primitiveer; de integratieconstante laat je weg, die valt bij het aftrekken
   weg.
3. $\big[F(x)\big]_a^b = F(b) - F(a)$, uitgewerkt tot het exacte antwoord.

## 3. Topics en clusters

Drie topics, zeven clusters, 44 vragen. Elk cluster heeft twee vragen per
niveau (het cluster met bepaalde integralen heeft acht vragen).

| Topic | Categorie | Cluster | Wat het oefent |
| --- | --- | --- | --- |
| `k0b_standaardprimitieven` | primitiveren | `k0b_machten_gonio` | Machten, breuken uitdelen, wortels, $\sin$ en $\cos$ |
| | | `k0b_exponenten` | $e^x$ en $g^x$, ook breuken met machten |
| | | `k0b_logaritmen` | $\ln(x)$, $\log(x)$ met grondtal 10, eerst de $\ln$-regels |
| `k0b_lineaire_kern` | primitiveren | `k0b_lin_e_gonio` | $e^{ax+b}$, $\sin(ax+b)$, $\cos(ax+b)$ |
| | | `k0b_lin_breuk_wortel` | $\frac{1}{ax+b}$, $(ax+b)^n$, wortels |
| | | `k0b_lin_exp_ln` | $g^{ax+b}$ en $\ln(ax+b)$ |
| `k0b_bepaalde_integralen` | integralen | `k0b_bepaald_exact` | Bereken exact, met alle regels hierboven |

## 4. Waar het staat

| Wat | Waar |
| --- | --- |
| Bron (boekopgaven, auteursrecht) | `content-bron/k0b.json` — alleen lokaal, niet in git |
| De vragen, voor het narekenen | `content/hoofdstuk-k/k0b.json` |
| Het bronscript | `scripts/k0b-content.ts` — `npx jiti scripts/k0b-content.ts` |
| De generator | `scripts/lib/stappenplan-content.ts`, `generateAdditiveMigration` |
| De migratie | `supabase/migrations/0034_k0b_primitiveren.sql` |

`scripts/k0b-content.ts` is de enige plek waar de vragen staan; het schrijft
zowel het JSON-bestand als de migratie. Zo kan de databank niet uit de pas
lopen met wat `npm test` narekent.

De migratie voegt **alleen** rijen toe: hoofdstuk, topics en clusters via
`ON CONFLICT DO NOTHING`, vragen via `WHERE NOT EXISTS` op (cluster,
`latex_body`) en stappen via `ON CONFLICT (question_id, step_order)`. Twee keer
draaien voegt niets dubbel toe. Er staat geen `DELETE`, `DROP`, `ALTER` of
`UPDATE` in.
