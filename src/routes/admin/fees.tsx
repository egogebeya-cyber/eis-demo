import { createFileRoute, useRouter } from '@tanstack/react-router'
import { formatEtb } from '~/lib/utils'
import { listAdminFeesFn, markFeePaidFn, reviewFeePaymentFn } from '~/server/admin/functions'

export const Route = createFileRoute('/admin/fees')({
  loader: async () => listAdminFeesFn(),
  component: AdminFees,
})

function AdminFees() {
  const data = Route.useLoaderData()
  const invoices = Array.isArray(data) ? data : data.invoices
  const payments = Array.isArray(data) ? [] : data.payments
  const router = useRouter()
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-school-dark">Payment proofs</h1>
        <div className="mt-4 space-y-3">
          {payments.length === 0 ? <p className="text-sm text-zinc-500">No parent payments yet.</p> : null}
          {payments.map((row) => (
            <article key={row.id} className="soft-card bg-white shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-school-dark">
                    {row.firstName} {row.lastName} · {row.kind}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {row.method} · receipt {row.receiptNumber} · {formatEtb(row.amountEtb)}
                  </p>
                  {row.proofNote ? <p className="mt-1 text-sm">{row.proofNote}</p> : null}
                  {row.proofData.startsWith('data:image') ? (
                    <img src={row.proofData} alt={row.proofName || 'Payment proof'} className="mt-3 max-h-48 rounded-xl border border-school/10" />
                  ) : row.proofName ? (
                    <a href={row.proofData || '#'} className="mt-2 inline-block text-sm font-semibold text-school">
                      {row.proofName}
                    </a>
                  ) : null}
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase">{row.status}</p>
                  {row.status === 'pending' ? (
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        className="text-xs font-bold uppercase text-school"
                        onClick={() => void reviewFeePaymentFn({ data: { id: row.id, status: 'confirmed' } }).then(() => router.invalidate())}
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        className="text-xs font-bold uppercase text-accent"
                        onClick={() => void reviewFeePaymentFn({ data: { id: row.id, status: 'rejected' } }).then(() => router.invalidate())}
                      >
                        Reject
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-black text-school-dark">Fee invoices</h2>
        <div className="mt-4 space-y-3">
          {invoices.map((row) => (
            <div key={row.id} className="flex items-center justify-between soft-card bg-white shadow-sm">
              <div>
                <p className="font-bold text-school-dark">{row.title}</p>
                <p className="text-sm text-zinc-500">
                  {row.firstName} {row.lastName} · due {row.dueDate}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-accent">{formatEtb(row.amountEtb)}</p>
                {row.status === 'paid' ? (
                  <p className="text-xs font-bold uppercase text-school">Paid</p>
                ) : (
                  <button
                    type="button"
                    className="mt-1 text-xs font-bold uppercase text-school"
                    onClick={() => void markFeePaidFn({ data: { id: row.id } }).then(() => router.invalidate())}
                  >
                    Mark paid
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
