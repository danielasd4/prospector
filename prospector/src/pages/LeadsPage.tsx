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

const selectClass = "bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-500 transition-colors"

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

  function openEdit(lead: Lead) { setEditLead(lead); setModalOpen(true) }
  function openNew() { setEditLead(null); setModalOpen(true) }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 min-w-48 flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 focus-within:border-brand-500 transition-colors">
          <Search className="w-4 h-4 text-zinc-600 shrink-0" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome..."
            className="flex-1 text-sm outline-none bg-transparent text-zinc-200 placeholder-zinc-600"
          />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)} className={selectClass}>
          {STATUS_FILTER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={segmento} onChange={e => setSegmento(e.target.value)} className={selectClass}>
          <option value="todos">Todos os segmentos</option>
          {SEGMENTOS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Add lead — destaque */}
      <div className="relative overflow-hidden bg-zinc-900 border border-brand-500/20 rounded-2xl p-5">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent pointer-events-none" />
        <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-3">+ Adicionar lead</p>
        <LeadInputBar onManualAdd={openNew} />
      </div>

      {!isLoading && (
        <p className="text-xs text-zinc-600">{leads.length} lead{leads.length !== 1 ? 's' : ''}</p>
      )}

      {isLoading ? (
        <LoadingState />
      ) : leads.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum lead encontrado" description="Cole um link do Google Maps acima ou envie um print para adicionar um lead." />
      ) : (
        <div className="grid gap-3">
          {leads.map((lead: Lead) => (
            <LeadCard key={lead.id} lead={lead} onEdit={() => openEdit(lead)} />
          ))}
        </div>
      )}

      {modalOpen && (
        <LeadModal lead={editLead} onClose={() => { setModalOpen(false); setEditLead(null) }} />
      )}
    </div>
  )
}
