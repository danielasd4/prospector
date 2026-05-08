import React from 'react';
import { 
  Target, 
  ShieldCheck, 
  Zap,
  Briefcase
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { InsightCard } from './InsightCard';
import { generateGoalsInsights } from '../lib/generateInsights';
import { SectionTitle } from './ui/SectionTitle';

export const GoalsView = ({ metrics, companies, collaborators, userProfile, updateUserProfile }: { metrics: any, companies: any[], collaborators: any[], userProfile: any, updateUserProfile: (data: any) => Promise<void> }) => {
  const params = {
    totalCash: userProfile?.total_cash || 0,
    totalFixedCosts: userProfile?.total_fixed_costs || 0,
    minHourlyRate: userProfile?.min_hourly_rate || 0
  };

  const custoColaboradores = (collaborators || []).reduce((acc, col) => acc + (Number(col.monthly_cost) || 0), 0);
  const custoFixoTotalReal = params.totalFixedCosts + custoColaboradores;

  const faturamentoTotal = metrics?.revenue || 0;
  
  // Calcular Meta Global (Soma das metas de todas as empresas)
  const metaGlobal = companies.reduce((acc, c) => acc + (Number(c.revenue_goal) || 0), 0) || 15000;
  const percentualAtingido = Math.min(Math.round((faturamentoTotal / metaGlobal) * 100), 100);
  const faltam = Math.max(metaGlobal - faturamentoTotal, 0);

  // Faturamento por Empresa no Mês Atual
  const getFaturamentoEmpresa = (companyId: string) => {
    return (metrics?.rawTransactions || [])
      .filter((tx: any) => tx.company_id === companyId && tx.type === 'income')
      .reduce((acc: number, tx: any) => acc + Number(tx.amount), 0);
  };

  const receitaPrevisivel = (metrics?.rawTransactions || [])
    .filter((tx: any) => tx.type === 'income' && tx.recurrence_type === 'recurring')
    .reduce((acc: number, tx: any) => acc + Number(tx.amount), 0);

  const sobraMensal = receitaPrevisivel - custoFixoTotalReal;
  const runwayMeses = custoFixoTotalReal > 0 ? (params.totalCash / custoFixoTotalReal).toFixed(1) : "∞";

  const insights = generateGoalsInsights(metrics?.rawTransactions || [], metaGlobal);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <header className="mb-6">
        <SectionTitle 
          title="Metas & Simulações" 
          subtitle="Projeções baseadas nas suas metas de faturamento por empresa."
          icon={Target}
          className="mb-0"
        />
      </header>

      {/* Meta Global do Mês */}
      <section>
        <div className="glass-card p-8 bg-zinc-900 border-zinc-800 text-white relative overflow-hidden shadow-xl">
          <div className="absolute right-0 top-0 w-1/3 h-full bg-linear-to-l from-white/5 to-transparent pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
            <div>
              <h2 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Meta Consolidada (Todas Empresas)</h2>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl md:text-5xl font-display font-semibold tracking-tighter">{formatCurrency(faturamentoTotal)}</span>
                <span className="text-lg text-zinc-500 font-medium tracking-tight">/ {formatCurrency(metaGlobal)}</span>
              </div>
              <p className="text-[13px] text-zinc-400">Faltam <strong className="text-white font-semibold">{formatCurrency(faltam)}</strong> para bater a meta do mês.</p>
            </div>
            
            <div className="flex-1 max-w-md w-full">
              <div className="flex justify-between items-end mb-2">
                <span className="text-2xl font-display font-semibold">{percentualAtingido}%</span>
                <span className="text-[12px] font-medium text-zinc-400">Progresso Real</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden relative">
                <div className="h-full bg-white rounded-full relative transition-all duration-500" style={{ width: `${percentualAtingido}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEGURANÇA FINANCEIRA */}
      <section>
        <h2 className="text-[14px] font-semibold text-zinc-900 flex items-center gap-2 mb-4">
          <ShieldCheck className="text-zinc-400" size={16} /> 
          Segurança & Sobrevivência
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="glass-card p-5">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider mb-1 block">Custo Total (Fixo + Equipe)</span>
            <span className="text-[17px] font-semibold text-zinc-900 tracking-tight">{formatCurrency(custoFixoTotalReal)}</span>
          </div>
          <div className="glass-card p-5">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider mb-1 block">Receita Previsível</span>
            <span className="text-[17px] font-semibold text-emerald-600 tracking-tight">{formatCurrency(receitaPrevisivel)}</span>
          </div>
          <div className="glass-card p-5 border-emerald-200 bg-emerald-50/50">
            <span className="text-[10px] text-emerald-700 uppercase font-semibold tracking-wider mb-1 block">Sobra Previsível</span>
            <span className={cn("text-[17px] font-semibold tracking-tight", sobraMensal >= 0 ? "text-emerald-700" : "text-rose-700")}>
              {sobraMensal >= 0 ? '+' : ''} {formatCurrency(sobraMensal)}
            </span>
          </div>
          <div className="glass-card p-5">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider mb-1 block">Caixa Total Disponível</span>
            <span className="text-[17px] font-semibold text-zinc-900 tracking-tight">{formatCurrency(params.totalCash)}</span>
          </div>
        </div>
        
        <div className={cn(
          "border rounded-xl p-4 flex items-start sm:items-center gap-4 transition-colors",
          Number(runwayMeses) > 6 ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100"
        )}>
          <div className={cn(
            "p-2.5 rounded-lg shrink-0 border",
            Number(runwayMeses) > 6 ? "bg-emerald-100/50 text-emerald-600 border-emerald-200/50" : "bg-amber-100/50 text-amber-600 border-amber-200/50"
          )}>
            <ShieldCheck size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h4 className={cn("text-[14px] font-semibold mb-0.5 leading-tight", Number(runwayMeses) > 6 ? "text-emerald-800" : "text-amber-800")}>
              Runway Operacional: {runwayMeses} meses
            </h4>
            <p className={cn("text-[13px] font-medium", Number(runwayMeses) > 6 ? "text-emerald-600/90" : "text-amber-600/90")}>
              {Number(runwayMeses) > 6 
                ? "Sua estrutura de caixa é sólida. Você pode focar em investimentos de longo prazo." 
                : "Atenção: Seu caixa cobre menos de 6 meses de custos fixos. Foco em liquidez."}
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        {/* METAS POR EMPRESA */}
        <section className="space-y-4">
          <h2 className="text-[14px] font-semibold text-zinc-900 flex items-center gap-2 mb-4">
            <Briefcase className="text-zinc-400" size={16} /> 
            Metas Individuais por Operação
          </h2>
          
          <div className="space-y-3">
            {companies.filter(c => c.status === 'Ativa' || c.revenue_goal > 0).map((c, idx) => {
              const fat = getFaturamentoEmpresa(c.id);
              const meta = c.revenue_goal || 1;
              const perc = Math.min(Math.round((fat / meta) * 100), 100);
              const colors = ['bg-blue-600', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500'];
              const color = colors[idx % colors.length];

              return (
                <div key={c.id} className="glass-card p-5 relative overflow-hidden group">
                  <div className={cn("absolute top-0 left-0 w-1 h-full", color)} />
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-[14px] text-zinc-900">{c.name}</span>
                    <span className="text-[12px] font-medium text-zinc-500">
                      {formatCurrency(fat)} <span className="text-zinc-300 mx-1">/</span> {formatCurrency(c.revenue_goal || 0)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-100 rounded-full mb-3">
                    <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${perc}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-zinc-500 font-medium uppercase tracking-wider">
                    <span>V/H Alvo: <strong>R$ {c.target_hourly_rate || 0}</strong></span>
                    <span>Capacidade: <strong>{c.max_monthly_hours || 0}h</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="space-y-8">
          {/* FOCO RECOMENDADO */}
          <section className="space-y-4">
            <h2 className="text-[14px] font-semibold text-zinc-900 flex items-center gap-2 mb-4">
              <Target className="text-zinc-400" size={16} /> 
              Foco Recomendado
            </h2>
            <div className="space-y-3">
              {insights.map(insight => (
                <InsightCard key={insight.id} text={insight.text} type={insight.type} />
              ))}
            </div>
          </section>

          {/* SIMULAÇÕES */}
          <section className="space-y-4">
            <h2 className="text-[14px] font-semibold text-zinc-900 flex items-center gap-2 mb-4">
              <Zap className="text-amber-500" size={16} /> 
              Simulações Estratégicas
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="glass-card p-4 hover:border-zinc-300 transition-colors cursor-pointer bg-white">
                <h4 className="text-[13px] font-semibold text-zinc-900 mb-3 leading-tight">Otimização de Portfólio</h4>
                <div className="space-y-1.5 text-[12px] text-zinc-600 font-medium">
                  <p className="flex justify-between"><span>V/H Médio:</span> <span className="text-zinc-900 font-semibold">{metrics?.metrics?.valorHoraMedio || 'R$ 0'}</span></p>
                  <p className="flex justify-between"><span>Meta V/H:</span> <span className="text-blue-600 font-semibold">R$ {params.minHourlyRate}</span></p>
                  <p className="text-zinc-500 mt-2 block pt-2 border-t border-zinc-100 text-[11px] leading-tight">
                    {Number(metrics?.metrics?.valorHoraMedio?.replace(/\D/g, ''))/100 < params.minHourlyRate 
                      ? "Aumente o ticket médio para liberar tempo." 
                      : "Sua eficiência está acima da meta base."}
                  </p>
                </div>
              </div>

              <div className="glass-card p-4 border-blue-100 bg-blue-50/20">
                <h4 className="text-[13px] font-semibold text-blue-800 mb-3 leading-tight">Ajuste de Custo Fixo</h4>
                <div className="space-y-1.5 text-[12px] text-blue-700 font-medium">
                  <p className="flex justify-between"><span>Comprometimento:</span> <span className="font-semibold">{faturamentoTotal > 0 ? Math.round((params.totalFixedCosts / faturamentoTotal) * 100) : 0}%</span></p>
                  <p className="text-blue-600/80 mt-2 block pt-2 border-t border-blue-100/50 text-[11px] leading-tight">Meta: Manter custos abaixo de 30% da receita bruta.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
