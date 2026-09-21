import { and, eq, gt } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from '../db'
import { sessions, users } from '../db/schema'
import { hashToken, verifyPassword } from './crypto'
import { homeForRole } from '~/lib/roles'

export { homeForRole }

export const SESSION_COOKIE = 'horizon_session'
const SESSION_DAYS = 14

export type PublicUser = {
  id: string
  email: string
  fullName: string
  role: string
}

type CookieSetter = (
  name: string,
  value: string,
  options: {
    httpOnly?: boolean
    sameSite?: 'lax' | 'strict' | 'none'
    path?: string
    maxAge?: number
    secure?: boolean
  },
) => void

type CookieGetter = (name: string) => string | undefined

function toPublicUser(user: typeof users.$inferSelect): PublicUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  }
}

export async function createSession(userId: string, setCookie: CookieSetter) {
  const token = nanoid(48)
  await db.insert(sessions).values({
    id: nanoid(),
    userId,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000),
  })
  setCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    secure: process.env.NODE_ENV === 'production',
  })
}

export async function destroySession(getCookie: CookieGetter, setCookie: CookieSetter) {
  const token = getCookie(SESSION_COOKIE)
  if (token) {
    await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)))
  }
  setCookie(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
}

export async function getSessionUser(getCookie: CookieGetter): Promise<PublicUser | null> {
  const token = getCookie(SESSION_COOKIE)
  if (!token) return null
  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1)
  if (!session) return null
  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1)
  return user ? toPublicUser(user) : null
}

export async function loginUser(email: string, password: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase())).limit(1)
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { ok: false as const, error: 'INVALID_CREDENTIALS' }
  }
  return { ok: true as const, user: toPublicUser(user) }
}
