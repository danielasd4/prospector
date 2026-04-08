import React from 'react'
import { LeadStatus } from '../types'

const STATUS_CONFIG: Record<LeadStatus, { label: string; className: string }> = {
  novo: { label: 'Novo', className: 'bg-blue-100 text-blue-700' },
  contatado: { label: 'Contatado', className: 'bg-yellow-100 text-yellow-700' },
  respondeu: { label: 'Respondeu', className: 'bg-green-100 text-green-700' },
  sem_resposta: { label: 'Sem resposta', className: 'bg-gray-100 text-gray-600' },
  fechado: { label: 'Fechado', className: 'bg-purple-100 text-purple-700' },
  nao_interessado: { label: 'Não interessado', className: 'bg-red-100 text-red-600' },
}

export function StatusBadge({ status }: { status: LeadStatus }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.novo
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
