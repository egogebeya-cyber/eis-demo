import { Link, createFileRoute } from '@tanstack/react-router'
import { CtaBand, InnerSplit, PageHero } from '~/components/site-ui'
import { useLocale } from '~/components/locale-context'
import { pageCopy } from '~/lib/content'
import { IMAGES } from '~/lib/images'

export const Route = createFileRoute('/_site/life')({
  component: LifePage,
})

function LifePage() {
  const { t, locale } = useLocale()
  const copy = pageCopy(locale)

  return (
    <div>
      <PageHero kicker={t('lifeKicker')} title={t('lifeTitle')} subtitle={t('pastoralBody')} image={IMAGES.sports} />
      <InnerSplit
        kicker="Campus"
        title="A courtyard that stays loud"
        body="Day school on Bole Road. Houses, clubs, and a south field that fills after the last bell. The campus is small enough that every child is known."
        image={IMAGES.campus}
      />
      <InnerSplit
        id="pastoral"
        reverse
        kicker="Pastoral"
        title={t('pastoralTitle')}
        body={t('pastoralBody')}
        image={IMAGES.care}
      />
      <InnerSplit
        kicker="Outdoors"
        title="Highlands, service, expeditions"
        body="Lessons leave the corridor. Service in the city, overnight treks on the escarpment, and a July highland course. Character is practised, not announced."
        image={IMAGES.highlands}
      >
        <Link to="/about" className="gs-split-cta">
          Why EIS
        </Link>
      </InnerSplit>
      <section className="mx-auto max-w-6xl px-8 py-16">
        <h2 className="font-display text-3xl font-semibold italic text-accent">{t('housesTitle')}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {copy.houses.map((house) => (
            <article key={house.name} className="rounded-3xl bg-white p-8 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-accent">{house.colour}</p>
              <h3 className="font-display mt-2 text-2xl font-semibold text-school-dark">{house.name}</h3>
              <p className="mt-2 text-zinc-600">{house.motto}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="gs-know-grid">
        <article className="gs-know-card">
          <h3>{t('clubsTitle')}</h3>
          <ul className="mt-4 space-y-2 text-zinc-600">
            {copy.clubs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="gs-know-card">
          <h3>{t('sportsTitle')}</h3>
          <ul className="mt-4 space-y-2 text-zinc-600">
            {copy.sports.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Link to="/athletics" className="gs-split-cta">
            {t('more')}
          </Link>
        </article>
        <article className="gs-know-card">
          <h3>{t('artsTitle')}</h3>
          <ul className="mt-4 space-y-2 text-zinc-600">
            {copy.artsList.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Link to="/arts" className="gs-split-cta">
            {t('more')}
          </Link>
        </article>
      </section>
      <section id="summer" className="gs-inner-split">
        <div className="gs-inner-copy">
          <p className="gs-kicker">Summer</p>
          <h2>Holiday programme</h2>
          <p>
            Two-week courses on campus in July: English, sport, art, and a highland overnight. Open to EIS families and
            visiting students.
          </p>
          <Link to="/contact" className="gs-feature-cta">
            Enquire
          </Link>
        </div>
        <div className="gs-inner-media">
          <img src={IMAGES.highlands} alt="" />
        </div>
      </section>
      <CtaBand
        title={t('seeCampus')}
        primary={{ to: '/gallery', label: t('navGallery') }}
        secondary={{ to: '/admissions/visit', label: t('bookAVisit') }}
      />
    </div>
  )
}
