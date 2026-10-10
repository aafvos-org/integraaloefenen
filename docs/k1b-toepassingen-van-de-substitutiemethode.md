# K.1 Theorie B · Toepassingen van de substitutiemethode

Het tweede theorieblok van K.1. Waar Theorie B zich van
[Theorie A](k1a-primitiveren-en-de-kettingregel.md) onderscheidt: daar stond de
kern met zijn afgeleide al kant-en-klaar in de integrand, hier moet je éérst
herschrijven voordat je ze ziet staan.

De oefenvragen zijn eigen varianten in de stijl van het boek; de boekopgaven
zelf staan alleen lokaal in `content-bron/k1b.json`.

## 1. Waar het over gaat

Drie manieren om de kern tevoorschijn te halen:

1. **Een tangens of een gonio-breuk.** Schrijf $\tan = \dfrac{\sin}{\cos}$. De
   ene gonio is de kern, de andere staat er (op een teken na) als afgeleide
   bij: $\sin(x)\,\mathrm{d}x = -\mathrm{d}(\cos(x))$ en
   $\cos(x)\,\mathrm{d}x = \mathrm{d}(\sin(x))$. Zo wordt
   $\int \tan(x)\,\mathrm{d}x = -\ln|\cos(x)| + c$.

2. **Een oneven macht van een sinus of cosinus.** Splits één factor af en
   herschrijf de rest met $\sin^{2} + \cos^{2} = 1$. Die ene losse factor is
   precies de afgeleide die je nodig hebt:
   $\cos^{3}(x) = \left(1 - \sin^{2}(x)\right)\cos(x)$.

3. **Een wortel met een losse $x$ ervoor.** De afgeleide van $x + a$ is $1$, dus
   de omgekeerde kettingregel helpt niet. Stel dan de hele wortel gelijk aan een
   nieuwe variabele: $g = \sqrt{x + a}$, dus $x = g^{2} - a$ en
   $\mathrm{d}x = 2g\,\mathrm{d}g$. Je controleert je werk door te kijken of er
   écht geen $x$ meer in de integraal staat.

Bij een **bepaalde** integraal gaan de grenzen mee naar $g$: bij $x = a$ hoort
$g = g(a)$. Dat scheelt het terugschrijven aan het eind.

Letters: de kern en de nieuwe variabele heten $g$, nooit $u$ of $v$ — ook al
gebruikt het boek daar $u$ voor.

## 2. Het stappenplan

Elke vraag heeft precies vier stappen (`step_order` 0 t/m 3).

### Primitiveren met de substitutiemethode

0. Deel 2 van de driedeling. Welke buitenste schil staat er — een tangens, een
   gonio-breuk, een oneven macht?
1. Herschrijven tot er een kern met zijn afgeleide staat.
2. De kern kiezen, $g'(x)$ bepalen en overgaan op $\mathrm{d}g$.
3. Primitiveren naar de kern, terugschrijven, $+ c$, en controleren door terug
   te differentiëren.

### Bepaalde integralen

0. Deel 2, plus: het is een bepaalde integraal, dus de grenzen komen nog.
1. De kern kiezen en $g'(x)$ bepalen.
2. De grenzen omzetten naar $g$.
3. Primitiveren en invullen; exact laten staan.

### De substitutie wortel(x + a) = g

0. Deel 2, plus de reden dat de omgekeerde kettingregel hier niet werkt: de
   afgeleide van wat onder de wortel staat is $1$.
1. Kwadrateren: $x$ uitdrukken in $g$, en $\mathrm{d}x$ en de grenzen meenemen.
2. De hele integraal omschrijven tot alleen nog machten van $g$.
3. Primitiveren en de grenzen in $g$ invullen.

### Oppervlakte en p bepalen

0. Deel 1 van de driedeling: vertaal het verhaaltje naar een integraal, inclusief
   de snijpunten met de $x$-as of met de andere grafiek.
1. De standaardvorm herkennen.
2. Deel 2: primitiveren met de substitutiemethode.
3. Grenzen invullen, en bij een $p$-vraag deel 3: de vergelijking exact
   oplossen.

## 3. Topics en clusters

Drie topics, zes clusters, 36 vragen: twee vragen per niveau per cluster.

| Topic | Categorie | Cluster | Wat het oefent |
| --- | --- | --- | --- |
| `k1b_gonio` | primitiveren | `k1b_tangens` | $\tan(ax)$ en breuken met $\sin$ en $\cos$ |
| | | `k1b_oneven_macht` | $\cos^{3}$, $\sin^{3}(2x)$, $\cos^{5}$, $\sin^{3}\cos^{2}$ |
| `k1b_bepaald` | integralen | `k1b_grenzen_gonio` | Grenzen omzetten bij gonio |
| | | `k1b_grenzen_ln_e` | Grenzen omzetten bij $\ln$ en $\mathrm{e}$ |
| | | `k1b_wortelsubstitutie` | $\sqrt{x + a} = g$, ook met $\sqrt{2x + a}$ en $\sqrt{x - a}$ |
| `k1b_toepassingen` | toepassingen | `k1b_opp_p` | Oppervlakte, oppervlakte tussen twee grafieken, $p$ bepalen |

De topics staan achter die van K.1 A (`order_index` 7, 8 en 9).

## 4. Waar het staat

| Wat | Waar |
| --- | --- |
| Bron (boekopgaven, auteursrecht) | `content-bron/k1b.json` — alleen lokaal, niet in git |
| De vragen, voor het narekenen | `content/hoofdstuk-k/k1b.json` |
| Het bronscript | `scripts/k1b-content.ts` — `npx jiti scripts/k1b-content.ts` |
| De generator | `scripts/lib/stappenplan-content.ts`, `generateAdditiveMigration` |
| De migratie | `supabase/migrations/0036_k1b_substitutiemethode.sql` |

Net als bij K.1 A is het bronscript de enige plek waar de vragen staan; het
schrijft zowel het JSON-bestand als de migratie, zodat de databank niet uit de
pas kan lopen met wat `npm test` narekent.

De migratie voegt **alleen** rijen toe en mag twee keer draaien. De controle aan
het eind telt de stappen van de eigen topics, niet die van het hele hoofdstuk.

### Grenzen in het JSON-bestand

`src/content/primitieven.test.ts` wil in `grenzen` gewone getallen zien, dus
daar staat $\tfrac{1}{4}\pi$ als `0.7853981633974483`. In de opgave zelf en in
de stappen blijft de grens natuurlijk exact.
