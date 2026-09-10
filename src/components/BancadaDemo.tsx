import { useMemo, useState, type FormEvent } from 'react'

type Role = 'admin' | 'agente' | 'solicitante'
type Status = 'aberto' | 'em_andamento' | 'resolvido'
type Priority = 'baixa' | 'media' | 'alta'
type Screen = 'login' | 'list' | 'create' | 'detail'

type User = {
  id: number
  name: string
  email: string
  password: string
  role: Role
}

type Ticket = {
  id: number
  title: string
  description: string
  status: Status
  priority: Priority
  requester: string
  requesterId: number
  assignee: string | null
  createdAt: string
}

type Comment = {
  id: number
  ticketId: number
  author: string
  body: string
  createdAt: string
}

const USERS: User[] = [
  { id: 1, name: 'Ana Souza', email: 'ana@bancada.test', password: 'senha123', role: 'agente' },
  { id: 2, name: 'Carlos Lima', email: 'carlos@bancada.test', password: 'senha123', role: 'solicitante' },
  { id: 3, name: 'Marina Alves', email: 'admin@bancada.test', password: 'senha123', role: 'admin' },
]

const nowLabel = () => new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

const seedTickets = (): Ticket[] => [
  {
    id: 1,
    title: 'VPN corporativa cai a cada 20 minutos',
    description:
      'Desde a troca do firewall, a VPN desconecta sozinha. Afeta o time comercial em home office.',
    status: 'aberto',
    priority: 'alta',
    requester: 'Carlos Lima',
    requesterId: 2,
    assignee: 'Ana Souza',
    createdAt: nowLabel(),
  },
  {
    id: 2,
    title: 'Notebook não reconhece o segundo monitor',
    description: 'Dock Dell, monitor HDMI. Funcionava na semana passada.',
    status: 'em_andamento',
    priority: 'media',
    requester: 'Carlos Lima',
    requesterId: 2,
    assignee: 'Ana Souza',
    createdAt: nowLabel(),
  },
  {
    id: 3,
    title: 'Liberar acesso ao drive de projetos',
    description: 'Carlos precisa da pasta /projetos/2026 para a proposta da ACME.',
    status: 'resolvido',
    priority: 'baixa',
    requester: 'Carlos Lima',
    requesterId: 2,
    assignee: 'Marina Alves',
    createdAt: nowLabel(),
  },
]

const seedComments = (): Comment[] => [
  {
    id: 1,
    ticketId: 2,
    author: 'Ana Souza',
    body: 'Vou testar outro dongle HDMI amanhã de manhã.',
    createdAt: nowLabel(),
  },
]

const STATUS_LABEL: Record<Status, string> = {
  aberto: 'aberto',
  em_andamento: 'em andamento',
  resolvido: 'resolvido',
}

const PRIORITY_LABEL: Record<Priority, string> = {
  baixa: 'baixa',
  media: 'média',
  alta: 'alta',
}

const FILTERS: Array<{ value: 'todos' | Status; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'aberto', label: 'Abertos' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'resolvido', label: 'Resolvidos' },
]

function isAgent(user: User) {
  return user.role === 'admin' || user.role === 'agente'
}

function Badge({ value, kind }: { value: Status | Priority; kind: 'status' | 'priority' }) {
  const label = kind === 'status' ? STATUS_LABEL[value as Status] : PRIORITY_LABEL[value as Priority]
  return <span className={`badge ${value}`}>{label}</span>
}

export default function BancadaDemo() {
  const [user, setUser] = useState<User | null>(null)
  const [screen, setScreen] = useState<Screen>('login')
  const [tickets, setTickets] = useState<Ticket[]>(seedTickets)
  const [comments, setComments] = useState<Comment[]>(seedComments)
  const [filter, setFilter] = useState<'todos' | Status>('todos')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [email, setEmail] = useState('ana@bancada.test')
  const [password, setPassword] = useState('senha123')
  const [loginError, setLoginError] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('media')
  const [formErrors, setFormErrors] = useState<{ title?: string; description?: string }>({})
  const [commentBody, setCommentBody] = useState('')
  const [actionError, setActionError] = useState('')

  const visibleTickets = useMemo(
    () => tickets.filter((ticket) => filter === 'todos' || ticket.status === filter),
    [filter, tickets],
  )

  const selected = tickets.find((ticket) => ticket.id === selectedId) ?? null
  const selectedComments = comments.filter((comment) => comment.ticketId === selectedId)
  const stats = {
    total: tickets.length,
    aberto: tickets.filter((ticket) => ticket.status === 'aberto').length,
    em_andamento: tickets.filter((ticket) => ticket.status === 'em_andamento').length,
    resolvido: tickets.filter((ticket) => ticket.status === 'resolvido').length,
  }

  function loginAs(account: User) {
    setUser(account)
    setScreen('list')
    setFilter('todos')
    setLoginError('')
    setActionError('')
  }

  function submitLogin(event: FormEvent) {
    event.preventDefault()
    const found = USERS.find(
      (account) => account.email === email.trim().toLowerCase() && account.password === password,
    )
    if (!found) {
      setLoginError('Credenciais inválidas. (401)')
      return
    }
    loginAs(found)
  }

  function logout() {
    setUser(null)
    setScreen('login')
    setSelectedId(null)
    setActionError('')
  }

  function openTicket(id: number) {
    setSelectedId(id)
    setScreen('detail')
    setActionError('')
    setCommentBody('')
  }

  function createTicket(event: FormEvent) {
    event.preventDefault()
    if (!user) return
    const errors: { title?: string; description?: string } = {}
    if (!title.trim()) errors.title = 'Título é obrigatório.'
    if (!description.trim()) errors.description = 'Descrição é obrigatória.'
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    const ticket: Ticket = {
      id: Math.max(0, ...tickets.map((ticket) => ticket.id)) + 1,
      title: title.trim(),
      description: description.trim(),
      status: 'aberto',
      priority,
      requester: user.name,
      requesterId: user.id,
      assignee: null,
      createdAt: nowLabel(),
    }
    setTickets((current) => [ticket, ...current])
    setTitle('')
    setDescription('')
    setPriority('media')
    setFormErrors({})
    openTicket(ticket.id)
  }

  function updateStatus(next: Status) {
    if (!user || !selected) return
    if (!isAgent(user)) {
      setActionError('Sem permissão para alterar o chamado. (403)')
      return
    }
    setTickets((current) =>
      current.map((ticket) => (ticket.id === selected.id ? { ...ticket, status: next } : ticket)),
    )
    setActionError('')
  }

  function assignMe() {
    if (!user || !selected) return
    if (!isAgent(user)) {
      setActionError('Sem permissão para alterar o chamado. (403)')
      return
    }
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === selected.id
          ? { ...ticket, assignee: user.name, status: ticket.status === 'aberto' ? 'em_andamento' : ticket.status }
          : ticket,
      ),
    )
    setActionError('')
  }

  function sendComment(event: FormEvent) {
    event.preventDefault()
    if (!user || !selected || !commentBody.trim()) return
    setComments((current) => [
      ...current,
      {
        id: Math.max(0, ...current.map((comment) => comment.id)) + 1,
        ticketId: selected.id,
        author: user.name,
        body: commentBody.trim(),
        createdAt: nowLabel(),
      },
    ])
    setCommentBody('')
  }

  return (
    <article className="panel bancada" id="demo-bancada">
      <div className="bancada-head">
        <div>
          <h3>Bancada</h3>
          <p className="hint">
            Helpdesk interno no mesmo contrato do repositório{' '}
            <a href="https://github.com/Diasz1m/bancada" target="_blank" rel="noreferrer">
              bancada
            </a>
            : login, papéis, filtro da fila, 422 no formulário e 403 se o solicitante tenta mudar
            status. Roda aqui no navegador, sem Docker.
          </p>
        </div>
        {user ? (
          <div className="bancada-user">
            <span>
              {user.name} · {user.role}
            </span>
            <button className="ghost-btn" type="button" onClick={logout}>
              Sair
            </button>
          </div>
        ) : null}
      </div>

      {screen === 'login' ? (
        <div className="bancada-login">
          <div>
            <p className="kicker">A mesa de TI</p>
            <p className="lede">
              Entre com uma das contas de teste. Ana altera status; Carlos só abre e comenta;
              Marina é admin.
            </p>
            <div className="bancada-accounts">
              {USERS.map((account) => (
                <button key={account.email} type="button" className="chip" onClick={() => loginAs(account)}>
                  {account.name} · {account.role}
                </button>
              ))}
            </div>
          </div>
          <form className="bancada-form" onSubmit={submitLogin}>
            <label>
              <span>E-mail</span>
              <input value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" />
            </label>
            <label>
              <span>Senha</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </label>
            {loginError ? <p className="error">{loginError}</p> : null}
            <button className="solid-btn" type="submit">
              Entrar
            </button>
            <p className="status">senha123 para todas as contas</p>
          </form>
        </div>
      ) : null}

      {user && screen === 'list' ? (
        <div>
          <div className="bancada-stats">
            <div className="stat">
              <b>{stats.total}</b> total
            </div>
            <div className="stat">
              <b>{stats.aberto}</b> abertos
            </div>
            <div className="stat">
              <b>{stats.em_andamento}</b> em andamento
            </div>
            <div className="stat">
              <b>{stats.resolvido}</b> resolvidos
            </div>
          </div>
          <div className="bancada-toolbar">
            <div className="filters">
              {FILTERS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={filter === option.value ? 'chip active' : 'chip'}
                  onClick={() => setFilter(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button className="solid-btn" type="button" onClick={() => setScreen('create')}>
              Abrir chamado
            </button>
          </div>
          {visibleTickets.length === 0 ? (
            <p className="status">Nenhum chamado neste filtro.</p>
          ) : (
            <div className="bancada-table-wrap">
              <table className="bancada-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Título</th>
                    <th>Status</th>
                    <th>Prioridade</th>
                    <th>Responsável</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>{ticket.id}</td>
                      <td>
                        <button type="button" className="linkish" onClick={() => openTicket(ticket.id)}>
                          {ticket.title}
                        </button>
                      </td>
                      <td>
                        <Badge kind="status" value={ticket.status} />
                      </td>
                      <td>
                        <Badge kind="priority" value={ticket.priority} />
                      </td>
                      <td>{ticket.assignee || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}

      {user && screen === 'create' ? (
        <form className="bancada-form" onSubmit={createTicket}>
          <button className="linkish" type="button" onClick={() => setScreen('list')}>
            ← Voltar à fila
          </button>
          <label>
            <span>Título</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
            {formErrors.title ? <span className="error">{formErrors.title}</span> : null}
          </label>
          <label>
            <span>Prioridade</span>
            <select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          </label>
          <label>
            <span>Descrição</span>
            <textarea rows={4} value={description} onChange={(event) => setDescription(event.target.value)} />
            {formErrors.description ? <span className="error">{formErrors.description}</span> : null}
          </label>
          <button className="solid-btn" type="submit">
            Abrir chamado
          </button>
        </form>
      ) : null}

      {user && screen === 'detail' && selected ? (
        <div className="bancada-detail">
          <button className="linkish" type="button" onClick={() => setScreen('list')}>
            ← Voltar à fila
          </button>
          <div className="bancada-detail-grid">
            <section>
              <p className="status">Chamado #{selected.id}</p>
              <h4>{selected.title}</h4>
              <p>{selected.description}</p>
              <p className="status">
                Aberto por {selected.requester} · prioridade {PRIORITY_LABEL[selected.priority]}
              </p>
              <div className="comments">
                {selectedComments.length === 0 ? (
                  <p className="status">Nenhum comentário ainda.</p>
                ) : (
                  selectedComments.map((comment) => (
                    <article key={comment.id} className="comment">
                      <strong>{comment.author}</strong>
                      <time>{comment.createdAt}</time>
                      <p>{comment.body}</p>
                    </article>
                  ))
                )}
              </div>
              <form className="bancada-form" onSubmit={sendComment}>
                <label>
                  <span>Novo comentário</span>
                  <textarea rows={3} value={commentBody} onChange={(event) => setCommentBody(event.target.value)} />
                </label>
                <button className="solid-btn" type="submit" disabled={!commentBody.trim()}>
                  Comentar
                </button>
              </form>
            </section>
            <aside className="bancada-aside">
              <h4>Triagem</h4>
              <p className="status">Agente e admin alteram status. Solicitante recebe 403.</p>
              <label>
                <span>Status</span>
                <select
                  value={selected.status}
                  onChange={(event) => updateStatus(event.target.value as Status)}
                >
                  <option value="aberto">Aberto</option>
                  <option value="em_andamento">Em andamento</option>
                  <option value="resolvido">Resolvido</option>
                </select>
              </label>
              {isAgent(user) ? (
                <button className="ghost-btn" type="button" onClick={assignMe}>
                  Atribuir a mim
                </button>
              ) : null}
              <p className="status">Responsável: {selected.assignee || 'ninguém'}</p>
              {actionError ? <p className="error">{actionError}</p> : null}
            </aside>
          </div>
        </div>
      ) : null}
    </article>
  )
}
