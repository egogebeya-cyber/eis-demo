import { SCHOOL } from '~/lib/images'
import { cn } from '~/lib/utils'

export function Crest({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn('h-9 w-9', className)} aria-hidden>
      <rect width="40" height="40" rx="12" fill="currentColor" />
      <circle cx="20" cy="13" r="4.2" fill="#c9a227" />
      <path d="M8 29c3.2-6.2 7-9.4 12-9.4S28.8 22.8 32 29" fill="none" stroke="#f4f1ea" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 29.5h16" stroke="#c9a227" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function PageHero({
  kicker,
  title,
  subtitle,
  image,
  children,
}: {
  kicker: string
  title: string
  subtitle?: string
  image: string
  children?: React.ReactNode
}) {
  return (
    <section className="gs-page-hero">
      <div className="gs-page-hero-copy">
        <p className="gs-kicker">{kicker}</p>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
      <div className="gs-page-hero-media">
        <img src={image} alt="" />
      </div>
    </section>
  )
}

export function InnerSplit({
  id,
  kicker,
  title,
  body,
  image,
  reverse,
  children,
}: {
  id?: string
  kicker?: string
  title: string
  body: string
  image: string
  reverse?: boolean
  children?: React.ReactNode
}) {
  return (
    <section id={id} className={`gs-inner-split${reverse ? ' is-reverse' : ''}`}>
      <div className="gs-inner-copy">
        {kicker ? <p className="gs-kicker">{kicker}</p> : null}
        <h2>{title}</h2>
        <p>{body}</p>
        {children}
      </div>
      <div className="gs-inner-media">
        <img src={image} alt="" />
      </div>
    </section>
  )
}

export function CtaBand({
  title,
  body,
  primary,
  secondary,
}: {
  title: string
  body?: string
  primary: { to: string; label: string }
  secondary?: { to: string; label: string }
}) {
  return (
    <section className="gs-cta-band">
      <div>
        <h2>{title}</h2>
        {body ? <p>{body}</p> : null}
      </div>
      <div className="gs-cta-row">
        <a href={primary.to} className="gs-split-cta-solid">
          {primary.label}
        </a>
        {secondary ? (
          <a href={secondary.to} className="gs-split-cta">
            {secondary.label}
          </a>
        ) : null}
      </div>
    </section>
  )
}

export function JsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'School',
    name: SCHOOL.name,
    url: 'https://eis.school',
    telephone: '+251114162200',
    email: SCHOOL.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Bole Road',
      addressLocality: 'Addis Ababa',
      addressCountry: 'ET',
    },
    availableLanguage: ['en'],
    sameAs: [SCHOOL.tiktok, SCHOOL.instagram, SCHOOL.youtube],
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}
