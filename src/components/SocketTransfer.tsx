import { useEffect, useRef, useState } from 'react'
import { useCopy } from '../i18n'

const PORT = 1515
const CHUNK = 4096
const DEST = 'teste/'

/**
 * As mensagens de log viram funções porque são montadas dentro dos handlers
 * assíncronos, que leem este bloco por clausura.
 */
const copy = {
  pt: {
    titulo: 'Transferência por sockets',
    apresentacaoAntes: 'Simulação do protocolo de',
    apresentacaoMeio: `: cliente e servidor Java, porta ${PORT}, buffer de ${CHUNK} bytes,`,
    apresentacaoFim:
      'e ACK por arquivo. O navegador não abre TCP cru — o fluxo é o mesmo do código, rodando aqui.',
    desconectado: 'desconectado',
    conectando: 'conectando',
    conectado: 'conectado',
    enviando: 'enviando',
    listening: 'listening',
    accept: 'accept',
    recebendo: 'recebendo',
    conectar: 'Conectar',
    desconectar: 'Desconectar',
    usarExemplos: 'Usar exemplos',
    escolherArquivos: 'Escolher arquivos',
    enviar: 'Enviar',
    filaVazia: 'Nenhum arquivo na fila.',
    nadaRecebido: 'Nenhum arquivo recebido ainda.',
    pastaDestino: `Pasta de destino: ${DEST}`,
    chunkAtual: (atual: number, total: number) => `chunk ${atual}/${total}`,
    aguardandoConexao: 'Aguardando conexão…',
    servidorEsperando: `Servidor esperando conexão na porta ${PORT}...`,
    clienteConectado: 'Cliente conectado!',
    conectadoAoServidor: 'Conectado ao servidor.',
    totalDeArquivos: (total: number) => `Número de arquivos a receber: ${total}`,
    arquivoEnviado: (nome: string) => `Arquivo enviado: ${nome}`,
    arquivoRecebido: (nome: string, bytes: number) =>
      `Arquivo recebido: ${nome} (${bytes} bytes)`,
    ackEnviado: (nome: string) => `out.writeUTF("Arquivo ${nome} recebido com sucesso!");`,
    ackRecebido: (nome: string) => `Servidor: Arquivo ${nome} recebido com sucesso!`,
  },
  en: {
    titulo: 'File transfer over sockets',
    apresentacaoAntes: 'Simulation of the protocol from',
    apresentacaoMeio: `: Java client and server, port ${PORT}, ${CHUNK}-byte buffer,`,
    apresentacaoFim:
      'and one ACK per file. Browsers cannot open raw TCP — the flow is the same as the original code, running right here.',
    desconectado: 'disconnected',
    conectando: 'connecting',
    conectado: 'connected',
    enviando: 'sending',
    listening: 'listening',
    accept: 'accept',
    recebendo: 'receiving',
    conectar: 'Connect',
    desconectar: 'Disconnect',
    usarExemplos: 'Use samples',
    escolherArquivos: 'Choose files',
    enviar: 'Send',
    filaVazia: 'No files in the queue.',
    nadaRecebido: 'No files received yet.',
    pastaDestino: `Destination folder: ${DEST}`,
    chunkAtual: (atual: number, total: number) => `chunk ${atual}/${total}`,
    aguardandoConexao: 'Waiting for a connection…',
    servidorEsperando: `Server waiting for a connection on port ${PORT}...`,
    clienteConectado: 'Client connected!',
    conectadoAoServidor: 'Connected to the server.',
    totalDeArquivos: (total: number) => `Files to receive: ${total}`,
    arquivoEnviado: (nome: string) => `File sent: ${nome}`,
    arquivoRecebido: (nome: string, bytes: number) => `File received: ${nome} (${bytes} bytes)`,
    ackEnviado: (nome: string) => `out.writeUTF("File ${nome} received successfully!");`,
    ackRecebido: (nome: string) => `Server: File ${nome} received successfully!`,
  },
}

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
  const t = useCopy(copy)
  const [phase, setPhase] = useState<Phase>('listening')
  const [files, setFiles] = useState<Payload[]>([])
  const [received, setReceived] = useState<Received[]>([])
  const [logs, setLogs] = useState<LogLine[]>([])
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
    setLogs([])
  }

  async function connect() {
    if (phase !== 'listening') return
    cancelled.current = false
    setPhase('connecting')
    log('client', `Socket socket = new Socket("localhost", ${PORT});`)
    await sleep(420)
    if (cancelled.current) return
    log('server', t.clienteConectado)
    log('client', t.conectadoAoServidor)
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
    log('server', t.totalDeArquivos(files.length))

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
      const copia = new Uint8Array(file.size)
      copia.set(file.bytes)
      const blob = new Blob([copia.buffer])
      const url = URL.createObjectURL(blob)
      urls.current.push(url)
      setReceived((current) => [...current, { name: file.name, size: file.size, url }])

      log('client', t.arquivoEnviado(file.name))
      log('server', t.arquivoRecebido(file.name, file.size))
      await sleep(160)
      if (cancelled.current) return
      log('server', t.ackEnviado(file.name))
      log('client', t.ackRecebido(file.name))
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
          <h3>{t.titulo}</h3>
          <p className="hint">
            {t.apresentacaoAntes}{' '}
            <a href="https://github.com/Diasz1m/proj_arquivos_sockets" target="_blank" rel="noreferrer">
              proj_arquivos_sockets
            </a>
            {t.apresentacaoMeio}{' '}
            <code>writeInt</code> + <code>writeUTF</code> + <code>writeLong</code>{' '}
            {t.apresentacaoFim}
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
              {phase === 'listening' ? t.desconectado : phase === 'connecting' ? t.conectando : phase === 'sending' ? t.enviando : t.conectado}
            </span>
          </header>
          <div className="socket-actions">
            {phase === 'listening' ? (
              <button className="solid-btn" type="button" onClick={() => void connect()}>
                {t.conectar}
              </button>
            ) : (
              <button className="ghost-btn" type="button" onClick={() => resetSession(true)}>
                {t.desconectar}
              </button>
            )}
            <button className="ghost-btn" type="button" disabled={busy} onClick={loadSamples}>
              {t.usarExemplos}
            </button>
            <label className="ghost-btn socket-file-btn">
              {t.escolherArquivos}
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
              {t.enviar}
            </button>
          </div>
          <ul className="socket-files">
            {files.length === 0 ? <li className="faint">{t.filaVazia}</li> : null}
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
                {clientProgress.name} · {t.chunkAtual(clientProgress.chunk, clientProgress.chunks)}
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
              .join('\n') || t.aguardandoConexao}
          </pre>
        </section>

        <section className="socket-pane">
          <header>
            <strong>ServidorArquivo</strong>
            <span className={`socket-pill ${phase === 'listening' ? 'listening' : phase}`}>
              {phase === 'listening' ? t.listening : phase === 'connecting' ? t.accept : phase === 'sending' ? t.recebendo : t.conectado}
            </span>
          </header>
          <p className="socket-dest">{t.pastaDestino}</p>
          <ul className="socket-files">
            {received.length === 0 ? <li className="faint">{t.nadaRecebido}</li> : null}
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
              .join('\n') || t.servidorEsperando}
          </pre>
        </section>
      </div>
    </article>
  )
}
