import { Link } from '@/i18n/navigation'

/**
 * Vaste balk "Maak je eerste som" voor een leerling zonder enig antwoord
 * (INT-731). Geen querystring op de link: `/oefenen` start dan vanzelf de
 * makkelijkste som van K.0 B (zelfde blok als de welkomstmail, zie
 * `src/lib/practice/eerste-som.ts`).
 *
 * Puur presentatief (geen hook erin, zoals `HomepageStrip`): zo bruikbaar
 * vanuit een servercomponent (dashboard) én vanuit een clientcomponent
 * (theorie, zie `eerste-som-balk-client.tsx`).
 */
export function EersteSomBalk({ tekst, knop }: { tekst: string; knop: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <p className="min-w-0 flex-1 truncate text-sm text-text">{tekst}</p>
        <Link
          href="/oefenen"
          data-meet="eerste-som-balk"
          className="inline-flex min-h-11 shrink-0 items-center rounded-lg bg-accent px-4 text-sm font-medium text-white hover:bg-accent/90"
        >
          {knop}
        </Link>
      </div>
    </div>
  )
}
