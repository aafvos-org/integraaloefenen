'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState, useSyncExternalStore, useTransition } from 'react'

import { Math as TeX } from '@/components/math'
import { MathKeyboard } from '@/components/math-keyboard'
import {
  GoedAntwoord,
  OpgaveTekst,
  Stappenplan,
  useAntwoordInvoer,
  type Stap,
} from '@/components/oefenkaart'
import { Button, ErrorBanner } from '@/components/ui'
import { VraagForm } from '@/components/vraag-form'
import { toLatexPreview } from '@/lib/practice/input'
import { nakijkenMetVangnet } from '@/lib/practice/vangnet'
import { heeftInlogsessie } from '@/lib/supabase/sessie-cookie'

import { ExerciseTileMathPreview } from '../oefenen/exercise-tile-preview'

import { checkVideoAnswerAction, haalVideoOefenvragenAction } from './actions'
import type { OefenVraag } from './kies-vragen'

function cookiesUitDocument(): { name: string }[] {
  return document.cookie.split(';').map((deel) => ({
    name: deel.split('=')[0]?.trim() ?? '',
  }))
}

/** Zelfde aanpak als de examenpagina: de HTML blijft de uitgelogde versie. */
function useIngelogd(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => heeftInlogsessie(cookiesUitDocument()),
    () => false,
  )
}

/**
 * ?video= zit niet in de opgebouwde HTML. Dit stuk leest hem in de browser,
 * achter een Suspense-grens, zodat de rest van de pagina wél vast blijft.
 */
function VideoUitAdres({ onGevonden }: { onGevonden: (slug: string | null) => void }) {
  const gevraagd = useSearchParams().get('video')?.trim() || null
  useEffect(() => {
    onGevonden(gevraagd)
  }, [gevraagd, onGevonden])
  return null
}

type VideoItem = {
  slug: string
  title: string
  description: string
  soort: 'algemeen' | 'vraaguitwerking'
  chapter: string | null
  duration: string
  src: string
  href: string
  hasPractice: boolean
}

type Labels = {
  h1: string
  intro: string
  playlistTitle: string
  practiceTitle: string
  questionTile: string
  preview: string
  placeholder: string
  check: string
  checking: string
  correct: string
  wrongTitle: string
  yourAnswer: string
  correctAnswer: string
  stepsTitle: string
  nextQuestion: string
  previousQuestion: string
  morePractice: string
  loginToPractice: string
  practiceLoading: string
  practiceError: string
  checkError: string
  askTitle: string
  askIntro: string
  askCta: string
  askPlaceholder: string
  askSend: string
  askThanks: string
  askPhoto: string
  askPhotoHint: string
  askPhotoRemove: string
  askPhotoBusy: string
  askPhotoTooBig: string
  groupGeneral: string
  groupWalkthrough: string
  chapterOther: string
  emptyTitle: string
  emptyBody: string
  emptyPractice: string
  askNoAccount: string
  askLogin: string
  askRegister: string
}

function IconPlay() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.14v13.72c0 .8.87 1.3 1.56.88l10.54-6.86a1.05 1.05 0 0 0 0-1.76L9.56 4.26A1.04 1.04 0 0 0 8 5.14Z" />
    </svg>
  )
}

/** Eén regel in de playlist. */
function VideoLink({ video, isActive }: { video: VideoItem; isActive: boolean }) {
  return (
    <li>
      <Link
        href={video.href as '/uitleg-videos'}
        data-meet="video-kiezen"
        scroll={false}
        aria-current={isActive ? 'true' : undefined}
        className={`flex items-start gap-2.5 rounded-xl border p-3 transition ${
          isActive
            ? 'border-accent bg-accent-light text-text'
            : 'border-border bg-surface text-text-muted hover:border-accent/40 hover:text-text'
        }`}
      >
        <span className={isActive ? 'mt-0.5 text-accent' : 'mt-0.5'}>
          <IconPlay />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-medium leading-snug">{video.title}</span>
          <span className="mt-0.5 block text-xs opacity-70">{video.duration}</span>
        </span>
      </Link>
    </li>
  )
}

/** Uitklapbaar hoofdstuk met de vraaguitwerkingen die erbij horen. */
function Hoofdstukgroep({
  titel,
  items,
  activeSlug,
}: {
  titel: string
  items: VideoItem[]
  activeSlug: string | null
}) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-1.5 rounded-lg px-1 py-1.5 text-left text-sm font-medium text-text transition hover:text-accent"
      >
        <svg
          className={`size-3.5 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span>{titel}</span>
        <span className="text-xs font-normal text-text-muted">({items.length})</span>
      </button>
      {open && (
        <ul className="mt-1 space-y-2 pl-2">
          {items.map((v) => (
            <VideoLink key={v.slug} video={v} isActive={v.slug === activeSlug} />
          ))}
        </ul>
      )}
    </div>
  )
}

export function UitlegVideosClient({
  videos,
  loginHref,
  registerHref,
  oefenHref,
  labels,
}: {
  videos: VideoItem[]
  loginHref: string
  registerHref: string
  oefenHref: string
  labels: Labels
}) {
  const ingelogd = useIngelogd()
  const [uitAdres, setUitAdres] = useState<string | null>(null)
  const activeSlug = videos.some((v) => v.slug === uitAdres)
    ? uitAdres
    : (videos[0]?.slug ?? null)
  const active = videos.find((v) => v.slug === activeSlug) ?? null
  const [toonAccountMelding, setToonAccountMelding] = useState(false)
  const [vragen, setVragen] = useState<OefenVraag[]>([])
  const [vragenVoor, setVragenVoor] = useState<{
    slug: string | null
    ingelogd: boolean
  } | null>(null)
  const [vragenLaden, setVragenLaden] = useState(false)
  const [vragenMislukt, setVragenMislukt] = useState(false)

  // Andere video of net ingelogd: de vorige vragen horen hier niet te blijven staan.
  if (vragenVoor?.slug !== activeSlug || vragenVoor?.ingelogd !== ingelogd) {
    setVragenVoor({ slug: activeSlug, ingelogd })
    setVragen([])
    setVragenMislukt(false)
    setVragenLaden(Boolean(ingelogd && active?.hasPractice))
  }

  useEffect(() => {
    if (!ingelogd || !activeSlug || !active?.hasPractice) return
    let geannuleerd = false
    haalVideoOefenvragenAction(activeSlug)
      .then((uitkomst) => {
        if (geannuleerd) return
        if (uitkomst.kind === 'error') {
          setVragenMislukt(true)
          setVragen([])
        } else {
          setVragen(uitkomst.vragen)
        }
      })
      .catch(() => {
        if (!geannuleerd) setVragenMislukt(true)
      })
      .finally(() => {
        if (!geannuleerd) setVragenLaden(false)
      })
    return () => {
      geannuleerd = true
    }
  }, [ingelogd, activeSlug, active?.hasPractice])
  const algemeen = useMemo(() => videos.filter((v) => v.soort === 'algemeen'), [videos])

  /** Vraaguitwerkingen per hoofdstuk, H2 vóór H6/H7/H9; zonder hoofdstuk achteraan. */
  const perHoofdstuk = useMemo(() => {
    const uitwerkingen = videos.filter((v) => v.soort === 'vraaguitwerking')
    const kaart = new Map<string, VideoItem[]>()
    for (const v of uitwerkingen) {
      const sleutel = v.chapter ?? ''
      kaart.set(sleutel, [...(kaart.get(sleutel) ?? []), v])
    }
    return [...kaart.entries()]
      .map(([chapter, items]) => ({ chapter, items }))
      .sort((a, b) => {
        if (a.chapter === '') return 1
        if (b.chapter === '') return -1
        return Number(a.chapter.slice(1)) - Number(b.chapter.slice(1))
      })
  }, [videos])

  /**
   * Zonder account kan er geen vraag ingestuurd worden: dan tonen we een melding
   * bij de knop. Ingelogd springen we naar het formulier onderaan.
   */
  function naarVraagFormulier() {
    if (!ingelogd) {
      setToonAccountMelding(true)
      return
    }
    const sectie = document.getElementById('vraag-stellen')
    sectie?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    window.setTimeout(() => {
      sectie?.querySelector('textarea')?.focus({ preventScroll: true })
    }, 600)
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
      <Suspense fallback={null}>
        <VideoUitAdres onGevonden={setUitAdres} />
      </Suspense>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-text sm:text-4xl">{labels.h1}</h1>
          {/* Zonder video's belooft de intro iets wat er niet staat: dan vertelt
              het blok hieronder wat er wél is. */}
          {videos.length > 0 && (
            <p className="mt-2 max-w-2xl text-text-muted">{labels.intro}</p>
          )}
        </div>
        {/* Snelkoppeling naar het formulier; zonder video's staat dat er direct onder */}
        {videos.length > 0 && (
          <div className="shrink-0 rounded-2xl border border-border bg-surface-2 p-4 sm:max-w-64">
            <p className="font-serif text-base text-text">{labels.askTitle}</p>
            <p className="mt-1 text-sm text-text-muted">{labels.askIntro}</p>
            <button
              type="button"
              onClick={naarVraagFormulier}
              className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/90"
            >
              {labels.askCta}
            </button>
            {toonAccountMelding ? (
              <div role="status" className="mt-3">
                <AccountNodigMelding
                  loginHref={loginHref}
                  registerHref={registerHref}
                  labels={labels}
                />
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Lege toestand: er staat nog geen enkele video klaar */}
      {videos.length === 0 && (
        <section className="mt-6 rounded-2xl border border-border bg-surface-2 p-5 sm:p-7">
          <h2 className="font-serif text-2xl text-text">{labels.emptyTitle}</h2>
          <p className="mt-2 max-w-2xl text-text-muted">{labels.emptyBody}</p>
          <Link
            href={oefenHref as '/oefenen'}
            data-meet="video-leeg-oefenen"
            className="mt-5 inline-block rounded-lg bg-accent px-5 py-3 font-medium text-white shadow-sm transition hover:bg-accent/90"
          >
            {labels.emptyPractice}
          </Link>
        </section>
      )}

      {videos.length > 0 && (
        <div className="mt-8 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Speler (rechts op desktop, bovenaan op mobiel) */}
          <div className="lg:order-2">
            {active ? (
              <video
                key={active.src}
                src={active.src}
                controls
                preload="metadata"
                className="aspect-video w-full rounded-2xl border border-border bg-surface-2 shadow-sm"
              />
            ) : null}
            {active ? (
              <div className="mt-3">
                <h2 className="font-serif text-xl text-text">{active.title}</h2>
                <p className="mt-1 text-sm text-text-muted">{active.description}</p>
              </div>
            ) : null}
          </div>

          {/* Playlist (links op desktop) */}
          <aside className="lg:order-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              {labels.playlistTitle}
            </p>

            {algemeen.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  {labels.groupGeneral}
                </p>
                <ul className="mt-2 space-y-2">
                  {algemeen.map((v) => (
                    <VideoLink key={v.slug} video={v} isActive={v.slug === activeSlug} />
                  ))}
                </ul>
              </div>
            )}

            {perHoofdstuk.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  {labels.groupWalkthrough}
                </p>
                <div className="mt-2 space-y-1.5">
                  {perHoofdstuk.map(({ chapter, items }) => (
                    <Hoofdstukgroep
                      key={chapter || 'overig'}
                      titel={chapter || labels.chapterOther}
                      items={items}
                      activeSlug={activeSlug}
                    />
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Oefenen */}
      {active?.hasPractice ? (
        <section className="mt-10">
          <h2 className="font-serif text-2xl text-text">{labels.practiceTitle}</h2>
          {ingelogd && vragen.length > 0 ? (
            <div className="mt-4">
              <OefenKaart key={active.slug} vragen={vragen} oefenHref={oefenHref} labels={labels} />
            </div>
          ) : ingelogd && vragenLaden ? (
            <p className="mt-3 text-text-muted" role="status">
              {labels.practiceLoading}
            </p>
          ) : ingelogd && vragenMislukt ? (
            <p className="mt-3 text-text-muted" role="alert">
              {labels.practiceError}
            </p>
          ) : !ingelogd ? (
            <p className="mt-3 text-text-muted">
              <Link href={loginHref as '/inloggen'} className="text-accent underline underline-offset-2">
                {labels.loginToPractice}
              </Link>
            </p>
          ) : null}
        </section>
      ) : null}

      {/* Vraag insturen */}
      <section
        id="vraag-stellen"
        className="mt-12 scroll-mt-20 rounded-2xl border border-border bg-surface-2 p-5 sm:p-7"
      >
        <h2 className="font-serif text-2xl text-text">{labels.askTitle}</h2>
        <p className="mt-1 text-sm text-text-muted">{labels.askIntro}</p>
        {ingelogd ? (
          <VraagForm labels={labels} />
        ) : (
          <div className="mt-4">
            <AccountNodigMelding
              loginHref={loginHref}
              registerHref={registerHref}
              labels={labels}
            />
          </div>
        )}
      </section>
    </main>
  )
}

/* ── Melding: vraag stellen kan pas met een account ─────────────────── */

function AccountNodigMelding({
  loginHref,
  registerHref,
  labels,
}: {
  loginHref: string
  registerHref: string
  labels: Labels
}) {
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3">
      <p className="text-sm text-text">{labels.askNoAccount}</p>
      <p className="mt-3 flex flex-wrap gap-2 text-sm">
        <Link
          href={loginHref as '/inloggen'}
          data-meet="video-vraag-inloggen"
          className="inline-flex min-h-11 items-center rounded-lg bg-accent px-4 py-2 font-medium text-white transition hover:bg-accent/90"
        >
          {labels.askLogin}
        </Link>
        <Link
          href={registerHref as '/registreren'}
          data-meet="video-vraag-registreren"
          className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 py-2 font-medium text-text transition hover:bg-surface-2"
        >
          {labels.askRegister}
        </Link>
      </p>
    </div>
  )
}

/* ── Oefenkaart: 3 klikbare vraagtegels, wisselen met vorige/volgende ── */

type VraagResultaat =
  | { phase: 'correct' }
  | {
      phase: 'wrong'
      correctAnswer: string
      latexCorrectAnswer: string | null
      steps: Stap[]
    }

function OefenKaart({
  vragen,
  oefenHref,
  labels,
}: {
  vragen: OefenVraag[]
  oefenHref: string
  labels: Labels
}) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [results, setResults] = useState<Record<string, VraagResultaat>>({})
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const vraag = vragen[index]
  const answer = vraag ? (answers[vraag.id] ?? '') : ''
  const resultaat = vraag ? (results[vraag.id] ?? null) : null

  function setAnswer(value: string) {
    if (!vraag) return
    setAnswers((prev) => ({ ...prev, [vraag.id]: value }))
  }

  const { invoerRef, voegIn } = useAntwoordInvoer(answer, setAnswer)

  // Blader je naar een andere vraag, dan hoort de foutmelding van de vorige
  // vraag te verdwijnen.
  const [handledIndex, setHandledIndex] = useState(index)
  if (handledIndex !== index) {
    setHandledIndex(index)
    setError(null)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!answer.trim() || resultaat || !vraag) return
    // De melding van de vorige poging hoort weg zodra je opnieuw op nakijken
    // drukt; anders blijft hij naast het goede antwoord staan.
    setError(null)
    startTransition(async () => {
      const result = await nakijkenMetVangnet(() =>
        checkVideoAnswerAction(vraag.id, answer),
      )
      if (!result) {
        setError(labels.checkError)
        return
      }
      if (result.kind === 'error') {
        setError(result.message)
      } else if (result.kind === 'correct') {
        setResults((prev) => ({ ...prev, [vraag.id]: { phase: 'correct' } }))
      } else {
        setResults((prev) => ({
          ...prev,
          [vraag.id]: {
            phase: 'wrong',
            correctAnswer: result.correctAnswer,
            latexCorrectAnswer: result.latexCorrectAnswer,
            steps: result.steps,
          },
        }))
      }
    })
  }

  if (!vraag) return null

  const navigatie = (
    <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
      <Button
        onClick={() => setIndex((i) => i - 1)}
        data-meet="video-vorige-vraag"
        disabled={index === 0}
      >
        ← {labels.previousQuestion}
      </Button>
      <Button
        onClick={() => setIndex((i) => i + 1)}
        data-meet="video-volgende-vraag"
        disabled={index === vragen.length - 1}
      >
        {labels.nextQuestion} →
      </Button>
    </div>
  )

  return (
    <div>
      {/* Vraagtegels */}
      <div className="grid gap-3 sm:grid-cols-3">
        {vragen.map((v, i) => {
          const isActive = i === index
          const status = results[v.id]?.phase ?? null
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-current={isActive ? 'true' : undefined}
              className={`rounded-xl border p-3 text-left transition ${
                isActive
                  ? 'border-accent bg-accent-light'
                  : 'border-border bg-surface hover:border-accent/40'
              }`}
            >
              <span className="flex items-center justify-between text-sm font-medium text-text">
                <span>{labels.questionTile.replace('{n}', String(i + 1))}</span>
                {status === 'correct' && <span className="text-accent">✓</span>}
                {status === 'wrong' && <span className="text-accent-2">✗</span>}
              </span>
              <ExerciseTileMathPreview latex_body={v.latex_body} />
            </button>
          )
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <div className="mb-6 font-serif text-2xl leading-snug text-text">
        <OpgaveTekst latexBody={vraag.latex_body} />
      </div>

      {!resultaat && (
        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <div className="mb-2 flex min-h-8 items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-text-muted">
                {labels.preview}
              </span>
              {answer.trim() ? (
                <span className="font-serif text-lg text-text">
                  <TeX tex={toLatexPreview(answer)} />
                </span>
              ) : (
                <span className="text-text-muted">—</span>
              )}
            </div>
            <input
              ref={invoerRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={labels.placeholder}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 font-mono text-lg text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              disabled={pending}
              inputMode="text"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <MathKeyboard onInsert={voegIn} disabled={pending} />
          </label>
          <ErrorBanner>{error}</ErrorBanner>
          <Button type="submit" data-meet="video-nakijken" disabled={pending || !answer.trim()}>
            {pending ? labels.checking : labels.check}
          </Button>
        </form>
      )}

      {resultaat?.phase === 'correct' && (
        <div className="rounded-xl border border-accent/30 bg-accent-light p-4">
          <p className="font-serif text-xl text-accent">{labels.correct}</p>
        </div>
      )}

      {resultaat?.phase === 'wrong' && (
        <div className="rounded-xl border border-accent-2/40 bg-accent-2-light p-4">
          <p className="font-serif text-xl text-accent-2">{labels.wrongTitle}</p>
          <div className="mt-2 flex flex-col gap-1 text-sm text-accent-2">
            <span>
              {labels.yourAnswer}:{' '}
              <span className="font-serif">
                <TeX tex={toLatexPreview(answer)} />
              </span>
            </span>
            <span>
              {labels.correctAnswer}:{' '}
              <GoedAntwoord
                antwoord={resultaat.correctAnswer}
                latexAntwoord={resultaat.latexCorrectAnswer}
              />
            </span>
          </div>
          {resultaat.steps.length > 0 && (
            <Stappenplan
              stappen={resultaat.steps}
              titel={labels.stepsTitle}
              className="mt-4"
            />
          )}
        </div>
      )}

      {navigatie}
      </div>

      <p className="mt-3 text-sm">
        <Link href={oefenHref as '/oefenen'} className="text-accent underline underline-offset-2">
          {labels.morePractice} →
        </Link>
      </p>
    </div>
  )
}
