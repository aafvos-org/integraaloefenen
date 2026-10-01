import { createServiceRoleClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const STANDAARD_LIMIET = 50
const MAX_LIMIET = 500

type FouteStap = {
  stap_nummer: number | null
  omschrijving: string | null
  slordig: boolean
}

type Vraag = {
  vraag_id: string
  volgnummer: number
  goed: boolean | null
  aantal_hints: number
  slordig: boolean
  seconden: number | null
  antwoord: string | null
  beantwoord: string
  foute_stappen: FouteStap[]
}

type Sessie = {
  sessie_id: string
  bezoeker: string
  onderwerp: string | null
  hoofdstuk: string | null
  gestart: string
  geeindigd: string | null
  duur_sec: number | null
  afgerond: boolean
  aantal_vragen: number
  aantal_goed: number
  vragen: Vraag[]
}

function gelijkInConstanteTijd(a: string, b: string): boolean {
  const encoder = new TextEncoder()
  const aBytes = encoder.encode(a)
  const bBytes = encoder.encode(b)
  if (aBytes.length !== bBytes.length) return false
  let verschil = 0
  for (let i = 0; i < aBytes.length; i++) verschil |= aBytes[i] ^ bBytes[i]
  return verschil === 0
}

// Onomkeerbaar, maar stabiel: dezelfde bezoeker houdt hetzelfde pseudoniem
// zolang de salt niet verandert. Zonder de salt is de hash niet terug te
// rekenen naar een user_id.
async function pseudoniem(userId: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${userId}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16)
}

function leesToken(req: Request): string | null {
  const header = req.headers.get('authorization')
  if (!header) return null
  const [schema, waarde] = header.split(' ')
  if (schema?.toLowerCase() !== 'bearer' || !waarde) return null
  return waarde
}

function leesLimiet(ruw: string | null): number | null {
  if (ruw === null) return STANDAARD_LIMIET
  const waarde = Number(ruw)
  if (!Number.isInteger(waarde) || waarde < 1) return null
  return Math.min(waarde, MAX_LIMIET)
}

export async function GET(req: Request) {
  const token = process.env.ANALYSE_TOKEN
  if (!token) {
    return Response.json({ error: 'Niet gevonden.' }, { status: 404 })
  }

  const meegestuurd = leesToken(req)
  if (!meegestuurd || !gelijkInConstanteTijd(meegestuurd, token)) {
    return Response.json({ error: 'Niet toegestaan.' }, { status: 401 })
  }

  const salt = process.env.ANALYSE_SALT
  if (!salt) {
    console.error('ANALYSE_SALT ontbreekt; sessies worden niet uitgeleverd.')
    return Response.json(
      { error: 'ANALYSE_SALT is niet ingesteld.' },
      { status: 500 },
    )
  }

  const params = new URL(req.url).searchParams

  const sinds = params.get('sinds')
  if (sinds !== null && Number.isNaN(Date.parse(sinds))) {
    return Response.json(
      { error: 'Parameter `sinds` is geen geldige ISO-tijd.' },
      { status: 400 },
    )
  }

  const limiet = leesLimiet(params.get('limiet'))
  if (limiet === null) {
    return Response.json(
      { error: 'Parameter `limiet` moet een geheel getal vanaf 1 zijn.' },
      { status: 400 },
    )
  }

  const admin = createServiceRoleClient()

  let sessieQuery = admin
    .from('user_sessions_new')
    .select('id, user_id, topic_id, started_at, ended_at')
    .order('started_at', { ascending: false })
    .limit(limiet)
  if (sinds !== null) sessieQuery = sessieQuery.gte('started_at', sinds)

  const { data: sessieRijen, error: sessieFout } = await sessieQuery
  if (sessieFout) {
    console.error('Sessies ophalen mislukt:', sessieFout)
    return Response.json({ error: 'Ophalen mislukt.' }, { status: 500 })
  }
  if (!sessieRijen || sessieRijen.length === 0) {
    return Response.json({ sessies: [] })
  }

  const topicIds = [
    ...new Set(
      sessieRijen
        .map((rij) => rij.topic_id)
        .filter((id): id is string => id !== null),
    ),
  ]

  const { data: topicRijen, error: topicFout } = topicIds.length
    ? await admin
        .from('topics_new')
        .select('id, title, chapter_id')
        .in('id', topicIds)
    : { data: [], error: null }
  if (topicFout) {
    console.error('Onderwerpen ophalen mislukt:', topicFout)
    return Response.json({ error: 'Ophalen mislukt.' }, { status: 500 })
  }
  const topics = new Map((topicRijen ?? []).map((rij) => [rij.id, rij]))

  const chapterIds = [
    ...new Set((topicRijen ?? []).map((rij) => rij.chapter_id)),
  ]
  const { data: chapterRijen, error: chapterFout } = chapterIds.length
    ? await admin.from('chapters').select('id, title').in('id', chapterIds)
    : { data: [], error: null }
  if (chapterFout) {
    console.error('Hoofdstukken ophalen mislukt:', chapterFout)
    return Response.json({ error: 'Ophalen mislukt.' }, { status: 500 })
  }
  const chapters = new Map(
    (chapterRijen ?? []).map((rij) => [rij.id, rij.title]),
  )

  const sessieIds = sessieRijen.map((rij) => rij.id)
  const { data: antwoordRijen, error: antwoordFout } = await admin
    .from('session_answers_new')
    .select(
      'id, session_id, question_id, user_answer, is_correct, hints_used, is_careless, time_spent_sec, answered_at',
    )
    .in('session_id', sessieIds)
    .order('answered_at', { ascending: true })
  if (antwoordFout) {
    console.error('Antwoorden ophalen mislukt:', antwoordFout)
    return Response.json({ error: 'Ophalen mislukt.' }, { status: 500 })
  }
  const antwoorden = antwoordRijen ?? []

  const antwoordIds = antwoorden.map((rij) => rij.id)
  const { data: foutRijen, error: foutFout } = antwoordIds.length
    ? await admin
        .from('step_mistakes_new')
        .select('answer_id, step_id, is_careless')
        .in('answer_id', antwoordIds)
    : { data: [], error: null }
  if (foutFout) {
    console.error('Foute stappen ophalen mislukt:', foutFout)
    return Response.json({ error: 'Ophalen mislukt.' }, { status: 500 })
  }
  const fouten = foutRijen ?? []

  const stapIds = [...new Set(fouten.map((rij) => rij.step_id))]
  const { data: stapRijen, error: stapFout } = stapIds.length
    ? await admin
        .from('question_steps_new')
        .select('id, step_order, step_description')
        .in('id', stapIds)
    : { data: [], error: null }
  if (stapFout) {
    console.error('Stappen ophalen mislukt:', stapFout)
    return Response.json({ error: 'Ophalen mislukt.' }, { status: 500 })
  }
  const stappen = new Map((stapRijen ?? []).map((rij) => [rij.id, rij]))

  const foutenPerAntwoord = new Map<string, FouteStap[]>()
  for (const fout of fouten) {
    const stap = stappen.get(fout.step_id)
    const lijst = foutenPerAntwoord.get(fout.answer_id) ?? []
    lijst.push({
      stap_nummer: stap?.step_order ?? null,
      omschrijving: stap?.step_description ?? null,
      slordig: fout.is_careless,
    })
    foutenPerAntwoord.set(fout.answer_id, lijst)
  }

  const vragenPerSessie = new Map<string, Vraag[]>()
  for (const antwoord of antwoorden) {
    const lijst = vragenPerSessie.get(antwoord.session_id) ?? []
    lijst.push({
      vraag_id: antwoord.question_id,
      volgnummer: lijst.length + 1,
      goed: antwoord.is_correct,
      aantal_hints: antwoord.hints_used,
      slordig: antwoord.is_careless,
      seconden: antwoord.time_spent_sec,
      antwoord: antwoord.user_answer,
      beantwoord: antwoord.answered_at,
      foute_stappen: foutenPerAntwoord.get(antwoord.id) ?? [],
    })
    vragenPerSessie.set(antwoord.session_id, lijst)
  }

  const sessies: Sessie[] = await Promise.all(
    sessieRijen.map(async (rij): Promise<Sessie> => {
      const topic = rij.topic_id ? topics.get(rij.topic_id) : undefined
      const vragen = vragenPerSessie.get(rij.id) ?? []
      return {
        sessie_id: rij.id,
        bezoeker: await pseudoniem(rij.user_id, salt),
        onderwerp: topic?.title ?? null,
        hoofdstuk: topic ? (chapters.get(topic.chapter_id) ?? null) : null,
        gestart: rij.started_at,
        geeindigd: rij.ended_at,
        duur_sec: rij.ended_at
          ? Math.round(
              (Date.parse(rij.ended_at) - Date.parse(rij.started_at)) / 1000,
            )
          : null,
        afgerond: rij.ended_at !== null,
        aantal_vragen: vragen.length,
        aantal_goed: vragen.filter((vraag) => vraag.goed === true).length,
        vragen,
      }
    }),
  )

  return Response.json({ sessies })
}
