import { describe, expect, it } from 'vitest'

import { THEORY_OVERVIEW } from './integralen'
import { controleerPrimitieve, latexNaarFormule } from './narekenen.testhulp'
import { VOORBEELDOPGAVEN } from './voorbeeldopgaven'

// =====================================================================
// De vaste voorbeeldopgaven op de theoriepagina worden nagerekend.
//
// Een bezoeker ziet deze opgaven rechtstreeks, dus een omgedraaid teken of
// een factor te veel mag niet ongemerkt live gaan. Per opgave:
//
//   • `opgave` moet `Primitiveer: $f(x) = …$.` zijn en `antwoord`
//     `$F(x) = … + c$`; past het niet, dan wordt de test rood in plaats
//     van dat hij de opgave overslaat.
//   • F wordt teruggedifferentieerd en naast f gelegd op een rij
//     x-waarden, net als in `integralen.test.ts`.
//   • het antwoord moet woordelijk in de stappen terugkomen, zodat een
//     tikfout in de uitwerking niet naast een goed eindantwoord blijft staan.
//   • de sleutel van de lijst moet een hoofdstuk uit THEORY_OVERVIEW zijn,
//     anders zoekt de pagina de opgaven tevergeefs op.
// =====================================================================

/** `Primitiveer: $f(x) = …$.` — de formule is wat er tussen de $-tekens staat. */
const OPGAVE = /^Primitiveer: \$f\(x\) = ([^$]+)\$\.$/

/** `$F(x) = … + c$` — de integratieconstante hoort erbij en telt niet mee. */
const ANTWOORD = /^\$F\(x\) = ([^$]+) \+ c\$$/

const OPGAVEN = Object.entries(VOORBEELDOPGAVEN).flatMap(([slug, lijst]) =>
  lijst.map((opgave, i) => ({ slug, opgave, sleutel: `${slug}#${i + 1} (${opgave.bron})` })),
)

describe('de voorbeeldopgaven op de theoriepagina', () => {
  it('staan onder een hoofdstuk dat bestaat', () => {
    const hoofdstukken = THEORY_OVERVIEW.map((hoofdstuk) => hoofdstuk.slug)
    for (const slug of Object.keys(VOORBEELDOPGAVEN)) {
      expect(hoofdstukken, `\`${slug}\` is geen hoofdstuk uit THEORY_OVERVIEW`).toContain(slug)
    }
  })

  it('zijn er om na te rekenen', () => {
    expect(OPGAVEN.length).toBeGreaterThan(0)
  })

  for (const { opgave, sleutel } of OPGAVEN) {
    it(`${sleutel}: het antwoord klopt`, () => {
      const vraag = OPGAVE.exec(opgave.opgave)
      expect(vraag, `${sleutel}: \`${opgave.opgave}\` is geen \`Primitiveer: $f(x) = …$.\``).not.toBeNull()
      const uitkomst = ANTWOORD.exec(opgave.antwoord)
      expect(uitkomst, `${sleutel}: \`${opgave.antwoord}\` is geen \`$F(x) = … + c$\``).not.toBeNull()

      const problemen = controleerPrimitieve(
        latexNaarFormule((vraag as RegExpExecArray)[1]),
        latexNaarFormule((uitkomst as RegExpExecArray)[1]),
        sleutel,
      )
      if (problemen.length > 0) expect.fail(problemen.join('\n'))
    })

    it(`${sleutel}: de stappen eindigen op datzelfde antwoord`, () => {
      expect(opgave.stappen.length).toBeGreaterThan(0)
      expect(
        opgave.stappen.some((stap) => stap.includes(opgave.antwoord)),
        `${sleutel}: \`${opgave.antwoord}\` staat in geen van de stappen`,
      ).toBe(true)
    })
  }
})
