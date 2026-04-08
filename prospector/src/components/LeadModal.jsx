import { useState, useEffect } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import { SEGMENTOS_LIST } from '../lib/extractInfo'

const EMPTY = {
  nome: '', segmento: '', cidade: '', telefone: '',
  instagram: '', site: '', endereco: '', google_link: '',
  origem: 'manual', observacoes: '',
}

export default function LeadModal({ lead, onSave, onClose, title = 'Editar Lead' }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (lead) setForm({ ...EMPTY, ...lead })
  }, [lead])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.nome.trim()) return
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl modal-content max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="font-semibold text-zinc-100">{title}</h2>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Nome do negócio *</label>
              <input
                className="input-base"
                placeholder="Ex: Clínica Estética Bella Forma"
                value={form.nome}
                onChange={(e) => set('nome', e.target.value)}
              />
            </div>

            <div>
              <label className="label">Segmento</label>
              <select
                className="input-base"
                value={form.segmento}
                onChange={(e) => set('segmento', e.target.value)}
              >
                <option value="">Selecionar...</option>
                {SEGMENTOS_LIST.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Cidade</label>
              <input
                className="input-base"
                placeholder="Ex: São Paulo, SP"
                value={form.cidade}
                onChange={(e) => set('cidade', e.target.value)}
              />
            </div>

            <div>
              <label className="label">Telefone / WhatsApp</label>
              <input
                className="input-base"
                placeholder="(11) 99999-9999"
                value={form.telefone}
                onChange={(e) => set('telefone', e.target.value)}
              />
            </div>

            <div>
              <label className="label">Instagram</label>
              <input
                className="input-base"
                placeholder="@perfil"
                value={form.instagram}
                onChange={(e) => set('instagram', e.target.value)}
              />
            </div>

            <div>
              <label className="label">Site</label>
              <input
                className="input-base"
                placeholder="https://..."
                value={form.site}
                onChange={(e) => set('site', e.target.value)}
              />
            </div>

            <div>
              <label className="label">Link Google Maps</label>
              <input
                className="input-base"
                placeholder="https://maps.google.com/..."
                value={form.google_link}
                onChange={(e) => set('google_link', e.target.value)}
              />
            </div>

            <div className="col-span-2">
              <label className="label">Endereço</label>
              <input
                className="input-base"
                placeholder="Rua, número, bairro..."
                value={form.endereco}
                onChange={(e) => set('endereco', e.target.value)}
              />
            </div>

            <div className="col-span-2">
              <label className="label">Observações</label>
              <textarea
                className="input-base resize-none"
                rows={3}
                placeholder="Notas internas sobre este lead..."
                value={form.observacoes}
                onChange={(e) => set('observacoes', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800">
          <button onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!form.nome.trim() || saving}
            className="btn-primary"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Salvar lead
          </button>
        </div>
      </div>
    </div>
  )
}
