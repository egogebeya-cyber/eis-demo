import { useEffect, useRef, useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { ChevronDown, Menu, Phone, Search, X } from 'lucide-react'
import { SCHOOL } from '~/lib/images'
import { useLocale } from './locale-context'
import { AlertBanner } from './AlertBanner'
import { Crest } from './site-ui'
import { ThemeToggle } from './theme-toggle'
import { cn } from '~/lib/utils'

type MegaItem = { to: string; label: string; note?: string }

function MegaLink({
  label,
  match,
  items,
  onGo,
}: {
  label: string
  match: boolean
  items: MegaItem[]
  onGo?: () => void
}) {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<number | null>(null)

  function enter() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    setOpen(true)
  }
  function leave() {
    closeTimer.current = window.setTimeout(() => setOpen(false), 140)
  }

  return (
    <div className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        type="button"
        className={cn(
          'rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition',
          match || open ? 'bg-white text-school' : 'text-white/85 hover:text-white',
        )}
        aria-expanded={open}
      >
        {label}
        <ChevronDown className={`ml-1 inline h-3 w-3 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-40 pt-2">
          <div className="min-w-64 rounded-2xl border border-white/10 bg-school-dark p-3 shadow-2xl">
            {items.map((item) => (
              <Link
                key={item.to + item.label}
                to={item.to as '/'}
                onClick={() => {
                  setOpen(false)
                  onGo?.()
                }}
                className="block rounded-xl px-3 py-2 text-left hover:bg-white/10"
              >
                <span className="block text-sm font-bold text-white">{item.label}</span>
                {item.note ? <span className="block text-xs text-white/55">{item.note}</span> : null}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function PortalsMenu() {
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointer(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const items = [
    { role: 'student' as const, label: 'Student portal' },
    { role: 'parent' as const, label: 'Parent portal' },
    { role: 'teacher' as const, label: 'Teacher portal' },
  ]

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-white/90 hover:text-white"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Portals
        <ChevronDown className={`h-3 w-3 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <ul role="menu" className="absolute right-0 z-40 mt-2 min-w-48 overflow-hidden rounded-xl border border-white/15 bg-school-dark py-1 shadow-xl">
          {items.map((item) => (
            <li key={item.role} role="none">
              <Link
                to="/login"
                search={{ role: item.role }}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-left text-xs font-bold text-white/90 hover:bg-white/10"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export function Header({
  site,
}: {
  site?: {
    alertEnabled: boolean
    alertEn: string
    alertAm: string
    alertOm: string
    banner?: {
      titleEn: string
      titleAm: string
      titleOm: string
      bodyEn: string
      bodyAm: string
      bodyOm: string
    } | null
  } | null
}) {
  const { t } = useLocale()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const isHome = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  const overVideo = isHome && !scrolled && !open

  const learnItems: MegaItem[] = [
    { to: '/junior', label: 'Junior School', note: 'KG to Grade 5' },
    { to: '/senior', label: 'Senior School', note: 'Grade 6 to Sixth Form' },
    { to: '/life', label: 'Campus life' },
    { to: '/athletics', label: 'Sport' },
    { to: '/arts', label: 'Arts' },
  ]

  const mobileLinks = [
    { to: '/', label: t('navHome') },
    { to: '/about', label: 'Why EIS' },
    { to: '/academics', label: t('navAcademics') },
    { to: '/junior', label: 'Junior School' },
    { to: '/senior', label: 'Senior School' },
    { to: '/admissions', label: t('navAdmissions') },
    { to: '/admissions/visit', label: 'Book a visit' },
    { to: '/life', label: t('navLife') },
    { to: '/news', label: t('navNews') },
    { to: '/events', label: t('navEvents') },
    { to: '/contact', label: t('navContact') },
    { to: '/login', label: 'Portals' },
  ] as const

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 text-white transition-colors duration-300',
        overVideo ? 'bg-transparent' : 'bg-school/95 shadow-sm backdrop-blur-md',
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-school"
      >
        {t('skipToContent')}
      </a>
      <AlertBanner site={site} />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="text-accent">
            <Crest className="h-9 w-9" />
          </span>
          <span className="leading-tight">
            <span className="block text-[11px] font-bold uppercase tracking-[0.22em]">Ethiopia</span>
            <span className="block font-display text-lg font-semibold italic tracking-tight">International School</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <Link to="/about" className={navLink(pathname.startsWith('/about'))}>
            Why EIS
          </Link>
          <MegaLink label="Learning" match={pathname.startsWith('/academics') || pathname.startsWith('/junior') || pathname.startsWith('/senior') || pathname.startsWith('/life')} items={learnItems} />
          <Link to="/admissions" className={navLink(pathname.startsWith('/admissions'))}>
            Admissions
          </Link>
          <Link to="/news" className={navLink(pathname.startsWith('/news'))}>
            News
          </Link>
          <Link to="/contact" className={navLink(pathname.startsWith('/contact'))}>
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/admissions/visit" className="hidden text-xs font-bold uppercase tracking-wide text-white/90 hover:text-white md:inline">
            Book a visit
          </Link>
          <Link to="/contact" className="hidden text-xs font-bold uppercase tracking-wide text-white/90 hover:text-white xl:inline">
            Enquire
          </Link>
          <div className="hidden sm:block">
            <PortalsMenu />
          </div>
          <Link to="/search" aria-label="Search" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 hover:bg-white/10">
            <Search className="h-4 w-4" />
          </Link>
          <ThemeToggle />
          <button type="button" className="rounded-lg p-1.5 text-white lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open ? (
        <div className="max-h-[70vh] overflow-y-auto border-t border-white/15 bg-school px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1 pb-4">
            {mobileLinks.map((link) =>
              link.to === '/login' ? (
                <Link
                  key={link.to}
                  to="/login"
                  search={{}}
                  className={navLink(pathname === link.to || pathname.startsWith(link.to))}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  className={navLink(pathname === link.to || (link.to !== '/' && pathname.startsWith(link.to)))}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ),
            )}
          </div>
        </div>
      ) : null}
    </header>
  )
}

function navLink(active: boolean) {
  return `rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
    active ? 'bg-white text-school' : 'text-white/85 hover:text-white'
  }`
}

export function Footer() {
  const { t } = useLocale()
  return (
    <footer className="border-t border-accent/30 bg-school-dark text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
        <div className="lg:pr-10">
          <div className="flex items-center gap-2">
            <span className="text-accent">
              <Crest />
            </span>
            <p className="font-display text-xl font-semibold italic">Ethiopia International School</p>
          </div>
          <p className="mt-3 text-sm text-white/70">{t('footerTagline')}</p>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-accent">{t('schoolTag')}</p>
        </div>
        <div className="lg:border-l lg:border-white/15 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{t('quickLinks')}</p>
          <div className="mt-4 flex flex-col gap-2 text-sm text-white/80">
            <Link to="/about">Why EIS</Link>
            <Link to="/academics">{t('navAcademics')}</Link>
            <Link to="/admissions">{t('navAdmissions')}</Link>
            <Link to="/admissions/visit">{t('bookAVisit')}</Link>
            <Link to="/faq">{t('navFaq')}</Link>
          </div>
        </div>
        <div className="lg:border-l lg:border-white/15 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Community</p>
          <div className="mt-4 flex flex-col gap-2 text-sm text-white/80">
            <Link to="/parents">{t('navParents')}</Link>
            <Link to="/alumni">{t('navAlumni')}</Link>
            <Link to="/policies">{t('safeguarding')}</Link>
            <Link to="/downloads">{t('navDownloads')}</Link>
            <Link to="/careers">{t('navCareers')}</Link>
            <Link to="/login" search={{}}>
              Portals
            </Link>
          </div>
        </div>
        <div className="lg:border-l lg:border-white/15 lg:pl-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{t('getInTouch')}</p>
          <div className="mt-4 space-y-2 text-sm text-white/80">
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-accent" />
              <a href={SCHOOL.phoneHref}>{SCHOOL.phone}</a>
            </p>
            <p>
              <a href={`mailto:${SCHOOL.email}`}>{SCHOOL.email}</a>
            </p>
            <p>
              <a href={SCHOOL.whatsapp} className="font-bold text-accent">
                {t('whatsapp')}
              </a>
            </p>
            <p>{t('officeHours')}</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 bg-black/25 py-4 text-center text-xs text-white/50">
        {t('footerRights')} · <Link to="/accessibility">{t('accessTitle')}</Link>
      </div>
    </footer>
  )
}
