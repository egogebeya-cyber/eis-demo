import { createFileRoute } from '@tanstack/react-router'
import { useLocale } from '~/components/locale-context'
import { formatDate } from '~/lib/utils'
import { portalCalendarFn } from '~/server/portal/functions'

export const Route = createFileRoute('/portal/calendar')({
  loader: async () => portalCalendarFn(),
  component: CalendarPage,
})

function CalendarPage() {
  const { t, locale } = useLocale()
  const { events, announcements } = Route.useLoaderData()
  return (
    <div>
      <h1 className="text-xl font-black text-school-dark sm:text-2xl">{t('portalCalendar')}</h1>
      <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="font-bold text-school">{t('navEvents')}</h2>
          {events.map((ev) => (
            <article key={ev.id} className="soft-card bg-white shadow-sm">
              <p className="text-xs font-bold uppercase text-accent">{formatDate(ev.startAt, locale)}</p>
              <p className="font-bold text-school-dark">{ev.titleEn}</p>
              <p className="text-sm text-zinc-600">{ev.locationEn}</p>
            </article>
          ))}
        </div>
        <div className="space-y-3">
          <h2 className="font-bold text-school">{t('announcements')}</h2>
          {announcements.map((a) => (
            <article key={a.id} className="soft-card bg-white shadow-sm">
              <p className="font-bold text-school-dark">{a.titleEn}</p>
              <p className="mt-1 text-sm text-zinc-600">{a.bodyEn}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
