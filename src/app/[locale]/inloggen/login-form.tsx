'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'

import { ErrorBanner, SubmitButton } from '@/components/ui'
import { loginAction, resendConfirmationAction, type LoginState } from './actions'
import type { ResendUitkomst } from './resend'

const initialState: LoginState = { error: null }

/** Bij welke uitkomst welke zin uit messages/nl.json → Login hoort. */
const RESEND_ZIN = {
  gelukt: 'resendSuccess',
  teSnel: 'resendTeSnel',
  grensVol: 'resendGrensVol',
  mislukt: 'resendMislukt',
} as const

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState)
  const t = useTranslations('Login')
  const [showPassword, setShowPassword] = useState(false)
  const [resendPending, startResend] = useTransition()
  const [resend, setResend] = useState<ResendUitkomst | null>(null)
  const [wacht, setWacht] = useState(0)

  // Aftellen zolang de knop uit staat, zodat de leerling ziet hoe lang het
  // nog duurt in plaats van tegen een dode knop aan te kijken.
  useEffect(() => {
    if (wacht <= 0) return
    const tik = setTimeout(() => setWacht((over) => over - 1), 1000)
    return () => clearTimeout(tik)
  }, [wacht])

  function handleResend() {
    if (!state.unconfirmedEmail || resendPending || wacht > 0) return
    startResend(async () => {
      const uitkomst = await resendConfirmationAction(state.unconfirmedEmail!)
      setResend(uitkomst)
      setWacht(uitkomst.wachtSeconden)
    })
  }

  return (
    <form action={formAction} className="space-y-4">
      <Field label={t('emailLabel')} name="email" type="email" autoComplete="email" required />
      <PasswordField
        label={t('passwordLabel')}
        name="password"
        autoComplete="current-password"
        required
        showPassword={showPassword}
        onToggle={() => setShowPassword((prev) => !prev)}
        toggleLabel={showPassword ? t('hidePassword') : t('showPassword')}
      />

      <ErrorBanner>{state.error}</ErrorBanner>

      {state.unconfirmedEmail && (
        <div className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text-muted">
          {resend && (
            <p
              role={resend.reden === 'gelukt' ? 'status' : 'alert'}
              className={resend.reden === 'gelukt' ? 'text-text' : 'text-accent-2'}
            >
              {t(RESEND_ZIN[resend.reden])}
            </p>
          )}
          <button
            type="button"
            data-meet="inloggen-mail-opnieuw"
            onClick={handleResend}
            disabled={resendPending || wacht > 0}
            className="inline-flex min-h-[44px] items-center font-medium text-accent hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resendPending
              ? t('resendPending')
              : wacht > 0
                ? t('resendWachten', { n: wacht })
                : t('resendButton')}
          </button>
        </div>
      )}

      <SubmitButton
        label={t('submitLabel')}
        pendingLabel={t('submitPending')}
        pending={pending}
        size="lg"
        className="w-full"
        data-meet="inloggen-versturen"
      />
    </form>
  )
}

function Field({
  label,
  name,
  type,
  autoComplete,
  required,
}: {
  label: string
  name: string
  type: string
  autoComplete?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-text">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
    </label>
  )
}

function PasswordField({
  label,
  name,
  autoComplete,
  required,
  showPassword,
  onToggle,
  toggleLabel,
}: {
  label: string
  name: string
  autoComplete?: string
  required?: boolean
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
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md border border-border px-3 text-xs font-medium text-text-muted hover:bg-surface-2 hover:text-text"
        >
          {toggleLabel}
        </button>
      </div>
    </label>
  )
}
