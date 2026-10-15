import { cookies, headers } from 'next/headers'
import { cache } from 'react'

import { loadChapters, type ChapterInfo } from '@/lib/practice/chapter-overview'

import { LEERLING_KOP } from './leerling-kop'
import { heeftInlogsessie } from './sessie-cookie'
import { createClient } from './server'

/**
 * Per-request gedeelde ophalers.
 *
 * De header en de pagina eronder renderen in dezelfde doorloop, maar vroegen
 * allebei los de ingelogde gebruiker, zijn profiel en de hoofdstukken op. Dat
 * waren drie keer zoveel round trips naar Supabase als nodig, allemaal na
 * elkaar. `cache()` van React houdt het resultaat vast binnen één request, dus
 * de tweede en derde aanroep kosten niets meer.
 *
 * Let op: dit werkt alleen binnen dezelfde render. De middleware draait als een
 * aparte aanroep en deelt deze cache dus niet.
 */

export const getCurrentUser = cache(async () => {
  const jar = await cookies()
  if (!heeftInlogsessie(jar.getAll())) return null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

/**
 * Het id van de ingelogde leerling, zonder tweede ronde naar Supabase Auth.
 *
 * De middleware heeft de sessie al nagekeken en het id op het verzoek gezet.
 * Ontbreekt die kop (een openbare pagina, of een aanroep buiten de
 * middleware), dan valt dit terug op de gewone controle.
 */
export const getIngelogdeLeerlingId = cache(async (): Promise<string | null> => {
  const id = (await headers()).get(LEERLING_KOP)
  if (id) return id
  const user = await getCurrentUser()
  return user?.id ?? null
})

export type CurrentProfile = {
  display_name: string | null
  username: string | null
  role: string | null
  tour_seen_at: string | null
}

/**
 * Eén profielquery met alle kolommen die de header en de pagina's samen nodig
 * hebben. Losse queries per kolom zouden goedkoper lijken, maar de kosten
 * zitten in de round trip, niet in de breedte van de rij.
 */
export const getCurrentProfile = cache(
  async (): Promise<CurrentProfile | null> => {
    const userId = await getIngelogdeLeerlingId()
    if (!userId) return null

    const supabase = await createClient()
    const { data } = await supabase
      .from('profiles')
      .select('display_name, username, role, tour_seen_at')
      .eq('id', userId)
      .maybeSingle()

    return (data as CurrentProfile | null) ?? null
  },
)

export const getChapters = cache(async (): Promise<ChapterInfo[]> => {
  const supabase = await createClient()
  return loadChapters(supabase)
})
