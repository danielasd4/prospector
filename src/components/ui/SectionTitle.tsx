import React from 'react';
import { cn } from '../../lib/utils';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  className?: string;
}

export const SectionTitle = ({ title, subtitle, icon: Icon, className }: SectionTitleProps) => {
  return (
    <div className={cn("mb-8", className)}>
      <div className="flex items-center gap-3 mb-1">
        {Icon && <Icon className="text-primary" size={24} />}
        <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">{title}</h2>
      </div>
      {subtitle && <p className="text-slate-500 text-sm">{subtitle}</p>}
    </div>
  );
};
