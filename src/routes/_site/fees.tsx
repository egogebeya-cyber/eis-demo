import { Link, createFileRoute } from '@tanstack/react-router'
import { CtaBand, InnerSplit, PageHero } from '~/components/site-ui'
import { IMAGES, SCHOOL } from '~/lib/images'

export const Route = createFileRoute('/_site/fees')({
  component: FeesPage,
})

function FeesPage() {
  return (
    <div>
      <PageHero
        kicker="Admissions"
        title="Fees"
        subtitle="A day-school education in Addis Ababa. We share a full breakdown on enquiry — sibling reductions, lunch, and transport are not one-size-fits-all."
        image={IMAGES.library}
      />
      <InnerSplit
        kicker="Enquire"
        title="Ask for a breakdown"
        body="Tuition varies by stage. Families receive a written schedule covering tuition, lunch, and optional transport after a visit or a short enquiry. Existing families see invoices in the parent portal."
        image={IMAGES.assembly}
      >
        <div className="gs-cta-row">
          <Link to="/contact" className="gs-feature-cta">
            Enquire
          </Link>
          <Link to="/login" search={{ role: 'parent' }} className="gs-split-cta">
            Parent portal
          </Link>
        </div>
      </InnerSplit>
      <section className="mx-auto max-w-4xl px-8 py-16">
        <p className="gs-kicker">Admissions office</p>
        <h2 className="font-display text-3xl font-semibold italic text-accent">We will talk you through it</h2>
        <p className="mt-4 max-w-2xl text-zinc-600">
          Saturday open campus at 10:00 in term time. Mid-week conversations by appointment. WhatsApp or email
          admissions if you need a same-week reply.
        </p>
        <p className="mt-6 text-sm">
          <a className="font-bold text-accent" href={`mailto:${SCHOOL.admissionsEmail}`}>
            {SCHOOL.admissionsEmail}
          </a>
          {' · '}
          <a className="font-bold text-accent" href={SCHOOL.phoneHref}>
            {SCHOOL.phone}
          </a>
        </p>
      </section>
      <CtaBand
        title="Book a Saturday visit"
        body="See the courtyard, then ask for the numbers that match your child’s stage."
        primary={{ to: '/admissions/visit', label: 'Book a visit' }}
        secondary={{ to: '/admissions/apply', label: 'Apply' }}
      />
    </div>
  )
}
