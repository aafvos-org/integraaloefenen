# K.3 Theorie A · De functie $f(x) = \arctan(x)$

Het eerste theorieblok van K.3. Na de substitutiemethode (K.1) en het partieel
integreren (K.2) komt er één nieuwe standaardprimitieve bij, en die hoort bij
een functie die je nog niet kende: de arctangens.

De oefenvragen zijn eigen varianten in de stijl van het boek; de boekopgaven
zelf staan alleen lokaal in `content-bron/k3a.json`.

## 1. Waar het over gaat

$\arctan$ is de inverse van $\tan$, maar alleen op het stuk waar $\tan$
omkeerbaar is:

$$f(x) = \arctan(x) \text{ is de inverse van } g(x) = \tan(x) \text{ met } D_g = \left\langle-\tfrac{1}{2}\pi, \tfrac{1}{2}\pi\right\rangle$$

Daaruit volgt $D_f = \mathbb{R}$ en $B_f = \left\langle-\tfrac{1}{2}\pi, \tfrac{1}{2}\pi\right\rangle$.
Die beperking van het bereik is de helft van dit blok: de tangens heeft periode
$\pi$, dus er zijn oneindig veel hoeken met dezelfde tangens, en $\arctan$ kiest
er altijd precies één uit.

En dan de twee regels waar het in de integraalrekening om gaat:

$$f(x) = \frac{1}{x^{2} + 1} \text{ geeft } F(x) = \arctan(x) + c
\qquad
g(x) = \arctan(x) \text{ geeft } g'(x) = \frac{1}{x^{2} + 1}$$

De tabel die een leerling uit het hoofd moet kennen is het spiegelbeeld van de
tangens-tabel; $\arctan$ is oneven, dus bij een negatief getal hoort dezelfde
hoek met een minteken.

| $x$ | $-\sqrt{3}$ | $-1$ | $-\tfrac{1}{3}\sqrt{3}$ | $0$ | $\tfrac{1}{3}\sqrt{3}$ | $1$ | $\sqrt{3}$ |
| --- | --- | --- | --- | --- | --- | --- | --- |
| $\arctan(x)$ | $-\tfrac{1}{3}\pi$ | $-\tfrac{1}{4}\pi$ | $-\tfrac{1}{6}\pi$ | $0$ | $\tfrac{1}{6}\pi$ | $\tfrac{1}{4}\pi$ | $\tfrac{1}{3}\pi$ |

### Drie valkuilen

- **$\arctan(\tan(t))$ is niet altijd $t$.** Ligt $t$ buiten
  $\left\langle-\tfrac{1}{2}\pi, \tfrac{1}{2}\pi\right\rangle$, dan komt er een
  andere hoek uit: $\arctan\left(\tan\left(\tfrac{2}{3}\pi\right)\right) = -\tfrac{1}{3}\pi$.
  Andersom klopt het wél altijd: $\tan(\arctan(a)) = a$ voor elke $a$.
- **Niet elke vergelijking heeft een oplossing.** Staat er rechts een getal
  buiten het bereik, zoals $\arctan(x) = \tfrac{3}{4}\pi$, dan is er geen
  oplossing. Tangens nemen aan beide kanten levert dan een schijnoplossing op.
  Kijk dus eerst of de rechterkant tussen $-\tfrac{1}{2}\pi$ en $\tfrac{1}{2}\pi$
  ligt.
- **Een teller met $x$ erin is iets heel anders.** $\dfrac{1}{x^{2}+1}$ geeft
  $\arctan(x)$, maar $\dfrac{2x}{x^{2}+1}$ geeft $\ln\left(x^{2}+1\right)$ —
  dezelfde noemer, een andere standaardvorm.

### Wat hier nog níet in zit

Kwadraatafsplitsen ($x^{2} - 4x + 8 = (x-2)^{2} + 4$) en het herschrijven van
$\dfrac{a}{px^{2}+q}$ naar $\dfrac{a}{(bx)^{2}+1}$ horen bij **Theorie B**. In
dit blok staat de vorm altijd al klaar: kaal $x^{2}+1$, een kern $ax+b$ waarvan
het kwadraat zichtbaar is, of een kern waarvan de afgeleide in de teller staat.

## 2. Het stappenplan

Elke vraag heeft precies vier stappen (`step_order` 0 t/m 3).

### Exacte waarden en vergelijkingen

Hier zit geen integraal in: alleen **deel 3** van de driedeling speelt, de goede
oplossingsmethode gebruiken.

0. Deel 3, en wat $\arctan$ betekent: de hoek $t$ met $\tan(t) = a$ én
   $-\tfrac{1}{2}\pi < t < \tfrac{1}{2}\pi$.
1. Bij een vergelijking: eerst kijken of de rechterkant in het bereik ligt, dan
   aan beide kanten de tangens nemen.
2. De tabel gebruiken, of de kern vrijmaken.
3. Het antwoord opschrijven, met de valkuil erbij.

### Differentiëren

0. De afgeleide van $\arctan$ is precies de standaardvorm die je bij deel 2 van
   de driedeling moet herkennen; daarom oefen je hem eerst andersom. Buitenste
   schil: $\arctan$ van een kern → kettingregel.
1. Buitenkant en kern benoemen.
2. Afgeleide van de buitenkant met de kern erin, en afgeleide van de kern.
3. Vermenigvuldigen en de noemer uitwerken — anders herken je hem straks niet
   terug.

### Primitiveren

0. Deel 2 van de driedeling. Welke buitenste schil staat er: kaal $x^{2}+1$, een
   kern in de noemer, of een substitutie ($g'$ in de teller)?
1. Herschrijven tot de vorm zichtbaar is: $4x^{2}+1 = (2x)^{2}+1$,
   $x^{2}+3 = \left(x^{2}+1\right)+2$, $\mathrm{e}^{2x} = \left(\mathrm{e}^{x}\right)^{2}$.
2. De regel toepassen, inclusief het delen door $a$ bij een kern $ax+b$.
3. Het antwoord met $+c$, en controleren door terug te differentiëren.

### Bepaalde integralen

0. Deel 2, plus: eerst primitiveren en pas daarna de grenzen invullen. Exact
   laten staan.
1. De vorm herkennen en zo nodig herschrijven.
2. De primitieve opschrijven, zonder integratieconstante.
3. Grenzen invullen. De grenzen zijn met opzet lelijk ($\sqrt{3}-1$,
   $\tfrac{1}{2}\ln(3)$) zodat de kern er een mooie waarde uit de tabel van
   maakt.

## 3. Topics en clusters

Drie topics, zes clusters, 36 vragen: twee vragen per niveau per cluster.

| Topic | Categorie | Cluster | Wat het oefent |
| --- | --- | --- | --- |
| `k3a_arctangens` | vergelijkingen | `k3a_waarden` | De tabel, optellen van hoeken, $\arctan(\tan(\ldots))$ en $\tan(\arctan(\ldots))$ |
| | | `k3a_vergelijking` | $\arctan(\text{kern}) = \text{hoek}$, geen oplossing, afronden op drie decimalen |
| `k3a_primitiveren` | primitiveren | `k3a_afgeleide` | $\arctan(3x)$, $\arctan\left(x^{2}\right)$, $x\arctan(x)$ |
| | | `k3a_standaard` | $\dfrac{5}{x^{2}+1}$, $\dfrac{x^{2}+3}{x^{2}+1}$, $\dfrac{2x+4}{x^{2}+1}$, $\dfrac{\arctan(x)}{x^{2}+1}$ |
| | | `k3a_kern` | $\dfrac{1}{(x+3)^{2}+1}$, $\dfrac{6}{9x^{2}+1}$, $\dfrac{2x}{x^{4}+1}$, $\dfrac{\mathrm{e}^{x}}{\mathrm{e}^{2x}+1}$ |
| `k3a_bepaald` | integralen | `k3a_bepaald_exact` | Uitkomsten $\tfrac{1}{4}\pi$, $\tfrac{7}{12}\pi$, $\tfrac{1}{12}\pi$, $\dfrac{\pi^{2}}{32}$ |

De topics staan achter die van K.2 (`order_index` 17, 18 en 19).

Er is geen cluster met oppervlakte-opgaven: in dit theorieblok staat er in het
boek geen enkele. Die komen in Theorie B, waar de noemer eerst nog
kwadraatafgesplitst moet worden.

## 4. Waar het staat

| Wat | Waar |
| --- | --- |
| Bron (boekopgaven, auteursrecht) | `content-bron/k3a.json` — alleen lokaal, niet in git |
| De vragen, voor het narekenen | `content/hoofdstuk-k/k3a.json` |
| Het bronscript | `scripts/k3a-content.ts` — `npx jiti scripts/k3a-content.ts` |
| De generator | `scripts/lib/stappenplan-content.ts`, `generateAdditiveMigration` |
| De migratie | `supabase/migrations/0040_k3a_arctangens.sql` |

Net als bij de eerdere blokken is het bronscript de enige plek waar de vragen
staan; het schrijft zowel het JSON-bestand als de migratie. De migratie voegt
**alleen** rijen toe en mag twee keer draaien; de controle aan het eind telt de
stappen van de eigen drie topics, niet die van het hele hoofdstuk.

### Twaalf vragen zonder integraal

`k3a_waarden` en `k3a_vergelijking` gaan over de functie zelf. Daar valt niets
te primitiveren, dus die 12 vragen hebben geen `integrand` en `primitieve` en
staan niet in `content/hoofdstuk-k/k3a.json`: `src/content/primitieven.test.ts`
rekent ze niet na. Hun antwoorden zijn met de hand nagerekend; de toelichting
per vraag staat in `content-bron/k3a.json`.

Daarvoor is `AdditiveQ` in de generator aangepast: `integrand` en `primitieve`
zijn nu optioneel, maar horen wél bij elkaar — laat je ze allebei weg of
allebei staan. Staan er `grenzen` bij, dan is een `primitieve` verplicht, want
anders valt er niets in te vullen.

### Differentiëren in een bestand over primitieven

Bij `k3a_afgeleide` staat de functie zelf als `primitieve` en de afgeleide als
`integrand`. Dat ziet er omgekeerd uit, maar het is precies dezelfde controle:
de test differentieert de primitieve en legt hem naast de integrand, en dat is
hier letterlijk het antwoord van de opgave.

### Grenzen in het JSON-bestand

`src/content/primitieven.test.ts` wil in `grenzen` gewone getallen zien, dus
daar staat $\sqrt{3}$ als `1.7320508075688772` en $\tfrac{1}{2}\ln(3)$ als
`0.5493061443340549`. In de opgave zelf en in de stappen blijft de grens exact.

Een `domein` staat er bij geen enkele vraag: alle functies in dit blok bestaan
op het hele standaarddomein $[-2.5, 2.5]$ — een noemer van de vorm
$(\ldots)^{2} + 1$ is immers nooit nul.
