'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'

import { AfgeleideVerwijzing } from '@/components/afgeleide-verwijzing'
import { cn } from '@/components/ui'
import { VraagForm, type VraagLabels } from '@/components/vraag-form'

import { weegClusters, type DashboardIndeling } from '@/lib/dashboard/indeling'

import { NieuwHoofdstukBlock, OudHoofdstukBlock } from './topic-block'

export function DashboardGrid({
  indeling,
  streakDays = 0,
  totalAnswered = 0,
  totalCorrect = 0,
  vraagLabels,
  vraagTitel,
  vraagIntro,
}: {
  indeling: DashboardIndeling
  streakDays?: number
  totalAnswered?: number
  totalCorrect?: number
  vraagLabels: VraagLabels
  vraagTitel: string
  vraagIntro: string
}) {
  const t = useTranslations('Dashboard')
  const allClusters = useMemo(
    () => [
      ...indeling.hoofdstukken.flatMap((hoofdstuk) => hoofdstuk.clusters),
      ...indeling.oudeOpgaven.flatMap((hoofdstuk) =>
        hoofdstuk.onderwerpen.flatMap((onderwerp) => onderwerp.clusters),
      ),
    ],
    [indeling],
  )
  const { mastered, total, pct: pctOverall } = weegClusters(allClusters)
  const pctAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0
  const hoofdstukBeheerst = [
    ...indeling.hoofdstukken.map((hoofdstuk) => hoofdstuk.clusters),
    ...indeling.oudeOpgaven.map((hoofdstuk) =>
      hoofdstuk.onderwerpen.flatMap((onderwerp) => onderwerp.clusters),
    ),
  ].some((clusters) => {
    const stand = weegClusters(clusters)
    return stand.total > 0 && stand.mastered === stand.total
  })

  return (
    <>
      {/* KPI row */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiHero pct={pctOverall} mastered={mastered} total={total} label={t('masteryLabel')} sub={t('masterySub')} />
        <KpiCard label={t('streakLabel')} value={String(streakDays)} tone="warn" />
        <KpiCard label={t('accuracyLabel')} value={`${pctAccuracy}%`} tone="accent" />
        <KpiCard label={t('questionsLabel')} value={String(totalAnswered)} sub={t('questionsSub')} tone="neutral" />
      </div>

      {/* 2-column layout */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left: topic accordions */}
        <div className="lg:col-span-2">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">
            {t('perChapterTitle')}
          </p>
          <div className="space-y-2">
            {indeling.hoofdstukken.map((hoofdstuk) => (
              <NieuwHoofdstukBlock key={hoofdstuk.id} chapter={hoofdstuk} />
            ))}
          </div>
          {indeling.oudeOpgaven.length > 0 && (
            <div className="mt-4 border-t border-border pt-3">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">
                {t('oudeOpgaven')}
              </p>
              <div className="space-y-2">
                {indeling.oudeOpgaven.map((hoofdstuk) => (
                  <OudHoofdstukBlock key={hoofdstuk.id} chapter={hoofdstuk} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rechts: direct een vraag kunnen stellen */}
        <div className="space-y-3">
          {hoofdstukBeheerst && (
            <div className="rounded-2xl border border-border bg-surface p-4">
              <AfgeleideVerwijzing className="inline-flex min-h-11 items-center text-sm font-medium text-accent underline-offset-2 hover:underline" />
            </div>
          )}
          <div className="rounded-2xl border border-accent/30 bg-accent-light/40 p-4">
            <p className="font-serif text-base text-text">{vraagTitel}</p>
            <p className="mt-0.5 text-xs text-text-muted">{vraagIntro}</p>
            <VraagForm labels={vraagLabels} compact />
          </div>
        </div>
      </div>
    </>
  )
}

function KpiHero({
  pct,
  mastered,
  total,
  label,
  sub,
}: {
  pct: number
  mastered: number
  total: number
  label: string
  sub: string
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-3">
        <Ring pct={pct} size={60} stroke={7} />
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted">{label}</div>
          <div className="font-serif text-xl text-text">
            {mastered} <span className="text-text-muted">/ {total}</span>
          </div>
          <div className="text-xs text-text-muted">
            {sub}
          </div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string
  value: string
  sub?: string
  tone: 'accent' | 'warn' | 'neutral'
}) {
  const valueColor =
    tone === 'accent' ? 'text-accent' : tone === 'warn' ? 'text-accent-2' : 'text-text'
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted">{label}</div>
      <div className={cn('font-serif text-2xl', valueColor)}>{value}</div>
      {sub && <div className="text-xs text-text-muted">{sub}</div>}
    </div>
  )
}

function Ring({ pct, size = 92, stroke = 9 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = (pct / 100) * c
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-surface-2)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="var(--font-serif)"
        fontSize={size * 0.26}
        fill="var(--color-text)"
      >
        {pct}%
      </text>
    </svg>
  )
}
