import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PageHero } from '~/components/site-ui'
import { useLocale } from '~/components/locale-context'
import { IMAGES } from '~/lib/images'
import { submitApplicationFn } from '~/server/public/functions'

const GRADES = ['KG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']

export const Route = createFileRoute('/_site/admissions/apply')({
  component: ApplyPage,
})

function ApplyPage() {
  const { t } = useLocale()
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    childName: '',
    childDob: '',
    gradeApplying: 'KG',
    yearApplying: '2026–27',
    parentName: '',
    email: '',
    phone: '',
    notes: '',
  })

  function patch(part: Partial<typeof form>) {
    setForm((f) => ({ ...f, ...part }))
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (step < 3) {
      setStep((s) => s + 1)
      return
    }
    setLoading(true)
    try {
      await submitApplicationFn({
        data: {
          childName: form.childName,
          parentName: form.parentName,
          email: form.email,
          phone: form.phone,
          gradeApplying: form.gradeApplying,
          notes: [`Year: ${form.yearApplying}`, form.childDob ? `DOB: ${form.childDob}` : '', form.notes]
            .filter(Boolean)
            .join('\n'),
        },
      })
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  const field = 'mt-1 mb-4 w-full rounded-xl border border-school/20 px-3 py-2.5'
  const label = 'text-xs font-bold uppercase text-zinc-500'

  return (
    <div>
      <PageHero kicker={t('navAdmissions')} title={t('applyTitle')} subtitle={t('stepLabel', { n: step, total: 3 })} image={IMAGES.assembly} />
      <div className="mx-auto max-w-xl px-4 py-14">
        {done ? (
          <p className="rounded-3xl bg-white p-8 text-lg font-semibold text-school-dark">{t('submitted')}</p>
        ) : (
          <form onSubmit={(e) => void onSubmit(e)} className="rounded-3xl bg-white p-8 shadow-sm">
            <div className="mb-6 flex gap-2">
              {[1, 2, 3].map((n) => (
                <span key={n} className={`h-1.5 flex-1 rounded-full ${n <= step ? 'bg-accent' : 'bg-school/15'}`} />
              ))}
            </div>
            {step === 1 ? (
              <>
                <label className={label}>{t('childName')}</label>
                <input required className={field} value={form.childName} onChange={(e) => patch({ childName: e.target.value })} />
                <label className={label}>{t('childDob')}</label>
                <input type="date" className={field} value={form.childDob} onChange={(e) => patch({ childDob: e.target.value })} />
                <label className={label}>{t('gradeApplying')}</label>
                <select className={field} value={form.gradeApplying} onChange={(e) => patch({ gradeApplying: e.target.value })}>
                  {GRADES.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
                <label className={label}>{t('yearApplying')}</label>
                <select className={field} value={form.yearApplying} onChange={(e) => patch({ yearApplying: e.target.value })}>
                  <option>2026–27</option>
                  <option>2027–28</option>
                </select>
              </>
            ) : null}
            {step === 2 ? (
              <>
                <label className={label}>{t('parentName')}</label>
                <input required className={field} value={form.parentName} onChange={(e) => patch({ parentName: e.target.value })} />
                <label className={label}>{t('email')}</label>
                <input type="email" required className={field} value={form.email} onChange={(e) => patch({ email: e.target.value })} />
                <label className={label}>{t('phone')}</label>
                <input required className={field} value={form.phone} onChange={(e) => patch({ phone: e.target.value })} />
              </>
            ) : null}
            {step === 3 ? (
              <>
                <label className={label}>{t('notes')}</label>
                <textarea rows={5} className={field} value={form.notes} onChange={(e) => patch({ notes: e.target.value })} />
                <p className="mb-4 text-sm text-zinc-500">{t('docsTitle')}</p>
              </>
            ) : null}
            <div className="flex gap-3">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="flex-1 rounded-full border border-school px-4 py-3 text-sm font-bold uppercase text-school"
                >
                  {t('back')}
                </button>
              ) : null}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-full bg-school px-4 py-3 text-sm font-bold uppercase text-white disabled:opacity-60"
              >
                {step < 3 ? t('next') : t('submit')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
