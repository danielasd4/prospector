import React from 'react';
import { cn, formatCurrency } from '../lib/utils';
import { Clock, Zap, Target, AlertCircle, Info } from 'lucide-react';

interface CompanyCardProps {
  name: string;
  type: string;
  revenue: number;
  profit: number;
  hours: number;
  hourValue: number;
  predictability: string;
  status: 'Ativa' | 'Parada' | 'Em construção' | 'Estruturação';
  dependence: 'Alta' | 'Média' | 'Muito alta' | 'Pessoal';
  behavior?: string;
  observation?: string;
  recurrence?: string;
}

export const CompanyCard = ({
  name,
  type,
  revenue,
  profit,
  hours,
  hourValue,
  predictability,
  status,
  dependence,
  behavior,
  observation,
  recurrence
}: CompanyCardProps) => {
  const statusColors = {
    'Ativa': 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
    'Parada': 'bg-zinc-100 text-zinc-600 border-zinc-200/50',
    'Em construção': 'bg-amber-50 text-amber-700 border-amber-200/50',
    'Estruturação': 'bg-blue-50 text-blue-700 border-blue-200/50'
  };

  const dependenceColors = {
    'Pessoal': 'bg-blue-500',
    'Média': 'bg-amber-500',
    'Alta': 'bg-orange-500',
    'Muito alta': 'bg-rose-500'
  };

  return (
    <div className="glass-card p-5 flex flex-col justify-between h-full group hover:border-zinc-300 transition-colors">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col gap-0.5">
            <h4 className="text-[15px] font-semibold text-zinc-900 tracking-tight leading-none">
              {name}
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-zinc-500 font-medium">{type}</span>
              {recurrence && <span className="text-[10px] text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded uppercase tracking-wider">{recurrence}</span>}
            </div>
          </div>
          <span className={cn(
            "px-2 py-0.5 rounded text-[10px] font-semibold border tracking-wide uppercase",
            statusColors[status]
          )}>
            {status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-0.5">Faturamento</span>
            <span className="text-[14px] font-semibold text-zinc-900 tracking-tight">{formatCurrency(revenue)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-0.5">Lucro Est.</span>
            <span className="text-[14px] font-semibold text-emerald-600 tracking-tight">{formatCurrency(profit)}</span>
          </div>
        </div>
      </div>

      <div>
        <div className="pt-3 border-t border-zinc-100 grid grid-cols-2 gap-y-2 mb-3">
          <div className="flex items-center gap-1.5 text-[12px] text-zinc-600 font-medium">
            <Clock size={12} className="text-zinc-400" />
            <span>{hours}h / mês</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-zinc-600 font-medium">
            <Zap size={12} className="text-zinc-400" />
            <span>{formatCurrency(hourValue)}/h</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-zinc-600 font-medium col-span-2">
            <Target size={12} className="text-zinc-400" />
            <span>Previsibilidade: <b className="text-zinc-900">{predictability}</b></span>
          </div>
          
          <div className="flex items-center gap-1.5 text-[12px] text-zinc-600 font-medium col-span-2">
            <AlertCircle size={12} className="text-zinc-400" />
            <div className="flex items-center gap-2 flex-1">
              <span>Risco dono:</span>
              <div className="flex items-center gap-1.5 bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-100">
                <div className={cn("w-1.5 h-1.5 rounded-full", dependenceColors[dependence])}></div>
                <b className="text-zinc-900 text-[11px] uppercase tracking-wide">{dependence}</b>
              </div>
            </div>
          </div>
        </div>

        {(behavior || observation) && (
          <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100 flex gap-2.5 items-start">
            <Info size={14} className="text-zinc-400 mt-0.5 shrink-0" />
            <div className="flex flex-col gap-0.5">
              {behavior && <span className="text-[12px] text-zinc-700 font-medium leading-tight">{behavior}</span>}
              {observation && <span className="text-[11px] text-zinc-500 leading-tight">{observation}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
