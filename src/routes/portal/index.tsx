import { Link, createFileRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileText,
  GraduationCap,
  MessageSquare,
  Users,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLocale } from '~/components/locale-context'
import { dateTimeLocale, formatDate, formatEtb } from '~/lib/utils'
import { portalDashboardFn } from '~/server/portal/functions'

export const Route = createFileRoute('/portal/')({
  loader: async () => portalDashboardFn(),
  component: PortalHome,
})

function when(value: Date | string | number | null | undefined, locale: string) {
  if (value == null) return ''
  if (value instanceof Date) return formatDate(value.toISOString(), locale)
  if (typeof value === 'number') {
    const ms = value < 10_000_000_000 ? value * 1000 : value
    return formatDate(new Date(ms).toISOString(), locale)
  }
  return formatDate(String(value), locale)
}

function PortalHome() {
  const { t, locale } = useLocale()
  const data = Route.useLoaderData()
  const unpaidTotal = data.unpaid.reduce((sum, row) => sum + row.amountEtb, 0)
  const isTeacher = data.user.role === 'teacher'
  const isParent = data.user.role === 'parent'
  const canMessage = isTeacher || isParent
  const assignments = [...new Map(data.assignments.map((row) => [row.id, row])).values()].slice(0, 5)
  const today = new Intl.DateTimeFormat(dateTimeLocale(locale), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Africa/Addis_Ababa',
  }).format(new Date())
  const classCount = data.homeroom.classes.length
  const subjectCount = data.homeroom.subjects.filter((subject) => !subject.isHomeroom).length
  const familyHint = data.kids.map((k) => `${k.firstName} ${k.lastName} · ${k.className}`).join(' · ')
  const homeroomHint = data.homeroom.classes
    .map((room) => `${room.className} · ${new Set(room.families.map((f) => f.studentId)).size} ${t('children').toLowerCase()}`)
    .join(' · ')
  const subjectHint = data.homeroom.subjects.map((s) => `${s.subjectName} · ${s.className}`).join(' · ')

  const shortcuts: Array<{ to: string; label: string; hint: string; icon: LucideIcon }> = isTeacher
    ? [
        ...(classCount || subjectCount
          ? [{ to: '/portal/attendance', label: t('portalAttendance'), hint: 'Mark who is in class', icon: ClipboardCheck }]
          : []),
        ...(data.homeroom.subjects.length ? [{ to: '/portal/gradebook', label: t('portalGradebook'), hint: 'Scores for your subjects', icon: BookOpen }] : []),
        { to: '/portal/messages', label: t('portalMessages'), hint: 'Parents and families', icon: MessageSquare },
        { to: '/portal/assignments', label: t('portalAssignments'), hint: 'Work you have set', icon: FileText },
        { to: '/portal/calendar', label: t('portalCalendar'), hint: 'School week ahead', icon: CalendarDays },
      ]
    : [
        { to: '/portal/grades', label: t('portalGrades'), hint: 'Term scores', icon: GraduationCap },
        { to: '/portal/attendance', label: t('portalAttendance'), hint: 'Days in school', icon: ClipboardCheck },
        { to: '/portal/assignments', label: t('portalAssignments'), hint: 'Homework and deadlines', icon: FileText },
        { to: '/portal/timetable', label: t('portalTimetable'), hint: 'This week’s lessons', icon: CalendarDays },
        ...(isParent ? [{ to: '/portal/messages', label: t('portalMessages'), hint: 'Teachers and school', icon: MessageSquare }] : []),
        ...(isParent ? [{ to: '/portal/fees', label: t('portalFees'), hint: unpaidTotal ? formatEtb(unpaidTotal) : t('paid'), icon: Wallet }] : []),
      ]

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-school px-3.5 py-3.5 text-white sm:rounded-3xl sm:px-6 sm:py-6 md:px-8 md:py-7">
        <h1 className="font-display text-xl font-medium italic tracking-tight sm:text-3xl md:text-4xl">
          {t('welcome')}, {data.user.fullName.split(' ')[0]}
        </h1>
        <p className="mt-2 text-sm text-white/70">{today}</p>
      </section>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
        <Stat
          label={isTeacher ? (classCount ? t('yourHomeroom') : t('yourSubjects')) : t('children')}
          value={String(isTeacher ? classCount || subjectCount : data.kids.length)}
          hint={(isTeacher ? homeroomHint || subjectHint : familyHint) || t('noItems')}
          icon={Users}
        />
        {isParent ? (
          <Stat label={t('unpaidFees')} value={formatEtb(unpaidTotal)} hint={t('portalFees')} icon={Wallet} to="/portal/fees" />
        ) : isTeacher ? (
          <Stat label={t('yourSubjects')} value={String(data.homeroom.subjects.length)} hint={subjectHint || t('noSubjectsToTeach')} icon={BookOpen} />
        ) : null}
        <Stat label={t('portalAssignments')} value={String(assignments.length)} hint={t('dueSoon')} icon={FileText} to="/portal/assignments" />
        {canMessage ? (
          <Stat label={t('portalMessages')} value={String(data.messages.length)} hint={t('latestInbox')} icon={MessageSquare} to="/portal/messages" />
        ) : (
          <Stat label={t('portalCalendar')} value={String(data.events.length)} hint={t('navEvents')} icon={CalendarDays} to="/portal/calendar" />
        )}
      </div>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{t('quickLinks')}</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-3">
          {shortcuts.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex items-start gap-3 rounded-2xl border border-school/10 bg-surface p-3 transition hover:border-accent hover:shadow-sm sm:p-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-school-light text-school">
                <item.icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-foreground">{item.label}</span>
                  <ArrowUpRight className="h-4 w-4 text-muted transition group-hover:text-accent" />
                </span>
                <span className="mt-0.5 block text-sm text-muted">{item.hint}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid items-start gap-4 xl:grid-cols-2">
        <Panel title={t('announcements')} to="/portal/calendar">
          {data.announcements.length === 0 ? (
            <p className="text-sm text-muted">{t('noItems')}</p>
          ) : (
            <ul className="divide-y divide-school/10">
              {data.announcements.slice(0, 4).map((item) => (
                <li key={item.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="font-medium text-foreground">{item.titleEn}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{item.bodyEn}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title={t('navEvents')} to="/portal/calendar">
          {data.events.length === 0 ? (
            <p className="text-sm text-muted">{t('noItems')}</p>
          ) : (
            <ul className="divide-y divide-school/10">
              {data.events.map((event) => (
                <li key={event.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-medium text-foreground">{event.titleEn}</p>
                    <p className="text-sm text-muted">{event.locationEn}</p>
                  </div>
                  <p className="shrink-0 text-xs font-semibold uppercase tracking-wide text-accent">{when(event.startAt, locale)}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {isTeacher && data.homeroom.classes.length > 0 ? (
        <section>
          <h2 className="font-display text-2xl font-medium italic text-foreground">{t('homeroomParents')}</h2>
          <p className="mt-1 text-sm text-muted">{t('teacherHomeroomHint')}</p>
          <div className="mt-4 space-y-4">
            {data.homeroom.classes.map((room) => (
              <article key={room.classId} className="overflow-hidden rounded-2xl border border-school/10 bg-surface">
                <div className="flex items-center justify-between gap-3 border-b border-school/10 px-5 py-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">{t('yourHomeroom')}</p>
                    <h3 className="font-display text-xl font-medium text-foreground">{room.className}</h3>
                  </div>
                  <p className="text-sm text-muted">{new Set(room.families.map((f) => f.studentId)).size} {t('children').toLowerCase()}</p>
                </div>
                <ul>
                  {room.families.map((family) => (
                    <li key={`${family.studentId}-${family.parentId || 'none'}`} className="flex flex-wrap items-center justify-between gap-2 border-b border-school/5 px-5 py-3 last:border-0">
                      <div>
                        <p className="font-medium text-foreground">
                          {family.firstName} {family.lastName}
                        </p>
                        <p className="text-sm text-muted">
                          {family.parentName ? `${family.parentName}${family.relationship ? ` · ${family.relationship}` : ''}` : t('noParentOnFile')}
                        </p>
                      </div>
                      {family.parentId ? (
                        <Link
                          to="/portal/messages"
                          search={{ to: family.parentId, studentId: family.studentId }}
                          className="rounded-full border border-school px-3 py-1.5 text-xs font-semibold text-school"
                        >
                          {t('messageParent')}
                        </Link>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {isTeacher && data.homeroom.subjects.filter((subject) => !subject.isHomeroom).length > 0 ? (
        <section>
          <h2 className="font-display text-2xl font-medium italic text-foreground">{t('yourSubjects')}</h2>
          <p className="mt-1 text-sm text-muted">{t('teacherSubjectHint')}</p>
          <div className="mt-4 space-y-4">
            {data.homeroom.subjects
              .filter((subject) => !subject.isHomeroom)
              .map((subject) => (
                <article key={subject.subjectId} className="overflow-hidden rounded-2xl border border-school/10 bg-surface">
                  <div className="flex items-center justify-between gap-3 border-b border-school/10 px-5 py-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">{t('subjectTeacher')}</p>
                      <h3 className="font-display text-xl font-medium text-foreground">
                        {subject.subjectName} · {subject.className}
                      </h3>
                    </div>
                    <p className="text-sm text-muted">{new Set(subject.families.map((f) => f.studentId)).size} {t('children').toLowerCase()}</p>
                  </div>
                  <ul>
                    {subject.families.map((family) => (
                      <li key={`${subject.subjectId}-${family.studentId}-${family.parentId || 'none'}`} className="flex flex-wrap items-center justify-between gap-2 border-b border-school/5 px-5 py-3 last:border-0">
                        <div>
                          <p className="font-medium text-foreground">
                            {family.firstName} {family.lastName}
                          </p>
                          <p className="text-sm text-muted">
                            {family.parentName ? `${family.parentName}${family.relationship ? ` · ${family.relationship}` : ''}` : t('noParentOnFile')}
                          </p>
                        </div>
                        {family.parentId ? (
                          <Link
                            to="/portal/messages"
                            search={{ to: family.parentId, studentId: family.studentId }}
                            className="rounded-full border border-school px-3 py-1.5 text-xs font-semibold text-school"
                          >
                            {t('messageParent')}
                          </Link>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function Stat({
  label,
  value,
  hint,
  icon: Icon,
  to,
}: {
  label: string
  value: string
  hint?: string
  icon: LucideIcon
  to?: string
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{label}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-school-light text-school">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-1.5 text-xl font-bold tracking-tight text-foreground sm:mt-3 sm:text-3xl">{value}</p>
      {hint ? <p className="mt-1 line-clamp-2 text-sm text-muted">{hint}</p> : null}
    </>
  )
  const className = 'rounded-2xl border border-school/10 bg-surface p-3 text-left sm:p-5'
  if (to) {
    return (
      <Link to={to} className={`${className} transition hover:border-accent`}>
        {body}
      </Link>
    )
  }
  return <div className={className}>{body}</div>
}

function Panel({ title, to, children }: { title: string; to: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-school/10 bg-surface p-3 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{title}</h2>
        <Link to={to} className="text-xs font-semibold text-school">
          Open
        </Link>
      </div>
      {children}
    </section>
  )
}
