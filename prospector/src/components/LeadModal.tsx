import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Lead, LeadStatus } from '../types'
import { SEGMENTOS } from '../utils/segment'
import { generateDiagnostico } from '../services/leadDiagnostics'
import { calculateLeadScore } from '../services/leadScoring'
import { generateMessage } from '../services/leadMessaging'
import { buildWhatsAppLink } from '../utils/whatsapp'
import { createLead, updateLead } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

const STATUS_OPTIONS: LeadStatus[] = ['novo','contatado','respondeu','sem_resposta','fechado','nao_interessado']
const STATUS_LABELS: Record<LeadStatus, string> = {
  novo: 'Novo', contatado: 'Contatado', respondeu: 'Respondeu',
  sem_resposta: 'Sem resposta', fechado: 'Fechado', nao_interessado: 'Não interessado',
}

interface LeadModalProps {
  lead?: Lead | null
  onClose: () => void
}

export function LeadModal({ lead, onClose }: LeadModalProps) {
  const qc = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nome: '', segmento: 'Outro', cidade: '', telefone: '',
    instagram: '', site: '', endereco: '', google_link: '',
    status: 'novo' as LeadStatus, observacoes: '',
  })

  useEffect(() => {
    if (lead) setForm({
      nome: lead.nome || '', segmento: lead.segmento || 'Outro',
      cidade: lead.cidade || '', telefone: lead.telefone || '',
      instagram: lead.instagram || '', site: lead.site || '',
      endereco: lead.endereco || '', google_link: lead.google_link || '',
      status: lead.status, observacoes: lead.observacoes || '',
    })
  }, [lead])

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const diagnostico = generateDiagnostico(form)
      const { score, nivel } = calculateLeadScore(form)
      const mensagem_gerada = generateMessage(form)
      const whatsapp_link = form.telefone ? buildWhatsAppLink(form.telefone, mensagem_gerada) : undefined
      const payload = { ...form, diagnostico, score, score_nivel: nivel, mensagem_gerada, whatsapp_link }
      if (lead) {
        await updateLead(lead.id, payload)
        toast.success('Lead atualizado!')
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        await createLead({ ...payload, user_id: user?.id })
        toast.success('Lead criado!')
      }
      qc.invalidateQueries({ queryKey: ['leads'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      onClose()
    } catch (e: any) {
      toast.error(e.message || 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"

  const fields = [
    { label: 'Nome do negócio', field: 'nome', type: 'text', placeholder: 'Ex: Clínica do João' },
    { label: 'Cidade', field: 'cidade', type: 'text', placeholder: 'Ex: São Paulo' },
    { label: 'Telefone', field: 'telefone', type: 'tel', placeholder: 'Ex: 11999998888' },
    { label: 'Instagram', field: 'instagram', type: 'text', placeholder: '@perfil' },
    { label: 'Site', field: 'site', type: 'url', placeholder: 'https://...' },
    { label: 'Endereço', field: 'endereco', type: 'text', placeholder: 'Rua, número, bairro' },
    { label: 'Link do Google', field: 'google_link', type: 'url', placeholder: 'https://maps.google.com/...' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 modal-overlay">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto modal-content">
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h2 className="font-semibold text-zinc-100">{lead ? 'Editar lead' : 'Adicionar lead'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors">
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {fields.map(({ label, field, type, placeholder }) => (
            <div key={field}>
              <label className="text-xs font-medium text-zinc-400 block mb-1">{label}</label>
              <input type={type} value={(form as any)[field]} onChange={e => set(field, e.target.value)}
                placeholder={placeholder} className={inputClass} />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">Segmento</label>
              <select value={form.segmento} onChange={e => set('segmento', e.target.value)} className={inputClass}>
                {SEGMENTOS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value as LeadStatus)} className={inputClass}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1">Observações</label>
            <textarea value={form.observacoes} onChange={e => set('observacoes', e.target.value)}
              rows={3} className={inputClass + ' resize-none'} placeholder="Notas internas..." />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-400 active:scale-95 text-white py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50">
            {loading ? 'Salvando...' : lead ? 'Salvar alterações' : 'Criar lead'}
          </button>
        </form>
      </div>
    </div>
  )
}
