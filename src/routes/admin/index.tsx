import { Link, createFileRoute } from '@tanstack/react-router'
import { adminStatsFn } from '~/server/admin/functions'

export const Route = createFileRoute('/admin/')({
  loader: async () => ({ stats: await adminStatsFn() }),
  component: AdminHome,
})

function AdminHome() {
  const { stats } = Route.useLoaderData()
  const cards = [
    { label: 'Students', value: stats.students, to: '/admin/students' as const },
    { label: 'Pending applications', value: stats.pendingApplications, to: '/admin/applications' as const },
    { label: 'Unpaid invoices', value: stats.unpaidInvoices, to: '/admin/fees' as const },
    { label: 'News posts', value: stats.news, to: '/admin/news' as const },
    { label: 'Contact messages', value: stats.contacts, to: '/admin/contacts' as const },
  ]
  return (
    <div>
      <h1 className="text-xl font-black uppercase tracking-tight text-school-dark sm:text-2xl">Dashboard</h1>
      <p className="mt-1 text-sm text-zinc-500">Today {stats.today}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.label} to={card.to} className="soft-card bg-white shadow-sm transition hover:-translate-y-0.5">
            <p className="text-sm text-zinc-500">{card.label}</p>
            <p className="mt-1.5 text-xl font-black text-school-dark sm:text-3xl">{card.value}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
