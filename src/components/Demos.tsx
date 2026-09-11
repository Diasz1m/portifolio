import BancadaDemo from './BancadaDemo'
import CurrencyConverter from './CurrencyConverter'
import FlappyBirdDemo from './FlappyBirdDemo'
import MarketDemo from './MarketDemo'
import SocketTransfer from './SocketTransfer'

export default function Demos() {
  return (
    <section className="section" id="demos">
      <div className="wrap">
        <p className="kicker">Ao vivo</p>
        <h2>Demos dos projetos</h2>
        <p className="lede" style={{ margin: '12px 0 28px' }}>
          Cinco ideias do GitHub rodando aqui: o dashboard de indicadores da B3, o helpdesk Bancada,
          o Flappy Bird, a transferência por sockets e o conversor de moedas. Sem Docker nem backend
          local — só abrir e usar.
        </p>
        <div className="demo-stack">
          <MarketDemo />
          <BancadaDemo />
          <FlappyBirdDemo />
          <SocketTransfer />
          <div className="demo-grid">
            <CurrencyConverter />
          </div>
        </div>
      </div>
    </section>
  )
}
