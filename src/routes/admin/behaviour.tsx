import { createFileRoute, useRouter } from '@tanstack/react-router'
import { BEHAVIOUR_BAD, BEHAVIOUR_GOOD, formatDate } from '~/lib/utils'
import { listAdminBehaviourFn, reverseBehaviourFn } from '~/server/admin/functions'

export const Route = createFileRoute('/admin/behaviour')({
  loader: async () => listAdminBehaviourFn(),
  component: AdminBehaviour,
})

const CATEGORY_LABELS: Record<string, string> = {
  helpful: 'Helpful',
  kind: 'Kind',
  honest: 'Honest',
  leadership: 'Leadership',
  effort: 'Strong effort',
  late: 'Late to class',
  uniform: 'Incorrect uniform',
  disruption: 'Disruption',
  disrespect: 'Disrespect',
  homework: 'Homework not done',
}

function categoryName(category: string) {
  return CATEGORY_LABELS[category] ?? [...BEHAVIOUR_GOOD, ...BEHAVIOUR_BAD].find((row) => row.id === category)?.id ?? category
}

function AdminBehaviour() {
  const { term, rows } = Route.useLoaderData()
  const router = useRouter()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-school-dark">Behaviour</h1>
        <p className="mt-1 text-sm text-zinc-500">{term} · reverse a wrong entry</p>
      </div>
      {rows.length === 0 ? <p className="text-sm text-zinc-500">No behaviour points this term.</p> : null}
      <div className="space-y-3">
        {rows.map((row) => (
          <article key={row.id} className="flex flex-wrap items-start justify-between gap-3 soft-card bg-white shadow-sm">
            <div>
              <p className="font-bold text-school-dark">
                {row.firstName} {row.lastName} · {categoryName(row.category)}
              </p>
              <p className="text-sm text-zinc-500">
                {row.teacherName} · {formatDate(row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt), 'en')}
                {row.note ? ` · ${row.note}` : ''}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-lg font-black ${row.kind === 'add' ? 'text-emerald-700' : 'text-red-700'}`}>
                {row.kind === 'add' ? '+' : '-'}
                {row.points}
              </p>
              {row.status === 'reversed' ? (
                <p className="text-xs font-bold uppercase text-zinc-400">Reversed</p>
              ) : (
                <button
                  type="button"
                  className="mt-1 text-xs font-bold uppercase text-school"
                  onClick={() => void reverseBehaviourFn({ data: { id: row.id } }).then(() => router.invalidate())}
                >
                  Reverse
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
