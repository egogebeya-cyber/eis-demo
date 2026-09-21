import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { GsSocial } from '~/components/gs-chrome'
import { PageHero } from '~/components/site-ui'
import { useLocale } from '~/components/locale-context'
import { IMAGES, SCHOOL } from '~/lib/images'
import { getSettingsFn, submitContactFn } from '~/server/public/functions'

export const Route = createFileRoute('/_site/contact')({
  loader: async () => ({ site: await getSettingsFn() }),
  component: ContactPage,
})

function ContactPage() {
  const { t } = useLocale()
  const { site } = Route.useLoaderData()
  const [done, setDone] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    await submitContactFn({
      data: {
        name: String(form.get('name') || ''),
        email: String(form.get('email') || ''),
        phone: String(form.get('phone') || ''),
        message: String(form.get('message') || ''),
      },
    })
    setDone(true)
  }

  return (
    <div>
      <PageHero kicker={t('contactKicker')} title={t('contactTitle')} subtitle={t('officeHours')} image={IMAGES.campus} />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-2">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="font-bold text-school-dark">{site?.addressEn}</p>
          <p className="mt-2 text-zinc-600">
            <a href={SCHOOL.phoneHref}>{site?.phone}</a>
          </p>
          <p className="text-zinc-600">
            <a href={`mailto:${site?.email}`}>{site?.email}</a>
          </p>
          <p className="mt-3">
            <a href={SCHOOL.whatsapp} className="font-bold text-accent">
              {t('whatsapp')}
            </a>
          </p>
          <p className="gs-footer-label mt-6">Follow EIS</p>
          <GsSocial />
          <p className="mt-3 text-sm text-zinc-500">{t('officeHours')}</p>
          <div className="mt-6 overflow-hidden rounded-2xl border border-school/15">
            <iframe title="Map" className="h-56 w-full" src={SCHOOL.mapEmbed} />
          </div>
        </div>
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          {done ? (
            <p className="font-semibold text-school-dark">{t('submitted')}</p>
          ) : (
            <form onSubmit={(e) => void onSubmit(e)}>
              <label className="text-xs font-bold uppercase text-zinc-500">{t('parentName')}</label>
              <input name="name" required className="mt-1 mb-4 w-full rounded-xl border border-school/20 px-3 py-2.5" />
              <label className="text-xs font-bold uppercase text-zinc-500">{t('email')}</label>
              <input name="email" type="email" required className="mt-1 mb-4 w-full rounded-xl border border-school/20 px-3 py-2.5" />
              <label className="text-xs font-bold uppercase text-zinc-500">{t('phone')}</label>
              <input name="phone" className="mt-1 mb-4 w-full rounded-xl border border-school/20 px-3 py-2.5" />
              <label className="text-xs font-bold uppercase text-zinc-500">{t('message')}</label>
              <textarea name="message" required rows={5} className="mt-1 mb-6 w-full rounded-xl border border-school/20 px-3 py-2.5" />
              <button type="submit" className="rounded-full bg-school px-6 py-3 text-sm font-bold uppercase text-white">
                {t('send')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
