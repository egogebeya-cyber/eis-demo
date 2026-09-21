import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { SectionHeading } from '~/components/SectionHeading'
import { Reveal } from '~/components/home-interactive'
import { useLocale } from '~/components/locale-context'
import { pageCopy } from '~/lib/content'
import { IMAGES } from '~/lib/images'

function MoreLink({ to, label }: { to: '/about' | '/academics' | '/life'; label: string }) {
  return (
    <Link to={to} className="mt-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-school hover:underline">
      {label}
      <ArrowRight className="h-4 w-4" />
    </Link>
  )
}

export function HomePageSections() {
  const { t, locale } = useLocale()
  const copy = pageCopy(locale)

  return (
    <>
      <section id="about" className="mx-auto max-w-6xl px-4 py-20">
        <Reveal>
          <SectionHeading kicker={t('navAbout')} title={t('aboutTitle')} subtitle={t('aboutBody')} />
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {copy.values.map((value, i) => (
            <Reveal key={value.title} delay={i * 60}>
              <article className="rounded-3xl border border-school/10 bg-white p-6">
                <h3 className="font-display text-xl font-semibold text-school-dark">{value.title}</h3>
                <p className="mt-2 text-sm text-zinc-600">{value.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <MoreLink to="/about" label={t('more')} />
      </section>

      <section id="academics" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <SectionHeading kicker={t('navAcademics')} title={t('academicsTitle')} subtitle={t('accreditation')} />
          </Reveal>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {copy.divisions.map((band, i) => (
              <Reveal key={band.grades} delay={i * 50}>
                <Link
                  to="/academics"
                  className="card-lift block rounded-3xl border border-school/10 bg-background px-5 py-6 hover:border-school"
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-accent">{band.grades}</p>
                  <h3 className="font-display mt-2 text-xl font-semibold text-school-dark">{band.title}</h3>
                </Link>
              </Reveal>
            ))}
          </div>
          <MoreLink to="/academics" label={t('more')} />
        </div>
      </section>

      <section id="life" className="overflow-x-hidden bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="life-pop">
            <SectionHeading kicker={t('navLife')} title={t('lifeTitle')} subtitle={t('pastoralBody')} />
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <Reveal className="life-pop" delay={120}>
              <article className="card-lift group overflow-hidden rounded-3xl bg-school-dark text-white">
                <img src={IMAGES.sports} alt="" className="img-zoom h-40 w-full object-cover opacity-80" />
                <div className="p-6">
                  <h3 className="font-display text-xl font-semibold">{t('sportsTitle')}</h3>
                  <p className="mt-2 text-sm text-white/75">{copy.sports.slice(0, 3).join(' · ')}</p>
                  <Link to="/athletics" className="mt-4 inline-block text-xs font-bold uppercase tracking-wide text-accent">
                    {t('navAthletics')} →
                  </Link>
                </div>
              </article>
            </Reveal>
            <Reveal className="life-pop" delay={260}>
              <article className="card-lift group overflow-hidden rounded-3xl bg-school-dark text-white">
                <img src={IMAGES.arts} alt="" className="img-zoom h-40 w-full object-cover opacity-80" />
                <div className="p-6">
                  <h3 className="font-display text-xl font-semibold">{t('artsTitle')}</h3>
                  <p className="mt-2 text-sm text-white/75">{copy.artsList.slice(0, 3).join(' · ')}</p>
                  <Link to="/arts" className="mt-4 inline-block text-xs font-bold uppercase tracking-wide text-accent">
                    {t('navArts')} →
                  </Link>
                </div>
              </article>
            </Reveal>
            <Reveal className="life-pop" delay={400}>
              <article className="card-lift group overflow-hidden rounded-3xl bg-school-dark text-white">
                <img src={IMAGES.kids} alt="" className="img-zoom h-40 w-full object-cover opacity-80" />
                <div className="p-6">
                  <h3 className="font-display text-xl font-semibold">{t('clubsTitle')}</h3>
                  <p className="mt-2 text-sm text-white/75">{copy.clubs.slice(0, 3).join(' · ')}</p>
                  <Link to="/life" className="mt-4 inline-block text-xs font-bold uppercase tracking-wide text-accent">
                    {t('navLife')} →
                  </Link>
                </div>
              </article>
            </Reveal>
          </div>
          <Reveal className="life-pop" delay={480}>
            <MoreLink to="/life" label={t('more')} />
          </Reveal>
        </div>
      </section>
    </>
  )
}
