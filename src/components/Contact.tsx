import { profile } from '../data'
import { useCopy } from '../i18n'

const copy = {
  pt: {
    kicker: 'Contato',
    title: 'Vamos conversar sobre o próximo sistema.',
    lede: 'Se você precisa de alguém para backend Java, React, integrações ou para colocar um produto SaaS de pé, me chama.',
    email: 'E-mail',
    phone: 'Telefone',
  },
  en: {
    kicker: 'Contact',
    title: "Let's talk about the next system.",
    lede: 'If you need someone for Java backends, React, integrations or to get a SaaS product off the ground, get in touch.',
    email: 'Email',
    phone: 'Phone',
  },
}

export default function Contact() {
  const t = useCopy(copy)

  return (
    <section className="section" id="contato">
      <div className="wrap contact">
        <div>
          <p className="kicker">{t.kicker}</p>
          <h2>{t.title}</h2>
          <p className="lede" style={{ marginTop: 16 }}>
            {t.lede}
          </p>
        </div>
        <div className="contact-card">
          <a href={`mailto:${profile.email}`}>
            <strong>{t.email}</strong>
            {profile.email}
          </a>
          <a href="tel:+5546988009754">
            <strong>{t.phone}</strong>
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
