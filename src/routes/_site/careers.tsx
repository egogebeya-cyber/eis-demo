import { Link, createFileRoute } from '@tanstack/react-router'
import { PageHero } from '~/components/site-ui'
import { useLocale } from '~/components/locale-context'
import { localized } from '~/lib/i18n'
import { IMAGES } from '~/lib/images'
import { listJobsFn } from '~/server/public/functions'

export const Route = createFileRoute('/_site/careers')({
  loader: async () => ({ jobs: await listJobsFn() }),
  component: CareersPage,
})

function CareersPage() {
  const { t, locale } = useLocale()
  const { jobs } = Route.useLoaderData()
  return (
    <div>
      <PageHero kicker={t('navCareers')} title={t('careersTitle')} image={IMAGES.classroom} />
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-14">
        {jobs.map((job) => (
          <article key={job.id} className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase text-accent">{job.department}</p>
            <h2 className="mt-1 text-xl font-black text-school-dark">
              {localized(locale, { en: job.titleEn, am: job.titleAm, om: job.titleOm })}
            </h2>
            <p className="mt-2 text-zinc-600">
              {localized(locale, { en: job.descriptionEn, am: job.descriptionAm, om: job.descriptionOm })}
            </p>
            <Link to="/contact" className="mt-4 inline-block text-sm font-bold text-school">
              {t('navContact')} →
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
