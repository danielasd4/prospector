import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTemplates, upsertTemplate } from '../lib/supabase'
import { getDefaultTemplates } from '../services/leadMessaging'
import { SEGMENTOS } from '../utils/segment'
import { LoadingState } from '../components/LoadingState'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TemplatesPage() {
  const qc = useQueryClient()
  const { data: savedTemplates = [], isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: getTemplates,
  })

  const [templates, setTemplates] = useState<Record<string, string>>({})

  useEffect(() => {
    // Load defaults first
    const defaults: Record<string, string> = {}
    getDefaultTemplates().forEach(t => {
      defaults[t.segmento] = t.conteudo
    })
    // Override with saved
    savedTemplates.forEach((t: any) => {
      defaults[t.segmento] = t.conteudo
    })
    setTemplates(defaults)
  }, [savedTemplates])

  const saveMutation = useMutation({
    mutationFn: (data: { segmento: string; conteudo: string }) =>
      upsertTemplate({ segmento: data.segmento, titulo: data.segmento, conteudo: data.conteudo }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['templates'] })
      toast.success('Template salvo!')
    },
    onError: () => toast.error('Erro ao salvar template'),
  })

  if (isLoading) return <LoadingState />

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-lg font-bold text-gray-900">Templates de mensagem</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Personalize a mensagem por segmento. Use {'{{nome}}'}, {'{{cidade}}'},{' '}
          {'{{segmento}}'}.
        </p>
      </div>

      {SEGMENTOS.map(segmento => (
        <div key={segmento} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-800">{segmento}</h2>
            <button
              onClick={() =>
                saveMutation.mutate({ segmento, conteudo: templates[segmento] || '' })
              }
              disabled={saveMutation.isPending}
              className="flex items-center gap-1.5 text-xs bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
            >
              <Save className="w-3 h-3" /> Salvar
            </button>
          </div>
          <textarea
            value={templates[segmento] || ''}
            onChange={e => setTemplates(t => ({ ...t, [segmento]: e.target.value }))}
            rows={5}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-brand-400 resize-none font-sans"
            placeholder="Digite a mensagem para este segmento..."
          />
        </div>
      ))}
    </div>
  )
}
