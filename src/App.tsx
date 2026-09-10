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

export default function App() {
  const [year] = useState(() => new Date().getFullYear())

  useEffect(() => {
    document.title = `${profile.shortName} · ${profile.title}`
  }, [])

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
        <span>SPA em React + Vite · dados ao vivo do GitHub</span>
      </footer>
    </>
  )
}
