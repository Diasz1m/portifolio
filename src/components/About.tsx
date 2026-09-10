import { profile, skills } from '../data'

export default function About() {
  return (
    <section className="section" id="sobre">
      <div className="wrap split">
        <div className="about-copy">
          <p className="kicker">Sobre</p>
          <h2>Do CRM ao helpdesk, passando por APIs e importação de dados.</h2>
          {profile.about.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="skill-grid">
          {skills.map((group) => (
            <article className="skill-card" key={group.group}>
              <h3>{group.group}</h3>
              <div className="chips">
                {group.items.map((item) => (
                  <span className="chip" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
