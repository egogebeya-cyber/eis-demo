import type { CSSProperties } from 'react'
import { localized, type Locale } from '~/lib/i18n'
import { IMAGES } from '~/lib/images'

export type CampusShowcaseItem = {
  slug: string
  image: string
  label: string
  accent: string
}

const ACCENTS = ['#c9a227', '#1b4d3e', '#3d6b54', '#8c6a24', '#e0c08a', '#245c4a', '#7a6f5a']

export const CAMPUS_SHOWCASE: CampusShowcaseItem[] = [
  { slug: 'classroom', image: IMAGES.classroom, label: 'Classroom', accent: ACCENTS[0] },
  { slug: 'sports', image: IMAGES.sports, label: 'Sports day', accent: ACCENTS[1] },
  { slug: 'arts', image: IMAGES.arts, label: 'Arts', accent: ACCENTS[2] },
  { slug: 'courtyard', image: IMAGES.courtyard, label: 'Courtyard', accent: ACCENTS[3] },
  { slug: 'kids', image: IMAGES.kids, label: 'Early years', accent: ACCENTS[4] },
  { slug: 'assembly', image: IMAGES.assembly, label: 'Assembly', accent: ACCENTS[5] },
  { slug: 'library', image: IMAGES.library, label: 'Library', accent: ACCENTS[6] },
  { slug: 'lab', image: IMAGES.lab, label: 'Science lab', accent: ACCENTS[0] },
  { slug: 'music', image: IMAGES.music, label: 'Music', accent: ACCENTS[1] },
]

export function galleryToShowcase(
  items: Array<{ id: string; imageUrl: string; titleEn: string; titleAm: string; titleOm: string }>,
  locale: Locale,
): CampusShowcaseItem[] {
  if (!items.length) return CAMPUS_SHOWCASE
  return items.map((item, i) => ({
    slug: item.id,
    image: item.imageUrl,
    label: localized(locale, { en: item.titleEn, am: item.titleAm, om: item.titleOm }),
    accent: ACCENTS[i % ACCENTS.length],
  }))
}

export const SHOWCASE_CARD_COUNT = CAMPUS_SHOWCASE.length
export const SHOWCASE_DRAG_PX_PER_PHASE = 48
export const SHOWCASE_AUTO_SPEED = 0.2
export const SHOWCASE_VISIBLE_COUNT = 9
export const SHOWCASE_VISIBLE_RADIUS = (SHOWCASE_VISIBLE_COUNT - 1) / 2

const ARC_SPREAD_DEG = 20
const CARD_HALF_WIDTH_PX = 80

export function showcaseAutoDirectionFromDrag(deltaXPx: number): 1 | -1 {
  return deltaXPx >= 0 ? -1 : 1
}

export function showcasePhaseFromDrag(startPhase: number, deltaXPx: number): number {
  return startPhase - deltaXPx / SHOWCASE_DRAG_PX_PER_PHASE
}

export function wrapShowcaseOffset(offset: number, count = SHOWCASE_CARD_COUNT): number {
  const half = count / 2
  return ((((offset + half) % count) + count) % count) - half
}

export function getShowcaseCardOffset(index: number, rotationPhase: number, count = SHOWCASE_CARD_COUNT): number {
  return wrapShowcaseOffset(index - rotationPhase, count)
}

export function getShowcaseFocusedIndex(rotationPhase: number, count = SHOWCASE_CARD_COUNT): number {
  let focusedIndex = 0
  let closestDistance = Infinity
  for (let index = 0; index < count; index++) {
    const distance = Math.abs(getShowcaseCardOffset(index, rotationPhase, count))
    if (distance < closestDistance) {
      closestDistance = distance
      focusedIndex = index
    }
  }
  return focusedIndex
}

export function getShowcaseCardVisibility(offset: number): number {
  const dist = Math.abs(offset)
  if (dist <= SHOWCASE_VISIBLE_RADIUS) return 1
  if (dist >= SHOWCASE_VISIBLE_RADIUS + 0.4) return 0
  return 1 - (dist - SHOWCASE_VISIBLE_RADIUS) / 0.4
}

function getArcRadius(stageWidth: number): number {
  const maxAngleRad = (SHOWCASE_VISIBLE_RADIUS * ARC_SPREAD_DEG * Math.PI) / 180
  const usableHalf = stageWidth / 2 - CARD_HALF_WIDTH_PX - 12
  return Math.max(150, usableHalf / Math.sin(maxAngleRad))
}

export function getArcCardStyle(
  index: number,
  rotationPhase: number,
  entered: boolean,
  stageWidth = 360,
  count = SHOWCASE_CARD_COUNT,
): CSSProperties {
  const offset = getShowcaseCardOffset(index, rotationPhase, count)
  const angleRad = (offset * ARC_SPREAD_DEG * Math.PI) / 180
  const radius = getArcRadius(stageWidth)
  const dip = radius * 0.3
  const depth = Math.cos(angleRad)
  const depthNorm = Math.max(0, Math.min(1, (depth + 1) / 2))
  const translateX = Math.sin(angleRad) * radius
  const centerLift = -10 * Math.exp(-offset * offset * 0.7)
  const translateY = (1 - Math.cos(angleRad)) * dip + centerLift
  const translateZ = (depth - 1) * 48
  const rotateZ = offset * ARC_SPREAD_DEG * 0.92
  const rotateY = offset * -4.5
  const scale = 0.74 + depthNorm * 0.26
  const focusVisibility = getShowcaseCardVisibility(offset)
  const opacity = entered ? focusVisibility : 0
  const zIndex = Math.round(18 + depth * 16)
  const canInteract = focusVisibility > 0.02

  return {
    transform: `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
    zIndex,
    opacity,
    visibility: focusVisibility > 0.02 ? 'visible' : 'hidden',
    pointerEvents: canInteract ? 'auto' : 'none',
  }
}
