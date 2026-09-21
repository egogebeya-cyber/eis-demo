import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useLocale } from '~/components/locale-context'
import { localized } from '~/lib/i18n'
import { cn } from '~/lib/utils'

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setOn(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOn(true)
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={cn('reveal', on && 'reveal-in', className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

export function HeroBackground({ poster, video }: { poster: string; video: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const node = videoRef.current
    if (!node || reducedMotion || failed) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void node.play().catch(() => setFailed(true))
        else node.pause()
      },
      { threshold: 0.2 },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [failed, reducedMotion])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
      {!reducedMotion && !failed ? (
        <video
          ref={videoRef}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          src={video}
          poster={poster}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          aria-hidden
          onError={() => setFailed(true)}
        />
      ) : null}
    </div>
  )
}

function parseStat(value: string) {
  const plus = value.match(/^(\d+)\+$/)
  if (plus) return { kind: 'count' as const, end: Number(plus[1]), suffix: '+' }
  const pct = value.match(/^(\d+)%$/)
  if (pct) return { kind: 'count' as const, end: Number(pct[1]), suffix: '%' }
  return { kind: 'text' as const, text: value }
}

export function AnimatedStat({ value, label }: { value: string; label: string }) {
  const parsed = parseStat(value)
  const ref = useRef<HTMLDivElement>(null)
  const [display, setDisplay] = useState(() => (parsed.kind === 'text' ? parsed.text : `0${parsed.suffix}`))

  useEffect(() => {
    const spec = parseStat(value)
    const node = ref.current
    if (!node || spec.kind === 'text') {
      if (spec.kind === 'text') setDisplay(spec.text)
      return
    }
    let frame = 0
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const run = () => {
      if (reduce) {
        setDisplay(`${spec.end}${spec.suffix}`)
        return
      }
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / 1400)
        const eased = 1 - (1 - t) ** 3
        setDisplay(`${Math.round(spec.end * eased)}${spec.suffix}`)
        if (t < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          run()
          io.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(node)
    return () => {
      io.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value])

  return (
    <div ref={ref} className="px-4 py-4 sm:py-5">
      <p className="font-display text-2xl font-semibold text-accent tabular-nums sm:text-3xl">{display}</p>
      <p className="mt-1 text-xs text-white/70">{label}</p>
    </div>
  )
}

function UniMark({ uni }: { uni: { short: string; name: string } }) {
  return (
    <div className="uni-mark">
      <span className="uni-mark-crest" aria-hidden>
        {uni.short}
      </span>
      <span className="uni-mark-name">{uni.name}</span>
    </div>
  )
}

export function UniversityMarquee({
  items,
  label,
}: {
  items: Array<{ short: string; name: string }>
  label: string
}) {
  const loop = [...items, ...items]
  return (
    <div className="uni-marquee" role="img" aria-label={label}>
      <div className="uni-marquee-track">
        {loop.map((uni, i) => (
          <div key={`${uni.short}-${i}`} data-dup={i >= items.length ? '1' : '0'}>
            <UniMark uni={uni} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function UniversityLogoWall({ items }: { items: Array<{ short: string; name: string }> }) {
  return (
    <div className="uni-wall">
      {items.map((uni) => (
        <UniMark key={uni.short} uni={uni} />
      ))}
    </div>
  )
}

export function QuoteShowcase({
  quotes,
}: {
  quotes: Array<{ text: string; by: string }>
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {quotes.map((quote) => (
        <blockquote key={quote.by} className="rounded-2xl border border-accent/25 bg-school-dark px-5 py-4 text-white">
          <p className="font-display text-sm font-medium leading-relaxed sm:text-base">“{quote.text}”</p>
          <footer className="mt-3 text-[11px] font-bold uppercase tracking-wide text-accent">{quote.by}</footer>
        </blockquote>
      ))}
    </div>
  )
}

export function GalleryPeek({
  items,
}: {
  items: Array<{ id: string; imageUrl: string; titleEn: string; titleAm: string; titleOm: string; category: string }>
}) {
  const { t, locale } = useLocale()
  const [open, setOpen] = useState<(typeof items)[number] | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map((item, i) => (
          <Reveal key={item.id} delay={i * 70}>
            <button
              type="button"
              onClick={() => setOpen(item)}
              className="group relative block w-full overflow-hidden rounded-2xl"
            >
              <img src={item.imageUrl} alt="" className="img-zoom h-40 w-full object-cover" />
              <span className="absolute inset-0 flex items-end bg-gradient-to-t from-school-dark/80 to-transparent p-3 text-left text-xs font-bold uppercase tracking-wide text-white opacity-0 transition group-hover:opacity-100">
                {localized(locale, { en: item.titleEn, am: item.titleAm, om: item.titleOm })}
              </span>
            </button>
          </Reveal>
        ))}
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-school-dark/80 p-4" role="dialog" aria-modal="true">
          <button type="button" className="absolute inset-0" aria-label={t('closePhoto')} onClick={() => setOpen(null)} />
          <div className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-black">
            <img src={open.imageUrl} alt="" className="max-h-[80vh] w-full object-contain" />
            <div className="flex items-center justify-between gap-3 bg-school-dark px-5 py-3 text-white">
              <p className="text-sm font-semibold">
                {localized(locale, { en: open.titleEn, am: open.titleAm, om: open.titleOm })}
                <span className="ml-2 text-xs uppercase tracking-wide text-white/60">{open.category}</span>
              </p>
              <button type="button" className="rounded-full p-2 hover:bg-white/10" aria-label={t('closePhoto')} onClick={() => setOpen(null)}>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
