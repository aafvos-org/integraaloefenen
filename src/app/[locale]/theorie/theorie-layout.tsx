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

type Labels = { chapterLabel: string; collapseSidebar: string; expandSidebar: string }

/**
 * Zijbalk + scrollende inhoud, in dezelfde vorm als de oefenpagina:
 * hoofdstukken links, actief hoofdstuk groen, inklapbaar.
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

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col lg:h-[calc(100vh-3.5rem)] lg:flex-row lg:overflow-hidden">
      {/* ── Sidebar (staat vast; content scrolt zelf) ───────────────── */}
      <aside
        className={cn(
          'nice-scrollbar border-b border-border bg-surface lg:h-full lg:border-b-0 lg:border-r',
          sidebarOpen
            ? 'overflow-x-auto p-4 lg:w-64 lg:overflow-x-visible lg:overflow-y-auto lg:py-8'
            : 'p-2 lg:w-12 lg:py-4',
        )}
      >
        <div className={sidebarOpen ? 'flex items-center justify-between gap-2' : 'flex justify-center'}>
          {sidebarOpen && (
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">{labels.chapterLabel}</p>
          )}
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? labels.collapseSidebar : labels.expandSidebar}
            title={sidebarOpen ? labels.collapseSidebar : labels.expandSidebar}
            className="rounded-md p-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
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

        {sidebarOpen && (
          <ul className="mt-3 space-y-0.5">
            {items.map((it) => {
              const isActive = it.slug === active
              return (
                <li key={it.slug}>
                  <Link
                    href={`/theorie/${it.slug}` as '/theorie'}
                    aria-current={isActive ? 'page' : undefined}
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
        )}
      </aside>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="nice-scrollbar flex-1 lg:h-full lg:overflow-y-auto">{children}</div>
    </div>
  )
}
