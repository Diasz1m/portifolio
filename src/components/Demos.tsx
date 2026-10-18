import BancadaDemo from './BancadaDemo'
import CurrencyConverter from './CurrencyConverter'
import FlappyBirdDemo from './FlappyBirdDemo'
import MarketDemo from './MarketDemo'
import SocketTransfer from './SocketTransfer'
import { useCopy } from '../i18n'

const copy = {
  pt: {
    kicker: 'Ao vivo',
    title: 'Demos dos projetos',
    lede: 'Cinco ideias do GitHub rodando aqui: o dashboard de indicadores da B3, o helpdesk Bancada, o Flappy Bird, a transferência por sockets e o conversor de moedas. Sem Docker nem backend local — só abrir e usar.',
  },
  en: {
    kicker: 'Live',
    title: 'Project demos',
    lede: 'Five ideas from GitHub running right here: the B3 indicators dashboard, the Bancada helpdesk, Flappy Bird, the socket file transfer and the currency converter. No Docker, no local backend — just open and use.',
  },
}

export default function Demos() {
  const t = useCopy(copy)

  return (
    <section className="section" id="demos">
      <div className="wrap">
        <p className="kicker">{t.kicker}</p>
        <h2>{t.title}</h2>
        <p className="lede" style={{ margin: '12px 0 28px' }}>
          {t.lede}
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
