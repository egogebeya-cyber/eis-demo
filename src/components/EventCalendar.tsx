import { useMemo, useState } from 'react'
import { localized, type Locale } from '~/lib/i18n'
import { formatDate } from '~/lib/utils'

type CalEvent = {
  id: string
  startAt: string
  titleEn: string
  titleAm: string
  titleOm: string
  locationEn: string
  locationAm: string
  locationOm: string
  descriptionEn: string
  descriptionAm: string
  descriptionOm: string
}

function ymd(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function EventCalendar({ events, locale }: { events: CalEvent[]; locale: Locale }) {
  const [cursor, setCursor] = useState(() => {
    const n = new Date()
    return new Date(n.getFullYear(), n.getMonth(), 1)
  })

  const byDay = useMemo(() => {
    const map = new Map<string, CalEvent[]>()
    for (const ev of events) {
      const key = ev.startAt.slice(0, 10)
      const list = map.get(key) ?? []
      list.push(ev)
      map.set(key, list)
    }
    return map
  }, [events])

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const first = new Date(year, month, 1)
  const startPad = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = Array.from({ length: startPad + daysInMonth }, (_, i) => {
    if (i < startPad) return null
    return i - startPad + 1
  })
  const monthLabel = new Intl.DateTimeFormat(locale === 'am' ? 'am-ET' : locale === 'om' ? 'om-ET' : 'en-ET', {
    month: 'long',
    year: 'numeric',
  }).format(cursor)

  const weekdays =
    locale === 'am'
      ? ['ሰ', 'ማ', 'ረ', 'ሐ', 'አ', 'ቅ', 'እ']
      : locale === 'om'
        ? ['Wi', 'Ki', 'Ro', 'Ka', 'Jim', 'San', 'Dil']
        : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-8">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          className="rounded-full border border-school/20 px-3 py-1 text-sm font-bold text-school"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
        >
          ‹
        </button>
        <p className="font-display text-xl font-semibold text-school-dark">{monthLabel}</p>
        <button
          type="button"
          className="rounded-full border border-school/20 px-3 py-1 text-sm font-bold text-school"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase tracking-wide text-zinc-500">
        {weekdays.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />
          const key = ymd(new Date(year, month, day))
          const hits = byDay.get(key) ?? []
          return (
            <div
              key={key}
              className={`min-h-16 rounded-xl border p-1 text-left text-sm ${
                hits.length ? 'border-accent/40 bg-accent/10' : 'border-transparent bg-background'
              }`}
            >
              <span className="text-xs font-bold text-school-dark">{day}</span>
              {hits.slice(0, 2).map((ev) => (
                <p key={ev.id} className="mt-0.5 truncate text-[10px] font-semibold text-accent">
                  {localized(locale, { en: ev.titleEn, am: ev.titleAm, om: ev.titleOm })}
                </p>
              ))}
            </div>
          )
        })}
      </div>
      <div className="mt-8 space-y-4">
        {events.map((ev) => (
          <article key={ev.id} className="border-t border-school/10 pt-4">
            <p className="text-xs font-bold uppercase text-accent">{formatDate(ev.startAt, locale)}</p>
            <h3 className="font-display text-lg font-semibold text-school-dark">
              {localized(locale, { en: ev.titleEn, am: ev.titleAm, om: ev.titleOm })}
            </h3>
            <p className="text-sm text-school">
              {localized(locale, { en: ev.locationEn, am: ev.locationAm, om: ev.locationOm })}
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              {localized(locale, { en: ev.descriptionEn, am: ev.descriptionAm, om: ev.descriptionOm })}
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}
