import { createFileRoute, useRouter } from '@tanstack/react-router'
import { listApplicationsFn, setApplicationStatusFn } from '~/server/admin/functions'

export const Route = createFileRoute('/admin/applications')({
  loader: async () => ({ items: await listApplicationsFn() }),
  component: AdminApplications,
})

function AdminApplications() {
  const { items } = Route.useLoaderData()
  const router = useRouter()

  async function setStatus(id: string, status: string) {
    await setApplicationStatusFn({ data: { id, status } })
    await router.invalidate()
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-school-dark">Admissions inbox</h1>
      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <article key={item.id} className="soft-card bg-white shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-bold text-school-dark">{item.childName}</p>
                <p className="text-sm text-zinc-600">
                  {item.parentName} · {item.email} · {item.phone}
                </p>
                <p className="text-sm">
                  {item.gradeApplying} · <span className="uppercase text-accent">{item.status}</span>
                </p>
                {item.notes ? <p className="mt-2 text-sm text-zinc-500">{item.notes}</p> : null}
              </div>
              <div className="flex gap-2">
                <button type="button" className="rounded-full bg-school px-3 py-1 text-xs font-bold uppercase text-white" onClick={() => void setStatus(item.id, 'accepted')}>
                  Accept
                </button>
                <button type="button" className="rounded-full border border-accent px-3 py-1 text-xs font-bold uppercase text-accent" onClick={() => void setStatus(item.id, 'rejected')}>
                  Reject
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
