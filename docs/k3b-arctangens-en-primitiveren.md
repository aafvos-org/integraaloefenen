# K.3 Theorie B · De arctangensfunctie en primitiveren

Het tweede theorieblok van K.3. In Theorie A stond de standaardvorm altijd al
klaar: kaal $x^{2}+1$, of een kern waarvan het kwadraat zichtbaar was. Hier moet
je hem zelf tevoorschijn halen.

De oefenvragen zijn eigen varianten in de stijl van het boek; de boekopgaven
zelf staan alleen lokaal in `content-bron/k3b.json`.

## 1. Waar het over gaat

Dezelfde twee regels als in Theorie A:

$$\int \frac{1}{g^{2}+1}\,\mathrm{d}g = \arctan(g) + c
\qquad \text{en} \qquad
\text{een primitieve van } f(ax+b) \text{ is } \tfrac{1}{a}F(ax+b)$$

Het nieuwe zit in de stap ervóór. Er staat bijna nooit meteen een $1$ achter het
kwadraat, en er staat ook niet altijd een kwadraat. Twee manieren om dat recht
te zetten:

**Teller en noemer delen door het losse getal.** Bij $\dfrac{a}{px^{2}+q}$ deel
je door $q$, zodat er $\dfrac{a/q}{(bx)^{2}+1}$ komt te staan:

$$\frac{6}{x^{2}+9} = \frac{\tfrac{2}{3}}{\left(\tfrac{1}{3}x\right)^{2}+1}
\qquad\text{geeft}\qquad F(x) = 2\arctan\left(\tfrac{1}{3}x\right) + c$$

**Kwadraatafsplitsen.** Staat er in de noemer $x^{2}+bx+c$, dan maak je daar
eerst een kwadraat van: neem de helft van het getal vóór $x$, zet dat in het
kwadraat en corrigeer met een getal.

$$x^{2}-6x+18 = (x-3)^{2}+9$$

Blijft er daarna geen $1$ achter het kwadraat staan — zoals hier die $9$ — dan
komt de eerste manier er nog achteraan.

### Drie valkuilen

- **Twee keer delen.** Na het kwadraatafsplitsen ben je er vaak nog niet: bij
  $(x-3)^{2}+9$ moet je én door $9$ delen én achteraf door $a=\tfrac{1}{3}$ uit
  de kern. Die twee factoren samen maken het verschil tussen $\tfrac{5}{12}\pi$
  en een willekeurig getal.
- **Een getal vóór $x^{2}$.** Bij $4x^{2}+4x+5$ haal je eerst de $4$ buiten
  haakjes, anders klopt het kwadraatafsplitsen niet.
- **De teller blijft de baas.** $\dfrac{1}{x^{2}+2x+2}$ wordt $\arctan(x+1)$,
  maar $\dfrac{2x+2}{x^{2}+2x+2}$ wordt $\ln\left(x^{2}+2x+2\right)$: staat de
  afgeleide van de noemer in de teller, dan is het een logaritme en geen
  arctangens.

## 2. Het stappenplan

Elke vraag heeft precies vier stappen (`step_order` 0 t/m 3).

### Primitiveren

0. Deel 2 van de driedeling. Welke schil staat er: een getal gedeeld door
   $px^{2}+q$, of een noemer $x^{2}+bx+c$ zonder zichtbaar kwadraat?
1. Herschrijven: delen door het losse getal, of kwadraatafsplitsen.
2. De standaardvorm toepassen, inclusief het delen door $a$ uit de kern.
3. Het antwoord met $+c$, en controleren door terug te differentiëren.

### Bepaalde integralen

0. Deel 2, plus: eerst primitiveren, dan pas de grenzen invullen. Exact laten
   staan.
1. Herschrijven tot de standaardvorm zichtbaar is.
2. De primitieve opschrijven, zonder integratieconstante.
3. Grenzen invullen. De grenzen zijn met opzet lelijk ($2+3\sqrt{3}$,
   $\mathrm{e}^{-2}$) zodat de kern er een mooie waarde uit de tabel van maakt.

### Vlakdelen

Hier spelen alle drie de delen van de driedeling, en dat staat ook zo in de
stappen:

0. Deel 1: het verhaaltje vertalen naar een integraal.
1. De integrand herschrijven.
2. Deel 2: primitiveren.
3. Deel 3: de grenzen invullen, of de vergelijking $O(V_p) = \ldots$ oplossen.

## 3. Topics en clusters

Drie topics, vier clusters, 24 vragen: twee vragen per niveau per cluster.

| Topic | Categorie | Cluster | Wat het oefent |
| --- | --- | --- | --- |
| `k3b_primitiveren` | primitiveren | `k3b_herschrijven` | $\dfrac{6}{x^{2}+9}$, $\dfrac{3}{9x^{2}+4}$, $\dfrac{6}{4x^{2}+3}$, $\dfrac{x^{2}+5}{x^{2}+2}$ |
| | | `k3b_kwadraat` | $\dfrac{1}{x^{2}+2x+2}$, $\dfrac{6}{x^{2}+8x+20}$, $\dfrac{1}{4x^{2}+4x+5}$ |
| `k3b_bepaald` | integralen | `k3b_bepaald_exact` | Uitkomsten $\tfrac{1}{8}\pi$, $\tfrac{1}{20}\pi$, $\tfrac{2}{3}\pi$, $\tfrac{1}{2}\pi$, $\tfrac{3}{8}\pi$, $\tfrac{1}{4}\pi$ |
| `k3b_toepassing` | toepassingen | `k3b_oppervlakte` | Maximum, oppervlakte van $V$, en de waarde van $p$ bij $O(V_p)$ |

De topics staan achter die van K.3 A (`order_index` 20, 21 en 22).

Dit is het eerste blok van hoofdstuk K met een topic in de categorie
`toepassingen`: in Theorie A staat in het boek geen enkele oppervlakte-opgave,
want daar is de noemer nog nooit kwadraatafgesplitst.

## 4. Waar het staat

| Wat | Waar |
| --- | --- |
| Bron (boekopgaven, auteursrecht) | `content-bron/k3b.json` — alleen lokaal, niet in git |
| De vragen, voor het narekenen | `content/hoofdstuk-k/k3b.json` |
| Het bronscript | `scripts/k3b-content.ts` — `npx jiti scripts/k3b-content.ts` |
| De generator | `scripts/lib/stappenplan-content.ts`, `generateAdditiveMigration` |
| De migratie | `supabase/migrations/0041_k3b_arctangens_primitiveren.sql` |

Net als bij de eerdere blokken is het bronscript de enige plek waar de vragen
staan; het schrijft zowel het JSON-bestand als de migratie. De migratie voegt
**alleen** rijen toe en mag twee keer draaien; de controle aan het eind telt de
stappen van de eigen drie topics, niet die van het hele hoofdstuk.

### Eén vraag zonder integraal

`op-1` vraagt het maximum van $\dfrac{12}{x^{2}+6x+13}$. Daar valt niets te
primitiveren — de opgave oefent alleen het kwadraatafsplitsen — dus die vraag
heeft geen `integrand` en `primitieve` en staat niet in
`content/hoofdstuk-k/k3b.json`. Het antwoord ($f(-3)=3$) is met de hand
nagerekend.

### Twee vragen met een logaritme in de noemer

Bij `bp-6` en `op-6` staat $\ln(x)$ in de noemer. Die bestaan alleen voor
$x>0$, dus daar staat een `domein` van $[0{,}5;\ 2{,}5]$ bij; zonder dat
domein probeert de test ook negatieve $x$ en krijgt hij complexe getallen
terug. De grenzen van `bp-6` ($\mathrm{e}^{-2}$ en $\mathrm{e}^{2}$) liggen
daarbuiten, maar dat mag: het domein is alleen voor het narekenen van de
afgeleide.

### Waar `p` in het antwoord staat

Bij `op-5` en `op-6` is de bovengrens een letter, dus er is niets in te vullen:
die twee vragen hebben wel een `integrand` en een `primitieve` (die worden
nagerekend) maar geen `grenzen` en `waarde`.
