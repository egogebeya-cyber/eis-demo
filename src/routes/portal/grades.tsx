import { createFileRoute } from '@tanstack/react-router'
import { useLocale } from '~/components/locale-context'
import { formatTermScore, REPORT_TERMS, subjectTermReports } from '~/lib/utils'
import { listMyStudentsFn, studentGradesFn } from '~/server/portal/functions'

export const Route = createFileRoute('/portal/grades')({
  loader: async () => {
    const kids = await listMyStudentsFn()
    const reports = await Promise.all(
      kids.map(async (kid) => {
        const { rows } = await studentGradesFn({ data: { studentId: kid.id } })
        return { kid, rows }
      }),
    )
    return { reports }
  },
  component: GradesPage,
})

function GradesPage() {
  const { t } = useLocale()
  const { reports } = Route.useLoaderData()
  const labels = {
    'Term 1': t('firstTerm'),
    'Term 2': t('secondTerm'),
    'Term 3': t('thirdTerm'),
  } as const

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-black text-school-dark sm:text-2xl">{t('portalGrades')}</h1>
        <p className="mt-1 text-sm text-muted">{t('yearGradeHint')}</p>
      </div>
      {reports.length === 0 ? <p className="text-sm text-muted">{t('noItems')}</p> : null}
      {reports.map(({ kid, rows }) => {
        const subjects = subjectTermReports(rows)
        return (
          <section key={kid.id} className="overflow-hidden rounded-2xl border border-school/10 bg-surface">
            <div className="border-b border-school/10 px-4 py-3 sm:px-5 sm:py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">{kid.className}</p>
              <h2 className="font-display text-xl font-medium italic text-foreground sm:text-2xl">
                {kid.firstName} {kid.lastName}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead className="border-b border-school/10 text-xs uppercase text-muted">
                  <tr>
                    <th className="px-4 py-3">{t('subject')}</th>
                    {REPORT_TERMS.map((term) => (
                      <th key={term} className="px-4 py-3">
                        {labels[term]}
                      </th>
                    ))}
                    <th className="px-4 py-3">{t('yearGrade')}</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted">
                        {t('noItems')}
                      </td>
                    </tr>
                  ) : (
                    subjects.map((item) => (
                      <tr key={item.subject} className="border-t border-school/5">
                        <td className="px-4 py-3 font-medium text-foreground">{item.subject}</td>
                        {REPORT_TERMS.map((term) => (
                          <td key={term} className="px-4 py-3">
                            {formatTermScore(item.terms[term])}
                          </td>
                        ))}
                        <td className="px-4 py-3 font-bold text-school">
                          {item.year ? `${item.year.percent} · ${item.year.letter}` : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )
      })}
    </div>
  )
}
