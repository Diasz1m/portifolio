import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { AiOutcome, AiSuggestion } from '../bancadaAi'
import { useCopy } from '../i18n'

export type AiChatMessage = {
  id: number
  role: 'user' | 'assistant'
  body: string
  suggestion: AiSuggestion | null
}

type Props = {
  outcome: AiOutcome
  status: 'aberto' | 'em_andamento' | 'resolvido'
  canChat: boolean
  messages: AiChatMessage[]
  error: string
  onSend: (text: string) => void
  onResolve: () => void
  onEscalate: () => void
}

/**
 * A assistente lê as mensagens em português, então os atalhos sempre enviam
 * este texto — só o rótulo do botão muda de idioma.
 */
const ATALHOS = {
  naoFuncionou: 'Não funcionou',
  resolveu: 'Resolveu, obrigado',
}

const copy = {
  pt: {
    titulo: 'Assistente',
    situacao: { triagem: 'em triagem', resolvido_ia: 'resolvido pela IA', escalado: 'com agente' },
    legendaFechado: 'Chamado fechado pela assistente.',
    legendaEscalado: 'Histórico ficou no chamado para o agente.',
    legendaResolvido: 'Chamado já resolvido.',
    legendaTriagem: 'Primeiro atendimento automático, com procedimentos da TI.',
    autorAssistente: 'Assistente Bancada',
    autorUsuario: 'Você',
    atalhoNaoFuncionou: 'Não funcionou',
    atalhoResolveu: 'Resolveu',
    placeholder: 'Descreva o que aconteceu depois dos passos…',
    enviando: 'Enviando…',
    enviar: 'Enviar',
    issoResolveu: 'Isso resolveu',
    falarComAgente: 'Falar com um agente',
  },
  en: {
    titulo: 'Assistant',
    situacao: { triagem: 'triaging', resolvido_ia: 'resolved by AI', escalado: 'with an agent' },
    legendaFechado: 'Ticket closed by the assistant.',
    legendaEscalado: 'The transcript stayed on the ticket for the agent.',
    legendaResolvido: 'Ticket already resolved.',
    legendaTriagem: 'Automated first response, backed by IT procedures.',
    autorAssistente: 'Bancada assistant',
    autorUsuario: 'You',
    atalhoNaoFuncionou: "Didn't work",
    atalhoResolveu: 'It worked',
    placeholder: 'Tell us what happened after those steps…',
    enviando: 'Sending…',
    enviar: 'Send',
    issoResolveu: 'This resolved it',
    falarComAgente: 'Talk to an agent',
  },
}

export default function BancadaAiChat({
  outcome,
  status,
  canChat,
  messages,
  error,
  onSend,
  onResolve,
  onEscalate,
}: Props) {
  const t = useCopy(copy)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const thread = useRef<HTMLDivElement>(null)
  const suggested = [...messages].reverse().find((item) => item.role === 'assistant')?.suggestion ?? null

  useEffect(() => {
    thread.current?.scrollTo({ top: thread.current.scrollHeight })
  }, [messages])

  async function post(text: string) {
    if (!text.trim() || sending) return
    setSending(true)
    await new Promise((resolve) => setTimeout(resolve, 280))
    onSend(text.trim())
    setDraft('')
    setSending(false)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    void post(draft)
  }

  const subtitle =
    outcome === 'resolvido_ia'
      ? t.legendaFechado
      : outcome === 'escalado'
        ? t.legendaEscalado
        : status === 'resolvido'
          ? t.legendaResolvido
          : t.legendaTriagem

  return (
    <section className="ai-chat">
      <header className="ai-head">
        <div>
          <h4>{t.titulo}</h4>
          <p className="status">{subtitle}</p>
        </div>
        <span className={`badge ${outcome}`}>{t.situacao[outcome]}</span>
      </header>
      <div className="ai-thread" ref={thread}>
        {messages.map((message) => (
          <article key={message.id} className={`ai-bubble ${message.role}`}>
            <strong>{message.role === 'assistant' ? t.autorAssistente : t.autorUsuario}</strong>
            <p>{message.body}</p>
          </article>
        ))}
      </div>
      {error ? <p className="error">{error}</p> : null}
      {canChat ? (
        <form className="ai-compose" onSubmit={submit}>
          <div className="ai-quick">
            <button
              className="chip"
              type="button"
              disabled={sending}
              onClick={() => void post(ATALHOS.naoFuncionou)}
            >
              {t.atalhoNaoFuncionou}
            </button>
            <button
              className="chip"
              type="button"
              disabled={sending}
              onClick={() => void post(ATALHOS.resolveu)}
            >
              {t.atalhoResolveu}
            </button>
          </div>
          <textarea
            rows={3}
            disabled={sending}
            placeholder={t.placeholder}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void post(draft)
              }
            }}
          />
          <div className="ai-actions">
            <button className="solid-btn" type="submit" disabled={sending || !draft.trim()}>
              {sending ? t.enviando : t.enviar}
            </button>
            <button
              className={`ghost-btn ${suggested === 'resolved' ? 'glow' : ''}`}
              type="button"
              disabled={sending}
              onClick={onResolve}
            >
              {t.issoResolveu}
            </button>
            <button
              className={`ghost-btn ${suggested === 'escalate' ? 'glow' : ''}`}
              type="button"
              disabled={sending}
              onClick={onEscalate}
            >
              {t.falarComAgente}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  )
}
