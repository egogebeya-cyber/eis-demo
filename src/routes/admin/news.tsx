import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createNewsFn, deleteNewsFn, listAdminNewsFn } from '~/server/admin/functions'

export const Route = createFileRoute('/admin/news')({
  loader: async () => ({ items: await listAdminNewsFn() }),
  component: AdminNews,
})

function AdminNews() {
  const { items } = Route.useLoaderData()
  const router = useRouter()

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    await createNewsFn({
      data: {
        title: String(form.get('title') || ''),
        excerpt: String(form.get('excerpt') || ''),
        body: String(form.get('body') || ''),
      },
    })
    e.currentTarget.reset()
    await router.invalidate()
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-school-dark">News</h1>
      <form onSubmit={(e) => void onCreate(e)} className="soft-card mt-6 space-y-3 bg-white shadow-sm">
        <input name="title" required placeholder="Title" className="w-full rounded-xl border border-school/20 px-3 py-2" />
        <input name="excerpt" required placeholder="Excerpt" className="w-full rounded-xl border border-school/20 px-3 py-2" />
        <textarea name="body" required placeholder="Body" rows={4} className="w-full rounded-xl border border-school/20 px-3 py-2" />
        <button type="submit" className="rounded-full bg-school px-5 py-2 text-sm font-bold uppercase text-white">
          Publish
        </button>
      </form>
      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between soft-card bg-white shadow-sm">
            <div>
              <p className="font-bold text-school-dark">{item.titleEn}</p>
              <p className="text-sm text-zinc-500">{item.slug}</p>
            </div>
            <button
              type="button"
              className="text-sm font-bold text-accent"
              onClick={() => void deleteNewsFn({ data: { id: item.id } }).then(() => router.invalidate())}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
