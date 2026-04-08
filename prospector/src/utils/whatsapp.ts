export function buildWhatsAppLink(telefone: string, mensagem?: string): string {
  const numero = telefone.replace(/\D/g, '')
  const numWithCountry = numero.startsWith('55') ? numero : `55${numero}`
  const base = `https://wa.me/${numWithCountry}`
  if (mensagem) {
    return `${base}?text=${encodeURIComponent(mensagem)}`
  }
  return base
}

export function openWhatsApp(url: string) {
  window.open(url, '_blank')
}
