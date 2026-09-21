import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PageHero } from '~/components/site-ui'
import { useLocale } from '~/components/locale-context'
import { localized } from '~/lib/i18n'
import { IMAGES } from '~/lib/images'
import { listGalleryFn } from '~/server/public/functions'

export const Route = createFileRoute('/_site/gallery')({
  loader: async () => ({ items: await listGalleryFn() }),
  component: GalleryPage,
})

function GalleryPage() {
  const { t, locale } = useLocale()
  const { items } = Route.useLoaderData()
  const cats = useMemo(() => ['all', ...Array.from(new Set(items.map((i) => i.category)))], [items])
  const [cat, setCat] = useState('all')
  const shown = cat === 'all' ? items : items.filter((i) => i.category === cat)

  return (
    <div>
      <PageHero kicker={t('navGallery')} title={t('galleryTitle')} image={IMAGES.courtyard} />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase ${
                cat === c ? 'bg-school text-white' : 'bg-white text-school'
              }`}
            >
              {c === 'all' ? t('filterAll') : c}
            </button>
          ))}
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {shown.map((item) => (
            <figure key={item.id} className="overflow-hidden rounded-3xl bg-white shadow-sm">
              <img src={item.imageUrl} alt="" className="h-52 w-full object-cover" />
              <figcaption className="p-4">
                <p className="text-xs font-bold uppercase text-accent">{item.category}</p>
                <p className="font-bold text-school-dark">
                  {localized(locale, { en: item.titleEn, am: item.titleAm, om: item.titleOm })}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  )
}
