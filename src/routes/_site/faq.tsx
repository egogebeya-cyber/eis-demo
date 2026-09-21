import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PageHero } from '~/components/site-ui'
import { useLocale } from '~/components/locale-context'
import { pageCopy } from '~/lib/content'
import { IMAGES } from '~/lib/images'

export const Route = createFileRoute('/_site/faq')({
  component: FaqPage,
})

function FaqPage() {
  const { t, locale } = useLocale()
  const copy = pageCopy(locale)
  const items = [
    { q: t('faq1q'), a: t('faq1a') },
    { q: t('faq2q'), a: t('faq2a') },
    { q: t('faq3q'), a: t('faq3a') },
    { q: t('faq4q'), a: t('faq4a') },
    { q: t('faq5q'), a: t('faq5a') },
    ...copy.extraFaqs,
  ]
  const [open, setOpen] = useState<string | null>(items[0]?.q ?? null)

  return (
    <div>
      <PageHero kicker={t('navFaq')} title={t('faqTitle')} image={IMAGES.library} />
      <div className="mx-auto max-w-3xl space-y-3 px-4 py-14">
        {items.map((item) => (
          <article key={item.q} className="rounded-3xl bg-white shadow-sm">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 p-6 text-left"
              onClick={() => setOpen((v) => (v === item.q ? null : item.q))}
              aria-expanded={open === item.q}
            >
              <h2 className="font-bold text-school-dark">{item.q}</h2>
              <span className="text-accent">{open === item.q ? '–' : '+'}</span>
            </button>
            {open === item.q ? <p className="px-6 pb-6 text-zinc-600">{item.a}</p> : null}
          </article>
        ))}
      </div>
    </div>
  )
}
