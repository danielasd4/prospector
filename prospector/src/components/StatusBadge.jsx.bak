export const STATUS_CONFIG = {
  novo: {
    label: 'Novo',
    color: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    dot: 'bg-blue-400',
  },
  contatado: {
    label: 'Contatado',
    color: 'bg-brand-500/15 text-brand-400 border-brand-500/20',
    dot: 'bg-brand-400',
  },
  respondeu: {
    label: 'Respondeu',
    color: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
    dot: 'bg-violet-400',
  },
  sem_resposta: {
    label: 'Sem resposta',
    color: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-400',
  },
  fechado: {
    label: 'Fechado',
    color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  nao_interessado: {
    label: 'Não interessado',
    color: 'bg-zinc-700/50 text-zinc-500 border-zinc-700',
    dot: 'bg-zinc-500',
  },
}

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.novo
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}
