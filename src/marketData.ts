/** Tipos e cálculos portados do projeto market-v1 (analista B3). */

export interface Acao {
  papel: string
  ticker: string
  cotacao: number | null
  pl: number | null
  pvp: number | null
  psr: number | null
  div_yield: number | null
  p_ativo: number | null
  p_cap_giro: number | null
  p_ebit: number | null
  p_ativ_circ_liq: number | null
  ev_ebit: number | null
  ev_ebitda: number | null
  mrg_bruta: number | null
  mrg_ebit: number | null
  mrg_liq: number | null
  liq_corr: number | null
  roic: number | null
  roe: number | null
  liq_2meses: number | null
  patrim_liq: number | null
  div_liq_patrim: number | null
  cresc_rec_5a: number | null
}

export type Indicador = Exclude<keyof Acao, 'papel' | 'ticker'>

export interface RespostaAcoes {
  data: string
  total: number
  acoes: Acao[]
}

export interface Historico {
  periodo: string
  datas: string[]
  series: Record<string, { base100: number[]; preco: number[] }>
}

export interface Filtros {
  liquidezMinima: number
  plMaximo: number | null
  pvpMaximo: number | null
  roeMinimo: number | null
  dyMinimo: number | null
  excluirPrejuizo: boolean
  busca: string
  topN: number | null
}

export const ROTULOS: Record<Indicador, string> = {
  cotacao: 'Cotação (R$)',
  pl: 'P/L',
  pvp: 'P/VP',
  psr: 'PSR',
  div_yield: 'Dividend Yield (%)',
  p_ativo: 'P/Ativo',
  p_cap_giro: 'P/Cap. Giro',
  p_ebit: 'P/EBIT',
  p_ativ_circ_liq: 'P/Ativo Circ. Líq.',
  ev_ebit: 'EV/EBIT',
  ev_ebitda: 'EV/EBITDA',
  mrg_bruta: 'Margem bruta (%)',
  mrg_ebit: 'Margem EBIT (%)',
  mrg_liq: 'Margem líquida (%)',
  liq_corr: 'Liquidez corrente',
  roic: 'ROIC (%)',
  roe: 'ROE (%)',
  liq_2meses: 'Liquidez 2 meses (R$)',
  patrim_liq: 'Patrimônio líquido (R$)',
  div_liq_patrim: 'Dív. líq./Patrimônio',
  cresc_rec_5a: 'Cresc. receita 5a (%)',
}

export const INDICADORES = Object.keys(ROTULOS) as Indicador[]

export const FILTROS_PADRAO: Filtros = {
  liquidezMinima: 1e6,
  plMaximo: null,
  pvpMaximo: null,
  roeMinimo: null,
  dyMinimo: null,
  excluirPrejuizo: false,
  busca: '',
  topN: null,
}

export const PRESETS: Array<{ nome: string; valores: Partial<Filtros> }> = [
  {
    nome: 'Líquidas e rentáveis',
    valores: { liquidezMinima: 2e7, roeMinimo: 15, excluirPrejuizo: true },
  },
  {
    nome: 'Boas pagadoras de dividendos',
    valores: { dyMinimo: 8, pvpMaximo: 2, excluirPrejuizo: true },
  },
  {
    nome: 'Descontadas',
    valores: { plMaximo: 8, pvpMaximo: 1, excluirPrejuizo: true },
  },
]

/** Reproduz no navegador os filtros de `filtrar()` do Python. */
export function filtrar(acoes: Acao[], filtros: Filtros): Acao[] {
  const busca = filtros.busca.trim().toUpperCase()

  const resultado = acoes
    .filter((acao) => {
      if ((acao.liq_2meses ?? 0) < filtros.liquidezMinima) return false
      if (filtros.plMaximo !== null && (acao.pl ?? Infinity) > filtros.plMaximo) return false
      if (filtros.pvpMaximo !== null && (acao.pvp ?? Infinity) > filtros.pvpMaximo) return false
      if (filtros.roeMinimo !== null && (acao.roe ?? -Infinity) < filtros.roeMinimo) return false
      if (filtros.dyMinimo !== null && (acao.div_yield ?? -Infinity) < filtros.dyMinimo) return false
      if (filtros.excluirPrejuizo && (acao.pl ?? 0) <= 0) return false
      if (busca && !acao.papel.includes(busca)) return false
      return true
    })
    .sort((a, b) => (b.liq_2meses ?? 0) - (a.liq_2meses ?? 0))

  return filtros.topN !== null ? resultado.slice(0, filtros.topN) : resultado
}

export function filtrosAtivos(filtros: Filtros): string[] {
  const lista: string[] = []
  if (filtros.liquidezMinima !== FILTROS_PADRAO.liquidezMinima) lista.push('liquidez')
  if (filtros.plMaximo !== null) lista.push('P/L')
  if (filtros.pvpMaximo !== null) lista.push('P/VP')
  if (filtros.roeMinimo !== null) lista.push('ROE')
  if (filtros.dyMinimo !== null) lista.push('DY')
  if (filtros.excluirPrejuizo) lista.push('sem prejuízo')
  if (filtros.busca) lista.push('busca')
  if (filtros.topN !== null) lista.push('top N')
  return lista
}

/** Formata valores grandes como 1,9 bi / 45,3 mi / 820 mil. */
export function formatarGrande(valor: number | null): string {
  if (valor === null || Number.isNaN(valor)) return '—'
  const abs = Math.abs(valor)
  if (abs >= 1e9) return `${(valor / 1e9).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} bi`
  if (abs >= 1e6) return `${(valor / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`
  if (abs >= 1e3) return `${(valor / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} mil`
  return valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

export function formatarNumero(valor: number | null, casas = 2): string {
  if (valor === null || Number.isNaN(valor)) return '—'
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })
}

export function formatarIndicador(valor: number | null, indicador: Indicador): string {
  if (indicador === 'liq_2meses' || indicador === 'patrim_liq') return formatarGrande(valor)
  return formatarNumero(valor)
}

function quantil(ordenados: number[], p: number): number {
  const posicao = (ordenados.length - 1) * p
  const base = Math.floor(posicao)
  const resto = posicao - base
  const proximo = ordenados[base + 1]
  return proximo !== undefined
    ? ordenados[base] + resto * (proximo - ordenados[base])
    : ordenados[base]
}

/**
 * Corta as caudas nas colunas indicadas, espelhando `sem_extremos` do Python.
 * Abaixo de `minimo` papéis nada é removido: numa seleção pequena todo ponto foi
 * escolhido de propósito.
 */
export function semExtremos(
  acoes: Acao[],
  colunas: Indicador[],
  inferior = 0.05,
  superior = 0.95,
  minimo = 20,
): Acao[] {
  if (acoes.length < minimo) return acoes

  let recorte = acoes
  for (const coluna of colunas) {
    const lista = acoes
      .map((a) => a[coluna])
      .filter((v): v is number => v !== null && !Number.isNaN(v))
      .sort((a, b) => a - b)
    if (!lista.length) continue

    const baixo = quantil(lista, inferior)
    const alto = quantil(lista, superior)
    recorte = recorte.filter((a) => {
      const v = a[coluna]
      return v !== null && v >= baixo && v <= alto
    })
  }
  return recorte
}

export function mediana(lista: number[]): number {
  if (!lista.length) return 0
  return quantil([...lista].sort((a, b) => a - b), 0.5)
}

export function valores(acoes: Acao[], indicador: Indicador): number[] {
  return acoes
    .map((a) => a[indicador])
    .filter((v): v is number => v !== null && !Number.isNaN(v))
}

export interface Barra {
  centro: number
  contagem: number
}

export function histograma(dados: number[], faixas = 26): Barra[] {
  if (!dados.length) return []
  const min = Math.min(...dados)
  const max = Math.max(...dados)
  if (min === max) return [{ centro: min, contagem: dados.length }]

  const largura = (max - min) / faixas
  const baldes = new Array<number>(faixas).fill(0)
  for (const valor of dados) {
    const indice = Math.min(Math.floor((valor - min) / largura), faixas - 1)
    baldes[indice] += 1
  }
  return baldes.map((contagem, i) => ({ centro: min + largura * (i + 0.5), contagem }))
}

/** Ticks "redondos" para os eixos, já que aqui não há ECharts para calcular. */
export function ticks(min: number, max: number, alvo = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return []
  if (min === max) return [min]
  const bruto = (max - min) / alvo
  const magnitude = 10 ** Math.floor(Math.log10(bruto))
  const passo = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((p) => p >= bruto) ?? magnitude * 10

  const saida: number[] = []
  for (let v = Math.ceil(min / passo) * passo; v <= max + passo * 1e-6; v += passo) {
    saida.push(Number(v.toFixed(10)))
  }
  return saida
}

export function extensao(lista: number[], folga = 0.06): [number, number] {
  const min = Math.min(...lista)
  const max = Math.max(...lista)
  if (min === max) return [min - 1, max + 1]
  const margem = (max - min) * folga
  return [min - margem, max + margem]
}

export const PALETA = [
  '#e07a3d',
  '#c8e38a',
  '#f0c27a',
  '#8ecae6',
  '#d78ae3',
  '#f08a8a',
  '#7fd1b9',
  '#b9a8f0',
  '#e3c58a',
  '#8ab6e3',
  '#a3e38a',
  '#e38ab6',
]
