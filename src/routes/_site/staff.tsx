import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PageHero } from '~/components/site-ui'
import { useLocale } from '~/components/locale-context'
import { localized } from '~/lib/i18n'
import { IMAGES } from '~/lib/images'
import { listStaffFn } from '~/server/public/functions'

export const Route = createFileRoute('/_site/staff')({
  loader: async () => ({ staff: await listStaffFn() }),
  component: StaffPage,
})

function StaffPage() {
  const { t, locale } = useLocale()
  const { staff } = Route.useLoaderData()
  const depts = useMemo(() => ['all', ...Array.from(new Set(staff.map((s) => s.department)))], [staff])
  const [dept, setDept] = useState('all')
  const shown = dept === 'all' ? staff : staff.filter((s) => s.department === dept)

  return (
    <div>
      <PageHero kicker={t('navStaff')} title={t('staffTitle')} image={IMAGES.classroom} />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap gap-2">
          {depts.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDept(d)}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase ${
                dept === d ? 'bg-school text-white' : 'bg-white text-school'
              }`}
            >
              {d === 'all' ? t('filterAll') : d}
            </button>
          ))}
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {shown.map((person) => (
            <article key={person.id} className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase text-accent">{person.department}</p>
              <h2 className="font-display mt-1 text-xl font-semibold text-school-dark">{person.fullName}</h2>
              <p className="mt-1 text-sm text-school">
                {localized(locale, { en: person.titleEn, am: person.titleAm, om: person.titleOm })}
              </p>
              <p className="mt-3 text-sm text-zinc-600">
                {localized(locale, { en: person.bioEn, am: person.bioAm, om: person.bioOm })}
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
