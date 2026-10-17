'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'

import { ErrorBanner, SubmitButton, SuccessBanner } from '@/components/ui'
import { sendFeedbackAction, type FeedbackState } from './actions'

const initialState: FeedbackState = { error: null, sent: false }

export function FeedbackForm() {
  const [state, formAction, pending] = useActionState(sendFeedbackAction, initialState)
  const t = useTranslations('Feedback')

  if (state.sent) {
    return <SuccessBanner>{t('thanks')}</SuccessBanner>
  }

  return (
    <form action={formAction} className="space-y-3">
      <textarea
        name="message"
        required
        rows={6}
        maxLength={5000}
        placeholder={t('placeholder')}
        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
      <ErrorBanner>{state.error}</ErrorBanner>
      <SubmitButton
        label={t('submitLabel')}
        pendingLabel={t('submitPending')}
        pending={pending}
      />
    </form>
  )
}
