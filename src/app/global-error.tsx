'use client'

import { useEffect } from 'react'

import { Foutpagina } from '@/components/foutpagina'

import './globals.css'

// Vangt een crash in de root-layout. Die layout (en dus de stijl en de
// taalprovider) is dan weg, dus deze pagina neemt html en body zelf.
export default function GlobalError({
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
    <html lang="nl">
      <body className="flex min-h-full flex-col bg-bg text-text antialiased">
        <title>Er ging iets mis</title>
        <main className="flex min-h-screen flex-1 items-center justify-center">
          <Foutpagina retry={retry} />
        </main>
      </body>
    </html>
  )
}
