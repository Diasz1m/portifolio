import { profile } from '../data'

export default function Hero() {
  return (
    <section className="wrap hero" id="topo">
      <div>
        <p className="kicker">{profile.location}</p>
        <h1>{profile.name}</h1>
        <p className="lede">{profile.headline}</p>
        <div className="hero-meta">
          <span>{profile.title}</span>
          <span>UTFPR · ADS</span>
          <span>Aberto a conversas</span>
        </div>
        <div className="hero-actions">
          <a className="solid-btn" href="#projetos">
            Ver projetos
          </a>
          <a className="ghost-btn" href="#demos">
            Rodar demos
          </a>
          <a className="ghost-btn" href={profile.resume} target="_blank" rel="noreferrer">
            Currículo
          </a>
        </div>
      </div>
      <figure className="portrait">
        <img src={profile.avatar} alt={`Foto de ${profile.name}`} />
        <figcaption>Full stack · Java, React, PHP e Python</figcaption>
      </figure>
    </section>
  )
}
