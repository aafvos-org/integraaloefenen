export const AFGELEIDE_OEFENEN_URL =
  'https://afgeleideoefenen.nl/?van=integraaloefenen'

export function AfgeleideVerwijzing({ className }: { className?: string }) {
  return (
    <a
      href={AFGELEIDE_OEFENEN_URL}
      className={className}
    >
      Ook differentiëren oefenen? → afgeleideoefenen.nl
    </a>
  )
}
