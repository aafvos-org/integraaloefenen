'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { bronUitTabblad, padNaarAanmelden } from '@/lib/bron'
import { loadChapters, type ChapterInfo } from '@/lib/practice/chapter-overview'
import { heeftInlogsessie } from '@/lib/supabase/sessie-cookie'
import { createClient } from '@/lib/supabase/browser'
import { THEORIE_HOOFDSTUKKEN } from '@/lib/theory'
import { MobileNav } from './mobile-nav'
import { NavDropdown } from './nav-dropdown'
import { UserMenu } from './user-menu'
import { WelcomeTour } from './welcome-tour'

/**
 * De balk staat in de opmaak van élke pagina. Hij mag de server niet naar
 * cookies of headers laten kijken, anders wordt ook theorie bij elk bezoek
 * opnieuw gebouwd. De openbare links zitten daarom in de HTML. Alleen als
 * dit tabblad een inlogcookie heeft, vullen we daarna de ingelogde balk aan.
 *
 * De balk blijft staan bij een paginawissel. Daarom kijken we opnieuw zodra
 * het adres verandert, en als dit tabblad zelf in- of uitlogt.
 */
type Sessie = {
  email: string
  username: string | null
  role: string | null
  tourSeen: boolean
  chapters: ChapterInfo[]
}

/** "H2 — De afgeleide functie" → "De afgeleide functie" (code staat al in de badge) */
function stripChapterCode(title: string): string {
  return title.replace(/^H\d+\s*[—–-]\s*/, '')
}

function cookiesUitDocument(): { name: string }[] {
  return document.cookie.split(';').map((deel) => ({
    name: deel.split('=')[0]?.trim() ?? '',
  }))
}

function IconPencil() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

function IconClipboardCheck() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="m9.5 13.5 2 2 3.5-4" />
    </svg>
  )
}

function IconBook() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
      <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}

function IconPlayCircle() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="m10 8.5 5 3.5-5 3.5Z" />
    </svg>
  )
}

function IconExamen() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </svg>
  )
}

function IconChart() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 3v18h18" />
      <path d="M8 17v-6" />
      <path d="M13 17V7" />
      <path d="M18 17v-4" />
    </svg>
  )
}

function useAanmelden(locale: string): string {
  const bron = useSyncExternalStore(
    () => () => {},
    () => bronUitTabblad(),
    () => null,
  )
  return padNaarAanmelden(`/${locale}/registreren`, bron)
}

export function SiteHeader({ locale }: { locale: string }) {
  const t = useTranslations('Header')
  const pathname = usePathname()
  const [sessie, setSessie] = useState<Sessie | null>(null)
  // Telt op bij SIGNED_IN, zodat de controle hieronder opnieuw draait ook
  // als het adres hetzelfde blijft.
  const [opnieuw, setOpnieuw] = useState(0)
  const aanmelden = useAanmelden(locale)
  // Al ingevuld: een volgende paginawissel hoeft Supabase niet opnieuw te bellen.
  const ingelogd = useRef(false)

  useEffect(() => {
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        ingelogd.current = false
        setSessie(null)
        return
      }
      // Niet in dit slot wachten of getUser aanroepen: dat slot is exclusief
      // en een tweede aanroep kan dan blijven hangen.
      if (event === 'SIGNED_IN' && !ingelogd.current) {
        window.setTimeout(() => setOpnieuw((n) => n + 1), 0)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    let geannuleerd = false

    async function vulIn() {
      if (!heeftInlogsessie(cookiesUitDocument())) {
        ingelogd.current = false
        if (!geannuleerd) setSessie(null)
        return
      }
      if (ingelogd.current) return

      try {
        const supabase = createClient()
        const { data } = await supabase.auth.getUser()
        const user = data.user
        if (geannuleerd) return
        if (!user) {
          ingelogd.current = false
          setSessie(null)
          return
        }

        const [profileRes, chapters] = await Promise.all([
          supabase
            .from('profiles')
            .select('username, role, tour_seen_at')
            .eq('id', user.id)
            .maybeSingle(),
          loadChapters(supabase).catch(() => [] as ChapterInfo[]),
        ])
        if (geannuleerd) return

        const profile = profileRes.data
        ingelogd.current = true
        setSessie({
          email: user.email ?? '',
          username: profile?.username ?? null,
          role: profile?.role ?? null,
          tourSeen: profile ? profile.tour_seen_at != null : true,
          chapters,
        })
      } catch {
        // De openbare balk blijft staan. De pagina zelf is al zichtbaar.
      }
    }

    void vulIn()
    return () => {
      geannuleerd = true
    }
  }, [pathname, opnieuw])

  const theorieItems = THEORIE_HOOFDSTUKKEN.map((ch) => ({
    href: `/${locale}/theorie/${ch.slug}`,
    code: ch.code,
    label: ch.title,
  }))

  const theorieDropdown = (
    <NavDropdown
      label={t('theory')}
      icon={<IconBook />}
      overviewHref={`/${locale}/theorie`}
      overviewLabel={t('overview')}
      items={theorieItems}
      dataTour="theorie"
      dataMeet="menu-theorie"
    />
  )

  const videosLink = (
    <Link
      href={`/${locale}/uitleg-videos`}
      data-tour="videos"
      data-meet="menu-videos"
      className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
    >
      <IconPlayCircle />
      {t('videos')}
    </Link>
  )

  const oefenenItems = (sessie?.chapters ?? []).map((ch) => ({
    href: `/${locale}/oefenen?chapter=${encodeURIComponent(ch.slug)}`,
    code: ch.slug.toUpperCase(),
    label: stripChapterCode(ch.title),
  }))

  return (
    <>
    <header className="relative sticky top-0 z-30 h-14 border-b border-border bg-surface/85 backdrop-blur">
      <div className="flex h-full w-full items-center justify-between gap-4 px-4">
        <Link
          href={`/${locale}`}
          data-meet="kop-logo"
          className="min-w-0 shrink font-serif text-lg font-medium tracking-tight text-text"
        >
          {t('brand')}<span className="text-accent">{t('brandSuffix')}</span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm md:flex">
          {sessie ? (
            <>
              {theorieDropdown}
              {videosLink}
              <NavDropdown
                label={t('freeExercise')}
                icon={<IconPencil />}
                overviewHref={`/${locale}/oefenen`}
                overviewLabel={t('overview')}
                items={oefenenItems}
                dataTour="oefenen"
                dataMeet="menu-oefenen"
              />
              <Link
                href={`/${locale}/examentraining`}
                data-meet="menu-examentraining"
                className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
              >
                <IconExamen />
                {t('examentraining')}
              </Link>
              <Link
                href={`/${locale}/zelf-toets`}
                data-tour="zelftoets"
                data-meet="menu-zelftoets"
                className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
              >
                <IconClipboardCheck />
                {t('zelfToets')}
              </Link>
              <Link
                href={`/${locale}/dashboard`}
                data-tour="voortgang"
                data-meet="menu-dashboard"
                className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
              >
                <IconChart />
                {t('dashboard')}
              </Link>
              {sessie.role === 'admin' && (
                <Link
                  href="/admin"
                  className="shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
                >
                  {t('admin')}
                </Link>
              )}
              <UserMenu
                displayName={sessie.username ?? sessie.email}
                email={sessie.email}
                locale={locale}
                labels={{
                  signedInAs: t('signedInAs'),
                  settings: t('settings'),
                  feedback: t('feedback'),
                  logout: t('logout'),
                }}
              />
            </>
          ) : (
            <>
              {theorieDropdown}
              {videosLink}
              <Link
                href={`/${locale}/examen-integralen`}
                data-meet="menu-examen-integralen"
                className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
              >
                <IconExamen />
                {t('examentraining')}
              </Link>
              <Link
                href={`/${locale}/inloggen`}
                data-meet="menu-inloggen"
                className="rounded-md px-3 py-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
              >
                {t('login')}
              </Link>
              <Link
                href={aanmelden}
                data-meet="menu-registreren"
                className="ml-1 rounded-md bg-accent px-3 py-1.5 text-white hover:bg-accent/90"
              >
                {t('register')}
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <MobileNav
            locale={locale}
            isLoggedIn={!!sessie}
            username={sessie?.username ?? null}
            role={sessie?.role ?? null}
            registerHref={aanmelden}
          />
        </div>
      </div>
    </header>
    {sessie && <WelcomeTour tourSeen={sessie.tourSeen} />}
    </>
  )
}
