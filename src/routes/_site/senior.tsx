import { Link, createFileRoute } from '@tanstack/react-router'
import { CtaBand, InnerSplit, PageHero } from '~/components/site-ui'
import { IMAGES } from '~/lib/images'

export const Route = createFileRoute('/_site/senior')({
  component: SeniorSchoolPage,
})

function SeniorSchoolPage() {
  return (
    <div>
      <PageHero
        kicker="Senior School"
        title="A school of its own"
        subtitle="Grade 6 to Sixth Form. Its own labs, its own timetable, its own path to university — not a continuation of Junior School by another name."
        image={IMAGES.lab}
      />
      <InnerSplit
        kicker="6–10"
        title="Upper School"
        body="Subject teachers, laboratories, debate, and the first real choice of clubs. Advisory groups of fourteen keep pastoral care close."
        image={IMAGES.lab}
      />
      <InnerSplit
        id="sixth-form"
        reverse
        kicker="11–12"
        title="Sixth Form"
        body="Cambridge-aligned sciences and humanities, university counselling from Grade 10, and a counsellor who knows every leaver by name."
        image={IMAGES.library}
      >
        <Link to="/academics" hash="sixth-form" className="gs-split-cta">
          Academic curriculum
        </Link>
      </InnerSplit>
      <div className="px-8 pb-16">
        <Link to="/junior" className="gs-split-cta">
          Junior School
        </Link>
      </div>
      <CtaBand
        title="Come and see Senior School"
        primary={{ to: '/admissions/visit', label: 'Book a visit' }}
        secondary={{ to: '/admissions/apply', label: 'Apply' }}
      />
    </div>
  )
}
