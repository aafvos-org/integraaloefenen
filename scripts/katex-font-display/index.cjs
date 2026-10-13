/**
 * KaTeX zet font-display op block. Dan blijft een formule onzichtbaar tot het
 * lettertype binnen is. Swap toont meteen een vervangend lettertype.
 */
function katexFontDisplay() {
  return {
    postcssPlugin: 'katex-font-display',
    Once(root, { result }) {
      const from = String(result.opts.from ?? '')
      if (!from.includes('katex.min.css')) return
      root.walkDecls('font-display', (decl) => {
        if (decl.value === 'block') decl.value = 'swap'
      })
    },
  }
}

katexFontDisplay.postcss = true

module.exports = katexFontDisplay
