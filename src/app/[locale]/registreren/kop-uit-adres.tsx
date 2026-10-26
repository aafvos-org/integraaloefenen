'use client'

import { useSearchParams } from 'next/navigation'

import { leesBron } from '@/lib/bron'

import { Kop } from './kop'

/**
 * Komt de leerling net van de proefsom op de startpagina (`?van=proberen`),
 * dan is de generieke tekst niet motiverend: hij deed al een som en twijfelt
 * of registreren wat toevoegt. Leest de browser, niet de server: zo hoeft
 * /registreren zelf geen `searchParams` te lezen en blijft de pagina
 * statisch, net als /inloggen (INT-519, INT-549).
 */
export function KopUitAdres({
  h1,
  h1Proefsom,
  subtitle,
  subtitleProefsom,
}: {
  h1: string
  h1Proefsom: string
  subtitle: string
  subtitleProefsom: string
}) {
  const searchParams = useSearchParams()
  const uitProefsom = leesBron(searchParams.get('van')) === 'proberen'

  return (
    <Kop h1={uitProefsom ? h1Proefsom : h1} subtitle={uitProefsom ? subtitleProefsom : subtitle} />
  )
}
