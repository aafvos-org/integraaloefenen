'use client'

import { useEffect } from 'react'

import { Foutpagina } from '@/components/foutpagina'

export default function RootError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center">
      <Foutpagina retry={retry} />
    </main>
  )
}
