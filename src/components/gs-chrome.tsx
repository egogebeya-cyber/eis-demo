import { Link } from '@tanstack/react-router'
import './gs-public.css'
import { Menu, Search, X } from 'lucide-react'
import { useState } from 'react'
import { ThemeToggle } from './theme-toggle'
import { IMAGES, SCHOOL } from '~/lib/images'

type StageTile = {
  to: '/junior' | '/senior' | '/academics' | '/life'
  hash?: string
  label: string
  note: string
  image: string
}

export const STAGE_TILES: StageTile[] = [
  { to: '/junior', label: 'Early Years', note: 'KG–Grade 5', image: IMAGES.kids },
  { to: '/senior', label: 'Upper School', note: 'Grades 6–11', image: IMAGES.classroom },
  { to: '/academics', hash: 'sixth-form', label: 'Sixth Form', note: 'Ages 16–18', image: IMAGES.library },
  { to: '/life', label: 'Campus life', note: 'Day school', image: IMAGES.campus },
  { to: '/life', hash: 'summer', label: 'Summer', note: 'Holiday programme', image: IMAGES.highlands },
]

const MENU_GROUPS: {
  to: '/about' | '/academics' | '/admissions' | '/life' | '/news' | '/contact'
  label: string
  items: {
    to:
      | '/academics'
      | '/junior'
      | '/senior'
      | '/arts'
      | '/athletics'
      | '/admissions/visit'
      | '/admissions/apply'
      | '/fees'
      | '/tour'
      | '/life'
      | '/gallery'
      | '/news'
      | '/events'
    hash?: string
    label: string
  }[]
}[] = [
  {
    to: '/about' as const,
    label: 'Why EIS',
    items: [],
  },
  {
    to: '/academics' as const,
    label: 'Learning',
    items: [
      { to: '/academics', label: 'Academics' },
      { to: '/junior', label: 'Junior' },
      { to: '/senior', label: 'Senior' },
      { to: '/arts', label: 'Arts' },
      { to: '/athletics', label: 'Sport' },
    ],
  },
  {
    to: '/admissions' as const,
    label: 'Admissions',
    items: [
      { to: '/admissions/visit', label: 'Visit' },
      { to: '/admissions/apply', label: 'Apply' },
      { to: '/fees', label: 'Fees' },
      { to: '/tour', label: 'Tour' },
    ],
  },
  {
    to: '/life' as const,
    label: 'Campus life',
    items: [
      { to: '/life', label: 'Campus' },
      { to: '/life', hash: 'pastoral', label: 'Pastoral' },
      { to: '/gallery', label: 'Gallery' },
    ],
  },
  {
    to: '/news' as const,
    label: 'News and events',
    items: [
      { to: '/news', label: 'News' },
      { to: '/events', label: 'Events' },
    ],
  },
  {
    to: '/contact' as const,
    label: 'Contact us',
    items: [],
  },
]

export function GsChrome() {
  const [menu, setMenu] = useState(false)

  return (
    <>
      <div className="gs-utility">
        <Link to="/admissions">Admissions</Link>
        <Link to="/contact">Contact us</Link>
        <Link to="/search" aria-label="Search" className="gs-icon-btn">
          <Search className="h-4 w-4" />
        </Link>
      </div>
      <button type="button" className="gs-burger" aria-label="Open menu" onClick={() => setMenu(true)}>
        <Menu className="h-5 w-5" />
      </button>
      {menu ? <GsMenu onClose={() => setMenu(false)} /> : null}
    </>
  )
}

export function GsStageTiles() {
  return (
    <nav className="gs-stages" aria-label="School stages">
      {STAGE_TILES.map((tile) => (
        <Link key={tile.label} to={tile.to} hash={tile.hash} className="gs-stage">
          <img src={tile.image} alt="" />
          <span>
            <strong>{tile.label}</strong>
            <em>{tile.note}</em>
          </span>
        </Link>
      ))}
    </nav>
  )
}

export function GsFooter() {
  return (
    <footer className="gs-footer">
      <div className="gs-footer-grid">
        <div className="gs-footer-brand-col">
          <p className="gs-footer-brand">Ethiopia International School</p>
          <p>{SCHOOL.address}</p>
          <p>
            <a href={SCHOOL.phoneHref}>{SCHOOL.phone}</a>
            {' · '}
            <a href={`mailto:${SCHOOL.email}`}>{SCHOOL.email}</a>
          </p>
          <p className="gs-footer-label">Follow EIS</p>
          <GsSocial />
        </div>
        <div className="gs-footer-col">
          <p className="gs-footer-label">Explore</p>
          <Link to="/about">Why EIS</Link>
          <Link to="/academics">Learning</Link>
          <Link to="/admissions">Admissions</Link>
          <Link to="/admissions/visit">Visit</Link>
          <Link to="/fees">Fees</Link>
          <Link to="/news">News</Link>
        </div>
        <div className="gs-footer-col">
          <p className="gs-footer-label">Community</p>
          <Link to="/life">Campus life</Link>
          <Link to="/parents">Parents</Link>
          <Link to="/alumni">Alumni</Link>
          <Link to="/staff">Staff</Link>
          <Link to="/careers">Careers</Link>
          <Link to="/login" search={{}}>
            Portal
          </Link>
        </div>
        <div className="gs-footer-col">
          <p className="gs-footer-label">Trust</p>
          <Link to="/policies">Safeguarding</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/downloads">Downloads</Link>
          <Link to="/accessibility">Accessibility</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/contact">Enquire</Link>
        </div>
      </div>
    </footer>
  )
}

const SOCIAL_LINKS = [
  {
    label: 'TikTok',
    href: SCHOOL.tiktok,
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
        <path
          fill="currentColor"
          d="M14.2 3.2c.8 1.7 2.3 3 4.2 3.4v3.1c-1.4 0-2.8-.4-4-.1v6.6c0 3.3-2.7 5.9-6.1 5.6A5.8 5.8 0 0 1 8 10.3v3.2a2.7 2.7 0 1 0 1.9 2.6V3.2h4.3Z"
        />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: SCHOOL.instagram,
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
        <path
          fill="currentColor"
          d="M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H8Zm9.2 1.4a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 8.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2Zm0 2a1.8 1.8 0 1 0 1.8 1.8A1.8 1.8 0 0 0 12 10.2Z"
        />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: SCHOOL.youtube,
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
        <path
          fill="currentColor"
          d="M22.5 7.4a3.2 3.2 0 0 0-2.3-2.3C18.4 4.7 12 4.7 12 4.7s-6.4 0-8.2.4A3.2 3.2 0 0 0 1.5 7.4 33 33 0 0 0 1.1 12a33 33 0 0 0 .4 4.6 3.2 3.2 0 0 0 2.3 2.3c1.8.4 8.2.4 8.2.4s6.4 0 8.2-.4a3.2 3.2 0 0 0 2.3-2.3 33 33 0 0 0 .4-4.6 33 33 0 0 0-.4-4.6ZM10 15.2V8.8l5.3 3.2Z"
        />
      </svg>
    ),
  },
]

export function GsSocial() {
  return (
    <nav className="gs-social" aria-label="Social media">
      {SOCIAL_LINKS.map((item) => (
        <a key={item.label} href={item.href} target="_blank" rel="noreferrer" aria-label={item.label}>
          {item.icon}
        </a>
      ))}
    </nav>
  )
}

function GsMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="gs-menu" role="dialog" aria-label="Site menu">
      <button type="button" className="gs-menu-close" aria-label="Close menu" onClick={onClose}>
        <X className="h-6 w-6" />
      </button>
      <div className="gs-menu-grid">
        <nav className="gs-menu-main">
          {MENU_GROUPS.map((group) => (
            <div key={group.label} className="gs-menu-group">
              <Link to={group.to} className="gs-menu-link" onClick={onClose}>
                {group.label}
              </Link>
              {group.items.length ? (
                <div className="gs-menu-children">
                  {group.items.map((item) => (
                    <Link
                      key={`${item.to}-${item.hash ?? item.label}`}
                      to={item.to}
                      hash={item.hash}
                      className="gs-menu-child"
                      onClick={onClose}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>
        <div>
          <p className="gs-footer-label">Portal</p>
          <div className="mt-3 flex flex-col gap-2">
            <Link to="/login" search={{}} className="gs-menu-sub" onClick={onClose}>
              Portal
            </Link>
          </div>
          <p className="gs-footer-label mt-8">More</p>
          <div className="mt-3 flex flex-col gap-2">
            <Link to="/alumni" className="gs-menu-sub" onClick={onClose}>
              Alumni
            </Link>
            <Link to="/parents" className="gs-menu-sub" onClick={onClose}>
              Parents
            </Link>
            <Link to="/careers" className="gs-menu-sub" onClick={onClose}>
              Careers
            </Link>
            <Link to="/faq" className="gs-menu-sub" onClick={onClose}>
              FAQ
            </Link>
            <Link to="/policies" className="gs-menu-sub" onClick={onClose}>
              Policies
            </Link>
          </div>
          <div className="gs-theme-row mt-8">
            <ThemeToggle className="gs-theme-btn" />
            <span>Light / dark</span>
          </div>
          <p className="gs-footer-label mt-8">Follow EIS</p>
          <GsSocial />
        </div>
      </div>
    </div>
  )
}
