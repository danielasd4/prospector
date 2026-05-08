export const companiesData = [
  {
    id: 'studio-vency',
    name: 'Studio Vency',
    type: 'Prestação de Serviço',
    revenue: 7000,
    profit: 5200,
    hours: 40,
    hourValue: 175,
    predictability: 'Alta',
    status: 'Ativa' as const,
    dependence: 'Alta' as const,
    recurrence: 'Recorrente mensal',
    observation: 'Sua principal operação ativa de serviço atualmente.',
    margin: 74,
    predictableRevenue: 5000,
    variableRevenue: 2000,
    indicators: {
      predictability: 85,
      scalability: 30,
      dependence: 80,
      stability: 90,
      growth: 60
    },
    products: [
      { name: 'Landing Pages', revenue: 3500, hours: 15, hourValue: 233, margin: 80 },
      { name: 'Branding', revenue: 2000, hours: 15, hourValue: 133, margin: 70 },
      { name: 'Motion Design', revenue: 1500, hours: 10, hourValue: 150, margin: 70 }
    ],
    costs: [
      { name: 'Figma', value: 75 },
      { name: 'Domínios / Vercel', value: 50 },
      { name: 'Freelancers', value: 1675 }
    ],
    insights: [
      "Landing Pages possuem a melhor relação tempo x lucro.",
      "Reduzir a dependência operacional deve ser o próximo foco.",
      "Margem super saudável, acima de 70%."
    ]
  },
  {
    id: 'marketeria',
    name: 'Marketeria',
    type: 'CLT',
    revenue: 4000,
    profit: 4000,
    hours: 160,
    hourValue: 25,
    predictability: 'Garantida',
    status: 'Ativa' as const,
    dependence: 'Média' as const,
    recurrence: 'Recorrente',
    observation: 'Garante estabilidade, mas possui menor valor/hora.',
    margin: 100,
    predictableRevenue: 4000,
    variableRevenue: 0,
    indicators: {
      predictability: 100,
      scalability: 0,
      dependence: 100,
      stability: 100,
      growth: 10
    },
    products: [
      { name: 'Contrato CLT', revenue: 4000, hours: 160, hourValue: 25, margin: 100 }
    ],
    costs: [],
    insights: [
      "Garante estabilidade financeira total.",
      "Porém, consome muito tempo por um valor/hora baixo.",
      "Estratégia: manter até os outros negócios atingirem estabilidade semelhante."
    ]
  },
  {
    id: 'pro-creator',
    name: 'Pro Creator',
    type: 'SaaS / Produto Digital',
    revenue: 2000,
    profit: 1800,
    hours: 10,
    hourValue: 200,
    predictability: 'Baixa',
    status: 'Estruturação' as const,
    dependence: 'Média' as const,
    recurrence: 'Em construção',
    observation: 'Potencial escalável, mas ainda sem recorrência consolidada.',
    margin: 90,
    predictableRevenue: 0,
    variableRevenue: 2000,
    indicators: {
      predictability: 20,
      scalability: 95,
      dependence: 30,
      stability: 20,
      growth: 85
    },
    products: [
      { name: 'Assinatura', revenue: 500, hours: 2, hourValue: 250, margin: 95 },
      { name: 'Venda Única', revenue: 1500, hours: 8, hourValue: 187, margin: 85 }
    ],
    costs: [
      { name: 'Servidores', value: 150 },
      { name: 'Ferramentas de IA', value: 50 }
    ],
    insights: [
      "Possui o maior potencial escalável entre todas as empresas.",
      "A meta agora é transformar a receita variável em previsível (MRR)."
    ]
  },
  {
    id: 'setzfilme',
    name: 'SetzFilme',
    type: 'Projetos / Eventos',
    revenue: 0,
    profit: 0,
    hours: 0,
    hourValue: 0,
    predictability: 'Nula (Sazonal)',
    status: 'Parada' as const,
    dependence: 'Muito alta' as const,
    behavior: 'Receita por projeto',
    recurrence: 'Não recorrente',
    observation: 'Pode faturar alto em meses com eventos, mas não deve ser considerada receita fixa.',
    margin: 60,
    predictableRevenue: 0,
    variableRevenue: 0,
    indicators: {
      predictability: 10,
      scalability: 20,
      dependence: 95,
      stability: 15,
      growth: 40
    },
    products: [
      { name: 'Filme de Casamento', revenue: 0, hours: 0, hourValue: 0, margin: 60 },
      { name: 'Sessão de Fotos', revenue: 0, hours: 0, hourValue: 0, margin: 80 }
    ],
    costs: [
      { name: 'Manutenção de Equipamento', value: 0 }
    ],
    insights: [
      "Ticket alto, porém baixíssima previsibilidade.",
      "Operação com alta dependência física e logística."
    ]
  },
  {
    id: 'pf-daniel',
    name: 'PF Daniel',
    type: 'Financeiro Pessoal',
    revenue: 0,
    profit: -3500,
    hours: 0,
    hourValue: 0,
    predictability: 'Fixa',
    status: 'Ativa' as const,
    dependence: 'Pessoal' as const,
    margin: 0,
    predictableRevenue: 0,
    variableRevenue: 0,
    indicators: {
      predictability: 90,
      scalability: 0,
      dependence: 100,
      stability: 80,
      growth: 0
    },
    products: [],
    costs: [
      { name: 'Moradia', value: 1500 },
      { name: 'Alimentação', value: 1000 },
      { name: 'Transporte', value: 500 },
      { name: 'Lazer', value: 500 }
    ],
    insights: [
      "Custo de vida controlado dentro das metas.",
      "Suficiente para ser coberto apenas pela Marketeria no cenário atual."
    ]
  }
];

export const strategicSummary = [
  "Sua receita previsível atual é composta principalmente por Studio Vency e Marketeria.",
  "SetzFilme possui alto potencial de faturamento por projeto, mas baixa previsibilidade mensal.",
  "Pro Creator ainda está em fase de estruturação e não deve ser considerado receita fixa.",
  "Studio Vency segue como principal operação ativa de serviço.",
  "Seu foco recomendado é proteger a receita recorrente e aumentar o valor/hora dos serviços."
];
