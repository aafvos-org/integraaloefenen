'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/browser'
import { heeftInlogsessie } from '@/lib/supabase/sessie-cookie'

function cookiesUitDocument(): { name: string }[] {
  return document.cookie.split(';').map((deel) => ({
    name: deel.split('=')[0]?.trim() ?? '',
  }))
}

/**
 * Een leerling met een geldige sessie die toch op /nl/inloggen of
 * /nl/registreren belandt (terugknop, oude link) hoort meteen naar het
 * dashboard. Dat deed voorheen de server met `getCurrentUser()` (`cookies()`),
 * en dat maakte de hele pagina dynamisch: geen bezoek kon uit de
 * klaargezette versie komen (INT-519, INT-549).
 *
 * De browser kan deze controle net zo goed doen. De meeste bezoekers hebben
 * toch geen sessie en zien dan niets extra's; wie wel is ingelogd ziet heel
 * even het formulier voordat de doorverwijzing komt.
 */
export function AlIngelogd({ naar }: { naar: string }) {
  const router = useRouter()

  useEffect(() => {
    if (!heeftInlogsessie(cookiesUitDocument())) return
    let geannuleerd = false

    async function controleer() {
      try {
        const supabase = createClient()
        const { data } = await supabase.auth.getUser()
        if (!geannuleerd && data.user) router.replace(naar)
      } catch {
        // Geen sessie vast te stellen: het inlogformulier blijft gewoon staan.
      }
    }

    void controleer()
    return () => {
      geannuleerd = true
    }
  }, [naar, router])

  return null
}
