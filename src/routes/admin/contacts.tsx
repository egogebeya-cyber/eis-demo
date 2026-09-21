import { createFileRoute } from '@tanstack/react-router'
import { listContactsFn } from '~/server/admin/functions'

export const Route = createFileRoute('/admin/contacts')({
  loader: async () => ({ items: await listContactsFn() }),
  component: AdminContacts,
})

function AdminContacts() {
  const { items } = Route.useLoaderData()
  return (
    <div>
      <h1 className="text-2xl font-black text-school-dark">Contact inbox</h1>
      <div className="mt-6 space-y-3">
        {items.length === 0 ? <p className="text-zinc-500">No messages yet.</p> : null}
        {items.map((item) => (
          <article key={item.id} className="soft-card bg-white shadow-sm">
            <p className="font-bold text-school-dark">{item.name}</p>
            <p className="text-sm text-zinc-500">
              {item.email} {item.phone}
            </p>
            <p className="mt-2 text-sm text-zinc-700">{item.message}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
