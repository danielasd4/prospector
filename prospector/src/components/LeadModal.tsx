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

const STATUS_OPTIONS: LeadStatus[] = [
  'novo',
  'contatado',
  'respondeu',
  'sem_resposta',
  'fechado',
  'nao_interessado',
]
const STATUS_LABELS: Record<LeadStatus, string> = {
  novo: 'Novo',
  contatado: 'Contatado',
  respondeu: 'Respondeu',
  sem_resposta: 'Sem resposta',
  fechado: 'Fechado',
  nao_interessado: 'Não interessado',
}

interface LeadModalProps {
  lead?: Lead | null
  onClose: () => void
}

export function LeadModal({ lead, onClose }: LeadModalProps) {
  const qc = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nome: '',
    segmento: 'Outro',
    cidade: '',
    telefone: '',
    instagram: '',
    site: '',
    endereco: '',
    google_link: '',
    status: 'novo' as LeadStatus,
    observacoes: '',
  })

  useEffect(() => {
    if (lead) {
      setForm({
        nome: lead.nome || '',
        segmento: lead.segmento || 'Outro',
        cidade: lead.cidade || '',
        telefone: lead.telefone || '',
        instagram: lead.instagram || '',
        site: lead.site || '',
        endereco: lead.endereco || '',
        google_link: lead.google_link || '',
        status: lead.status,
        observacoes: lead.observacoes || '',
      })
    }
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
      const whatsapp_link = form.telefone
        ? buildWhatsAppLink(form.telefone, mensagem_gerada)
        : undefined

      const payload = {
        ...form,
        diagnostico,
        score,
        score_nivel: nivel,
        mensagem_gerada,
        whatsapp_link,
      }

      if (lead) {
        await updateLead(lead.id, payload)
        toast.success('Lead atualizado!')
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        await createLead({
          ...payload,
          user_id: user?.id,
        })
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

  const fields = [
    { label: 'Nome do negócio', field: 'nome', type: 'text', placeholder: 'Ex: Clínica do João' },
    { label: 'Cidade', field: 'cidade', type: 'text', placeholder: 'Ex: São Paulo' },
    { label: 'Telefone', field: 'telefone', type: 'tel', placeholder: 'Ex: 11999998888' },
    { label: 'Instagram', field: 'instagram', type: 'text', placeholder: '@perfil' },
    { label: 'Site', field: 'site', type: 'url', placeholder: 'https://...' },
    { label: 'Endereço', field: 'endereco', type: 'text', placeholder: 'Rua, número, bairro' },
    {
      label: 'Link do Google',
      field: 'google_link',
      type: 'url',
      placeholder: 'https://maps.google.com/...',
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            {lead ? 'Editar lead' : 'Adicionar lead'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {fields.map(({ label, field, type, placeholder }) => (
            <div key={field}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input
                type={type}
                value={(form as any)[field]}
                onChange={e => set(field, e.target.value)}
                placeholder={placeholder}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Segmento</label>
            <select
              value={form.segmento}
              onChange={e => set('segmento', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
            >
              {SEGMENTOS.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select
              value={form.status}
              onChange={e => set('status', e.target.value as LeadStatus)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Observações</label>
            <textarea
              value={form.observacoes}
              onChange={e => set('observacoes', e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400 resize-none"
              placeholder="Notas internas..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
          >
            {loading ? 'Salvando...' : lead ? 'Salvar alterações' : 'Criar lead'}
          </button>
        </form>
      </div>
    </div>
  )
}
