import React from 'react'
import { LeadStatus } from '../types'

const STATUS_CONFIG: Record<LeadStatus, { label: string; className: string }> = {
  novo:            { label: 'Novo',           className: 'bg-brand-500/20 text-brand-400 border border-brand-500/30' },
  contatado:       { label: 'Contatado',      className: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
  respondeu:       { label: 'Respondeu',      className: 'bg-green-500/20 text-green-400 border border-green-500/30' },
  sem_resposta:    { label: 'Sem resposta',   className: 'bg-zinc-700/50 text-zinc-400 border border-zinc-600/30' },
  fechado:         { label: 'Fechado',        className: 'bg-purple-500/20 text-purple-400 border border-purple-500/30' },
  nao_interessado: { label: 'Não interessado',className: 'bg-red-500/20 text-red-400 border border-red-500/30' },
}

export function StatusBadge({ status }: { status: LeadStatus }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.novo
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  )
}
