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
import { ArrowLeft, MessageCircle, Instagram, ExternalLink, Copy, Edit2, Phone, MapPin, Globe, CheckCircle } from 'lucide-react'
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
  if (!lead) return <div className="text-center py-16 text-zinc-500">Lead não encontrado</div>

  function copyMessage() {
    if (lead?.mensagem_gerada) {
      navigator.clipboard.writeText(lead.mensagem_gerada)
      toast.success('Mensagem copiada!')
    }
  }

  async function sendFollowup(which: 1 | 2) {
    if (!lead) return
    const msg = which === 1 ? FOLLOWUP_1 : FOLLOWUP_2
    openWhatsApp(buildWhatsAppLink(lead.telefone || '', msg))
    const now = new Date().toISOString()
    updateMutation.mutate({ id: lead.id, updates: { data_ultimo_contato: now, ...(which === 1 ? { followup_1_enviado: true } : { followup_2_enviado: true }) } })
    await addInteractionLog(lead.id, `followup_${which}`, `Follow-up ${which} enviado`)
    qc.invalidateQueries({ queryKey: ['logs', id] })
    toast.success(`Follow-up ${which} iniciado`)
  }

  const igUrl = lead.instagram?.startsWith('http') ? lead.instagram : `https://instagram.com/${lead.instagram?.replace('@', '')}`

  return (
    <div className="max-w-2xl mx-auto space-y-3">
      <button onClick={() => navigate('/leads')}
        className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      {/* Header */}
      <div className="card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-zinc-100">{lead.nome || 'Lead sem nome'}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {lead.segmento && <span className="text-sm text-brand-400 font-medium">{lead.segmento}</span>}
              {lead.cidade && (
                <span className="text-sm text-zinc-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />{lead.cidade}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ScoreBadge score={lead.score} nivel={lead.score_nivel} />
            <StatusBadge status={lead.status} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-xs text-zinc-500">Status:</span>
          <select
            value={lead.status}
            onChange={e => updateMutation.mutate({ id: lead.id, updates: { status: e.target.value as LeadStatus } })}
            className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-brand-500"
          >
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={() => setEditing(true)}
            className="ml-auto flex items-center gap-1 text-xs text-zinc-500 hover:text-brand-400 transition-colors">
            <Edit2 className="w-3 h-3" /> Editar
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="card p-5">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Ações</h2>
        <div className="flex flex-wrap gap-2">
          {lead.telefone && (
            <button onClick={() => whatsappMutation.mutate(lead)}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-400 active:scale-95 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-green-500/20">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </button>
          )}
          {lead.mensagem_gerada && (
            <button onClick={copyMessage}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
              <Copy className="w-4 h-4" /> Copiar mensagem
            </button>
          )}
          {lead.instagram && (
            <a href={igUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 text-pink-400 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
              <Instagram className="w-4 h-4" /> Instagram
            </a>
          )}
          {lead.status === 'contatado' && !lead.followup_1_enviado && (
            <button onClick={() => sendFollowup(1)}
              className="flex items-center gap-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
              Follow-up 1
            </button>
          )}
          {lead.followup_1_enviado && !lead.followup_2_enviado && (
            <button onClick={() => sendFollowup(2)}
              className="flex items-center gap-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
              Follow-up 2
            </button>
          )}
        </div>
      </div>

      {/* Contact info */}
      <div className="card p-5">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Contato</h2>
        <div className="space-y-2.5">
          {lead.telefone && (
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <Phone className="w-4 h-4 text-zinc-600 shrink-0" />{lead.telefone}
            </div>
          )}
          {lead.instagram && (
            <div className="flex items-center gap-2 text-sm">
              <Instagram className="w-4 h-4 text-zinc-600 shrink-0" />
              <a href={igUrl} target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">{lead.instagram}</a>
            </div>
          )}
          {lead.site && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-zinc-600 shrink-0" />
              <a href={lead.site} target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline truncate">{lead.site}</a>
            </div>
          )}
          {lead.endereco && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <MapPin className="w-4 h-4 text-zinc-600 shrink-0" />{lead.endereco}
            </div>
          )}
          {lead.google_link && (
            <div className="flex items-center gap-2 text-sm">
              <ExternalLink className="w-4 h-4 text-zinc-600 shrink-0" />
              <a href={lead.google_link} target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">Ver no Google</a>
            </div>
          )}
        </div>
      </div>

      {/* Mensagem gerada */}
      {lead.mensagem_gerada && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Mensagem gerada</h2>
            <button onClick={copyMessage} className="text-xs text-zinc-500 hover:text-brand-400 flex items-center gap-1 transition-colors">
              <Copy className="w-3 h-3" /> Copiar
            </button>
          </div>
          <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-sans bg-zinc-800 rounded-xl p-4 leading-relaxed">
            {lead.mensagem_gerada}
          </pre>
        </div>
      )}

      {/* Diagnóstico */}
      {lead.diagnostico && (lead.diagnostico as any).observacoes?.length > 0 && (
        <div className="card p-5">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Diagnóstico</h2>
          <div className="space-y-2">
            {(lead.diagnostico as any).observacoes.map((obs: string, i: number) => (
              <div key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                <CheckCircle className="w-3.5 h-3.5 text-brand-400 shrink-0" />{obs}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Histórico */}
      {logs.length > 0 && (
        <div className="card p-5">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Histórico</h2>
          <div className="space-y-2.5">
            {logs.map((log: any) => (
              <div key={log.id} className="flex items-start gap-3 text-sm">
                <span className="text-zinc-600 text-xs whitespace-nowrap mt-0.5 shrink-0">{formatDate(log.created_at)}</span>
                <span className="text-zinc-400">{log.descricao}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {editing && <LeadModal lead={lead} onClose={() => setEditing(false)} />}
    </div>
  )
}
