import { Lead, LeadScoreLevel } from '../types'

export function calculateLeadScore(lead: Partial<Lead>): { score: number; nivel: LeadScoreLevel } {
  let score = 0

  if (!lead.site) score += 3
  if (lead.instagram) score += 1
  if (lead.telefone) score += 1
  if (!lead.instagram) score += 1
  if (!lead.site && lead.telefone) score += 2
  if (!lead.site && !lead.instagram) score += 2

  score = Math.min(10, Math.max(0, score))

  let nivel: LeadScoreLevel
  if (score <= 3) nivel = 'baixo'
  else if (score <= 6) nivel = 'medio'
  else nivel = 'alto'

  return { score, nivel }
}
