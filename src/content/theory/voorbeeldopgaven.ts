/**
 * Vaste voorbeeldopgaven op de openbare theoriepagina.
 * Eigen vragen uit content/hoofdstuk-k (geen boekopgaven).
 * De tekst staat in de HTML; de stappen zitten in <details>, zodat een
 * zoekmachine ze leest zonder dat de leerling ze meteen ziet.
 */

export type Voorbeeldopgave = {
  /** Herkomst, bijvoorbeeld "k3a std-1". */
  bron: string
  /** Zin met $...$ */
  opgave: string
  stappen: string[]
  /** Zin met $...$ */
  antwoord: string
}

export const VOORBEELDOPGAVEN: Record<string, Voorbeeldopgave[]> = {
  k3: [
    {
      bron: 'k3a std-1',
      opgave: 'Primitiveer: $f(x) = \\dfrac{1}{x^{2} + 1}$.',
      stappen: [
        'Alleen deel 2 speelt hier: bereken de goede integraal. De noemer is precies $x^{2} + 1$.',
        'Herschrijven hoeft niet. De standaardvorm $\\dfrac{1}{x^{2} + 1}$ geeft $\\arctan(x)$.',
        'Het antwoord is $F(x) = \\arctan(x) + c$. Differentieer $F$ en je krijgt $f$ terug.',
      ],
      antwoord: '$F(x) = \\arctan(x) + c$',
    },
    {
      bron: 'k3a std-2',
      opgave: 'Primitiveer: $f(x) = \\dfrac{5}{x^{2} + 1}$.',
      stappen: [
        'Alleen deel 2 speelt hier. De noemer is precies $x^{2} + 1$, met een getal in de teller.',
        'Haal de $5$ naar voren: $f(x) = 5 \\cdot \\dfrac{1}{x^{2} + 1}$. Dat getal blijft staan.',
        'Het antwoord is $F(x) = 5\\arctan(x) + c$. Differentieer $F$ en je krijgt $f$ terug.',
      ],
      antwoord: '$F(x) = 5\\arctan(x) + c$',
    },
    {
      bron: 'k3c st-1',
      opgave: 'Primitiveer: $f(x) = \\dfrac{3}{\\sqrt{1 - x^{2}}}$.',
      stappen: [
        'Alleen deel 2 speelt hier. Onder de wortel staat $1 - x^{2}$, dus dit wordt $\\arcsin$.',
        'De kern is al $x$. Zet de $3$ erbuiten: $3 \\cdot \\dfrac{1}{\\sqrt{1 - x^{2}}}$ geeft $3\\arcsin(x)$.',
        'Het antwoord is $F(x) = 3\\arcsin(x) + c$. Differentieer $F$ en je krijgt $f$ terug.',
      ],
      antwoord: '$F(x) = 3\\arcsin(x) + c$',
    },
  ],
}
