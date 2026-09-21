import { useMemo, useState } from 'react'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useLocale } from '~/components/locale-context'
import { SlotCard } from '~/components/slot-card'
import { formatDate } from '~/lib/utils'
import { getCurrentUser } from '~/server/auth/functions'
import { listMessagesFn, listMyStudentsFn, messageRecipientsFn, sendMessageFn } from '~/server/portal/functions'

type Search = { to?: string; studentId?: string }
type Msg = Awaited<ReturnType<typeof listMessagesFn>>[number]
type Recipient = Awaited<ReturnType<typeof messageRecipientsFn>>[number]
type Kid = Awaited<ReturnType<typeof listMyStudentsFn>>[number]

function recipientValue(r: { id: string; studentId?: string }) {
  return r.studentId ? `${r.id}::${r.studentId}` : r.id
}

function canonicalSubject(value: string) {
  return value.replace(/^(re:\s*)+/i, '').trim()
}

function replySubject(value: string) {
  const base = canonicalSubject(value)
  return base ? `Re: ${base}` : 'Re:'
}

function noteSubject(note?: string) {
  if (!note) return ''
  const parts = note.split(' · ').map((part) => part.trim()).filter(Boolean)
  return parts[parts.length - 1] || ''
}

export const Route = createFileRoute('/portal/messages')({
  beforeLoad: ({ context }) => {
    if (context.user.role === 'student') throw redirect({ to: '/portal' })
  },
  validateSearch: (search: Record<string, unknown>): Search => ({
    to: typeof search.to === 'string' ? search.to : undefined,
    studentId: typeof search.studentId === 'string' ? search.studentId : undefined,
  }),
  loader: async () => {
    const user = await getCurrentUser()
    return {
      userId: user?.id ?? '',
      role: user?.role ?? '',
      kids: user?.role === 'parent' ? await listMyStudentsFn() : ([] as Kid[]),
      items: await listMessagesFn(),
      recipients: await messageRecipientsFn(),
    }
  },
  component: MessagesPage,
})

function MessagesPage() {
  const { t, locale } = useLocale()
  const { items, recipients, userId, role, kids } = Route.useLoaderData()
  const { to, studentId } = Route.useSearch()
  const router = useRouter()
  const [error, setError] = useState('')
  const [kidId, setKidId] = useState(() => {
    if (studentId && kids.some((kid) => kid.id === studentId)) return studentId
    const latest = items.find((msg) => msg.studentId && kids.some((kid) => kid.id === msg.studentId))
    return latest?.studentId || kids[0]?.id || ''
  })
  const contacts = useMemo(() => {
    if (!kidId) return recipients
    const linked = recipients.filter((r) => r.studentId === kidId)
    const others = recipients.filter((r) => !r.studentId)
    return linked.length ? [...linked, ...others] : recipients
  }, [recipients, kidId])
  const [contactKey, setContactKey] = useState(() => {
    const match =
      recipients.find((r) => r.id === to && (!studentId || r.studentId === studentId)) ||
      recipients.find((r) => r.id === to) ||
      recipients.find((r) => {
        const latest = items[0]
        if (!latest) return false
        const other = latest.fromUserId === userId ? latest.toUserId : latest.fromUserId
        return r.id === other && (!latest.studentId || r.studentId === latest.studentId)
      }) ||
      contacts[0] ||
      recipients[0]
    return match ? recipientValue(match) : ''
  })
  const currentKid = kids.find((kid) => kid.id === kidId) ?? kids[0]
  const contact = contacts.find((r) => recipientValue(r) === contactKey) ?? contacts[0]
  const thread = useMemo(() => {
    if (!contact) return [] as Msg[]
    return items
      .filter((msg) => {
        const withThem =
          (msg.fromUserId === contact.id && msg.toUserId === userId) ||
          (msg.fromUserId === userId && msg.toUserId === contact.id)
        if (!withThem) return false
        if (contact.studentId && msg.studentId && msg.studentId !== contact.studentId) return false
        return true
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }, [items, contact, userId])

  function pickKid(id: string) {
    setKidId(id)
    const next = recipients.filter((r) => r.studentId === id)
    setContactKey(next[0] ? recipientValue(next[0]) : '')
  }

  async function onSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!contact) return
    const form = e.currentTarget
    const data = new FormData(form)
    const body = String(data.get('body') || '').trim()
    const subject =
      String(data.get('subject') || '').trim() ||
      (thread.length ? replySubject(thread[thread.length - 1].subject) : noteSubject(contact.note) || t('message'))
    setError('')
    try {
      await sendMessageFn({
        data: {
          toUserId: contact.id,
          subject,
          body,
          studentId: contact.studentId || kidId || undefined,
        },
      })
      form.reset()
      await router.invalidate()
    } catch {
      setError(t('sendFailed'))
    }
  }

  const pickLabel = role === 'teacher' ? t('pickParent') : t('pickTeacher')
  const kickerFor = (item: Recipient) => {
    if (item.kind === 'homeroom') return t('homeroomLabel')
    if (item.kind === 'subject') return t('subjectLabel')
    return role === 'teacher' ? t('parentLabel') : t('teacherLabel')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-school-dark sm:text-2xl">{t('portalMessages')}</h1>
        <p className="mt-1 text-sm text-muted">{t('messagesHint')}</p>
      </div>

      {kids.length > 1 ? (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{t('pickChild')}</p>
          <div className="slot-grid">
            {kids.map((kid) => (
              <SlotCard
                key={kid.id}
                kicker={t('children')}
                title={`${kid.firstName} ${kid.lastName}`}
                hint={kid.className ?? t('noItems')}
                on={kid.id === currentKid?.id}
                onClick={() => pickKid(kid.id)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {currentKid ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
          {currentKid.className} · {currentKid.firstName} {currentKid.lastName}
        </p>
      ) : null}

      {contacts.length === 0 ? (
        <p className="text-sm text-muted">{t('noItems')}</p>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(16rem,20rem)_minmax(0,1fr)]">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{pickLabel}</p>
            <div className="slot-grid lg-stack">
              {contacts.map((item) => (
                <SlotCard
                  key={recipientValue(item)}
                  kicker={kickerFor(item)}
                  title={item.fullName}
                  hint={item.note || item.role}
                  on={recipientValue(item) === contactKey}
                  onClick={() => setContactKey(recipientValue(item))}
                />
              ))}
            </div>
          </div>

          {contact ? (
            <section className="flex min-h-[12rem] flex-col overflow-hidden rounded-2xl border border-school/10 bg-surface sm:min-h-[28rem]">
              <div className="border-b border-school/10 px-4 py-3 sm:px-5 sm:py-4">
                <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] text-accent`}>{kickerFor(contact)}</p>
                <h2 className="mt-1 font-display text-xl font-medium italic text-school-dark sm:text-2xl">{contact.fullName}</h2>
                {contact.note ? <p className="mt-1 text-sm text-muted">{contact.note}</p> : null}
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {thread.length === 0 ? (
                  <p className="text-sm text-muted">{t('firstMessage')}</p>
                ) : (
                  thread.map((msg, index) => {
                    const mine = msg.fromUserId === userId
                    const topic = canonicalSubject(msg.subject)
                    const prevTopic = index > 0 ? canonicalSubject(thread[index - 1].subject) : ''
                    return (
                      <div key={msg.id} className={mine ? 'ml-6 sm:ml-16' : 'mr-6 sm:mr-16'}>
                        <div
                          className={`rounded-2xl px-4 py-3 ${
                            mine ? 'bg-school text-white' : 'border border-school/10 bg-background text-foreground'
                          }`}
                        >
                          <p className={`text-[11px] font-semibold uppercase tracking-wide ${mine ? 'text-accent' : 'text-muted'}`}>
                            {mine ? t('you') : msg.fromName}
                            <span className={`ml-2 font-medium ${mine ? 'text-white/60' : 'text-muted'}`}>
                              {formatDate(new Date(msg.createdAt).toISOString(), locale)}
                            </span>
                          </p>
                          {topic && topic !== prevTopic ? (
                            <p className={`mt-1 text-xs font-semibold ${mine ? 'text-white/80' : 'text-school-dark'}`}>{topic}</p>
                          ) : null}
                          <p className="mt-1 text-sm">{msg.body}</p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <form onSubmit={(e) => void onSend(e)} className="border-t border-school/10 px-4 py-4">
                {thread.length === 0 ? (
                  <>
                    <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{t('subject')}</label>
                    <input
                      name="subject"
                      defaultValue={noteSubject(contact.note) || t('message')}
                      className="mt-1 mb-3 w-full rounded-xl border border-school/20 bg-background px-3 py-2 text-sm"
                    />
                  </>
                ) : null}
                <label className="sr-only" htmlFor="reply-body">
                  {t('reply')}
                </label>
                <textarea
                  id="reply-body"
                  name="body"
                  required
                  rows={3}
                  placeholder={t('replyPlaceholder')}
                  className="w-full rounded-xl border border-school/20 bg-background px-3 py-2 text-sm"
                />
                {error ? <p className="mt-2 text-sm text-accent">{error}</p> : null}
                <button type="submit" className="mt-3 rounded-full bg-school px-5 py-2 text-sm font-bold uppercase text-white">
                  {thread.length ? t('reply') : t('sendMessage')}
                </button>
              </form>
            </section>
          ) : null}
        </div>
      )}
    </div>
  )
}
