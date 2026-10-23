import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { answersMatch } from '@/lib/practice/engine'
import { STARTPAGINA_VRAGEN } from '@/lib/practice/startpagina-demo'

describe('home-demo placeholder verklapt niets', () => {
  const teksten = JSON.parse(
    readFileSync(join(process.cwd(), 'messages/nl.json'), 'utf8'),
  ) as { HomeDemo: Record<string, string> }
  const placeholder = teksten.HomeDemo.placeholder.replace(/^Bijv\.\s*/, '')

  it.each(Object.entries(STARTPAGINA_VRAGEN))(
    'is geen goed antwoord voor de %s-som',
    (_niveau, vraag) => {
      expect(answersMatch(placeholder, vraag.goed)).toBe(false)
    },
  )
})
