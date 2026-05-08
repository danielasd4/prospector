import React from 'react';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  CalendarDays,
  Target,
  Sparkles
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { InsightCard } from './InsightCard';
import { Transaction, Company } from '../hooks/useDashboardData';

interface TimelineViewProps {
  transactions: Transaction[];
  companies: Company[];
}

export const TimelineView = ({ transactions, companies }: TimelineViewProps) => {
  const [filter, setFilter] = React.useState<'all' | 'business' | 'personal'>('business');

  const businessIds = companies.filter(c => c.company_type !== 'Financeiro Pessoal').map(c => c.id);
  
  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'business') return businessIds.includes(tx.company_id);
    return !businessIds.includes(tx.company_id);
  });

  const formatDateLabel = (isoString: string) => {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(d);
  };

  const currentMonth = new Date().getMonth();
  const currentMonthTxs = filteredTransactions.filter(tx => new Date(tx.transaction_date).getMonth() === currentMonth);
  const entradasMes = currentMonthTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const saidasMes = currentMonthTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
  const lucro = entradasMes - saidasMes;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight text-zinc-900 mb-1">Timeline Operacional</h1>
          <p className="text-[13px] text-zinc-500 font-medium">A evolução detalhada das suas movimentações financeiras.</p>
        </div>

        <div className="flex bg-zinc-100 p-1 rounded-lg border border-zinc-200">
          <button 
            onClick={() => setFilter('business')}
            className={cn(
              "px-3 py-1.5 text-[11px] font-bold rounded-md transition-all uppercase tracking-wider",
              filter === 'business' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            Empresas
          </button>
          <button 
            onClick={() => setFilter('personal')}
            className={cn(
              "px-3 py-1.5 text-[11px] font-bold rounded-md transition-all uppercase tracking-wider",
              filter === 'personal' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            Família
          </button>
          <button 
            onClick={() => setFilter('all')}
            className={cn(
              "px-3 py-1.5 text-[11px] font-bold rounded-md transition-all uppercase tracking-wider",
              filter === 'all' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            Ver Tudo
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Timeline Feed */}
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-card p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-2 bg-zinc-50/50">
              <CalendarDays size={14} className="text-zinc-400" />
              <h3 className="text-[13px] font-semibold text-zinc-600 uppercase tracking-wider">
                {filter === 'business' ? 'Operações das Empresas' : filter === 'personal' ? 'Financeiro Familiar' : 'Histórico Consolidado'}
              </h3>
            </div>
            
            <div className="p-6">
              <div className="relative">
                <div className="absolute top-0 bottom-0 left-[19px] w-px bg-zinc-100 z-0" />
                
                <div className="space-y-4 relative z-10">
                  {filteredTransactions.length === 0 ? (
                    <p className="text-[13px] text-zinc-500 italic ml-10">Nenhuma transação encontrada para este filtro.</p>
                  ) : (
                    filteredTransactions.map((tx, idx) => (
                      <div key={tx.id || idx} className="flex gap-4 group">
                        <div className="flex flex-col items-center mt-1">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border bg-white relative z-20",
                            tx.type === 'income' ? "text-emerald-600 border-emerald-100 shadow-[0_2px_8px_rgba(16,185,129,0.08)]" :
                            "text-rose-600 border-rose-100 shadow-[0_2px_8px_rgba(244,63,94,0.08)]"
                          )}>
                            {tx.type === 'income' ? <ArrowUpRight size={16} strokeWidth={2.5} /> : <ArrowDownRight size={16} strokeWidth={2.5} />}
                          </div>
                        </div>
                        
                        <div className="flex-1 bg-white border border-zinc-100 hover:border-zinc-200 shadow-sm transition-colors rounded-lg p-4 group-hover:bg-zinc-50/50">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
                            <div>
                              <h4 className="text-zinc-900 font-semibold text-[14px] leading-tight mb-1">{tx.description || tx.category}</h4>
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "badge-success",
                                  tx.type === 'income' ? 'badge-success' : 'badge-danger'
                                )}>
                                  {tx.type === 'income' ? 'Entrada' : 'Saída'}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-zinc-300" />
                                <span className="text-[12px] text-zinc-500 font-medium">{formatDateLabel(tx.transaction_date)}</span>
                              </div>
                            </div>
                            <span className={cn(
                              "font-display font-semibold text-lg tracking-tighter",
                              tx.type === 'income' ? 'text-emerald-600' : 'text-zinc-900'
                            )}>
                              {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-zinc-100">
                            <span className="text-[12px] text-zinc-500 font-medium bg-zinc-100 px-2 py-0.5 rounded">
                              {tx.category}
                            </span>
                            {tx.recurrence_type === 'recurring' && (
                              <span className="text-[12px] text-blue-600 font-medium flex items-center gap-1 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                                <Sparkles size={10} /> Recorrente
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Month Summary & Context */}
        <div className="xl:col-span-1 space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-[13px] font-semibold text-zinc-600 uppercase tracking-wider mb-5 flex items-center gap-2">
              <Target size={14} className="text-zinc-400" />
              Fechamento do Mês
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                <span className="text-[13px] font-medium text-zinc-500">Total Entradas</span>
                <span className="font-semibold text-[14px] text-emerald-600">{formatCurrency(entradasMes)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                <span className="text-[13px] font-medium text-zinc-500">Total Saídas</span>
                <span className="font-semibold text-[14px] text-rose-600">{formatCurrency(saidasMes)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold text-[13px] text-zinc-900">Lucro do Período</span>
                <span className="font-display font-semibold text-xl tracking-tighter text-zinc-900">{formatCurrency(lucro)}</span>
              </div>
            </div>
            
            <button className="btn-secondary w-full mt-6 text-[13px]">
              Ver relatório detalhado
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="text-[13px] font-semibold text-zinc-600 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Sparkles size={14} className="text-zinc-400" />
              Log de Insights
            </h3>
            <InsightCard text="A dependência de receita variável caiu 2% este mês." type="info" />
            <InsightCard text="Meta de margem de segurança atingida mais cedo que o esperado." type="success" />
          </div>
        </div>

      </div>
    </div>
  );
};
