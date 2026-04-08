import React, { useState, useEffect, useRef } from 'react'
import { X, MessageCircle, Loader2 } from 'lucide-react'
import { SEGMENTOS, inferSegment } from '../utils/segment'
import { generateDiagnostico } from '../services/leadDiagnostics'
import { calculateLeadScore } from '../services/leadScoring'
import { generateMessage } from '../services/leadMessaging'
import { buildWhatsAppLink } from '../utils/whatsapp'
import { createLead } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { LeadStatus } from '../types'
import toast from 'react-hot-toast'

interface QuickAddModalProps {
  googleLink: string
  onClose: () => void
  onSaved: () => void
}

export function QuickAddModal({ googleLink, onClose, onSaved }: QuickAddModalProps) {
  const qc = useQueryClient()
  const nomeRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    segmento: 'Outro',
    cidade: '',
    instagram: '',
    site: '',
  })

  // Try to extract name from Google Maps URL
  useEffect(() => {
    try {
      const url = new URL(googleLink)
      const pathParts = url.pathname.split('/')
      const placeIndex = pathParts.findIndex(p => p === 'place')
      if (placeIndex !== -1 && pathParts[placeIndex + 1]) {
        const raw = decodeURIComponent(pathParts[placeIndex + 1].replace(/\+/g, ' ')).replace(/-/g, ' ')
        if (raw.length > 2) {
          const seg = inferSegment(raw, '')
          setForm(f => ({ ...f, nome: raw, segmento: seg }))
        }
      }
    } catch {}
    // Focus nome field
    setTimeout(() => nomeRef.current?.focus(), 100)
  }, [googleLink])

  function set(field: string, value: string) {
    setForm(f => {
      const updated = { ...f, [field]: value }
      // Auto-suggest segment when name changes
      if (field === 'nome') {
        updated.segmento = inferSegment(value, '') || 'Outro'
      }
      return updated
    })
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim()) {
      nomeRef.current?.focus()
      toast.error('Informe o nome do negócio')
      return
    }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      const leadData = {
        ...form,
        google_link: googleLink,
        status: 'novo' as LeadStatus,
        user_id: user.id,
      }

      const diagnostico = generateDiagnostico(leadData)
      const { score, nivel } = calculateLeadScore(leadData)
      const mensagem_gerada = generateMessage(leadData)
      const whatsapp_link = form.telefone ? buildWhatsAppLink(form.telefone, mensagem_gerada) : undefined

      await createLead({
        ...leadData,
        diagnostico,
        score,
        score_nivel: nivel,
        mensagem_gerada,
        whatsapp_link,
      })

      toast.success('Lead salvo!')
      qc.invalidateQueries({ queryKey: ['leads'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      onSaved()
    } catch (e: any) {
      toast.error(e.message || 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">Novo lead</h2>
            <p className="text-xs text-gray-400 truncate max-w-xs mt-0.5">{googleLink}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-5 space-y-3">
          {/* Nome — campo principal */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Nome do negócio <span className="text-red-400">*</span>
            </label>
            <input
              ref={nomeRef}
              type="text"
              value={form.nome}
              onChange={e => set('nome', e.target.value)}
              placeholder="Ex: Clínica Estética Silva"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
            />
          </div>

          {/* Telefone + Segmento lado a lado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Telefone / WhatsApp</label>
              <input
                type="tel"
                value={form.telefone}
                onChange={e => set('telefone', e.target.value)}
                placeholder="11999998888"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Segmento</label>
              <select
                value={form.segmento}
                onChange={e => set('segmento', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-400 bg-white"
              >
                {SEGMENTOS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Cidade + Instagram lado a lado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Cidade</label>
              <input
                type="text"
                value={form.cidade}
                onChange={e => set('cidade', e.target.value)}
                placeholder="São Paulo"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Instagram</label>
              <input
                type="text"
                value={form.instagram}
                onChange={e => set('instagram', e.target.value)}
                placeholder="@perfil"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          </div>

          {/* Botão salvar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 mt-1"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
              : <><MessageCircle className="w-4 h-4" /> Salvar e preparar WhatsApp</>
            }
          </button>
        </form>
      </div>
    </div>
  )
}
