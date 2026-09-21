import { Link, createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { BookOpen, GraduationCap, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import '~/components/gs-public.css'
import { ThemeToggle } from '~/components/theme-toggle'
import { getCurrentUser, loginFn } from '~/server/auth/functions'

const ROLES = [
  {
    id: 'student' as const,
    label: 'Student',
    hint: 'Timetable, assignments, and grades',
    email: 'student@eis.school',
    password: 'student123',
    icon: BookOpen,
  },
  {
    id: 'parent' as const,
    label: 'Parent',
    hint: 'Children, fees, absence, and messages',
    email: 'parent@eis.school',
    password: 'parent123',
    icon: Users,
  },
  {
    id: 'teacher' as const,
    label: 'Teacher',
    hint: 'Attendance, gradebook, and homeroom',
    email: 'teacher@eis.school',
    password: 'teacher123',
    icon: GraduationCap,
  },
]

type PortalRole = (typeof ROLES)[number]['id']

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): { role?: PortalRole } => {
    if (search.role === 'student' || search.role === 'parent' || search.role === 'teacher') {
      return { role: search.role }
    }
    return {}
  },
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (user) throw redirect({ to: user.role === 'admin' ? '/admin' : '/portal' })
  },
  component: LoginPage,
})

function LoginPage() {
  const { role: roleSearch } = Route.useSearch()
  const router = useRouter()
  const [role, setRole] = useState<PortalRole | null>(roleSearch ?? null)
  const selected = useMemo(() => ROLES.find((item) => item.id === role) ?? null, [role])
  const [email, setEmail] = useState(selected?.email ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function pickRole(next: PortalRole) {
    const match = ROLES.find((item) => item.id === next)
    setRole(next)
    setEmail(match?.email ?? '')
    setPassword('')
    setError('')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    setError('')
    setLoading(true)
    try {
      const result = await loginFn({ data: { email, password, role: selected.id } })
      if (!result.ok) {
        setError(result.error === 'WRONG_PORTAL' ? `Use the ${selected.label.toLowerCase()} account for this portal.` : 'Wrong email or password.')
        return
      }
      await router.invalidate()
      await router.navigate({ to: result.redirectTo as '/admin' | '/portal' })
    } catch {
      setError('Wrong email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="gs-public gs-login">
      <div className="gs-login-bar">
        <Link to="/" className="gs-login-wordmark">
          Ethiopia International
        </Link>
        <ThemeToggle className="gs-theme-btn" />
      </div>

      <div className="gs-login-card">
        {!selected ? (
          <>
            <p className="gs-login-kicker">Portal</p>
            <h1>Student, parent, and teacher login</h1>
            <p className="gs-login-lead">Choose your desk. Each role opens a different courtyard.</p>
            <div className="gs-login-roles">
              {ROLES.map((item) => (
                <button key={item.id} type="button" className="gs-login-role" onClick={() => pickRole(item.id)}>
                  <item.icon className="h-5 w-5" />
                  <span>
                    <strong>{item.label}</strong>
                    <em>{item.hint}</em>
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <form onSubmit={(e) => void submit(e)}>
            <button type="button" className="gs-login-back" onClick={() => setRole(null)}>
              ← All portals
            </button>
            <p className="gs-login-kicker">{selected.label} portal</p>
            <h1>Sign in</h1>
            <p className="gs-login-lead">{selected.hint}</p>
            <label>
              Email
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>
            {error ? <p className="gs-login-error">{error}</p> : null}
            <button type="submit" className="gs-login-submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            <p className="gs-login-demo">
              Demo: {selected.email} / {selected.password}
              {selected.id === 'teacher' ? ' · Admin uses admin@eis.school / admin123' : null}
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
