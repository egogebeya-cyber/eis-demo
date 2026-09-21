import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Reveal } from './home-interactive'
import { SectionHeading } from './SectionHeading'
import { IMAGES } from '~/lib/images'
import { formatDate } from '~/lib/utils'

const SCHOOLS = [
  {
    grades: 'KG–5',
    title: 'Junior School',
    kicker: 'A school of its own',
    body: 'Early Years and Lower School. Its own rooms, teachers, and day — not a waiting room for the seniors.',
    to: '/junior' as const,
    image: IMAGES.kids,
  },
  {
    grades: '6–12',
    title: 'Senior School',
    kicker: 'A school of its own',
    body: 'Upper School and Sixth Form. Labs, Cambridge, and university counselling — a different school, a different link.',
    to: '/senior' as const,
    image: IMAGES.lab,
  },
]

const WHY = [
  {
    title: 'Rooted in Ethiopia',
    body: 'A highland campus on Bole Road. Service in the neighbourhood. History, ecology, and civic life taught as living subjects — not posters on a wall.',
  },
  {
    title: 'Prepared for any room',
    body: 'English-medium classes, Cambridge in the upper years, and the nerve to speak in assembly. Students leave ready for universities at home and abroad.',
  },
  {
    title: 'Known, not numbered',
    body: 'Average class size is 16. Every student has a homeroom, a house, and a nurse on site. Character is practised on the field as much as at the table.',
  },
]

type NewsItem = {
  slug: string
  titleEn: string
  excerptEn: string
  imageUrl: string | null
  publishedAt: string | Date
}

export function HomeLanding({ news }: { news: NewsItem[] }) {
  return (
    <div className="bg-background">
      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal>
          <SectionHeading
            kicker="Our schools"
            title="Two schools. Two doors."
            subtitle="Junior School and Senior School are not the same place. Each has its own page, its own staff, and its own link."
          />
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {SCHOOLS.map((school, i) => (
            <Reveal key={school.title} delay={i * 70}>
              <Link
                to={school.to}
                className="group grid overflow-hidden rounded-[1.5rem] bg-surface shadow-sm transition hover:-translate-y-0.5 md:grid-cols-[11rem_1fr]"
              >
                <img src={school.image} alt="" className="h-44 w-full object-cover md:h-full" />
                <div className="p-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">{school.grades}</p>
                  <h3 className="font-display mt-2 text-2xl font-semibold text-foreground">{school.title}</h3>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-school">{school.kicker}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{school.body}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-school">
                    Open {school.title}
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-school py-20 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-accent">Why EIS</p>
            <h2 className="font-display mt-3 max-w-3xl text-4xl font-medium italic sm:text-5xl">
              Built for the world. Rooted in Ethiopia.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {WHY.map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <article className="rounded-[1.5rem] border border-white/15 bg-white/5 p-6">
                  <h3 className="font-display text-2xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/75">{item.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-2">
          <Reveal>
            <article className="flex min-h-64 flex-col justify-between overflow-hidden rounded-[1.75rem] bg-school p-8 text-white">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-accent">Visit campus</p>
                <h2 className="font-display mt-3 text-3xl font-medium italic">Walk the courtyard. Sit in on a lesson.</h2>
                <p className="mt-3 max-w-md text-sm text-white/75">Open campus Saturdays at 10:00 in term time. Mid-week tours by appointment.</p>
              </div>
              <Link
                to="/admissions/visit"
                className="mt-8 inline-flex w-fit rounded-full bg-accent px-6 py-3 text-xs font-bold uppercase tracking-wide text-school-dark"
              >
                Book a visit
              </Link>
            </article>
          </Reveal>
          <Reveal delay={80}>
            <article className="flex min-h-64 flex-col justify-between overflow-hidden rounded-[1.75rem] border border-school/15 bg-background p-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-accent">Portals</p>
                <h2 className="font-display mt-3 text-3xl font-medium italic text-foreground">Student, parent, and teacher desks.</h2>
                <p className="mt-3 max-w-md text-sm text-muted">Grades, attendance, fees, messages, and the term calendar — one login, three doors.</p>
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                <Link to="/login" search={{ role: 'student' }} className="rounded-full bg-school px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
                  Student
                </Link>
                <Link to="/login" search={{ role: 'parent' }} className="rounded-full bg-school px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
                  Parent
                </Link>
                <Link to="/login" search={{ role: 'teacher' }} className="rounded-full bg-school px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
                  Teacher
                </Link>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      {news.length ? (
        <section className="mx-auto max-w-6xl px-4 py-20">
          <Reveal>
            <div className="flex items-end justify-between gap-4">
              <SectionHeading kicker="Campus news" title="What is happening" compact />
              <Link to="/news" className="text-sm font-bold text-school hover:underline">
                View all
              </Link>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {news.slice(0, 3).map((item, i) => (
              <Reveal key={item.slug} delay={i * 60}>
                <Link to="/news/$slug" params={{ slug: item.slug }} className="group block overflow-hidden rounded-[1.5rem] bg-surface shadow-sm">
                  {item.imageUrl ? <img src={item.imageUrl} alt="" className="h-40 w-full object-cover transition group-hover:scale-[1.03]" /> : null}
                  <div className="p-5">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
                      {formatDate(String(item.publishedAt).slice(0, 10), 'en')}
                    </p>
                    <h3 className="font-display mt-2 text-xl font-semibold text-foreground">{item.titleEn}</h3>
                    <p className="mt-2 line-clamp-3 text-sm text-muted">{item.excerptEn}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
