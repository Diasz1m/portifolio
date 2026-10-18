import { useState } from 'react'
import { profile } from '../data'
import { useCopy, useLang, useSetLang, type Lang } from '../i18n'

const copy = {
  pt: {
    links: [
      { href: '#sobre', label: 'Sobre' },
      { href: '#experiencia', label: 'Experiência' },
      { href: '#projetos', label: 'Projetos' },
      { href: '#demos', label: 'Demos' },
      { href: '#github', label: 'GitHub' },
      { href: '#contato', label: 'Contato' },
    ],
    sections: 'Seções',
    menu: 'Abrir menu',
    language: 'Idioma',
  },
  en: {
    links: [
      { href: '#sobre', label: 'About' },
      { href: '#experiencia', label: 'Experience' },
      { href: '#projetos', label: 'Projects' },
      { href: '#demos', label: 'Demos' },
      { href: '#github', label: 'GitHub' },
      { href: '#contato', label: 'Contact' },
    ],
    sections: 'Sections',
    menu: 'Open menu',
    language: 'Language',
  },
}

const idiomas: Array<{ code: Lang; label: string }> = [
  { code: 'pt', label: 'PT' },
  { code: 'en', label: 'EN' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const t = useCopy(copy)
  const lang = useLang()
  const setLang = useSetLang()

  return (
    <header className="site-header">
      <div className="wrap">
        <a className="logo" href="#topo">
          MD
        </a>
        <nav className={open ? 'nav open' : 'nav'} aria-label={t.sections}>
          {t.links.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="lang-switch" role="group" aria-label={t.language}>
          {idiomas.map((idioma) => (
            <button
              key={idioma.code}
              type="button"
              className={idioma.code === lang ? 'on' : undefined}
              aria-pressed={idioma.code === lang}
              onClick={() => setLang(idioma.code)}
            >
              {idioma.label}
            </button>
          ))}
        </div>
        <a className="ghost-btn" href={profile.github} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={open}
          aria-label={t.menu}
          onClick={() => setOpen((value) => !value)}
        >
          Menu
        </button>
      </div>
    </header>
  )
}
