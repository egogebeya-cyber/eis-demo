import { count, desc, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { addisToday, currentReportTerm } from '~/lib/utils'
import { db } from '../db'
import {
  announcements,
  applications,
  behaviourIncidents,
  contactMessages,
  events,
  feeInvoices,
  feePayments,
  newsPosts,
  settings,
  students,
  users,
} from '../db/schema'

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || nanoid(8)
}

export async function adminStats() {
  const [stu, pendingApps, unpaid, news, contacts] = await Promise.all([
    db.select({ n: count() }).from(students),
    db.select({ n: count() }).from(applications).where(eq(applications.status, 'pending')),
    db.select({ n: count() }).from(feeInvoices).where(eq(feeInvoices.status, 'unpaid')),
    db.select({ n: count() }).from(newsPosts),
    db.select({ n: count() }).from(contactMessages),
  ])
  return {
    students: stu[0]?.n ?? 0,
    pendingApplications: pendingApps[0]?.n ?? 0,
    unpaidInvoices: unpaid[0]?.n ?? 0,
    news: news[0]?.n ?? 0,
    contacts: contacts[0]?.n ?? 0,
    today: addisToday(),
  }
}

export async function listApplications() {
  return db.select().from(applications).orderBy(desc(applications.createdAt))
}

export async function setApplicationStatus(id: string, status: string) {
  await db.update(applications).set({ status }).where(eq(applications.id, id))
  return { ok: true as const }
}

export async function listAdminNews() {
  return db.select().from(newsPosts).orderBy(desc(newsPosts.publishedAt))
}

export async function createNews(data: { title: string; excerpt: string; body: string }) {
  const title = data.title.trim()
  await db.insert(newsPosts).values({
    id: nanoid(),
    slug: `${slugify(title)}-${nanoid(4)}`,
    titleEn: title,
    titleAm: title,
    titleOm: title,
    excerptEn: data.excerpt.trim(),
    excerptAm: data.excerpt.trim(),
    excerptOm: data.excerpt.trim(),
    bodyEn: data.body.trim(),
    bodyAm: data.body.trim(),
    bodyOm: data.body.trim(),
    publishedAt: addisToday(),
    imageUrl: null,
  })
  return { ok: true as const }
}

export async function deleteNews(id: string) {
  await db.delete(newsPosts).where(eq(newsPosts.id, id))
  return { ok: true as const }
}

export async function listAdminEvents() {
  return db.select().from(events).orderBy(events.startAt)
}

export async function createEvent(data: { title: string; description: string; startAt: string; location: string }) {
  const title = data.title.trim()
  await db.insert(events).values({
    id: nanoid(),
    titleEn: title,
    titleAm: title,
    titleOm: title,
    descriptionEn: data.description.trim(),
    descriptionAm: data.description.trim(),
    descriptionOm: data.description.trim(),
    startAt: data.startAt,
    endAt: null,
    locationEn: data.location.trim(),
    locationAm: data.location.trim(),
    locationOm: data.location.trim(),
  })
  return { ok: true as const }
}

export async function deleteEvent(id: string) {
  await db.delete(events).where(eq(events.id, id))
  return { ok: true as const }
}

export async function listAdminAnnouncements() {
  return db.select().from(announcements).orderBy(desc(announcements.publishedAt))
}

export async function createAnnouncement(data: { title: string; body: string; audience: string }) {
  const title = data.title.trim()
  await db.insert(announcements).values({
    id: nanoid(),
    titleEn: title,
    titleAm: title,
    titleOm: title,
    bodyEn: data.body.trim(),
    bodyAm: data.body.trim(),
    bodyOm: data.body.trim(),
    audience: data.audience,
    publishedAt: addisToday(),
    createdBy: null,
  })
  return { ok: true as const }
}

export async function deleteAnnouncement(id: string) {
  await db.delete(announcements).where(eq(announcements.id, id))
  return { ok: true as const }
}

export async function listAdminUsers() {
  return db
    .select({ id: users.id, email: users.email, fullName: users.fullName, role: users.role, phone: users.phone })
    .from(users)
}

export async function listAdminStudents() {
  return db.select().from(students)
}

export async function listAdminFees() {
  const invoices = await db
    .select({
      id: feeInvoices.id,
      title: feeInvoices.title,
      amountEtb: feeInvoices.amountEtb,
      dueDate: feeInvoices.dueDate,
      status: feeInvoices.status,
      firstName: students.firstName,
      lastName: students.lastName,
    })
    .from(feeInvoices)
    .innerJoin(students, eq(students.id, feeInvoices.studentId))
  const payments = await db
    .select({
      id: feePayments.id,
      studentId: feePayments.studentId,
      invoiceId: feePayments.invoiceId,
      kind: feePayments.kind,
      method: feePayments.method,
      amountEtb: feePayments.amountEtb,
      receiptNumber: feePayments.receiptNumber,
      proofNote: feePayments.proofNote,
      proofName: feePayments.proofName,
      proofData: feePayments.proofData,
      status: feePayments.status,
      createdAt: feePayments.createdAt,
      firstName: students.firstName,
      lastName: students.lastName,
    })
    .from(feePayments)
    .innerJoin(students, eq(students.id, feePayments.studentId))
    .orderBy(desc(feePayments.createdAt))
  return { invoices, payments }
}

export async function markFeePaid(id: string) {
  await db.update(feeInvoices).set({ status: 'paid' }).where(eq(feeInvoices.id, id))
  return { ok: true as const }
}

export async function reviewFeePayment(id: string, status: 'confirmed' | 'rejected') {
  const [row] = await db.select().from(feePayments).where(eq(feePayments.id, id)).limit(1)
  if (!row) throw new Error('NOT_FOUND')
  await db.update(feePayments).set({ status }).where(eq(feePayments.id, id))
  if (status === 'confirmed' && row.invoiceId) {
    await db.update(feeInvoices).set({ status: 'paid' }).where(eq(feeInvoices.id, row.invoiceId))
  }
  return { ok: true as const }
}

export async function listContacts() {
  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt))
}

export async function updateAlert(data: { alertEnabled: boolean; alertEn: string }) {
  await db
    .update(settings)
    .set({
      alertEnabled: data.alertEnabled,
      alertEn: data.alertEn,
      alertAm: data.alertEn,
      alertOm: data.alertEn,
    })
    .where(eq(settings.id, 'school'))
  return { ok: true as const }
}

export async function listAdminBehaviour() {
  const term = currentReportTerm()
  const rows = await db
    .select({
      id: behaviourIncidents.id,
      kind: behaviourIncidents.kind,
      category: behaviourIncidents.category,
      points: behaviourIncidents.points,
      note: behaviourIncidents.note,
      status: behaviourIncidents.status,
      createdAt: behaviourIncidents.createdAt,
      firstName: students.firstName,
      lastName: students.lastName,
      teacherName: users.fullName,
      term: behaviourIncidents.term,
    })
    .from(behaviourIncidents)
    .innerJoin(students, eq(students.id, behaviourIncidents.studentId))
    .innerJoin(users, eq(users.id, behaviourIncidents.teacherUserId))
    .where(eq(behaviourIncidents.term, term))
    .orderBy(desc(behaviourIncidents.createdAt))
  return { term, rows }
}

export async function reverseBehaviour(id: string) {
  await db.update(behaviourIncidents).set({ status: 'reversed' }).where(eq(behaviourIncidents.id, id))
  return { ok: true as const }
}
