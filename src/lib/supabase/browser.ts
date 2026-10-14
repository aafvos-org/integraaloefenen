import { createBrowserClient } from '@supabase/ssr'

import type { Database } from './types'

/** Supabase in de browser. Nodig voor de doorverwijzing naar Google. */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
