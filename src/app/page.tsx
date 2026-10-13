import { redirect } from 'next/navigation'

// Vangnet. Normaal toont next.config.ts / meteen als /nl, zonder
// doorverwijzing. Alleen als die rewrite niet afgaat, sturen we alsnog door.
export default function RootPage() {
  redirect('/nl')
}
