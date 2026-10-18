import type { Localized } from './i18n'

export const profile = {
  name: 'Matheus Quevedo Dias',
  shortName: 'Matheus Dias',
  email: 'matheusmelhor3@outlook.com',
  phone: '(46) 98800-9754',
  github: 'https://github.com/Diasz1m',
  githubUser: 'Diasz1m',
  linkedin: 'https://linkedin.com/in/matheus-dias-5691bb195',
  resume:
    'https://docs.google.com/document/d/1h2T_l35hJmTcfhgC7kk4Io6U-GO7WQm8UpXtudkZiTE/edit?usp=sharing',
  avatar: 'https://imgur.com/muMv9e9.jpg',
  title: {
    pt: 'Desenvolvedor Full Stack',
    en: 'Full Stack Developer',
  } satisfies Localized<string>,
  location: {
    pt: 'Pato Branco, Paraná',
    en: 'Pato Branco, Brazil',
  } satisfies Localized<string>,
  headline: {
    pt: 'Construo sistemas web corporativos — do backend em Java e PHP até o frontend em React e Angular.',
    en: 'I build enterprise web systems — from Java and PHP on the backend to React and Angular on the frontend.',
  } satisfies Localized<string>,
  about: {
    pt: [
      'Sou desenvolvedor full stack com experiência em aplicações web corporativas, sistemas de gestão e integrações de backend. Até maio de 2026 atuei como pleno na VIASOFT, em Pato Branco, com Java Spring Boot e React em produtos SaaS.',
      'Antes disso foram dois anos e meio num sistema de gestão para imobiliárias em PHP e MySQL, e times entregando aplicações em Java, Angular e Flutter. Gosto de código claro, contratos bem definidos e de fechar o ciclo: modelar, implementar, integrar e colocar em produção.',
      'Formação em andamento em Análise e Desenvolvimento de Sistemas na UTFPR. Aberto a conversas sobre produtos, backend sólido e frontends que realmente funcionam.',
    ],
    en: [
      "I'm a full stack developer with experience in enterprise web applications, management systems and backend integrations. Until May 2026 I worked as a mid-level developer at VIASOFT, in Pato Branco, with Java Spring Boot and React on SaaS products.",
      'Before that came two and a half years on a management system for real estate agencies in PHP and MySQL, plus teams shipping applications in Java, Angular and Flutter. I like clear code, well-defined contracts and closing the loop: model, implement, integrate and ship to production.',
      'Currently studying Systems Analysis and Development at UTFPR. Open to conversations about products, solid backends and frontends that actually work.',
    ],
  } satisfies Localized<string[]>,
}

export const skills: Array<{ group: Localized<string>; items: string[] }> = [
  {
    group: { pt: 'Backend', en: 'Backend' },
    items: ['Java', 'Spring Boot', 'PHP', 'Python', 'FastAPI', 'Node.js'],
  },
  {
    group: { pt: 'Frontend', en: 'Frontend' },
    items: ['React', 'TypeScript', 'Angular', 'Vue 3', 'Flutter'],
  },
  {
    group: { pt: 'Dados', en: 'Data' },
    items: ['MySQL', 'PostgreSQL', 'Redis'],
  },
  {
    group: { pt: 'DevOps e prática', en: 'DevOps & practice' },
    items: ['Linux', 'Docker', 'Git', 'APIs REST', 'Microsserviços', 'SaaS'],
  },
]

export const experience: Array<{
  role: Localized<string>
  company: string
  period: Localized<string>
  place: string
  points: Localized<string[]>
}> = [
  {
    role: { pt: 'Desenvolvedor Full Stack Pleno', en: 'Mid-level Full Stack Developer' },
    company: 'VIASOFT',
    period: { pt: 'Jul 2025 — Mai 2026', en: 'Jul 2025 — May 2026' },
    place: 'Pato Branco, PR',
    points: {
      pt: [
        'Soluções web com Java Spring Boot e React em sistemas SaaS corporativos.',
        'Integração entre microsserviços e APIs externas em ambiente de alta demanda.',
        'Trabalho em times multidisciplinares com foco em qualidade e boas práticas.',
      ],
      en: [
        'Web solutions with Java Spring Boot and React on enterprise SaaS systems.',
        'Integration between microservices and third-party APIs in a high-demand environment.',
        'Work in cross-functional teams focused on quality and engineering best practices.',
      ],
    },
  },
  {
    role: { pt: 'Desenvolvedor', en: 'Developer' },
    company: 'Widesys',
    period: { pt: 'Nov 2022 — Jun 2025', en: 'Nov 2022 — Jun 2025' },
    place: 'Pato Branco, PR',
    points: {
      pt: [
        'Sistema de gestão para imobiliárias com PHP e MySQL.',
        'Modelagem de dados, consultas SQL e relatórios do sistema.',
        'Manutenção e evolução de módulos já em produção.',
      ],
      en: [
        'Management system for real estate agencies with PHP and MySQL.',
        "Data modeling, SQL queries and the system's reports.",
        'Maintenance and evolution of modules already running in production.',
      ],
    },
  },
  {
    role: { pt: 'Desenvolvedor', en: 'Developer' },
    company: 'IDS',
    period: { pt: 'Set 2021 — Fev 2022', en: 'Sep 2021 — Feb 2022' },
    place: 'Pato Branco, PR',
    points: {
      pt: [
        'Aplicações para previdência social e educação.',
        'Backend Java Spring Boot e frontend Angular.',
        'Participação do levantamento de requisitos até a entrega.',
      ],
      en: [
        'Applications for the social security and education sectors.',
        'Java Spring Boot backend and Angular frontend.',
        'Involvement from requirements gathering through delivery.',
      ],
    },
  },
  {
    role: { pt: 'Desenvolvedor Júnior', en: 'Junior Developer' },
    company: 'Gew',
    period: { pt: 'Jul 2020 — Set 2021', en: 'Jul 2020 — Sep 2021' },
    place: 'Pato Branco, PR',
    points: {
      pt: [
        'Soluções web para postos de combustíveis com AngularJS e PHP.',
        'Aplicativos mobile com Flutter/Dart.',
        'Manutenção e evolução de sistemas legados.',
      ],
      en: [
        'Web solutions for the fuel station industry with AngularJS and PHP.',
        'Mobile apps with Flutter/Dart.',
        'Maintenance and evolution of legacy systems.',
      ],
    },
  },
]

export const featuredProjects: Array<{
  name: Localized<string>
  description: Localized<string>
  stack: string[]
  url: string
  demo?: string
}> = [
  {
    name: { pt: 'Analista B3', en: 'B3 Analyst' },
    description: {
      pt: 'Pipeline em Python que raspa os indicadores fundamentalistas do Fundamentus (Playwright), cruza com o histórico do Yahoo Finance e exporta JSON para um dashboard em Vue 3 com ECharts. A demo aqui roda os 250 papéis e os filtros no navegador.',
      en: 'A Python pipeline that scrapes fundamental indicators from Fundamentus (Playwright), joins them with Yahoo Finance history and exports JSON for a Vue 3 dashboard with ECharts. The demo here runs all 250 tickers and the filters in the browser.',
    },
    stack: ['Python', 'Playwright', 'FastAPI', 'Vue 3', 'ECharts'],
    url: 'https://github.com/Diasz1m/market-v1',
    demo: '#demo-market',
  },
  {
    name: { pt: 'Bancada', en: 'Bancada' },
    description: {
      pt: 'Helpdesk interno em Vue 3 (Composition API, Router, Pinia) com o mesmo contrato de API em PHP 8 e Node/TypeScript. Auth Bearer, papéis, assistente de triagem e validação 422.',
      en: 'Internal helpdesk in Vue 3 (Composition API, Router, Pinia) with the same API contract implemented in PHP 8 and Node/TypeScript. Bearer auth, roles, a triage assistant and 422 validation.',
    },
    stack: ['Vue 3', 'PHP', 'Node', 'TypeScript', 'Docker'],
    url: 'https://github.com/Diasz1m/bancada',
    demo: '#demo-bancada',
  },
  {
    name: { pt: 'Flappy Bird', en: 'Flappy Bird' },
    description: {
      pt: 'Clone do Flappy Bird em C++17 com raylib. Física, canos e HUD desenhados no código, sem sprites. A demo nesta página usa a mesma regra de jogo no canvas.',
      en: 'A Flappy Bird clone in C++17 with raylib. Physics, pipes and HUD drawn in code, no sprites. The demo on this page runs the same game rules on a canvas.',
    },
    stack: ['C++', 'raylib', 'CMake'],
    url: 'https://github.com/Diasz1m/flapy-bird',
    demo: '#demo-flappy',
  },
  {
    name: { pt: 'Conversor de moedas', en: 'Currency converter' },
    description: {
      pt: 'Serviço de cotação em TypeScript com Express, gRPC e consumo de API externa. A demo ao vivo nesta página usa a mesma ideia: converter valores entre moedas em tempo real.',
      en: 'A quotation service in TypeScript with Express, gRPC and a third-party API. The live demo on this page follows the same idea: converting values between currencies in real time.',
    },
    stack: ['TypeScript', 'Express', 'gRPC'],
    url: 'https://github.com/Diasz1m/currency_quotation',
    demo: '#demo-moedas',
  },
  {
    name: { pt: 'Transferência por sockets', en: 'Socket file transfer' },
    description: {
      pt: 'Implementação de transferência de arquivos usando sockets em Java — exercício de rede, concorrência e protocolo próprio. A demo simula o handshake, os chunks de 4096 bytes e o ACK do servidor.',
      en: 'File transfer over raw sockets in Java — an exercise in networking, concurrency and a hand-rolled protocol. The demo simulates the handshake, the 4096-byte chunks and the server ACK.',
    },
    stack: ['Java', 'Sockets'],
    url: 'https://github.com/Diasz1m/proj_arquivos_sockets',
    demo: '#demo-sockets',
  },
  {
    name: { pt: 'Helius', en: 'Helius' },
    description: {
      pt: 'Frontend Angular de um sistema de cadastros e gestão. Complementa a linha de painéis e sistemas de gestão que venho construindo no dia a dia.',
      en: 'The Angular frontend of a records and management system. It rounds out the line of dashboards and management systems I build day to day.',
    },
    stack: ['Angular', 'TypeScript', 'SCSS'],
    url: 'https://github.com/Diasz1m/helius-front',
  },
  {
    name: { pt: 'Calculadora JS', en: 'JS calculator' },
    description: {
      pt: 'Uma das primeiras aplicações web: calculadora em HTML, CSS e JavaScript puro.',
      en: 'One of my first web applications: a calculator in plain HTML, CSS and JavaScript.',
    },
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
