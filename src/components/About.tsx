import { profile, skills } from '../data'
import { useCopy, useLang } from '../i18n'

const copy = {
  pt: {
    kicker: 'Sobre',
    title: 'Do sistema de gestão ao helpdesk, passando por APIs e integrações.',
  },
  en: {
    kicker: 'About',
    title: 'From management systems to helpdesks, by way of APIs and integrations.',
  },
}

export default function About() {
  const t = useCopy(copy)
  const lang = useLang()

  return (
    <section className="section" id="sobre">
      <div className="wrap split">
        <div className="about-copy">
          <p className="kicker">{t.kicker}</p>
          <h2>{t.title}</h2>
          {profile.about[lang].map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="skill-grid">
          {skills.map((group) => (
            <article className="skill-card" key={group.group.en}>
              <h3>{group.group[lang]}</h3>
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
