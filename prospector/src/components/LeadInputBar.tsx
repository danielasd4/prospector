import React, { useState } from 'react'
import { Link2, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { QuickAddModal } from './QuickAddModal'

interface LeadInputBarProps {
  onManualAdd: () => void
}

export function LeadInputBar({ onManualAdd }: LeadInputBarProps) {
  const [link, setLink] = useState('')
  const [modalLink, setModalLink] = useState<string | null>(null)

  function handleSave() {
    const trimmed = link.trim()
    if (!trimmed) {
      toast.error('Cole um link do Google Maps')
      return
    }
    setModalLink(trimmed)
  }

  function handleSaved() {
    setModalLink(null)
    setLink('')
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
        <button
          onClick={onManualAdd}
          className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 px-4 py-3 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Manual</span>
        </button>
      </div>

      {modalLink && (
        <QuickAddModal
          googleLink={modalLink}
          onClose={() => setModalLink(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  )
}
