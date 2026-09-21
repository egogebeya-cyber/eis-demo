import { and, desc, eq, gte, inArray, lte, or } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'
import { addisToday, isReportTerm, FEE_KINDS, SCHOOL_PAYMENTS, behaviourPreset, clampBehaviourScore, currentReportTerm, type BehaviourKind } from '~/lib/utils'
import { db } from '../db'
import {
  absenceRequests,
  announcements,
  assignments,
  attendance,
  behaviourIncidents,
  classes,
  events,
  feeInvoices,
  feePayments,
  gradeRecords,
  guardians,
  messages,
  students,
  subjects,
  timetableSlots,
  users,
} from '../db/schema'
import type { PublicUser } from '../auth/service'

async function parentStudentIds(userId: string) {
  const rows = await db.select({ studentId: guardians.studentId }).from(guardians).where(eq(guardians.userId, userId))
  return rows.map((r) => r.studentId)
}

async function studentForUser(userId: string) {
  const [row] = await db.select().from(students).where(eq(students.userId, userId)).limit(1)
  return row ?? null
}

async function teacherAccessibleClassIds(userId: string) {
  const rooms = await db.select({ id: classes.id }).from(classes).where(eq(classes.teacherId, userId))
  const taught = await db.select({ classId: subjects.classId }).from(subjects).where(eq(subjects.teacherId, userId))
  return [...new Set([...rooms.map((r) => r.id), ...taught.map((t) => t.classId)])]
}

function canUseMessages(user: PublicUser) {
  return user.role === 'parent' || user.role === 'teacher'
}

function assertCanUseMessages(user: PublicUser) {
  if (!canUseMessages(user)) throw new Error('FORBIDDEN')
}

async function subjectIdsTaughtBy(teacherId: string) {
  const rows = await db.select({ id: subjects.id }).from(subjects).where(eq(subjects.teacherId, teacherId))
  return rows.map((r) => r.id)
}

export type HomeroomFamily = {
  studentId: string
  firstName: string
  lastName: string
  parentId: string | null
  parentName: string | null
  relationship: string | null
}

async function familiesForClass(classId: string): Promise<HomeroomFamily[]> {
  const parentUsers = alias(users, 'parent_users')
  return db
    .select({
      studentId: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      parentId: parentUsers.id,
      parentName: parentUsers.fullName,
      relationship: guardians.relationship,
    })
    .from(students)
    .leftJoin(guardians, eq(guardians.studentId, students.id))
    .leftJoin(parentUsers, eq(parentUsers.id, guardians.userId))
    .where(eq(students.classId, classId))
}

export async function visibleStudentIds(user: PublicUser) {
  if (user.role === 'parent') return parentStudentIds(user.id)
  if (user.role === 'student') {
    const mine = await studentForUser(user.id)
    return mine ? [mine.id] : []
  }
  if (user.role === 'teacher') {
    const classIds = await teacherAccessibleClassIds(user.id)
    if (!classIds.length) return []
    const mine = await db.select({ id: students.id }).from(students).where(inArray(students.classId, classIds))
    return mine.map((r) => r.id)
  }
  const all = await db.select({ id: students.id }).from(students)
  return all.map((r) => r.id)
}

export async function listMyStudents(user: PublicUser) {
  const ids = await visibleStudentIds(user)
  if (!ids.length) return []
  return db
    .select({
      id: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      studentNumber: students.studentNumber,
      classId: students.classId,
      className: classes.name,
      gradeCode: students.gradeLevelId,
    })
    .from(students)
    .leftJoin(classes, eq(classes.id, students.classId))
    .where(inArray(students.id, ids))
}

export type SubjectTeacher = {
  subjectId: string
  subjectName: string
  teacherId: string | null
  teacherName: string | null
  teacherEmail: string | null
}

export type HomeroomChild = {
  studentId: string
  firstName: string
  lastName: string
  className: string | null
  classId: string | null
  teacherId: string | null
  teacherName: string | null
  teacherEmail: string | null
  subjectTeachers: SubjectTeacher[]
}

export type HomeroomClass = {
  classId: string
  className: string
  families: HomeroomFamily[]
}

export type SubjectClass = {
  subjectId: string
  subjectName: string
  classId: string
  className: string
  isHomeroom: boolean
  families: HomeroomFamily[]
}

export async function homeroomOverview(user: PublicUser) {
  const empty = { children: [] as HomeroomChild[], classes: [] as HomeroomClass[], subjects: [] as SubjectClass[] }

  if (user.role === 'parent' || user.role === 'student') {
    const ids = await visibleStudentIds(user)
    if (!ids.length) return empty
    const homeroomUsers = alias(users, 'homeroom_users')
    const rows = await db
      .select({
        studentId: students.id,
        firstName: students.firstName,
        lastName: students.lastName,
        className: classes.name,
        classId: classes.id,
        teacherId: homeroomUsers.id,
        teacherName: homeroomUsers.fullName,
        teacherEmail: homeroomUsers.email,
      })
      .from(students)
      .leftJoin(classes, eq(classes.id, students.classId))
      .leftJoin(homeroomUsers, eq(homeroomUsers.id, classes.teacherId))
      .where(inArray(students.id, ids))

    const subjectUsers = alias(users, 'subject_users')
    const taught = await db
      .select({
        studentId: students.id,
        subjectId: subjects.id,
        subjectName: subjects.nameEn,
        teacherId: subjectUsers.id,
        teacherName: subjectUsers.fullName,
        teacherEmail: subjectUsers.email,
      })
      .from(students)
      .innerJoin(subjects, eq(subjects.classId, students.classId))
      .leftJoin(subjectUsers, eq(subjectUsers.id, subjects.teacherId))
      .where(inArray(students.id, ids))

    const children: HomeroomChild[] = rows.map((row) => ({
      ...row,
      subjectTeachers: taught
        .filter((item) => item.studentId === row.studentId)
        .map((item) => ({
          subjectId: item.subjectId,
          subjectName: item.subjectName,
          teacherId: item.teacherId,
          teacherName: item.teacherName,
          teacherEmail: item.teacherEmail,
        })),
    }))
    return { children, classes: [] as HomeroomClass[], subjects: [] as SubjectClass[] }
  }

  if (user.role === 'teacher') {
    const rooms = await db.select().from(classes).where(eq(classes.teacherId, user.id))
    const classesOut: HomeroomClass[] = []
    for (const room of rooms) {
      classesOut.push({
        classId: room.id,
        className: room.name,
        families: await familiesForClass(room.id),
      })
    }

    const taught = await db
      .select({
        subjectId: subjects.id,
        subjectName: subjects.nameEn,
        classId: classes.id,
        className: classes.name,
        homeroomTeacherId: classes.teacherId,
      })
      .from(subjects)
      .innerJoin(classes, eq(classes.id, subjects.classId))
      .where(eq(subjects.teacherId, user.id))

    const subjectsOut: SubjectClass[] = []
    for (const row of taught) {
      const isHomeroom = row.homeroomTeacherId === user.id
      subjectsOut.push({
        subjectId: row.subjectId,
        subjectName: row.subjectName,
        classId: row.classId,
        className: row.className,
        isHomeroom,
        families: isHomeroom ? [] : await familiesForClass(row.classId),
      })
    }

    return { children: [] as HomeroomChild[], classes: classesOut, subjects: subjectsOut }
  }

  return empty
}

export async function portalDashboard(user: PublicUser) {
  const kids = await listMyStudents(user)
  const homeroom = await homeroomOverview(user)
  const ids = kids.map((k) => k.id)
  const assignmentQuery =
    user.role === 'teacher'
      ? db
          .select({
            id: assignments.id,
            title: assignments.title,
            dueDate: assignments.dueDate,
            classId: assignments.classId,
          })
          .from(assignments)
          .innerJoin(classes, eq(classes.id, assignments.classId))
          .innerJoin(subjects, eq(subjects.id, assignments.subjectId))
          .where(eq(subjects.teacherId, user.id))
      : ids.length
        ? db
            .select({
              id: assignments.id,
              title: assignments.title,
              dueDate: assignments.dueDate,
              classId: assignments.classId,
            })
            .from(assignments)
            .innerJoin(students, eq(students.classId, assignments.classId))
            .where(inArray(students.id, ids))
        : Promise.resolve([])
  const [anns, upcoming, unpaid, dueWork, inbox] = await Promise.all([
    db.select().from(announcements).orderBy(desc(announcements.publishedAt)).limit(5),
    db.select().from(events).orderBy(events.startAt).limit(4),
    ids.length && user.role === 'parent'
      ? db.select().from(feeInvoices).where(and(inArray(feeInvoices.studentId, ids), eq(feeInvoices.status, 'unpaid')))
      : Promise.resolve([]),
    assignmentQuery,
    canUseMessages(user)
      ? db.select().from(messages).where(eq(messages.toUserId, user.id)).orderBy(desc(messages.createdAt)).limit(5)
      : Promise.resolve([]),
  ])
  return { user, kids, homeroom, announcements: anns, events: upcoming, unpaid, assignments: dueWork, messages: inbox }
}

export async function studentGrades(user: PublicUser, studentId?: string) {
  const ids = await visibleStudentIds(user)
  const target = studentId && ids.includes(studentId) ? studentId : ids[0]
  if (!target) return { studentId: null as string | null, rows: [] as Array<typeof gradeRecords.$inferSelect & { subject: string; firstName: string; lastName: string }> }
  const rows = await db
    .select({
      id: gradeRecords.id,
      studentId: gradeRecords.studentId,
      subjectId: gradeRecords.subjectId,
      assignmentId: gradeRecords.assignmentId,
      term: gradeRecords.term,
      score: gradeRecords.score,
      maxScore: gradeRecords.maxScore,
      subject: subjects.nameEn,
      firstName: students.firstName,
      lastName: students.lastName,
    })
    .from(gradeRecords)
    .innerJoin(subjects, eq(subjects.id, gradeRecords.subjectId))
    .innerJoin(students, eq(students.id, gradeRecords.studentId))
    .where(eq(gradeRecords.studentId, target))
  if (user.role === 'teacher') {
    const allowed = new Set(await subjectIdsTaughtBy(user.id))
    return { studentId: target, rows: rows.filter((row) => allowed.has(row.subjectId)) }
  }
  return { studentId: target, rows }
}

export async function studentAttendance(user: PublicUser, studentId?: string) {
  const ids = await visibleStudentIds(user)
  const target = studentId && ids.includes(studentId) ? studentId : ids[0]
  if (!target) {
    return {
      studentId: null as string | null,
      rows: [] as Array<typeof attendance.$inferSelect>,
      subjects: [] as Array<{ id: string; name: string; days: number[] }>,
    }
  }
  const [stu] = await db.select({ classId: students.classId }).from(students).where(eq(students.id, target)).limit(1)
  const [rows, taught] = await Promise.all([
    db.select().from(attendance).where(eq(attendance.studentId, target)).orderBy(desc(attendance.date)).limit(90),
    stu?.classId
      ? db
          .select({
            id: subjects.id,
            name: subjects.nameEn,
            dayOfWeek: timetableSlots.dayOfWeek,
          })
          .from(subjects)
          .leftJoin(timetableSlots, eq(timetableSlots.subjectId, subjects.id))
          .where(eq(subjects.classId, stu.classId))
      : Promise.resolve([]),
  ])
  const bySubject = new Map<string, { id: string; name: string; days: number[] }>()
  for (const row of taught) {
    const item = bySubject.get(row.id) ?? { id: row.id, name: row.name, days: [] }
    if (row.dayOfWeek != null && !item.days.includes(row.dayOfWeek)) item.days.push(row.dayOfWeek)
    bySubject.set(row.id, item)
  }
  return { studentId: target, rows, subjects: [...bySubject.values()] }
}

export async function studentAssignments(user: PublicUser) {
  const kids = await listMyStudents(user)
  const studentIds = kids.map((k) => k.id)
  if (user.role === 'teacher') {
    return db
      .select({
        id: assignments.id,
        title: assignments.title,
        description: assignments.description,
        dueDate: assignments.dueDate,
        subject: subjects.nameEn,
        className: classes.name,
      })
      .from(assignments)
      .innerJoin(subjects, eq(subjects.id, assignments.subjectId))
      .innerJoin(classes, eq(classes.id, assignments.classId))
      .where(eq(subjects.teacherId, user.id))
      .orderBy(assignments.dueDate)
  }
  if (!studentIds.length) return []
  return db
    .select({
      id: assignments.id,
      title: assignments.title,
      description: assignments.description,
      dueDate: assignments.dueDate,
      subject: subjects.nameEn,
      className: classes.name,
    })
    .from(assignments)
    .innerJoin(subjects, eq(subjects.id, assignments.subjectId))
    .innerJoin(classes, eq(classes.id, assignments.classId))
    .innerJoin(students, eq(students.classId, classes.id))
    .where(inArray(students.id, studentIds))
}

export async function studentTimetable(user: PublicUser) {
  const kids = await listMyStudents(user)
  const select = {
    id: timetableSlots.id,
    dayOfWeek: timetableSlots.dayOfWeek,
    startTime: timetableSlots.startTime,
    endTime: timetableSlots.endTime,
    room: timetableSlots.room,
    subjectId: subjects.id,
    subject: subjects.nameEn,
    classId: timetableSlots.classId,
    className: classes.name,
  }
  if (user.role === 'teacher') {
    const homeIds = (await db.select({ id: classes.id }).from(classes).where(eq(classes.teacherId, user.id))).map((r) => r.id)
    const taughtIds = (await db.select({ id: subjects.id }).from(subjects).where(eq(subjects.teacherId, user.id))).map((r) => r.id)
    if (!homeIds.length && !taughtIds.length) return []
    const filters = [
      ...(homeIds.length ? [inArray(timetableSlots.classId, homeIds)] : []),
      ...(taughtIds.length ? [inArray(timetableSlots.subjectId, taughtIds)] : []),
    ]
    return db
      .select(select)
      .from(timetableSlots)
      .innerJoin(subjects, eq(subjects.id, timetableSlots.subjectId))
      .innerJoin(classes, eq(classes.id, timetableSlots.classId))
      .where(filters.length === 1 ? filters[0] : or(...filters))
      .orderBy(timetableSlots.dayOfWeek, timetableSlots.startTime)
  }
  const classIds = [
    ...new Set(
      (
        await db
          .select({ classId: students.classId })
          .from(students)
          .where(inArray(students.id, kids.map((k) => k.id)))
      )
        .map((row) => row.classId)
        .filter((id): id is string => Boolean(id)),
    ),
  ]
  if (!classIds.length) return []
  return db
    .select(select)
    .from(timetableSlots)
    .innerJoin(subjects, eq(subjects.id, timetableSlots.subjectId))
    .innerJoin(classes, eq(classes.id, timetableSlots.classId))
    .where(inArray(timetableSlots.classId, classIds))
    .orderBy(timetableSlots.dayOfWeek, timetableSlots.startTime)
}

export async function studentFees(user: PublicUser) {
  if (user.role !== 'parent') throw new Error('FORBIDDEN')
  const ids = await visibleStudentIds(user)
  if (!ids.length) return []
  return db
    .select({
      id: feeInvoices.id,
      studentId: feeInvoices.studentId,
      title: feeInvoices.title,
      amountEtb: feeInvoices.amountEtb,
      dueDate: feeInvoices.dueDate,
      status: feeInvoices.status,
      firstName: students.firstName,
      lastName: students.lastName,
    })
    .from(feeInvoices)
    .innerJoin(students, eq(students.id, feeInvoices.studentId))
    .where(inArray(feeInvoices.studentId, ids))
}

export async function listFeePayments(user: PublicUser) {
  if (user.role !== 'parent') throw new Error('FORBIDDEN')
  const ids = await visibleStudentIds(user)
  if (!ids.length) return []
  return db
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
      status: feePayments.status,
      createdAt: feePayments.createdAt,
      firstName: students.firstName,
      lastName: students.lastName,
    })
    .from(feePayments)
    .innerJoin(students, eq(students.id, feePayments.studentId))
    .where(inArray(feePayments.studentId, ids))
    .orderBy(desc(feePayments.createdAt))
}

export async function submitFeePayment(
  user: PublicUser,
  data: {
    studentId: string
    invoiceId?: string
    kind: string
    method: string
    amountEtb: number
    receiptNumber: string
    proofNote?: string
    proofName?: string
    proofData?: string
  },
) {
  if (user.role !== 'parent') throw new Error('FORBIDDEN')
  const ids = await visibleStudentIds(user)
  if (!ids.includes(data.studentId)) throw new Error('FORBIDDEN')
  if (!(FEE_KINDS as readonly string[]).includes(data.kind)) throw new Error('INVALID')
  if (!SCHOOL_PAYMENTS.some((item) => item.id === data.method)) throw new Error('INVALID')
  const amount = Math.round(Number(data.amountEtb))
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('INVALID')
  const receipt = data.receiptNumber.trim()
  if (!receipt) throw new Error('INVALID')
  const proofData = (data.proofData || '').trim()
  if (!proofData) throw new Error('INVALID')
  if (proofData.length > 1_800_000) throw new Error('INVALID')
  let invoiceId: string | null = data.invoiceId || null
  if (invoiceId) {
    const [invoice] = await db
      .select({ id: feeInvoices.id, studentId: feeInvoices.studentId, status: feeInvoices.status })
      .from(feeInvoices)
      .where(eq(feeInvoices.id, invoiceId))
      .limit(1)
    if (!invoice || invoice.studentId !== data.studentId) invoiceId = null
  }
  await db.insert(feePayments).values({
    id: nanoid(),
    studentId: data.studentId,
    parentUserId: user.id,
    invoiceId,
    kind: data.kind,
    method: data.method,
    amountEtb: amount,
    receiptNumber: receipt,
    proofNote: (data.proofNote || '').trim(),
    proofName: (data.proofName || '').trim(),
    proofData,
    status: 'pending',
    createdAt: new Date(),
  })
  return { ok: true as const }
}

export async function listMessages(user: PublicUser) {
  assertCanUseMessages(user)
  const fromUser = alias(users, 'from_user')
  const toUser = alias(users, 'to_user')
  return db
    .select({
      id: messages.id,
      subject: messages.subject,
      body: messages.body,
      createdAt: messages.createdAt,
      readAt: messages.readAt,
      fromName: fromUser.fullName,
      toName: toUser.fullName,
      fromUserId: messages.fromUserId,
      toUserId: messages.toUserId,
      studentId: messages.studentId,
    })
    .from(messages)
    .innerJoin(fromUser, eq(fromUser.id, messages.fromUserId))
    .innerJoin(toUser, eq(toUser.id, messages.toUserId))
    .where(or(eq(messages.toUserId, user.id), eq(messages.fromUserId, user.id)))
    .orderBy(desc(messages.createdAt))
}

export async function sendMessage(user: PublicUser, data: { toUserId: string; subject: string; body: string; studentId?: string }) {
  assertCanUseMessages(user)
  const [to] = await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.id, data.toUserId)).limit(1)
  if (!to || (to.role !== 'parent' && to.role !== 'teacher')) throw new Error('FORBIDDEN')
  await db.insert(messages).values({
    id: nanoid(),
    fromUserId: user.id,
    toUserId: data.toUserId,
    studentId: data.studentId || null,
    subject: data.subject.trim(),
    body: data.body.trim(),
    createdAt: new Date(),
    readAt: null,
  })
  return { ok: true as const }
}

export async function messageRecipients(user: PublicUser) {
  assertCanUseMessages(user)
  const staffing = await homeroomOverview(user)
  type Recipient = {
    id: string
    fullName: string
    role: string
    kind: 'homeroom' | 'subject' | 'other'
    studentId?: string
    note?: string
  }
  const out: Recipient[] = []
  const byKey = new Map<string, Recipient>()

  function upsert(entry: Recipient) {
    const key = `${entry.id}:${entry.studentId || ''}`
    const existing = byKey.get(key)
    if (!existing) {
      byKey.set(key, entry)
      out.push(entry)
      return
    }
    if (entry.kind === 'homeroom') existing.kind = 'homeroom'
    const extra = entry.note?.split(' · ').filter(Boolean) ?? []
    const current = existing.note?.split(' · ').filter(Boolean) ?? []
    existing.note = [...new Set([...current, ...extra])].join(' · ')
  }

  if (user.role === 'parent') {
    for (const child of staffing.children) {
      const childLabel = `${child.firstName} ${child.lastName}${child.className ? ` · ${child.className}` : ''}`
      if (child.teacherId) {
        upsert({
          id: child.teacherId,
          fullName: child.teacherName || 'Homeroom',
          role: 'teacher',
          kind: 'homeroom',
          studentId: child.studentId,
          note: `${childLabel} · Homeroom`,
        })
      }
      for (const subject of child.subjectTeachers) {
        if (!subject.teacherId) continue
        upsert({
          id: subject.teacherId,
          fullName: subject.teacherName || 'Teacher',
          role: 'teacher',
          kind: subject.teacherId === child.teacherId ? 'homeroom' : 'subject',
          studentId: child.studentId,
          note: `${childLabel} · ${subject.subjectName}`,
        })
      }
    }
    const linked = new Set(out.map((r) => r.id))
    const staff = await db
      .select({ id: users.id, fullName: users.fullName, role: users.role })
      .from(users)
      .where(eq(users.role, 'teacher'))
    for (const person of staff) {
      if (person.id === user.id || linked.has(person.id)) continue
      linked.add(person.id)
      out.push({ id: person.id, fullName: person.fullName, role: person.role, kind: 'other' })
    }
    return out
  }

  for (const room of staffing.classes) {
    for (const family of room.families) {
      if (!family.parentId) continue
      upsert({
        id: family.parentId,
        fullName: family.parentName || 'Parent',
        role: 'parent',
        kind: 'homeroom',
        studentId: family.studentId,
        note: `${family.firstName} ${family.lastName} · ${room.className} · Homeroom`,
      })
    }
  }
  for (const subject of staffing.subjects) {
    for (const family of subject.families) {
      if (!family.parentId) continue
      upsert({
        id: family.parentId,
        fullName: family.parentName || 'Parent',
        role: 'parent',
        kind: 'subject',
        studentId: family.studentId,
        note: `${family.firstName} ${family.lastName} · ${subject.className} · ${subject.subjectName}`,
      })
    }
  }
  const linked = new Set(out.map((r) => r.id))
  const others = await db
    .select({ id: users.id, fullName: users.fullName, role: users.role })
    .from(users)
    .where(eq(users.role, 'parent'))
  for (const person of others) {
    if (person.id === user.id || linked.has(person.id)) continue
    linked.add(person.id)
    out.push({ id: person.id, fullName: person.fullName, role: person.role, kind: 'other' })
  }
  return out
}

export async function portalCalendar() {
  const [ev, anns] = await Promise.all([
    db.select().from(events).orderBy(events.startAt),
    db.select().from(announcements).orderBy(desc(announcements.publishedAt)),
  ])
  return { events: ev, announcements: anns }
}

export async function createAbsence(user: PublicUser, data: { studentId: string; fromDate: string; toDate: string; reason: string }) {
  if (user.role !== 'parent') throw new Error('FORBIDDEN')
  const ids = await parentStudentIds(user.id)
  if (!ids.includes(data.studentId)) throw new Error('FORBIDDEN')
  await db.insert(absenceRequests).values({
    id: nanoid(),
    studentId: data.studentId,
    parentUserId: user.id,
    fromDate: data.fromDate,
    toDate: data.toDate,
    reason: data.reason.trim(),
    status: 'pending',
  })
  return { ok: true as const }
}

export async function listAbsences(user: PublicUser) {
  const ids = await visibleStudentIds(user)
  if (!ids.length) return []
  return db
    .select({
      id: absenceRequests.id,
      fromDate: absenceRequests.fromDate,
      toDate: absenceRequests.toDate,
      reason: absenceRequests.reason,
      status: absenceRequests.status,
      firstName: students.firstName,
      lastName: students.lastName,
    })
    .from(absenceRequests)
    .innerJoin(students, eq(students.id, absenceRequests.studentId))
    .where(inArray(absenceRequests.studentId, ids))
}

export async function teacherDesk(user: PublicUser) {
  if (user.role !== 'teacher' && user.role !== 'admin') throw new Error('FORBIDDEN')
  const homeroomClasses =
    user.role === 'admin' ? await db.select().from(classes) : await db.select().from(classes).where(eq(classes.teacherId, user.id))
  const taught =
    user.role === 'admin'
      ? await db
          .select({
            subjectId: subjects.id,
            subjectName: subjects.nameEn,
            classId: classes.id,
            className: classes.name,
          })
          .from(subjects)
          .innerJoin(classes, eq(classes.id, subjects.classId))
      : await db
          .select({
            subjectId: subjects.id,
            subjectName: subjects.nameEn,
            classId: classes.id,
            className: classes.name,
          })
          .from(subjects)
          .innerJoin(classes, eq(classes.id, subjects.classId))
          .where(eq(subjects.teacherId, user.id))

  const byClass = new Map<string, { id: string; name: string; subjects: Array<{ id: string; name: string }> }>()
  for (const row of taught) {
    const existing = byClass.get(row.classId) ?? { id: row.classId, name: row.className, subjects: [] }
    existing.subjects.push({ id: row.subjectId, name: row.subjectName })
    byClass.set(row.classId, existing)
  }

  const attendanceByClass = new Map<
    string,
    { id: string; name: string; isHomeroom: boolean; subjects: Array<{ id: string; name: string }> }
  >()
  for (const room of homeroomClasses) {
    attendanceByClass.set(room.id, { id: room.id, name: room.name, isHomeroom: true, subjects: [] })
  }
  for (const cls of byClass.values()) {
    const existing = attendanceByClass.get(cls.id)
    if (existing) {
      existing.subjects = cls.subjects
    } else {
      attendanceByClass.set(cls.id, { id: cls.id, name: cls.name, isHomeroom: false, subjects: cls.subjects })
    }
  }

  return { homeroomClasses, subjectClasses: [...byClass.values()], attendanceClasses: [...attendanceByClass.values()] }
}

export async function teacherClasses(user: PublicUser) {
  if (user.role !== 'teacher' && user.role !== 'admin') throw new Error('FORBIDDEN')
  if (user.role === 'admin') return db.select().from(classes)
  const ids = await teacherAccessibleClassIds(user.id)
  if (!ids.length) return []
  return db.select().from(classes).where(inArray(classes.id, ids))
}

function isYmd(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export async function classRoster(user: PublicUser, classId: string, date?: string) {
  const cls = await teacherClasses(user)
  if (!cls.some((c) => c.id === classId) && user.role !== 'admin') throw new Error('FORBIDDEN')
  const today = addisToday()
  const day = date && isYmd(date) && date <= today ? date : today
  const [roster, marks] = await Promise.all([
    db.select().from(students).where(eq(students.classId, classId)),
    db.select().from(attendance).where(and(eq(attendance.classId, classId), eq(attendance.date, day))),
  ])
  return { classId, date: day, today, roster, marks }
}

export async function classAttendanceMonth(user: PublicUser, classId: string, month: string) {
  const cls = await teacherClasses(user)
  if (!cls.some((c) => c.id === classId) && user.role !== 'admin') throw new Error('FORBIDDEN')
  const m = /^\d{4}-\d{2}$/.test(month) ? month : addisToday().slice(0, 7)
  const year = Number(m.slice(0, 4))
  const monthNum = Number(m.slice(5, 7))
  const last = new Date(year, monthNum, 0).getDate()
  const start = `${m}-01`
  const end = `${m}-${String(last).padStart(2, '0')}`
  const rows = await db
    .select({ date: attendance.date, status: attendance.status })
    .from(attendance)
    .where(and(eq(attendance.classId, classId), gte(attendance.date, start), lte(attendance.date, end)))

  const days: Record<string, { present: number; absent: number; late: number; excused: number }> = {}
  for (const row of rows) {
    const bucket = days[row.date] ?? { present: 0, absent: 0, late: 0, excused: 0 }
    if (row.status === 'absent') bucket.absent += 1
    else if (row.status === 'late') bucket.late += 1
    else if (row.status === 'excused') bucket.excused += 1
    else bucket.present += 1
    days[row.date] = bucket
  }
  return { month: m, days }
}

export async function saveAttendance(
  user: PublicUser,
  data: { classId: string; date: string; marks: Array<{ studentId: string; status: string }> },
) {
  if (!isYmd(data.date) || data.date > addisToday()) throw new Error('INVALID_DATE')
  await classRoster(user, data.classId, data.date)
  for (const mark of data.marks) {
    const existing = await db
      .select({ id: attendance.id })
      .from(attendance)
      .where(and(eq(attendance.studentId, mark.studentId), eq(attendance.date, data.date)))
      .limit(1)
    if (existing[0]) {
      await db.update(attendance).set({ status: mark.status }).where(eq(attendance.id, existing[0].id))
    } else {
      await db.insert(attendance).values({
        id: nanoid(),
        studentId: mark.studentId,
        classId: data.classId,
        date: data.date,
        status: mark.status,
        note: null,
      })
    }
  }
  return { ok: true as const }
}

export async function teacherGradebook(user: PublicUser, classId: string) {
  await classRoster(user, classId)
  const [roster, classSubjects, records] = await Promise.all([
    db.select().from(students).where(eq(students.classId, classId)),
    db.select().from(subjects).where(eq(subjects.classId, classId)),
    db
      .select()
      .from(gradeRecords)
      .innerJoin(students, eq(students.id, gradeRecords.studentId))
      .where(eq(students.classId, classId)),
  ])
  const visibleSubjects = user.role === 'admin' ? classSubjects : classSubjects.filter((s) => s.teacherId === user.id)
  const allowed = new Set(visibleSubjects.map((s) => s.id))
  return {
    roster,
    subjects: visibleSubjects,
    records: records.map((r) => r.grade_records).filter((row) => allowed.has(row.subjectId)),
  }
}

async function assertCanMarkClass(user: PublicUser, classId: string, subjectId?: string) {
  if (user.role === 'admin') return
  if (!subjectId) throw new Error('FORBIDDEN')
  const [subject] = await db.select().from(subjects).where(eq(subjects.id, subjectId)).limit(1)
  if (subject?.teacherId === user.id && subject.classId === classId) return
  throw new Error('FORBIDDEN')
}

export async function saveGrade(
  user: PublicUser,
  data: { studentId: string; subjectId: string; score: number; maxScore: number; term: string },
) {
  if (!isReportTerm(data.term)) throw new Error('INVALID_TERM')
  const [stu] = await db.select().from(students).where(eq(students.id, data.studentId)).limit(1)
  if (!stu?.classId) throw new Error('NOT_FOUND')
  await assertCanMarkClass(user, stu.classId, data.subjectId)
  const existing = await db
    .select()
    .from(gradeRecords)
    .where(and(eq(gradeRecords.studentId, data.studentId), eq(gradeRecords.subjectId, data.subjectId), eq(gradeRecords.term, data.term)))
  const official = existing.find((row) => row.assignmentId == null) ?? existing[0]
  const score = Math.max(0, Math.min(data.maxScore || 100, Math.round(data.score)))
  const maxScore = data.maxScore > 0 ? data.maxScore : 100
  if (official) {
    await db.update(gradeRecords).set({ score, maxScore, assignmentId: null }).where(eq(gradeRecords.id, official.id))
  } else {
    await db.insert(gradeRecords).values({
      id: nanoid(),
      studentId: data.studentId,
      subjectId: data.subjectId,
      assignmentId: null,
      term: data.term,
      score,
      maxScore,
    })
  }
  return { ok: true as const }
}

export async function createAssignment(
  user: PublicUser,
  data: { classId: string; subjectId: string; title: string; description: string; dueDate: string },
) {
  await assertCanMarkClass(user, data.classId, data.subjectId)
  await db.insert(assignments).values({
    id: nanoid(),
    classId: data.classId,
    subjectId: data.subjectId,
    title: data.title.trim(),
    description: data.description.trim(),
    dueDate: data.dueDate,
  })
  return { ok: true as const }
}

function scoreFromRows(rows: Array<{ kind: string; points: number; status: string }>) {
  const active = rows.filter((row) => row.status === 'active')
  const adds = active.filter((row) => row.kind === 'add').reduce((sum, row) => sum + row.points, 0)
  const deducts = active.filter((row) => row.kind === 'deduct').reduce((sum, row) => sum + row.points, 0)
  return clampBehaviourScore(adds, deducts)
}

export async function studentBehaviour(user: PublicUser, studentId?: string) {
  const ids = await visibleStudentIds(user)
  const target = studentId && ids.includes(studentId) ? studentId : ids[0]
  const term = currentReportTerm()
  if (!target) {
    return { studentId: null as string | null, term, score: 100, incidents: [] as Array<{
      id: string
      studentId: string
      kind: string
      category: string
      points: number
      note: string
      status: string
      createdAt: Date
      teacherName: string
    }> }
  }
  const incidents = await db
    .select({
      id: behaviourIncidents.id,
      studentId: behaviourIncidents.studentId,
      kind: behaviourIncidents.kind,
      category: behaviourIncidents.category,
      points: behaviourIncidents.points,
      note: behaviourIncidents.note,
      status: behaviourIncidents.status,
      createdAt: behaviourIncidents.createdAt,
      teacherName: users.fullName,
    })
    .from(behaviourIncidents)
    .innerJoin(users, eq(users.id, behaviourIncidents.teacherUserId))
    .where(and(eq(behaviourIncidents.studentId, target), eq(behaviourIncidents.term, term)))
    .orderBy(desc(behaviourIncidents.createdAt))
  return { studentId: target, term, score: scoreFromRows(incidents), incidents }
}

export async function classBehaviour(user: PublicUser, classId: string) {
  if (user.role !== 'teacher' && user.role !== 'admin') throw new Error('FORBIDDEN')
  const rooms = await teacherClasses(user)
  if (!rooms.some((room) => room.id === classId) && user.role !== 'admin') throw new Error('FORBIDDEN')
  const term = currentReportTerm()
  const roster = await db.select().from(students).where(eq(students.classId, classId))
  const ids = roster.map((row) => row.id)
  const incidents = ids.length
    ? await db
        .select({
          id: behaviourIncidents.id,
          studentId: behaviourIncidents.studentId,
          kind: behaviourIncidents.kind,
          category: behaviourIncidents.category,
          points: behaviourIncidents.points,
          note: behaviourIncidents.note,
          status: behaviourIncidents.status,
          createdAt: behaviourIncidents.createdAt,
          teacherName: users.fullName,
        })
        .from(behaviourIncidents)
        .innerJoin(users, eq(users.id, behaviourIncidents.teacherUserId))
        .where(and(inArray(behaviourIncidents.studentId, ids), eq(behaviourIncidents.term, term)))
        .orderBy(desc(behaviourIncidents.createdAt))
    : []
  const board = roster.map((row) => ({
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    score: scoreFromRows(incidents.filter((item) => item.studentId === row.id)),
  }))
  return { classId, term, students: board, incidents }
}

export async function logBehaviour(
  user: PublicUser,
  data: { studentId: string; kind: BehaviourKind; category: string; note?: string },
) {
  if (user.role !== 'teacher' && user.role !== 'admin') throw new Error('FORBIDDEN')
  const ids = await visibleStudentIds(user)
  if (!ids.includes(data.studentId)) throw new Error('FORBIDDEN')
  const preset = behaviourPreset(data.kind, data.category)
  if (!preset) throw new Error('INVALID')
  await db.insert(behaviourIncidents).values({
    id: nanoid(),
    studentId: data.studentId,
    teacherUserId: user.id,
    term: currentReportTerm(),
    kind: data.kind,
    category: data.category,
    points: preset.points,
    note: (data.note || '').trim(),
    status: 'active',
    createdAt: new Date(),
  })
  return { ok: true as const }
}
