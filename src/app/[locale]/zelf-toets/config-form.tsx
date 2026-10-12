'use client'

import { useMemo, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'

import { useRouter } from '@/i18n/navigation'

import { Button, ErrorBanner } from '@/components/ui'
import type { ConfigData, QuestionSource } from '@/lib/practice/custom-test'
import {
  bouwZelfToetsBoom,
  clusterIdsVanHoofdstuk,
  type ToetsBlok,
  type ToetsCluster,
  type ToetsHoofdstuk,
  type ToetsOnderwerp,
} from '@/lib/practice/zelf-toets-indeling'

import { createCustomTestAction } from './actions'

type CheckState = 'all' | 'none' | 'some'

function checkStateFromCounts(selected: number, total: number): CheckState {
  if (total === 0) return 'none'
  if (selected === 0) return 'none'
  if (selected >= total) return 'all'
  return 'some'
}

function TriCheckbox({
  state,
  onToggle,
  ariaLabel,
}: {
  state: CheckState
  onToggle: () => void
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={state === 'all' ? 'true' : state === 'some' ? 'mixed' : 'false'}
      aria-label={ariaLabel}
      onClick={onToggle}
      className="flex size-11 shrink-0 items-center justify-center"
    >
      <span
        className={`flex size-5 items-center justify-center rounded border ${
          state === 'all'
            ? 'border-accent bg-accent text-white'
            : state === 'some'
              ? 'border-accent bg-accent-light text-accent'
              : 'border-border bg-surface'
        }`}
      >
        {state === 'all' && (
          <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor" aria-hidden>
            <path d="M6.4 11.6L3 8.2l1.1-1.1 2.3 2.3 5.5-5.5 1.1 1.1z" />
          </svg>
        )}
        {state === 'some' && (
          <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor" aria-hidden>
            <rect x="3.5" y="7.25" width="9" height="1.5" rx="0.75" />
          </svg>
        )}
      </span>
    </button>
  )
}

function ExpandButton({
  open,
  label,
  onClick,
}: {
  open: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex size-11 shrink-0 items-center justify-center text-text-muted hover:text-text"
      aria-label={label}
    >
      <svg
        viewBox="0 0 24 24"
        className={`size-3 transition-transform ${open ? 'rotate-90' : ''}`}
        fill="currentColor"
      >
        <path d="M8 5l8 7-8 7V5z" />
      </svg>
    </button>
  )
}

export function ConfigForm({
  config,
  defaultName,
}: {
  config: ConfigData
  defaultName: string
}) {
  const t = useTranslations('ZelfToets')
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [name, setName] = useState(defaultName)
  const [selectedClusters, setSelectedClusters] = useState<Set<string>>(new Set())
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set(config.chapters.map((c) => c.id)),
  )
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set())
  const [countInput, setCountInput] = useState('10')
  const [countTouched, setCountTouched] = useState(false)
  const count = Math.max(0, parseInt(countInput, 10) || 0)
  const [source, setSource] = useState<QuestionSource>('new')
  const [showAnswers, setShowAnswers] = useState<'immediate' | 'end'>('immediate')
  const [error, setError] = useState<string | null>(null)

  const boom = useMemo(() => bouwZelfToetsBoom(config), [config])

  const sourceCounts = useMemo(() => {
    const counts: Record<QuestionSource, number> = { new: 0, all: 0, wrong: 0 }
    for (const cl of config.clusters) {
      if (!selectedClusters.has(cl.id)) continue
      counts.new += cl.newCount
      counts.wrong += cl.wrongCount
      counts.all += cl.questionCount
    }
    return counts
  }, [config.clusters, selectedClusters])

  const availableInScope = sourceCounts[source]

  // Gekozen bron heeft geen vragen meer in deze selectie: val terug op 'alle vragen'.
  // Dit staat in de render en niet in een effect, zodat de leerling nooit een
  // tussenstand ziet met een bron die nul vragen heeft.
  if (
    selectedClusters.size > 0 &&
    source !== 'all' &&
    sourceCounts[source] === 0 &&
    sourceCounts.all > 0
  ) {
    setSource('all')
  }

  // Zolang de leerling het aantal niet zelf heeft aangepast, volgt het aantal
  // de selectie: maximaal 10, en nooit meer dan er beschikbaar is.
  if (!countTouched && availableInScope > 0) {
    const suggestie = String(Math.min(10, availableInScope))
    if (suggestie !== countInput) setCountInput(suggestie)
  }

  function toggleCluster(id: string) {
    setSelectedClusters((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function setClustersFor(ids: string[], on: boolean) {
    setSelectedClusters((prev) => {
      const next = new Set(prev)
      for (const id of ids) {
        if (on) next.add(id)
        else next.delete(id)
      }
      return next
    })
  }

  function staatVan(ids: string[]): CheckState {
    const selected = ids.filter((id) => selectedClusters.has(id)).length
    return checkStateFromCounts(selected, ids.length)
  }

  function toggleIds(ids: string[]) {
    setClustersFor(ids, staatVan(ids) !== 'all')
  }

  function toggleExpand(set: Set<string>, setter: (s: Set<string>) => void, id: string) {
    const next = new Set(set)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setter(next)
  }

  function clusterCountLabel(cl: ToetsCluster): string {
    if (source === 'new') return `${cl.newCount}`
    if (source === 'wrong') return `${cl.wrongCount}`
    return `${cl.questionCount}`
  }

  function somLabel(clusters: ToetsCluster[]): string {
    const n = clusters.reduce((sum, cl) => {
      if (source === 'new') return sum + cl.newCount
      if (source === 'wrong') return sum + cl.wrongCount
      return sum + cl.questionCount
    }, 0)
    return `${n}`
  }

  const effectiveCount = Math.min(count, availableInScope)
  const canSubmit = selectedClusters.size > 0 && availableInScope > 0 && count > 0

  function submit() {
    setError(null)
    if (!canSubmit) {
      setError(t('errorEmpty'))
      return
    }
    startTransition(async () => {
      const res = await createCustomTestAction({
        clusterIds: Array.from(selectedClusters),
        count: effectiveCount,
        source,
        name: name.trim() || defaultName,
        showAnswers,
      })
      if ('error' in res) {
        setError(res.error)
        return
      }
      router.push(`/zelf-toets/loop/${res.sessionId}`)
    })
  }

  function onderwerpRij(onderwerp: ToetsOnderwerp) {
    const clusters = onderwerp.clusters
    const ids = clusters.map((cl) => cl.id)
    const isSingle = clusters.length === 1
    const open = expandedTopics.has(onderwerp.id)

    if (isSingle) {
      const only = clusters[0]!
      return (
        <li key={onderwerp.id}>
          <div className="flex min-h-11 items-center gap-1 rounded-md pr-2 text-sm hover:bg-surface-2">
            <span className="size-11 shrink-0" />
            <TriCheckbox
              state={selectedClusters.has(only.id) ? 'all' : 'none'}
              onToggle={() => toggleCluster(only.id)}
              ariaLabel={only.title}
            />
            <span className="min-w-0 flex-1 break-words">{only.title}</span>
            <span className="shrink-0 text-text-muted tabular-nums">
              {clusterCountLabel(only)}
            </span>
          </div>
        </li>
      )
    }

    return (
      <li key={onderwerp.id}>
        <div className="flex min-h-11 items-center gap-1 rounded-md pr-2 text-sm hover:bg-surface-2">
          <ExpandButton
            open={open}
            label={open ? t('collapse') : t('expand')}
            onClick={() => toggleExpand(expandedTopics, setExpandedTopics, onderwerp.id)}
          />
          <TriCheckbox
            state={staatVan(ids)}
            onToggle={() => toggleIds(ids)}
            ariaLabel={onderwerp.title}
          />
          <span className="min-w-0 flex-1 break-words">{onderwerp.title}</span>
        </div>
        {open && clusters.length > 0 && (
          <ul className="ml-6 border-l border-border pl-2">
            {clusters.map((cl) => (
              <li key={cl.id}>
                <div className="flex min-h-11 items-center gap-1 rounded-md pr-2 text-sm hover:bg-surface-2">
                  <span className="size-11 shrink-0" />
                  <TriCheckbox
                    state={selectedClusters.has(cl.id) ? 'all' : 'none'}
                    onToggle={() => toggleCluster(cl.id)}
                    ariaLabel={cl.title}
                  />
                  <span className="min-w-0 flex-1 break-words">{cl.title}</span>
                  <span className="shrink-0 text-text-muted tabular-nums">
                    {clusterCountLabel(cl)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </li>
    )
  }

  function blokRij(blok: ToetsBlok) {
    const ids = blok.clusters.map((cl) => cl.id)
    const open = expandedBlocks.has(blok.id)
    const meerdere = blok.clusters.length > 1
    const metKop = blok.onderwerpen.filter((onderwerp) => onderwerp.clusters.length > 0)

    return (
      <li key={blok.id}>
        <div
          className={`flex min-h-11 items-center gap-1 rounded-md pr-2 text-sm hover:bg-surface-2 ${
            blok.heeftOpgaven ? '' : 'text-text-muted'
          }`}
        >
          {meerdere ? (
            <ExpandButton
              open={open}
              label={open ? t('collapse') : t('expand')}
              onClick={() => toggleExpand(expandedBlocks, setExpandedBlocks, blok.id)}
            />
          ) : (
            <span className="size-11 shrink-0" />
          )}
          {blok.heeftOpgaven ? (
            <TriCheckbox
              state={staatVan(ids)}
              onToggle={() => toggleIds(ids)}
              ariaLabel={blok.naam}
            />
          ) : (
            <span className="size-11 shrink-0" />
          )}
          <span className="shrink-0 font-mono">{blok.letter}</span>
          <span className="min-w-0 flex-1 break-words">{blok.title}</span>
          {blok.heeftOpgaven ? (
            <span className="shrink-0 text-text-muted tabular-nums">{somLabel(blok.clusters)}</span>
          ) : (
            <span className="shrink-0 text-xs">{t('nogGeenOpgaven')}</span>
          )}
        </div>
        {open && meerdere && (
          <ul className="ml-6 border-l border-border pl-2">
            {metKop.length > 1
              ? metKop.map((onderwerp) => (
                  <li key={onderwerp.id}>
                    <p className="px-2 pt-3 text-xs font-medium text-text-muted">
                      {onderwerp.title}
                    </p>
                    <ul>
                      {onderwerp.clusters.map((cl) => (
                        <li key={cl.id}>{clusterKeuze(cl)}</li>
                      ))}
                    </ul>
                  </li>
                ))
              : blok.clusters.map((cl) => <li key={cl.id}>{clusterKeuze(cl)}</li>)}
          </ul>
        )}
      </li>
    )
  }

  function clusterKeuze(cl: ToetsCluster) {
    return (
      <div className="flex min-h-11 items-center gap-1 rounded-md pr-2 text-sm hover:bg-surface-2">
        <span className="size-11 shrink-0" />
        <TriCheckbox
          state={selectedClusters.has(cl.id) ? 'all' : 'none'}
          onToggle={() => toggleCluster(cl.id)}
          ariaLabel={cl.title}
        />
        <span className="min-w-0 flex-1 break-words">{cl.title}</span>
        <span className="shrink-0 text-text-muted tabular-nums">{clusterCountLabel(cl)}</span>
      </div>
    )
  }

  function hoofdstukLijst(hoofdstuk: ToetsHoofdstuk) {
    const ids = clusterIdsVanHoofdstuk(hoofdstuk)
    const open = expandedChapters.has(hoofdstuk.id)
    const heeftKinderen =
      hoofdstuk.paragrafen.length > 0 || hoofdstuk.losseOnderwerpen.length > 0

    return (
      <li key={hoofdstuk.id}>
        <div className="flex min-h-11 items-center gap-1 rounded-md px-1 text-sm hover:bg-surface-2">
          {heeftKinderen ? (
            <ExpandButton
              open={open}
              label={open ? t('collapse') : t('expand')}
              onClick={() => toggleExpand(expandedChapters, setExpandedChapters, hoofdstuk.id)}
            />
          ) : (
            <span className="size-11 shrink-0" />
          )}
          <TriCheckbox
            state={staatVan(ids)}
            onToggle={() => toggleIds(ids)}
            ariaLabel={hoofdstuk.title}
          />
          <span className="min-w-0 flex-1 break-words">
            <span className="font-mono font-semibold">{hoofdstuk.slug.toUpperCase()}</span>
            {' – '}
            {hoofdstuk.title}
          </span>
        </div>

        {open && heeftKinderen && (
          <ul className="ml-6 space-y-0.5 border-l border-border pl-2">
            {hoofdstuk.paragrafen.map((paragraaf) => (
              <li key={paragraaf.id}>
                <div className="flex min-h-11 items-center gap-2 px-2 text-sm">
                  <span className="shrink-0 font-mono text-xs font-semibold text-text-muted">
                    {paragraaf.label}
                  </span>
                  <span className="min-w-0 flex-1 break-words font-medium">{paragraaf.title}</span>
                </div>
                <ul>{paragraaf.blokken.map((blok) => blokRij(blok))}</ul>
              </li>
            ))}
            {hoofdstuk.losseOnderwerpen.map((onderwerp) => onderwerpRij(onderwerp))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-text-muted">
          {t('nameLabel')}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          className="w-full max-w-sm rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted/50"
          placeholder={defaultName}
        />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-3">
        <p className="px-2 pb-2 pt-1 text-xs font-medium uppercase tracking-wider text-text-muted">
          {t('scopeLabel')}
        </p>
        <ul className="space-y-0.5">{boom.map((hoofdstuk) => hoofdstukLijst(hoofdstuk))}</ul>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
            {t('sourceLabel')}
          </p>
          <div className="space-y-2">
            {(['new', 'all', 'wrong'] as const).map((s) => {
              const unavailable = selectedClusters.size > 0 && sourceCounts[s] === 0
              return (
                <label
                  key={s}
                  className={`flex min-h-11 items-start gap-2 text-sm ${
                    unavailable ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                  }`}
                >
                  <input
                    type="radio"
                    name="source"
                    value={s}
                    checked={source === s}
                    onChange={() => setSource(s)}
                    disabled={unavailable}
                    className="mt-1 size-5 accent-accent"
                  />
                  <span>
                    <span className="font-medium text-text">{t(`source.${s}`)}</span>
                    {selectedClusters.size > 0 && (
                      <span className="ml-1.5 text-xs tabular-nums text-text-muted">
                        ({sourceCounts[s]})
                      </span>
                    )}
                    <span className="block text-xs text-text-muted">{t(`source.${s}Hint`)}</span>
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
            {t('showAnswersLabel')}
          </p>
          <div className="space-y-2">
            {(['immediate', 'end'] as const).map((m) => (
              <label key={m} className="flex min-h-11 cursor-pointer items-start gap-2 text-sm">
                <input
                  type="radio"
                  name="showAnswers"
                  value={m}
                  checked={showAnswers === m}
                  onChange={() => setShowAnswers(m)}
                  className="mt-1 size-5 accent-accent"
                />
                <span>
                  <span className="font-medium text-text">{t(`showAnswers.${m}`)}</span>
                  <span className="block text-xs text-text-muted">{t(`showAnswers.${m}Hint`)}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
            {t('countLabel')}
          </p>
          <input
            type="number"
            min={1}
            max={Math.max(1, availableInScope)}
            value={countInput}
            onChange={(e) => {
              setCountInput(e.target.value)
              setCountTouched(true)
            }}
            onBlur={() => {
              if (count <= 0) {
                setCountInput(String(Math.min(10, Math.max(1, availableInScope))))
              }
            }}
            className="w-32 rounded-md border border-border bg-surface px-3 py-2 text-sm"
          />
          <p className="mt-2 text-xs text-text-muted">{t('availableLabel', { n: availableInScope })}</p>
          {count > availableInScope && availableInScope > 0 && (
            <p className="mt-1 text-xs text-accent-2">{t('cappedHint', { n: availableInScope })}</p>
          )}
        </div>
      </div>

      <ErrorBanner>{error}</ErrorBanner>

      <div className="flex items-center gap-3">
        <Button onClick={submit} disabled={!canSubmit || pending}>
          {pending ? t('startPending') : t('startLabel')}
        </Button>
        <span className="text-sm text-text-muted">
          {availableInScope === 0 && selectedClusters.size > 0 ? t('noQuestionsHint') : null}
        </span>
      </div>
    </div>
  )
}
