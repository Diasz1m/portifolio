import { useEffect, useState } from 'react'
import { profile } from './data'
import About from './components/About'
import Contact from './components/Contact'
import Demos from './components/Demos'
import Experience from './components/Experience'
import GitHubProjects from './components/GitHubProjects'
import Header from './components/Header'
import Hero from './components/Hero'
import Projects from './components/Projects'
import { useCopy, useLang } from './i18n'

const copy = {
  pt: { footer: 'SPA em React + Vite · dados ao vivo do GitHub' },
  en: { footer: 'React + Vite SPA · live data from GitHub' },
}

export default function App() {
  const [year] = useState(() => new Date().getFullYear())
  const lang = useLang()
  const t = useCopy(copy)

  useEffect(() => {
    document.title = `${profile.shortName} · ${profile.title[lang]}`
  }, [lang])

  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Demos />
        <GitHubProjects />
        <Contact />
      </main>
      <footer className="wrap site-footer">
        <span>
          © {year} {profile.name}
        </span>
        <span>{t.footer}</span>
      </footer>
    </>
  )
}
