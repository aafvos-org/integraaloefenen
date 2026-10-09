/**
 * Prompt-templates voor de AI-laag.
 *
 * De voorbeelden hieronder gaan over integreren en primitiveren, want deze repo
 * is integraaloefenen.nl (`SITE` staat vast op `integralen` in `@/config/site`).
 * Functies heten f, g en h — nooit u of v, zie `AGENTS.md`.
 *
 * Het stappenplan volgt de driedeling van een opgave:
 *   Deel 1 — herken het verhaaltje en vertaal het naar een integraal
 *   Deel 2 — bereken de goede integraal (welke standaardvorm hoort bij deze vorm?)
 *   Deel 3 — gebruik de goede oplossingsmethode op de uitkomst
 * Deel 1 en 3 ontbreken soms, deel 2 zit er altijd in.
 */

import { SITE_CONFIG } from '@/config/site'

/** Gedeelde kop: wie Gemini is en hoe hij moet antwoorden. */
const ROLE_HEADER = `Je bent een wiskundedocent voor VWO-leerlingen die leren ${SITE_CONFIG.subjectVerbNl}.
De site gebruikt de notatie van Getal & Ruimte. Functies heten f, g en h — nooit u of v.
Antwoord ALTIJD in het Nederlands en ALLEEN met geldige JSON (geen Markdown, geen uitleg erbuiten).`

/** Gedeeld: hoe je bepaalt of twee primitieven/uitkomsten hetzelfde zijn. */
const EQUIVALENCE_BLOCK = `=== STAP 1: IS HET WISKUNDIG EQUIVALENT? ===
Bereken of het antwoord van de leerling wiskundig EXACT hetzelfde resultaat geeft als het correcte antwoord.
Werk beide uitdrukkingen volledig uit en vergelijk. Gaat het om een primitieve, differentieer dan
beide antwoorden terug: komen ze allebei op de integrand uit, dan zijn ze equivalent.

Voorbeelden van EQUIVALENTE antwoorden (is_mathematically_correct = true):
- Student: "x^3/3 + C"     →  Correct: "1/3x^3 + c"    →  zelfde breuk, andere letter voor de constante  ✓ EQUIVALENT
- Student: "1/3x^3"        →  Correct: "1/3x^3 + c"    →  alleen de $+c$ ontbreekt, de primitieve klopt  ✓ EQUIVALENT
- Student: "2sqrt(x) + c"  →  Correct: "2x^(1/2) + c"  →  $\\sqrt{x} = x^{1/2}$                           ✓ EQUIVALENT
- Student: "tan^-1(x) + c" →  Correct: "arctan(x) + c" →  andere schrijfwijze van dezelfde functie       ✓ EQUIVALENT
- Student: "0,5pi"         →  Correct: "1/2 pi"        →  $0{,}5\\pi$ is hetzelfde getal als $\\tfrac12\\pi$   ✓ EQUIVALENT

Voorbeelden van NIET-equivalente antwoorden (is_mathematically_correct = false):
- Student: "-cos(2x) + c"    →  Correct: "-1/2cos(2x) + c"  →  terugdifferentiëren geeft $2\\sin(2x)$ i.p.v. $\\sin(2x)$  ✗ FOUT
- Student: "1/4(2x+1)^4 + c" →  Correct: "1/8(2x+1)^4 + c"  →  $\\tfrac14 \\ne \\tfrac18$                                   ✗ FOUT
- Student: "ln(x^2+1) + c"   →  Correct: "arctan(x) + c"    →  verkeerde standaardvorm, dit hoort bij $\\frac{2x}{x^2+1}$  ✗ FOUT`

/** Gedeeld: wanneer een tikfout nog wél als goed telt. */
const TYPO_BLOCK = `Behandel een overduidelijke tik- of spelfout ook als EQUIVALENT, zolang de wiskundige
bedoeling ondubbelzinnig overeenkomt met het correcte antwoord:
- Student: "arctann(x) + c"  →  Correct: "arctan(x) + c"  →  dubbele n is duidelijk een tikfout        ✓ EQUIVALENT
- Student: "-2 cos x + c"    →  Correct: "-2cos(x) + c"   →  haakjes vergeten, bedoeling ondubbelzinnig ✓ EQUIVALENT
Maar alléén als er geen andere wiskundige interpretatie mogelijk is; een andere functienaam,
variabele of ontbrekende term is GEEN tikfout (bijv. $\\arcsin$ i.p.v. $\\arctan$ is gewoon fout).`

/** Gedeeld: het stappenplan in de driedeling van een opgave. */
const STEPS_BLOCK = `3. Schrijf een STAPPENPLAN voor deze specifieke vraag: 3 à 4 stappen.
   Een opgave valt uiteen in drie delen. Benoem per stap welk deel je behandelt, en sla de
   delen over die in deze vraag niet voorkomen (bij een kale "bereken exact"-opgave blijft
   alleen deel 2 over):
   - Deel 1 — vertaal het verhaaltje naar een integraal.
   - Deel 2 — bereken de integraal: welke standaardvorm hoort bij deze vorm? (zit er altijd in)
   - Deel 3 — gebruik de oplossingsmethode op de uitkomst: grenzen invullen, vergelijking oplossen, afronden.
   Gebruik dit exacte formaat:
   - Elke stap is 1 zin: Nederlandse instructie gevolgd door de wiskunde tussen $...$ (inline LaTeX).
   - Noem functies f, g en h, nooit u of v.
   - Voorbeeld stap: "Deel 1 — het vlakdeel tussen de grafiek van $f$, de $x$-as en de lijnen $x = 0$ en $x = 1$ is $\\int_0^1 f(x)\\,dx$."
   - Voorbeeld stap: "Deel 2 — de teller is de afgeleide van de noemer, dus gebruik $\\int \\frac{g'}{g}\\,dx = \\ln|g| + c$ met $g(x) = x^2+1$."
   - Voorbeeld stap: "Deel 2 — invullen geeft $\\int \\frac{2x}{x^2+1}\\,dx = \\ln(x^2+1) + c$."
   - Voorbeeld stap: "Deel 3 — vul de grenzen in: $[\\ln(x^2+1)]_0^1 = \\ln 2 - \\ln 1 = \\ln 2$."
   Gebruik ALTIJD $...$ rond wiskunde, nooit kale tekst-notatie zoals x^2 of F(x) buiten dollartekens.`

export function buildCheckAnswerPromptNew(input: {
  questionBody: string
  correctAnswer: string
  studentAnswer: string
  topicTitle: string
  clusterTitle: string
  stepsAlreadyExist: boolean
}): string {
  return `${ROLE_HEADER}

Context:
- Topic: ${input.topicTitle}
- Cluster: ${input.clusterTitle}
- Vraag: ${SITE_CONFIG.taskPromptNl} ${input.questionBody}
- Correct antwoord: ${input.correctAnswer}
- Antwoord van de leerling: ${input.studentAnswer}

${EQUIVALENCE_BLOCK}

${TYPO_BLOCK}

Als is_mathematically_correct = true: stel alleen is_mathematically_correct=true in, laat de andere velden LEEG ("" / []), en stop.

=== STAP 2 (alleen als het echt fout is) ===
1. Bepaal de categorie van de fout in max 4 woorden Nederlands. Kies een categorie die bij
   integreren hoort, bijvoorbeeld "verkeerde standaardvorm", "exponent niet verhoogd",
   "niet gedeeld door afgeleide", "grenzen verwisseld" of "primitieve fout".
2. Schrijf een uitleg in max 3 zinnen die CONCREET laat zien wat er misging:
   a. Benoem de specifieke stap die fout ging.
   b. Laat de foute berekening zien met de getallen van deze vraag.
   c. Laat de juiste berekening zien, en controleer die door terug te differentiëren.
   Gebruik Nederlandse tekst met wiskundige uitdrukkingen tussen $...$ (inline LaTeX). Vriendelijk, geen aanhef.
   Voorbeeld: "Je nam $\\int \\sin(2x)\\,dx = -\\cos(2x)$, maar terugdifferentiëren geeft $2\\sin(2x)$. Je moet nog delen door de afgeleide van de binnenkant, dus $-\\tfrac12\\cos(2x) + c$."
${input.stepsAlreadyExist
  ? '3. Er is al een stappenplan voor deze vraag — laat solution_steps LEEG ([]).'
  : STEPS_BLOCK}

Antwoord UITSLUITEND met dit JSON-schema:
{
  "is_mathematically_correct": boolean,
  "category": "string (max 4 woorden NL, leeg als is_mathematically_correct=true)",
  "error_explanation": "string (leeg als is_mathematically_correct=true, anders max 3 zinnen NL)",
  "solution_steps": [
    "string (stap 1, concreet met getallen van DEZE vraag)",
    "string (stap 2)",
    "..."
  ]
}`
}

export function buildCheckAnswerPrompt(input: {
  questionBody: string
  correctAnswer: string
  studentAnswer: string
  topicTitle: string
  clusterTitle: string
  rootCauses: Array<{ slug: string; description: string }>
  stepsAlreadyExist: boolean
}): string {
  const rootCauseLines = input.rootCauses
    .map((r) => `- ${r.slug}: ${r.description}`)
    .join('\n')

  return `${ROLE_HEADER}

Context:
- Topic: ${input.topicTitle}
- Cluster: ${input.clusterTitle}
- Vraag: ${SITE_CONFIG.taskPromptNl} ${input.questionBody}
- Correct antwoord: ${input.correctAnswer}
- Antwoord van de leerling: ${input.studentAnswer}

Bekende root causes voor dit topic (kies bij voorkeur een van deze slugs):
${rootCauseLines || '- (geen opgegeven)'}

${EQUIVALENCE_BLOCK}

${TYPO_BLOCK}

Als is_mathematically_correct = true: stel alleen is_mathematically_correct=true in, laat error_explanation LEEG (""), en stop.

=== STAP 2 (alleen als het echt fout is) ===
1. Bepaal de fundamentele fout (root cause). Gebruik bij voorkeur een bestaande slug.
2. Schrijf een uitleg in max 3 zinnen die CONCREET laat zien wat er misging:
   a. Benoem de specifieke stap die fout ging.
   b. Laat de foute berekening zien met de getallen van deze vraag.
   c. Laat de juiste berekening zien, en controleer die door terug te differentiëren.
   Gebruik Nederlandse tekst met wiskundige uitdrukkingen tussen $...$ (inline LaTeX). Vriendelijk, geen aanhef.
   Voorbeeld: "Je nam $\\int \\sin(2x)\\,dx = -\\cos(2x)$, maar terugdifferentiëren geeft $2\\sin(2x)$. Je moet nog delen door de afgeleide van de binnenkant, dus $-\\tfrac12\\cos(2x) + c$."
${input.stepsAlreadyExist
  ? '3. Er is al een stappenplan voor deze vraag — laat solution_steps LEEG ([]).'
  : STEPS_BLOCK}

Antwoord UITSLUITEND met dit JSON-schema:
{
  "is_mathematically_correct": boolean,
  "root_cause": "string (snake_case slug, leeg als is_mathematically_correct=true)",
  "error_explanation": "string (leeg als is_mathematically_correct=true, anders max 3 zinnen NL)",
  "solution_steps": [
    "string (stap 1, concreet met getallen van DEZE vraag)",
    "string (stap 2)",
    "..."
  ]
}`
}
