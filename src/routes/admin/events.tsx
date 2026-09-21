import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createEventFn, deleteEventFn, listAdminEventsFn } from '~/server/admin/functions'

export const Route = createFileRoute('/admin/events')({
  loader: async () => ({ items: await listAdminEventsFn() }),
  component: AdminEvents,
})

function AdminEvents() {
  const { items } = Route.useLoaderData()
  const router = useRouter()

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    await createEventFn({
      data: {
        title: String(form.get('title') || ''),
        description: String(form.get('description') || ''),
        startAt: String(form.get('startAt') || ''),
        location: String(form.get('location') || ''),
      },
    })
    e.currentTarget.reset()
    await router.invalidate()
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-school-dark">Events</h1>
      <form onSubmit={(e) => void onCreate(e)} className="soft-card mt-6 grid gap-3 bg-white shadow-sm">
        <input name="title" required placeholder="Title" className="rounded-xl border border-school/20 px-3 py-2" />
        <input name="location" required placeholder="Location" className="rounded-xl border border-school/20 px-3 py-2" />
        <input name="startAt" type="datetime-local" required className="rounded-xl border border-school/20 px-3 py-2" />
        <textarea name="description" required placeholder="Description" className="rounded-xl border border-school/20 px-3 py-2" />
        <button type="submit" className="rounded-full bg-school px-5 py-2 text-sm font-bold uppercase text-white">
          Create
        </button>
      </form>
      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between soft-card bg-white shadow-sm">
            <div>
              <p className="font-bold text-school-dark">{item.titleEn}</p>
              <p className="text-sm text-zinc-500">
                {item.startAt} · {item.locationEn}
              </p>
            </div>
            <button
              type="button"
              className="text-sm font-bold text-accent"
              onClick={() => void deleteEventFn({ data: { id: item.id } }).then(() => router.invalidate())}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
