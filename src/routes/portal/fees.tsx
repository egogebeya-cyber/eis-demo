import { useMemo, useState } from 'react'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useLocale } from '~/components/locale-context'
import { SlotCard } from '~/components/slot-card'
import type { TranslationKey } from '~/lib/i18n'
import { addisToday, FEE_KINDS, formatEtb, kindFromTitle, SCHOOL_PAYMENTS, type FeeKind } from '~/lib/utils'
import { listFeePaymentsFn, listMyStudentsFn, studentFeesFn, submitFeePaymentFn } from '~/server/portal/functions'

export const Route = createFileRoute('/portal/fees')({
  beforeLoad: ({ context }) => {
    if (context.user.role !== 'parent') throw redirect({ to: '/portal' })
  },
  loader: async () => ({
    kids: await listMyStudentsFn(),
    items: await studentFeesFn(),
    payments: await listFeePaymentsFn(),
  }),
  component: FeesPage,
})

const KIND_LABEL: Record<FeeKind, TranslationKey> = {
  term: 'feeTerm',
  uniform: 'feeUniform',
  books: 'feeBooks',
  lab: 'feeLab',
  transport: 'feeTransport',
  other: 'feeOther',
}

const METHOD_LABEL: Record<string, TranslationKey> = {
  cbe: 'payCbe',
  telebirr: 'payTelebirr',
  awash: 'payAwash',
}

function FeesPage() {
  const { t } = useLocale()
  const { kids, items, payments } = Route.useLoaderData()
  const router = useRouter()
  const today = addisToday()
  const [kidId, setKidId] = useState(kids[0]?.id ?? '')
  const current = kids.find((kid) => kid.id === kidId) ?? kids[0]
  const invoices = useMemo(
    () => items.filter((row) => (current ? row.studentId === current.id : true)),
    [items, current],
  )
  const unpaid = invoices.filter((row) => row.status !== 'paid')
  const paid = invoices.filter((row) => row.status === 'paid')
  const unpaidTotal = unpaid.reduce((sum, row) => sum + row.amountEtb, 0)
  const paidTotal = paid.reduce((sum, row) => sum + row.amountEtb, 0)
  const kidPayments = payments.filter((row) => row.studentId === current?.id)
  const [kind, setKind] = useState<FeeKind>('term')
  const [method, setMethod] = useState(SCHOOL_PAYMENTS[0].id)
  const match = unpaid.find((row) => kindFromTitle(row.title) === kind)
  const [amount, setAmount] = useState(String(match?.amountEtb ?? ''))
  const [receipt, setReceipt] = useState('')
  const [note, setNote] = useState('')
  const [proof, setProof] = useState<{ name: string; data: string } | null>(null)
  const [proofKey, setProofKey] = useState(0)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState('')
  const [error, setError] = useState('')

  function pickKind(next: FeeKind) {
    setKind(next)
    const invoice = unpaid.find((row) => kindFromTitle(row.title) === next)
    setAmount(invoice ? String(invoice.amountEtb) : '')
  }

  async function onProof(file?: File | null) {
    if (!file) {
      setProof(null)
      return
    }
    if (file.size > 1_200_000) {
      setError(t('proofHint'))
      return
    }
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
    setProof({ name: file.name, data })
  }

  async function onSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!current) return
    if (!proof?.data) {
      setError(t('proofHint'))
      return
    }
    setBusy(true)
    setError('')
    setDone('')
    try {
      await submitFeePaymentFn({
        data: {
          studentId: current.id,
          invoiceId: match?.id,
          kind,
          method,
          amountEtb: Number(amount),
          receiptNumber: receipt,
          proofNote: note,
          proofName: proof.name,
          proofData: proof.data,
        },
      })
      setReceipt('')
      setNote('')
      setProof(null)
      setProofKey((key) => key + 1)
      setDone(t('paymentSent'))
      await router.invalidate()
    } catch {
      setError(t('sendFailed'))
    } finally {
      setBusy(false)
    }
  }

  if (!current) {
    return (
      <div>
        <h1 className="text-xl font-black text-school-dark sm:text-2xl">{t('portalFees')}</h1>
        <p className="mt-4 text-sm text-muted">{t('noItems')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-school-dark sm:text-2xl">{t('portalFees')}</h1>
        <p className="mt-1 text-sm text-muted">{t('feesHint')}</p>
      </div>

      {kids.length > 1 ? (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{t('pickChild')}</p>
          <div className="slot-grid">
            {kids.map((kid) => {
              const on = kid.id === current.id
              const due = items
                .filter((row) => row.studentId === kid.id && row.status !== 'paid')
                .reduce((sum, row) => sum + row.amountEtb, 0)
              return (
                <SlotCard
                  key={kid.id}
                  kicker={t('children')}
                  title={`${kid.firstName} ${kid.lastName}`}
                  hint={`${kid.className} · ${due ? formatEtb(due) : t('paid')}`}
                  on={on}
                  onClick={() => {
                    setKidId(kid.id)
                    const dueRows = items.filter((row) => row.studentId === kid.id && row.status !== 'paid')
                    const invoice = dueRows.find((row) => kindFromTitle(row.title) === kind)
                    setAmount(invoice ? String(invoice.amountEtb) : '')
                    setDone('')
                    setError('')
                  }}
                />
              )
            })}
          </div>
        </div>
      ) : null}

      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
        {current.className} · {current.firstName} {current.lastName}
      </p>

      <div className="grid grid-cols-2 gap-2">
        <SummaryChip label={t('unpaid')} value={formatEtb(unpaidTotal)} tone={unpaidTotal ? 'unpaid' : 'ok'} />
        <SummaryChip label={t('paid')} value={formatEtb(paidTotal)} tone="ok" />
      </div>

      {invoices.length ? (
        <section className="overflow-hidden rounded-2xl border border-school/10 bg-surface">
          <div className="border-b border-school/10 px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
              {current.firstName} · {t('portalFees')}
            </p>
          </div>
          <ul className="divide-y divide-school/10">
            {invoices.map((row) => {
              const overdue = row.status !== 'paid' && row.dueDate < today
              const waiting = kidPayments.some((pay) => pay.invoiceId === row.id && pay.status === 'pending')
              return (
                <li key={row.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
                  <div>
                    <p className="font-display text-base font-medium italic text-school-dark sm:text-xl">{row.title}</p>
                    <p className="mt-1 text-sm text-muted">
                      {t('due')} {row.dueDate}
                      {overdue ? ` · ${t('unpaid')}` : ''}
                      {waiting ? ` · ${t('pendingReview')}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${row.status === 'paid' ? 'text-foreground' : 'text-accent'}`}>
                      {formatEtb(row.amountEtb)}
                    </p>
                    <p
                      className={`mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                        row.status === 'paid' ? 'text-muted' : 'text-accent'
                      }`}
                    >
                      {row.status === 'paid' ? t('paid') : t('unpaid')}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ) : (
        <p className="text-sm text-muted">{t('noItems')}</p>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-medium italic text-school-dark">{t('paySchool')}</h2>
          <p className="mt-1 text-sm text-muted">{t('paymentMethod')}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {SCHOOL_PAYMENTS.map((item) => (
            <SlotCard
              key={item.id}
              kicker={t(METHOD_LABEL[item.id])}
              title={item.account}
              hint={item.detail}
              on={method === item.id}
              onClick={() => setMethod(item.id)}
            />
          ))}
        </div>
      </section>

      <section>
        <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{t('choosePayment')}</label>
        <select
          value={kind}
          onChange={(e) => pickKind(e.target.value as FeeKind)}
          className="mt-2 w-full rounded-xl border border-school/20 bg-surface px-3 py-2.5 font-display text-base font-medium italic text-school-dark sm:text-xl"
        >
          {FEE_KINDS.map((item) => (
            <option key={item} value={item}>
              {t(KIND_LABEL[item])}
            </option>
          ))}
        </select>
        {match ? (
          <p className="mt-2 text-sm text-muted">
            {t('matchesInvoice')}: {formatEtb(match.amountEtb)}
          </p>
        ) : null}
      </section>

      <form onSubmit={(e) => void onSend(e)} className="rounded-2xl border border-school/10 bg-surface p-3 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{t('payAmount')}</label>
            <input
              type="number"
              min={1}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-xl border border-school/20 bg-background px-3 py-2"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{t('receiptNumber')}</label>
            <input
              required
              value={receipt}
              onChange={(e) => setReceipt(e.target.value)}
              className="mt-1 w-full rounded-xl border border-school/20 bg-background px-3 py-2"
            />
          </div>
        </div>
        <label className="mt-3 block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          {t('paymentProof')} *
        </label>
        <p className={`mt-1 text-xs ${error && !proof ? 'text-accent' : 'text-muted'}`}>{t('proofHint')}</p>
        <input
          key={proofKey}
          type="file"
          accept="image/*,.pdf,application/pdf"
          required
          className="mt-2 w-full text-sm"
          onChange={(e) => void onProof(e.target.files?.[0])}
        />
        {proof ? <p className="mt-1 text-xs text-school">{proof.name}</p> : null}
        <label className="mt-3 block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{t('paymentNote')}</label>
        <textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-1 w-full rounded-xl border border-school/20 bg-background px-3 py-2"
        />
        {done ? <p className="mt-3 text-sm text-school">{done}</p> : null}
        {error ? <p className="mt-3 text-sm text-accent">{error}</p> : null}
        <button
          type="submit"
          disabled={busy || !proof}
          className="mt-4 rounded-full bg-school px-5 py-2 text-sm font-bold uppercase text-white disabled:opacity-60"
        >
          {t('sendPayment')}
        </button>
      </form>

      {kidPayments.length ? (
        <section className="overflow-hidden rounded-2xl border border-school/10 bg-surface">
          <div className="border-b border-school/10 px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">{t('yourPayments')}</p>
          </div>
          <ul className="divide-y divide-school/10">
            {kidPayments.map((row) => (
              <li key={row.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
                <div>
                  <p className="font-display text-base font-medium italic text-school-dark sm:text-xl">
                    {t(KIND_LABEL[(row.kind as FeeKind) || 'other'])}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {t(METHOD_LABEL[row.method] || 'payCbe')} · {t('receiptNumber')} {row.receiptNumber}
                    {row.proofName ? ` · ${row.proofName}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">{formatEtb(row.amountEtb)}</p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                    {row.status === 'confirmed' ? t('confirmed') : row.status === 'rejected' ? t('reject') : t('pendingReview')}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

function SummaryChip({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-school/10 bg-surface px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">{label}</p>
      <p className={`mt-1 text-lg font-bold sm:text-2xl ${tone === 'unpaid' ? 'text-accent' : 'text-foreground'}`}>{value}</p>
    </div>
  )
}
