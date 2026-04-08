import React, { useState } from 'react'
import { Link2, Plus, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { processLeadFromGoogleLink } from '../services/leadProcessor'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

interface LeadInputBarProps {
  onManualAdd: () => void
}

export function LeadInputBar({ onManualAdd }: LeadInputBarProps) {
  const [link, setLink] = useState('')
  const [loading, setLoading] = useState(false)
  const qc = useQueryClient()

  async function handleSave() {
    if (!link.trim()) {
      toast.error('Cole um link do Google Maps')
      return
    }
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')
      await processLeadFromGoogleLink(link.trim(), user.id)
      toast.success('Lead salvo!')
      setLink('')
      qc.invalidateQueries({ queryKey: ['leads'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    } catch (e: any) {
      toast.error(e.message || 'Erro ao salvar lead')
    } finally {
      setLoading(false)
    }
  }

  return (
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
        disabled={loading}
        className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 shadow-sm"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
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
  )
}
