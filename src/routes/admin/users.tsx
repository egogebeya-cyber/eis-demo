import { createFileRoute } from '@tanstack/react-router'
import { listAdminUsersFn } from '~/server/admin/functions'

export const Route = createFileRoute('/admin/users')({
  loader: async () => ({ items: await listAdminUsersFn() }),
  component: AdminUsers,
})

function AdminUsers() {
  const { items } = Route.useLoaderData()
  return (
    <div>
      <h1 className="text-2xl font-black text-school-dark">Users</h1>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm sm:rounded-3xl">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-school/10 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id} className="border-t border-school/5">
                <td className="px-4 py-3">{u.fullName}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3 capitalize">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
