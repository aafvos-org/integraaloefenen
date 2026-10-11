import { notFound } from 'next/navigation'

// Zonder dit bestand toont Next.js bij een onbekend adres onder /nl
// de kale Engelse 404, buiten de kop van de site. Door hier notFound()
// aan te roepen komt src/app/[locale]/not-found.tsx in beeld.
export default function OnbekendAdres() {
  notFound()
}
