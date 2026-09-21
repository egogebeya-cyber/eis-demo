import { Link, createFileRoute } from '@tanstack/react-router'
import { CtaBand, PageHero } from '~/components/site-ui'
import { useLocale } from '~/components/locale-context'
import { pageCopy } from '~/lib/content'
import { IMAGES } from '~/lib/images'

export const Route = createFileRoute('/_site/parents')({
  component: ParentsPage,
})

function ParentsPage() {
  const { t, locale } = useLocale()
  const copy = pageCopy(locale)
  return (
    <div>
      <PageHero kicker={t('navParents')} title={t('parentsHub')} subtitle={t('loginHint')} image={IMAGES.kids} />
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-16 sm:grid-cols-2">
        {copy.parentCards.map((card) => (
          <Link
            key={card.title}
            to={card.to}
            className="rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-0.5 hover:border-school"
          >
            <h2 className="font-display text-2xl font-semibold text-school-dark">{card.title}</h2>
            <p className="mt-3 text-sm text-zinc-600">{card.body}</p>
            <p className="mt-4 text-sm font-bold text-school">{t('more')} →</p>
          </Link>
        ))}
      </div>
      <CtaBand
        title={t('navLogin')}
        body={t('loginHint')}
        primary={{ to: '/login', label: t('navLogin') }}
        secondary={{ to: '/contact', label: t('navContact') }}
      />
    </div>
  )
}
