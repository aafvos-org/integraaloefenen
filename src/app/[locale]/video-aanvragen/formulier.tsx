'use client'

import { useActionState, useState } from 'react'

import { ErrorBanner, Input, Select, SubmitButton, SuccessBanner, Textarea } from '@/components/ui'
import { EXAMENJAREN, HONEYPOT_VELD, TIJDVAKKEN } from '@/lib/video-aanvraag'

import { vraagExamenVideoAction, type VideoAanvraagState } from './actions'

const beginStand: VideoAanvraagState = { error: null, sent: false }

export type VideoAanvraagLabels = {
  jaarLabel: string
  tijdvakLabel: string
  vraagnummerLabel: string
  vraagnummerPlaceholder: string
  toelichtingLabel: string
  toelichtingHint: string
  toelichtingPlaceholder: string
  magMailenLabel: string
  emailLabel: string
  emailPlaceholder: string
  submit: string
  submitPending: string
  thanks: string
}

export function VideoAanvraagFormulier({ labels }: { labels: VideoAanvraagLabels }) {
  const [stand, verstuur, pending] = useActionState(vraagExamenVideoAction, beginStand)
  const [magMailen, setMagMailen] = useState(false)

  if (stand.sent) {
    return <SuccessBanner>{labels.thanks}</SuccessBanner>
  }

  return (
    <form action={verstuur} className="space-y-5">
      {/* Dit veld is er alleen voor robots. Een leerling ziet het niet en een
          schermlezer slaat het over. */}
      <div className="hidden" aria-hidden>
        <input type="text" name={HONEYPOT_VELD} tabIndex={-1} autoComplete="off" aria-hidden />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Select
          label={labels.jaarLabel}
          name="jaar"
          defaultValue={String(EXAMENJAREN[0])}
          className="min-h-11"
        >
          {EXAMENJAREN.map((jaar) => (
            <option key={jaar} value={jaar}>
              {jaar}
            </option>
          ))}
        </Select>
        <Select label={labels.tijdvakLabel} name="tijdvak" defaultValue="1" className="min-h-11">
          {TIJDVAKKEN.map((tijdvak) => (
            <option key={tijdvak} value={tijdvak}>
              {tijdvak}
            </option>
          ))}
        </Select>
        <Input
          label={labels.vraagnummerLabel}
          name="vraagnummer"
          required
          maxLength={10}
          autoComplete="off"
          placeholder={labels.vraagnummerPlaceholder}
          className="min-h-11"
        />
      </div>

      <Textarea
        label={labels.toelichtingLabel}
        hint={labels.toelichtingHint}
        name="toelichting"
        rows={4}
        maxLength={1000}
        placeholder={labels.toelichtingPlaceholder}
      />

      <div className="rounded-xl border border-border bg-surface-2 p-4">
        <label className="flex min-h-11 items-start gap-3 text-sm text-text">
          <input
            type="checkbox"
            name="magMailen"
            value="ja"
            checked={magMailen}
            onChange={(e) => setMagMailen(e.target.checked)}
            className="mt-0.5 size-5 shrink-0 rounded border-border accent-accent focus:ring-2 focus:ring-accent/20"
          />
          <span>{labels.magMailenLabel}</span>
        </label>
        {magMailen && (
          <div className="mt-3">
            <Input
              label={labels.emailLabel}
              name="email"
              type="email"
              required
              maxLength={320}
              autoComplete="email"
              placeholder={labels.emailPlaceholder}
              className="min-h-11"
            />
          </div>
        )}
      </div>

      <ErrorBanner>{stand.error}</ErrorBanner>
      <SubmitButton
        label={labels.submit}
        pendingLabel={labels.submitPending}
        pending={pending}
        size="lg"
        data-meet="video-aanvraag-versturen"
      />
    </form>
  )
}
