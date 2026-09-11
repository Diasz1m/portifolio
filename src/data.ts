export const profile = {
  name: 'Matheus Quevedo Dias',
  shortName: 'Matheus Dias',
  title: 'Desenvolvedor Full Stack',
  location: 'Pato Branco, Paraná',
  email: 'matheusmelhor3@outlook.com',
  phone: '(46) 98800-9754',
  github: 'https://github.com/Diasz1m',
  githubUser: 'Diasz1m',
  linkedin: 'https://linkedin.com/in/matheus-dias-5691bb195',
  resume:
    'https://docs.google.com/document/d/1h2T_l35hJmTcfhgC7kk4Io6U-GO7WQm8UpXtudkZiTE/edit?usp=sharing',
  avatar: 'https://imgur.com/muMv9e9.jpg',
  headline:
    'Construo sistemas web corporativos — do backend em Java e PHP até o frontend em React e Angular.',
  about: [
    'Sou desenvolvedor full stack com experiência em aplicações web corporativas, sistemas de gestão (CRM/ERP) e integrações de backend. Atuo hoje como pleno na VIASOFT, em Pato Branco, trabalhando com Java Spring Boot e React em produtos SaaS.',
    'Passei por times que entregam CRM, importação de dados, microsserviços e APIs de alta demanda. Gosto de código claro, contratos bem definidos e de fechar o ciclo: modelar, implementar, integrar e colocar em produção.',
    'Formação em andamento em Análise e Desenvolvimento de Sistemas na UTFPR. Aberto a conversas sobre produtos, backend sólido e frontends que realmente funcionam.',
  ],
}

export const skills = [
  {
    group: 'Backend',
    items: ['Java', 'Spring Boot', 'PHP', 'Python', 'FastAPI', 'Node.js'],
  },
  {
    group: 'Frontend',
    items: ['React', 'TypeScript', 'Angular', 'Vue 3', 'Flutter'],
  },
  {
    group: 'Dados',
    items: ['MySQL', 'PostgreSQL', 'Redis'],
  },
  {
    group: 'DevOps e prática',
    items: ['Linux', 'Docker', 'Git', 'APIs REST', 'Microsserviços', 'SaaS'],
  },
]

export const experience = [
  {
    role: 'Desenvolvedor Full Stack Pleno',
    company: 'VIASOFT',
    period: 'Jul 2025 — Mai 2026',
    place: 'Pato Branco, PR',
    points: [
      'Soluções web com Java Spring Boot e React em sistemas SaaS corporativos.',
      'Integração entre microsserviços e APIs externas em ambiente de alta demanda.',
      'Trabalho em times multidisciplinares com foco em qualidade e boas práticas.',
    ],
  },
  {
    role: 'Desenvolvedor',
    company: 'Widesys',
    period: 'Nov 2022 — Jun 2025',
    place: 'Pato Branco, PR',
    points: [
      'CRM SaaS com backend Java Spring Boot e frontend React + TypeScript.',
      'Modelagem e otimização de MySQL, stored procedures e migrations.',
      'Integrações com Stripe, webhooks e microsserviços.',
      'Pipeline de importação com Python (FastAPI + Celery + Playwright) para scraping.',
    ],
  },
  {
    role: 'Desenvolvedor',
    company: 'IDS',
    period: 'Set 2021 — Fev 2022',
    place: 'Pato Branco, PR',
    points: [
      'Aplicações para previdência social e educação.',
      'Backend Java Spring Boot e frontend Angular.',
      'Participação do levantamento de requisitos até a entrega.',
    ],
  },
  {
    role: 'Desenvolvedor Júnior',
    company: 'Gew',
    period: 'Jul 2020 — Set 2021',
    place: 'Pato Branco, PR',
    points: [
      'Soluções web para postos de combustíveis com AngularJS e PHP.',
      'Aplicativos mobile com Flutter/Dart.',
      'Manutenção e evolução de sistemas legados.',
    ],
  },
]

export const featuredProjects = [
  {
    name: 'Bancada',
    description:
      'Helpdesk interno em Vue 3 (Composition API, Router, Pinia) com o mesmo contrato de API em PHP 8 e Node/TypeScript. Auth Bearer, papéis, assistente de triagem e validação 422.',
    stack: ['Vue 3', 'PHP', 'Node', 'TypeScript', 'Docker'],
    url: 'https://github.com/Diasz1m/bancada',
    demo: '#demo-bancada',
  },
  {
    name: 'Flappy Bird',
    description:
      'Clone do Flappy Bird em C++17 com raylib. Física, canos e HUD desenhados no código, sem sprites. A demo nesta página usa a mesma regra de jogo no canvas.',
    stack: ['C++', 'raylib', 'CMake'],
    url: 'https://github.com/Diasz1m/flapy-bird',
    demo: '#demo-flappy',
  },
  {
    name: 'Conversor de moedas',
    description:
      'Serviço de cotação em TypeScript com Express, gRPC e consumo de API externa. A demo ao vivo nesta página usa a mesma ideia: converter valores entre moedas em tempo real.',
    stack: ['TypeScript', 'Express', 'gRPC'],
    url: 'https://github.com/Diasz1m/currency_quotation',
    demo: '#demo-moedas',
  },
  {
    name: 'Transferência por sockets',
    description:
      'Implementação de transferência de arquivos usando sockets em Java — exercício de rede, concorrência e protocolo próprio. A demo simula o handshake, os chunks de 4096 bytes e o ACK do servidor.',
    stack: ['Java', 'Sockets'],
    url: 'https://github.com/Diasz1m/proj_arquivos_sockets',
    demo: '#demo-sockets',
  },
  {
    name: 'Helius',
    description:
      'Frontend Angular de um sistema de cadastros e gestão. Complementa a linha de CRMs e painéis que venho construindo no dia a dia.',
    stack: ['Angular', 'TypeScript', 'SCSS'],
    url: 'https://github.com/Diasz1m/helius-front',
  },
  {
    name: 'Calculadora JS',
    description:
      'Uma das primeiras aplicações web: calculadora em HTML, CSS e JavaScript puro.',
    stack: ['HTML', 'CSS', 'JavaScript'],
    url: 'https://github.com/Diasz1m/APP-calc-javascript',
  },
]

export const hiddenRepos = new Set([
  'Diasz1m',
  'webApp',
  'blog--',
  'blog-v1',
  'Interface',
  'Products-basic',
  'employeers-test',
  'dados-Trab',
  'Exe-oes1',
  'Bank1',
  'Seminario2_testes_software',
  'MatheusDias_avaliaGit20242',
  'seguranca-php',
])
