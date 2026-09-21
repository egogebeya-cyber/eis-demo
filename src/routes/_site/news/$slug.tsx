import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { PageHero } from '~/components/site-ui'
import { useLocale } from '~/components/locale-context'
import { localized } from '~/lib/i18n'
import { IMAGES } from '~/lib/images'
import { formatDate } from '~/lib/utils'
import { getNewsFn } from '~/server/public/functions'

export const Route = createFileRoute('/_site/news/$slug')({
  loader: async ({ params }) => {
    const post = await getNewsFn({ data: { slug: params.slug } })
    if (!post) throw notFound()
    return { post }
  },
  component: NewsArticle,
})

function NewsArticle() {
  const { post } = Route.useLoaderData()
  const { t, locale } = useLocale()
  return (
    <div>
      <PageHero
        kicker={formatDate(post.publishedAt, locale)}
        title={localized(locale, { en: post.titleEn, am: post.titleAm, om: post.titleOm })}
        image={post.imageUrl || IMAGES.lab}
      />
      <article className="mx-auto max-w-3xl px-4 py-12">
        {post.imageUrl ? <img src={post.imageUrl} alt="" className="mb-8 w-full rounded-3xl object-cover" /> : null}
        <p className="whitespace-pre-line text-lg leading-relaxed text-zinc-700">
          {localized(locale, { en: post.bodyEn, am: post.bodyAm, om: post.bodyOm })}
        </p>
        <Link to="/news" className="mt-10 inline-block font-bold text-school">
          ← {t('newsPageTitle')}
        </Link>
      </article>
    </div>
  )
}
