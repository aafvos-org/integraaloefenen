'use client'

import { useRouter } from 'next/navigation'

import { Link } from '@/i18n/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'

import { Math as TeX } from '@/components/math'
import {
  OpgaveTekst,
  Stappenplan,
  useAntwoordInvoer,
  type Stap,
} from '@/components/oefenkaart'
import { Button, ErrorBanner } from '@/components/ui'
import { submitStudyAnswerAction } from '@/lib/practice/chapter-actions'
import { toLatexPreview } from '@/lib/practice/input'
import { antwoordPrefix, opdrachtSleutel } from '@/lib/practice/opdracht'
import { MASTERY_THRESHOLD } from '@/lib/practice/progress'
import { nakijkenMetVangnet } from '@/lib/practice/vangnet'
import type { UitlegVideo } from '@/lib/videos'

import { MathKeyboard } from '@/components/math-keyboard'

/** Klein icoontje: er staat een uitlegvideo klaar over dit onderwerp. */
function IconVideo() {
  return (
    <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.14v13.72c0 .8.87 1.3 1.56.88l10.54-6.86a1.05 1.05 0 0 0 0-1.76L9.56 4.26A1.04 1.04 0 0 0 8 5.14Z" />
    </svg>
  )
}

type StudyQuestion = {
  id: string
  latex_body: string | null
  difficulty: 1 | 2 | 3
}

type State =
  | { phase: 'input'; error: string | null }
  | { phase: 'correct'; streak: number; mastered: boolean }
  | {
      phase: 'wrong'
      userAnswer: string
      correctAnswer: string
      latexCorrectAnswer: string | null
      errorExplanation: string | null
    }

export function StudyCard({
  question,
  steps,
  nextHref,
  questionNumber,
  video,
  onAnswered,
}: {
  question: StudyQuestion
  steps: Stap[]
  nextHref?: string
  questionNumber?: number
  /** Uitlegvideo over dit onderwerp, als die er is. */
  video?: UitlegVideo | null
  onAnswered?: (questionId: string, isCorrect: boolean) => void
}) {
  const router = useRouter()
  const t = useTranslations('PracticeCard')
  const [pending, startTransition] = useTransition()
  const [submitting, setSubmitting] = useState(false)
  const [answer, setAnswer] = useState('')
  const [state, setState] = useState<State>({ phase: 'input', error: null })
  const [lastAttempt, setLastAttempt] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const { invoerRef: inputRef, voegIn } = useAntwoordInvoer(answer, setAnswer)
  const feedbackRef = useRef<HTMLDivElement | null>(null)
  const shownAtRef = useRef(0)
  // Wat er gevraagd wordt en hoe de antwoordregel begint, allebei afgeleid
  // uit de opgave zelf. Zie src/lib/practice/opdracht.ts.
  const opdracht = opdrachtSleutel(question.latex_body)
  const prefix = antwoordPrefix(question.latex_body)
  // Reset bij vraagwissel gebeurt via key={question.id} op de call site.

  useEffect(() => {
    shownAtRef.current = Date.now()
  }, [])

  // Stappenplan + knoppen automatisch in beeld brengen na het onthullen
  useEffect(() => {
    if (revealed) {
      feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [revealed])

  function next() {
    startTransition(() => {
      if (nextHref) {
        router.push(nextHref)
      } else {
        router.refresh()
      }
    })
  }

  function retry() {
    setAnswer('')
    setRevealed(false)
    setState({ phase: 'input', error: null })
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!answer.trim() || state.phase !== 'input') return

    setSubmitting(true)
    const submitted = answer
    const seconden = Math.round((Date.now() - shownAtRef.current) / 1000)
    startTransition(async () => {
      const result = await nakijkenMetVangnet(() =>
        submitStudyAnswerAction(question.id, submitted, seconden),
      )
      setSubmitting(false)
      if (!result) {
        setState({ phase: 'input', error: t('genericError') })
        return
      }
      if (result.kind === 'error') {
        setState({ phase: 'input', error: result.message })
        return
      }
      if (result.kind === 'correct') {
        onAnswered?.(question.id, true)
        setLastAttempt(submitted)
        setState({ phase: 'correct', streak: result.streak, mastered: result.mastered })
        return
      }
      onAnswered?.(question.id, false)
      setLastAttempt(submitted)
      setState({
        phase: 'wrong',
        userAnswer: submitted,
        correctAnswer: result.correctAnswer,
        latexCorrectAnswer: result.latexCorrectAnswer,
        errorExplanation: result.errorExplanation,
      })
    })
  }

  return (
    <div className="min-w-0 overflow-x-auto rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {questionNumber != null && (
            <span className="text-xs font-medium text-text-muted">
              #{questionNumber}
            </span>
          )}
        </div>
        {video && (
          <Link
            href={`/uitleg-videos?video=${encodeURIComponent(video.slug)}` as '/uitleg-videos'}
            data-meet="oefenen-video-bij-vraag"
            title={video.title}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-accent/30 bg-accent-light px-2.5 py-1 text-xs font-medium text-accent transition hover:border-accent/60"
          >
            <IconVideo />
            <span>{t('hasVideo')}</span>
          </Link>
        )}
      </div>

      <div className="mb-6">
        {opdracht && (
          <p className="mb-1 text-sm font-medium text-text-muted">{t(opdracht)}</p>
        )}
        <div className="min-w-0 overflow-x-auto font-serif text-xl leading-snug text-text sm:text-2xl">
          <OpgaveTekst latexBody={question.latex_body} />
        </div>
        {state.phase === 'input' && (
          <div className="mt-2 font-serif text-2xl leading-snug text-accent">
            <TeX
              tex={`${prefix} ${
                answer.trim() ? toLatexPreview(answer) : '\\ldots'
              }`}
              displayMode
            />
          </div>
        )}
        {state.phase === 'wrong' && (
          <div className="mt-4 flex flex-wrap items-stretch justify-center gap-3">
            {state.userAnswer.trim() && (
              <div className="w-fit rounded-xl border border-accent-2/40 bg-accent-2-light px-5 py-3 text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-accent-2/80">
                  {t('yourAnswer')}
                </p>
                <div className="mt-1 font-serif text-2xl leading-snug text-accent-2">
                  <TeX
                    tex={`${prefix} ${toLatexPreview(
                      state.userAnswer,
                    )}`}
                  />
                </div>
              </div>
            )}
            {revealed && (
              <div className="w-fit rounded-xl border border-accent/30 bg-accent-light px-5 py-3 text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-accent/80">
                  {t('correctAnswer')}
                </p>
                <div className="mt-1 font-serif text-2xl leading-snug text-accent">
                  <TeX
                    tex={`${prefix} ${(
                      state.latexCorrectAnswer ?? state.correctAnswer
                    ).replaceAll('$', '')}`}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {state.phase === 'input' && (
        <div className="space-y-3">
          <div className="relative">
            <form
              onSubmit={submit}
              className={`space-y-3 ${
                pending && submitting ? 'pointer-events-none opacity-30' : ''
              }`}
              aria-hidden={pending && submitting ? true : undefined}
            >
              <label className="block">
                <div className="mb-2 flex min-h-8 items-center gap-2">
                  {lastAttempt?.trim() && (
                    <>
                      <span className="text-xs uppercase tracking-wide text-text-muted">
                        {t('previousAttempt')}
                      </span>
                      <span className="font-serif text-lg text-text">
                        <TeX tex={toLatexPreview(lastAttempt)} />
                      </span>
                    </>
                  )}
                </div>
                <input
                  ref={inputRef}
                  autoFocus
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={t('placeholder')}
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 font-mono text-lg text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  disabled={pending && submitting}
                  inputMode="text"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
                <MathKeyboard onInsert={voegIn} disabled={pending} />
              </label>

              <ErrorBanner>{state.error}</ErrorBanner>

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  data-meet="oefenen-nakijken"
                  disabled={(pending && submitting) || !answer.trim()}
                >
                  {t('submit')}
                </Button>
              </div>
            </form>
            {pending && submitting && (
              <div
                role="status"
                aria-live="polite"
                aria-busy="true"
                aria-label={t('checking')}
                className="absolute inset-0 flex items-center justify-center"
              >
                <svg
                  className="size-10 animate-spin text-accent"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M12 3a9 9 0 1 1-9 9" />
                </svg>
              </div>
            )}
          </div>
        </div>
      )}

      {state.phase === 'correct' && (
        <div className="rounded-xl border border-accent/30 bg-accent-light p-4">
          <p className="font-serif text-xl text-accent">
            {state.mastered ? t('correctMastered') : t('correct')}
          </p>
          <p className="mt-1 text-sm text-accent/80">
            {state.mastered
              ? t('masteredBody')
              : t('streakBody', { streak: state.streak, remaining: MASTERY_THRESHOLD - state.streak })}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Button onClick={next} data-meet="oefenen-volgende" disabled={pending}>
              {pending ? t('navigating') : t('nextQuestion')}
            </Button>
            <button
              type="button"
              data-meet="oefenen-nog-een-zelfde"
              onClick={retry}
              disabled={pending}
              className="rounded-lg border border-accent/40 bg-white/70 px-4 py-2 text-sm font-medium text-accent transition hover:bg-white disabled:opacity-60"
            >
              {t('retryButton')}
            </button>
          </div>
        </div>
      )}

      {state.phase === 'wrong' && (
        <div ref={feedbackRef}>
          <WrongFeedback
            steps={steps}
            revealed={revealed}
            onReveal={() => setRevealed(true)}
            onNext={next}
            onRetry={retry}
            pending={pending}
          />
        </div>
      )}
    </div>
  )
}

function WrongFeedback({
  steps,
  revealed,
  onReveal,
  onNext,
  onRetry,
  pending,
}: {
  steps: Stap[]
  revealed: boolean
  onReveal: () => void
  onNext: () => void
  onRetry: () => void
  pending: boolean
}) {
  const t = useTranslations('PracticeCard')

  if (!revealed) {
    return (
      <div className="flex items-center justify-center gap-2">
        <Button onClick={onRetry} data-meet="oefenen-opnieuw" disabled={pending}>
          {t('retryButton')}
        </Button>
        <button
          type="button"
          data-meet="oefenen-toon-antwoord"
          onClick={onReveal}
          disabled={pending}
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition hover:bg-surface-2 disabled:opacity-60"
        >
          {t('showAnswer')}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {steps.length > 0 ? (
        <Stappenplan stappen={steps} titel={t('stepsTitle')} />
      ) : (
        <p className="text-xs text-text-muted">{t('noSteps')}</p>
      )}

      <div className="flex items-center justify-center gap-2">
        <Button onClick={onNext} data-meet="oefenen-volgende-na-antwoord" disabled={pending}>
          {pending ? t('navigating') : t('nextPlus')}
        </Button>
        <button
          type="button"
          data-meet="oefenen-opnieuw-na-antwoord"
          onClick={onRetry}
          disabled={pending}
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition hover:bg-surface-2 disabled:opacity-60"
        >
          {t('retryButton')}
        </button>
      </div>
    </div>
  )
}
