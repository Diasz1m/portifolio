import { useEffect, useRef, useState } from 'react'

const PORT = 1515
const CHUNK = 4096
const DEST = 'teste/'

type Phase = 'listening' | 'connecting' | 'connected' | 'sending'
type Side = 'client' | 'server'
type LogLine = { id: number; side: Side; text: string }
type Payload = { name: string; size: number; bytes: Uint8Array }
type Received = { name: string; size: number; url: string }

const samples: Array<{ name: string; size: number }> = [
  { name: 'image.webp', size: 8704 },
  { name: 'image2.jpg', size: 16384 },
  { name: 'image3.jpeg', size: 4196 },
]

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} bytes`
  return `${(size / 1024).toFixed(1)} KB`
}

function makeSample(name: string, size: number): Payload {
  const bytes = new Uint8Array(size)
  crypto.getRandomValues(bytes)
  return { name, size, bytes }
}

export default function SocketTransfer() {
  const [phase, setPhase] = useState<Phase>('listening')
  const [files, setFiles] = useState<Payload[]>([])
  const [received, setReceived] = useState<Received[]>([])
  const [logs, setLogs] = useState<LogLine[]>([
    { id: 1, side: 'server', text: `Servidor esperando conexão na porta ${PORT}...` },
  ])
  const [clientProgress, setClientProgress] = useState({ name: '', sent: 0, total: 0, chunk: 0, chunks: 0 })
  const [serverProgress, setServerProgress] = useState({ name: '', received: 0, total: 0 })
  const logId = useRef(1)
  const clientLog = useRef<HTMLPreElement>(null)
  const serverLog = useRef<HTMLPreElement>(null)
  const cancelled = useRef(false)
  const urls = useRef<string[]>([])

  useEffect(() => {
    return () => {
      cancelled.current = true
      urls.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  useEffect(() => {
    clientLog.current?.scrollTo({ top: clientLog.current.scrollHeight })
    serverLog.current?.scrollTo({ top: serverLog.current.scrollHeight })
  }, [logs])

  function log(side: Side, text: string) {
    logId.current += 1
    setLogs((current) => [...current, { id: logId.current, side, text }])
  }

  function resetSession(keepFiles: boolean) {
    cancelled.current = true
    urls.current.forEach((url) => URL.revokeObjectURL(url))
    urls.current = []
    setReceived([])
    setClientProgress({ name: '', sent: 0, total: 0, chunk: 0, chunks: 0 })
    setServerProgress({ name: '', received: 0, total: 0 })
    if (!keepFiles) setFiles([])
    setPhase('listening')
    logId.current += 1
    setLogs([{ id: logId.current, side: 'server', text: `Servidor esperando conexão na porta ${PORT}...` }])
  }

  async function connect() {
    if (phase !== 'listening') return
    cancelled.current = false
    setPhase('connecting')
    log('client', `Socket socket = new Socket("localhost", ${PORT});`)
    await sleep(420)
    if (cancelled.current) return
    log('server', 'Cliente conectado!')
    log('client', 'Conectado ao servidor.')
    setPhase('connected')
  }

  function loadSamples() {
    setFiles(samples.map((file) => makeSample(file.name, file.size)))
  }

  async function pickFiles(list: FileList | null) {
    if (!list?.length) return
    const next: Payload[] = []
    for (const file of Array.from(list)) {
      const buffer = await file.arrayBuffer()
      next.push({ name: file.name, size: file.size, bytes: new Uint8Array(buffer) })
    }
    setFiles(next)
  }

  async function send() {
    if (phase !== 'connected' || !files.length) return
    cancelled.current = false
    setPhase('sending')
    log('client', `out.writeInt(${files.length});`)
    await sleep(180)
    if (cancelled.current) return
    log('server', `Número de arquivos a receber: ${files.length}`)

    for (const file of files) {
      if (cancelled.current) return
      const chunks = Math.max(1, Math.ceil(file.size / CHUNK))
      const skip = chunks > 28 ? Math.ceil(chunks / 24) : 1
      const delay = Math.max(10, Math.min(36, 1400 / Math.min(chunks, 24)))

      log('client', `out.writeUTF("${file.name}");`)
      log('client', `out.writeLong(${file.size}L);`)
      setClientProgress({ name: file.name, sent: 0, total: file.size, chunk: 0, chunks })
      setServerProgress({ name: file.name, received: 0, total: file.size })

      let sent = 0
      let chunkIndex = 0
      while (sent < file.size) {
        if (cancelled.current) return
        const step = Math.min(CHUNK, file.size - sent)
        sent += step
        chunkIndex += 1
        setClientProgress({ name: file.name, sent, total: file.size, chunk: chunkIndex, chunks })
        setServerProgress({ name: file.name, received: sent, total: file.size })
        if (chunkIndex === 1 || chunkIndex === chunks || chunkIndex % skip === 0) {
          await sleep(delay)
        }
      }

      if (cancelled.current) return
      const copy = new Uint8Array(file.size)
      copy.set(file.bytes)
      const blob = new Blob([copy.buffer])
      const url = URL.createObjectURL(blob)
      urls.current.push(url)
      setReceived((current) => [...current, { name: file.name, size: file.size, url }])

      log('client', `Arquivo enviado: ${file.name}`)
      log('server', `Arquivo recebido: ${file.name} (${file.size} bytes)`)
      await sleep(160)
      if (cancelled.current) return
      log('server', `out.writeUTF("Arquivo ${file.name} recebido com sucesso!");`)
      log('client', `Servidor: Arquivo ${file.name} recebido com sucesso!`)
    }

    if (cancelled.current) return
    log('client', 'socket.shutdownOutput();')
    setPhase('connected')
  }

  const busy = phase === 'connecting' || phase === 'sending'
  const clientPct = clientProgress.total
    ? Math.round((clientProgress.sent / clientProgress.total) * 100)
    : 0
  const serverPct = serverProgress.total
    ? Math.round((serverProgress.received / serverProgress.total) * 100)
    : 0

  return (
    <article className="panel socket-demo" id="demo-sockets">
      <div className="bancada-head">
        <div>
          <h3>Transferência por sockets</h3>
          <p className="hint">
            Simulação do protocolo de{' '}
            <a href="https://github.com/Diasz1m/proj_arquivos_sockets" target="_blank" rel="noreferrer">
              proj_arquivos_sockets
            </a>
            : cliente e servidor Java, porta {PORT}, buffer de {CHUNK} bytes,{' '}
            <code>writeInt</code> + <code>writeUTF</code> + <code>writeLong</code> e ACK por arquivo.
            O navegador não abre TCP cru — o fluxo é o mesmo do código, rodando aqui.
          </p>
        </div>
        <div className="socket-meta">
          <span className="chip">localhost:{PORT}</span>
          <span className="chip">buffer {CHUNK}</span>
          <span className="chip">{DEST}</span>
        </div>
      </div>

      <div className="socket-split">
        <section className="socket-pane">
          <header>
            <strong>ClienteArquivo</strong>
            <span className={`socket-pill ${phase}`}>
              {phase === 'listening' ? 'desconectado' : phase === 'connecting' ? 'conectando' : phase === 'sending' ? 'enviando' : 'conectado'}
            </span>
          </header>
          <div className="socket-actions">
            {phase === 'listening' ? (
              <button className="solid-btn" type="button" onClick={() => void connect()}>
                Conectar
              </button>
            ) : (
              <button className="ghost-btn" type="button" onClick={() => resetSession(true)}>
                Desconectar
              </button>
            )}
            <button className="ghost-btn" type="button" disabled={busy} onClick={loadSamples}>
              Usar exemplos
            </button>
            <label className="ghost-btn socket-file-btn">
              Escolher arquivos
              <input
                type="file"
                multiple
                disabled={busy}
                onChange={(event) => {
                  void pickFiles(event.target.files)
                  event.currentTarget.value = ''
                }}
              />
            </label>
            <button className="solid-btn" type="button" disabled={phase !== 'connected' || !files.length} onClick={() => void send()}>
              Enviar
            </button>
          </div>
          <ul className="socket-files">
            {files.length === 0 ? <li className="faint">Nenhum arquivo na fila.</li> : null}
            {files.map((file) => (
              <li key={file.name + file.size}>
                <span>{file.name}</span>
                <small>{formatBytes(file.size)}</small>
              </li>
            ))}
          </ul>
          {phase === 'sending' && clientProgress.total ? (
            <div className="socket-progress">
              <span>
                {clientProgress.name} · chunk {clientProgress.chunk}/{clientProgress.chunks}
              </span>
              <div className="socket-bar">
                <i style={{ width: `${clientPct}%` }} />
              </div>
            </div>
          ) : null}
          <pre className="socket-log" ref={clientLog}>
            {logs
              .filter((line) => line.side === 'client')
              .map((line) => line.text)
              .join('\n') || 'Aguardando conexão…'}
          </pre>
        </section>

        <section className="socket-pane">
          <header>
            <strong>ServidorArquivo</strong>
            <span className={`socket-pill ${phase === 'listening' ? 'listening' : phase}`}>
              {phase === 'listening' ? 'listening' : phase === 'connecting' ? 'accept' : phase === 'sending' ? 'recebendo' : 'conectado'}
            </span>
          </header>
          <p className="socket-dest">Pasta de destino: {DEST}</p>
          <ul className="socket-files">
            {received.length === 0 ? <li className="faint">Nenhum arquivo recebido ainda.</li> : null}
            {received.map((file) => (
              <li key={file.url}>
                <a href={file.url} download={file.name}>
                  {DEST}
                  {file.name}
                </a>
                <small>{formatBytes(file.size)}</small>
              </li>
            ))}
          </ul>
          {phase === 'sending' && serverProgress.total ? (
            <div className="socket-progress">
              <span>
                {serverProgress.name} · {serverPct}%
              </span>
              <div className="socket-bar">
                <i style={{ width: `${serverPct}%` }} />
              </div>
            </div>
          ) : null}
          <pre className="socket-log" ref={serverLog}>
            {logs
              .filter((line) => line.side === 'server')
              .map((line) => line.text)
              .join('\n')}
          </pre>
        </section>
      </div>
    </article>
  )
}
