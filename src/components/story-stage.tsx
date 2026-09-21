import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { HeroBackground } from './home-interactive'
import { cn } from '~/lib/utils'

export type StorySlide = {
  id: string
  kicker: string
  title: string
  subtitle: string
  cta?: { to: string; label: string }
  image: string
  video?: string
}

const ADVANCE_MS = 780

export function StoryStage({ stories }: { stories: StorySlide[] }) {
  const [index, setIndex] = useState(0)
  const [unlocked, setUnlocked] = useState(false)
  const [reduced, setReduced] = useState(false)
  const busy = useRef(false)
  const touchStart = useRef<number | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const last = stories.length - 1

  const go = useCallback(
    (dir: 1 | -1) => {
      if (reduced || busy.current) return
      busy.current = true
      window.setTimeout(() => {
        busy.current = false
      }, ADVANCE_MS)

      setIndex((current) => {
        const next = current + dir
        if (next > last) {
          setUnlocked(true)
          return current
        }
        if (next < 0) return 0
        return next
      })
    },
    [last, reduced],
  )

  useEffect(() => {
    if (reduced) return
    document.body.style.overflow = unlocked ? '' : 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [unlocked, reduced])

  useEffect(() => {
    if (reduced) return

    function onWheel(e: WheelEvent) {
      if (unlocked) {
        if (window.scrollY <= 2 && e.deltaY < -20) {
          e.preventDefault()
          setUnlocked(false)
        }
        return
      }
      e.preventDefault()
      if (Math.abs(e.deltaY) < 18) return
      go(e.deltaY > 0 ? 1 : -1)
    }

    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (unlocked) {
        if (window.scrollY <= 2 && (e.key === 'ArrowUp' || e.key === 'PageUp')) {
          e.preventDefault()
          setUnlocked(false)
        }
        return
      }
      if (['ArrowDown', 'PageDown', ' ', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
        go(1)
      }
      if (['ArrowUp', 'PageUp', 'ArrowLeft'].includes(e.key)) {
        e.preventDefault()
        go(-1)
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
    }
  }, [go, reduced, unlocked])

  if (reduced) {
    return (
      <div className="story-snap-root">
        {stories.map((story) => (
          <section key={story.id} className="story-snap-panel">
            <StoryVisual story={story} active />
            <StoryFrame />
            <StoryCopy story={story} />
          </section>
        ))}
      </div>
    )
  }

  return (
    <section className="story-stage" aria-roledescription="carousel" aria-label="Campus stories">
      {stories.map((story, i) => (
        <div key={story.id} className={cn('story-slide', i === index && 'story-slide-active')} aria-hidden={i !== index}>
          <StoryVisual story={story} active={i === index} />
        </div>
      ))}
      <StoryFrame />
      <StoryCopy story={stories[index]} />

      <div className="pointer-events-none absolute inset-y-0 left-0 z-30 flex items-center pl-8 sm:pl-12">
        <button
          type="button"
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/85 bg-black/60 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/80"
          aria-label="Previous story"
          onClick={() => go(-1)}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 z-30 flex items-center pr-8 sm:pr-12">
        <button
          type="button"
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/85 bg-black/60 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/80"
          aria-label={index === last ? 'Continue to the rest of the page' : 'Next story'}
          onClick={() => go(1)}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <ol className="absolute bottom-16 left-1/2 z-30 flex -translate-x-1/2 gap-2">
        {stories.map((story, i) => (
          <li key={story.id}>
            <button
              type="button"
              aria-label={story.kicker}
              aria-current={i === index ? true : undefined}
              className={cn('h-2.5 w-2.5 rounded-full border border-white/80', i === index ? 'bg-accent' : 'bg-transparent')}
              onClick={() => setIndex(i)}
            />
          </li>
        ))}
      </ol>

      <p className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2 text-[11px] font-bold uppercase tracking-[0.28em] text-white/70">
        {unlocked ? 'Scroll' : index === last ? 'Scroll or next' : `${index + 1} / ${stories.length}`}
      </p>

      <div
        className="absolute inset-0 z-10"
        onTouchStart={(e) => {
          touchStart.current = e.changedTouches[0]?.clientY ?? null
        }}
        onTouchEnd={(e) => {
          const start = touchStart.current
          touchStart.current = null
          if (start == null) return
          const dy = e.changedTouches[0].clientY - start
          if (Math.abs(dy) < 48) return
          go(dy < 0 ? 1 : -1)
        }}
      />
    </section>
  )
}

function StoryFrame() {
  return <div className="story-frame" aria-hidden />
}

function StoryVisual({ story, active }: { story: StorySlide; active: boolean }) {
  return (
    <div className="absolute inset-0">
      {story.video && active ? (
        <HeroBackground poster={story.image} video={story.video} />
      ) : (
        <img src={story.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20" />
    </div>
  )
}

function StoryCopy({ story }: { story: StorySlide }) {
  const Heading = story.id === 'hero' ? 'h1' : 'h2'
  return (
    <div className="story-copy pointer-events-none relative z-20 flex min-h-dvh max-w-3xl flex-col justify-end px-8 pb-24 pt-36 sm:px-16 lg:px-24">
      <p className="text-xs font-bold uppercase tracking-[0.32em] text-accent">{story.kicker}</p>
      <Heading className="font-display mt-3 text-4xl font-medium italic leading-[1.05] text-white sm:text-6xl lg:text-7xl">{story.title}</Heading>
      <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">{story.subtitle}</p>
      {story.cta ? (
        <Link
          to={story.cta.to as '/'}
          className="pointer-events-auto mt-8 inline-flex w-fit rounded-full border border-white/60 px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white hover:bg-white hover:text-school-dark"
        >
          {story.cta.label}
        </Link>
      ) : null}
    </div>
  )
}
