# H2 · De afgeleide berekenen — opzet van theorie en oefenvragen

Specificatie voor de nieuwe theoriepagina van hoofdstuk 2 én de bijbehorende
vragenset. Bron: Getal & Ruimte H2, alleen het rekentechnische deel
(§2.3 opgaven 51–53, §2.4 opgaven 56, 58 en 60, diagnostische toets 11–13).
Alles wat over begrip gaat (differentiequotiënt, limiet, hellinggrafiek,
raaklijn, snelheid) valt bewust buiten deze opzet.

Leidend principe: **elke opgave, elke theoriekaart en elke video volgt hetzelfde
stappenplan.** Stap 0 is altijd "analyseer de buitenste schil", daarna drie
vaste stappen per regel. Zit er binnen een stap nog een regel, dan begint dat
deel opnieuw bij zijn eigen stap 1.

---

## 1. Het stappenplan

### Stap 0 · Analyseer de buitenste schil

Kijk naar het teken dat de grootste delen van de functie van elkaar scheidt.
Dat teken bepaalt de regel. Dit is de enige beslissing die een leerling zelf
moet nemen; de rest is invullen.

| Buitenste schil | Herkenning | Regel |
| --- | --- | --- |
| `+` of `−` tussen termen | `x² − 3/(x+1)`, `5 − 3(x⁴−x)(x+1)` | **Somregel** |
| Eén term `a·xⁿ` (of een constante) | `5x⁶`, `−7`, `0,6x³` | **Machtsregel** |
| `·` tussen twee haakjesgroepen, of een kwadraat van een polynoom | `(x²−4)(x³+2x)`, `(3x²−4)²` | **Productregel** |
| Breukstreep met `x` in de noemer | `(x−2)/(x+5)`, `x³/(2x²+1)` | **Quotiëntregel** |
| Haakjes die je in één regel uitwerkt (lineair × lineair, `(ax+b)²`) | `(3−x)(5+2x)`, `(2x−5)²` | **Eerst uitwerken**, dan somregel |

Afspraak bij een kwadraat als `(2x−5)²`: zegt de opgave "gebruik de
productregel, laat de haakjes staan", dan is het productregel. Zegt de opgave
alleen "differentieer", dan mag de leerling kiezen en zijn beide antwoordvormen
goed. Kettingregel komt pas in H6 en wordt in H2 nergens verwacht.

### Stap 1, 2 en 3 per regel

| Regel | Stap 1 | Stap 2 | Stap 3 |
| --- | --- | --- | --- |
| **Somregel** `f = u + v` | kies `u` en `v` (de termen) | bereken `u′` en `v′` (elk met zijn eigen regel) | `f′ = u′ + v′` |
| **Machtsregel** `f = a·xⁿ` | lees `a` en `n` af | `n · a` en `n − 1` | `f′ = n·a·xⁿ⁻¹` |
| **Productregel** `f = g · h` | kies `g` en `h` | bereken `g′` en `h′` | `f′ = g′·h + g·h′`, haakjes laten staan |
| **Quotiëntregel** `f = g / h` | `g` = teller, `h` = noemer | bereken `g′` en `h′` | `f′ = (g′·h − g·h′) / h²`, teller uitwerken, noemer laten staan |
| **Eerst uitwerken** | werk de haakjes uit | herleid tot een polynoom | differentieer termsgewijs |

### Letters

- Somregel gebruikt **u en v**, product- en quotiëntregel gebruiken **g en h**.
  Zo botsen de letters niet als een productregel binnen een somregel zit
  (conventie van video som 30; video som 29 hernoemt in plaats daarvan naar
  een nieuwe `f` — dat vervalt).
- Altijd volledige notatie in beeld: `u(x) = 5`, `g′(x) = 2x`.
- De opgave houdt zijn eigen naam en variabele: `k(q)`, `s(t)`.

### Geneste regels

Als stap 2 van de somregel een productregel nodig heeft, opent dat deel zijn
eigen blokje met stap 1–3, en het resultaat gaat terug naar stap 3 van de
somregel. In tekst:

```
Stap 0 · Buitenste schil: 5 − 3(x⁴−x)(x+1) → een min tussen twee delen → somregel
Stap 1 · u(x) = 5, v(x) = 3(x⁴−x)(x+1)
Stap 2 · u′(x) = 0 (geen x in u). Voor v: een product → productregel
  ↳ Stap 1 · g(x) = 3x⁴ − 3x, h(x) = x + 1
  ↳ Stap 2 · g′(x) = 12x³ − 3, h′(x) = 1
  ↳ Stap 3 · v′(x) = (12x³−3)(x+1) + (3x⁴−3x)·1
Stap 3 · f′(x) = 0 − v′(x) = −(12x³−3)(x+1) − (3x⁴−3x)
```

---

## 2. Topics en clusters

Per cluster: minimaal 6 vragen (2 per niveau), streefgetal 9 (3 per niveau).
Niveau 1 = één regel, kleine getallen. Niveau 2 = mintekens, decimalen of
breuken, langere polynomen. Niveau 3 = andere letters, constante factor ervoor,
of een tweede regel genest.

De voorbeelden hieronder zijn nieuw geschreven in de stijl van het boek, niet
letterlijk uit het boek. Antwoorden staan in de afgesproken canonieke vorm
(zie §3).

### Topic 1 · Termsgewijs differentiëren

Regel: machtsregel + somregel. Boek 51, toets 11. Nu 1 cluster met 6 vragen;
wordt 3 clusters.

| Cluster | Wat oefent het | Voorbeelden |
| --- | --- | --- |
| 1a Gehele coëfficiënten | machtsregel per term, constante valt weg | `4x⁵ − 2x³ + 6x − 9 → 20x⁴ − 6x² + 6` · `x⁷ − 3x⁴ + x² → 7x⁶ − 12x³ + 2x` · `−3x⁶ + x⁵ − 4x² + 11 → −18x⁵ + 5x⁴ − 8x` |
| 1b Breuken en decimalen | rekenen met `½·4`, `0,4·5` | `½x⁴ − ⅓x³ + 2x → 2x³ − x² + 2` · `0,4x⁵ − 1,5x² + 3,2 → 2x⁴ − 3x` · `−¼x⁸ + ⅔x³ − x → −2x⁷ + 2x² − 1` |
| 1c Andere letters | zelfde regels, variabele `t`, `q`, `p` | `s(t) = 3t⁴ − 2t² + 5t → 12t³ − 4t + 5` · `k(q) = 2 − q + 4q³ − q⁶ → −1 + 12q² − 6q⁵` · `N(p) = 0,5p² − 3p + 7 → p − 3` |

Stappenplan in de uitwerking: stap 0 "termen met + en − → somregel",
stap 1 termen benoemen, stap 2 elke term met de machtsregel, stap 3 optellen.

### Topic 2 · Haakjes uitwerken vóór differentiëren

Regel: eerst uitwerken, dan termsgewijs. Boek 52, toets 12. Blijft 2 → wordt 4
clusters.

| Cluster | Wat oefent het | Voorbeelden |
| --- | --- | --- |
| 2a Twee lineaire factoren | `(ax+b)(cx+d)` uitwerken | `(x+4)(2x−3) → 4x + 5` · `(4−x)(3+2x) → 5 − 4x` · `(3x+2)(2−5x) → −30x − 4` |
| 2b Merkwaardig product | `(ax+b)²`, ook met extra term of verschil van twee kwadraten | `(2x+3)² → 8x + 12` · `(4x−1)² − 6x → 32x − 14` · `(x+3)² − (2x−1)² → −6x + 10` |
| 2c Constante factor en extra termen | factor vóór de haakjes, min vóór de haakjes | `3(x−2)² + 4(x+1) → 6x − 8` · `−2(x+1)(3−x) + 5(x−2) → 4x + 1` · `4(2x−1)² − 2(3x+2)² → −4x − 40` |
| 2d Hogere graad | `x·(…)²`, `x²(…)`, twee polynomen die netjes uitwerken | `x(3x−2)² → 27x² − 24x + 4` · `x²(x−5) + ¼x⁴ → x³ + 3x² − 10x` · `2(x²+1)(x³−x) → 10x⁴ − 2` |

Stappenplan: stap 0 "haakjes die je zo kunt uitwerken → eerst uitwerken",
stap 1 uitwerken, stap 2 herleiden, stap 3 termsgewijs (dat is topic 1).

### Topic 3 · De productregel

Boek 56, 53, 58. Blijft 3 → wordt 4 clusters. In elke vraag staat de instructie
"Gebruik de productregel en laat de haakjes in je antwoord staan."

| Cluster | Wat oefent het | Voorbeelden |
| --- | --- | --- |
| 3a Twee polynomen | de kern | `(x²+3)(x³−2x) → 2x(x³−2x) + (x²+3)(3x²−2)` · `(4x−1)(x²+x+1) → 4(x²+x+1) + (4x−1)(2x+1)` · `p(t) = (t³−2t)(t⁴+1) → (3t²−2)(t⁴+1) + (t³−2t)·4t³` |
| 3b Kwadraat als product | `(g)² = g·g`, zien dat beide termen gelijk zijn | `(x²+1)² → 2x(x²+1) + (x²+1)·2x` · `(2x³−5)² → 6x²(2x³−5) + (2x³−5)·6x²` · `(x⁴−x)² → (4x³−1)(x⁴−x) + (x⁴−x)(4x³−1)` |
| 3c Genest in een som | somregel buiten, productregel binnen; constante factor mee naar binnen | `2x + 3(x²−1)(x+4) → 2 + 6x(x+4) + (3x²−3)` · `7 − 2(x³+1)(x²−x) → −6x²(x²−x) − (2x³+2)(2x−1)` · `x² − (x³−2)(x+5) → 2x − 3x²(x+5) − (x³−2)` |
| 3d Drie factoren | `p′ = f′gh + fg′h + fgh′` | `x(x+3)(x−1) → (x+3)(x−1) + x(x−1) + x(x+3)` · `(x−2)(x+2)(x²+1) → (x+2)(x²+1) + (x−2)(x²+1) + (x−2)(x+2)·2x` · `2x(x²−1)(x+4) → 2(x²−1)(x+4) + 4x²(x+4) + 2x(x²−1)` |

Cluster 3d heeft alleen niveau 2 en 3 (minimaal 6 vragen: 3 + 3).

### Topic 4 · De quotiëntregel

Boek 60, toets 13. Blijft 3 clusters.

| Cluster | Wat oefent het | Voorbeelden |
| --- | --- | --- |
| 4a Lineair gedeeld door lineair | teller wordt een getal | `(x+3)/(x−1) → −4/(x−1)²` · `(3x−2)/(2x+1) → 7/(2x+1)²` · `5/(4x−3) → −20/(4x−3)²` |
| 4b Polynoom-breuk | teller blijft een polynoom | `x²/(x−3) → (x² − 6x)/(x−3)²` · `(2x+1)/(x²+4) → (−2x² − 2x + 8)/(x²+4)²` · `x³/(x²−1) → (x⁴ − 3x²)/(x²−1)²` |
| 4c Som met breuk | somregel buiten, quotiëntregel binnen | `x³ + 4/(x+2) → 3x² − 4/(x+2)²` · `2x − (x+1)/(x−1) → 2 + 2/(x−1)²` · `(x²−1)/(x+3) + x² → (x² + 6x + 1)/(x+3)² + 2x` |

### Topic 5 · Gemengd: welke regel? (nieuw)

Eén cluster van 12 vragen, functies uit alle vier de topics door elkaar, zonder
hint in de vraag. Dit is de enige plek waar stap 0 echt getoetst wordt. Pas
ontgrendelen als topic 1 t/m 4 beheerst zijn.

Voorbeelden: `(x²−4)/(x+1)` (quotiënt), `(x+1)(x−1)` (uitwerken),
`(x²+1)(x³−x)` (product óf uitwerken, beide goed), `3x⁴ − 2(x+1)²` (uitwerken),
`x² + 1/(x−2)` (som met quotiënt), `(x³−1)²` (product óf uitwerken).

Omdat de leerling hier zelf kiest, moeten bij deze vragen álle correcte vormen
in `answer_alternatives` staan (haakjes laten staan én uitgewerkt).

---

## 3. Antwoordregels per topic

Eén canonieke vorm per topic, plus wat verder als goed geldt. Nu is dit
inconsistent (quotiëntregel soms wel, soms niet vereenvoudigd) en dat moet weg.

| Topic | Canonieke vorm | Ook goed |
| --- | --- | --- |
| Termsgewijs | polynoom in aflopende macht, coëfficiënten in de notatie van de opgave (`1,8x²` blijft decimaal, `⅔x²` blijft breuk) | willekeurige volgorde van termen, `0,5` voor `½` en omgekeerd |
| Haakjes eerst | uitgewerkt polynoom | willekeurige volgorde van termen |
| Productregel | `g′·h + g·h′` met haakjes, in de volgorde van de formule | omgekeerde volgorde van de twee termen; bij 3b ook `2·g′·g`; volledig uitgewerkt polynoom |
| Quotiëntregel | teller uitgewerkt en herleid, noemer als `(…)²` | teller niet-uitgewerkt `g′h − gh′`; noemer uitgewerkt telt níet als fout maar wordt niet als voorbeeld getoond |
| Gemengd | geen voorkeur | alle bovenstaande vormen |

Wat een fout is en zo gemarkeerd wordt in de feedback (root_cause_tags):

- `teken_quotient`: teller met `+` in plaats van `−`, of teller omgedraaid
- `product_als_machtsregel`: `f′ = g′·h′`
- `constante_niet_nul`: constante term blijft staan
- `coefficient_vergeten`: exponent naar voren maar niet vermenigvuldigd
- `haakjes_verkeerd`: fout bij uitwerken van `(ax+b)²` (middenterm vergeten)
- `min_voor_haakjes`: min niet over alle termen verdeeld

---

## 4. Hergebruik van de huidige 57 vragen

Alle huidige vragen passen in de nieuwe clusters; niets hoeft weg.

| Huidig cluster | Nieuw cluster | Actie |
| --- | --- | --- |
| polynoom_differentieren (6) | 1a (2 vragen), 1b (`0,6x³…`, `−2x⁸…+7,2`), 1c (`h(t)`, `k(q)`) | verdelen, aanvullen tot 6–9 per cluster |
| merkwaardige_producten (6) | 2b (4), 2c (`5(x−3)²+5(2x−1)`, `2(3x−2)²+3(2x−1)²`) | verdelen |
| product_uitwerken (6) | 2a (2), 2c (`−3(x−1)(5−9x)−8(x−7)`), 2d (`x(2x−1)²`, `½x³+2x²(x−4)+6`, `5(3x−1)(x³−4x)`) | verdelen |
| twee_polynomen (6) | 3a | ongewijzigd, instructie "haakjes laten staan" toevoegen |
| kwadraat_van_polynoom (6) | 3b (5), 3c (`5 − 3(x⁴−x)(x+1)`) | antwoordvorm `2·2(2x−5)` vervangen door `2(2x−5) + (2x−5)·2`, oude vorm als alternatief |
| drie_factoren (3) | 3d | aanvullen tot 6 |
| eenvoudige_breuk (6) | 4a | ongewijzigd |
| polynoom_breuk (6) | 4b | teller overal uitwerken (nu 5 van 6 niet-uitgewerkt) |
| som_met_breuk (6) | 4c | teller uitwerken bij vraag 4; `− (−3)/(…)²` herschrijven naar `+ 3/(…)²` |

Let op de dubbele functies: `(2x−5)²` en `(3x+1)²` staan nu zowel in
merkwaardige_producten als in kwadraat_van_polynoom met verschillend antwoord.
In de nieuwe opzet blijven ze in 2b; 3b krijgt andere functies, met hogere
graad, zodat uitwerken daar niet de makkelijke weg is.

Stappen (question_steps_new): de 184 bestaande H2-stappen volgen niet het
stappenplan (geen stap 0, wisselende indeling). Die worden herschreven volgens
§1. Opslag: elke vraag heeft precies vier rijen met `step_order` 0 t/m 3. Een
geneste regel (productregel of quotiëntregel binnen de somregel) staat inline
in stap 2, in één zin: "Voor $v$: een product → productregel met $g = …$,
$h = …$, $g' = …$, $h' = …$, dus $v' = …$". Zo blijft het schema ongewijzigd en
past het op de huidige stappenweergave. Bron van alle H2-content is
`scripts/h2-content.ts`; dat script genereert
`supabase/migrations/0032_h2_stappenplan.sql`.

---

## 5. De theoriepagina H2

> **Stand 2026-09-02:** gebouwd als "de methode". `/theorie` toont het
> stroomschema (stap 0 → vijf regelhokjes met hoofdstukbadge → stap 1, 2, 3)
> met voorbeelden per hoofdstuk; `/theorie/h2` toont hetzelfde schema met
> alleen de H2-regels actief, de kettingregel grijs "vanaf H6", een
> voorbeeldkiezer en per regel een paneel met herkenning, antwoordvorm en
> oefen-/videolinks. Data: `src/content/theory/methode.ts`; component:
> `src/app/[locale]/theorie/methode-schema.tsx`. Deep-link naar een voorbeeld
> met `?vb=<index>`. Letters: overal f, g en h; een genest deel heet "even f";
> de kettingregel gebruikt "buitenkant" en "kern". De oorspronkelijke opzet
> hieronder (stappenplankaart + kaarten per topic) is vervangen.


Eén pagina per hoofdstuk, opgebouwd als de video's. Volgorde en inhoud:

1. **Kop** "H2 · De afgeleide berekenen" met één zin: elke som volgt hetzelfde
   stappenplan.
2. **Het stappenplan** als vaste kaart bovenaan: stap 0 met de herkentabel uit
   §1, daarna de drie stappen. Dit is het anker waar elk topic naar terugwijst.
3. **Per topic één blok** in de volgorde 1 → 4, elk met:
   - de regelkaart (groen, zoals in de video's en de oefenkaart);
   - één uitgewerkt voorbeeld in stappenplan-vorm (stap 0 t/m 3, bij 3c en 4c
     met een genest blok);
   - de antwoordafspraak in één zin ("laat de haakjes staan", "werk de teller
     uit, laat de noemer staan");
   - knop naar oefenen in dit topic en, als die er is, de uitlegvideo.
4. **Gemengd** als afsluiting: alleen de herkentabel nogmaals, met vier functies
   en de vraag "welke regel pak je?", uitklapbaar antwoord.

Wat er níet op komt: limietdefinitie, differentiequotiënt, hellinggrafiek,
raaklijn, kettingregel, wortels en negatieve machten. De huidige H2-kaarten
(machtsregel, somregel, productregel, quotiëntregel zonder stappenplan) worden
vervangen.

Voor de data betekent dit dat `THEORY_OVERVIEW` per kaart een `steps`-blok
krijgt met stap 0 t/m 3, en dat de kaarten één op één aan een topic in de
database hangen (`topicSlug`) in plaats van aan een los `id`.

---

## 6. Volgorde van uitvoeren

1. Vragenset H2 herschikken en aanvullen (migratie op dev): nieuwe clusters,
   verplaatsen van bestaande vragen, nieuwe vragen, alle antwoorden in
   canonieke vorm plus alternatieven.
2. Alle H2-stappen herschrijven volgens het stappenplan.
3. Theoriepagina H2 bouwen op de nieuwe datastructuur (§5).
4. Cluster-hint op de oefenkaart (`cluster-rule.tsx`) laten meelopen met de
   nieuwe kaarten, zodat oefenen en theorie dezelfde tekst tonen.
5. Daarna pas H6, H7 en H9 op dezelfde manier.
