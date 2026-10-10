# K.3 Theorie C · De functie arcsin

Het derde en laatste theorieblok van K.3. Theorie A en B gingen over de inverse
van de tangens; hier komt de inverse van de sinus erbij, en daarmee de tweede
standaardvorm die je uit je hoofd moet kennen.

De oefenvragen zijn eigen varianten in de stijl van het boek; de boekopgaven
zelf staan alleen lokaal in `content-bron/k3c.json`.

## 1. Waar het over gaat

$\arcsin$ is de inverse van $\sin$ op $\left[-\tfrac{1}{2}\pi,
\tfrac{1}{2}\pi\right]$. Dus $D = [-1, 1]$ en $B = \left[-\tfrac{1}{2}\pi,
\tfrac{1}{2}\pi\right]$, en:

$$f(x) = \frac{1}{\sqrt{1 - x^{2}}} \ \text{geeft} \ F(x) = \arcsin(x) + c
\qquad
g(x) = \arcsin(x) \ \text{geeft} \ g'(x) = \frac{1}{\sqrt{1 - x^{2}}}$$

Net als bij $\arctan$ staat die standaardvorm zelden meteen klaar. Drie manieren
om hem tevoorschijn te halen:

**De kern aflezen.** Bij $\dfrac{1}{\sqrt{1 - (ax)^{2}}}$ is de kern $ax$, dus
primitiveer je alsof er $x$ staat en deel je daarna door $a$:

$$\frac{1}{\sqrt{1 - 16x^{2}}} = \frac{1}{\sqrt{1 - (4x)^{2}}}
\qquad\text{geeft}\qquad F(x) = \tfrac{1}{4}\arcsin(4x) + c$$

**Het getal buiten de wortel halen.** Bij $\dfrac{1}{\sqrt{a^{2} - x^{2}}}$ staat
er geen $1$ vooraan onder de wortel. Die haal je eruit:

$$\sqrt{9 - 4x^{2}} = 3\sqrt{1 - \left(\tfrac{2}{3}x\right)^{2}}$$

**Substitueren.** Staat onder de wortel $1$ min het kwadraat van iets anders dan
$x$, en staat de afgeleide daarvan in de teller, dan ben je er in één stap:
$\int \dfrac{g'}{\sqrt{1 - g^{2}}}\,\mathrm{d}x = \arcsin(g) + c$.

En er is nog een vierde soort, die uit K.2 komt: $\arcsin$ en $\arctan$ *zelf*
primitiveren. Dat kan niet rechtstreeks, maar wel met partieel integreren, door
er zelf een product van te maken met $h'(x) = 1$:

$$\int \arcsin(x)\,\mathrm{d}x = x\arcsin(x) + \sqrt{1 - x^{2}} + c$$

### Drie valkuilen

- **Het bereik.** $\arcsin$ komt altijd uit tussen $-\tfrac{1}{2}\pi$ en
  $\tfrac{1}{2}\pi$. Dus $\arcsin(x) = \tfrac{4}{5}\pi$ heeft geen oplossing, en
  $\arcsin\left(\sin\left(\tfrac{5}{6}\pi\right)\right)$ is $\tfrac{1}{6}\pi$ en
  niet $\tfrac{5}{6}\pi$.
- **Twee keer herschrijven.** Bij $\dfrac{6}{\sqrt{9 - 4x^{2}}}$ moet je én de
  $3$ buiten de wortel halen én achteraf door $a = \tfrac{2}{3}$ delen. Bij de
  kale vorm $\dfrac{1}{\sqrt{a^{2} - x^{2}}}$ vallen die twee factoren precies
  tegen elkaar weg — dat is geen toeval, maar wel iets om te controleren.
- **De teller blijft de baas.** $\dfrac{1}{\sqrt{1 - x^{2}}}$ wordt
  $\arcsin(x)$, maar $\dfrac{x}{\sqrt{1 - x^{2}}}$ wordt $-\sqrt{1 - x^{2}}$:
  staat er een $x$ in de teller, dan is het de kettingregel terug en geen
  arcsinus. Precies dat verschil maakt het partieel integreren van $\arcsin$
  mogelijk.

## 2. Het stappenplan

Elke vraag heeft precies vier stappen (`step_order` 0 t/m 3).

### De functie zelf (waarden en vergelijkingen)

0. Deel 3 van de driedeling: er staat geen integraal in, alleen de betekenis van
   $\arcsin$.
1. Wat $\arcsin$ betekent, en wat de vraag dus precies vraagt.
2. De tabel met sinuswaarden, of: sinus nemen aan beide kanten.
3. Het antwoord, met de controle of het in $[-1, 1]$ respectievelijk
   $\left[-\tfrac{1}{2}\pi, \tfrac{1}{2}\pi\right]$ past.

### Primitiveren

0. Deel 2. Welke schil staat er: de kern meteen zichtbaar, een getal onder de
   wortel, of een substitutie?
1. Herschrijven: kern aflezen, het getal buiten de wortel halen, of $g$ kiezen.
2. De standaardvorm toepassen, inclusief het delen door $a$ uit de kern.
3. Het antwoord met $+c$, en controleren door terug te differentiëren.

### Partieel integreren

0. Deel 2, met de schil: een kale $\arcsin$ of $\arctan$ → partieel integreren
   met $h'(x) = 1$.
1. $g$ en $h$ kiezen, en $g'$ met de kettingregel.
2. De regel invullen; er blijft een makkelijkere integraal over.
3. Die integraal uitrekenen en alles samenvoegen.

### Bepaalde integralen en vlakdelen

Hetzelfde als in Theorie B: bij een bepaalde integraal eerst primitiveren en dan
pas de grenzen invullen, en bij een vlakdeel spelen alle drie de delen van de
driedeling (verhaaltje → integraal → uitkomst of de waarde van $p$).

## 3. Topics en clusters

Vier topics, zeven clusters, 26 vragen.

| Topic | Categorie | Cluster | Wat het oefent |
| --- | --- | --- | --- |
| `k3c_arcsinus` | vergelijkingen | `k3c_waarden` | $\arcsin\left(\tfrac{1}{2}\sqrt{3}\right)$, sommen van twee waarden, $\arcsin(\sin(\ldots))$ |
| | | `k3c_vergelijking` | $\arcsin(x) = \tfrac{1}{6}\pi$, geen oplossing, een kern, een kwadraat |
| `k3c_primitiveren` | primitiveren | `k3c_standaard` | $\dfrac{3}{\sqrt{1 - x^{2}}}$, $\dfrac{1}{\sqrt{1 - 16x^{2}}}$, $\dfrac{1}{\sqrt{4 - x^{2}}}$, $\dfrac{6}{\sqrt{9 - 4x^{2}}}$, kwadraatafsplitsen |
| | | `k3c_kern` | $\dfrac{2x}{\sqrt{1 - x^{4}}}$, $\dfrac{\mathrm{e}^{x}}{\sqrt{1 - \mathrm{e}^{2x}}}$, $\dfrac{\arcsin^{2}(x)}{\sqrt{1 - x^{2}}}$, $\dfrac{1}{x\sqrt{4 - \ln^{2}(x)}}$ |
| | | `k3c_partieel` | $\arcsin(2x)$, $\arctan(3x)$, $\int_{0}^{1}\arcsin(x)\,\mathrm{d}x$ |
| `k3c_bepaald` | integralen | `k3c_bepaald_exact` | Uitkomsten $\tfrac{1}{4}\pi$, $\tfrac{1}{12}\pi$, $\tfrac{1}{3}\pi$, $\tfrac{1}{12}\pi$ |
| `k3c_toepassing` | toepassingen | `k3c_oppervlakte` | Oppervlakte van $V$, en de waarde van $p$ bij $O(V_p) = \pi$ |

De topics staan achter die van K.3 B (`order_index` 23 t/m 26).

Het kader over $\arccos$ op bladzijde 205 is in het boek informatief en hoort
niet bij de verplichte stof; daar zitten hier dus geen vragen over.

## 4. Waar het staat

| Wat | Waar |
| --- | --- |
| Bron (boekopgaven, auteursrecht) | `content-bron/k3c.json` — alleen lokaal, niet in git |
| De vragen, voor het narekenen | `content/hoofdstuk-k/k3c.json` |
| Het bronscript | `scripts/k3c-content.ts` — `npx jiti scripts/k3c-content.ts` |
| De generator | `scripts/lib/stappenplan-content.ts`, `generateAdditiveMigration` |
| De migratie | `supabase/migrations/0042_k3c_arcsinus.sql` |

Net als bij de eerdere blokken is het bronscript de enige plek waar de vragen
staan; het schrijft zowel het JSON-bestand als de migratie. De migratie voegt
**alleen** rijen toe en mag twee keer draaien; de controle aan het eind telt de
stappen van de eigen vier topics, niet die van het hele hoofdstuk.

### Zeven vragen zonder integraal

De clusters `k3c_waarden` en `k3c_vergelijking` gaan over de functie zelf. Daar
valt niets te primitiveren, dus die zeven vragen hebben geen `integrand` en
`primitieve` en staan niet in `content/hoofdstuk-k/k3c.json`. Hun antwoorden
zijn met de hand nagerekend; de stappen laten dat narekenen zien.

### Overal een eigen domein

$\arcsin$ en $\sqrt{1 - x^{2}}$ bestaan alleen op $[-1, 1]$, en het
standaarddomein van `src/content/primitieven.test.ts` is $[-2{,}5;\ 2{,}5]$.
Daarom heeft élke vraag met een integraal een eigen `domein`, passend bij waar
de functie bestaat: $[-0{,}9;\ 0{,}9]$ bij de kale vorm, $[-0{,}2;\ 0{,}2]$ bij
$\sqrt{1 - 16x^{2}}$, $[1{,}2;\ 2{,}8]$ bij de kwadraatafgesplitste vorm,
$[-3; -0{,}2]$ bij de e-macht (die moet onder de $1$ blijven) en $[0{,}3;\ 6]$
bij de logaritme.

Bij `pt-3` ligt de bovengrens $x = 1$ buiten dat domein. Dat mag: het domein is
alleen voor het narekenen van de afgeleide, en in de primitieve
$x\arcsin(x) + \sqrt{1 - x^{2}}$ bestaat $x = 1$ wél — daar is de wortel gewoon
$0$.

### Waar `p` in het antwoord staat

Bij `op-3` is de bovengrens een letter, dus er is niets in te vullen: die vraag
heeft wel een `integrand` en een `primitieve` (die worden nagerekend) maar geen
`grenzen` en `waarde`.
