'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { isActiveNavHref } from '@/lib/nav-active'

export function MobileNav({
  locale,
  isLoggedIn,
  username,
  role,
  registerHref,
}: {
  locale: string
  isLoggedIn: boolean
  username: string | null
  role: string | null
  registerHref: string
}) {
  const [open, setOpen] = useState(false)
  const t = useTranslations('Header')
  const pathname = usePathname()

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        data-meet="mobiel-menu"
        data-tour="menu"
        aria-label={open ? 'Menu sluiten' : 'Menu openen'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex size-11 items-center justify-center rounded-md text-text-muted hover:bg-surface-2 hover:text-text"
      >
        {open ? (
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-border bg-surface shadow-lg">
          <nav className="flex flex-col p-2 space-y-0.5">
            {isLoggedIn ? (
              <>
                <NavLink href={`/${locale}/theorie`} pathname={pathname} meet="mobiel-theorie" onClick={() => setOpen(false)}>{t('theory')}</NavLink>
                <NavLink href={`/${locale}/uitleg-videos`} pathname={pathname} meet="mobiel-videos" onClick={() => setOpen(false)}>{t('videos')}</NavLink>
                <NavLink href={`/${locale}/oefenen`} pathname={pathname} meet="mobiel-oefenen" onClick={() => setOpen(false)}>{t('freeExercise')}</NavLink>
                <NavLink href={`/${locale}/examentraining`} pathname={pathname} meet="mobiel-examentraining" onClick={() => setOpen(false)}>{t('examentraining')}</NavLink>
                <NavLink href={`/${locale}/zelf-toets`} pathname={pathname} meet="mobiel-zelftoets" onClick={() => setOpen(false)}>{t('zelfToets')}</NavLink>
                <NavLink href={`/${locale}/dashboard`} pathname={pathname} meet="mobiel-dashboard" onClick={() => setOpen(false)}>{t('dashboard')}</NavLink>
                {role === 'admin' && (
                  <NavLink href="/admin" pathname={pathname} meet="mobiel-admin" onClick={() => setOpen(false)}>{t('admin')}</NavLink>
                )}
                <div className="border-t border-border mt-1 pt-1">
                  {username && (
                    <p className="px-3 py-1.5 text-xs text-text-muted truncate">{username}</p>
                  )}
                  <NavLink href={`/${locale}/instellingen`} pathname={pathname} meet="mobiel-instellingen" onClick={() => setOpen(false)}>{t('settings')}</NavLink>
                  <NavLink href={`/${locale}/feedback`} pathname={pathname} meet="mobiel-feedback" onClick={() => setOpen(false)}>{t('feedback')}</NavLink>
                  <form action="/uitloggen" method="post">
                    <button
                      type="submit"
                      data-meet="mobiel-uitloggen"
                      className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-text-muted hover:bg-surface-2 hover:text-text"
                    >
                      {t('logout')}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <>
                <NavLink href={`/${locale}/theorie`} pathname={pathname} meet="mobiel-theorie" onClick={() => setOpen(false)}>{t('theory')}</NavLink>
                <NavLink href={`/${locale}/uitleg-videos`} pathname={pathname} meet="mobiel-videos" onClick={() => setOpen(false)}>{t('videos')}</NavLink>
                <NavLink href={`/${locale}/examen-integralen`} pathname={pathname} meet="mobiel-examen-integralen" onClick={() => setOpen(false)}>{t('examentraining')}</NavLink>
                <NavLink href={`/${locale}/inloggen`} pathname={pathname} meet="mobiel-inloggen" onClick={() => setOpen(false)}>{t('login')}</NavLink>
                <NavLink href={registerHref} pathname={pathname} meet="mobiel-registreren" onClick={() => setOpen(false)}>{t('register')}</NavLink>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  )
}

function NavLink({
  href,
  pathname,
  onClick,
  meet,
  children,
}: {
  href: string
  pathname: string
  onClick: () => void
  /** Vaste naam voor de klikmeting */
  meet: string
  children: React.ReactNode
}) {
  const active = isActiveNavHref(pathname, href)
  return (
    <Link
      href={href}
      data-meet={meet}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      className={
        active
          ? 'rounded-lg px-3 py-2.5 text-sm font-medium text-accent hover:bg-surface-2'
          : 'rounded-lg px-3 py-2.5 text-sm text-text-muted hover:bg-surface-2 hover:text-text'
      }
    >
      {children}
    </Link>
  )
}
