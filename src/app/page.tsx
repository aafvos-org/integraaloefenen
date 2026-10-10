import { redirect } from 'next/navigation'

// Vangnet voor als de taal-omleiding in de middleware niet afgaat.
export default function RootPage() {
  redirect('/nl')
}
