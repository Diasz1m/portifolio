import { experience } from '../data'
import { useCopy, useLang } from '../i18n'

const copy = {
  pt: {
    kicker: 'Trajetória',
    title: 'Experiência profissional',
    lede: 'Quase seis anos construindo sistemas de gestão, integrações e produtos SaaS em Pato Branco.',
  },
  en: {
    kicker: 'Track record',
    title: 'Professional experience',
    lede: 'Almost six years building management systems, integrations and SaaS products in Pato Branco, Brazil.',
  },
}

export default function Experience() {
  const t = useCopy(copy)
  const lang = useLang()

  return (
    <section className="section" id="experiencia">
      <div className="wrap">
        <p className="kicker">{t.kicker}</p>
        <h2>{t.title}</h2>
        <p className="lede" style={{ margin: '12px 0 28px' }}>
          {t.lede}
        </p>
        <div className="timeline">
          {experience.map((job) => (
            <article className="job" key={`${job.company}-${job.period.en}`}>
              <header>
                <div>
                  <h3>{job.role[lang]}</h3>
                  <p>
                    {job.company} · {job.place}
                  </p>
                </div>
                <span className="when">{job.period[lang]}</span>
              </header>
              <ul>
                {job.points[lang].map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
