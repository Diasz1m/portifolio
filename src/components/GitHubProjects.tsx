import { useEffect, useMemo, useState } from 'react'
import { hiddenRepos, profile } from '../data'
import { useCopy, useLang } from '../i18n'

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

const copy = {
  pt: {
    kicker: 'GitHub',
    title: 'Repositórios ao vivo',
    loading: 'Carregando repositórios…',
    count: (total: number) => `${total} repositórios públicos`,
    failed: 'Não deu para buscar o GitHub agora. Os destaques acima continuam no ar.',
    placeholder: 'Filtrar por nome, stack ou descrição',
    filterLabel: 'Filtrar repositórios',
    noDescription: 'Sem descrição no GitHub — o código está no repositório.',
    open: 'Abrir repo',
    site: 'Site',
  },
  en: {
    kicker: 'GitHub',
    title: 'Live repositories',
    loading: 'Loading repositories…',
    count: (total: number) => `${total} public repositories`,
    failed: "Couldn't reach GitHub right now. The featured projects above are still available.",
    placeholder: 'Filter by name, stack or description',
    filterLabel: 'Filter repositories',
    noDescription: 'No description on GitHub — the code is in the repository.',
    open: 'Open repo',
    site: 'Website',
  },
}

export default function GitHubProjects() {
  const [repos, setRepos] = useState<Repo[]>([])
  const [query, setQuery] = useState('')
  const [erro, setErro] = useState(false)
  const t = useCopy(copy)
  const lang = useLang()

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
        setRepos(data.filter((repo) => !repo.fork && !hiddenRepos.has(repo.name)))
        setErro(false)
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setErro(true)
      }
    }

    void load()
    return () => controller.abort()
  }, [])

  /* O status é derivado para acompanhar a troca de idioma depois da busca. */
  const status = erro ? t.failed : repos.length ? t.count(repos.length) : t.loading

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
        <p className="kicker">{t.kicker}</p>
        <h2>{t.title}</h2>
        <div className="github-toolbar">
          <p className="status">{status}</p>
          <input
            type="search"
            placeholder={t.placeholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label={t.filterLabel}
            lang={lang}
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
              <p>{repo.description || t.noDescription}</p>
              <div className="card-links">
                <a href={repo.html_url} target="_blank" rel="noreferrer">
                  {t.open}
                </a>
                {repo.homepage ? (
                  <a href={repo.homepage} target="_blank" rel="noreferrer">
                    {t.site}
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
