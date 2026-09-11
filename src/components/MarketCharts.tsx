import { useEffect, useMemo, useRef, useState } from 'react'
import {
  extensao,
  formatarGrande,
  formatarIndicador,
  formatarNumero,
  histograma,
  INDICADORES,
  mediana,
  PALETA,
  ROTULOS,
  semExtremos,
  ticks,
  valores,
  type Acao,
  type Historico,
  type Indicador,
} from '../marketData'

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function rotuloData(iso: string) {
  const [ano, mes] = iso.split('-')
  return `${MESES[Number(mes) - 1]}/${ano.slice(2)}`
}

function rotuloTick(valor: number, indicador: Indicador) {
  if (indicador === 'liq_2meses' || indicador === 'patrim_liq') return formatarGrande(valor)
  const abs = Math.abs(valor)
  const casas = abs >= 100 ? 0 : abs >= 10 ? 1 : 2
  return formatarNumero(valor, casas)
}

/**
 * O viewBox acompanha a largura real do container, então uma unidade do SVG é
 * um pixel e os rótulos não encolhem quando o cartão é estreito.
 */
function useLargura(minimo = 300) {
  const ref = useRef<HTMLDivElement>(null)
  const [largura, setLargura] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new ResizeObserver((entradas) => {
      setLargura(Math.round(entradas[0].contentRect.width))
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return { ref, largura: Math.max(largura, minimo) }
}

type Ponto = { x: number; y: number; px: number; py: number }

function posicao(event: React.MouseEvent<SVGSVGElement>, largura: number, altura: number): Ponto {
  const rect = event.currentTarget.getBoundingClientRect()
  const px = event.clientX - rect.left
  const py = event.clientY - rect.top
  return { x: (px / rect.width) * largura, y: (py / rect.height) * altura, px, py }
}

function SeletorIndicador({
  rotulo,
  valor,
  onChange,
}: {
  rotulo: string
  valor: Indicador
  onChange: (valor: Indicador) => void
}) {
  return (
    <label>
      <span>{rotulo}</span>
      <select value={valor} onChange={(event) => onChange(event.target.value as Indicador)}>
        {INDICADORES.map((ind) => (
          <option key={ind} value={ind}>
            {ROTULOS[ind]}
          </option>
        ))}
      </select>
    </label>
  )
}

/* ------------------------------- dispersão ------------------------------- */

export function MarketScatter({ acoes }: { acoes: Acao[] }) {
  const [eixoX, setEixoX] = useState<Indicador>('pvp')
  const [eixoY, setEixoY] = useState<Indicador>('roe')
  const [recortar, setRecortar] = useState(true)
  const [alvo, setAlvo] = useState<{ acao: Acao; px: number; py: number } | null>(null)
  const { ref, largura } = useLargura()

  const altura = Math.round(Math.min(Math.max(largura * 0.52, 280), 420))
  const margem = { left: 62, right: 18, top: 16, bottom: 46 }

  const dados = useMemo(() => {
    const base = recortar ? semExtremos(acoes, [eixoX, eixoY]) : acoes
    return base.filter((a) => a[eixoX] !== null && a[eixoY] !== null)
  }, [acoes, eixoX, eixoY, recortar])

  const removidos = acoes.length - dados.length

  const cena = useMemo(() => {
    if (!dados.length) return null
    const xs = dados.map((a) => a[eixoX] as number)
    const ys = dados.map((a) => a[eixoY] as number)
    const [x0, x1] = extensao(xs)
    const [y0, y1] = extensao(ys)
    const maxLiquidez = Math.max(...dados.map((a) => a.liq_2meses ?? 0), 1)
    const maxRaio = largura > 560 ? 17 : 11

    const sx = (v: number) => margem.left + ((v - x0) / (x1 - x0)) * (largura - margem.left - margem.right)
    const sy = (v: number) => altura - margem.bottom - ((v - y0) / (y1 - y0)) * (altura - margem.top - margem.bottom)

    const bolhas = [...dados]
      .sort((a, b) => (b.liq_2meses ?? 0) - (a.liq_2meses ?? 0))
      .map((acao) => ({
        acao,
        cx: sx(acao[eixoX] as number),
        cy: sy(acao[eixoY] as number),
        r: 3.5 + ((acao.liq_2meses ?? 0) / maxLiquidez) * maxRaio,
      }))

    return {
      bolhas,
      sx,
      sy,
      ticksX: ticks(x0, x1, largura > 560 ? 6 : 4),
      ticksY: ticks(y0, y1, 5),
      medianaX: mediana(xs),
      medianaY: mediana(ys),
    }
  }, [altura, dados, eixoX, eixoY, largura, margem.bottom, margem.left, margem.right, margem.top])

  function mover(event: React.MouseEvent<SVGSVGElement>) {
    if (!cena) return
    const { x, y, px, py } = posicao(event, largura, altura)
    let melhor: { acao: Acao; dist: number } | null = null
    for (const bolha of cena.bolhas) {
      const dist = Math.hypot(bolha.cx - x, bolha.cy - y)
      if (dist <= Math.max(bolha.r, 9) && (!melhor || dist < melhor.dist)) {
        melhor = { acao: bolha.acao, dist }
      }
    }
    setAlvo(melhor ? { acao: melhor.acao, px, py } : null)
  }

  return (
    <section className="mk-card">
      <header className="mk-card-head">
        <div>
          <h4>Preço x rentabilidade</h4>
          <p className="mk-legend">
            As medianas dividem o plano em quadrantes. O tamanho da bolha é a liquidez.
          </p>
        </div>
        <div className="mk-controls">
          <SeletorIndicador rotulo="Eixo X" valor={eixoX} onChange={setEixoX} />
          <SeletorIndicador rotulo="Eixo Y" valor={eixoY} onChange={setEixoY} />
          <label className="mk-check">
            <input
              type="checkbox"
              checked={recortar}
              onChange={(event) => setRecortar(event.target.checked)}
            />
            Cortar extremos
          </label>
        </div>
      </header>

      <div className="mk-plot" ref={ref}>
        {cena ? (
          <>
            <svg
              viewBox={`0 0 ${largura} ${altura}`}
              className="mk-svg"
              role="img"
              aria-label={`Dispersão de ${ROTULOS[eixoX]} contra ${ROTULOS[eixoY]}`}
              onMouseMove={mover}
              onMouseLeave={() => setAlvo(null)}
            >
              {cena.ticksY.map((t) => (
                <g key={`y${t}`}>
                  <line
                    className="mk-grid"
                    x1={margem.left}
                    x2={largura - margem.right}
                    y1={cena.sy(t)}
                    y2={cena.sy(t)}
                  />
                  <text className="mk-tick" x={margem.left - 8} y={cena.sy(t) + 4} textAnchor="end">
                    {rotuloTick(t, eixoY)}
                  </text>
                </g>
              ))}
              {cena.ticksX.map((t) => (
                <g key={`x${t}`}>
                  <line
                    className="mk-grid"
                    y1={margem.top}
                    y2={altura - margem.bottom}
                    x1={cena.sx(t)}
                    x2={cena.sx(t)}
                  />
                  <text
                    className="mk-tick"
                    x={cena.sx(t)}
                    y={altura - margem.bottom + 18}
                    textAnchor="middle"
                  >
                    {rotuloTick(t, eixoX)}
                  </text>
                </g>
              ))}

              <line
                className="mk-median"
                x1={cena.sx(cena.medianaX)}
                x2={cena.sx(cena.medianaX)}
                y1={margem.top}
                y2={altura - margem.bottom}
              />
              <line
                className="mk-median"
                y1={cena.sy(cena.medianaY)}
                y2={cena.sy(cena.medianaY)}
                x1={margem.left}
                x2={largura - margem.right}
              />

              {cena.bolhas.map((bolha) => (
                <circle
                  key={bolha.acao.papel}
                  className={`mk-bubble${alvo?.acao.papel === bolha.acao.papel ? ' on' : ''}`}
                  cx={bolha.cx}
                  cy={bolha.cy}
                  r={bolha.r}
                />
              ))}

              <text
                className="mk-axis"
                x={(margem.left + largura - margem.right) / 2}
                y={altura - 6}
                textAnchor="middle"
              >
                {ROTULOS[eixoX]}
              </text>
              <text
                className="mk-axis"
                transform={`translate(13 ${(margem.top + altura - margem.bottom) / 2}) rotate(-90)`}
                textAnchor="middle"
              >
                {ROTULOS[eixoY]}
              </text>
            </svg>

            {alvo ? (
              <div
                className="mk-tip"
                style={{ left: Math.min(alvo.px + 14, largura - 150), top: alvo.py + 12 }}
              >
                <strong>{alvo.acao.papel}</strong>
                <span>
                  {ROTULOS[eixoX]}: {formatarIndicador(alvo.acao[eixoX], eixoX)}
                </span>
                <span>
                  {ROTULOS[eixoY]}: {formatarIndicador(alvo.acao[eixoY], eixoY)}
                </span>
                <span>Liquidez: R$ {formatarGrande(alvo.acao.liq_2meses)}</span>
              </div>
            ) : null}
          </>
        ) : (
          <p className="mk-empty">Nenhum papel com esses dois indicadores preenchidos.</p>
        )}
      </div>

      {recortar && removidos > 0 ? (
        <footer className="mk-note">
          {dados.length} papéis no gráfico, {removidos} extremos omitidos para não achatar a escala.
        </footer>
      ) : null}
    </section>
  )
}

/* -------------------------------- ranking -------------------------------- */

export function MarketRanking({ acoes }: { acoes: Acao[] }) {
  const [indicador, setIndicador] = useState<Indicador>('div_yield')
  const [ordem, setOrdem] = useState<'maiores' | 'menores'>('maiores')
  const [quantidade, setQuantidade] = useState(15)
  const { ref, largura } = useLargura()

  const dados = useMemo(
    () =>
      semExtremos(acoes, [indicador], 0.02, 0.98)
        .filter((a) => a[indicador] !== null)
        .sort((a, b) => {
          const x = a[indicador] as number
          const y = b[indicador] as number
          return ordem === 'maiores' ? y - x : x - y
        })
        .slice(0, quantidade),
    [acoes, indicador, ordem, quantidade],
  )

  const left = 58
  const right = 62
  const linha = 22
  const altura = dados.length * linha + 10

  const limite = Math.max(...dados.map((a) => Math.abs(a[indicador] as number)), 1)
  const comprimento = (valor: number) => (Math.abs(valor) / limite) * (largura - left - right)

  return (
    <section className="mk-card">
      <header className="mk-card-head">
        <div>
          <h4>Ranking</h4>
          <p className="mk-legend">Os papéis nos extremos do indicador escolhido.</p>
        </div>
        <div className="mk-controls">
          <SeletorIndicador rotulo="Indicador" valor={indicador} onChange={setIndicador} />
          <label>
            <span>Ordem</span>
            <select
              value={ordem}
              onChange={(event) => setOrdem(event.target.value as 'maiores' | 'menores')}
            >
              <option value="maiores">Maiores</option>
              <option value="menores">Menores</option>
            </select>
          </label>
          <label>
            <span>Mostrar</span>
            <select value={quantidade} onChange={(event) => setQuantidade(Number(event.target.value))}>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
            </select>
          </label>
        </div>
      </header>

      <div className="mk-plot" ref={ref}>
        {dados.length ? (
          <svg
            viewBox={`0 0 ${largura} ${altura}`}
            className="mk-svg"
            role="img"
            aria-label={`Ranking por ${ROTULOS[indicador]}`}
          >
            {dados.map((acao, i) => {
              const valor = acao[indicador] as number
              const y = i * linha + 5
              const barra = Math.max(comprimento(valor), 1)
              return (
                <g key={acao.papel}>
                  <text className="mk-tick" x={left - 8} y={y + 11} textAnchor="end">
                    {acao.papel}
                  </text>
                  <rect className="mk-bar" x={left} y={y + 1} width={barra} height={12} rx={3} />
                  <text className="mk-value" x={left + barra + 6} y={y + 11}>
                    {formatarIndicador(valor, indicador)}
                  </text>
                </g>
              )
            })}
          </svg>
        ) : (
          <p className="mk-empty">Nenhum papel com esse indicador preenchido.</p>
        )}
      </div>
    </section>
  )
}

/* ------------------------------ distribuição ----------------------------- */

export function MarketHistogram({ acoes, destaque }: { acoes: Acao[]; destaque?: string }) {
  const [indicador, setIndicador] = useState<Indicador>('pl')
  const [alvo, setAlvo] = useState<{
    centro: number
    contagem: number
    px: number
    py: number
  } | null>(null)
  const { ref, largura } = useLargura()

  const altura = 290
  const margem = { left: 46, right: 14, top: 16, bottom: 44 }

  const serie = useMemo(() => valores(semExtremos(acoes, [indicador]), indicador), [acoes, indicador])
  const central = useMemo(() => mediana(serie), [serie])
  const barras = useMemo(() => histograma(serie, largura > 460 ? 26 : 18), [largura, serie])

  const valorDestaque = useMemo(() => {
    if (!destaque) return null
    return acoes.find((a) => a.papel === destaque)?.[indicador] ?? null
  }, [acoes, destaque, indicador])

  const cena = useMemo(() => {
    if (!barras.length) return null
    const passo =
      barras.length > 1 ? barras[1].centro - barras[0].centro : Math.abs(barras[0].centro) || 1
    const x0 = barras[0].centro - passo / 2
    const x1 = barras[barras.length - 1].centro + passo / 2
    const maxContagem = Math.max(...barras.map((b) => b.contagem))
    const util = largura - margem.left - margem.right

    const sx = (v: number) => margem.left + ((v - x0) / (x1 - x0)) * util
    const sy = (v: number) =>
      altura - margem.bottom - (v / maxContagem) * (altura - margem.top - margem.bottom)

    return {
      sx,
      sy,
      larguraBarra: Math.max((util / barras.length) * 0.92, 1),
      ticksX: ticks(x0, x1, largura > 460 ? 5 : 4),
      ticksY: ticks(0, maxContagem, 4),
      x0,
      x1,
    }
  }, [barras, largura, margem.bottom, margem.left, margem.right, margem.top])

  function mover(event: React.MouseEvent<SVGSVGElement>) {
    if (!cena) return
    const { x, px, py } = posicao(event, largura, altura)
    let melhor: { barra: (typeof barras)[number]; dist: number } | null = null
    for (const barra of barras) {
      const dist = Math.abs(cena.sx(barra.centro) - x)
      if (dist <= cena.larguraBarra && (!melhor || dist < melhor.dist)) melhor = { barra, dist }
    }
    setAlvo(melhor ? { ...melhor.barra, px, py } : null)
  }

  return (
    <section className="mk-card">
      <header className="mk-card-head">
        <div>
          <h4>Distribuição</h4>
          <p className="mk-legend">Onde um papel se posiciona em relação ao restante do mercado.</p>
        </div>
        <div className="mk-controls">
          <SeletorIndicador rotulo="Indicador" valor={indicador} onChange={setIndicador} />
        </div>
      </header>

      <div className="mk-plot" ref={ref}>
        {cena ? (
          <>
            <svg
              viewBox={`0 0 ${largura} ${altura}`}
              className="mk-svg"
              role="img"
              aria-label={`Distribuição de ${ROTULOS[indicador]}`}
              onMouseMove={mover}
              onMouseLeave={() => setAlvo(null)}
            >
              {cena.ticksY.map((t) => (
                <g key={`y${t}`}>
                  <line
                    className="mk-grid"
                    x1={margem.left}
                    x2={largura - margem.right}
                    y1={cena.sy(t)}
                    y2={cena.sy(t)}
                  />
                  <text className="mk-tick" x={margem.left - 8} y={cena.sy(t) + 4} textAnchor="end">
                    {t}
                  </text>
                </g>
              ))}
              {cena.ticksX.map((t) => (
                <text
                  key={`x${t}`}
                  className="mk-tick"
                  x={cena.sx(t)}
                  y={altura - margem.bottom + 18}
                  textAnchor="middle"
                >
                  {rotuloTick(t, indicador)}
                </text>
              ))}

              {barras.map((barra) => (
                <rect
                  key={barra.centro}
                  className={`mk-bar soft${alvo?.centro === barra.centro ? ' on' : ''}`}
                  x={cena.sx(barra.centro) - cena.larguraBarra / 2}
                  y={cena.sy(barra.contagem)}
                  width={cena.larguraBarra}
                  height={altura - margem.bottom - cena.sy(barra.contagem)}
                />
              ))}

              <line
                className="mk-median"
                x1={cena.sx(central)}
                x2={cena.sx(central)}
                y1={margem.top}
                y2={altura - margem.bottom}
              />
              <text className="mk-median-label" x={cena.sx(central) + 5} y={margem.top + 9}>
                mediana {formatarNumero(central)}
              </text>

              {valorDestaque !== null && valorDestaque >= cena.x0 && valorDestaque <= cena.x1 ? (
                <>
                  <line
                    className="mk-highlight"
                    x1={cena.sx(valorDestaque)}
                    x2={cena.sx(valorDestaque)}
                    y1={margem.top}
                    y2={altura - margem.bottom}
                  />
                  <text
                    className="mk-highlight-label"
                    x={cena.sx(valorDestaque) + 5}
                    y={margem.top + 24}
                  >
                    {destaque}
                  </text>
                </>
              ) : null}

              <text
                className="mk-axis"
                x={(margem.left + largura - margem.right) / 2}
                y={altura - 6}
                textAnchor="middle"
              >
                {ROTULOS[indicador]}
              </text>
              <text
                className="mk-axis"
                transform={`translate(13 ${(margem.top + altura - margem.bottom) / 2}) rotate(-90)`}
                textAnchor="middle"
              >
                nº de papéis
              </text>
            </svg>

            {alvo ? (
              <div
                className="mk-tip"
                style={{ left: Math.min(alvo.px + 14, largura - 110), top: alvo.py + 12 }}
              >
                <strong>{formatarNumero(alvo.centro)}</strong>
                <span>{alvo.contagem} papéis</span>
              </div>
            ) : null}
          </>
        ) : (
          <p className="mk-empty">Sem dados para esse indicador.</p>
        )}
      </div>
    </section>
  )
}

/* --------------------------------- preços -------------------------------- */

export function MarketPrices({ historico, acoes }: { historico: Historico | null; acoes: Acao[] }) {
  const [modo, setModo] = useState<'base100' | 'preco'>('base100')
  const [ocultos, setOcultos] = useState<Set<string>>(new Set())
  const [faixa, setFaixa] = useState<[number, number] | null>(null)
  const [arraste, setArraste] = useState<[number, number] | null>(null)
  const [cursor, setCursor] = useState<{ indice: number; px: number } | null>(null)
  const arrastando = useRef(false)
  const { ref, largura } = useLargura()

  const altura = Math.round(Math.min(Math.max(largura * 0.42, 260), 360))
  const margem = { left: 54, right: 16, top: 14, bottom: 40 }

  const disponiveis = useMemo(() => {
    if (!historico) return []
    const visiveis = new Set(acoes.map((a) => a.ticker))
    return Object.keys(historico.series).filter((t) => visiveis.has(t))
  }, [acoes, historico])

  const ativos = disponiveis.filter((t) => !ocultos.has(t))

  const cena = useMemo(() => {
    if (!historico || !ativos.length) return null
    const total = historico.datas.length
    const [i0, i1] = faixa ?? [0, total - 1]
    const lista = ativos.flatMap((t) => historico.series[t][modo].slice(i0, i1 + 1))
    if (!lista.length) return null
    const [y0, y1] = extensao(lista, 0.08)

    const sx = (i: number) =>
      margem.left + ((i - i0) / Math.max(i1 - i0, 1)) * (largura - margem.left - margem.right)
    const sy = (v: number) =>
      altura - margem.bottom - ((v - y0) / (y1 - y0)) * (altura - margem.top - margem.bottom)

    const linhas = ativos.map((ticker) => {
      const d = historico.series[ticker][modo]
        .slice(i0, i1 + 1)
        .map((v, k) => `${k === 0 ? 'M' : 'L'}${sx(i0 + k).toFixed(1)} ${sy(v).toFixed(1)}`)
        .join(' ')
      return { ticker, d, cor: PALETA[disponiveis.indexOf(ticker) % PALETA.length] }
    })

    const alvoMarcas = largura > 560 ? 6 : 4
    const passo = Math.max(1, Math.ceil((i1 - i0) / alvoMarcas))
    const marcasX: number[] = []
    for (let i = i0; i <= i1; i += passo) marcasX.push(i)

    return { sx, sy, linhas, i0, i1, ticksY: ticks(y0, y1, 5), marcasX }
  }, [altura, ativos, disponiveis, faixa, historico, largura, margem.bottom, margem.left, margem.right, margem.top])

  const variacoes = useMemo(
    () =>
      disponiveis
        .map((ticker) => {
          const serie = historico!.series[ticker].base100
          return { ticker, curto: ticker.replace('.SA', ''), variacao: serie[serie.length - 1] - 100 }
        })
        .sort((a, b) => b.variacao - a.variacao),
    [disponiveis, historico],
  )

  function indiceEm(x: number) {
    if (!cena) return 0
    const proporcao = (x - margem.left) / (largura - margem.left - margem.right)
    const bruto = cena.i0 + proporcao * (cena.i1 - cena.i0)
    return Math.min(cena.i1, Math.max(cena.i0, Math.round(bruto)))
  }

  function alternar(ticker: string) {
    setOcultos((atual) => {
      const proximo = new Set(atual)
      if (proximo.has(ticker)) proximo.delete(ticker)
      else proximo.add(ticker)
      return proximo
    })
  }

  return (
    <section className="mk-card">
      <header className="mk-card-head">
        <div>
          <h4>Evolução dos preços</h4>
          <p className="mk-legend">
            Base 100 permite comparar papéis de preços muito diferentes na mesma escala. Arraste no
            gráfico para dar zoom.
          </p>
        </div>
        <div className="mk-controls">
          <label>
            <span>Escala</span>
            <select
              value={modo}
              onChange={(event) => setModo(event.target.value as 'base100' | 'preco')}
            >
              <option value="base100">Base 100</option>
              <option value="preco">Preço em R$</option>
            </select>
          </label>
          {faixa ? (
            <button type="button" className="mk-link" onClick={() => setFaixa(null)}>
              ver 12 meses
            </button>
          ) : null}
        </div>
      </header>

      {disponiveis.length ? (
        <>
          <div className="mk-series-legend">
            {disponiveis.map((ticker, i) => (
              <button
                key={ticker}
                type="button"
                className={`mk-series-chip${ocultos.has(ticker) ? ' off' : ''}`}
                onClick={() => alternar(ticker)}
              >
                <i style={{ background: PALETA[i % PALETA.length] }} />
                {ticker.replace('.SA', '')}
              </button>
            ))}
          </div>

          <div className="mk-plot" ref={ref}>
            {cena ? (
              <>
                <svg
                  viewBox={`0 0 ${largura} ${altura}`}
                  className="mk-svg mk-zoomable"
                  role="img"
                  aria-label="Evolução dos preços"
                  onMouseDown={(event) => {
                    const { x } = posicao(event, largura, altura)
                    arrastando.current = true
                    setArraste([x, x])
                  }}
                  onMouseMove={(event) => {
                    const { x, px } = posicao(event, largura, altura)
                    if (arrastando.current) setArraste((atual) => (atual ? [atual[0], x] : null))
                    setCursor({ indice: indiceEm(x), px })
                  }}
                  onMouseUp={() => {
                    arrastando.current = false
                    if (arraste) {
                      const [a, b] = arraste
                      if (Math.abs(b - a) > 12) {
                        const inicio = indiceEm(Math.min(a, b))
                        const fim = indiceEm(Math.max(a, b))
                        if (fim - inicio >= 4) setFaixa([inicio, fim])
                      }
                    }
                    setArraste(null)
                  }}
                  onMouseLeave={() => {
                    arrastando.current = false
                    setArraste(null)
                    setCursor(null)
                  }}
                >
                  {cena.ticksY.map((t) => (
                    <g key={`y${t}`}>
                      <line
                        className="mk-grid"
                        x1={margem.left}
                        x2={largura - margem.right}
                        y1={cena.sy(t)}
                        y2={cena.sy(t)}
                      />
                      <text className="mk-tick" x={margem.left - 8} y={cena.sy(t) + 4} textAnchor="end">
                        {formatarNumero(t, modo === 'preco' ? 2 : 0)}
                      </text>
                    </g>
                  ))}
                  {cena.marcasX.map((i) => (
                    <text
                      key={`x${i}`}
                      className="mk-tick"
                      x={cena.sx(i)}
                      y={altura - margem.bottom + 18}
                      textAnchor="middle"
                    >
                      {rotuloData(historico!.datas[i])}
                    </text>
                  ))}

                  {cursor ? (
                    <line
                      className="mk-crosshair"
                      x1={cena.sx(cursor.indice)}
                      x2={cena.sx(cursor.indice)}
                      y1={margem.top}
                      y2={altura - margem.bottom}
                    />
                  ) : null}

                  {cena.linhas.map((linha) => (
                    <path key={linha.ticker} className="mk-line" d={linha.d} stroke={linha.cor} />
                  ))}

                  {arraste && Math.abs(arraste[1] - arraste[0]) > 2 ? (
                    <rect
                      className="mk-brush"
                      x={Math.min(arraste[0], arraste[1])}
                      y={margem.top}
                      width={Math.abs(arraste[1] - arraste[0])}
                      height={altura - margem.top - margem.bottom}
                    />
                  ) : null}

                  <text
                    className="mk-axis"
                    transform={`translate(13 ${(margem.top + altura - margem.bottom) / 2}) rotate(-90)`}
                    textAnchor="middle"
                  >
                    {modo === 'base100' ? 'Base 100 no início' : 'Preço (R$)'}
                  </text>
                </svg>

                {cursor && !arraste ? (
                  <div className="mk-tip" style={{ left: Math.min(cursor.px + 14, largura - 130), top: 10 }}>
                    <strong>{historico!.datas[cursor.indice]}</strong>
                    {ativos
                      .map((ticker) => ({
                        ticker,
                        valor: historico!.series[ticker][modo][cursor.indice],
                      }))
                      .sort((a, b) => b.valor - a.valor)
                      .map((item) => (
                        <span key={item.ticker}>
                          {item.ticker.replace('.SA', '')}: {formatarNumero(item.valor)}
                        </span>
                      ))}
                  </div>
                ) : null}
              </>
            ) : (
              <p className="mk-empty">Nenhuma série selecionada.</p>
            )}
          </div>

          <footer className="mk-variations">
            {variacoes.map((item) => (
              <span key={item.ticker} className={item.variacao >= 0 ? 'up' : 'down'}>
                {item.curto} {item.variacao >= 0 ? '+' : ''}
                {formatarNumero(item.variacao, 1)}%
              </span>
            ))}
          </footer>
        </>
      ) : (
        <p className="mk-empty">
          Nenhum dos papéis filtrados está no histórico exportado (ele cobre os 12 mais líquidos).
        </p>
      )}
    </section>
  )
}
