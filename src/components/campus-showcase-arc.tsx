import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { X } from 'lucide-react'
import { useLocale } from '~/components/locale-context'
import {
  CAMPUS_SHOWCASE,
  getArcCardStyle,
  showcaseAutoDirectionFromDrag,
  showcasePhaseFromDrag,
  SHOWCASE_AUTO_SPEED,
  type CampusShowcaseItem,
} from '~/lib/campus-showcase'
import { cn } from '~/lib/utils'

const DRAG_THRESHOLD_PX = 8
const WHEEL_IDLE_MS = 1400
const FLICK_MOMENTUM_SCALE = 0.018
const MOMENTUM_FRICTION = 0.9
const MOMENTUM_MIN = 0.002

function resolveShowcaseSlugAtPoint(x: number, y: number): string | null {
  for (const el of document.elementsFromPoint(x, y)) {
    if (!(el instanceof HTMLElement)) continue
    const hit = el.closest('[data-showcase-slug]') as HTMLElement | null
    const slug = hit?.dataset.showcaseSlug
    if (slug) return slug
  }
  return null
}

type DragState = {
  pointerId: number
  startX: number
  startPhase: number
  moved: boolean
  lastX: number
  lastMoveTime: number
}

function ShowcaseCardMedia({ item }: { item: CampusShowcaseItem }) {
  return (
    <div className="category-arc-media" style={{ borderColor: `${item.accent}55` }}>
      <img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <span className="category-arc-label">{item.label}</span>
    </div>
  )
}

function CampusArcCard({
  item,
  index,
  rotationPhase,
  stageWidth,
  entered,
  reducedMotion,
  itemCount,
  onSelect,
}: {
  item: CampusShowcaseItem
  index: number
  rotationPhase: number
  stageWidth: number
  entered: boolean
  reducedMotion: boolean
  itemCount: number
  onSelect: (slug: string) => void
}) {
  if (reducedMotion) {
    return (
      <button
        type="button"
        data-showcase-slug={item.slug}
        onClick={() => onSelect(item.slug)}
        className="category-arc-card-static shrink-0 snap-center cursor-pointer border-0 bg-transparent p-0 text-left focus-visible:outline-none"
        aria-label={item.label}
      >
        <ShowcaseCardMedia item={item} />
      </button>
    )
  }

  return (
    <div
      className="category-arc-card"
      style={getArcCardStyle(index, rotationPhase, entered, stageWidth, itemCount)}
    >
      <div
        data-showcase-slug={item.slug}
        className="category-arc-hit block size-full cursor-pointer"
        aria-label={item.label}
        role="presentation"
      >
        <ShowcaseCardMedia item={item} />
      </div>
    </div>
  )
}

export function CampusShowcaseArc({ items = CAMPUS_SHOWCASE }: { items?: CampusShowcaseItem[] }) {
  const { t } = useLocale()
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const rotationPhaseRef = useRef(0)
  const autoPausedRef = useRef(false)
  const autoDirectionRef = useRef<1 | -1>(1)
  const dragRef = useRef<DragState | null>(null)
  const suppressClickRef = useRef(false)
  const wheelIdleTimerRef = useRef<number | null>(null)
  const momentumRef = useRef(0)
  const momentumFrameRef = useRef(0)

  const [entered, setEntered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [rotationPhase, setRotationPhase] = useState(0)
  const [stageWidth, setStageWidth] = useState(360)
  const [isDragging, setIsDragging] = useState(false)
  const [openSlug, setOpenSlug] = useState<string | null>(null)
  const openPhoto = items.find((entry) => entry.slug === openSlug) ?? null

  const openItem = useCallback(
    (slug: string) => {
      if (suppressClickRef.current) return
      const item = items.find((entry) => entry.slug === slug)
      if (item) setOpenSlug(item.slug)
    },
    [items],
  )

  useEffect(() => {
    if (!openPhoto) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenSlug(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openPhoto])

  const setPhase = useCallback((phase: number) => {
    rotationPhaseRef.current = phase
    setRotationPhase(phase)
  }, [])

  const pauseAutoRotation = useCallback(() => {
    autoPausedRef.current = true
  }, [])

  const resumeAutoRotation = useCallback(() => {
    autoPausedRef.current = false
  }, [])

  const stopMomentum = useCallback(() => {
    momentumRef.current = 0
    if (momentumFrameRef.current) {
      cancelAnimationFrame(momentumFrameRef.current)
      momentumFrameRef.current = 0
    }
  }, [])

  const startMomentum = useCallback(
    (velocityPxPerMs: number) => {
      const impulse = -velocityPxPerMs * FLICK_MOMENTUM_SCALE
      if (Math.abs(impulse) < MOMENTUM_MIN) return

      stopMomentum()
      momentumRef.current = impulse
      pauseAutoRotation()
      autoDirectionRef.current = impulse >= 0 ? 1 : -1

      const tick = () => {
        const step = momentumRef.current
        if (Math.abs(step) < MOMENTUM_MIN) {
          stopMomentum()
          resumeAutoRotation()
          return
        }

        setPhase(rotationPhaseRef.current + step)
        momentumRef.current *= MOMENTUM_FRICTION
        momentumFrameRef.current = requestAnimationFrame(tick)
      }

      momentumFrameRef.current = requestAnimationFrame(tick)
    },
    [pauseAutoRotation, resumeAutoRotation, setPhase, stopMomentum],
  )

  const scrollByDelta = useCallback(
    (deltaPx: number) => {
      if (deltaPx === 0) return

      stopMomentum()
      pauseAutoRotation()
      autoDirectionRef.current = showcaseAutoDirectionFromDrag(deltaPx)
      setPhase(showcasePhaseFromDrag(rotationPhaseRef.current, deltaPx))

      if (wheelIdleTimerRef.current !== null) {
        window.clearTimeout(wheelIdleTimerRef.current)
      }
      wheelIdleTimerRef.current = window.setTimeout(() => {
        wheelIdleTimerRef.current = null
        resumeAutoRotation()
      }, WHEEL_IDLE_MS)
    },
    [pauseAutoRotation, resumeAutoRotation, setPhase, stopMomentum],
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const node = stageRef.current
    if (!node) return

    const updateWidth = () => setStageWidth(node.clientWidth)
    updateWidth()

    const observer = new ResizeObserver(updateWidth)
    observer.observe(node)
    return () => observer.disconnect()
  }, [reducedMotion])

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
        if (entry.isIntersecting) setEntered(true)
      },
      { threshold: 0.25 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (reducedMotion || !isVisible || !entered) return

    let frame = 0
    let lastTick = 0

    const tick = (now: number) => {
      if (!autoPausedRef.current) {
        if (lastTick > 0) {
          const dt = (now - lastTick) / 1000
          setPhase(rotationPhaseRef.current + autoDirectionRef.current * SHOWCASE_AUTO_SPEED * dt)
        }
        lastTick = now
      } else {
        lastTick = now
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [entered, isVisible, reducedMotion, setPhase])

  useEffect(() => {
    const node = stageRef.current
    if (!node || reducedMotion) return

    const onWheel = (event: WheelEvent) => {
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      if (Math.abs(delta) < 0.5) return

      event.preventDefault()
      scrollByDelta(delta)
    }

    node.addEventListener('wheel', onWheel, { passive: false })
    return () => node.removeEventListener('wheel', onWheel)
  }, [reducedMotion, scrollByDelta])

  useEffect(() => {
    return () => {
      stopMomentum()
      if (wheelIdleTimerRef.current !== null) {
        window.clearTimeout(wheelIdleTimerRef.current)
      }
    }
  }, [stopMomentum])

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (reducedMotion || event.button !== 0) return

      const pointerId = event.pointerId
      const startX = event.clientX
      const startPhase = rotationPhaseRef.current
      const now = performance.now()
      const drag: DragState = {
        pointerId,
        startX,
        startPhase,
        moved: false,
        lastX: startX,
        lastMoveTime: now,
      }
      dragRef.current = drag
      stopMomentum()

      const onPointerMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== pointerId) return

        const deltaX = moveEvent.clientX - startX
        if (!drag.moved && Math.abs(deltaX) < DRAG_THRESHOLD_PX) return

        if (!drag.moved) {
          drag.moved = true
          setIsDragging(true)
          pauseAutoRotation()
        }

        moveEvent.preventDefault()
        drag.lastX = moveEvent.clientX
        drag.lastMoveTime = performance.now()
        autoDirectionRef.current = showcaseAutoDirectionFromDrag(deltaX)
        setPhase(showcasePhaseFromDrag(drag.startPhase, moveEvent.clientX - startX))
      }

      const onPointerUp = (upEvent: PointerEvent) => {
        if (upEvent.pointerId !== pointerId) return

        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerup', onPointerUp)
        window.removeEventListener('pointercancel', onPointerUp)

        const releaseTime = performance.now()
        const flickVelocity = (upEvent.clientX - drag.lastX) / Math.max(8, releaseTime - drag.lastMoveTime)

        dragRef.current = null
        setIsDragging(false)

        if (drag.moved) {
          const totalDeltaX = upEvent.clientX - startX
          const flickDeltaX = upEvent.clientX - drag.lastX
          const directionDeltaX = Math.abs(totalDeltaX) >= DRAG_THRESHOLD_PX ? totalDeltaX : flickDeltaX
          autoDirectionRef.current = showcaseAutoDirectionFromDrag(directionDeltaX)
          startMomentum(flickVelocity)
          suppressClickRef.current = true
          window.setTimeout(() => {
            suppressClickRef.current = false
          }, 0)
          return
        }

        const slug = resolveShowcaseSlugAtPoint(upEvent.clientX, upEvent.clientY)
        if (slug) openItem(slug)
      }

      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', onPointerUp)
      window.addEventListener('pointercancel', onPointerUp)
    },
    [openItem, pauseAutoRotation, reducedMotion, setPhase, startMomentum, stopMomentum],
  )

  return (
    <section ref={sectionRef} className="category-arc-section" aria-label={t('galleryTitle')}>
      {reducedMotion ? (
        <div className="category-arc-static-row scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1">
          {items.map((item, index) => (
            <CampusArcCard
              key={item.slug}
              item={item}
              index={index}
              rotationPhase={0}
              stageWidth={stageWidth}
              entered={entered}
              reducedMotion
              itemCount={items.length}
              onSelect={openItem}
            />
          ))}
        </div>
      ) : (
        <div
          ref={stageRef}
          className={cn('category-arc-stage', isDragging && 'category-arc-stage-dragging')}
          onPointerDown={handlePointerDown}
        >
          <div className={cn('category-arc-fan', entered && 'category-arc-fan-entered')}>
            {items.map((item, index) => (
              <CampusArcCard
                key={item.slug}
                item={item}
                index={index}
                rotationPhase={rotationPhase}
                stageWidth={stageWidth}
                entered={entered}
                reducedMotion={false}
                itemCount={items.length}
                onSelect={openItem}
              />
            ))}
          </div>
        </div>
      )}
      {openPhoto ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-school-dark/80 p-4" role="dialog" aria-modal="true">
          <button type="button" className="absolute inset-0" aria-label={t('closePhoto')} onClick={() => setOpenSlug(null)} />
          <div className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-black">
            <img src={openPhoto.image} alt="" className="max-h-[80vh] w-full object-contain" />
            <div className="flex items-center justify-between gap-3 bg-school-dark px-5 py-3 text-white">
              <p className="text-sm font-semibold">{openPhoto.label}</p>
              <button type="button" className="rounded-full p-2 hover:bg-white/10" aria-label={t('closePhoto')} onClick={() => setOpenSlug(null)}>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
