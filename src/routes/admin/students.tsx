import { createFileRoute } from '@tanstack/react-router'
import { listAdminStudentsFn } from '~/server/admin/functions'

export const Route = createFileRoute('/admin/students')({
  loader: async () => ({ items: await listAdminStudentsFn() }),
  component: AdminStudents,
})

function AdminStudents() {
  const { items } = Route.useLoaderData()
  return (
    <div>
      <h1 className="text-2xl font-black text-school-dark">Students</h1>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm sm:rounded-3xl">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-school/10 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Number</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Grade</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id} className="border-t border-school/5">
                <td className="px-4 py-3">{s.studentNumber}</td>
                <td className="px-4 py-3">
                  {s.firstName} {s.lastName}
                </td>
                <td className="px-4 py-3">{s.gradeLevelId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
