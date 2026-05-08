export type LeadStatus = 'novo' | 'contatado' | 'respondeu' | 'sem_resposta' | 'fechado' | 'nao_interessado'
export type LeadScoreLevel = 'baixo' | 'medio' | 'alto'

export interface DiagnosticoLead {
  tem_whatsapp: boolean
  tem_instagram: boolean
  tem_site: boolean
  tem_endereco: boolean
  telefone_valido: boolean
  possui_presenca_minima: boolean
  observacoes: string[]
}

export interface Lead {
  id: string
  nome: string
  categoria?: string
  segmento?: string
  subsegmento?: string
  cidade?: string
  telefone?: string
  whatsapp_link?: string
  instagram?: string
  site?: string
  endereco?: string
  google_link: string
  status: LeadStatus
  score: number
  score_nivel?: LeadScoreLevel
  diagnostico?: DiagnosticoLead
  mensagem_gerada?: string
  mensagem_enviada: boolean
  followup_1_enviado: boolean
  followup_2_enviado: boolean
  data_primeiro_contato?: string
  data_ultimo_contato?: string
  observacoes?: string
  user_id?: string
  created_at: string
  updated_at: string
}

export interface InteractionLog {
  id: string
  lead_id: string
  tipo: string
  descricao: string
  created_at: string
}

export interface MessageTemplate {
  id: string
  segmento: string
  titulo: string
  conteudo: string
  user_id?: string
  created_at: string
  updated_at: string
}

export interface AppSettings {
  id: string
  followup_1_days: number
  followup_2_days: number
  default_country_code: string
  generic_template: string
  enable_score: boolean
  enable_diagnostico: boolean
  user_id?: string
}
