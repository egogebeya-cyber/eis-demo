import { Link } from '@tanstack/react-router'
import './gordonstoun-home.css'
import { GsChrome, GsFooter, GsStageTiles } from './gs-chrome'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { IMAGES } from '~/lib/images'

export function GordonstounHome() {
  useEffect(() => {
    const html = document.documentElement
    html.classList.add('gs-page')
    document.body.style.overflow = 'auto'
    document.body.style.height = 'auto'
    html.style.overflow = 'auto'
    html.style.height = 'auto'
    return () => {
      html.classList.remove('gs-page')
    }
  }, [])

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>('.gs-shell > section, .gs-shell > .gs-stages, .gs-shell > .gs-footer'),
    )
    if (reduce) {
      nodes.forEach((el) => el.classList.add('gs-in'))
      return
    }
    nodes.forEach((el) => el.classList.add('gs-reveal'))
    const hero = document.querySelector('.gs-hero')
    hero?.classList.add('gs-in')

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('gs-in')
            io.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.14, rootMargin: '0px 0px -6% 0px' },
    )
    nodes.forEach((el) => {
      if (el !== hero) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  return (
    <div className="gs-shell">
      <GsChrome />
      <GoldPlayhead />

      <section className="gs-hero">
        <img src={IMAGES.highlands} alt="" className="gs-photo" />
        <div className="gs-veil" />
        <Link to="/" className="gs-wordmark">
          <HeroLogo />
          <span>
            ETHIOPIA
            <br />
            INTERNATIONAL
            <br />
            SCHOOL
          </span>
        </Link>
        <h1 className="gs-hero-title">
          The home of
          <br />
          character education
        </h1>
      </section>

      <GsStageTiles />

      <section className="gs-split">
        <LocalLine kind="behind" />
        <div className="gs-split-copy">
          <div className="gs-split-heading">
            <SplitCrest />
            <h2>
              There is
              <br />
              more in you
            </h2>
          </div>
          <p>
            Ethiopia International School, founded in Addis Ababa, is a philosophy of education in action. The
            extraordinary education we provide gives students the confidence to achieve the impossible.
          </p>
          <p>
            Our motto is practised daily. We go out of our way to create opportunities for students to demonstrate —
            not only to others but to themselves — what they are capable of.
          </p>
          <Link to="/about" className="gs-split-cta">
            Why EIS
          </Link>
        </div>
        <div className="gs-split-media">
          <img src={IMAGES.campus} alt="" />
        </div>
      </section>

      <section className="gs-story gs-flip">
        <LocalLine kind="square" />
        <div className="gs-story-copy">
          <h2>
            Classrooms
            <br />
            without walls
          </h2>
          <h3>A unique education, uniquely here</h3>
          <p>
            Set between the highlands and the city, the campus is built for lessons that leave the corridor. Addis Ababa
            is not a backdrop. It is the second classroom.
          </p>
          <Link to="/admissions/visit" className="gs-feature-cta">
            Visit campus
          </Link>
        </div>
        <div className="gs-story-media">
          <img src={IMAGES.classroom} alt="" />
        </div>
      </section>

      <section className="gs-split">
        <LocalLine kind="behind" />
        <div className="gs-split-copy">
          <p className="gs-eyebrow">There is more in you</p>
          <h2>
            Selam Tadesse
            <br />
            Class of 2019
          </h2>
          <p>
            She arrived shy of the microphone. By Grade 12 she was leading the house choir, then reading medicine. The
            same courtyard that taught her to try also taught her to stay.
          </p>
          <Link to="/alumni" className="gs-split-cta">
            Alumni stories
          </Link>
        </div>
        <div className="gs-split-media">
          <img src={IMAGES.alumni} alt="" />
        </div>
      </section>

      <section className="gs-solo">
        <LocalLine kind="behind" />
        <div className="gs-split-copy">
          <div className="gs-split-heading">
            <SplitCrest />
            <h2>
              Grand
              <br />
              passions
            </h2>
          </div>
          <p>Choir at dawn, football at dusk, studios that stay open after the last bell.</p>
          <p>We make room for the thing a child cannot put down — and we practise it daily.</p>
          <Link to="/arts" className="gs-split-cta">
            Arts and athletics
          </Link>
        </div>
      </section>

            <section className="gs-film">
        <LocalLine kind="behind" />
        <div className="gs-film-copy">
          <h2>
            Confidence,
            <br />
            leadership
          </h2>
          <p>“A ship in harbour is safe, but that is not what ships are built for.”</p>
          <p>Hear how EIS builds character — then watch the film.</p>
        </div>
        <div className="gs-film-media">
          <Link to="/life" className="gs-play">
            <img src={IMAGES.highlands} alt="" />
            <span>Play</span>
          </Link>
        </div>
      </section>

      <section className="gs-split gs-flip">
        <LocalLine kind="behind" />
        <div className="gs-split-copy">
          <h2>
            A family
            <br />
            ethos
          </h2>
          <h3>Sector-leading pastoral care</h3>
          <p>
            “The positive, caring, family ethos of the school promotes a sense of trust, respect and kindness for all.”
            Tutors, nurses, and house teams know every child by name.
          </p>
          <Link to="/life" className="gs-split-cta">
            Pastoral care
          </Link>
        </div>
        <div className="gs-split-media">
          <img src={IMAGES.care} alt="" />
        </div>
      </section>

      <section className="gs-solo">
        <LocalLine kind="behind" />
        <div className="gs-split-copy">
          <h2>
            A community
            <br />
            that stays
          </h2>
          <p>
            Parents, alumni, and staff share one courtyard. Saturday matches, Sunday service, and a WhatsApp line that
            actually answers. The family ethos is not a brochure line — it is how the week is run.
          </p>
          <div className="gs-cta-row">
            <Link to="/parents" className="gs-split-cta">
              Parents
            </Link>
            <Link to="/alumni" className="gs-split-cta">
              Alumni
            </Link>
          </div>
        </div>
      </section>

      <section className="gs-split gs-flip">
        <LocalLine kind="behind" />
        <div className="gs-split-copy">
          <p className="gs-eyebrow">Experience EIS</p>
          <h2>
            Why EIS.
            <br />
            The curriculum.
          </h2>
          <p>Outdoor learning on the city’s doorstep, Cambridge pathways in the upper school, and a courtyard that stays loud after the last bell.</p>
          <div className="gs-cta-row">
            <Link to="/about" className="gs-split-cta">
              Why EIS
            </Link>
            <Link to="/academics" className="gs-split-cta">
              Academics
            </Link>
            <Link to="/news" className="gs-split-cta">
              News
            </Link>
          </div>
        </div>
        <div className="gs-split-media">
          <img src={IMAGES.campus} alt="" />
        </div>
      </section>

      <ExperienceCarousel />

      <section className="gs-split gs-flip">
        <LocalLine kind="square" />
        <div className="gs-split-copy">
          <SplitCrest />
          <h2>
            Walk the courtyard.
            <br />
            Sign in.
          </h2>
          <p>Book a Saturday visit, or open the portal as a student, parent, or teacher.</p>
          <div className="gs-cta-row">
            <Link to="/admissions/visit" className="gs-split-cta gs-split-cta-solid">
              Visit campus
            </Link>
            <Link to="/login" search={{}} className="gs-split-cta">
              Portal
            </Link>
          </div>
        </div>
        <div className="gs-split-media">
          <img src={IMAGES.assembly} alt="" />
        </div>
      </section>

      <GsFooter />
    </div>
  )
}

const EXPERIENCE = [
  { title: 'Visit day', body: 'Walk the courtyard on a Saturday morning.', image: IMAGES.courtyard, to: '/admissions/visit' as const },
  { title: 'Arts', body: 'Choir, drama, and studios that stay open after the bell.', image: IMAGES.arts, to: '/arts' as const },
  { title: 'Sport', body: 'Football, athletics, and house matches on the south field.', image: IMAGES.sports, to: '/athletics' as const },
  { title: 'Highlands', body: 'Lessons that leave the corridor for the escarpment.', image: IMAGES.highlands, to: '/life' as const },
  { title: 'Pastoral', body: 'Tutors who know every child by name.', image: IMAGES.care, to: '/life' as const },
]

function ExperienceCarousel() {
  const [index, setIndex] = useState(0)
  const dragRef = useRef<{ startX: number; delta: number; active: boolean }>({
    startX: 0,
    delta: 0,
    active: false,
  })
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const slide = EXPERIENCE[index] ?? EXPERIENCE[0]
  if (!slide) return null

  const go = (next: number) => {
    const len = EXPERIENCE.length
    setIndex(((next % len) + len) % len)
    setDragX(0)
  }

  const onPointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const target = e.target as HTMLElement | null
    if (target?.closest('a, button')) return
    dragRef.current = { startX: e.clientX, delta: 0, active: true }
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    if (!dragRef.current.active) return
    const delta = e.clientX - dragRef.current.startX
    dragRef.current.delta = delta
    setDragX(delta)
  }

  const onPointerUp = (e: ReactPointerEvent<HTMLElement>) => {
    if (!dragRef.current.active) return
    const { delta } = dragRef.current
    dragRef.current.active = false
    setDragging(false)
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* already released */
    }
    const threshold = Math.min(72, e.currentTarget.clientWidth * 0.18)
    if (delta <= -threshold) go(index + 1)
    else if (delta >= threshold) go(index - 1)
    else setDragX(0)
  }

  const trackStyle = {
    transform: `translate3d(calc(${-index * 100}% + ${dragX}px), 0, 0)`,
    transition: dragging ? 'none' : 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
  } as const

  return (
    <section className="gs-experience">
      <LocalLine kind="behind" />
      <div className="gs-experience-copy">
        <div
          className="gs-experience-viewport gs-experience-copy-viewport"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="gs-experience-track" style={trackStyle}>
            {EXPERIENCE.map((item) => (
              <div className="gs-experience-slide" key={item.title}>
                <p className="gs-eyebrow">Experience EIS</p>
                <h2>
                  Stories from
                  <br />
                  the courtyard
                </h2>
                <p>{item.body}</p>
                <div className="gs-cta-row">
                  <Link to={item.to} className="gs-feature-cta" tabIndex={item === slide ? 0 : -1}>
                    {item.title}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="gs-experience-dots" role="tablist" aria-label="Experience stories">
          {EXPERIENCE.map((item, i) => (
            <button
              key={item.title}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`${item.title}, slide ${i + 1} of ${EXPERIENCE.length}`}
              className={`gs-experience-dot${i === index ? ' is-on' : ''}`}
              onClick={() => go(i)}
            />
          ))}
        </div>
      </div>
      <div
        className="gs-experience-media"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="gs-experience-viewport gs-experience-media-viewport">
          <div className="gs-experience-track" style={trackStyle}>
            {EXPERIENCE.map((item) => (
              <div className="gs-experience-media-slide" key={item.title}>
                <img src={item.image} alt="" draggable={false} />
                <p className="gs-experience-caption">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

type LineKind = 'behind' | 'square'
type ImgBox = { x: number; y: number; w: number; h: number }

function GoldPlayhead() {
  const thumbRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const thumb = thumbRef.current
    if (!thumb) return

    let frame = 0
    let currentD = 0
    let currentGold: SVGPathElement | null = null

    function clearGolds(except?: SVGPathElement | null) {
      document.querySelectorAll('.gs-spine-gold.is-on').forEach((el) => {
        if (el !== except) el.classList.remove('is-on')
      })
      document.querySelectorAll('.gs-spine-gold-square.is-on').forEach((el) => el.classList.remove('is-on'))
    }

    function readTarget() {
      const lead = leadingSection()
      const svg = lead?.querySelector('.gs-local-line') as SVGSVGElement | null
      const gold = svg?.querySelector('.gs-spine-gold') as SVGPathElement | null
      if (!gold || !svg || !lead) {
        return { gold: null as SVGPathElement | null, d: 0, total: 1, onSquare: false }
      }

      const total = gold.getTotalLength()
      if (!total) return { gold, d: 0, total: 1, onSquare: false }

      const square = svg.querySelector('.gs-spine-square') as SVGPathElement | null
      const start = lead.offsetTop
      const range = Math.max(1, lead.offsetHeight)
      let d = 0

      if (square) {
        const p = Math.min(1, Math.max(0, (window.scrollY - start) / range))
        d = p * total
      } else {
        const box = svg.getBoundingClientRect()
        const localY = window.innerHeight * 0.5 - box.top
        d = Math.min(total, Math.max(0, (localY / Math.max(1, box.height)) * total))
      }

      let onSquare = false
      if (square) {
        const box = square.getBBox()
        const pt = gold.getPointAtLength(d)
        const pad = 24
        onSquare =
          pt.x >= box.x - pad &&
          pt.x <= box.x + box.width + pad &&
          pt.y >= box.y - pad &&
          pt.y <= box.y + box.height + pad
      }

      return { gold, d, total, onSquare }
    }

    function tick() {
      const target = readTarget()
      const gold = target.gold

      if (!gold) {
        currentGold = null
        clearGolds()
        thumb.style.opacity = '0'
        frame = requestAnimationFrame(tick)
        return
      }

      if (gold !== currentGold) {
        currentGold = gold
        currentD = target.d
      } else {
        currentD += (target.d - currentD) * 0.14
      }

      const thumbLen = Math.max(110, Math.min(190, window.innerHeight * 0.17))
      gold.style.strokeDasharray = `${thumbLen} ${target.total}`
      gold.style.strokeDashoffset = `${-(currentD - thumbLen * 0.5)}`
      gold.classList.add('is-on')
      document.querySelectorAll('.gs-spine-gold').forEach((el) => {
        if (el !== gold) el.classList.remove('is-on')
      })
      const svg = gold.ownerSVGElement
      const square = svg?.querySelector('.gs-spine-gold-square')
      document.querySelectorAll('.gs-spine-gold-square').forEach((el) => {
        el.classList.toggle('is-on', el === square && target.onSquare)
      })

      thumb.style.opacity = '0'
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return <div ref={thumbRef} className="gs-scroll-thumb" aria-hidden />
}

function LocalLine({ kind }: { kind: LineKind }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [metrics, setMetrics] = useState<{ w: number; h: number; img: ImgBox | null }>({
    w: 1200,
    h: 800,
    img: null,
  })

  useEffect(() => {
    const svg = svgRef.current
    const section = svg?.closest('section')
    if (!section) return

    function read() {
      if (!section) return
      const img = section.querySelector(
        '.gs-split-media img, .gs-story-media img, .gs-experience-media img',
      ) as HTMLImageElement | null
      const sr = section.getBoundingClientRect()
      let box: ImgBox | null = null
      if (img && img.offsetWidth > 0) {
        const ir = img.getBoundingClientRect()
        box = {
          x: ir.left - sr.left,
          y: ir.top - sr.top,
          w: ir.width,
          h: ir.height,
        }
      }
      setMetrics({ w: section.clientWidth, h: section.clientHeight, img: box })
    }

    read()
    const ro = new ResizeObserver(read)
    ro.observe(section)
    const img = section.querySelector('img')
    img?.addEventListener('load', read)
    window.addEventListener('resize', read)
    return () => {
      ro.disconnect()
      img?.removeEventListener('load', read)
      window.removeEventListener('resize', read)
    }
  }, [])

  const parts = spineParts(kind, metrics.w, metrics.h, metrics.img)

  return (
    <svg
      ref={svgRef}
      className={`gs-local-line${kind === 'square' ? ' gs-line-over' : ' gs-line-behind'}`}
      viewBox={`0 0 ${metrics.w} ${metrics.h}`}
      aria-hidden
    >
      <path d={parts.track} className="gs-spine-track" />
      <path d={parts.track} className="gs-spine-groove" />
      {kind === 'square' && parts.square ? (
        <>
          <path d={parts.square} className="gs-spine-track gs-spine-square" />
          <path d={parts.square} className="gs-spine-groove" />
          <path d={parts.square} className="gs-spine-gold-square" />
        </>
      ) : null}
      <path d={parts.follow} className="gs-spine-gold" />
    </svg>
  )
}

function leadingSection() {
  const y = window.scrollY + window.innerHeight * 0.5
  const nodes = document.querySelectorAll('.gs-shell > section, .gs-shell > .gs-stages')
  let lead: HTMLElement | null = null
  for (let i = 0; i < nodes.length; i += 1) {
    const el = nodes[i] as HTMLElement
    if (y >= el.offsetTop) lead = el
  }
  if (lead?.classList.contains('gs-stages')) {
    return lead.previousElementSibling as HTMLElement | null
  }
  return lead
}

type SpineParts = {
  track: string
  follow: string
  square: string | null
}

function roundRectPath(x: number, y: number, w: number, h: number, r: number) {
  const k = 0.5522847498
  const ox = r * k
  const oy = r * k
  return [
    `M ${x + r} ${y}`,
    `L ${x + w - r} ${y}`,
    `C ${x + w - r + ox} ${y} ${x + w} ${y + r - oy} ${x + w} ${y + r}`,
    `L ${x + w} ${y + h - r}`,
    `C ${x + w} ${y + h - r + oy} ${x + w - r + ox} ${y + h} ${x + w - r} ${y + h}`,
    `L ${x + r} ${y + h}`,
    `C ${x + r - ox} ${y + h} ${x} ${y + h - r + oy} ${x} ${y + h - r}`,
    `L ${x} ${y + r}`,
    `C ${x} ${y + r - oy} ${x + r - ox} ${y} ${x + r} ${y}`,
    'Z',
  ].join(' ')
}

function easeAcross(x0: number, y0: number, x1: number, y1: number, flattenEnd = false) {
  const dx = x1 - x0
  const dy = y1 - y0
  if (flattenEnd) {
    return `C ${x0} ${y0 + dy * 0.52}, ${x1 - dx * 0.38} ${y1}, ${x1} ${y1}`
  }
  return `C ${x0 + dx * 0.38} ${y0}, ${x1} ${y1 - dy * 0.52}, ${x1} ${y1}`
}

function wrapOutside(
  x: number,
  y: number,
  iw: number,
  ih: number,
  r: number,
  entryX: number,
  goRight: boolean,
) {
  const k = 0.5522847498
  const ox = r * k
  const oy = r * k
  const right = x + iw
  const bot = y + ih
  if (goRight) {
    return [
      `L ${right - r} ${y}`,
      `C ${right - r + ox} ${y} ${right} ${y + r - oy} ${right} ${y + r}`,
      `L ${right} ${bot - r}`,
      `C ${right} ${bot - r + oy} ${right - r + ox} ${bot} ${right - r} ${bot}`,
      `L ${entryX} ${bot}`,
    ].join(' ')
  }
  return [
    `L ${x + r} ${y}`,
    `C ${x + r - ox} ${y} ${x} ${y + r - oy} ${x} ${y + r}`,
    `L ${x} ${bot - r}`,
    `C ${x} ${bot - r + oy} ${x + r - ox} ${bot} ${x + r} ${bot}`,
    `L ${entryX} ${bot}`,
  ].join(' ')
}

function spineParts(kind: LineKind, w: number, h: number, img: ImgBox | null): SpineParts {
  const mid = w * 0.5
  const straight = `M ${mid} 0 L ${mid} ${h}`

  // With edge-to-edge media, wrapping a gold frame around the photo covers the
  // center scroll. Keep a clean middle spine; optional light square stays off-path.
  if (kind === 'square' && img) {
    const pad = 12
    const x = Math.max(mid + 8, img.x - pad)
    const y = Math.max(8, img.y - pad)
    const iw = Math.max(40, img.x + img.w + pad - x)
    const ih = img.h + pad * 2
    return { track: straight, follow: straight, square: roundRectPath(x, y, iw, ih, Math.min(48, iw / 5, ih / 5)) }
  }

  return { track: straight, follow: straight, square: null }
}

function HeroLogo() {
  return (
    <svg viewBox="0 0 80 92" className="gs-wordmark-logo" aria-hidden>
      <defs>
        <linearGradient id="gs-hero-gold" x1="12" y1="8" x2="68" y2="84" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f0d78a" />
          <stop offset="42%" stopColor="#c9a227" />
          <stop offset="100%" stopColor="#8a6a12" />
        </linearGradient>
        <linearGradient id="gs-hero-face" x1="40" y1="10" x2="40" y2="82" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgb(255 255 255 / 0.28)" />
          <stop offset="55%" stopColor="rgb(18 12 28 / 0.55)" />
          <stop offset="100%" stopColor="rgb(8 6 14 / 0.72)" />
        </linearGradient>
        <filter id="gs-hero-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.4" floodColor="#000" floodOpacity="0.45" />
        </filter>
      </defs>
      <g filter="url(#gs-hero-soft)">
        <path
          d="M40 4.5 68 16.5v24.5c0 18.5-12.2 33.2-28 41.2C24.2 74.2 12 59.5 12 41V16.5Z"
          fill="url(#gs-hero-gold)"
        />
        <path
          d="M40 9.2 63.2 19.2v21.2c0 15.8-10.4 28.4-23.2 35.2C27.2 68.8 16.8 56.2 16.8 40.4V19.2Z"
          fill="url(#gs-hero-face)"
          stroke="rgb(255 255 255 / 0.55)"
          strokeWidth="1.1"
        />
        <path
          d="M40 14.5 58.5 22.5v16.8c0 12.4-8.1 22.4-18.5 27.8C29.6 61.7 21.5 51.7 21.5 39.3V22.5Z"
          fill="none"
          stroke="url(#gs-hero-gold)"
          strokeWidth="1.15"
          opacity="0.9"
        />
        <circle cx="40" cy="28" r="7.2" fill="url(#gs-hero-gold)" />
        <circle cx="40" cy="28" r="4.6" fill="#1a1220" />
        <circle cx="40" cy="28" r="2.1" fill="#f0d78a" />
        <path
          d="M40 38.5v22.5"
          stroke="#fff"
          strokeWidth="1.7"
          strokeLinecap="round"
          opacity="0.92"
        />
        <path
          d="M29.5 48.5h21"
          stroke="#fff"
          strokeWidth="1.7"
          strokeLinecap="round"
          opacity="0.92"
        />
        <path
          d="M26 58.5c4.4-5.4 9-8.1 14-8.1s9.6 2.7 14 8.1"
          fill="none"
          stroke="url(#gs-hero-gold)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M30.5 63.5c3-3.2 6-4.8 9.5-4.8s6.5 1.6 9.5 4.8"
          fill="none"
          stroke="rgb(255 255 255 / 0.55)"
          strokeWidth="1.15"
          strokeLinecap="round"
        />
        <path d="M33 21.5 40 16l7 5.5" fill="none" stroke="#1a1220" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
        <text
          x="40"
          y="74.5"
          textAnchor="middle"
          fill="#f0d78a"
          fontSize="7.2"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontWeight="700"
          letterSpacing="1.6"
        >
          EIS
        </text>
      </g>
    </svg>
  )
}

function SplitCrest() {
  return (
    <svg viewBox="0 0 64 64" className="gs-crest" aria-hidden>
      <path
        d="M32 6l18 8v16c0 12-8 22-18 28C22 52 14 42 14 30V14z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M32 18v22M24 28h16" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}
