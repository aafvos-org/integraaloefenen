'use client'

import { useActionState, useEffect, useMemo, useRef, useState } from 'react'

import { Button, ErrorBanner } from '@/components/ui'
import { verkleinFoto } from '@/lib/images/compress'
import {
  vraagVideoAction,
  type VideoVraagState,
} from '@/app/[locale]/uitleg-videos/actions'

/**
 * Vraagformulier voor een uitlegvideo: tekst plus maximaal drie foto's van de
 * opgave. Gedeeld tussen de uitlegvideo-pagina en de startpagina, zodat de
 * fotoafhandeling maar op één plek staat.
 */
export type VraagLabels = {
  askPlaceholder: string
  askSend: string
  askThanks: string
  askPhoto: string
  askPhotoHint: string
  askPhotoRemove: string
  askPhotoBusy: string
  askPhotoTooBig: string
}

const initialVraagState: VideoVraagState = { error: null, sent: false }

function IconCamera() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2L8 5h8l1.5 2h2A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5v-9Z" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.2" />
    </svg>
  )
}


const MAX_FOTOS = 3
/** Ruim onder de bodySizeLimit van 4 MB uit next.config.ts. */
const MAX_TOTAAL_BYTES = 3.2 * 1024 * 1024

export function VraagForm({ labels, compact = false }: { labels: VraagLabels; compact?: boolean }) {
  const [state, formAction] = useActionState(vraagVideoAction, initialVraagState)
  const [fotos, setFotos] = useState<File[]>([])
  const [fotoBezig, setFotoBezig] = useState(false)
  const [fotoFout, setFotoFout] = useState<string | null>(null)
  const bestandRef = useRef<HTMLInputElement | null>(null)

  // Eén object-URL per foto, opgeruimd zodra de foto weg is of de pagina sluit.
  const previews = useMemo(() => fotos.map((f) => URL.createObjectURL(f)), [fotos])
  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url))
  }, [previews])

  /**
   * Verkleint de gekozen foto's in de browser. Zonder die stap loopt een
   * telefoonfoto tegen de limiet van de Server Action aan, en dat komt terug
   * als een onbegrijpelijke fout in plaats van een nette melding.
   */
  async function kiesFotos(gekozen: File[]) {
    if (gekozen.length === 0) return
    setFotoFout(null)
    setFotoBezig(true)
    try {
      const verkleind = await Promise.all(gekozen.map(verkleinFoto))
      const samen = [...fotos, ...verkleind].slice(0, MAX_FOTOS)
      const totaal = samen.reduce((som, f) => som + f.size, 0)
      if (totaal > MAX_TOTAAL_BYTES) {
        setFotoFout(labels.askPhotoTooBig)
        return
      }
      setFotos(samen)
    } finally {
      setFotoBezig(false)
      // Het keuzeveld is alleen een kiezer: leegmaken mag, en zo kun je
      // dezelfde foto opnieuw kiezen nadat je hem hebt weggehaald.
      if (bestandRef.current) bestandRef.current.value = ''
    }
  }

  /**
   * De React-state is de enige bron van waarheid: bij het versturen zetten we
   * de foto's zelf in de FormData. Het formulier hangt dus niet af van de
   * FileList van het keuzeveld, die bij elke wijziging opnieuw goed gezet zou
   * moeten worden.
   */
  function verstuur(formData: FormData) {
    for (const foto of fotos) formData.append('fotos', foto)
    return formAction(formData)
  }

  if (state.sent) {
    return (
      <p className="mt-4 rounded-xl border border-accent/30 bg-accent-light px-4 py-3 text-accent">
        {labels.askThanks}
      </p>
    )
  }

  return (
    <form action={verstuur} className={compact ? 'mt-2 space-y-2' : 'mt-4 space-y-3'}>
      <textarea
        name="message"
        required
        rows={compact ? 2 : 3}
        maxLength={2000}
        placeholder={labels.askPlaceholder}
        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
      />

      <div className={compact ? 'flex flex-wrap items-center gap-2' : 'max-w-2xl'}>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text transition hover:border-accent/50">
          <IconCamera />
          <span>{fotoBezig ? labels.askPhotoBusy : labels.askPhoto}</span>
          <input
            ref={bestandRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            disabled={fotoBezig || fotos.length >= MAX_FOTOS}
            onChange={(e) => void kiesFotos(Array.from(e.target.files ?? []))}
          />
        </label>
        {compact && (
          <Button type="submit" disabled={fotoBezig}>
            {labels.askSend}
          </Button>
        )}
        {!compact && <p className="mt-1.5 text-xs text-text-muted">{labels.askPhotoHint}</p>}

        {fotos.length > 0 && (
          <ul className={compact ? 'flex w-full flex-wrap gap-2' : 'mt-3 flex flex-wrap gap-3'}>
            {fotos.map((foto, i) => (
              <li key={`${foto.name}-${i}`} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previews[i]}
                  alt={foto.name}
                  className={`rounded-lg border border-border object-cover ${compact ? 'size-14' : 'size-24'}`}
                />
                <button
                  type="button"
                  onClick={() => {
                    setFotoFout(null)
                    setFotos(fotos.filter((_, j) => j !== i))
                  }}
                  aria-label={`${labels.askPhotoRemove}: ${foto.name}`}
                  className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full border border-border bg-surface text-sm leading-none text-text-muted shadow-sm transition hover:text-accent-2"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ErrorBanner>{fotoFout ?? state.error}</ErrorBanner>
      {!compact && (
        <Button type="submit" disabled={fotoBezig}>
          {labels.askSend}
        </Button>
      )}

    </form>
  )
}
