# K.2 Theorie B · Herhaald partieel integreren

Het tweede theorieblok van K.2. In
[Theorie A](k2a-primitiveren-en-de-productregel.md) integreerde je **één keer**
partieel; hier doe je het **twee keer achter elkaar**.

De oefenvragen zijn eigen varianten in de stijl van het boek; de boekopgaven
zelf staan alleen lokaal in `content-bron/k2b.json`.

## 1. Waar het over gaat

De regel is dezelfde als in Theorie A:

$$\int g(x) \cdot h'(x)\,\mathrm{d}x = g(x) \cdot h(x) - \int h(x) \cdot g'(x)\,\mathrm{d}x$$

Nieuw is dat één ronde niet genoeg is. Dat gebeurt in drie gedaanten.

### Gedaante 1 · de veelterm is van graad 2

Differentiëren haalt de graad van een veelterm één omlaag. Bij
$\int x\mathrm{e}^{x}\,\mathrm{d}x$ ben je daarom na één ronde klaar, maar bij
$\int x^{2}\mathrm{e}^{x}\,\mathrm{d}x$ staat er daarna nog
$\int 2x\mathrm{e}^{x}\,\mathrm{d}x$ — weer een product, maar wel een
eenvoudiger. Nog een ronde met dezelfde keuze en je bent er.

Van graad 2 naar graad 0 zijn dat dus twee rondes. Kies in de tweede ronde
dezelfde soort factor als in de eerste: steeds de gonio of de e-macht
primitiveren, steeds de veelterm differentiëren.

### Gedaante 2 · de integraal komt terug

Bij $\int \mathrm{e}^{x}\sin(x)\,\mathrm{d}x$ wordt geen van beide factoren
eenvoudiger — dit loopt niet vanzelf af. Doe toch twee rondes: dan staat de
oorspronkelijke integraal er rechts weer. Noem hem $I$ en los op als een
vergelijking:

$$I = \mathrm{e}^{x}\sin(x) - \mathrm{e}^{x}\cos(x) - I \;\Longrightarrow\; 2I = \mathrm{e}^{x}\left(\sin(x) - \cos(x)\right)$$

Twee valkuilen:

- **Draai de keuze niet om.** Primitiveer je in de eerste ronde de e-macht en in
  de tweede ronde de gonio, dan maak je de eerste ronde precies ongedaan en
  staat er $I = I$. Houd dezelfde factor vol.
- **Let op de factoren die blijven staan.** Een $\mathrm{e}^{2x}$ levert elke
  ronde een $\tfrac{1}{2}$ op en een $\cos(2x)$ elke ronde een $2$. Daardoor
  komt $I$ niet altijd met $-1$ terug: bij $\mathrm{e}^{x}\cos(2x)$ staat er
  $-4I$ en blijft er $5I$ over, bij $\mathrm{e}^{3x}\cos(2x)$ wordt het
  $\tfrac{13}{9}I$.

### Gedaante 3 · een macht van de logaritme

Bij $\int \ln^{2}(x)\,\mathrm{d}x$ staat er maar één factor. Maak er zelf een
product van: een logaritme kun je niet zomaar primitiveren, maar wél
differentiëren, dus kies $h'(x) = 1$ en zet de logaritme op de plek van $g$.
Differentiëren haalt de macht dan per ronde één omlaag:

$$\int \ln^{2}(x)\,\mathrm{d}x = x\ln^{2}(x) - 2\int \ln(x)\,\mathrm{d}x = x\ln^{2}(x) - 2x\ln(x) + 2x + c$$

Van $\ln^{2}$ naar $\ln^{1}$ naar $\ln^{0}$ zijn dat twee rondes; bij
$\ln^{3}(x)$ zijn het er drie. Staat er een macht van $x$ vóór de logaritme,
dan is díe de makkelijke factor: neem $h'(x) = x^{n}$ en laat de logaritme weer
het werk doen bij $g$. De $x$ in de noemer van $g'$ valt dan steeds weg tegen de
$x$ uit $h$, en dat is precies waarom deze gedaante afloopt.

Letters: de twee factoren heten $g$ en $h'$, nooit $u$ en $v$ — ook al gebruikt
het boek daar $f$ en $g'$ voor.

## 2. Het stappenplan

Elke vraag heeft precies vier stappen (`step_order` 0 t/m 3).

### Primitiveren met twee rondes

0. Deel 2 van de driedeling. Welke buitenste schil staat er — een veelterm van
   graad 2 maal een gonio of een e-macht (gedaante 1), of een e-macht maal een
   gonio (gedaante 2)? Zo nodig eerst herschrijven, bijvoorbeeld
   $\dfrac{x^{2}}{\mathrm{e}^{3x}} \to x^{2}\mathrm{e}^{-3x}$.
1. $g$ en $h'$ kiezen en $h$ en $g'$ bepalen.
2. De eerste ronde invullen en opschrijven welke integraal er overblijft.
3. De tweede ronde doen: bij gedaante 1 gewoon uitrekenen, bij gedaante 2 $I$
   naar één kant halen en delen. Dan $+ c$ erbij en controleren door terug te
   differentiëren.

### Bepaalde integralen

0. Deel 2, plus: eerst primitiveren en pas daarna de grenzen invullen.
1. $g$ en $h'$ kiezen.
2. De twee rondes doen en de primitieve opschrijven.
3. Grenzen invullen; exact laten staan. Let bij een dubbele hoek op dat
   $x = \tfrac{1}{4}\pi$ in $\cos(2x)$ de hoek $\tfrac{1}{2}\pi$ oplevert.

### Oppervlakte en p bepalen

0. Deel 1 van de driedeling: vertaal het verhaaltje naar een integraal, inclusief
   de snijpunten met de $x$-as en de vraag of de grafiek er boven of onder ligt.
1. De vorm herkennen en $g$ en $h'$ kiezen.
2. Deel 2: twee rondes tot de primitieve.
3. Grenzen invullen, en bij een $p$-vraag deel 3: de vergelijking exact
   oplossen.

## 3. Topics en clusters

Vier topics, acht clusters, 48 vragen: twee vragen per niveau per cluster.

| Topic | Categorie | Cluster | Wat het oefent |
| --- | --- | --- | --- |
| `k2b_herhaald` | primitiveren | `k2b_kwadraat_gonio` | $x^{2}\sin(x)$, $x^{2}\cos(3x)$, $\left(x^{2}-x\right)\sin(2x)$ |
| | | `k2b_kwadraat_e` | $x^{2}\mathrm{e}^{x}$, $3x^{2}\mathrm{e}^{-x}$, $\dfrac{x^{2}}{\mathrm{e}^{3x}}$ |
| | | `k2b_terugkomen` | $\mathrm{e}^{x}\sin(x)$, $\mathrm{e}^{x}\cos(2x)$, $\mathrm{e}^{3x}\cos(2x)$ |
| `k2b_bepaald` | integralen | `k2b_bepaald_kwadraat` | Exacte uitkomsten met $\pi^{2}$ en $\mathrm{e}$ |
| | | `k2b_bepaald_terugkomen` | Grenzen $0$, $\tfrac{1}{4}\pi$, $\tfrac{1}{2}\pi$, $\pi$ |
| `k2b_toepassingen` | toepassingen | `k2b_opp` | Oppervlakte, grafiek onder de $x$-as, $p$ bepalen |
| `k2b_logaritme` | primitiveren | `k2b_ln` | $\ln^{2}(x)$, $x^{2}\ln^{2}(x)$, $\dfrac{\ln^{2}(x)}{x^{2}}$, $\ln^{3}(x)$ |
| | | `k2b_bepaald_ln` | Exacte uitkomsten met $\mathrm{e}$, $\mathrm{e}^{2}$ en $\mathrm{e}^{3}$, en twee oppervlaktes |

De topics staan achter die van K.2 A (`order_index` 13, 14, 15 en 16).

`k2b_logaritme` kwam er later bij, in een eigen migratie met een eigen topic.
Dat moest ook: de controle aan het eind van `0038` telt de stappen van zijn
eigen drie topics, dus een extra cluster ónder een van die topics zou die
migratie laten omvallen zodra je hem een tweede keer draait.

## 4. Waar het staat

| Wat | Waar |
| --- | --- |
| Bron (boekopgaven, auteursrecht) | `content-bron/k2b.json` — alleen lokaal, niet in git |
| De vragen, voor het narekenen | `content/hoofdstuk-k/k2b.json` en `content/hoofdstuk-k/k2b-ln.json` |
| Het bronscript | `scripts/k2b-content.ts` — `npx jiti scripts/k2b-content.ts` |
| Het bronscript voor de ln-vragen | `scripts/k2b-ln-content.ts` — `npx jiti scripts/k2b-ln-content.ts` |
| De generator | `scripts/lib/stappenplan-content.ts`, `generateAdditiveMigration` |
| De migraties | `supabase/migrations/0038_k2b_herhaald_partieel.sql` en `0039_k2b_ln.sql` |

Net als bij K.1 en K.2 A is het bronscript de enige plek waar de vragen staan;
het schrijft zowel het JSON-bestand als de migratie, zodat de databank niet uit
de pas kan lopen met wat `npm test` narekent.

De migratie voegt **alleen** rijen toe en mag twee keer draaien. De controle aan
het eind telt de stappen van de eigen topics, niet die van het hele hoofdstuk.

### Grenzen en domeinen in het JSON-bestand

`src/content/primitieven.test.ts` wil in `grenzen` gewone getallen zien, dus
daar staat $\tfrac{1}{2}\pi$ als `1.5707963267948966`. In de opgave zelf en in
de stappen blijft de grens exact.

Bij acht vragen in `k2b.json` staat er ook een `domein`: de zes van
`k2b_bepaald_terugkomen` en `opp-3` en `opp-4`. Het standaarddomein is
$[-2.5, 2.5]$, en dat dekt een integratie-interval tot $\pi$ niet helemaal. Het
domein is daar dus opgerekt (of opgeschoven) tot het stuk waar de opgave zelf
over gaat, zodat er wordt nagerekend waar de vraag speelt.

In `k2b-ln.json` staat bij **alle** vragen een domein, en wel $[0.2, 2.5]$:
$\ln(x)$ bestaat niet voor $x \leq 0$, dus op het standaarddomein zou de helft
van de meetpunten wegvallen. De grenzen mogen daar wel buiten liggen — bij
`bepln-4` loopt de integraal tot $\mathrm{e}^{3} \approx 20{,}1$ — want die
worden los ingevuld.

Bij `opp-4`, `opp-6` en `bepln-6` ligt de grafiek ónder de $x$-as. De `waarde`
in het JSON-bestand is dan $F(b) - F(a)$ — dus negatief — terwijl het antwoord
op de site de oppervlakte is, het tegengestelde daarvan.
