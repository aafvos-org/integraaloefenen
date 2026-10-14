import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { nietGevondenMetadata } from '@/lib/niet-gevonden'

// Zonder dit bestand toont Next.js bij een onbekend adres onder /nl
// de kale Engelse 404, buiten de kop van de site. Door hier notFound()
// aan te roepen komt src/app/[locale]/not-found.tsx in beeld.
//
// De titel en omschrijving horen hier, niet alleen op not-found.tsx: dit is
// de pagina die Next.js voor het adres rendert. Zonder eigen titel blijft
// het tabblad de titel van de startpagina uit de taallayout, en zonder eigen
// omschrijving het verhaal van de startpagina.
export const metadata: Metadata = nietGevondenMetadata

export default function OnbekendAdres() {
  notFound()
}
