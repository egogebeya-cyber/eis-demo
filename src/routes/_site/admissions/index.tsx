import { Link, createFileRoute } from '@tanstack/react-router'
import { CtaBand, InnerSplit, PageHero } from '~/components/site-ui'
import { useLocale } from '~/components/locale-context'
import { pageCopy } from '~/lib/content'
import { IMAGES, SCHOOL } from '~/lib/images'

export const Route = createFileRoute('/_site/admissions/')({
  component: AdmissionsPage,
})

function AdmissionsPage() {
  const { t, locale } = useLocale()
  const copy = pageCopy(locale)
  const steps = [
    { title: t('step1'), body: t('step1b') },
    { title: t('step2'), body: t('step2b') },
    { title: t('step3'), body: t('step3b') },
  ]

  return (
    <div>
      <PageHero
        kicker={t('admissionsKicker')}
        title={t('admissionsTitle')}
        subtitle={t('saturdayOpen')}
        image={IMAGES.assembly}
      >
        <div className="gs-cta-row">
          <Link to="/admissions/apply" className="gs-feature-cta">
            {t('navApply')}
          </Link>
          <Link to="/admissions/visit" className="gs-split-cta">
            {t('bookAVisit')}
          </Link>
        </div>
      </PageHero>

      <section className="gs-know-grid">
        <article className="gs-know-card">
          <h3>Book a visit</h3>
          <p>Saturday open campus, weekday private tours, and taster mornings in the classroom your child would join.</p>
          <Link to="/admissions/visit" className="gs-split-cta">
            Visit campus
          </Link>
        </article>
        <article className="gs-know-card">
          <h3>Taster days</h3>
          <p>Spend a morning with the year group. Meet tutors, sit a lesson, and eat lunch in the courtyard.</p>
          <Link to="/admissions/visit" hash="taster" className="gs-split-cta">
            Request a taster
          </Link>
        </article>
        <article className="gs-know-card">
          <h3>Enquire</h3>
          <p>A short form to the admissions office. We reply with next dates, fees outline, and a visit slot.</p>
          <Link to="/contact" className="gs-split-cta">
            Contact us
          </Link>
        </article>
      </section>

      <InnerSplit
        kicker="How to join"
        title={t('admissionsSteps')}
        body="Three steps from first enquiry to a place. We keep the paperwork short and the conversation long."
        image={IMAGES.courtyard}
      >
        <ol className="mt-6 space-y-3 text-sm text-zinc-600">
          {steps.map((step, i) => (
            <li key={step.title}>
              <strong className="text-accent">{i + 1}. {step.title}</strong> — {step.body}
            </li>
          ))}
        </ol>
      </InnerSplit>

      <section className="mx-auto max-w-6xl px-8 py-16">
        <h2 className="font-display text-3xl font-semibold italic text-accent">{t('timelineTitle')}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {copy.timeline.map((item) => (
            <article key={item.title} className="rounded-3xl border border-school/10 bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-accent">{item.when}</p>
              <h3 className="mt-2 font-display text-xl font-semibold text-school-dark">{item.title}</h3>
              <p className="mt-2 text-sm text-zinc-600">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <InnerSplit
        reverse
        kicker="Fees"
        title="Enquire for a breakdown"
        body="Tuition is set by stage. Families receive a written schedule after a visit. Current families use the parent portal for invoices."
        image={IMAGES.library}
      >
        <div className="gs-cta-row">
          <Link to="/fees" className="gs-feature-cta">
            Fees
          </Link>
          <Link to="/login" search={{ role: 'parent' }} className="gs-split-cta">
            Parent portal
          </Link>
        </div>
      </InnerSplit>

      <section className="mx-auto max-w-6xl px-8 py-16">
        <h2 className="font-display text-3xl font-semibold italic text-accent">{t('admissionsOffice')}</h2>
        <p className="mt-3 max-w-2xl text-zinc-600">{t('admissionsOfficeBody')}</p>
        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <a href={SCHOOL.phoneHref} className="font-semibold text-accent hover:underline">
            {t('phone')} · {SCHOOL.phone}
          </a>
          <a href={`mailto:${SCHOOL.admissionsEmail}`} className="font-semibold text-accent hover:underline">
            {t('email')} · {SCHOOL.admissionsEmail}
          </a>
        </div>
      </section>
      <CtaBand
        title={t('applyKicker')}
        body={t('saturdayOpen')}
        primary={{ to: '/admissions/apply', label: t('navApply') }}
        secondary={{ to: '/admissions/visit', label: t('bookAVisit') }}
      />
    </div>
  )
}
