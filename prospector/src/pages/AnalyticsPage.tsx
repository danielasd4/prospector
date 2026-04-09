import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getLeads } from '../lib/supabase'
import { useDashboardStats } from '../hooks/useDashboard'
import { LoadingState } from '../components/LoadingState'
import { TrendingUp, Users, MessageCircle, CheckCircle, Target, BarChart2 } from 'lucide-react'

function FunnelStep({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="flex items-center gap-4">
      <div className="w-28 text-right text-xs text-zinc-500 shrink-0">{label}</div>
      <div className="flex-1 h-8 bg-zinc-800 rounded-lg overflow-hidden">
        <div
          className={`h-full rounded-lg flex items-center px-3 text-xs font-bold text-white transition-all duration-700 ${color}`}
          style={{ width: `${Math.max(pct, 4)}%` }}
        >
          {value}
        </div>
      </div>
      <div className="w-10 text-xs text-zinc-500 shrink-0">{pct}%</div>
    </div>
  )
}

function MetricCard({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub?: string; icon: any; color: string }) {
  return (
    <div className="card p-5">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-2xl font-bold text-zinc-100">{value}</div>
      <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-zinc-600 mt-1">{sub}</div>}
    </div>
  )
}

export default function AnalyticsPage() {
  const { data: stats, isLoading } = useDashboardStats()
  const { data: leads = [] } = useQuery({
    queryKey: ['leads-analytics'],
    queryFn: () => getLeads({}),
  })

  if (isLoading) return <LoadingState />

  const total = stats?.total || 0
  const contatado = stats?.contatado || 0
  const respondeu = stats?.respondeu || 0
  const fechado = stats?.fechado || 0
  const semResposta = stats?.sem_resposta || 0
  const naoInteressado = stats?.nao_interessado || 0

  const taxaResposta = (contatado + respondeu) > 0
    ? Math.round((respondeu / (contatado + respondeu)) * 100)
    : 0

  const taxaFechamento = respondeu > 0
    ? Math.round((fechado / respondeu) * 100)
    : 0

  const scoreLeads = (leads as any[]).filter(l => l.score != null)
  const scoreMedia = scoreLeads.length > 0
    ? (scoreLeads.reduce((sum: number, l: any) => sum + l.score, 0) / scoreLeads.length).toFixed(1)
    : '—'

  // Weekly trend: leads created in last 7 days grouped by day
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d
  })

  const weekData = weekDays.map(day => {
    const count = (leads as any[]).filter(l => {
      const created = new Date(l.created_at)
      return created.toDateString() === day.toDateString()
    }).length
    return { label: day.toLocaleDateString('pt-BR', { weekday: 'short' }), count }
  })

  const maxWeek = Math.max(...weekData.map(d => d.count), 1)

  // Segment breakdown
  const segments: Record<string, number> = {}
  ;(leads as any[]).forEach(l => {
    if (l.segmento) segments[l.segmento] = (segments[l.segmento] || 0) + 1
  })
  const topSegments = Object.entries(segments)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">Analytics</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Visão geral da sua prospecção</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="Total de leads"
          value={total}
          icon={Users}
          color="bg-brand-500/10 text-brand-400"
        />
        <MetricCard
          label="Taxa de resposta"
          value={`${taxaResposta}%`}
          sub={`${respondeu} de ${contatado + respondeu} contatados`}
          icon={MessageCircle}
          color="bg-green-500/10 text-green-400"
        />
        <MetricCard
          label="Taxa de fechamento"
          value={`${taxaFechamento}%`}
          sub={`${fechado} fechados`}
          icon={CheckCircle}
          color="bg-purple-500/10 text-purple-400"
        />
        <MetricCard
          label="Score médio"
          value={scoreMedia}
          sub="de 10 pontos"
          icon={Target}
          color="bg-orange-500/10 text-orange-400"
        />
      </div>

      {/* Conversion funnel */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-zinc-300 mb-5 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-400" />
          Funil de conversão
        </h2>
        <div className="space-y-3">
          <FunnelStep label="Total" value={total} total={total} color="bg-brand-500" />
          <FunnelStep label="Contatados" value={contatado + respondeu} total={total} color="bg-blue-500" />
          <FunnelStep label="Responderam" value={respondeu} total={total} color="bg-green-500" />
          <FunnelStep label="Fechados" value={fechado} total={total} color="bg-purple-500" />
        </div>
        <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-zinc-500">Sem resposta</div>
            <div className="text-lg font-bold text-zinc-300 mt-0.5">{semResposta}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500">Não interessado</div>
            <div className="text-lg font-bold text-zinc-300 mt-0.5">{naoInteressado}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500">Novos</div>
            <div className="text-lg font-bold text-zinc-300 mt-0.5">{stats?.novo || 0}</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Weekly trend */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-5 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-brand-400" />
            Leads esta semana
          </h2>
          <div className="flex items-end gap-2 h-28">
            {weekData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs text-zinc-500">{d.count > 0 ? d.count : ''}</div>
                <div
                  className="w-full rounded-t-md bg-brand-500/60 hover:bg-brand-500 transition-colors"
                  style={{ height: `${Math.max((d.count / maxWeek) * 88, d.count > 0 ? 8 : 2)}px` }}
                />
                <div className="text-xs text-zinc-600 capitalize">{d.label.replace('.', '')}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top segments */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-5 flex items-center gap-2">
            <Target className="w-4 h-4 text-brand-400" />
            Top segmentos
          </h2>
          {topSegments.length === 0 ? (
            <p className="text-sm text-zinc-600">Nenhum segmento cadastrado ainda.</p>
          ) : (
            <div className="space-y-3">
              {topSegments.map(([seg, count]) => (
                <div key={seg} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-zinc-300 truncate">{seg}</div>
                    <div className="mt-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${Math.round((count / total) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-zinc-400 shrink-0">{count}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
