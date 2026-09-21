import { Link, createFileRoute } from '@tanstack/react-router'
import { CtaBand, InnerSplit, PageHero } from '~/components/site-ui'
import { IMAGES } from '~/lib/images'

export const Route = createFileRoute('/_site/junior')({
  component: JuniorSchoolPage,
})

function JuniorSchoolPage() {
  return (
    <div>
      <PageHero
        kicker="Junior School"
        title="A school of its own"
        subtitle="KG to Grade 5. Its own rooms, its own rhythm, its own teachers — not a waiting room for the seniors."
        image={IMAGES.kids}
      />
      <InnerSplit
        kicker="KG"
        title="Early Years"
        body="Play, language, and number sense in small rooms with two teachers. Children learn to try, wait, and belong — with a garden and rest after lunch."
        image={IMAGES.kids}
      />
      <InnerSplit
        reverse
        kicker="1–5"
        title="Lower School"
        body="English-medium literacy and numeracy, specialist art, music, and PE. Homeroom teachers stay with a class for two years."
        image={IMAGES.classroom}
      />
      <div className="px-8 pb-16">
        <Link to="/senior" className="gs-split-cta">
          Senior School
        </Link>
      </div>
      <CtaBand
        title="Come and see Junior School"
        primary={{ to: '/admissions/visit', label: 'Book a visit' }}
        secondary={{ to: '/admissions/apply', label: 'Apply' }}
      />
    </div>
  )
}
