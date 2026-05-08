import React from 'react';
import { Lightbulb, AlertTriangle, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface InsightCardProps {
  text: string;
  type?: 'success' | 'warning' | 'info' | 'danger';
}

export const InsightCard = ({ text, type = 'info' }: InsightCardProps) => {
  const Icon = type === 'success' ? TrendingUp : type === 'warning' ? AlertTriangle : type === 'danger' ? AlertCircle : Lightbulb;
  
  return (
    <div className="glass-card p-4 flex gap-3 items-start group hover:bg-zinc-50/50">
      <div className={cn(
        "mt-0.5",
        type === 'info' ? "text-zinc-400" :
        type === 'success' ? "text-emerald-500" :
        type === 'warning' ? "text-amber-500" :
        "text-rose-500"
      )}>
        <Icon size={16} strokeWidth={2.5} />
      </div>
      <p className="text-[13px] text-zinc-600 leading-relaxed font-medium tracking-tight">
        {text}
      </p>
    </div>
  );
};
