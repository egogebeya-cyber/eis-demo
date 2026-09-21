import { createFileRoute } from '@tanstack/react-router'
import { CtaBand, InnerSplit, PageHero } from '~/components/site-ui'
import { useLocale } from '~/components/locale-context'
import { pageCopy } from '~/lib/content'
import { IMAGES } from '~/lib/images'

export const Route = createFileRoute('/_site/athletics')({
  component: AthleticsPage,
})

function AthleticsPage() {
  const { t, locale } = useLocale()
  const copy = pageCopy(locale)
  return (
    <div>
      <PageHero kicker={t('navLife')} title={t('navAthletics')} subtitle={t('lifeTitle')} image={IMAGES.sports} />
      <InnerSplit
        kicker="Sport"
        title="Every student plays"
        body="Twice a week from KG. From Grade 6 we add house competitions and city fixtures. The south field hosts football, athletics, and Sports Day."
        image={IMAGES.sports}
      />
      <section className="mx-auto max-w-6xl px-8 py-16">
        <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {copy.sports.map((item) => (
            <li key={item} className="rounded-3xl bg-white px-6 py-5 font-semibold text-school-dark shadow-sm">
              {item}
            </li>
          ))}
        </ul>
        <h2 className="font-display mt-14 text-2xl font-semibold italic text-accent">{t('housesTitle')}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {copy.houses.map((house) => (
            <article key={house.name} className="rounded-3xl border border-school/10 p-6">
              <h3 className="font-display text-xl font-semibold text-school-dark">{house.name}</h3>
              <p className="mt-2 text-sm text-zinc-600">{house.motto}</p>
            </article>
          ))}
        </div>
      </section>
      <CtaBand
        title={t('seeCampus')}
        primary={{ to: '/events', label: t('navEvents') }}
        secondary={{ to: '/admissions/visit', label: t('bookAVisit') }}
      />
    </div>
  )
}
