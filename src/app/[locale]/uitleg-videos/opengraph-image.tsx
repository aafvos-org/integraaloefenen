import { ImageResponse } from 'next/og'

import { ogKaart } from '@/lib/og-kaart'

export const alt = "Uitlegvideo's op IntegraalOefenen"
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(ogKaart("Uitlegvideo's"))
}
