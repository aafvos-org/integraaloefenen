'use client'

import { useState } from 'react'

import { deelAdres, openDeelmenu } from '@/lib/delen'

/** Deelt de pagina met een klasgenoot. Op een telefoon het systeemmenu, anders een gekopieerde link. */
export function DeelKnop({ pad }: { pad?: string }) {
  const [melding, setMelding] = useState<string | null>(null)

  async function deel() {
    const adres = deelAdres(window.location.href, pad)
    const telefoon = openDeelmenu(window.innerWidth, typeof navigator.share === 'function')
    if (telefoon) {
      try {
        await navigator.share({ title: document.title, url: adres })
        setMelding(null)
        return
      } catch (fout) {
        if (fout instanceof Error && fout.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(adres)
      setMelding('Link gekopieerd')
    } catch {
      setMelding('Kopiëren lukte niet. Selecteer de adresbalk.')
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        data-meet="deel-knop"
        onClick={() => void deel()}
        className="inline-flex min-h-11 items-center rounded-full border border-border bg-surface px-4 text-sm font-medium text-text"
      >
        Stuur naar een klasgenoot
      </button>
      {melding ? (
        <span className="text-xs text-text-muted" role="status">
          {melding}
        </span>
      ) : null}
    </span>
  )
}
