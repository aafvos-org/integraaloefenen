'use client'

/**
 * Gedeelde onderdelen van de oefenkaarten.
 *
 * Een leerling komt dezelfde kaart op drie plekken tegen: bij oefenen, in de
 * zelf-toets en bij de vragen onder een uitlegvideo. De omlijsting verschilt
 * per scherm, maar deze stukken horen overal hetzelfde te werken en te zien.
 */

import { useRef } from 'react'

import { Math as TeX, RichMath } from '@/components/math'
import { cn } from '@/components/ui'
import { insertAtCursor } from '@/lib/practice/input'

export type Stap = { id: string; step_order: number; step_description: string }

/**
 * Het wiskundetoetsenbord onder het antwoordveld. Houdt de cursor op zijn
 * plek: na het invoegen staat hij waar de leerling verder typt.
 */
export function useAntwoordInvoer(
  antwoord: string,
  setAntwoord: (waarde: string) => void,
) {
  const invoerRef = useRef<HTMLInputElement | null>(null)

  function voegIn(tekst: string) {
    const el = invoerRef.current
    const start = el?.selectionStart ?? antwoord.length
    const eind = el?.selectionEnd ?? antwoord.length
    const { value, caret } = insertAtCursor(antwoord, start, eind, tekst)
    setAntwoord(value)
    requestAnimationFrame(() => {
      const invoer = invoerRef.current
      if (!invoer) return
      invoer.focus()
      invoer.setSelectionRange(caret, caret)
    })
  }

  return { invoerRef, voegIn }
}

/**
 * De opgave zelf. Staat er een $ in, dan is het lopende tekst met formules
 * ertussen; anders is het één kale formule die op zijn eigen regel staat.
 */
export function OpgaveTekst({ latexBody }: { latexBody: string | null }) {
  if (latexBody?.includes('$')) return <RichMath source={latexBody} />
  return <TeX tex={latexBody ?? ''} displayMode />
}

/**
 * Het goede antwoord naast het antwoord van de leerling. Staat er een LaTeX-
 * versie klaar, dan gaat die voor.
 */
export function GoedAntwoord({
  antwoord,
  latexAntwoord,
}: {
  antwoord: string
  latexAntwoord: string | null
}) {
  const tonen = latexAntwoord ?? antwoord
  return (
    <span className="font-serif">
      {tonen.includes('$') ? <RichMath source={tonen} /> : <TeX tex={tonen} />}
    </span>
  )
}

/** Het stappenplan onder een fout antwoord, op volgorde van stapnummer. */
export function Stappenplan({
  stappen,
  titel,
  className,
}: {
  stappen: Stap[]
  titel: string
  className?: string
}) {
  const opVolgorde = [...stappen].sort((a, b) => a.step_order - b.step_order)
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-white/90 shadow-sm',
        className,
      )}
      data-geen-dode-klik
    >
      <div className="px-4 py-3">
        <p className="text-sm font-semibold text-text">{titel}</p>
      </div>
      <ol className="list-none space-y-1 border-t border-border px-3 py-3 text-sm text-text">
        {opVolgorde.map((s) => (
          <li
            key={s.id}
            className="flex items-start gap-3 rounded-md px-3 py-2 leading-relaxed"
          >
            <span className="min-w-[1.25rem] shrink-0 font-semibold tabular-nums text-accent">
              {s.step_order}.
            </span>
            <span>
              <RichMath source={s.step_description} />
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
