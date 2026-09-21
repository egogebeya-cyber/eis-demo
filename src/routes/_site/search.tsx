import { createFileRoute } from '@tanstack/react-router'
import { PageHero } from '~/components/site-ui'
import { useLocale } from '~/components/locale-context'
import { localized } from '~/lib/i18n'
import { IMAGES } from '~/lib/images'
import { searchSiteFn } from '~/server/public/functions'

type SearchParams = { q?: string }

export const Route = createFileRoute('/_site/search')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search.q === 'string' ? search.q : '',
  }),
  loaderDeps: ({ search }) => ({ q: search.q ?? '' }),
  loader: async ({ deps }) => ({
    q: deps.q,
    results: deps.q.length >= 2 ? await searchSiteFn({ data: { q: deps.q } }) : { news: [], events: [], staff: [] },
  }),
  component: SearchPage,
})

function SearchPage() {
  const { t, locale } = useLocale()
  const { q, results } = Route.useLoaderData()
  const navigate = Route.useNavigate()
  const empty = !results.news.length && !results.events.length && !results.staff.length

  return (
    <div>
      <PageHero kicker={t('navSearch')} title={t('searchTitle')} image={IMAGES.library} />
      <div className="mx-auto max-w-3xl px-4 py-14">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            const next = String(new FormData(e.currentTarget).get('q') || '')
            void navigate({ search: { q: next } })
          }}
        >
          <input
            name="q"
            defaultValue={q}
            placeholder={t('searchPlaceholder')}
            className="flex-1 rounded-full border border-school/20 bg-white px-4 py-3"
          />
          <button type="submit" className="rounded-full bg-school px-5 py-3 text-sm font-bold uppercase text-white">
            {t('navSearch')}
          </button>
        </form>
        <div className="mt-8 space-y-4">
          {q.length < 2 ? <p className="text-zinc-500">{t('searchEmpty')}</p> : null}
          {q.length >= 2 && empty ? <p className="text-zinc-500">{t('searchNone')}</p> : null}
          {results.news.map((post) => (
            <a key={post.id} href={`/news/${post.slug}`} className="block rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase text-accent">{t('navNews')}</p>
              <p className="font-bold text-school-dark">
                {localized(locale, { en: post.titleEn, am: post.titleAm, om: post.titleOm })}
              </p>
            </a>
          ))}
          {results.events.map((ev) => (
            <a key={ev.id} href="/events" className="block rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase text-accent">{t('navEvents')}</p>
              <p className="font-bold text-school-dark">
                {localized(locale, { en: ev.titleEn, am: ev.titleAm, om: ev.titleOm })}
              </p>
            </a>
          ))}
          {results.staff.map((person) => (
            <a key={person.id} href="/staff" className="block rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase text-accent">{t('navStaff')}</p>
              <p className="font-bold text-school-dark">{person.fullName}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
