import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, UserPlus, MessageCircle, CheckCircle,
  DollarSign, TrendingUp, ArrowRight, Zap
} from 'lucide-react'
import { getLeadStats, getLeads } from '../lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import StatusBadge from '../components/StatusBadge'

const METRIC_CARDS = [
  { key: 'total',      label: 'Total de leads',  icon: Users,        color: 'text-zinc-400',   bg: 'bg-zinc-800' },
  { key: 'novo',       label: 'Novos',            icon: UserPlus,     color: 'text-blue-400',   bg: 'bg-blue-500/10' },
  { key: 'contatado',  label: 'Contatados',       icon: MessageCircle,color: 'text-brand-400',  bg: 'bg-brand-500/10' },
  { key: 'respondeu',  label: 'Responderam',      icon: CheckCircle,  color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { key: 'fechado',    label: 'Fechados',         icon: DollarSign,   color: 'text-emerald-400',bg: 'bg-emerald-500/10' },
]

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getLeadStats(), getLeads({})]).then(([s, leads]) => {
      setStats(s)
      setRecent(leads.slice(0, 8))
    }).finally(() => setLoading(false))
  }, [])

  const convRate = stats?.total
    ? Math.round((stats.fechado / stats.total) * 100)
    : 0

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-zinc-100">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Visão geral da sua prospecção</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-5 gap-3 mb-8">
        {METRIC_CARDS.map(({ key, label, icon: Icon, color, bg }) => (
          <div key={key} className="card p-4">
            <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-3`}>
              <Icon size={16} className={color} />
            </div>
            <div className="text-2xl font-semibold text-zinc-100 font-mono">
              {loading ? '—' : (stats?.[key] ?? 0)}
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Conversion + CTA row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* Conversion rate */}
        <div className="card p-5 col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-brand-400" />
            <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
              Taxa de conversão
            </span>
          </div>
          <div className="text-4xl font-semibold text-zinc-100 font-mono">
            {convRate}%
          </div>
          <div className="mt-3 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${convRate}%` }}
            />
          </div>
          <p className="text-xs text-zinc-600 mt-2">
            {stats?.fechado || 0} fechados de {stats?.total || 0} leads
          </p>
        </div>

        {/* Quick add CTA */}
        <Link
          to="/add"
          className="card p-5 col-span-2 border-dashed hover:border-brand-500/40 hover:bg-zinc-900/80
                     transition-all group flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className="text-brand-400" />
              <span className="text-sm font-medium text-zinc-200">Adicionar novo lead</span>
            </div>
            <p className="text-xs text-zinc-500">
              Cole um link do Google Maps ou faça upload de um print
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-zinc-800 group-hover:bg-brand-500 flex items-center
                          justify-center transition-colors">
            <ArrowRight size={14} className="text-zinc-400 group-hover:text-zinc-950 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Recent leads */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800">
          <h2 className="text-sm font-medium text-zinc-200">Leads recentes</h2>
          <Link to="/leads" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
            Ver todos <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-zinc-600 text-sm">Carregando...</div>
        ) : recent.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-zinc-500 text-sm">Nenhum lead ainda.</p>
            <Link to="/add" className="text-brand-400 text-sm hover:text-brand-300 mt-1 inline-block">
              Adicionar primeiro lead →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {recent.map((lead) => (
              <div key={lead.id} className="flex items-center gap-4 px-5 py-3 hover:bg-zinc-800/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-200 truncate">{lead.nome}</span>
                    {lead.mensagem_enviada && (
                      <span className="text-xs text-brand-500">✓</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {lead.segmento && (
                      <span className="text-xs text-zinc-500">{lead.segmento}</span>
                    )}
                    {lead.cidade && (
                      <span className="text-xs text-zinc-600">· {lead.cidade}</span>
                    )}
                  </div>
                </div>
                <StatusBadge status={lead.status} />
                <span className="text-xs text-zinc-600 shrink-0">
                  {formatDistanceToNow(new Date(lead.created_at), { locale: ptBR, addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
