import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useLocale } from '~/components/locale-context'
import { createAbsenceFn, listAbsencesFn, listMyStudentsFn } from '~/server/portal/functions'

export const Route = createFileRoute('/portal/absence')({
  beforeLoad: ({ context }) => {
    const ctx = context as { user?: { role: string } }
    return ctx
  },
  loader: async () => ({
    kids: await listMyStudentsFn(),
    items: await listAbsencesFn(),
  }),
  component: AbsencePage,
})

function AbsencePage() {
  const { t } = useLocale()
  const { kids, items } = Route.useLoaderData()
  const router = useRouter()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    await createAbsenceFn({
      data: {
        studentId: String(form.get('studentId') || ''),
        fromDate: String(form.get('fromDate') || ''),
        toDate: String(form.get('toDate') || ''),
        reason: String(form.get('reason') || ''),
      },
    })
    e.currentTarget.reset()
    await router.invalidate()
  }

  return (
    <div>
      <h1 className="text-xl font-black text-school-dark sm:text-2xl">{t('portalAbsence')}</h1>
      <form onSubmit={(e) => void onSubmit(e)} className="soft-card mt-6 bg-white shadow-sm">
        <label className="text-xs font-bold uppercase text-zinc-500">{t('children')}</label>
        <select name="studentId" className="mt-1 mb-3 w-full rounded-xl border border-school/20 px-3 py-2">
          {kids.map((k) => (
            <option key={k.id} value={k.id}>
              {k.firstName} {k.lastName}
            </option>
          ))}
        </select>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-bold uppercase text-zinc-500">{t('from')}</label>
            <input name="fromDate" type="date" required className="mt-1 w-full rounded-xl border border-school/20 px-3 py-2" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-zinc-500">{t('to')}</label>
            <input name="toDate" type="date" required className="mt-1 w-full rounded-xl border border-school/20 px-3 py-2" />
          </div>
        </div>
        <label className="mt-3 block text-xs font-bold uppercase text-zinc-500">{t('reason')}</label>
        <textarea name="reason" required rows={3} className="mt-1 mb-4 w-full rounded-xl border border-school/20 px-3 py-2" />
        <button type="submit" className="rounded-full bg-school px-5 py-2 text-sm font-bold uppercase text-white">
          {t('requestAbsence')}
        </button>
      </form>
      <div className="mt-6 space-y-3">
        {items.map((row) => (
          <article key={row.id} className="soft-card bg-white shadow-sm">
            <p className="font-bold text-school-dark">
              {row.firstName} {row.lastName}
            </p>
            <p className="text-sm text-zinc-600">
              {row.fromDate} → {row.toDate} · {row.status}
            </p>
            <p className="mt-1 text-sm">{row.reason}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
