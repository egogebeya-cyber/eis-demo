import { Link, createFileRoute } from '@tanstack/react-router'
import { PageHero } from '~/components/site-ui'
import { useLocale } from '~/components/locale-context'
import { localized } from '~/lib/i18n'
import { IMAGES } from '~/lib/images'
import { formatDate } from '~/lib/utils'
import { listNewsFn } from '~/server/public/functions'

export const Route = createFileRoute('/_site/news/')({
  loader: async () => ({ news: await listNewsFn() }),
  component: NewsPage,
})

function NewsPage() {
  const { t, locale } = useLocale()
  const { news } = Route.useLoaderData()
  return (
    <div>
      <PageHero kicker={t('newsKicker')} title={t('newsPageTitle')} image={IMAGES.lab} />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 md:grid-cols-3">
        {news.map((post) => (
          <Link key={post.id} to="/news/$slug" params={{ slug: post.slug }} className="overflow-hidden rounded-3xl bg-white shadow-sm">
            {post.imageUrl ? <img src={post.imageUrl} alt="" className="h-44 w-full object-cover" /> : null}
            <div className="p-5">
              <p className="text-xs font-bold uppercase text-accent">{formatDate(post.publishedAt, locale)}</p>
              <h2 className="font-display mt-2 font-semibold text-school-dark">
                {localized(locale, { en: post.titleEn, am: post.titleAm, om: post.titleOm })}
              </h2>
              <p className="mt-2 text-sm text-zinc-600">
                {localized(locale, { en: post.excerptEn, am: post.excerptAm, om: post.excerptOm })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
