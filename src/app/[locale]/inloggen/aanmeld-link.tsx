'use client'

import { useSearchParams } from 'next/navigation'

import { Link } from '@/i18n/navigation'
import { leesBron, padNaarAanmelden } from '@/lib/bron'

/**
 * Link naar registreren, met `?van=` erachter als dat in de adresregel
 * staat. Leest de browser, niet de server: zo hoeft /nl/inloggen zelf geen
 * `searchParams` te lezen en blijft de pagina statisch (INT-519).
 */
export function AanmeldLink({ label }: { label: string }) {
  const searchParams = useSearchParams()
  const bron = leesBron(searchParams.get('van'))

  return (
    <Link
      href={padNaarAanmelden('/registreren', bron)}
      className="inline-flex min-h-11 items-center px-1 font-medium text-accent hover:underline"
    >
      {label}
    </Link>
  )
}
