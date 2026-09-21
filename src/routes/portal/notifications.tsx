import { Link, createFileRoute } from '@tanstack/react-router'
import { Bell, MessageSquare, Wallet } from 'lucide-react'
import { useLocale } from '~/components/locale-context'
import { formatDate, formatEtb } from '~/lib/utils'
import { portalDashboardFn } from '~/server/portal/functions'

export const Route = createFileRoute('/portal/notifications')({
  loader: async () => portalDashboardFn(),
  component: NotificationsPage,
})

function NotificationsPage() {
  const { t, locale } = useLocale()
  const data = Route.useLoaderData()
  const unpaid = data.user.role === 'parent' ? data.unpaid : []
  const inbox = data.user.role === 'parent' || data.user.role === 'teacher' ? data.messages : []
  const alerts = [
    ...unpaid.map((row) => ({
      id: `fee-${row.id}`,
      kicker: t('unpaidFees'),
      title: row.title,
      hint: formatEtb(row.amountEtb),
      to: '/portal/fees' as const,
      icon: Wallet,
    })),
    ...inbox.map((row) => ({
      id: `msg-${row.id}`,
      kicker: t('portalMessages'),
      title: row.subject,
      hint: formatDate(
        row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
        locale,
      ),
      to: '/portal/messages' as const,
      icon: MessageSquare,
    })),
    ...data.announcements.map((row) => ({
      id: `ann-${row.id}`,
      kicker: t('announcements'),
      title: row.titleEn,
      hint: row.bodyEn,
      to: '/portal/calendar' as const,
      icon: Bell,
    })),
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-school-dark sm:text-2xl">{t('portalNotifications')}</h1>
        <p className="mt-1 text-sm text-muted">{t('notificationsHint')}</p>
      </div>
      {alerts.length ? (
        <ul className="divide-y divide-school/10 overflow-hidden rounded-2xl border border-school/10 bg-surface">
          {alerts.map((item) => (
            <li key={item.id}>
              <Link to={item.to} className="flex items-start gap-3 px-4 py-3 hover:bg-background sm:px-5 sm:py-4">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-school-light text-school sm:h-9 sm:w-9 sm:rounded-xl">
                  <item.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">{item.kicker}</p>
                  <p className="mt-1 font-display text-base font-medium italic text-school-dark sm:text-xl">{item.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{item.hint}</p>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">{t('noItems')}</p>
      )}
    </div>
  )
}
