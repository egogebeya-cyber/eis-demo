import { Link, createFileRoute } from '@tanstack/react-router'
import { UniversityLogoWall } from '~/components/home-interactive'
import { CtaBand, InnerSplit, PageHero } from '~/components/site-ui'
import { useLocale } from '~/components/locale-context'
import { pageCopy } from '~/lib/content'
import { IMAGES } from '~/lib/images'

export const Route = createFileRoute('/_site/academics')({
  component: AcademicsPage,
})

function AcademicsPage() {
  const { t, locale } = useLocale()
  const copy = pageCopy(locale)

  return (
    <div>
      <PageHero kicker={t('academicsKicker')} title={t('academicsTitle')} subtitle={t('accreditation')} image={IMAGES.classroom} />
      {copy.divisions.map((band, i) => (
        <InnerSplit
          key={band.grades}
          reverse={i % 2 === 1}
          kicker={band.grades}
          title={band.title}
          body={band.body}
          image={band.image}
        />
      ))}
      <InnerSplit
        id="sixth-form"
        kicker="Ages 16–18"
        title="Sixth Form"
        body="Cambridge-aligned sciences and humanities, university counselling from Grade 10, and a counsellor who knows every leaver by name. The last two years are a school of their own."
        image={IMAGES.library}
      >
        <Link to="/senior" className="gs-split-cta">
          Senior School
        </Link>
      </InnerSplit>
      <InnerSplit
        id="counselling"
        reverse
        kicker={t('counselTitle')}
        title={t('resultsTitle')}
        body={`${t('counselBody')} ${t('resultsBody')}`}
        image={IMAGES.lab}
      />
      <section className="mx-auto max-w-6xl px-8 py-16">
        <p className="gs-kicker">{t('destinationsKicker')}</p>
        <h2 className="font-display mt-2 text-3xl font-semibold italic text-accent">{t('destinationsTitle')}</h2>
        <div className="mt-8">
          <UniversityLogoWall items={copy.destinations} />
        </div>
        <div className="mt-12 gs-cta-row">
          <Link to="/staff" className="gs-feature-cta">
            {t('navStaff')}
          </Link>
          <Link to="/admissions" className="gs-split-cta">
            {t('navAdmissions')}
          </Link>
        </div>
      </section>
      <CtaBand
        title={t('seeCampus')}
        primary={{ to: '/admissions/apply', label: t('navApply') }}
        secondary={{ to: '/admissions/visit', label: t('bookAVisit') }}
      />
    </div>
  )
}
