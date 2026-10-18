import { featuredProjects } from '../data'
import { useCopy, useLang } from '../i18n'

const copy = {
  pt: {
    kicker: 'Seleção',
    title: 'Projetos em destaque',
    lede: 'Alguns repositórios públicos que mostram o tipo de coisa que eu construo. Os que têm demo podem ser testados aqui mesmo, mais abaixo.',
    code: 'Código no GitHub',
    demo: 'Abrir demo',
  },
  en: {
    kicker: 'Selection',
    title: 'Featured projects',
    lede: 'A few public repositories that show the kind of thing I build. The ones with a demo can be tried right here, further down.',
    code: 'Code on GitHub',
    demo: 'Open demo',
  },
}

export default function Projects() {
  const t = useCopy(copy)
  const lang = useLang()

  return (
    <section className="section" id="projetos">
      <div className="wrap">
        <p className="kicker">{t.kicker}</p>
        <h2>{t.title}</h2>
        <p className="lede" style={{ margin: '12px 0 28px' }}>
          {t.lede}
        </p>
        <div className="cards">
          {featuredProjects.map((project) => (
            <article className="card" key={project.name.en}>
              <div className="chips">
                {project.stack.map((tech) => (
                  <span className="chip" key={tech}>
                    {tech}
                  </span>
                ))}
              </div>
              <h3>{project.name[lang]}</h3>
              <p>{project.description[lang]}</p>
              <div className="card-links">
                <a href={project.url} target="_blank" rel="noreferrer">
                  {t.code}
                </a>
                {project.demo ? <a href={project.demo}>{t.demo}</a> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
