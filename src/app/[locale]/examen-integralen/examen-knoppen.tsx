'use client'

import { useSyncExternalStore } from 'react'

import { Link } from '@/i18n/navigation'
import { heeftInlogsessie } from '@/lib/supabase/sessie-cookie'

function cookiesUitDocument(): { name: string }[] {
  return document.cookie.split(';').map((deel) => ({
    name: deel.split('=')[0]?.trim() ?? '',
  }))
}

function useIngelogd(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => heeftInlogsessie(cookiesUitDocument()),
    () => false,
  )
}

/**
 * De pagina zelf blijft statisch. Alleen de knoppen wisselen als dit tabblad
 * al een inlogcookie heeft. Zonder cookie blijft "account aanmaken" staan.
 */
export function ExamenKnoppen({
  ctaOpgaven,
  ctaRegister,
  ctaLogin,
}: {
  ctaOpgaven: string
  ctaRegister: string
  ctaLogin: string
}) {
  const ingelogd = useIngelogd()

  if (ingelogd) {
    return (
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/examentraining"
          className="inline-flex min-h-11 items-center rounded-lg bg-accent px-5 text-sm font-medium text-white shadow-sm hover:bg-accent/90"
        >
          {ctaOpgaven}
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <Link
        href="/registreren"
        className="inline-flex min-h-11 items-center rounded-lg bg-accent px-5 text-sm font-medium text-white shadow-sm hover:bg-accent/90"
      >
        {ctaRegister}
      </Link>
      <Link
        href="/inloggen"
        className="inline-flex min-h-11 items-center rounded-lg border border-border px-5 text-sm text-text hover:bg-surface-2"
      >
        {ctaLogin}
      </Link>
    </div>
  )
}
