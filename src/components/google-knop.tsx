'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import type { Bron } from '@/lib/bron'
import { veiligeVolgende } from '@/lib/google-login'
import { createClient } from '@/lib/supabase/browser'

/**
 * Knop "Doorgaan met Google". De pagina rendert hem alleen als de vlag aan staat.
 */
export function GoogleKnop({
  volgende,
  bron = null,
}: {
  volgende: string
  bron?: Bron | null
}) {
  const t = useTranslations('Google')
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState(false)

  async function doorgaan() {
    setBezig(true)
    setFout(false)
    try {
      const supabase = createClient()
      const terug = new URL('/auth/callback', window.location.origin)
      terug.searchParams.set('next', veiligeVolgende(volgende))
      if (bron) terug.searchParams.set('bron', bron)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: terug.toString(),
          queryParams: { prompt: 'select_account' },
        },
      })
      if (error) {
        console.error('[google]', error.message)
        setFout(true)
        setBezig(false)
      }
    } catch (error) {
      console.error('[google]', error instanceof Error ? error.message : 'onbekend')
      setFout(true)
      setBezig(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={doorgaan}
        disabled={bezig}
        className="inline-flex min-h-11 w-full items-center justify-center gap-3 rounded-md border border-border bg-surface-2 px-4 py-2.5 font-medium text-text transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleLogo />
        {bezig ? t('pending') : t('button')}
      </button>
      {fout && (
        <p
          role="alert"
          className="rounded-md border border-accent-2/30 bg-accent-2-light px-3 py-2 text-sm text-accent-2"
        >
          {t('error')}
        </p>
      )}
    </div>
  )
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-5 w-5 shrink-0">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 35.1 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.6 7.1l6.3 5.3C37.4 38.4 44 34 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  )
}
