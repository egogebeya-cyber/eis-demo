import { Link, Outlet, createFileRoute, redirect, useRouter, useRouterState } from '@tanstack/react-router'
import { GraduationCap, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ThemeToggle } from '~/components/theme-toggle'
import { getCurrentUser, logoutFn } from '~/server/auth/functions'

const NAV = [
  { to: '/admin', label: 'Dashboard', exact: true },
  { to: '/admin/news', label: 'News' },
  { to: '/admin/events', label: 'Events' },
  { to: '/admin/announcements', label: 'Announcements' },
  { to: '/admin/applications', label: 'Admissions' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/students', label: 'Students' },
  { to: '/admin/fees', label: 'Fees' },
  { to: '/admin/behaviour', label: 'Behaviour' },
  { to: '/admin/contacts', label: 'Inbox' },
  { to: '/admin/settings', label: 'Alert banner' },
] as const

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') throw redirect({ to: '/login', search: {} })
    return { admin: user }
  },
  component: AdminLayout,
})

function AdminLayout() {
  const { admin } = Route.useRouteContext()
  const router = useRouter()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const logout = async () => {
    await logoutFn()
    await router.invalidate()
    await router.navigate({ to: '/login', search: {} })
  }

  return (
    <div className="flex min-h-dvh bg-background">
      {open ? (
        <button type="button" className="fixed inset-0 z-40 bg-black/40 md:hidden" aria-label="Close menu" onClick={() => setOpen(false)} />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-school-dark p-4 text-white transition-transform md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <Link to="/admin" className="flex items-center gap-2 font-display text-lg font-semibold italic">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-school-dark">
            <GraduationCap className="h-4 w-4" />
          </span>
          EIS staff
        </Link>
        <p className="mt-2 truncate text-xs text-white/60">{admin.email}</p>
        <nav className="mt-6 flex flex-1 flex-col gap-1 overflow-y-auto">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={'exact' in item && item.exact ? { exact: true } : undefined}
              className="rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white [&.active]:bg-white [&.active]:font-semibold [&.active]:text-school-dark"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="space-y-1 border-t border-white/10 pt-4">
          <div className="mb-2">
            <ThemeToggle />
          </div>
          <Link to="/" className="block rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10">
            View site
          </Link>
          <button type="button" onClick={() => void logout()} className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/70 hover:bg-white/10">
            Log out
          </button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-school/10 bg-surface px-3 py-2.5 md:hidden">
          <button type="button" className="rounded-lg p-2" aria-label="Open menu" onClick={() => setOpen(true)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <p className="font-display font-semibold italic">EIS admin</p>
        </div>
        <div className="flex gap-2 overflow-x-auto border-b border-school/10 bg-surface px-3 py-2 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={'exact' in item && item.exact ? { exact: true } : undefined}
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
