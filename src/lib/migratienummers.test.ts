import { readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

// =====================================================================
// Elk bestand in supabase/migrations/ hoort een eigen nummer te hebben.
//
// Twee bestanden met hetzelfde nummer (0058_….sql én nog een 0058_….sql)
// laten een lege database niet starten. Deze test draait mee in `npm test`,
// dus zo'n paar komt niet meer op main.
// =====================================================================

const MIGRATIES = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../supabase/migrations',
)

describe('migratienummers', () => {
  it('geeft elk bestand in supabase/migrations een eigen nummer', () => {
    const bestanden = readdirSync(MIGRATIES).filter((naam) => naam.endsWith('.sql'))
    expect(bestanden.length).toBeGreaterThan(0)

    const perNummer = new Map<string, string[]>()
    for (const naam of bestanden) {
      const nummer = naam.split('_')[0]
      if (!/^\d{4}$/.test(nummer)) {
        throw new Error(`${naam} begint niet met vier cijfers`)
      }
      const lijst = perNummer.get(nummer) ?? []
      lijst.push(naam)
      perNummer.set(nummer, lijst)
    }

    const dubbel = [...perNummer.entries()].filter(([, lijst]) => lijst.length > 1)
    if (dubbel.length > 0) {
      const tekst = dubbel
        .map(([nummer, lijst]) => `${nummer} staat op ${lijst.join(' en ')}`)
        .join('; ')
      throw new Error(`Twee migraties hebben hetzelfde nummer. ${tekst}`)
    }
  })
})
