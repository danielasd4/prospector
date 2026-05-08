export function formatDate(dateString?: string): string {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export function daysSince(dateString?: string): number {
  if (!dateString) return 0
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function isEligibleForFollowup(
  lead: { status: string; data_ultimo_contato?: string; followup_1_enviado: boolean; followup_2_enviado: boolean },
  days: number
): { followup1: boolean; followup2: boolean } {
  if (lead.status !== 'contatado') return { followup1: false, followup2: false }
  const days_since = daysSince(lead.data_ultimo_contato)
  return {
    followup1: !lead.followup_1_enviado && days_since >= days,
    followup2: lead.followup_1_enviado && !lead.followup_2_enviado && days_since >= days * 2,
  }
}
