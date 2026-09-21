import { createFileRoute } from '@tanstack/react-router'
import { PageHero } from '~/components/site-ui'
import { useLocale } from '~/components/locale-context'
import { IMAGES } from '~/lib/images'

export const Route = createFileRoute('/_site/accessibility')({
  component: AccessibilityPage,
})

function AccessibilityPage() {
  const { t } = useLocale()
  return (
    <div>
      <PageHero kicker={t('navPolicies')} title={t('accessTitle')} subtitle={t('accessBody')} image={IMAGES.library} />
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-zinc-600">{t('accessBody')}</p>
          <p className="mt-4 text-zinc-600">{t('officeHours')}</p>
        </div>
      </div>
    </div>
  )
}
