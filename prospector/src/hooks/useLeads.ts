import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getLeads, updateLead, deleteLead, addInteractionLog } from '../lib/supabase'
import { buildWhatsAppLink, openWhatsApp } from '../utils/whatsapp'
import { Lead } from '../types'
import toast from 'react-hot-toast'

export function useLeads(filters = {}) {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: () => getLeads(filters),
  })
}

export function useUpdateLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Lead> }) => updateLead(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  })
}

export function useDeleteLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead removido')
    },
  })
}

export function useWhatsAppAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (lead: Lead) => {
      // Abre PRIMEIRO (síncrono) — browser bloqueia window.open após await
      const url = lead.whatsapp_link || buildWhatsAppLink(lead.telefone || '', lead.mensagem_gerada || '')
      openWhatsApp(url)

      // Atualiza banco em background
      const now = new Date().toISOString()
      const updates: Partial<Lead> = {
        status: 'contatado',
        data_ultimo_contato: now,
        data_primeiro_contato: lead.data_primeiro_contato || now,
      }
      await updateLead(lead.id, updates)
      await addInteractionLog(lead.id, 'whatsapp_opened', 'WhatsApp iniciado com mensagem automática')
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  })
}
