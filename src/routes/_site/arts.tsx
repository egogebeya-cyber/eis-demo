import { createFileRoute } from '@tanstack/react-router'
import { CtaBand, InnerSplit, PageHero } from '~/components/site-ui'
import { useLocale } from '~/components/locale-context'
import { pageCopy } from '~/lib/content'
import { IMAGES } from '~/lib/images'

export const Route = createFileRoute('/_site/arts')({
  component: ArtsPage,
})

function ArtsPage() {
  const { t, locale } = useLocale()
  const copy = pageCopy(locale)
  return (
    <div>
      <PageHero kicker={t('navLife')} title={t('navArts')} subtitle={t('lifeTitle')} image={IMAGES.arts} />
      <InnerSplit
        kicker="Arts"
        title="Choir, studio, stage"
        body="Music, drama, and studio art begin in kindergarten. Each term the 280-seat hall hosts a showcase; traditional dance sits beside choir and photography."
        image={IMAGES.music}
      />
      <section className="mx-auto max-w-6xl px-8 py-16">
        <ul className="grid gap-3 sm:grid-cols-2">
          {copy.artsList.map((item) => (
            <li key={item} className="rounded-2xl bg-white px-5 py-3 font-semibold text-school-dark shadow-sm">
              {item}
            </li>
          ))}
        </ul>
      </section>
      <CtaBand
        title={t('seeCampus')}
        primary={{ to: '/gallery', label: t('navGallery') }}
        secondary={{ to: '/events', label: t('navEvents') }}
      />
    </div>
  )
}
