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
 */
export function HomepageStrip({ titel, beschrijving, ctaTekst, ctaHref, dataMeet }: HomepageStripProps) {
  return (
    <div className="mb-8 rounded-xl border border-accent/30 bg-accent-light p-4 text-center">
      <p className="font-medium text-text">{titel}</p>
      {beschrijving && <p className="mt-1 text-sm text-text-muted">{beschrijving}</p>}
      <Link
        href={ctaHref}
        data-meet={dataMeet}
        className="mt-3 inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-5 text-white shadow-sm hover:bg-accent/90"
      >
        {ctaTekst}
      </Link>
    </div>
  )
}
