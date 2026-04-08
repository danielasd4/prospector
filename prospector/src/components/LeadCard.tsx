import React from 'react'
import { Phone, MapPin, ExternalLink } from 'lucide-react'
import { Lead } from '../types'
import { StatusBadge } from './StatusBadge'
import { ScoreBadge } from './ScoreBadge'
import { QuickActions } from './QuickActions'
import { formatDate } from '../utils/date'
import { useNavigate } from 'react-router-dom'

interface LeadCardProps {
  lead: Lead
  onEdit: () => void
}

export function LeadCard({ lead, onEdit }: LeadCardProps) {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <button
            onClick={() => navigate(`/leads/${lead.id}`)}
            className="text-sm font-semibold text-gray-900 hover:text-brand-600 text-left truncate block"
          >
            {lead.nome || 'Lead sem nome'}
          </button>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {lead.segmento && <span className="text-xs text-gray-500">{lead.segmento}</span>}
            {lead.cidade && (
              <span className="text-xs text-gray-400 flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />
                {lead.cidade}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <ScoreBadge score={lead.score} nivel={lead.score_nivel} />
          <StatusBadge status={lead.status} />
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
        {lead.telefone && (
          <span className="flex items-center gap-1">
            <Phone className="w-3 h-3" />
            {lead.telefone}
          </span>
        )}
        {lead.data_ultimo_contato && (
          <span>Último: {formatDate(lead.data_ultimo_contato)}</span>
        )}
        {lead.google_link && (
          <a
            href={lead.google_link}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-500"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      <QuickActions lead={lead} onEdit={onEdit} />
    </div>
  )
}
