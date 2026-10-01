# K.3 · Cyclometrische functies — opgaven en uitwerkingen

Letterlijke extractie van **alle** opgaven en antwoorden van paragraaf 3 van
hoofdstuk K (Getal & Ruimte, Voortgezette integraalrekening).

| Bron | Bestand | Bladzijden |
| --- | --- | --- |
| Opgaven | `Hoofdstuk_K.pdf` | 197 t/m 206 (pdf-pagina's 18–28) |
| Antwoorden | `Uitwerkingen_HS_K.pdf` | 32–33 (pdf-pagina's 3–4) |

Paragraaf K.3 loopt van **opgave 30 t/m 49**. De diagnostische toets heeft nog
drie K.3-opgaven (7, 8, 9); die staan onderaan in §3.

> **Let op bij de bron.** Beide pdf's zijn foto's van boekpagina's zonder
> tekstlaag; alles hieronder is visueel overgenomen, niet met OCR. De
> opgavenummers dragen de prefix die in het boek staat (`R`, `O`, `A`).
> Een `*` in de uitwerkingen betekent dat het boek daar geen kort antwoord
> geeft (bewijs-, uitleg- of invulopgave).

---

## 1. Opgaven met antwoord

### Opgave 30 · bladzijde 197

> **Opgavetekst ontbreekt in de scan.** De foto van bladzijde 197
> (pdf-pagina 18) is bijgesneden en begint bij "Theorie A De functie
> \(f(x)=\arctan(x)\)". De oriëntatie-opgave 30 staat daarboven en is
> weggevallen. Het is — net als opgave 43 — een invulopgave die de
> substitutie \(x=\tan(t)\) stap voor stap narekent.

**Uitwerking (volledig in de antwoorden):**

\[
\int_{0}^{\frac14\pi}\frac{1}{\tan^{2}(t)+1}\cdot\bigl(\tan^{2}(t)+1\bigr)\,dt
=\int_{0}^{\frac14\pi} 1\,dt=\bigl[\,t\,\bigr]_{0}^{\frac14\pi}=\tfrac14\pi
\]

---

### Opgave R31 · bladzijde 199

- **a** Waarom is \(\arctan(\tfrac13\sqrt{3})\) niet gelijk aan \(1\tfrac16\pi\), terwijl \(\tan(1\tfrac16\pi)=\tfrac13\sqrt{3}\)?
- **b** Waarom is \(x=\tan(\sqrt{3})\) geen oplossing van de vergelijking \(\arctan(x)=\sqrt{3}\)?
- **c** Zie de uitwerking van voorbeeld **d**. Licht de factor \(\tfrac14\) in de primitieve toe.

**Antwoord:** a `*` · b `*` · c `*` (uitlegopgaven, geen kort antwoord in de uitwerkingen).

---

### Opgave 32 · bladzijde 199

Vul de tabel in en leer hem uit het hoofd.

| \(x\) | \(-\sqrt{3}\) | \(-1\) | \(-\tfrac13\sqrt{3}\) | \(0\) | \(\tfrac13\sqrt{3}\) | \(1\) | \(\sqrt{3}\) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| \(\arctan(x)\) | \(-\tfrac13\pi\) | \(-\tfrac14\pi\) | \(-\tfrac16\pi\) | \(0\) | \(\tfrac16\pi\) | \(\tfrac14\pi\) | \(\tfrac13\pi\) |

---

### Opgave 33 · bladzijde 199

Los algebraïsch op. Rond zo nodig af op drie decimalen.

| | Opgave | Antwoord |
| --- | --- | --- |
| a | \(\arctan(x)=\tfrac13\pi\) | \(x=\sqrt{3}\) |
| b | \(\arctan(x-2)=-\tfrac14\pi\) | \(x=1\) |
| c | \(\arctan(x^{2}-1)=\tfrac14\pi\) | \(x=\sqrt{2}\ \vee\ x=-\sqrt{2}\) |
| d | \(\arctan(x)=\tfrac23\pi\) | geen oplossing |
| e | \(\arctan(x)=\sqrt{2}\) | \(x\approx 6{,}334\) |
| f | \(\arctan(x^{2}-1)=1\) | \(x\approx 1{,}599\ \vee\ x=-1{,}599\) |

---

### Opgave 34 · bladzijde 200

Differentieer.

| | Opgave | Antwoord |
| --- | --- | --- |
| a | \(f(x)=2\arctan(\tfrac12 x)\) | \(f'(x)=\dfrac{4}{x^{2}+4}\) |
| b | \(g(x)=\arctan(x-2)\) | \(g'(x)=\dfrac{1}{x^{2}-4x+5}\) |
| c | \(h(x)=\arctan(x^{2})\) | \(h'(x)=\dfrac{2x}{x^{4}+1}\) |

---

### Opgave 35 · bladzijde 200

Bereken exact.

| | Opgave | Antwoord |
| --- | --- | --- |
| a | \(\displaystyle\int_{-\frac13\sqrt{3}}^{\sqrt{3}}\frac{1}{x^{2}+1}\,dx\) | \(\tfrac12\pi\) |
| b | \(\displaystyle\int_{-2}^{-1}\frac{1}{(x+1)^{2}+1}\,dx\) | \(\tfrac14\pi\) |
| c | \(\displaystyle\int_{0}^{\frac13\sqrt{3}}\frac{3}{9x^{2}+1}\,dx\) | \(\tfrac13\pi\) |

---

### Opgave 36 · bladzijde 200

| | Opgave | Antwoord |
| --- | --- | --- |
| a | Los de vergelijking \(\arctan(2x-1)=\tfrac16\pi\) exact op. | \(x=\tfrac12+\tfrac16\sqrt{3}\) |
| b | Los de vergelijking \(\arctan(1\tfrac12\pi+\sqrt{x})=\sqrt{2}\) algebraïsch op. Rond af op twee decimalen. | \(x\approx 2{,}63\) |
| c | Differentieer \(f(x)=\arctan(2x^{2}+1)\). | \(f'(x)=\dfrac{2x}{2x^{4}+2x^{2}+1}\) |
| d | Bereken exact \(\displaystyle\int_{\frac15}^{\frac15\sqrt{3}}\frac{10}{25x^{2}+1}\,dx\). | \(\tfrac16\pi\) |

---

### Opgave O37 · bladzijde 200

Gegeven is de functie \(f(x)=\dfrac{10}{x^{2}+4}\).
Om de primitieven van \(f\) te berekenen, schrijf je \(f\) in de vorm
\(f(x)=\dfrac{a}{(bx)^{2}+1}\).

| | Opgave | Antwoord |
| --- | --- | --- |
| a | Bereken \(a\) en \(b\). | \(a=2\tfrac12\) en \(b=\tfrac12\) |
| b | Primitiveer \(f\). | \(F(x)=5\arctan(\tfrac12 x)+c\) |

---

### Opgave 38 · bladzijde 201

Primitiveer.

| | Opgave | Antwoord |
| --- | --- | --- |
| a | \(f(x)=\dfrac{5}{32x^{2}+2}\) | \(F(x)=\tfrac58\arctan(4x)+c\) |
| b | \(g(x)=\dfrac{4}{x^{2}+4}\) | \(G(x)=2\arctan(\tfrac12 x)+c\) |
| c | \(h(x)=\dfrac{5}{x^{2}+6x+10}\) | \(H(x)=5\arctan(x+3)+c\) |
| d | \(j(x)=\dfrac{3}{x^{2}+4x+5}\) | \(J(x)=3\arctan(x+2)+c\) |

> Zetfout in de uitwerkingen: daar staat bij **c** én **d** `J(x)`. Bij **c**
> hoort `H(x)`, passend bij de functie \(h\) in de opgave.

---

### Opgave 39 · bladzijde 201

Bereken exact.

| | Opgave | Antwoord |
| --- | --- | --- |
| a | \(\displaystyle\int_{0}^{1}\frac{3}{x^{2}+3}\,dx\) | \(\tfrac16\pi\sqrt{3}\) |
| b | \(\displaystyle\int_{0}^{1}\frac{2x}{x^{4}+1}\,dx\) | \(\tfrac14\pi\) |
| c | \(\displaystyle\int_{3}^{6}\frac{5}{x^{2}-6x+18}\,dx\) | \(\tfrac{5}{12}\pi\) |
| d | \(\displaystyle\int_{0}^{\sqrt{3}}\frac{\arctan(x)}{x^{2}+1}\,dx\) | \(\tfrac{1}{18}\pi^{2}\) |

---

### Opgave A40 · bladzijde 202

Bereken exact.

| | Opgave | Antwoord |
| --- | --- | --- |
| a | \(\displaystyle\int_{0}^{1\frac12}\frac{2}{4x^{2}+9}\,dx\) | \(\tfrac{1}{12}\pi\) |
| b | \(\displaystyle\int_{0}^{\frac12\ln(3)}\frac{e^{x}}{e^{2x}+1}\,dx\) | \(\tfrac{1}{12}\pi\) |
| c | \(\displaystyle\int_{0}^{1}\frac{1}{4x^{2}-4x+2}\,dx\) | \(\tfrac14\pi\) |
| d | \(\displaystyle\int_{0}^{\frac12\pi}\frac{\sin(x)}{\cos^{2}(x)+1}\,dx\) | \(\tfrac14\pi\) |

---

### Opgave A41 · bladzijde 202

Gegeven is de functie \(f(x)=\dfrac{10}{x^{2}-8x+17}\). Zie figuur K.11.

| | Opgave | Antwoord |
| --- | --- | --- |
| a | Bereken exact het maximum van \(f\). | max. is \(f(4)=10\) |
| b | Bereken exact de oppervlakte van het vlakdeel \(V\) dat ingesloten wordt door de grafiek van \(f\), de \(x\)-as en de lijnen \(x=4\) en \(x=5\). | \(2\tfrac12\pi\) |
| c | Het vlakdeel \(W_p\) wordt ingesloten door de grafiek van \(f\), de \(x\)-as en de lijnen \(x=4\) en \(x=p\) met \(p>4\). Bereken exact de waarde van \(p\) in het geval dat \(O(W_p)=10\). | \(p=4+\tan(1)\) |

---

### Opgave A42 · bladzijde 202

Het vlakdeel \(V_p\) wordt ingesloten door de grafiek van de functie
\(f(x)=\dfrac{4}{x\ln^{2}(x)+x}\), de \(x\)-as en de lijnen \(x=1\) en \(x=p\)
met \(p>1\). Zie figuur K.12.
Bereken exact voor welke \(p\) de oppervlakte van \(V_p\) gelijk is aan \(\pi\).

**Antwoord:** \(p=e\)

---

### Opgave O43 · bladzijde 202

In deze opgave ga je \(\displaystyle\int_{0}^{\frac12}\frac{1}{\sqrt{1-x^{2}}}\,dx\)
exact berekenen. Stel \(x=\sin(t)\) met \(-\tfrac12\pi<t<\tfrac12\pi\) en vul in.

\[
\int_{0}^{\frac12}\frac{1}{\sqrt{1-x^{2}}}\,dx
=\int_{t=\ldots}^{t=\ldots}\frac{1}{\sqrt{1-\sin^{2}(t)}}\,d\sin(t)
=\int_{\ldots}^{\ldots}\frac{1}{\sqrt{\cos^{2}(t)}}\cdot\cos(t)\,dt
=\int_{\ldots}^{\ldots}\frac{1}{\cos(t)}\cdot\cos(t)\,dt
=\int_{\ldots}^{\ldots}1\,dt=\bigl[\ldots\bigr]_{\ldots}^{\ldots}=\ldots
\]

**Uitwerking:**

\[
\int_{t=0}^{t=\frac16\pi}\frac{1}{\sqrt{1-\sin^{2}(t)}}\,d\sin(t)
=\int_{0}^{\frac16\pi}\frac{1}{\sqrt{\cos^{2}(t)}}\cdot\cos(t)\,dt
=\int_{0}^{\frac16\pi}\frac{1}{\cos(t)}\cdot\cos(t)\,dt
=\int_{0}^{\frac16\pi}1\,dt=\bigl[\,t\,\bigr]_{0}^{\frac16\pi}=\tfrac16\pi
\]

---

### Opgave 44 · bladzijde 204

Vul de tabel in.

| \(x\) | \(-1\) | \(-\tfrac12\sqrt{3}\) | \(-\tfrac12\sqrt{2}\) | \(-\tfrac12\) | \(0\) | \(\tfrac12\) | \(\tfrac12\sqrt{2}\) | \(\tfrac12\sqrt{3}\) | \(1\) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| \(\arcsin(x)\) | \(-\tfrac12\pi\) | \(-\tfrac13\pi\) | \(-\tfrac14\pi\) | \(-\tfrac16\pi\) | \(0\) | \(\tfrac16\pi\) | \(\tfrac14\pi\) | \(\tfrac13\pi\) | \(\tfrac12\pi\) |

---

### Opgave 45 · bladzijde 204

Los algebraïsch op. Rond zo nodig af op drie decimalen.

| | Opgave | Antwoord |
| --- | --- | --- |
| a | \(\arcsin(x)=\tfrac12\pi\) | \(x=1\) |
| b | \(\arcsin(x)=-\tfrac16\pi\) | \(x=-\tfrac12\) |
| c | \(\arcsin(x)=2\) | geen oplossing |
| d | \(3\arcsin(x-\sqrt{3})=\pi\) | \(x=1\tfrac12\sqrt{3}\approx 2{,}598\) |

---

### Opgave 46 · bladzijde 204

Bereken exact.

| | Opgave | Antwoord |
| --- | --- | --- |
| a | \(\displaystyle\int_{\frac16}^{\frac16\sqrt{3}}\frac{1}{\sqrt{1-9x^{2}}}\,dx\) | \(\tfrac{1}{18}\pi\) |
| b | \(\displaystyle\int_{-1\frac12\sqrt{2}}^{1\frac12\sqrt{2}}\frac{1}{\sqrt{9-x^{2}}}\,dx\) | \(\tfrac12\pi\) |
| c | \(\displaystyle\int_{0}^{\frac12\sqrt{2}}\frac{x}{\sqrt{1-x^{4}}}\,dx\) | \(\tfrac{1}{12}\pi\) |
| d | \(\displaystyle\int_{0}^{1}\frac{x}{\sqrt{4-x^{4}}}\,dx\) | \(\tfrac{1}{12}\pi\) |

---

### Opgave 47 · bladzijde 204

Bereken met behulp van partieel integreren de primitieven.

| | Opgave | Antwoord |
| --- | --- | --- |
| a | \(f(x)=\arctan(x)\) | \(F(x)=x\arctan(x)-\tfrac12\ln(x^{2}+1)+c\) |
| b | \(g(x)=\arcsin(x)\) | \(G(x)=x\arcsin(x)+\sqrt{1-x^{2}}+c\) |

---

### Opgave A48 · bladzijde 205

Primitiveer.

| | Opgave | Antwoord |
| --- | --- | --- |
| a | \(f(x)=\dfrac{\arcsin(x)}{\sqrt{1-x^{2}}}\) | \(F(x)=\tfrac12\arcsin^{2}(x)+c\) |
| b | \(g(x)=\dfrac{1}{x\sqrt{1-\ln^{2}(x)}}\) | \(G(x)=\arcsin(\ln(x))+c\) |

---

### Opgave A49 · bladzijde 205

Gegeven is de functie \(f(x)=\dfrac{x}{\sqrt{25-x^{4}}}\).

| | Opgave | Antwoord |
| --- | --- | --- |
| a | Bereken exact het domein van \(f\) en schets de grafiek van \(f\). | \(D_f=\langle-\sqrt{5},\sqrt{5}\rangle\); grafiek met verticale asymptoten \(x=-\sqrt{5}\) en \(x=\sqrt{5}\) |
| b | Los exact op \(f(x)\le\tfrac13 x\). | \(-\sqrt{5}<x\le-2\ \vee\ 0\le x\le 2\) |
| c | Bereken exact de oppervlakte van het vlakdeel \(V\) dat wordt ingesloten door de grafiek van \(f\), de \(x\)-as en de lijn \(x=\tfrac12\sqrt{10}\). | \(\tfrac{1}{12}\pi\) |

---

## 2. Theorie van K.3 (voor de context)

Drie kaders uit de paragraaf, letterlijk:

**Theorie A — de functie \(f(x)=\arctan(x)\)**

> De functie \(f(x)=\arctan(x)\) is de inverse functie van de functie
> \(g(x)=\tan(x)\) met \(D_g=\langle-\tfrac12\pi,\tfrac12\pi\rangle\).
> Er geldt \(D_f=\mathbb{R}\) en \(B_f=\langle-\tfrac12\pi,\tfrac12\pi\rangle\).

\[
f(x)=\frac{1}{x^{2}+1}\ \text{geeft}\ F(x)=\arctan(x)+c
\qquad
g(x)=\arctan(x)\ \text{geeft}\ g'(x)=\frac{1}{x^{2}+1}
\]

**Theorie B — de arctangensfunctie en primitiveren**

\(\displaystyle\int\frac{1}{u^{2}+1}\,du=\arctan(u)+c\), en een primitieve van
\(f(ax+b)\) is \(\tfrac1a F(ax+b)\). Bij een noemer zonder duidelijke vorm:
eerst **kwadraatafsplitsen** (voorbeeld bladzijde 201:
\(x^{2}-4x+8=(x-2)^{2}+4\)).

**Theorie C — de functie \(f(x)=\arcsin(x)\)**

> De functie \(f(x)=\arcsin(x)\) is de inverse van de functie \(g(x)=\sin(x)\)
> met \(D_g=[-\tfrac12\pi,\tfrac12\pi]\).
> Er geldt \(D_f=[-1,1]\) en \(B_f=[-\tfrac12\pi,\tfrac12\pi]\).

\[
f(x)=\frac{1}{\sqrt{1-x^{2}}}\ \text{geeft}\ F(x)=\arcsin(x)+c
\qquad
g(x)=\arcsin(x)\ \text{geeft}\ g'(x)=\frac{1}{\sqrt{1-x^{2}}}
\]

---

## 3. Diagnostische toets — K.3-opgaven

Bladzijde 224–225 (`Hoofdstuk_K.pdf` pdf-pagina 29), antwoorden op bladzijde 35
van de uitwerkingen (pdf-pagina 5).

**Opgave 7 — Bereken exact.**

| | Opgave | Antwoord |
| --- | --- | --- |
| a | \(\displaystyle\int_{0}^{2\sqrt{3}}\frac{4}{x^{2}+4}\,dx\) | \(\tfrac23\pi\) |
| b | \(\displaystyle\int_{1}^{2}\frac{1}{x^{2}-2x+2}\,dx\) | \(\tfrac14\pi\) |
| c | \(\displaystyle\int_{-1}^{1}\frac{3x^{2}}{x^{6}+1}\,dx\) | \(\tfrac12\pi\) |
| d | \(\displaystyle\int_{0}^{1}\frac{\arctan^{2}(x)}{x^{2}+1}\,dx\) | \(\tfrac{1}{192}\pi^{3}\) |

**Opgave 8 —** Gegeven is de functie \(f(x)=\dfrac{1}{x^{2}-4x+5}\). Zie figuur K.31.

| | Opgave | Antwoord |
| --- | --- | --- |
| a | Bereken exact de oppervlakte van het vlakdeel \(V\) dat wordt ingesloten door de grafiek van \(f\) en de lijn \(y=\tfrac12\). | \(\tfrac12\pi-1\) |
| b | Het vlakdeel \(W\) wordt ingesloten door de grafiek van \(f\), de \(x\)-as en de lijnen \(x=2\) en \(x=p\) met \(p>2\) waarbij \(O(W)=\tfrac13\pi\). Bereken exact de waarde van \(p\). | \(p=2+\sqrt{3}\) |

**Opgave 9 — Primitiveer.**

| | Opgave | Antwoord |
| --- | --- | --- |
| a | \(f(x)=\dfrac{1}{\sqrt{1-4x^{2}}}\) | \(F(x)=\tfrac12\arcsin(2x)+c\) |
| b | \(g(x)=\dfrac{5x^{4}}{\sqrt{1-x^{10}}}\) | \(G(x)=\arcsin(x^{5})+c\) |

---

## 4. Wat nog open staat

- **Opgave 30**: de opgavetekst ontbreekt in de scan van bladzijde 197
  (bijgesneden foto). De uitwerking staat er wel. Een nieuwe foto van de
  bovenkant van bladzijde 197 maakt de set compleet.
- **Opgaven met `*`** (R31 a/b/c) hebben in het uitwerkingenboek geen kort
  antwoord; voor de vragenbank moeten die uitlegteksten zelf geschreven worden.
- Opgaven 32 en 44 zijn tabellen uit het hoofd; die passen beter als
  drill-kaartjes dan als gewone vraag.
