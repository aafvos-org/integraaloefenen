'use client'

import { useState, type ReactNode } from 'react'

import { Link } from '@/i18n/navigation'
import { cn } from '@/components/ui'

export type TheorieNavItem = {
  slug: string
  /** Hoofdstukcode, bv. "K3" */
  code: string
  label: string
}

type Labels = {
  chapterLabel: string
  collapseSidebar: string
  expandSidebar: string
  chooseChapter: string
  closeChapterList: string
}

/**
 * Zijbalk + scrollende inhoud, in dezelfde vorm als de oefenpagina.
 *
 * Op de telefoon staat er geen zijbalk (die is alleen vanaf het lg-breakpoint
 * zichtbaar): in plaats daarvan staat er een knop die het huidige hoofdstuk
 * toont, als eerste kind van déze lange scrollcontainer (niet in een korte
 * zijbalk) en `sticky`, zodat hij bereikbaar blijft ongeacht hoe diep je
 * gescrold hebt (INT-659). Die knop opent een volledig scherm met de
 * hoofdstukkenlijst, net als de mobiele hoofdstukkiezer op de oefenpagina.
 */
export function TheorieLayout({
  items,
  active,
  labels,
  children,
}: {
  items: TheorieNavItem[]
  active: string
  labels: Labels
  children: ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileListOpen, setMobileListOpen] = useState(false)
  const activeItem = items.find((it) => it.slug === active)

  function chapterList(onNavigate?: () => void) {
    return (
      <ul className="space-y-0.5">
        {items.map((it) => {
          const isActive = it.slug === active
          return (
            <li key={it.slug}>
              <Link
                href={`/theorie/${it.slug}` as '/theorie'}
                aria-current={isActive ? 'page' : undefined}
                onClick={onNavigate}
                className={
                  isActive
                    ? 'flex w-full items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white'
                    : 'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-muted hover:bg-surface-2 hover:text-text'
                }
              >
                <span className="min-w-0 break-words text-left">
                  <span className="font-mono font-semibold">{it.code}</span>
                  {' – '}
                  {it.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col lg:h-[calc(100vh-3.5rem)] lg:flex-row lg:overflow-hidden">
      {/* ── Zijbalk (alleen computer; staat vast, content scrolt zelf) ── */}
      <aside
        className={cn(
          'nice-scrollbar hidden border-border bg-surface lg:block lg:h-full lg:border-r',
          sidebarOpen ? 'lg:w-64 lg:overflow-y-auto lg:px-4 lg:py-8' : 'lg:w-12 lg:py-4',
        )}
      >
        <div className={sidebarOpen ? 'flex items-center justify-between gap-2' : 'flex justify-center'}>
          {sidebarOpen && (
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
              {labels.chapterLabel}
            </p>
          )}
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? labels.collapseSidebar : labels.expandSidebar}
            title={sidebarOpen ? labels.collapseSidebar : labels.expandSidebar}
            className="rounded-md p-1.5 text-text-muted hover:bg-surface-2 hover:text-text lg:size-11"
          >
            <svg
              viewBox="0 0 24 24"
              className={`size-4 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="m11 17-5-5 5-5" />
              <path d="m18 17-5-5 5-5" />
            </svg>
          </button>
        </div>
        {sidebarOpen && <div className="mt-3">{chapterList()}</div>}
      </aside>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="nice-scrollbar flex-1 lg:h-full lg:overflow-y-auto">
        <button
          type="button"
          onClick={() => setMobileListOpen(true)}
          className="sticky top-14 z-20 flex min-h-11 w-full items-center justify-between gap-3 border-b border-border bg-surface px-4 text-left text-sm font-medium lg:hidden"
        >
          <span className="min-w-0 truncate">
            {activeItem ? `${activeItem.code} – ${activeItem.label}` : labels.chapterLabel}
          </span>
          <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="currentColor" aria-hidden>
            <path d="M7 10l5 5 5-5H7z" />
          </svg>
        </button>

        {children}
      </div>

      {mobileListOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-surface lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={labels.chooseChapter}
        >
          <div className="flex items-center justify-between border-b border-border px-4">
            <p className="text-sm font-medium">{labels.chooseChapter}</p>
            <button
              type="button"
              onClick={() => setMobileListOpen(false)}
              className="min-h-11 px-3 text-sm font-medium text-text"
            >
              {labels.closeChapterList}
            </button>
          </div>
          <div className="nice-scrollbar flex-1 overflow-y-auto p-4">
            {chapterList(() => setMobileListOpen(false))}
          </div>
        </div>
      )}
    </div>
  )
}
