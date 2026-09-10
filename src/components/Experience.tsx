import { experience } from '../data'

export default function Experience() {
  return (
    <section className="section" id="experiencia">
      <div className="wrap">
        <p className="kicker">Trajetória</p>
        <h2>Experiência profissional</h2>
        <p className="lede" style={{ margin: '12px 0 28px' }}>
          Quatro anos construindo sistemas de gestão, integrações e produtos SaaS em Pato Branco.
        </p>
        <div className="timeline">
          {experience.map((job) => (
            <article className="job" key={`${job.company}-${job.period}`}>
              <header>
                <div>
                  <h3>{job.role}</h3>
                  <p>
                    {job.company} · {job.place}
                  </p>
                </div>
                <span className="when">{job.period}</span>
              </header>
              <ul>
                {job.points.map((point) => (
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
