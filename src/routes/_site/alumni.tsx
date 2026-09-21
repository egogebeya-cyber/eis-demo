import { Link, createFileRoute } from '@tanstack/react-router'
import { CtaBand, InnerSplit, PageHero } from '~/components/site-ui'
import { useLocale } from '~/components/locale-context'
import { IMAGES } from '~/lib/images'

export const Route = createFileRoute('/_site/alumni')({
  component: AlumniPage,
})

function AlumniPage() {
  const { t } = useLocale()
  return (
    <div>
      <PageHero kicker={t('navAlumni')} title={t('alumniTitle')} subtitle={t('alumniBody')} image={IMAGES.alumni} />
      <InnerSplit
        kicker="There is more in you"
        title="Selam Tadesse, Class of 2019"
        body="She arrived shy of the microphone. By Grade 12 she was leading the house choir, then reading medicine. The same courtyard that taught her to try also taught her to stay."
        image={IMAGES.alumni}
      />
      <section className="gs-know-grid">
        <article className="gs-know-card">
          <h3>{t('housesTitle')}</h3>
          <p>Nile · Awash · Abbay. The house you left still has a place at the table.</p>
        </article>
        <article className="gs-know-card">
          <h3>{t('give')}</h3>
          <p>{t('aidBody')}</p>
        </article>
        <article className="gs-know-card">
          <h3>{t('navNews')}</h3>
          <p>Read what the courtyard is doing this term.</p>
          <Link to="/news" className="gs-split-cta">
            {t('newsFollow')}
          </Link>
        </article>
      </section>
      <CtaBand
        title={t('getInTouch')}
        primary={{ to: '/contact', label: t('navContact') }}
        secondary={{ to: '/careers', label: t('navCareers') }}
      />
    </div>
  )
}
