#!/usr/bin/env node
/**
 * Zet in `supabase/config.toml` de onderdelen uit die de e2e-controle niet
 * gebruikt. Alleen voor de automatische controle (CI) — op je eigen computer
 * blijft alles aan staan, inclusief Studio.
 *
 * Waarom dit nodig is: `supabase start -x realtime,storage-api,...` start die
 * containers niet, maar haalt de images wél op. Dat kost in de controle een
 * halve minuut aan downloads voor containers die daarna stilstaan. Staat een
 * onderdeel in de config uit, dan wordt er niets opgehaald.
 *
 * De test heeft alleen de database, inloggen (auth) en de data-API nodig.
 * De eigen SMTP-afzender gaat hier ook uit: die wijst naar Resend en haalt
 * zijn wachtwoord uit een omgevingsvariabele die in de controle niet bestaat.
 */
import { readFileSync, writeFileSync } from 'node:fs'

if (!process.env.CI) {
  console.error(
    'Dit script hoort alleen in de automatische controle thuis: het verandert supabase/config.toml.',
  )
  process.exit(1)
}

// De kopjes waarvan het eerste `enabled` op false mag. Onderkopjes (zoals
// [storage.s3_protocol]) hebben een eigen naam en blijven dus met rust.
const UIT = new Set([
  'studio',
  'storage',
  'realtime',
  'analytics', // logflare en vector
  'edge_runtime',
  'local_smtp', // de testmailbox
  'auth.email.smtp', // de echte afzender via Resend
])

const pad = 'supabase/config.toml'
const regels = readFileSync(pad, 'utf8').split('\n')

let kopje = null
const uitgezet = []

const nieuw = regels.map((regel) => {
  const kop = /^\s*\[([^\]]+)\]/.exec(regel)
  if (kop) kopje = kop[1]

  if (kopje && UIT.has(kopje) && /^\s*enabled\s*=\s*true\s*$/.test(regel)) {
    uitgezet.push(kopje)
    UIT.delete(kopje) // alleen de eerste regel onder het kopje
    return 'enabled = false'
  }
  return regel
})

writeFileSync(pad, nieuw.join('\n'))
console.log(`Uitgezet voor deze controle: ${uitgezet.join(', ')}`)
