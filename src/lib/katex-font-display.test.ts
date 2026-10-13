import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

import postcss from 'postcss'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const katexFontDisplay = require('katex-font-display-postcss') as () => postcss.Plugin

describe('KaTeX-lettertypen', () => {
  it('toont de formule meteen, met een vervangend lettertype', async () => {
    const css = readFileSync('node_modules/katex/dist/katex.min.css', 'utf8')
    const uit = await postcss([katexFontDisplay()]).process(css, {
      from: 'node_modules/katex/dist/katex.min.css',
    })

    expect(uit.css).not.toContain('font-display:block')
    expect(uit.css).toContain('font-display:swap')
    expect(uit.css).toContain('KaTeX_Main')
  })

  it('laat andere stijl met rust', async () => {
    const uit = await postcss([katexFontDisplay()]).process(
      '@font-face{font-display:block;font-family:Anders}',
      { from: 'src/app/globals.css' },
    )
    expect(uit.css).toContain('font-display:block')
  })
})
