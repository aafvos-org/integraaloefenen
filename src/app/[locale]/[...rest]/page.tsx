import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { SITE_CONFIG } from '@/config/site'

// Zonder dit bestand toont Next.js bij een onbekend adres onder /nl
// de kale Engelse 404, buiten de kop van de site. Door hier notFound()
// aan te roepen komt src/app/[locale]/not-found.tsx in beeld.
//
// De titel hoort hier, niet alleen op not-found.tsx: dit is de pagina die
// Next.js voor het adres rendert, en zonder eigen titel blijft het tabblad
// de titel van de startpagina uit de taallayout.
export const metadata: Metadata = {
  title: { absolute: `Pagina niet gevonden · ${SITE_CONFIG.domain}` },
}

export default function OnbekendAdres() {
  notFound()
}
