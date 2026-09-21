import { Link, Outlet, createFileRoute, redirect, useRouter, useRouterState } from '@tanstack/react-router'
import {
  Bell,
  Award,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Menu,
  MessageSquare,
  UserMinus,
  Wallet,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ThemeToggle } from '~/components/theme-toggle'
import { useLocale } from '~/components/locale-context'
import { getCurrentUser, logoutFn } from '~/server/auth/functions'
import { teacherDeskFn } from '~/server/portal/functions'

export const Route = createFileRoute('/portal')({
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (!user) throw redirect({ to: '/login', search: {} })
    if (user.role === 'admin') throw redirect({ to: '/admin' })
    return { user }
  },
  loader: async ({ context }) => {
    if (context.user.role !== 'teacher') return { desk: null }
    return { desk: await teacherDeskFn() }
  },
  component: PortalLayout,
})

function PortalLayout() {
  const { user } = Route.useRouteContext()
  const { desk } = Route.useLoaderData()
  const { t } = useLocale()
  const router = useRouter()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const nav: Array<{ to: string; label: string; exact?: boolean; icon: LucideIcon }> = [
    { to: '/portal', label: t('portalHome'), exact: true, icon: LayoutDashboard },
    { to: '/portal/notifications', label: t('portalNotifications'), icon: Bell },
    { to: '/portal/grades', label: t('portalGrades'), icon: GraduationCap },
    { to: '/portal/attendance', label: t('portalAttendance'), icon: ClipboardCheck },
    { to: '/portal/behaviour', label: t('portalBehaviour'), icon: Award },
    { to: '/portal/assignments', label: t('portalAssignments'), icon: FileText },
    { to: '/portal/timetable', label: t('portalTimetable'), icon: CalendarDays },
    ...(user.role === 'parent' || user.role === 'teacher'
      ? [{ to: '/portal/messages', label: t('portalMessages'), icon: MessageSquare }]
      : []),
    { to: '/portal/calendar', label: t('portalCalendar'), icon: CalendarDays },
    ...(user.role === 'parent' ? [{ to: '/portal/fees', label: t('portalFees'), icon: Wallet }] : []),
    ...(user.role === 'parent' ? [{ to: '/portal/absence', label: t('portalAbsence'), icon: UserMinus }] : []),
    ...(user.role === 'teacher' && desk?.subjectClasses.length
      ? [{ to: '/portal/gradebook', label: t('portalGradebook'), icon: BookOpen }]
      : []),
  ]

  const current =
    [...nav].reverse().find((item) => (item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`))) ??
    nav[0]

  const logout = async () => {
    await logoutFn()
    await router.invalidate()
    await router.navigate({ to: '/login', search: {} })
  }

  const roleLine =
    user.role === 'teacher' && desk
      ? [
          desk.homeroomClasses.length
            ? `${t('homeroomLabel')}: ${desk.homeroomClasses.map((c) => c.name).join(', ')}`
            : t('subjectTeacher'),
          [...new Set(desk.subjectClasses.flatMap((c) => c.subjects.map((s) => s.name)))].join(', '),
        ]
          .filter(Boolean)
          .join(' · ')
      : user.role === 'parent'
        ? 'Parent portal'
        : 'Student portal'

  const roleTitle = user.role === 'teacher' ? 'Teacher portal' : user.role === 'parent' ? 'Parent portal' : 'Student portal'
  const initials = user.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return (
    <div className="flex min-h-dvh bg-background">
      {open ? (
        <button type="button" className="fixed inset-0 z-40 bg-black/40 md:hidden" aria-label="Close menu" onClick={() => setOpen(false)} />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-school p-4 text-white transition-transform md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <Link to="/portal" className="flex items-center gap-2 font-display text-lg font-semibold italic tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-school-dark">
            <GraduationCap className="h-4 w-4" />
          </span>
          {roleTitle}
        </Link>
        <p className="mt-3 truncate text-sm font-medium text-white">{user.fullName}</p>
        <p className="mt-1 text-[11px] leading-snug text-white/50">{roleLine}</p>
        <nav className="mt-6 flex flex-1 flex-col gap-0.5">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={item.exact ? { exact: true } : undefined}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-white [&.active]:bg-white [&.active]:font-semibold [&.active]:text-school"
            >
              <item.icon className="h-4 w-4 shrink-0 opacity-80" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="space-y-1 border-t border-white/10 pt-4">
          <div className="mb-2">
            <ThemeToggle />
          </div>
          <Link to="/" className="block rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10">
            {t('viewSite')}
          </Link>
          <button type="button" onClick={() => void logout()} className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/70 hover:bg-white/10">
            {t('logout')}
          </button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-school/10 bg-surface px-3 py-2.5 md:px-8 md:py-3">
          <button type="button" className="rounded-lg p-2 md:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">{roleTitle}</p>
            <p className="truncate font-display text-base font-semibold italic leading-tight sm:text-lg">{current.label}</p>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <p className="text-right text-sm text-muted">{user.fullName}</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-school text-xs font-semibold text-white">{initials}</span>
          </div>
        </div>
        <div className="-mx-0 flex gap-2 overflow-x-auto border-b border-school/10 bg-surface px-3 py-2 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={item.exact ? { exact: true } : undefined}
              className="shrink-0 rounded-full border border-school/15 px-3 py-1.5 text-xs font-semibold text-muted [&.active]:border-transparent [&.active]:bg-school [&.active]:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <main className="min-w-0 flex-1 overflow-x-hidden p-3 sm:p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
