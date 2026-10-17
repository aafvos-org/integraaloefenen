'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'

import { ErrorBanner, SubmitButton } from '@/components/ui'
import { kiesGebruikersnaamAction, type NaamState } from './actions'

const initialState: NaamState = { error: null }

export function GebruikersnaamForm({ volgende }: { volgende: string }) {
  const [state, formAction, pending] = useActionState(kiesGebruikersnaamAction, initialState)
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

      <ErrorBanner>{state.error}</ErrorBanner>

      <SubmitButton
        label={t('continue')}
        pendingLabel={t('continuePending')}
        pending={pending}
        size="lg"
        className="w-full"
      />
    </form>
  )
}
