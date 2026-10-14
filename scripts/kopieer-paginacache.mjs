/**
 * Zet de vooraf gebouwde pagina's in de statische bestanden van de Worker.
 *
 * `opennextjs-cloudflare build` laat ze in `.open-next/cache` staan.
 * De live site laadt ze alleen uit `.open-next/assets`, en die map vult
 * normaal pas bij `opennextjs-cloudflare deploy`. Workers Builds doet die
 * stap niet. Zonder deze kopie geeft een theoriehoofdstuk 404.
 */
import { cpSync, existsSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const van = path.join(root, '.open-next', 'cache')
const naar = path.join(root, '.open-next', 'assets', 'cdn-cgi', '_next_cache')

if (!existsSync(van)) {
  console.error('Geen .open-next/cache. Draai eerst de OpenNext-build.')
  process.exit(1)
}

cpSync(van, naar, { recursive: true })
console.log('Vooraf gebouwde pagina’s staan in de statische bestanden.')
