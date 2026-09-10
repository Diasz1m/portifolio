import { useEffect, useMemo, useState } from 'react'

const CURRENCIES = ['BRL', 'USD', 'EUR', 'GBP', 'JPY', 'CAD'] as const

type Rates = Record<string, number>

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState<(typeof CURRENCIES)[number]>('USD')
  const [to, setTo] = useState<(typeof CURRENCIES)[number]>('BRL')
  const [rates, setRates] = useState<Rates | null>(null)
  const [error, setError] = useState('')
  const [updatedAt, setUpdatedAt] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const pairs = CURRENCIES.filter((code) => code !== 'BRL')
          .map((code) => `${code}-BRL`)
          .join(',')
        const response = await fetch(
          `https://economia.awesomeapi.com.br/json/last/${pairs}`,
          { signal: controller.signal },
        )
        if (!response.ok) throw new Error('Falha ao buscar cotações')
        const data = (await response.json()) as Record<
          string,
          { bid: string; create_date: string }
        >
        const next: Rates = { BRL: 1 }
        for (const [key, quote] of Object.entries(data)) {
          const code = key.replace('BRL', '')
          next[code] = Number(quote.bid)
        }
        setRates(next)
        const first = Object.values(data)[0]
        setUpdatedAt(first?.create_date?.slice(0, 10) ?? '')
        setError('')
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setError('Não foi possível carregar as cotações agora.')
      }
    }

    void load()
    return () => controller.abort()
  }, [])

  const converted = useMemo(() => {
    const value = Number(amount.replace(',', '.'))
    if (!rates || Number.isNaN(value)) return null
    const fromRate = rates[from]
    const toRate = rates[to]
    if (!fromRate || !toRate) return null
    return (value * fromRate) / toRate
  }, [amount, from, rates, to])

  function swap() {
    setFrom(to)
    setTo(from)
  }

  return (
    <article className="panel" id="demo-moedas">
      <h3>Conversor de moedas</h3>
      <p className="hint">
        Inspirado em{' '}
        <a href="https://github.com/Diasz1m/currency_quotation" target="_blank" rel="noreferrer">
          currency_quotation
        </a>
        . Cotações via AwesomeAPI.
      </p>
      <label style={{ display: 'block', marginBottom: 12 }}>
        <span>Valor</span>
        <input
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
      <div className="fx-row">
        <label>
          <span>De</span>
          <select value={from} onChange={(event) => setFrom(event.target.value as typeof from)}>
            {CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </label>
        <button className="swap" type="button" onClick={swap} aria-label="Inverter moedas">
          ⇄
        </button>
        <label>
          <span>Para</span>
          <select value={to} onChange={(event) => setTo(event.target.value as typeof to)}>
            {CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error ? <p className="error">{error}</p> : null}
      {!error && converted !== null ? (
        <p className="result">
          {converted.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          {to}
          <small>
            {amount || '0'} {from} · atualizado em {updatedAt}
          </small>
        </p>
      ) : null}
      {!error && converted === null ? (
        <p className="status" style={{ marginTop: 16 }}>
          Carregando cotações…
        </p>
      ) : null}
    </article>
  )
}
