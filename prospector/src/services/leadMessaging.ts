import { Lead, MessageTemplate } from '../types'

const DEFAULT_TEMPLATES: Record<string, string> = {
  'Oficina mecânica': 'Fala, tudo certo?\n\nVi que vocês aparecem bem no Google.\n\nMas provavelmente estão perdendo cliente por não ter uma página simples direcionando direto pro WhatsApp.\n\nSe fizer sentido, posso te mostrar uma ideia pro seu negócio, sem compromisso.',
  'Clínica estética': 'Oi, tudo bem?\n\nVi seu negócio e vocês já transmitem autoridade.\n\nMas dá para melhorar bastante a conversão com um caminho mais direto para o WhatsApp.\n\nSe quiser, posso te mostrar uma ideia aplicada ao seu caso.',
  'Restaurante': 'Fala, tudo certo?\n\nVi seu negócio no Google e vocês têm potencial.\n\nMas provavelmente estão perdendo contatos por não ter um acesso mais direto e simples pro WhatsApp.\n\nSe quiser, posso te mostrar uma ideia rápida aplicada ao seu restaurante.',
  'Dentista': 'Oi, tudo bem?\n\nVi sua clínica no Google.\n\nHoje muitos pacientes acabam não entrando em contato por falta de um direcionamento direto.\n\nSe quiser, posso te mostrar uma estrutura simples que resolve isso.',
  'Genérico': 'Fala, tudo certo?\n\nVi seu negócio no Google e você já aparece bem.\n\nMas pode estar perdendo cliente por não ter um caminho direto pro WhatsApp.\n\nSe quiser, posso te mostrar como ficaria uma estrutura simples pro seu negócio.',
}

export const FOLLOWUP_1 =
  'Fala, passando aqui rapidinho.\n\nCheguei a montar uma ideia simples pro seu negócio. Se quiser, posso te enviar.'
export const FOLLOWUP_2 =
  'Oi, tudo bem?\n\nSe ainda fizer sentido melhorar a captação pelo WhatsApp, me chama que te mostro uma solução bem direta.'

function replacePlaceholders(text: string, lead: Partial<Lead>): string {
  return text
    .replace(/\{\{nome\}\}/g, lead.nome || 'você')
    .replace(/\{\{cidade\}\}/g, lead.cidade || 'sua cidade')
    .replace(/\{\{segmento\}\}/g, lead.segmento || 'seu negócio')
}

export function generateMessage(lead: Partial<Lead>, templates: MessageTemplate[] = []): string {
  // Check user templates first
  const userTemplate = templates.find(t => t.segmento === lead.segmento)
  if (userTemplate) return replacePlaceholders(userTemplate.conteudo, lead)

  // Fall back to defaults
  const defaultTemplate = lead.segmento ? DEFAULT_TEMPLATES[lead.segmento] : null
  const template = defaultTemplate || DEFAULT_TEMPLATES['Genérico']
  return replacePlaceholders(template, lead)
}

export function getDefaultTemplates() {
  return Object.entries(DEFAULT_TEMPLATES).map(([segmento, conteudo]) => ({
    segmento,
    conteudo,
    titulo: segmento,
  }))
}
