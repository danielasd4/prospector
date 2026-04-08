import React from 'react'
import { MessageCircle, Instagram, Edit2, Check, X, Archive, ThumbsDown, Trash2 } from 'lucide-react'
import { Lead } from '../types'
import { useUpdateLead, useWhatsAppAction, useDeleteLead } from '../hooks/useLeads'
import toast from 'react-hot-toast'

interface QuickActionsProps {
  lead: Lead
  onEdit: () => void
}

export function QuickActions({ lead, onEdit }: QuickActionsProps) {
  const updateMutation = useUpdateLead()
  const whatsappMutation = useWhatsAppAction()
  const deleteMutation = useDeleteLead()

  function changeStatus(status: Lead['status']) {
    updateMutation.mutate(
      { id: lead.id, updates: { status } },
      { onSuccess: () => toast.success(`Status: ${status}`) }
    )
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {lead.telefone && (
        <button
          onClick={() => whatsappMutation.mutate(lead)}
          className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors"
          title="WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
        </button>
      )}
      {lead.instagram && (
        <a
          href={
            lead.instagram.startsWith('http')
              ? lead.instagram
              : `https://instagram.com/${lead.instagram.replace('@', '')}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-600 transition-colors"
          title="Instagram"
        >
          <Instagram className="w-4 h-4" />
        </a>
      )}
      <button
        onClick={onEdit}
        className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
        title="Editar"
      >
        <Edit2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => changeStatus('respondeu')}
        className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors"
        title="Respondeu"
      >
        <Check className="w-4 h-4" />
      </button>
      <button
        onClick={() => changeStatus('sem_resposta')}
        className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
        title="Sem resposta"
      >
        <X className="w-4 h-4" />
      </button>
      <button
        onClick={() => changeStatus('fechado')}
        className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 transition-colors"
        title="Fechado"
      >
        <Archive className="w-4 h-4" />
      </button>
      <button
        onClick={() => changeStatus('nao_interessado')}
        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
        title="Não interessado"
      >
        <ThumbsDown className="w-4 h-4" />
      </button>
      <button
        onClick={() => {
          if (confirm('Remover lead?')) deleteMutation.mutate(lead.id)
        }}
        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
        title="Excluir"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
