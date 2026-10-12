'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { cn } from '@/components/ui'
import {
  hrefVoorBlok,
  hrefVoorOnderwerp,
  weegClusters,
  type ClusterVoortgang,
  type NieuwHoofdstuk,
  type OnderwerpRij,
  type OudHoofdstuk,
} from '@/lib/dashboard/indeling'

function VoortgangCijfers({ clusters }: { clusters: ClusterVoortgang[] }) {
  const { mastered, total, pct } = weegClusters(clusters)
  if (total === 0) return null
  return (
    <>
      <span className="shrink-0 tabular-nums text-xs text-text-muted">
        {mastered}/{total}
      </span>
      <span
        className={cn(
          'w-9 shrink-0 text-right tabular-nums text-xs',
          pct === 100 ? 'font-medium text-accent' : 'text-text-muted',
        )}
      >
        {pct}%
      </span>
    </>
  )
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={cn('size-3 shrink-0 text-text-muted transition-transform', open && 'rotate-90')}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M8 5l8 7-8 7V5z" />
    </svg>
  )
}

function HoofdstukKop({
  slug,
  title,
  clusters,
  open,
  onToggle,
}: {
  slug: string
  title: string
  clusters: ClusterVoortgang[]
  open: boolean
  onToggle: () => void
}) {
  const { mastered, total, pct } = weegClusters(clusters)
  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2"
      >
        <Chevron open={open} />
        <span className="font-mono text-[11px] font-semibold text-text-muted">
          {slug.toUpperCase()}
        </span>
        <span className="min-w-0 flex-1 break-words font-serif text-[15px] text-text">
          {title}
        </span>
        <span className="shrink-0 tabular-nums text-xs text-text-muted">
          {mastered}/{total}
        </span>
        <span
          className={cn(
            'w-10 shrink-0 text-right text-sm font-medium tabular-nums',
            pct === 100 ? 'text-accent' : 'text-text-muted',
          )}
        >
          {pct}%
        </span>
      </button>
      <div className="mx-4 mb-1 h-1 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>
    </>
  )
}

function OnderwerpRegel({ onderwerp }: { onderwerp: OnderwerpRij }) {
  const { pct } = weegClusters(onderwerp.clusters)
  return (
    <li className="flex min-h-11 items-center gap-3 px-4 py-2 text-sm">
      <span
        className={cn('size-1.5 shrink-0 rounded-full', pct === 100 ? 'bg-accent' : 'bg-border')}
      />
      <Link
        href={hrefVoorOnderwerp(onderwerp.chapterSlug, onderwerp.slug)}
        className="min-w-0 flex-1 break-words text-text hover:text-accent hover:underline"
      >
        {onderwerp.title}
      </Link>
      <VoortgangCijfers clusters={onderwerp.clusters} />
    </li>
  )
}

export function NieuwHoofdstukBlock({ chapter }: { chapter: NieuwHoofdstuk }) {
  const t = useTranslations('Dashboard')
  const [open, setOpen] = useState(false)

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <HoofdstukKop
        slug={chapter.slug}
        title={chapter.title}
        clusters={chapter.clusters}
        open={open}
        onToggle={() => setOpen((waarde) => !waarde)}
      />
      {open && (
        <ul className="pb-2 pt-1">
          {chapter.paragrafen.map((paragraaf) => {
            const clusters = paragraaf.blokken.flatMap((blok) => blok.clusters)
            return (
              <li key={paragraaf.id}>
                <div className="flex min-h-11 items-center gap-3 py-2 pl-8 pr-4 text-sm">
                  <span className="shrink-0 font-mono text-xs font-semibold text-text-muted">
                    {paragraaf.label}
                  </span>
                  <span className="min-w-0 flex-1 break-words font-medium text-text">
                    {paragraaf.title}
                  </span>
                  <VoortgangCijfers clusters={clusters} />
                </div>
                <ul>
                  {paragraaf.blokken.map((blok) =>
                    blok.heeftOpgaven ? (
                      <li key={blok.id}>
                        <Link
                          href={hrefVoorBlok(blok.slug)}
                          className="group flex min-h-11 items-center gap-3 py-2 pl-12 pr-4 text-sm text-text hover:text-accent"
                        >
                          <span className="shrink-0 font-mono text-text-muted">{blok.letter}</span>
                          <span className="min-w-0 flex-1 break-words group-hover:underline">
                            {blok.title}
                          </span>
                          <VoortgangCijfers clusters={blok.clusters} />
                        </Link>
                      </li>
                    ) : (
                      <li
                        key={blok.id}
                        className="flex min-h-11 items-center gap-3 py-2 pl-12 pr-4 text-sm text-text-muted/70"
                      >
                        <span className="shrink-0 font-mono">{blok.letter}</span>
                        <span className="min-w-0 flex-1 break-words">{blok.title}</span>
                        <span className="shrink-0 text-xs">{t('nogGeenOpgaven')}</span>
                      </li>
                    ),
                  )}
                </ul>
              </li>
            )
          })}
          {chapter.losseOnderwerpen.map((onderwerp) => (
            <OnderwerpRegel key={onderwerp.id} onderwerp={onderwerp} />
          ))}
        </ul>
      )}
    </div>
  )
}

export function OudHoofdstukBlock({ chapter }: { chapter: OudHoofdstuk }) {
  const [open, setOpen] = useState(false)
  const clusters = chapter.onderwerpen.flatMap((onderwerp) => onderwerp.clusters)

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <HoofdstukKop
        slug={chapter.slug}
        title={chapter.title}
        clusters={clusters}
        open={open}
        onToggle={() => setOpen((waarde) => !waarde)}
      />
      {open && (
        <ul className="pb-2 pt-1">
          {chapter.onderwerpen.map((onderwerp) => (
            <OnderwerpRegel key={onderwerp.id} onderwerp={onderwerp} />
          ))}
        </ul>
      )}
    </div>
  )
}
