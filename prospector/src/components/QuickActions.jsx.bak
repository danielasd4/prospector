import { useState } from 'react'
import {
  MessageCircle,
  Instagram,
  Copy,
  CheckCircle,
  XCircle,
  DollarSign,
  ThumbsDown,
  MoreHorizontal,
  Loader2,
  ExternalLink,
  Pencil,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { openWhatsApp, formatMessage } from '../lib/whatsapp'

export default function QuickActions({
  lead,
  messageTemplate,
  onUpdate,
  onEdit,
  onDelete,
  compact = false,
}) {
  const [loading, setLoading] = useState(null)
  const [showMore, setShowMore] = useState(false)

  const act = async (fn, key) => {
    setLoading(key)
    try {
      await fn()
    } finally {
      setLoading(null)
    }
  }

  const handleWhatsApp = async () => {
    openWhatsApp(lead, messageTemplate || '')
    const updates = {
      status: 'contatado',
      mensagem_enviada: true,
      data_ultimo_contato: new Date().toISOString(),
    }
    if (!lead.data_primeiro_contato) {
      updates.data_primeiro_contato = new Date().toISOString()
    }
    await onUpdate(lead.id, updates)
    toast.success('WhatsApp aberto — lead marcado como contatado')
  }

  const handleCopy = () => {
    const msg = formatMessage(messageTemplate || '', lead)
    navigator.clipboard.writeText(msg)
    toast.success('Mensagem copiada!')
  }

  const handleStatus = async (status, label) => {
    const updates = {
      status,
      data_ultimo_contato: new Date().toISOString(),
    }
    await onUpdate(lead.id, updates)
    toast.success(`Lead marcado como: ${label}`)
    setShowMore(false)
  }

  const btnClass = compact
    ? 'p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-all'
    : 'p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-all'

  const iconSize = compact ? 14 : 15

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* WhatsApp */}
      <button
        onClick={() => act(handleWhatsApp, 'wa')}
        disabled={!!loading}
        title="Mandar WhatsApp"
        className={`${btnClass} hover:text-brand-400`}
      >
        {loading === 'wa' ? (
          <Loader2 size={iconSize} className="animate-spin" />
        ) : (
          <MessageCircle size={iconSize} />
        )}
      </button>

      {/* Instagram */}
      {lead.instagram && (
        <a
          href={`https://instagram.com/${lead.instagram.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir Instagram"
          className={`${btnClass} hover:text-pink-400`}
        >
          <Instagram size={iconSize} />
        </a>
      )}

      {/* Site */}
      {lead.site && (
        <a
          href={lead.site.startsWith('http') ? lead.site : `https://${lead.site}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir site"
          className={`${btnClass} hover:text-sky-400`}
        >
          <ExternalLink size={iconSize} />
        </a>
      )}

      {/* Copy mensagem */}
      <button
        onClick={handleCopy}
        title="Copiar mensagem"
        className={`${btnClass}`}
      >
        <Copy size={iconSize} />
      </button>

      {/* More actions */}
      <div className="relative">
        <button
          onClick={() => setShowMore((v) => !v)}
          title="Mais ações"
          className={btnClass}
        >
          <MoreHorizontal size={iconSize} />
        </button>

        {showMore && (
          <div className="absolute right-0 top-full mt-1 z-50 w-52 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in">
            <div className="p-1">
              <ActionItem
                icon={CheckCircle}
                label="Marcou como respondeu"
                color="text-violet-400"
                onClick={() => act(() => handleStatus('respondeu', 'Respondeu'), 'resp')}
                loading={loading === 'resp'}
              />
              <ActionItem
                icon={XCircle}
                label="Sem resposta"
                color="text-amber-400"
                onClick={() => act(() => handleStatus('sem_resposta', 'Sem resposta'), 'sr')}
                loading={loading === 'sr'}
              />
              <ActionItem
                icon={DollarSign}
                label="Fechado 🎉"
                color="text-emerald-400"
                onClick={() => act(() => handleStatus('fechado', 'Fechado'), 'fc')}
                loading={loading === 'fc'}
              />
              <ActionItem
                icon={ThumbsDown}
                label="Não interessado"
                color="text-zinc-500"
                onClick={() => act(() => handleStatus('nao_interessado', 'Não interessado'), 'ni')}
                loading={loading === 'ni'}
              />
              <div className="border-t border-zinc-800 my-1" />
              {onEdit && (
                <ActionItem
                  icon={Pencil}
                  label="Editar lead"
                  color="text-zinc-400"
                  onClick={() => { onEdit(lead); setShowMore(false) }}
                />
              )}
              {onDelete && (
                <ActionItem
                  icon={Trash2}
                  label="Excluir lead"
                  color="text-red-400"
                  onClick={() => { onDelete(lead.id); setShowMore(false) }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ActionItem({ icon: Icon, label, color, onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800 transition-colors text-left"
    >
      {loading ? (
        <Loader2 size={14} className={`${color} animate-spin`} />
      ) : (
        <Icon size={14} className={color} />
      )}
      {label}
    </button>
  )
}
