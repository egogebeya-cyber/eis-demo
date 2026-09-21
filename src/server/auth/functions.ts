import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import {
  createSession,
  destroySession,
  getSessionUser,
  homeForRole,
  loginUser,
  type PublicUser,
} from './service'

function bindSetCookie() {
  return (name: string, value: string, options: Parameters<typeof setCookie>[2]) => {
    setCookie(name, value, options)
  }
}

export const getCurrentUser = createServerFn({ method: 'GET' }).handler(
  async (): Promise<PublicUser | null> => {
    return getSessionUser((name) => getCookie(name))
  },
)

export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { email: string; password: string; role?: 'student' | 'parent' | 'teacher' }) => data)
  .handler(async ({ data }) => {
    const result = await loginUser(data.email, data.password)
    if (!result.ok) return result
    const role = result.user.role
    if (data.role && role !== data.role && !(data.role === 'teacher' && role === 'admin')) {
      return { ok: false as const, error: 'WRONG_PORTAL' as const }
    }
    await createSession(result.user.id, bindSetCookie())
    return { ...result, redirectTo: homeForRole(role) }
  })

export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  await destroySession((name) => getCookie(name), bindSetCookie())
  return { ok: true }
})
