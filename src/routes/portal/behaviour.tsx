import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useLocale } from '~/components/locale-context'
import { SlotCard } from '~/components/slot-card'
import type { TranslationKey } from '~/lib/i18n'
import {
  BEHAVIOUR_BAD,
  BEHAVIOUR_GOOD,
  BEHAVIOUR_START,
  formatDate,
  type BehaviourKind,
} from '~/lib/utils'
import { getCurrentUser } from '~/server/auth/functions'
import {
  classBehaviourFn,
  listMyStudentsFn,
  logBehaviourFn,
  studentBehaviourFn,
  teacherDeskFn,
} from '~/server/portal/functions'

export const Route = createFileRoute('/portal/behaviour')({
  loader: async () => {
    const user = await getCurrentUser()
    if (user?.role === 'teacher') {
      const desk = await teacherDeskFn()
      const classId = desk.attendanceClasses[0]?.id
      const board = classId ? await classBehaviourFn({ data: { classId } }) : null
      return { mode: 'teacher' as const, classes: desk.attendanceClasses, board }
    }
    const kids = await listMyStudentsFn()
    const reports = await Promise.all(
      kids.map(async (kid) => {
        const board = await studentBehaviourFn({ data: { studentId: kid.id } })
        return { kid, ...board }
      }),
    )
    return { mode: 'family' as const, reports }
  },
  component: BehaviourPage,
})

function categoryKey(category: string): TranslationKey {
  const item = [...BEHAVIOUR_GOOD, ...BEHAVIOUR_BAD].find((row) => row.id === category)
  return (item?.label ?? 'portalBehaviour') as TranslationKey
}

function BehaviourPage() {
  const data = Route.useLoaderData()
  if (data.mode === 'teacher') return <TeacherBehaviour classes={data.classes} board={data.board} />
  return <FamilyBehaviour reports={data.reports} />
}

type TeacherClass = { id: string; name: string; isHomeroom?: boolean; subjects?: Array<{ id: string; name: string }> }
type BehaviourIncident = {
  id: string
  studentId?: string
  kind: string
  category: string
  points: number
  note: string
  status: string
  createdAt: Date
  teacherName: string
}
type TeacherBoard = {
  classId: string
  term: string
  students: Array<{ id: string; firstName: string; lastName: string; score: number }>
  incidents: BehaviourIncident[]
}
type FamilyReport = {
  kid: { id: string; firstName: string; lastName: string; className: string | null }
  term: string
  score: number
  incidents: BehaviourIncident[]
}

function TeacherBehaviour({ classes, board: initialBoard }: { classes: TeacherClass[]; board: TeacherBoard | null }) {
  const { t } = useLocale()
  const [classId, setClassId] = useState(initialBoard?.classId ?? classes[0]?.id ?? '')
  const [board, setBoard] = useState(initialBoard)
  const [studentId, setStudentId] = useState(initialBoard?.students[0]?.id ?? '')
  const [kind, setKind] = useState<BehaviourKind>('add')
  const [category, setCategory] = useState(BEHAVIOUR_GOOD[0].id)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState('')
  const [error, setError] = useState('')
  const current = board?.students.find((row) => row.id === studentId) ?? board?.students[0]
  const presets = kind === 'add' ? BEHAVIOUR_GOOD : BEHAVIOUR_BAD
  const history = (board?.incidents ?? []).filter((row) => row.studentId === current?.id)

  async function refresh(id: string, keepStudent?: string) {
    const next = await classBehaviourFn({ data: { classId: id } })
    setBoard(next)
    const stay = keepStudent && next.students.some((row) => row.id === keepStudent) ? keepStudent : next.students[0]?.id ?? ''
    setStudentId(stay)
  }

  async function loadClass(id: string) {
    setClassId(id)
    setDone('')
    setError('')
    await refresh(id)
  }

  function pickKind(next: BehaviourKind) {
    setKind(next)
    setCategory((next === 'add' ? BEHAVIOUR_GOOD : BEHAVIOUR_BAD)[0].id)
  }

  function pickPreset(next: BehaviourKind, id: string) {
    setKind(next)
    setCategory(id)
  }

  async function onSend(e: React.FormEvent) {
    e.preventDefault()
    if (!current) return
    setBusy(true)
    setError('')
    setDone('')
    try {
      await logBehaviourFn({ data: { studentId: current.id, kind, category, note } })
      setNote('')
      setDone(t('pointsSent'))
      await refresh(classId, current.id)
    } catch {
      setError(t('sendFailed'))
    } finally {
      setBusy(false)
    }
  }

  if (!classes.length) {
    return (
      <div>
        <h1 className="text-xl font-black text-school-dark sm:text-2xl">{t('portalBehaviour')}</h1>
        <p className="mt-4 text-sm text-muted">{t('noItems')}</p>
      </div>
    )
  }

  const selected = presets.find((item) => item.id === category)
  const field =
    'mt-1.5 w-full rounded-xl border border-school/20 bg-background px-3 py-2.5 text-sm font-medium text-foreground'

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-black text-school-dark sm:text-2xl">{t('portalBehaviour')}</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">{t('behaviourHint')}</p>
        </div>
        {board ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">{board.term}</p>
        ) : null}
      </div>

      {current ? (
        <form onSubmit={(e) => void onSend(e)} className="overflow-hidden rounded-2xl border border-school/10 bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-school/10 px-4 py-3 sm:px-5">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{t('behaviourScore')}</p>
              <p className="truncate font-display text-xl font-medium italic text-school-dark">
                {current.firstName} {current.lastName}
              </p>
            </div>
            <p className={`font-display text-3xl font-medium italic leading-none ${scoreTone(current.score)}`}>
              {current.score}
              <span className="text-base text-muted"> / {BEHAVIOUR_START}</span>
            </p>
          </div>

          <div className="space-y-4 p-4 sm:p-5">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{t('pickClass')}</p>
              <div className="slot-grid">
                {classes.map((item) => (
                  <SlotCard
                    key={item.id}
                    kicker={item.isHomeroom ? t('homeroomLabel') : t('yourSubjects')}
                    title={item.name}
                    hint={item.subjects?.map((row) => row.name).join(', ') || item.name}
                    on={item.id === classId}
                    onClick={() => void loadClass(item.id)}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{t('behaviourScore')}</p>
              <div className="slot-grid">
                {(board?.students ?? []).map((row) => (
                  <SlotCard
                    key={row.id}
                    kicker={t('behaviourScore')}
                    title={`${row.firstName} ${row.lastName}`}
                    hint={`${row.score} / ${BEHAVIOUR_START}`}
                    on={row.id === current.id}
                    onClick={() => setStudentId(row.id)}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => pickKind('add')}
                className={`rounded-xl px-3 py-2.5 text-sm font-semibold ${
                  kind === 'add' ? 'bg-emerald-700 text-white' : 'border border-school/15 bg-background text-muted'
                }`}
              >
                {t('goodCharacter')}
              </button>
              <button
                type="button"
                onClick={() => pickKind('deduct')}
                className={`rounded-xl px-3 py-2.5 text-sm font-semibold ${
                  kind === 'deduct' ? 'bg-red-700 text-white' : 'border border-school/15 bg-background text-muted'
                }`}
              >
                {t('deductions')}
              </button>
            </div>

            <label className="block sm:col-span-2">
              <span className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${kind === 'add' ? 'text-emerald-700' : 'text-red-700'}`}>
                {kind === 'add' ? t('goodCharacter') : t('deductions')}
                {selected ? ` · ${kind === 'add' ? '+' : '-'}${selected.points}` : ''}
              </span>
              <select
                value={category}
                onChange={(e) => pickPreset(kind, e.target.value)}
                className={`${field} ${kind === 'add' ? 'border-emerald-600' : 'border-red-600'}`}
              >
                {presets.map((item) => (
                  <option key={item.id} value={item.id}>
                    {kind === 'add' ? '+' : '-'}
                    {item.points} · {t(item.label)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block sm:col-span-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{t('paymentNote')}</span>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={field}
              />
            </label>

            {done ? <p className="text-sm text-emerald-700 sm:col-span-2">{done}</p> : null}
            {error ? <p className="text-sm text-accent sm:col-span-2">{error}</p> : null}

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={busy}
                className="rounded-full bg-school px-5 py-2 text-sm font-bold uppercase text-white disabled:opacity-60"
              >
                {t('sendPoints')}
              </button>
            </div>
          </div>
        </form>
      ) : null}

      {current ? <TeacherLog rows={history} /> : null}
    </div>
  )
}

function FamilyBehaviour({ reports }: { reports: FamilyReport[] }) {
  const { t } = useLocale()
  const [kidId, setKidId] = useState(reports[0]?.kid.id ?? '')
  const current = reports.find((row) => row.kid.id === kidId) ?? reports[0]

  if (!current) {
    return (
      <div>
        <h1 className="text-xl font-black text-school-dark sm:text-2xl">{t('portalBehaviour')}</h1>
        <p className="mt-4 text-sm text-muted">{t('noItems')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-school-dark sm:text-2xl">{t('portalBehaviour')}</h1>
        <p className="mt-1 text-sm text-muted">{t('behaviourHint')}</p>
      </div>
      {reports.length > 1 ? (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{t('pickChild')}</p>
          <div className="slot-grid">
            {reports.map((row) => (
              <SlotCard
                key={row.kid.id}
                kicker={t('children')}
                title={`${row.kid.firstName} ${row.kid.lastName}`}
                hint={`${row.kid.className} · ${row.score} / ${BEHAVIOUR_START}`}
                on={row.kid.id === current.kid.id}
                onClick={() => setKidId(row.kid.id)}
              />
            ))}
          </div>
        </div>
      ) : null}
      <div className="rounded-2xl border border-school/10 bg-surface px-3 py-3 sm:px-5 sm:py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
          {current.term} · {current.kid.firstName} {current.kid.lastName}
        </p>
        <p className="mt-1.5 font-display text-2xl font-medium italic text-school-dark sm:text-4xl">
          {current.score} / {BEHAVIOUR_START}
        </p>
        <p className="mt-1 text-sm text-muted">{t('behaviourScore')}</p>
      </div>
      <IncidentLists rows={current.incidents.filter((row) => row.status === 'active')} />
    </div>
  )
}

function scoreTone(score: number) {
  if (score >= 90) return 'text-emerald-700'
  if (score >= 70) return 'text-amber-700'
  return 'text-red-700'
}

function TeacherLog({ rows }: { rows: BehaviourIncident[] }) {
  const { t, locale } = useLocale()
  return (
    <section className="overflow-hidden rounded-2xl border border-school/10 bg-surface">
      <div className="border-b border-school/10 px-4 py-3 sm:px-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{t('portalBehaviour')}</p>
      </div>
      {rows.length ? (
        <ul className="divide-y divide-school/10">
          {rows.map((row) => {
            const good = row.kind === 'add'
            return (
              <li key={row.id} className="flex items-start justify-between gap-3 px-4 py-3 sm:px-5">
                <div className="min-w-0">
                  <p className="font-display text-base font-medium italic text-school-dark">{t(categoryKey(row.category))}</p>
                  <p className="mt-0.5 text-sm text-muted">
                    {row.teacherName} · {formatDate(row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt), locale)}
                    {row.note ? ` · ${row.note}` : ''}
                    {row.status === 'reversed' ? ` · ${t('reversed')}` : ''}
                  </p>
                </div>
                <p className={`shrink-0 text-lg font-bold ${good ? 'text-emerald-700' : 'text-red-700'}`}>
                  {good ? '+' : '-'}
                  {row.points}
                </p>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="px-4 py-3 text-sm text-muted sm:px-5">{t('noItems')}</p>
      )}
    </section>
  )
}

function IncidentLists({ rows }: { rows: BehaviourIncident[] }) {
  const { t, locale } = useLocale()
  const good = useMemo(() => rows.filter((row) => row.kind === 'add'), [rows])
  const bad = useMemo(() => rows.filter((row) => row.kind === 'deduct'), [rows])

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <IncidentColumn title={t('goodCharacter')} tone="good" rows={good} empty={t('noItems')} locale={locale} t={t} />
      <IncidentColumn title={t('deductions')} tone="bad" rows={bad} empty={t('noItems')} locale={locale} t={t} />
    </div>
  )
}

function IncidentColumn({
  title,
  tone,
  rows,
  empty,
  locale,
  t,
}: {
  title: string
  tone: 'good' | 'bad'
  rows: BehaviourIncident[]
  empty: string
  locale: string
  t: (key: TranslationKey) => string
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-school/10 bg-surface">
      <div className={`border-b px-5 py-4 ${tone === 'good' ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
        <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${tone === 'good' ? 'text-emerald-800' : 'text-red-800'}`}>
          {title}
        </p>
      </div>
      {rows.length ? (
        <ul className="divide-y divide-school/10">
          {rows.map((row) => (
            <li key={row.id} className="flex items-start justify-between gap-3 px-5 py-4">
              <div>
                <p className="font-display text-base font-medium italic text-school-dark sm:text-xl">{t(categoryKey(row.category))}</p>
                <p className="mt-1 text-sm text-muted">
                  {row.teacherName} · {formatDate(row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt), locale)}
                  {row.note ? ` · ${row.note}` : ''}
                  {row.status === 'reversed' ? ` · ${t('reversed')}` : ''}
                </p>
              </div>
              <p className={`text-lg font-bold sm:text-2xl ${tone === 'good' ? 'text-emerald-700' : 'text-red-700'}`}>
                {tone === 'good' ? '+' : '-'}
                {row.points}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-5 py-4 text-sm text-muted">{empty}</p>
      )}
    </section>
  )
}
