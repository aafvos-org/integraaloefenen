#!/usr/bin/env node
// Schrijft de tekst van de release-pull-request (volgende -> main) naar
// stdout. Draait in .github/workflows/release.yml, maar je kunt hem ook zelf
// draaien om te zien wat er in de release zit:
//
//   GH_TOKEN=$(gh auth token) node scripts/release-tekst.mjs
//
// Nodig: een volledige kloon (git log over main..volgende) en een token dat
// de pull requests mag lezen.

import { execFileSync } from 'node:child_process'

const repo = process.env.GH_REPO ?? 'aafvos-org/integraaloefenen'
const token = process.env.GH_TOKEN
const basis = process.env.BASIS ?? 'origin/main'
const tak = process.env.TAK ?? 'origin/volgende'
const voorbeeld =
  process.env.VOORBEELD ?? 'https://volgende-integraaloefenen.alhvos.workers.dev'

// Alles wat een leerling niet ziet. Staat er in een pull request ook maar één
// bestand buiten deze lijst, dan heet hij "zichtbaar": bij twijfel liever een
// keer te veel laten nakijken dan een keer te weinig.
const ONDER_DE_MOTORKAP = [
  /^\.github\//,
  /^\.vscode\//,
  /^scripts\//,
  /^e2e\//,
  /^docs\//,
  /\.md$/,
  /\.test\.tsx?$/,
  /^supabase\/seed\.sql$/,
  /^supabase\/config\.toml$/,
  /^package(-lock)?\.json$/,
  /^tsconfig[^/]*\.json$/,
  /^wrangler\.jsonc$/,
  /^[a-z]+\.config\.[a-z]+$/,
  /^\.gitignore$/,
  /^\.npmrc$/,
]

function git(...argumenten) {
  return execFileSync('git', argumenten, { encoding: 'utf8' }).trimEnd()
}

async function api(pad) {
  const antwoord = await fetch(`https://api.github.com${pad}`, {
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'user-agent': 'integraaloefenen-release',
    },
  })
  if (!antwoord.ok) {
    throw new Error(`GitHub gaf ${antwoord.status} op ${pad}`)
  }
  return antwoord.json()
}

// De bestanden van een pull request, hoogstens vijf pagina's. Zijn het er
// meer, dan weten we het niet zeker en noemen we hem zichtbaar.
async function bestandenVan(nummer) {
  const alles = []
  for (let pagina = 1; pagina <= 5; pagina += 1) {
    const stuk = await api(`/repos/${repo}/pulls/${nummer}/files?per_page=100&page=${pagina}`)
    alles.push(...stuk.map((bestand) => bestand.filename))
    if (stuk.length < 100) return { bestanden: alles, volledig: true }
  }
  return { bestanden: alles, volledig: false }
}

function ticketUit(...teksten) {
  for (const tekst of teksten) {
    const gevonden = /INT-\d+/i.exec(tekst ?? '')
    if (gevonden) return gevonden[0].toUpperCase()
  }
  return null
}

function isZichtbaar({ bestanden, volledig }) {
  if (!volledig || bestanden.length === 0) return true
  return !bestanden.every((naam) => ONDER_DE_MOTORKAP.some((patroon) => patroon.test(naam)))
}

function regel({ ticket, titel, url, nummer }) {
  const kop = ticket ? `${ticket} — ` : ''
  return `- ${kop}[${titel}](${url}) (#${nummer})`
}

async function main() {
  // Zonder de samenvoegcommits: die van de release zelf en die van
  // terug-naar-volgende horen niet in de lijst thuis.
  const commits = git('log', '--no-merges', '--format=%s', `${basis}..${tak}`)
    .split('\n')
    .filter(Boolean)

  const nummers = []
  const zonderPullRequest = []
  for (const onderwerp of commits) {
    const gevonden = /\(#(\d+)\)\s*$/.exec(onderwerp)
    if (gevonden) nummers.push(Number(gevonden[1]))
    else zonderPullRequest.push(onderwerp)
  }

  const zichtbaar = []
  const motorkap = []
  for (const nummer of nummers) {
    const pr = await api(`/repos/${repo}/pulls/${nummer}`)
    const lijst = {
      nummer,
      titel: pr.title,
      url: pr.html_url,
      ticket: ticketUit(pr.head?.ref, pr.title, pr.body),
    }
    const bestanden = await bestandenVan(nummer)
    if (isZichtbaar(bestanden)) zichtbaar.push(lijst)
    else motorkap.push(lijst)
  }

  const migraties = git('diff', '--name-only', `${basis}...${tak}`, '--', 'supabase/migrations/')
    .split('\n')
    .filter(Boolean)

  const stukken = [
    '**Merge met "Create a merge commit", niet met squash.** Met squash krijgt',
    '`main` één nieuwe commit die `volgende` niet kent, en dan lopen de twee',
    'takken uit elkaar.',
    '',
    `Voorbeeldversie van \`volgende\`: ${voorbeeld}`,
    '',
    '## Zichtbaar voor leerlingen',
    '',
    zichtbaar.length > 0
      ? zichtbaar.map(regel).join('\n')
      : 'Niets: deze release verandert niets aan wat een leerling ziet.',
    '',
    '## Onder de motorkap',
    '',
    motorkap.length > 0
      ? motorkap.map(regel).join('\n')
      : 'Niets.',
  ]

  if (zonderPullRequest.length > 0) {
    stukken.push(
      '',
      '## Zonder pull request',
      '',
      zonderPullRequest.map((onderwerp) => `- ${onderwerp}`).join('\n'),
    )
  }

  stukken.push(
    '',
    '## Migraties',
    '',
    migraties.length > 0
      ? `${migraties.map((naam) => `- \`${naam}\``).join('\n')}\n\nDe Ontwikkelaar draait deze pas nadat de release op \`main\` staat, als ze iets veranderen of weghalen.`
      : 'Geen migraties in deze release.',
    '',
    '## Nalopen',
    '',
    '- [ ] De voorbeeldversie hierboven opent, je kunt inloggen en een opgave nakijken.',
    '- [ ] Wat onder "Zichtbaar voor leerlingen" staat, klopt op die voorbeeldversie.',
    '- [ ] De vier verplichte controles op deze pull request zijn groen.',
    '- [ ] Mergen met **Create a merge commit**.',
  )

  process.stdout.write(`${stukken.join('\n')}\n`)
}

await main()
