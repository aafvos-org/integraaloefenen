# K.1 · De substitutiemethode — opzet van theorie en oefenvragen

Specificatie voor de theoriepagina van **Hoofdstuk K, §1** én de bijbehorende
vragenset op IntegraalOefenen.nl. Bron: Getal & Ruimte, voortgezette
integraalrekening — **K.1 / 8.1 De substitutiemethode** (onbepaald, bepaald,
en lichte toepassingen die dezelfde techniek vragen).

Alles wat **geen** substitutie nodig heeft (standaardprimitieven, alleen
\(f(ax+b)\) uit de voorkennis) valt bewust buiten deze opzet — dat is
voorkennis, geen K.1-stof. Latere paragrafen (partiële integratie, splitsen,
…) horen hier nog niet.

Leidend principe: **elke opgave, elke theoriekaart en elke uitwerking volgt
hetzelfde stappenplan.** Stap 0 is de typekeuze; stappen 2–3 zijn de enige
echte herkenningsbeslissingen; de rest is systematisch invullen. Zo hoeft de
leerling alleen dit plan te leren en kan het altijd toepassen.

> **Status:** oude specificatie (fase 1 wipe-plan), op twee punten ingehaald.
> Er komt geen DB-wipe: de content van hoofdstuk K wordt per theorieblok
> toegevoegd. En het stappenplan van stap 0 t/m 7 hieronder is vervangen door
> het vaste plan van vier stappen (`step_order` 0 t/m 3) dat de hele site
> gebruikt. Wat er nu echt staat voor Theorie A:
> [`k1a-primitiveren-en-de-kettingregel.md`](k1a-primitiveren-en-de-kettingregel.md).
> De herkenregels en de clusterindeling hieronder blijven bruikbaar als
> achtergrond voor Theorie B en verder.

---

## 1. Het stappenplan

Kernregel uit het boek: als \(u\) een functie van \(x\) is, dan geldt

\[
\int f(u)\cdot u'\,dx = \int f(u)\,du = F(u)+c.
\]

### Stap 0 · Wat vraagt de opgave?

Lees de opdracht en kies **één** type. Dit bepaalt het eindantwoord, niet de
rekenroute.

| Type | Signalen | Einddoel |
| --- | --- | --- |
| **A. Primitiveer** | “Primitiveer”, “bepaal een primitieve”, \(F(x)=\ldots\) | Functie \(+\,c\) |
| **B. Bereken exact** | \(\displaystyle\int_a^b\ldots\,dx\), “bereken exact” | Exacte uitdrukking / getal |
| **C. Toepassing** | oppervlakte, volume, “vlakdeel”, verhaaltje | Eerst de juiste integraal opschrijven, daarna A of B |

Bij **C**: schrijf de integraal expliciet op vóór stap 1.

### Stap 1 · Schrijf de integraal schoon

1. Alles onder één integraalteken.
2. Wortels en breuken als machten waar het helpt:
   \(\sqrt{u}=u^{1/2}\), \(\frac{1}{\sqrt{u}}=u^{-1/2}\), \(\frac{1}{u}=u^{-1}\).
3. Splits sommen/verschillen **alleen** als elk stuk apart gaat **zonder**
   substitutie. Anders: bij elkaar houden.

### Stap 2 · Herken: is dit substitutie?

Zoek of de integrand er zo uitziet:

> \(f(\text{binnenste})\cdot(\text{afgeleide van binnenste})\),
> eventueel met een constante factor ertussen.

Checklist:

1. Samengesteld blok? (macht, wortel, \(\sin/\cos/\ln/e\) van een uitdrukking)
2. Factor erbuiten die op de afgeleide van dat blok lijkt?
3. Past de graad/macht? (stap 3)

- Ja → substitutie, ga door.
- Nee → voorkennis (standaardprimitieven / \(f(ax+b)\)). Dat is **geen** K.1-route.

### Stap 3 · Kies \(u\)

#### 3a. Machten en wortels (hoofdpatroon)

**Regel:** \(u =\) het **binnenste blok** — vaak de uitdrukking met de
**hoogste macht**, onder de wortel, of in de noemer.

| Schets | Kies \(u\) |
| --- | --- |
| \(x\cdot(\ldots x^2\ldots)^n\) | wat tussen de haakjes staat |
| \(x^3/\sqrt{x^4+\ldots}\) | wat onder de wortel / in de macht staat |
| \(\dfrac{\text{iets met }x}{x^2+\ldots}\) | vaak de noemer |

Bereken \(u'\). **Controle:** staat \(u'\,dx\) in de integraal (op een
constante na)?

- Ja → factor kloppend maken, bv. \(6x = 3\cdot 2x\).
- Nee → andere \(u\), of géén directe substitutie
  (tegenvoorbeeld: \(6x(x^3+1)^5\) — \(u'=3x^2\) past niet bij \(6x\)).

#### 3b. Gonio / \(\ln\) / \(e\) (zelfde paragraaf)

Alleen als 3a niet past:

| Situatie | Vaak \(u\) | Extra |
| --- | --- | --- |
| \(\tan x = \sin x/\cos x\) | \(u=\cos x\) | \(\sin x\,dx \to -du\) |
| \(\sin^n x\) / \(\cos^n x\) (oneven) | de “andere” gonio | \(1-\sin^2\) / \(1-\cos^2\) |
| \((\ln x)^k / x\) | \(u=\ln x\) | \(du = \frac{1}{x}dx\) |
| \(x\,e^{-x^2}\) e.d. | exponent / binnenste | check \(u'\) |

### Stap 4 · Herschrijf tot \(\int f(u)\,du\)

Vaste volgorde:

1. Passende factor = constante \(\times u'\).
2. Binnenste → \(u\).
3. \(u'\,dx\) → \(du\) (of \(d(\ldots)\)-notatie).
4. **Geen \(x\) meer** in de integraal. Anders: \(x\) in \(u\) uitdrukken
   (bv. \(\sqrt{x+4}=u \Rightarrow x=u^2-4\)), of foute \(u\).

### Stap 5 · Primitiveer naar \(u\)

Alleen standaardregels: \(\int u^n\,du\), \(\int\frac{1}{u}\,du=\ln|u|+c\),
som term voor term. Geen nieuwe truc.

### Stap 6 · Terug naar \(x\) of grenzen omzetten

- **Type A:** \(u\) terugsubstitutie, eindig met \(+c\).
- **Type B:** óf nieuwe grenzen in \(u\), óf eerst \(F(x)\) en dan invullen.
- Lineaire binnenkant: \(\int_p^q f(ax+b)\,dx = \bigl[\frac{1}{a}F(ax+b)\bigr]_p^q\) mag.

### Stap 7 · Check

1. Type A: differentieer — krijg je de integrand terug?
2. Type B: exact laten staan; grenzen logisch?
3. Constante factor / min-teken nagelopen?

### Voorbeeld A (macht) — volledig

\[
\int 6x(x^2+1)^5\,dx
\]

```
Stap 0 · Primitiveer → type A (+c)
Stap 1 · Al schoon; schrijf desnoods (x²+1)^5 · 6x
Stap 2 · Binnenste (x²+1)^5 én factor met x → substitutie
Stap 3 · u = x²+1, u' = 2x. 6x = 3·2x → past
Stap 4 · ∫ 3 u^5 du
Stap 5 · (3/6) u^6 + c = (1/2) u^6 + c
Stap 6 · (1/2)(x²+1)^6 + c
Stap 7 · F' = 6x(x²+1)^5 ✓
```

### Voorbeeld B (bepaald, gonio-idee)

Bij \(\int \cos^3 x\,dx\)-achtige sommen: herschrijf, \(u=\sin x\), grenzen
meenemen (stap 6 route 1). Zelfde stapnummers; stap 3b i.p.v. 3a.

---

## 2. Topics en clusters

Per cluster: minimaal **6** vragen (2 per niveau), streefgetal **9**.
Niveau 1 = één duidelijke \(u\), kleine constanten. Niveau 2 = factor
herschrijven, mintekens, wortels als macht. Niveau 3 = gonio/ln/e, of \(x\)
nog uitdrukken in \(u\), of bepaalde integraal met nieuwe grenzen.

Voorbeelden hieronder zijn **nieuw** in boekstijl (niet letterlijk uit het
boek). Antwoorden in canonieke vorm (§3).

Chapter in DB later: `slug = 'k'`, titel bv. `K — Voortgezette integraalrekening`,
`site = 'integralen'`. Topics alleen K.1:

### Topic 1 · Macht- en wortelsubstitutie — `k1_macht_wortel`

| Cluster | Wat oefent het | Voorbeelden (primitieven) |
| --- | --- | --- |
| 1a Macht met \(u'=\) lineair in \(x\) | \(u=x^2+\ldots\), factor \(x\) | \(\int 2x(x^2+4)^3\,dx \to \tfrac{1}{2}(x^2+4)^4+c\) · \(\int 6x\sqrt{x^2+1}\,dx \to 4(x^2+1)^{3/2}+c\) · \(\int x(3x^2-4)^3\,dx \to \tfrac{1}{24}(3x^2-4)^4+c\) |
| 1b Hogere graad in \(u'\) | \(u=x^3+\ldots\), \(u=x^4+\ldots\) | \(\int 6x^2(x^3-1)^4\,dx \to \tfrac{2}{5}(x^3-1)^5+c\) · \(\int \frac{10x^3}{\sqrt{x^4+7}}\,dx \to 5\sqrt{x^4+7}+c\) · \(\int 3x^2\sin(x^3-1)\,dx \to -\cos(x^3-1)+c\) |
| 1c Factor kloppend maken | constante ≠ 1 vóór \(u'\) | \(\int 6x(x^2+1)^5\,dx \to \tfrac{1}{2}(x^2+1)^6+c\) · \(\int \frac{6x}{3x^2+2}\,dx \to \ln\|3x^2+2\|+c\) · \(\int 4x(2x^2-1)^3\,dx \to \tfrac{1}{4}(2x^2-1)^4+c\) |

Uitwerking: altijd Stap 0–7; bij 1c expliciet “\(6x=3\cdot 2x\)” in stap 3/4.

### Topic 2 · Noemer / \(\frac{1}{u}\) — `k1_noemer`

| Cluster | Wat oefent het | Voorbeelden |
| --- | --- | --- |
| 2a \(u\) in de noemer | \(\int u'/u\) | \(\int \frac{2x}{x^2+1}\,dx \to \ln(x^2+1)+c\) · \(\int \frac{6x}{3x^2+2}\,dx \to \ln\|3x^2+2\|+c\) · \(\int \frac{x}{x^2+9}\,dx \to \tfrac{1}{2}\ln(x^2+9)+c\) |
| 2b Wortel in noemer | \(u^{-1/2}\) e.d. | \(\int \frac{x}{\sqrt{x^2+1}}\,dx \to \sqrt{x^2+1}+c\) · \(\int \frac{2x}{\sqrt{5-x^2}}\,dx \to -2\sqrt{5-x^2}+c\) |

### Topic 3 · Gonio-substitutie — `k1_gonio`

| Cluster | Wat oefent het | Voorbeelden |
| --- | --- | --- |
| 3a \(\tan\) via \(\cos\) | \(u=\cos x\) | \(\int \tan x\,dx \to -\ln\|\cos x\|+c\) · \(\int \tan(2x)\,dx \to -\tfrac{1}{2}\ln\|\cos(2x)\|+c\) |
| 3b Oneven macht \(\sin\)/\(\cos\) | Pythagoreïsche herschrijf | \(\int \sin^3 x\,dx \to -\cos x + \tfrac{1}{3}\cos^3 x+c\) · \(\int \cos^3 x\,dx \to \sin x - \tfrac{1}{3}\sin^3 x+c\) |

### Topic 4 · \(\ln\) en \(e\) — `k1_ln_e`

| Cluster | Wat oefent het | Voorbeelden |
| --- | --- | --- |
| 4a \(\ln\)-machten / \(1/x\) | \(u=\ln x\) | \(\int \frac{\ln x}{x}\,dx \to \tfrac{1}{2}(\ln x)^2+c\) · \(\int \frac{(\ln x)^2}{x}\,dx \to \tfrac{1}{3}(\ln x)^3+c\) |
| 4b \(e\) met polynoom-exponent | \(u=\) exponent | \(\int x e^{-x^2}\,dx \to -\tfrac{1}{2}e^{-x^2}+c\) · \(\int 2x e^{x^2}\,dx \to e^{x^2}+c\) |

### Topic 5 · Bepaalde integralen — `k1_bepaald`

Zelfde technieken; stap 6 = grenzen in \(u\) (voorkeur) of \(F(x)\) invullen.

| Cluster | Wat oefent het | Voorbeelden |
| --- | --- | --- |
| 5a Grenzen meenemen | \(u(a), u(b)\) | \(\int_0^{1/8\pi}\tan(2x)\,dx \to \tfrac{1}{4}\ln 2\) · \(\int_{1/4\pi}^{1/2\pi}\sin^3 x\,dx\) (exact vereenvoudigd) |
| 5b Lineaire kern \(ax+b\) | snellere \(\frac{1}{a}\)-regel mag | \(\int_0^{1/9\pi}\tan(3x)\,dx \to \tfrac{1}{3}\ln 2\) |

### Topic 6 · Gemengd: welke \(u\)? — `k1_gemengd` (later / afsluiter)

Alleen herkenning + korte uitwerking; mix van topics 1–5. Optioneel in fase 1b.

### Bewust níet in K.1-vragenbank

- Alleen \(\int x^n\,dx\) zonder samengesteld blok (voorkennis).
- “Substitutie” als **vergelijking** \(e^{2x}-5e^x+6=0\) (oude H11-tab vergelijkingen).
- Partiële integratie, breuksplitsen, omgekeerde ketting zonder \(u'\) in beeld.

---

## 3. Canonieke antwoorden

- Type A: altijd \(+c\); machten vereenvoudigd; wortels mag als \(u^{1/2}\) of \(\sqrt{u}\) (beide als alternatief opnemen als ze voorkomen).
- \(\int\frac{1}{u}\,du = \ln|u|+c\); absolute waarde aanhouden tenzij \(u>0\) op het interval evident is.
- \(\int\tan x\,dx = -\ln\|\cos x\|+c\) (canonieke vorm); \(+\ln\|\sec x\|\) als alternatief.
- Type B: exact (\(\ln\), wortels, \(\pi\)); geen rekenmachine-afronding.
- Variabele van de opgave respecteren (\(t\), \(q\), …).

---

## 4. Opslag in DB en scripts

De bouwstenen en de SQL-generator staan in `scripts/lib/stappenplan-content.ts`:

| Veld | Afspraak K.1 |
| --- | --- |
| `site` | `integralen` |
| `chapters.slug` | `k` |
| `topics_new.slug` | `k1_macht_wortel`, `k1_noemer`, `k1_gonio`, `k1_ln_e`, `k1_bepaald`, (opt) `k1_gemengd` |
| `question_steps_new` | **altijd** `step_order` **0 t/m 7**, vaste titels = Stap 0…Stap 7 hierboven |
| Lege stappen | Niet weglaten: korte zin (“n.v.t. — al schoon”) i.p.v. gat in de nummering |

Tekst in elke step_description begint met het steekje, bv.
`Stap 3 · Kies \(u=x^2+1\). Dan \(u'=2x\); herschrijf \(6x=3\cdot 2x\).`

Later: `scripts/k1-content.ts` genereert de migration (nog niet bouwen in deze
fase). Eerst wipe van oude `site='integralen'`-H11-content via aparte migration.

---

## 5. De theoriepagina

De oude methode-pagina (het stappenschema van de afgeleiden-site) is weg.
Aaf heeft op 12 oktober 2026 gekozen om die niet te vullen voor integralen.
`methode-schema.tsx`, de tak die alleen liep als `METHODE` gevuld was, de
bijbehorende vertaalsleutels en de afgeleiden-types (`RegelId` en zo) staan
niet meer in de code.

`/theorie` toont de kaarten uit `THEORY_OVERVIEW` in
`src/content/theory/integralen.ts`. Nieuwe uitleg hoort daar, als hoofdstuk
met kaarten en een stappenplan, niet als een teruggezet schema.

De formuleringen op de theoriekaart, de oefen-hint en `question_steps_new`
blijven hetzelfde.

---

## 6. Volgorde van uitvoeren

1. Deze spec reviewen en stapnummering **bevriezen**.
2. Theorie vullen in `integralen.ts` als kaarten (zie §5), niet als methode-schema.
3. Wipe-migration: alle content met `site = 'integralen'` (H11) — na backup.
4. `scripts/k1-content.ts` + migration: chapter `k`, topics/clusters/vragen/stappen.
5. Check-agent: eindantwoord vs oplossingen-PDF **én** “volgt Stap 0–7?”.
6. Productie: migrations + spot-check `/theorie` en één oefenpad.

---

## Snelkeuze (voor op de theoriekaart)

1. Type A / B / C?
2. Binnenste + \(u'\) erbij? → substitutie
3. \(u\) = binnenste / hoogste blok; check factor
4. \(\int f(u)\,du\) → primitiveer → terug of grenzen
5. Check
