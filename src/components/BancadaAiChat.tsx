import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { AiOutcome, AiSuggestion } from '../bancadaAi'

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

const OUTCOME_LABEL: Record<AiOutcome, string> = {
  triagem: 'em triagem',
  resolvido_ia: 'resolvido pela IA',
  escalado: 'com agente',
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
      ? 'Chamado fechado pela assistente.'
      : outcome === 'escalado'
        ? 'Histórico ficou no chamado para o agente.'
        : status === 'resolvido'
          ? 'Chamado já resolvido.'
          : 'Primeiro atendimento automático, com procedimentos da TI.'

  return (
    <section className="ai-chat">
      <header className="ai-head">
        <div>
          <h4>Assistente</h4>
          <p className="status">{subtitle}</p>
        </div>
        <span className={`badge ${outcome}`}>{OUTCOME_LABEL[outcome]}</span>
      </header>
      <div className="ai-thread" ref={thread}>
        {messages.map((message) => (
          <article key={message.id} className={`ai-bubble ${message.role}`}>
            <strong>{message.role === 'assistant' ? 'Assistente Bancada' : 'Você'}</strong>
            <p>{message.body}</p>
          </article>
        ))}
      </div>
      {error ? <p className="error">{error}</p> : null}
      {canChat ? (
        <form className="ai-compose" onSubmit={submit}>
          <div className="ai-quick">
            <button className="chip" type="button" disabled={sending} onClick={() => void post('Não funcionou')}>
              Não funcionou
            </button>
            <button className="chip" type="button" disabled={sending} onClick={() => void post('Resolveu, obrigado')}>
              Resolveu
            </button>
          </div>
          <textarea
            rows={3}
            disabled={sending}
            placeholder="Descreva o que aconteceu depois dos passos…"
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
              {sending ? 'Enviando…' : 'Enviar'}
            </button>
            <button
              className={`ghost-btn ${suggested === 'resolved' ? 'glow' : ''}`}
              type="button"
              disabled={sending}
              onClick={onResolve}
            >
              Isso resolveu
            </button>
            <button
              className={`ghost-btn ${suggested === 'escalate' ? 'glow' : ''}`}
              type="button"
              disabled={sending}
              onClick={onEscalate}
            >
              Falar com um agente
            </button>
          </div>
        </form>
      ) : null}
    </section>
  )
}
