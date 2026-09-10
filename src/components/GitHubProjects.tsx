import { useEffect, useMemo, useState } from 'react'
import { hiddenRepos, profile } from '../data'

type Repo = {
  name: string
  description: string | null
  html_url: string
  homepage: string | null
  language: string | null
  stargazers_count: number
  pushed_at: string
  fork: boolean
}

export default function GitHubProjects() {
  const [repos, setRepos] = useState<Repo[]>([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('Carregando repositórios…')

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const response = await fetch(
          `https://api.github.com/users/${profile.githubUser}/repos?per_page=100&sort=updated`,
          { signal: controller.signal },
        )
        if (!response.ok) throw new Error('GitHub indisponível')
        const data = (await response.json()) as Repo[]
        const filtered = data.filter((repo) => !repo.fork && !hiddenRepos.has(repo.name))
        setRepos(filtered)
        setStatus(`${filtered.length} repositórios públicos`)
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setStatus('Não deu para buscar o GitHub agora. Os destaques acima continuam no ar.')
      }
    }

    void load()
    return () => controller.abort()
  }, [])

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    return repos
      .filter((repo) => {
        if (!term) return true
        return (
          repo.name.toLowerCase().includes(term) ||
          (repo.description ?? '').toLowerCase().includes(term) ||
          (repo.language ?? '').toLowerCase().includes(term)
        )
      })
      .slice(0, 9)
  }, [query, repos])

  return (
    <section className="section" id="github">
      <div className="wrap">
        <p className="kicker">GitHub</p>
        <h2>Repositórios ao vivo</h2>
        <div className="github-toolbar">
          <p className="status">{status}</p>
          <input
            type="search"
            placeholder="Filtrar por nome, stack ou descrição"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Filtrar repositórios"
          />
        </div>
        <div className="cards">
          {visible.map((repo) => (
            <article className="card" key={repo.name}>
              <div className="chips">
                {repo.language ? <span className="chip">{repo.language}</span> : null}
                <span className="chip">★ {repo.stargazers_count}</span>
              </div>
              <h3>{repo.name}</h3>
              <p>{repo.description || 'Sem descrição no GitHub — o código está no repositório.'}</p>
              <div className="card-links">
                <a href={repo.html_url} target="_blank" rel="noreferrer">
                  Abrir repo
                </a>
                {repo.homepage ? (
                  <a href={repo.homepage} target="_blank" rel="noreferrer">
                    Site
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
