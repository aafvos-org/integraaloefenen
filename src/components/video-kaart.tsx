import type { ReactNode } from 'react'

import { YoutubeInsluiting } from './youtube-insluiting'

/**
 * Kaart om een uitlegvideo (zie `@/lib/videos`) in te sluiten op een
 * theorie-, voorbeeld- of examenpagina (INT-635): speler, titel, één zin
 * uitleg, duur en een knop naar de bijbehorende oefenstof. Zelfde opbouw als
 * het detailpaneel op `/uitleg-videos`.
 */
export function VideoKaart({
  video,
  cta,
  bron,
}: {
  video: { youtubeId: string; title: string; description: string; duration: string }
  /** Knop naar de oefenstof; door de aanroeper opgebouwd zodat die zijn eigen `Link` en vertaling gebruikt. */
  cta?: ReactNode
  /** Bron van een examenvraag (jaar, tijdvak, vraagnummer). */
  bron?: string
}) {
  return (
    <div className="mt-6 max-w-3xl rounded-2xl border border-border bg-surface-2 p-4 sm:p-5">
      <YoutubeInsluiting videoId={video.youtubeId} titel={video.title} />
      <div className="mt-3">
        <h3 className="font-serif text-lg text-text">{video.title}</h3>
        <p className="mt-1 text-sm text-text-muted">{video.description}</p>
        {bron && <p className="mt-1 text-xs text-text-muted">{bron}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="text-xs text-text-muted">{video.duration}</span>
          {cta}
        </div>
      </div>
    </div>
  )
}
