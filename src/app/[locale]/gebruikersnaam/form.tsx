'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { useTranslations } from 'next-intl'

import { kiesGebruikersnaamAction, type NaamState } from './actions'

const initialState: NaamState = { error: null }

export function GebruikersnaamForm({ volgende }: { volgende: string }) {
  const [state, formAction] = useActionState(kiesGebruikersnaamAction, initialState)
  const t = useTranslations('Google')

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={volgende} />
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-text">{t('usernameLabel')}</span>
        <input
          name="username"
          type="text"
          autoComplete="username"
          maxLength={40}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </label>

      {state.error && (
        <p
          role="alert"
          className="rounded-md border border-accent-2/30 bg-accent-2-light px-3 py-2 text-sm text-accent-2"
        >
          {state.error}
        </p>
      )}

      <Verstuur />
    </form>
  )
}

function Verstuur() {
  const { pending } = useFormStatus()
  const t = useTranslations('Google')
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-accent px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? t('continuePending') : t('continue')}
    </button>
  )
}
