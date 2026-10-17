'use client'

import { useActionState, useState } from 'react'
import { useTranslations } from 'next-intl'

import { ErrorBanner, SubmitButton, SuccessBanner } from '@/components/ui'
import {
  updatePasswordAction,
  updateUsernameAction,
  type SettingsState,
} from './actions'

const initialState: SettingsState = { error: null, success: null }

function StateBanner({ state }: { state: SettingsState }) {
  return (
    <>
      <ErrorBanner>{state.error}</ErrorBanner>
      <SuccessBanner>{state.success}</SuccessBanner>
    </>
  )
}

const inputClass =
  'w-full max-w-sm rounded-md border border-border bg-surface px-3 py-2 text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20'

export function UsernameForm({ initialUsername }: { initialUsername: string }) {
  const [state, formAction, pending] = useActionState(updateUsernameAction, initialState)
  const t = useTranslations('Settings')
  const [editing, setEditing] = useState(initialUsername === '')
  const [savedName, setSavedName] = useState(initialUsername)

  // Elke verzending geeft een nieuw state-object terug. Is dat gelukt, dan
  // nemen we de nieuwe naam over en klappen we het formulier dicht. Dit staat
  // bewust in de render en niet in een effect: zo komt er geen extra render
  // overheen waarin nog de oude naam staat.
  const [handledState, setHandledState] = useState(state)
  if (handledState !== state) {
    setHandledState(state)
    if (state.success && state.username) {
      setSavedName(state.username)
      setEditing(false)
    }
  }

  if (!editing) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-text-muted">
          {t('usernameLabel')}:{' '}
          <span className={savedName ? 'font-medium text-text' : ''}>
            {savedName || t('noUsername')}
          </span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="ml-3 font-medium text-accent hover:underline"
          >
            {t('change')}
          </button>
        </p>
        <StateBanner state={state} />
      </div>
    )
  }

  return (
    <form action={formAction} className="mt-2 space-y-3">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-text">
          {t('usernameLabel')}
        </span>
        <input
          name="username"
          type="text"
          defaultValue={savedName}
          maxLength={40}
          autoComplete="username"
          autoFocus
          className={inputClass}
        />
      </label>
      <StateBanner state={state} />
      <div className="flex items-center gap-3">
        <SubmitButton label={t('save')} pendingLabel={t('savePending')} pending={pending} />
        {savedName && (
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-sm font-medium text-text-muted hover:text-text"
          >
            {t('cancel')}
          </button>
        )}
      </div>
    </form>
  )
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(updatePasswordAction, initialState)
  const t = useTranslations('Settings')

  return (
    <form action={formAction} className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-text">
          {t('newPasswordLabel')}
        </span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={inputClass}
        />
        <span className="mt-1 block text-xs text-text-muted">{t('passwordHint')}</span>
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-text">
          {t('repeatPasswordLabel')}
        </span>
        <input
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={inputClass}
        />
      </label>
      <StateBanner state={state} />
      <SubmitButton label={t('savePassword')} pendingLabel={t('savePending')} pending={pending} />
    </form>
  )
}
