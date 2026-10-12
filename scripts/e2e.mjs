#!/usr/bin/env node
/**
 * `npm run test:e2e` — draait de Playwright-tests tegen de LOKALE Supabase.
 *
 * Waarom een scriptje en niet gewoon `playwright test`: de sleutels van de
 * lokale Supabase horen niet in de repo. Dit script vraagt ze op bij de CLI
 * (`supabase status`) en geeft ze door aan de tests. Draait er geen lokale
 * Supabase, dan stopt het met uitleg in plaats van per ongeluk tegen de echte
 * database te testen.
 */
import { spawnSync } from 'node:child_process'

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'

/** Haalt de gegevens van de lokale Supabase op; null als die niet draait. */
function lokaleSupabase() {
  const res = spawnSync(npx, ['supabase', 'status', '-o', 'env'], {
    encoding: 'utf8',
  })
  if (res.status !== 0) return null

  /** @type {Record<string, string>} */
  const waarden = {}
  for (const regel of (res.stdout ?? '').split('\n')) {
    const m = /^([A-Z0-9_]+)="(.*)"$/.exec(regel.trim())
    if (m) waarden[m[1]] = m[2]
  }
  return waarden.API_URL ? waarden : null
}

const supabase = lokaleSupabase()
if (!supabase) {
  console.error(
    [
      '',
      'Er draait geen lokale Supabase.',
      '',
      '  Starten:          npx supabase start',
      '  Verse database:   npx supabase db reset',
      '',
    ].join('\n'),
  )
  process.exit(1)
}

const host = new URL(supabase.API_URL).hostname
if (!['localhost', '127.0.0.1', '::1'].includes(host)) {
  console.error(
    `\nDe e2e-tests draaien alleen tegen een lokale Supabase, niet tegen ${supabase.API_URL}.\n`,
  )
  process.exit(1)
}

// De testpostbus (Mailpit) van diezelfde lokale Supabase. Daar levert de site
// zijn eigen mail af zolang MAIL_MODE=postbus aan staat, en daar haalt
// e2e/postbus.ts hem weer op.
const postbus = supabase.INBUCKET_URL ?? 'http://127.0.0.1:54324'

const env = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: supabase.API_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: supabase.ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: supabase.SERVICE_ROLE_KEY,
  // Geen echte Gemini en geen statistieken in de tests.
  AI_CHECK_MODE: 'stub',
  GEMINI_API_KEY: '',
  // En geen echte mail: wat de site zelf verstuurt (welkomstmail, seintje,
  // vraag, video-verzoek) gaat naar de testpostbus. De lege RESEND_API_KEY is
  // het vangnet daaronder: raakt die schakelaar ooit kwijt, dan mislukt het
  // versturen in plaats van dat er echt post de deur uit gaat.
  MAIL_MODE: 'postbus',
  MAIL_POSTBUS_URL: postbus,
  E2E_POSTBUS_URL: postbus,
  RESEND_API_KEY: '',
  // Het seintje over een nieuwe aanmelding gaat normaal naar Aaf; in de test
  // naar een adres dat niet bestaat, zodat het in de postbus blijft liggen.
  NOTIFY_EMAIL: 'aaf@test.local',
  // Vaste afzender, zodat de test hem kan nakijken ook als er in .env.local
  // iets anders staat. Zelfde waarde als in supabase/config.toml.
  EMAIL_FROM: 'no-reply@integraaloefenen.nl',
  // De triggers uit migratie 0043 roepen /api/webhooks/* aan met deze header.
  // Zelfde waarde als in supabase/seed.sql, en geen geheim: hij bestaat
  // alleen op je eigen computer.
  WEBHOOK_SECRET: 'lokaal-webhook-geheim',
}

const run = spawnSync(npx, ['playwright', 'test', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env,
})
process.exit(run.status ?? 1)
