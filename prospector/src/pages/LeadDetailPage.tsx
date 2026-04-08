import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getLeadById, getInteractionLogs, addInteractionLog } from '../lib/supabase'
import { useUpdateLead, useWhatsAppAction } from '../hooks/useLeads'
import { StatusBadge } from '../components/StatusBadge'
import { ScoreBadge } from '../components/ScoreBadge'
import { LeadModal } from '../components/LeadModal'
import { LoadingState } from '../components/LoadingState'
import { FOLLOWUP_1, FOLLOWUP_2 } from '../services/leadMessaging'
import { buildWhatsAppLink, openWhatsApp } from '../utils/whatsapp'
import { formatDate } from '../utils/date'
import { Lead, LeadStatus } from '../types'
import {
  ArrowLeft,
  MessageCircle,
  Instagram,
  ExternalLink,
  Copy,
  Edit2,
  Phone,
  MapPin,
  Globe,
  CheckCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'novo', label: 'Novo' },
  { value: 'contatado', label: 'Contatado' },
  { value: 'respondeu', label: 'Respondeu' },
  { value: 'sem_resposta', label: 'Sem resposta' },
  { value: 'fechado', label: 'Fechado' },
  { value: 'nao_interessado', label: 'Não interessado' },
]

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [editing, setEditing] = useState(false)
  const updateMutation = useUpdateLead()
  const whatsappMutation = useWhatsAppAction()

  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => getLeadById(id!),
    enabled: !!id,
  })

  const { data: logs = [] } = useQuery({
    queryKey: ['logs', id],
    queryFn: () => getInteractionLogs(id!),
    enabled: !!id,
  })

  if (isLoading) return <LoadingState />
  if (!lead) return <div className="text-center py-16 text-gray-400">Lead não encontrado</div>

  function copyMessage() {
    if (lead?.mensagem_gerada) {
      navigator.clipboard.writeText(lead.mensagem_gerada)
      toast.success('Mensagem copiada!')
    }
  }

  async function sendFollowup(which: 1 | 2) {
    if (!lead) return
    const msg = which === 1 ? FOLLOWUP_1 : FOLLOWUP_2
    const url = buildWhatsAppLink(lead.telefone || '', msg)
    openWhatsApp(url)
    const now = new Date().toISOString()
    const updates: Partial<Lead> = {
      data_ultimo_contato: now,
      ...(which === 1 ? { followup_1_enviado: true } : { followup_2_enviado: true }),
    }
    updateMutation.mutate({ id: lead.id, updates })
    await addInteractionLog(lead.id, `followup_${which}`, `Follow-up ${which} enviado`)
    qc.invalidateQueries({ queryKey: ['logs', id] })
    toast.success(`Follow-up ${which} iniciado`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <button
        onClick={() => navigate('/leads')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{lead.nome || 'Lead sem nome'}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {lead.segmento && <span className="text-sm text-gray-500">{lead.segmento}</span>}
              {lead.cidade && (
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {lead.cidade}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ScoreBadge score={lead.score} nivel={lead.score_nivel} />
            <StatusBadge status={lead.status} />
          </div>
        </div>

        {/* Status change */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-gray-500">Status:</span>
          <select
            value={lead.status}
            onChange={e =>
              updateMutation.mutate({
                id: lead.id,
                updates: { status: e.target.value as LeadStatus },
              })
            }
            className="text-sm border border-gray-200 rounded-lg px-2 py-1 outline-none"
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setEditing(true)}
            className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-brand-500"
          >
            <Edit2 className="w-3 h-3" /> Editar
          </button>
        </div>
      </div>

      {/* Contact info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Contato</h2>
        <div className="space-y-2">
          {lead.telefone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4 text-gray-400" />
              {lead.telefone}
            </div>
          )}
          {lead.instagram && (
            <div className="flex items-center gap-2 text-sm">
              <Instagram className="w-4 h-4 text-gray-400" />
              <a
                href={
                  lead.instagram.startsWith('http')
                    ? lead.instagram
                    : `https://instagram.com/${lead.instagram.replace('@', '')}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-500 hover:underline"
              >
                {lead.instagram}
              </a>
            </div>
          )}
          {lead.site && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-gray-400" />
              <a
                href={lead.site}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-500 hover:underline truncate"
              >
                {lead.site}
              </a>
            </div>
          )}
          {lead.endereco && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />
              {lead.endereco}
            </div>
          )}
          {lead.google_link && (
            <div className="flex items-center gap-2 text-sm">
              <ExternalLink className="w-4 h-4 text-gray-400" />
              <a
                href={lead.google_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-500 hover:underline"
              >
                Ver no Google
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Ações</h2>
        <div className="flex flex-wrap gap-2">
          {lead.telefone && (
            <button
              onClick={() => whatsappMutation.mutate(lead)}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </button>
          )}
          {lead.mensagem_gerada && (
            <button
              onClick={copyMessage}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              <Copy className="w-4 h-4" /> Copiar mensagem
            </button>
          )}
          {lead.instagram && (
            <a
              href={
                lead.instagram.startsWith('http')
                  ? lead.instagram
                  : `https://instagram.com/${lead.instagram.replace('@', '')}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              <Instagram className="w-4 h-4" /> Instagram
            </a>
          )}
          {lead.status === 'contatado' && !lead.followup_1_enviado && (
            <button
              onClick={() => sendFollowup(1)}
              className="flex items-center gap-2 bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              Follow-up 1
            </button>
          )}
          {lead.followup_1_enviado && !lead.followup_2_enviado && (
            <button
              onClick={() => sendFollowup(2)}
              className="flex items-center gap-2 bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              Follow-up 2
            </button>
          )}
        </div>
      </div>

      {/* Generated message */}
      {lead.mensagem_gerada && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Mensagem gerada</h2>
            <button
              onClick={copyMessage}
              className="text-xs text-gray-400 hover:text-brand-500 flex items-center gap-1"
            >
              <Copy className="w-3 h-3" /> Copiar
            </button>
          </div>
          <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans bg-gray-50 rounded-xl p-4">
            {lead.mensagem_gerada}
          </pre>
        </div>
      )}

      {/* Diagnostico */}
      {lead.diagnostico && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Diagnóstico</h2>
          <div className="space-y-1.5">
            {(lead.diagnostico as any).observacoes?.map((obs: string, i: number) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                {obs}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {logs.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Histórico</h2>
          <div className="space-y-2">
            {logs.map((log: any) => (
              <div key={log.id} className="flex items-start gap-3 text-sm">
                <span className="text-gray-400 text-xs whitespace-nowrap mt-0.5">
                  {formatDate(log.created_at)}
                </span>
                <span className="text-gray-600">{log.descricao}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {editing && <LeadModal lead={lead} onClose={() => setEditing(false)} />}
    </div>
  )
}
