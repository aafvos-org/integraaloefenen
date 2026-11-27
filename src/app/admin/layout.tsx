import Link from 'next/link'
import { redirect } from 'next/navigation'

import { BeheerderMeetUit } from './beheerder-meet-uit'
import { SITE_CONFIG } from '@/config/site'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: `Beheer · ${SITE_CONFIG.domain}`,
}

const NAV = [
  { href: '/admin', label: 'Overzicht' },
  { href: '/admin/topics', label: 'Onderwerpen' },
  { href: '/admin/questions', label: 'Vragen' },
  { href: '/admin/flags', label: 'Meldingen' },
  { href: '/admin/video-aanvragen', label: 'Video-aanvragen' },
  { href: '/admin/users', label: 'Gebruikers' },
  { href: '/admin/klikgedrag', label: 'Klikgedrag' },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/inloggen')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') redirect('/')

  // `w-full` is geen overbodige regel: `body` is een flexkolom en door
  // `mx-auto` krimpt dit blok anders niet mee met een smal scherm, maar groeit
  // het met zijn inhoud mee. De hele pagina schuift dan opzij in plaats van
  // alleen een brede tabel. (Zelfde oplossing als op afgeleideoefenen.nl.)
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <BeheerderMeetUit />
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-accent">
            Beheerder
          </p>
          <h1 className="font-serif text-2xl text-text">Beheer</h1>
        </div>
      </div>

      <nav className="mb-6 flex flex-wrap gap-1 rounded-xl border border-border bg-surface p-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-1.5 text-sm text-text-muted hover:bg-surface-2 hover:text-text"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  )
}
