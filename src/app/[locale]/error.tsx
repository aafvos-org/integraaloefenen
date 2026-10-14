'use client'

import { useEffect } from 'react'

import { Foutpagina } from '@/components/foutpagina'

export default function LocaleError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return <Foutpagina retry={retry} />
}
