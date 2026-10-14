import { ImageResponse } from 'next/og'
import { notFound } from 'next/navigation'

import { THEORY_OVERVIEW } from '@/lib/theory'
import { ogKaart } from '@/lib/og-kaart'

export const alt = 'Theoriehoofdstuk op IntegraalOefenen'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ hoofdstuk: string }>
}) {
  const { hoofdstuk } = await params
  const kaart = THEORY_OVERVIEW.find((ch) => ch.slug === hoofdstuk)
  if (!kaart) notFound()
  const titel = kaart.zoektitel ?? kaart.title
  return new ImageResponse(ogKaart(titel))
}
