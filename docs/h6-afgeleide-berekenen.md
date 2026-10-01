# H6 · Machten, wortels en de kettingregel — opzet van theorie en oefenvragen

Vervolg op [h2-afgeleide-berekenen.md](./h2-afgeleide-berekenen.md); alles wat
daar staat over het stappenplan, de letters, de opslag van stappen en de
antwoordregels geldt ook hier. Dit document beschrijft alleen wat H6 toevoegt.

Bron: Getal & Ruimte H6, alleen het rekentechnische deel: §6.2 (opgaven 21–27,
31–37) en §6.3 (43–46, 53–54), diagnostische toets 6, 8 en 9. Buiten scope:
§6.1 (toppen, buigpunten, tweede afgeleide) en §6.4 (aantal oplossingen,
parameters, kromme van toppen).

---

## 1. Wat H6 aan het stappenplan toevoegt

### Stap 0 · drie extra rijen in de herkentabel

| Buitenste schil | Herkenning | Wat je doet |
| --- | --- | --- |
| Getal gedeeld door een macht van $x$ | `6/x³`, `5 − 3/x²` | **Herschrijf** als negatieve macht $ax^{-n}$, dan machtsregel |
| Breuk met één term in de noemer | `(2x−1)/x³`, `(x²+4)/(2x³)` | **Deel uit**, dan termsgewijs. Geen quotiëntregel |
| Wortel van $x$, ook n-de machtswortel, ook $x\sqrt{x}$ | `√x`, `∛(x²)`, `x²·⁴√x` | **Herschrijf** als macht $x^{m/n}$, exponenten optellen, dan machtsregel |
| Haakjes tot een macht, wortel van een expressie, getal gedeeld door een expressie tot een macht | `(4x+3)³`, `√(x²+1)`, `5/(2x³−7x)⁴` | **Kettingregel** |
| Product of quotiënt waarvan één deel een kettingregel vraagt | `x√(2x+1)`, `(x+6)/√(8x+9)` | Productregel of quotiëntregel buiten, kettingregel genest in stap 2 |

Het onderscheid "uitdelen of quotiëntregel" (boekopgave 24) en "macht van $x$
of kettingregel" ($x\sqrt{x}$ tegenover $\sqrt{x^2+1}$) is de kern van stap 0
in dit hoofdstuk en wordt in het gemengde topic expliciet getoetst.

### Stap 1, 2 en 3 voor de nieuwe regels

| Regel | Stap 1 | Stap 2 | Stap 3 |
| --- | --- | --- | --- |
| **Herschrijven** | schrijf als macht van $x$ | machtsregel per term | schrijf terug zonder negatieve of gebroken exponent |
| **Uitdelen** | deel uit tot losse termen | machtsregel per term | schrijf terug zonder negatieve exponent |
| **Kettingregel** | benoem buitenkant en kern | afgeleide van de buitenkant mét de kern erin, en afgeleide van de kern | vermenigvuldig |

### Letters

De kettingregel gebruikt **geen letters** maar de woorden *buitenkant* en
*kern*: "de afgeleide van de buitenkant met de kern erin, keer de afgeleide van
de kern". Het boek schrijft $u(v(x))$, maar $u$ en $v$ zijn al de letters van de
somregel en $g$ en $h$ die van product- en quotiëntregel. Zo botst er niets als
regels genest worden.

---

## 2. Topics en clusters

Per cluster 6 vragen (2 per niveau). Bestaande vragen houden hun id.

### Topic 1 · Machten en wortels herschrijven (`h6_machten`, hertiteld)

| Cluster | Wat oefent het |
| --- | --- |
| Negatieve machten | $a/x^n \to ax^{-n}$, ook in een som en met parameters $a$, $b$ |
| Uitdelen vóór differentiëren | breuk met één term in de noemer splitsen |
| Wortels als macht | $\sqrt{x} = x^{1/2}$, ook $1/\sqrt{x}$ en $x^3\sqrt{x}$ |
| N-de machtswortels *(nieuw)* | $\sqrt[3]{x}$, $\sqrt[4]{x}$, $\sqrt[3]{x^2}$, $x\sqrt[3]{x}$, $x^3\sqrt[5]{x^3}$ |
| Gemengde machten en wortels | $x\sqrt{x}$, $x/\sqrt{x}$, $1/(x\sqrt{x})$, breuk met $x\sqrt{x}$ in de noemer |

### Topic 2 · De kettingregel (`h6_kettingregel`)

| Cluster | Wat oefent het |
| --- | --- |
| Macht met lineaire kern | $(4x+3)^3$, met getal ervoor, met negatieve kern-afgeleide |
| Macht met polynoom-kern | $(x^2+1)^3$, $4(x^3+7x-2)^2$ |
| Wortel met lineaire kern | $\sqrt{4x+1}$, $3\sqrt{2x+1}$, $1/\sqrt{4x-1}$ |
| Wortel met polynoom-kern | $\sqrt{x^2+1}$, $5\sqrt{2x^4+x^2}$ |
| Negatieve macht van een kern | $1/(2x+1)^2$, $5/(2x^3-7x)^4$, $3/\sqrt{2x+1}$ |
| Gebroken macht van een kern *(nieuw)* | $(x^2+3)\sqrt{x^2+3} = (\ldots)^{3/2}$, $\sqrt[3]{x^3+3x}$, $1/((4-x)\sqrt{4-x})$; en "vereenvoudig eerst" bij $(x^2+4)/\sqrt{x^2+4}$ |
| Kettingregel in een som *(nieuw)* | $x^2 + (2x+1)^4$, $5x - 4/(3x+2)^3$, $\sqrt{x^2+9} - x^2 + 5x$ |

De twee som-vragen die nu op niveau 3 van "Macht met lineaire kern" staan
verhuizen naar "Kettingregel in een som".

### Topic 3 · Kettingregel gecombineerd (`h6_combinaties`)

| Cluster | Wat oefent het |
| --- | --- |
| Kettingregel + productregel | $x\sqrt{2x+1}$, $x(2x+1)^3$, $(x+1)(2x-1)^3$ |
| Kettingregel + quotiëntregel | $(x+6)/\sqrt{8x+9}$, $\sqrt{x^2+1}/(2x+1)$, $(2x+1)^2/(x+1)$ |

### Topic 4 · Gemengd: welke regel? (`h6_gemengd`, nieuw)

Twaalf vragen door elkaar uit H2 én H6, zonder hint. Met opzet paren die op
elkaar lijken: $2x^3/(x^2+4)$ (quotiëntregel) naast $(x^2+4)/(2x^3)$
(uitdelen); $\sqrt{5x-2}$ (kettingregel) naast $x\sqrt{x}$ (macht van $x$);
$6/(x^2+1)^2$ (kettingregel, geen quotiëntregel).

---

## 3. Antwoordregels

| Situatie | Canonieke vorm | Ook goed |
| --- | --- | --- |
| Herschrijven, uitdelen, wortels | zonder negatieve of gebroken exponent: breuken en wortels, zoals $-\dfrac{6}{x^2}$ en $\dfrac{1}{2\sqrt{x}}$ | de machtvorm $-6x^{-2}$, $\tfrac{1}{2}x^{-1/2}$ |
| Coëfficiënten uit $\tfrac{3}{2}$, $\tfrac{7}{2}$ … | decimaal zoals de bestaande vragen: $1{,}5\sqrt{x}$, $3{,}5x^2\sqrt{x}$ | de breukvorm |
| Kettingregel | uitvermenigvuldigd: $12(4x+3)^2$, $\dfrac{2}{\sqrt{4x+1}}$, $-\dfrac{4}{(2x+1)^3}$ | het onvereenvoudigde product $3(4x+3)^2 \cdot 4$ |
| Kettingregel + productregel | ingevuld, haakjes en wortels laten staan: $\sqrt{2x+1} + \dfrac{x}{\sqrt{2x+1}}$ | samengenomen tot één breuk |
| Kettingregel + quotiëntregel | ingevuld, noemer als kwadraat: $\dfrac{\sqrt{2x+1} - \dfrac{x}{\sqrt{2x+1}}}{2x+1}$ | vereenvoudigd tot één breuk |

Bij de combinaties is samennemen tot één breuk een aparte vaardigheid
(herleiden met wortels). Die wordt hier niet vereist; de ingevulde formule is
het antwoord, net als "laat de haakjes staan" bij de productregel in H2.

---

## 4. Wat er met de huidige 66 vragen gebeurt

- 65 blijven staan, met antwoorden in de canonieke vorm en alternatieven.
- De vraag $(x^2-1)/(6-x^2)$ in "Uitdelen" had als antwoord de tekst
  "Quotiëntregel: zie h2". Die rij krijgt een echte uitdeelfunctie:
  $h(x) = 6 - (x^2-1)/x$.
- Twee vragen verhuizen van "Macht met lineaire kern" naar "Kettingregel in een som".
- Alle 198 bestaande stappen worden vervangen door het stappenplan (stap 0 t/m 3),
  384 stappen in totaal voor 96 vragen.

Bron van alle H6-content is `scripts/h6-content.ts`; dat script genereert
`supabase/migrations/0033_h6_stappenplan.sql`. De sjablonen en de generator
staan in `scripts/lib/stappenplan-content.ts` en worden gedeeld met H2.

---

## 5. De theoriepagina H6

Zelfde opbouw als H2: hoofdstukintro, stappenplankaart met de herkentabel (de
H2-rijen plus de rijen uit §1) en de tabel stap 1–3 per regel, daarna per topic
een kaart met regelkaart, antwoordafspraak, één of twee voorbeelden in stap
0 t/m 3 en de knop "Oefen dit onderdeel". Het gemengde topic sluit af met een
zelftest van zes functies.

Wat er niet op komt: toppen, buigpunten, tweede afgeleide, aantal oplossingen,
parameters. De huidige twee H6-kaarten (machtsfuncties herschrijven,
kettingregel) worden vervangen.
