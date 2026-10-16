import { ImageResponse } from 'next/og'
import { notFound } from 'next/navigation'

import { vindVoorbeeld } from '@/content/voorbeelden'
import { ogKaart } from '@/lib/og-kaart'

export const alt = 'Voorbeeld op IntegraalOefenen'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const voorbeeld = vindVoorbeeld(slug)
  if (!voorbeeld) notFound()
  return new ImageResponse(ogKaart(voorbeeld.titel))
}
