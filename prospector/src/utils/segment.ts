const SEGMENT_RULES: { keywords: string[]; segmento: string }[] = [
  { keywords: ['mecânica', 'mecânico', 'auto center', 'autocenter', 'oficina', 'funilaria', 'borracharia', 'pneus'], segmento: 'Oficina mecânica' },
  { keywords: ['estética', 'harmonização', 'botox', 'limpeza de pele', 'micropigmentação', 'sobrancelha', 'depilação', 'spa'], segmento: 'Clínica estética' },
  { keywords: ['restaurante', 'hamburgueria', 'pizzaria', 'lanchonete', 'churrascaria', 'café', 'bistrô', 'bar e', 'food'], segmento: 'Restaurante' },
  { keywords: ['dentista', 'odontologia', 'odontológica', 'ortodontia', 'dental', 'clínica odonto'], segmento: 'Dentista' },
  { keywords: ['academia', 'crossfit', 'fitness', 'musculação', 'pilates', 'personal'], segmento: 'Academia' },
  { keywords: ['imobiliária', 'imóveis', 'imóvel', 'corretor', 'corretora', 'aluguel', 'loteamento'], segmento: 'Imobiliária' },
  { keywords: ['advogado', 'advocacia', 'jurídico', 'escritório de advocacia', 'advogada'], segmento: 'Advogado' },
  { keywords: ['loja', 'acessórios', 'moda', 'roupas', 'calçados', 'boutique', 'varejo'], segmento: 'Loja' },
]

export function inferSegment(nome: string, categoria: string): string {
  const text = `${nome} ${categoria}`.toLowerCase()

  for (const rule of SEGMENT_RULES) {
    if (rule.keywords.some(kw => text.includes(kw))) {
      return rule.segmento
    }
  }

  return 'Outro'
}

export const SEGMENTOS = [
  'Oficina mecânica',
  'Clínica estética',
  'Restaurante',
  'Dentista',
  'Academia',
  'Imobiliária',
  'Advogado',
  'Loja',
  'Outro',
]
