import { Link, createFileRoute } from '@tanstack/react-router'
import { CtaBand, InnerSplit, PageHero } from '~/components/site-ui'
import { useLocale } from '~/components/locale-context'
import { pageCopy } from '~/lib/content'
import { IMAGES } from '~/lib/images'
import { localized } from '~/lib/i18n'
import { listStaffFn } from '~/server/public/functions'

export const Route = createFileRoute('/_site/about')({
  loader: async () => ({ staff: await listStaffFn() }),
  component: AboutPage,
})

function AboutPage() {
  const { t, locale } = useLocale()
  const { staff } = Route.useLoaderData()
  const featured = staff.filter((s) => s.featured)
  const copy = pageCopy(locale)

  return (
    <div>
      <PageHero kicker={t('aboutKicker')} title={t('aboutTitle')} subtitle={t('aboutBody')} image={IMAGES.courtyard} />
      <InnerSplit kicker={t('missionTitle')} title={t('missionTitle')} body={t('missionBody')} image={IMAGES.campus} />
      <InnerSplit reverse kicker={t('visionTitle')} title={t('visionTitle')} body={t('visionBody')} image={IMAGES.library} />
      <section className="mx-auto max-w-6xl px-8 py-16">
        <p className="gs-kicker">{t('valuesTitle')}</p>
        <h2 className="font-display mt-2 text-3xl font-semibold italic text-accent">{t('valuesTitle')}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {copy.values.map((value) => (
            <article key={value.title} className="rounded-3xl border border-school/10 p-6">
              <h3 className="font-display text-xl font-semibold italic text-school-dark">{value.title}</h3>
              <p className="mt-2 text-sm text-zinc-600">{value.body}</p>
            </article>
          ))}
        </div>
      </section>
      <InnerSplit
        kicker="Outdoors"
        title="Service and the highlands"
        body="Expeditions, city service, and a courtyard that stays loud after the last bell. Character is practised beyond the timetable."
        image={IMAGES.highlands}
      >
        <Link to="/life" className="gs-split-cta">
          Campus life
        </Link>
      </InnerSplit>
      <section className="mx-auto max-w-6xl px-8 py-16">
        <p className="gs-kicker">{t('historyTitle')}</p>
        <h2 className="font-display mt-2 text-3xl font-semibold italic text-accent">{t('historyTitle')}</h2>
        <ol className="mt-10 space-y-8 border-l-2 border-accent/40 pl-6">
          {copy.history.map((item) => (
            <li key={item.year}>
              <p className="text-sm font-bold uppercase tracking-widest text-accent">{item.year}</p>
              <h3 className="font-display mt-1 text-xl font-semibold text-school-dark">{item.title}</h3>
              <p className="mt-2 max-w-2xl text-zinc-600">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>
      <InnerSplit kicker={t('principalTitle')} title={t('principalName')} body={t('principalBody')} image={IMAGES.principal} />
      <section className="mx-auto max-w-6xl px-8 py-16">
        <h2 className="font-display text-2xl font-semibold italic text-accent">{t('staffTitle')}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {featured.map((person) => (
            <Link key={person.id} to="/staff" className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="font-display text-lg font-semibold text-school-dark">{person.fullName}</p>
              <p className="mt-1 text-sm text-accent">
                {localized(locale, { en: person.titleEn, am: person.titleAm, om: person.titleOm })}
              </p>
            </Link>
          ))}
        </div>
      </section>
      <CtaBand
        title={t('seeCampus')}
        body={t('saturdayOpen')}
        primary={{ to: '/admissions/visit', label: t('bookAVisit') }}
        secondary={{ to: '/admissions/apply', label: t('navApply') }}
      />
    </div>
  )
}
