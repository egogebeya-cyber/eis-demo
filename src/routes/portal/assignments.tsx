import { createFileRoute } from '@tanstack/react-router'
import { useLocale } from '~/components/locale-context'
import { studentAssignmentsFn } from '~/server/portal/functions'

export const Route = createFileRoute('/portal/assignments')({
  loader: async () => ({ items: await studentAssignmentsFn() }),
  component: AssignmentsPage,
})

function AssignmentsPage() {
  const { t } = useLocale()
  const { items } = Route.useLoaderData()
  const list = Array.isArray(items) ? items : []
  return (
    <div>
      <h1 className="text-xl font-black text-school-dark sm:text-2xl">{t('portalAssignments')}</h1>
      <div className="mt-6 space-y-3">
        {list.length === 0 ? <p className="text-zinc-500">{t('noItems')}</p> : null}
        {list.map((item) => (
          <article key={item.id} className="soft-card bg-white shadow-sm">
            <p className="text-xs font-bold uppercase text-accent">{item.subject}</p>
            <h2 className="font-bold text-school-dark">{item.title}</h2>
            <p className="text-sm text-zinc-600">{item.description}</p>
            <p className="mt-2 text-sm text-school">
              {t('due')} {item.dueDate} · {item.className}
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}
