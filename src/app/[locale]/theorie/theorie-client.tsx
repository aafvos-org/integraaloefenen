'use client'

import { Fragment, useRef, useState, useSyncExternalStore } from 'react'

import { Link } from '@/i18n/navigation'
import { Math as TeX, RichMath } from '@/components/math'
import { cn } from '@/components/ui'
import { DeelKnop } from '@/components/deel-knop'
import type { Voorbeeldopgave } from '@/content/theory/voorbeeldopgaven'
import { uitwerkingenVoor, type Voorbeeld } from '@/content/voorbeelden'
import type { Oefenlink, OverviewCard, Stappenplan } from '@/lib/theory'

import { leesbareTekst, leesbareWiskunde } from './leesbare-tekst'

export type TheorieChapter = {
  slug: string
  title: string
  intro?: string
  stappenplan?: Stappenplan
  /** Vooraf op de server geformatteerd, bv. "Oefen De afgeleide functie →" */
  practiceLabel: string
  oefenlinks?: Oefenlink[]
  cards: OverviewCard[]
  voorbeelden?: Voorbeeldopgave[]
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

/**
 * Alleen voor de aria/tekst van de toggle-knop, ná hydratatie: begint `false`
 * (zelfde als de CSS-standaard op de telefoon) en synchroniseert daarna met
 * het echte scherm. Bepaalt nooit de zichtbare opmaak zelf — dat doet CSS via
 * het lg-breakpoint — dus dit geeft geen layout shift.
 */
function useDesktopHint(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia('(min-width: 1024px)')
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    () => window.matchMedia('(min-width: 1024px)').matches,
    () => false,
  )
}

export function TheorieClient({
  chapters,
  labels,
  sidebar = true,
  eigenKop = false,
  vaakGezocht,
}: {
  chapters: TheorieChapter[]
  labels: Labels
  /** false = zonder eigen zijbalk en scrollcontainer (wordt dan in TheorieLayout getoond) */
  sidebar?: boolean
  /** true op een hoofdstukpagina: de h1 is dan de naam van dat hoofdstuk */
  eigenKop?: boolean
  /** Alleen op het overzicht: kortste route naar veelgezochte voorbeeldpagina's. */
  vaakGezocht?: Voorbeeld[]
}) {
  // Op de telefoon duwt de volledig opengeklapte zijbalk (alle hoofdstukken met
  // hun kaarten) de inhoud — en dus de "Probeer 3 sommen"-knop — buiten beeld.
  // Heeft de leerling nog niets zelf gekozen (sidebarOverride === null), dan bepaalt
  // alleen CSS (onder/vanaf het lg-breakpoint) hoe de zijbalk eruitziet: zo klopt de
  // allereerste HTML al op de telefoon, zonder op hydratatie te wachten. `desktopHint`
  // regelt daarna alleen de aria/tekst van de knop op de computer, niet de opmaak zelf.
  const [sidebarOverride, setSidebarOverride] = useState<boolean | null>(null)
  const sidebarOpen = sidebarOverride ?? false
  const sidebarResponsive = sidebarOverride === null
  const desktopHint = useDesktopHint()
  const effectiveOpen = sidebarOpen || (sidebarResponsive && desktopHint)
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

  /** Keuzehulp: klap de gekozen kaart open en spring ernaartoe. */
  function kiesKaart(chapterSlug: string, cardId: string) {
    setOpenCards((prev) => new Set(prev).add(`${chapterSlug}/${cardId}`))
    requestAnimationFrame(() => scrollToId(`kaart-${chapterSlug}-${cardId}`))
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
                        ? 'flex min-h-11 w-full items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white'
                        : 'flex min-h-11 w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-muted hover:bg-surface-2 hover:text-text'
                    }
                  >
                    <span className="min-w-0 break-words text-left">
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
                            className="flex min-h-11 w-full items-center gap-2 rounded-md py-2 pl-7 pr-3 text-xs font-medium text-accent hover:text-text"
                          >
                            <span className="size-1.5 shrink-0 rounded-full bg-accent" />
                            <span className="min-w-0 break-words text-left">{labels.stappenplanTitle}</span>
                          </button>
                        </li>
                      )}
                      {ch.cards.map((card) => (
                        <li key={card.id}>
                          <button
                            type="button"
                            onClick={() => scrollToId(`kaart-${ch.slug}-${card.id}`)}
                            aria-label={leesbareTekst(card.title)}
                            className="flex min-h-11 w-full items-center gap-2 rounded-md py-2 pl-7 pr-3 text-xs text-text-muted hover:text-text"
                          >
                            <span className="size-1.5 shrink-0 rounded-full bg-border" />
                            <span className="min-w-0 break-words text-left">
                              <RichMath source={card.title} />
                            </span>
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
          {eigenKop ? null : <h1 className="sr-only">{labels.h1}</h1>}

          {vaakGezocht && vaakGezocht.length > 0 && <VaakGezocht voorbeelden={vaakGezocht} />}

          {chapters.map((ch) => {
            const { code, short } = splitTitle(ch.title)
            const Kop = eigenKop ? 'h1' : 'h2'
            // Op een losse pagina is de hoofdstuktitel h1, dus de kaarten
            // daaronder zijn h2. Op het overzicht is de titel h2 en blijven
            // de kaarten h3. Anders slaat een kop een niveau over.
            const KaartKop = eigenKop ? 'h2' : 'h3'
            return (
              <section
                key={ch.slug}
                id={`hoofdstuk-${ch.slug}`}
                className="scroll-mt-4"
              >
                <div className="mt-20 flex flex-col gap-3 border-b border-border pb-3 first:mt-0 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
                  <Kop
                    className={
                      eigenKop
                        ? 'min-w-0 break-words font-serif text-3xl text-text'
                        : 'font-serif text-2xl text-text'
                    }
                  >
                    {code && (
                      <>
                        <span className="font-mono font-semibold">{code}</span>
                        {' – '}
                      </>
                    )}
                    {short}
                  </Kop>
                  <div className="flex w-full min-w-0 flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
                    <ProberenKnop slug={ch.slug} />
                    <DeelKnop
                      pad={
                        eigenKop
                          ? undefined
                          : `/nl/theorie/${ch.slug}`
                      }
                    />
                    {ch.oefenlinks && ch.oefenlinks.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {ch.oefenlinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href as '/oefenen'}
                            data-meet="theorie-oefenlink"
                            className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-medium text-text"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <Link
                        href={`/oefenen?chapter=${encodeURIComponent(ch.slug)}` as '/oefenen'}
                        data-meet="theorie-oefen-hoofdstuk"
                        className="inline-flex min-h-11 items-center text-sm font-medium text-accent underline-offset-2 hover:underline"
                      >
                        {ch.practiceLabel}
                      </Link>
                    )}
                  </div>
                </div>

                {ch.intro && (
                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-muted">
                    <RichMath source={ch.intro} />
                  </p>
                )}

                {ch.stappenplan && (
                  <StappenplanKaart
                    chapterSlug={ch.slug}
                    plan={ch.stappenplan}
                    labels={labels}
                    Kop={KaartKop}
                    onKies={(cardId) => kiesKaart(ch.slug, cardId)}
                  />
                )}

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {ch.cards.map((card, i) => {
                    const groepskop =
                      card.groep && card.groep !== ch.cards[i - 1]?.groep ? card.groep : null
                    return (
                      <Fragment key={card.id}>
                        {groepskop && (
                          <KaartKop className="mt-4 text-xs font-semibold uppercase tracking-wider text-text-muted first:mt-0 md:col-span-2">
                            <RichMath source={groepskop} />
                          </KaartKop>
                        )}
                        <TheoryCard
                          chapterSlug={ch.slug}
                          card={card}
                          open={openCards.has(`${ch.slug}/${card.id}`)}
                          onToggle={() => toggleCard(`${ch.slug}/${card.id}`)}
                          labels={labels}
                          Kop={KaartKop}
                        />
                      </Fragment>
                    )
                  })}
                </div>

                {ch.voorbeelden && ch.voorbeelden.length > 0 && (
                  <Voorbeeldopgaven
                    chapterSlug={ch.slug}
                    opgaven={ch.voorbeelden}
                    deelPad={`/nl/theorie/${ch.slug}#voorbeeldopgaven`}
                  />
                )}

                <Uitwerkingen hoofdstuk={ch.slug} />
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** Snelste route naar een paar voorbeeldpagina's die in Google al scoren, zodat een
 * leerling die via de zoekmachine op /theorie belandt niet eerst een hoofdstuk hoeft
 * te kiezen. */
function VaakGezocht({ voorbeelden }: { voorbeelden: Voorbeeld[] }) {
  return (
    <section
      className="mb-6 rounded-xl border border-border bg-surface px-4 py-4 sm:px-5"
      aria-labelledby="vaak-gezocht"
    >
      <h2 id="vaak-gezocht" className="font-serif text-lg text-text">
        Vaak gezocht
      </h2>
      <ul className="mt-2 space-y-1">
        {voorbeelden.map((voorbeeld) => (
          <li key={voorbeeld.slug}>
            <Link
              href={`/voorbeeld/${voorbeeld.slug}` as '/voorbeeld'}
              className="inline-flex min-h-11 items-center text-sm font-medium text-accent underline-offset-2 hover:underline"
            >
              {voorbeeld.kop}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ── Het stappenplan van een hoofdstuk ──────────────────────────────────── */

function StappenplanKaart({
  chapterSlug,
  plan,
  labels,
  Kop,
  onKies,
}: {
  chapterSlug: string
  plan: Stappenplan
  labels: Labels
  Kop: 'h2' | 'h3'
  onKies: (cardId: string) => void
}) {
  // Rijen onder hun groepskop bundelen: één kader per antwoord op stap 0,
  // zodat de leerling na één vraag nog maar een paar keuzes overhoudt.
  const groepen: Array<{ naam?: string; rijen: typeof plan.herken }> = []
  for (const rij of plan.herken) {
    const laatste = groepen[groepen.length - 1]
    if (laatste && laatste.naam === rij.groep) laatste.rijen.push(rij)
    else groepen.push({ naam: rij.groep, rijen: [rij] })
  }

  return (
    <article
      id={`stappenplan-${chapterSlug}`}
      className="mt-6 scroll-mt-4 rounded-xl border border-accent/40 bg-accent-light/40"
    >
      <div className="px-4 py-4 sm:px-5">
        <Kop className="font-serif text-lg text-text">{plan.stap0Titel ?? labels.stap0Title}</Kop>
        <p className="mt-1 text-sm leading-relaxed text-text-muted">
          <RichMath source={plan.intro} />
        </p>
      </div>

      <div className="space-y-3 px-4 pb-5 sm:px-5">
        {/* Stap 0 · de keuzehulp: aantikbare vormen in plaats van een tabel */}
        {groepen.map((groep, gi) => (
          <div key={gi} className="rounded-lg border border-border bg-surface p-3">
            {groep.naam && (
              <p className="mb-2 text-sm font-semibold leading-snug text-text">
                <RichMath source={groep.naam} />
              </p>
            )}
            <ul className="grid gap-2 md:grid-cols-2">
              {groep.rijen.map((row, i) => {
                const inhoud = (
                  <>
                    <span className="min-w-0">
                      <span className="block min-w-0 overflow-x-auto text-text">
                        <TeX tex={row.voorbeeld} />
                      </span>
                      <span className="mt-0.5 block text-xs leading-snug text-text-muted">
                        <RichMath source={row.schil} />
                      </span>
                    </span>
                    <span
                      className={cn(
                        'shrink-0 text-sm font-medium',
                        row.kaart ? 'text-accent' : 'text-text-muted',
                      )}
                    >
                      <RichMath source={row.regel} />
                      {row.kaart && <span aria-hidden> →</span>}
                    </span>
                  </>
                )
                const vorm = 'flex min-h-11 w-full min-w-0 items-center justify-between gap-3 px-3 py-2 text-left'
                return (
                  <li key={i} className="min-w-0">
                    {row.kaart ? (
                      <button
                        type="button"
                        onClick={() => onKies(row.kaart!)}
                        className={cn(
                          vorm,
                          'rounded-lg border border-border bg-surface-2/60 transition hover:border-accent hover:bg-accent-light/60',
                        )}
                      >
                        {inhoud}
                      </button>
                    ) : (
                      <div className={vorm}>{inhoud}</div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}

        {/* Stap 1–3 per regel — alleen als ze niet al in de kaarten zelf staan */}
        {plan.regels && plan.regels.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">
              {labels.regelsTitle}
            </p>

            {/* Telefoon: gestapelde kaartjes, want Route/Stap 1/2/3 past niet naast elkaar op een smal scherm */}
            <ul className="grid gap-3 sm:hidden">
              {plan.regels.map((row, i) => (
                <li key={i} className="min-w-0 rounded-lg border border-border bg-surface p-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                    {labels.herkenRegel}
                  </p>
                  <p className="font-medium text-text">{row.regel}</p>
                  <p className="mt-1 overflow-x-auto whitespace-nowrap text-[0.85em] text-text-muted">
                    <TeX tex={row.formule} />
                  </p>
                  <dl className="mt-3 space-y-2 border-t border-border pt-3">
                    {[row.stap1, row.stap2, row.stap3].map((stap, n) => (
                      <div key={n} className="min-w-0">
                        <dt className="text-xs font-medium uppercase tracking-wider text-text-muted">
                          {labels.stepLabel.replace('{n}', String(n + 1))}
                        </dt>
                        <dd className="mt-0.5 min-w-0 overflow-x-auto whitespace-nowrap text-text">
                          <RichMath source={stap} />
                        </dd>
                      </div>
                    ))}
                  </dl>
                </li>
              ))}
            </ul>

            {/* Vanaf tablet: tabel, breed genoeg voor alle kolommen naast elkaar */}
            <div className="hidden overflow-x-auto rounded-lg border border-border bg-surface sm:block">
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
        )}

        {plan.slot && (
          <p className="text-xs leading-relaxed text-text-muted">
            <RichMath source={plan.slot} />
          </p>
        )}
      </div>
    </article>
  )
}

/**
 * De uitleg van een dichte kaart, als gewone tekst in de HTML.
 * De opgemaakte formules komen pas als de leerling de kaart opent.
 */
function KaartTekst({ card, labels }: { card: OverviewCard; labels: Labels }) {
  return (
    <div className="space-y-3 pt-1 text-sm leading-relaxed text-text">
      {card.formula && <p>{leesbareWiskunde(card.formula)}</p>}
      {card.answerNote && (
        <p>
          <span className="font-medium">{labels.answerNoteLabel}: </span>
          {leesbareTekst(card.answerNote)}
        </p>
      )}
      {card.table && (
        <table>
          <thead>
            <tr>
              {card.table.headers.map((h, i) => (
                <th key={i}>{leesbareTekst(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {card.table.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci}>{leesbareTekst(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {card.examples?.map((ex, i) => (
        <div key={i}>
          <p>
            {leesbareWiskunde(ex.problem)} → {leesbareWiskunde(ex.answer)}
          </p>
          {ex.steps && ex.steps.length > 0 && (
            <ol>
              {ex.steps.map((s, si) => (
                <li key={si}>{leesbareTekst(s)}</li>
              ))}
            </ol>
          )}
        </div>
      ))}
      {card.herken?.map((item, i) => (
        <p key={i}>
          {leesbareWiskunde(item.problem)} — {item.regel}. {leesbareTekst(item.waarom)}
        </p>
      ))}
      {card.notes?.map((note, i) => (
        <p key={i}>{leesbareTekst(note)}</p>
      ))}
    </div>
  )
}

/* ── Eén theoriekaart ───────────────────────────────────────────────────── */

function Uitwerkingen({ hoofdstuk }: { hoofdstuk: string }) {
  const lijst = uitwerkingenVoor(hoofdstuk)
  if (lijst.length === 0) return null
  return (
    <section className="mt-8" aria-labelledby={`uitwerkingen-${hoofdstuk}`}>
      <h2 id={`uitwerkingen-${hoofdstuk}`} className="font-serif text-xl text-text">
        Uitwerkingen
      </h2>
      <ul className="mt-3 space-y-1">
        {lijst.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/voorbeeld/${item.slug}` as '/voorbeeld'}
              data-meet="theorie-voorbeeld"
              className="inline-flex min-h-11 items-center text-sm font-medium text-accent underline-offset-2 hover:underline"
            >
              {item.kop}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ProberenKnop({ slug }: { slug: string }) {
  return (
    <Link
      href={`/proberen/${slug}` as '/proberen'}
      data-meet="theorie-proefsom"
      className="inline-flex min-h-11 items-center rounded-full bg-accent px-4 text-sm font-medium text-white"
    >
      Probeer 3 sommen
    </Link>
  )
}

function Voorbeeldopgaven({
  chapterSlug,
  opgaven,
  deelPad,
}: {
  chapterSlug: string
  opgaven: Voorbeeldopgave[]
  deelPad?: string
}) {
  return (
    <section className="mt-8" aria-labelledby="voorbeeldopgaven">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="voorbeeldopgaven" className="font-serif text-xl text-text">
          Voorbeeldopgaven
        </h2>
        <DeelKnop pad={deelPad} />
      </div>
      <p className="mt-1 text-sm text-text-muted">
        Drie vaste opgaven. Je hoeft niets in te vullen.
      </p>
      <ol className="mt-4 space-y-4">
        {opgaven.map((opgave, i) => (
          <li key={opgave.bron} className="rounded-xl border border-border bg-surface px-4 py-4 sm:px-5">
            <p className="text-sm font-medium text-text-muted">Opgave {i + 1}</p>
            <div className="mt-1 overflow-x-auto text-text">
              <RichMath source={opgave.opgave} />
            </div>
            <p className="sr-only">{leesbareTekst(opgave.opgave)}</p>
            <details className="mt-3">
              <summary className="flex min-h-11 cursor-pointer list-none items-center self-start rounded-full border border-border px-4 text-sm text-text-muted [&::-webkit-details-marker]:hidden">
                Toon de stappen
              </summary>
              <ol className="mt-3 space-y-2 text-sm leading-relaxed text-text">
                {opgave.stappen.map((stap, si) => (
                  <li key={si} className="flex items-start gap-2">
                    <span className="min-w-[1.1rem] shrink-0 font-semibold tabular-nums text-accent">
                      {si + 1}.
                    </span>
                    <span>
                      <RichMath source={stap} />
                      <span className="sr-only">{leesbareTekst(stap)}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </details>
            <p className="mt-3 overflow-x-auto text-sm text-text">
              <span className="font-medium">Antwoord: </span>
              <RichMath source={opgave.antwoord} />
              <span className="sr-only">{leesbareTekst(opgave.antwoord)}</span>
            </p>
          </li>
        ))}
      </ol>
      <div className="mt-5">
        <ProberenKnop slug={chapterSlug} />
      </div>
    </section>
  )
}

function TheoryCard({
  chapterSlug,
  card,
  open,
  onToggle,
  labels,
  Kop,
}: {
  chapterSlug: string
  card: OverviewCard
  open: boolean
  onToggle: () => void
  labels: Labels
  Kop: 'h2' | 'h3'
}) {
  // Alles wat uitwerking is zit in het uitklapdeel: formule, antwoordvorm en
  // tabel horen daar ook bij. Dicht toont een kaart alleen waaraan je hem herkent.
  const expandable =
    (card.examples?.length ?? 0) > 0 ||
    (card.notes?.length ?? 0) > 0 ||
    (card.herken?.length ?? 0) > 0 ||
    Boolean(card.formula) ||
    Boolean(card.answerNote) ||
    Boolean(card.table)
  const [revealed, setRevealed] = useState<Set<number>>(new Set())

  return (
    <article
      id={`kaart-${chapterSlug}-${card.id}`}
      className={cn(
        'flex min-w-0 scroll-mt-4 flex-col rounded-xl border border-border bg-surface',
        (card.topicSlug || card.breed) && 'md:col-span-2',
      )}
    >
      {expandable ? (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-label={`${leesbareTekst(card.title)} — ${labels.detailsLabel}`}
          className="group flex w-full min-w-0 items-center justify-between gap-3 rounded-t-xl px-4 py-4 text-left sm:px-5"
        >
          <span className="min-w-0">
            <Kop className="font-serif text-lg leading-snug text-text">
              <RichMath source={card.title} />
            </Kop>
            {card.herkenpunt && (
              <span className="mt-1 block min-w-0 overflow-x-auto text-text-muted">
                <TeX tex={card.herkenpunt} />
              </span>
            )}
          </span>
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-light text-accent transition group-hover:bg-accent group-hover:text-white">
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
        <div className="px-4 py-4 sm:px-5">
          <Kop className="font-serif text-lg leading-snug text-text">
            <RichMath source={card.title} />
          </Kop>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-3 px-4 pb-5 sm:px-5">
        {expandable && (
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
              open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              {open ? (
              <div className="space-y-3 pt-1">
                {card.formula && (
                  <div className="flex min-w-0 items-center justify-center overflow-x-auto rounded-lg bg-accent-light/60 px-4 py-4 text-[0.9em]">
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
                              <RichMath source={h} />
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

                {card.examples && card.examples.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
                      {labels.exampleLabel}
                    </p>
                    <ul className={cn('gap-2', card.examples.length > 1 ? 'grid md:grid-cols-2' : 'space-y-2')}>
                      {card.examples.map((ex, i) => (
                        <li
                          key={i}
                          className="min-w-0 overflow-x-auto rounded-lg border border-border bg-surface-2/60 px-3 py-2.5 text-sm"
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
                            className="flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-surface-2/60 px-3 py-2.5 text-sm"
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
                                className="flex min-h-11 items-center self-start rounded-full border border-border px-3 text-xs text-text-muted transition hover:border-accent hover:text-accent"
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
              ) : (
                <KaartTekst card={card} labels={labels} />
              )}
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
