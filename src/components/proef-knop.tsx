import { Link } from '@/i18n/navigation'

/** De "Oefen dit zelf"-knop op een voorbeeldpagina, hergebruikt boven en onder het antwoord. */
export function ProefKnop({
  pad,
  tekst,
  meet,
  className = 'mt-6',
}: {
  pad: string
  tekst: string
  meet: string
  className?: string
}) {
  return (
    <Link
      href={pad as '/proberen'}
      data-meet={meet}
      className={`inline-flex min-h-11 items-center rounded-lg bg-accent px-5 py-3 font-medium text-white shadow-sm hover:bg-accent/90 ${className}`}
    >
      {tekst}
    </Link>
  )
}
