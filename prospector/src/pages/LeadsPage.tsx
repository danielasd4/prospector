import React, { useState } from 'react'
import { useLeads } from '../hooks/useLeads'
import { LeadCard } from '../components/LeadCard'
import { LeadInputBar } from '../components/LeadInputBar'
import { LeadModal } from '../components/LeadModal'
import { LoadingState } from '../components/LoadingState'
import { EmptyState } from '../components/EmptyState'
import { Search, Users } from 'lucide-react'
import { SEGMENTOS } from '../utils/segment'
import { Lead } from '../types'

const STATUS_FILTER_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'novo', label: 'Novo' },
  { value: 'contatado', label: 'Contatado' },
  { value: 'respondeu', label: 'Respondeu' },
  { value: 'sem_resposta', label: 'Sem resposta' },
  { value: 'fechado', label: 'Fechado' },
  { value: 'nao_interessado', label: 'Não interessado' },
]

export default function LeadsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editLead, setEditLead] = useState<Lead | null>(null)
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState('todos')
  const [segmento, setSegmento] = useState('todos')

  const { data: leads = [], isLoading } = useLeads({
    busca: busca || undefined,
    status: status !== 'todos' ? status : undefined,
    segmento: segmento !== 'todos' ? segmento : undefined,
  })

  function openEdit(lead: Lead) {
    setEditLead(lead)
    setModalOpen(true)
  }

  function openNew() {
    setEditLead(null)
    setModalOpen(true)
  }

  return (
    <div className="space-y-4">
      <LeadInputBar onManualAdd={openNew} />

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 min-w-48 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome..."
            className="flex-1 text-sm outline-none bg-transparent"
          />
        </div>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm shadow-sm outline-none"
        >
          {STATUS_FILTER_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={segmento}
          onChange={e => setSegmento(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm shadow-sm outline-none"
        >
          <option value="todos">Todos os segmentos</option>
          {SEGMENTOS.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Count */}
      {!isLoading && (
        <p className="text-xs text-gray-400">
          {leads.length} lead{leads.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* List */}
      {isLoading ? (
        <LoadingState />
      ) : leads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum lead encontrado"
          description="Cole um link do Google Maps acima para adicionar seu primeiro lead."
        />
      ) : (
        <div className="grid gap-3">
          {leads.map((lead: Lead) => (
            <LeadCard key={lead.id} lead={lead} onEdit={() => openEdit(lead)} />
          ))}
        </div>
      )}

      {modalOpen && (
        <LeadModal
          lead={editLead}
          onClose={() => {
            setModalOpen(false)
            setEditLead(null)
          }}
        />
      )}
    </div>
  )
}
