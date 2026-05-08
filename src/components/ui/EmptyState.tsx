import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  className 
}: EmptyStateProps) => {
  return (
    <div className={cn(
      "glass-card flex flex-col items-center justify-center text-center p-12 animate-in fade-in zoom-in-95 duration-500",
      className
    )}>
      <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 border border-white/5 shadow-inner">
        <Icon size={32} className="text-slate-500" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm max-w-xs mb-8">{description}</p>
      
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
};
