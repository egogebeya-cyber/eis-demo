import { useEffect, useMemo, useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useLocale } from '~/components/locale-context'
import { SlotCard } from '~/components/slot-card'
import { addisToday, dateTimeLocale, DAY_NAMES, formatDate } from '~/lib/utils'
import { getCurrentUser } from '~/server/auth/functions'
import {
  classAttendanceMonthFn,
  classRosterFn,
  listMyStudentsFn,
  saveAttendanceFn,
  studentAttendanceFn,
  teacherDeskFn,
} from '~/server/portal/functions'

export const Route = createFileRoute('/portal/attendance')({
  loader: async () => {
    const user = await getCurrentUser()
    if (user?.role === 'teacher') {
      const desk = await teacherDeskFn()
      const classId = desk.attendanceClasses[0]?.id
      if (!classId) return { mode: 'teacher' as const, classes: desk.attendanceClasses, roster: null, monthDays: {} as Record<string, DayCounts> }
      const roster = await classRosterFn({ data: { classId } })
      const month = await classAttendanceMonthFn({ data: { classId, month: roster.today.slice(0, 7) } })
      return { mode: 'teacher' as const, classes: desk.attendanceClasses, roster, monthDays: month.days }
    }
    const kids = await listMyStudentsFn()
    const reports = await Promise.all(
      kids.map(async (kid) => {
        const board = await studentAttendanceFn({ data: { studentId: kid.id } })
        return { kid, rows: board.rows, subjects: board.subjects }
      }),
    )
    return { mode: 'family' as const, reports }
  },
  component: AttendancePage,
})

type DayCounts = { present: number; absent: number; late: number; excused: number }
type TeacherRoster = Awaited<ReturnType<typeof classRosterFn>>

function statusTone(status: string) {
  if (status === 'absent') return { active: 'bg-accent text-school-dark', avatar: 'bg-accent/20 text-school-dark' }
  if (status === 'late') return { active: 'bg-amber-500 text-white', avatar: 'bg-amber-100 text-amber-800' }
  if (status === 'excused') return { active: 'bg-zinc-500 text-white', avatar: 'bg-zinc-200 text-zinc-700' }
  return { active: 'bg-school text-white', avatar: 'bg-school-light text-school' }
}

function SummaryChip({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-2xl border border-school/10 bg-surface px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">{label}</p>
      <p className={`mt-1 text-lg font-bold sm:text-2xl ${tone === 'absent' ? 'text-accent' : 'text-foreground'}`}>{value}</p>
    </div>
  )
}

function AttendancePage() {
  const data = Route.useLoaderData()
  if (data.mode === 'teacher') return <TeacherAttendance classes={data.classes} roster={data.roster} monthDays={data.monthDays} />
  return <FamilyAttendance reports={data.reports} />
}

type FamilyKid = Awaited<ReturnType<typeof listMyStudentsFn>>[number]
type FamilyBoard = Awaited<ReturnType<typeof studentAttendanceFn>>
type FamilyRow = FamilyBoard['rows'][number]
type FamilySubject = FamilyBoard['subjects'][number]

function shiftIso(iso: string, days: number) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d + days))
  return dt.toISOString().slice(0, 10)
}

function mondayOf(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const dow = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7
  return shiftIso(iso, -dow)
}

function schoolDay(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay()
  if (dow === 6) return shiftIso(iso, -1)
  if (dow === 0) return shiftIso(iso, -2)
  return iso
}

function weekDaysOf(iso: string) {
  const start = mondayOf(iso)
  return DAY_NAMES.map((name, i) => ({ name, date: shiftIso(start, i) }))
}

function isoWeekdayIndex(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7
}

function FamilyAttendance({
  reports,
}: {
  reports: Array<{ kid: FamilyKid; rows: FamilyRow[]; subjects: FamilySubject[] }>
}) {
  const { t, locale } = useLocale()
  const today = addisToday()
  const [kidId, setKidId] = useState(reports[0]?.kid.id ?? '')
  const current = reports.find((item) => item.kid.id === kidId) ?? reports[0]
  const [subjectId, setSubjectId] = useState(current?.subjects[0]?.id ?? '')
  const [month, setMonth] = useState(today.slice(0, 7))
  const [selected, setSelected] = useState(schoolDay(today))
  const active = current?.subjects.find((item) => item.id === subjectId) ?? current?.subjects[0]
  const taughtDays = useMemo(() => new Set(active?.days ?? []), [active])
  const taughtOn = (date: string) => (active ? taughtDays.has(isoWeekdayIndex(date)) : true)
  const byDate = useMemo(() => {
    const map = new Map<string, FamilyRow>()
    for (const row of current?.rows ?? []) {
      if (active && !taughtDays.has(isoWeekdayIndex(row.date))) continue
      map.set(row.date, row)
    }
    return map
  }, [current, taughtDays, active])
  const summary = useMemo(() => {
    const acc = { present: 0, absent: 0, late: 0, excused: 0 }
    for (const row of byDate.values()) {
      if (row.status === 'absent') acc.absent += 1
      else if (row.status === 'late') acc.late += 1
      else if (row.status === 'excused') acc.excused += 1
      else acc.present += 1
    }
    return acc
  }, [byDate])

  function pickKid(id: string) {
    setKidId(id)
    const next = reports.find((item) => item.kid.id === id)
    setSubjectId(next?.subjects[0]?.id ?? '')
  }

  function pickSubject(id: string) {
    setSubjectId(id)
    const subject = current?.subjects.find((item) => item.id === id)
    const days = new Set(subject?.days ?? [])
    const week = weekDaysOf(selected)
    const match = [...week].reverse().find((day) => day.date <= today && days.has(isoWeekdayIndex(day.date)))
    if (match) {
      setSelected(match.date)
      setMonth(match.date.slice(0, 7))
    }
  }

  if (!current) {
    return (
      <div>
        <h1 className="text-xl font-black text-school-dark sm:text-2xl">{t('portalAttendance')}</h1>
        <p className="mt-4 text-sm text-muted">{t('noItems')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-school-dark sm:text-2xl">{t('portalAttendance')}</h1>
        <p className="mt-1 text-sm text-muted">{t('attendanceHint')}</p>
      </div>

      {reports.length > 1 ? (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{t('pickChild')}</p>
          <div className="slot-grid">
            {reports.map((item) => (
              <SlotCard
                key={item.kid.id}
                kicker={t('children')}
                title={`${item.kid.firstName} ${item.kid.lastName}`}
                hint={item.kid.className ?? ''}
                on={item.kid.id === current.kid.id}
                onClick={() => pickKid(item.kid.id)}
              />
            ))}
          </div>
        </div>
      ) : null}

      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
        {current.kid.className} · {current.kid.firstName} {current.kid.lastName}
      </p>

      {current.subjects.length === 0 ? (
        <p className="text-sm text-muted">{t('noItems')}</p>
      ) : (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{t('pickSubject')}</p>
          <div className="slot-grid">
            {current.subjects.map((item) => (
              <SlotCard
                key={item.id}
                kicker={t('subjectLabel')}
                title={item.name}
                hint={item.days.map((day) => DAY_NAMES[day]?.slice(0, 3)).filter(Boolean).join(' · ') || t('noItems')}
                on={item.id === active?.id}
                onClick={() => pickSubject(item.id)}
              />
            ))}
          </div>
        </div>
      )}

      {active ? (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <SummaryChip label={t('present')} value={summary.present} tone="present" />
            <SummaryChip label={t('absent')} value={summary.absent} tone="absent" />
            <SummaryChip label={t('late')} value={summary.late} tone="late" />
            <SummaryChip label={t('excused')} value={summary.excused} tone="excused" />
          </div>

          <WeekStrip
            selected={selected}
            today={today}
            statusFor={(date) => (taughtOn(date) ? byDate.get(date)?.status : undefined)}
            taughtOn={taughtOn}
            onSelect={(date) => {
              setSelected(date)
              setMonth(date.slice(0, 7))
            }}
            title={`${active.name} · ${t('thisWeek')}`}
          />

          <FamilyMonth
            month={month}
            today={today}
            selected={selected}
            byDate={byDate}
            locale={locale}
            taughtOn={taughtOn}
            onMonth={setMonth}
            onSelect={(date) => {
              setSelected(date)
              setMonth(date.slice(0, 7))
            }}
          />
        </>
      ) : null}
    </div>
  )
}

function WeekStrip({
  selected,
  today,
  statusFor,
  savedFor,
  taughtOn,
  onSelect,
  title,
}: {
  selected: string
  today: string
  statusFor?: (date: string) => string | undefined
  savedFor?: (date: string) => boolean
  taughtOn?: (date: string) => boolean
  onSelect: (date: string) => void
  title: string
}) {
  const days = weekDaysOf(selected)
  return (
    <section className="overflow-hidden rounded-2xl border border-school/10 bg-surface">
      <div className="border-b border-school/10 px-5 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{title}</p>
      </div>
      <div className="grid grid-cols-5 gap-px bg-school/10">
        {days.map((day) => {
          const isSelected = day.date === selected
          const isFuture = day.date > today
          const isToday = day.date === today
          const hasLesson = taughtOn ? taughtOn(day.date) : true
          const status = hasLesson ? statusFor?.(day.date) : undefined
          return (
            <button
              key={day.date}
              type="button"
              disabled={isFuture || !hasLesson}
              onClick={() => onSelect(day.date)}
              className={`px-2 py-4 text-center ${
                isSelected
                  ? 'bg-school text-white'
                  : isFuture || !hasLesson
                    ? 'bg-surface text-muted/40'
                    : 'bg-surface text-foreground hover:bg-school-light/60'
              }`}
            >
              <p className={`text-[10px] font-semibold uppercase tracking-widest ${isSelected ? 'text-accent' : 'text-muted'}`}>
                {day.name.slice(0, 3)}
              </p>
              <p className="mt-1 font-sans text-xl font-bold">{Number(day.date.slice(8, 10))}</p>
              {status ? (
                <p className={`mt-2 text-[10px] font-bold uppercase ${isSelected ? 'text-white' : ''}`}>{status[0]}</p>
              ) : (
                <span className={`mt-3 inline-block h-1.5 w-1.5 rounded-full ${savedFor?.(day.date) ? (isSelected ? 'bg-accent' : 'bg-school') : isToday && hasLesson ? 'bg-school/40' : 'bg-transparent'}`} />
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function FamilyMonth({
  month,
  today,
  selected,
  byDate,
  locale,
  taughtOn,
  onMonth,
  onSelect,
}: {
  month: string
  today: string
  selected: string
  byDate: Map<string, FamilyRow>
  locale: string
  taughtOn?: (date: string) => boolean
  onMonth: (month: string) => void
  onSelect: (date: string) => void
}) {
  const year = Number(month.slice(0, 4))
  const monthNum = Number(month.slice(5, 7))
  const first = new Date(year, monthNum - 1, 1)
  const startPad = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, monthNum, 0).getDate()
  const cells = useMemo(
    () => Array.from({ length: startPad + daysInMonth }, (_, i) => (i < startPad ? null : i - startPad + 1)),
    [startPad, daysInMonth],
  )
  const monthLabel = new Intl.DateTimeFormat(dateTimeLocale(locale), { month: 'long', year: 'numeric' }).format(first)
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  function shift(delta: number) {
    const next = new Date(year, monthNum - 1 + delta, 1)
    onMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`)
  }

  return (
    <section className="rounded-2xl border border-school/10 bg-surface p-3 sm:p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <button type="button" className="rounded-full border border-school/20 px-2.5 py-1 text-sm font-bold text-school" onClick={() => shift(-1)}>
          ‹
        </button>
        <p className="font-display text-base font-semibold text-foreground">{monthLabel}</p>
        <button type="button" className="rounded-full border border-school/20 px-2.5 py-1 text-sm font-bold text-school" onClick={() => shift(1)}>
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-semibold uppercase tracking-wide text-muted">
        {weekdays.map((day) => (
          <span key={day} className="py-1">
            {day}
          </span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <span key={`pad-${i}`} />
          const value = `${month}-${String(day).padStart(2, '0')}`
          const isFuture = value > today
          const isSelected = value === selected
          const hasLesson = taughtOn ? taughtOn(value) : true
          const status = hasLesson ? byDate.get(value)?.status : undefined
          return (
            <button
              key={value}
              type="button"
              disabled={isFuture || !hasLesson}
              onClick={() => onSelect(value)}
              className={`flex h-9 items-center justify-center rounded-lg text-xs font-semibold ${
                isSelected
                  ? statusTone(status ?? 'present').active
                  : isFuture || !hasLesson
                    ? 'cursor-not-allowed text-muted/40'
                    : status
                      ? `${statusTone(status).avatar}`
                      : 'text-foreground hover:bg-school-light'
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function TeacherAttendance({
  classes,
  roster,
  monthDays,
}: {
  classes: Awaited<ReturnType<typeof teacherDeskFn>>['attendanceClasses']
  roster: TeacherRoster | null
  monthDays: Record<string, DayCounts>
}) {
  const { t, locale } = useLocale()
  const [classId, setClassId] = useState(classes[0]?.id ?? '')
  const [current, setCurrent] = useState(roster)
  const [marks, setMarks] = useState<Record<string, string>>(() => marksFromRoster(roster))
  const [savedDays, setSavedDays] = useState(monthDays)
  const [month, setMonth] = useState(() => (roster?.today ?? '').slice(0, 7) || new Date().toISOString().slice(0, 7))
  const [busy, setBusy] = useState(false)
  const today = current?.today ?? roster?.today ?? ''
  const selected = current?.date ?? today
  const selectedClass = classes.find((c) => c.id === classId)

  async function loadDay(nextClass: string, date: string, nextMonth = date.slice(0, 7)) {
    setBusy(true)
    try {
      const [next, cal] = await Promise.all([
        classRosterFn({ data: { classId: nextClass, date } }),
        nextMonth === month && nextClass === classId
          ? Promise.resolve({ month, days: savedDays })
          : classAttendanceMonthFn({ data: { classId: nextClass, month: nextMonth } }),
      ])
      setClassId(nextClass)
      setCurrent(next)
      setMarks(marksFromRoster(next))
      setMonth(cal.month)
      setSavedDays(cal.days)
    } finally {
      setBusy(false)
    }
  }

  async function save() {
    if (!current) return
    setBusy(true)
    try {
      await saveAttendanceFn({
        data: {
          classId,
          date: current.date,
          marks: Object.entries(marks).map(([studentId, status]) => ({ studentId, status })),
        },
      })
      const [next, cal] = await Promise.all([
        classRosterFn({ data: { classId, date: current.date } }),
        classAttendanceMonthFn({ data: { classId, month } }),
      ])
      setCurrent(next)
      setMarks(marksFromRoster(next))
      setSavedDays(cal.days)
    } finally {
      setBusy(false)
    }
  }

  if (!classes.length) {
    return (
      <div>
        <h1 className="text-xl font-black text-school-dark sm:text-2xl">{t('portalAttendance')}</h1>
        <p className="mt-4 rounded-2xl border border-school/10 bg-surface p-3 text-sm text-muted sm:p-6">{t('noAttendanceClasses')}</p>
      </div>
    )
  }

  const students = current?.roster ?? []
  const summary = Object.values(marks).reduce(
    (acc, status) => {
      if (status === 'absent') acc.absent += 1
      else if (status === 'late') acc.late += 1
      else if (status === 'excused') acc.excused += 1
      else acc.present += 1
      return acc
    },
    { present: 0, absent: 0, late: 0, excused: 0 },
  )
  const saved = Boolean(savedDays[selected])
  const statuses = [
    { id: 'present', label: t('present'), short: 'P' },
    { id: 'absent', label: t('absent'), short: 'A' },
    { id: 'late', label: t('late'), short: 'L' },
    { id: 'excused', label: t('excused'), short: 'E' },
  ] as const

  function markAll(status: string) {
    const next: Record<string, string> = {}
    for (const student of students) next[student.id] = status
    setMarks(next)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-school-dark sm:text-2xl">{t('portalAttendance')}</h1>
          <p className="mt-1 text-sm text-muted">{t('attendanceHint')}</p>
          <p className="mt-1 text-sm text-muted">
            {selectedClass?.name ?? t('yourHomeroom')}
            {selectedClass?.isHomeroom ? ` · ${t('homeroomLabel')}` : ''}
            {selectedClass?.subjects.length ? ` · ${selectedClass.subjects.map((s) => s.name).join(', ')}` : ''}
            {' · '}
            {formatDate(selected, locale)}
            {selected === today ? ' · Today' : ''}
            {saved ? ' · Saved' : ' · Not saved'}
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void save()}
          className="rounded-full bg-school px-5 py-2 text-sm font-bold uppercase text-white disabled:opacity-60"
        >
          {t('save')}
        </button>
      </div>

      <ClassSlideList
        classes={classes}
        classId={classId}
        busy={busy}
        onSelect={(id) => void loadDay(id, selected, month)}
      />

      <WeekStrip
        selected={selected}
        today={today}
        savedFor={(date) => Boolean(savedDays[date])}
        onSelect={(date) => void loadDay(classId, date, date.slice(0, 7))}
        title={t('thisWeek')}
      />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section className="overflow-hidden rounded-2xl border border-school/10 bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-school/10 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {students.length} {t('children').toLowerCase()}
            </p>
            <button
              type="button"
              disabled={busy || students.length === 0}
              onClick={() => markAll('present')}
              className="text-xs font-semibold uppercase tracking-wide text-school"
            >
              All {t('present').toLowerCase()}
            </button>
          </div>
          <div className="hidden grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted sm:grid">
            <span>Student</span>
            <span className="grid w-[13.5rem] grid-cols-4 text-center">
              {statuses.map((status) => (
                <span key={status.id}>{status.short}</span>
              ))}
            </span>
          </div>
          <ul>
            {students.map((student, index) => {
              const status = marks[student.id] ?? 'present'
              return (
                <li key={student.id} className="flex flex-col gap-2 border-t border-school/5 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="w-6 shrink-0 text-xs text-muted">{index + 1}</span>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${statusTone(status).avatar}`}>
                      {student.firstName[0]}
                      {student.lastName[0]}
                    </span>
                    <span className="font-medium text-foreground">
                      {student.firstName} {student.lastName}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 sm:w-[13.5rem]">
                    {statuses.map((item) => {
                      const on = status === item.id
                      return (
                        <button
                          key={item.id}
                          type="button"
                          disabled={busy}
                          aria-pressed={on}
                          title={item.label}
                          onClick={() => setMarks((m) => ({ ...m, [student.id]: item.id }))}
                          className={`rounded-lg px-2 py-2 text-xs font-bold ${on ? statusTone(item.id).active : 'bg-background text-muted hover:bg-school-light'}`}
                        >
                          <span className="sm:hidden">{item.label}</span>
                          <span className="hidden sm:inline">{item.short}</span>
                        </button>
                      )
                    })}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <SummaryChip label={t('present')} value={summary.present} tone="present" />
            <SummaryChip label={t('absent')} value={summary.absent} tone="absent" />
            <SummaryChip label={t('late')} value={summary.late} tone="late" />
            <SummaryChip label={t('excused')} value={summary.excused} tone="excused" />
          </div>
          <AttendanceMonth
            month={month}
            today={today}
            selected={selected}
            savedDays={savedDays}
            locale={locale}
            disabled={busy}
            onMonth={(next) => void loadDay(classId, clampDateToMonth(selected, next, today), next)}
            onSelect={(date) => void loadDay(classId, date)}
          />
        </div>
      </div>

      <div className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-school/10 bg-surface/95 px-4 py-3 shadow-sm backdrop-blur">
        <p className="text-sm text-muted">
          {summary.present}P · {summary.absent}A · {summary.late}L · {summary.excused}E
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => void save()}
          className="rounded-full bg-school px-5 py-2 text-sm font-bold uppercase text-white disabled:opacity-60"
        >
          {t('save')}
        </button>
      </div>
    </div>
  )
}

function ClassSlideList({
  classes,
  classId,
  busy,
  onSelect,
}: {
  classes: Awaited<ReturnType<typeof teacherDeskFn>>['attendanceClasses']
  classId: string
  busy?: boolean
  onSelect: (id: string) => void
}) {
  const { t } = useLocale()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const skipRef = useRef(false)
  const snapTimer = useRef(0)
  const index = Math.max(0, classes.findIndex((c) => c.id === classId))

  useEffect(() => {
    const card = scrollerRef.current?.querySelector<HTMLElement>(`[data-class-id="${classId}"]`)
    if (!card) return
    skipRef.current = true
    card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    const timer = window.setTimeout(() => {
      skipRef.current = false
    }, 400)
    return () => window.clearTimeout(timer)
  }, [classId])

  function go(delta: number) {
    const next = classes[index + delta]
    if (next) onSelect(next.id)
  }

  function nearestClass() {
    const root = scrollerRef.current
    if (!root) return
    const center = root.scrollLeft + root.clientWidth / 2
    let best = classId
    let bestDist = Infinity
    for (const child of root.querySelectorAll<HTMLElement>('[data-class-id]')) {
      const mid = child.offsetLeft + child.offsetWidth / 2
      const dist = Math.abs(mid - center)
      if (dist < bestDist) {
        bestDist = dist
        best = child.dataset.classId || classId
      }
    }
    if (best !== classId) onSelect(best)
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          {t('yourHomeroom')} · {index + 1} / {classes.length}
        </p>
        {classes.length > 1 ? (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy || index === 0}
              onClick={() => go(-1)}
              className="rounded-full border border-school/20 px-3 py-1 text-sm font-bold text-school disabled:opacity-40"
            >
              ‹
            </button>
            <button
              type="button"
              disabled={busy || index >= classes.length - 1}
              onClick={() => go(1)}
              className="rounded-full border border-school/20 px-3 py-1 text-sm font-bold text-school disabled:opacity-40"
            >
              ›
            </button>
          </div>
        ) : null}
      </div>
      <div
        ref={scrollerRef}
        onScroll={() => {
          if (skipRef.current || busy) return
          window.clearTimeout(snapTimer.current)
          snapTimer.current = window.setTimeout(nearestClass, 80)
        }}
        className="-mx-3 flex snap-x snap-mandatory gap-2 overflow-x-auto px-3 pb-2 sm:-mx-4 sm:gap-3 sm:px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {classes.map((item) => {
          const selected = item.id === classId
          return (
            <button
              key={item.id}
              type="button"
              data-class-id={item.id}
              disabled={busy}
              onClick={() => onSelect(item.id)}
              className={`w-[min(68%,11.25rem)] shrink-0 snap-center rounded-2xl border px-2.5 py-2.5 text-left transition sm:w-[min(100%,20rem)] sm:px-5 sm:py-5 ${
                selected ? 'border-transparent bg-school text-white' : 'border-school/10 bg-surface text-foreground'
              }`}
            >
              <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${selected ? 'text-accent' : 'text-muted'}`}>
                {item.isHomeroom ? t('homeroomLabel') : t('subjectTeacher')}
              </p>
              <p className="mt-1 font-display text-lg font-medium italic sm:mt-2 sm:text-3xl">{item.name}</p>
              <p className={`mt-1 text-xs sm:mt-2 sm:text-sm ${selected ? 'text-white/70' : 'text-muted'}`}>
                {item.subjects.length ? item.subjects.map((s) => s.name).join(', ') : t('yourHomeroom')}
              </p>
            </button>
          )
        })}
      </div>
      {classes.length > 1 ? (
        <div className="mt-2 flex justify-center gap-1.5">
          {classes.map((item) => (
            <span key={item.id} className={`h-1.5 rounded-full ${item.id === classId ? 'w-5 bg-school' : 'w-1.5 bg-school/25'}`} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function AttendanceMonth({
  month,
  today,
  selected,
  savedDays,
  locale,
  disabled,
  onMonth,
  onSelect,
}: {
  month: string
  today: string
  selected: string
  savedDays: Record<string, DayCounts>
  locale: string
  disabled?: boolean
  onMonth: (month: string) => void
  onSelect: (date: string) => void
}) {
  const year = Number(month.slice(0, 4))
  const monthNum = Number(month.slice(5, 7))
  const first = new Date(year, monthNum - 1, 1)
  const startPad = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, monthNum, 0).getDate()
  const cells = useMemo(
    () => Array.from({ length: startPad + daysInMonth }, (_, i) => (i < startPad ? null : i - startPad + 1)),
    [startPad, daysInMonth],
  )
  const monthLabel = new Intl.DateTimeFormat(dateTimeLocale(locale), { month: 'long', year: 'numeric' }).format(first)
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  function shift(delta: number) {
    const next = new Date(year, monthNum - 1 + delta, 1)
    const y = next.getFullYear()
    const m = String(next.getMonth() + 1).padStart(2, '0')
    onMonth(`${y}-${m}`)
  }

  return (
    <section className="rounded-2xl border border-school/10 bg-surface p-3 sm:p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <button type="button" disabled={disabled} className="rounded-full border border-school/20 px-2.5 py-1 text-sm font-bold text-school disabled:opacity-50" onClick={() => shift(-1)}>
          ‹
        </button>
        <p className="font-display text-base font-semibold text-foreground">{monthLabel}</p>
        <button type="button" disabled={disabled} className="rounded-full border border-school/20 px-2.5 py-1 text-sm font-bold text-school disabled:opacity-50" onClick={() => shift(1)}>
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-semibold uppercase tracking-wide text-muted">
        {weekdays.map((day) => (
          <span key={day} className="py-1">
            {day}
          </span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <span key={`pad-${i}`} />
          const value = `${month}-${String(day).padStart(2, '0')}`
          const isFuture = today && value > today
          const isToday = value === today
          const isSelected = value === selected
          const counts = savedDays[value]
          return (
            <button
              key={value}
              type="button"
              disabled={disabled || isFuture}
              onClick={() => onSelect(value)}
              className={`flex h-9 flex-col items-center justify-center rounded-lg text-xs ${
                isSelected
                  ? 'bg-school font-semibold text-white'
                  : isFuture
                    ? 'cursor-not-allowed text-muted/40'
                    : isToday
                      ? 'ring-1 ring-school text-foreground hover:bg-school-light'
                      : 'text-foreground hover:bg-school-light'
              }`}
            >
              {day}
              <span className={`h-1 w-1 rounded-full ${counts ? (isSelected ? 'bg-accent' : counts.absent ? 'bg-accent' : 'bg-school') : 'bg-transparent'}`} />
            </button>
          )
        })}
      </div>
    </section>
  )
}

function clampDateToMonth(selected: string, month: string, today: string) {
  const day = Number((selected || today).slice(8, 10) || 1)
  const last = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).getDate()
  const next = `${month}-${String(Math.min(day, last)).padStart(2, '0')}`
  return today && next > today ? today : next
}

function marksFromRoster(roster: TeacherRoster | null) {
  const next: Record<string, string> = {}
  for (const s of roster?.roster ?? []) {
    const existing = roster?.marks.find((m) => m.studentId === s.id)
    next[s.id] = existing?.status ?? 'present'
  }
  return next
}
