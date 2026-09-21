import { createServerFn } from '@tanstack/react-start'
import {
  getNewsBySlug,
  getSettings,
  homePayload,
  listDownloads,
  listEvents,
  listGallery,
  listJobs,
  listNews,
  listStaff,
  searchSite,
  submitApplication,
  submitContact,
} from './service'

export const getSettingsFn = createServerFn({ method: 'GET' }).handler(async () => getSettings())

export const getHomeFn = createServerFn({ method: 'GET' }).handler(async () => {
  return homePayload()
})

export const listNewsFn = createServerFn({ method: 'GET' }).handler(async () => listNews())

export const getNewsFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => getNewsBySlug(data.slug))

export const listEventsFn = createServerFn({ method: 'GET' }).handler(async () => listEvents())

export const listGalleryFn = createServerFn({ method: 'GET' }).handler(async () => listGallery())

export const listStaffFn = createServerFn({ method: 'GET' }).handler(async () => listStaff())

export const listDownloadsFn = createServerFn({ method: 'GET' }).handler(async () => listDownloads())

export const listJobsFn = createServerFn({ method: 'GET' }).handler(async () => listJobs())

export const searchSiteFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { q: string }) => data)
  .handler(async ({ data }) => searchSite(data.q))

export const submitApplicationFn = createServerFn({ method: 'POST' })
  .inputValidator((data: {
    childName: string
    parentName: string
    email: string
    phone: string
    gradeApplying: string
    notes?: string
  }) => data)
  .handler(async ({ data }) => submitApplication(data))

export const submitContactFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { name: string; email: string; phone?: string; message: string }) => data)
  .handler(async ({ data }) => submitContact(data))
