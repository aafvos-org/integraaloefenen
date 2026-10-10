# K.1 Theorie A · Primitiveren en de kettingregel

Het eerste theorieblok van K.1: de kettingregel omgekeerd gebruiken. Theorie B
(toepassingen van de substitutiemethode, met $\tan$ en oneven machten van
$\sin$ en $\cos$) hoort hier niet bij.

De oefenvragen zijn eigen varianten in de stijl van het boek; de boekopgaven
zelf staan alleen lokaal in `content-bron/k1a.json`.

## 1. Waar het over gaat

Differentiëren met de kettingregel geeft $[F(g(x))]' = F'(g(x)) \cdot g'(x)$.
Omgekeerd: staat er in de integrand een **kern** $g(x)$ met ervóór een factor
die (op een constante na) gelijk is aan $g'(x)$, dan kun je primitiveren.

$$\int f(g)\,g'(x)\,\mathrm{d}x = \int f(g)\,\mathrm{d}g = F(g) + c$$

De hele truc zit in één regel: $g'(x)\,\mathrm{d}x = \mathrm{d}(g(x))$. Daarna
primitiveer je alleen nog de buitenkant naar de kern en schrijf je de kern
terug.

Twee dingen die in de stappen steeds terugkomen:

- **Past de factor?** $6x$ past bij de kern $x^{2} + 1$ (want $6x = 3 \cdot 2x$),
  maar niet bij de kern $x^{3} + 1$ (want $3x^{2}$ is geen constante maal $6x$).
- **De constante kloppend maken** mag altijd, een factor met $x$ naar voren
  halen nooit.

Letters: de kern heet $g$, nooit $u$ of $v$ — ook al gebruikt het boek daar
$u$ voor.

## 2. Het stappenplan

Elke vraag heeft precies vier stappen (`step_order` 0 t/m 3).

### Primitiveren met de omgekeerde kettingregel

0. Deel 2 van de driedeling. Wat is de buitenste schil: een macht, een wortel,
   een breuk, een e-macht, een $\ln$ of een sinus — en staat er een factor met
   $x$ vóór?
1. Kies de kern $g(x)$ en bereken $g'(x)$.
2. Maak de factor kloppend: schrijf hem als constante maal $g'(x)$ en gebruik
   $g'(x)\,\mathrm{d}x = \mathrm{d}(g(x))$.
3. Primitiveer de buitenkant naar de kern, schrijf de kern terug, zet $+ c$ en
   controleer door terug te differentiëren.

### Invullen met de d(…)-notatie

0. Deel 2, plus de regel $\mathrm{d}(G(x)) = G'(x)\,\mathrm{d}x$ omgekeerd
   gelezen.
1. Benoemen wat er vóór de $\mathrm{d}x$ staat: losse termen of een kern met
   een factor ervoor?
2. Primitiveren.
3. Antwoord opschrijven en controleren; een losse constante tussen de haakjes
   verandert niets.

### Voor welke a lukt het?

0. Deel 2, plus de eis: de factor vóór de kern moet een constante maal $g'(x)$
   zijn.
1. Kern en $g'(x)$.
2. Factor gelijkstellen aan constante maal $g'(x)$; daar volgt $a$ uit.
3. Primitiveren met die $a$, $+ c$, controleren.

### Oppervlakte en inhoud

0. Deel 1 van de driedeling: vertaal het verhaaltje naar een integraal
   (oppervlakte $\int_a^b f$, inhoud $\pi\int_a^b f^2$).
1. De integraal opschrijven (bij inhoud eerst kwadrateren) en de standaardvorm
   herkennen.
2. Deel 2: primitiveren met de omgekeerde kettingregel.
3. Grenzen invullen, en bij een $p$-vraag deel 3: de vergelijking exact
   oplossen.

## 3. Topics en clusters

Drie topics, zes clusters, 36 vragen: twee vragen per niveau per cluster.

| Topic | Categorie | Cluster | Wat het oefent |
| --- | --- | --- | --- |
| `k1a_kern_herkennen` | primitiveren | `k1a_differentiaal` | $\ldots\,\mathrm{d}x = \mathrm{d}(\ldots)$ invullen |
| | | `k1a_welke_a` | Voor welke $a$ past de factor bij $g'(x)$? |
| `k1a_primitiveren_ketting` | primitiveren | `k1a_macht_kern` | $g'(x) \cdot g^n$, ook met een breuk als macht |
| | | `k1a_wortel_breuk` | Wortels, $\frac{1}{g}$ met $\ln$, wortel in de noemer |
| | | `k1a_e_ln_gonio` | $e^{g}$, $\ln(g)$, $\sin$ en $\cos$, en $g = \ln(x)$ of $\cos(x)$ |
| `k1a_toepassingen` | toepassingen | `k1a_opp_inhoud` | Oppervlakte, inhoud bij wenteling, $p$ bepalen |

De topics staan achter die van K.0 B (`order_index` 4, 5 en 6).

## 4. Waar het staat

| Wat | Waar |
| --- | --- |
| Bron (boekopgaven, auteursrecht) | `content-bron/k1a.json` — alleen lokaal, niet in git |
| De vragen, voor het narekenen | `content/hoofdstuk-k/k1a.json` |
| Het bronscript | `scripts/k1a-content.ts` — `npx jiti scripts/k1a-content.ts` |
| De generator | `scripts/lib/stappenplan-content.ts`, `generateAdditiveMigration` |
| De migratie | `supabase/migrations/0035_k1a_kettingregel.sql` |

Net als bij K.0 B is het bronscript de enige plek waar de vragen staan; het
schrijft zowel het JSON-bestand als de migratie, zodat de databank niet uit de
pas kan lopen met wat `npm test` narekent.

De migratie voegt **alleen** rijen toe en mag twee keer draaien. De controle
aan het eind telt de stappen van de eigen topics, niet die van het hele
hoofdstuk — anders zou de controle van K.0 B stukgaan zodra er een blok bij
komt.
