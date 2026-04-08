import React, { useState, useRef } from 'react'
import { Link2, Plus, ImagePlus, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { QuickAddModal } from './QuickAddModal'
import { extractLeadFromImage, imageFileToBase64 } from '../services/extractFromImage'

interface LeadInputBarProps {
  onManualAdd: () => void
}

export function LeadInputBar({ onManualAdd }: LeadInputBarProps) {
  const [link, setLink] = useState('')
  const [modalLink, setModalLink] = useState<string | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [prefill, setPrefill] = useState<Record<string, string> | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleSave() {
    const trimmed = link.trim()
    if (!trimmed) {
      toast.error('Cole um link do Google Maps')
      return
    }
    setPrefill(null)
    setModalLink(trimmed)
  }

  function handleSaved() {
    setModalLink(null)
    setLink('')
    setPrefill(null)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (fileRef.current) fileRef.current.value = ''

    setExtracting(true)
    toast.loading('Analisando com IA...', { id: 'img-extract' })
    try {
      const base64 = await imageFileToBase64(file)
      const extracted = await extractLeadFromImage(base64)
      const filled = Object.values(extracted).filter(Boolean).length
      if (filled === 0) {
        toast.error('Não foi possível extrair informações desta imagem', { id: 'img-extract' })
        return
      }
      toast.success(`${filled} campo${filled !== 1 ? 's' : ''} extraído${filled !== 1 ? 's' : ''}`, { id: 'img-extract' })
      // Open modal pre-filled with extracted data, no google link
      setPrefill(extracted as Record<string, string>)
      setModalLink('manual')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao analisar imagem', { id: 'img-extract' })
    } finally {
      setExtracting(false)
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
          <Link2 className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="url"
            value={link}
            onChange={e => setLink(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="Cole o link do Google Maps aqui..."
            className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
          />
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-3 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          Salvar lead
        </button>

        {/* Botão de print/imagem */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={extracting}
          title="Enviar print para preencher automaticamente"
          className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-brand-50 hover:border-brand-300 text-gray-600 hover:text-brand-600 px-4 py-3 rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-60"
        >
          {extracting
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <ImagePlus className="w-4 h-4" />
          }
          <span className="hidden sm:inline">{extracting ? 'Analisando...' : 'Print'}</span>
        </button>

        <button
          onClick={onManualAdd}
          className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 px-4 py-3 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Manual</span>
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>

      {modalLink && (
        <QuickAddModal
          googleLink={modalLink}
          prefill={prefill}
          onClose={() => { setModalLink(null); setPrefill(null) }}
          onSaved={handleSaved}
        />
      )}
    </>
  )
}
