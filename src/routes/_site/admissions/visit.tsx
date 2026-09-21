import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { InnerSplit, PageHero } from '~/components/site-ui'
import { useLocale } from '~/components/locale-context'
import { IMAGES, SCHOOL } from '~/lib/images'
import { submitContactFn } from '~/server/public/functions'

export const Route = createFileRoute('/_site/admissions/visit')({
  component: VisitPage,
})

function VisitPage() {
  const { t } = useLocale()
  const [done, setDone] = useState(false)
  const field = 'mt-1 mb-4 w-full rounded-xl border border-school/20 px-3 py-2.5'
  const label = 'text-xs font-bold uppercase text-zinc-500'

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const date = String(form.get('date') || '')
    const time = String(form.get('time') || '')
    const visitors = String(form.get('visitors') || '')
    const grade = String(form.get('grade') || '')
    const kind = String(form.get('kind') || 'visit')
    await submitContactFn({
      data: {
        name: String(form.get('name') || ''),
        email: String(form.get('email') || ''),
        phone: String(form.get('phone') || ''),
        message: `${kind} request — date ${date}, time ${time}, visitors ${visitors}, grade ${grade}`,
      },
    })
    setDone(true)
  }

  return (
    <div>
      <PageHero kicker={t('navAdmissions')} title={t('bookAVisit')} subtitle={t('saturdayOpen')} image={IMAGES.courtyard} />
      <section className="gs-know-grid">
        <article className="gs-know-card">
          <h3>Open campus</h3>
          <p>Every Saturday at 10:00 in term time. Walk the courtyard, sit in on a lesson, and meet admissions.</p>
        </article>
        <article className="gs-know-card">
          <h3>Private tour</h3>
          <p>Mid-week tours by appointment. WhatsApp admissions if you need a same-week slot.</p>
        </article>
        <article id="taster" className="gs-know-card">
          <h3>Taster day</h3>
          <p>A morning with the year group your child would join — lesson, break, and lunch in the courtyard.</p>
        </article>
      </section>
      <InnerSplit
        kicker="Admissions"
        title="Come and see"
        body="Open campus every Saturday at 10:00 in term time. Mid-week tours and taster mornings by appointment."
        image={IMAGES.campus}
      >
        <p className="mt-4 text-sm">
          <a className="font-bold text-accent" href={SCHOOL.whatsapp}>
            {t('whatsapp')}
          </a>
          {' · '}
          <a className="font-bold text-accent" href={SCHOOL.phoneHref}>
            {SCHOOL.phone}
          </a>
        </p>
      </InnerSplit>
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          {done ? (
            <p className="font-semibold text-school-dark">{t('visitSubmitted')}</p>
          ) : (
            <form onSubmit={(e) => void onSubmit(e)}>
              <label className={label}>Visit type</label>
              <select name="kind" className={field}>
                <option value="Saturday visit">Saturday open campus</option>
                <option value="Private tour">Private tour</option>
                <option value="Taster day">Taster day</option>
              </select>
              <label className={label}>{t('parentName')}</label>
              <input name="name" required className={field} />
              <label className={label}>{t('email')}</label>
              <input name="email" type="email" required className={field} />
              <label className={label}>{t('phone')}</label>
              <input name="phone" className={field} />
              <label className={label}>{t('gradeApplying')}</label>
              <select name="grade" className={field}>
                {['KG', 'Grade 1', 'Grade 6', 'Grade 9', 'Grade 12'].map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
              <label className={label}>{t('visitDate')}</label>
              <input name="date" type="date" required className={field} />
              <label className={label}>{t('visitTime')}</label>
              <select name="time" className={field}>
                <option>10:00 Saturday open campus</option>
                <option>09:00 weekday</option>
                <option>14:00 weekday</option>
              </select>
              <label className={label}>{t('visitors')}</label>
              <input name="visitors" type="number" min={1} defaultValue={2} className={field} />
              <button type="submit" className="w-full rounded-full bg-school px-4 py-3 text-sm font-bold uppercase text-white">
                {t('bookAVisit')}
              </button>
            </form>
          )}
        </div>
        <p className="mt-6 text-sm text-zinc-500">
          Prefer to write? <Link to="/contact" className="font-bold text-accent">Enquire here</Link>.
        </p>
      </div>
    </div>
  )
}
