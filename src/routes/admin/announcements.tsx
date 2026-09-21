import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createAnnouncementFn, deleteAnnouncementFn, listAdminAnnouncementsFn } from '~/server/admin/functions'

export const Route = createFileRoute('/admin/announcements')({
  loader: async () => ({ items: await listAdminAnnouncementsFn() }),
  component: AdminAnnouncements,
})

function AdminAnnouncements() {
  const { items } = Route.useLoaderData()
  const router = useRouter()

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    await createAnnouncementFn({
      data: {
        title: String(form.get('title') || ''),
        body: String(form.get('body') || ''),
        audience: String(form.get('audience') || 'all'),
      },
    })
    e.currentTarget.reset()
    await router.invalidate()
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-school-dark">Announcements</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600">
        Publish for families in the portal, or choose Website to show a gold bar at the top of the public site.
      </p>
      <form onSubmit={(e) => void onCreate(e)} className="soft-card mt-6 grid gap-3 bg-white shadow-sm">
        <input name="title" required placeholder="Title" className="rounded-xl border border-school/20 px-3 py-2" />
        <textarea name="body" required placeholder="Body" className="rounded-xl border border-school/20 px-3 py-2" />
        <select name="audience" className="rounded-xl border border-school/20 px-3 py-2">
          <option value="all">Portal · everyone</option>
          <option value="site">Website banner</option>
          <option value="parents">Parents</option>
          <option value="students">Students</option>
          <option value="staff">Staff</option>
        </select>
        <button type="submit" className="rounded-full bg-school px-5 py-2 text-sm font-bold uppercase text-white">
          Publish
        </button>
      </form>
      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between soft-card bg-white shadow-sm">
            <div>
              <p className="font-bold text-school-dark">{item.titleEn}</p>
              <p className="text-sm text-zinc-500">{item.audience === 'site' ? 'Website banner' : item.audience}</p>
            </div>
            <button
              type="button"
              className="text-sm font-bold text-accent"
              onClick={() => void deleteAnnouncementFn({ data: { id: item.id } }).then(() => router.invalidate())}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
