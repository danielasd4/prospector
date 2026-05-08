import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useDashboardStats, useFollowupLeads, useNextLead } from '../hooks/useDashboard'
import { StatusBadge } from '../components/StatusBadge'
import { ScoreBadge } from '../components/ScoreBadge'
import { LoadingState } from '../components/LoadingState'
import { Users, MessageCircle, CheckCircle, TrendingUp, ChevronRight, ArrowRight, Zap } from 'lucide-react'
import { useWhatsAppDBUpdate, getWhatsAppUrl } from '../hooks/useLeads'

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: any; color: string }) {
  return (
    <div className="card p-5">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-2xl font-bold text-zinc-100">{value}</div>
      <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data: stats, isLoading: loadingStats } = useDashboardStats()
  const { data: followups = [] } = useFollowupLeads()
  const { data: nextLead } = useNextLead()
  const whatsappDB = useWhatsAppDBUpdate()

  const taxaResposta = stats?.contatado > 0
    ? Math.round((stats.respondeu / (stats.contatado + stats.respondeu)) * 100)
    : 0

  return (
    <div className="space-y-5">
      {/* Next lead CTA */}
      <div className="relative overflow-hidden bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 to-transparent pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3.5 h-3.5 text-brand-400" />
            <p className="text-xs text-brand-400 font-semibold uppercase tracking-wider">Foco agora</p>
          </div>
          {nextLead ? (
            <>
              <h2 className="text-lg font-bold text-zinc-100">{nextLead.nome || 'Lead sem nome'}</h2>
              <p className="text-sm text-zinc-500 mt-0.5">{nextLead.segmento} · Score {nextLead.score}/10</p>
            </>
          ) : (
            <h2 className="text-lg font-bold text-zinc-100">Nenhum lead novo</h2>
          )}
        </div>
        <button
          onClick={() => navigate(nextLead ? `/leads/${nextLead.id}` : '/leads')}
          className="relative flex items-center gap-2 bg-brand-500 hover:bg-brand-400 active:scale-95 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-brand-500/25"
        >
          {nextLead ? 'Próximo lead' : 'Adicionar lead'} <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Stats */}
      {loadingStats ? <LoadingState /> : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Total" value={stats?.total || 0} icon={Users} color="bg-brand-500/10 text-brand-400" />
          <StatCard label="Novos" value={stats?.novo || 0} icon={TrendingUp} color="bg-blue-500/10 text-blue-400" />
          <StatCard label="Hoje" value={stats?.contatados_hoje || 0} icon={MessageCircle} color="bg-yellow-500/10 text-yellow-400" />
          <StatCard label="Responderam" value={stats?.respondeu || 0} icon={CheckCircle} color="bg-green-500/10 text-green-400" />
          <StatCard label="Fechados" value={stats?.fechado || 0} icon={CheckCircle} color="bg-purple-500/10 text-purple-400" />
          <StatCard label="Taxa resposta" value={`${taxaResposta}%`} icon={TrendingUp} color="bg-orange-500/10 text-orange-400" />
        </div>
      )}

      {/* Follow-up */}
      {followups.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
            Follow-up pendente ({followups.length})
          </h2>
          <div className="space-y-3">
            {followups.slice(0, 5).map((lead: any) => (
              <div key={lead.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">{lead.nome || 'Lead sem nome'}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StatusBadge status={lead.status} />
                    <ScoreBadge score={lead.score} nivel={lead.score_nivel} />
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {lead.telefone && (
                    <button onClick={() => { window.open(getWhatsAppUrl(lead), '_blank'); whatsappDB.mutate(lead) }}
                      className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-white transition-all" title="WhatsApp">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => navigate(`/leads/${lead.id}`)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
