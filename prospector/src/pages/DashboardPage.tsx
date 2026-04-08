import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useDashboardStats, useFollowupLeads, useNextLead } from '../hooks/useDashboard'
import { StatusBadge } from '../components/StatusBadge'
import { ScoreBadge } from '../components/ScoreBadge'
import { LoadingState } from '../components/LoadingState'
import {
  Users,
  MessageCircle,
  CheckCircle,
  TrendingUp,
  ChevronRight,
  ArrowRight,
} from 'lucide-react'
import { useWhatsAppAction } from '../hooks/useLeads'

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number | string
  icon: any
  color: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data: stats, isLoading: loadingStats } = useDashboardStats()
  const { data: followups = [], isLoading: loadingFollowups } = useFollowupLeads()
  const { data: nextLead } = useNextLead()
  const whatsappMutation = useWhatsAppAction()

  const taxaResposta =
    stats?.contatado > 0
      ? Math.round((stats.respondeu / (stats.contatado + stats.respondeu)) * 100)
      : 0

  return (
    <div className="space-y-6">
      {/* Próximo lead CTA */}
      <div className="bg-gradient-to-r from-brand-500 to-brand-400 rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <p className="text-sm text-white/80 mb-1">Foco agora</p>
          {nextLead ? (
            <>
              <h2 className="text-lg font-bold">{nextLead.nome || 'Lead sem nome'}</h2>
              <p className="text-sm text-white/80">
                {nextLead.segmento} · Score {nextLead.score}/10
              </p>
            </>
          ) : (
            <h2 className="text-lg font-bold">Nenhum lead novo</h2>
          )}
        </div>
        {nextLead ? (
          <button
            onClick={() => navigate(`/leads/${nextLead.id}`)}
            className="flex items-center gap-2 bg-white text-brand-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors"
          >
            Próximo lead <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => navigate('/leads')}
            className="flex items-center gap-2 bg-white text-brand-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors"
          >
            Adicionar lead <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Stats */}
      {loadingStats ? (
        <LoadingState />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            label="Total de leads"
            value={stats?.total || 0}
            icon={Users}
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            label="Novos"
            value={stats?.novo || 0}
            icon={TrendingUp}
            color="bg-brand-50 text-brand-600"
          />
          <StatCard
            label="Contatados hoje"
            value={stats?.contatados_hoje || 0}
            icon={MessageCircle}
            color="bg-yellow-50 text-yellow-600"
          />
          <StatCard
            label="Responderam"
            value={stats?.respondeu || 0}
            icon={CheckCircle}
            color="bg-green-50 text-green-600"
          />
          <StatCard
            label="Fechados"
            value={stats?.fechado || 0}
            icon={CheckCircle}
            color="bg-purple-50 text-purple-600"
          />
          <StatCard
            label="Taxa de resposta"
            value={`${taxaResposta}%`}
            icon={TrendingUp}
            color="bg-orange-50 text-orange-600"
          />
        </div>
      )}

      {/* Follow-up */}
      {followups.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-400 rounded-full" />
            Leads para follow-up ({followups.length})
          </h2>
          <div className="space-y-3">
            {followups.slice(0, 5).map((lead: any) => (
              <div key={lead.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {lead.nome || 'Lead sem nome'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StatusBadge status={lead.status} />
                    <ScoreBadge score={lead.score} nivel={lead.score_nivel} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {lead.telefone && (
                    <button
                      onClick={() => whatsappMutation.mutate(lead)}
                      className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500"
                  >
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
