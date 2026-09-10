import { featuredProjects } from '../data'

export default function Projects() {
  return (
    <section className="section" id="projetos">
      <div className="wrap">
        <p className="kicker">Seleção</p>
        <h2>Projetos em destaque</h2>
        <p className="lede" style={{ margin: '12px 0 28px' }}>
          Alguns repositórios públicos que mostram o tipo de coisa que eu construo. Os que têm demo
          podem ser testados aqui mesmo, mais abaixo.
        </p>
        <div className="cards">
          {featuredProjects.map((project) => (
            <article className="card" key={project.name}>
              <div className="chips">
                {project.stack.map((tech) => (
                  <span className="chip" key={tech}>
                    {tech}
                  </span>
                ))}
              </div>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <div className="card-links">
                <a href={project.url} target="_blank" rel="noreferrer">
                  Código no GitHub
                </a>
                {project.demo ? <a href={project.demo}>Abrir demo</a> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
