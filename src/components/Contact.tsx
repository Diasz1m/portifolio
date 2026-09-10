import { profile } from '../data'

export default function Contact() {
  return (
    <section className="section" id="contato">
      <div className="wrap contact">
        <div>
          <p className="kicker">Contato</p>
          <h2>Vamos conversar sobre o próximo sistema.</h2>
          <p className="lede" style={{ marginTop: 16 }}>
            Se você precisa de alguém para backend Java, React, integrações ou para colocar um
            produto SaaS de pé, me chama.
          </p>
        </div>
        <div className="contact-card">
          <a href={`mailto:${profile.email}`}>
            <strong>E-mail</strong>
            {profile.email}
          </a>
          <a href={`tel:+5546988009754`}>
            <strong>Telefone</strong>
            {profile.phone}
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">
            <strong>LinkedIn</strong>
            matheus-dias-5691bb195
          </a>
          <a href={profile.github} target="_blank" rel="noreferrer">
            <strong>GitHub</strong>
            github.com/Diasz1m
          </a>
        </div>
      </div>
    </section>
  )
}
