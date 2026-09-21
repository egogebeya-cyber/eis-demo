import { Fragment, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useLocale } from '~/components/locale-context'
import { SlotCard } from '~/components/slot-card'
import { addisWeekdayIndex, DAY_NAMES, TIMETABLE_PERIODS } from '~/lib/utils'
import { getCurrentUser } from '~/server/auth/functions'
import { listMyStudentsFn, studentTimetableFn } from '~/server/portal/functions'

type Slot = Awaited<ReturnType<typeof studentTimetableFn>>[number]
type Kid = Awaited<ReturnType<typeof listMyStudentsFn>>[number]
type SubjectChip = { id: string; name: string; days: number[] }
type ClassGroup = { classId: string; className: string; slots: Slot[] }

export const Route = createFileRoute('/portal/timetable')({
  loader: async () => {
    const user = await getCurrentUser()
    const slots = await studentTimetableFn()
    if (user?.role === 'teacher') return { mode: 'teacher' as const, kids: [] as Kid[], slots }
    const kids = await listMyStudentsFn()
    return { mode: 'family' as const, kids, slots }
  },
  component: TimetablePage,
})

function TimetablePage() {
  const data = Route.useLoaderData()
  if (data.mode === 'teacher') return <TeacherTimetable slots={data.slots} />
  return <FamilyTimetable kids={data.kids} slots={data.slots} />
}

function FamilyTimetable({ kids, slots }: { kids: Kid[]; slots: Slot[] }) {
  const { t } = useLocale()
  const today = addisWeekdayIndex()
  const [kidId, setKidId] = useState(kids[0]?.id ?? '')
  const current = kids.find((kid) => kid.id === kidId) ?? kids[0]
  const classSlots = current?.classId ? slots.filter((slot) => slot.classId === current.classId) : []

  function pickKid(id: string) {
    setKidId(id)
  }

  if (!current) {
    return (
      <div>
        <h1 className="text-xl font-black text-school-dark sm:text-2xl">{t('portalTimetable')}</h1>
        <p className="mt-4 text-sm text-muted">{t('noItems')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-school-dark sm:text-2xl">{t('portalTimetable')}</h1>
        <p className="mt-1 text-sm text-muted">{t('timetableHint')}</p>
      </div>

      {kids.length > 1 ? (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{t('pickChild')}</p>
          <div className="slot-grid">
            {kids.map((kid) => (
              <SlotCard
                key={kid.id}
                kicker={t('children')}
                title={`${kid.firstName} ${kid.lastName}`}
                hint={kid.className ?? t('noItems')}
                on={kid.id === current.id}
                onClick={() => pickKid(kid.id)}
              />
            ))}
          </div>
        </div>
      ) : null}

      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
        {current.className} · {current.firstName} {current.lastName}
      </p>

      {classSlots.length ? (
        <WeekGrid
          title={`${current.className} · ${t('thisWeek')}`}
          slots={classSlots}
          today={today}
          breakLabel={t('breakLabel')}
          lunchLabel={t('lunchLabel')}
          periodLabel={t('period')}
        />
      ) : (
        <p className="text-sm text-muted">{t('noItems')}</p>
      )}
    </div>
  )
}

function TeacherTimetable({ slots }: { slots: Slot[] }) {
  const { t } = useLocale()
  const today = addisWeekdayIndex()
  const groups = groupByClass(slots)
  const [classId, setClassId] = useState(groups[0]?.classId ?? '')
  const current = groups.find((group) => group.classId === classId) ?? groups[0]

  function pickClass(id: string) {
    setClassId(id)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-school-dark sm:text-2xl">{t('portalTimetable')}</h1>
        <p className="mt-1 text-sm text-muted">{t('timetableHint')}</p>
      </div>
      {groups.length === 0 ? <p className="text-sm text-muted">{t('noItems')}</p> : null}

      {groups.length > 1 ? (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{t('pickClass')}</p>
          <div className="slot-grid">
            {groups.map((group) => (
              <SlotCard
                key={group.classId}
                kicker={t('classLabel')}
                title={group.className}
                hint={`${subjectsOf(group.slots).length} ${t('subjectLabel').toLowerCase()}`}
                on={group.classId === current?.classId}
                onClick={() => pickClass(group.classId)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {current ? (
        <>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">{current.className}</p>
          <WeekGrid
            title={`${current.className} · ${t('thisWeek')}`}
            slots={current.slots}
            today={today}
            breakLabel={t('breakLabel')}
            lunchLabel={t('lunchLabel')}
            periodLabel={t('period')}
          />
        </>
      ) : null}
    </div>
  )
}

function subjectsOf(slots: Slot[]): SubjectChip[] {
  const order: string[] = []
  const map = new Map<string, SubjectChip>()
  for (const slot of slots) {
    let item = map.get(slot.subjectId)
    if (!item) {
      item = { id: slot.subjectId, name: slot.subject, days: [] }
      map.set(slot.subjectId, item)
      order.push(slot.subjectId)
    }
    if (!item.days.includes(slot.dayOfWeek)) item.days.push(slot.dayOfWeek)
  }
  for (const item of map.values()) item.days.sort((a, b) => a - b)
  return order.map((id) => map.get(id)!)
}

function groupByClass(slots: Slot[]): ClassGroup[] {
  const order: string[] = []
  const map = new Map<string, ClassGroup>()
  for (const slot of slots) {
    let group = map.get(slot.classId)
    if (!group) {
      group = { classId: slot.classId, className: slot.className, slots: [] }
      map.set(slot.classId, group)
      order.push(slot.classId)
    }
    group.slots.push(slot)
  }
  return order.map((id) => map.get(id)!)
}

function WeekGrid({
  title,
  slots,
  today,
  breakLabel,
  lunchLabel,
  periodLabel,
}: {
  title: string
  slots: Slot[]
  today: number
  breakLabel: string
  lunchLabel: string
  periodLabel: string
}) {
  const cells = new Map<string, Slot[]>()
  for (const slot of slots) {
    const key = `${slot.dayOfWeek}:${slot.startTime}`
    const list = cells.get(key) ?? []
    list.push(slot)
    cells.set(key, list)
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-school/10 bg-surface">
      <div className="border-b border-school/10 px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">{title}</p>
      </div>

      <div className="space-y-3 p-4 md:hidden">
        {DAY_NAMES.map((day, dayIndex) => (
          <article
            key={day}
            className={`rounded-2xl border px-4 py-3 ${
              today === dayIndex ? 'border-accent bg-school-light/40' : 'border-school/10'
            }`}
          >
            <h2 className="text-sm font-bold text-school-dark">{day}</h2>
            <ul className="mt-2 divide-y divide-school/10">
              {TIMETABLE_PERIODS.map((period, i) => {
                const items = cells.get(`${dayIndex}:${period.startTime}`) ?? []
                return (
                  <li key={period.startTime}>
                    {i === 3 ? <Band label={breakLabel} /> : null}
                    {i === 5 ? <Band label={lunchLabel} /> : null}
                    <div className="flex items-start justify-between gap-3 py-2">
                      <p className="w-24 shrink-0 font-sans text-xs font-bold text-muted">
                        {periodLabel} {period.period}
                        <span className="mt-0.5 block font-medium text-muted/80">
                          {period.startTime}–{period.endTime}
                        </span>
                      </p>
                      <Lesson items={items} />
                    </div>
                  </li>
                )
              })}
            </ul>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-school/10 text-xs uppercase tracking-wide text-muted">
              <th className="w-28 px-4 py-3 font-semibold">{periodLabel}</th>
              {DAY_NAMES.map((day, dayIndex) => (
                <th
                  key={day}
                  className={`px-3 py-3 font-semibold ${today === dayIndex ? 'bg-school-light/50 text-school' : ''}`}
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIMETABLE_PERIODS.map((period, i) => (
              <Fragment key={period.startTime}>
                {i === 3 ? (
                  <tr>
                    <td colSpan={6} className="bg-school-light/30 px-4 py-1.5 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                      {breakLabel}
                    </td>
                  </tr>
                ) : null}
                {i === 5 ? (
                  <tr>
                    <td colSpan={6} className="bg-school-light/30 px-4 py-1.5 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                      {lunchLabel}
                    </td>
                  </tr>
                ) : null}
                <tr className="border-t border-school/5">
                  <th className="px-4 py-3 align-top font-sans text-xs font-bold text-muted">
                    {period.period}
                    <span className="mt-0.5 block font-medium">
                      {period.startTime}–{period.endTime}
                    </span>
                  </th>
                  {DAY_NAMES.map((_, dayIndex) => (
                    <td key={dayIndex} className={`px-3 py-3 align-top ${today === dayIndex ? 'bg-school-light/30' : ''}`}>
                      <Lesson items={cells.get(`${dayIndex}:${period.startTime}`) ?? []} />
                    </td>
                  ))}
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Band({ label }: { label: string }) {
  return <p className="py-1 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{label}</p>
}

function Lesson({ items }: { items: Slot[] }) {
  if (!items.length) return <p className="text-muted">—</p>
  return (
    <div className="space-y-2 text-right md:text-left">
      {items.map((item) => (
        <div key={item.id}>
          <p className="font-semibold text-foreground">{item.subject}</p>
          <p className="text-xs text-muted">{item.room}</p>
        </div>
      ))}
    </div>
  )
}
