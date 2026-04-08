import React from 'react'
import { LeadScoreLevel } from '../types'

const LEVEL_CONFIG: Record<LeadScoreLevel, { className: string }> = {
  baixo:  { className: 'bg-zinc-700/50 text-zinc-400 border border-zinc-600/30' },
  medio:  { className: 'bg-orange-500/20 text-orange-400 border border-orange-500/30' },
  alto:   { className: 'bg-green-500/20 text-green-400 border border-green-500/30' },
}

export function ScoreBadge({ score, nivel }: { score: number; nivel?: LeadScoreLevel }) {
  const n = nivel || 'baixo'
  const config = LEVEL_CONFIG[n]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${config.className}`}>
      {score}/10
    </span>
  )
}
