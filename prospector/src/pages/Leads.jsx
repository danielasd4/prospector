import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, RefreshCw, Loader2, MapPin, Phone, Instagram, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLeads } from '../hooks/useLeads'
import { createLead, updateLead, deleteLead } from '../lib/supabase'
import { getConfig } from '../lib/supabase'
import { DEFAULT_MESSAGE } from '../lib/whatsapp'
import StatusBadge, { STATUS_CONFIG } from '../components/StatusBadge'
import QuickActions from '../components/QuickActions'
import LeadModal from '../components/LeadModal'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const SEGMENTOS = [
  'Oficina mecânica','Clínica estética','Restaurante','Dentista','Loja',
  'Imobiliária','Advogado','Salão de beleza','Farmácia','Academia',
  'Escola','Clínica médica','Pet shop','Padaria','Supermercado',
  'Hotel','Pousada','Bar','Cafeteria','Contabilidade','Outro',
]

export default function Leads() {
  const [filters, setFilters] = useState({ status: 'todos', segmento: 'todos', busca: '' })
  const [debouncedBusca, setDebouncedBusca] = useState('')
  const [editingLead, setEditingLead] = useState(null)
  const [messageTemplate, setMessageTemplate] = useState(DEFAULT_MESSAGE)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedBusca(filters.busca), 300)
    return () => clearTimeout(t)
  }, [filters.busca])

  const activeFilters = { ...filters, busca: debouncedBusca }
  const { leads, loading, error, refresh, update, remove } = useLeads(activeFilters)

  useEffect(() => {
    getConfig('mensagem_whatsapp').then((v) => { if (v) setMessageTemplate(v) })
  }, [])

  const handleUpdate = async (id, updates) => {
    try {
      await update(id, updates)
    } catch (err) {
      toast.error('Erro ao atualizar lead')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Excluir este lead? Esta ação não pode ser desfeita.')) return
    try {
      await remove(id)
      toast.success('Lead excluído')
    } catch {
      toast.error('Erro ao excluir lead')
    }
  }

  const handleSaveEdit = async (form) => {
    try {
      await updateLead(form.id, form)
      await refresh()
      toast.success('Lead atualizado!')
    } catch {
      toast.error('Erro ao salvar')
    }
  }

  const setFilter = (k, v) => setFilters((f) => ({ ...f, [k]: v }))

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Leads</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {loading ? '...' : `${leads.length} resultado${leads.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button onClick={refresh} className="btn-ghost" disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            className="input-base pl-8"
            placeholder="Buscar por nome..."
            value={filters.busca}
            onChange={(e) => setFilter('busca', e.target.value)}
          />
        </div>

        {/* Status filter */}
        <select
          className="input-base w-auto"
          value={filters.status}
          onChange={(e) => setFilter('status', e.target.value)}
        >
          <option value="todos">Todos os status</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>

        {/* Segmento filter */}
        <select
          className="input-base w-auto"
          value={filters.segmento}
          onChange={(e) => setFilter('segmento', e.target.value)}
        >
          <option value="todos">Todos os segmentos</option>
          {SEGMENTOS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="card p-4 border-red-500/20 bg-red-500/5 text-red-400 text-sm mb-4">
          Erro ao carregar leads: {error}
        </div>
      )}

      {/* Leads list */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-zinc-500">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Carregando leads...</span>
          </div>
        ) : leads.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-zinc-500 text-sm">Nenhum lead encontrado.</p>
            <p className="text-zinc-600 text-xs mt-1">Tente mudar os filtros ou adicionar novos leads.</p>
          </div>
        ) : (
          <>
            {/* Mobile: cards */}
            <div className="md:hidden divide-y divide-zinc-800/60">
              {leads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  messageTemplate={messageTemplate}
                  onUpdate={handleUpdate}
                  onEdit={setEditingLead}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Nome</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Segmento</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Contato</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Último contato</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {leads.map((lead) => (
                    <LeadRow
                      key={lead.id}
                      lead={lead}
                      messageTemplate={messageTemplate}
                      onUpdate={handleUpdate}
                      onEdit={setEditingLead}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editingLead && (
        <LeadModal
          lead={editingLead}
          title="Editar Lead"
          onSave={handleSaveEdit}
          onClose={() => setEditingLead(null)}
        />
      )}
    </div>
  )
}

function LeadRow({ lead, messageTemplate, onUpdate, onEdit, onDelete }) {
  return (
    <tr className="hover:bg-zinc-800/20 transition-colors group">
      {/* Nome */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div>
            <div className="font-medium text-zinc-100 flex items-center gap-1.5">
              {lead.nome}
              {lead.mensagem_enviada && (
                <span className="text-brand-500 text-xs" title="Mensagem enviada">✓</span>
              )}
            </div>
            {lead.cidade && (
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={10} className="text-zinc-600" />
                <span className="text-xs text-zinc-500">{lead.cidade}</span>
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Segmento */}
      <td className="px-4 py-3">
        <span className="text-zinc-400 text-xs bg-zinc-800 px-2 py-1 rounded-md">
          {lead.segmento || '—'}
        </span>
      </td>

      {/* Contato */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          {lead.telefone && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Phone size={10} className="text-zinc-600" />
              {lead.telefone}
            </div>
          )}
          {lead.instagram && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Instagram size={10} className="text-zinc-600" />
              {lead.instagram}
            </div>
          )}
          {lead.site && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Globe size={10} className="text-zinc-600" />
              <span className="truncate max-w-24">{lead.site.replace(/https?:\/\//, '')}</span>
            </div>
          )}
          {!lead.telefone && !lead.instagram && !lead.site && (
            <span className="text-xs text-zinc-600">—</span>
          )}
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge status={lead.status} />
      </td>

      {/* Último contato */}
      <td className="px-4 py-3">
        <span className="text-xs text-zinc-500">
          {lead.data_ultimo_contato
            ? formatDistanceToNow(new Date(lead.data_ultimo_contato), { locale: ptBR, addSuffix: true })
            : <span className="text-zinc-700">Nunca</span>
          }
        </span>
      </td>

      {/* Ações */}
      <td className="px-4 py-3">
        <div className="flex justify-end">
          <QuickActions
            lead={lead}
            messageTemplate={messageTemplate}
            onUpdate={onUpdate}
            onEdit={onEdit}
            onDelete={onDelete}
            compact
          />
        </div>
      </td>
    </tr>
  )
}

function LeadCard({ lead, messageTemplate, onUpdate, onEdit, onDelete }) {
  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="font-medium text-zinc-100 text-sm truncate">
            {lead.nome}
            {lead.mensagem_enviada && <span className="text-brand-500 ml-1 text-xs">✓</span>}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {lead.segmento && (
              <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-md">{lead.segmento}</span>
            )}
            {lead.cidade && (
              <div className="flex items-center gap-1">
                <MapPin size={10} className="text-zinc-600" />
                <span className="text-xs text-zinc-500">{lead.cidade}</span>
              </div>
            )}
          </div>
        </div>
        <StatusBadge status={lead.status} />
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex flex-col gap-0.5">
          {lead.telefone && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Phone size={10} className="text-zinc-600" />
              {lead.telefone}
            </div>
          )}
          {lead.instagram && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Instagram size={10} className="text-zinc-600" />
              {lead.instagram}
            </div>
          )}
        </div>
        <QuickActions
          lead={lead}
          messageTemplate={messageTemplate}
          onUpdate={onUpdate}
          onEdit={onEdit}
          onDelete={onDelete}
          compact
        />
      </div>
    </div>
  )
}
