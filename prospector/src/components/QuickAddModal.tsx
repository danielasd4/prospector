import React, { useState, useEffect, useRef } from 'react'
import { X, MessageCircle, Loader2, Sparkles } from 'lucide-react'
import { SEGMENTOS, inferSegment } from '../utils/segment'
import { generateDiagnostico } from '../services/leadDiagnostics'
import { calculateLeadScore } from '../services/leadScoring'
import { generateMessage } from '../services/leadMessaging'
import { buildWhatsAppLink } from '../utils/whatsapp'
import { extractLeadFromImage, imageFileToBase64 } from '../services/extractFromImage'
import { createLead } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { LeadStatus } from '../types'
import toast from 'react-hot-toast'

interface QuickAddModalProps {
  googleLink: string
  prefill?: Record<string, string> | null
  onClose: () => void
  onSaved: () => void
}

export function QuickAddModal({ googleLink, prefill, onClose, onSaved }: QuickAddModalProps) {
  const qc = useQueryClient()
  const nomeRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    segmento: 'Outro',
    cidade: '',
    instagram: '',
    site: '',
  })

  useEffect(() => {
    if (prefill && Object.keys(prefill).length > 0) {
      setForm(f => ({
        nome: prefill.nome || f.nome,
        telefone: prefill.telefone || f.telefone,
        segmento: prefill.segmento || inferSegment(prefill.nome || '', prefill.categoria || '') || f.segmento,
        cidade: prefill.cidade || f.cidade,
        instagram: prefill.instagram || f.instagram,
        site: prefill.site || f.site,
      }))
      setTimeout(() => nomeRef.current?.focus(), 100)
      return
    }
    try {
      const url = new URL(googleLink)
      const pathParts = url.pathname.split('/')
      const placeIndex = pathParts.findIndex(p => p === 'place')
      if (placeIndex !== -1 && pathParts[placeIndex + 1]) {
        const raw = decodeURIComponent(pathParts[placeIndex + 1].replace(/\+/g, ' ')).replace(/-/g, ' ')
        if (raw.length > 2) {
          setForm(f => ({ ...f, nome: raw, segmento: inferSegment(raw, '') || 'Outro' }))
        }
      }
    } catch {}
    setTimeout(() => nomeRef.current?.focus(), 100)
  }, [googleLink, prefill])

  function set(field: string, value: string) {
    setForm(f => {
      const updated = { ...f, [field]: value }
      if (field === 'nome') updated.segmento = inferSegment(value, '') || 'Outro'
      return updated
    })
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setExtracting(true)
    toast.loading('Analisando com IA...', { id: 'extract' })
    try {
      const base64 = await imageFileToBase64(file)
      const extracted = await extractLeadFromImage(base64)
      setForm(f => ({
        nome: extracted.nome || f.nome,
        telefone: extracted.telefone || f.telefone,
        segmento: extracted.segmento || inferSegment(extracted.nome || f.nome, extracted.categoria || '') || f.segmento,
        cidade: extracted.cidade || f.cidade,
        instagram: extracted.instagram || f.instagram,
        site: extracted.site || f.site,
      }))
      const filled = Object.values(extracted).filter(Boolean).length
      toast.success(`${filled} campo${filled !== 1 ? 's' : ''} preenchido${filled !== 1 ? 's' : ''}`, { id: 'extract' })
    } catch (err: any) {
      toast.error(err.message || 'Erro ao analisar imagem', { id: 'extract' })
    } finally {
      setExtracting(false)
      if (fileRef.current) fileRef.current.value = ''
    }
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
      const leadData = { ...form, google_link: googleLink === 'manual' ? '' : googleLink, status: 'novo' as LeadStatus, user_id: user.id }
      const diagnostico = generateDiagnostico(leadData)
      const { score, nivel } = calculateLeadScore(leadData)
      const mensagem_gerada = generateMessage(leadData)
      const whatsapp_link = form.telefone ? buildWhatsAppLink(form.telefone, mensagem_gerada) : undefined
      await createLead({ ...leadData, diagnostico, score, score_nivel: nivel, mensagem_gerada, whatsapp_link })
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

  const inputClass = "w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 modal-overlay">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md modal-content">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div>
            <h2 className="font-semibold text-zinc-100 text-sm">Novo lead</h2>
            <p className="text-xs text-zinc-600 truncate max-w-xs mt-0.5">{googleLink === 'manual' ? 'Adicionado por imagem' : googleLink}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors">
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-3">
          {/* Upload */}
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={extracting}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-zinc-700 hover:border-brand-500 bg-zinc-800/50 hover:bg-brand-500/5 text-zinc-400 hover:text-brand-400 rounded-xl py-3 text-sm font-medium transition-all disabled:opacity-50"
            >
              {extracting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Analisando com IA...</>
                : <><Sparkles className="w-4 h-4" /> Enviar print para preencher automaticamente</>
              }
            </button>
            {preview && (
              <div className="mt-2 relative">
                <img src={preview} alt="Preview" className="w-full h-28 object-cover rounded-xl border border-zinc-700" />
                <button type="button" onClick={() => setPreview(null)}
                  className="absolute top-1.5 right-1.5 bg-black/70 text-white rounded-full p-0.5 hover:bg-black">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-xs text-zinc-600">ou preencha manualmente</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Nome */}
          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1">
              Nome do negócio <span className="text-red-400">*</span>
            </label>
            <input ref={nomeRef} type="text" value={form.nome} onChange={e => set('nome', e.target.value)}
              placeholder="Ex: Clínica Estética Silva" className={inputClass} />
          </div>

          {/* Telefone + Segmento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">Telefone / WhatsApp</label>
              <input type="tel" value={form.telefone} onChange={e => set('telefone', e.target.value)}
                placeholder="11999998888" className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">Segmento</label>
              <select value={form.segmento} onChange={e => set('segmento', e.target.value)}
                className={inputClass + ' appearance-none'}>
                {SEGMENTOS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Cidade + Instagram */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">Cidade</label>
              <input type="text" value={form.cidade} onChange={e => set('cidade', e.target.value)}
                placeholder="São Paulo" className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">Instagram</label>
              <input type="text" value={form.instagram} onChange={e => set('instagram', e.target.value)}
                placeholder="@perfil" className={inputClass} />
            </div>
          </div>

          <button type="submit" disabled={loading || extracting}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 active:scale-95 text-white py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 shadow-lg shadow-green-500/20 mt-1">
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
