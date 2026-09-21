import { Link, createFileRoute } from '@tanstack/react-router'
import { PageHero } from '~/components/site-ui'
import { useLocale } from '~/components/locale-context'
import { pageCopy } from '~/lib/content'
import { IMAGES } from '~/lib/images'

export const Route = createFileRoute('/_site/policies')({
  component: PoliciesPage,
})

function PoliciesPage() {
  const { t, locale } = useLocale()
  const copy = pageCopy(locale)
  return (
    <div>
      <PageHero kicker={t('safeguarding')} title={t('policiesTitle')} image={IMAGES.campus} />
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-16">
        {copy.policies.map((policy) => (
          <article key={policy.title} className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="font-display text-2xl font-semibold text-school-dark">{policy.title}</h2>
            <p className="mt-3 text-zinc-600">{policy.body}</p>
          </article>
        ))}
        <Link to="/downloads" className="inline-block font-bold text-school">
          {t('navDownloads')} →
        </Link>
      </div>
    </div>
  )
}
