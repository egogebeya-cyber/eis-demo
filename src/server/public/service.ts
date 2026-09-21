import { desc, eq, like, or } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from '~/server/db'
import {
  announcements,
  applications,
  contactMessages,
  downloads,
  events,
  galleryItems,
  jobs,
  newsPosts,
  settings,
  staffProfiles,
  users,
} from '~/server/db/schema'

export async function getSettings() {
  const [row] = await db.select().from(settings).limit(1)
  const [banner] = await db
    .select({
      titleEn: announcements.titleEn,
      titleAm: announcements.titleAm,
      titleOm: announcements.titleOm,
      bodyEn: announcements.bodyEn,
      bodyAm: announcements.bodyAm,
      bodyOm: announcements.bodyOm,
    })
    .from(announcements)
    .where(eq(announcements.audience, 'site'))
    .orderBy(desc(announcements.publishedAt))
    .limit(1)
  return { ...row, banner: banner ?? null }
}

export async function listNews(limit = 12) {
  return db.select().from(newsPosts).orderBy(desc(newsPosts.publishedAt)).limit(limit)
}

export async function getNewsBySlug(slug: string) {
  const [row] = await db.select().from(newsPosts).where(eq(newsPosts.slug, slug)).limit(1)
  return row ?? null
}

export async function listEvents() {
  return db.select().from(events).orderBy(events.startAt)
}

export async function listGallery() {
  return db.select().from(galleryItems)
}

export async function listStaff() {
  return db
    .select({
      id: staffProfiles.id,
      fullName: users.fullName,
      titleEn: staffProfiles.titleEn,
      titleAm: staffProfiles.titleAm,
      titleOm: staffProfiles.titleOm,
      department: staffProfiles.department,
      bioEn: staffProfiles.bioEn,
      bioAm: staffProfiles.bioAm,
      bioOm: staffProfiles.bioOm,
      featured: staffProfiles.featured,
    })
    .from(staffProfiles)
    .innerJoin(users, eq(users.id, staffProfiles.userId))
}

export async function listDownloads() {
  return db.select().from(downloads)
}

export async function listJobs() {
  return db.select().from(jobs)
}

export async function submitApplication(data: {
  childName: string
  parentName: string
  email: string
  phone: string
  gradeApplying: string
  notes?: string
}) {
  await db.insert(applications).values({
    id: nanoid(),
    childName: data.childName.trim(),
    parentName: data.parentName.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    gradeApplying: data.gradeApplying,
    notes: data.notes?.trim() || null,
    status: 'pending',
    createdAt: new Date(),
  })
  return { ok: true as const }
}

export async function submitContact(data: { name: string; email: string; phone?: string; message: string }) {
  await db.insert(contactMessages).values({
    id: nanoid(),
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone?.trim() || null,
    message: data.message.trim(),
    createdAt: new Date(),
  })
  return { ok: true as const }
}

export async function searchSite(query: string) {
  const q = query.trim()
  if (q.length < 2) return { news: [], events: [], staff: [] as Awaited<ReturnType<typeof listStaff>> }
  const pattern = `%${q}%`
  const [news, ev, staff] = await Promise.all([
    db
      .select()
      .from(newsPosts)
      .where(
        or(
          like(newsPosts.titleEn, pattern),
          like(newsPosts.titleAm, pattern),
          like(newsPosts.excerptEn, pattern),
          like(newsPosts.bodyEn, pattern),
        ),
      )
      .limit(8),
    db
      .select()
      .from(events)
      .where(or(like(events.titleEn, pattern), like(events.descriptionEn, pattern), like(events.locationEn, pattern)))
      .limit(8),
    db
      .select({
        id: staffProfiles.id,
        fullName: users.fullName,
        titleEn: staffProfiles.titleEn,
        titleAm: staffProfiles.titleAm,
        titleOm: staffProfiles.titleOm,
        department: staffProfiles.department,
        bioEn: staffProfiles.bioEn,
        bioAm: staffProfiles.bioAm,
        bioOm: staffProfiles.bioOm,
        featured: staffProfiles.featured,
      })
      .from(staffProfiles)
      .innerJoin(users, eq(users.id, staffProfiles.userId))
      .where(
        or(
          like(users.fullName, pattern),
          like(staffProfiles.titleEn, pattern),
          like(staffProfiles.department, pattern),
        ),
      )
      .limit(8),
  ])
  return { news, events: ev, staff }
}

export async function homePayload() {
  const [site, gallery, news] = await Promise.all([getSettings(), listGallery(), listNews(4)])
  return { site, gallery, news }
}
