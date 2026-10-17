'use client'

import { useActionState, useEffect, useState, useSyncExternalStore } from 'react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { bronUitTabblad } from '@/lib/bron'
import { ErrorBanner, SubmitButton, SuccessBanner } from '@/components/ui'
import { signupAction, type SignupState } from './actions'

const initialState: SignupState = { error: null, notice: null }

/** Bron uit dit tabblad. Op de server is die er niet, na het laden wel. */
function useBronUitTabblad(): string {
  return useSyncExternalStore(
    () => () => {},
    () => bronUitTabblad() ?? '',
    () => '',
  )
}

export function SignupForm({ bronUitAdres = null }: { bronUitAdres?: string | null }) {
  const [state, formAction, pending] = useActionState(signupAction, initialState)
  const t = useTranslations('Register')
  const [showPassword, setShowPassword] = useState(false)
  // Het adres van deze pagina gaat voor. Anders de bron die het tabblad
  // onthield toen de leerling via de link binnenkwam. Geen cookie.
  const uitTabblad = useBronUitTabblad()
  const bron = bronUitAdres || uitTabblad

  // De klikmeting legt vast dat er in dit bezoek een account is aangemaakt.
  // Alleen dát, zonder naam of e-mailadres: zo is de route naar een account
  // te volgen zonder iemand te kennen.
  const gelukt = state.notice !== null
  useEffect(() => {
    if (!gelukt) return
    void import('@/lib/meten/verzamelaar')
      .then((meting) => meting.meldAccountstap('geregistreerd'))
      .catch(() => {})
  }, [gelukt])

  if (state.notice) {
    return (
      <div className="space-y-4">
        <SuccessBanner>{state.notice}</SuccessBanner>
        <Link
          href="/inloggen"
          data-meet="registreren-klaar-inloggen"
          className="block w-full rounded-md bg-accent px-4 py-2.5 text-center font-medium text-white shadow-sm transition hover:bg-accent/90"
        >
          {t('toLoginLabel')}
        </Link>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="van" value={bron} />
      <Field
        label={t('usernameLabel')}
        name="username"
        type="text"
        autoComplete="username"
        defaultValue={state.values?.username}
      />
      <Field
        label={t('emailLabel')}
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
      />
      <PasswordField
        label={t('passwordLabel')}
        name="password"
        autoComplete="new-password"
        required
        hint={t('passwordHint')}
        showPassword={showPassword}
        onToggle={() => setShowPassword((prev) => !prev)}
        toggleLabel={showPassword ? t('hidePassword') : t('showPassword')}
      />
      <PasswordField
        label={t('passwordConfirmLabel')}
        name="passwordConfirm"
        autoComplete="new-password"
        required
        showPassword={showPassword}
        onToggle={() => setShowPassword((prev) => !prev)}
        toggleLabel={showPassword ? t('hidePassword') : t('showPassword')}
      />

      <ErrorBanner>{state.error}</ErrorBanner>

      <p className="text-center text-sm leading-relaxed text-text-muted">
        {t.rich('privacyNote', {
          privacy: (stuk) => (
            <Link
              href="/privacy"
              data-meet="registreren-privacy"
              className="inline-flex min-h-11 items-center font-medium text-accent underline-offset-2 hover:underline"
            >
              {stuk}
            </Link>
          ),
        })}
      </p>

      <SubmitButton
        label={t('submitLabel')}
        pendingLabel={t('submitPending')}
        pending={pending}
        size="lg"
        className="w-full"
        data-meet="registreren-versturen"
      />

      <p className="text-center text-sm text-text-muted">
        {t('hasAccount')}{' '}
        <Link
          href="/inloggen"
          data-meet="registreren-naar-inloggen"
          className="inline-flex min-h-11 items-center px-1 font-medium text-accent hover:underline"
        >
          {t('loginLink')}
        </Link>
      </p>
    </form>
  )
}

function Field({
  label,
  name,
  type,
  autoComplete,
  required,
  hint,
  defaultValue,
}: {
  label: string
  name: string
  type: string
  autoComplete?: string
  required?: boolean
  hint?: string
  defaultValue?: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-text">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        defaultValue={defaultValue}
        minLength={type === 'password' ? 8 : undefined}
        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
      {hint && <span className="mt-1 block text-xs text-text-muted">{hint}</span>}
    </label>
  )
}

function PasswordField({
  label,
  name,
  autoComplete,
  required,
  hint,
  showPassword,
  onToggle,
  toggleLabel,
}: {
  label: string
  name: string
  autoComplete?: string
  required?: boolean
  hint?: string
  showPassword: boolean
  onToggle: () => void
  toggleLabel: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-text">{label}</span>
      <div className="flex items-center gap-2">
        <input
          name={name}
          type={showPassword ? 'text' : 'password'}
          autoComplete={autoComplete}
          required={required}
          minLength={8}
          className="w-full min-w-0 rounded-md border border-border bg-surface px-3 py-2 text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md border border-border px-3 text-xs font-medium text-text-muted hover:bg-surface-2 hover:text-text"
        >
          {toggleLabel}
        </button>
      </div>
      {hint && <span className="mt-1 block text-xs text-text-muted">{hint}</span>}
    </label>
  )
}
