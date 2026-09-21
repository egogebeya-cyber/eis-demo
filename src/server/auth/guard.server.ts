import { getCookie } from '@tanstack/react-start/server'
import { getSessionUser, type PublicUser } from './service'

export async function requireUser(): Promise<PublicUser> {
  const user = await getSessionUser((name) => getCookie(name))
  if (!user) throw new Error('UNAUTHENTICATED')
  return user
}

export async function requireAdmin() {
  const user = await requireUser()
  if (user.role !== 'admin') throw new Error('FORBIDDEN')
  return user
}

export async function requireStaff() {
  const user = await requireUser()
  if (user.role !== 'admin' && user.role !== 'teacher') throw new Error('FORBIDDEN')
  return user
}
