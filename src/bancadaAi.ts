export type AiSuggestion = 'continue' | 'resolved' | 'escalate'
export type AiOutcome = 'triagem' | 'resolvido_ia' | 'escalado'

export type ChatTurn = {
  role: 'user' | 'assistant'
  body: string
}

type Article = {
  id: string
  title: string
  keywords: string[]
  steps: string[]
  extra: string[]
}

export type AssistantReply = {
  body: string
  suggestion: AiSuggestion
}

const ARTICLES: Article[] = [
  {
    id: 'vpn',
    title: 'VPN que cai ou não conecta',
    keywords: ['vpn', 'firewall', 'tunel', 'túnel', 'home office', 'desconecta', 'cai', 'anyconnect', 'forticlient'],
    steps: [
      'Feche o cliente VPN por completo (não só minimizar) e abra de novo.',
      'Escolha o perfil “Bancada 2026”. O perfil antigo quebrou depois da troca do firewall.',
      'Se pedir certificado, aceite o da TI. Recusar a troca costuma derrubar o túnel a cada poucos minutos.',
      'Teste um site interno (intranet) e um externo. Se só o interno falhar, ainda é VPN.',
    ],
    extra: [
      'Desative Wi-Fi temporário / “segurança de rede” do antivírus só para testar.',
      'Troque de rede (do Wi-Fi de casa para o 4G do celular). Se estabilizar, o provedor está filtrando UDP.',
      'Reinstale o cliente VPN a partir do portal interno; não use o instalador antigo.',
    ],
  },
  {
    id: 'monitor',
    title: 'Segundo monitor / dock HDMI',
    keywords: ['monitor', 'hdmi', 'displayport', 'dock', 'tela', 'segundo', 'projetor', 'usb-c'],
    steps: [
      'Desconecte a dock da tomada e do notebook, espere 20 segundos, reconecte alimentação primeiro e só depois o USB-C.',
      'No Windows: clique com o botão direito na área de trabalho → Configurações de vídeo → Detectar.',
      'Troque o cabo HDMI (ou use a porta DisplayPort da dock, se houver). Cabo solto é a causa mais comum.',
      'Em “Configurações de vídeo”, confirme que a tela extra não está em “Desconectar este vídeo”.',
    ],
    extra: [
      'Atualize o driver da dock no site da Dell/Lenovo — o Windows Update costuma atrasar isso.',
      'Teste o monitor direto no HDMI do notebook, sem a dock, para isolar o acessório.',
    ],
  },
  {
    id: 'drive',
    title: 'Acesso a pasta ou drive de projetos',
    keywords: ['drive', 'pasta', 'projetos', 'permissao', 'permissão', 'smb', 'acesso negado', 'acme'],
    steps: [
      'Confirme se você está na VPN. Sem túnel, o drive \\bancada\\projetos nem aparece.',
      'No Explorer, acesse \\\\bancada\\projetos — não use o atalho antigo da área de trabalho.',
      'Se der “acesso negado”, peça para o gestor do time confirmar o grupo AD (ex.: projetos-2026).',
      'Saia e entre de novo no Windows (logoff) depois que o grupo for liberado; a permissão não pega na hora.',
    ],
    extra: [
      'Mapeie de novo: Explorer → Este Computador → Mapear unidade de rede → \\\\bancada\\projetos.',
      'Se o caminho mudou no ano, use /projetos/2026 e não a pasta do ano anterior.',
    ],
  },
  {
    id: 'senha',
    title: 'Senha, bloqueio ou MFA',
    keywords: ['senha', 'password', 'bloqueio', 'mfa', '2fa', 'token', 'login', 'ad'],
    steps: [
      'Aguarde 15 minutos se a conta travou por tentativas. O desbloqueio automático roda nesse intervalo.',
      'Redefina em https://senha.bancada.test com o e-mail corporativo.',
      'No MFA, aprove o push no telefone. Se o aparelho trocou, diga aqui que precisa re-enrolar o token.',
    ],
    extra: [
      'Se o MFA está no celular antigo, um agente precisa resetar o token — isso eu não faço sozinha.',
    ],
  },
  {
    id: 'wifi',
    title: 'Wi-Fi do escritório',
    keywords: ['wifi', 'wi-fi', 'wireless', 'ssid', 'sinal', 'internet cai'],
    steps: [
      'Esqueça a rede BANCADA-CORP e conecte de novo com a senha do crachá (não a de convidados).',
      'Prefira a faixa 5 GHz. A 2.4 GHz no andar comercial fica saturada.',
      'Reinicie o adaptador: modo avião 10 segundos, depois desligue.',
    ],
    extra: ['No home office isso não se aplica — aí o caminho é a VPN, não o SSID interno.'],
  },
  {
    id: 'lento',
    title: 'Computador lento',
    keywords: ['lento', 'travando', 'travou', 'demora', 'cpu', 'memoria', 'memória', 'disco'],
    steps: [
      'Reinicie o notebook. Updates do Windows acumulados deixam o disco em 100% até o reboot.',
      'Abra o Gerenciador de tarefas e veja se Teams, Chrome ou um backup está em CPU/Disco altos.',
      'Libere pelo menos 15% de disco em C:. Abaixo disso o Windows começa a engasgar.',
    ],
    extra: ['Máquina com HDD e 8 GB de RAM não aguenta o pacote atual — aí preciso escalar.'],
  },
]

const RESOLVED =
  /((?<!nao\s)(?<!não\s)\bfuncionou\b|\b(resolveu|resolvido|deu certo|deu bom|obrigad|era isso|tudo certo|consegui)\b)/i
const ESCALATE = /\b(agente|humano|pessoa|tecnico|técnico|fila|falar com|atendente)\b/i
const FAILED =
  /(nao\s+funcion|não\s+funcion|nao\s+deu|não\s+deu|ainda\s+nao|ainda\s+não|continua o mesmo|mesmo erro|ja\s+tentei|já\s+tentei|nao\s+ajudou|não\s+ajudou)/i

export function assistantOpening(title: string, description: string): AssistantReply {
  const article = rankArticles(`${title} ${description}`)[0] ?? null
  if (article === null) {
    return {
      suggestion: 'continue',
      body: [
        'Olá, sou a assistente da Bancada. Vou tentar resolver isso antes de um agente pegar o chamado.',
        '',
        'Ainda não fechei um procedimento óbvio. Me diga, por favor:',
        '1. Qual a mensagem de erro exata, se houver.',
        '2. Quando começou (hoje, depois de uma troca de equipamento, etc.).',
        '3. O que você já tentou.',
        '',
        'Se preferir não debugar agora, peça para falar com um agente.',
      ].join('\n'),
    }
  }

  return {
    suggestion: 'continue',
    body: [
      `Olá, sou a assistente da Bancada. Pelo que você descreveu, isso parece: ${article.title}.`,
      '',
      'Tente nesta ordem:',
      ...number(article.steps),
      '',
      'Me avise se funcionou. Se não, sigo para o próximo procedimento ou encaminho a um agente.',
    ].join('\n'),
  }
}

export function assistantReply(
  title: string,
  description: string,
  history: ChatTurn[],
  message: string,
): AssistantReply {
  const intent = detectIntent(message)
  const assistantTurns = history.filter((item) => item.role === 'assistant').length
  const userText = history
    .filter((item) => item.role === 'user')
    .map((item) => item.body)
    .join(' ')
  const article = rankArticles(`${title} ${description} ${userText} ${message}`)[0] ?? null

  if (intent === 'resolved') {
    return {
      suggestion: 'resolved',
      body: 'Ótimo — então fechamos por aqui. Confirme em “Isso resolveu” para o chamado sair da fila. Se voltar a acontecer, abra outro ou escreva de novo.',
    }
  }

  if (intent === 'escalate' || assistantTurns >= 3) {
    return {
      suggestion: 'escalate',
      body: 'Certo. Não vou insistir no automático. Use “Falar com um agente” e a conversa fica no chamado para a TI ver o que já foi tentado.',
    }
  }

  if (intent === 'failed') {
    if (article !== null && assistantTurns < 2 && article.extra.length > 0) {
      return {
        suggestion: 'continue',
        body: [
          `Sem problema. Segundo nível para ${article.title}:`,
          '',
          ...number(article.extra),
          '',
          'Se ainda falhar, melhor um agente. Use o botão abaixo.',
        ].join('\n'),
      }
    }

    return {
      suggestion: 'escalate',
      body: 'Não tenho outro procedimento seguro daqui. Encaminhe a um agente para não perder tempo.',
    }
  }

  if (article === null) {
    return {
      suggestion: 'continue',
      body: 'Entendi. Pode detalhar o equipamento, o horário em que falha e se mais alguém do time é afetado? Com isso eu escolho o procedimento — ou encaminho.',
    }
  }

  return {
    suggestion: 'continue',
    body: [
      `Beleza. Mantendo o foco em ${article.title}:`,
      '',
      ...number(article.steps.slice(0, 3)),
      '',
      'Qual desses passos você já fez, e o que aconteceu depois?',
    ].join('\n'),
  }
}

function detectIntent(message: string): 'resolved' | 'failed' | 'escalate' | 'other' {
  if (FAILED.test(message)) return 'failed'
  if (ESCALATE.test(message)) return 'escalate'
  if (RESOLVED.test(message)) return 'resolved'
  return 'other'
}

function rankArticles(text: string): Article[] {
  return ARTICLES.map((article) => ({ article, score: score(text, article) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((row) => row.article)
}

function score(text: string, article: Article): number {
  const haystack = normalize(text)
  let points = 0
  for (const keyword of article.keywords) {
    if (haystack.includes(normalize(keyword))) points += 2
  }
  if (haystack.includes(normalize(article.title))) points += 3
  return points
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
}

function number(items: string[]): string[] {
  return items.map((item, index) => `${index + 1}. ${item}`)
}
