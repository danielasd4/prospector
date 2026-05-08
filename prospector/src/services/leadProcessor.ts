import { Lead, LeadStatus } from '../types'
import { extractFromGoogleLink } from './leadExtractor'
import { calculateLeadScore } from './leadScoring'
import { generateDiagnostico } from './leadDiagnostics'
import { generateMessage } from './leadMessaging'
import { buildWhatsAppLink } from '../utils/whatsapp'
import { inferSegment } from '../utils/segment'
import { supabase } from '../lib/supabase'

export async function processLeadFromGoogleLink(
  googleLink: string,
  userId: string,
  templates: any[] = []
): Promise<Lead> {
  // 1. Extract data from link
  const extracted = await extractFromGoogleLink(googleLink)

  // 2. Infer segment
  const segmento = inferSegment(extracted.nome || '', extracted.categoria || '')

  // 3. Build partial lead
  const partial: Partial<Lead> = {
    ...extracted,
    nome: extracted.nome || 'Lead sem nome',
    segmento,
    google_link: googleLink,
    status: 'novo' as LeadStatus,
  }

  // 4. Generate diagnostico
  const diagnostico = generateDiagnostico(partial)

  // 5. Calculate score
  const { score, nivel } = calculateLeadScore(partial)

  // 6. Generate message
  const mensagem_gerada = generateMessage(partial, templates)

  // 7. Generate WhatsApp link
  const whatsapp_link = partial.telefone ? buildWhatsAppLink(partial.telefone, mensagem_gerada) : undefined

  // 8. Build full lead object
  const leadData = {
    ...partial,
    diagnostico,
    score,
    score_nivel: nivel,
    mensagem_gerada,
    whatsapp_link,
    user_id: userId,
  }

  // 9. Save to Supabase
  const { data, error } = await supabase
    .from('leads')
    .insert([leadData])
    .select()
    .single()

  if (error) throw error
  return data as Lead
}
