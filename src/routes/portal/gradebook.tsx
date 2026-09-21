import { useMemo, useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useLocale } from '~/components/locale-context'
import { REPORT_TERMS, yearFromTerms, type ReportTerm, type TermScore } from '~/lib/utils'
import { createAssignmentFn, saveGradeFn, teacherDeskFn, teacherGradebookFn } from '~/server/portal/functions'

export const Route = createFileRoute('/portal/gradebook')({
  loader: async () => {
    const desk = await teacherDeskFn()
    const classId = desk.subjectClasses[0]?.id
    const book = classId ? await teacherGradebookFn({ data: { classId } }) : null
    return { classes: desk.subjectClasses, classId: classId ?? '', book }
  },
  component: GradebookPage,
})

type Book = NonNullable<Awaited<ReturnType<typeof teacherGradebookFn>>>

function cellKey(studentId: string, subjectId: string, term: ReportTerm) {
  return `${studentId}:${subjectId}:${term}`
}

function draftFromBook(book: Book | null) {
  const draft: Record<string, string> = {}
  for (const row of book?.records ?? []) {
    if (!REPORT_TERMS.includes(row.term as ReportTerm)) continue
    const official = !row.assignmentId
    const key = cellKey(row.studentId, row.subjectId, row.term as ReportTerm)
    if (official || draft[key] == null) draft[key] = String(row.score)
  }
  return draft
}

function GradebookPage() {
  const { t } = useLocale()
  const initial = Route.useLoaderData()
  const router = useRouter()
  const [classId, setClassId] = useState(initial.classId)
  const [book, setBook] = useState(initial.book)
  const [subjectId, setSubjectId] = useState(initial.book?.subjects[0]?.id ?? '')
  const [draft, setDraft] = useState(() => draftFromBook(initial.book))
  const [busy, setBusy] = useState(false)
  const labels = {
    'Term 1': t('firstTerm'),
    'Term 2': t('secondTerm'),
    'Term 3': t('thirdTerm'),
  } as const

  async function changeClass(id: string) {
    setBusy(true)
    try {
      const next = await teacherGradebookFn({ data: { classId: id } })
      setClassId(id)
      setBook(next)
      setSubjectId(next.subjects[0]?.id ?? '')
      setDraft(draftFromBook(next))
    } finally {
      setBusy(false)
    }
  }

  async function saveTerms() {
    if (!book) return
    setBusy(true)
    try {
      const tasks: Array<Promise<unknown>> = []
      for (const student of book.roster) {
        for (const subject of book.subjects.filter((item) => !subjectId || item.id === subjectId)) {
          for (const term of REPORT_TERMS) {
            const raw = draft[cellKey(student.id, subject.id, term)]?.trim()
            if (raw === '' || raw == null) continue
            const score = Number(raw)
            if (Number.isNaN(score)) continue
            tasks.push(saveGradeFn({ data: { studentId: student.id, subjectId: subject.id, score, maxScore: 100, term } }))
          }
        }
      }
      await Promise.all(tasks)
      const next = await teacherGradebookFn({ data: { classId } })
      setBook(next)
      setDraft(draftFromBook(next))
      await router.invalidate()
    } finally {
      setBusy(false)
    }
  }

  async function addAssignment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    await createAssignmentFn({
      data: {
        classId,
        subjectId: String(form.get('subjectId') || subjectId),
        title: String(form.get('title') || ''),
        description: String(form.get('description') || ''),
        dueDate: String(form.get('dueDate') || ''),
      },
    })
    e.currentTarget.reset()
    await router.invalidate()
  }

  const subjects = book?.subjects ?? []
  const activeSubject = subjects.find((item) => item.id === subjectId) ?? subjects[0]
  const roster = book?.roster ?? []

  const rows = useMemo(() => {
    if (!activeSubject) return []
    return roster.map((student) => {
      const terms = Object.fromEntries(
        REPORT_TERMS.map((term) => {
          const raw = draft[cellKey(student.id, activeSubject.id, term)]
          const match = book?.records.find((row) => row.studentId === student.id && row.subjectId === activeSubject.id && row.term === term && !row.assignmentId)
          const cell: TermScore | null = raw?.trim()
            ? { score: Number(raw), maxScore: 100 }
            : match
              ? { score: match.score, maxScore: match.maxScore }
              : null
          return [term, Number.isNaN(cell?.score) ? null : cell]
        }),
      ) as Record<ReportTerm, TermScore | null>
      return { student, terms, year: yearFromTerms(REPORT_TERMS.map((term) => terms[term])) }
    })
  }, [activeSubject, book?.records, draft, roster])

  if (!initial.classes.length) {
    return (
      <div>
        <h1 className="text-xl font-black text-school-dark sm:text-2xl">{t('portalGradebook')}</h1>
        <p className="mt-4 rounded-2xl border border-school/10 bg-surface p-4 text-sm text-muted sm:p-6">{t('noSubjectsToTeach')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-school-dark sm:text-2xl">{t('portalGradebook')}</h1>
          <p className="mt-1 text-sm text-muted">{t('yearGradeHint')}</p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void saveTerms()}
          className="rounded-full bg-school px-5 py-2 text-sm font-bold uppercase text-white disabled:opacity-60"
        >
          {t('save')}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {initial.classes.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={busy}
            onClick={() => void changeClass(item.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              classId === item.id ? 'bg-school text-white' : 'border border-school/15 bg-surface text-foreground'
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {subjects.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSubjectId(item.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              activeSubject?.id === item.id ? 'bg-school-light text-school' : 'border border-school/10 bg-surface text-muted'
            }`}
          >
            {item.nameEn}
          </button>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-school/10 bg-surface">
        <div className="border-b border-school/10 px-4 py-3 sm:px-5 sm:py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">{t('endOfTerm')}</p>
          <h2 className="font-display text-xl font-medium italic text-foreground sm:text-2xl">{activeSubject?.nameEn}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="border-b border-school/10 text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Student</th>
                {REPORT_TERMS.map((term) => (
                  <th key={term} className="px-4 py-3">
                    {labels[term]}
                  </th>
                ))}
                <th className="px-4 py-3">{t('yearGrade')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">
                    {t('noItems')}
                  </td>
                </tr>
              ) : (
                rows.map(({ student, terms, year }) => (
                  <tr key={student.id} className="border-t border-school/5">
                    <td className="px-4 py-3 font-medium">
                      {student.firstName} {student.lastName}
                    </td>
                    {REPORT_TERMS.map((term) => (
                      <td key={term} className="px-4 py-2">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          disabled={busy}
                          placeholder="—"
                          value={draft[cellKey(student.id, activeSubject?.id ?? '', term)] ?? ''}
                          onChange={(e) =>
                            setDraft((current) => ({
                              ...current,
                              [cellKey(student.id, activeSubject?.id ?? '', term)]: e.target.value,
                            }))
                          }
                          className="w-20 rounded-lg border border-school/15 bg-background px-2 py-1.5 text-sm"
                        />
                      </td>
                    ))}
                    <td className="px-4 py-3 font-bold text-school">{year ? `${year.percent} · ${year.letter}` : '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <form onSubmit={(e) => void addAssignment(e)} className="grid gap-3 rounded-2xl border border-school/10 bg-surface p-3 sm:p-6">
        <h2 className="font-bold text-school-dark">{t('portalAssignments')}</h2>
        <select name="subjectId" defaultValue={subjectId} className="rounded-xl border border-school/20 px-3 py-2">
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nameEn}
            </option>
          ))}
        </select>
        <input name="title" required placeholder={t('title')} className="rounded-xl border border-school/20 px-3 py-2" />
        <textarea name="description" placeholder={t('body')} className="rounded-xl border border-school/20 px-3 py-2" />
        <input name="dueDate" type="date" required className="rounded-xl border border-school/20 px-3 py-2" />
        <button type="submit" className="rounded-full bg-school px-4 py-2 text-sm font-bold uppercase text-white">
          {t('create')}
        </button>
      </form>
    </div>
  )
}
