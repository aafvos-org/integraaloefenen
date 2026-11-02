import { NextResponse } from 'next/server'

import { heeftAlEenAntwoord } from '@/lib/practice/heeft-al-een-antwoord'
import { getIngelogdeLeerlingId } from '@/lib/supabase/request-cache'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Of de balk "Maak je eerste som" moet (INT-731): alleen voor een ingelogde
 * leerling die nog geen enkel antwoord heeft opgeslagen. Theorie-pagina's
 * zijn statisch (SEO), dus die vragen dit client-side op in plaats van de
 * pagina zelf dynamisch te maken.
 */
export async function GET() {
  const userId = await getIngelogdeLeerlingId()
  if (!userId) return NextResponse.json({ toon: false })

  const supabase = await createClient()
  const heeftAntwoord = await heeftAlEenAntwoord(supabase, userId)
  return NextResponse.json({ toon: !heeftAntwoord })
}
