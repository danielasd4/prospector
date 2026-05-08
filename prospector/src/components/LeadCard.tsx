import React from 'react'
import { Phone, MapPin, ExternalLink, MessageCircle, Instagram, Edit2, Check, X, Archive, ThumbsDown, Trash2 } from 'lucide-react'
import { Lead } from '../types'
import { StatusBadge } from './StatusBadge'
import { ScoreBadge } from './ScoreBadge'
import { formatDate } from '../utils/date'
import { useNavigate } from 'react-router-dom'
import { useUpdateLead, useWhatsAppDBUpdate, useDeleteLead, getWhatsAppUrl } from '../hooks/useLeads'
import toast from 'react-hot-toast'

interface LeadCardProps {
  lead: Lead
  onEdit: () => void
}

export function LeadCard({ lead, onEdit }: LeadCardProps) {
  const navigate = useNavigate()
  const updateMutation = useUpdateLead()
  const whatsappDB = useWhatsAppDBUpdate()
  const deleteMutation = useDeleteLead()

  function handleWhatsApp() {
    window.open(getWhatsAppUrl(lead), '_blank')
    whatsappDB.mutate(lead)
  }

  function changeStatus(status: Lead['status']) {
    updateMutation.mutate({ id: lead.id, updates: { status } }, {
      onSuccess: () => toast.success('Status atualizado')
    })
  }

  return (
    <div className="card p-4 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <button
            onClick={() => navigate(`/leads/${lead.id}`)}
            className="text-sm font-semibold text-zinc-100 hover:text-brand-400 text-left truncate block transition-colors"
          >
            {lead.nome || 'Lead sem nome'}
          </button>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {lead.segmento && (
              <span className="text-xs text-brand-400 font-medium">{lead.segmento}</span>
            )}
            {lead.cidade && (
              <span className="text-xs text-zinc-500 flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />{lead.cidade}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <ScoreBadge score={lead.score} nivel={lead.score_nivel} />
          <StatusBadge status={lead.status} />
        </div>
      </div>

      {/* Info */}
      <div className="flex items-center gap-3 mb-3 text-xs text-zinc-500">
        {lead.telefone && (
          <span className="flex items-center gap-1 text-zinc-400">
            <Phone className="w-3 h-3" />{lead.telefone}
          </span>
        )}
        {lead.data_ultimo_contato && (
          <span>Último: {formatDate(lead.data_ultimo_contato)}</span>
        )}
        {lead.google_link && (
          <a href={lead.google_link} target="_blank" rel="noopener noreferrer"
            className="hover:text-brand-400 transition-colors ml-auto">
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {lead.telefone && (
          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-400 active:scale-95 text-white text-xs font-bold transition-all shadow-lg shadow-green-500/20"
          >
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
          </button>
        )}
        {lead.instagram && (
          <a
            href={lead.instagram.startsWith('http') ? lead.instagram : `https://instagram.com/${lead.instagram.replace('@', '')}`}
            target="_blank" rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-pink-500/20 text-zinc-500 hover:text-pink-400 transition-colors border border-zinc-700"
            title="Instagram"
          >
            <Instagram className="w-3.5 h-3.5" />
          </a>
        )}
        <button onClick={onEdit}
          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-500 hover:text-zinc-200 transition-colors border border-zinc-700" title="Editar">
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => changeStatus('respondeu')}
          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-green-500/20 text-zinc-500 hover:text-green-400 transition-colors border border-zinc-700" title="Respondeu">
          <Check className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => changeStatus('sem_resposta')}
          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-500 hover:text-zinc-200 transition-colors border border-zinc-700" title="Sem resposta">
          <X className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => changeStatus('fechado')}
          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-purple-500/20 text-zinc-500 hover:text-purple-400 transition-colors border border-zinc-700" title="Fechado">
          <Archive className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => changeStatus('nao_interessado')}
          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-colors border border-zinc-700" title="Não interessado">
          <ThumbsDown className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => { if (confirm('Remover lead?')) deleteMutation.mutate(lead.id) }}
          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-colors border border-zinc-700" title="Excluir">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
