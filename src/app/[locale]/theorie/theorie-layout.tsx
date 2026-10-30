'use client'

import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'

import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/components/ui'
import { useDesktopHint } from '@/lib/use-desktop-hint'

export type TheorieNavItem = {
  slug: string
  /** Hoofdstukcode, bv. "K3" */
  code: string
  label: string
}

type Labels = { chapterLabel: string; collapseSidebar: string; expandSidebar: string }

const SCROLL_SLEUTEL_VOORVOEGSEL = 'theorie-scroll:'

// Op modulenniveau, niet in de component: een hoofdstukpagina is een eigen
// route (page.tsx, geen gedeelde layout.tsx) en wordt dus bij elke navigatie
// volledig ver- en hermonteerd. Zonder cacheComponents (zie AGENTS.md) bewaart
// Next.js hier zelf geen scrollpositie; deze vlag overleeft wél de remount,
// zolang het tabblad openblijft.
let laatsteNavigatieWasTerug = false
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    laatsteNavigatieWasTerug = true
  })
}

/**
 * Zet de scrollpositie van deze hoofdstukpagina terug na de terugknop, en
 * onthoudt hem weer zodra de leerling verder scrolt. `scrollRef` scrolt zelf
 * op de computer (vaste hoogte, eigen scrollbalk); op de telefoon scrolt de
 * hele pagina, dus kijken we dan naar `window`.
 */
function useScrollrestauratie(scrollRef: RefObject<HTMLDivElement | null>) {
  const pathname = usePathname()

  useEffect(() => {
    const sleutel = SCROLL_SLEUTEL_VOORVOEGSEL + pathname
    const terug = laatsteNavigatieWasTerug
    laatsteNavigatieWasTerug = false

    if (terug) {
      const opgeslagen = window.sessionStorage.getItem(sleutel)
      if (opgeslagen !== null) {
        const positie = Number(opgeslagen)
        // Next.js scrolt bij elke overgang eerst zelf naar boven; pas een
        // frame later de oude positie terugzetten, anders wint Next.js.
        requestAnimationFrame(() => {
          window.scrollTo(0, positie)
          scrollRef.current?.scrollTo(0, positie)
        })
      }
    }

    // Vlak vóór het wegnavigeren stuurt de browser hier soms nog een scroll-
    // event met een kortstondige 0 (de oude inhoud verdwijnt al terwijl de
    // nieuwe nog niet staat). Een kleine vertraging voorkomt dat zo'n nepwaarde
    // de echte positie overschrijft: de cleanup hieronder annuleert hem dan.
    let timer: ReturnType<typeof setTimeout> | undefined
    function onScroll() {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        const positie = scrollRef.current?.scrollTop || window.scrollY
        window.sessionStorage.setItem(sleutel, String(positie))
      }, 150)
    }
    const container = scrollRef.current
    window.addEventListener('scroll', onScroll, { passive: true })
    container?.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      if (timer) clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
      container?.removeEventListener('scroll', onScroll)
    }
  }, [pathname, scrollRef])
}

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
  // Op de telefoon duwt de volledig opengeklapte zijbalk de inhoud — en dus de
  // titel en "Probeer 3 sommen"-knop — buiten beeld. Heeft de leerling nog
  // niets zelf gekozen (sidebarOverride === null), dan bepaalt alleen CSS
  // (onder/vanaf het lg-breakpoint) hoe de zijbalk eruitziet: zo klopt de
  // allereerste HTML al op de telefoon, zonder op hydratatie te wachten.
  const [sidebarOverride, setSidebarOverride] = useState<boolean | null>(null)
  const sidebarOpen = sidebarOverride ?? false
  const sidebarResponsive = sidebarOverride === null
  const desktopHint = useDesktopHint()
  const effectiveOpen = sidebarOpen || (sidebarResponsive && desktopHint)
  const contentRef = useRef<HTMLDivElement | null>(null)
  useScrollrestauratie(contentRef)

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col lg:h-[calc(100vh-3.5rem)] lg:flex-row lg:overflow-hidden">
      {/* ── Sidebar (staat vast; content scrolt zelf) ───────────────── */}
      <aside
        className={cn(
          'nice-scrollbar border-b border-border bg-surface lg:h-full lg:border-b-0 lg:border-r',
          sidebarOpen
            ? 'overflow-x-auto p-4 lg:w-64 lg:overflow-x-visible lg:overflow-y-auto lg:py-8'
            : sidebarResponsive
            ? 'px-0.5 py-2 lg:w-64 lg:overflow-x-visible lg:overflow-y-auto lg:px-4 lg:py-8'
            : 'px-0.5 py-2 lg:w-12 lg:py-4',
        )}
      >
        <div
          className={
            sidebarOpen
              ? 'flex items-center justify-between gap-2'
              : sidebarResponsive
              ? 'flex justify-center lg:items-center lg:justify-between lg:gap-2'
              : 'flex justify-center'
          }
        >
          {(sidebarOpen || sidebarResponsive) && (
            <p
              className={cn(
                'text-xs font-medium uppercase tracking-wider text-text-muted',
                sidebarResponsive && 'hidden lg:block',
              )}
            >
              {labels.chapterLabel}
            </p>
          )}
          <button
            type="button"
            onClick={() => setSidebarOverride(!effectiveOpen)}
            aria-expanded={effectiveOpen}
            aria-label={effectiveOpen ? labels.collapseSidebar : labels.expandSidebar}
            title={effectiveOpen ? labels.collapseSidebar : labels.expandSidebar}
            className={cn(
              'inline-flex h-11 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-text-muted hover:bg-surface-2 hover:text-text lg:size-11 lg:gap-0',
              !sidebarOpen && 'border border-border bg-surface-2 px-3 lg:border-0 lg:bg-transparent lg:px-0',
            )}
          >
            {!sidebarOpen && (
              <span className="text-xs font-medium uppercase tracking-wider lg:hidden">
                {labels.chapterLabel}
              </span>
            )}
            <svg
              viewBox="0 0 24 24"
              className={`size-4 shrink-0 transition-transform ${effectiveOpen ? '' : 'rotate-180'}`}
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

        {(sidebarOpen || sidebarResponsive) && (
          <ul className={cn('mt-3 space-y-0.5', sidebarResponsive && 'hidden lg:block')}>
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
      <div ref={contentRef} className="nice-scrollbar flex-1 lg:h-full lg:overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
