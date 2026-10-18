import { useEffect, useMemo, useRef, useState } from 'react'
import { MarketHistogram, MarketPrices, MarketRanking, MarketScatter } from './MarketCharts'
import { localeAtual, useCopy, useLang } from '../i18n'
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

const TOP_N = [null, 10, 25, 50, 100] as const

const copy = {
  pt: {
    titulo: 'Analista B3',
    hintAntes: 'Dashboard do',
    hintDepois:
      ': um pipeline em Python raspa os indicadores fundamentalistas do Fundamentus, junta o histórico do Yahoo Finance e exporta JSON; o painel filtra os 250 papéis inteiros no navegador, sem backend. Aqui a mesma lógica roda em React, com os gráficos em SVG.',
    chipVue: 'Vue 3 no original',
    coleta: (data: string) => `coleta de ${data}`,
    carregando: 'Carregando os indicadores…',
    erro: 'Não foi possível carregar os indicadores agora.',
    filtros: 'Filtros',
    limpar: 'limpar',
    contador: (filtradas: number, total: number) => (
      <>
        <b>{filtradas}</b> de {total} papéis
      </>
    ),
    buscar: 'Buscar papel',
    buscaPlaceholder: 'PETR, VALE…',
    liquidezMinima: 'Liquidez mínima em 2 meses',
    plMaximo: 'P/L máximo',
    pvpMaximo: 'P/VP máximo',
    roeMinimo: 'ROE mínimo (%)',
    dyMinimo: 'DY mínimo (%)',
    topN: 'Manter apenas os N mais líquidos',
    todos: 'todos',
    excluirPrejuizo: 'Excluir empresas com prejuízo',
    atalhos: 'Atalhos',
    plMediano: 'P/L mediano',
    pvpMediano: 'P/VP mediano',
    roeMediano: 'ROE mediano',
    dyMediano: 'DY mediano',
    tabelaTitulo: 'Papéis filtrados',
    tabelaLegenda:
      'Clique num cabeçalho para ordenar, ou numa linha para destacá-la na distribuição.',
    colunaPapel: 'Papel',
    vazia: 'Nenhum papel passou nos filtros.',
    mostrando: (limite: number, total: number) => `Mostrando ${limite} de ${total}.`,
    mostrarMais: 'mostrar mais',
    aviso: (data: string) =>
      `Dados do Fundamentus e do Yahoo Finance, coletados em ${data}. Projeto de estudo, não é recomendação de investimento.`,
  },
  en: {
    titulo: 'B3 Analyst',
    hintAntes: 'Dashboard from',
    hintDepois:
      ': a Python pipeline scrapes fundamental indicators from Fundamentus, joins Yahoo Finance history and exports JSON; the panel filters all 250 tickers in the browser, with no backend. The same logic runs here in React, with the charts in SVG.',
    chipVue: 'Vue 3 in the original',
    coleta: (data: string) => `collected on ${data}`,
    carregando: 'Loading the indicators…',
    erro: 'Could not load the indicators right now.',
    filtros: 'Filters',
    limpar: 'clear',
    contador: (filtradas: number, total: number) => (
      <>
        <b>{filtradas}</b> of {total} tickers
      </>
    ),
    buscar: 'Search ticker',
    buscaPlaceholder: 'PETR, VALE…',
    liquidezMinima: 'Minimum 2-month liquidity',
    plMaximo: 'Max P/L',
    pvpMaximo: 'Max P/VP',
    roeMinimo: 'Min ROE (%)',
    dyMinimo: 'Min DY (%)',
    topN: 'Keep only the N most liquid',
    todos: 'all',
    excluirPrejuizo: 'Exclude companies with losses',
    atalhos: 'Shortcuts',
    plMediano: 'Median P/L',
    pvpMediano: 'Median P/VP',
    roeMediano: 'Median ROE',
    dyMediano: 'Median DY',
    tabelaTitulo: 'Filtered tickers',
    tabelaLegenda: 'Click a header to sort, or a row to highlight it in the distribution.',
    colunaPapel: 'Ticker',
    vazia: 'No tickers passed the filters.',
    mostrando: (limite: number, total: number) => `Showing ${limite} of ${total}.`,
    mostrarMais: 'show more',
    aviso: (data: string) =>
      `Data from Fundamentus and Yahoo Finance, collected on ${data}. This is a study project, not investment advice.`,
  },
}

function numeroOuNulo(texto: string): number | null {
  if (!texto.trim()) return null
  const valor = Number(texto.replace(',', '.'))
  return Number.isFinite(valor) ? valor : null
}

export default function MarketDemo() {
  const t = useCopy(copy)
  const lang = useLang()
  const [acoes, setAcoes] = useState<Acao[]>([])
  const [historico, setHistorico] = useState<Historico | null>(null)
  const [dataColeta, setDataColeta] = useState('')
  const [erro, setErro] = useState(false)
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
        setErro(false)
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setErro(true)
      }
    }

    void carregar()
    return () => controller.abort()
  }, [visivel])

  const filtradas = useMemo(() => filtrar(acoes, filtros), [acoes, filtros])
  const ativos = useMemo(() => filtrosAtivos(filtros, lang), [filtros, lang])

  const resumo = useMemo(
    () => [
      { rotulo: t.plMediano, valor: mediana(valores(filtradas, 'pl')), sufixo: '' },
      { rotulo: t.pvpMediano, valor: mediana(valores(filtradas, 'pvp')), sufixo: '' },
      { rotulo: t.roeMediano, valor: mediana(valores(filtradas, 'roe')), sufixo: '%' },
      { rotulo: t.dyMediano, valor: mediana(valores(filtradas, 'div_yield')), sufixo: '%' },
    ],
    [filtradas, t],
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
  const rotulos = ROTULOS[lang]

  return (
    <article className="panel market-demo" id="demo-market" ref={raiz}>
      <div className="bancada-head">
        <div>
          <h3>{t.titulo}</h3>
          <p className="hint">
            {t.hintAntes}{' '}
            <a href="https://github.com/Diasz1m/market-v1" target="_blank" rel="noreferrer">
              market-v1
            </a>
            {t.hintDepois}
          </p>
        </div>
        <div className="socket-meta">
          <span className="chip">Python + Playwright</span>
          <span className="chip">{t.chipVue}</span>
          {dataColeta ? <span className="chip">{t.coleta(dataColeta)}</span> : null}
        </div>
      </div>

      {erro ? <p className="error">{t.erro}</p> : null}
      {carregando ? <p className="status">{t.carregando}</p> : null}

      {acoes.length ? (
        <div className="market-layout">
          <aside className="market-filters">
            <header>
              <strong>{t.filtros}</strong>
              {ativos.length ? (
                <button
                  type="button"
                  className="linkish"
                  onClick={() => setFiltros({ ...FILTROS_PADRAO })}
                >
                  {t.limpar}
                </button>
              ) : null}
            </header>

            <p className="market-counter">{t.contador(filtradas.length, acoes.length)}</p>

            <label>
              <span>{t.buscar}</span>
              <input
                value={filtros.busca}
                placeholder={t.buscaPlaceholder}
                onChange={(event) => atualizar({ busca: event.target.value })}
              />
            </label>

            <label>
              <span className="market-range-label">
                {t.liquidezMinima}
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
                <span>{t.plMaximo}</span>
                <input
                  inputMode="decimal"
                  placeholder="—"
                  value={filtros.plMaximo ?? ''}
                  onChange={(event) => atualizar({ plMaximo: numeroOuNulo(event.target.value) })}
                />
              </label>
              <label>
                <span>{t.pvpMaximo}</span>
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
                <span>{t.roeMinimo}</span>
                <input
                  inputMode="decimal"
                  placeholder="—"
                  value={filtros.roeMinimo ?? ''}
                  onChange={(event) => atualizar({ roeMinimo: numeroOuNulo(event.target.value) })}
                />
              </label>
              <label>
                <span>{t.dyMinimo}</span>
                <input
                  inputMode="decimal"
                  placeholder="—"
                  value={filtros.dyMinimo ?? ''}
                  onChange={(event) => atualizar({ dyMinimo: numeroOuNulo(event.target.value) })}
                />
              </label>
            </div>

            <label>
              <span>{t.topN}</span>
              <select
                value={filtros.topN === null ? '' : String(filtros.topN)}
                onChange={(event) =>
                  atualizar({ topN: event.target.value ? Number(event.target.value) : null })
                }
              >
                {TOP_N.map((valor) => (
                  <option key={valor === null ? 'todos' : valor} value={valor === null ? '' : String(valor)}>
                    {valor === null ? t.todos : valor}
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
              {t.excluirPrejuizo}
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
              <h5>{t.atalhos}</h5>
              {PRESETS.map((preset) => (
                <button
                  key={preset.nome.pt}
                  type="button"
                  onClick={() => aplicarPreset(preset.valores)}
                >
                  {preset.nome[lang]}
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
                    {item.valor.toLocaleString(localeAtual(), { maximumFractionDigits: 2 })}
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
                  <h4>{t.tabelaTitulo}</h4>
                  <p className="mk-legend">{t.tabelaLegenda}</p>
                </div>
              </header>

              <div className="bancada-table-wrap">
                <table className="bancada-table market-table">
                  <thead>
                    <tr>
                      <th className="market-ticker">{t.colunaPapel}</th>
                      {COLUNAS.map((coluna) => (
                        <th
                          key={coluna}
                          className={ordenarPor === coluna ? 'on' : undefined}
                          onClick={() => ordenar(coluna)}
                        >
                          {rotulos[coluna].replace(' (%)', '').replace(' (R$)', '')}
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
                          {t.vazia}
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              {ordenadas.length > limite ? (
                <footer className="mk-note">
                  {t.mostrando(limite, ordenadas.length)}{' '}
                  <button type="button" className="linkish" onClick={() => setLimite(limite + 25)}>
                    {t.mostrarMais}
                  </button>
                </footer>
              ) : null}
            </section>

            <p className="mk-note">{t.aviso(dataColeta || '—')}</p>
          </div>
        </div>
      ) : null}
    </article>
  )
}
