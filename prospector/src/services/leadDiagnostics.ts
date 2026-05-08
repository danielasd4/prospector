import { Lead, DiagnosticoLead } from '../types'

export function generateDiagnostico(lead: Partial<Lead>): DiagnosticoLead {
  const tem_whatsapp = !!(lead.telefone && lead.telefone.length >= 10)
  const tem_instagram = !!(lead.instagram && lead.instagram.length > 2)
  const tem_site = !!(lead.site && lead.site.length > 4)
  const tem_endereco = !!(lead.endereco && lead.endereco.length > 3)
  const telefone_valido = !!(lead.telefone && lead.telefone.replace(/\D/g, '').length >= 10)
  const possui_presenca_minima = tem_whatsapp || tem_instagram || tem_site

  const observacoes: string[] = []
  if (!tem_site) observacoes.push('Sem site detectado')
  else observacoes.push('Possui site')
  if (!tem_instagram) observacoes.push('Instagram não encontrado')
  else observacoes.push('Instagram disponível')
  if (telefone_valido) observacoes.push('Telefone disponível para contato')
  else observacoes.push('Telefone não identificado')
  if (!tem_site && !tem_instagram) observacoes.push('Presença digital muito baixa — alta oportunidade')
  else if (!tem_site) observacoes.push('Alta oportunidade para abordagem')
  else observacoes.push('Presença digital básica identificada')

  return {
    tem_whatsapp,
    tem_instagram,
    tem_site,
    tem_endereco,
    telefone_valido,
    possui_presenca_minima,
    observacoes,
  }
}
