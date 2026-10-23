import { describe, expect, it } from 'vitest'

import { VOORBEELDOPGAVEN } from '@/content/theory/voorbeeldopgaven'
import { VOORBEELDEN } from '@/content/voorbeelden'
import { CLUSTER_THEORY, THEORY_OVERVIEW, TOPIC_FORMULA, TOPIC_INTROS } from '@/lib/theory'

import {
  hashInhoud,
  THEORIE_HOOFDSTUK_INHOUD_HASH,
  VOORBEELD_INHOUD_HASH,
} from './sitemap'

/**
 * Deze test rekent geen datums na (dat kan niet automatisch), maar betrapt
 * het geval waarin iemand `content/theory/` of `voorbeelden.ts` aanpast en
 * vergeet de datum in `sitemap.ts` mee te nemen — precies wat er bij INT-419,
 * INT-446 en INT-472 misging. Verandert de inhoud, dan verandert de hash, en
 * faalt deze test tot de datum én de hash in `sitemap.ts` zijn bijgewerkt.
 */
describe('sitemap: lastModified blijft bij de inhoud passen', () => {
  it('theorie-inhoud hoort nog bij THEORIE_HOOFDSTUK_GEWIJZIGD', async () => {
    const hash = await hashInhoud({
      THEORY_OVERVIEW,
      CLUSTER_THEORY,
      TOPIC_FORMULA,
      TOPIC_INTROS,
      VOORBEELDOPGAVEN,
    })
    expect(
      hash,
      'content/theory/ (of lib/theory.ts) is veranderd: werk THEORIE_HOOFDSTUK_GEWIJZIGD ' +
        'én THEORIE_HOOFDSTUK_INHOUD_HASH in src/app/sitemap.ts bij.',
    ).toBe(THEORIE_HOOFDSTUK_INHOUD_HASH)
  })

  it('voorbeeld-inhoud hoort nog bij VOORBEELD_GEWIJZIGD', async () => {
    const hash = await hashInhoud(VOORBEELDEN)
    expect(
      hash,
      'content/voorbeelden.ts is veranderd: werk VOORBEELD_GEWIJZIGD ' +
        'én VOORBEELD_INHOUD_HASH in src/app/sitemap.ts bij.',
    ).toBe(VOORBEELD_INHOUD_HASH)
  })
})
