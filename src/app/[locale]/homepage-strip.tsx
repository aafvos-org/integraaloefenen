import { ComponentProps } from 'react'

import { Link } from '@/i18n/navigation'

type HomepageStripProps = {
  titel: string
  beschrijving?: string
  ctaTekst: string
  ctaHref: ComponentProps<typeof Link>['href']
  dataMeet: string
}

/**
 * Gedeelde opmaak voor de opvallende stripjes bovenaan de startpagina
 * (ChatGPT, YouTube, Google, vakantie). Elke strip bepaalt zelf of hij
 * zichtbaar is; deze component tekent alleen de inhoud.
 *
 * De `Link` krijgt `before:absolute before:inset-0` zodat hij over de hele
 * kaart ligt (het "stretched link"-patroon, zie INT-614): een klik op de
 * titel of de kaart zelf opent dezelfde bestemming als de knop, in plaats
 * van een dode klik te zijn.
 */
export function HomepageStrip({ titel, beschrijving, ctaTekst, ctaHref, dataMeet }: HomepageStripProps) {
  return (
    <div className="relative mb-8 rounded-xl border border-accent/30 bg-accent-light p-4 text-center">
      <p className="font-medium text-text">{titel}</p>
      {beschrijving && <p className="mt-1 text-sm text-text-muted">{beschrijving}</p>}
      <Link
        href={ctaHref}
        data-meet={dataMeet}
        className="mt-3 inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-5 text-white shadow-sm before:absolute before:inset-0 before:content-[''] hover:bg-accent/90"
      >
        {ctaTekst}
      </Link>
    </div>
  )
}
