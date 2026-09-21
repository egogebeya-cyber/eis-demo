import { Link, createFileRoute } from '@tanstack/react-router'
import { CtaBand, PageHero } from '~/components/site-ui'
import { useLocale } from '~/components/locale-context'
import { pageCopy } from '~/lib/content'
import { IMAGES } from '~/lib/images'

export const Route = createFileRoute('/_site/tour')({
  component: TourPage,
})

function TourPage() {
  const { t, locale } = useLocale()
  const copy = pageCopy(locale)
  return (
    <div>
      <PageHero kicker={t('navTour')} title={t('tourTitle')} subtitle={t('saturdayOpen')} image={IMAGES.campus} />
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-16">
        {copy.tourStops.map((stop, i) => (
          <article key={stop.title} className={`grid overflow-hidden rounded-3xl bg-white shadow-sm md:grid-cols-2 ${i % 2 ? 'md:[&>img]:order-2' : ''}`}>
            <img src={stop.image} alt="" className="h-64 w-full object-cover md:h-full" />
            <div className="p-8">
              <p className="text-xs font-bold uppercase tracking-widest text-accent">{i + 1}</p>
              <h2 className="font-display mt-2 text-2xl font-semibold text-school-dark">{stop.title}</h2>
              <p className="mt-3 text-zinc-600">{stop.body}</p>
            </div>
          </article>
        ))}
        <Link to="/gallery" className="inline-block font-bold text-school">
          {t('navGallery')} →
        </Link>
      </div>
      <CtaBand
        title={t('seeCampus')}
        primary={{ to: '/admissions/visit', label: t('bookAVisit') }}
        secondary={{ to: '/admissions/apply', label: t('navApply') }}
      />
    </div>
  )
}
