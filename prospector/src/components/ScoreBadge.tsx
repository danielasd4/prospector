import React from 'react'
import { LeadScoreLevel } from '../types'

const LEVEL_CONFIG: Record<LeadScoreLevel, { className: string }> = {
  baixo: { className: 'bg-gray-100 text-gray-500' },
  medio: { className: 'bg-orange-100 text-orange-600' },
  alto: { className: 'bg-green-100 text-green-700' },
}

export function ScoreBadge({ score, nivel }: { score: number; nivel?: LeadScoreLevel }) {
  const n = nivel || 'baixo'
  const config = LEVEL_CONFIG[n]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${config.className}`}>
      {score}/10
    </span>
  )
}
