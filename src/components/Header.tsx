import { useState } from 'react'
import { profile } from '../data'

const links = [
  { href: '#sobre', label: 'Sobre' },
  { href: '#experiencia', label: 'Experiência' },
  { href: '#projetos', label: 'Projetos' },
  { href: '#demos', label: 'Demos' },
  { href: '#github', label: 'GitHub' },
  { href: '#contato', label: 'Contato' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="wrap">
        <a className="logo" href="#topo">
          MD
        </a>
        <nav className={open ? 'nav open' : 'nav'} aria-label="Seções">
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
        </nav>
        <a className="ghost-btn" href={profile.github} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={open}
          aria-label="Abrir menu"
          onClick={() => setOpen((value) => !value)}
        >
          Menu
        </button>
      </div>
    </header>
  )
}
