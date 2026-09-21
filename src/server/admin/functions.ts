import { createServerFn } from '@tanstack/react-start'
import { requireAdmin } from '../auth/guard.server'
import {
  adminStats,
  createAnnouncement,
  createEvent,
  createNews,
  deleteAnnouncement,
  deleteEvent,
  deleteNews,
  listAdminAnnouncements,
  listAdminEvents,
  listAdminFees,
  listAdminNews,
  listAdminStudents,
  listAdminUsers,
  listApplications,
  listContacts,
  markFeePaid,
  reviewFeePayment,
  reverseBehaviour,
  listAdminBehaviour,
  setApplicationStatus,
  updateAlert,
} from './service'

export const adminStatsFn = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  return adminStats()
})

export const listApplicationsFn = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  return listApplications()
})

export const setApplicationStatusFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string; status: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin()
    return setApplicationStatus(data.id, data.status)
  })

export const listAdminNewsFn = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  return listAdminNews()
})

export const createNewsFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { title: string; excerpt: string; body: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin()
    return createNews(data)
  })

export const deleteNewsFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin()
    return deleteNews(data.id)
  })

export const listAdminEventsFn = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  return listAdminEvents()
})

export const createEventFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { title: string; description: string; startAt: string; location: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin()
    return createEvent(data)
  })

export const deleteEventFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin()
    return deleteEvent(data.id)
  })

export const listAdminAnnouncementsFn = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  return listAdminAnnouncements()
})

export const createAnnouncementFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { title: string; body: string; audience: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin()
    return createAnnouncement(data)
  })

export const deleteAnnouncementFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin()
    return deleteAnnouncement(data.id)
  })

export const listAdminUsersFn = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  return listAdminUsers()
})

export const listAdminStudentsFn = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  return listAdminStudents()
})

export const listAdminFeesFn = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  return listAdminFees()
})

export const markFeePaidFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin()
    return markFeePaid(data.id)
  })

export const reviewFeePaymentFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string; status: 'confirmed' | 'rejected' }) => data)
  .handler(async ({ data }) => {
    await requireAdmin()
    return reviewFeePayment(data.id, data.status)
  })

export const listContactsFn = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  return listContacts()
})

export const updateAlertFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { alertEnabled: boolean; alertEn: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin()
    return updateAlert(data)
  })

export const listAdminBehaviourFn = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  return listAdminBehaviour()
})

export const reverseBehaviourFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin()
    return reverseBehaviour(data.id)
  })
