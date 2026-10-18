import { profile } from '../data'
import { useCopy, useLang } from '../i18n'

const copy = {
  pt: {
    school: 'UTFPR · ADS',
    open: 'Aberto a conversas',
    projects: 'Ver projetos',
    demos: 'Rodar demos',
    resume: 'Currículo',
    caption: 'Full stack · Java, React, PHP e Python',
    alt: (nome: string) => `Foto de ${nome}`,
  },
  en: {
    school: 'UTFPR · Systems Analysis',
    open: 'Open to opportunities',
    projects: 'View projects',
    demos: 'Run demos',
    resume: 'Resume',
    caption: 'Full stack · Java, React, PHP and Python',
    alt: (nome: string) => `Photo of ${nome}`,
  },
}

export default function Hero() {
  const t = useCopy(copy)
  const lang = useLang()

  return (
    <section className="wrap hero" id="topo">
      <div>
        <p className="kicker">{profile.location[lang]}</p>
        <h1>{profile.name}</h1>
        <p className="lede">{profile.headline[lang]}</p>
        <div className="hero-meta">
          <span>{profile.title[lang]}</span>
          <span>{t.school}</span>
          <span>{t.open}</span>
        </div>
        <div className="hero-actions">
          <a className="solid-btn" href="#projetos">
            {t.projects}
          </a>
          <a className="ghost-btn" href="#demos">
            {t.demos}
          </a>
          <a className="ghost-btn" href={profile.resume} target="_blank" rel="noreferrer">
            {t.resume}
          </a>
        </div>
      </div>
      <figure className="portrait">
        <img src={profile.avatar} alt={t.alt(profile.name)} />
        <figcaption>{t.caption}</figcaption>
      </figure>
    </section>
  )
}
