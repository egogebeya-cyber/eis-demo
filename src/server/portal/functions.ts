import { createServerFn } from '@tanstack/react-start'
import { requireStaff, requireUser } from '../auth/guard.server'
import {
  classAttendanceMonth,
  classRoster,
  createAbsence,
  createAssignment,
  listAbsences,
  listMessages,
  listMyStudents,
  messageRecipients,
  portalCalendar,
  portalDashboard,
  saveAttendance,
  saveGrade,
  sendMessage,
  studentAssignments,
  studentAttendance,
  studentFees,
  listFeePayments,
  submitFeePayment,
  studentGrades,
  studentTimetable,
  teacherClasses,
  teacherDesk,
  teacherGradebook,
  studentBehaviour,
  classBehaviour,
  logBehaviour,
} from './service'

export const portalDashboardFn = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser()
  return portalDashboard(user)
})

export const listMyStudentsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser()
  return listMyStudents(user)
})

export const studentGradesFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { studentId?: string }) => data)
  .handler(async ({ data }) => studentGrades(await requireUser(), data.studentId))

export const studentAttendanceFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { studentId?: string }) => data)
  .handler(async ({ data }) => studentAttendance(await requireUser(), data.studentId))

export const studentAssignmentsFn = createServerFn({ method: 'GET' }).handler(async () =>
  studentAssignments(await requireUser()),
)

export const studentTimetableFn = createServerFn({ method: 'GET' }).handler(async () =>
  studentTimetable(await requireUser()),
)

export const studentFeesFn = createServerFn({ method: 'GET' }).handler(async () => studentFees(await requireUser()))

export const listFeePaymentsFn = createServerFn({ method: 'GET' }).handler(async () =>
  listFeePayments(await requireUser()),
)

export const submitFeePaymentFn = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      studentId: string
      invoiceId?: string
      kind: string
      method: string
      amountEtb: number
      receiptNumber: string
      proofNote?: string
      proofName?: string
      proofData?: string
    }) => data,
  )
  .handler(async ({ data }) => submitFeePayment(await requireUser(), data))

export const listMessagesFn = createServerFn({ method: 'GET' }).handler(async () => listMessages(await requireUser()))

export const messageRecipientsFn = createServerFn({ method: 'GET' }).handler(async () =>
  messageRecipients(await requireUser()),
)

export const sendMessageFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { toUserId: string; subject: string; body: string; studentId?: string }) => data)
  .handler(async ({ data }) => sendMessage(await requireUser(), data))

export const portalCalendarFn = createServerFn({ method: 'GET' }).handler(async () => {
  await requireUser()
  return portalCalendar()
})

export const createAbsenceFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { studentId: string; fromDate: string; toDate: string; reason: string }) => data)
  .handler(async ({ data }) => createAbsence(await requireUser(), data))

export const listAbsencesFn = createServerFn({ method: 'GET' }).handler(async () => listAbsences(await requireUser()))

export const teacherDeskFn = createServerFn({ method: 'GET' }).handler(async () => teacherDesk(await requireStaff()))

export const teacherClassesFn = createServerFn({ method: 'GET' }).handler(async () => teacherClasses(await requireStaff()))

export const classRosterFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { classId: string; date?: string }) => data)
  .handler(async ({ data }) => classRoster(await requireStaff(), data.classId, data.date))

export const classAttendanceMonthFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { classId: string; month: string }) => data)
  .handler(async ({ data }) => classAttendanceMonth(await requireStaff(), data.classId, data.month))

export const saveAttendanceFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { classId: string; date: string; marks: Array<{ studentId: string; status: string }> }) => data)
  .handler(async ({ data }) => saveAttendance(await requireStaff(), data))

export const teacherGradebookFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { classId: string }) => data)
  .handler(async ({ data }) => teacherGradebook(await requireStaff(), data.classId))

export const saveGradeFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { studentId: string; subjectId: string; score: number; maxScore: number; term: string }) => data)
  .handler(async ({ data }) => saveGrade(await requireStaff(), data))

export const createAssignmentFn = createServerFn({ method: 'POST' })
  .inputValidator((data: {
    classId: string
    subjectId: string
    title: string
    description: string
    dueDate: string
  }) => data)
  .handler(async ({ data }) => createAssignment(await requireStaff(), data))

export const studentBehaviourFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { studentId?: string }) => data)
  .handler(async ({ data }) => studentBehaviour(await requireUser(), data.studentId))

export const classBehaviourFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { classId: string }) => data)
  .handler(async ({ data }) => classBehaviour(await requireStaff(), data.classId))

export const logBehaviourFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { studentId: string; kind: 'add' | 'deduct'; category: string; note?: string }) => data)
  .handler(async ({ data }) => logBehaviour(await requireStaff(), data))
