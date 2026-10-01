'use client'

import { useMemo } from 'react'

import { cn } from '@/components/ui'
import { VraagForm, type VraagLabels } from '@/components/vraag-form'

import { ChapterBlock, type ChapterData } from './topic-block'

export function DashboardGrid({
  chapterData,
  streakDays = 0,
  totalAnswered = 0,
  totalCorrect = 0,
  vraagLabels,
  vraagTitel,
  vraagIntro,
}: {
  chapterData: ChapterData[]
  streakDays?: number
  totalAnswered?: number
  totalCorrect?: number
  vraagLabels: VraagLabels
  vraagTitel: string
  vraagIntro: string
}) {
  const allClusters = useMemo(
    () => chapterData.flatMap((ch) => ch.topics.flatMap((t) => t.clusters)),
    [chapterData],
  )
  const mastered = allClusters.filter((c) => c.isKnown).length
  const total = allClusters.length
  const weightedProgress = allClusters.reduce((sum, c) => {
    if (c.isKnown) return sum + 1
    if (c.totalAnswered > 0) return sum + c.totalCorrect / c.totalAnswered
    return sum
  }, 0)
  const pctOverall = total > 0 ? Math.round((weightedProgress / total) * 100) : 0
  const pctAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

  return (
    <>
      {/* KPI row */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiHero pct={pctOverall} mastered={mastered} total={total} />
        <KpiCard label="Streak" value={String(streakDays)} sub="dagen op rij" tone="warn" />
        <KpiCard label="Accuracy" value={`${pctAccuracy}%`} tone="accent" />
        <KpiCard label="Vragen" value={String(totalAnswered)} sub="totaal beantwoord" tone="neutral" />
      </div>

      {/* 2-column layout */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left: topic accordions */}
        <div className="lg:col-span-2">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">
            Voortgang per hoofdstuk
          </p>
          <div className="space-y-2">
            {chapterData.map((chapter) => (
              <ChapterBlock key={chapter.id} chapter={chapter} />
            ))}
          </div>
        </div>

        {/* Rechts: direct een vraag kunnen stellen */}
        <div className="space-y-3">
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

function KpiHero({ pct, mastered, total }: { pct: number; mastered: number; total: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-3">
        <Ring pct={pct} size={60} stroke={7} />
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted">Mastery</div>
          <div className="font-serif text-xl text-text">
            {mastered} <span className="text-text-muted">/ {total}</span>
          </div>
          <div className="text-xs text-text-muted">
            onderdelen gemasterd
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
