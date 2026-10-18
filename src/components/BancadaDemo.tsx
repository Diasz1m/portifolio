import { useMemo, useRef, useState, type FormEvent } from 'react'
import { assistantOpening, assistantReply, type AiOutcome } from '../bancadaAi'
import { localeAtual, useCopy } from '../i18n'
import BancadaAiChat, { type AiChatMessage } from './BancadaAiChat'

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
  aiOutcome: AiOutcome
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

const nowLabel = () =>
  new Date().toLocaleString(localeAtual(), { dateStyle: 'short', timeStyle: 'short' })

const seedTickets = (): Ticket[] => [
  {
    id: 1,
    title: 'VPN corporativa cai a cada 20 minutos',
    description:
      'Desde a troca do firewall, a VPN desconecta sozinha. Afeta o time comercial em home office.',
    status: 'aberto',
    priority: 'alta',
    aiOutcome: 'triagem',
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
    aiOutcome: 'triagem',
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
    aiOutcome: 'resolvido_ia',
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
  {
    id: 2,
    ticketId: 3,
    author: 'Carlos Lima',
    body: 'Resolvido com a assistente, sem fila humana.',
    createdAt: nowLabel(),
  },
]

const driveOpening = assistantOpening(
  'Liberar acesso ao drive de projetos',
  'Carlos precisa da pasta /projetos/2026 para a proposta da ACME.',
)

const seedAi = (): Record<number, AiChatMessage[]> => ({
  3: [
    { id: 1, role: 'assistant', body: driveOpening.body, suggestion: driveOpening.suggestion },
    { id: 2, role: 'user', body: 'Resolveu, obrigado', suggestion: null },
    {
      id: 3,
      role: 'assistant',
      body: 'Ótimo — então fechamos por aqui. Confirme em “Isso resolveu” para o chamado sair da fila. Se voltar a acontecer, abra outro ou escreva de novo.',
      suggestion: 'resolved',
    },
  ],
})

/** Ordem dos filtros da fila; o rótulo de cada um vem do bloco de textos. */
const FILTERS: Array<'todos' | Status> = ['todos', 'aberto', 'em_andamento', 'resolvido']

const copy = {
  pt: {
    titulo: 'Bancada',
    aberturaAntes: 'Helpdesk interno no mesmo contrato do repositório',
    aberturaDepois:
      ': login, papéis, assistente de triagem com procedimentos da TI, 422 no formulário e 403 se o solicitante tenta mudar status. Roda aqui no navegador, sem Docker.',
    sair: 'Sair',
    papeis: { admin: 'admin', agente: 'agente', solicitante: 'solicitante' },
    loginKicker: 'A mesa de TI',
    loginLede:
      'Entre com uma das contas de teste. Abra o chamado da VPN e converse com a assistente — ela usa a mesma base de procedimentos do projeto. Ana altera status; Carlos só abre e comenta; Marina é admin.',
    email: 'E-mail',
    senha: 'Senha',
    entrar: 'Entrar',
    dicaSenha: 'senha123 para todas as contas',
    erroLogin: 'Credenciais inválidas. (401)',
    stats: {
      total: 'total',
      aberto: 'abertos',
      em_andamento: 'em andamento',
      resolvido: 'resolvidos',
    },
    filtros: {
      todos: 'Todos',
      aberto: 'Abertos',
      em_andamento: 'Em andamento',
      resolvido: 'Resolvidos',
    },
    abrirChamado: 'Abrir chamado',
    filaVazia: 'Nenhum chamado neste filtro.',
    colunas: {
      titulo: 'Título',
      status: 'Status',
      prioridade: 'Prioridade',
      ia: 'IA',
      responsavel: 'Responsável',
    },
    status: { aberto: 'aberto', em_andamento: 'em andamento', resolvido: 'resolvido' },
    statusOpcao: { aberto: 'Aberto', em_andamento: 'Em andamento', resolvido: 'Resolvido' },
    prioridade: { baixa: 'baixa', media: 'média', alta: 'alta' },
    prioridadeOpcao: { baixa: 'Baixa', media: 'Média', alta: 'Alta' },
    ia: { triagem: 'em triagem', resolvido_ia: 'resolveu', escalado: 'com agente' },
    iaResumo: {
      triagem: 'tentando resolver',
      resolvido_ia: 'resolveu o chamado',
      escalado: 'passou para a fila',
    },
    voltar: '← Voltar à fila',
    campoTitulo: 'Título',
    campoPrioridade: 'Prioridade',
    campoDescricao: 'Descrição',
    tituloObrigatorio: 'Título é obrigatório.',
    descricaoObrigatoria: 'Descrição é obrigatória.',
    chamadoNumero: (id: number) => `Chamado #${id}`,
    abertoPor: (quem: string, prioridade: string) => `Aberto por ${quem} · prioridade ${prioridade}`,
    comentarios: 'Comentários',
    semComentarios: 'Nenhum comentário ainda.',
    novoComentario: 'Novo comentário',
    comentar: 'Comentar',
    triagem: 'Triagem',
    triagemNota:
      'A assistente atende primeiro. Agente e admin alteram status. Solicitante recebe 403.',
    atribuirMim: 'Atribuir a mim',
    responsavel: (quem: string) => `Responsável: ${quem}`,
    ninguem: 'ninguém',
    assistente: (estado: string) => `Assistente: ${estado}`,
    erroPermissaoIa: 'Sem permissão para falar com a assistente neste chamado. (403)',
    erroIaEncerrada: 'A assistente já encerrou este atendimento. (409)',
    erroMensagemVazia: 'Escreva uma mensagem. (422)',
    erroJaResolvido: 'Chamado já está resolvido. (409)',
    erroJaComAgente: 'Este chamado já está com um agente. (409)',
    erroPermissaoChamado: 'Sem permissão para alterar o chamado. (403)',
  },
  en: {
    titulo: 'Bancada',
    aberturaAntes: 'Internal helpdesk built to the same contract as the',
    aberturaDepois:
      ' repository: login, roles, a triage assistant backed by IT procedures, a 422 on the form and a 403 when the requester tries to change status. It runs right here in the browser, no Docker.',
    sair: 'Sign out',
    papeis: { admin: 'admin', agente: 'agent', solicitante: 'requester' },
    loginKicker: 'The IT desk',
    loginLede:
      'Sign in with one of the test accounts. Open the VPN ticket and talk to the assistant — it works from the same procedure base as the project. Ana changes status; Carlos only opens tickets and comments; Marina is the admin.',
    email: 'Email',
    senha: 'Password',
    entrar: 'Sign in',
    dicaSenha: 'senha123 for every account',
    erroLogin: 'Invalid credentials. (401)',
    stats: {
      total: 'total',
      aberto: 'open',
      em_andamento: 'in progress',
      resolvido: 'resolved',
    },
    filtros: {
      todos: 'All',
      aberto: 'Open',
      em_andamento: 'In progress',
      resolvido: 'Resolved',
    },
    abrirChamado: 'Open ticket',
    filaVazia: 'No tickets in this filter.',
    colunas: {
      titulo: 'Title',
      status: 'Status',
      prioridade: 'Priority',
      ia: 'AI',
      responsavel: 'Assignee',
    },
    status: { aberto: 'open', em_andamento: 'in progress', resolvido: 'resolved' },
    statusOpcao: { aberto: 'Open', em_andamento: 'In progress', resolvido: 'Resolved' },
    prioridade: { baixa: 'low', media: 'medium', alta: 'high' },
    prioridadeOpcao: { baixa: 'Low', media: 'Medium', alta: 'High' },
    ia: { triagem: 'triaging', resolvido_ia: 'resolved it', escalado: 'with an agent' },
    iaResumo: {
      triagem: 'trying to resolve it',
      resolvido_ia: 'resolved the ticket',
      escalado: 'handed it to the queue',
    },
    voltar: '← Back to the queue',
    campoTitulo: 'Title',
    campoPrioridade: 'Priority',
    campoDescricao: 'Description',
    tituloObrigatorio: 'Title is required.',
    descricaoObrigatoria: 'Description is required.',
    chamadoNumero: (id: number) => `Ticket #${id}`,
    abertoPor: (quem: string, prioridade: string) => `Opened by ${quem} · ${prioridade} priority`,
    comentarios: 'Comments',
    semComentarios: 'No comments yet.',
    novoComentario: 'New comment',
    comentar: 'Comment',
    triagem: 'Triage',
    triagemNota:
      'The assistant answers first. Agents and admins change status. Requesters get a 403.',
    atribuirMim: 'Assign to me',
    responsavel: (quem: string) => `Assignee: ${quem}`,
    ninguem: 'nobody',
    assistente: (estado: string) => `Assistant: ${estado}`,
    erroPermissaoIa: 'You cannot talk to the assistant on this ticket. (403)',
    erroIaEncerrada: 'The assistant has already closed this conversation. (409)',
    erroMensagemVazia: 'Write a message. (422)',
    erroJaResolvido: 'This ticket is already resolved. (409)',
    erroJaComAgente: 'This ticket is already with an agent. (409)',
    erroPermissaoChamado: 'You cannot change this ticket. (403)',
  },
}

function isAgent(user: User) {
  return user.role === 'admin' || user.role === 'agente'
}

function Badge({ value, kind }: { value: Status | Priority; kind: 'status' | 'priority' }) {
  const t = useCopy(copy)
  const label = kind === 'status' ? t.status[value as Status] : t.prioridade[value as Priority]
  return <span className={`badge ${value}`}>{label}</span>
}

export default function BancadaDemo() {
  const t = useCopy(copy)
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
  const [aiMessages, setAiMessages] = useState<Record<number, AiChatMessage[]>>(seedAi)
  const [aiError, setAiError] = useState('')
  const aiSeq = useRef(10)

  const visibleTickets = useMemo(
    () => tickets.filter((ticket) => filter === 'todos' || ticket.status === filter),
    [filter, tickets],
  )

  const selected = tickets.find((ticket) => ticket.id === selectedId) ?? null
  const selectedComments = comments.filter((comment) => comment.ticketId === selectedId)
  const selectedAi = selected ? (aiMessages[selected.id] ?? []) : []
  const canChatAi = Boolean(
    user &&
      selected &&
      selected.status !== 'resolvido' &&
      selected.aiOutcome === 'triagem' &&
      (isAgent(user) || selected.requesterId === user.id),
  )
  const stats = {
    total: tickets.length,
    aberto: tickets.filter((ticket) => ticket.status === 'aberto').length,
    em_andamento: tickets.filter((ticket) => ticket.status === 'em_andamento').length,
    resolvido: tickets.filter((ticket) => ticket.status === 'resolvido').length,
  }

  function takeAiId() {
    const id = aiSeq.current
    aiSeq.current += 1
    return id
  }

  function bootstrapAi(ticket: Ticket) {
    setAiMessages((current) => {
      if (current[ticket.id]?.length) return current
      if (ticket.status === 'resolvido' || ticket.aiOutcome !== 'triagem') return current
      const opening = assistantOpening(ticket.title, ticket.description)
      return {
        ...current,
        [ticket.id]: [
          {
            id: takeAiId(),
            role: 'assistant',
            body: opening.body,
            suggestion: opening.suggestion,
          },
        ],
      }
    })
  }

  function addComment(ticketId: number, author: string, body: string) {
    setComments((current) => [
      ...current,
      {
        id: Math.max(0, ...current.map((comment) => comment.id)) + 1,
        ticketId,
        author,
        body,
        createdAt: nowLabel(),
      },
    ])
  }

  function loginAs(account: User) {
    setUser(account)
    setScreen('list')
    setFilter('todos')
    setLoginError('')
    setActionError('')
    setAiError('')
  }

  function submitLogin(event: FormEvent) {
    event.preventDefault()
    const found = USERS.find(
      (account) => account.email === email.trim().toLowerCase() && account.password === password,
    )
    if (!found) {
      setLoginError(t.erroLogin)
      return
    }
    loginAs(found)
  }

  function logout() {
    setUser(null)
    setScreen('login')
    setSelectedId(null)
    setActionError('')
    setAiError('')
  }

  function openTicket(id: number) {
    const ticket = tickets.find((item) => item.id === id)
    setSelectedId(id)
    setScreen('detail')
    setActionError('')
    setAiError('')
    setCommentBody('')
    if (ticket) bootstrapAi(ticket)
  }

  function createTicket(event: FormEvent) {
    event.preventDefault()
    if (!user) return
    const errors: { title?: string; description?: string } = {}
    if (!title.trim()) errors.title = t.tituloObrigatorio
    if (!description.trim()) errors.description = t.descricaoObrigatoria
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    const ticket: Ticket = {
      id: Math.max(0, ...tickets.map((ticket) => ticket.id)) + 1,
      title: title.trim(),
      description: description.trim(),
      status: 'aberto',
      priority,
      aiOutcome: 'triagem',
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
    setSelectedId(ticket.id)
    setScreen('detail')
    setActionError('')
    setAiError('')
    setCommentBody('')
    bootstrapAi(ticket)
  }

  function sendAi(text: string) {
    if (!user || !selected) return
    if (!(isAgent(user) || selected.requesterId === user.id)) {
      setAiError(t.erroPermissaoIa)
      return
    }
    if (selected.status === 'resolvido' || selected.aiOutcome !== 'triagem') {
      setAiError(t.erroIaEncerrada)
      return
    }
    if (!text.trim()) {
      setAiError(t.erroMensagemVazia)
      return
    }

    const history = selectedAi.map((item) => ({ role: item.role, body: item.body }))
    const reply = assistantReply(selected.title, selected.description, history, text.trim())
    setAiMessages((current) => ({
      ...current,
      [selected.id]: [
        ...(current[selected.id] ?? []),
        { id: takeAiId(), role: 'user', body: text.trim(), suggestion: null },
        { id: takeAiId(), role: 'assistant', body: reply.body, suggestion: reply.suggestion },
      ],
    }))
    setAiError('')
  }

  function resolveWithAi() {
    if (!user || !selected) return
    if (!(isAgent(user) || selected.requesterId === user.id)) {
      setAiError(t.erroPermissaoIa)
      return
    }
    if (selected.status === 'resolvido') {
      setAiError(t.erroJaResolvido)
      return
    }
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === selected.id ? { ...ticket, status: 'resolvido', aiOutcome: 'resolvido_ia' } : ticket,
      ),
    )
    addComment(selected.id, user.name, 'Resolvido com a assistente, sem fila humana.')
    setAiError('')
  }

  function escalateAi() {
    if (!user || !selected) return
    if (!(isAgent(user) || selected.requesterId === user.id)) {
      setAiError(t.erroPermissaoIa)
      return
    }
    if (selected.status === 'resolvido' || selected.aiOutcome !== 'triagem') {
      setAiError(t.erroJaComAgente)
      return
    }
    setTickets((current) =>
      current.map((ticket) => (ticket.id === selected.id ? { ...ticket, aiOutcome: 'escalado' } : ticket)),
    )
    addComment(
      selected.id,
      user.name,
      'Solicitante pediu um agente depois da triagem da assistente. O histórico da IA está no chamado.',
    )
    setAiMessages((current) => ({
      ...current,
      [selected.id]: [
        ...(current[selected.id] ?? []),
        {
          id: takeAiId(),
          role: 'assistant',
          body: 'Encaminhei para a fila humana. Um agente vê o histórico e continua daqui.',
          suggestion: 'escalate',
        },
      ],
    }))
    setAiError('')
  }

  function updateStatus(next: Status) {
    if (!user || !selected) return
    if (!isAgent(user)) {
      setActionError(t.erroPermissaoChamado)
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
      setActionError(t.erroPermissaoChamado)
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
          <h3>{t.titulo}</h3>
          <p className="hint">
            {t.aberturaAntes}{' '}
            <a href="https://github.com/Diasz1m/bancada" target="_blank" rel="noreferrer">
              bancada
            </a>
            {t.aberturaDepois}
          </p>
        </div>
        {user ? (
          <div className="bancada-user">
            <span>
              {user.name} · {t.papeis[user.role]}
            </span>
            <button className="ghost-btn" type="button" onClick={logout}>
              {t.sair}
            </button>
          </div>
        ) : null}
      </div>

      {screen === 'login' ? (
        <div className="bancada-login">
          <div>
            <p className="kicker">{t.loginKicker}</p>
            <p className="lede">{t.loginLede}</p>
            <div className="bancada-accounts">
              {USERS.map((account) => (
                <button key={account.email} type="button" className="chip" onClick={() => loginAs(account)}>
                  {account.name} · {t.papeis[account.role]}
                </button>
              ))}
            </div>
          </div>
          <form className="bancada-form" onSubmit={submitLogin}>
            <label>
              <span>{t.email}</span>
              <input value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" />
            </label>
            <label>
              <span>{t.senha}</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </label>
            {loginError ? <p className="error">{loginError}</p> : null}
            <button className="solid-btn" type="submit">
              {t.entrar}
            </button>
            <p className="status">{t.dicaSenha}</p>
          </form>
        </div>
      ) : null}

      {user && screen === 'list' ? (
        <div>
          <div className="bancada-stats">
            <div className="stat">
              <b>{stats.total}</b> {t.stats.total}
            </div>
            <div className="stat">
              <b>{stats.aberto}</b> {t.stats.aberto}
            </div>
            <div className="stat">
              <b>{stats.em_andamento}</b> {t.stats.em_andamento}
            </div>
            <div className="stat">
              <b>{stats.resolvido}</b> {t.stats.resolvido}
            </div>
          </div>
          <div className="bancada-toolbar">
            <div className="filters">
              {FILTERS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={filter === option ? 'chip active' : 'chip'}
                  onClick={() => setFilter(option)}
                >
                  {t.filtros[option]}
                </button>
              ))}
            </div>
            <button className="solid-btn" type="button" onClick={() => setScreen('create')}>
              {t.abrirChamado}
            </button>
          </div>
          {visibleTickets.length === 0 ? (
            <p className="status">{t.filaVazia}</p>
          ) : (
            <div className="bancada-table-wrap">
              <table className="bancada-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t.colunas.titulo}</th>
                    <th>{t.colunas.status}</th>
                    <th>{t.colunas.prioridade}</th>
                    <th>{t.colunas.ia}</th>
                    <th>{t.colunas.responsavel}</th>
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
                      <td>
                        <span className={`badge ${ticket.aiOutcome}`}>{t.ia[ticket.aiOutcome]}</span>
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
            {t.voltar}
          </button>
          <label>
            <span>{t.campoTitulo}</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
            {formErrors.title ? <span className="error">{formErrors.title}</span> : null}
          </label>
          <label>
            <span>{t.campoPrioridade}</span>
            <select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
              <option value="baixa">{t.prioridadeOpcao.baixa}</option>
              <option value="media">{t.prioridadeOpcao.media}</option>
              <option value="alta">{t.prioridadeOpcao.alta}</option>
            </select>
          </label>
          <label>
            <span>{t.campoDescricao}</span>
            <textarea rows={4} value={description} onChange={(event) => setDescription(event.target.value)} />
            {formErrors.description ? <span className="error">{formErrors.description}</span> : null}
          </label>
          <button className="solid-btn" type="submit">
            {t.abrirChamado}
          </button>
        </form>
      ) : null}

      {user && screen === 'detail' && selected ? (
        <div className="bancada-detail">
          <button className="linkish" type="button" onClick={() => setScreen('list')}>
            {t.voltar}
          </button>
          <div className="bancada-detail-grid">
            <section>
              <p className="status">{t.chamadoNumero(selected.id)}</p>
              <h4>{selected.title}</h4>
              <p>{selected.description}</p>
              <p className="status">
                {t.abertoPor(selected.requester, t.prioridade[selected.priority])}
              </p>
              <BancadaAiChat
                outcome={selected.aiOutcome}
                status={selected.status}
                canChat={canChatAi}
                messages={selectedAi}
                error={aiError}
                onSend={sendAi}
                onResolve={resolveWithAi}
                onEscalate={escalateAi}
              />
              <h4 className="comments-title">{t.comentarios}</h4>
              <div className="comments">
                {selectedComments.length === 0 ? (
                  <p className="status">{t.semComentarios}</p>
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
                  <span>{t.novoComentario}</span>
                  <textarea rows={3} value={commentBody} onChange={(event) => setCommentBody(event.target.value)} />
                </label>
                <button className="solid-btn" type="submit" disabled={!commentBody.trim()}>
                  {t.comentar}
                </button>
              </form>
            </section>
            <aside className="bancada-aside">
              <h4>{t.triagem}</h4>
              <p className="status">{t.triagemNota}</p>
              <label>
                <span>{t.colunas.status}</span>
                <select
                  value={selected.status}
                  onChange={(event) => updateStatus(event.target.value as Status)}
                >
                  <option value="aberto">{t.statusOpcao.aberto}</option>
                  <option value="em_andamento">{t.statusOpcao.em_andamento}</option>
                  <option value="resolvido">{t.statusOpcao.resolvido}</option>
                </select>
              </label>
              {isAgent(user) ? (
                <button className="ghost-btn" type="button" onClick={assignMe}>
                  {t.atribuirMim}
                </button>
              ) : null}
              <p className="status">{t.responsavel(selected.assignee || t.ninguem)}</p>
              <p className="status">{t.assistente(t.iaResumo[selected.aiOutcome])}</p>
              {actionError ? <p className="error">{actionError}</p> : null}
            </aside>
          </div>
        </div>
      ) : null}
    </article>
  )
}
