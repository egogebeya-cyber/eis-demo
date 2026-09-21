import { createFileRoute } from '@tanstack/react-router'
import { EventCalendar } from '~/components/EventCalendar'
import { PageHero } from '~/components/site-ui'
import { useLocale } from '~/components/locale-context'
import { IMAGES } from '~/lib/images'
import { listEventsFn } from '~/server/public/functions'

export const Route = createFileRoute('/_site/events')({
  loader: async () => ({ events: await listEventsFn() }),
  component: EventsPage,
})

function EventsPage() {
  const { t, locale } = useLocale()
  const { events } = Route.useLoaderData()
  return (
    <div>
      <PageHero kicker={t('eventsKicker')} title={t('eventsPageTitle')} subtitle={t('saturdayOpen')} image={IMAGES.assembly} />
      <div className="mx-auto max-w-5xl px-4 py-14">
        <EventCalendar events={events} locale={locale} />
      </div>
    </div>
  )
}
