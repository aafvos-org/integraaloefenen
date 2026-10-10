# K.2 Theorie A · Primitiveren en de productregel

Het eerste theorieblok van K.2: **partieel integreren**. Waar K.1 ging over de
kettingregel achterstevoren
([Theorie A](k1a-primitiveren-en-de-kettingregel.md) en
[Theorie B](k1b-toepassingen-van-de-substitutiemethode.md)), draait dit blok de
*productregel* om.

De oefenvragen zijn eigen varianten in de stijl van het boek; de boekopgaven
zelf staan alleen lokaal in `content-bron/k2a.json`.

## 1. Waar het over gaat

Uit de productregel $\left[g(x) \cdot h(x)\right]' = g'(x)h(x) + g(x)h'(x)$
volgt, door links en rechts te primitiveren:

$$\int g(x) \cdot h'(x)\,\mathrm{d}x = g(x) \cdot h(x) - \int h(x) \cdot g'(x)\,\mathrm{d}x$$

Je kiest dus één factor om te **primitiveren** (die heet $h'$) en één om te
**differentiëren** (die heet $g$). De keuze is goed als de integraal die
overblijft makkelijker is dan waar je mee begon:

- een **gonio** of een **e-macht** primitiveren kost niets → dat wordt $h'$;
- een **veelterm** wordt door differentiëren juist eenvoudiger → dat wordt $g$;
- bij een **logaritme** is het net andersom: $\ln$ kun je niet zomaar
  primitiveren, maar differentiëren geeft $\tfrac{1}{x}$ en dan is de $\ln$
  verdwenen → de $\ln$ wordt $g$, de macht van $x$ wordt $h'$.

Een kale $\ln(x)$ schrijf je daarvoor eerst als $1 \cdot \ln(x)$.

Loopt het vast, dan heb je de factoren waarschijnlijk omgedraaid: begin dan
opnieuw met de andere keuze. Bij $\int x\sin(x)\,\mathrm{d}x$ zie je dat meteen —
primitiveer je de $x$, dan staat er daarna $x^{2}$ en ben je verder van huis.

In dit blok integreer je steeds **één keer** partieel. Twee keer achter elkaar
(en de truc waarbij de oorspronkelijke integraal terugkomt) is Theorie B.

Letters: de twee factoren heten $g$ en $h'$, nooit $u$ en $v$ — ook al gebruikt
het boek daar $f$ en $g'$ voor.

## 2. Het stappenplan

Elke vraag heeft precies vier stappen (`step_order` 0 t/m 3).

### Primitiveren met partieel integreren

0. Deel 2 van de driedeling. Welke buitenste schil staat er — een veelterm maal
   een gonio, maal een e-macht, of iets met $\ln$?
1. Noem de factor die je eerst primitiveert $h'$ en de andere $g$; bepaal $h$ en
   $g'$. Zo nodig eerst herschrijven (breuk → macht, $\cos^{2}$ → dubbele hoek,
   $\ln\left(x^{3}\right) \to 3\ln(x)$).
2. De regel invullen en opschrijven welke integraal er overblijft.
3. Die integraal uitrekenen, $+ c$ erbij, en controleren door terug te
   differentiëren.

### Bepaalde integralen

0. Deel 2, plus: het is een bepaalde integraal, dus eerst primitiveren en pas
   daarna de grenzen invullen.
1. $g$ en $h'$ kiezen.
2. De regel invullen en de primitieve opschrijven.
3. Grenzen invullen; exact laten staan.

### Oppervlakte en p bepalen

0. Deel 1 van de driedeling: vertaal het verhaaltje naar een integraal, inclusief
   de snijpunten met de $x$-as en de vraag of de grafiek er boven of onder ligt.
1. De productvorm herkennen en $g$ en $h'$ kiezen.
2. Deel 2: partieel integreren tot de primitieve.
3. Grenzen invullen, en bij een $p$-vraag deel 3: de vergelijking exact
   oplossen.

## 3. Topics en clusters

Drie topics, zes clusters, 36 vragen: twee vragen per niveau per cluster.

| Topic | Categorie | Cluster | Wat het oefent |
| --- | --- | --- | --- |
| `k2a_partieel` | primitiveren | `k2a_macht_gonio` | $x\cos(2x)$, $(4x-1)\cos(x)$, $x\cos^{2}(x)$ |
| | | `k2a_macht_e` | $x\mathrm{e}^{3x}$, $(1-4x)\mathrm{e}^{2x}$, $\dfrac{x}{\mathrm{e}^{2x}}$ |
| | | `k2a_ln` | $6x^{2}\ln(x)$, $\ln(2x)$, $\dfrac{\ln(x)}{x^{3}}$, $\ln(x+1)$ |
| `k2a_bepaald` | integralen | `k2a_bepaald_gonio` | Exacte uitkomsten met $\pi$ en $\sqrt{3}$ |
| | | `k2a_bepaald_e_ln` | Grenzen $0$, $1$, $\mathrm{e}$ bij e-machten en $\ln$ |
| `k2a_toepassingen` | toepassingen | `k2a_opp` | Oppervlakte, grafiek onder de $x$-as, $p$ bepalen |

De topics staan achter die van K.1 B (`order_index` 10, 11 en 12).

## 4. Waar het staat

| Wat | Waar |
| --- | --- |
| Bron (boekopgaven, auteursrecht) | `content-bron/k2a.json` — alleen lokaal, niet in git |
| De vragen, voor het narekenen | `content/hoofdstuk-k/k2a.json` |
| Het bronscript | `scripts/k2a-content.ts` — `npx jiti scripts/k2a-content.ts` |
| De generator | `scripts/lib/stappenplan-content.ts`, `generateAdditiveMigration` |
| De migratie | `supabase/migrations/0037_k2a_productregel.sql` |

Net als bij K.1 A en K.1 B is het bronscript de enige plek waar de vragen staan;
het schrijft zowel het JSON-bestand als de migratie, zodat de databank niet uit
de pas kan lopen met wat `npm test` narekent.

De migratie voegt **alleen** rijen toe en mag twee keer draaien. De controle aan
het eind telt de stappen van de eigen topics, niet die van het hele hoofdstuk.

### Grenzen in het JSON-bestand

`src/content/primitieven.test.ts` wil in `grenzen` gewone getallen zien, dus
daar staat $\tfrac{1}{2}\pi$ als `1.5707963267948966` en $\mathrm{e}$ als
`2.718281828459045`. In de opgave zelf en in de stappen blijft de grens exact.

Bij `opp-6` ligt de grafiek ónder de $x$-as. De `waarde` in het JSON-bestand is
dan $F(b) - F(a)$ — dus negatief — terwijl het antwoord op de site de
oppervlakte is, het tegengestelde daarvan.
