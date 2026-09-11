import { useEffect, useMemo, useRef, useState } from 'react'
import { MarketHistogram, MarketPrices, MarketRanking, MarketScatter } from './MarketCharts'
import {
  filtrar,
  filtrosAtivos,
  FILTROS_PADRAO,
  formatarGrande,
  formatarIndicador,
  mediana,
  PRESETS,
  ROTULOS,
  valores,
  type Acao,
  type Filtros,
  type Historico,
  type Indicador,
  type RespostaAcoes,
} from '../marketData'

const COLUNAS: Indicador[] = [
  'cotacao',
  'pl',
  'pvp',
  'div_yield',
  'roe',
  'roic',
  'mrg_liq',
  'div_liq_patrim',
  'liq_2meses',
]

const TOP_N = [
  { rotulo: 'todos', valor: null },
  { rotulo: '10', valor: 10 },
  { rotulo: '25', valor: 25 },
  { rotulo: '50', valor: 50 },
  { rotulo: '100', valor: 100 },
]

function numeroOuNulo(texto: string): number | null {
  if (!texto.trim()) return null
  const valor = Number(texto.replace(',', '.'))
  return Number.isFinite(valor) ? valor : null
}

export default function MarketDemo() {
  const [acoes, setAcoes] = useState<Acao[]>([])
  const [historico, setHistorico] = useState<Historico | null>(null)
  const [dataColeta, setDataColeta] = useState('')
  const [erro, setErro] = useState('')
  const [visivel, setVisivel] = useState(false)
  const [filtros, setFiltros] = useState<Filtros>({ ...FILTROS_PADRAO })
  const [destaque, setDestaque] = useState<string | undefined>()
  const [ordenarPor, setOrdenarPor] = useState<Indicador>('liq_2meses')
  const [descendente, setDescendente] = useState(true)
  const [limite, setLimite] = useState(25)
  const raiz = useRef<HTMLElement>(null)

  /* Os JSON somam ~155 KB, então só busca quando a demo chega perto da viewport. */
  useEffect(() => {
    const alvo = raiz.current
    if (!alvo) return
    const observer = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((entrada) => entrada.isIntersecting)) {
          setVisivel(true)
          observer.disconnect()
        }
      },
      { rootMargin: '300px' },
    )
    observer.observe(alvo)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visivel) return
    const controller = new AbortController()
    const base = import.meta.env.BASE_URL

    async function carregar() {
      try {
        const [respostaAcoes, respostaHistorico] = await Promise.all([
          fetch(`${base}dados/market/acoes.json`, { signal: controller.signal }),
          fetch(`${base}dados/market/historico.json`, { signal: controller.signal }),
        ])
        if (!respostaAcoes.ok || !respostaHistorico.ok) throw new Error('falha ao carregar')
        const dados = (await respostaAcoes.json()) as RespostaAcoes
        setAcoes(dados.acoes)
        setDataColeta(dados.data)
        setHistorico((await respostaHistorico.json()) as Historico)
        setErro('')
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setErro('Não foi possível carregar os indicadores agora.')
      }
    }

    void carregar()
    return () => controller.abort()
  }, [visivel])

  const filtradas = useMemo(() => filtrar(acoes, filtros), [acoes, filtros])
  const ativos = useMemo(() => filtrosAtivos(filtros), [filtros])

  const resumo = useMemo(
    () => [
      { rotulo: 'P/L mediano', valor: mediana(valores(filtradas, 'pl')), sufixo: '' },
      { rotulo: 'P/VP mediano', valor: mediana(valores(filtradas, 'pvp')), sufixo: '' },
      { rotulo: 'ROE mediano', valor: mediana(valores(filtradas, 'roe')), sufixo: '%' },
      { rotulo: 'DY mediano', valor: mediana(valores(filtradas, 'div_yield')), sufixo: '%' },
    ],
    [filtradas],
  )

  const ordenadas = useMemo(
    () =>
      [...filtradas].sort((a, b) => {
        const x = a[ordenarPor]
        const y = b[ordenarPor]
        if (x === null) return 1
        if (y === null) return -1
        return descendente ? y - x : x - y
      }),
    [descendente, filtradas, ordenarPor],
  )

  function atualizar(mudanca: Partial<Filtros>) {
    setFiltros((atual) => ({ ...atual, ...mudanca }))
  }

  function aplicarPreset(mudanca: Partial<Filtros>) {
    setFiltros({ ...FILTROS_PADRAO, ...mudanca })
  }

  function ordenar(coluna: Indicador) {
    if (ordenarPor === coluna) {
      setDescendente((atual) => !atual)
    } else {
      setOrdenarPor(coluna)
      setDescendente(true)
    }
  }

  const carregando = visivel && !erro && !acoes.length

  return (
    <article className="panel market-demo" id="demo-market" ref={raiz}>
      <div className="bancada-head">
        <div>
          <h3>Analista B3</h3>
          <p className="hint">
            Dashboard do{' '}
            <a href="https://github.com/Diasz1m/market-v1" target="_blank" rel="noreferrer">
              market-v1
            </a>
            : um pipeline em Python raspa os indicadores fundamentalistas do Fundamentus, junta o
            histórico do Yahoo Finance e exporta JSON; o painel filtra os 250 papéis inteiros no
            navegador, sem backend. Aqui a mesma lógica roda em React, com os gráficos em SVG.
          </p>
        </div>
        <div className="socket-meta">
          <span className="chip">Python + Playwright</span>
          <span className="chip">Vue 3 no original</span>
          {dataColeta ? <span className="chip">coleta de {dataColeta}</span> : null}
        </div>
      </div>

      {erro ? <p className="error">{erro}</p> : null}
      {carregando ? <p className="status">Carregando os indicadores…</p> : null}

      {acoes.length ? (
        <div className="market-layout">
          <aside className="market-filters">
            <header>
              <strong>Filtros</strong>
              {ativos.length ? (
                <button
                  type="button"
                  className="linkish"
                  onClick={() => setFiltros({ ...FILTROS_PADRAO })}
                >
                  limpar
                </button>
              ) : null}
            </header>

            <p className="market-counter">
              <b>{filtradas.length}</b> de {acoes.length} papéis
            </p>

            <label>
              <span>Buscar papel</span>
              <input
                value={filtros.busca}
                placeholder="PETR, VALE…"
                onChange={(event) => atualizar({ busca: event.target.value })}
              />
            </label>

            <label>
              <span className="market-range-label">
                Liquidez mínima em 2 meses
                <em>R$ {formatarGrande(filtros.liquidezMinima)}</em>
              </span>
              <input
                type="range"
                min={4}
                max={9.3}
                step={0.05}
                value={Math.log10(Math.max(filtros.liquidezMinima, 1e4))}
                onChange={(event) =>
                  atualizar({ liquidezMinima: Math.round(10 ** Number(event.target.value)) })
                }
              />
            </label>

            <div className="market-pair">
              <label>
                <span>P/L máximo</span>
                <input
                  inputMode="decimal"
                  placeholder="—"
                  value={filtros.plMaximo ?? ''}
                  onChange={(event) => atualizar({ plMaximo: numeroOuNulo(event.target.value) })}
                />
              </label>
              <label>
                <span>P/VP máximo</span>
                <input
                  inputMode="decimal"
                  placeholder="—"
                  value={filtros.pvpMaximo ?? ''}
                  onChange={(event) => atualizar({ pvpMaximo: numeroOuNulo(event.target.value) })}
                />
              </label>
            </div>

            <div className="market-pair">
              <label>
                <span>ROE mínimo (%)</span>
                <input
                  inputMode="decimal"
                  placeholder="—"
                  value={filtros.roeMinimo ?? ''}
                  onChange={(event) => atualizar({ roeMinimo: numeroOuNulo(event.target.value) })}
                />
              </label>
              <label>
                <span>DY mínimo (%)</span>
                <input
                  inputMode="decimal"
                  placeholder="—"
                  value={filtros.dyMinimo ?? ''}
                  onChange={(event) => atualizar({ dyMinimo: numeroOuNulo(event.target.value) })}
                />
              </label>
            </div>

            <label>
              <span>Manter apenas os N mais líquidos</span>
              <select
                value={filtros.topN === null ? '' : String(filtros.topN)}
                onChange={(event) =>
                  atualizar({ topN: event.target.value ? Number(event.target.value) : null })
                }
              >
                {TOP_N.map((opcao) => (
                  <option key={opcao.rotulo} value={opcao.valor === null ? '' : String(opcao.valor)}>
                    {opcao.rotulo}
                  </option>
                ))}
              </select>
            </label>

            <label className="market-check">
              <input
                type="checkbox"
                checked={filtros.excluirPrejuizo}
                onChange={(event) => atualizar({ excluirPrejuizo: event.target.checked })}
              />
              Excluir empresas com prejuízo
            </label>

            {ativos.length ? (
              <div className="chips market-tags">
                {ativos.map((tag) => (
                  <span key={tag} className="chip">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <section className="market-presets">
              <h5>Atalhos</h5>
              {PRESETS.map((preset) => (
                <button key={preset.nome} type="button" onClick={() => aplicarPreset(preset.valores)}>
                  {preset.nome}
                </button>
              ))}
            </section>
          </aside>

          <div className="market-panels">
            <div className="market-summary">
              {resumo.map((item) => (
                <div key={item.rotulo} className="stat">
                  {item.rotulo}
                  <b>
                    {item.valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                    {item.sufixo}
                  </b>
                </div>
              ))}
            </div>

            <MarketScatter acoes={filtradas} />

            <div className="market-duo">
              <MarketRanking acoes={filtradas} />
              <MarketHistogram acoes={filtradas} destaque={destaque} />
            </div>

            <MarketPrices historico={historico} acoes={filtradas} />

            <section className="mk-card">
              <header className="mk-card-head">
                <div>
                  <h4>Papéis filtrados</h4>
                  <p className="mk-legend">
                    Clique num cabeçalho para ordenar, ou numa linha para destacá-la na distribuição.
                  </p>
                </div>
              </header>

              <div className="bancada-table-wrap">
                <table className="bancada-table market-table">
                  <thead>
                    <tr>
                      <th className="market-ticker">Papel</th>
                      {COLUNAS.map((coluna) => (
                        <th
                          key={coluna}
                          className={ordenarPor === coluna ? 'on' : undefined}
                          onClick={() => ordenar(coluna)}
                        >
                          {ROTULOS[coluna].replace(' (%)', '').replace(' (R$)', '')}
                          {ordenarPor === coluna ? (descendente ? ' ↓' : ' ↑') : ''}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ordenadas.slice(0, limite).map((acao) => (
                      <tr
                        key={acao.papel}
                        className={acao.papel === destaque ? 'on' : undefined}
                        onClick={() => setDestaque(destaque === acao.papel ? undefined : acao.papel)}
                      >
                        <td className="market-ticker">{acao.papel}</td>
                        {COLUNAS.map((coluna) => (
                          <td key={coluna}>{formatarIndicador(acao[coluna], coluna)}</td>
                        ))}
                      </tr>
                    ))}
                    {!ordenadas.length ? (
                      <tr>
                        <td colSpan={COLUNAS.length + 1} className="mk-empty">
                          Nenhum papel passou nos filtros.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              {ordenadas.length > limite ? (
                <footer className="mk-note">
                  Mostrando {limite} de {ordenadas.length}.{' '}
                  <button type="button" className="linkish" onClick={() => setLimite(limite + 25)}>
                    mostrar mais
                  </button>
                </footer>
              ) : null}
            </section>

            <p className="mk-note">
              Dados do Fundamentus e do Yahoo Finance, coletados em {dataColeta || '—'}. Projeto de
              estudo, não é recomendação de investimento.
            </p>
          </div>
        </div>
      ) : null}
    </article>
  )
}
