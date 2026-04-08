/**
 * Utilitários para integração com WhatsApp
 */

/**
 * Formata a mensagem substituindo variáveis dinâmicas
 */
export function formatMessage(template, lead) {
  return template
    .replace(/\{nome\}/gi, lead.nome || '')
    .replace(/\{segmento\}/gi, lead.segmento || '')
    .replace(/\{cidade\}/gi, lead.cidade || '')
    .trim()
}

/**
 * Limpa o número de telefone para uso na URL do WhatsApp
 */
export function cleanPhone(phone) {
  if (!phone) return null
  // Remove tudo que não for número
  let cleaned = phone.replace(/\D/g, '')
  // Se não tem código do país, adiciona 55 (Brasil)
  if (cleaned.length === 10 || cleaned.length === 11) {
    cleaned = '55' + cleaned
  }
  return cleaned
}

/**
 * Gera a URL do WhatsApp Web com mensagem pré-preenchida
 */
export function buildWhatsAppUrl(phone, message) {
  const cleanedPhone = cleanPhone(phone)
  const encodedMsg = encodeURIComponent(message)

  if (cleanedPhone) {
    return `https://wa.me/${cleanedPhone}?text=${encodedMsg}`
  }
  // Se não tem telefone, abre apenas com a mensagem (usuário seleciona o contato)
  return `https://web.whatsapp.com/`
}

/**
 * Abre o WhatsApp e retorna true para que o caller possa atualizar o status
 */
export function openWhatsApp(lead, messageTemplate) {
  const message = formatMessage(messageTemplate, lead)
  const url = buildWhatsAppUrl(lead.telefone, message)
  window.open(url, '_blank', 'noopener,noreferrer')
  return true
}

export const DEFAULT_MESSAGE =
  'Olá, {nome}! 👋 Vi o seu negócio no Google Maps e fiquei interessado em apresentar uma solução que pode ajudar muito o crescimento da {nome}. Podemos conversar 5 minutinhos?'
