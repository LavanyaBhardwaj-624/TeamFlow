import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  label: string;
  value: number | string;
  subtext?: string;
  icon: LucideIcon;
  trend?: string;
  colorVariant?: 'default' | 'brand' | 'warning' | 'info';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  trend,
  colorVariant = 'default',
}) => {
  const iconBgMap = {
    default: 'bg-surface-secondary text-ink',
    brand: 'bg-brand/10 text-brand',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  };

  return (
    <div className="rounded-xl border border-line bg-surface p-4 sm:p-5 shadow-subtle transition-all hover:border-brand/40">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
          {label}
        </span>
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', iconBgMap[colorVariant])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-heading">
          {value}
        </span>
        {trend && (
          <span className="text-xs font-semibold text-brand">
            {trend}
          </span>
        )}
      </div>
      {subtext && <p className="mt-1 text-xs text-ink-muted">{subtext}</p>}
    </div>
  );
};

