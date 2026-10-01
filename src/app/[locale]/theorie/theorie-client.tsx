'use client'

import { useRef, useState } from 'react'

import { Link } from '@/i18n/navigation'
import { Math as TeX, RichMath } from '@/components/math'
import { cn } from '@/components/ui'
import type { OverviewCard, Stappenplan } from '@/lib/theory'

export type TheorieChapter = {
  slug: string
  title: string
  intro?: string
  stappenplan?: Stappenplan
  /** Vooraf op de server geformatteerd, bv. "Oefen De afgeleide functie →" */
  practiceLabel: string
  cards: OverviewCard[]
}

type Labels = {
  h1: string
  chapterLabel: string
  collapseSidebar: string
  expandSidebar: string
  exampleLabel: string
  detailsLabel: string
  /** "Stap {n}" */
  stepLabel: string
  practiceTopicLabel: string
  stappenplanTitle: string
  stap0Title: string
  herkenSchil: string
  herkenVoorbeeld: string
  herkenRegel: string
  regelsTitle: string
  answerNoteLabel: string
  herkenQuestion: string
  revealLabel: string
  videoLabel: string
}

/** "H2 — De afgeleide functie" → { code: "H2", short: "De afgeleide functie" }; ook "K.3 — …" */
function splitTitle(title: string): { code: string | null; short: string } {
  const m = title.match(/^([A-Z]\.?\d+(?:\.\d+)?)\s*[—–-]\s*(.+)$/)
  return m ? { code: m[1]!, short: m[2]! } : { code: null, short: title }
}

export function TheorieClient({
  chapters,
  labels,
  sidebar = true,
}: {
  chapters: TheorieChapter[]
  labels: Labels
  /** false = zonder eigen zijbalk en scrollcontainer (wordt dan in TheorieLayout getoond) */
  sidebar?: boolean
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSlug, setActiveSlug] = useState<string | null>(chapters[0]?.slug ?? null)
  // Kaarten die aan een oefen-topic hangen staan standaard open: dat is de kern van de pagina.
  const [openCards, setOpenCards] = useState<Set<string>>(
    () =>
      new Set(
        chapters.flatMap((ch) =>
          ch.cards.filter((c) => c.topicSlug).map((c) => `${ch.slug}/${c.id}`),
        ),
      ),
  )
  const mainScrollRef = useRef<HTMLDivElement | null>(null)

  function toggleCard(key: string) {
    setOpenCards((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function scrollToId(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Scroll-spy: markeer het hoofdstuk dat in beeld is
  function handleMainScroll() {
    const root = mainScrollRef.current
    if (!root) return
    const rootTop = root.getBoundingClientRect().top
    let current: string | null = null
    for (const ch of chapters) {
      const el = document.getElementById(`hoofdstuk-${ch.slug}`)
      if (!el) continue
      if (el.getBoundingClientRect().top - rootTop <= 140) current = ch.slug
    }
    if (current && current !== activeSlug) setActiveSlug(current)
  }

  return (
    <div className={sidebar ? 'flex min-h-[calc(100vh-3.5rem)] flex-col lg:h-[calc(100vh-3.5rem)] lg:flex-row lg:overflow-hidden' : undefined}>
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      {sidebar && (
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
            {chapters.map((ch) => {
              const active = ch.slug === activeSlug
              const { code, short } = splitTitle(ch.title)
              return (
                <li key={ch.slug}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSlug(ch.slug)
                      scrollToId(`hoofdstuk-${ch.slug}`)
                    }}
                    className={
                      active
                        ? 'flex w-full items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white'
                        : 'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-muted hover:bg-surface-2 hover:text-text'
                    }
                  >
                    <span className="truncate text-left">
                      {code && (
                        <>
                          <span className="font-mono font-semibold">{code}</span>
                          {' – '}
                        </>
                      )}
                      {short}
                    </span>
                  </button>

                  {active && (ch.stappenplan || ch.cards.length > 0) && (
                    <ul className="mb-1 mt-0.5">
                      {ch.stappenplan && (
                        <li>
                          <button
                            type="button"
                            onClick={() => scrollToId(`stappenplan-${ch.slug}`)}
                            className="flex w-full items-center gap-2 rounded-md py-1.5 pl-7 pr-3 text-xs font-medium text-accent hover:text-text"
                          >
                            <span className="size-1.5 shrink-0 rounded-full bg-accent" />
                            <span className="truncate text-left">{labels.stappenplanTitle}</span>
                          </button>
                        </li>
                      )}
                      {ch.cards.map((card) => (
                        <li key={card.id}>
                          <button
                            type="button"
                            onClick={() => scrollToId(`kaart-${ch.slug}-${card.id}`)}
                            className="flex w-full items-center gap-2 rounded-md py-1.5 pl-7 pr-3 text-xs text-text-muted hover:text-text"
                          >
                            <span className="size-1.5 shrink-0 rounded-full bg-border" />
                            <span className="truncate text-left">{card.title}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </aside>
      )}

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div
        ref={mainScrollRef}
        onScroll={handleMainScroll}
        className={sidebar ? 'nice-scrollbar flex-1 lg:h-full lg:overflow-y-auto' : undefined}
      >
        <div className="mx-auto max-w-5xl px-4 py-8">
          <h1 className="sr-only">{labels.h1}</h1>

          {chapters.map((ch) => {
            const { code, short } = splitTitle(ch.title)
            return (
              <section
                key={ch.slug}
                id={`hoofdstuk-${ch.slug}`}
                className="scroll-mt-4"
              >
                <div className="mt-20 flex flex-wrap items-end justify-between gap-2 border-b border-border pb-3 first:mt-0">
                  <h2 className="font-serif text-2xl text-text">
                    {code && (
                      <>
                        <span className="font-mono font-semibold">{code}</span>
                        {' – '}
                      </>
                    )}
                    {short}
                  </h2>
                  <Link
                    href={`/oefenen?chapter=${encodeURIComponent(ch.slug)}` as '/oefenen'}
                    className="text-sm font-medium text-accent underline-offset-2 hover:underline"
                  >
                    {ch.practiceLabel}
                  </Link>
                </div>

                {ch.intro && (
                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-muted">
                    <RichMath source={ch.intro} />
                  </p>
                )}

                {ch.stappenplan && (
                  <StappenplanKaart chapterSlug={ch.slug} plan={ch.stappenplan} labels={labels} />
                )}

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {ch.cards.map((card) => (
                    <TheoryCard
                      key={card.id}
                      chapterSlug={ch.slug}
                      card={card}
                      open={openCards.has(`${ch.slug}/${card.id}`)}
                      onToggle={() => toggleCard(`${ch.slug}/${card.id}`)}
                      labels={labels}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ── Het stappenplan van een hoofdstuk ──────────────────────────────────── */

function StappenplanKaart({
  chapterSlug,
  plan,
  labels,
}: {
  chapterSlug: string
  plan: Stappenplan
  labels: Labels
}) {
  return (
    <article
      id={`stappenplan-${chapterSlug}`}
      className="mt-6 scroll-mt-4 rounded-xl border border-accent/40 bg-accent-light/40"
    >
      <div className="px-5 py-4">
        <h3 className="font-serif text-lg text-text">{labels.stappenplanTitle}</h3>
        <p className="mt-1 text-sm leading-relaxed text-text-muted">
          <RichMath source={plan.intro} />
        </p>
      </div>

      <div className="space-y-4 px-5 pb-5">
        {/* Stap 0 · herkentabel */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">
            {labels.stap0Title}
          </p>
          <div className="overflow-x-auto rounded-lg border border-border bg-surface">
            <table className="w-full text-sm">
              <thead className="bg-surface-2">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-text-muted">{labels.herkenSchil}</th>
                  <th className="px-3 py-2 text-left font-medium text-text-muted">{labels.herkenVoorbeeld}</th>
                  <th className="px-3 py-2 text-left font-medium text-text-muted">{labels.herkenRegel}</th>
                </tr>
              </thead>
              <tbody>
                {plan.herken.map((row, i) => (
                  <tr key={i} className={i > 0 ? 'border-t border-border' : ''}>
                    <td className="px-3 py-2 align-middle text-text">
                      <RichMath source={row.schil} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 align-middle text-text">
                      <TeX tex={row.voorbeeld} />
                    </td>
                    <td className="px-3 py-2 align-middle font-medium text-accent">
                      <RichMath source={row.regel} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stap 1–3 per regel */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">
            {labels.regelsTitle}
          </p>
          <div className="overflow-x-auto rounded-lg border border-border bg-surface">
            <table className="w-full text-sm">
              <thead className="bg-surface-2">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-text-muted">{labels.herkenRegel}</th>
                  {[1, 2, 3].map((n) => (
                    <th key={n} className="px-3 py-2 text-left font-medium text-text-muted">
                      {labels.stepLabel.replace('{n}', String(n))}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plan.regels.map((row, i) => (
                  <tr key={i} className={i > 0 ? 'border-t border-border' : ''}>
                    <td className="px-3 py-2 align-top">
                      <p className="font-medium text-text">{row.regel}</p>
                      <p className="mt-1 whitespace-nowrap text-[0.85em] text-text-muted">
                        <TeX tex={row.formule} />
                      </p>
                    </td>
                    <td className="px-3 py-2 align-top text-text"><RichMath source={row.stap1} /></td>
                    <td className="px-3 py-2 align-top text-text"><RichMath source={row.stap2} /></td>
                    <td className="px-3 py-2 align-top text-text"><RichMath source={row.stap3} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {plan.slot && (
          <p className="text-xs leading-relaxed text-text-muted">
            <RichMath source={plan.slot} />
          </p>
        )}
      </div>
    </article>
  )
}

/* ── Eén theoriekaart ───────────────────────────────────────────────────── */

function TheoryCard({
  chapterSlug,
  card,
  open,
  onToggle,
  labels,
}: {
  chapterSlug: string
  card: OverviewCard
  open: boolean
  onToggle: () => void
  labels: Labels
}) {
  const expandable =
    (card.examples?.length ?? 0) > 0 || (card.notes?.length ?? 0) > 0 || (card.herken?.length ?? 0) > 0
  const [revealed, setRevealed] = useState<Set<number>>(new Set())

  return (
    <article
      id={`kaart-${chapterSlug}-${card.id}`}
      className={cn(
        'flex scroll-mt-4 flex-col rounded-xl border border-border bg-surface',
        card.topicSlug && 'md:col-span-2',
      )}
    >
      {expandable ? (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-label={`${card.title} — ${labels.detailsLabel}`}
          className="group flex w-full items-center justify-between gap-3 rounded-t-xl px-5 py-4 text-left"
        >
          <h3 className="font-serif text-lg text-text">{card.title}</h3>
          <span className="flex size-6 items-center justify-center rounded-full bg-accent-light text-accent transition group-hover:bg-accent group-hover:text-white">
            <svg
              viewBox="0 0 24 24"
              className={`size-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </button>
      ) : (
        <div className="px-5 py-4">
          <h3 className="font-serif text-lg text-text">{card.title}</h3>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 px-5 pb-5">
        {card.formula && (
          <div className="flex flex-1 items-center justify-center overflow-x-auto rounded-lg bg-accent-light/60 px-4 py-4 text-[0.9em]">
            <TeX tex={card.formula} displayMode />
          </div>
        )}

        {card.answerNote && (
          <p className="text-sm leading-relaxed text-text-muted">
            <span className="font-medium text-text">{labels.answerNoteLabel}: </span>
            <RichMath source={card.answerNote} />
          </p>
        )}

        {card.table && (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface-2">
                <tr>
                  {card.table.headers.map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left font-medium text-text-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {card.table.rows.map((row, ri) => (
                  <tr key={ri} className={ri > 0 ? 'border-t border-border' : ''}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 align-middle text-text">
                        <RichMath source={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {expandable && (
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
              open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="space-y-3 pt-1">
                {card.examples && card.examples.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
                      {labels.exampleLabel}
                    </p>
                    <ul className={cn('gap-2', card.examples.length > 1 ? 'grid md:grid-cols-2' : 'space-y-2')}>
                      {card.examples.map((ex, i) => (
                        <li
                          key={i}
                          className="overflow-x-auto rounded-lg border border-border bg-surface-2/60 px-3 py-2.5 text-sm"
                        >
                          <TeX tex={`${ex.problem} \\implies ${ex.answer}`} />
                          {ex.steps && ex.steps.length > 0 && (
                            <ol className="mt-2 space-y-1.5 border-t border-border pt-2">
                              {ex.steps.map((s, si) => (
                                <li key={si} className="flex items-start gap-2">
                                  <span
                                    className={cn(
                                      'shrink-0 font-semibold tabular-nums text-accent',
                                      ex.stappenplan ? 'min-w-[3.4rem] text-xs leading-5' : 'min-w-[1.1rem]',
                                    )}
                                  >
                                    {ex.stappenplan
                                      ? labels.stepLabel.replace('{n}', String(si))
                                      : `${si + 1}.`}
                                  </span>
                                  <span className="min-w-0">
                                    <RichMath source={s} />
                                  </span>
                                </li>
                              ))}
                            </ol>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {card.herken && card.herken.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
                      {labels.herkenQuestion}
                    </p>
                    <ul className="grid gap-2 md:grid-cols-2">
                      {card.herken.map((item, i) => {
                        const shown = revealed.has(i)
                        return (
                          <li
                            key={i}
                            className="flex flex-col gap-2 rounded-lg border border-border bg-surface-2/60 px-3 py-2.5 text-sm"
                          >
                            <div className="overflow-x-auto">
                              <TeX tex={item.problem} />
                            </div>
                            {shown ? (
                              <p className="text-text">
                                <span className="font-medium text-accent">{item.regel}</span>
                                {' — '}
                                <span className="text-text-muted">
                                  <RichMath source={item.waarom} />
                                </span>
                              </p>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  setRevealed((prev) => {
                                    const next = new Set(prev)
                                    next.add(i)
                                    return next
                                  })
                                }
                                className="self-start rounded-full border border-border px-2.5 py-0.5 text-xs text-text-muted transition hover:border-accent hover:text-accent"
                              >
                                {labels.revealLabel}
                              </button>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}

                {card.notes && card.notes.length > 0 && (
                  <ul className="space-y-1 text-xs leading-relaxed text-text-muted">
                    {card.notes.map((note, i) => (
                      <li key={i}>
                        <RichMath source={note} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {(card.topicSlug || (card.videos && card.videos.length > 0)) && (
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-sm">
            {card.topicSlug && (
              <Link
                href={
                  `/oefenen?chapter=${encodeURIComponent(chapterSlug)}&topic=${encodeURIComponent(card.topicSlug)}` as '/oefenen'
                }
                className="font-medium text-accent underline-offset-2 hover:underline"
              >
                {labels.practiceTopicLabel}
              </Link>
            )}
            {card.videos?.map((v) => (
              <Link
                key={v.slug}
                href={`/uitleg-videos?video=${encodeURIComponent(v.slug)}` as '/uitleg-videos'}
                className="text-text-muted underline-offset-2 hover:text-accent hover:underline"
              >
                <span aria-hidden>▶ </span>
                {labels.videoLabel}: {v.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
