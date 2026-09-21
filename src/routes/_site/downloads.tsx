import { createFileRoute } from '@tanstack/react-router'
import { PageHero } from '~/components/site-ui'
import { useLocale } from '~/components/locale-context'
import { localized } from '~/lib/i18n'
import { IMAGES } from '~/lib/images'
import { listDownloadsFn } from '~/server/public/functions'

export const Route = createFileRoute('/_site/downloads')({
  loader: async () => ({ items: await listDownloadsFn() }),
  component: DownloadsPage,
})

function DownloadsPage() {
  const { t, locale } = useLocale()
  const { items } = Route.useLoaderData()
  return (
    <div>
      <PageHero kicker={t('navDownloads')} title={t('downloadsTitle')} image={IMAGES.library} />
      <div className="mx-auto max-w-3xl space-y-3 px-4 py-14">
        {items.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className="flex items-center justify-between rounded-3xl bg-white px-6 py-4 shadow-sm hover:border-school"
          >
            <span>
              <span className="block text-xs font-bold uppercase text-accent">{item.category}</span>
              <span className="font-bold text-school-dark">
                {localized(locale, { en: item.titleEn, am: item.titleAm, om: item.titleOm })}
              </span>
            </span>
            <span className="text-sm font-bold text-school">PDF</span>
          </a>
        ))}
      </div>
    </div>
  )
}
